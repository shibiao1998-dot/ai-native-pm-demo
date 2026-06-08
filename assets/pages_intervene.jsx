/* ============================================================
   页面 1.1 · 介入工作台（组合级 · 管理层集中处置）
   ------------------------------------------------------------
   作用：跨项目集集中处置「超出 AI 自治边界」的事项。与项目级介入工作台
         （pages_b3_intervene.jsx）同构，区别是此处多了「项目集总览 → 进入某集工作台」的两段式导航。
   数据：INTERVENE_ITEMS / NEW_KAPIAN 为 mock；IV_BOUNDARY 按类型派生边界原因与优化建议。
   ============================================================ */

/* 事项类型（决策性质）：卡点/成本/战略/拆解/结项/异步反馈。 */
const ITEM_TYPE = {
  kapian:   { label: '卡点', icon: 'alert-triangle', tone: 'warning' },
  cost:     { label: '大额成本审批', icon: 'wallet', tone: 'danger' },
  strategy: { label: '战略影响判断', icon: 'compass', tone: 'info' },
  review:   { label: '拆解审核往返', icon: 'shield-check', tone: 'neutral' },
  close:    { label: '结项审核', icon: 'package-check', tone: 'neutral' },
  feedback: { label: '异步反馈处置', icon: 'message-square-text', tone: 'info' },
};
const SEV_COLOR = { red: 'var(--danger)', orange: 'var(--warning)', yellow: '#E6B800' };

const ITEM_ACTIONS = {
  kapian:   [{ k: 'pass', label: '放行', variant: 'primary' }, { k: 'reject', label: '驳回并给修改意见', variant: 'secondary', reason: true }, { k: 'transfer', label: '转入项目现场', variant: 'text' }],
  cost:     [{ k: 'approve', label: '批准', variant: 'primary' }, { k: 'reject', label: '驳回（须给理由）', variant: 'danger', reason: true }],
  strategy: [{ k: 'adopt', label: '落实', variant: 'primary' }, { k: 'drop', label: '不落实', variant: 'secondary' }],
  review:   [{ k: 'pass', label: '通过', variant: 'primary' }, { k: 'return', label: '退回修改', variant: 'secondary', reason: true }],
  close:    [{ k: 'agree', label: '同意结项', variant: 'primary' }, { k: 'disagree', label: '不同意（须给理由）', variant: 'danger', reason: true }],
  feedback: [{ k: 'done', label: '标记已处置', variant: 'primary' }, { k: 'forward', label: '转交项目负责人', variant: 'secondary' }],
};

/* 边界原因（为何 AI 不能在规则内自主闭环 —— 四种边界） */
const IV_BK = {
  threshold: { label: '阈值超限', icon: 'gauge', c: 'var(--warning)', bg: 'var(--warning-bg)', desc: '命中规则阈值，须人工授权' },
  gap:       { label: '规则盲区', icon: 'puzzle', c: 'var(--info)', bg: 'var(--info-bg)', desc: '无对应规则，须人工裁定后沉淀' },
  exhausted: { label: '自治上限', icon: 'rotate-ccw', c: 'var(--danger)', bg: 'var(--danger-bg)', desc: 'AI 自愈 / 迭代已达上限' },
  mandate:   { label: '制度保留', icon: 'shield-check', c: 'var(--text-500)', bg: 'var(--neutral-bg)', desc: '规则强制保留的人工确认点' },
};

/* 按类型派生的边界原因 + 系统级优化建议（item 可用自身的 boundary / fix 覆盖）。
   ivBoundary(item) / ivFix(item)：取 item 自带的，否则回退到按类型派生。 */
const IV_BOUNDARY = {
  kapian:   { kind: 'exhausted', why: 'AI 已按规则自动重试 / 自愈但仍未通过，超出自动放行上限，须人工裁定。', rule: { id: 'R-ACCEPT-LOOP', name: '逐级验收闭环' },
              fix: { kind: 'optimize', rule: '自愈失败时自动附「根因数据缺口清单」随退回单下发，由 AI 执行官先行补数再提交，仅无法自动补齐才升级人工。', effect: '同类「数据缺口型」失败将由 AI 闭环，减少约 70% 同类拍板。' } },
  cost:     { kind: 'threshold', why: '单笔金额超出「大额成本审批」规则的自动放行阈值（¥50,000），按规则须管理层授权。', rule: { id: 'R-COST', name: '大额成本审批' },
              fix: { kind: 'optimize', rule: '对「预算口径内 且 单价低于市场基准」的常规采购，放宽自动放行上限，仅留事后抽查。', effect: '合规常规采购免拍板，仅异常单价 / 超预算才升级人工。' } },
  strategy: { kind: 'gap', why: '属新型战略相关性判断，规则库无对应规则可自动决策，须人工裁定后沉淀。', rule: { id: '—', name: '暂无对应规则' },
              fix: { kind: 'create', rule: '沉淀「战略相关度 → 配额联动」规则：相关度达阈值即按既定档位自动调配，仅跨集挤占才升级人工。', effect: '同类战略联动由 AI 自动执行，无需逐次裁定。' } },
  review:   { kind: 'exhausted', why: '自动拆解迭代已达上限仍未收敛到目标颗粒度，超出规则的自动迭代上限，须人工裁定。', rule: { id: 'R-DECOMP', name: '理想化状态自上而下拆解' },
              fix: { kind: 'optimize', rule: '拆解规则增加「最小颗粒度」硬约束与自动迭代上限，超限即附颗粒度诊断升级，避免无效往返。', effect: '颗粒度不足被规则前置拦截并自动细化，减少往返。' } },
  close:    { kind: 'mandate', why: '结项属高影响动作，「强制结项双重确认」规则强制保留人工签署，AI 不自动结项。', rule: { id: 'R-CLOSURE', name: '强制结项双重确认' },
              fix: { kind: 'keep', rule: '结项双重确认为制度刻意保留的人工拍板点，不纳入自动化；AI 仅负责备齐材料与达成核验。', effect: '此类长期保留人工确认，但 AI 把材料准备做到「一键确认」。' } },
  feedback: { kind: 'gap', why: '管理层主观疑问 / 反馈无规则可自动判定是否已闭环，须人工确认。', rule: { id: '—', name: '暂无对应规则' },
              fix: { kind: 'create', rule: '将口径对照等高频反馈沉淀为知识，AI 自动附对照表回应并预标记可闭环，人工仅抽查。', effect: '同类反馈由 AI 自动澄清，人工抽查即可。' } },
};
const ivBoundary = (item) => item.boundary || IV_BOUNDARY[item.type] || IV_BOUNDARY.kapian;
const ivFix = (item) => item.fix || (IV_BOUNDARY[item.type] || IV_BOUNDARY.kapian).fix;

const INTERVENE_ITEMS = [
  { id: 'i1', type: 'kapian', sev: 'red', project: '区域运力预测引擎', pid: 'PRJ-2026-0151', urgency: '高', waited: '3h 12m',
    summary: '验收环连续两次未通过，阶段目标「履约时效 < 4h」被阻断。',
    ai: '建议驳回并要求补充实时路况数据源后重新提交；放行后由 AI 员工自动接入并重跑验收。',
    ctx: { goal: '阶段目标：履约时效 < 4h', task: '事务 T-0312 · 接入实时路况', trail: '验收留痕 · 连续 2 次未通过' },
    aiDone: [
      { act: '自动重跑验收', actor: '验收 Agent', when: '09:12', desc: '按既定脚本重跑两轮，均因实时路况字段缺失而未通过。' },
      { act: '定位根因', actor: '诊断 Agent', when: '09:30', desc: '追溯到事务 T-0312 的数据源未接入实时路况，置信度 0.92。', basis: '验收日志 · 字段空值率 100%' },
      { act: '起草修复方案并挂起', actor: '调度 Agent', when: '09:34', desc: '已生成数据源接入方案，等待管理层放行后指派执行。' },
    ],
    impactStats: [{ v: '2', unit: '次', k: '连续验收未通过', deltaTone: 'danger', delta: '阻断中' }, { v: '3h 12m', k: '阶段目标已阻断' }, { v: '2', unit: '个', k: '下游周目标受阻' }],
    impactList: [{ text: '阶段目标「履约时效 < 4h」被阻断，状态置为受阻', icon: 'target', tone: 'danger' }, { text: '下游 2 个周目标无法推进', icon: 'git-fork', tone: 'warning' }, { text: '关联事务 T-0312 处于挂起，待放行后执行', icon: 'square-check-big', tone: 'neutral' }] },
  { id: 'i2', type: 'cost', project: '智能履约调度中台', pid: 'PRJ-2026-0137', urgency: '高', waited: '1h 05m', amount: '¥182,000',
    summary: '拟对外采购第三方地图路况 API 年度授权。',
    ai: '采购单价低于市场基准约 8%，预算口径合规，建议批准；批准后 AI 自动下单并登记资产。',
    ctx: { goal: '中短期目标：调度时效提升 30%', task: '事务 T-0291 · 路况源选型', trail: '成本审批留痕 · 待管理层拍板' },
    aiDone: [
      { act: '多方比价', actor: '采购 Agent', when: '昨日 17:40', desc: '比对 3 家供应商年度授权报价，本方案单价最低，低于市场基准约 8%。', basis: '比价表 · QUOTE-0291' },
      { act: '合规与预算校验', actor: '财务 Agent', when: '昨日 17:52', desc: '预算口径、采购红线、供应商资质均通过校验。' },
      { act: '生成采购单草案', actor: '采购 Agent', when: '昨日 18:01', desc: '已生成采购单与 ROI 测算，等待管理层批准后下单。' },
    ],
    impactStats: [{ v: '¥182k', k: '采购金额', deltaTone: 'neutral' }, { v: '-8%', k: '对比市场基准', deltaTone: 'success', delta: '更优' }, { v: '~5 周', k: '预计回收周期' }],
    impactList: [{ text: '支撑中短期目标「调度时效提升 30%」的关键数据源', icon: 'target', tone: 'blue' }, { text: '解锁事务 T-0291 路况源选型，进入接入实施', icon: 'square-check-big', tone: 'neutral' }] },
  { id: 'i3', type: 'strategy', project: '客服知识中枢重构', pid: 'PRJ-2026-0129', urgency: '中', waited: '5h 40m',
    summary: 'AI 判定该项目与新战略方向「自助化优先」强相关。',
    ai: '建议落实关联并上调资源配额一档；落实后 AI 自动重排项目集优先级。',
    ctx: { goal: '理想化状态：客服自助率 ≥ 70%', task: '—', trail: '战略层分析留痕 · AI 生成' },
    aiDone: [
      { act: '战略相关度分析', actor: '战略 Agent', when: '今日 04:10', desc: '将项目目标与本周战略主轴「自助化优先」做语义比对，相关度判定为强（0.86）。', basis: '战略层分析留痕 · STR-0129' },
      { act: '生成配额调整建议', actor: '资源 Agent', when: '今日 04:18', desc: '建议算力 / AI 员工配额上调一档，并给出对其他项目集的挤占评估。' },
    ],
    impactStats: [{ v: '0.86', k: '战略相关度', deltaTone: 'success', delta: '强相关' }, { v: '+1', unit: '档', k: '建议配额调整' }, { v: '3', unit: '个', k: '受影响项目集' }],
    impactList: [{ text: '若落实，本项目优先级在项目集内上移', icon: 'arrow-up', tone: 'success' }, { text: '算力与 AI 员工配额对其余项目集产生轻度挤占', icon: 'alert-triangle', tone: 'warning' }] },
  { id: 'i4', type: 'kapian', sev: 'orange', project: '营销内容生成平台', pid: 'PRJ-2026-0144', urgency: '中', waited: '2h 33m',
    summary: '周目标连续滞后，推进度低于基线 18%。',
    ai: '建议转入项目现场，核查 AI 员工产能与瓶颈环节。',
    ctx: { goal: '周目标：内容产出 200 篇 / 周', task: '事务 T-0488 · 模板批量生成', trail: '推进度留痕 · 连续 2 周滞后' },
    aiDone: [
      { act: '推进度归因', actor: '监控 Agent', when: '今日 08:20', desc: '连续 2 周低于基线，定位瓶颈在模板批量生成环节的人工审校排队。', basis: '推进度留痕 · 滞后 18%' },
      { act: '尝试自动扩产', actor: '内容 Agent', when: '今日 08:35', desc: '已自动增配一个生成实例，但审校仍为人工瓶颈，建议人工介入。' },
    ],
    impactStats: [{ v: '-18%', k: '低于基线', deltaTone: 'danger', delta: '滞后' }, { v: '2', unit: '周', k: '连续滞后' }, { v: '~140', unit: '篇', k: '当前周产出' }],
    impactList: [{ text: '周目标「内容产出 200 篇 / 周」连续未达成', icon: 'target', tone: 'warning' }, { text: '瓶颈在人工审校环节，自动扩产无法解决', icon: 'users', tone: 'neutral' }] },
  { id: 'i5', type: 'review', project: '智能履约调度中台', pid: 'PRJ-2026-0137', urgency: '中', waited: '48m',
    summary: '目标拆解第 3 次往返：阶段目标颗粒度仍偏粗。',
    ai: '建议退回并指定拆解至周目标层级。',
    ctx: { goal: '目标树 · 调度域第 2 层', task: '—', trail: '拆解审核留痕 · 往返 ×3' },
    aiDone: [
      { act: '自动拆解', actor: '拆解 Agent', when: '往返 ×3', desc: '已三次生成阶段目标拆解，每次按上轮意见细化，但颗粒度仍未到周目标层级。', basis: '拆解审核留痕 · 往返记录' },
      { act: '自检颗粒度', actor: '拆解 Agent', when: '今日 10:02', desc: '自检判定当前最细节点仍为阶段级，未达可执行的周目标，提交管理层裁定。' },
    ],
    impactStats: [{ v: '3', unit: '次', k: '拆解往返', deltaTone: 'warning' }, { v: '第 2', unit: '层', k: '当前颗粒度' }, { v: '48m', k: '本轮已等待' }],
    impactList: [{ text: '目标树调度域第 2 层无法向下展开为可执行事务', icon: 'git-fork', tone: 'warning' }, { text: '阻塞后续事务派发与 6699 调用', icon: 'square-check-big', tone: 'neutral' }] },
  { id: 'i6', type: 'close', project: '旧版报表迁移', pid: 'PRJ-2026-0096', urgency: '低', waited: '22h 10m',
    summary: 'AI 判定项目已达成全部阶段目标，申请结项。',
    ai: '验收留痕完整、无遗留卡点，建议同意结项；同意后 AI 自动生成结项报告并归档。',
    ctx: { goal: '理想化状态：报表全量迁移', task: '事务 T-0102 · 数据校验', trail: '结项审核留痕 · 待管理层确认' },
    aiDone: [
      { act: '目标达成核验', actor: '验收 Agent', when: '昨日 14:00', desc: '逐项核对全部阶段目标均已验收通过，无未闭环卡点。', basis: '验收留痕 · 全部通过' },
      { act: '生成结项材料', actor: '结项 Agent', when: '昨日 14:20', desc: '已生成结项报告草案与收益复盘，等待管理层确认后归档。' },
    ],
    impactStats: [{ v: '100%', k: '阶段目标达成', deltaTone: 'success' }, { v: '0', unit: '个', k: '遗留卡点', deltaTone: 'success' }, { v: '12', unit: '张', k: '报表已迁移' }],
    impactList: [{ text: '确认后项目转入已结项，释放占用的 AI 员工配额', icon: 'package-check', tone: 'success' }, { text: '结项报告与全过程留痕归档至知识库', icon: 'library', tone: 'neutral' }] },
  { id: 'i7', type: 'feedback', project: '区域运力预测引擎', pid: 'PRJ-2026-0151', urgency: '低', waited: '6h 02m',
    summary: '管理层此前留言质疑数据口径，AI 已给出回应。',
    ai: 'AI 已澄清口径差异并附对照表，建议标记已处置。',
    ctx: { goal: '—', task: '事务 T-0307 · 数据口径核对', trail: '异步反馈留痕 · AI 已回应' },
    aiDone: [
      { act: '解析反馈意图', actor: '反馈 Agent', when: '今日 02:30', desc: '识别管理层质疑点为「自助率口径与 BI 报表不一致」。', basis: '异步反馈留痕 · FB-0307' },
      { act: '生成口径对照并回应', actor: '数据 Agent', when: '今日 02:48', desc: '已附两套口径对照表，说明差异来自统计窗口不同，并给出统一建议。' },
    ],
    impactStats: [{ v: '1', unit: '条', k: '管理层反馈', deltaTone: 'neutral' }, { v: '已回应', k: 'AI 处理状态', deltaTone: 'success' }, { v: '6h 02m', k: '已等待确认' }],
    impactList: [{ text: '标记已处置后该反馈闭环，回写留痕', icon: 'message-square-text', tone: 'neutral' }, { text: '口径对照表沉淀为知识，供后续复用', icon: 'library', tone: 'blue' }] },
  { id: 'i8', type: 'kapian', sev: 'yellow', project: '供应商对账自动化', pid: 'PRJ-2026-0162', urgency: '低', waited: '12h 47m',
    boundary: { kind: 'threshold', why: '对账规则命中率降至 91%，逼近关注阈值但尚未触发自动阻断，规则要求人工决定是否提前调优。', rule: { id: 'R-RISK-TREND', name: '风险分级趋势降权' },
      fix: { kind: 'optimize', rule: '命中率进入「关注区间」时，由 AI 先自动执行规则调优补丁并观察一个对账周期，仅一周期内未回升才升级人工。', effect: '逼近阈值的下行先由 AI 自愈观察，减少过早打扰人工。' } },
    summary: '对账规则命中率下降至 91%，接近关注阈值。',
    ai: '暂未阻断，建议观察一个对账周期后再决策。',
    ctx: { goal: '阶段目标：对账自动化率 ≥ 95%', task: '事务 T-0566 · 规则调优', trail: '风险留痕 · 命中率下行' },
    aiDone: [
      { act: '监测命中率下行', actor: '监控 Agent', when: '近 24h', desc: '对账规则命中率由 95% 缓降至 91%，仍高于阻断阈值（85%）。', basis: '风险留痕 · 命中率曲线' },
      { act: '预生成调优方案', actor: '规则 Agent', when: '今日 06:10', desc: '已草拟规则调优补丁，待管理层决定是否在本周期内执行。' },
    ],
    impactStats: [{ v: '91%', k: '当前命中率', deltaTone: 'warning', delta: '-4%' }, { v: '95%', k: '目标阈值' }, { v: '85%', k: '阻断阈值' }],
    impactList: [{ text: '尚未阻断阶段目标，处于关注区间', icon: 'eye', tone: 'warning' }, { text: '若继续下行至 85% 将触发自动阻断', icon: 'alert-triangle', tone: 'danger' }] },
  { id: 'i9', type: 'cost', project: '营销内容生成平台', pid: 'PRJ-2026-0144', urgency: '中', waited: '3h 18m', amount: '¥96,500',
    summary: '拟扩充 AI 员工算力配额（高峰时段）。',
    ai: 'ROI 预估为正，回收周期约 6 周，建议批准。',
    ctx: { goal: '周目标：内容产出 200 篇 / 周', task: '事务 T-0490 · 配额申请', trail: '成本审批留痕 · 待拍板' },
    aiDone: [
      { act: '产能缺口测算', actor: '资源 Agent', when: '今日 07:00', desc: '测算高峰时段算力缺口约 22%，导致周目标产出受限。', basis: '配额申请 · REQ-0490' },
      { act: 'ROI 测算', actor: '财务 Agent', when: '今日 07:12', desc: '按预期增产测算回收周期约 6 周，ROI 为正，建议批准。' },
    ],
    impactStats: [{ v: '¥96.5k', k: '扩容金额' }, { v: '+22%', k: '高峰算力', deltaTone: 'success' }, { v: '~6 周', k: '回收周期' }],
    impactList: [{ text: '直接支撑周目标「内容产出 200 篇 / 周」', icon: 'target', tone: 'blue' }, { text: '仅高峰时段生效，低峰自动回收配额', icon: 'gauge', tone: 'neutral' }] },
];

const NEW_KAPIAN = { id: 'iNew', type: 'kapian', sev: 'red', project: '智能履约调度中台', pid: 'PRJ-2026-0137', urgency: '高', waited: '刚刚',
  boundary: { kind: 'threshold', why: '调用超时率突增至 6.2%，突破实时阈值（5%），AI 已自动降级保护但根因超出自治范围，须人工核查。', rule: { id: 'R-RISK-TREND', name: '风险分级趋势降权' },
    fix: { kind: 'optimize', rule: '将「超时率突增 + 已自动降级且未雪崩」归为观察级而非阻断级，给 AI 一个自愈观察窗口后再决定是否升级人工。', effect: '短时抖动不再立即打扰人工，仅持续恶化才升级。' } },
  summary: '新卡点：调度 AI 员工调用超时率突增至 6.2%，触发实时阈值。',
  ai: '建议立即转入项目现场核查算力与依赖服务状态。',
  ctx: { goal: '中短期目标：调度时效提升 30%', task: '事务 T-0299 · 实时调度', trail: '风险留痕 · 阈值告警（实时）' },
  aiDone: [
    { act: '实时阈值告警', actor: '监控 Agent', when: '刚刚', desc: '调度 AI 员工调用超时率由 1.1% 突增至 6.2%，超过实时阈值（5%）。', basis: '风险留痕 · 实时告警' },
    { act: '自动降级保护', actor: '调度 Agent', when: '刚刚', desc: '已对超时请求启用排队降级，避免雪崩，但根因待人工核查。' },
  ],
  impactStats: [{ v: '6.2%', k: '调用超时率', deltaTone: 'danger', delta: '突增' }, { v: '5%', k: '实时阈值' }, { v: '已降级', k: '保护状态', deltaTone: 'warning' }],
  impactList: [{ text: '实时调度时效受影响，威胁中短期目标', icon: 'target', tone: 'danger' }, { text: '已自动降级，但根因（算力 / 依赖服务）待核查', icon: 'server', tone: 'warning' }],
  _new: true };

/* ---------- 处置档案（只读档案体） ----------
   DisposalBody：与项目级 PivDisposalBody 同构，用 doc_kit 拼装出处置档案。
   边界原因/关联规则通过 ivBoundary(item) 取得（可被 item 覆盖）。 */
function DisposalBody({ item, onNavigate }) {
  const t = ITEM_TYPE[item.type];
  const bd = ivBoundary(item);
  const bk = IV_BK[bd.kind];
  const fix = ivFix(item);
  const fixLabel = { optimize: '优化规则', create: '沉淀新规则', keep: '制度保留' }[fix.kind];
  const metaItems = [
    { k: '事项类型', v: t.label },
    { k: '所属项目', v: item.project },
    { k: '项目编号', v: <span className="mono">{item.pid}</span> },
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
  return (
    <DocDoc>
      <DocBanner tone={item.type === 'close' ? 'success' : 'ai'} icon={item._new ? 'zap' : 'sparkles'}>
        AI 已在规则内自主处理至此并备齐材料；该事项因「{bk.label}」超出自治边界，剩余决策须人工拍板。处置后请一并确认下方的系统级优化，让同类情形未来自动闭环。
      </DocBanner>

      <DocSec no="01" title="为何需要你 · 边界原因" icon="git-pull-request-arrow">
        <div className="ivx-why-box" style={{ '--bk-c': bk.c, '--bk-bg': bk.bg }}>
          <span className="ivx-why-tag" style={{ color: bk.c, background: bk.bg }}><Icon name={bk.icon} size={12} color={bk.c} />{bk.label}</span>
          <p className="ivx-why-text">{bd.why}</p>
          <div className="ivx-why-rule">
            <Icon name="scale" size={12} color="var(--text-400)" />关联规则
            {bd.rule.id && bd.rule.id !== '—'
              ? <button className="ivx-rule-link" onClick={() => onNavigate && onNavigate('rules')}><span className="mono">{bd.rule.id}</span> · {bd.rule.name}<Icon name="arrow-up-right" size={11} color="var(--blue-primary)" /></button>
              : <span style={{ color: 'var(--text-500)' }}>{bd.rule.name}</span>}
          </div>
        </div>
      </DocSec>

      <DocSec no="02" title="事项概要" icon="file-badge"><DocMeta items={metaItems} /></DocSec>

      <DocSec no="03" title={t.label + ' · 详情'} icon={t.icon}>
        <DocPara>{item.summary}</DocPara>
        <div style={{ marginTop: 12 }}><DocPeople rows={ctxPeople} /></div>
        {item.type === 'kapian' && onNavigate && (
          <button className="kp-link" style={{ marginTop: 12 }} onClick={() => onNavigate('p-kapian', { nodeId: 'phase-a1' })}>
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
   DisposalActions：二步确认状态机（reason 动作需填理由后才 commit），同项目级。 */
function DisposalActions({ item, onDispose }) {
  const [pending, setPending] = React.useState(null);
  const [reason, setReason] = React.useState('');
  const actions = ITEM_ACTIONS[item.type];
  React.useEffect(() => { setPending(null); setReason(''); }, [item.id]);
  const commit = (act) => {
    if (act.reason && pending !== act.k) { setPending(act.k); return; }
    if (act.reason && !reason.trim()) return;
    onDispose(item, act, reason.trim());
  };
  return (
    <div className="disp-foot">
      {pending && (
        <div className="disp-reason">
          <label className="t-caption" style={{ fontWeight: 500, color: 'var(--text-700)' }}>处置理由 / 修改意见<span style={{ color: 'var(--danger)' }}> *</span></label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="将随处置一并写入留痕，项目负责人与 AI 可见…" autoFocus />
        </div>
      )}
      <div className="disp-actions">
        {actions.map(a => (
          <Button key={a.k} variant={a.variant} icon={a.k === 'transfer' ? 'arrow-right' : undefined}
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

/* ---------- 项目集映射 + 总览 / 作用域头 ----------
   ivItemPf：根据事项的 pid 查出其所属项目集（PROJECTS 查表）。 */
function ivItemPf(item) {
  const p = (window.PROJECTS || []).find(pr => pr.pid === item.pid);
  return p ? p.portfolio : 'data';
}

/* 项目集总览 —— 各项目集独立入口，进入后只处理本集事项 */
function IvPortfolioOverview({ items, onEnter }) {
  React.useEffect(() => { refreshIcons(); });
  const pfs = window.PORTFOLIOS || [];
  const counts = {};
  pfs.forEach(p => counts[p.id] = { t: 0, '高': 0, '中': 0, '低': 0 });
  items.forEach(it => { const id = ivItemPf(it); if (!counts[id]) counts[id] = { t: 0, '高': 0, '中': 0, '低': 0 }; counts[id].t++; counts[id][it.urgency]++; });

  return (
    <>
      <button className="iv-pf-all" onClick={() => onEnter('all')}>
        <span className="iv-pf-all-ico"><Icon name="layers" size={20} color="var(--blue-primary)" /></span>
        <div className="iv-pf-all-main">
          <div className="iv-pf-all-t">组合级总览 · 全部项目集</div>
          <div className="iv-pf-all-s">跨项目集一次性查看并处置全部待办，适合组合级管理者</div>
        </div>
        <span className="iv-pf-all-n mono">{items.length}</span>
        <Icon name="arrow-right" size={18} color="var(--text-400)" />
      </button>

      <div className="iv-pf-grid">
        {pfs.map(p => {
          const c = counts[p.id] || { t: 0, '高': 0, '中': 0, '低': 0 };
          return (
            <button className="iv-pf-card" key={p.id} data-empty={c.t === 0} onClick={() => onEnter(p.id)}>
              <div className="iv-pf-card-head">
                <span className="iv-pf-ico"><Icon name="folder-kanban" size={18} color="var(--blue-primary)" /></span>
                <div className="iv-pf-titles">
                  <div className="iv-pf-name">{p.name}</div>
                  <div className="iv-pf-owner"><Icon name="user" size={11} color="var(--text-400)" />负责人 · {p.owner}</div>
                </div>
                <span className="iv-pf-count" data-zero={c.t === 0}>{c.t}</span>
              </div>
              {c.t > 0 ? (
                <div className="iv-pf-sev">
                  {c['高'] > 0 && <span className="iv-pf-sev-i" data-u="高">高 {c['高']}</span>}
                  {c['中'] > 0 && <span className="iv-pf-sev-i" data-u="中">中 {c['中']}</span>}
                  {c['低'] > 0 && <span className="iv-pf-sev-i" data-u="低">低 {c['低']}</span>}
                </div>
              ) : (
                <div className="iv-pf-sev-empty"><Icon name="circle-check" size={13} color="var(--success)" />无待处置 · 运行顺畅</div>
              )}
              <div className="iv-pf-enter">进入工作台<Icon name="arrow-right" size={14} color="var(--blue-primary)" /></div>
            </button>
          );
        })}
      </div>
    </>
  );
}

/* 作用域头 —— 当前在哪个项目集的工作台 */
function IvScopeHeader({ pf, count, onBack }) {
  React.useEffect(() => { refreshIcons(); });
  const isAll = pf === 'all';
  const p = isAll ? null : (window.PORTFOLIOS || []).find(x => x.id === pf);
  return (
    <div className="iv-scope-head">
      <button className="iv-pf-back" onClick={onBack}><Icon name="arrow-left" size={15} color="var(--text-500)" />切换项目集</button>
      <span className="iv-scope-div" />
      <span className="iv-scope-ico"><Icon name={isAll ? 'layers' : 'folder-kanban'} size={16} color="var(--blue-primary)" /></span>
      <span className="iv-scope-name">{isAll ? '组合级总览 · 全部项目集' : p.name}</span>
      {!isAll && p && <span className="iv-scope-owner"><Icon name="user" size={12} color="var(--text-400)" />负责人 · {p.owner}</span>}
      <span className="iv-scope-count">{count} 条待处置</span>
    </div>
  );
}

/* ---------- 介入工作台主页面 ----------
   InterveneWorkbench：组合级主体。
   状态：pf=null 显示项目集总览；'all' 或 某 portfolio id 进入作用域工作台。
     filter 类型筛选；sort 排序；active 抽屉。scoped 按当前作用域过滤事项。
   实时卡点：加载后 ~5s 从顶部脈冲滑入一条新卡点（NEW_KAPIAN）。
   dispose：transfer 跳进项目现场；其余移除并弹 Toast（有 fix 提示「送治理确认」）。 */
function InterveneWorkbench({ onNavigate, onEnterProject }) {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState(INTERVENE_ITEMS);
  const [pf, setPf] = React.useState(null); // null = 项目集总览；'all' 或 portfolio id = 作用域工作台
  const [filter, setFilter] = React.useState('all');
  const [sort, setSort] = React.useState('urgency');
  const [active, setActive] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const newAddedRef = React.useRef(false);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  // 实时卡点：加载完成后 ~5s 从顶部脉冲滑入一条新卡点
  React.useEffect(() => {
    if (loading || newAddedRef.current) return;
    const t = setTimeout(() => { newAddedRef.current = true; setItems(prev => [NEW_KAPIAN, ...prev]); }, 5200);
    return () => clearTimeout(t);
  }, [loading]);

  const scoped = React.useMemo(() => (pf === null || pf === 'all') ? items : items.filter(i => ivItemPf(i) === pf), [items, pf]);

  const counts = React.useMemo(() => {
    const c = { all: scoped.length };
    Object.keys(ITEM_TYPE).forEach(k => c[k] = scoped.filter(i => i.type === k).length);
    return c;
  }, [scoped]);

  const urgOrder = { '高': 0, '中': 1, '低': 2 };
  const view = React.useMemo(() => {
    let v = filter === 'all' ? scoped : scoped.filter(i => i.type === filter);
    v = [...v].sort((a, b) => sort === 'urgency'
      ? urgOrder[a.urgency] - urgOrder[b.urgency]
      : (a._new ? -1 : b._new ? 1 : 0));
    return v;
  }, [scoped, filter, sort]);

  const dispose = (item, act, reason) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    setActive(null);
    if (act.k === 'transfer') { onEnterProject && onEnterProject(); return; }
    const fix = ivFix(item);
    const hasFix = fix && fix.kind !== 'keep';
    setToast(hasFix
      ? { msg: `已处置「${ITEM_TYPE[item.type].label}」· 已生成规则${fix.kind === 'create' ? '沉淀' : '优化'}建议`, action: '送治理确认', onAction: () => { setToast(null); onNavigate('rules'); } }
      : { msg: `已处置「${ITEM_TYPE[item.type].label}」· 已写入留痕`, action: '查看留痕', onAction: () => { setToast(null); onNavigate('rules'); } });
  };

  const filterList = [['all', '全部待处置', 'inbox'], ...Object.keys(ITEM_TYPE).map(k => [k, ITEM_TYPE[k].label, ITEM_TYPE[k].icon])];

  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: '项目管理工作台' }, { label: '介入工作台' }]} />
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico"><Icon name="list-checks" size={22} color="var(--blue-primary)" /></span>
          <div>
            <h1 className="t-h1">介入工作台</h1>
          </div>
        </div>
        <div className="page-head-right">
          <FeedbackEntry context={{ scene: '组合级 · 介入工作台', did: '正在审视组合内各项目的 AI 自治运行', ask: '运行偏差、规则盲区或希望优化的处置逻辑' }} onClick={() => {}} />
        </div>
      </div>

      {/* 运行模型 · AI 自治流水线（组合级） */}
      <div className="ivx-model">
        <div className="ivx-model-l">
          <span className="ivx-model-ico"><Icon name="workflow" size={20} color="var(--blue-primary)" /></span>
          <div>
            <div className="ivx-model-t"><span className="ivx-live"><span className="ivx-live-dot" />运行中</span>组合内各项目以 AI 自治流水线推进</div>
            <div className="ivx-model-s">AI 在既定规则内自主决策与执行；仅「超出规则边界」的少数事项才上升到此处由管理层拍板。每次拍板都会沉淀 / 优化规则，让此队列持续趋近于零。</div>
          </div>
        </div>
        <div className="ivx-model-stats">
          <div className="ivx-stat"><span className="ivx-stat-v mono" style={{ color: 'var(--success)' }}>{loading ? '—' : '95.8%'}</span><span className="ivx-stat-k">近 7 日自治闭环率</span></div>
          <div className="ivx-stat"><span className="ivx-stat-v mono">{loading ? '—' : '1,326'}</span><span className="ivx-stat-k">AI 自治处置（近 7 日）</span></div>
          <div className="ivx-stat is-hot"><span className="ivx-stat-v mono" style={{ color: 'var(--warning)' }}>{loading ? '—' : items.length}</span><span className="ivx-stat-k">触达边界 · 待拍板</span></div>
        </div>
      </div>

      {pf === null ? (
        <IvPortfolioOverview items={items} onEnter={(id) => { setPf(id); setFilter('all'); }} />
      ) : (
        <>
        <IvScopeHeader pf={pf} count={scoped.length} onBack={() => setPf(null)} />

      {/* 类型计数小指标 */}
      <div className="iv-stats">
        {Object.keys(ITEM_TYPE).map(k => (
          <button key={k} className="iv-stat" data-on={filter === k} onClick={() => setFilter(filter === k ? 'all' : k)}>
            <Icon name={ITEM_TYPE[k].icon} size={16} color={`var(--${ITEM_TYPE[k].tone === 'neutral' ? 'text-500' : ITEM_TYPE[k].tone})`} />
            <span className="iv-stat-label">{ITEM_TYPE[k].label}</span>
            <span className="mono iv-stat-n">{loading ? '·' : counts[k]}</span>
          </button>
        ))}
      </div>

      <div className="iv-body">
        {/* 左侧类型筛选 */}
        <aside className="iv-rail">
          {filterList.map(([k, label, icon]) => (
            <button key={k} className="iv-rail-item" data-on={filter === k} onClick={() => setFilter(k)}>
              <Icon name={icon} size={18} color={filter === k ? 'var(--blue-primary)' : 'var(--text-500)'} />
              <span className="iv-rail-label">{label}</span>
              <span className="mono iv-rail-n" data-on={filter === k}>{loading ? '·' : counts[k]}</span>
            </button>
          ))}
        </aside>

        {/* 中间事项列表 */}
        <section className="iv-list-wrap">
          <div className="iv-list-toolbar">
            <span className="t-caption">{loading ? '加载中…' : `${view.length} 条事项`}</span>
            <div className="iv-sort">
              {filter === 'cost' && <button className="iv-sort-btn" data-on={false} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }} onClick={() => onNavigate && onNavigate('cost-approval')}><Icon name="wallet" size={13} color="var(--danger)" />独立审批工作台<Icon name="arrow-right" size={12} color="var(--text-400)" /></button>}
              <span className="t-micro" style={{ color: 'var(--text-400)' }}>排序</span>
              <button className="iv-sort-btn" data-on={sort === 'urgency'} onClick={() => setSort('urgency')}>紧急度</button>
              <button className="iv-sort-btn" data-on={sort === 'waited'} onClick={() => setSort('waited')}>等待时长</button>
            </div>
          </div>

          {loading ? (
            <div className="iv-list">{[0,1,2,3].map(i => <IvSkel key={i} />)}</div>
          ) : view.length === 0 ? (
            <Card><EmptyState glyph="circle-check" title="当前无待处置事项" desc="所有需要管理层拍板的事项均已处置，系统运行顺畅。" action={<span className="pill" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><span className="dot" style={{ background: 'var(--success)' }} />运行顺畅</span>} /></Card>
          ) : (
            <div className="iv-list">
              {view.map(item => {
                const t = ITEM_TYPE[item.type];
                const bki = IV_BK[ivBoundary(item).kind];
                const barColor = item.type === 'kapian' ? SEV_COLOR[item.sev] : `var(--${t.tone === 'neutral' ? 'border-300' : t.tone})`;
                return (
                  <button key={item.id} className={`iv-card${item._new ? ' pulse-in' : ''}`} onClick={() => setActive(item)}>
                    <span className="iv-card-bar" style={{ background: bki.c }} />
                    <div className="iv-card-main">
                      <div className="iv-card-top">
                        <span className="ivx-bk" style={{ color: bki.c, background: bki.bg }}><Icon name={bki.icon} size={12} color={bki.c} />{bki.label}</span>
                        <span className="iv-proj">{item.project}</span>
                        <span className="mono iv-pid">{item.pid}</span>
                        <span className="iv-type-tag" style={{ color: barColor, background: item.type === 'kapian' ? (item.sev === 'red' ? 'var(--danger-bg)' : 'var(--warning-bg)') : `var(--${t.tone === 'neutral' ? 'neutral-bg' : t.tone + '-bg'})` }}>
                          <Icon name={t.icon} size={13} color={barColor} />{t.label}
                        </span>
                        {item._new && <span className="iv-new-tag">新</span>}
                        <span className="iv-waited mono"><Icon name="clock" size={13} color="var(--text-400)" />{item.waited}</span>
                      </div>
                      <div className="ivx-why-line"><Icon name="git-pull-request-arrow" size={13} color={bki.c} /><span className="ivx-why-label">为何需要你</span>{ivBoundary(item).why}</div>
                      <div className="iv-ai"><Icon name="sparkles" size={14} color="var(--ai)" /><span className="iv-ai-label">AI 建议</span>{item.ai}</div>
                    </div>
                    <span className="iv-urg" data-u={item.urgency}>{item.urgency}</span>
                    <Icon name="chevron-right" size={18} color="var(--text-400)" />
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
        </>
      )}

      <Drawer
        open={!!active}
        onClose={() => setActive(null)}
        width={620}
        icon={active ? { name: ITEM_TYPE[active.type].icon, color: active.type === 'kapian' ? SEV_COLOR[active.sev] : 'var(--blue-primary)' } : null}
        title={active ? active.project : ''}
        sub={active ? `${active.pid} · ${ITEM_TYPE[active.type].label} · 处置档案` : ''}
        headRight={active && (
          <FeedbackEntry label="反馈"
            context={{ scene: '介入工作台 · 处置档案', did: `当前查看「${active.project}」的${ITEM_TYPE[active.type].label}处置档案（AI 已做动作、影响面与处置建议）`, ask: 'AI 的处置建议、影响面判断或某一步已做动作' }}
            onClick={() => {}} />
        )}
        footer={active && <DisposalActions item={active} onDispose={dispose} />}
      >
        {active && <DisposalBody item={active} onNavigate={onNavigate} />}
      </Drawer>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

function IvSkel() {
  return (
    <div className="iv-card" style={{ cursor: 'default' }}>
      <span className="iv-card-bar" style={{ background: 'var(--divider)' }} />
      <div className="iv-card-main">
        <div style={{ display: 'flex', gap: 10 }}><Skel w={140} h={14} /><Skel w={100} h={14} /></div>
        <Skel w="90%" h={13} style={{ marginTop: 12 }} />
        <Skel w="60%" h={12} style={{ marginTop: 12 }} />
      </div>
    </div>
  );
}

Object.assign(window, { InterveneWorkbench });
