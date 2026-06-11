---
phase: quick-260612-6bv
plan: "01"
subsystem: frontend
tags: [settings-panel, r2, auto-backup, download]
key-files:
  modified:
    - cha-bio-safety/src/components/SettingsPanel.tsx
decisions:
  - "펼칠 때마다 재fetch — admin 수동 조작 + 4인 도구라 캐싱 불필요"
  - "autoBackupDownloading: string|null 으로 중복탭 방지 (boolean 대신 key 저장)"
metrics:
  duration: "~10min"
  completed: "2026-06-12"
  tasks: 2
  files: 1
---

# Quick 260612-6bv Plan 01: SettingsPanel 자동백업 다운로드 인라인 펼침 Row Summary

**One-liner:** admin SettingsPanel 데이터베이스 섹션에 cron-worker 자동백업(backups/db/*.sql) 인라인 펼침 Row + 항목별 blob 다운로드 추가 — 백엔드 무수정, 단일 프런트 파일 변경.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | 자동백업 state + fetch/필터/다운로드 핸들러 추가 | bec76b4 | SettingsPanel.tsx |
| 2 | 자동백업 인라인 펼침 Row 마크업 삽입 | bec76b4 | SettingsPanel.tsx |

## What Was Built

- **lucide Download** import 추가 (`lucide-react` 기존 패키지, 신규 설치 없음)
- **state 4개:** `autoBackupOpen` / `autoBackupLoading` / `autoBackupList` / `autoBackupDownloading`
- **`fetchAutoBackups`:** GET `/api/database/r2-list` → `keys[]` 중 `backups/db/*.sql` 필터 → date 내림차순 정렬
- **`toggleAutoBackup`:** 펼칠 때마다 fetchAutoBackups 호출
- **`downloadAutoBackup`:** `r2-download?key=` blob 다운로드, `cha-bio-safety_{date}.sql` 파일명, 중복탭 방지
- **마크업 삽입 위치:** DB 버튼 `</div>` 바로 뒤, "파일 (점검 사진 등)" caption 앞
- **상태 표시:** 로딩/빈결과/리스트, Download/Loader2 아이콘

## Verify Gate Results

| Gate | Result |
|------|--------|
| grep "자동백업" SettingsPanel.tsx | PASS |
| grep "backups/db/" SettingsPanel.tsx | PASS |
| git diff --name-only = single file | PASS |
| git diff functions/api/database/ \| wc -l = 0 | PASS |
| check-emoji.cjs | PASS (EMOJI-0) |
| tsc --noEmit | PASS (exit 0, 0 errors) |
| npm run build | PASS (precache 84 entries) |

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None — r2-list / r2-download 엔드포인트 모두 실재하며 UI가 실제 API에 연결됨.

## Threat Flags

None — 신규 네트워크 엔드포인트 추가 없음. r2-list/r2-download 호출은 이미 handleR2Backup 에서 사용 중.

## Self-Check: PASSED

- [x] cha-bio-safety/src/components/SettingsPanel.tsx modified (1 file)
- [x] Commit bec76b4 exists
- [x] SUMMARY.md created (untracked)
- [x] node_modules symlink removed before commit
- [x] Build PASS, precache 84 entries
