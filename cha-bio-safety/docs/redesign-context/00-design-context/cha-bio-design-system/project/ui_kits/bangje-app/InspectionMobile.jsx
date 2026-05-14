/* Inspection Mobile — 방재 시스템 (Lucide icons) */

function InspectionMobile({ onNavigate }) {
  const [screen, setScreen] = React.useState('categories');
  const [selectedGroup, setSelectedGroup] = React.useState(null);
  const [selectedZone, setSelectedZone] = React.useState(null);
  const [selectedFloor, setSelectedFloor] = React.useState(null);
  const [selectedResult, setSelectedResult] = React.useState('normal');
  const [memo, setMemo] = React.useState('');
  const [justSaved, setJustSaved] = React.useState(false);

  const CATEGORY_GROUPS = [
    { labels: ['특별피난계단'], icon: StairsIcon, done: 5, total: 5 },
    { labels: ['청정소화약제'], icon: Cloud, done: 4, total: 5 },
    { labels: ['전실제연댐퍼', '연결송수관'], icon: Shield, done: 3, total: 8 },
    { labels: ['주차장비', '회전문'], icon: Car, done: 2, total: 6 },
    { labels: ['소방용전원공급반'], icon: Zap, done: 1, total: 3 },
    { labels: ['방화셔터'], icon: ShutterIcon, done: 0, total: 12 },
    { labels: ['DIV'], icon: BarChart3, done: 22, total: 34 },
    { labels: ['컴프레셔'], icon: Wind, done: 22, total: 34 },
    { labels: ['유도등'], icon: ExitSignIcon, done: 42, total: 140 },
    { labels: ['배연창'], icon: SmokeVentIcon, done: 5, total: 14 },
    { labels: ['완강기'], icon: ArrowDownToLine, done: 7, total: 7 },
    { labels: ['소화전', '비상콘센트'], icon: HoseReelIcon, done: 12, total: 30 },
    { labels: ['소화기'], icon: FireExtinguisher, done: 68, total: 150 },
    { labels: ['소방펌프'], icon: Waves, done: 3, total: 5 },
    { labels: ['화재수신반'], icon: Bell, done: 1, total: 1 },
    { labels: ['CCTV'], icon: Video, done: 12, total: 12 },
  ];

  const ZONES = [
    { key: 'research', label: '연구동', icon: FlaskConical },
    { key: 'office', label: '사무동', icon: Building2 },
    { key: 'underground', label: '지하', icon: TrainFront },
  ];

  const FLOORS_GROUND = ['8F', '7F', '6F', '5F', '3F', '2F', '1F'];
  const FLOORS_UNDER = ['B1', 'M', 'B2', 'B3', 'B4', 'B5'];

  const RESULT_OPTIONS = [
    { value: 'normal', label: '정상', color: 'var(--status-safe)', bg: 'rgba(34,197,94,.13)', Icon: CheckCircle2 },
    { value: 'caution', label: '주의', color: 'var(--status-warning)', bg: 'rgba(245,158,11,.13)', Icon: AlertTriangle },
    { value: 'bad', label: '불량', color: 'var(--status-danger)', bg: 'rgba(239,68,68,.13)', Icon: XCircle },
  ];

  const floors = selectedZone === 'underground' ? FLOORS_UNDER : FLOORS_GROUND;

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setScreen('zone');
    setSelectedZone(null);
    setSelectedFloor(null);
    setJustSaved(false);
  };

  const handleSelectFloor = (floor) => {
    setSelectedFloor(floor);
    setScreen('inspect');
    setSelectedResult('normal');
    setMemo('');
    setJustSaved(false);
  };

  const handleSave = () => {
    setJustSaved(true);
    setTimeout(() => {
      setJustSaved(false);
      setScreen('zone');
    }, 1200);
  };

  const handleBack = () => {
    if (screen === 'inspect') { setScreen('zone'); setJustSaved(false); }
    else if (screen === 'zone') { setScreen('categories'); setSelectedGroup(null); }
  };

  // ── Categories screen ──
  if (screen === 'categories') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <PageHeader title="점검" subtitle="카테고리를 선택하세요" />
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {CATEGORY_GROUPS.map((g, i) => {
              const Icon = g.icon;
              const pct = g.total > 0 ? Math.round(g.done / g.total * 100) : 0;
              const barColor = progressColor(pct);
              const isZero = pct === 0;
              return (
                <div key={i} onClick={() => handleSelectGroup(g)}
                  style={{
                    background: 'var(--surface-raised)', border: '1px solid var(--border-default)',
                    borderRadius: 12,
                    display: 'grid', gridTemplateColumns: '3px 36px 1fr auto', gap: 10,
                    alignItems: 'center', padding: '10px 12px 10px 0',
                    cursor: 'pointer', opacity: isZero ? 0.6 : 1,
                  }}>
                  <div style={{ background: barColor, borderRadius: '12px 0 0 12px', alignSelf: 'stretch' }}></div>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} color="var(--text-secondary)" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{g.labels[0]}</div>
                    {g.labels.length > 1 && <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 1 }}>{g.labels.slice(1).join(' · ')}</div>}
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', marginTop: 2 }}>{g.done}/{g.total}</div>
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: barColor, flexShrink: 0 }}>{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
        <BottomNav active="inspection" onNavigate={onNavigate} />
      </div>
    );
  }

  // ── Zone + floor selection ──
  if (screen === 'zone') {
    const GroupIcon = selectedGroup.icon;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '10px 16px', background: 'var(--surface-raised)', borderBottom: '1px solid var(--border-default)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={handleBack} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <ChevronLeft size={16} />
          </button>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GroupIcon size={18} color="var(--text-secondary)" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedGroup.labels[0]}</div>
            {selectedGroup.labels.length > 1 && <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{selectedGroup.labels.slice(1).join(' · ')}</div>}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 6, letterSpacing: '.04em' }}>구역 선택</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {ZONES.map(z => {
                const ZIcon = z.icon;
                return (
                  <button key={z.key} onClick={() => { setSelectedZone(z.key); setSelectedFloor(null); }}
                    style={{
                      flex: 1, padding: '9px 0', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      border: selectedZone === z.key ? '1.5px solid var(--accent)' : '1px solid var(--border-strong)',
                      background: selectedZone === z.key ? 'var(--accent)' : 'var(--surface-page)',
                      color: selectedZone === z.key ? '#fff' : 'var(--text-secondary)',
                      transition: 'all .12s', fontFamily: 'var(--font-sans)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    }}>
                    <ZIcon size={14} /> {z.label}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedZone && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 6, letterSpacing: '.04em' }}>층 선택</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {floors.map(f => (
                  <button key={f} onClick={() => handleSelectFloor(f)}
                    style={{
                      padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      border: selectedFloor === f ? '1.5px solid var(--accent)' : '1px solid var(--border-strong)',
                      background: selectedFloor === f ? 'var(--accent)' : 'var(--surface-page)',
                      color: selectedFloor === f ? '#fff' : 'var(--text-secondary)',
                      transition: 'all .1s', fontFamily: 'var(--font-sans)',
                    }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!selectedZone && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 14 }}>구역을 선택해 주세요</div>
          )}
        </div>
        <BottomNav active="inspection" onNavigate={onNavigate} />
      </div>
    );
  }

  // ── Inspection form ──
  const GroupIcon2 = selectedGroup.icon;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '10px 16px', background: 'var(--surface-raised)', borderBottom: '1px solid var(--border-default)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={handleBack} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          <ChevronLeft size={16} />
        </button>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GroupIcon2 size={18} color="var(--text-secondary)" />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedGroup.labels[0]}</div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{selectedFloor} · {ZONES.find(z => z.key === selectedZone)?.label}</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            {selectedFloor} {selectedGroup.labels[0]} — 측정점 1
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 3 }}>
            {selectedFloor} 복도 {selectedGroup.labels[0]} 점검 항목
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 6, letterSpacing: '.04em' }}>점검 결과</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {RESULT_OPTIONS.map(opt => {
              const OptIcon = opt.Icon;
              return (
                <button key={opt.value} onClick={() => setSelectedResult(opt.value)}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '10px 4px', borderRadius: 12, cursor: 'pointer',
                    border: selectedResult === opt.value ? `2px solid ${opt.color}` : '1px solid var(--border-default)',
                    background: selectedResult === opt.value ? opt.bg : 'var(--surface-raised)',
                    transition: 'all .13s', fontFamily: 'var(--font-sans)',
                  }}>
                  <OptIcon size={24} color={selectedResult === opt.value ? opt.color : 'var(--text-tertiary)'} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: selectedResult === opt.value ? opt.color : 'var(--text-tertiary)' }}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '.04em' }}>특이사항 (선택)</label>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>점검 사진 (선택)</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="특이사항을 입력하세요"
              style={{
                flex: 1, height: 72, padding: '9px 11px', borderRadius: 10,
                background: 'var(--surface-sunken)', border: '1px solid var(--border-strong)',
                color: 'var(--text-primary)', fontSize: 14, resize: 'none',
                fontFamily: 'var(--font-sans)', outline: 'none', boxSizing: 'border-box',
              }} />
            <button style={{
              width: 72, height: 72, borderRadius: 10,
              background: 'var(--surface-sunken)', border: '1px solid var(--border-strong)',
              color: 'var(--text-tertiary)', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
              fontFamily: 'var(--font-sans)',
            }}>
              <Camera size={20} color="var(--text-tertiary)" />
              촬영
            </button>
          </div>
        </div>

        {justSaved && (
          <div style={{ background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.25)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--status-safe)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={16} color="var(--status-safe)" /> 저장 완료
          </div>
        )}
      </div>

      <div style={{ padding: '10px 14px 12px', background: 'var(--surface-raised)', borderTop: '1px solid var(--border-default)', flexShrink: 0, display: 'flex', gap: 8 }}>
        <button onClick={handleBack} style={{
          padding: '12px 18px', borderRadius: 12, background: 'var(--surface-page)',
          border: '1px solid var(--border-strong)', color: 'var(--text-secondary)',
          fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)',
        }}>닫기</button>
        <button onClick={handleSave} style={{
          flex: 1, padding: '13px 0', borderRadius: 12, border: 'none',
          background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)', color: '#fff',
          fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)',
        }}>
          점검 기록 저장
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { InspectionMobile });
