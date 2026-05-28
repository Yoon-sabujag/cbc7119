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
      ORDER BY CASE WHEN submission_order > 0 THEN submission_order ELSE 999999 END, created_at
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

    // 5. 본문 슬라이드 (slide2) — 라벨 패치 + 페이지 복제 (사진 임베딩은 다음 step)
    // labelFor: submission_label 우선 / 없으면 location + description prefill
    const labelFor = (f: { location: string | null; description: string; submission_label: string | null }) =>
      (f.submission_label ?? `${f.location ?? ''} ${f.description}`).trim()

    // 페이지 분할 (2건씩)
    const pages: Array<{ left: typeof eligible[number]; right: typeof eligible[number] | null }> = []
    for (let i = 0; i < eligible.length; i += 2) {
      pages.push({ left: eligible[i], right: eligible[i + 1] ?? null })
    }

    // 단일 슬라이드 라벨 패치 함수 — 4 라벨 셀 (Row 0 좌/우 = 조치 전, Row 2 좌/우 = 조치 후)
    const patchSlideLabels = (xml: string, page: typeof pages[number]): string => {
      const leftBefore = page.left ? `${labelFor(page.left)} 조치 전` : ''
      const rightBefore = page.right ? `${labelFor(page.right)} 조치 전` : ''
      const leftAfter = page.left ? `${labelFor(page.left)} 조치 후` : ''
      const rightAfter = page.right ? `${labelFor(page.right)} 조치 후` : ''
      const labelMap: Record<number, string> = { 0: leftBefore, 1: rightBefore, 4: leftAfter, 5: rightAfter }
      const newP = (text: string) =>
        `<a:p><a:pPr algn="ctr" latinLnBrk="1"/><a:r><a:rPr lang="ko-KR" altLang="en-US" sz="1000" b="1" dirty="0"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="맑은 고딕" pitchFamily="50" charset="-127"/><a:ea typeface="맑은 고딕" pitchFamily="50" charset="-127"/></a:rPr><a:t>${escapeXml(text)}</a:t></a:r></a:p>`
      let cellIdx = 0
      return xml.replace(/<a:tc[^>]*>[\s\S]*?<\/a:tc>/g, (match) => {
        const idx = cellIdx++
        if (idx in labelMap) {
          return match.replace(/<a:p>[\s\S]*?<\/a:p>/, newP(labelMap[idx]))
        }
        return match
      })
    }

    // 사진 셀 좌표 (양식 slide2 tblGrid + a:tr 분석 결과 — EMU 단위)
    // 4 picture shape 모두 셀에 정확히 일치하도록 xfrm 재작성 (rot 제거, portrait ext 보정)
    // + <a:srcRect/><a:stretch/> → <a:srcRect/><a:stretch><a:fillRect/></a:stretch>
    //   비-네모 사진도 셀 네 귀퉁이에 강제로 맞춤 (aspect ratio 무시)
    const CELLS: Record<string, { x: number; y: number; cx: number; cy: number }> = {
      rId3: { x: 179512, y:  656640, cx: 4428492, cy: 2700000 }, // 좌상단 = 좌측 조치 전
      rId4: { x: 179512, y: 3824640, cx: 4428492, cy: 2700000 }, // 좌하단 = 좌측 조치 후
      rId5: { x: 4608004, y: 656640, cx: 4428492, cy: 2700000 }, // 우상단 = 우측 조치 전
      rId6: { x: 4608004, y: 3824640, cx: 4428492, cy: 2700000 }, // 우하단 = 우측 조치 후
    }
    const patchPicGeometry = (xml: string): string => {
      return xml.replace(/<p:pic>[\s\S]*?<\/p:pic>/g, (pic) => {
        const m = pic.match(/r:embed="(rId\d+)"/)
        if (!m) return pic
        const cell = CELLS[m[1]]
        if (!cell) return pic
        let out = pic.replace(
          /<a:xfrm(?:\s+rot="[^"]+")?>\s*<a:off[^/]*\/>\s*<a:ext[^/]*\/>\s*<\/a:xfrm>/,
          `<a:xfrm><a:off x="${cell.x}" y="${cell.y}"/><a:ext cx="${cell.cx}" cy="${cell.cy}"/></a:xfrm>`,
        )
        out = out.replace(
          /<a:srcRect\/>\s*<a:stretch\s*\/>/,
          '<a:srcRect/><a:stretch><a:fillRect/></a:stretch>',
        )
        return out
      })
    }
    // 우측 사진 (rId5/rId6) shape 제거 — page.right 가 null 인 마지막 페이지용
    const removeRightPics = (xml: string): string =>
      xml.replace(/<p:pic>[\s\S]*?<\/p:pic>/g, (pic) =>
        /r:embed="rId[56]"/.test(pic) ? '' : pic,
      )

    // slide2 = 첫 페이지 (라벨 + geometry 패치)
    const slide2OrigXml = patchPicGeometry(strFromU8(files['ppt/slides/slide2.xml']))
    const slide2RelsXml = strFromU8(files['ppt/slides/_rels/slide2.xml.rels'])
    {
      let s = patchSlideLabels(slide2OrigXml, pages[0])
      if (!pages[0].right) s = removeRightPics(s)
      files['ppt/slides/slide2.xml'] = strToU8(s)
    }

    // 추가 페이지 (3건+) = slide3, slide4, ... 복제 + 각자 라벨 패치
    // slide2.xml.rels 의 notesSlide Relationship 은 slide2 전용 — 복제 슬라이드 (slide3+) 가 그대로 들고 가면
    // notesSlide1 의 rels 는 slide2 만 가리키므로 bidirectional 불일치 → PPT 손상 다이얼로그.
    // notesSlide 는 optional 이므로 복제 시 제거.
    const slide2RelsForDup = slide2RelsXml.replace(
      /<Relationship\s+Id="[^"]+"\s+Type="[^"]+\/notesSlide"\s+Target="[^"]+"\s*\/>/g,
      '',
    )
    if (pages.length > 1) {
      for (let i = 1; i < pages.length; i++) {
        const slideIdx = i + 2 // slide3, slide4...
        let s = patchSlideLabels(slide2OrigXml, pages[i])
        if (!pages[i].right) s = removeRightPics(s)
        files[`ppt/slides/slide${slideIdx}.xml`] = strToU8(s)
        // 각 슬라이드의 rels = slide2 (notesSlide 제외) — image rels 는 6번 단계에서 페이지별 교체
        files[`ppt/slides/_rels/slide${slideIdx}.xml.rels`] = strToU8(slide2RelsForDup)
      }
    }

    // ── 5b. 슬라이드 관련 메타데이터 재구성 ────────────────────────────
    // 사고 사례 (260528): 양식 template.pptx 의 presentation.xml.rels 와 [Content_Types].xml 에
    // slide3~slide8 의 잔존 entry 가 남아있어 (원래 8-slide 양식을 2-slide 로 슬림화한 흔적),
    // 우리 코드가 그 위에 추가 entry 를 더 얹어 중복 rels + 미존재 slide 파일 참조 발생 → PPT 열 때 "복구해야 함".
    // → 슬라이드 관련 entry 를 actualSlideCount 기준으로 재구성 (slide rels + sldIdLst + Content_Types Override).
    const actualSlideCount = 1 /* cover */ + pages.length
    const SLIDE_REL_TYPE = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide'
    const SLIDE_CT = 'application/vnd.openxmlformats-officedocument.presentationml.slide+xml'

    // 5b-1. presentation.xml.rels — slide 타입 entry 모두 제거 후 actualSlideCount 만큼 재추가
    {
      let presRelsXml = strFromU8(files['ppt/_rels/presentation.xml.rels'])
      // slide 타입 Relationship 제거 (slideMaster/theme/viewProps 등은 보존)
      presRelsXml = presRelsXml.replace(
        /<Relationship\s+Id="[^"]+"\s+Type="[^"]+\/slide"\s+Target="[^"]+"\s*\/>/g,
        '',
      )
      // 사용 중인 비-slide rId 의 최댓값 찾기 (충돌 회피)
      const ridMatches = [...presRelsXml.matchAll(/Id="rId(\d+)"/g)]
      let maxRid = ridMatches.reduce((m, x) => Math.max(m, Number(x[1])), 0)
      // slide1..slideN 의 rId 매핑 (slide1 = rId{maxRid+1}, ...)
      const slideRids: string[] = []
      const newRels: string[] = []
      for (let i = 0; i < actualSlideCount; i++) {
        maxRid++
        const rid = `rId${maxRid}`
        slideRids.push(rid)
        newRels.push(`<Relationship Id="${rid}" Type="${SLIDE_REL_TYPE}" Target="slides/slide${i + 1}.xml"/>`)
      }
      presRelsXml = presRelsXml.replace(/<\/Relationships>/, newRels.join('') + '</Relationships>')
      files['ppt/_rels/presentation.xml.rels'] = strToU8(presRelsXml)

      // 5b-2. presentation.xml sldIdLst 도 새 rId 기준으로 재구성
      let presXml = strFromU8(files['ppt/presentation.xml'])
      const sldIds = slideRids
        .map((rid, idx) => `<p:sldId id="${256 + idx}" r:id="${rid}"/>`)
        .join('')
      presXml = presXml.replace(/<p:sldIdLst>[\s\S]*?<\/p:sldIdLst>/, `<p:sldIdLst>${sldIds}</p:sldIdLst>`)
      files['ppt/presentation.xml'] = strToU8(presXml)
    }

    // 5b-3. [Content_Types].xml — /ppt/slides/slideN.xml Override 모두 제거 후 actualSlideCount 만큼 재추가
    // 양식 잔존: slide3~slide8 Override 가 그대로 있어 우리 코드가 더 얹으면 중복.
    {
      let ctXml = strFromU8(files['[Content_Types].xml'])
      ctXml = ctXml.replace(
        /<Override\s+PartName="\/ppt\/slides\/slide\d+\.xml"[^>]*\/>/g,
        '',
      )
      const newOverrides: string[] = []
      for (let i = 0; i < actualSlideCount; i++) {
        newOverrides.push(`<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="${SLIDE_CT}"/>`)
      }
      ctXml = ctXml.replace(/<\/Types>/, newOverrides.join('') + '</Types>')
      files['[Content_Types].xml'] = strToU8(ctXml)
    }

    // 6. 사진 임베딩 — 페이지별 4 슬롯 = finding 의 실제 R2 사진
    // 슬롯 매핑 (양식 slide2 의 picture 위치):
    //   rId3 = 좌상단 = 좌측 조치 전 (page.left.photoKeys[0])
    //   rId4 = 좌하단 = 좌측 조치 후 (page.left.resolutionPhotoKeys[0])
    //   rId5 = 우상단 = 우측 조치 전 (page.right.photoKeys[0])
    //   rId6 = 우(회전) = 우측 조치 후 (page.right.resolutionPhotoKeys[0])
    const SLOT_R_IDS = ['rId3', 'rId4', 'rId5', 'rId6'] as const
    let imageCounter = 5 // 양식 image1-4 다음부터

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      const slideIdx = i === 0 ? 2 : i + 2
      const photoKeys: Array<string | undefined> = [
        JSON.parse(page.left?.photo_keys || '[]')[0],
        JSON.parse(page.left?.resolution_photo_keys || '[]')[0],
        page.right ? JSON.parse(page.right.photo_keys || '[]')[0] : undefined,
        page.right ? JSON.parse(page.right.resolution_photo_keys || '[]')[0] : undefined,
      ]

      const slotImageNames: Record<string, string> = {}
      for (let j = 0; j < 4; j++) {
        const key = photoKeys[j]
        if (!key) continue
        const obj = await env.STORAGE.get(key)
        if (!obj) continue
        const buf = await obj.arrayBuffer()
        const imageName = `image${imageCounter}.jpeg`
        files[`ppt/media/${imageName}`] = new Uint8Array(buf)
        slotImageNames[SLOT_R_IDS[j]] = imageName
        imageCounter++
      }

      // 슬라이드 rels 의 image target 교체
      const relsPath = `ppt/slides/_rels/slide${slideIdx}.xml.rels`
      let relsXml = strFromU8(files[relsPath])
      for (const [rId, imageName] of Object.entries(slotImageNames)) {
        // <Relationship Id="rId3"...Target="../media/imageOLD.jpeg"/> → imageNew.jpeg
        // ※ [^/]* 쓰면 Type URL 안의 "://schemas..." 의 / 때문에 매칭 실패 (W8 사고). [^>]* 사용
        relsXml = relsXml.replace(
          new RegExp(`(<Relationship\\s+Id="${rId}"[^>]*Target=")[^"]+(")`),
          `$1../media/${imageName}$2`
        )
      }
      files[relsPath] = strToU8(relsXml)
    }

    // [Content_Types].xml: jpeg Default 가 이미 양식에 있으므로 (image1-4 가 jpeg) 추가 작업 불필요
    // 검증: <Default Extension="jpeg" .../> 가 [Content_Types].xml 에 있어야 함
    // (양식 PPTX 검증 완료, 추가 image 도 같은 Default 로 처리됨)

    // 7. ZIP 출력
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
