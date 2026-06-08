/* ============================================================
   项目级 · 介入工作台（pages_b3_intervene.jsx）
   ------------------------------------------------------------
   作用：AI 自治流水线的「边界控制台」。本项目由 AI 在既定规则内自主推进，
         只有「超出规则边界」的事项才上升到此处由人工拍板。每处置一项，AI 同时给出
         系统级规则沉淀 / 优化建议，让同类情形此后自动闭环（面向底层优化）。
         人的常态工作方式是「抽查 / Review / 异步反馈」，本队列应趋近于零。
         与组合级「介入工作台」（pages_intervene.jsx）共用同一套逻辑。
   依赖：components.jsx、doc_kit.jsx、pages_home_data.jsx（HOME_LEVEL）。
   ============================================================ */

/* 事项类型（决策性质）：卡点/成本/排期/验收/拆解/结项。 */
const PIV_TYPE = {
  kapian:   { label: '卡点处置',     icon: 'alert-triangle',  tone: 'warning' },
  cost:     { label: '大额成本审批', icon: 'wallet',          tone: 'danger' },
  schedule: { label: '排期取舍',     icon: 'calendar-clock',  tone: 'info' },
  accept:   { label: '验收裁定',     icon: 'clipboard-check', tone: 'info' },
  review:   { label: '拆解裁定',     icon: 'shield-check',    tone: 'neutral' },
  close:    { label: '结项确认',     icon: 'package-check',   tone: 'neutral' },
};
const PIV_SEV = { red: 'var(--danger)', orange: 'var(--warning)', yellow: '#E6B800' };

/* 边界原因（为何 AI 不能在规则内自主闭环 —— 四种边界）：
   threshold 阈值超限 / gap 规则盲区 / exhausted 自治上限 / mandate 制度保留。
   这是介入队列的核心筛选维度。 */
const PIV_BK = {
  threshold: { label: '阈值超限', icon: 'gauge', c: 'var(--warning)', bg: 'var(--warning-bg)', desc: '命中规则阈值，须人工授权' },
  gap:       { label: '规则盲区', icon: 'puzzle', c: 'var(--info)', bg: 'var(--info-bg)', desc: '无对应规则，须人工裁定后沉淀' },
  exhausted: { label: '自治上限', icon: 'rotate-ccw', c: 'var(--danger)', bg: 'var(--danger-bg)', desc: 'AI 自愈 / 迭代已达上限' },
  mandate:   { label: '制度保留', icon: 'shield-check', c: 'var(--text-500)', bg: 'var(--neutral-bg)', desc: '规则强制保留的人工确认点' },
};

/* 处置动作（与组合级一致：主动作 / 需理由的驳回 / 转入现场）。
   按事项类型不同。reason=true 的动作需填理由；route 表示该动作是跳转到另一工作台。 */
const PIV_ACTIONS = {
  kapian:   [{ k: 'pass', label: '放行', variant: 'primary' }, { k: 'reject', label: '驳回并给修改意见', variant: 'secondary', reason: true }, { k: 'transfer', label: '转入卡点处置', variant: 'text', route: 'p-kapian' }],
  cost:     [{ k: 'approve', label: '批准', variant: 'primary' }, { k: 'reject', label: '驳回（须给理由）', variant: 'danger', reason: true }, { k: 'transfer', label: '前往审批工作台', variant: 'text', route: 'cost-approval' }],
  schedule: [{ k: 'confirm', label: '采纳此排期', variant: 'primary' }, { k: 'adjust', label: '调整后确认', variant: 'secondary', reason: true }],
  accept:   [{ k: 'pass', label: '通过验收', variant: 'primary' }, { k: 'return', label: '退回整改', variant: 'secondary', reason: true }, { k: 'transfer', label: '进入验收复核', variant: 'text', route: 'p-accept' }],
  review:   [{ k: 'pass', label: '采纳拆解', variant: 'primary' }, { k: 'return', label: '退回修改', variant: 'secondary', reason: true }],
  close:    [{ k: 'agree', label: '同意结项', variant: 'primary' }, { k: 'disagree', label: '不同意（须给理由）', variant: 'danger', reason: true }],
};

/* 本项目「超出边界 · 待人工拍板」事项（mock）
   每项含：boundary（为何越界 + 关联规则）+ fix（系统级优化建议，处置后沉淀/优化规则）
   + aiDone（AI 已在规则内做的动作）+ impactStats/impactList（影响面）。 */
const PIV_ITEMS = [
  { id: 'iv-1', type: 'kapian', sev: 'red', level: 'phase', ver: 'v1.1', urgency: '高', waited: '3h 12m',
    goal: '履约时效 < 4h', node: 'phase-a1',
    riskRef: { id: 'RK-0137-01', name: '实时路况数据源单点依赖' },
    boundary: { kind: 'exhausted', why: 'AI 验收官已自动重跑验收 2 次、自愈失败，超出「验收自愈」规则的自动放行上限，须人工裁定。', rule: { id: 'R-ACCEPT-LOOP', name: '逐级验收闭环' } },
    summary: '路况源选型连续两次验收未通过，实时数据管道时延超标，阶段目标「履约时效 < 4h」被阻断。',
    ai: '建议驳回并要求补充实时路况数据源后重新提交；放行后由 AI 员工自动接入并重跑验收。',
    fix: { kind: 'optimize', rule: '验收自愈失败时，自动附「根因数据缺口清单」随退回单下发，由 AI 执行官先行补数再提交，仅缺口无法自动补齐时才升级人工。', effect: '同类「数据缺口型」验收失败将由 AI 闭环，预计减少约 70% 同类拍板。', ruleRef: 'R-ACCEPT-LOOP' },
    ctx: { goal: '阶段目标：履约时效 < 4h', task: '事务 T-0312 · 接入实时路况', trail: '验收留痕 · 连续 2 次未通过' },
    aiDone: [
      { act: '自动重跑验收', actor: '验收 Agent', when: '09:12', desc: '按既定脚本重跑两轮，均因实时路况字段缺失而未通过。' },
      { act: '定位根因', actor: '诊断 Agent', when: '09:30', desc: '追溯到事务 T-0312 的数据源未接入实时路况，置信度 0.92。', basis: '验收日志 · 字段空值率 100%' },
      { act: '尝试自愈失败 · 升级人工', actor: '调度 Agent', when: '09:34', desc: '自动补数脚本无可用数据源，自愈耗尽，按规则升级人工裁定。' },
    ],
    impactStats: [{ v: '2', unit: '次', k: '自愈重试已耗尽', deltaTone: 'danger', delta: '阻断中' }, { v: '3h 12m', k: '阶段目标已阻断' }, { v: '2', unit: '个', k: '下游周目标受阻' }],
    impactList: [{ text: '阶段目标「履约时效 < 4h」被阻断，状态置为受阻', icon: 'target', tone: 'danger' }, { text: '下游 2 个周目标无法推进', icon: 'git-fork', tone: 'warning' }, { text: '关联事务 T-0312 处于挂起，待放行后执行', icon: 'square-check-big', tone: 'neutral' }] },

  { id: 'iv-2', type: 'cost', level: 'task', ver: '事务 T-0291', urgency: '高', waited: '1h 05m', amount: '¥1,820,000',
    goal: '路况源选型与采购', node: 'task-0291',
    boundary: { kind: 'threshold', why: '单笔采购金额 ¥1,820,000 超出「大额成本审批」规则的自动放行阈值（¥50,000），按规则须管理层授权。', rule: { id: 'R-COST', name: '大额成本审批' } },
    summary: '拟对外采购第三方地图路况 API 年度授权，金额超大额审批阈值，须人工授权。',
    ai: '采购单价低于市场基准约 8%，预算口径合规，建议批准；批准后 AI 自动下单并登记资产。',
    fix: { kind: 'optimize', rule: '对「预算口径内 且 单价低于市场基准」的年度授权类采购，放宽自动放行上限至 ¥2,000,000，仅留事后抽查。', effect: '合规的常规年度授权将免拍板，仅异常单价 / 超预算才升级人工。', ruleRef: 'R-COST' },
    ctx: { goal: '中短期目标：调度时效提升 30%', task: '事务 T-0291 · 路况源选型', trail: '成本审批留痕 · 待授权' },
    aiDone: [
      { act: '多方比价', actor: '采购 Agent', when: '昨日 17:40', desc: '比对 3 家供应商年度授权报价，本方案单价最低，低于市场基准约 8%。', basis: '比价表 · QUOTE-0291' },
      { act: '合规与预算校验', actor: '财务 Agent', when: '昨日 17:52', desc: '预算口径、采购红线、供应商资质均通过校验。' },
      { act: '命中阈值 · 升级授权', actor: '风控 Agent', when: '昨日 18:01', desc: '金额超大额审批阈值，按 R-COST 规则生成授权单并升级管理层。' },
    ],
    impactStats: [{ v: '¥1.82M', k: '采购金额' }, { v: '-8%', k: '对比市场基准', deltaTone: 'success', delta: '更优' }, { v: '~5 周', k: '预计回收周期' }],
    impactList: [{ text: '支撑中短期目标「调度时效提升 30%」的关键数据源', icon: 'target', tone: 'blue' }, { text: '解锁事务 T-0291 路况源选型，进入接入实施', icon: 'square-check-big', tone: 'neutral' }] },

  { id: 'iv-3', type: 'schedule', level: 'week', ver: '2026 年 06 月第 1 周', urgency: '中', waited: '46m',
    goal: '高峰运力排期资源冲突', node: 'week-w1',
    boundary: { kind: 'gap', why: '两条周计划在高峰时段争抢同一运力池，自动调度无满足全部约束的可行解，且无「高峰运力优先级」规则可依，须人工取舍。', rule: { id: '—', name: '暂无对应规则' } },
    summary: '本周履约高峰，两条周计划在同一时段争抢运力池，AI 调度无可行解，需人工裁定优先级。',
    ai: '建议优先保障「履约时效」相关周计划，另一条顺延 1 天；裁定后可沉淀为高峰运力优先级规则。',
    fix: { kind: 'create', rule: '新增「高峰运力优先级」规则：运力冲突时，按所支撑目标层级（阶段 > 周）与紧急度自动排序，仅同级冲突才升级人工。', effect: '高峰期运力冲突由 AI 按规则自动取舍，无需逐次人工裁定。', ruleRef: null },
    ctx: { goal: '周计划：高峰运力调度', task: '事务 T-0488 / T-0492', trail: '排期留痕 · 资源冲突' },
    aiDone: [
      { act: '冲突检测', actor: '调度 Agent', when: '今日 07:58', desc: '识别两条周计划在 18:00–21:00 高峰争抢同一运力池，自动求解无可行解。', basis: '排期留痕 · 冲突矩阵' },
      { act: '生成两套取舍方案', actor: '调度 Agent', when: '今日 08:02', desc: '已生成「保时效优先」与「均摊顺延」两套方案及影响评估，待人工取舍。' },
    ],
    impactStats: [{ v: '2', unit: '条', k: '冲突周计划', deltaTone: 'warning' }, { v: '0', unit: '个', k: '自动可行解', deltaTone: 'danger' }, { v: '高峰', k: '冲突时段' }],
    impactList: [{ text: '不裁定则两条周计划均被阻塞', icon: 'calendar-clock', tone: 'warning' }, { text: '裁定结论可直接沉淀为高峰运力优先级规则', icon: 'settings-2', tone: 'blue' }] },

  { id: 'iv-4', type: 'review', level: 'phase', ver: '调度域第 2 层', urgency: '中', waited: '48m',
    goal: '调度域目标拆解颗粒度', node: 'tree-sched-2',
    boundary: { kind: 'exhausted', why: '自动拆解已往返 3 次仍未收敛到周目标层级，超出「自上而下拆解」规则的自动迭代上限，须人工裁定颗粒度。', rule: { id: 'R-DECOMP', name: '理想化状态自上而下拆解' } },
    summary: '目标拆解第 3 次往返：阶段目标颗粒度仍偏粗，未拆解至可执行的周目标层级。',
    ai: '建议退回并指定拆解至周目标层级后再提交。',
    fix: { kind: 'optimize', rule: '拆解规则增加「最小颗粒度=周目标」硬约束与自动迭代上限（2 次）；超限即附颗粒度诊断升级人工，避免无效往返。', effect: '颗粒度不足将被规则前置拦截并自动细化，减少反复往返与人工裁定。', ruleRef: 'R-DECOMP' },
    ctx: { goal: '目标树 · 调度域第 2 层', task: '—', trail: '拆解审核留痕 · 往返 ×3' },
    aiDone: [
      { act: '自动拆解', actor: '拆解 Agent', when: '往返 ×3', desc: '已三次生成阶段目标拆解，每次按上轮意见细化，但颗粒度仍未到周目标层级。', basis: '拆解审核留痕 · 往返记录' },
      { act: '迭代耗尽 · 升级人工', actor: '拆解 Agent', when: '今日 10:02', desc: '自检判定仍为阶段级、达到自动迭代上限，提交人工裁定。' },
    ],
    impactStats: [{ v: '3', unit: '次', k: '拆解往返已耗尽', deltaTone: 'warning' }, { v: '第 2', unit: '层', k: '当前颗粒度' }, { v: '48m', k: '本轮已等待' }],
    impactList: [{ text: '调度域第 2 层无法向下展开为可执行事务', icon: 'git-fork', tone: 'warning' }, { text: '阻塞后续事务派发与 AI 员工调用', icon: 'square-check-big', tone: 'neutral' }] },

  { id: 'iv-5', type: 'close', level: 'ideal', ver: '理想化状态', urgency: '低', waited: '12h 10m',
    goal: '旧版调度规则全量下线', node: 'goal-ideal-2',
    boundary: { kind: 'mandate', why: '结项属高影响动作，「强制结项双重确认」规则强制保留人工签署，AI 不自动结项——此为制度刻意保留的人工确认点。', rule: { id: 'R-CLOSURE', name: '强制结项双重确认' } },
    summary: 'AI 判定旧版调度规则已被新引擎全量替代、相关阶段目标均已达成，备齐材料申请结项。',
    ai: '验收留痕完整、无遗留卡点，建议同意结项；同意后 AI 自动生成结项报告并归档。',
    fix: { kind: 'keep', rule: '结项双重确认为制度刻意保留的人工拍板点，不纳入自动化；AI 仅负责备齐材料与达成核验。', effect: '此类事项将长期保留人工确认，但 AI 会把材料准备做到「一键确认」。', ruleRef: 'R-CLOSURE' },
    ctx: { goal: '理想化状态：旧版规则下线', task: '事务 T-0102 · 灰度切流', trail: '结项审核留痕 · 待确认' },
    aiDone: [
      { act: '目标达成核验', actor: '验收 Agent', when: '昨日 14:00', desc: '逐项核对相关阶段目标均已验收通过，旧规则流量已归零。', basis: '验收留痕 · 全部通过' },
      { act: '生成结项材料', actor: '结项 Agent', when: '昨日 14:20', desc: '已生成结项报告草案与收益复盘，等待人工确认后归档。' },
    ],
    impactStats: [{ v: '100%', k: '阶段目标达成', deltaTone: 'success' }, { v: '0', unit: '个', k: '遗留卡点', deltaTone: 'success' }, { v: '0%', k: '旧规则流量', deltaTone: 'success' }],
    impactList: [{ text: '确认后该目标转入已结项，释放占用的 AI 员工配额', icon: 'package-check', tone: 'success' }, { text: '结项报告与全过程留痕归档至知识库', icon: 'library', tone: 'neutral' }] },
];

/* 实时边界事件：加载后从顶部脈冲滑入的一条新事项（演示「实时边界告警」）。 */
const PIV_NEW = { id: 'iv-new', type: 'kapian', sev: 'red', level: 'mid', ver: '实时', urgency: '高', waited: '刚刚',
  goal: '调度时效提升 30%', node: 'goal-mid-1', _new: true,
  riskRef: { id: 'RK-0137-02', name: '调度 AI 员工调用超时率突增' },
  boundary: { kind: 'threshold', why: '调度 AI 员工调用超时率突增至 6.2%，突破实时阈值（5%），AI 已自动降级保护但根因超出自治范围，须人工核查。', rule: { id: 'R-RISK-TREND', name: '风险分级趋势降权' } },
  summary: '新边界事件：调度 AI 员工调用超时率突增至 6.2%，触发实时阈值，已自动降级、根因待核查。',
  ai: '建议立即转入卡点处置，核查算力与依赖服务状态。',
  fix: { kind: 'optimize', rule: '将「超时率突增 + 已自动降级且服务未雪崩」归类为观察级而非阻断级，给 AI 一个自愈观察窗口后再决定是否升级人工。', effect: '短时抖动不再立即打扰人工，仅持续恶化才升级。', ruleRef: 'R-RISK-TREND' },
  ctx: { goal: '中短期目标：调度时效提升 30%', task: '事务 T-0299 · 实时调度', trail: '风险留痕 · 阈值告警（实时）' },
  aiDone: [
    { act: '实时阈值告警', actor: '监控 Agent', when: '刚刚', desc: '调度 AI 员工调用超时率由 1.1% 突增至 6.2%，超过实时阈值（5%）。', basis: '风险留痕 · 实时告警' },
    { act: '自动降级保护', actor: '调度 Agent', when: '刚刚', desc: '已对超时请求启用排队降级，避免雪崩，但根因待人工核查。' },
  ],
  impactStats: [{ v: '6.2%', k: '调用超时率', deltaTone: 'danger', delta: '突增' }, { v: '5%', k: '实时阈值' }, { v: '已降级', k: '保护状态', deltaTone: 'warning' }],
  impactList: [{ text: '实时调度时效受影响，威胁中短期目标', icon: 'target', tone: 'danger' }, { text: '已自动降级，但根因（算力 / 依赖服务）待核查', icon: 'server', tone: 'warning' }],
  route: 'p-kapian', nodeId: 'phase-a1' };

/* ---------- 处置档案（抽屉只读档案体） ----------
   PivDisposalBody：用 doc_kit 原语拼装出一份完整处置档案（边界原因/概要/AI 已做动作/
     影响面/AI 建议/系统级优化）。只读展示，动作在底部 PivDisposalActions。 */
function PivDisposalBody({ item, onNavigate }) {
  const t = PIV_TYPE[item.type];
  const lv = window.HOME_LEVEL[item.level];
  const bk = PIV_BK[item.boundary.kind];
  const metaItems = [
    { k: '事项类型', v: t.label },
    { k: '关联目标', v: item.goal },
    { k: '目标层级', v: lv ? lv.label : '—' },
    { k: '边界原因', v: <b style={{ color: bk.c }}>{bk.label}</b> },
    { k: '紧急度', v: <b style={{ color: item.urgency === '高' ? 'var(--danger)' : item.urgency === '中' ? 'var(--warning)' : 'var(--text-500)' }}>{item.urgency}</b> },
    { k: '已等待', v: <span className="mono">{item.waited}</span> },
    ...(item.amount ? [{ k: '涉及金额', v: <b style={{ color: 'var(--danger)' }} className="mono">{item.amount}</b> }] : []),
  ];
  const ctxPeople = [
    { role: '关联目标', who: item.ctx.goal, icon: 'target' },
    { role: '关联事务', who: item.ctx.task, icon: 'square-check-big' },
    { role: '留痕链', who: item.ctx.trail, icon: 'history' },
  ];
  const fix = item.fix;
  const fixLabel = { optimize: '优化规则', create: '沉淀新规则', keep: '制度保留' }[fix.kind];
  return (
    <DocDoc>
      <DocBanner tone={item.type === 'close' ? 'success' : 'ai'} icon={item._new ? 'zap' : 'sparkles'}>
        AI 已在规则内自主处理至此并备齐材料；该事项因「{bk.label}」超出自治边界，剩余决策须人工拍板。处置后请一并确认下方的系统级优化，让同类情形未来自动闭环。
      </DocBanner>

      <DocSec no="01" title="为何需要你 · 边界原因" icon="git-pull-request-arrow">
        <div className="ivx-why-box" style={{ '--bk-c': bk.c, '--bk-bg': bk.bg }}>
          <span className="ivx-why-tag" style={{ color: bk.c, background: bk.bg }}><Icon name={bk.icon} size={12} color={bk.c} />{bk.label}</span>
          <p className="ivx-why-text">{item.boundary.why}</p>
          <div className="ivx-why-rule">
            <Icon name="scale" size={12} color="var(--text-400)" />关联规则
            {item.boundary.rule.id && item.boundary.rule.id !== '—'
              ? <button className="ivx-rule-link" onClick={() => onNavigate && onNavigate('rules')}><span className="mono">{item.boundary.rule.id}</span> · {item.boundary.rule.name}<Icon name="arrow-up-right" size={11} color="var(--blue-primary)" /></button>
              : <span style={{ color: 'var(--text-500)' }}>{item.boundary.rule.name}</span>}
          </div>
        </div>
      </DocSec>

      <DocSec no="02" title="事项概要" icon="file-badge"><DocMeta items={metaItems} /></DocSec>

      <DocSec no="03" title={t.label + ' · 详情'} icon={t.icon}>
        <DocPara>{item.summary}</DocPara>
        <div style={{ marginTop: 12 }}><DocPeople rows={ctxPeople} /></div>
        {item.riskRef && onNavigate && (
          <button className="kp-link" style={{ marginTop: 12 }} onClick={() => onNavigate('p-risk')}>
            <span className="kp-link-ico" style={{ background: 'var(--danger-bg)' }}><Icon name="radar" size={16} color="var(--danger)" /></span>
            <span className="kp-link-main">
              <span className="kp-link-k">关联风险事件 · <span className="mono">{item.riskRef.id}</span></span>
              <span className="kp-link-v">该事项由风险「{item.riskRef.name}」越界上抛 · 查看完整风险档案</span>
            </span>
            <Icon name="arrow-up-right" size={16} color="var(--text-400)" />
          </button>
        )}
        {item.type === 'kapian' && onNavigate && (
          <button className="kp-link" style={{ marginTop: 12 }} onClick={() => onNavigate('p-kapian', { nodeId: item.nodeId || 'phase-a1' })}>
            <span className="kp-link-ico" style={{ background: 'var(--warning-bg)' }}><Icon name="alert-triangle" size={16} color="var(--warning)" /></span>
            <span className="kp-link-main">
              <span className="kp-link-k">逐环审核 · 卡点上下文</span>
              <span className="kp-link-v">查看完整卡点处置工作台</span>
            </span>
            <Icon name="arrow-up-right" size={16} color="var(--text-400)" />
          </button>
        )}
      </DocSec>

      {item.aiDone && (
        <DocSec no="04" title="AI 已做动作（规则内自治）" icon="bot">
          <DocChain items={item.aiDone.map(a => ({ ...a, ai: true }))} />
        </DocSec>
      )}

      {item.impactStats && (
        <DocSec no="05" title="影响面" icon="radar">
          <DocStats items={item.impactStats} />
          {item.impactList && <div style={{ marginTop: 14 }}><DocList items={item.impactList} /></div>}
        </DocSec>
      )}

      <DocSec no="06" title="处置方案 · AI 建议" icon="lightbulb">
        <DocAINote>{item.ai}</DocAINote>
        <p className="t-micro" style={{ color: 'var(--text-400)', marginTop: 10 }}>
          <Icon name="info" size={12} color="var(--text-400)" style={{ verticalAlign: '-2px', marginRight: 4 }} />
          在下方选择处置动作；处置结果与理由将一并写入留痕。
        </p>
      </DocSec>

      <DocSec no="07" title="根因与系统级优化 · 避免再次发生" icon="settings-2">
        {fix.kind === 'keep' ? (
          <div className="ivx-fix is-keep">
            <div className="ivx-fix-head"><Icon name="shield-check" size={14} color="var(--text-500)" /><span>制度保留的人工确认点</span></div>
            <p className="ivx-fix-rule">{fix.rule}</p>
            <p className="ivx-fix-effect"><Icon name="info" size={12} color="var(--text-400)" />{fix.effect}</p>
          </div>
        ) : (
          <div className="ivx-fix">
            <div className="ivx-fix-head"><Icon name="sparkles" size={14} color="var(--ai)" /><span>AI 建议{fixLabel}，从底层消除此类边界</span></div>
            <p className="ivx-fix-rule">「{fix.rule}」</p>
            <p className="ivx-fix-effect"><Icon name="trending-down" size={12} color="var(--success)" />{fix.effect}</p>
            <button className="ivx-fix-btn" onClick={() => onNavigate && onNavigate('rules')}>
              <Icon name="git-commit-vertical" size={14} color="var(--blue-primary)" />
              {fix.kind === 'create' ? '沉淀为新规则（送治理确认）' : '提交规则优化（送治理确认）'}
              <Icon name="arrow-up-right" size={13} color="var(--blue-primary)" />
            </button>
          </div>
        )}
      </DocSec>
    </DocDoc>
  );
}

/* ---------- 处置动作（抽屉底部） ----------
   PivDisposalActions：按事项类型渲染动作按钮。
   二步确认：reason=true 的动作首点展开理由输入（pending）、填完再点才 commit；
     route 动作直接跳转。 */
function PivDisposalActions({ item, onDispose }) {
  const [pending, setPending] = React.useState(null);
  const [reason, setReason] = React.useState('');
  const actions = PIV_ACTIONS[item.type];
  React.useEffect(() => { setPending(null); setReason(''); }, [item.id]);
  const commit = (act) => {
    if (act.route) { onDispose(item, act, ''); return; }
    if (act.reason && pending !== act.k) { setPending(act.k); return; }
    if (act.reason && !reason.trim()) return;
    onDispose(item, act, reason.trim());
  };
  return (
    <div className="disp-foot">
      {pending && (
        <div className="disp-reason">
          <label className="t-caption" style={{ fontWeight: 500, color: 'var(--text-700)' }}>处置理由 / 修改意见<span style={{ color: 'var(--danger)' }}> *</span></label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="将随处置一并写入留痕，AI 员工与协作方可见…" autoFocus />
        </div>
      )}
      <div className="disp-actions">
        {actions.map(a => (
          <Button key={a.k} variant={a.variant} icon={a.route ? 'arrow-right' : undefined}
            onClick={() => commit(a)}
            disabled={pending && pending !== a.k && a.reason}
            className={pending === a.k ? 'is-armed' : ''}>
            {pending === a.k ? '确认处置' : a.label}
          </Button>
        ))}
        {pending && <Button variant="text" onClick={() => { setPending(null); setReason(''); }}>取消</Button>}
      </div>
    </div>
  );
}

/* ---------- 列表骨架 ---------- */
function PivSkel() {
  return (
    <div className="iv-card" style={{ cursor: 'default' }}>
      <span className="iv-card-bar" style={{ background: 'var(--divider)' }} />
      <div className="iv-card-main">
        <div style={{ display: 'flex', gap: 10 }}><Skel w={160} h={14} /><Skel w={90} h={14} /></div>
        <Skel w="90%" h={13} style={{ marginTop: 12 }} />
        <Skel w="60%" h={12} style={{ marginTop: 12 }} />
      </div>
    </div>
  );
}

/* ---------- 人的工作方式卡片 ---------- */
function PivModeCard({ icon, title, desc, tag, onClick, children }) {
  if (children) return <div className="ivx-mode" data-as="wrap">{children}</div>;
  return (
    <button className="ivx-mode" onClick={onClick}>
      <span className="ivx-mode-ico"><Icon name={icon} size={17} color="var(--blue-primary)" /></span>
      <span className="ivx-mode-main">
        <span className="ivx-mode-t">{title}<span className="ivx-mode-tag">{tag}</span></span>
        <span className="ivx-mode-d">{desc}</span>
      </span>
      <Icon name="arrow-right" size={15} color="var(--text-400)" />
    </button>
  );
}

/* ---------- 项目级介入工作台主页面 ----------
   ProjectIntervene：状态 items 事项列表；bk 边界筛选；sort 排序；active 当前抽屉。
   实时边界事件：加载完成 ~5s 后从顶部脈冲滑入一条新事项（PIV_NEW）。
   dispose：route 动作跳转；其余从列表移除并弹 Toast（有 fix 则提示「送治理确认」）。 */
function ProjectIntervene({ project, onNavigate }) {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState(PIV_ITEMS);
  const [bk, setBk] = React.useState('all');
  const [sort, setSort] = React.useState('urgency');
  const [active, setActive] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const newAddedRef = React.useRef(false);
  const p = { ...window.PROJECT_META, ...(project || {}) };

  React.useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);
  React.useEffect(() => { refreshIcons(); });

  // 实时边界事件：加载完成 ~5s 后脉冲滑入
  React.useEffect(() => {
    if (loading || newAddedRef.current) return;
    const t = setTimeout(() => { newAddedRef.current = true; setItems(prev => [PIV_NEW, ...prev]); }, 5200);
    return () => clearTimeout(t);
  }, [loading]);

  const bkCounts = React.useMemo(() => {
    const c = { all: items.length };
    Object.keys(PIV_BK).forEach(k => c[k] = items.filter(i => i.boundary.kind === k).length);
    return c;
  }, [items]);

  const urgOrder = { '高': 0, '中': 1, '低': 2 };
  const view = React.useMemo(() => {
    let v = bk === 'all' ? items : items.filter(i => i.boundary.kind === bk);
    v = [...v].sort((a, b) => sort === 'urgency'
      ? urgOrder[a.urgency] - urgOrder[b.urgency]
      : (a._new ? -1 : b._new ? 1 : 0));
    return v;
  }, [items, bk, sort]);

  const dispose = (item, act, reason) => {
    if (act.route) { setActive(null); onNavigate && onNavigate(act.route, item.nodeId ? { nodeId: item.nodeId } : (act.route === 'p-kapian' ? { nodeId: item.node } : undefined)); return; }
    setItems(prev => prev.filter(i => i.id !== item.id));
    setActive(null);
    const hasFix = item.fix && item.fix.kind !== 'keep';
    setToast(hasFix
      ? { msg: `已处置「${PIV_TYPE[item.type].label}」· 已生成规则${item.fix.kind === 'create' ? '沉淀' : '优化'}建议`, action: '送治理确认', onAction: () => { setToast(null); onNavigate && onNavigate('rules'); } }
      : { msg: `已处置「${PIV_TYPE[item.type].label}」· 已写入留痕`, action: '查看留痕', onAction: () => { setToast(null); onNavigate && onNavigate('rules'); } });
  };

  const filterList = [['all', '全部边界', 'layers'], ...Object.keys(PIV_BK).map(k => [k, PIV_BK[k].label, PIV_BK[k].icon])];

  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: p.name }, { label: '介入工作台' }]} />
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico"><Icon name="git-pull-request-arrow" size={22} color="var(--blue-primary)" /></span>
          <div><h1 className="t-h1">介入工作台</h1></div>
        </div>
        <div className="page-head-right">
          {typeof FeedbackEntry !== 'undefined' && <FeedbackEntry context={{ scene: '项目级 · 介入工作台', did: `正在审视「${p.name}」的 AI 自治运行`, ask: '运行偏差、规则盲区或希望优化的处置逻辑' }} onClick={() => {}} />}
          <Button variant="secondary" size="sm" icon="git-fork" onClick={() => onNavigate && onNavigate('p-tree')}>返回目标树</Button>
        </div>
      </div>

      {/* 运行模型 · AI 自治流水线 */}
      <div className="ivx-model">
        <div className="ivx-model-l">
          <span className="ivx-model-ico"><Icon name="workflow" size={20} color="var(--blue-primary)" /></span>
          <div>
            <div className="ivx-model-t"><span className="ivx-live"><span className="ivx-live-dot" />运行中</span>本项目以 AI 自治流水线推进</div>
            <div className="ivx-model-s">AI 在既定规则内自主决策与执行；仅「超出规则边界」的少数事项才上升到此处由人拍板。每次拍板都会沉淀 / 优化规则，让此队列持续趋近于零。</div>
          </div>
        </div>
        <div className="ivx-model-stats">
          <div className="ivx-stat"><span className="ivx-stat-v mono" style={{ color: 'var(--success)' }}>{loading ? '—' : '96.2%'}</span><span className="ivx-stat-k">近 7 日自治闭环率</span></div>
          <div className="ivx-stat"><span className="ivx-stat-v mono">{loading ? '—' : '248'}</span><span className="ivx-stat-k">AI 自治处置（近 7 日）</span></div>
          <div className="ivx-stat is-hot"><span className="ivx-stat-v mono" style={{ color: 'var(--warning)' }}>{loading ? '—' : items.length}</span><span className="ivx-stat-k">触达边界 · 待你拍板</span></div>
        </div>
      </div>

      {/* 边界外 · 待人工拍板 */}
      <div className="ivx-q-head" style={{ justifyContent: 'flex-end' }}>
        <div className="iv-sort">
          <span className="t-micro" style={{ color: 'var(--text-400)' }}>排序</span>
          <button className="iv-sort-btn" data-on={sort === 'urgency'} onClick={() => setSort('urgency')}>紧急度</button>
          <button className="iv-sort-btn" data-on={sort === 'waited'} onClick={() => setSort('waited')}>等待时长</button>
        </div>
      </div>

      {/* 边界原因筛选 */}
      <div className="ivx-filter">
        {filterList.map(([k, label, icon]) => (
          <button key={k} className="ivx-filter-btn" data-on={bk === k} onClick={() => setBk(k)}>
            <Icon name={icon} size={14} color={bk === k ? 'var(--blue-primary)' : (PIV_BK[k] ? PIV_BK[k].c : 'var(--text-500)')} />
            {label}
            <span className="mono ivx-filter-n">{loading ? '·' : bkCounts[k]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="iv-list">{[0, 1, 2].map(i => <PivSkel key={i} />)}</div>
      ) : view.length === 0 ? (
        <Card><EmptyState glyph="circle-check" title={bk === 'all' ? '没有超出边界的事项' : '该边界类型暂无事项'} desc="所有事务都在规则内由 AI 自治闭环，无需人工拍板。这正是流水线追求的理想状态。" action={<span className="pill" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><span className="dot" style={{ background: 'var(--success)' }} />全自治运行</span>} /></Card>
      ) : (
        <div className="iv-list">
          {view.map(item => {
            const t = PIV_TYPE[item.type];
            const lv = window.HOME_LEVEL[item.level];
            const bki = PIV_BK[item.boundary.kind];
            const barColor = item.type === 'kapian' ? PIV_SEV[item.sev] : `var(--${t.tone === 'neutral' ? 'border-300' : t.tone})`;
            return (
              <button key={item.id} className={`iv-card${item._new ? ' pulse-in' : ''}`} onClick={() => setActive(item)}>
                <span className="iv-card-bar" style={{ background: bki.c }} />
                <div className="iv-card-main">
                  <div className="iv-card-top">
                    <span className="ivx-bk" style={{ color: bki.c, background: bki.bg }}><Icon name={bki.icon} size={12} color={bki.c} />{bki.label}</span>
                    <span className="iv-proj">{item.goal}</span>
                    {lv && <span className="iv-level"><Icon name={lv.icon} size={12} color="var(--text-400)" />{lv.label}</span>}
                    <span className="iv-type-tag" style={{ color: barColor, background: item.type === 'kapian' ? (item.sev === 'red' ? 'var(--danger-bg)' : 'var(--warning-bg)') : `var(--${t.tone === 'neutral' ? 'neutral-bg' : t.tone + '-bg'})` }}>
                      <Icon name={t.icon} size={13} color={barColor} />{t.label}
                    </span>
                    {item._new && <span className="iv-new-tag">新</span>}
                    <span className="iv-waited mono"><Icon name="clock" size={13} color="var(--text-400)" />{item.waited}</span>
                  </div>
                  <div className="ivx-why-line"><Icon name="git-pull-request-arrow" size={13} color={bki.c} /><span className="ivx-why-label">为何需要你</span>{item.boundary.why}</div>
                  <div className="iv-ai"><Icon name="sparkles" size={14} color="var(--ai)" /><span className="iv-ai-label">AI 建议</span>{item.ai}</div>
                </div>
                <span className="iv-urg" data-u={item.urgency}>{item.urgency}</span>
                <Icon name="chevron-right" size={18} color="var(--text-400)" />
              </button>
            );
          })}
        </div>
      )}

      <Drawer
        open={!!active}
        onClose={() => setActive(null)}
        width={620}
        icon={active ? { name: PIV_TYPE[active.type].icon, color: active.type === 'kapian' ? PIV_SEV[active.sev] : 'var(--blue-primary)' } : null}
        title={active ? active.goal : ''}
        sub={active ? `${(window.HOME_LEVEL[active.level] || {}).label || ''} · ${PIV_TYPE[active.type].label} · 处置档案` : ''}
        headRight={active && typeof FeedbackEntry !== 'undefined' && (
          <FeedbackEntry label="反馈"
            context={{ scene: '项目级 · 介入工作台 · 处置档案', did: `当前查看「${active.goal}」的${PIV_TYPE[active.type].label}处置档案（边界原因：${PIV_BK[active.boundary.kind].label}）`, ask: 'AI 的处置建议、边界判定或系统级规则优化建议' }}
            onClick={() => {}} />
        )}
        footer={active && <PivDisposalActions item={active} onDispose={dispose} />}
      >
        {active && <PivDisposalBody item={active} onNavigate={onNavigate} />}
      </Drawer>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

Object.assign(window, { ProjectIntervene, PIV_ITEMS, PIV_TYPE, PIV_BK });
