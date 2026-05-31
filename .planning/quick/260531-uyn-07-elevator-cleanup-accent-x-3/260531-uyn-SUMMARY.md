---
quick_id: 260531-uyn
slug: 07-elevator-cleanup-accent-x-3
date: 2026-05-31
status: complete
commit: f96534e
---

# Quick Task 260531-uyn — SUMMARY

07-elevator(옵션 B 완결, 2026-05-16) 시점에 남겨둔 잔존 cleanup 종결.
파일: `cha-bio-safety/src/pages/ElevatorPage.tsx`. 메모리 item 3은 이미 수정된 history(5721ee5+33cb883)라 제외.

## What changed (4 edits, 1 file)

| # | 위치 | Before → After |
|---|------|----------------|
| 1 | 데스크톱 헤더 "수리 기록" 버튼 | `background: linear-gradient(135deg,#854d0e,#eab308)` (yellow) → `linear-gradient(135deg, var(--accent-active), var(--accent))` (accent, 모바일 FAB 와 통일) |
| 2 | 검사성적서 모달 close | `text-[20px]">✕` → `<X size={20} />` (bg-none→bg-transparent + flex center p-1) |
| 3 | 이미지뷰어 close (흰색) | `text-white text-[24px]">✕` → `<X size={22} />` (text-white 유지) |
| 4 | 고장 목록 삭제 버튼 (handleDelete) | `text-caption">✕` → `<X size={14} />` (p-0 유지) |

고장 접수 버튼 red gradient(`#991b1b,#ef4444`)는 무변경. `X` 는 기존 import + 사용 중(1910/2351/2685).

## Verify
- `grep -c "✕"` → **0**
- `grep "linear-gradient(135deg,#854d0e"` → 0 (yellow 제거)
- 고장 접수 red `#991b1b,#ef4444` → 4건 잔존(무변경)
- 수리버튼 accent gradient → 2건(데스크톱 헤더 + 모바일 FAB)
- `npx tsc --noEmit` → exit 0

---

## 직원 콘솔 (20260328 워크트리) 이관용 sync 노트

**대상 파일 (운영 repo 동일 경로):** `src/pages/ElevatorPage.tsx`

> ⚠ 라인 번호는 디자인 트랙 기준(3491 lines). 운영 repo 와 drift 가능 → **문자열 매칭으로 적용**할 것.

**적용할 diff (4곳):**

1. 데스크톱 헤더 수리 버튼 색
```diff
-            style={{ background: 'linear-gradient(135deg,#854d0e,#eab308)' }}
+            style={{ background: 'linear-gradient(135deg, var(--accent-active), var(--accent))' }}
```
⚠ 바로 위 고장 접수 버튼 `linear-gradient(135deg,#991b1b,#ef4444)` 는 절대 건드리지 말 것.

2. 검사성적서 close
```diff
-            <button onClick={onClose} className="bg-none border-0 text-text-tertiary cursor-pointer text-[20px]">✕</button>
+            <button onClick={onClose} className="bg-transparent border-0 text-text-tertiary cursor-pointer flex items-center justify-center p-1"><X size={20} /></button>
```

3. 이미지뷰어 close (흰색)
```diff
-        <button onClick={onClose} className="bg-none border-0 text-white text-[24px] cursor-pointer">✕</button>
+        <button onClick={onClose} className="bg-transparent border-0 text-white cursor-pointer flex items-center justify-center p-1"><X size={22} /></button>
```

4. 고장 목록 삭제 버튼
```diff
-            <button onClick={() => handleDelete(f.id)} className="bg-none border-0 text-text-tertiary text-caption cursor-pointer p-0">✕</button>
+            <button onClick={() => handleDelete(f.id)} className="bg-transparent border-0 text-text-tertiary cursor-pointer flex items-center justify-center p-0"><X size={14} /></button>
```

**전제:** `X` 가 lucide-react import 에 포함되어야 함(운영 repo 도 이미 사용 중이면 OK). 누락 시 import 에 추가.

**검증:** `git grep "✕" src/pages/ElevatorPage.tsx` → 0건. `git grep "#854d0e"` → 0건. tsc 통과.

**적용 방식:** 디자인 트랙 커밋 `f96534e` cherry-pick = 동일(분리 repo면 위 4 diff 수동, 문자열 매칭).
