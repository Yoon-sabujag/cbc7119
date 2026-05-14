/* Dashboard Desktop — 방재 시스템 (Lucide icons) */

function DashboardDesktop({ onNavigate }) {
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

  const TOOLS = [
    { icon: MapPinIcon, label: '도면 점검', desc: '층별 도면 · 유도등 · 감지기', bg: 'rgba(59,130,246,.1)', iconColor: '#3b82f6' },
    { icon: BarChart3, label: 'DIV 트렌드', desc: '측정점 압력 트렌드 차트', bg: 'rgba(14,165,233,.1)', iconColor: '#0ea5e9' },
    { icon: Siren, label: '고장 접수', desc: '승강기 고장 접수 · TKE 연결', bg: 'rgba(239,68,68,.1)', iconColor: '#ef4444' },
    { icon: Users, label: '직원 서비스', desc: '연차 · 식사 · 근무표 통합', bg: 'rgba(34,197,94,.1)', iconColor: '#22c55e' },
  ];

  // Mini calendar
  const now = new Date();
  const calYear = now.getFullYear(), calMonth = now.getMonth();
  const calFirst = new Date(calYear, calMonth, 1);
  const calLast = new Date(calYear, calMonth + 1, 0);
  const calStartDow = calFirst.getDay();
  const calDaysInMonth = calLast.getDate();
  const calToday = now.getDate();
  const DOW = ['일','월','화','수','목','금','토'];

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Row 0: Duty chips + streak */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <RoleLabel text="관리자" color="rgba(245,158,11,0.75)" />
          <DutyChip name="석현민" type="day" />
          <div style={{ width: 1, height: 22, background: 'var(--border-default)', margin: '0 6px' }}></div>
          <RoleLabel text="보조자" color="rgba(110,118,129,0.65)" />
          <DutyChip name="김병조" type="night" />
          <DutyChip name="윤종엽" type="off" />
          <DutyChip name="박보융" type="leave" />
        </div>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: 'var(--status-safe)', background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.18)', padding: '5px 14px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <Flame size={14} color="var(--status-safe)" /> 연속 14일 점검 달성
        </span>
      </div>

      {/* Row 1: Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(37,99,235,.10), rgba(14,165,233,.05))',
        border: '1px solid rgba(59,130,246,.15)', borderRadius: 16,
        padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--status-info)', flexShrink: 0 }}></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--status-info)', letterSpacing: '.04em' }}>오늘 점검 대상</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4, lineHeight: 1.4 }}>전 층 DIV 격주 점검 · B5~8층 34개 측정점</div>
        </div>
        <div style={{ width: 1, height: 36, background: 'rgba(59,130,246,.15)', flexShrink: 0 }}></div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', letterSpacing: '.04em', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }}></div>
            최근 수신반 이력
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>B3층 방재센터 앞</div>
        </div>
      </div>

      {/* Row 2: Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <StatCard label="점검 미완료" value="12" sub="/34" color="var(--status-danger)" onClick={() => onNavigate('inspection')} />
        <StatCard label="미조치 항목" value="3" sub="건" color="var(--status-warning)" />
        <StatCard label="오늘 일정" value="5" sub="건" color="var(--status-info)" />
        <StatCard label="승강기 고장" value="0" sub="대" color="var(--status-safe)" />
      </div>

      {/* Row 3: Two-column layout */}
      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>

        {/* Left: Monthly + Quick tools */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Monthly inspection */}
          <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-default)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>이번 달 점검 현황</span>
              <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{calYear}년 {calMonth + 1}월</span>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-evenly', gap: 8, flex: 1, alignItems: 'center' }}>
              {MONTHLY.map((m, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                  <Donut pct={m.pct} color={progressColor(m.pct)} size={76} />
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.3, wordBreak: 'keep-all' }}>{m.label}</div>
                  <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: m.done >= m.total ? 'var(--status-safe)' : 'var(--text-tertiary)' }}>{m.done}/{m.total}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick tools */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, flexShrink: 0 }}>
            {TOOLS.map(t => (
              <div key={t.label} style={{
                background: 'var(--surface-raised)', border: '1px solid var(--border-default)', borderRadius: 14,
                padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                cursor: 'pointer', textAlign: 'center',
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <t.icon size={24} color={t.iconColor} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3, lineHeight: 1.3 }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Calendar + Schedule (340px) */}
        <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Mini calendar */}
          <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-default)', borderRadius: 16, padding: '16px 14px', flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', marginBottom: 10 }}>
              {calYear}년 {calMonth + 1}월
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center' }}>
              {DOW.map(d => (
                <div key={d} style={{ fontSize: 12, fontWeight: 700, color: d === '일' ? 'var(--status-danger)' : d === '토' ? 'var(--status-info)' : 'var(--text-tertiary)', padding: '3px 0' }}>{d}</div>
              ))}
              {Array.from({ length: calStartDow }, (_, i) => <div key={`e${i}`}></div>)}
              {Array.from({ length: calDaysInMonth }, (_, i) => {
                const d = i + 1;
                const dow = (calStartDow + i) % 7;
                const isToday = d === calToday;
                return (
                  <div key={d} style={{ padding: '2px 0' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', margin: '0 auto',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: isToday ? 700 : 400,
                      color: isToday ? '#fff' : dow === 0 ? 'var(--status-danger)' : dow === 6 ? 'var(--status-info)' : 'var(--text-primary)',
                      background: isToday ? 'var(--accent)' : 'transparent',
                    }}>{d}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today schedule */}
          <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-default)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>오늘 일정</span>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)', background: 'var(--surface-sunken)', padding: '3px 10px', borderRadius: 10 }}>{SCHEDULE.length}건</span>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <div style={{ padding: '8px 16px 4px', fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '.04em' }}>시간 확정</div>
              {timed.map((item, i) => <ScheduleRow key={i} {...item} />)}
              <div style={{ padding: '8px 16px 4px', fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '.04em', borderTop: '1px solid var(--border-default)' }}>시간 미정</div>
              {untimed.map((item, i) => <ScheduleRow key={i} {...item} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardDesktop });
