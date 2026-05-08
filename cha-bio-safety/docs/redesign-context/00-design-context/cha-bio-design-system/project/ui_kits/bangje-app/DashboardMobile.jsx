/* Dashboard Mobile — 방재 시스템 (Lucide icons) */

function DashboardMobile({ onNavigate }) {
  const SCHEDULE = [
    { time: '09:30', title: 'VIP 투어 업무협조', category: 'event', status: 'in_progress' },
    { time: '14:00', title: '엘리베이터 5호기 수리', category: 'elevator', status: 'pending' },
    { time: '16:00', title: '소방 종합점검 협의', category: 'inspect', status: 'pending' },
    { time: null, title: '전 층 DIV 격주 점검', category: 'inspect', status: 'overdue' },
    { time: null, title: '3층 소화기 교체 확인', category: 'task', status: 'pending' },
  ];
  const MONTHLY = [
    { label: '특별피난계단', pct: 100, done: 5, total: 5 },
    { label: '청정소화약제', pct: 80, done: 4, total: 5 },
    { label: 'DIV', pct: 65, done: 22, total: 34 },
    { label: '컴프레셔', pct: 65, done: 22, total: 34 },
    { label: '소화기', pct: 45, done: 68, total: 150 },
    { label: '유도등', pct: 30, done: 42, total: 140 },
    { label: '방화셔터', pct: 0, done: 0, total: 12 },
  ];
  const timed = SCHEDULE.filter(s => s.time);
  const untimed = SCHEDULE.filter(s => !s.time);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Duty chip bar */}
      <div style={{ flexShrink: 0, background: 'var(--surface-raised)', borderBottom: '1px solid var(--border-default)', padding: '6px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <RoleLabel text="관리자" color="rgba(245,158,11,0.75)" />
            <DutyChip name="석현민" type="day" small />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <RoleLabel text="보조자" color="rgba(110,118,129,0.65)" />
            <DutyChip name="김병조" type="night" small />
            <DutyChip name="윤종엽" type="off" small />
            <DutyChip name="박보융" type="leave" small />
          </div>
        </div>
      </div>

      {/* Main grid */}
      <main style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 7, padding: '7px 11px' }}>

        {/* ① Today target banner */}
        <div style={{
          background: 'linear-gradient(100deg, rgba(37,99,235,.17), rgba(14,165,233,.08))',
          border: '1px solid rgba(59,130,246,.22)', borderRadius: 12,
          padding: '8px 13px', display: 'flex', alignItems: 'center', gap: 9,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-info)', flexShrink: 0 }}></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--status-info)', letterSpacing: '.04em' }}>오늘 점검 대상</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 1, lineHeight: 1.2 }}>전 층 DIV 격주 점검 · B5~8층 34개 측정점</div>
          </div>
        </div>

        {/* ② Stats */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>오늘 현황</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: 'var(--status-safe)', background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.2)', padding: '2px 7px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Flame size={12} color="var(--status-safe)" /> 연속 14일 점검 달성
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            <StatCard label="점검 미완료" value="12" sub="/34" color="var(--status-danger)" onClick={() => onNavigate('inspection')} />
            <StatCard label="미조치 항목" value="3" sub="건" color="var(--status-warning)" />
            <StatCard label="오늘 일정" value="5" sub="건" color="var(--status-info)" />
            <StatCard label="승강기 고장" value="0" sub="대" color="var(--status-safe)" />
          </div>
        </div>

        {/* ③ Quick tools */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>빠른 도구 모음</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            <ToolCard icon={MapPinIcon} label="도면 점검" desc={"층별 도면 보기\n유도등·감지기·소화기"} bg="rgba(59,130,246,.13)" iconColor="#3b82f6" />
            <ToolCard icon={BarChart3} label="DIV 트렌드" desc={"측정점 선택\n압력 트렌드 차트"} bg="rgba(14,165,233,.13)" iconColor="#0ea5e9" />
            <ToolCard icon={Siren} label="고장 접수" desc={"승강기 고장 접수\nTKE 자동 연결"} bg="rgba(239,68,68,.13)" iconColor="#ef4444" />
            <ToolCard icon={Users} label="직원 서비스" desc={"연차·식사 이용\n근무표 기반 통합"} bg="rgba(34,197,94,.13)" iconColor="#22c55e" />
          </div>
        </div>

        {/* ④ Schedule */}
        <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-default)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 11px', borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>오늘 일정</span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', background: 'var(--surface-sunken)', padding: '1px 7px', borderRadius: 9 }}>5건</span>
          </div>
          <div>
            {timed.length > 0 && (
              <>
                <div style={{ padding: '4px 10px 2px', fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '.04em', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Bell size={12} color="var(--text-tertiary)" /> 시간 확정
                </div>
                {timed.map((item, i) => <ScheduleRow key={i} {...item} />)}
              </>
            )}
            {untimed.length > 0 && (
              <>
                <div style={{ padding: '4px 10px 2px', fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '.04em', borderTop: '1px solid var(--border-default)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ClipboardList size={12} color="var(--text-tertiary)" /> 시간 미정
                </div>
                {untimed.map((item, i) => <ScheduleRow key={i} {...item} />)}
              </>
            )}
          </div>
        </div>

        {/* ⑤ Monthly overview */}
        <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-default)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 11px', borderBottom: '1px solid var(--border-default)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>이번 달 점검 현황</span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>2026년 5월</span>
          </div>
          <div style={{ overflowX: 'auto', scrollbarWidth: 'none', padding: '8px 10px 10px', display: 'flex', gap: 12 }}>
            {MONTHLY.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, minWidth: 64 }}>
                <Donut pct={m.pct} color={progressColor(m.pct)} size={44} />
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', lineHeight: 1.3, maxWidth: 72, wordBreak: 'keep-all' }}>{m.label}</div>
                <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: m.done >= m.total ? 'var(--status-safe)' : 'var(--text-tertiary)' }}>{m.done}/{m.total}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav active="dashboard" onNavigate={onNavigate} />
    </div>
  );
}

Object.assign(window, { DashboardMobile });
