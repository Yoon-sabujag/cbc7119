---
phase: quick-260429-meq
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/migrations/0074_elevator_fault_photos.sql
  - cha-bio-safety/functions/api/elevators/faults.ts
  - cha-bio-safety/src/pages/ElevatorPage.tsx
autonomous: false
requirements:
  - QUICK-260429-MEQ
user_setup:
  - service: cloudflare-d1
    why: "프로덕션 D1에 0074 마이그레이션 적용 (`npx wrangler d1 execute cha-bio-safety --remote --file=migrations/0074_elevator_fault_photos.sql`). 사용자 메모리: 항상 production 적용 후 테스트."

must_haves:
  truths:
    - "고장 접수 모달의 '증상' 입력 칸 아래에 사진 첨부 영역이 표시된다 (라벨: '증상 사진 (0/5)')"
    - "사진 추가 버튼을 눌러 카메라/앨범에서 최대 5장까지 첨부할 수 있다"
    - "고장 접수 시 첨부한 사진 키들이 elevator_faults.photo_keys (JSON 배열)로 저장된다"
    - "수리 완료 모달의 '수리 내용' 입력 칸 아래에도 동일한 사진 첨부 영역이 표시된다 (라벨: '수리 사진 (0/5)')"
    - "수리 완료 시 첨부한 사진 키들이 elevator_faults.repair_photo_keys (JSON 배열)로 저장된다"
    - "기존에 사진이 없던 고장 기록은 빈 배열 '[]'을 반환하고 정상 동작한다 (백필 불필요)"
  artifacts:
    - path: "cha-bio-safety/migrations/0074_elevator_fault_photos.sql"
      provides: "elevator_faults에 photo_keys, repair_photo_keys 컬럼 추가"
      contains: "ALTER TABLE elevator_faults ADD COLUMN photo_keys"
    - path: "cha-bio-safety/functions/api/elevators/faults.ts"
      provides: "POST/PATCH 핸들러가 photoKeys/repairPhotoKeys body 필드 수용 → DB 저장"
      contains: "photo_keys"
    - path: "cha-bio-safety/src/pages/ElevatorPage.tsx"
      provides: "FaultNewModal, FaultNewFullscreen, FaultResolveModal 세 곳에 MultiPhotoUpload 통합"
      contains: "MultiPhotoUpload label=\"증상 사진\""
  key_links:
    - from: "FaultNewModal/FaultNewFullscreen (ElevatorPage.tsx)"
      to: "POST /api/elevators/faults"
      via: "onSubmit body.photoKeys"
      pattern: "photoKeys.*photoKeys"
    - from: "FaultResolveModal (ElevatorPage.tsx)"
      to: "PATCH /api/elevators/faults"
      via: "onSubmit body.repairPhotoKeys"
      pattern: "repairPhotoKeys"
    - from: "faults.ts onRequestPost/onRequestPatch"
      to: "elevator_faults 테이블"
      via: "JSON.stringify(body.photoKeys ?? []) → photo_keys 컬럼"
      pattern: "photo_keys.*JSON"
---

<objective>
승강기 고장 접수 모달과 수리 완료(조치) 모달에 사진 첨부 기능을 추가한다 (최대 5장).

Purpose: 방재팀이 고장 발생 현장에서 사진을 함께 접수하고, 수리 완료 후에도 작업 결과 사진을 남겨 추후 분쟁/보고 시 근거로 활용한다. (사용자 직접 요구, 운영 관찰 모드 중 현장 UX 개선)

Output:
- 새 마이그레이션 0074_elevator_fault_photos.sql (photo_keys, repair_photo_keys 컬럼 추가)
- functions/api/elevators/faults.ts: POST/PATCH가 photo_keys 수용
- src/pages/ElevatorPage.tsx: 3개 모달 (FaultNewModal, FaultNewFullscreen, FaultResolveModal)에 MultiPhotoUpload 통합
- 사용자 시연 후 PWA 재설치 안내까지
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@./CLAUDE.md
@./.planning/STATE.md

@./cha-bio-safety/migrations/0043_multi_photo.sql
@./cha-bio-safety/migrations/0073_add_telemetry_events.sql
@./cha-bio-safety/functions/api/elevators/faults.ts
@./cha-bio-safety/src/pages/ElevatorPage.tsx

<interfaces>
<!-- ElevatorPage.tsx 안에 이미 존재하는 재사용 가능한 컴포넌트들 — 그대로 사용 -->

ElevatorPage.tsx:51-65 (interface ElevatorFault):
```ts
interface ElevatorFault {
  id: string
  elevator_id: string
  fault_at: string
  symptoms: string
  repair_company?: string
  repaired_at?: string
  repair_detail?: string
  is_resolved: number
  reporter_name: string
  elevator_location: string
  elevator_number: number
  elevator_type: string
  // ↑ 이 인터페이스에 photo_keys?: string, repair_photo_keys?: string 필드 추가 (JSON string)
}
```

ElevatorPage.tsx:2881 (재사용할 핵심 컴포넌트):
```tsx
function MultiPhotoUpload({ label, keys, setKeys, max = 5 }: {
  label: string;
  keys: string[];
  setKeys: (k: string[]) => void;
  max?: number
}) { /* 64x64 썸네일, 카메라/앨범 picker, 압축, 업로드, 삭제 — 이미 완성됨 */ }
```
사용 예 (line 3056-3059):
```tsx
<MultiPhotoUpload label="부품 입고 사진" keys={partsPhotos} setKeys={setPartsPhotos} />
```

ElevatorPage.tsx:228 (createMutation, POST 호출):
```ts
const res = await fetch('/api/elevators/faults', {
  method:'POST', headers:authHeader(), body:JSON.stringify(body)
})
```
- 현재 body shape: `{ elevatorId, faultAt, symptoms, isResolved }` — 여기에 `photoKeys: string[]` 추가
- 추후 onSubmit 시그니처: `onSubmit({ elevatorId, faultAt, symptoms, photoKeys, isResolved:false })`

ElevatorPage.tsx:461 (resolveFault, PATCH 호출):
```ts
const res = await fetch('/api/elevators/faults', {
  method:'PATCH', headers:authHeader(), body:JSON.stringify(body)
})
```
- 현재 body shape: `{ id, repairCompany, repairedAt, repairDetail }` — 여기에 `repairPhotoKeys: string[]` 추가

functions/api/elevators/faults.ts:30-61 (onRequestPost):
- 현재: photo 컬럼 없음. body.photoKeys를 받아 JSON.stringify(photoKeys ?? []) 후 photo_keys 컬럼에 저장.

functions/api/elevators/faults.ts:73-105 (onRequestPatch):
- 현재: repair 관련 4개 필드만 UPDATE. body.repairPhotoKeys를 받아 JSON.stringify(repairPhotoKeys ?? []) 후 repair_photo_keys 컬럼에 UPDATE.

migrations/0043_multi_photo.sql (참고 패턴):
```sql
ALTER TABLE legal_findings ADD COLUMN photo_keys TEXT NOT NULL DEFAULT '[]';
ALTER TABLE legal_findings ADD COLUMN resolution_photo_keys TEXT NOT NULL DEFAULT '[]';
```
- DEFAULT '[]' 로 설정해 기존 행 자동 초기화 → 백필 불필요.

ElevatorPage.tsx:2842 (RepairImageViewer, 클릭 시 확대) — 본 작업에선 일단 사용 안 함 (수리 기록 입력 페이지처럼 추가 버튼만; 상세 표시는 별도 작업).
</interfaces>

**중요 컨텍스트:**
- **운영 관찰 모드** (STATE.md): 신규 기능 개발 금지가 원칙이지만, 본 건은 사용자 직접 요청 + 현장 UX 개선이므로 허용.
- **MultiPhotoUpload는 이미 ElevatorPage.tsx 내부에 정의되어 있음** — import할 필요 없이 동일 파일 안에서 컴포넌트 호출만 추가하면 됨.
- **타입 가드:** `photo_keys`는 D1에서 TEXT로 들어오므로 클라이언트에서 사용 시 `JSON.parse(row.photo_keys ?? '[]')` 필요. 단, 본 plan에서는 *입력*만 다루고 *표시(상세 페이지에서 보여주기)*는 out of scope이므로 클라이언트 파싱 코드는 최소화.
- **PWA 캐시:** 사용자 메모리 - 배포 후 사용자에게 앱 재설치 유도 안내 필요.
- **인라인 스타일 패턴 유지:** Tailwind 도입 X. 기존 `inputSt`, `Field` 등 그대로 사용.
</context>

<tasks>

<task type="auto">
  <name>Task 1: 0074 마이그레이션 + 핸들러 photo_keys 수용</name>
  <files>
    cha-bio-safety/migrations/0074_elevator_fault_photos.sql,
    cha-bio-safety/functions/api/elevators/faults.ts
  </files>
  <action>
**1. 새 마이그레이션 작성 (cha-bio-safety/migrations/0074_elevator_fault_photos.sql):**

0043_multi_photo.sql 패턴 그대로. 다음 두 컬럼만 추가, 백필 없음 (기존 고장 기록은 사진 없음으로 두고 신규부터만 첨부):

```sql
-- 0074_elevator_fault_photos.sql
-- elevator_faults에 사진 키 배열 컬럼 추가 (증상 사진, 수리 사진)
ALTER TABLE elevator_faults ADD COLUMN photo_keys TEXT NOT NULL DEFAULT '[]';
ALTER TABLE elevator_faults ADD COLUMN repair_photo_keys TEXT NOT NULL DEFAULT '[]';
```

**2. functions/api/elevators/faults.ts 수정:**

(a) `onRequestPost` body 타입에 `photoKeys?: string[]` 추가, INSERT 문에 photo_keys 컬럼 추가:
```ts
const body = await request.json<{
  elevatorId: string
  faultAt: string
  symptoms: string
  repairCompany?: string
  repairedAt?: string
  repairDetail?: string
  isResolved?: boolean
  photoKeys?: string[]            // 추가
}>()

const id = nanoid()
await env.DB.prepare(`
  INSERT INTO elevator_faults
    (id, elevator_id, reported_by, fault_at, symptoms, repair_company, repaired_at, repair_detail, is_resolved, photo_keys, created_at)
  VALUES (?,?,?,?,?,?,?,?,?,?,datetime('now','+9 hours'))
`).bind(
  id, body.elevatorId, staffId, body.faultAt, body.symptoms,
  body.repairCompany ?? null, body.repairedAt ?? null, body.repairDetail ?? null,
  body.isResolved ? 1 : 0,
  JSON.stringify(body.photoKeys ?? [])    // 추가
).run()
```

(b) `onRequestPatch` body 타입에 `repairPhotoKeys?: string[]` 추가, UPDATE 문에 repair_photo_keys 컬럼 추가:
```ts
const body = await request.json<{
  id: string
  repairCompany?: string
  repairedAt: string
  repairDetail: string
  repairPhotoKeys?: string[]       // 추가
}>()

await env.DB.prepare(`
  UPDATE elevator_faults
  SET is_resolved=1, repair_company=?, repaired_at=?, repair_detail=?, repair_photo_keys=?
  WHERE id=?
`).bind(
  body.repairCompany ?? null,
  body.repairedAt,
  body.repairDetail,
  JSON.stringify(body.repairPhotoKeys ?? []),
  body.id
).run()
```

(c) `onRequestGet`은 SELECT f.* 가 이미 모든 컬럼을 반환하므로 변경 불필요.

**3. 프로덕션 D1에 적용** (배포는 Task 3에서 통합 처리):
```bash
cd cha-bio-safety
npx wrangler d1 execute cha-bio-safety --remote --file=migrations/0074_elevator_fault_photos.sql
```
적용 결과(rows added 1, executed 2 statements 등)를 확인하고 표시.

**TDD 미적용 사유:** 단순 ALTER + 핸들러 컬럼 추가, 기존 테스트 인프라 없음 (운영 관찰 모드). 배포 후 사용자 시연으로 검증.
  </action>
  <verify>
    <automated>cd cha-bio-safety && npx tsc --noEmit functions/api/elevators/faults.ts 2>&1 | tee /tmp/faults-tsc.log && grep -q "error TS" /tmp/faults-tsc.log && exit 1 || echo "tsc OK"</automated>
    그리고 D1 적용 확인:
    ```
    cd cha-bio-safety && npx wrangler d1 execute cha-bio-safety --remote --command="PRAGMA table_info(elevator_faults)" | grep -E "photo_keys|repair_photo_keys"
    ```
    두 컬럼이 출력되면 성공.
  </verify>
  <done>
    - migrations/0074_elevator_fault_photos.sql 파일 존재
    - faults.ts onRequestPost가 body.photoKeys를 받아 photo_keys 컬럼에 JSON 저장
    - faults.ts onRequestPatch가 body.repairPhotoKeys를 받아 repair_photo_keys 컬럼에 JSON 저장
    - 프로덕션 D1에 0074 적용 완료 (PRAGMA로 확인)
    - TypeScript 컴파일 에러 없음
  </done>
</task>

<task type="auto">
  <name>Task 2: 3개 모달에 MultiPhotoUpload 통합 + mutate body 확장</name>
  <files>cha-bio-safety/src/pages/ElevatorPage.tsx</files>
  <action>
ElevatorPage.tsx 한 파일에서 3개 모달 컴포넌트와 2개 mutation을 수정한다. **MultiPhotoUpload는 이미 같은 파일 안에 정의되어 있으므로 import 추가 불필요.**

**1. interface ElevatorFault 확장 (line 51-65 부근):**
```ts
interface ElevatorFault {
  // ... 기존 필드 그대로 ...
  photo_keys?: string                  // 추가 (JSON string from D1)
  repair_photo_keys?: string           // 추가 (JSON string from D1)
}
```

**2. FaultNewModal 수정 (line ~1925 부근):**

(a) state 추가:
```tsx
const [photoKeys, setPhotoKeys] = useState<string[]>([])
```

(b) `handleSubmit` 수정 — onSubmit body에 photoKeys 포함:
```tsx
const handleSubmit = () => {
  const floorPart = faultFloor ? `[${faultFloor}] ` : ''
  const passPart  = isElev && hasPassenger ? '[승객탑승] ' : ''
  onSubmit({
    elevatorId,
    faultAt: faultAt+':00',
    symptoms: `${floorPart}${passPart}${symptoms}`,
    photoKeys,                         // 추가
    isResolved: false
  })
}
```

(c) JSX — `<Field label="증상">` 블록 **바로 다음**에 `<MultiPhotoUpload>` 추가 (label="증상 사진"). 기존 텍스트에어리어와 같은 들여쓰기로 같은 `<>...</>` fragment 내부, `<a href={TKE_TEL}>` 버튼 바로 위에:
```tsx
<Field label="증상">
  <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={3} placeholder="고장 증상을 입력하세요" style={{ ...inputSt, resize:'none' }} />
</Field>

<MultiPhotoUpload label="증상 사진" keys={photoKeys} setKeys={setPhotoKeys} />
```

**3. FaultNewFullscreen 수정 (line ~2010 부근):**

동일한 패턴 — state 추가, handleSubmit에 photoKeys 추가, `<Field label="증상">` 다음에 `<MultiPhotoUpload label="증상 사진" .../>` 추가. (이 컴포넌트는 대시보드 진입용 풀스크린이라 모달과 별개로 같은 변경 필요.)

**4. FaultResolveModal 수정 (line ~2113 부근):**

(a) state 추가:
```tsx
const [repairPhotoKeys, setRepairPhotoKeys] = useState<string[]>([])
```

(b) onSubmit 호출 수정 — body에 repairPhotoKeys 포함:
```tsx
<button
  onClick={() => onSubmit({
    id: fault.id,
    repairCompany,
    repairedAt: repairedAt+':00',
    repairDetail,
    repairPhotoKeys                    // 추가
  })}
  disabled={!repairDetail.trim()||loading}
  ...
```

(c) JSX — `<Field label="수리 내용">` 텍스트에어리어 바로 다음에 `<MultiPhotoUpload>` 추가:
```tsx
<Field label="수리 내용">
  <textarea value={repairDetail} ... />
</Field>

<MultiPhotoUpload label="수리 사진" keys={repairPhotoKeys} setKeys={setRepairPhotoKeys} />
```

**5. createMutation / resolveFault mutation은 변경 불필요:**
이미 body 객체를 그대로 fetch에 흘려보내므로 새 필드 (photoKeys, repairPhotoKeys)도 자동으로 전달됨. mutationFn 안에 `body` 가 통과하는 것만 확인하면 끝.

**6. React Query invalidation 확인:**
기존 onSuccess에서 이미 `['fault*']`, `['daily']` 등을 invalidate하고 있음. 추가 invalidation 불필요.

**TDD 미적용 사유:** UI 통합 작업, MultiPhotoUpload 자체는 이미 다른 곳에서 검증된 기존 컴포넌트. 사용자 시연으로 검증.

**주의 (사용자 메모리):**
- 디자인 변경 전 상의 → 본 건은 이미 사용자가 명시 요구한 위치라 OK. 단, **순서**(증상 텍스트에어리어 ↓ 사진 / 수리 내용 텍스트에어리어 ↓ 사진)는 변경 금지.
- 인라인 스타일 패턴 유지, Field 래퍼는 사진 영역에는 사용 안 함 (MultiPhotoUpload가 자체 라벨 가짐).
- 기존 FaultNewModal에 `disabled={!symptoms.trim()...}` 가 있는 것 그대로 유지 (사진은 옵션, 증상만 필수).
  </action>
  <verify>
    <automated>cd cha-bio-safety && npm run build 2>&1 | tail -25</automated>
    빌드 성공 + dist 폴더 생성. TypeScript 에러 0건.
  </verify>
  <done>
    - npm run build 통과 (warnings 허용, errors 0)
    - 3개 모달 모두에 MultiPhotoUpload 컴포넌트 호출 추가됨
    - FaultNewModal/FaultNewFullscreen 의 handleSubmit body에 photoKeys 포함
    - FaultResolveModal 의 onSubmit body에 repairPhotoKeys 포함
    - interface ElevatorFault에 photo_keys?, repair_photo_keys? 필드 추가
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: 프로덕션 배포 + 사용자 시연 검증</name>
  <what-built>
    - elevator_faults 테이블에 photo_keys, repair_photo_keys 컬럼 (TEXT, DEFAULT '[]')
    - POST /api/elevators/faults 가 photoKeys 수용 → photo_keys 저장
    - PATCH /api/elevators/faults 가 repairPhotoKeys 수용 → repair_photo_keys 저장
    - ElevatorPage 고장 접수 모달 / 고장 접수 풀스크린 / 수리 완료 모달 — 3개 모두 사진 첨부 영역 (최대 5장) 추가
  </what-built>
  <how-to-verify>
**자동화 단계 (Claude가 먼저 수행):**

1. cha-bio-safety 디렉토리에서 production 배포:
   ```bash
   cd cha-bio-safety
   npm run build
   npx wrangler pages deploy dist --project-name=cha-bio-safety --branch=production --commit-message="feat(quick-260429-meq): elevator fault photo upload"
   ```
   (사용자 메모리: `--branch=production` 필수, 한글 commit-message 거부 시 ASCII로 별도 지정)

2. 배포 URL 확인 후 사용자에게 전달.

**사용자 시연 단계:**

1. **PWA 재설치 안내 (사용자 메모리: PWA 캐시):** 사용자에게 "기존 PWA 삭제 → 다시 설치 (또는 강제 새로고침)" 안내.

2. **고장 접수 시연:**
   - 승강기 페이지 → 임의 호기 선택 → "고장 접수" 모달 진입
   - 증상 입력 후 "증상 사진 (0/5)" 영역 확인 → 사진 1~3장 추가
   - 추가/삭제 동작 확인 (✕ 버튼)
   - "고장 접수 (TKE 자동 연결)" 버튼 → 접수 성공 토스트 확인

3. **수리 완료 시연:**
   - 방금 접수한 고장 카드의 "수리 완료" 버튼 → 모달 진입
   - 수리 내용 입력 후 "수리 사진 (0/5)" 영역 확인 → 사진 1~2장 추가
   - "수리 완료" 버튼 → 처리 성공 토스트 + 모달 닫힘 + 카드 상태 변경

4. **데이터 검증 (Claude가 D1 쿼리):**
   ```bash
   npx wrangler d1 execute cha-bio-safety --remote \
     --command="SELECT id, symptoms, photo_keys, repair_photo_keys FROM elevator_faults ORDER BY created_at DESC LIMIT 3"
   ```
   방금 접수한 행에 photo_keys / repair_photo_keys 가 JSON 배열로 들어가 있는지 확인.

5. **부정 케이스 (선택):** 사진 6장째 추가 시도 → "사진은 최대 5장까지 가능합니다" 토스트.

**예상 이슈 + 대응:**
- ❌ "사진 영역이 안 보임" → SW 캐시. 앱 재설치 재안내.
- ❌ "업로드 실패" 토스트 → /api/uploads R2 권한 확인 (이미 동작 중인 다른 페이지에서 됨 → 정상이어야 함).
- ❌ photo_keys 컬럼이 NULL → INSERT 시 photoKeys 누락 의심. 핸들러 코드 grep 재확인.
  </how-to-verify>
  <resume-signal>
    사용자가 "approved" / "잘 된다" 라고 하면 다음 단계 (커밋 + PROGRESS.md 작성).
    문제 보고 시 → Task 1/2로 돌아가 수정 후 재배포.
  </resume-signal>
</task>

</tasks>

<verification>
- [ ] `npm run build` 통과 (Task 2 자동 검증)
- [ ] 0074 마이그레이션 production D1 적용 (Task 1 자동 검증)
- [ ] 사용자 시연: 고장 접수 모달에 사진 첨부 → 저장 확인
- [ ] 사용자 시연: 수리 완료 모달에 사진 첨부 → 저장 확인
- [ ] D1 쿼리로 photo_keys / repair_photo_keys JSON 배열 저장 확인
- [ ] 5장 초과 시 토스트 에러 표시 (MultiPhotoUpload 내장 동작)
</verification>

<success_criteria>
방재팀이 모바일 PWA에서 승강기 고장 접수 시 증상과 함께 사진(최대 5장)을 첨부하고, 수리 완료 시에도 수리 결과 사진(최대 5장)을 첨부하여 elevator_faults 테이블에 영구 저장할 수 있다. 배포된 production 환경에서 동작이 확인되었다.

**Out of scope (별도 작업):**
- 고장 상세 페이지에서 첨부된 사진을 표시하는 UI (지금은 입력만; 향후 ElevatorFaultDetailPage 같은 페이지 또는 기존 카드 확장으로 처리)
- 기존 사진 없는 고장 기록의 백필 (그대로 두고 신규부터 적용)
- 사진 미리보기 lightbox / 압축 정책 변경
</success_criteria>

<output>
완료 후 `.planning/quick/260429-meq-elevator-fault-photo-upload/260429-meq-PROGRESS.md` 생성:
- 변경 파일 목록
- 0074 마이그레이션 production 적용 결과
- 배포 URL + 커밋 SHA
- 사용자 시연 결과 (PASS / 이슈 있음)
- Out of scope 후속 작업 후보 (사진 표시 UI 등)
</output>
