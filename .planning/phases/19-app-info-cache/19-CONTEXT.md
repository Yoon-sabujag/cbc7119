# Phase 19: App Info & Cache - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

<domain>
## Phase Boundary

설정 페이지에 앱 빌드 버전을 확인할 수 있는 표시와, 서비스워커 캐시를 수동으로 초기화하는 버튼을 추가한다. iOS PWA에서 최신 리소스가 반영되지 않을 때 사용자가 직접 캐시를 비우고 앱을 새로고침할 수 있는 출구를 제공한다. 버전 정보 수집 방식(vite define 주입)과 캐시 초기화 범위(Cache Storage 전체 + SW update)는 이 phase에서 고정한다.

</domain>

<decisions>
## Implementation Decisions

### Version Source
- **D-01:** 버전 문자열은 `package.json` `version` 필드 + 빌드 타임스탬프 조합으로 구성한다. 예: `v0.2.0 (2026-04-08 12:34)`
- **D-02:** Vite `define` 옵션으로 `__APP_VERSION__`, `__BUILD_TIME__` 두 상수를 빌드 타임에 주입한다. 런타임 fetch나 meta 태그는 사용하지 않음 — 빌드에 박아넣어 fallback/네트워크 의존 없이 즉시 표시.
- **D-03:** 빌드 타임은 ISO 대신 한국 시간 `YYYY-MM-DD HH:mm` 포맷으로 주입한다 (사용자가 한눈에 읽을 수 있도록). `date-fns-tz`의 `formatInTimeZone`을 vite 설정에서 호출한다.
- **D-04:** `src/vite-env.d.ts`에 `declare const __APP_VERSION__: string; declare const __BUILD_TIME__: string;` 선언 추가.

### Placement
- **D-05:** SettingsPanel에 새로운 "앱 정보" 섹션을 신설한다 (계정 섹션 아래, 로그아웃 버튼 위).
- **D-06:** 섹션 헤더는 Phase 18에서 만든 `SectionHeader` + `usePersistedCollapse` 헬퍼를 재사용하여 chevron 접힘/펼침 지원. 기본값은 **접힘**, localStorage key `settings.appinfo.collapsed`.
- **D-07:** SettingsPanel 맨 아래의 기존 하드코딩 블록(`차바이오컴플렉스 방재 v1.0.0` + 주소)은 **제거**하고, 주소 줄은 앱 정보 섹션 안에 정적 Row로 이동한다 (`차바이오컴플렉스 방재 · 경기도 성남시 분당구 판교로 335`).
- **D-08:** 앱 정보 섹션 내용: (1) 버전 Row — label "버전", sub `v{버전} ({빌드일시})`, (2) 캐시 초기화 Row — label "캐시 초기화", sub "최신 리소스로 새로고침", 우측 "초기화" 버튼 또는 chevron, (3) 주소/제품명 정적 Row.

### Cache Clear Scope
- **D-09:** 캐시 초기화는 **전체 Cache Storage 삭제 + SW update**를 수행한다. SW unregister는 하지 않음 (4인 내부 팀이므로 완전 재설치 수준까지는 불필요).
- **D-10:** 실행 순서: (1) `caches.keys()` → `caches.delete(name)` 모든 캐시 병렬 삭제, (2) `navigator.serviceWorker.getRegistration()` → `registration.update()`로 새 SW 체크, (3) `window.location.reload()` 하드 리로드.
- **D-11:** 로딩 상태: 버튼에 "초기화 중…" 표시, 완료 직후 리로드되므로 별도 성공 토스트는 생략.
- **D-12:** 에러 처리: `caches` API 미지원 브라우저(iOS 16.3.1 이전 PWA 등)는 `if (!('caches' in window))` 체크로 toast.error("이 브라우저는 캐시 초기화를 지원하지 않습니다") 표시 후 중단. 정상 경로에서 실패 시에도 toast.error로 사용자에게 알림.

### Post-Clear Behavior
- **D-13:** 초기화 성공 후 **자동 하드 리로드** (`window.location.reload()`). 토스트/확인 모달/별도 새로고침 버튼 모두 불필요.
- **D-14:** 확인 모달/인라인 확인 없이 버튼 탭 즉시 실행. 4인 팀 내부 도구이므로 실수 비용이 낮고, 잘못 눌러도 재로그인만 하면 되므로 마찰을 최소화.

### Claude's Discretion
- 캐시 초기화 Row 우측 요소가 "초기화" 텍스트 버튼인지 chevron인지 (Row onClick 기존 패턴과 일관성 맞춰 선택)
- 버튼의 danger 스타일 적용 여부 (일관성 판단에 맡김)
- 빌드 타임 포맷 상세 (KST 기준이면 세부 표기 자유)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project / requirements
- `.planning/REQUIREMENTS.md` §메뉴 편집/앱 정보 — APP-01, APP-02 정의
- `.planning/ROADMAP.md` §"Phase 19: App Info & Cache" — goal + success criteria

### Existing integration points
- `cha-bio-safety/src/components/SettingsPanel.tsx` — 통합 지점 (앱 정보 섹션 추가 + 하단 v1.0.0 블록 교체). Phase 18에서 `SectionHeader`/`usePersistedCollapse` 헬퍼가 파일 상단에 이미 존재함 — 재사용.
- `cha-bio-safety/vite.config.ts` — `define` 옵션 추가 위치
- `cha-bio-safety/src/sw.ts` — SW 구현(Workbox). 참고용, 수정 없음.
- `cha-bio-safety/src/vite-env.d.ts` — 글로벌 const 타입 선언 추가

**No external specs — requirements fully captured in decisions above.**

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **SectionHeader** (SettingsPanel.tsx, Phase 18): chevron + localStorage 접힘/펼침 헬퍼. 앱 정보 섹션에 그대로 사용.
- **usePersistedCollapse** (SettingsPanel.tsx): 섹션별 localStorage 상태 훅. key만 `settings.appinfo.collapsed`로 지정.
- **Row / Toggle** 프리미티브 (SettingsPanel.tsx): label/sub/우측 요소/onClick 패턴 — 버전 표시와 캐시 초기화 Row 모두 이 프리미티브 재사용.
- **toast** (react-hot-toast): 에러 메시지용.

### Established Patterns
- Inline styles + CSS variables (`var(--bg)`, `var(--t1)`, `var(--t3)`, `var(--acl)`, `var(--danger)`) — 하드코딩 색상 금지
- Section heading: `fontSize: 9, fontWeight: 700, color: var(--t3), letterSpacing: .08em, textTransform: uppercase`
- Row onClick 패턴 (계정 §비밀번호 변경): 우측 chevron svg + 전체 Row 클릭

### Integration Points
- SettingsPanel.tsx `{/* 계정 */}` 블록 바로 아래, `{/* 로그아웃 */}` 바로 위에 새 `{/* 앱 정보 */}` 섹션 삽입
- SettingsPanel.tsx 맨 아래 `{/* 앱 정보 */}` 하드코딩 블록(`차바이오컴플렉스 방재 v1.0.0 + 주소`) 제거 → 새 섹션으로 이전
- vite.config.ts `defineConfig()` 객체에 `define: { __APP_VERSION__: JSON.stringify(...), __BUILD_TIME__: JSON.stringify(...) }` 추가

</code_context>

<specifics>
## Specific Ideas

- iOS PWA에서 서비스워커 캐시가 stuck되는 경우가 반복적으로 발생해 사용자가 직접 탈출 경로를 원함 — 따라서 1탭으로 완전 초기화 + 리로드가 우선순위
- 버전 정보는 배포 추적보다는 "지금 보고 있는 앱이 언제 빌드된 건가"를 확인하는 용도이므로 커밋 SHA보다 빌드 타임스탬프가 더 직관적

</specifics>

<deferred>
## Deferred Ideas

- Git 커밋 SHA 표시 (향후 배포 추적 필요 시 백로그)
- SW unregister 및 IndexedDB/localStorage 포함 완전 재설치 옵션 (필요성 확인 후 추가)
- 자동 업데이트 감지 + "새 버전이 있습니다" 배너 (Phase 17 푸시 알림과 별개의 독립 phase가 될 수 있음)

</deferred>

---

*Phase: 19-app-info-cache*
*Context gathered: 2026-04-08*
