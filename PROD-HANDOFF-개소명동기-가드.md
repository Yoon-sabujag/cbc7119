# PROD 반영 요청 — 소화기 개소명 3-store 동기 가드

> staging(cbc7119-data)에서 검증 완료. prod 콘솔(`~/Documents/20260328`)에서 **production-sync 프로토콜**로 동일 반영.
> staging 검증 커밋: `a9791e9`

---

## 1. 문제 (사고 260608-b6f 와 동일)

소화기 "개소명"이 D1 3곳에 중복 저장됨:
- `check_points.location` — 일반점검 목록 · 도면 마커 이름(cp_location 우선) · QR
- `extinguishers.location` — 소화기 관리 목록 (CP-FE-% 개소에만 행 존재)
- `floor_plan_markers.label` — 마커 수정 모달 "개소명" 입력칸

두 PUT 경로가 일부만 갱신 → "한 개소가 화면마다 다른 이름"으로 보임:
- `PUT /api/floorplan-markers/:id` : `label` 만 UPDATE, 나머지 2곳 전파 X
- `PUT /api/check-points/:id` (admin 편집기) : `check_points.location` 만 갱신, `extinguishers.location` 전파 X

## 2. 결정된 범위

**소화기(`CP-FE-%`)만 동기.** 소화전(`-SH`)·완강기(`-WK`)·DIV(`CP-DIV-`)는 제외.
- 이유: staging 라이브 D1 확인 결과 `extinguishers` 행은 `CP-FE-%` 에만 존재(소화전/완강기/DIV는 행 없음 → 동기해도 무의미).
- DIV 는 구조적 이름(`8층 DIV #1`)·컴프 페어링 룰(`src/constants/divPoints.ts`)이 있어 제외 (과거 사고 260528 참고).

## 3. 적용할 코드 (2개 파일, 그대로 적용 가능)

테이블/컬럼명·`env.DB` 바인딩이 prod와 동일하므로 **diff 그대로 적용**하면 됨.

### `functions/api/floorplan-markers/[id].ts` — PUT 핸들러
기존 단일 UPDATE(`sets.push("updated_at=...")` + `binds.push(id)` 직후의 `await env.DB.prepare(...).run()`)를 아래로 교체:

```ts
  sets.push("updated_at=datetime('now','+9 hours')")
  binds.push(id)

  // ── 개소명(label) 동기 가드 (사고 260608-b6f 재발 방지) ──────────────────
  // 소화기 개소명은 D1 3곳에 중복 저장된다:
  //   check_points.location   (일반점검 목록·도면 마커 이름[cp_location 우선]·QR)
  //   extinguishers.location  (소화기 관리 목록 — CP-FE-% 개소에만 행 존재)
  //   floor_plan_markers.label(이 모달 "개소명" 입력칸)
  // 기존 PUT 은 label 만 갱신 → 모달에서 개소명을 바꿔도 마커 라벨만 바뀌고
  // 다른 두 화면은 옛 이름 그대로 → "한 개소가 화면마다 다르게" 보이던 버그.
  // 이제 같은 batch 로 check_points.location / extinguishers.location 까지 전파한다.
  //
  // 범위: 소화기(CP-FE-%) 개소만. 소화전(-SH)·완강기(-WK)·DIV 는 extinguishers 행이
  //       없고, DIV 는 구조적 이름·컴프 페어링 룰이 있어 제외한다 (사고 260528 참고).
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

  if (newLabel && cpId && cpId.startsWith('CP-FE-')) {
    stmts.push(
      env.DB.prepare('UPDATE check_points SET location=? WHERE id=?').bind(newLabel, cpId),
    )
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
```

### `functions/api/check-points/[id].ts` — PUT 핸들러 (admin)
기존 `if (willDeactivate && isExtCp) { ... }` 블록 끝에 `else if` 추가:

```ts
    } else if (isExtCp && body.location !== undefined) {
      // 개소명(location) 동기 가드 — 사고 260608-b6f 와 동일 종류 divergence.
      // 이 편집기 PUT 은 check_points.location 만 갱신하고 extinguishers.location 엔
      // 전파하지 않아, 소화기 관리 목록이 옛 이름으로 남던 문제를 막는다.
      // 마커 모달 PUT(floorplan-markers/[id].ts) 가드와 대칭. CP-FE-% 개소만 해당.
      await env.DB
        .prepare("UPDATE extinguishers SET location=?, updated_at=datetime('now','+9 hours') WHERE check_point_id=?")
        .bind(body.location, id)
        .run()
    }
```

## 4. staging 검증 결과 (참고)

- `tsc + vite build` 통과 (functions/ 타입체크 포함)
- D1 propagation 테스트 PASS: `CP-FE-0001` 에 핸들러와 동일 SQL로 snapshot→mutate→verify→restore, 3-store 모두 전파 확인 후 원복
- staging 도메인 UI E2E 는 사용자 검증

## 5. PROD 콘솔에서 할 일

1. **코드 적용** — 위 2개 파일 변경 (production-sync 게이트 따라).
2. **빌드** — `npm run build` (tsc+vite, 통과 확인).
3. **배포** — prod 명령(`--project-name=cbc7119`, `--branch=production`)으로 배포. ⚠️ staging 명령 금지.
4. **prod 데이터 점검 (중요)** — staging엔 라벨에 인증번호가 잘못 들어간 소화기 2건(`CP-FE-0104`=차케어스 내부 소화전 뒤, `CP-FE-0105`=남측 사무실 내부 완강기 옆, 둘 다 6층 사구역)이 있어 정리했음. **prod에도 같은 패턴 있는지 확인 필요.** prod DB(`cha-bio-db`)에 아래 진단 쿼리 실행:

   ```sql
   SELECT m.check_point_id, m.label, cp.location
   FROM floor_plan_markers m JOIN check_points cp ON cp.id=m.check_point_id
   WHERE m.plan_type='extinguisher' AND m.check_point_id LIKE 'CP-FE-%'
     AND m.label IS NOT NULL AND m.label <> cp.location;
   ```
   결과가 있으면(라벨이 개소명과 다른 행), 검토 후 정리:
   ```sql
   UPDATE floor_plan_markers
   SET label=(SELECT location FROM check_points WHERE id=floor_plan_markers.check_point_id),
       updated_at=datetime('now','+9 hours')
   WHERE check_point_id IN (/* 위에서 확인된 CP-FE id들 */);
   ```
   ※ 가드는 변경감지를 안 하므로(재저장으로 기존 divergence 수정 케이스를 살리려고 의도적), 이런 stray 라벨은 무수정 저장 시 개소명을 덮을 수 있음 → 사전 정리 권장.

5. **UI 검증** — 도면 소화기 마커 개소명 변경 → 일반점검 목록 + 소화기 관리 목록 둘 다 반영. 비-소화기 마커 라벨 단독 수정 무회귀. 점검개소 편집기에서 소화기 개소명 변경 → 소화기 관리 목록 반영.

## 6. 주의

- 동기 범위 = **CP-FE-% 한정** (소화전/완강기/DIV 제외). 운영에서 "전체 적용" 요구가 있어도 DIV 페어링 위험 재검토 필요.
- D1 `batch()` 순서: 마커/주체 UPDATE 가 항상 첫 statement (실패 시 악화 방지).
- prod 데이터 정리는 prod 콘솔에서만. staging 콘솔에서 prod 직접 접근 금지.
