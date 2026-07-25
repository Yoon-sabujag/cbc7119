# 런북 — staging(cbc7119-data)을 prod(cha-bio-safety) 미러로 리셋

**작성:** 2026-07-26 (prod 콘솔에서) · **실행:** 스테이징 콘솔 `~/Documents/cbc7119-data` 전용
**목표:** 병렬 개발선이 돼 66파일 드리프트된 스테이징을 **현재 prod 기준으로 리셋**해 검증 대표성 회복. 이후 staging은 순수 검증 미러로만 사용(개발선 금지).

> ⚠️ 이 문서는 **스테이징 콘솔에서만** 실행. prod 리소스(cbc7119 / cha-bio-db / cha-bio-storage) 절대 건드리지 말 것. wrangler `--project-name`은 항상 `cbc7119-data`, `--branch`는 항상 `main`, D1은 `cha-bio-db-staging`만.

---

## 0. 사전 조건 (prod 측 완료 확인 — 이미 끝남)

- prod에 승격할 UI 2건은 **배포·UAT 통과 완료**(quick-260725-wmo, 배포 675b5b71):
  - StaffManagePage 바텀시트 Pattern A(모달 스크롤 누수 수정)
  - DashboardPage 라이브카드 panelFire(화재-only)
- 따라서 지금 prod 미러로 리셋하면 staging이 이 2건을 **자동 상속**한다.

## 결정 요약 (적대 검증 결과, [[project_staging_prod_mirror_reset]])

- 66 상이 파일 중 63개는 prod-superset/시각 등가 → 덮어써도 안전.
- 스테이징 고유 3건: StaffManage·panelFire → **prod에 이미 반영됨**(상속). soon 네비 → **폐기**(미사용 inert).
- divPoints.ts: prod가 교정 SSOT → 덮어쓰기 정답. AdminPage.tsx: deprecated 12줄 스텁 → overlay 시 자동 삭제.
- 마이그레이션 유일 충돌 0096(prod=panel_agent_telemetry / staging=drop_minwon). **본 런북은 drop_minwon을 폐기하고 순수 미러**로 간다(minwon 테이블 0행·0참조라 무해; 필요 시 나중에 prod 정식 마이그로 드롭). → 리셋 후 migrations 디렉토리가 prod와 완전 동일.

---

## 경로 상수

```bash
PROD=/Users/jykevin/Documents/20260328/cha-bio-safety   # 읽기 전용 소스
STG=/Users/jykevin/Documents/cbc7119-data                # 이 콘솔 = 대상
```

## 1. 안전 확인 + 백업 (되돌리기용)

```bash
cd "$STG"
pwd                      # 반드시 /Users/jykevin/Documents/cbc7119-data
git branch --show-current  # 반드시 main
git add -A && git commit -m "checkpoint before prod-mirror reset" || echo "(변경 없음)"
BR="pre-reset-backup-$(git rev-parse --short HEAD)"
git branch "$BR"
echo "백업 브랜치: $BR  ← 문제 시 git reset --hard $BR 로 원복"
[ -d "$PROD/src" ] || { echo "❌ prod 소스 없음 — 중단"; }
```

## 2. 코드 오버레이 (src / functions / migrations / public)

`--delete`로 staging 잔재(AdminPage.tsx, 구 0096_drop_minwon 등)를 제거하고 prod 전용 신규(div/, inspection/, PanelMonitorPage, useDivNames, formatFloorLabel, photoVault, agent-history.ts)를 가져온다. **보존 대상은 건드리지 않음**: `wrangler.toml`, `CLAUDE.md`, `scripts/`, `.planning/`, `.git/`, `node_modules/`, `.wrangler/`, `dist/`, 그리고 최상위 `vite.config.ts`(이미 __STAGING__ define 보유 — 유지).

```bash
cd "$STG"
rsync -a --delete "$PROD/src/"         "$STG/src/"
rsync -a --delete "$PROD/functions/"   "$STG/functions/"
rsync -a --delete "$PROD/migrations/"  "$STG/migrations/"
rsync -a --delete "$PROD/public/"      "$STG/public/"
```

> 최상위 config(package.json/tsconfig/tailwind/postcss/index.html)는 감사 결과 prod와 바이트 동일이라 건드리지 않아도 미러. 굳이 맞추려면 개별 cp 가능하나 불필요.
> `vite.config.ts`도 건드리지 않는다(staging 것 = prod + __STAGING__ define). 만약 prod의 vite.config.ts가 그 사이 __STAGING__ 외 변경됐다면 그때만 수동 반영.

## 3. 배너 델타 재주입 (src/ 오버레이로 덮인 2파일)

src/ 오버레이가 prod 버전으로 덮으므로 `App.tsx`, `vite-env.d.ts`의 스테이징 배너를 **다시 넣는다.** (Claude가 prod의 현재 App.tsx 구조를 읽고 아래를 삽입 — 최상위 provider의 첫 자식으로 `<StagingBanner />`.)

### 3a. `src/App.tsx`
(1) 컴포넌트 정의부(예: `export default function App()` 앞)에 함수 삽입:

```tsx
function StagingBanner() {
  if (typeof __STAGING__ === 'undefined' || !__STAGING__) return null
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: '#dc2626', color: '#fff',
      fontSize: 12, fontWeight: 700, textAlign: 'center',
      padding: '4px 8px',
      borderBottom: '1px solid #991b1b',
      pointerEvents: 'none',
      letterSpacing: '0.02em',
    }}>
      🧪 데이터 스테이징 — 실제 운영 데이터 아님 (cbc7119-data)
    </div>
  )
}
```

(2) 렌더: prod App.tsx의 최상위 `<QueryClientProvider ...>` **첫 자식**으로 `<StagingBanner />` 삽입(그 밑에 기존 `<BrowserRouter>`/라우팅 유지):

```tsx
    <QueryClientProvider client={qc}>
      <StagingBanner />
      {/* ...prod 기존 트리 그대로... */}
```

### 3b. `src/vite-env.d.ts`
`declare const __BUILD_TIME__: string` 다음 줄에 추가:

```ts
declare const __STAGING__: boolean
```

### 3c. 확인
```bash
grep -n "StagingBanner" "$STG/src/App.tsx"          # 정의+렌더 2군데
grep -n "__STAGING__"   "$STG/src/vite-env.d.ts"    # 타입 선언
grep -n "__STAGING__: JSON.stringify(true)" "$STG/vite.config.ts"  # define 유지 확인
```

## 4. 미러 정합성 검증 (배포 전)

배너 재주입분(App.tsx / vite-env.d.ts)과 config 차이 외에는 src/functions/migrations가 prod와 **동일**해야 한다.

```bash
diff -rq "$PROD/src" "$STG/src"          # App.tsx, vite-env.d.ts 만 differ 여야 함
diff -rq "$PROD/functions" "$STG/functions"   # 차이 0
diff -rq "$PROD/migrations" "$STG/migrations"  # 차이 0
```
예상 밖 differ가 있으면 멈추고 원인 확인.

## 5. D1 재시드 (prod 스냅샷 → staging)

기존 스크립트 사용. prod cha-bio-db export → cha-bio-db-staging 전체 교체 + 0091 트리거 재적용. (drop_minwon 폐기 노선이라 스크립트 수정 불필요.)

```bash
cd "$STG"
bash scripts/db-reseed-from-prod.sh     # 'yes' 확인 프롬프트 있음
```
> minwon 테이블은 prod 스냅샷에 존재하므로 재시드 후 staging에도 생김(0행). 순수 미러라 정상.

## 6. 빌드 + 배포 (staging)

```bash
cd "$STG"
npm run build      # tsc + vite, 통과 확인
npx wrangler pages deploy dist \
  --project-name=cbc7119-data \
  --branch=main \
  --commit-dirty=true \
  --commit-message="reset staging to prod mirror (post quick-260725-wmo)"
```

## 7. 검증 (staging 도메인, 실제 UI)

- 상단 빨강 배너 **"🧪 데이터 스테이징 — 실제 운영 데이터 아님 (cbc7119-data)"** 노출.
- 로그인 → 대시보드 정상.
- **직원 관리 → 직원 추가 모달**: 스크롤이 모달 안에서 되고 뒤 페이지 안 밀림(= prod 반영본 상속 확인).
- 도면/점검/승강기 등 주요 화면 렌더(데이터는 prod 스냅샷).
- panel-monitor는 프레임 없음이 정상(staging R2에 에이전트 프레임 없음).

## 8. 커밋

```bash
cd "$STG"
git add -A
git commit -m "reset: staging mirrored to prod (cha-bio-safety) post quick-260725-wmo

- overlay src/functions/migrations/public from prod
- re-inject __STAGING__ banner (App.tsx, vite-env.d.ts)
- drop_minwon 폐기(순수 미러), migrations = prod 동일
- D1 reseed from prod snapshot"
```

## 롤백

문제 시: `git reset --hard <백업브랜치>` 로 코드 원복. D1은 재시드 전 상태로 자동 복구 안 되므로, 재시드 후 문제면 스냅샷(스크립트가 /tmp에 남김) 재검토. 코드만 원복하고 재시드는 유지해도 무방(데이터는 prod 미러라 안전).

---

## 완료 후 prod 콘솔에 알릴 것
- 리셋 완료 + staging 도메인 검증 OK 여부.
- 이후 staging 은 **개발선 금지·검증 미러 전용**. 새 데이터/스키마 검증만 여기서, 검증 후 prod 반영은 기존 핸드오프 절차([[feedback_production_sync_protocol]]).
