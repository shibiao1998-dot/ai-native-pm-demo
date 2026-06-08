/* ============================================================
   批 9 · 算力调用观测（全链路追踪 + 调用明细）
   ------------------------------------------------------------
   作用：嵌入「算力总看板」的两个视图（trace / calls），展示 AI / 自动任务的
         计时、Token、输入/输出费用，以及一次需求从输入到立项拆解的全链路成本。
   ⚠ 数据经公司网关（6699.com）逐次采集（预留接口 · 此处为示意数据）。
   ============================================================ */

/* ---------- 格式化工具 ----------
   obFmtCost 金额 / obFmtMs 耗时（ms→s）/ obFmtTok Token（千位缩写）/ obSum 按字段求和。 */
const obFmtCost = (n) => '¥' + (n >= 100 ? n.toFixed(1) : n.toFixed(2));
const obFmtMs = (ms) => ms < 1000 ? ms + ' ms' : (ms / 1000).toFixed(ms < 10000 ? 1 : 0) + ' s';
const obFmtTok = (n) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);
const obSum = (arr, k) => arr.reduce((s, x) => s + x[k], 0);

/* ---------- 触发源 ---------- */
const OB_SRC = {
  mgr:      { label: '管理者意图', icon: 'pen-line', c: 'var(--blue-primary)', bg: 'var(--blue-tint)' },
  strategy: { label: '战略意图',   icon: 'compass',  c: 'var(--info)',         bg: 'var(--info-bg)' },
  auto:     { label: '自动任务',   icon: 'bot',      c: 'var(--ai)',           bg: 'var(--ai-soft)' },
  intervene:{ label: '介入处置',   icon: 'list-checks', c: 'var(--warning)',   bg: 'var(--warning-bg)' },
};

/* ============================================================
   全链路追踪 · 一条需求/任务从触发到完成的逐阶段调用
   ------------------------------------------------------------
   OB_TRACES：每条链路含多个 stage，每个 stage 含多个单次 call（模型/耗时/Token/输入输出费用）。
   阶段与链路总计在渲染时累加（obStageAgg / obTraceAgg），保持一致。⚠ 示意数据。 */
const OB_TRACES = [
  {
    id: 'TRC-2026-0602-01', src: 'mgr', status: 'done',
    title: '门店导购新领域 · 立项与拆解全链路',
    sub: '从录入想法 → 归属判定 → 新建项目集 → 备选池打分 → 自动立项 → 目标拆解',
    project: '智能门店导购（新建）', when: '2026-06-02 14:06', span: '14:06 → 14:09',
    stages: [
      { name: '识别战略意图', agent: '战略分析 Agent', calls: [
        { name: '规划文本意图抽取', model: '推理-Pro 256k', ms: 2200, tin: 3400, tout: 880, cin: 0.20, cout: 0.41 },
        { name: '上传文件解析与摘要', model: '长文-128k', ms: 3100, tin: 11800, tout: 1200, cin: 0.59, cout: 0.56 },
      ] },
      { name: '归属判定 · 比对现有项目集', agent: '战略分析 Agent', calls: [
        { name: '与 4 个项目集北极星比对', model: '推理-Pro 256k', ms: 1800, tin: 5200, tout: 760, cin: 0.31, cout: 0.36 },
        { name: '相似项目向量检索', model: '向量-Emb', ms: 540, tin: 2600, tout: 0, cin: 0.05, cout: 0 },
      ] },
      { name: '新建项目集草拟', agent: '立项 Agent', calls: [
        { name: '项目集方案与北极星生成', model: '推理-Pro 256k', ms: 2600, tin: 4100, tout: 2050, cin: 0.25, cout: 0.96 },
      ] },
      { name: '备选池六维分析', agent: '备选评估 Agent', calls: [
        { name: '外部市场调研（联网 Tavily）', model: '推理-Pro 256k', ms: 5200, tin: 9400, tout: 1800, cin: 0.56, cout: 0.85 },
        { name: '六维加权打分', model: '推理-Flash', ms: 1400, tin: 4800, tout: 900, cin: 0.12, cout: 0.18 },
      ] },
      { name: '自动立项', agent: '立项 Agent', calls: [
        { name: '立项章程与目标书生成', model: '推理-Pro 256k', ms: 3400, tin: 6200, tout: 3100, cin: 0.37, cout: 1.46 },
      ] },
      { name: '目标树拆解', agent: '目标拆解 Agent', calls: [
        { name: '理想态 → 中短期拆解', model: '推理-Pro 256k', ms: 2900, tin: 5400, tout: 2600, cin: 0.32, cout: 1.22 },
        { name: '中短期 → 周计划 / 事务拆解', model: '推理-Pro 256k', ms: 3200, tin: 6100, tout: 3300, cin: 0.37, cout: 1.55 },
      ] },
    ],
  },
  {
    id: 'TRC-2026-0602-02', src: 'strategy', status: 'done',
    title: '战略更新「自助化优先」· 影响传导全链路',
    sub: '战略文档比对 → 影响分析 → 现有项目承接 → 备选池复盘打分',
    project: '客户服务自助化', when: '2026-06-02 06:30', span: '06:30 → 06:32',
    stages: [
      { name: '战略文档比对', agent: '战略分析 Agent', calls: [
        { name: '昨日→今日逐条 diff', model: '长文-128k', ms: 2400, tin: 9200, tout: 640, cin: 0.46, cout: 0.30 },
      ] },
      { name: '影响分析 · 按项目集筛选', agent: '战略分析 Agent', calls: [
        { name: '条款 → 项目集关联二次分析', model: '推理-Pro 256k', ms: 2100, tin: 5600, tout: 1100, cin: 0.33, cout: 0.52 },
      ] },
      { name: '现有项目承接修改', agent: '立项 Agent', calls: [
        { name: '母项目核心价值 / 目标改写', model: '推理-Pro 256k', ms: 2700, tin: 4900, tout: 1900, cin: 0.29, cout: 0.89 },
        { name: '新增子项目拆解入池', model: '推理-Flash', ms: 1300, tin: 3800, tout: 820, cin: 0.10, cout: 0.16 },
      ] },
      { name: '备选池复盘打分', agent: '备选评估 Agent', calls: [
        { name: '候选六维重新打分', model: '推理-Flash', ms: 1600, tin: 5200, tout: 1000, cin: 0.13, cout: 0.20 },
      ] },
    ],
  },
  {
    id: 'TRC-2026-0603-07', src: 'auto', status: 'run',
    title: '异常调度自愈 · 自动任务链路',
    sub: '异常检测 → 根因分析 → 自愈策略生成 → 执行校验',
    project: '智能履约调度中台', when: '2026-06-03 09:48', span: '09:48 → 进行中',
    stages: [
      { name: '异常检测', agent: '风控建模 Agent', calls: [
        { name: '实时指标异常识别', model: '推理-Flash', ms: 900, tin: 2800, tout: 420, cin: 0.07, cout: 0.08 },
      ] },
      { name: '根因分析', agent: '风控建模 Agent', calls: [
        { name: '多源日志根因定位', model: '推理-Pro 256k', ms: 3600, tin: 8200, tout: 1500, cin: 0.49, cout: 0.70 },
      ] },
      { name: '自愈策略生成', agent: '调度算法 Agent', calls: [
        { name: '候选自愈动作编排', model: '推理-Pro 256k', ms: 2400, tin: 4600, tout: 1700, cin: 0.27, cout: 0.80 },
      ] },
    ],
  },
];

/* 阶段累计：obStageAgg 把 calls 汇总到阶段；obTraceAgg 再把阶段汇总到整条链路。 */
function obStageAgg(stage) {
  const c = stage.calls;
  return { ms: obSum(c, 'ms'), tin: obSum(c, 'tin'), tout: obSum(c, 'tout'), cin: obSum(c, 'cin'), cout: obSum(c, 'cout') };
}
function obTraceAgg(trace) {
  const aggs = trace.stages.map(obStageAgg);
  return {
    ms: obSum(aggs, 'ms'), tin: obSum(aggs, 'tin'), tout: obSum(aggs, 'tout'),
    cin: obSum(aggs, 'cin'), cout: obSum(aggs, 'cout'),
    calls: trace.stages.reduce((s, st) => s + st.calls.length, 0),
  };
}

const OB_STAGE_C = ['var(--blue-primary)', 'var(--info)', 'var(--ai)', 'oklch(0.6 0.13 300)', 'var(--success)', 'oklch(0.62 0.13 30)'];

/* ---------- 全链路追踪视图 ----------
   TraceView：状态 selId 当前链路 / openStage 展开的阶段。
   核心是「阶段瓦并」图：阶段串行，用 offsets 累加起点画出时间轴位置；点阶段展开看单次调用。
   initId 可由其他页写 window.__traceId 预选（如新领域立项跳「查看全链路成本」）。 */
function TraceView() {
  const initId = (() => { const t = window.__traceId; if (t) { delete window.__traceId; return t; } return OB_TRACES[0].id; })();
  const [selId, setSelId] = React.useState(initId);
  const [openStage, setOpenStage] = React.useState(0);
  const [pickOpen, setPickOpen] = React.useState(false);
  const trace = OB_TRACES.find(t => t.id === selId) || OB_TRACES[0];
  const curSrc = OB_SRC[trace.src];
  React.useEffect(() => { refreshIcons(); });

  const total = obTraceAgg(trace);
  const stageAggs = trace.stages.map(obStageAgg);
  const maxStageMs = Math.max(...stageAggs.map(a => a.ms), 1);
  // 瀑布：阶段顺序串行，左偏移=累计起点
  let acc = 0;
  const offsets = stageAggs.map(a => { const o = acc; acc += a.ms; return o; });
  const totalMs = acc || 1;

  return (
    <div className="ob-trace">
      {/* 链路选择 · 下拉框 */}
      <div className="ob-trace-select" onClick={(e) => e.stopPropagation()}>
        <div className="ob-select">
          <button className="ob-select-btn" data-on={pickOpen} onClick={() => setPickOpen(o => !o)}>
            <span className="ob-src" style={{ color: curSrc.c, background: curSrc.bg }}><Icon name={curSrc.icon} size={12} color={curSrc.c} />{curSrc.label}</span>
            <span className="ob-select-t">{trace.title}</span>
            {trace.status === 'run' && <span className="ob-run-dot" title="进行中" />}
            <Icon name="chevron-down" size={15} color="var(--text-400)" />
          </button>
          {pickOpen && (
            <>
              <div className="cb-pf-backdrop" onClick={() => setPickOpen(false)} />
              <div className="ob-select-menu">
                {OB_TRACES.map(t => {
                  const s = OB_SRC[t.src];
                  const ag = obTraceAgg(t);
                  return (
                    <button key={t.id} className="ob-select-opt" data-on={t.id === selId} onClick={() => { setSelId(t.id); setOpenStage(0); setPickOpen(false); }}>
                      <span className="ob-src" style={{ color: s.c, background: s.bg }}><Icon name={s.icon} size={12} color={s.c} />{s.label}</span>
                      <span className="ob-select-opt-main">
                        <span className="ob-select-opt-t">{t.title}{t.status === 'run' && <span className="ob-run-dot" />}</span>
                        <span className="ob-select-opt-s">{t.project} · {t.when}</span>
                      </span>
                      <span className="ob-select-opt-metrics">
                        <span className="mono ob-select-opt-cost">{obFmtCost(ag.cin + ag.cout)}</span>
                        <span className="mono ob-select-opt-sub">{obFmtMs(ag.ms)} · {ag.calls} 次</span>
                      </span>
                      {t.id === selId && <Icon name="check" size={15} color="var(--blue-primary)" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 概要 */}
      <div className="ob-trace-head">
        <div className="ob-trace-head-main">
          <div className="ob-trace-title">{trace.title}{trace.status === 'run' && <span className="ob-run-tag"><span className="ob-run-dot" />进行中</span>}</div>
          <div className="ob-trace-sub">{trace.sub}</div>
          <div className="ob-trace-meta">
            <span><Icon name="box" size={13} color="var(--text-400)" />{trace.project}</span>
            <span className="mono"><Icon name="hash" size={13} color="var(--text-400)" />{trace.id}</span>
            <span className="mono"><Icon name="clock" size={13} color="var(--text-400)" />{trace.span}</span>
          </div>
        </div>
        <div className="ob-trace-kpis">
          <div className="ob-kpi is-lead"><span className="ob-kpi-k">链路总花费</span><span className="ob-kpi-v mono">{obFmtCost(total.cin + total.cout)}</span><span className="ob-kpi-s">输入 {obFmtCost(total.cin)} · 输出 {obFmtCost(total.cout)}</span></div>
          <div className="ob-kpi"><span className="ob-kpi-k">总耗时</span><span className="ob-kpi-v mono">{obFmtMs(total.ms)}</span><span className="ob-kpi-s">{trace.stages.length} 阶段串行</span></div>
          <div className="ob-kpi"><span className="ob-kpi-k">总 Token</span><span className="ob-kpi-v mono">{obFmtTok(total.tin + total.tout)}</span><span className="ob-kpi-s">入 {obFmtTok(total.tin)} · 出 {obFmtTok(total.tout)}</span></div>
          <div className="ob-kpi"><span className="ob-kpi-k">调用次数</span><span className="ob-kpi-v mono">{total.calls}</span><span className="ob-kpi-s">经网关采集</span></div>
        </div>
      </div>

      {/* 阶段瀑布 */}
      <div className="ob-wf">
        <div className="ob-wf-axis"><span>触发</span><span>耗时轴（串行）</span><span>完成 · {obFmtMs(totalMs)}</span></div>
        {trace.stages.map((st, i) => {
          const a = stageAggs[i];
          const c = OB_STAGE_C[i % OB_STAGE_C.length];
          const open = openStage === i;
          return (
            <div className="ob-wf-stage" key={i} data-open={open}>
              <button className="ob-wf-row" onClick={() => setOpenStage(open ? -1 : i)}>
                <span className="ob-wf-idx" style={{ background: c }}>{i + 1}</span>
                <span className="ob-wf-name">
                  <span className="ob-wf-name-t">{st.name}</span>
                  <span className="ob-wf-name-s"><span className="ob-ava">{st.agent[0]}</span>{st.agent} · {st.calls.length} 次调用</span>
                </span>
                <span className="ob-wf-track">
                  <span className="ob-wf-bar" style={{ left: `${(offsets[i] / totalMs) * 100}%`, width: `${Math.max(2, (a.ms / totalMs) * 100)}%`, background: c }} />
                </span>
                <span className="ob-wf-nums">
                  <span className="ob-wf-num mono" title="耗时"><Icon name="clock" size={12} color="var(--text-400)" />{obFmtMs(a.ms)}</span>
                  <span className="ob-wf-num mono" title="Token 入 / 出"><Icon name="coins" size={12} color="var(--text-400)" />{obFmtTok(a.tin)}/{obFmtTok(a.tout)}</span>
                  <span className="ob-wf-num mono is-cost" title="本阶段费用"><span className="cur">¥</span>{(a.cin + a.cout).toFixed(2)}</span>
                </span>
                <Icon name={open ? 'chevron-up' : 'chevron-down'} size={15} color="var(--text-400)" />
              </button>
              {open && (
                <div className="ob-wf-calls">
                  <div className="ob-call-h">
                    <span>单次调用</span><span>模型</span><span className="num">耗时</span><span className="num">输入 Tok</span><span className="num">输出 Tok</span><span className="num">输入费用</span><span className="num">输出费用</span>
                  </div>
                  {st.calls.map((cl, k) => (
                    <div className="ob-call-r" key={k}>
                      <span className="ob-call-nm"><span className="ob-call-dot" style={{ background: c }} />{cl.name}</span>
                      <span className="ob-call-model"><span className="ob-model-tag">{cl.model}</span></span>
                      <span className="num mono">{obFmtMs(cl.ms)}</span>
                      <span className="num mono">{cl.tin.toLocaleString('en-US')}</span>
                      <span className="num mono">{cl.tout.toLocaleString('en-US')}</span>
                      <span className="num mono">{obFmtCost(cl.cin)}</span>
                      <span className="num mono">{obFmtCost(cl.cout)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 阶段花费占比条 */}
      <div className="ob-share">
        <div className="ob-share-h"><Icon name="pie-chart" size={14} color="var(--text-400)" />各阶段花费占比 · 合计 <span className="mono" style={{ color: 'var(--text-900)', fontWeight: 600 }}>{obFmtCost(total.cin + total.cout)}</span></div>
        <div className="ob-share-bar">
          {trace.stages.map((st, i) => {
            const a = stageAggs[i];
            const pct = ((a.cin + a.cout) / (total.cin + total.cout)) * 100;
            return <span key={i} className="ob-share-seg" style={{ width: pct + '%', background: OB_STAGE_C[i % OB_STAGE_C.length] }} title={`${st.name} · ${obFmtCost(a.cin + a.cout)}（${pct.toFixed(0)}%）`} />;
          })}
        </div>
        <div className="ob-share-legend">
          {trace.stages.map((st, i) => {
            const a = stageAggs[i];
            return <span className="ob-share-lg" key={i}><span className="ob-share-sw" style={{ background: OB_STAGE_C[i % OB_STAGE_C.length] }} />{st.name}<b className="mono">{obFmtCost(a.cin + a.cout)}</b></span>;
          })}
        </div>
      </div>

      <div className="ob-note"><Icon name="info" size={13} color="var(--text-400)" />费用经公司网关（6699.com）按 API Key 逐次采集，区分输入 / 输出计价；计时、Token 与状态同源记录（示意数据，接口已预留）。</div>
    </div>
  );
}

/* ============================================================
   调用明细 · 每条 AI / 自动任务调用的扁平日志
   ------------------------------------------------------------
   OB_CALLS：扁平调用流水（时间/触发源/任务/Agent/模型/耗时/Token/费用/状态）。⚠ 示意数据。 */
const OB_CALLS = [
  { id: 'CALL-9f2a', time: '06-03 09:48:12', src: 'auto', task: '实时指标异常识别', agent: '风控建模 Agent', model: '推理-Flash', ms: 900, tin: 2800, tout: 420, cin: 0.07, cout: 0.08, status: 'done' },
  { id: 'CALL-9f31', time: '06-03 09:48:21', src: 'auto', task: '多源日志根因定位', agent: '风控建模 Agent', model: '推理-Pro 256k', ms: 3600, tin: 8200, tout: 1500, cin: 0.49, cout: 0.70, status: 'done' },
  { id: 'CALL-9f3d', time: '06-03 09:49:05', src: 'auto', task: '候选自愈动作编排', agent: '调度算法 Agent', model: '推理-Pro 256k', ms: 2400, tin: 4600, tout: 1700, cin: 0.27, cout: 0.80, status: 'run' },
  { id: 'CALL-8c10', time: '06-03 08:12:40', src: 'intervene', task: '卡点影响面评估', agent: '调度算法 Agent', model: '推理-Pro 256k', ms: 2800, tin: 5100, tout: 1300, cin: 0.30, cout: 0.61, status: 'done' },
  { id: 'CALL-8b94', time: '06-03 07:55:02', src: 'auto', task: '周计划事务自动编排', agent: '目标拆解 Agent', model: '推理-Flash', ms: 1500, tin: 4200, tout: 980, cin: 0.11, cout: 0.19, status: 'done' },
  { id: 'CALL-7a22', time: '06-02 14:06:08', src: 'mgr', task: '规划文本意图抽取', agent: '战略分析 Agent', model: '推理-Pro 256k', ms: 2200, tin: 3400, tout: 880, cin: 0.20, cout: 0.41, status: 'done' },
  { id: 'CALL-7a2e', time: '06-02 14:06:31', src: 'mgr', task: '上传文件解析与摘要', agent: '战略分析 Agent', model: '长文-128k', ms: 3100, tin: 11800, tout: 1200, cin: 0.59, cout: 0.56, status: 'done' },
  { id: 'CALL-7a55', time: '06-02 14:07:44', src: 'mgr', task: '外部市场调研（联网）', agent: '备选评估 Agent', model: '推理-Pro 256k', ms: 5200, tin: 9400, tout: 1800, cin: 0.56, cout: 0.85, status: 'done' },
  { id: 'CALL-7a90', time: '06-02 14:08:50', src: 'mgr', task: '立项章程与目标书生成', agent: '立项 Agent', model: '推理-Pro 256k', ms: 3400, tin: 6200, tout: 3100, cin: 0.37, cout: 1.46, status: 'done' },
  { id: 'CALL-6d01', time: '06-02 06:30:10', src: 'strategy', task: '昨日→今日战略 diff', agent: '战略分析 Agent', model: '长文-128k', ms: 2400, tin: 9200, tout: 640, cin: 0.46, cout: 0.30, status: 'done' },
  { id: 'CALL-6d2b', time: '06-02 06:31:02', src: 'strategy', task: '母项目目标改写', agent: '立项 Agent', model: '推理-Pro 256k', ms: 2700, tin: 4900, tout: 1900, cin: 0.29, cout: 0.89, status: 'done' },
  { id: 'CALL-6d3f', time: '06-02 06:31:40', src: 'strategy', task: '候选六维重新打分', agent: '备选评估 Agent', model: '推理-Flash', ms: 1600, tin: 5200, tout: 1000, cin: 0.13, cout: 0.20, status: 'done' },
  { id: 'CALL-5e77', time: '06-02 02:00:03', src: 'auto', task: '验收证据自动核验', agent: '验收 Agent', model: '推理-Pro 256k', ms: 3000, tin: 6800, tout: 1400, cin: 0.40, cout: 0.66, status: 'done' },
  { id: 'CALL-5e80', time: '06-02 02:00:55', src: 'auto', task: '风险卡点识别与留痕', agent: '风控建模 Agent', model: '推理-Flash', ms: 1100, tin: 3600, tout: 700, cin: 0.09, cout: 0.14, status: 'done' },
];

/* CallLog — 调用明细视图。状态 src 触发源筛选 / sort 排序（时间/费用/耗时）。表格逐条呈现调用。 */
function CallLog() {
  const [src, setSrc] = React.useState('all');
  const [sort, setSort] = React.useState('time');
  React.useEffect(() => { refreshIcons(); });

  const counts = React.useMemo(() => {
    const c = { all: OB_CALLS.length };
    Object.keys(OB_SRC).forEach(k => c[k] = OB_CALLS.filter(x => x.src === k).length);
    return c;
  }, []);
  const rows = React.useMemo(() => {
    let v = src === 'all' ? OB_CALLS : OB_CALLS.filter(x => x.src === src);
    v = [...v].sort((a, b) => sort === 'cost' ? (b.cin + b.cout) - (a.cin + a.cout) : sort === 'ms' ? b.ms - a.ms : b.time.localeCompare(a.time));
    return v;
  }, [src, sort]);
  const sumCost = obSum(rows, 'cin') + obSum(rows, 'cout');
  const sumTok = obSum(rows, 'tin') + obSum(rows, 'tout');

  return (
    <div className="ob-log">
      <div className="ob-log-bar">
        <div className="ob-log-filters">
          <button className="ob-fchip" data-on={src === 'all'} onClick={() => setSrc('all')}>全部<span className="mono">{counts.all}</span></button>
          {Object.keys(OB_SRC).map(k => (
            <button key={k} className="ob-fchip" data-on={src === k} onClick={() => setSrc(k)}>
              <Icon name={OB_SRC[k].icon} size={13} color={src === k ? OB_SRC[k].c : 'var(--text-500)'} />{OB_SRC[k].label}<span className="mono">{counts[k]}</span>
            </button>
          ))}
        </div>
        <div className="ob-log-sort">
          <span className="t-micro" style={{ color: 'var(--text-400)' }}>排序</span>
          <button className="cb-sort-btn" data-on={sort === 'time'} onClick={() => setSort('time')}>时间</button>
          <button className="cb-sort-btn" data-on={sort === 'cost'} onClick={() => setSort('cost')}>费用</button>
          <button className="cb-sort-btn" data-on={sort === 'ms'} onClick={() => setSort('ms')}>耗时</button>
        </div>
      </div>

      <div className="ob-log-table">
        <table className="dtable ob-table">
          <thead><tr>
            <th><span className="th-in">时间 · 触发源</span></th>
            <th><span className="th-in">任务 / Agent</span></th>
            <th><span className="th-in">模型</span></th>
            <th className="num"><span className="th-in">耗时</span></th>
            <th className="num"><span className="th-in">输入 Tok</span></th>
            <th className="num"><span className="th-in">输出 Tok</span></th>
            <th className="num"><span className="th-in">输入费用</span></th>
            <th className="num"><span className="th-in">输出费用</span></th>
            <th className="num"><span className="th-in">合计</span></th>
            <th><span className="th-in">状态</span></th>
          </tr></thead>
          <tbody>
            {rows.map(r => {
              const s = OB_SRC[r.src];
              return (
                <tr key={r.id}>
                  <td>
                    <div className="ob-tl-time">
                      <span className="mono ob-tl-t">{r.time}</span>
                      <span className="ob-src sm" style={{ color: s.c, background: s.bg }}><Icon name={s.icon} size={11} color={s.c} />{s.label}</span>
                    </div>
                  </td>
                  <td>
                    <div className="ob-tl-task">
                      <span className="ob-tl-task-t">{r.task}</span>
                      <span className="ob-tl-task-s"><span className="ob-ava sm">{r.agent[0]}</span>{r.agent}</span>
                    </div>
                  </td>
                  <td><span className="ob-model-tag">{r.model}</span></td>
                  <td className="num mono">{obFmtMs(r.ms)}</td>
                  <td className="num mono">{r.tin.toLocaleString('en-US')}</td>
                  <td className="num mono">{r.tout.toLocaleString('en-US')}</td>
                  <td className="num mono">{obFmtCost(r.cin)}</td>
                  <td className="num mono">{obFmtCost(r.cout)}</td>
                  <td className="num mono ob-tl-total">{obFmtCost(r.cin + r.cout)}</td>
                  <td>{r.status === 'run' ? <Pill tone="ai">执行中</Pill> : <Pill tone="success">已完成</Pill>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="cb-dist-foot">
        <Icon name="info" size={13} color="var(--text-400)" />
        共 <span className="mono">{rows.length}</span> 次调用 · Token 合计 <span className="mono">{sumTok.toLocaleString('en-US')}</span> · 费用合计 <span className="mono">{obFmtCost(sumCost)}</span> · 经网关逐次采集（示意数据）
      </div>
    </div>
  );
}

Object.assign(window, { TraceView, CallLog, OB_TRACES, obTraceAgg, obFmtCost, obFmtMs, obFmtTok });
