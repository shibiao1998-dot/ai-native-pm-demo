/* ============================================================
   批 5 · 执行层事务  —  数据 + 5.1 事务看板（状态机泳道 + 拖拽） + 外壳
   ------------------------------------------------------------
   作用：执行层事务的看板与外壳。事务按状态机分泳道，可拖拽改状态；
         外壳在「事务看板 / 6699.com 派发 / 事务详情」三个视图间同源切换。
   依赖：批 0 设计系统与外壳；事务六要素 / 五类型 / 6699.com / 算力成本。
   数据：TASKS_W23 为 mock 事务；TaskDetail/Dispatch6699 在姊妹文件。
   ============================================================ */

/* 五类型（色分 · 低饱和 oklch，区别于状态语义色）。 */
const TASK_TYPE = {
  design:   { label: '设计',     icon: 'pen-tool',     c: 'oklch(0.55 0.13 285)', bg: 'oklch(0.968 0.018 285)' },
  dev:      { label: '研发',     icon: 'code-xml',     c: 'oklch(0.52 0.12 250)', bg: 'oklch(0.966 0.018 250)' },
  resource: { label: '资源生产', icon: 'package',      c: 'oklch(0.52 0.10 175)', bg: 'oklch(0.962 0.020 175)' },
  ops:      { label: '运营',     icon: 'megaphone',    c: 'oklch(0.55 0.10 55)',  bg: 'oklch(0.964 0.022 70)' },
  other:    { label: '其他',     icon: 'shapes',       c: 'var(--text-500)',      bg: 'var(--neutral-bg)' },
};

/* 状态机（看板列严格对应）：草稿→待审→执行中→待验收→已完成，另有 延期/失败 两个异常态。
   LANES 是看板的泳道顺序。 */
const TASK_STATUS = {
  draft:   { label: '草稿',   c: 'var(--text-500)', bg: 'var(--neutral-bg)', rail: 'var(--text-400)', icon: 'pencil-line' },
  review:  { label: '待审',   c: 'var(--info)',     bg: 'var(--info-bg)',    rail: 'var(--info)',     icon: 'clipboard-list' },
  running: { label: '执行中', c: 'var(--ai)',       bg: 'var(--ai-soft)',    rail: 'var(--ai)',       icon: 'loader-2', spin: true },
  accept:  { label: '待验收', c: 'var(--warning)',  bg: 'var(--warning-bg)', rail: 'var(--warning)',  icon: 'clipboard-check' },
  done:    { label: '已完成', c: 'var(--success)',  bg: 'var(--success-bg)', rail: 'var(--success)',  icon: 'circle-check' },
  delayed: { label: '延期',   c: 'var(--warning)',  bg: 'var(--warning-bg)', rail: '#C9761A',         icon: 'alarm-clock' },
  failed:  { label: '失败',   c: 'var(--danger)',   bg: 'var(--danger-bg)',  rail: 'var(--danger)',   icon: 'x-circle' },
};
const LANES = ['draft', 'review', 'running', 'accept', 'done', 'delayed', 'failed'];

/* 事务数据（第 23 周 · 智能履约调度中台）。
   每条事务携：type 类型 / status 状态 / ai 执行 Agent / dl 截止 / cost 算力成本；
   部分携 six（事务六要素）/ output（产出与过程）/ accept（验收状态）。⚠ mock。 */
const TASKS_W23 = [
  { id: 'T-0301', title: '调度结果可视化看板设计', type: 'design', status: 'draft', ai: '体验设计 Agent', dl: '06-08', cost: 0 },
  { id: 'T-0302', title: '异常告警文案规范', type: 'ops', status: 'draft', ai: '运营策略 Agent', dl: '06-09', cost: 0 },

  { id: 'T-0297', title: '实时数据管道压测方案', type: 'dev', status: 'review', ai: '数据工程 Agent', dl: '06-05', cost: 120 },
  { id: 'T-0299', title: '高峰扩容弹性策略', type: 'dev', status: 'review', ai: '算力调度 Agent', dl: '06-06', cost: 90 },

  { id: 'T-0291', title: '调度算法灰度策略实现', type: 'dev', status: 'running', ai: '调度算法 Agent', dl: '06-04', cost: 3420,
    six: {
      what: '实现调度算法的灰度放量策略模块，支持按区域 / 时段维度分桶放量与一键回滚。',
      why: '新调度策略需在真实流量下验证效果，灰度放量可在控制风险的前提下逐步替换存量策略，直接支撑「调度时效提升 30%」中短期目标。',
      how: ['在现有调度服务内扩展，不改动既有同步调用链路。', '放量与回滚开关需可由运营在控制台配置。', '不指定具体分桶算法，由 AI 员工依据效果自行选型。'],
      criteria: ['支持区域 / 时段两个维度的灰度分桶。', '回滚生效时延 < 5s，且不丢失在途调度。', '所有灰度配置变更写入留痕。'],
      effect: '调度新策略可安全灰度上线，效果归因数据完整，为后续全量放量提供决策依据。',
    },
    output: { title: '灰度策略模块 v0.3', sub: '调度算法 Agent · 已产出核心代码与配置 Schema',
      process: [
        { t: '解析六要素并确认范围边界', s: '识别「不改动同步链路」约束', time: '06-02 09:10', done: true },
        { t: '生成灰度分桶与回滚设计', s: '选用区域 × 时段二维分桶', time: '06-02 11:40', done: true },
        { t: '产出模块代码与配置 Schema', s: '提交单元测试覆盖 82%', time: '06-03 15:20', done: true },
        { t: '自检回滚时延', s: '实测 3.2s，待验收 AI 复核', time: '06-03 16:05', done: false },
      ] },
    accept: { state: 'running' } },

  { id: 'T-0293', title: '区域路况数据接入开发', type: 'dev', status: 'running', ai: '数据接入 Agent', dl: '06-04', cost: 2180,
    accept: { state: 'running' } },
  { id: 'T-0295', title: '调度播报短信模板生成', type: 'resource', status: 'running', ai: '内容生成 Agent', dl: '06-05', cost: 640,
    accept: { state: 'running' } },

  { id: 'T-0288', title: '路况源选型与采购', type: 'other', status: 'accept', ai: '采购协同 Agent', dl: '06-03', cost: 320,
    six: {
      what: '完成第三方实时路况数据源的对比选型，并发起年度授权采购。',
      why: '调度时效依赖稳定低时延的路况输入，需要在候选数据源中选出满足口径者并落地采购。',
      how: ['对比不少于 2 家候选源的时延、覆盖与 SLA。', '输出选型对照表与采购建议。', '采购金额若触发大额阈值需上抛成本审批，不在本事务内拍板。'],
      criteria: ['给出可追溯的选型对照表。', '入选源端到端时延实测 < 30s。', '采购合规口径齐备、预算对齐。'],
      effect: '路况数据源明确且合规可用，调度链路具备达标的数据基础。',
    },
    output: { title: '选型对照表 + 采购建议', sub: '采购协同 Agent · 已提交，验收 AI 审核中',
      process: [
        { t: '拉取候选源并采集指标', s: '覆盖 3 家候选 · 时延 / 覆盖 / SLA', time: '06-01 10:00', done: true },
        { t: '生成选型对照表', s: '入选源实测时延 28s', time: '06-01 14:30', done: true },
        { t: '输出采购建议并触发审批', s: '金额触发大额成本审批，已上抛', time: '06-02 09:20', done: true },
      ] },
    accept: { state: 'running', note: '验收 AI 正在按「选型可追溯 + 时延达标 + 合规」标准审核。' } },

  { id: 'T-0290', title: '异常自愈规则配置', type: 'ops', status: 'accept', ai: '风控运营 Agent', dl: '06-03', cost: 1150,
    accept: { state: 'running' } },

  { id: 'T-0285', title: '灰度放量监控面板', type: 'design', status: 'done', ai: '体验设计 Agent', dl: '05-30', cost: 1760,
    six: {
      what: '设计调度灰度放量的实时监控面板，呈现分桶效果与回滚入口。',
      why: '运营需要在放量过程中实时观测时效 / 成本对比，并能快速回滚。',
      how: ['复用批 0 设计系统组件与色板。', '面板信息密度对齐管理层观测习惯。', '不规定具体图表库实现。'],
      criteria: ['关键指标一屏可见，回滚入口显著。', '五态（含 AI 处理态）覆盖。', '通过设计规范走查。'],
      effect: '灰度放量过程可观测、可干预，降低放量风险。',
    },
    output: { title: '监控面板高保真稿 v2', sub: '体验设计 Agent · 已交付并验收通过',
      process: [
        { t: '梳理观测指标与信息架构', s: '对齐管理层观测路径', time: '05-27 10:00', done: true },
        { t: '产出高保真稿', s: '复用设计系统组件', time: '05-28 16:00', done: true },
        { t: '规范走查与修订', s: '修订 2 处密度问题', time: '05-29 11:00', done: true },
      ] },
    accept: { state: 'pass', date: '05-30 09:40', note: '一屏可见、回滚显著、五态齐备，验收通过。' } },

  { id: 'T-0286', title: '调度特征数据生产', type: 'resource', status: 'done', ai: '数据标注 Agent', dl: '05-29', cost: 4920,
    accept: { state: 'pass', date: '05-29 17:10' } },

  { id: 'T-0294', title: '跨区域调度联调', type: 'dev', status: 'delayed', ai: '集成测试 Agent', dl: '05-31', cost: 2610, delay: 3, blocked: '依赖第三方运力 API（T-0292 已失败）未就位',
    accept: { state: 'pending' } },

  { id: 'T-0292', title: '第三方运力 API 对接', type: 'dev', status: 'failed', ai: '集成开发 Agent', dl: '05-28', cost: 980, fail: '对方接口连续返回鉴权错误，三轮迭代仍无法联通，已标失败并沉淀问题。',
    accept: { state: 'fail', date: '05-28 20:30' } },
];

const TASK_MAP = {};
TASKS_W23.forEach(t => { TASK_MAP[t.id] = t; });

/* 版本驱动的周筛选 —— 周为主选项，前置依赖映射到：阶段目标版本 → 中短期目标版本。
   buildWeekIndex：把 MID_VERSIONS 展平为 [{week, phase, mid}] 索引，供三级联动筛选反查。 */
function buildWeekIndex() {
  const out = [];
  (window.MID_VERSIONS || []).forEach(mid => (mid.months || []).forEach(ph => (ph.weeks || []).forEach(w => out.push({ week: w, phase: ph, mid }))));
  return out;
}
const CURRENT_WEEK = '2026年06月第1周';
const shortWeek = (w) => (w || '').replace(/^\d{4}年/, '');

/* VfDrop — 版本筛选下拉（前置依赖链共用）。open 控展开，primary 为主筛选样式。 */
function VfDrop({ icon, kicker, label, sub, options, value, onChange, primary }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className={`tb-vf-drop${primary ? ' is-primary' : ''}`}>
      <button className="tb-vf-btn" onClick={() => setOpen(o => !o)}>
        {icon && <span className="tb-vf-ico"><Icon name={icon} size={15} color={primary ? 'var(--blue-primary)' : 'var(--text-500)'} /></span>}
        <span className="tb-vf-col">
          <span className="tb-vf-kicker">{kicker}</span>
          <span className="tb-vf-val">{label}{sub && <span className="tb-vf-sub">{sub}</span>}</span>
        </span>
        <Icon name="chevron-down" size={13} color="var(--text-400)" />
      </button>
      {open && (
        <div className="tb-vf-menu" onMouseLeave={() => setOpen(false)}>
          <div className="tb-vf-menu-h">{kicker}</div>
          {options.length ? options.map(o => (
            <button key={o.id} className="tb-vf-item" data-on={o.id === value} onClick={() => { onChange(o.id); setOpen(false); }}>
              <span className="tb-vf-item-l">{o.label}</span>
              {o.sub && <span className="tb-vf-item-r">{o.sub}</span>}
              {o.tag && <span className="tb-vf-item-tag">{o.tag}</span>}
            </button>
          )) : <div className="tb-vf-empty">该版本下暂无周计划</div>}
        </div>
      )}
    </div>
  );
}

/* VersionWeekFilter — 前置依赖链：中短期目标版本 → 阶段目标版本 → 周（主选项）。
   上级变化联动重置下级；选周后反查并同步上两级（见外壳的 onWeek）。 */
function VersionWeekFilter({ midId, phaseId, weekKey, onMid, onPhase, onWeek }) {
  const mids = window.MID_VERSIONS || [];
  const mid = mids.find(m => m.id === midId) || mids[0] || {};
  const phases = mid.months || [];
  const phase = phases.find(p => p.id === phaseId) || phases[0] || {};
  const weeks = phase.weeks || [];
  return (
    <div className="tb-vf">
      <span className="tb-vf-dep">前置依赖</span>
      <VfDrop icon="flag" kicker="中短期目标版本" label={`v${mid.id}`} sub={mid.q}
        value={mid.id} onChange={onMid}
        options={mids.map(m => ({ id: m.id, label: `v${m.id}`, sub: m.q, tag: m.current ? '当前' : undefined }))} />
      <Icon name="chevron-right" size={15} color="var(--border-300)" />
      <VfDrop icon="milestone" kicker="阶段目标版本" label={`v${phase.id || '—'}`} sub={phase.label || ''}
        value={phase.id} onChange={onPhase}
        options={phases.map(p => ({ id: p.id, label: `v${p.id}`, sub: p.label }))} />
      <Icon name="chevron-right" size={15} color="var(--border-300)" />
      <VfDrop icon="calendar-range" kicker="周计划 · 主筛选" primary label={weekKey ? shortWeek(weekKey) : '暂无周计划'}
        value={weekKey} onChange={onWeek}
        options={weeks.map(w => ({ id: w, label: shortWeek(w), tag: w === CURRENT_WEEK ? '当前周' : undefined }))} />
    </div>
  );
}

const fmtCost = (n) => n === 0 ? '—' : '¥' + n.toLocaleString('en-US');

/* ---------- 事务卡 ----------
   TaskCard：看板中的单个事务卡。floating 拖拽漂浮体 / isPlaceholder 被拖走的占位 /
     isPulse 落位后脉冲高亮。onPointerDown 由看板传入启动拖拽/点击判定。 */
function TaskCard({ task, floating, isPlaceholder, isPulse, onPointerDown }) {
  const ty = TASK_TYPE[task.type];
  const st = TASK_STATUS[task.status];
  return (
    <div
      className={`tb-card${isPlaceholder ? ' is-placeholder' : ''}${isPulse ? ' pulse' : ''}`}
      style={isPulse ? { '--pulse-c': st.c, '--pulse-ring': st.bg } : null}
      onPointerDown={onPointerDown}
    >
      <div className="tb-card-top">
        <span className="tb-type" style={{ color: ty.c, background: ty.bg }}>
          <span className="tb-type-dot" style={{ background: ty.c }} />{ty.label}
        </span>
        <span className="tb-card-id mono">{task.id}</span>
      </div>
      <div className="tb-card-title">{task.title}</div>

      {(task.blocked || task.delay || task.fail) && (
        <div className="tb-card-flags">
          {task.delay && <span className="tb-flag" style={{ color: 'var(--warning)', background: 'var(--warning-bg)' }}><Icon name="alarm-clock" size={11} color="var(--warning)" />延期 {task.delay} 天</span>}
          {task.blocked && <span className="tb-flag" style={{ color: 'var(--danger)', background: 'var(--danger-bg)' }}><Icon name="ban" size={11} color="var(--danger)" />阻塞</span>}
          {task.fail && <span className="tb-flag" style={{ color: 'var(--danger)', background: 'var(--danger-bg)' }}><Icon name="x" size={11} color="var(--danger)" />失败</span>}
        </div>
      )}

      <div className="tb-card-meta">
        <span className="tb-card-ai"><span className="av">{task.ai[0]}</span><span className="nm">{task.ai}</span></span>
        <span className="tb-card-dl" style={task.status === 'delayed' ? { color: 'var(--warning)' } : null}><Icon name="flag" size={11} color={task.status === 'delayed' ? 'var(--warning)' : 'var(--text-400)'} />{task.dl}</span>
      </div>
      <div className="tb-card-meta" style={{ marginTop: 8, paddingTop: 8 }}>
        <span className="tb-card-status" style={{ color: st.c, background: st.bg }}><Icon name={st.icon} size={11} color={st.c} className={st.spin ? 'spin' : ''} />{st.label}</span>
        <span className="tb-card-cost" style={{ marginLeft: 'auto' }}><Icon name="cpu" size={11} color="var(--text-400)" />{fmtCost(task.cost)}</span>
      </div>
    </div>
  );
}

/* ---------- 泳道看板（指针拖拽） ----------
   TaskBoard：按 LANES 渲染状态泳道。核心交互是 startDrag 的「点击 vs 拖拽」区分：
     指针按下后，位移 < 6px 视为点击（onOpen 开详情）；超过则进入拖拽（生成漂浮体，
     实时命中泳道 over）；松手时若落在不同泳道则 onMove(id, 新状态) 并脉冲高亮。
     readOnly 时禁用拖拽（仅点击）。 */
function TaskBoard({ tasks, onMove, onOpen, readOnly }) {
  const [drag, setDrag] = React.useState(null);
  const [over, setOver] = React.useState(null);
  const [pulse, setPulse] = React.useState(null);
  const laneRefs = React.useRef({});

  const startDrag = (e, task) => {
    if (e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = e.clientX, startY = e.clientY;
    const dx = startX - rect.left, dy = startY - rect.top;
    let active = false, curOver = null;

    const onMoveW = (ev) => {
      if (!active) {
        if (Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) < 6) return;
        if (readOnly) return;
        active = true;
        document.body.classList.add('tb-dragging-cursor');
        setDrag({ id: task.id, x: ev.clientX, y: ev.clientY, dx, dy, w: rect.width, task });
      }
      setDrag(d => d ? { ...d, x: ev.clientX, y: ev.clientY } : d);
      let found = null;
      for (const k of LANES) {
        const el = laneRefs.current[k]; if (!el) continue;
        const r = el.getBoundingClientRect();
        if (ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom) { found = k; break; }
      }
      curOver = found; setOver(found);
    };
    const onUpW = () => {
      window.removeEventListener('pointermove', onMoveW);
      window.removeEventListener('pointerup', onUpW);
      document.body.classList.remove('tb-dragging-cursor');
      if (!active) { onOpen(task); }
      else if (curOver && curOver !== task.status) {
        onMove(task.id, curOver);
        setPulse({ id: task.id });
        setTimeout(() => setPulse(null), 650);
      }
      setDrag(null); setOver(null);
    };
    window.addEventListener('pointermove', onMoveW);
    window.addEventListener('pointerup', onUpW);
  };

  return (
    <>
      <div className="tb-board">
        {LANES.map(k => {
          const st = TASK_STATUS[k];
          const items = tasks.filter(t => t.status === k);
          return (
            <div key={k} className="tb-lane" data-over={over === k && drag} ref={el => laneRefs.current[k] = el}>
              <div className="tb-lane-head">
                <span className="tb-lane-rail" style={{ background: st.rail }} />
                <span className="tb-lane-title"><Icon name={st.icon} size={14} color={st.c} className={st.spin ? 'spin' : ''} />{st.label}</span>
                <span className="tb-lane-count">{items.length}</span>
              </div>
              <div className="tb-lane-body">
                {items.length === 0 ? (
                  <div className="tb-lane-empty"><Icon name="inbox" size={20} color="currentColor" />暂无事务</div>
                ) : items.map(t => (
                  <TaskCard key={t.id} task={t}
                    isPlaceholder={drag && drag.id === t.id}
                    isPulse={pulse && pulse.id === t.id}
                    onPointerDown={(e) => startDrag(e, t)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {drag && (
        <div className="tb-float" style={{ left: drag.x - drag.dx, top: drag.y - drag.dy, width: drag.w }}>
          <TaskCard task={drag.task} floating />
        </div>
      )}
    </>
  );
}

/* ---------- 执行层事务 · 外壳（看板 / 派发 / 详情 同源切换） ----------
   ExecutionTasks：状态 view 三视图；tasks 事务列表；selId 选中事务；
     midId/phaseId/weekKey 三级版本筛选（onMid/onPhase/onWeek 联动）。
   move：拖拽改状态并写留痕；openTask：点卡进详情视图。仅「当前周」显真看板，其余周为示意空态。 */
function ExecutionTasks({ project, onNavigate }) {
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState('board');   // board 看板 | dispatch 6699 派发 | detail 详情
  const [tasks, setTasks] = React.useState(TASKS_W23);
  const [selId, setSelId] = React.useState(null);
  const initEntry = React.useMemo(() => buildWeekIndex().find(e => e.week === CURRENT_WEEK) || buildWeekIndex()[0] || {}, []);
  const [midId, setMidId] = React.useState(initEntry.mid ? initEntry.mid.id : '1.0');
  const [phaseId, setPhaseId] = React.useState(initEntry.phase ? initEntry.phase.id : '1.2');
  const [weekKey, setWeekKey] = React.useState(CURRENT_WEEK);
  const [toast, setToast] = React.useState(null);
  const p = window.PROJECT_META || { name: '智能履约调度中台', pid: 'PRJ-2026-0137' };

  React.useEffect(() => { const t = setTimeout(() => setLoading(false), 900); return () => clearTimeout(t); }, []);

  const onMid = (id) => { const m = (window.MID_VERSIONS || []).find(v => v.id === id); const ph = (m && m.months || [])[0]; setMidId(id); setPhaseId(ph ? ph.id : null); setWeekKey(ph && ph.weeks[0] || ''); };
  const onPhase = (id) => { const ph = window.MONTH_OF(id); setPhaseId(id); setWeekKey(ph && ph.weeks[0] || ''); };
  const onWeek = (w) => { setWeekKey(w); const e = buildWeekIndex().find(x => x.week === w); if (e) { setMidId(e.mid.id); setPhaseId(e.phase.id); } };
  const isCur = weekKey === CURRENT_WEEK;

  const move = (id, status) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    setToast({ msg: `「${TASK_MAP[id] ? TASK_MAP[id].title : id}」已移动至『${TASK_STATUS[status].label}』· 已写入留痕`, action: '查看留痕', onAction: () => { setToast(null); onNavigate && onNavigate('rules'); } });
  };
  const openTask = (t) => { setSelId(t.id); setView('detail'); };

  const stats = React.useMemo(() => {
    const total = tasks.length;
    const running = tasks.filter(t => t.status === 'running').length;
    const accept = tasks.filter(t => t.status === 'accept').length;
    const risk = tasks.filter(t => t.status === 'delayed' || t.status === 'failed').length;
    const cost = tasks.reduce((s, t) => s + t.cost, 0);
    return { total, running, accept, risk, cost };
  }, [tasks]);

  const selTask = selId ? tasks.find(t => t.id === selId) : null;

  /* 详情视图 */
  if (view === 'detail' && selTask) {
    return (
      <div className="content-inner page-fade">
        <Breadcrumb items={[{ label: p.name }, { label: '执行事务' }, { label: selTask.id, mono: true }]} />
        <TaskDetail task={selTask} onBack={() => setView('board')} onNavigate={onNavigate}
          onToast={(msg) => setToast({ msg })} />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: p.name }, { label: view === 'board' ? '事务看板' : '6699.com 派发与回收' }]} />
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico"><Icon name="square-check-big" size={22} color="var(--blue-primary)" /></span>
          <div>
            <h1 className="t-h1">执行事务</h1>
          </div>
        </div>
        <div className="page-head-right">
          {view === 'board' && (
            <VersionWeekFilter midId={midId} phaseId={phaseId} weekKey={weekKey} onMid={onMid} onPhase={onPhase} onWeek={onWeek} />
          )}
          <div className="tb-switch">
            <button className="tb-switch-btn" data-on={view === 'board'} onClick={() => setView('board')}><Icon name="kanban" size={15} color={view === 'board' ? 'var(--text-900)' : 'var(--text-500)'} />事务看板</button>
            <button className="tb-switch-btn" data-on={view === 'dispatch'} onClick={() => setView('dispatch')}><Icon name="plug" size={15} color={view === 'dispatch' ? 'var(--text-900)' : 'var(--text-500)'} />6699.com 派发</button>
          </div>
          <FeedbackEntry onClick={() => setToast({ msg: '异步反馈入口已打开（演示）' })} />
        </div>
      </div>

      {view === 'dispatch' ? (
        <Dispatch6699 onOpenTask={openTask} onNavigate={onNavigate} onToast={(msg) => setToast({ msg })} />
      ) : (
        <>
          <div className="tb-ruler">
            <div className="tb-ruler-item">
              <span className="tb-ruler-ico" style={{ background: 'var(--blue-tint)' }}><Icon name="square-check-big" size={16} color="var(--blue-primary)" /></span>
              <div><div className="tb-ruler-k">本周事务</div><div className="tb-ruler-v">{loading ? '—' : stats.total}</div></div>
            </div>
            <div className="tb-ruler-item">
              <span className="tb-ruler-ico" style={{ background: 'var(--ai-soft)' }}><Icon name="loader-2" size={16} color="var(--ai)" className="spin" /></span>
              <div><div className="tb-ruler-k">执行中</div><div className="tb-ruler-v">{loading ? '—' : stats.running}</div></div>
            </div>
            <div className="tb-ruler-item">
              <span className="tb-ruler-ico" style={{ background: 'var(--warning-bg)' }}><Icon name="alarm-clock" size={16} color="var(--warning)" /></span>
              <div><div className="tb-ruler-k">延期 / 失败</div><div className="tb-ruler-v">{loading ? '—' : stats.risk}</div></div>
            </div>
            <div className="tb-ruler-item">
              <span className="tb-ruler-ico" style={{ background: 'var(--canvas)' }}><Icon name="cpu" size={16} color="var(--text-500)" /></span>
              <div><div className="tb-ruler-k">本周算力成本</div><div className="tb-ruler-v">¥{loading ? '—' : stats.cost.toLocaleString('en-US')}</div></div>
            </div>
            <div className="tb-ruler-legend">
              {Object.keys(TASK_TYPE).map(k => (
                <span className="tb-legend-item" key={k}><span className="tb-legend-dot" style={{ background: TASK_TYPE[k].c }} />{TASK_TYPE[k].label}</span>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="tb-board">
              {LANES.slice(0, 5).map(k => (
                <div className="tb-lane" key={k}>
                  <div className="tb-lane-head"><span className="tb-lane-rail" style={{ background: 'var(--border-300)' }} /><Skel w={60} h={14} /></div>
                  <div className="tb-lane-body">{[0, 1].map(i => <Skel key={i} w="100%" h={104} r={10} />)}</div>
                </div>
              ))}
            </div>
          ) : !isCur ? (
            <Card style={{ marginTop: 4 }}>
              <EmptyState glyph="calendar-range" title={weekKey ? `${shortWeek(weekKey)}事务视图为示意` : '该阶段版本暂无周计划'} desc={weekKey ? '当前演示聚焦「2026年06月第1周」（当前周）的执行事务。其它周的看板将随真实数据接入后填充。' : '所选阶段目标版本下尚未拆分出周计划，请切换到含周计划的版本。'} action={<Button variant="primary" icon="corner-up-left" onClick={() => onWeek(CURRENT_WEEK)}>回到当前周</Button>} />
            </Card>
          ) : (
            <TaskBoard tasks={tasks} onMove={move} onOpen={openTask} />
          )}
        </>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

Object.assign(window, { ExecutionTasks, TASK_TYPE, TASK_STATUS, TASK_MAP, TASKS_W23, fmtCost, LANES });
