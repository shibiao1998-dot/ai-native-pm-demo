/* ============================================================
   批 9 · 页面 9.1 · 项目集总看板（组合级）
   ------------------------------------------------------------
   作用：汇总全系统算力消耗，管理层掌握平台整体成本。三个 tab：
         overview 成本概览（核心三数 + 趋势 + 按项目分布）/ trace 全链路追踪 / calls 调用明细。
   点项目 → 进项目费用看板（9.2）。⚠ 数据为 mock；AI 经公司网关调 API、采集实际费用为预留接口。
   入口联动：顶栏「今日」按钮写 window.__cbRange；其它页跳入时写 __cbTab/__traceId 预选。
   ============================================================ */

/* ---------- 共享 · 双线趋势图（1 蓝 + 灰，含坐标轴 / 网格 / hover） ----------
   DualLineChart：手绘 SVG 双折线（primary 实线 + secondary 虚线对照）。
   hover 状态根据鼠标 x 位置反算最近数据点，显示竖线 + 圆点 + tooltip。 */
function DualLineChart({ primary, secondary, labels, h = 150, primaryColor = 'var(--blue-primary)', secondaryColor = 'var(--text-400)', valueFmt = (v) => v }) {
  const [hover, setHover] = React.useState(null);
  const wrapRef = React.useRef(null);
  const W = 520, H = h, padL = 8, padR = 8, padT = 12, padB = 22;
  const all = [...primary, ...(secondary || [])];
  const max = Math.max(...all), min = Math.min(0, ...all);
  const span = max - min || 1;
  const n = primary.length;
  const x = i => padL + (i / (n - 1)) * (W - padL - padR);
  const y = v => padT + (1 - (v - min) / span) * (H - padT - padB);
  const path = (arr) => arr.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(d).toFixed(1)}`).join(' ');
  const area = `${path(primary)} L${x(n - 1)} ${H - padB} L${x(0)} ${H - padB} Z`;
  const gid = React.useMemo(() => 'lcg' + Math.random().toString(36).slice(2, 7), []);
  const grids = 3;
  return (
    <div className="lc-wrap" ref={wrapRef}>
      <svg className="lc-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width * W;
          let idx = Math.round((px - padL) / ((W - padL - padR) / (n - 1)));
          idx = Math.max(0, Math.min(n - 1, idx));
          setHover(idx);
        }}
        onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.13" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: grids + 1 }).map((_, i) => {
          const gy = padT + (i / grids) * (H - padT - padB);
          return <line key={i} className="lc-grid" x1={padL} y1={gy} x2={W - padR} y2={gy} />;
        })}
        <path d={area} fill={`url(#${gid})`} />
        {secondary && <path d={path(secondary)} fill="none" stroke={secondaryColor} strokeWidth="1.75" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" />}
        <path d={path(primary)} fill="none" stroke={primaryColor} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        {hover != null && <line className="lc-grid" x1={x(hover)} y1={padT} x2={x(hover)} y2={H - padB} style={{ stroke: 'var(--border-300)' }} />}
        {hover != null && secondary && <circle className="lc-dot" cx={x(hover)} cy={y(secondary[hover])} r="3.5" fill="#fff" stroke={secondaryColor} strokeWidth="2" />}
        {hover != null && <circle className="lc-dot" cx={x(hover)} cy={y(primary[hover])} r="4" fill="#fff" stroke={primaryColor} strokeWidth="2.5" />}
        {labels && labels.map((l, i) => (
          (i % Math.ceil(n / 6) === 0 || i === n - 1) &&
          <text key={i} className="lc-axis-x" x={x(i)} y={H - 6} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>{l}</text>
        ))}
      </svg>
      {hover != null && (
        <div className="lc-tip" style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(primary[hover]) / H) * 100}%` }}>
          {labels && <div style={{ color: 'var(--text-400)', fontSize: 10 }}>{labels[hover]}</div>}
          <div className="mono">{valueFmt(primary[hover])}</div>
          {secondary && <div className="mono" style={{ color: '#cbd5e1' }}>{valueFmt(secondary[hover])}</div>}
        </div>
      )}
    </div>
  );
}

/* 16 周标签 */
const CB_WEEK_LABELS = ['16周前','','','13周前','','','10周前','','','7周前','','','4周前','','','本周'];
/* 整体费用趋势（万元，含人力+采购，比算力高一截，去年同期对照灰线） */
const FEE_TREND   = [52,55,54,58,61,57,64,68,66,72,75,71,78,82,80,86];
const FEE_TREND_LY= [44,46,45,48,50,47,52,55,53,58,60,57,62,65,63,68];
const RUN_TREND_LY= [98,104,101,114,120,116,128,134,130,142,146,140,152,162,156,170];

/* 项目成本分布（取 PROJECTS，按算力成本 cost 排序；runs 按比例派生） */
function projRuns(cost) { return Math.round(cost / 1.64 / 100) * 100; }

/* PortfolioCostBoard — 算力总看板页主体。
   状态：range 时间范围（today/7d/30d/90d/custom）/ cStart-cEnd 自定义区间 / pf 项目集筛选 /
     sort 排序 / tab 三视图。所有数值按 PER（单日实际）× days × 项目集占比 ratio 派生。 */
function PortfolioCostBoard({ onNavigate, onEnterProject }) {
  const [loading, setLoading] = React.useState(true);
  const TODAY = '2026-06-03';
  const [range, setRange] = React.useState(() => {
    const r = window.__cbRange; if (r) { delete window.__cbRange; return r; } return 'today';
  });
  const [cStart, setCStart] = React.useState(TODAY);
  const [cEnd, setCEnd] = React.useState(TODAY);
  const [sort, setSort] = React.useState('cost');
  const [pf, setPf] = React.useState('all');
  const [pfOpen, setPfOpen] = React.useState(false);
  const [rangeOpen, setRangeOpen] = React.useState(false);
  const [tab, setTab] = React.useState(() => { const t = window.__cbTab; if (t) { delete window.__cbTab; return t; } return 'overview'; });
  React.useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);
  React.useEffect(() => { refreshIcons(); });

  const PER = { cost: 48210, runs: 19384, fee: 61428 };          // 单日实际（约数）
  const PRESET_DAYS = { today: 1, '7d': 7, '30d': 30, '90d': 90 };
  const PRESET_LABEL = { today: '今日', '7d': '近 7 天', '30d': '近 30 天', '90d': '近 90 天' };
  const customDays = Math.max(1, Math.round((new Date(cEnd) - new Date(cStart)) / 86400000) + 1);
  const days = range === 'custom' ? customDays : PRESET_DAYS[range];
  const periodShort = range === 'custom' ? `自定义 ${customDays} 天` : PRESET_LABEL[range];
  const periodLabel = range === 'custom' ? (cStart === cEnd ? cStart : `${cStart} ~ ${cEnd}`) : PRESET_LABEL[range];

  const allSum = PROJECTS.reduce((s, p) => s + p.cost, 0);
  const pfProjects = pf === 'all' ? PROJECTS : PROJECTS.filter(p => p.portfolio === pf);
  const pfSum = pfProjects.reduce((s, p) => s + p.cost, 0);
  const ratio = pf === 'all' ? 1 : (pfSum / allSum);
  const pfName = pf === 'all' ? '全部项目集' : (PF_NAME[pf] || pf);
  const totalCost = Math.round(PER.cost * days * ratio);
  const totalRuns = Math.round(PER.runs * days * ratio);
  const totalFee = Math.round(PER.fee * days * ratio);

  // 各项目在所选周期的花费（单日占比 × 天数）
  const dayShare = PER.cost / allSum;
  const rows = pfProjects.map(p => {
    const cost = Math.max(100, Math.round(p.cost * dayShare * days));
    return { ...p, dispCost: cost, runs: projRuns(cost) };
  }).sort((a, b) => sort === 'runs' ? b.runs - a.runs : b.dispCost - a.dispCost);
  const maxCost = Math.max(...rows.map(r => r.dispCost), 1);
  const listedSum = rows.reduce((s, r) => s + r.dispCost, 0);
  const costNow = (totalCost / 10000).toFixed(1);
  const runsNow = Math.round(totalRuns / 1000);

  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: '项目管理工作台' }, { label: '算力总看板' }]} />
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico"><Icon name="receipt" size={22} color="var(--blue-primary)" /></span>
          <div>
            <h1 className="t-h1">算力总看板</h1>
          </div>
        </div>
        <div className="page-head-right">
          <div className="ob-tabs">
            {[['overview', '成本概览', 'layout-dashboard'], ['trace', '全链路追踪', 'git-fork'], ['calls', '调用明细', 'list']].map(([id, lb, ic]) => (
              <button key={id} className="ob-tab" data-on={tab === id} onClick={() => setTab(id)}><Icon name={ic} size={14} color={tab === id ? 'var(--text-900)' : 'var(--text-500)'} />{lb}</button>
            ))}
          </div>
          {tab === 'overview' && (
          <>
          <div className="cb-pf">
            <button className="cb-pf-btn" data-on={pf !== 'all'} onClick={() => setPfOpen(o => !o)}>
              <Icon name="layers" size={15} color={pf !== 'all' ? 'var(--blue-primary)' : 'var(--text-500)'} />
              <span className="cb-pf-label">{pfName}</span>
              <Icon name="chevron-down" size={14} color="var(--text-400)" />
            </button>
            {pfOpen && (
              <>
                <div className="cb-pf-backdrop" onClick={() => setPfOpen(false)} />
                <div className="cb-pf-menu">
                  <button className="cb-pf-opt" data-on={pf === 'all'} onClick={() => { setPf('all'); setPfOpen(false); }}>
                    <Icon name="layers" size={15} color={pf === 'all' ? 'var(--blue-primary)' : 'var(--text-500)'} />
                    <span className="cb-pf-opt-main"><span className="cb-pf-opt-t">全部项目集</span><span className="cb-pf-opt-s">全平台汇总</span></span>
                    {pf === 'all' && <Icon name="check" size={15} color="var(--blue-primary)" />}
                  </button>
                  {PORTFOLIOS.map(po => (
                    <button key={po.id} className="cb-pf-opt" data-on={pf === po.id} onClick={() => { setPf(po.id); setPfOpen(false); }}>
                      <Icon name="folder" size={15} color={pf === po.id ? 'var(--blue-primary)' : 'var(--text-500)'} />
                      <span className="cb-pf-opt-main"><span className="cb-pf-opt-t">{po.name}</span><span className="cb-pf-opt-s">负责人 {po.owner}</span></span>
                      {pf === po.id && <Icon name="check" size={15} color="var(--blue-primary)" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="cb-rp">
            <button className="cb-rp-btn" data-on={rangeOpen || range === 'custom'} onClick={() => setRangeOpen(o => !o)}>
              <Icon name="calendar-range" size={15} color="var(--text-500)" />
              <span className="cb-rp-label">{periodLabel}</span>
              <Icon name="chevron-down" size={14} color="var(--text-400)" />
            </button>
            {rangeOpen && (
              <>
                <div className="cb-pf-backdrop" onClick={() => setRangeOpen(false)} />
                <div className="cb-rp-menu">
                  <div className="cb-rp-sec">快捷范围</div>
                  <div className="cb-rp-presets">
                    {[['today','今天'],['7d','近 7 天'],['30d','近 30 天'],['90d','近 90 天']].map(([id, lb]) => (
                      <button key={id} className="cb-rp-preset" data-on={range === id} onClick={() => { setRange(id); setRangeOpen(false); }}>{lb}</button>
                    ))}
                  </div>
                  <div className="cb-rp-sec">自定义时间范围</div>
                  <div className="cb-rp-custom">
                    <label className="cb-rp-field"><span>开始</span><input type="date" value={cStart} max={cEnd} onChange={e => setCStart(e.target.value)} /></label>
                    <label className="cb-rp-field"><span>结束</span><input type="date" value={cEnd} min={cStart} max={TODAY} onChange={e => setCEnd(e.target.value)} /></label>
                  </div>
                  <div className="cb-rp-foot">
                    <span className="cb-rp-days">共 <span className="mono">{customDays}</span> 天</span>
                    <button className="cb-rp-apply" onClick={() => { setRange('custom'); setRangeOpen(false); }}>应用</button>
                  </div>
                </div>
              </>
            )}
          </div>
          </>
          )}
        </div>
      </div>

      {tab === 'overview' && (loading ? (
        <>
          <div className="cb-cores">{[0,1,2].map(i => <Card key={i} style={{ padding: 22 }}><Skel w="50%" h={14} /><Skel w="60%" h={34} style={{ marginTop: 16 }} /><Skel w="40%" h={12} style={{ marginTop: 16 }} /></Card>)}</div>
          <div className="cb-charts">{[0,1].map(i => <Card key={i} style={{ padding: 20 }}><Skel w="40%" h={14} /><Skel w="100%" h={150} style={{ marginTop: 16 }} /></Card>)}</div>
          <Card style={{ padding: 20 }}>{[0,1,2,3,4].map(i => <Skel key={i} w="100%" h={40} style={{ marginBottom: 10 }} />)}</Card>
        </>
      ) : (
        <>
          {/* 核心三数 */}
          <div className="cb-cores">
            <div className="cb-core lead">
              <span className="cb-live"><span className="dot" />实时数据流</span>
              <div className="cb-core-k"><span className="cb-core-ico" style={{ background: '#fff', border: '1px solid var(--blue-border)' }}><Icon name="gauge" size={16} color="var(--blue-primary)" /></span>总算力成本</div>
              <div className="cb-core-v"><span className="cur">¥</span><CountUp value={totalCost} /></div>
              <div className="cb-core-foot">
                <span className="cb-core-delta" style={{ color: 'var(--success)', background: 'var(--success-bg)' }}><Icon name="trending-down" size={12} color="var(--success)" />单位成本 -3.2%</span>
                <span className="cb-core-note">算力便宜可忽略，趋势向好</span>
              </div>
            </div>
            <div className="cb-core">
              <div className="cb-core-k"><span className="cb-core-ico" style={{ background: 'var(--ai-soft)' }}><Icon name="activity" size={16} color="var(--ai)" /></span>运行总次数</div>
              <div className="cb-core-v"><CountUp value={totalRuns} /><span className="unit">次</span></div>
              <div className="cb-core-foot"><span className="cb-core-delta" style={{ color: 'var(--ai)', background: 'var(--ai-soft)' }}><Icon name="trending-up" size={12} color="var(--ai)" />+9.4%</span><span className="cb-core-note">AI 员工经网关累计调用</span></div>
            </div>
            <div className="cb-core">
              <div className="cb-core-k"><span className="cb-core-ico" style={{ background: 'var(--canvas)' }}><Icon name="wallet" size={16} color="var(--text-500)" /></span>整体费用</div>
              <div className="cb-core-v"><span className="cur">¥</span><CountUp value={totalFee} /></div>
              <div className="cb-core-foot"><span className="cb-core-delta" style={{ color: 'var(--warning)', background: 'var(--warning-bg)' }}><Icon name="user" size={12} color="var(--warning)" />人力占 78%</span><span className="cb-core-note">含人力与对外采购</span></div>
            </div>
          </div>

          {/* 趋势折线 */}
          <div className="cb-charts">
            <div className="cb-chart">
              <div className="cb-chart-head">
                <div><div className="cb-chart-t">算力成本趋势</div><div className="cb-chart-s">近 16 周 · 万元 · 灰线为去年同期</div></div>
                <div className="cb-chart-now"><div className="cb-chart-now-v">{costNow}</div><div className="cb-chart-now-k">{periodShort}（万元）</div></div>
              </div>
              <DualLineChart primary={COST_TREND.map(v => Math.round((v + 18) * ratio))} secondary={COST_TREND.map(v => Math.round((v + 4) * ratio))} labels={CB_WEEK_LABELS} valueFmt={(v) => `¥${v} 万`} />
              <div className="lc-legend">
                <span className="lc-legend-item"><span className="lc-legend-swatch" style={{ background: 'var(--blue-primary)' }} />今年算力成本</span>
                <span className="lc-legend-item"><span className="lc-legend-swatch dash" />去年同期</span>
              </div>
            </div>
            <div className="cb-chart">
              <div className="cb-chart-head">
                <div><div className="cb-chart-t">运行次数趋势</div><div className="cb-chart-s">近 16 周 · 千次 · 灰线为去年同期</div></div>
                <div className="cb-chart-now"><div className="cb-chart-now-v">{runsNow}</div><div className="cb-chart-now-k">{periodShort}（千次）</div></div>
              </div>
              <DualLineChart primary={RUN_TREND.map(v => Math.round(v * ratio))} secondary={RUN_TREND_LY.map(v => Math.round(v * ratio))} labels={CB_WEEK_LABELS} valueFmt={(v) => `${v} 千次`} />
              <div className="lc-legend">
                <span className="lc-legend-item"><span className="lc-legend-swatch" style={{ background: 'var(--blue-primary)' }} />今年运行次数</span>
                <span className="lc-legend-item"><span className="lc-legend-swatch dash" />去年同期</span>
              </div>
            </div>
          </div>

          {/* 项目成本分布 */}
          <div className="cb-dist">
            <div className="cb-dist-head">
              <span className="t"><Icon name="bar-chart-3" size={18} color="var(--blue-primary)" />按项目的花费分布<span style={{ color: 'var(--text-400)', fontWeight: 400, marginLeft: 6 }}>· {periodShort}{pf !== 'all' && ` · ${pfName}`}</span></span>
              <span className="s">{periodLabel}各项目花费明细 · 点击下钻</span>
              <div className="cb-dist-sort">
                <button className="cb-sort-btn" data-on={sort === 'cost'} onClick={() => setSort('cost')}><Icon name="arrow-down-wide-narrow" size={13} color={sort === 'cost' ? 'var(--blue-deep)' : 'var(--text-500)'} />按算力成本</button>
                <button className="cb-sort-btn" data-on={sort === 'runs'} onClick={() => setSort('runs')}><Icon name="arrow-down-wide-narrow" size={13} color={sort === 'runs' ? 'var(--blue-deep)' : 'var(--text-500)'} />按运行次数</button>
              </div>
            </div>
            <div className="cb-bars">
              {rows.map((p, i) => {
                const tone = p.health === '卡点' ? 'danger' : p.health === '关注' ? 'warning' : 'blue';
                return (
                  <button className="cb-bar-row" key={p.pid} onClick={() => onEnterProject && onEnterProject(p)}>
                    <span className="cb-bar-rank" data-top={i < 3}>{String(i + 1).padStart(2, '0')}</span>
                    <span className="cb-bar-name">
                      <span className="cb-bar-name-t">{p.name}</span>
                      <span className="cb-bar-name-id">{p.pid} · {p.owner}</span>
                    </span>
                    <span className="cb-bar-track"><span className="cb-bar-fill" data-tone={tone === 'blue' ? undefined : tone} style={{ width: `${(p.dispCost / maxCost) * 100}%` }} /></span>
                    <span className="cb-bar-cost">¥{p.dispCost.toLocaleString('en-US')}</span>
                    <span className="cb-bar-runs">{p.runs.toLocaleString('en-US')} 次</span>
                    <span className="cb-bar-cta"><Icon name="chevron-right" size={16} color="var(--text-400)" /></span>
                  </button>
                );
              })}
            </div>
            <div className="cb-dist-foot">
              <Icon name="info" size={13} color="var(--text-400)" />
              {periodLabel} · {pfName} 共 <span className="mono">{rows.length}</span> 个项目产生花费，算力成本合计 <span className="mono">¥{listedSum.toLocaleString('en-US')}</span>{pf === 'all' && range !== 'today' && <> · 全平台共 <span className="mono">187</span> 个在运行项目</>}
            </div>
          </div>
        </>
      ))}
      {tab === 'trace' && <TraceView />}
      {tab === 'calls' && <CallLog />}
    </div>
  );
}

Object.assign(window, { PortfolioCostBoard, DualLineChart });
