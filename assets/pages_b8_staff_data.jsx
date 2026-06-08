/* ============================================================
   批 8 · AI 员工后台管理 — 数据层（pages_b8_staff_data.jsx）
   ------------------------------------------------------------
   作用：官网平台内置全部 AI 员工的 mock 数据：身份与专业化定位·技能库（每个技能 =
         一套提示词与逻辑）·版本与进化日志。纯数据，渲染在 b8_staff.jsx / b8_skill.jsx。
   ⚠ 真实开发：STAFF 需换为 AI 员工平台（6699.com）接口。
   ============================================================ */

/* AI 项目流转的五个环节（员工据此定位）：战略→规划→执行→验收→治理。 */
const FLOW_STAGES = [
  { id: '战略', k: '战略意图', t: '识别价值方向', icon: 'compass' },
  { id: '规划', k: '立项规划', t: '拆解目标体系', icon: 'git-fork' },
  { id: '执行', k: '执行编排', t: '调度事务落地', icon: 'workflow' },
  { id: '验收', k: '验收闭环', t: '逐级审计评级', icon: 'clipboard-check' },
  { id: '治理', k: '风控治理', t: '全局留痕审计', icon: 'shield-alert' },
];

/* skillDots — 技能权重点（1~3）可视化。 */
function skillDots(w) {
  return (
    <span className="sk-lvl">
      {[1, 2, 3].map(i => <i key={i} className={i <= w ? 'on' : ''} />)}
    </span>
  );
}

/* ============================================================
   员工花名册 · 含技能库（skillBase）
   ------------------------------------------------------------
   每个员工：身份（id/name/role/stage/charter）+ 绩效（pass/reject/output30 等）
   + logs 工作日志 + outs 产出 + skillBase 技能库。
   每个 skill：intro / contract 契约 / logic 逻辑 / prompt 提示词 / curVer / versions / evolution 进化。
   未完整给出的字段由 enrichSkill 兜底，保证点开即用。⚠ 全部为 mock。
   ============================================================ */
const STAFF = [
  {
    id: 'AIE-PLAN-016', name: 'AI 项目负责人', role: '规划环节 · 项目负责人', stage: '规划',
    layer: '规划层', domain: '调度域 · 目标体系', icon: 'git-fork', status: 'run',
    charter: '承接战略意图与项目章程，把一个项目的「理想终态」拆成可验收、可执行、可追溯的多级目标体系，并在执行中持续校准。相当于项目流转中的 **项目负责人 / 产品负责人** 角色。',
    pass: 96.2, reject: 4.1, output30: 184, iters30: 3, skills30: 0,
    passTrend: [88, 90, 89, 92, 93, 94, 96], rejectTrend: [9, 8, 7, 6, 5, 5, 4], outTrend: [120, 138, 142, 150, 166, 175, 184],
    passDelta: '+2.1pt', rejectDelta: '-1.0pt',
    logs: [
      { ico: 'git-fork', act: '拆解阶段目标「履约时效 < 4h」为 6 条周目标', proj: 'PRJ-2026-0137', date: '06-02 09:14', out: '产出 6 条可验收周目标 + 依赖关系图，已逐条进入执行编排' },
      { ico: 'shield-alert', act: '识别关键外部依赖单点风险并标注', proj: 'PRJ-2026-0137', date: '06-01 16:40', out: '产出「双源冗余」建议，触发理想化状态复盘' },
      { ico: 'git-fork', act: '为客服知识中枢重构生成中短期目标树', proj: 'PRJ-2026-0129', date: '05-30 11:02', out: '产出 2 条中短期目标 + 4 条阶段目标，达标率预估 91%' },
    ],
    outs: [
      { ico: 'git-fork', t: '调度域目标树 v3.2', s: 'PRJ-2026-0137 · 已被验收引用 12 次', tag: '达标', tone: 'success' },
      { ico: 'milestone', t: '周目标对齐校验模板', s: '沉淀为可复用拆解范式', tag: '复用中', tone: 'info' },
      { ico: 'shield-alert', t: '外部依赖风险标注集', s: 'PRJ-2026-0137 · 卡点预警', tag: '已采纳', tone: 'success' },
    ],
    skillBase: [
      {
        id: 'SK-IDEAL', name: '理想化状态建模', weight: 3, calls30: 142, latency: '3.0s', success: 97.2,
        intro: '为一个项目定义「理想终态」：把战略意图与业务现状翻译成一个可量化、可追溯、自上而下可拆解的目标锚点。后续所有层级目标都必须能回溯到这个理想态，确保不漂移。',
        contract: {
          trigger: '立项后进入规划阶段、或目标体系需要重建 / 复盘时，由 AI 项目负责人调用。',
          input: [
            { k: 'charter', v: '项目章程与战略意图（价值方向、边界）' },
            { k: 'baseline', v: '当前业务基线指标与约束条件' },
            { k: 'context', v: '相关结项知识与行业基准' },
          ],
          output: [
            { k: 'ideal_state', v: '理想终态的结构化描述' },
            { k: 'target_set', v: '可量化的终态指标集（含验收口径）' },
            { k: 'assumptions', v: '关键假设与外部依赖清单' },
          ],
        },
        logic: [
          { act: '锚定价值方向', actor: 'AI', desc: '从章程提取价值主张与边界，剔除手段性表述，只保留「要达到的状态」。' },
          { act: '构造理想终态', actor: 'AI', desc: '以「若无资源约束、该业务的最优稳态是什么」设问，生成终态草案，再用真实约束回拉到可落地区间。' },
          { act: '量化与验收口径', actor: 'AI', desc: '为终态每个维度配一个可量化指标与验收口径，无法量化的维度要求补充观测代理指标。' },
          { act: '暴露假设与依赖', actor: 'AI', desc: '显式列出支撑该终态成立的关键假设、外部依赖，标注单点风险。' },
        ],
        prompt: {
          role: '你是项目的「理想化状态建模器」。你的任务不是给方案，而是先把"成功长什么样"定义清楚。',
          principles: [
            '以终态而非手段描述目标：写"达到的状态"，不写"要做的事"。',
            '理想态必须可量化、可验收；不可量化的维度须给出代理指标。',
            '理想态须能自上而下拆解，且每一级都能回溯到它，不漂移。',
            '回拉到可落地区间：在理论最优与现实约束之间取「可兑现的高标准」。',
          ],
          steps: [
            '提取价值方向与边界 → 2. 构造无约束最优稳态 → 3. 用真实约束回拉',
            '为每个维度配量化指标 + 验收口径',
            '显式列出关键假设与外部依赖，标注单点风险',
          ],
          output: '结构化 JSON：{ ideal_state, target_set[], assumptions[] }',
          guardrails: [
            '不得使用"绝对""100%"等不可兑现的措辞。',
            '终态指标必须可被验收官独立核验。',
          ],
        },
        curVer: 'v3.2',
        versions: [
          { ver: 'v3.2', date: '2026-06-01', source: 'human', author: '张明（管理层）',
            summary: '在建模阶段即对每个终态维度做「可验收性」前置打分，低于阈值要求补充验收口径。' },
          { ver: 'v3.1', date: '2026-05-22', source: 'auto',
            summary: '内化「关键外部依赖须双源冗余」，建模时主动在假设清单标注单点依赖。' },
          { ver: 'v3.0', date: '2026-05-08', source: 'auto',
            summary: '引入「无约束最优稳态 → 真实约束回拉」的统一范式，提升终态可拆解性。' },
          { ver: 'v2.4', date: '2026-04-19', source: 'human', author: '李航（管理层）',
            summary: '禁止终态描述使用绝对化措辞，要求与公司「稳健诚信」价值观一致。' },
        ],
        evolution: [
          { ver: 'v3.2', type: 'human', when: '06-01 14:20', who: '张明（管理层）',
            act: '人为干预 · 强化可验收性前置校验',
            reason: '在「逐环审核」中三次发现该技能产出的目标缺可量化验收口径（FB-2026-0488 等），管理层直接在技能详情页提出调整。' },
          { ver: 'v3.1', type: 'auto', when: '05-22 03:10',
            act: '自主进化 · 内化双源冗余依赖治理',
            decision: 'AI 在结项知识库沉淀中识别到「单点外部依赖两次阻断核心目标」，自主决策将其内化为建模默认检查项，并在下一次调用前生效。',
            reason: 'PRJ-2026-0137 结项经验：运力数据单源依赖导致两次卡点。' },
          { ver: 'v3.0', type: 'auto', when: '05-08 21:44',
            act: '自主进化 · 升级理想化状态建模范式',
            decision: 'AI 在对抗审核中观察到旧范式下各级目标常偏离终态；试点新范式后达标率较对照组高 9pt，达到管理层设定的自主推广阈值，遂自动升版。',
            reason: '范式试点项目达标率显著优于对照组。' },
          { ver: 'v2.4', type: 'human', when: '04-19 10:05', who: '李航（管理层）',
            act: '人为干预 · 对齐稳健诚信价值观',
            reason: '价值观对齐流程指出终态描述出现「绝对不会」等过度承诺措辞。' },
        ],
      },
      {
        id: 'SK-DECOMP', name: '目标分级拆解', weight: 3, calls30: 168, latency: '2.3s', success: 95.8,
        intro: '把理想终态自上而下拆成「中短期目标 → 阶段目标 → 周目标」的多级体系，每条目标可验收、可分配、带依赖关系，直接进入执行编排。',
        contract: {
          trigger: '理想化状态建模完成后自动衔接，或目标体系需要重排时调用。',
          input: [
            { k: 'ideal_state', v: '理想终态与终态指标集' },
            { k: 'capacity', v: '可用 AI 员工与算力额度' },
          ],
          output: [
            { k: 'goal_tree', v: '多级目标树（含层级与归属）' },
            { k: 'dependencies', v: '目标间依赖关系图' },
          ],
        },
        logic: [
          { act: '分层映射', actor: 'AI', desc: '把终态指标映射为中短期目标，再逐层细化到可在一周内验收的颗粒度。' },
          { act: '可验收性校验', actor: 'AI', desc: '每条目标调用「可验收性校验」子逻辑，低于阈值要求补充口径或拆细。' },
          { act: '依赖识别', actor: 'AI', desc: '识别目标间的前置 / 并行关系，生成依赖图，暴露关键路径。' },
        ],
        prompt: {
          role: '你是目标分级拆解器，把理想终态拆成可执行、可验收、可追溯的多级目标树。',
          principles: [
            '每条目标都能回溯到上一级，最终回溯到理想终态。',
            '叶子目标须可在一个执行周期内被独立验收。',
            '显式标注依赖与关键路径，不隐藏跨目标耦合。',
          ],
          steps: ['终态 → 中短期 → 阶段 → 周，逐层细化', '每层做可验收性校验', '生成依赖关系图与关键路径'],
          output: '目标树 JSON + 依赖图',
          guardrails: ['不得产出无验收口径的叶子目标。'],
        },
        curVer: 'v3.2',
        versions: [
          { ver: 'v3.2', date: '2026-06-01', source: 'human', author: '张明（管理层）', summary: '叶子目标强制带验收口径，否则不允许进入执行编排。' },
          { ver: 'v3.0', date: '2026-05-08', source: 'auto', summary: '跟随理想化状态建模范式升级，拆解锚点改为新版终态结构。' },
          { ver: 'v2.6', date: '2026-04-11', source: 'human', author: '李航（管理层）', summary: '周目标颗粒度上限收紧为「单周可验收」。' },
        ],
        evolution: [
          { ver: 'v3.2', type: 'human', when: '06-01 14:25', who: '张明（管理层）', act: '人为干预 · 验收口径硬约束', reason: '与「理想化状态建模 v3.2」同批校正，保证拆解到执行全链路可验收。' },
          { ver: 'v3.0', type: 'auto', when: '05-08 21:50', act: '自主进化 · 跟随终态范式升级', decision: 'AI 检测到上游理想化状态结构变更，自主同步拆解锚点以保持一致，避免目标漂移。', reason: '上游 SK-IDEAL 升级到 v3.0。' },
          { ver: 'v2.6', type: 'human', when: '04-11 09:30', who: '李航（管理层）', act: '人为干预 · 收紧周目标颗粒度', reason: '执行层反馈周目标过粗、难以单周验收。' },
        ],
      },
      {
        id: 'SK-ALIGN', name: '周目标对齐', weight: 2, calls30: 96, latency: '1.4s', success: 94.1,
        intro: '每周开始时，对照阶段目标与实际进度，自动校准本周周目标，必要时重排优先级并提示偏差。',
      },
      {
        id: 'SK-DEP', name: '外部依赖识别', weight: 2, calls30: 74, latency: '1.8s', success: 93.4,
        intro: '识别目标体系中的外部依赖（数据源、第三方接口、跨团队交付），标注单点风险并建议冗余方案。',
      },
      {
        id: 'SK-SCOPE', name: '范围裁剪', weight: 1, calls30: 38, latency: '1.1s', success: 92.0,
        intro: '当资源或时间收紧时，在保住理想终态核心维度的前提下，给出可裁剪的非关键目标建议。',
      },
    ],
  },

  {
    id: 'AIE-STRAT-004', name: 'AI 战略分析师', role: '战略环节 · 价值洞察', stage: '战略',
    layer: '规划层', domain: '全局 · 战略洞察', icon: 'compass', status: 'idle',
    charter: '在项目尚未立项时，从市场、业务数据与公司核心竞争力中识别值得投入的价值方向，输出可被立项引用的机会判断。相当于流转中的 **战略 / 商业分析** 角色。',
    pass: 93.4, reject: 5.2, output30: 72, iters30: 1, skills30: 0,
    passTrend: [89, 90, 91, 91, 92, 93, 93], rejectTrend: [8, 7, 7, 6, 6, 5, 5], outTrend: [48, 52, 58, 62, 66, 70, 72],
    passDelta: '+1.2pt', rejectDelta: '-0.5pt',
    logs: [
      { ico: 'compass', act: '识别「同城即时零售」价值方向并评估', proj: '备选池', date: '06-01 10:20', out: '产出机会判断 + 三项支撑指标，进入备选池' },
      { ico: 'trending-up', act: '复核客服智能化方向的投入产出', proj: 'PRJ-2026-0129', date: '05-28 15:10', out: '产出 ROI 预估，建议优先级上调' },
    ],
    outs: [
      { ico: 'compass', t: '同城即时零售机会判断', s: '备选池 · 已被立项引用', tag: '已采纳', tone: 'success' },
      { ico: 'gem', t: '核心竞争力映射表', s: '自有数据壁垒 × 机会方向', tag: '复用中', tone: 'info' },
    ],
    skillBase: [
      {
        id: 'SK-OPP', name: '机会方向识别', weight: 3, calls30: 54, latency: '4.2s', success: 94.6,
        intro: '从市场信号、内部数据与公司核心竞争力的交集中，识别值得立项的价值方向，并给出可量化的机会判断与风险提示。',
        contract: {
          trigger: '战略复盘周期、或管理层录入新意图时调用。',
          input: [{ k: 'signals', v: '市场与行业信号' }, { k: 'edges', v: '公司核心竞争力清单' }, { k: 'data', v: '内部业务数据' }],
          output: [{ k: 'opportunity', v: '机会方向判断' }, { k: 'evidence', v: '支撑指标与假设' }],
        },
        logic: [
          { act: '信号聚类', actor: 'AI', desc: '对市场与内部信号聚类，过滤噪声，保留趋势性信号。' },
          { act: '竞争力交集', actor: 'AI', desc: '只保留与自有数据 / 算法壁垒有交集的方向，避免无差异化投入。' },
          { act: '机会量化', actor: 'AI', desc: '为方向配规模、增速、壁垒强度三项指标，给出优先级建议。' },
        ],
        prompt: {
          role: '你是战略分析师，从机会与公司核心竞争力的交集中识别值得投入的方向。',
          principles: ['优先发挥自有数据与算法壁垒', '机会须可量化、可证伪', '不追逐无差异化的通用机会'],
          steps: ['信号聚类', '与核心竞争力求交集', '量化并排优先级'],
          output: '机会判断 JSON + 支撑证据',
          guardrails: ['不得在缺乏数据支撑时给出乐观结论。'],
        },
        curVer: 'v2.1',
        versions: [
          { ver: 'v2.1', date: '2026-05-30', source: 'human', author: '李航（管理层）', summary: '机会必须与自有数据壁垒求交集后才能进入备选池。' },
          { ver: 'v2.0', date: '2026-05-02', source: 'auto', summary: '引入信号聚类，降低噪声信号导致的误判。' },
        ],
        evolution: [
          { ver: 'v2.1', type: 'human', when: '05-30 11:00', who: '李航（管理层）', act: '人为干预 · 绑定核心竞争力', reason: '价值观对齐指出方向「未发挥自有数据双源能力」。' },
          { ver: 'v2.0', type: 'auto', when: '05-02 02:30', act: '自主进化 · 引入信号聚类', decision: 'AI 在历史误判复盘中发现噪声信号占比偏高，自主引入聚类预处理。', reason: '历史机会误判率偏高。' },
        ],
      },
      { id: 'SK-ROI', name: 'ROI 预估', weight: 2, calls30: 30, latency: '2.6s', success: 92.8, intro: '对候选方向做投入产出预估，输出可被立项门槛引用的量化区间与敏感性分析。' },
      { id: 'SK-EDGE', name: '核心竞争力映射', weight: 2, calls30: 22, latency: '1.9s', success: 93.0, intro: '把公司已沉淀的数据与算法能力映射到机会方向上，标注差异化壁垒强度。' },
    ],
  },

  {
    id: 'AIE-EXEC-031', name: 'AI 执行官', role: '执行环节 · 事务调度', stage: '执行',
    layer: '执行层', domain: '调度域 · 事务执行', icon: 'workflow', status: 'run',
    charter: '把周目标转成可执行的事务链，调用工具、处理异常、回写进度，确保目标在执行层稳定落地。相当于流转中的 **执行负责人 / 调度** 角色。',
    pass: 92.7, reject: 6.8, output30: 412, iters30: 2, skills30: 0,
    passTrend: [90, 91, 90, 92, 91, 92, 93], rejectTrend: [7, 7, 8, 7, 7, 6, 7], outTrend: [330, 350, 372, 388, 396, 405, 412],
    passDelta: '+0.9pt', rejectDelta: '+0.3pt',
    logs: [
      { ico: 'square-check-big', act: '编排「接入区域运力实时数据源」事务链', proj: 'PRJ-2026-0137', date: '06-02 10:22', out: '产出 9 步事务编排，自愈 2 次接口超时后联通成功' },
      { ico: 'refresh-cw', act: '对账自动化批处理执行', proj: 'PRJ-2026-0129', date: '06-01 22:10', out: '产出 1.2 万条对账结果，差错率 0.04%' },
    ],
    outs: [
      { ico: 'square-check-big', t: '运力数据接入事务链', s: 'PRJ-2026-0137 · 验收达标', tag: '达标', tone: 'success' },
      { ico: 'refresh-cw', t: '异常自愈策略包', s: '自愈率 91.4% · 全域复用', tag: '复用中', tone: 'info' },
    ],
    skillBase: [
      {
        id: 'SK-ORCH', name: '事务编排', weight: 3, calls30: 220, latency: '4.1s', success: 93.2,
        intro: '把一条周目标拆成有序的事务步骤，自动选择工具与执行顺序，处理并发与依赖，驱动目标在执行层落地。',
        contract: {
          trigger: '周目标进入执行阶段时由 AI 执行官调用。',
          input: [{ k: 'goal', v: '可验收的周目标' }, { k: 'tools', v: '可用工具与接口清单' }],
          output: [{ k: 'plan', v: '有序事务编排' }, { k: 'trace', v: '执行留痕与进度回写' }],
        },
        logic: [
          { act: '步骤分解', actor: 'AI', desc: '将周目标分解为最小可执行步骤，标注每步所需工具与前置条件。' },
          { act: '调度执行', actor: 'AI', desc: '按依赖拓扑排序并发执行，遇异常进入自愈逻辑。' },
          { act: '进度回写', actor: 'AI', desc: '每步完成即结构化回写进度到目标树，保证实时可追溯。' },
        ],
        prompt: {
          role: '你是执行编排器，把周目标转成稳定可落地的事务链。',
          principles: ['每步可观测、可回滚', '异常优先自愈，不轻易中断目标', '进度实时回写，不积压'],
          steps: ['分解为最小步骤', '拓扑排序并发执行', '异常自愈 + 进度回写'],
          output: '事务编排 JSON + 执行留痕',
          guardrails: ['关键步骤失败须越级上报，不得静默吞掉。'],
        },
        curVer: 'v5.4',
        versions: [
          { ver: 'v5.4', date: '2026-05-28', source: 'auto', summary: '第三方接口超时改用指数退避 + 双源切换，降低单点联通失败。' },
          { ver: 'v5.3', date: '2026-05-12', source: 'human', author: '王彬（管理层）', summary: '每步事务完成即结构化回写进度，解决进度与执行不同步。' },
          { ver: 'v5.0', date: '2026-04-20', source: 'auto', summary: '引入拓扑并发调度，提升长事务链吞吐。' },
        ],
        evolution: [
          { ver: 'v5.4', type: 'auto', when: '05-28 04:12', act: '自主进化 · 升级超时自愈策略', decision: 'AI 在执行中检测到运力接口连续两次联通失败触发卡点，自主改用指数退避与双源切换，并在验收前自检通过后生效。', reason: '运力接口连续超时导致事务整体失败。' },
          { ver: 'v5.3', type: 'human', when: '05-12 16:40', who: '王彬（管理层）', act: '人为干预 · 规范进度回写', reason: '负责人反馈「事务完成与进度更新不同步」（FB-2026-0402）。' },
          { ver: 'v5.0', type: 'auto', when: '04-20 01:05', act: '自主进化 · 引入并发调度', decision: 'AI 在长事务链上观察到串行执行吞吐瓶颈，自主引入拓扑并发。', reason: '长事务链串行执行耗时偏高。' },
        ],
      },
      { id: 'SK-TOOL', name: '工具调用', weight: 3, calls30: 196, latency: '12.6s', success: 94.0, intro: '按事务步骤选择并调用合适的工具 / 接口，处理鉴权、限流与结果解析。' },
      { id: 'SK-HEAL', name: '异常自愈', weight: 2, calls30: 88, latency: '自愈', success: 91.4, intro: '对超时、限流、临时故障等可恢复异常自动重试与退避，必要时切换备源，避免事务整体失败。' },
      { id: 'SK-WRITE', name: '进度回写', weight: 2, calls30: 140, latency: '0.6s', success: 96.5, intro: '每步事务完成即把进度与留痕结构化回写到目标树，保证目标进度实时、可追溯。' },
    ],
  },

  {
    id: 'AIE-ACPT-022', name: 'AI 验收官', role: '验收环节 · 逐级审计', stage: '验收',
    layer: '规划层', domain: '通用 · 验收审核', icon: 'clipboard-check', status: 'idle',
    charter: '自下而上逐级验收（事务 → 周 → 阶段 → 中短期），按统一标准独立审计每一级产出并评级，给出可量化证据与退回意见。相当于流转中的 **质量 / 验收** 角色。',
    pass: 94.5, reject: 3.6, output30: 268, iters30: 1, skills30: 0,
    passTrend: [91, 92, 93, 93, 94, 94, 95], rejectTrend: [6, 5, 5, 4, 4, 4, 4], outTrend: [210, 228, 240, 248, 256, 262, 268],
    passDelta: '+1.4pt', rejectDelta: '-0.4pt',
    logs: [
      { ico: 'list-checks', act: '逐环审核「展示环」并给出验收结论', proj: 'PRJ-2026-0129', date: '06-02 08:50', out: '产出环级评级 + 1 条退回意见，附可量化证据' },
      { ico: 'circle-check', act: '生成阶段目标验收结论', proj: 'PRJ-2026-0151', date: '05-31 14:30', out: '产出验收报告，判定 4/5 环达标' },
    ],
    outs: [
      { ico: 'list-checks', t: '逐环验收评级集', s: 'PRJ-2026-0129 · 评级一致性 98%', tag: '达标', tone: 'success' },
      { ico: 'file-text', t: '退回意见模板库', s: '附量化证据 · 全域复用', tag: '复用中', tone: 'info' },
    ],
    skillBase: [
      {
        id: 'SK-LOOP', name: '逐环审核', weight: 3, calls30: 156, latency: '2.0s', success: 95.2,
        intro: '对每一个交付环按统一标准独立审计：核验证据、判定是否达标、给出可量化的评级与退回意见，保证跨项目评级一致。',
        contract: {
          trigger: '某一交付环完成、进入验收时由 AI 验收官调用。',
          input: [{ k: 'deliverable', v: '环级产出与执行留痕' }, { k: 'criteria', v: '该环验收口径' }],
          output: [{ k: 'rating', v: '环级评级（达标 / 待返修 / 退回）' }, { k: 'evidence', v: '可量化证据与退回意见' }],
        },
        logic: [
          { act: '证据核验', actor: 'AI', desc: '逐条核验产出是否满足验收口径，缺证据即判待补。' },
          { act: '评级判定', actor: 'AI', desc: '按统一评分卡评级，评级必须附可量化证据，禁止主观裁量。' },
          { act: '退回建议', actor: 'AI', desc: '未达标时生成结构化退回意见，指向具体口径与差距。' },
        ],
        prompt: {
          role: '你是逐环验收官，按统一标准独立审计每一环并评级。',
          principles: ['评级必须附可量化证据', '同类产出评级一致，不漂移', '退回意见须可执行、指向具体差距'],
          steps: ['核验证据', '按评分卡评级', '生成退回意见'],
          output: '评级 JSON + 证据 + 退回意见',
          guardrails: ['无证据不得评级；不得放宽他人口径。'],
        },
        curVer: 'v4.1',
        versions: [
          { ver: 'v4.1', date: '2026-05-19', source: 'human', author: '张明（管理层）', summary: '环级评级必须附可量化证据，提升跨项目评级一致性。' },
          { ver: 'v4.0', date: '2026-04-28', source: 'auto', summary: '统一评分卡，降低不同项目间评级漂移。' },
        ],
        evolution: [
          { ver: 'v4.1', type: 'human', when: '05-19 13:15', who: '张明（管理层）', act: '人为干预 · 评级须附证据', reason: '管理层反馈「同类产出评级不一致」（FB-2026-0455）。' },
          { ver: 'v4.0', type: 'auto', when: '04-28 03:20', act: '自主进化 · 统一评分卡', decision: 'AI 在跨项目评级一致性抽检为 91%（低于 95% 目标）后，自主收敛评分卡并统一口径。', reason: '跨项目评级一致性低于目标线。' },
        ],
      },
      { id: 'SK-VERDICT', name: '验收判定', weight: 3, calls30: 132, latency: '1.6s', success: 95.0, intro: '汇总环级结论生成上一级目标的验收判定，决定是否闭环或回退。' },
      { id: 'SK-ATTR', name: '偏差归因', weight: 2, calls30: 60, latency: '2.1s', success: 92.6, intro: '对未达标项做根因归因，定位是目标、执行还是依赖问题，反哺上游迭代。' },
    ],
  },

  {
    id: 'AIE-GOV-007', name: 'AI 风控官', role: '治理环节 · 风险审计', stage: '治理',
    layer: '治理层', domain: '全局 · 风险审计', icon: 'shield-alert', status: 'run',
    charter: '横贯全流程做风险分级、卡点识别与 append-only 留痕审计，对持续恶化的风险越级上报管理层。相当于流转中的 **风控 / 审计** 角色。',
    pass: 90.3, reject: 7.9, output30: 96, iters30: 1, skills30: 0,
    passTrend: [86, 87, 88, 88, 89, 90, 90], rejectTrend: [11, 10, 9, 9, 8, 8, 8], outTrend: [70, 76, 80, 85, 88, 92, 96],
    passDelta: '+1.1pt', rejectDelta: '-0.4pt',
    logs: [
      { ico: 'shield-alert', act: '将「大额成本审批」标记为关注级并入留痕', proj: 'PRJ-2026-0129', date: '06-02 11:05', out: '产出风险分级结论 + 关联溯源链' },
      { ico: 'octagon-alert', act: '识别强制结项触发条件', proj: 'PRJ-2026-0151', date: '05-29 09:40', out: '产出风险级预警，越级高亮至管理层' },
    ],
    outs: [
      { ico: 'shield-alert', t: '全局风险分级规则集', s: '提示 / 关注 / 风险三级', tag: '运行中', tone: 'ai' },
      { ico: 'history', t: '留痕审计溯源链', s: 'append-only · 唯一事实来源', tag: '运行中', tone: 'ai' },
    ],
    skillBase: [
      {
        id: 'SK-RISK', name: '风险分级', weight: 3, calls30: 64, latency: '0.8s', success: 91.0,
        intro: '对全局事件做提示 / 关注 / 风险三级分级，结合趋势预测过滤短时波动，仅对持续恶化的风险升级与越级上报。',
        contract: {
          trigger: '任一动作产生留痕事件时实时触发。',
          input: [{ k: 'event', v: '留痕事件与上下文' }, { k: 'trend', v: '同类风险历史趋势' }],
          output: [{ k: 'level', v: '风险等级' }, { k: 'trace', v: '关联溯源链' }],
        },
        logic: [
          { act: '即时分级', actor: 'AI', desc: '按规则集对事件初判等级。' },
          { act: '趋势修正', actor: 'AI', desc: '结合历史趋势，对短时波动降权，避免误报。' },
          { act: '越级上报', actor: 'AI', desc: '仅持续恶化的风险越级高亮至管理层，附溯源链。' },
        ],
        prompt: {
          role: '你是全局风控官，对事件分级并对真实风险越级上报。',
          principles: ['短时波动不立即升级', '只对持续恶化越级', '所有判断 append-only 留痕'],
          steps: ['即时分级', '趋势修正', '越级上报'],
          output: '风险等级 + 溯源链',
          guardrails: ['不得漏报持续恶化风险；不得用关注级淹没真实风险。'],
        },
        curVer: 'v2.3',
        versions: [
          { ver: 'v2.3', date: '2026-05-25', source: 'human', author: '王彬（管理层）', summary: '引入趋势预测，对短时波动不立即升级，降低关注级误报。' },
          { ver: 'v2.2', date: '2026-05-06', source: 'auto', summary: '补全关联溯源链，每条风险可回溯到触发动作。' },
        ],
        evolution: [
          { ver: 'v2.3', type: 'human', when: '05-25 15:40', who: '王彬（管理层）', act: '人为干预 · 降低误报', reason: '管理层反馈「关注级预警过多、淹没真实风险」（FB-2026-0471）。' },
          { ver: 'v2.2', type: 'auto', when: '05-06 02:15', act: '自主进化 · 补全溯源链', decision: 'AI 在留痕审计中发现部分风险无法回溯到触发动作，自主补全关联溯源逻辑。', reason: '存在无法溯源的风险事件。' },
        ],
      },
      { id: 'SK-BLOCK', name: '卡点识别', weight: 3, calls30: 48, latency: '0.9s', success: 90.5, intro: '识别阻断目标推进的卡点，区分可自愈与需人工介入，触发对应处置。' },
      { id: 'SK-AUDIT', name: '留痕审计', weight: 2, calls30: 52, latency: '0.4s', success: 95.0, intro: '对所有动作做 append-only 留痕，作为全局唯一事实来源，支持回溯与合规审计。' },
      { id: 'SK-ESCAL', name: '越级上报', weight: 2, calls30: 18, latency: '0.5s', success: 89.0, intro: '对超过阈值或持续恶化的风险越级高亮至管理层，附溯源与处置建议。' },
    ],
  },
];

/* ============================================================
   兜底：把仅有 intro 的技能补全为可渲染的完整结构
   ------------------------------------------------------------
   enrichSkill(sk, staff)：技能详情页需要 contract/logic/prompt/versions/evolution 等完整字段，
   但数据里部分技能只写了 intro——本函数根据员工上下文生成合理的默认值，保证点开即用。
   ============================================================ */
function enrichSkill(sk, staff) {
  const out = { ...sk };
  if (!out.contract) {
    out.contract = {
      trigger: `在「${staff.role.split(' · ')[0]}」中，由 ${staff.name} 按需调用，调用后返回既定结构化产出。`,
      input: [{ k: 'context', v: '当前项目上下文与上一环产出' }, { k: 'criteria', v: '适用的标准与约束' }],
      output: [{ k: 'result', v: `${sk.name}的结构化结果` }, { k: 'trace', v: '执行留痕（写入审计）' }],
    };
  }
  if (!out.logic) {
    out.logic = [
      { act: '读取上下文', actor: 'AI', desc: `解析输入与约束，确定本次「${sk.name}」的处理边界。` },
      { act: '核心处理', actor: 'AI', desc: `按预设提示词与逻辑产出${sk.name}结果，过程可观测。` },
      { act: '校验与留痕', actor: 'AI', desc: '对结果做一致性校验，并把过程结构化写入留痕。' },
    ];
  }
  if (!out.prompt) {
    out.prompt = {
      role: `你是「${sk.name}」技能，服务于 ${staff.name}（${staff.domain}）。`,
      principles: ['产出可验收、可追溯', '与公司价值观与既定标准一致', '过程 append-only 留痕'],
      steps: ['读取上下文与约束', `执行${sk.name}核心逻辑`, '校验并写入留痕'],
      output: `${sk.name}的结构化结果`,
      guardrails: ['缺乏依据时不臆测；异常须上报不静默。'],
    };
  }
  if (!out.curVer) out.curVer = 'v1.4';
  if (!out.versions) {
    out.versions = [
      { ver: 'v1.4', date: '2026-05-20', source: 'human', author: '张明（管理层）', summary: `校准「${sk.name}」的判定口径，使其与公司既定理解一致。` },
      { ver: 'v1.2', date: '2026-04-30', source: 'auto', summary: `据执行中的表现自主优化「${sk.name}」的处理策略。` },
      { ver: 'v1.0', date: '2026-04-08', source: 'auto', summary: `「${sk.name}」初始化上线。` },
    ];
  }
  if (!out.evolution) {
    out.evolution = [
      { ver: 'v1.4', type: 'human', when: '05-20 10:30', who: '张明（管理层）', act: `人为干预 · 校准${sk.name}口径`, reason: `管理层在使用中发现该技能逻辑与公司过往理解存在偏差，直接在详情页提出调整。` },
      { ver: 'v1.2', type: 'auto', when: '04-30 02:40', act: `自主进化 · 优化${sk.name}策略`, decision: `AI 在任务执行与验收过程中发现该技能存在可优化点，自主决策迭代并在自检通过后生效。`, reason: '执行表现触发的自主优化。' },
    ];
  }
  return out;
}

Object.assign(window, { STAFF, FLOW_STAGES, skillDots, enrichSkill });
