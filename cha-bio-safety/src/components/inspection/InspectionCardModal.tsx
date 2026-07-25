// ── 도면점검 공용 카드 모달 (소화전 / 완강기 + paired 비상콘센트) ──────────────
// DivInspectModal(lockToPoint) 미러. FloorPlanPage indoor_hydrant/descending_lifeline 마커 진입용.
// 일반점검(InspectionPage) 과 동일 데이터 계약(check_records.line_results + remediation_symbol) 저장.
// FamilyACard + familyCard 헬퍼 + familyHelpers 재사용 — Family A/소화전 로직 제2 사본 금지(SSOT).
import { useState, useEffect } from 'react'
import { ClipboardCheck } from 'lucide-react'
import type { CheckResult } from '../../types'
import { inspectionApi } from '../../utils/api'
import { usePhotoUpload, photoUploadFailMsg } from '../../hooks/usePhotoUpload'
import { PhotoButton } from '../PhotoButton'
import { inspectionContent, type InspectionItem } from '../../data/inspectionContent'
import {
  FamilyACard, faLineResults, faAllResolved, faAutoMemo, faWorst,
  RESULT_ICONS, INSPECT_RESULT_OPTIONS, type FaMark,
} from './familyCard'
import { faAutoMemoFor, hydrantRemediationSymbol, pickRestoreRecord } from './familyHelpers'
import { todayKstYmd } from '../../utils/datetime'
import toast from 'react-hot-toast'

// line_results(camelCase JSON 문자열) → FaMark 맵 복원 (InspectionPage.tsx:3822-3837 · 2461-2465 미러)
function parseLineResults(raw: any): Record<number, FaMark> {
  const marks: Record<number, FaMark> = {}
  let arr: any = raw
  if (typeof arr === 'string') { try { arr = JSON.parse(arr) } catch { arr = null } }
  if (Array.isArray(arr)) arr.forEach((v: any, i: number) => { if (v === 'normal' || v === 'caution' || v === 'bad') marks[i] = v })
  return marks
}

export function InspectionCardModal({ category, checkpointId, floor, onSave, onClose }: {
  category:     '소화전' | '완강기'
  checkpointId: string
  floor:        string
  onSave: (cpId: string, result: CheckResult, memo: string, photoKey?: string, extra?: { line_results?: string; remediation_symbol?: string }) => Promise<void>
  onClose: () => void
}) {
  const items: InspectionItem[] = inspectionContent[category]?.items ?? []
  const isHydrant = category === '소화전'
  const photo   = usePhotoUpload('inspection')
  const bcPhoto = usePhotoUpload('inspection-bc')

  // ── 주 카드 상태 ──
  const [faMarks,   setFaMarks]   = useState<Record<number, FaMark>>({})
  const [faChecked, setFaChecked] = useState<Set<number>>(() => new Set(items.map(it => it.i)))  // 첫 진입 전체선택
  const [memo, setMemo] = useState('')
  // ── 소화전 라인3 증상 피커 ──
  const [hydrantPick,   setHydrantPick]   = useState<string>('경종')
  const [hydrantCustom, setHydrantCustom] = useState('')
  // ── paired 비상콘센트(소화전 전용) ──
  const [pairedBC,   setPairedBC]   = useState<any | null>(null)
  const [faMarks2,   setFaMarks2]   = useState<Record<number, FaMark>>({})
  const [faChecked2, setFaChecked2] = useState<Set<number>>(new Set())
  const [bcMemo, setBcMemo] = useState('')
  // ── 개소명 / 저장 ──
  const [locName, setLocName] = useState('')
  const [saving,  setSaving]  = useState(false)

  const bcItems: InspectionItem[] = pairedBC ? (inspectionContent['비상콘센트']?.items ?? []) : []

  // ── self-fetch: 개소 목록(개소명·pairedBC) + 당월 기록(카드 복원) ──
  useEffect(() => {
    let cancelled = false
    const yyyymm = todayKstYmd().slice(0, 7)  // KST 기준 당월 (앱 표준 — 브라우저 로컬시간 아님)
    Promise.all([
      inspectionApi.getCheckpoints(floor).catch(() => [] as any[]),
      inspectionApi.getMonthRecords(yyyymm).catch(() => [] as any[]),
    ]).then(([all, records]) => {
      if (cancelled) return
      const sh = (all as any[]).find(cp => cp.id === checkpointId)
      setLocName(sh?.location ?? sh?.description ?? '')

      // 주 카드 복원 — 이 개소의 최근 기록(line_results 있는 것 우선)
      const myRecs = (records as any[]).filter(r => r.checkpointId === checkpointId)
      const myRec = pickRestoreRecord(myRecs)  // InspectionPage 와 동일 선택규칙(최신 pending 우선) — 교차진입 복원 일치
      const nextMarks = myRec ? parseLineResults(myRec.lineResults) : {}
      setFaMarks(nextMarks)
      setFaChecked(new Set(items.map(it => it.i)))

      // 소화전 라인3 피커 선택값 복원(remediation_symbol → pick/custom). 라인3 우선 저장이라 역매핑 가능.
      let hpick = '경종', hcustom = ''
      if (isHydrant) {
        const sym = myRec?.remediationSymbol ?? ''
        if (sym === '경종 파손') hpick = '경종'
        else if (sym === '호스걸이 파손') hpick = '호스걸이'
        else if (sym && sym !== '위치표시등 점등 이상' && (nextMarks[3] === 'caution' || nextMarks[3] === 'bad')) { hpick = '직접 입력'; hcustom = sym }
        setHydrantPick(hpick)
        setHydrantCustom(hcustom)
      }
      // 저장된 memo 에서 자동문구(auto) 프리픽스 제거 → 수동분만 복원
      const savedMemo = myRec?.memo ?? ''
      const autoAtSave = faAutoMemoFor(category, items, nextMarks, { hydrantPick: hpick, hydrantCustom: hcustom })
      setMemo(autoAtSave && savedMemo.startsWith(autoAtSave) ? savedMemo.slice(autoAtSave.length).replace(/^\n/, '') : savedMemo)

      // paired 비상콘센트 식별(소화전 + 같은 location_no BC 매핑) — FloorPlanPage.tsx:457-474 룰
      if (isHydrant && sh?.locationNo) {
        const bc = (all as any[]).find(cp => cp.category === '비상콘센트' && cp.locationNo === sh.locationNo) ?? null
        setPairedBC(bc)
        if (bc) {
          const bcRecs = (records as any[]).filter(r => r.checkpointId === bc.id)
          const bcRec = pickRestoreRecord(bcRecs)
          const nextMarks2 = bcRec ? parseLineResults(bcRec.lineResults) : {}
          setFaMarks2(nextMarks2)
          const bcItemsLocal = inspectionContent['비상콘센트']?.items ?? []
          setFaChecked2(new Set(bcItemsLocal.map(it => it.i)))
          const savedMemo2 = bcRec?.memo ?? ''
          const auto2 = faAutoMemo(bcItemsLocal, nextMarks2)
          setBcMemo(auto2 && savedMemo2.startsWith(auto2) ? savedMemo2.slice(auto2.length).replace(/^\n/, '') : savedMemo2)
        }
      }
    })
    return () => { cancelled = true }
  }, [checkpointId, floor])  // eslint-disable-line

  // ── 파생값 ──
  const faAllChecked  = items.length > 0 && faChecked.size === items.length
  const faAllChecked2 = !!pairedBC && bcItems.length > 0 && faChecked2.size === bcItems.length
  const faAuto  = faAutoMemoFor(category, items, faMarks, { hydrantPick, hydrantCustom })
  const faAuto2 = pairedBC ? faAutoMemo(bcItems, faMarks2) : ''
  const faHydrantPickOk = !isHydrant
    || !(faMarks[3] === 'caution' || faMarks[3] === 'bad')
    || hydrantPick !== '직접 입력'
    || !!hydrantCustom.trim()
  const canSave = faAllResolved(items, faMarks) && (!pairedBC || faAllResolved(bcItems, faMarks2)) && faHydrantPickOk

  // ── 카드 조작 ──
  const toggleCheck    = (i: number) => setFaChecked(p => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n })
  const toggleSelectAll = () => setFaChecked(faAllChecked ? new Set<number>() : new Set(items.map(it => it.i)))
  const applyResult = (val: CheckResult) => { if (faChecked.size === 0) return; setFaMarks(p => { const n = { ...p }; faChecked.forEach(i => { n[i] = val }); return n }); setFaChecked(new Set()) }
  const toggleCheck2    = (i: number) => setFaChecked2(p => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n })
  const toggleSelectAll2 = () => setFaChecked2(faAllChecked2 ? new Set<number>() : new Set(bcItems.map(it => it.i)))
  const applyResult2 = (val: CheckResult) => { if (faChecked2.size === 0) return; setFaMarks2(p => { const n = { ...p }; faChecked2.forEach(i => { n[i] = val }); return n }); setFaChecked2(new Set()) }

  // ── 저장 (InspectionPage.tsx:2652-2673 미러; 비원자 현행 유지) ──
  const handleSave = async () => {
    if (!canSave || saving) return
    setSaving(true)
    try {
      const photoKey = await photo.upload()
      if (photo.hasPhoto && photoKey === null) { toast.error(photoUploadFailMsg(photo.vaultBacked)); return }
      // 주 카드
      const lineResultsArr = faLineResults(items, faMarks)
      const auto = faAutoMemoFor(category, items, faMarks, { hydrantPick, hydrantCustom })
      const finalMemo = [auto, memo.trim()].filter(Boolean).join('\n')
      const extra: { line_results: string; remediation_symbol?: string } = { line_results: JSON.stringify(lineResultsArr) }
      if (isHydrant) {
        const sym = hydrantRemediationSymbol(faMarks, hydrantPick, hydrantCustom)
        if (sym) extra.remediation_symbol = sym
      }
      await onSave(checkpointId, faWorst(faMarks), finalMemo, photoKey ?? undefined, extra)
      // paired 비상콘센트 (특례 없음, 일반 C/D) — 주 저장 성공 후 별도 저장
      if (pairedBC) {
        const bcPhotoKey = await bcPhoto.upload()
        if (bcPhoto.hasPhoto && bcPhotoKey === null) { toast.error(photoUploadFailMsg(bcPhoto.vaultBacked)); return }
        const lr2 = faLineResults(bcItems, faMarks2)
        const memo2 = [faAutoMemo(bcItems, faMarks2), bcMemo.trim()].filter(Boolean).join('\n')
        await onSave(pairedBC.id, faWorst(faMarks2), memo2, bcPhotoKey ?? undefined, { line_results: JSON.stringify(lr2) })
      }
      // 저장 성공분 사진 vault entry 정리 — 미호출 시 다음 점검에 '복구 사진'으로 오노출(usePhotoUpload 계약)
      photo.reset()
      if (pairedBC) bcPhoto.reset()
      toast.success('점검 기록 저장됨')
      onClose()
    } catch (e: any) {
      toast.error(e?.message ?? '저장 실패')
    } finally {
      setSaving(false)
    }
  }

  const resultButtons = (checkedSize: number, onApply: (v: CheckResult) => void, labelPrefix: string) => (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-caption font-semibold text-text-tertiary tracking-wider">{labelPrefix}</span>
        <span className="text-caption text-text-tertiary">· 선택 {checkedSize}개</span>
      </div>
      <div className="flex gap-1.5">
        {INSPECT_RESULT_OPTIONS.map(opt => {
          const RIcon = RESULT_ICONS[opt.value]
          const activeCls = opt.value === 'normal'  ? 'border-2 border-safe-bar bg-safe-bg text-safe'
                          : opt.value === 'caution' ? 'border-2 border-warning-bar bg-warning-bg text-warning'
                          :                            'border-2 border-danger-bar bg-danger-bg text-danger'
          const disabled = checkedSize === 0
          return (
            <button key={opt.value} onClick={() => onApply(opt.value)} disabled={disabled}
                    className={`flex-1 flex flex-col items-center gap-1 px-1 py-2.5 rounded-md transition-colors ${
                      disabled ? 'border border-border-default bg-surface-raised text-text-tertiary opacity-50 cursor-default' : `${activeCls} cursor-pointer`
                    }`}>
              {RIcon ? <RIcon size={20} /> : null}
              <span className="text-caption font-bold">{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div
      className="fixed left-0 right-0 z-[99] flex flex-col overflow-hidden bg-surface-page"
      style={{ top: 'var(--sat, 0px)', bottom: 0 }}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2.5 h-12 px-3 bg-surface-page border-b border-border-default flex-shrink-0">
        <ClipboardCheck size={18} className="text-text-secondary" />
        <span className="text-title font-semibold text-text-primary">{category} 점검</span>
        <span className="ml-auto text-caption font-semibold text-text-tertiary truncate max-w-[50%]">{floor}{locName ? ` · ${locName}` : ''}</span>
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
        {/* 개소 정보 */}
        <div className="bg-surface-raised rounded-md px-3 py-2 border border-border-default">
          <div className="text-caption text-text-tertiary">{category}</div>
          <div className="text-label font-bold text-text-primary mt-0.5">{locName || checkpointId}</div>
        </div>

        {/* 주 카드 */}
        <FamilyACard
          category={category}
          items={items}
          marks={faMarks}
          checked={faChecked}
          readonly={false}
          allChecked={faAllChecked}
          onSelectAll={toggleSelectAll}
          onToggleCheck={toggleCheck}
        />

        {resultButtons(faChecked.size, applyResult, '점검 결과')}

        {/* 소화전 라인3(소화전함·호스) 증상 피커 — 라인3 마킹 시에만 */}
        {isHydrant && (faMarks[3] === 'caution' || faMarks[3] === 'bad') && (
          <div>
            <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">소화전함·호스 증상</div>
            <div className="flex flex-wrap gap-1.5">
              {(inspectionContent['소화전']?.special?.['3']?.picker as string[] ?? ['경종', '호스걸이', '직접 입력']).map(s => {
                const active = hydrantPick === s
                return (
                  <button key={s} onClick={() => setHydrantPick(s)}
                    className={`flex-1 basis-0 min-w-0 px-2 py-2 rounded-md cursor-pointer text-label font-semibold text-center leading-tight transition-colors ${
                      active
                        ? 'border-[1.5px] border-accent bg-[rgba(59,130,246,0.12)] text-accent'
                        : 'border-[1.5px] border-border-default bg-surface-raised text-text-secondary'
                    }`}>
                    {s}
                  </button>
                )
              })}
            </div>
            {hydrantPick === '직접 입력' && (
              <input value={hydrantCustom} onChange={e => setHydrantCustom(e.target.value)} placeholder="증상 항목 직접 입력"
                className="mt-1.5 w-full px-2.5 py-2 rounded-md bg-surface-raised border border-border-strong text-text-primary text-caption outline-none box-border focus:border-border-focus transition-colors" />
            )}
          </div>
        )}

        {/* 특이사항 + 사진 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-caption font-semibold text-text-tertiary tracking-wider">특이사항 (선택)</label>
            <span className="text-caption text-text-tertiary">점검 사진 (선택)</span>
          </div>
          <div className="flex gap-2 items-start">
            <textarea
              value={[faAuto, memo].filter(Boolean).join('\n')}
              onChange={e => { const v = e.target.value; setMemo(faAuto && v.startsWith(faAuto) ? v.slice(faAuto.length).replace(/^\n/, '') : v) }}
              placeholder="특이사항을 입력하세요"
              className="flex-1 h-[72px] px-2.5 py-2 rounded-md bg-surface-raised border border-border-strong text-text-primary text-caption resize-none outline-none box-border focus:border-border-focus transition-colors" />
            <PhotoButton hook={photo} label="촬영" noCapture />
          </div>
        </div>

        {/* paired 비상콘센트 (소화전 + 같은 location_no BC 매핑이 있을 때만) */}
        {pairedBC && (
          <>
            <div className="h-px bg-border-default my-0.5" />
            <div className="bg-surface-raised rounded-md px-3 py-2 border border-border-default">
              <div className="text-caption text-text-tertiary">{pairedBC.category}</div>
              <div className="text-label font-bold text-text-primary mt-0.5">{pairedBC.location}</div>
              {pairedBC.description && <div className="text-caption text-text-tertiary mt-0.5">{pairedBC.description}</div>}
            </div>
            <FamilyACard
              category="비상콘센트"
              items={bcItems}
              marks={faMarks2}
              checked={faChecked2}
              readonly={false}
              allChecked={faAllChecked2}
              onSelectAll={toggleSelectAll2}
              onToggleCheck={toggleCheck2}
            />
            {resultButtons(faChecked2.size, applyResult2, '비상콘센트 점검 결과')}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-caption font-semibold text-text-tertiary tracking-wider">특이사항 (선택)</label>
                <span className="text-caption text-text-tertiary">점검 사진 (선택)</span>
              </div>
              <div className="flex gap-2 items-start">
                <textarea
                  value={[faAuto2, bcMemo].filter(Boolean).join('\n')}
                  onChange={e => { const v = e.target.value; setBcMemo(faAuto2 && v.startsWith(faAuto2) ? v.slice(faAuto2.length).replace(/^\n/, '') : v) }}
                  placeholder="특이사항을 입력하세요"
                  className="flex-1 h-[72px] px-2.5 py-2 rounded-md bg-surface-raised border border-border-strong text-text-primary text-caption resize-none outline-none box-border focus:border-border-focus transition-colors" />
                <PhotoButton hook={bcPhoto} label="촬영" noCapture />
              </div>
            </div>
          </>
        )}
      </div>

      {/* 하단 버튼 바 */}
      <div className="flex gap-2 px-3.5 pt-2.5 pb-3 bg-surface-raised border-t border-border-default flex-shrink-0" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
        <button onClick={onClose} className="px-4 py-3 rounded-md bg-surface-page border border-border-strong text-text-secondary text-caption font-semibold cursor-pointer">닫기</button>
        <button onClick={handleSave} disabled={!canSave || saving || photo.uploading || bcPhoto.uploading}
          className="flex-1 py-3.5 rounded-md text-body font-bold border-0"
          style={{
            background: (!canSave || saving) ? 'var(--border-default)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)',
            color:      (!canSave || saving) ? 'var(--text-tertiary)' : '#fff',
            cursor:     (!canSave || saving) ? 'default' : 'pointer',
          }}>
          {(photo.uploading || bcPhoto.uploading) ? '사진 업로드 중...' : saving ? '저장 중...' : !faHydrantPickOk ? '증상 항목 입력 필요' : !canSave ? '전 항목 결과 입력 필요' : '저장'}
        </button>
      </div>
    </div>
  )
}
