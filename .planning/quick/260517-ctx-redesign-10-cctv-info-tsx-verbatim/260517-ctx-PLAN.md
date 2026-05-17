---
phase: quick
plan: 01
type: execute
wave: 1
quick_id: 260517-ctx
depends_on: [260517-upw]
files_modified:
  - cha-bio-safety/src/pages/CctvInfoPage.tsx
autonomous: true
requirements:
  - QUICK-260517-ctx
must_haves:
  truths:
    - "CctvInfoPage.tsx 의 모든 inline style 색/사이즈/radius 토큰이 v0.1.1 토큰 단일 source 로 변경됨"
    - "옛 alias (var(--bg)/--bg2/--bd/--t1/--t2/--t3/--safe) raw hex (#a16207, #1d4ed8) raw rgba (rgba(34,197,94,*), rgba(234,179,8,*)) 모두 0건"
    - "비즈니스 로직 (CCTV_DVRS / useIsDesktop / totalCap 계산 / isEstimate / isReplaced) 0 변경"
    - "TypeScript build PASS (npm run build 또는 tsc --noEmit 동급)"
    - "sketch 9 verify gate 와 동일한 토큰 사용 (status-safe-bg/bar/safe, status-info-bg/bar/info, text-primary/secondary/tertiary, surface-page/raised, border-default, radius-sm/md/pill)"
---

<objective>
sketch (260517-upw) 의 CSS 토큰을 CctvInfoPage.tsx 의 inline style 에 verbatim 매핑한다.
시각 디자인만 변경, 비즈니스 로직 0 변경.
</objective>

<context>

# 입력 (verbatim 인용 원천)

- sketch: `cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html`
- 현재 페이지: `cha-bio-safety/src/pages/CctvInfoPage.tsx` (69 lines)

# Verbatim 매핑 테이블 (현재 → 변경)

## 페이지 wrapper (line 8-13)
| 현재 | 변경 |
|---|---|
| `background: 'var(--bg)'` | `background: 'var(--surface-page)'` |
| 나머지 (flex/overflow/padding) | 그대로 |

## 카드 wrapper (line 25)
| 현재 | 변경 |
|---|---|
| `background: 'var(--bg2)'` | `background: 'var(--surface-raised)'` |
| `borderRadius: 10` | `borderRadius: 'var(--radius-md)'` (12px) |
| `padding: '10px 12px'` | `padding: 12` (sketch 모바일/데스크톱 동일 12px) |
| `border: '1px solid var(--bd)'` | `border: '1px solid var(--border-default)'` |

## 카드 헤더 row (line 26)
| 현재 | 변경 |
|---|---|
| `marginBottom: 6` | `marginBottom: 8` (sketch) |

## 카드 라벨 (line 27)
| 현재 | 변경 |
|---|---|
| `fontSize: 14` | `fontSize: 13` (sketch — text-label) |
| `color: 'var(--t1)'` | `color: 'var(--text-primary)'` |

## 채널 텍스트 (line 28)
| 현재 | 변경 |
|---|---|
| `fontSize: 10` | `fontSize: 12` (sketch — 마지노선) |
| `color: 'var(--t3)'` | `color: 'var(--text-tertiary)'` |
| (line-height 없음) | `lineHeight: 1` 추가 (feedback_text_caption_leading_none) |

## 보존기간 배지 (line 30-35)
| 현재 | 변경 |
|---|---|
| `fontSize: 11` | `fontSize: 12` |
| `fontWeight: 700` | 그대로 |
| `padding: '2px 7px'` | `padding: '2px 8px'` |
| `borderRadius: 5` | `borderRadius: 'var(--radius-pill)'` |
| display 없음 | `display: 'inline-flex'`, `alignItems: 'center'`, `gap: 4`, `lineHeight: 1` 추가 |
| (isEstimate) bg `'rgba(234,179,8,.12)'` | `'var(--status-info-bg)'` |
| (isEstimate) color `'#a16207'` | `'var(--status-info)'` |
| (isEstimate) border `'rgba(234,179,8,.3)'` | `'var(--status-info-bar)'` |
| (else) bg `'rgba(34,197,94,.1)'` | `'var(--status-safe-bg)'` |
| (else) color `'var(--safe)'` | `'var(--status-safe)'` |
| (else) border `'rgba(34,197,94,.25)'` | `'var(--status-safe-bar)'` |
| (텍스트만) `{dvr.retention}` | `<span style={{display:'inline-block',width:6,height:6,borderRadius:99,background:'currentColor'}}/>{dvr.retention}` (dot 추가) |

## 녹화구역 row (line 37-39)
| 현재 | 변경 |
|---|---|
| `fontSize: 11` | `fontSize: 12` |
| `color: 'var(--t2)'` | `color: 'var(--text-secondary)'` |
| (prefix) `color: 'var(--t3)'` | `color: 'var(--text-tertiary)'` |
| `marginBottom: 8` | 그대로 |

## 포트 표 wrapper (line 40-44)
| 현재 | 변경 |
|---|---|
| `fontSize: 11` (wrapper 상속) | wrapper 에서 제거, 각 셀이 명시 (sketch 패턴) |
| `background: 'var(--bg)'` | `background: 'var(--surface-page)'` |
| `borderRadius: 7` | `borderRadius: 'var(--radius-sm)'` (8px) |
| `padding: '7px 10px'` | `padding: '8px 10px'` |
| `border: '1px solid var(--bd)'` | `border: '1px solid var(--border-default)'` |
| grid + gap | 그대로 |

## 포트 표 헤더 셀 (line 45-47)
| 현재 | 변경 |
|---|---|
| `color: 'var(--t3)'` | `color: 'var(--text-tertiary)'` |
| `fontWeight: 600` | 그대로 |
| (fontSize 상속 11) | `fontSize: 12` 명시 |

## 포트 표 본문 셀 (line 51-53)
| 현재 | 변경 |
|---|---|
| (#) `color: 'var(--t1)', fontWeight: 700` | `color: 'var(--text-primary)', fontWeight: 700, fontSize: 12` |
| (cap) `color: 'var(--t1)'` | `color: 'var(--text-primary)', fontSize: 12` |
| (replaced isReplaced) `color: '#1d4ed8', fontWeight: 700` | `color: 'var(--status-info)', fontWeight: 700, fontSize: 12` |
| (replaced else) `color: 'var(--t2)', fontWeight: 400` | `color: 'var(--text-tertiary)', fontWeight: 400, fontSize: 12` (sketch: keep = tertiary) |

> 주의: sketch 의 "기존" 셀은 `--text-tertiary` (현재 페이지는 `--t2` = secondary). sketch 가 source-of-truth → tertiary 로.

## 카드 푸터 (line 57)
| 현재 | 변경 |
|---|---|
| `fontSize: 10` | `fontSize: 12` |
| `color: 'var(--t3)'` | `color: 'var(--text-tertiary)'` |
| `marginTop: 6` | 그대로 |
| (없음) | `lineHeight: 1` 추가 |

## 페이지 출처 푸터 (line 64)
| 현재 | 변경 |
|---|---|
| `fontSize: 10` | `fontSize: 12` |
| `color: 'var(--t3)'` | `color: 'var(--text-tertiary)'` |
| `padding: '14px 0 8px'` | `padding: '12px 0 0 0'` (sketch) |
| (없음) | `lineHeight: 1` 추가 |

# 비즈니스 로직 (0 변경 — 그대로 유지)

- `useIsDesktop()` 호출 + 모바일/데스크톱 grid/padding 분기
- `CCTV_DVRS.map(dvr => ...)` 13개 카드
- `dvr.ports.reduce((s, p) => s + (p.cap.endsWith('TB') ? parseFloat(p.cap) : 0), 0)` 합계
- `dvr.retention.includes('추정')` 추정 분기
- `p.replaced !== '기존'` 교체일자 분기
- `CCTV_INFO_UPDATED` 페이지 출처 날짜

</context>

<tasks>

<task type="auto">
  <name>Task 1: CctvInfoPage.tsx 변환</name>
  <files>cha-bio-safety/src/pages/CctvInfoPage.tsx</files>
  <action>
1. 위 verbatim 매핑 테이블 그대로 inline style 변경.
2. 비즈니스 로직 (useIsDesktop / map / reduce / includes / !== '기존') 0 변경.
3. import 라인 그대로.
4. 보존기간 배지에 dot span 추가 (display:inline-block, width:6, height:6, borderRadius:99, background:currentColor).
5. 포트 표 본문 셀에 fontSize: 12 명시 (wrapper fontSize 제거).
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/cbc7119-design && npx --prefix cha-bio-safety tsc --noEmit -p cha-bio-safety/tsconfig.json 2>&1 | tail -5</automated>
  </verify>
  <done>TypeScript build/check PASS. 옛 alias / raw hex / raw rgba 모두 0건 (Task 2 grep gate 로 강제).</done>
</task>

<task type="auto">
  <name>Task 2: 변환 후 grep gate</name>
  <files>cha-bio-safety/src/pages/CctvInfoPage.tsx</files>
  <action>
다음 gate 모두 통과해야 함:

1. 옛 alias 0건:
   ```
   grep -E "var\(--(bg2?|bd2?|t1|t2|t3|safe|warn|danger)\)" cha-bio-safety/src/pages/CctvInfoPage.tsx
   ```
   → empty

2. raw hex 0건:
   ```
   grep -E "#[0-9a-fA-F]{3,6}" cha-bio-safety/src/pages/CctvInfoPage.tsx
   ```
   → empty

3. raw rgba 0건:
   ```
   grep -E "rgba\(" cha-bio-safety/src/pages/CctvInfoPage.tsx
   ```
   → empty

4. fontSize 10/11 0건 (마지노선 12):
   ```
   grep -E "fontSize: (10|11)\b" cha-bio-safety/src/pages/CctvInfoPage.tsx
   ```
   → empty

5. v0.1.1 토큰 등장 확인:
   ```
   grep -c "var(--status-safe)" cha-bio-safety/src/pages/CctvInfoPage.tsx  # ≥1
   grep -c "var(--status-info)" cha-bio-safety/src/pages/CctvInfoPage.tsx  # ≥1
   grep -c "var(--surface-raised)" cha-bio-safety/src/pages/CctvInfoPage.tsx  # ≥1
   grep -c "var(--text-primary)" cha-bio-safety/src/pages/CctvInfoPage.tsx  # ≥1
   ```
   → 모두 ≥1
  </action>
  <verify>
    <automated>F=cha-bio-safety/src/pages/CctvInfoPage.tsx && [ -z "$(grep -E 'var\(--(bg2?|bd2?|t1|t2|t3|safe|warn|danger)\)' $F)" ] && [ -z "$(grep -E '#[0-9a-fA-F]{3,6}' $F)" ] && [ -z "$(grep -E 'rgba\(' $F)" ] && [ -z "$(grep -E 'fontSize: (10|11)\b' $F)" ] && [ $(grep -c 'var(--status-safe)' $F) -ge 1 ] && [ $(grep -c 'var(--status-info)' $F) -ge 1 ]</automated>
  </verify>
  <done>5 grep gate 모두 PASS.</done>
</task>

</tasks>

<verification>
- [ ] CctvInfoPage.tsx 의 모든 inline style 토큰이 v0.1.1 단일 source
- [ ] 옛 alias / raw hex / raw rgba / fontSize 9-11 0건
- [ ] sketch 와 동일한 토큰 매핑 (safe/info/surface/text/border/radius)
- [ ] 비즈니스 로직 (useIsDesktop / map / reduce / includes / !== '기존') 0 변경
- [ ] TypeScript build PASS
</verification>

<success_criteria>
- 단일 파일 변환 완료 (69 → ~80 lines 예상)
- 5 grep gate PASS
- sketch 시각과 일치 (브라우저 확인은 사용자 단계)
</success_criteria>

<output>
완료 후 `.planning/quick/260517-ctx-redesign-10-cctv-info-tsx-verbatim/260517-ctx-SUMMARY.md` 작성.
변환 라인 수, gate 결과, 다음 단계 (main 머지 대기) 기록.
</output>
