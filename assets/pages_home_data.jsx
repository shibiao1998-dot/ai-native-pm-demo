/* ============================================================
   项目主页 · 模块数据源（pages_home_data.jsx）
   —— 沿用旧项目官网的模块结构（理想化状态 / 目标用户 / 核心价值 /
      中短期目标 / 阶段结项目标 / 周计划），降低用户迁移成本。
   —— 新增：理想化状态进度、各层版本 / 时间周期 / 上下层拆解。
   领域：智能履约调度中台（与目标树同源，保持全局一致）。
   ============================================================ */

/* ---------- 目标集版本（中短期 / 阶段结项 / 周计划 共用的版本维度） ---------- */
const GS_VERSIONS = [
  { id: 'v2.3', period: '2026-05-14 ~ 2026-06-30', stage: '执行中', current: true },
  { id: 'v2.2', period: '2026-03-20 ~ 2026-05-13', stage: '已结项' },
  { id: 'v2.1', period: '2026-01-08 ~ 2026-03-19', stage: '已结项' },
];

/* ============================================================
   模块一 · 理想化状态（新增「进度」）
   ============================================================ */
const HOME_IDEAL = {
  cats: ['全部', '调度智能化', '时效', '成本', '体验', '可复用'],
  items: [
    { id: 'idl-1', cat: '调度智能化', imp: 5, prog: 72,
      text: '履约调度全面智能化，规则清晰的派单与改派由系统自动完成，人工仅处理异常与例外。',
      def: '调度域全链路由系统自驱：常规派单、改派、合流等动作 100% 自动执行，人工保留对超阈值异常的最终裁量。' },
    { id: 'idl-2', cat: '时效', imp: 5, prog: 64,
      text: '区域履约端到端时效稳定 < 4h，高峰时段不劣化。',
      def: '以区域为单位，端到端履约时效稳定低于 4 小时；大促 / 极端天气等高峰时段波动不超过基线的 10%。' },
    { id: 'idl-3', cat: '成本', imp: 5, prog: 58,
      text: '单均调度成本较立项基线下降 ≥ 15%，且不以牺牲时效为代价。',
      def: '在时效达标前提下，通过弹性算力与路径优化，将单均调度成本较立项基线下降 15% 以上。' },
    { id: 'idl-4', cat: '调度智能化', imp: 5, prog: 80,
      text: '异常调度具备自动检测与自愈能力，自愈率 ≥ 90%。',
      def: '对超时、失败、资源抖动等异常具备自动识别与自愈闭环，自愈率稳定不低于 90%，显著降低人工兜底。' },
    { id: 'idl-5', cat: '体验', imp: 4, prog: 50,
      text: '一线履约人员接收更合理的调度指令与路径，无效折返显著减少。',
      def: '调度指令兼顾路况、负载与人效，路径合理性可解释；一线无效折返率较基线下降 30%。' },
    { id: 'idl-6', cat: '可复用', imp: 4, prog: 42,
      text: '沉淀可复用的智能调度中台能力，可低成本外溢至同类履约业务。',
      def: '调度算法、异常自愈、归因分析等能力以中台形态沉淀，新业务接入周期从月级缩短至周级。' },
    { id: 'idl-7', cat: '体验', imp: 3, prog: 35,
      text: '运营负责人可在一屏内掌握时效曲线、成本曲线与风险暴露。',
      def: '为运营负责人提供统一看板，时效 / 成本 / 风险三条核心曲线实时可读，异常自动暴露并归因。' },
  ],
};

/* ============================================================
   模块二 · 目标用户（名称 / 定义 / 特征属性 / 市场 / 典型场景）
   ============================================================ */
const HOME_USERS = [
  { id: 'usr-1', name: '区域履约调度团队', role: '主要执行者 → 审核者',
    def: '从手工派单逐步转为「审核 AI 决策 + 处置例外」的角色，希望调度准确、异常可控、操作省心。',
    traits: [
      { k: '职责转变', v: '由「人盯人派单」转为审核 AI 改派建议，仅对超阈值异常人工介入。' },
      { k: '关注点',   v: '改派建议是否可信、异常是否被及时暴露、操作是否足够轻。' },
      { k: '能力诉求', v: '希望系统给出可解释的调度理由，减少凭经验反复确认的负担。' },
    ],
    market: '12 个区域履约中心 · 约 240 名调度员',
    scenario: '调度员小李在异常看板上确认 AI 给出的改派建议，仅在金额 / 时效超阈值时人工介入并留痕。' },
  { id: 'usr-2', name: '履约运营负责人', role: '监管 / 决策者',
    def: '关注区域时效达成与成本曲线，追求全局可视、风险早暴露、决策有据可依。',
    traits: [
      { k: '全局意识', v: '需纵观各区域时效 / 成本 / 风险，掌握项目整体健康度。' },
      { k: '追求时效', v: '希望异常与劣化在影响扩大前被自动暴露并给出处置建议。' },
      { k: '信息对等', v: '向上汇报进展与成果，向下同步目标与节奏，保障信息一致。' },
    ],
    market: '区域运营负责人 8 名 · 履约 BU 管理层',
    scenario: '运营负责人在项目主页一屏掌握当周时效曲线，发现某区域劣化后直接下钻至卡点处置。' },
  { id: 'usr-3', name: '一线履约人员', role: '指令接收者',
    def: '接收调度指令并完成履约，希望路径合理、改派不频繁、说明清楚。',
    traits: [
      { k: '路径合理', v: '希望调度兼顾路况与负载，减少无效折返与临时改派。' },
      { k: '理解成本', v: '指令需附简明理由，便于一线快速理解与执行。' },
    ],
    market: '一线履约人员约 3,800 名（含外部协力）',
    scenario: '骑手在 App 上收到带路况说明的调度指令，按推荐路径完成履约，异常一键上报。' },
  { id: 'usr-4', name: '调度算法 / 风控 AI 员工', role: 'AI 执行者',
    def: '承担派单、改派、异常检测与自愈的 AI 角色，需要清晰的目标、规则与可消费的数据。',
    traits: [
      { k: '目标清晰', v: '需要明确的时效 / 成本约束与优先级，作为决策依据。' },
      { k: '数据可用', v: '依赖实时路况、负载、历史归因等数据，要求口径统一、时延可控。' },
    ],
    market: '在岗 AI 员工 5 名 · 覆盖调度 / 验收 / 风控域',
    scenario: '调度算法 Agent 读取实时路况与负载，自动生成改派方案并提交审核，验收 Agent 自动归因效果。' },
];

/* ============================================================
   模块三 · 核心价值（干系人 / 优先级 / 实现价值 / 实现方式）
   ============================================================ */
const HOME_VALUE = {
  reviewer: { name: '何沛', uid: '261995', reviewAt: '2026-06-03', updateAt: '2026-06-03' },
  items: [
    { id: 'val-1', who: '履约 BU / 管理 AI 化母项目', priority: 5,
      value: '更坚决地推动履约调度从「人驱动」转向「系统自驱」，让 AI 从辅助工具升级为日常调度推进的主力。',
      method: '让 AI 参与机会发现、目标拆解、改派决策、进度跟进、验收提醒与风险预警，人负责方向判断与关键拍板。' },
    { id: 'val-2', who: '公司决策层（DJ / 分管 VP / 项目集负责人）', priority: 5,
      value: '提升履约关键决策的质量与准确性，减少因信息不全、经验依赖、目标不清导致的决策失误。',
      method: '集中沉淀目标、计划、会议结论、执行进展、验收结果与历史经验，AI 在决策前自动整理背景、指出问题、给出建议。' },
    { id: 'val-3', who: '履约运营负责人 / 调度审计人员', priority: 5,
      value: '建立一套 AI 可直接使用的项目资料基础，减少到处找资料、反复问人、信息不一致带来的时间浪费。',
      method: '集中保存目标、计划、任务、验收、预算、审计与管理规则，并保持及时更新，让 AI 与管理者基于同一套信息工作。' },
    { id: 'val-4', who: '区域履约团队 / 一线履约人员', priority: 4,
      value: '把调度从「人盯人」升级为「系统自驱」，释放调度人力，让一线接收更合理的指令与路径。',
      method: 'AI 承担常规派单与改派，调度员转为审核与例外处置，一线获得带可解释理由的调度指令。' },
  ],
};

/* ============================================================
   模块四 · 中短期目标（新增版本 + 每版本进度 + 时间周期）
   ============================================================ */
/* 中短期目标固定按季度划分大版本：立项首个季度 = v1.0；其下按自然月拆出阶段小版本（1.1/1.2…），
   阶段下再按周拆出周计划。首版本依立项时间裁剪，其后对齐自然月 / 自然季度推进。 */
const MID_VERSIONS = [
  { id: '1.0', q: '2026 Q2', range: '2026-05-14 ~ 2026-06-30', tag: '立项首季 · 进行中', current: true,
    step: [
      { k: '目标审核通过', date: '2026-05-14', state: 'done' },
      { k: '目标执行中', date: '进行中', state: 'cur' },
      { k: '验收', date: '2026-06-30', state: 'todo' },
    ],
    months: [
      { id: '1.1', label: '2026年5月', range: '2026-05-14 ~ 2026-05-31', cropped: true,
        step: [
          { k: '目标审核通过', date: '2026-05-14', state: 'done' },
          { k: '目标执行中', date: '已完成', state: 'done' },
          { k: '验收', date: '2026-05-31 已通过', state: 'done' },
        ],
        weeks: ['2026年05月第3周', '2026年05月第4周', '2026年05月第5周'] },
      { id: '1.2', label: '2026年6月', range: '2026-06-01 ~ 2026-06-30',
        step: [
          { k: '目标审核通过', date: '2026-06-01', state: 'done' },
          { k: '目标执行中', date: '进行中', state: 'cur' },
          { k: '验收', date: '2026-06-30', state: 'todo' },
        ],
        weeks: ['2026年06月第1周'] },
    ] },
  { id: '2.0', q: '2026 Q3', range: '2026-07-01 ~ 2026-09-30', tag: '规划中',
    step: [
      { k: '目标审核通过', date: '待审核', state: 'todo' },
      { k: '目标执行中', date: '2026-07-01 起', state: 'todo' },
      { k: '验收', date: '2026-09-30', state: 'todo' },
    ],
    months: [
      { id: '2.1', label: '2026年7月', range: '2026-07-01 ~ 2026-07-31',
        step: [{ k: '目标审核通过', date: '待审核', state: 'todo' }, { k: '目标执行中', date: '2026-07-01 起', state: 'todo' }, { k: '验收', date: '2026-07-31', state: 'todo' }], weeks: [] },
      { id: '2.2', label: '2026年8月', range: '2026-08-01 ~ 2026-08-31',
        step: [{ k: '目标审核通过', date: '待审核', state: 'todo' }, { k: '目标执行中', date: '2026-08-01 起', state: 'todo' }, { k: '验收', date: '2026-08-31', state: 'todo' }], weeks: [] },
      { id: '2.3', label: '2026年9月', range: '2026-09-01 ~ 2026-09-30',
        step: [{ k: '目标审核通过', date: '待审核', state: 'todo' }, { k: '目标执行中', date: '2026-09-01 起', state: 'todo' }, { k: '验收', date: '2026-09-30', state: 'todo' }], weeks: [] },
    ] },
  { id: '3.0', q: '2026 Q4', range: '2026-10-01 ~ 2026-12-31', tag: '规划中',
    step: [
      { k: '目标审核通过', date: '待审核', state: 'todo' },
      { k: '目标执行中', date: '2026-10-01 起', state: 'todo' },
      { k: '验收', date: '2026-12-31', state: 'todo' },
    ],
    months: [
      { id: '3.1', label: '2026年10月', range: '2026-10-01 ~ 2026-10-31',
        step: [{ k: '目标审核通过', date: '待审核', state: 'todo' }, { k: '目标执行中', date: '2026-10-01 起', state: 'todo' }, { k: '验收', date: '2026-10-31', state: 'todo' }], weeks: [] },
      { id: '3.2', label: '2026年11月', range: '2026-11-01 ~ 2026-11-30',
        step: [{ k: '目标审核通过', date: '待审核', state: 'todo' }, { k: '目标执行中', date: '2026-11-01 起', state: 'todo' }, { k: '验收', date: '2026-11-30', state: 'todo' }], weeks: [] },
      { id: '3.3', label: '2026年12月', range: '2026-12-01 ~ 2026-12-31',
        step: [{ k: '目标审核通过', date: '待审核', state: 'todo' }, { k: '目标执行中', date: '2026-12-01 起', state: 'todo' }, { k: '验收', date: '2026-12-31', state: 'todo' }], weeks: [] },
    ] },
];
/* 版本工具：季度 → 月 → 周 的动态联动查询 */
const MONTHS_OF = (qid) => (MID_VERSIONS.find(v => v.id === qid) || MID_VERSIONS[0]).months;
const MONTH_OF = (mid) => { for (const q of MID_VERSIONS) { const m = q.months.find(x => x.id === mid); if (m) return m; } return null; };
const WEEKS_OF = (mid) => { const m = MONTH_OF(mid); return m ? m.weeks : []; };
const HOME_MID = {
  byVer: {
    '1.0': [
      { id: 'mid-a', title: '调度时效提升 30%', imp: 5, owner: '何沛', prog: 78, worth: true,
        def: '本季度将区域履约平均时效较立项基线提升 30%，对应理想化状态的「时效优」分支。',
        up: { level: 'ideal', title: '区域履约时效稳定 < 4h' },
        down: [{ level: 'phase', id: 'phase-a1', title: '履约时效 < 4h' }, { level: 'phase', id: 'phase-a2', title: '异常调度自愈率 ≥ 90%' }] },
      { id: 'mid-b', title: '单均调度成本下降 15%', imp: 5, owner: '张威虎', prog: 66, worth: true,
        def: '在保障时效的前提下，将单均调度成本较立项基线下降 ≥ 15%，对应理想化状态的「成本优」分支。',
        up: { level: 'ideal', title: '单均调度成本较立项基线下降 ≥ 15%' },
        down: [{ level: 'phase', id: 'phase-b1', title: '算力成本优化' }] },
      { id: 'mid-c', title: '建立目标—事务自动联动，进度自动沉淀', imp: 5, owner: '张威虎', prog: 72, worth: true,
        def: '通过事务自动回写目标进度，建立子目标与母目标的继承关系，让母项目及时了解目标实现是否存在风险。',
        up: { level: 'ideal', title: '履约调度全面智能化' },
        down: [{ level: 'phase', id: 'phase-c1', title: '目标—事务联动机制上线' }] },
      { id: 'mid-d', title: '异常调度自愈能力规模化', imp: 4, owner: '黄世彪', prog: 46, worth: false,
        def: '将异常自愈从单点能力扩展到全区域，自愈率稳定 ≥ 90%，降低人工兜底比例。',
        up: { level: 'ideal', title: '异常调度具备自愈能力，自愈率 ≥ 90%' },
        down: [{ level: 'phase', id: 'phase-a2', title: '异常调度自愈率 ≥ 90%' }] },
    ],
    '2.0': [
      { id: 'mid-e', title: '调度中台能力沉淀与外溢', imp: 4, owner: '何沛', prog: 0, worth: true,
        def: 'Q3 规划：将调度算法、异常自愈、归因分析沉淀为可复用中台能力，支持同类履约业务低成本接入。',
        up: { level: 'ideal', title: '沉淀可复用的智能调度中台能力' }, down: [] },
      { id: 'mid-f', title: '全域异常自愈率稳定 ≥ 95%', imp: 5, owner: '黄世彪', prog: 0, worth: true,
        def: 'Q3 规划：在 v1.0 自愈能力规模化基础上，将全域异常自愈率进一步稳定到 95% 以上。',
        up: { level: 'ideal', title: '异常调度具备自愈能力，自愈率 ≥ 90%' }, down: [] },
      { id: 'mid-g', title: '运营一屏掌握时效 / 成本 / 风险', imp: 4, owner: '何沛', prog: 0, worth: false,
        def: 'Q3 规划：为运营负责人提供统一看板，三条核心曲线实时可读、异常自动暴露并归因。',
        up: { level: 'ideal', title: '运营负责人可在一屏内掌握时效曲线、成本曲线与风险暴露' }, down: [] },
    ],
    '3.0': [
      { id: 'mid-h', title: '调度中台对外业务试点接入', imp: 4, owner: '何沛', prog: 0, worth: true,
        def: 'Q4 规划：选取 1~2 个同类履约业务，验证调度中台对外输出，接入周期压缩至周级。',
        up: { level: 'ideal', title: '沉淀可复用的智能调度中台能力' }, down: [] },
      { id: 'mid-i', title: '年度单均成本目标收口', imp: 5, owner: '张威虎', prog: 0, worth: true,
        def: 'Q4 规划：收口全年单均调度成本目标，较立项基线累计下降 ≥ 18%。',
        up: { level: 'ideal', title: '单均调度成本较立项基线下降 ≥ 15%' }, down: [] },
    ],
  },
};

/* ============================================================
   模块五 · 阶段结项目标（时间周期 + 步骤 + 来源中短期版本）
   ============================================================ */
const HOME_PHASE = {
  byVer: {
    '1.1': {
      statusTabs: [{ k: '全部', n: 3 }, { k: '通过验收', n: 0 }, { k: '执行中', n: 2 }, { k: '卡点', n: 1 }, { k: '未验收', n: 3 }],
      items: [
        { id: 'phase-a1', imp: 5, owner: '黄世彪', prog: 64, status: 'kapian',
          title: '履约时效 < 4h：接入实时路况并完成调度算法灰度，端到端时效稳定低于 4 小时。',
          source: { id: 'mid-a', ver: '1.0', title: '调度时效提升 30%' },
          kapian: '路况源选型连续两次验收未通过，实时数据管道时延超标。',
          up: { level: 'mid', id: 'mid-a', title: '调度时效提升 30%（v1.0）' },
          down: [{ level: 'week', id: 'wk-1', title: '接入区域实时路况' }, { level: 'week', id: 'wk-2', title: '调度算法灰度上线' }] },
        { id: 'phase-a2', imp: 5, owner: '黄世彪', prog: 80, status: 'run',
          title: '异常调度自愈率 ≥ 90%：异常检测模型迭代上线，自愈闭环覆盖全区域。',
          source: { id: 'mid-a', ver: '1.0', title: '调度时效提升 30%' },
          up: { level: 'mid', id: 'mid-a', title: '调度时效提升 30%（v1.0）' },
          down: [{ level: 'week', id: 'wk-3', title: '异常检测模型迭代' }] },
        { id: 'phase-d1', imp: 4, owner: '黄世彪', prog: 17, status: 'run',
          title: '漏斗池事务归档回收：完成 AI 读数分析，支撑周版本自动验收。',
          source: { id: 'mid-c', ver: '1.0', title: '建立目标—事务自动联动' },
          up: { level: 'mid', id: 'mid-c', title: '建立目标—事务自动联动（v1.0）' },
          down: [{ level: 'week', id: 'wk-6', title: '漏斗池事务完成归档表回收' }] },
      ],
    },
    '1.2': {
      statusTabs: [{ k: '全部', n: 2 }, { k: '通过验收', n: 0 }, { k: '执行中', n: 2 }, { k: '卡点', n: 0 }, { k: '未验收', n: 2 }],
      items: [
        { id: 'phase-b1', imp: 5, owner: '张威虎', prog: 48, status: 'run',
          title: '算力成本优化：推理资源弹性调度 + 模型轻量化，单均算力成本下降 ≥ 12%。',
          source: { id: 'mid-b', ver: '1.0', title: '单均调度成本下降 15%' },
          up: { level: 'mid', id: 'mid-b', title: '单均调度成本下降 15%（v1.0）' },
          down: [{ level: 'week', id: 'wk-4', title: '推理资源弹性调度' }] },
        { id: 'phase-c1', imp: 5, owner: '张威虎', prog: 34, status: 'run',
          title: '目标—事务联动机制上线：事务完成自动回写目标进度，建立子母目标继承关系。',
          source: { id: 'mid-c', ver: '1.0', title: '建立目标—事务自动联动' },
          up: { level: 'mid', id: 'mid-c', title: '建立目标—事务自动联动（v1.0）' },
          down: [{ level: 'week', id: 'wk-5', title: '目标年度工具 AI 监控定稿上线' }] },
      ],
    },
    '2.1': { statusTabs: [{ k: '全部', n: 1 }, { k: '通过验收', n: 0 }, { k: '执行中', n: 0 }, { k: '卡点', n: 0 }, { k: '未验收', n: 1 }],
      items: [{ id: 'phase-e1', imp: 4, owner: '何沛', prog: 0, status: 'draft',
        title: '调度中台能力抽象与接口定义：明确可复用能力边界与对外接口。',
        source: { id: 'mid-e', ver: '2.0', title: '调度中台能力沉淀与外溢' },
        up: { level: 'mid', id: 'mid-e', title: '调度中台能力沉淀与外溢（v2.0）' }, down: [] }] },
    '2.2': { statusTabs: [{ k: '全部', n: 1 }, { k: '通过验收', n: 0 }, { k: '执行中', n: 0 }, { k: '卡点', n: 0 }, { k: '未验收', n: 1 }],
      items: [{ id: 'phase-f1', imp: 5, owner: '黄世彪', prog: 0, status: 'draft',
        title: '全域异常自愈率提升至 95%：扩充自愈策略库并灰度验证。',
        source: { id: 'mid-f', ver: '2.0', title: '全域异常自愈率稳定 ≥ 95%' },
        up: { level: 'mid', id: 'mid-f', title: '全域异常自愈率稳定 ≥ 95%（v2.0）' }, down: [] }] },
    '2.3': { statusTabs: [{ k: '全部', n: 1 }, { k: '通过验收', n: 0 }, { k: '执行中', n: 0 }, { k: '卡点', n: 0 }, { k: '未验收', n: 1 }],
      items: [{ id: 'phase-g1', imp: 4, owner: '何沛', prog: 0, status: 'draft',
        title: '运营统一看板上线：时效 / 成本 / 风险三曲线实时可读。',
        source: { id: 'mid-g', ver: '2.0', title: '运营一屏掌握时效 / 成本 / 风险' },
        up: { level: 'mid', id: 'mid-g', title: '运营一屏掌握时效 / 成本 / 风险（v2.0）' }, down: [] }] },
    '3.1': { statusTabs: [{ k: '全部', n: 1 }, { k: '通过验收', n: 0 }, { k: '执行中', n: 0 }, { k: '卡点', n: 0 }, { k: '未验收', n: 1 }],
      items: [{ id: 'phase-h1', imp: 4, owner: '何沛', prog: 0, status: 'draft',
        title: '对外业务试点对接：完成 1 个同类履约业务的中台接入联调。',
        source: { id: 'mid-h', ver: '3.0', title: '调度中台对外业务试点接入' },
        up: { level: 'mid', id: 'mid-h', title: '调度中台对外业务试点接入（v3.0）' }, down: [] }] },
    '3.2': { statusTabs: [{ k: '全部', n: 1 }, { k: '通过验收', n: 0 }, { k: '执行中', n: 0 }, { k: '卡点', n: 0 }, { k: '未验收', n: 1 }],
      items: [{ id: 'phase-i1', imp: 5, owner: '张威虎', prog: 0, status: 'draft',
        title: '年度成本目标收口：核算全年单均成本，对齐下降 ≥ 18% 目标。',
        source: { id: 'mid-i', ver: '3.0', title: '年度单均成本目标收口' },
        up: { level: 'mid', id: 'mid-i', title: '年度单均成本目标收口（v3.0）' }, down: [] }] },
    '3.3': { statusTabs: [{ k: '全部', n: 0 }, { k: '通过验收', n: 0 }, { k: '执行中', n: 0 }, { k: '卡点', n: 0 }, { k: '未验收', n: 0 }],
      items: [] },
  },
};

/* ============================================================
   模块六 · 周计划（对应周 + 版本 + 来源阶段 + 拆解事务）
   ============================================================ */
const HOME_WEEK = {
  byWeek: {
    '2026年06月第1周': {
      step: [{ k: '排期审核通过', date: '2026-06-01', state: 'done' }, { k: '执行中', date: '进行中', state: 'cur' }, { k: '验收', date: '2026-06-07', state: 'todo' }],
      statusTabs: [{ k: '全部', n: 3 }, { k: '执行中', n: 1 }, { k: '已验收', n: 0 }, { k: '编写中', n: 2 }],
      items: [
        { id: 'wk-6', imp: 5, prog: 0, status: 'draft',
          title: '漏斗池事务完成归档表回收，支撑 AI 读数分析。',
          steps: '①确定归档字段 ②回收漏斗池事务 ③验证 AI 读数分析',
          source: { id: 'phase-d1', ver: '1.1', title: '漏斗池事务归档回收' },
          up: { level: 'phase', id: 'phase-d1', title: '漏斗池事务归档回收（v1.1）' },
          tasks: [
            { id: 'tk-1', title: '归档字段口径梳理与确认', ai: '数据治理 Agent', status: 'run', prog: 30, bound: true },
            { id: 'tk-2', title: '漏斗池事务批量回收入库', ai: '数据工程 Agent', status: 'draft', prog: 0, bound: true },
            { id: 'tk-3', title: 'AI 读数分析联调验证', ai: '归因分析 Agent', status: 'draft', prog: 0, bound: false },
          ] },
        { id: 'wk-1', imp: 5, prog: 22, status: 'run',
          title: '接入区域实时路况，跑通低时延数据管道。',
          steps: '①路况源选型与采购 ②实时数据管道搭建 ③端到端时延压测',
          source: { id: 'phase-a1', ver: '1.1', title: '履约时效 < 4h' },
          up: { level: 'phase', id: 'phase-a1', title: '履约时效 < 4h（v1.1）' },
          tasks: [
            { id: 'tk-4', title: '路况源选型与采购', ai: '采购协同 Agent', status: 'kapian', prog: 40, bound: true },
            { id: 'tk-5', title: '实时数据管道搭建', ai: '数据工程 Agent', status: 'run', prog: 60, bound: true },
          ] },
        { id: 'wk-5', imp: 5, prog: 0, status: 'draft',
          title: '目标年度工具完成 AI 监控和管理办法定稿上线。',
          steps: '①定稿管理办法 ②完善 AI 监控规则 ③完成上线验收记录',
          source: { id: 'phase-c1', ver: '1.2', title: '目标—事务联动机制上线' },
          up: { level: 'phase', id: 'phase-c1', title: '目标—事务联动机制上线（v1.2）' },
          tasks: [
            { id: 'tk-6', title: '管理办法定稿评审', ai: '规则编排 Agent', status: 'run', prog: 50, bound: true },
            { id: 'tk-7', title: 'AI 监控规则配置上线', ai: '监控配置 Agent', status: 'draft', prog: 0, bound: false },
          ] },
      ],
    },
    '2026年05月第5周': {
      step: [{ k: '排期审核通过', date: '2026-05-25', state: 'done' }, { k: '执行中', date: '已完成', state: 'done' }, { k: '验收', date: '2026-05-31 已通过', state: 'done' }],
      statusTabs: [{ k: '全部', n: 2 }, { k: '执行中', n: 1 }, { k: '已验收', n: 1 }, { k: '编写中', n: 0 }],
      items: [
        { id: 'wk-2', imp: 5, prog: 70, status: 'run',
          title: '调度算法灰度上线，按区域 / 时段逐步放量。',
          steps: '①灰度策略配置 ②A/B 效果归因 ③放量阈值确认',
          source: { id: 'phase-a1', ver: '1.1', title: '履约时效 < 4h' },
          up: { level: 'phase', id: 'phase-a1', title: '履约时效 < 4h（v1.1）' },
          tasks: [
            { id: 'tk-8', title: '灰度策略配置', ai: '调度算法 Agent', status: 'accepted', prog: 100, bound: true },
            { id: 'tk-9', title: 'A/B 效果归因', ai: '归因分析 Agent', status: 'run', prog: 65, bound: true },
          ] },
        { id: 'wk-3', imp: 5, prog: 100, status: 'accepted',
          title: '异常检测模型迭代，提升召回与时效。',
          steps: '①特征工程优化 ②模型迭代训练 ③离线 / 在线评估',
          source: { id: 'phase-a2', ver: '1.1', title: '异常调度自愈率 ≥ 90%' },
          up: { level: 'phase', id: 'phase-a2', title: '异常调度自愈率 ≥ 90%（v1.1）' },
          tasks: [
            { id: 'tk-10', title: '特征工程优化', ai: '特征工程 Agent', status: 'accepted', prog: 100, bound: true },
          ] },
      ],
    },
    '2026年05月第4周': {
      step: [{ k: '排期审核通过', date: '2026-05-18', state: 'done' }, { k: '执行中', date: '已完成', state: 'done' }, { k: '验收', date: '2026-05-24 已通过', state: 'done' }],
      statusTabs: [{ k: '全部', n: 1 }, { k: '执行中', n: 0 }, { k: '已验收', n: 0 }, { k: '编写中', n: 1 }],
      items: [
        { id: 'wk-4', imp: 4, prog: 20, status: 'run',
          title: '推理资源弹性调度策略设计与试点。',
          steps: '①配额弹性策略 ②高峰扩容 / 低谷回收 ③成本上限校验',
          source: { id: 'phase-b1', ver: '1.2', title: '算力成本优化' },
          up: { level: 'phase', id: 'phase-b1', title: '算力成本优化（v1.2）' },
          tasks: [
            { id: 'tk-11', title: '配额弹性策略', ai: '算力调度 Agent', status: 'draft', prog: 15, bound: false },
          ] },
      ],
    },
    '2026年05月第3周': {
      step: [{ k: '排期审核通过', date: '2026-05-11', state: 'done' }, { k: '执行中', date: '已完成', state: 'done' }, { k: '验收', date: '2026-05-17 已通过', state: 'done' }],
      statusTabs: [{ k: '全部', n: 1 }, { k: '执行中', n: 0 }, { k: '已验收', n: 1 }, { k: '编写中', n: 0 }],
      items: [
        { id: 'wk-7', imp: 5, prog: 100, status: 'accepted',
          title: '异常检测样本回收与标注，夯实模型迭代数据底座。',
          steps: '①样本回收 ②标注质检 ③入库归档',
          source: { id: 'phase-a2', ver: '1.1', title: '异常调度自愈率 ≥ 90%' },
          up: { level: 'phase', id: 'phase-a2', title: '异常调度自愈率 ≥ 90%（v1.1）' },
          tasks: [
            { id: 'tk-12', title: '异常样本回收与标注', ai: '数据标注 Agent', status: 'accepted', prog: 100, bound: true },
          ] },
      ],
    },
  },
};

/* ---------- 状态 → 视觉映射（与目标树五态一致） ---------- */
const HOME_STATUS = {
  draft:    { label: '编写中', c: 'var(--text-500)', bg: 'var(--neutral-bg)', icon: 'pencil-line' },
  run:      { label: '执行中', c: 'var(--ai)', bg: 'var(--ai-soft)', icon: 'loader-2', spin: true },
  kapian:   { label: '卡点', c: 'var(--warning)', bg: 'var(--warning-bg)', icon: 'alert-triangle' },
  accepted: { label: '已验收', c: 'var(--success)', bg: 'var(--success-bg)', icon: 'circle-check' },
};
const HOME_LEVEL = {
  ideal: { label: '理想化状态', icon: 'target', c: 'var(--blue-primary)' },
  mid:   { label: '中短期目标', icon: 'flag', c: 'var(--blue-primary)' },
  phase: { label: '阶段结项目标', icon: 'milestone', c: 'var(--info)' },
  week:  { label: '周计划', icon: 'calendar-range', c: 'var(--ai)' },
  task:  { label: '执行事务', icon: 'square-check-big', c: 'var(--success)' },
};

const progColor = (p) => p >= 80 ? 'var(--success)' : p >= 40 ? 'var(--blue-primary)' : 'var(--warning)';

Object.assign(window, {
  GS_VERSIONS, MID_VERSIONS, MONTHS_OF, MONTH_OF, WEEKS_OF,
  HOME_IDEAL, HOME_USERS, HOME_VALUE, HOME_MID, HOME_PHASE, HOME_WEEK,
  HOME_STATUS, HOME_LEVEL, progColor,
});
