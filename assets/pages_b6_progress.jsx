/* ============================================================
   批 6 · 页面 6.2 · 进度推进度（永久记录）
   每级验收通过沉淀「下级对上级目标推进了多少」，作为永久进度、供下次拆解参考；
   合成理想化状态推进度（长周期趋势）。
   ============================================================ */

/* 长周期推进趋势（第 12 ~ 23 周，向理想化状态合成） */
const PA_TREND = [
  { wk: '12w', v: 10 }, { wk: '13w', v: 16 }, { wk: '14w', v: 16 }, { wk: '15w', v: 24 },
  { wk: '16w', v: 28 }, { wk: '17w', v: 30 }, { wk: '18w', v: 38 }, { wk: '19w', v: 40 },
  { wk: '20w', v: 46 }, { wk: '21w', v: 55 }, { wk: '22w', v: 67 }, { wk: '23w', v: 72 },
];
/* 阶段验收通过里程碑（坐标按 index） */
const PA_MILES = [
  { i: 5, label: '阶段：算法灰度达标' },
  { i: 9, label: '阶段：异常自愈率 ≥ 90%' },
];

/* 理想化状态推进度大图 */
function ProgressChart() {
  const W = 800, H = 236, padL = 30, padR = 14, padT = 16, padB = 26;
  const n = PA_TREND.length;
  const x = (i) => padL + (i / (n - 1)) * (W - padL - padR);
  const y = (v) => padT + (1 - v / 100) * (H - padT - padB);
  const pts = PA_TREND.map((d, i) => [x(i), y(d.v)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${x(n - 1).toFixed(1)} ${y(0).toFixed(1)} L${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`;
  const grids = [0, 25, 50, 75, 100];
  /* 理想化目标节奏（计划线，略高于实际，体现推进缺口） */
  const plan = `M${x(0).toFixed(1)} ${y(4).toFixed(1)} L${x(n - 1).toFixed(1)} ${y(84).toFixed(1)}`;
  const [draw, setDraw] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setDraw(true), 80); return () => clearTimeout(t); }, []);
  return (
    <div className="pa-chart-wrap">
      <svg className="pa-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height: 236 }}>
        <defs>
          <linearGradient id="paFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--blue-primary)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--blue-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {grids.map(g => (
          <g key={g}>
            <line x1={padL} y1={y(g)} x2={W - padR} y2={y(g)} stroke="var(--divider)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <text x={padL - 8} y={y(g) + 3} textAnchor="end" fontSize="10" fill="var(--text-400)" fontFamily="var(--font-mono)">{g}</text>
          </g>
        ))}
        {PA_TREND.map((d, i) => (i % 2 === 0 || i === n - 1) && (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="9.5" fill="var(--text-400)" fontFamily="var(--font-mono)">{d.wk}</text>
        ))}
        <path d={plan} fill="none" stroke="var(--text-400)" strokeWidth="1.6" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
        <path d={area} fill="url(#paFill)" style={{ opacity: draw ? 1 : 0, transition: 'opacity 700ms var(--ease-out)' }} />
        <path d={line} fill="none" stroke="var(--blue-primary)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
          style={{ strokeDasharray: 1400, strokeDashoffset: draw ? 0 : 1400, transition: 'stroke-dashoffset 1400ms var(--ease-out)' }} />
        {PA_MILES.map(m => (
          <g key={m.i}>
            <circle cx={x(m.i)} cy={y(PA_TREND[m.i].v)} r="4.5" fill="#fff" stroke="var(--success)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          </g>
        ))}
        <circle cx={x(n - 1)} cy={y(PA_TREND[n - 1].v)} r="5" fill="var(--blue-primary)" stroke="#fff" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

/* 推进度链段 */
const PA_CHAIN = [
  { id: 'w2p', route: '周版本 → 阶段目标', pct: 64, rem: '路况源就位、管道时延', color: 'var(--warning)',
    records: [
      { t: '第 22 周 · 调度算法灰度上线', g: 'B', date: '05-30', delta: '+12%' },
      { t: '第 21 周 · 异常检测模型迭代', g: 'A', date: '05-24', delta: '+9%' },
    ] },
  { id: 'p2m', route: '阶段目标 → 中短期目标', pct: 71, rem: '履约时效阶段未达成', color: 'var(--warning)',
    records: [
      { t: '阶段 · 异常自愈率 ≥ 90%', g: 'B', date: '05-27', delta: '+18%' },
      { t: '阶段 · 履约时效 < 4h（未通过）', g: 'D', date: '06-01', delta: '+0%' },
    ] },
  { id: 'm2i', route: '中短期 → 理想化状态', pct: 58, rem: '成本下降中短期验收中', color: 'var(--blue-primary)',
    records: [
      { t: '中短期 · 调度时效提升 30%', g: 'C', date: '06-01', delta: '+24% / 30%' },
      { t: '中短期 · 单均成本下降 15%', g: 'R', date: '验收中', delta: '—' },
    ] },
];

/* 逐级推进度条 */
const PA_BARS = [
  { name: '异常调度自愈率 ≥ 90%', lv: '阶段目标 · 已验收', pct: 100, done: true, rem: 0, acc: '05-27 验收通过' },
  { name: '履约时效 < 4h', lv: '阶段目标 · 卡点', pct: 64, done: false, rem: 3, acc: '06-01 未通过' },
  { name: '算力成本优化', lv: '阶段目标 · 验收中', pct: 30, done: false, rem: 2, acc: '尚未到验收节点' },
  { name: '调度时效提升 30%（中短期）', lv: '中短期目标', pct: 58, done: false, rem: 3, acc: '06-01 部分达成' },
];

/* 剩余项列表 */
const PA_REMAIN = [
  { t: '实时路况数据源选型与合规采购', from: '第 23 周 · 接入区域实时路况', tag: '滚动至下周', tone: 'warning' },
  { t: '第三方运力 API 联通（已失败 · 建议换源重拆）', from: '第 22 周遗留', tag: '重新拆解', tone: 'danger' },
  { t: '推理资源弹性调度上线', from: '第 24 周 · 待执行', tag: '本周排期', tone: 'info' },
];

/* 永久记录时间线（验收通过沉淀，不可篡改） */
const PA_PERM = [
  { date: '06-01', m: '中短期', title: '调度时效提升 30% · 季度汇聚', delta: '+24%', blue: true,
    desc: '阶段「履约时效」未通过、「异常自愈」通过，中短期部分达成，沉淀为永久进度并触发根基复盘。' },
  { date: '05-30', m: '第 22 周', title: '调度算法灰度上线 · 周版本验收通过', delta: '+12%', blue: false,
    desc: '灰度策略与监控面板交付，推动「履约时效」阶段目标推进，剩余项滚动至下一周。' },
  { date: '05-27', m: '阶段', title: '异常自愈率 ≥ 90% · 阶段验收通过', delta: '+18%', blue: true,
    desc: '自愈率实测 91.4%，阶段目标达成，向中短期「时效提升」合成推进。' },
  { date: '05-24', m: '第 21 周', title: '异常检测模型迭代 · 周版本验收通过', delta: '+9%', blue: false,
    desc: '特征工程优化，模型召回与误报达标，沉淀为永久进度记录。' },
];

/* 推进度构成抽屉 */
function ChainDrawer({ seg, onClose }) {
  return (
    <Drawer open={!!seg} onClose={onClose} width={460}
      title={seg ? seg.route : ''} sub="构成该推进度的验收记录"
      icon={seg ? { name: 'trending-up', color: 'var(--blue-primary)' } : null}>
      {seg && (
        <>
          <div className="ac-dr-metrics" style={{ gridTemplateColumns: '1fr', margin: '4px 0 18px' }}>
            <div className="ac-dr-mcell">
              <div className="ac-dr-mcell-v" style={{ color: seg.color }}>{seg.pct}%</div>
              <div className="ac-dr-mcell-k">已推进量 · 剩余「{seg.rem}」</div>
              <div className="ac-dr-mcell-bar"><span style={{ width: seg.pct + '%', background: seg.color }} /></div>
            </div>
          </div>
          <div className="ac-sec-label"><Icon name="history" size={14} color="var(--text-400)" />沉淀该推进度的验收记录</div>
          <div className="ac-trace">
            {seg.records.map((r, i) => (
              <div className="ac-trace-item" key={i}>
                <span className="ac-trace-dot" style={{ color: GRADE[r.g].c, background: GRADE[r.g].c }} />
                <div className="ac-trace-main" style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ac-trace-act">{r.t}</div>
                    <div className="ac-trace-meta"><span className="mono">{r.date}</span> · 评级 {GRADE[r.g].label}</div>
                  </div>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: r.delta === '—' ? 'var(--text-400)' : 'var(--success)', flex: 'none' }}>{r.delta}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Drawer>
  );
}

/* ---------- 6.2 进度推进度（内容体） ---------- */
function ProgressAdvance({ loading, onNavigate, onToast }) {
  const [seg, setSeg] = React.useState(null);
  React.useEffect(() => { refreshIcons(); });

  if (loading) {
    return (
      <>
        <Card style={{ padding: 22, marginBottom: 16 }}><Skel w="40%" h={18} /><Skel w="100%" h={200} r={10} style={{ marginTop: 18 }} /></Card>
        <div className="pa-cols"><Card style={{ padding: 22 }}><Skel w="50%" h={16} /><Skel w="100%" h={120} style={{ marginTop: 16 }} /></Card><Card style={{ padding: 22 }}><Skel w="50%" h={16} /><Skel w="100%" h={120} style={{ marginTop: 16 }} /></Card></div>
      </>
    );
  }

  return (
    <>
      {/* 理想化状态推进度大图 */}
      <div className="pa-hero">
        <div className="pa-hero-head">
          <span className="pa-hero-ico"><Icon name="target" size={22} color="var(--blue-primary)" /></span>
          <div className="pa-hero-titles">
            <div className="pa-hero-t">理想化状态推进度 · 长周期合成</div>
            <div className="pa-hero-s">由各级验收通过的永久进度逐层合成，衡量项目向「履约调度全面智能化、时效与成本双优」终态的长周期推进。</div>
          </div>
          <div className="pa-hero-big">
            <div className="pa-hero-pct">58<span style={{ fontSize: 22 }}>%</span></div>
            <div className="pa-hero-pctk">较计划节奏 ▾ 落后 14%</div>
          </div>
        </div>
        <ProgressChart />
        <div className="pa-chart-legend">
          <span className="pa-leg"><span className="pa-leg-line" style={{ background: 'var(--blue-primary)' }} />实际推进度（永久记录合成）</span>
          <span className="pa-leg"><span className="pa-leg-dash" />理想化目标节奏</span>
          <span className="pa-leg"><span className="pa-leg-dot" style={{ background: '#fff', boxShadow: '0 0 0 2px var(--success)' }} />阶段验收通过里程碑</span>
        </div>
      </div>

      {/* 推进度链 */}
      <div className="pa-chain">
        <div className="pa-sec-head">
          <Icon name="link-2" size={17} color="var(--blue-primary)" />
          <span className="t">推进度链 · 逐级合成</span>
          <span className="s">点任一段查看构成它的验收记录</span>
        </div>
        <div className="pa-sec-desc">下级目标验收通过后，对上级目标产生「推进量」；逐段向上合成，最终汇成理想化状态推进度。</div>
        <div className="pa-chain-flow">
          {PA_CHAIN.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="pa-seg">
                <button className="pa-seg-btn" data-sel={seg && seg.id === s.id} onClick={() => setSeg(s)}>
                  <div className="pa-seg-route">{s.route}</div>
                  <div className="pa-seg-pct" style={{ color: s.color }}>{s.pct}%</div>
                  <div className="pa-seg-bar"><span style={{ width: s.pct + '%', background: s.color }} /></div>
                  <div className="pa-seg-meta"><span>已推进</span><span className="rem">剩余 {s.rem}</span></div>
                </button>
              </div>
              {i < PA_CHAIN.length - 1 && <span className="pa-seg-arrow"><Icon name="chevron-right" size={20} color="currentColor" /></span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 两列：逐级推进度条 + 剩余项 */}
      <div className="pa-cols">
        <div className="pa-panel">
          <div className="pa-sec-head"><Icon name="bar-chart-3" size={17} color="var(--blue-primary)" /><span className="t">逐级推进度条</span></div>
          <div className="pa-bars">
            {PA_BARS.map((b, i) => (
              <div className="pa-bar-row" key={i}>
                <div className="pa-bar-top">
                  <span className="pa-bar-ico" style={{ background: b.done ? 'var(--success-bg)' : 'var(--blue-tint)' }}>
                    <Icon name={b.done ? 'circle-check' : 'milestone'} size={15} color={b.done ? 'var(--success)' : 'var(--blue-primary)'} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div className="pa-bar-name">{b.name}</div>
                    <div className="pa-bar-lv">{b.lv} · {b.acc}</div>
                  </div>
                  <span className="pa-bar-pct">{b.pct}%</span>
                </div>
                <div className="pa-bar-track"><span className={`pa-bar-fill ${b.done ? 'done' : 'cur'}`} style={{ width: b.pct + '%' }} /></div>
                <div className="pa-bar-sub">
                  <span>已推进 <span className="mono">{b.pct}%</span></span>
                  <span>剩余项 <span className="mono">{b.rem}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pa-panel">
          <div className="pa-sec-head"><Icon name="list-todo" size={17} color="var(--blue-primary)" /><span className="t">剩余项</span><span className="s">{PA_REMAIN.length} 项</span></div>
          <div className="pa-rem-list">
            {PA_REMAIN.map((r, i) => (
              <div className="pa-rem-item" key={i}>
                <span className="pa-rem-ico" style={{ background: STATUS[r.tone].bg }}><Icon name="circle-dot" size={13} color={STATUS[r.tone].c} /></span>
                <div className="pa-rem-main">
                  <div className="pa-rem-t">{r.t}</div>
                  <div className="pa-rem-m"><span>{r.from}</span></div>
                </div>
                <span className="pill" style={{ background: STATUS[r.tone].bg, color: STATUS[r.tone].c, flex: 'none' }}><span className="dot" style={{ background: STATUS[r.tone].c }} />{r.tag}</span>
              </div>
            ))}
          </div>
          <div className="pa-grain">
            <Icon name="ruler" size={17} color="var(--blue-primary)" />
            <span className="t">下一次拆解须参考已完成进度与剩余项，对齐颗粒度，避免重复或遗漏。</span>
          </div>
        </div>
      </div>

      {/* 永久记录时间线 */}
      <div className="pa-perm">
        <div className="pa-sec-head">
          <Icon name="archive" size={17} color="var(--blue-primary)" />
          <span className="t">永久进度记录</span>
          <span className="s">每级验收通过即沉淀，慢节奏、不可篡改</span>
        </div>
        <div className="pa-timeline">
          {PA_PERM.map((p, i) => (
            <div className="pa-tl-item" key={i}>
              <div className="pa-tl-date"><div className="d mono">{p.date}</div><div className="m">{p.m}</div></div>
              <span className={`pa-tl-node${p.blue ? ' blue' : ''}`} />
              <div className="pa-tl-card">
                <div className="pa-tl-card-top">
                  <span className="pa-tl-title">{p.title}</span>
                  <span className="pa-tl-delta">{p.delta}</span>
                  <span className="pa-tl-lock"><Icon name="lock" size={11} color="var(--success)" />永久记录</span>
                </div>
                <div className="pa-tl-desc">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ChainDrawer seg={seg} onClose={() => setSeg(null)} />
    </>
  );
}

Object.assign(window, { ProgressAdvance });
