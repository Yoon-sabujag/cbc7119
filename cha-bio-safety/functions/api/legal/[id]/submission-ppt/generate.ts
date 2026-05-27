import type { Env } from '../../../../_middleware'
import { isRoundSubmitted, lockedResponse } from '../../_lock'
import { unzipSync, zipSync, strFromU8, strToU8 } from 'fflate'

// POST /api/legal/:id/submission-ppt/generate
// 서버측 PPT 생성 — 양식 R2 에서 다운로드 → 표지 텍스트 패치 → R2 저장 → ppt_file_key 갱신
// W7: 표지만 동적, 본문 슬라이드는 양식 그대로 (페이지 복제 + 라벨 패치 + 사진 임베딩은 W8)

const TEMPLATE_KEY = 'submission-ppt-template/template.pptx'

export const onRequestPost: PagesFunction<Env> = async ({ env, params }) => {
  const scheduleItemId = params.id as string

  if (await isRoundSubmitted(env, scheduleItemId)) {
    return lockedResponse()
  }

  try {
    // 1. round + findings 조회
    const round = await env.DB.prepare(
      `SELECT id, title, date FROM schedule_items WHERE id = ?`
    ).bind(scheduleItemId).first<{ id: string; title: string; date: string }>()

    if (!round) {
      return Response.json({ success: false, error: '점검 회차를 찾을 수 없습니다' }, { status: 404 })
    }

    const findingsRes = await env.DB.prepare(`
      SELECT id, location, description, submission_label, photo_keys, resolution_photo_keys
      FROM legal_findings
      WHERE schedule_item_id = ? AND submission_selected = 1
      ORDER BY created_at
    `).bind(scheduleItemId).all<{
      id: string; location: string | null; description: string;
      submission_label: string | null;
      photo_keys: string; resolution_photo_keys: string
    }>()

    const eligible = (findingsRes.results ?? []).filter(f => {
      const before = JSON.parse(f.photo_keys || '[]')
      const after = JSON.parse(f.resolution_photo_keys || '[]')
      return before.length > 0 && after.length > 0
    })

    if (eligible.length === 0) {
      return Response.json({ success: false, error: 'PPT에 포함할 지적사항이 없습니다 (체크 + 사진 둘 다 필요)' }, { status: 400 })
    }

    // 2. R2 에서 양식 다운로드
    const tmplObj = await env.STORAGE.get(TEMPLATE_KEY)
    if (!tmplObj) {
      return Response.json({ success: false, error: `양식 파일 없음 (${TEMPLATE_KEY})` }, { status: 500 })
    }
    const tmplBuf = await tmplObj.arrayBuffer()

    // 3. fflate 로 양식 풀기
    const files = unzipSync(new Uint8Array(tmplBuf))

    // 4. 표지 (slide1) 텍스트 패치
    // 원본 텍스트: "2025" + "년 작동기능점검"
    // 변경 후: "{연도}" + "년 소방 {종합정밀점검|작동기능점검}" — 상반기/하반기 prefix 제외
    const year = round.date.slice(0, 4)
    const kind = round.title.includes('종합') ? '종합정밀점검' : '작동기능점검'
    {
      let s = strFromU8(files['ppt/slides/slide1.xml'])
      s = s.replace(/<a:t>2025<\/a:t>/, `<a:t>${escapeXml(year)}</a:t>`)
      s = s.replace(/<a:t>년 작동기능점검<\/a:t>/, `<a:t>년 ${escapeXml(kind)}</a:t>`)
      files['ppt/slides/slide1.xml'] = strToU8(s)
    }

    // 5. 본문 슬라이드 (slide2) — W7 에선 양식 그대로 (W8 에서 라벨/사진/페이지 복제)
    // 사용자 데이터는 W8 까지 안 들어감

    // 6. ZIP 출력
    const outBuf = zipSync(files, { level: 6 })

    // 7. R2 저장 (timestamp 기반 key — 동시성 충돌 회피)
    const key = `legal/${scheduleItemId}/submission-ppt/${Date.now()}.pptx`
    await env.STORAGE.put(key, outBuf, {
      httpMetadata: { contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
    })

    // 8. DB ppt_file_key 갱신
    await env.DB.prepare(
      `UPDATE schedule_items SET ppt_file_key = ? WHERE id = ?`
    ).bind(key, scheduleItemId).run()

    return Response.json({
      success: true,
      data: {
        pptFileKey: key,
        eligibleCount: eligible.length,
        note: 'W7: 표지만 동적. 본문 라벨/사진/페이지 복제는 W8 예정',
      },
    })
  } catch (e: any) {
    console.error('[submission-ppt/generate POST]', e)
    return Response.json({ success: false, error: e?.message ?? 'PPT 생성 실패' }, { status: 500 })
  }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
