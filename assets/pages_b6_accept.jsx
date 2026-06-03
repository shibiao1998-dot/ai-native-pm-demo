/* ============================================================
   批 6 · 验收与闭环  —  外壳 + 6.1 逐级验收报告
   自下而上逐级验收：事务 → 周 → 阶段 → 中短期，验收 AI 按标准审计并评级。
   承接批 0 设计系统 / 批 3 目标树 / 批 5 执行事务。
   ============================================================ */

/* ---------- 验收评级（等宽大字 + 语义色阶，共享给三页） ---------- */
const GRADE = {
  A: { letter: 'A', label: '优秀',  c: 'var(--success)', bg: 'var(--success-bg)', bd: '#BDE8D6' },
  B: { letter: 'B', label: '达标',  c: 'var(--info)',    bg: 'var(--info-bg)',    bd: 'var(--blue-border)' },
  C: { letter: 'C', label: '关注',  c: 'var(--warning)', bg: 'var(--warning-bg)', bd: '#F2DDB6' },
  D: { letter: 'D', label: '未达成', c: 'var(--danger)',  bg: 'var(--danger-bg)',  bd: '#F4C9CB' },
  R: { letter: '··', label: '验收中', c: 'var(--ai)',      bg: 'var(--ai-soft)',    bd: '#BEE6F8', running: true },
};
function Grade({ g, size = 'md' }) {
  const gr = GRADE[g] || GRADE.R;
  const isz = size === 'lg' ? 30 : size === 'sm' ? 17 : 23;
  return (
    <span className={`grade sz-${size}`} style={{ color: gr.c, background: gr.bg, borderColor: gr.bd }}>
      {gr.running
        ? <Icon name="loader-2" size={isz} color={gr.c} className="spin" />
        : <span className="g-letter">{gr.letter}</span>}
      <span className="g-label">{gr.label}</span>
    </span>
  );
}

/* ---------- 验收结论 ---------- */
const CONCL = {
  pass:    { label: '验收通过',  c: 'var(--success)', bg: 'var(--success-bg)', icon: 'circle-check' },
  fail:    { label: '验收未通过', c: 'var(--danger)',  bg: 'var(--danger-bg)',  icon: 'x-circle' },
  watch:   { label: '部分达成 · 关注', c: 'var(--warning)', bg: 'var(--warning-bg)', icon: 'alert-triangle' },
  running: { label: '验收进行中', c: 'var(--ai)',      bg: 'var(--ai-soft)',    icon: 'loader-2', spin: true },
  pending: { label: '待验收',    c: 'var(--text-500)', bg: 'var(--neutral-bg)', icon: 'clock' },
};
function ConclPill({ c }) {
  const s = CONCL[c] || CONCL.pending;
  return (
    <span className="ac-concl" style={{ color: s.c, background: s.bg }}>
      <Icon name={s.icon} size={13} color={s.c} className={s.spin ? 'spin' : ''} />{s.label}
    </span>
  );
}

const TRACE_TONE = { info: 'var(--info)', success: 'var(--success)', warning: 'var(--warning)', danger: 'var(--danger)', ai: 'var(--ai)', neutral: 'var(--text-400)' };
const ACC_LEVEL = {
  mid:   { label: '中短期目标', icon: 'flag' },
  phase: { label: '阶段目标',   icon: 'milestone' },
  week:  { label: '周版本',     icon: 'calendar-range' },
  task:  { label: '执行事务',   icon: 'square-check-big' },
};

/* ---------- 逐级验收数据（自下而上汇聚 · 智能履约调度中台） ---------- */
const ACCEPT_HIER = [
  { id: 'mid-a', level: 'mid', title: '调度时效提升 30%', grade: 'C', concl: 'watch',
    rate: 71, ontime: 80, delay: 12, agg: '汇聚 2 阶段', period: '季度汇聚 · 3 个阶段验收',
    acceptor: '验收 AI · 调度域', date: '06-01 17:20',
    criteria: [
      { k: '区域履约平均时效较立项基线提升', req: '≥ 30%', act: '+24%', ok: false },
      { k: '下属阶段目标全部验收通过', req: '2 / 2', act: '1 / 2', ok: false },
      { k: '高峰时段时效不劣化', req: '达标', act: '达标', ok: true },
    ],
    note: '阶段「异常自愈率」已达标，但「履约时效 < 4h」连续未通过，中短期目标整体仅部分达成。评级关注，需复盘根基要素并调整下一轮拆解颗粒度。',
    trace: [
      { act: '季度汇聚验收完成，评级 C（关注）', by: '验收 AI · 调度域', date: '06-01 17:20', tone: 'warning' },
      { act: '阶段「履约时效 < 4h」验收未通过', by: '验收 AI · 路况', date: '06-01 14:05', tone: 'danger' },
      { act: '阶段「异常自愈率 ≥ 90%」验收通过', by: '验收 AI · 自愈', date: '05-27 11:30', tone: 'success' },
    ],
    children: [
      { id: 'phase-a1', level: 'phase', title: '履约时效 < 4h', grade: 'D', concl: 'fail',
        rate: 64, ontime: 70, delay: 22, agg: '汇聚 2 周', period: '月度汇聚 · 4 个周验收',
        acceptor: '验收 AI · 路况', date: '06-01 14:05',
        criteria: [
          { k: '端到端履约时效', req: '≤ 4h', act: '5.2h', ok: false },
          { k: '实时路况数据源就位', req: '就绪', act: '阻塞', ok: false },
          { k: '管道端到端时延', req: '< 30s', act: '41s', ok: false },
        ],
        note: '路况源选型连续两次未通过、实时数据管道时延超标，阶段目标未达成。已标记卡点并上抛介入工作台。',
        trace: [
          { act: '阶段验收未通过（第 2 次）', by: '验收 AI · 路况', date: '06-01 14:05', tone: 'danger' },
          { act: '标记卡点并上抛介入工作台', by: '系统', date: '06-01 14:06', tone: 'warning' },
        ],
        children: [
          { id: 'week-a1a', level: 'week', title: '第 23 周 · 接入区域实时路况', grade: 'C', concl: 'watch',
            rate: 55, ontime: 62, delay: 25, agg: '汇聚 2 事务', period: '周版本验收',
            acceptor: '验收 AI · 接入', date: '06-01 10:40',
            criteria: [
              { k: '路况源完成选型并合规采购', req: '完成', act: '审核中', ok: false },
              { k: '入选源端到端时延', req: '< 30s', act: '28s', ok: true },
              { k: '本周事务全部通过', req: '2 / 2', act: '0 / 2', ok: false },
            ],
            note: '选型采购验收仍在审核中、第三方运力 API 对接失败，本周版本未达成，剩余项滚动进入下一周。',
            trace: [
              { act: '周版本验收：部分达成（关注）', by: '验收 AI · 接入', date: '06-01 10:40', tone: 'warning' },
              { act: '事务 T-0292 验收失败并沉淀问题', by: '验收 AI', date: '05-28 20:30', tone: 'danger' },
            ],
            children: [
              { id: 'T-0288', level: 'task', title: '路况源选型与采购', grade: 'R', concl: 'running',
                rate: null, ontime: null, delay: null, period: '事务验收', acceptor: '验收 AI', date: '审核中',
                running: '验收 AI 正在按「选型可追溯 + 时延达标 + 采购合规」三项标准审计本事务产出。',
                criteria: [
                  { k: '选型对照表可追溯', req: '齐备', act: '审核中', ok: null },
                  { k: '入选源实测时延', req: '< 30s', act: '28s', ok: true },
                  { k: '大额采购合规上抛', req: '已上抛', act: '已上抛', ok: true },
                ],
                evidence: [
                  { icon: 'table', name: '路况源选型对照表 v2', meta: '3 家供应商 · 时延 / 覆盖 / 价格对照', tag: '审核中', tagTone: 'ai' },
                  { icon: 'file-text', name: '采购合规上抛单 QUOTE-0291', meta: '金额 ¥182,000 · 已上抛大额审批', tag: '已上抛', tagTone: 'info' },
                ],
                trace: [{ act: '提交验收，AI 审计中', by: '采购协同 Agent', date: '06-02 09:20', tone: 'ai' }] },
              { id: 'T-0292', level: 'task', title: '第三方运力 API 对接', grade: 'D', concl: 'fail',
                rate: 0, ontime: 0, delay: 100, period: '事务验收', acceptor: '验收 AI', date: '05-28 20:30',
                criteria: [
                  { k: '接口联通并稳定鉴权', req: '联通', act: '失败', ok: false },
                  { k: '三轮迭代内交付', req: '≤ 3 轮', act: '3 轮未果', ok: false },
                ],
                note: '对方接口连续返回鉴权错误，三轮迭代仍无法联通，已标失败并沉淀问题供下次拆解参考。',
                evidence: [{ icon: 'terminal', name: '接口联通测试日志', meta: '3 轮鉴权均失败 · 错误码 401', tag: '失败', tagTone: 'danger' }],
                trace: [{ act: '验收失败 · 问题沉淀', by: '验收 AI', date: '05-28 20:30', tone: 'danger' }] },
            ] },
          { id: 'week-a1b', level: 'week', title: '第 22 周 · 调度算法灰度上线', grade: 'B', concl: 'pass',
            rate: 86, ontime: 92, delay: 4, agg: '汇聚 2 事务', period: '周版本验收',
            acceptor: '验收 AI · 调度', date: '05-30 09:40',
            criteria: [
              { k: '灰度可按区域 / 时段放量', req: '支持', act: '支持', ok: true },
              { k: '回滚生效时延', req: '< 5s', act: '3.2s', ok: true },
              { k: '本周事务全部通过', req: '2 / 2', act: '2 / 2', ok: true },
            ],
            note: '灰度策略与监控面板均验收通过，周版本达标，已生成永久进度记录。',
            trace: [{ act: '周版本验收通过，评级 B', by: '验收 AI · 调度', date: '05-30 09:40', tone: 'success' }],
            children: [
              { id: 'T-0285', level: 'task', title: '灰度放量监控面板', grade: 'A', concl: 'pass',
                rate: 100, ontime: 100, delay: 0, period: '事务验收', acceptor: '验收 AI', date: '05-30 09:40',
                criteria: [
                  { k: '关键指标一屏可见、回滚显著', req: '达标', act: '达标', ok: true },
                  { k: '五态（含 AI 处理态）覆盖', req: '齐备', act: '齐备', ok: true },
                ],
                note: '一屏可见、回滚显著、五态齐备，验收通过。',
                evidence: [{ icon: 'layout-dashboard', name: '灰度监控面板（截图 + 链接）', meta: '关键指标一屏可见 · 五态覆盖', tag: '达标', tagTone: 'success' }],
                trace: [{ act: '验收通过', by: '验收 AI', date: '05-30 09:40', tone: 'success' }] },
              { id: 'T-0291', level: 'task', title: '调度算法灰度策略实现', grade: 'A', concl: 'pass',
                rate: 100, ontime: 96, delay: 0, period: '事务验收', acceptor: '验收 AI', date: '05-29 16:20',
                criteria: [
                  { k: '区域 / 时段两维灰度分桶', req: '支持', act: '支持', ok: true },
                  { k: '回滚时延且不丢在途调度', req: '< 5s', act: '3.2s', ok: true },
                ],
                note: '分桶与回滚均达标，灰度配置变更全部写入留痕，验收通过。',
                evidence: [{ icon: 'git-branch', name: '灰度分桶配置与回滚记录', meta: '区域 / 时段两维 · 回滚 3.2s', tag: '达标', tagTone: 'success' }],
                trace: [{ act: '验收通过', by: '验收 AI', date: '05-29 16:20', tone: 'success' }] },
            ] },
        ] },
      { id: 'phase-a2', level: 'phase', title: '异常调度自愈率 ≥ 90%', grade: 'B', concl: 'pass',
        rate: 88, ontime: 90, delay: 6, agg: '汇聚 1 周', period: '月度汇聚 · 4 个周验收',
        acceptor: '验收 AI · 自愈', date: '05-27 11:30',
        criteria: [
          { k: '异常调度自愈率', req: '≥ 90%', act: '91.4%', ok: true },
          { k: '误报率', req: '< 5%', act: '3.8%', ok: true },
          { k: '下属周目标全部通过', req: '1 / 1', act: '1 / 1', ok: true },
        ],
        note: '异常检测模型迭代后自愈率稳定达标，阶段目标验收通过，生成永久进度记录并触发根基复盘。',
        trace: [{ act: '阶段验收通过，评级 B', by: '验收 AI · 自愈', date: '05-27 11:30', tone: 'success' }],
        children: [
          { id: 'week-a2a', level: 'week', title: '第 21 周 · 异常检测模型迭代', grade: 'A', concl: 'pass',
            rate: 100, ontime: 100, delay: 0, agg: '汇聚 1 事务', period: '周版本验收',
            acceptor: '验收 AI · 风控', date: '05-24 15:00',
            criteria: [
              { k: '召回提升且误报下降', req: '达标', act: '达标', ok: true },
              { k: '本周事务全部通过', req: '1 / 1', act: '1 / 1', ok: true },
            ],
            note: '特征工程优化后模型表现达标，周版本验收通过。',
            trace: [{ act: '周版本验收通过', by: '验收 AI · 风控', date: '05-24 15:00', tone: 'success' }],
            children: [
              { id: 'T-0005', level: 'task', title: '特征工程优化', grade: 'A', concl: 'pass',
                rate: 100, ontime: 100, delay: 0, period: '事务验收', acceptor: '验收 AI', date: '05-22 17:40',
                criteria: [{ k: '补充时序与空间特征', req: '完成', act: '完成', ok: true }],
                note: '特征补充到位，模型离线指标达标，验收通过。',
                trace: [{ act: '验收通过', by: '验收 AI', date: '05-22 17:40', tone: 'success' }] },
            ] },
        ] },
    ] },
  { id: 'mid-b', level: 'mid', title: '单均调度成本下降 15%', grade: 'R', concl: 'running',
    rate: null, ontime: null, delay: null, agg: '汇聚 1 阶段', period: '季度汇聚 · 暂未到验收节点',
    acceptor: '验收 AI · 成本域', date: '验收中',
    running: '阶段「算力成本优化」周版本尚未全部完成，季度汇聚验收暂未触发。验收 AI 将在阶段达成后按「单均成本下降 ≥ 15%」标准审计评级。',
    criteria: [
      { k: '单均调度成本较基线下降', req: '≥ 15%', act: '进行中', ok: null },
      { k: '下属阶段目标验收通过', req: '1 / 1', act: '0 / 1', ok: null },
    ],
    trace: [{ act: '等待阶段「算力成本优化」完成后汇聚', by: '验收 AI · 成本域', date: '06-02 08:00', tone: 'ai' }],
    children: [
      { id: 'phase-b1', level: 'phase', title: '算力成本优化', grade: 'R', concl: 'running',
        rate: null, ontime: null, delay: null, agg: '汇聚 1 周', period: '月度汇聚 · 进行中',
        acceptor: '验收 AI · 算力', date: '验收中',
        running: '推理资源弹性调度仍在编写与执行，周版本验收尚未提交。',
        criteria: [{ k: '推理资源弹性调度上线', req: '上线', act: '编写中', ok: null }],
        trace: [{ act: '周目标编写中，等待提交验收', by: 'AI · 算力', date: '05-31 18:00', tone: 'ai' }],
        children: [
          { id: 'week-b1a', level: 'week', title: '第 24 周 · 推理资源弹性调度', grade: 'R', concl: 'pending',
            rate: null, ontime: null, delay: null, agg: '0 / 1 事务', period: '周版本验收',
            acceptor: '验收 AI · 算力', date: '待验收',
            running: '本周事务尚在草稿与编写阶段，未进入验收流程。',
            criteria: [{ k: '配额弹性策略落地', req: '落地', act: '草稿', ok: null }],
            trace: [{ act: '周目标创建，事务编写中', by: 'AI · 算力', date: '05-31 18:00', tone: 'neutral' }],
            children: [] },
        ] },
    ] },
];

const fmtPct = (v) => v == null ? '—' : v + '%';

/* ---------- 层级验收卡（可下钻 / 可展开） ---------- */
function AcceptNode({ node, depth, expanded, onToggle, selected, onOpen }) {
  const lv = ACC_LEVEL[node.level];
  const hasKids = node.children && node.children.length > 0;
  const isOpen = expanded[node.id] !== false;
  return (
    <div className="ac-node">
      <div className={`ac-row${depth > 0 ? ' child' : ''}`} data-sel={selected === node.id} onClick={() => onOpen(node)} role="button" tabIndex={0}>
        {hasKids
          ? <span className="ac-toggle" onClick={(e) => { e.stopPropagation(); onToggle(node.id); }} role="button" aria-label="展开折叠"><Icon name={isOpen ? 'minus' : 'plus'} size={13} color="var(--text-500)" /></span>
          : <span className="ac-toggle placeholder" />}
        <span className="ac-row-ico" style={{ background: GRADE[node.grade].bg }}><Icon name={lv.icon} size={depth > 0 ? 17 : 19} color={GRADE[node.grade].c} /></span>
        <div className="ac-row-main">
          <div className="ac-row-level">{lv.label}{node.agg && <span className="agg">{node.agg}</span>}</div>
          <div className="ac-row-title">{node.title}</div>
        </div>
        <div className="ac-metrics">
          <span className="ac-metric"><span className="ac-metric-v">{fmtPct(node.rate)}</span><span className="ac-metric-k">达成率</span></span>
          <span className="ac-metric"><span className="ac-metric-v">{fmtPct(node.ontime)}</span><span className="ac-metric-k">按时率</span></span>
          <span className="ac-metric"><span className={`ac-metric-v${node.delay > 15 ? ' danger' : node.delay > 5 ? ' warn' : ''}`}>{fmtPct(node.delay)}</span><span className="ac-metric-k">延期率</span></span>
        </div>
        <Grade g={node.grade} size="sm" />
        <ConclPill c={node.concl} />
      </div>
      {hasKids && isOpen && (
        <div className="ac-children">
          {node.children.map(c => (
            <AcceptNode key={c.id} node={c} depth={depth + 1} expanded={expanded} onToggle={onToggle} selected={selected} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- 验收明细抽屉 · 完整验收报告 ---------- */
const ACC_CLOSURE = {
  pass: [
    { text: '验收通过 · 已生成永久进度记录并自下而上回写上级目标', icon: 'circle-check', tone: 'success' },
    { text: '触发根基三要素复盘，向理想化状态长周期推进', icon: 'refresh-cw', tone: 'blue' },
  ],
  watch: [
    { text: '部分达成 · 未达标项滚动进入下一周期继续验收', icon: 'arrow-right', tone: 'warning' },
    { text: '保留关注标记，由验收 AI 持续观察直至达标', icon: 'eye', tone: 'neutral' },
  ],
  fail: [
    { text: '验收未通过 · 已标记卡点并上抛介入工作台', icon: 'alert-triangle', tone: 'danger' },
    { text: '问题沉淀进知识库，供下次拆解与执行参考', icon: 'library', tone: 'neutral' },
  ],
  running: [{ text: '验收 AI 审计中 · 完成后自动给出评级与结论并留痕', icon: 'loader-2', tone: 'ai' }],
  pending: [{ text: '尚未进入验收流程 · 待下级事务提交后触发', icon: 'clock', tone: 'neutral' }],
};

function AcceptDrawer({ node, onClose, onToast }) {
  const lv = node ? ACC_LEVEL[node.level] : null;
  const cc = node ? (CONCL[node.concl] || CONCL.pending) : null;
  const verdictTone = node ? (node.concl === 'pass' ? 'pass' : node.concl === 'fail' ? 'stop' : node.concl === 'watch' ? 'warn' : 'warn') : 'pass';
  return (
    <Drawer
      open={!!node}
      onClose={onClose}
      width={620}
      title={node ? node.title : ''}
      sub={node ? `${lv.label} · ${node.period} · 验收报告` : ''}
      icon={node ? { name: lv.icon, color: GRADE[node.grade].c } : null}
      headRight={node && (
        <FeedbackEntry label="反馈"
          context={{ scene: '验收与闭环 · 验收报告', did: `当前查看「${node.title}」（${lv.label}）的完整验收报告（标准对照、证据、AI 结论与闭环动作）`, ask: 'AI 的验收评级、某条标准的判定，或闭环动作' }}
          onClick={() => {}} />
      )}
    >
      {node && (
        <DocDoc>
          <div className="ac-dr-grade" style={{ marginBottom: 8 }}>
            <Grade g={node.grade} size="lg" />
            <div className="ac-dr-grade-main">
              <div className="ac-dr-grade-concl" style={{ color: cc.c }}>{cc.label}</div>
              <div className="ac-dr-grade-sub">{node.acceptor} · <span className="mono">{node.date}</span></div>
            </div>
          </div>

          <DocSec no="01" title="AI 验收结论" icon="gavel">
            {node.concl === 'running' || node.concl === 'pending' ? (
              <div className="ac-running">
                <Icon name="loader-2" size={20} color="var(--ai)" className={node.concl === 'running' ? 'spin' : ''} />
                <div className="ac-running-main">
                  <div className="ac-running-t">{node.concl === 'running' ? '验收 AI 正在审计' : '尚未进入验收'}</div>
                  <div className="ac-running-s">{node.running}</div>
                </div>
              </div>
            ) : (
              <DocVerdict tone={verdictTone} icon={cc.icon} title={cc.label}>{node.note}</DocVerdict>
            )}
          </DocSec>

          {node.rate != null && (
            <DocSec no="02" title="验收指标" icon="activity">
              <div className="ac-dr-metrics">
                <div className="ac-dr-mcell">
                  <div className="ac-dr-mcell-v">{node.rate}%</div>
                  <div className="ac-dr-mcell-k">达成率</div>
                  <div className="ac-dr-mcell-bar"><span style={{ width: node.rate + '%', background: 'var(--success)' }} /></div>
                </div>
                <div className="ac-dr-mcell">
                  <div className="ac-dr-mcell-v">{node.ontime}%</div>
                  <div className="ac-dr-mcell-k">按时率</div>
                  <div className="ac-dr-mcell-bar"><span style={{ width: node.ontime + '%', background: 'var(--blue-primary)' }} /></div>
                </div>
                <div className="ac-dr-mcell">
                  <div className={`ac-dr-mcell-v${node.delay > 15 ? ' danger' : node.delay > 5 ? ' warn' : ''}`}>{node.delay}%</div>
                  <div className="ac-dr-mcell-k">延期率</div>
                  <div className="ac-dr-mcell-bar"><span style={{ width: node.delay + '%', background: node.delay > 15 ? 'var(--danger)' : 'var(--warning)' }} /></div>
                </div>
              </div>
            </DocSec>
          )}

          <DocSec no="03" title="验收标准对照" icon="list-checks">
            <div className="ac-crit">
              <div className="ac-crit-head"><span>验收标准</span><span>要求</span><span>实测</span><span>结论</span></div>
              {node.criteria.map((c, i) => (
                <div className="ac-crit-row" key={i}>
                  <span className="ac-crit-k">{c.k}</span>
                  <span className="ac-crit-req">{c.req}</span>
                  <span className={`ac-crit-act${c.ok === true ? ' ok' : c.ok === false ? ' no' : ''}`}>{c.act}</span>
                  <span className="ac-crit-flag">
                    {c.ok === true && <Icon name="check" size={15} color="var(--success)" />}
                    {c.ok === false && <Icon name="x" size={15} color="var(--danger)" />}
                    {c.ok == null && <Icon name="loader-2" size={14} color="var(--ai)" className="spin" />}
                  </span>
                </div>
              ))}
            </div>
          </DocSec>

          <DocSec no="04" title="验收证据" icon="paperclip">
            {node.evidence
              ? <DocEvidence rows={node.evidence} />
              : <p className="cd-para" style={{ color: 'var(--text-400)' }}>本级为下级汇聚验收，证据见各下级验收报告。</p>}
          </DocSec>

          <DocSec no="05" title="闭环动作" icon="git-merge">
            <DocList items={ACC_CLOSURE[node.concl] || ACC_CLOSURE.pending} />
          </DocSec>

          <DocSec no="06" title="验收留痕" icon="history">
            <DocChain items={node.trace.map(t => ({ act: t.act, actor: t.by + ' · ' + t.date, ai: /AI|Agent|自动/.test(t.by) }))} />
          </DocSec>
        </DocDoc>
      )}
    </Drawer>
  );
}

/* ---------- 6.1 逐级验收报告（内容体） ---------- */
function AcceptReport({ loading, onToast }) {
  const [expanded, setExpanded] = React.useState({ 'phase-a1': false, 'phase-a2': false, 'phase-b1': false });
  const [open, setOpen] = React.useState(null);
  const toggle = (id) => setExpanded(e => ({ ...e, [id]: e[id] === false ? true : false }));

  if (loading) {
    return (
      <div className="ac-tree">
        {[0, 1].map(i => (
          <Card key={i} style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Skel w={38} h={38} r={10} /><div style={{ flex: 1 }}><Skel w="40%" h={12} /><Skel w="62%" h={16} style={{ marginTop: 8 }} /></div><Skel w={120} h={20} /><Skel w={44} h={44} r={10} />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="ac-cadence">
        <div className="ac-cad-item">
          <span className="ac-cad-ico" style={{ background: 'var(--success-bg)' }}><Icon name="calendar-check" size={18} color="var(--success)" /></span>
          <div><div className="ac-cad-k">每周必验收</div><div className="ac-cad-s">事务通过后汇聚为周版本验收</div></div>
        </div>
        <div className="ac-cad-item">
          <span className="ac-cad-ico" style={{ background: 'var(--blue-tint)' }}><Icon name="calendar-range" size={18} color="var(--blue-primary)" /></span>
          <div><div className="ac-cad-k">月度汇聚四个周</div><div className="ac-cad-s">周验收上卷为阶段目标验收</div></div>
        </div>
        <div className="ac-cad-item">
          <span className="ac-cad-ico" style={{ background: 'var(--ai-soft)' }}><Icon name="layers" size={18} color="var(--ai)" /></span>
          <div><div className="ac-cad-k">季度汇聚三个阶段</div><div className="ac-cad-s">阶段验收上卷为中短期目标验收</div></div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <span className="ac-direction">
          <Icon name="arrow-up-from-line" size={14} color="var(--blue-primary)" />
          自下而上逐级汇聚<span className="mono">事务 → 周 → 阶段 → 中短期</span>
        </span>
        <span className="t-micro" style={{ color: 'var(--text-400)' }}>点任一层级卡 → 查看该级验收明细、标准对照与留痕</span>
      </div>

      <div className="ac-tree">
        {ACCEPT_HIER.map(n => (
          <AcceptNode key={n.id} node={n} depth={0} expanded={expanded} onToggle={toggle} selected={open && open.id} onOpen={setOpen} />
        ))}
      </div>

      <AcceptDrawer node={open} onClose={() => setOpen(null)} onToast={onToast} />
    </>
  );
}

/* ============================================================
   外壳：验收与闭环（三视图同源切换）
   ============================================================ */
const ACC_VIEWS = [
  { id: 'report',   label: '逐级验收报告', icon: 'circle-check' },
  { id: 'progress', label: '进度推进度',   icon: 'trending-up' },
  { id: 'retro',    label: '验收复盘',     icon: 'refresh-cw' },
];
const ACC_HEAD = {
  report:   { title: '逐级验收报告', desc: '自下而上逐级验收：事务 → 周 → 阶段 → 中短期，每级由验收 AI 按标准审计并评级。' },
  progress: { title: '进度推进度',   desc: '每级验收通过沉淀的永久进度记录，向理想化状态长周期推进，供下次拆解参考。' },
  retro:    { title: '验收复盘',     desc: '每次验收据实际结果回填、修正根基三要素，让理想化状态 / 核心价值 / 目标用户始终反映现实。' },
};

function AcceptanceLoop({ project, onNavigate }) {
  const [view, setView] = React.useState('report');
  const [loading, setLoading] = React.useState(true);
  const [toast, setToast] = React.useState(null);
  const p = window.PROJECT_META || { name: '智能履约调度中台', pid: 'PRJ-2026-0137' };
  const head = ACC_HEAD[view];

  React.useEffect(() => { const t = setTimeout(() => setLoading(false), 850); return () => clearTimeout(t); }, []);
  React.useEffect(() => { refreshIcons(); });

  const fireToast = (msg) => setToast({ msg });

  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: p.name }, { label: head.title }]} />
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico"><Icon name="circle-check" size={22} color="var(--blue-primary)" /></span>
          <div>
            <h1 className="t-h1">验收与闭环</h1>
          </div>
        </div>
        <div className="page-head-right">
          <FeedbackEntry
            context={{ scene: '验收与闭环', did: '自下而上逐级验收（事务 → 周 → 阶段 → 中短期），每级由验收 AI 按标准审计并评级', ask: '某一级的验收评级、标准判定或闭环动作' }}
            onClick={() => fireToast('异步反馈入口已打开（演示）')} />
          <div className="ac-switch">
            {ACC_VIEWS.map(v => (
              <button key={v.id} className="ac-switch-btn" data-on={view === v.id} onClick={() => setView(v.id)}>
                <Icon name={v.icon} size={15} color={view === v.id ? 'var(--text-900)' : 'var(--text-500)'} />{v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === 'report' && <AcceptReport loading={loading} onToast={fireToast} />}
      {view === 'progress' && <ProgressAdvance loading={loading} onNavigate={onNavigate} onToast={fireToast} />}
      {view === 'retro' && <AcceptRetro loading={loading} onNavigate={onNavigate} onToast={fireToast} />}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

Object.assign(window, { AcceptanceLoop, GRADE, Grade, CONCL, ConclPill, ACC_LEVEL, ACCEPT_HIER, TRACE_TONE, fmtPct });
