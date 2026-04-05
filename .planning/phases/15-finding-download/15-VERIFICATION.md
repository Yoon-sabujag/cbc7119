---
phase: 15-finding-download
verified: 2026-04-06T03:00:00Z
status: human_needed
score: 7/7 must-haves verified
human_verification:
  - test: "관리자 계정으로 지적사항 상세 화면에서 다운로드 버튼 클릭 — HTML 보고서 새 탭 열림 확인"
    expected: "새 탭에 지적사항 메타데이터(항목, 위치, 상태, 등록일, 등록자)와 base64 사진이 포함된 HTML 보고서가 열린다. 인쇄 버튼이 표시된다."
    why_human: "window.open + document.write 동작과 실제 사진 로딩은 브라우저에서만 확인 가능"
  - test: "assistant 계정으로 두 화면에서 다운로드 버튼 미표시 확인"
    expected: "지적 상세 페이지 헤더 우측에 다운로드 아이콘 없음, 라운드 목록 admin 서브헤더 없음 (서브헤더 전체가 숨겨짐)"
    why_human: "역할 기반 조건부 렌더링은 실제 로그인 컨텍스트에서만 확인 가능"
  - test: "관리자 계정으로 라운드 목록에서 일괄 다운로드 클릭 — ZIP 수신 확인"
    expected: "진행 메시지(준비 중... → 수집 중 N/M → 압축 중...)가 버튼에 표시되고, ZIP이 새 탭/공유시트로 열린다. ZIP 내부에 finding-001_위치/내용.txt + 사진 파일이 있다."
    why_human: "fflate ZIP 생성, blob URL 생성, window.open 트리거는 실제 브라우저에서만 확인 가능"
  - test: "iOS PWA 홈 화면 모드에서 건별·일괄 다운로드 동작 확인"
    expected: "iOS Safari 공유시트가 표시된다. 앱 모드에서 팝업 차단 없이 동작한다."
    why_human: "iOS PWA window.open 팝업 허용 동작은 iOS 기기에서만 확인 가능 (Pitfall 1 준수 여부의 실제 동작)"
---

# Phase 15: Finding Download Verification Report

**Phase Goal:** 지적사항 내용과 사진을 건별 또는 일괄로 다운로드할 수 있다
**Verified:** 2026-04-06T03:00:00Z
**Status:** human_needed (automated checks all passed, 4 items need human confirmation)
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth                                                                                             | Status     | Evidence                                                                                                 |
|----|---------------------------------------------------------------------------------------------------|------------|----------------------------------------------------------------------------------------------------------|
| 1  | 관리자가 지적사항 상세 화면에서 다운로드 버튼을 클릭하면 HTML 보고서가 새 탭에 열린다             | ✓ VERIFIED | `handleDownload` → `openFindingReport(finding)` 완전히 구현. `window.open('', '_blank')` 동기 호출 후 base64 사진 fetch + HTML write 확인됨 |
| 2  | HTML 보고서에 메타데이터(항목, 위치, 상태, 날짜, 담당자)와 base64 인코딩된 사진이 포함된다       | ✓ VERIFIED | `buildReportHtml`이 항목/위치/상태/등록일/등록자 테이블 + resolved 시 조치일/조치자/조치내용 포함. `fetchAsBase64`로 사진 변환 |
| 3  | 비관리자(assistant)에게는 건별 다운로드 버튼이 표시되지 않는다                                    | ✓ VERIFIED | `LegalFindingDetailPage.tsx:144` — `{staff?.role === 'admin' && finding && (...)}` 조건부 렌더링 확인 |
| 4  | window.open()만 사용하고 `<a download>`는 사용하지 않는다 (iOS PWA 호환)                          | ✓ VERIFIED | phase 수정 파일 3개 모두 `<a download>` / `.download =` / `a.click()` 없음. findingDownload.ts:117은 주석만 |
| 5  | 관리자가 라운드 목록에서 일괄 다운로드 버튼을 클릭하면 전체 지적사항이 ZIP으로 다운로드된다     | ✓ VERIFIED | `handleZipDownload` → `fflate.zipSync` → `window.open(blobUrl, '_blank')` 완전히 구현 확인됨            |
| 6  | ZIP 내부 구조가 `finding-NNN_위치/내용.txt` + 사진 파일 형식이다                                  | ✓ VERIFIED | `folderName = finding-${idx}_${location}`, `files[\`${folderName}/내용.txt\`]`, `files[\`${folderName}/지적사진-N.jpg\`]` 확인 |
| 7  | 비관리자(assistant)에게는 일괄 다운로드 버튼이 표시되지 않는다                                   | ✓ VERIFIED | `LegalFindingsPage.tsx:552` — 일괄 다운로드 버튼이 `{role === 'admin' && round && (...)}` 블록 내에 위치 |

**Score:** 7/7 truths verified

---

## Required Artifacts

| Artifact                                                        | Expected                                    | Status     | Details                                              |
|-----------------------------------------------------------------|---------------------------------------------|------------|------------------------------------------------------|
| `cha-bio-safety/src/utils/findingDownload.ts`                   | fetchAsBase64, buildReportHtml, openFindingReport, buildMetaTxt 4개 export | ✓ VERIFIED | 189줄, 4함수 모두 fully implemented |
| `cha-bio-safety/src/pages/LegalFindingDetailPage.tsx`           | admin 전용 다운로드 버튼 (헤더 우측)        | ✓ VERIFIED | `useAuthStore` + `openFindingReport` import, 버튼 구현됨 |
| `cha-bio-safety/src/pages/LegalFindingsPage.tsx`                | admin 서브헤더에 일괄 다운로드 버튼          | ✓ VERIFIED | `buildMetaTxt` import, `handleZipDownload` + 버튼 구현됨 |

---

## Key Link Verification

| From                            | To                                        | Via                              | Status     | Details                                                        |
|---------------------------------|-------------------------------------------|----------------------------------|------------|----------------------------------------------------------------|
| LegalFindingDetailPage.tsx      | findingDownload.ts                        | `import { openFindingReport }`   | ✓ WIRED    | line 9 import + line 91 call `await openFindingReport(finding)` |
| findingDownload.ts              | `/api/uploads/{key}`                      | `fetch('/api/uploads/' + k)`     | ✓ WIRED    | line 132-133 allPhotoKeys 수집 + Promise.allSettled fetch      |
| LegalFindingsPage.tsx           | fflate                                    | `import('fflate')` dynamic       | ✓ WIRED    | line 454 dynamic import, `zipSync(files, { level: 6 })`        |
| LegalFindingsPage.tsx           | findingDownload.ts                        | `import { buildMetaTxt }`        | ✓ WIRED    | line 8 import + line 465 `buildMetaTxt(f)` call               |
| LegalFindingsPage.tsx           | `/api/uploads/{key}`                      | `fetch('/api/uploads/' + k)`     | ✓ WIRED    | lines 469, 479 `Promise.allSettled` photo + resolution fetches |

---

## Data-Flow Trace (Level 4)

| Artifact                          | Data Variable        | Source                                          | Produces Real Data | Status     |
|-----------------------------------|----------------------|-------------------------------------------------|--------------------|------------|
| `openFindingReport` (in util)     | `finding.photoKeys`  | Caller passes `LegalFinding` from React Query   | Yes — D1 query via `legalApi.getFinding` | ✓ FLOWING |
| `handleZipDownload` (in Page)     | `findings`           | React Query `legalApi.getFindings(id!)` line 377 | Yes — D1 DB query  | ✓ FLOWING |

---

## Behavioral Spot-Checks

| Behavior                                   | Command                                                                                                                  | Result                | Status  |
|--------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|-----------------------|---------|
| findingDownload.ts exports 4 functions     | `grep -c "^export" src/utils/findingDownload.ts`                                                                        | 4                     | ✓ PASS  |
| window.open called before await in openFindingReport | `grep -n "window.open\|await" src/utils/findingDownload.ts` — open at line 121, first await at line 137    | open before await     | ✓ PASS  |
| No `<a download>` in phase files           | grep across 3 files                                                                                                      | 0 matches (comment only) | ✓ PASS |
| TypeScript compilation                     | `node_modules/.bin/tsc --noEmit`                                                                                        | 0 errors              | ✓ PASS  |
| Commits documented in SUMMARYs exist       | `git log --oneline \| grep 201eaa3\|2349a70\|1018aa2`                                                                   | All 3 found           | ✓ PASS  |
| Admin role guard on bulk download button   | `grep "role === 'admin'" LegalFindingsPage.tsx` at line 552, ZIP button inside block                                    | Confirmed             | ✓ PASS  |

---

## Requirements Coverage

| Requirement | Source Plan | Description                                                    | Status      | Evidence                                                  |
|-------------|-------------|----------------------------------------------------------------|-------------|-----------------------------------------------------------|
| DL-01       | 15-01       | 지적사항 1건의 내용+사진을 건별로 다운로드할 수 있다           | ✓ SATISFIED | `openFindingReport` in findingDownload.ts + button in LegalFindingDetailPage header |
| DL-02       | 15-02       | 라운드 전체 지적사항을 일괄 ZIP으로 다운로드할 수 있다         | ✓ SATISFIED | `handleZipDownload` with fflate.zipSync in LegalFindingsPage |
| DL-03       | 15-01,15-02 | iOS PWA에서 window.open + 공유시트 방식으로 다운로드를 지원한다 | ? NEEDS HUMAN | Code uses `window.open('', '_blank')` synchronously before async (Pitfall 1 compliance) — iOS PWA 실제 동작은 기기에서만 확인 가능 |

No orphaned requirements. All 3 Phase 15 DL-* IDs were claimed in plans and implemented.

---

## Anti-Patterns Found

| File                              | Line | Pattern                              | Severity  | Impact                                              |
|-----------------------------------|------|--------------------------------------|-----------|-----------------------------------------------------|
| LegalFindingDetailPage.tsx        | 220  | `placeholder="조치 내용을 입력하세요"` | ℹ️ Info   | HTML form placeholder attribute — not a code stub  |
| LegalFindingsPage.tsx             | 232,266,280 | `placeholder=...`              | ℹ️ Info   | HTML form placeholder attributes — not code stubs  |

No blocker or warning anti-patterns found. All `placeholder` matches are legitimate HTML input attributes. No `return null`, `return {}`, `return []`, or empty handler stubs exist in the phase-modified files.

---

## Human Verification Required

### 1. 건별 다운로드 — HTML 보고서 새 탭 열림

**Test:** 관리자 계정으로 로그인 → 법적점검 → 라운드 선택 → 지적사항 1건 탭 → 헤더 우측 다운로드 아이콘(↓) 클릭
**Expected:** 새 탭에 HTML 보고서가 열린다. 보고서에 항목·위치·상태·등록일·등록자가 표 형태로 표시되고, 사진(photoKeys)이 이미지로 렌더링된다. 인쇄 버튼이 있고 클릭 시 인쇄 다이얼로그가 열린다.
**Why human:** window.open + document.write 패턴과 base64 이미지 로딩은 브라우저에서만 확인 가능

### 2. 비관리자 버튼 미표시

**Test:** assistant 계정으로 로그인 → 동일 화면들 확인
**Expected:** 지적 상세 헤더 우측에 다운로드 아이콘 없음. 라운드 목록 어드민 서브헤더 전체가 보이지 않음 (결과 선택/저장 버튼, 보고서, 일괄 다운로드 모두 숨겨짐).
**Why human:** 역할 기반 조건부 렌더링은 실제 로그인 세션에서 확인 필요

### 3. 일괄 ZIP 다운로드

**Test:** 관리자 계정 → 라운드 목록 → 어드민 서브헤더 '일괄 다운로드' 버튼 클릭
**Expected:** 버튼 텍스트가 '준비 중... → 수집 중... (N/M) → 압축 중...' 순서로 변경된다. ZIP이 새 탭 또는 공유시트로 열린다. ZIP 내부에 `finding-001_위치명/내용.txt` 구조와 사진 파일이 있다.
**Why human:** fflate ZIP 생성과 blob URL 오픈은 브라우저 환경에서만 확인 가능

### 4. iOS PWA 공유시트 (DL-03)

**Test:** iOS 기기에서 PWA를 홈 화면에 추가한 후 앱 모드로 실행 → 건별/일괄 다운로드 시도
**Expected:** 팝업 차단 없이 공유시트가 표시된다. `openFindingReport`는 클릭 이벤트 핸들러에서 `window.open`을 동기적으로 호출하므로 iOS 팝업 차단을 우회해야 한다.
**Why human:** iOS PWA window.open 동작은 iOS 기기에서만 검증 가능 (시뮬레이터 불충분)

---

## Gaps Summary

없음. 모든 7개 truth가 코드 수준에서 verified되었다. Human verification 4개 항목은 동작 정확성 확인이며, 코드 누락·stub·unwired 이슈는 발견되지 않았다. DL-03 (iOS PWA)는 코드 패턴 준수(동기 window.open, no `<a download>`)가 확인됐으나 실제 iOS 기기 동작은 사람이 확인해야 한다.

---

_Verified: 2026-04-06T03:00:00Z_
_Verifier: Claude (gsd-verifier)_
