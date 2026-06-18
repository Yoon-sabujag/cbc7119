import type { Env } from '../../_middleware'

// PUT /api/floorplan-markers/:id — 마커 수정 (로그인한 전체 스태프)
export const onRequestPut: PagesFunction<Env> = async ({ params, request, env }) => {
  const id = params.id as string
  const body = await request.json<{
    x_pct?: number
    y_pct?: number
    label?: string
    marker_type?: string
    check_point_id?: string | null
    zone?: string | null
    description?: string | null
  }>()

  const sets: string[] = []
  const binds: unknown[] = []

  if (body.x_pct != null) { sets.push('x_pct=?'); binds.push(body.x_pct) }
  if (body.y_pct != null) { sets.push('y_pct=?'); binds.push(body.y_pct) }
  if (body.label !== undefined) { sets.push('label=?'); binds.push(body.label) }
  if (body.marker_type !== undefined) { sets.push('marker_type=?'); binds.push(body.marker_type) }
  if (body.check_point_id !== undefined) { sets.push('check_point_id=?'); binds.push(body.check_point_id) }
  if (body.zone !== undefined) { sets.push('zone=?'); binds.push(body.zone) }
  // description: check_points 와 대칭 — '[접근불가]' 등 메모 기반 접근불가 판정 용
  if (body.description !== undefined) { sets.push('description=?'); binds.push(body.description) }

  if (sets.length === 0) {
    return Response.json({ success: false, error: '수정할 항목이 없습니다' }, { status: 400 })
  }

  sets.push("updated_at=datetime('now','+9 hours')")
  binds.push(id)

  // ── 개소명(label) 동기 가드 (사고 260608-b6f 재발 방지) ──────────────────
  // 개소명은 D1 여러 곳에 중복 저장된다:
  //   check_points.location   (일반점검 목록·도면 마커 이름[cp_location 우선]·QR)
  //   extinguishers.location  (소화기 관리 목록 — CP-FE-% 개소에만 행 존재)
  //   floor_plan_markers.label(이 모달 "개소명" 입력칸)
  // 기존 PUT 은 label 만 갱신 → 모달에서 개소명을 바꿔도 마커 라벨만 바뀌고
  // 다른 화면은 옛 이름 그대로 → "한 개소가 화면마다 다르게" 보이던 버그.
  // 게다가 소화전/완강기는 marker.label=null 이 정상(개소명이 cp.location 에만 존재)이라
  // label 만 갱신하면 cp_location 우선 디스플레이가 바뀌지 않아 "수정해도 반영 안 됨" 처럼 보였다.
  // 이제 같은 batch 로 check_points(개소명) / extinguishers.location 까지 전파한다.
  //
  // 개소명이 저장되는 check_points 컬럼은 카테고리마다 다르다:
  //   · 소화기·소화전·완강기 → check_points.LOCATION 이 실제 개소명.
  //   · DIV/COMP            → check_points.DESCRIPTION 이 실제 개소명('지) 식당 뒤' 류).
  //     (DIV 의 location 은 'B1층 DIV #N' 구조 라벨이라 건드리지 않는다.)
  // DIV/COMP description 범위 (260618 사용자 요청):
  //   DIV 와 컴프레셔는 같은 위치를 공유한다 (CP-DIV-{id} ↔ CP-COMP-{id}). DIV description 을
  //   바꾸면 페어링 트리거(0091 sync_comp_description_on_div_update)가 CP-COMP-{id} 로,
  //   0078 트리거가 div 마커로 자동 전파한다 → "DIV 바꾸면 컴프레셔도 똑같이" 가 구조적으로 보장.
  //   압력관리/점검/일일보고서 화면은 이 description 을 D1 에서 읽어 반영(상수는 오프라인 fallback).
  // extinguishers.location 범위: CP-FE-(소화기 자산 행이 존재) 한정 유지.
  //   소화전/완강기/DIV 는 extinguishers 행이 없으므로(D1 실측 0건) 건드리지 않는다.
  // 가드: label 이 빈 문자열/undefined 면 동기하지 않는다 (기존 동작 유지).
  //       이 모달 PUT body 에는 check_point_id 가 없으므로 마커 행에서 조회해 쓴다.
  const newLabel =
    body.label !== undefined && body.label !== null && body.label.trim() !== ''
      ? body.label.trim()
      : null

  let cpId: string | null = body.check_point_id ?? null
  if (newLabel && cpId === null) {
    const m = await env.DB
      .prepare('SELECT check_point_id FROM floor_plan_markers WHERE id=?')
      .bind(id)
      .first<{ check_point_id: string | null }>()
    cpId = m?.check_point_id ?? null
  }

  // 마커 UPDATE 를 항상 batch 의 첫 statement 로 둔다 — 뒤 동기 statement 가 실패해도
  // 사용자가 본 마커 라벨은 저장되고(기존 동작과 동일) 동기만 누락된다 (악화 방지).
  const stmts = [
    env.DB.prepare(`UPDATE floor_plan_markers SET ${sets.join(', ')} WHERE id=?`).bind(...binds),
  ]

  const isDivLike = cpId != null && (cpId.startsWith('CP-DIV-') || cpId.startsWith('CP-COMP-'))

  if (newLabel && cpId && isDivLike) {
    // DIV/COMP — 실제 개소명은 description. 트리거가 COMP 짝 + div 마커로 전파(구조 라벨 location 보존).
    stmts.push(
      env.DB.prepare('UPDATE check_points SET description=? WHERE id=?').bind(newLabel, cpId),
    )
  } else if (newLabel && cpId) {
    // 소화기·소화전·완강기 — 실제 개소명은 location.
    stmts.push(
      env.DB.prepare('UPDATE check_points SET location=? WHERE id=?').bind(newLabel, cpId),
    )
  }

  // extinguishers.location — CP-FE-(소화기 자산 행 존재) 한정. 소화전/완강기/DIV 는 자산 행 없음.
  if (newLabel && cpId && cpId.startsWith('CP-FE-')) {
    stmts.push(
      env.DB
        .prepare("UPDATE extinguishers SET location=?, updated_at=datetime('now','+9 hours') WHERE check_point_id=?")
        .bind(newLabel, cpId),
    )
  }

  if (stmts.length === 1) {
    await stmts[0].run()
  } else {
    await env.DB.batch(stmts)
  }

  return Response.json({ success: true })
}

// DELETE /api/floorplan-markers/:id — 마커 삭제 (로그인한 전체 스태프)
//
// 분기 동작:
//   (A) 소화기(plan_type='extinguisher' + check_point_id LIKE 'CP-FE-%'): floor_plan_markers /
//       extinguishers / check_points.is_active 3 테이블 atomic 정리.
//   (B) 그 외 마커 with cp_id (예: indoor_hydrant/descending_lifeline 의 자동 cp 링크):
//       check_records=0 AND 다른 marker=0 일 때만 marker+cp atomic DELETE,
//       아니면 marker 만 DELETE (cp 보존).
//   (C) cp_id 없는 마커: 단일 DELETE.
//
// 절대 금지: check_records 는 어떤 분기에서도 삭제하지 않는다 (점검 기록 보존 원칙).
export const onRequestDelete: PagesFunction<Env> = async ({ params, env }) => {
  const id = params.id as string

  const marker = await env.DB
    .prepare('SELECT plan_type, check_point_id FROM floor_plan_markers WHERE id=?')
    .bind(id)
    .first<{ plan_type: string; check_point_id: string | null }>()

  if (!marker) {
    return Response.json({ success: false, error: '마커를 찾을 수 없습니다' }, { status: 404 })
  }

  const cpId = marker.check_point_id
  const isExtCascade = marker.plan_type === 'extinguisher' && !!cpId && cpId.startsWith('CP-FE-')

  if (isExtCascade) {
    // Phase 24: 자산은 *unassign 만* (status='active' 유지). 자산 행 자체는 보존.
    // 사용자가 명시적으로 폐기를 원하면 ExtinguishersListPage 의 「폐기」 버튼 사용.
    // 절대 금지: check_records 는 어떤 분기에서도 DELETE 하지 않는다.
    // D1 batch 는 atomic — 한 statement 실패 시 전체 롤백 (Cloudflare 공식 트랜잭션 의미론).
    await env.DB.batch([
      env.DB.prepare('DELETE FROM floor_plan_markers WHERE id=?').bind(id),
      env.DB.prepare("UPDATE extinguishers SET check_point_id=NULL, updated_at=datetime('now','+9 hours') WHERE check_point_id=?").bind(cpId),
      env.DB.prepare('UPDATE check_points SET is_active=0 WHERE id=?').bind(cpId),
    ])
  } else if (cpId) {
    // 일반 cp cascade 가드:
    // POST /api/floorplan-markers 가 indoor_hydrant/descending_lifeline 등에 대해 cp 를 자동 INSERT 하므로,
    // DELETE 도 대칭으로 정리해야 orphan 발생 안 함. 단 두 안전 가드 동시 충족 시에만 cp 도 DELETE:
    //   (1) 해당 cp 에 check_records 가 0건 (점검 기록 보존 절대 원칙)
    //   (2) 동일 cp_id 를 참조하는 다른 marker 가 0건 (다른 도면/페어링 보호)
    // 한 가드라도 위반하면 기존처럼 marker 만 DELETE, cp 는 보존.
    //
    // 소화기 분기 (isExtCascade) 는 위에서 처리되어 이 분기에 도달하지 않음.
    // 절대 금지: check_records 는 어떤 분기에서도 DELETE 하지 않는다.
    const [recRow, otherMarkerRow] = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) AS c FROM check_records WHERE checkpoint_id=?').bind(cpId).first<{ c: number }>(),
      env.DB.prepare('SELECT COUNT(*) AS c FROM floor_plan_markers WHERE check_point_id=? AND id<>?').bind(cpId, id).first<{ c: number }>(),
    ])
    const recordCount = recRow?.c ?? 0
    const otherMarkerCount = otherMarkerRow?.c ?? 0
    const canCascadeCp = recordCount === 0 && otherMarkerCount === 0

    if (canCascadeCp) {
      // D1 batch 는 atomic — 둘 다 성공 또는 둘 다 롤백.
      await env.DB.batch([
        env.DB.prepare('DELETE FROM floor_plan_markers WHERE id=?').bind(id),
        env.DB.prepare('DELETE FROM check_points WHERE id=?').bind(cpId),
      ])
      console.log(`[floorplan-markers DELETE] cascade marker+cp: marker=${id}, cp=${cpId}`)
    } else {
      // cp 보존 — 기존 동작.
      await env.DB.prepare('DELETE FROM floor_plan_markers WHERE id=?').bind(id).run()
      console.log(`[floorplan-markers DELETE] marker-only (cp preserved): marker=${id}, cp=${cpId}, records=${recordCount}, other_markers=${otherMarkerCount}`)
    }
  } else {
    // cp 가 애초에 연결 안 된 마커 — 단일 DELETE.
    await env.DB.prepare('DELETE FROM floor_plan_markers WHERE id=?').bind(id).run()
  }

  return Response.json({ success: true })
}
