// ── Family A 공용 "점검 내용" 카드 + 헬퍼 (InspectionPage · DivInspectModal 공유) ──
// InspectionPage 인라인 정의에서 추출(260724-ikd). DivInspectModal(components/div/)이 이 카드를
// 쓰려면 공유 모듈이어야 함 — InspectionPage 에 두면 순환 import(InspectionPage↔DivInspectModal).
// 양쪽이 이 모듈을 import 한다.
import { useState } from 'react'
import type { ComponentType } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Wrench, HelpCircle, Check, ChevronDown, ChevronUp } from 'lucide-react'
import type { CheckResult } from '../../types'
import type { InspectionItem } from '../../data/inspectionContent'

// 아이콘 컴포넌트 공통 타입 — lucide-react (size: string | number) 와 custom icons.tsx 모두 호환.
export type IconComp = ComponentType<{ size?: number | string; className?: string }>

// 결과 아이콘 매핑 (§7.3)
export const RESULT_ICONS: Record<string, IconComp> = {
  normal:     CheckCircle2,
  caution:    AlertTriangle,
  bad:        XCircle,
  unresolved: Wrench,
  missing:    HelpCircle,
}

// 점검 결과 입력용 (정상/주의/불량만 — 미조치는 별도 조치 스텝에서 처리)
// `icon` 필드는 § 7.1 enforce (260527-gql) 로 제거됨 — Lucide RESULT_ICONS 매핑이 단일 진실 원천.
export const INSPECT_RESULT_OPTIONS: { value:CheckResult; label:string; color:string; bg:string }[] = [
  { value:'normal',  label:'정상', color:'var(--safe)',   bg:'rgba(34,197,94,.13)'  },
  { value:'caution', label:'주의', color:'var(--warn)',   bg:'rgba(245,158,11,.13)' },
  { value:'bad',     label:'불량', color:'var(--danger)', bg:'rgba(239,68,68,.13)'  },
]

// 명시적 결과(정상/주의/불량). 마크 없음 = 아직 결과 미입력(점검 미완료).
export type FaMark = CheckResult

// 마크에서 worst 스칼라 결과 계산 (bad>caution>normal)
export function faWorst(marks: Record<number, FaMark>): CheckResult {
  const vals = Object.values(marks)
  if (vals.includes('bad')) return 'bad'
  if (vals.includes('caution')) return 'caution'
  return 'normal'
}

// 마크 → line_results 배열. **위치(item.i)** 기준으로 채운다 — item.i 를 배열 인덱스로 써서
// 카드가 항목 일부만 노출해도 리포트 행 정합이 유지된다(예: 소방용전원공급반 카드 i6·i9 만 노출 →
// 자탐 sheet9 7·10행에 정확히 반영, 나머지 인덱스는 null → 엑셀 worstFor 가 checked?'○' 폴백으로 채움).
// 연속 항목(0..N-1) 카테고리는 순서=i 라 기존(items.map)과 완전히 동일.
export function faLineResults(items: InspectionItem[], marks: Record<number, FaMark>): (string | null)[] {
  if (items.length === 0) return []
  const size = Math.max(...items.map(it => it.i)) + 1
  const arr: (string | null)[] = new Array(size).fill(null)
  items.forEach(it => { arr[it.i] = marks[it.i] ?? 'normal' })
  return arr
}

// 마크 → auto 특이사항(주의/불량만 C/D 자동문구 '\n' join, normal 은 문구 없음, 번호·꺾쇠 없음)
export function faAutoMemo(items: InspectionItem[], marks: Record<number, FaMark>): string {
  return items
    .filter(it => marks[it.i] === 'caution' || marks[it.i] === 'bad')
    .map(it => (marks[it.i] === 'bad' ? it.bad : it.caution))
    .join('\n')
}

// 전 항목이 명시적 결과를 가졌는지 (저장 가능 조건)
export function faAllResolved(items: InspectionItem[], marks: Record<number, FaMark>): boolean {
  return items.length > 0 && items.every(it => marks[it.i] != null)
}

// ── Family A 공용 "점검 내용" 카드 ──────────────────────────────
// LOCKED UI: [좌 체크박스] · [텍스트 flex] · [우 결과아이콘], 헤더 접기/펼치기(localStorage 카테고리별 키).
// readonly(재방문 활성 창): 체크박스 숨김 + 저장된 line_results 아이콘만 조회.
export function FamilyACard({ category, items, marks, checked, readonly, allChecked, onSelectAll, onToggleCheck, autoItems }: {
  category:      string
  items:         InspectionItem[]
  marks:         Record<number, FaMark>
  checked:       Set<number>
  readonly:      boolean
  allChecked:    boolean
  onSelectAll:   () => void
  onToggleCheck: (i: number) => void
  autoItems?:    Record<number, string>   // i → 인라인 사유(자동판정 항목: 체크박스 잠금·선택 제외). 미전달 시 기존 9종 100% 동치.
}) {
  const storageKey = `jc-collapsed-${category}`
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(storageKey) === '1' } catch { return false }
  })
  const toggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev
      try { localStorage.setItem(storageKey, next ? '1' : '0') } catch { /* ignore */ }
      return next
    })
  }

  const title = category === '소방펌프' ? `점검 내용 (${items.length})` : '점검 내용'

  return (
    <div className="flex flex-col gap-1.5">
      {/* 타이틀 행 — 카드 바깥 좌상단(타이틀+전체선택) + 우측끝 접기/펼치기 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-caption font-semibold text-text-tertiary tracking-wider shrink-0">{title}</span>
          {!collapsed && !readonly && (
            <button
              type="button"
              onClick={onSelectAll}
              className="px-2 py-0.5 rounded-[5px] border border-border-strong text-caption font-semibold text-text-secondary cursor-pointer hover:bg-surface-active transition-colors shrink-0">
              {allChecked ? '선택 해제' : '전체 선택'}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={toggleCollapse}
          aria-expanded={!collapsed}
          className="flex items-center gap-1 text-caption font-bold text-accent cursor-pointer bg-transparent shrink-0">
          {collapsed ? '펼치기' : '접기'}
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      {/* 카드 — 테두리 안에는 항목 리스트만 */}
      {!collapsed && (
        <div className="rounded-lg border border-border-default bg-surface-raised overflow-hidden">
          {items.map((it, idx) => {
            const mark = marks[it.i]
            // 결과가 입력된 항목만 아이콘 표시(정상=초록/주의=△/불량=Ｘ). 미입력=아이콘 없음 = 점검 미완료.
            const displayResult: FaMark | null = mark ?? null
            const RIcon = displayResult ? RESULT_ICONS[displayResult] : null
            const iconCls = displayResult === 'caution' ? 'text-warning'
                          : displayResult === 'bad'     ? 'text-danger'
                          :                                'text-safe'
            const isChecked = checked.has(it.i)
            const isAuto      = !!autoItems && (it.i in autoItems)   // 자동/잠금 항목(DIV i1 압력상태 = detectDivTrend)
            const interactive = !readonly && !isAuto                 // 클릭·체크 가능(autoItems 미전달이면 !readonly 와 동치 → 9종 회귀 0)
            return (
              <div
                key={it.i}
                role={interactive ? 'checkbox' : undefined}
                aria-checked={interactive ? isChecked : undefined}
                tabIndex={interactive ? 0 : undefined}
                onClick={interactive ? () => onToggleCheck(it.i) : undefined}
                onKeyDown={interactive ? (e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggleCheck(it.i) } }) : undefined}
                className={`flex items-center gap-2.5 px-3 py-2.5 ${idx > 0 ? 'border-t border-border-default' : ''} transition-colors ${
                  interactive ? 'cursor-pointer hover:bg-surface-active' : ''
                }`}>
                {/* 좌 체크박스 (readonly·자동판정 항목이면 숨김) */}
                {interactive && (
                  <div
                    className={`w-5 h-5 shrink-0 rounded-[5px] border-[1.5px] flex items-center justify-center transition-colors ${
                      isChecked ? 'bg-accent border-accent' : 'bg-surface-page border-border-strong'
                    }`}>
                    <Check size={13} className={`text-text-on-accent transition-opacity ${isChecked ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                )}
                {/* 자동판정 항목(체크박스 없음)이 체크박스 있는 항목과 텍스트 좌측 정렬 유지 — 동폭 스페이서 */}
                {isAuto && !readonly && <div className="w-5 h-5 shrink-0" aria-hidden />}
                {/* 텍스트 */}
                <span className="flex-1 text-caption text-text-primary leading-snug">{it.text}</span>
                {/* 자동판정 항목(DIV i1): 결과아이콘 옆 인라인 사유 텍스트(체크박스·선택 없음) */}
                {isAuto && autoItems?.[it.i] && (
                  <span className="shrink-0 text-caption text-text-tertiary leading-snug">{autoItems[it.i]}</span>
                )}
                {/* 우 결과 아이콘 (미표시 시 빈 자리 유지) */}
                <span className={`shrink-0 w-[22px] h-[22px] flex items-center justify-center ${iconCls}`}>
                  {RIcon ? <RIcon size={19} /> : null}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
