/* ============================================================
   页面 2.3 · 自动立项  +  2.4 · 大额成本审批
   ------------------------------------------------------------
   作用：两个关联页。立项默认 AI 自动（备选池达门槛即自动立项、无人工卡点），
         立项成功直接写入目标层；成本类唯一的人工闸门 = 大额成本审批（门槛 ≥ 50 万）。
   数据：CHARTER_PENDING/DONE/DOCS、COST_ITEMS 均为 mock。
   ============================================================ */

/* ====== 2.3 · 自动立项 ====== */

/* 立项列表项（点击进入完整立项表单）。key 对应 CHARTER_DOCS 里的详细章程。
   status: ready 立项中 / chartered 已立项。 */
const CHARTER_PENDING = [
  { name: '智能客服自助引擎', id: 'PRJ-PENDING-0042', key: 'self', status: 'ready', from: 'CAND-0042', portfolio: '客户服务自助化', score: 88 },
  { name: '智能定价试验台', id: 'PRJ-PENDING-0043', key: 'pricing', status: 'ready', from: 'CAND-0051', portfolio: '增长与营销', score: 83 },
];

const CHARTER_DONE = [
  { name: '会员流失预警', id: 'PRJ-2026-0140', key: 'churn', status: 'chartered', from: 'CAND-0019', portfolio: '增长与营销', score: 85 },
];

/* 完整立项表单（项目章程）· 按业内通用立项标准结构化。
   结构：每个 docKey 对应一份章程，含 meta/background/purpose/objectives/scope/milestones/
   cost/stakeholders/risks/success/dependencies/aiNote 等字段，由 CharterDoc 逐节渲染。
   ⚠ mock 数据：真实开发由 AI 立项接口生成。 */
const CHARTER_DOCS = {
  sched: {
    meta: { portfolio: '履约与供应链', owner: '何沛', mode: 'AI 自治', source: 'CAND-0137', score: 90, threshold: 80, date: '2026-03-12' },
    background: '履约高峰期的订单分配与运力匹配长期依赖人工经验调度，时效波动大、异常处置滞后，履约成本与客户体验同时承压。战略主轴要求履约链路智能化、以实时数据驱动决策。本候选在备选池多维分析中综合评分 90，已达自动立项门槛，由 AI 自主发起立项。',
    purpose: '构建以实时数据驱动的智能履约调度中台，把订单分配、运力匹配与异常自愈沉淀为可自动执行、可验收的调度闭环，将人工经验调度升级为 AI 自治调度，在保障时效的同时压降单均履约成本。',
    objectives: [
      { goal: '平均履约时效', baseline: '6.5h', target: '≤ 4h', src: 'internal' },
      { goal: '调度时效', baseline: '当前基准', target: '提升 ≥ 30%', src: 'internal' },
      { goal: '异常调度自愈率', baseline: '—', target: '≥ 90%', src: 'industry' },
    ],
    startpoint: '已有订单、运力与路况基础数据，但实时路况未接入、调度规则散落在人工经验中；异常处置以人工兜底为主，缺乏可灰度、可回滚的统一调度框架。',
    scope: {
      in: ['订单分配与运力匹配的实时调度闭环', '接入实时路况等关键数据源', '异常调度的自动降级与自愈策略', '调度时效 / 自愈率实时看板'],
      out: ['运力资源的对外采购决策（仅输出建议）', '末端配送的人工现场操作', '跨区域价格与合规审查'],
    },
    deliverables: ['智能履约调度引擎（分配 + 匹配 + 自愈）', '实时路况等数据源接入与数据管道', '异常调度自动降级与自愈策略库', '履约时效 / 自愈率 / 成本实时看板'],
    milestones: [
      { phase: 'M1 · 数据接入与基线', when: '第 1–3 周', desc: '打通实时路况与运力数据，建立调度基线指标' },
      { phase: 'M2 · 调度引擎灰度', when: '第 4–8 周', desc: '分配 / 匹配策略小流量灰度，验证时效提升' },
      { phase: 'M3 · 异常自愈闭环', when: '第 9–13 周', desc: '上线自动降级与自愈策略，接入人工兜底' },
      { phase: 'M4 · 全量与调优', when: '第 14–16 周', desc: '全量放开并按时效 / 自愈率目标持续调优' },
    ],
    cost: {
      items: [
        { k: '实时调度算力扩容', v: '¥1,820,000', tag: '算力' },
        { k: '数据工程与接入人力（4 个月）', v: '¥640,000', tag: '人力' },
        { k: '第三方实时路况 API 授权', v: '¥182,000', tag: '采购' },
      ],
      total: '¥2,642,000', gate: false,
      gateNote: '该金额为 AI 立项阶段的预估测算、尚未实际发生，立项不设成本阈值卡点，由 AI 直接判定立项；实际算力 / 采购支出将在执行阶段按大额成本审批逐笔把关。',
    },
    stakeholders: [
      { role: '项目集负责人', who: '何沛 · 履约与供应链', icon: 'user' },
      { role: '立项发起', who: 'AI 自动立项', icon: 'bot' },
      { role: '协作 AI 员工', who: '调度 Agent、运力匹配 Agent、监控 Agent（6699.com）', icon: 'bot' },
      { role: '兜底人工', who: '履约调度值班团队', icon: 'users' },
    ],
    assumptions: ['实时路况等关键数据源可稳定接入', '高峰算力配额可按需弹性扩容'],
    constraints: ['不直接对外采购运力，仅输出调度建议', '受算力高峰配额与依赖服务可用性约束', '异常兜底须保留人工介入通道'],
    risks: [
      { risk: '实时数据源时延 / 缺失导致调度失准', level: '中', mitig: '数据缺失即降级到经验规则并告警，回流补数' },
      { risk: '调度策略灰度样本不足，时效提升不及预期', level: '中', mitig: '扩大灰度窗口、引入对照组分区放量' },
      { risk: '依赖服务抖动引发调用超时雪崩', level: '高', mitig: '排队降级 + 熔断保护，根因转人工核查' },
    ],
    success: ['平均履约时效 ≤ 4h 且稳定 4 周', '调度时效较基线提升 ≥ 30%', '异常调度自愈率 ≥ 90%'],
    dependencies: ['依赖实时路况 / 运力数据源接入', '依赖 6699.com 调度 / 监控类 AI 员工接口可用', '实际算力 / 采购预算在执行阶段按大额成本审批逐笔释放'],
    aiNote: 'AI 综合战略契合度（A）、履约收益（A）与可行性（A-），备选池综合评分 90 ≥ 80 门槛，直接自动立项；预估成本属未实际发生的测算、不作为立项卡点。立项材料、事实数据与本结论已全部写入留痕，管理层可事后异步 review 或发起反馈。',
  },
  self: {
    meta: { portfolio: '客户服务自助化', owner: '苏婧', mode: 'AI 自治', source: 'CAND-0042', score: 88, threshold: 80, date: '2026-06-02' },
    background: '客户自助率长期低于行业基准，人工坐席成本随业务量同步攀升。本周战略主轴调整为「自助化优先」，要求服务类项目优先建设客户可自助完成的能力闭环。本候选在备选池多维分析中综合评分 88，已达自动立项门槛，由 AI 自主发起立项。',
    purpose: '把高频、标准化的咨询 / 查询 / 办理沉淀为客户可 7×24 自助完成的能力闭环，人工坐席退居复杂与情感场景，降低人工依赖、提升体验一致性。',
    objectives: [
      { goal: '客户自助完成率', baseline: '41%', target: '≥ 70%', src: 'internal' },
      { goal: '人工工单量', baseline: '当前基准', target: '同比下降 ≥ 30%', src: 'industry' },
      { goal: '平均自助办理时长', baseline: '—', target: '≤ 90 秒', src: 'internal' },
    ],
    startpoint: '现有对话与知识库 NLP 能力可复用约 70%，已有知识中枢但未打通办理类业务系统；自助入口分散、转人工率偏高。',
    scope: {
      in: ['咨询 / 查询 / 办理三类高频场景的自助闭环', '接入知识中枢与核心业务系统', '自助→人工的平滑兜底与上下文传递'],
      out: ['复杂投诉与情感安抚场景（仍由人工坐席）', '线下门店相关服务', '多语言自助能力（本期不含）'],
    },
    deliverables: ['多场景自助引擎（对话 + 表单 + 办理）', '知识中枢接入与自助知识卡片', '自助→人工无缝转接与上下文同步', '自助率 / 转人工率实时看板'],
    milestones: [
      { phase: 'M1 · 能力盘点与接入', when: '第 1–3 周', desc: '打通知识中枢与业务系统接口，明确可复用能力边界' },
      { phase: 'M2 · 咨询/查询自助上线', when: '第 4–7 周', desc: '高频咨询查询场景灰度上线，验证客户迁移率' },
      { phase: 'M3 · 办理类自助闭环', when: '第 8–12 周', desc: '退换货 / 办理类自助闭环，接入兜底转人工' },
      { phase: 'M4 · 全量与调优', when: '第 13–16 周', desc: '全量放开并按自助率目标持续调优' },
    ],
    cost: {
      items: [
        { k: '知识标注与冷启动人力（3 个月）', v: '¥720,000', tag: '人力' },
        { k: '对话 / 推理算力扩容', v: '¥240,000', tag: '算力' },
        { k: '第三方语义能力授权', v: '¥180,000', tag: '采购' },
      ],
      total: '¥1,140,000', gate: false,
      gateNote: '该金额为 AI 立项阶段的预估测算、尚未实际发生，立项不设成本阈值卡点，由 AI 直接判定立项；实际人力 / 采购支出将在执行阶段按大额成本审批逐笔把关。',
    },
    stakeholders: [
      { role: '项目集负责人', who: '苏婧 · 客户服务自助化', icon: 'user' },
      { role: '立项发起', who: 'AI 自动立项', icon: 'bot' },
      { role: '协作 AI 员工', who: '对话理解 Agent、知识库 Agent、内容生成 Agent（6699.com）', icon: 'bot' },
      { role: '兜底人工', who: '复杂 / 情感场景坐席团队', icon: 'users' },
    ],
    assumptions: ['客户对自助化的接受度在主要区域可达预期迁移率', '知识中枢数据质量满足自助问答要求'],
    constraints: ['不替代复杂投诉与情感场景的人工服务', '须复用现有能力、控制新增工程量', '受算力高峰配额约束'],
    risks: [
      { risk: '区域客户自助接受度差异，迁移率不及预期', level: '中', mitig: '分区域灰度，按迁移率梯度放量' },
      { risk: '办理类业务系统接口不稳定', level: '中', mitig: '先只读查询、再写办理；接口降级即兜底转人工' },
      { risk: '知识覆盖不足导致答非所问', level: '低', mitig: '低置信即转人工，并回流补充知识' },
    ],
    success: ['客户自助完成率 ≥ 70% 且稳定 4 周', '人工工单量同比下降 ≥ 30%', '自助满意度不低于人工基线'],
    dependencies: ['依赖「客服知识中枢重构」项目的知识底座', '依赖 6699.com 对话 / 知识类 AI 员工接口可用', '实际人力 / 采购预算在执行阶段按大额成本审批逐笔释放'],
    aiNote: 'AI 综合战略契合度（A）、市场机会（A-）与预期收益（A-），备选池综合评分 88 ≥ 80 门槛，直接自动立项；预估成本属未实际发生的测算、不作为立项卡点。立项材料、事实数据与本结论已全部写入留痕，管理层可事后异步 review 或发起反馈。',
  },
  pricing: {
    meta: { portfolio: '增长与营销', owner: '林越', mode: 'AI 自治', source: 'CAND-0051', score: 83, threshold: 80, date: '2026-06-02' },
    background: '增长重心要求更弹性的定价能力，但当前定价调整依赖人工经验、缺乏可灰度验证的试验环境，迭代慢且风险不可控。该候选综合评分 83 达门槛，由 AI 自动立项。',
    purpose: '搭建可灰度、可回滚的智能定价试验台，支持策略并行试验与效果归因，向业务侧输出可解释的定价建议。',
    objectives: [
      { goal: '定价策略迭代周期', baseline: '约 3 周', target: '< 5 天', src: 'internal' },
      { goal: '策略命中率', baseline: '—', target: '提升 ≥ 20%', src: 'industry' },
    ],
    startpoint: '已有交易与转化数据，但无统一试验框架；定价变更缺少灰度与回滚机制。',
    scope: {
      in: ['灰度 / 回滚的定价试验框架', '策略并行试验与效果归因', '可解释定价建议输出'],
      out: ['最终定价决策权（仍在业务侧）', '跨区域价格合规审查'],
    },
    deliverables: ['定价试验台（灰度 + 回滚）', '效果归因看板', '可解释定价建议 API'],
    milestones: [
      { phase: 'M1 · 数据与框架', when: '第 1–4 周', desc: '打通交易数据，搭建试验框架' },
      { phase: 'M2 · 灰度试验', when: '第 5–8 周', desc: '小流量灰度与效果归因验证' },
      { phase: 'M3 · 建议输出', when: '第 9–12 周', desc: '输出可解释建议并接入业务侧' },
    ],
    cost: {
      items: [
        { k: '试验平台研发算力', v: '¥320,000', tag: '算力' },
        { k: '数据工程人力', v: '¥260,000', tag: '人力' },
      ],
      total: '¥580,000', gate: false,
      gateNote: '该金额为 AI 立项阶段的预估测算、尚未实际发生，立项不设成本阈值卡点，AI 直接完成立项；实际支出将在执行阶段按大额成本审批把关。',
    },
    stakeholders: [
      { role: '项目集负责人', who: '林越 · 增长与营销', icon: 'user' },
      { role: '立项发起', who: 'AI 自动立项', icon: 'bot' },
      { role: '协作 AI 员工', who: '数据接入 Agent、定价策略 Agent（6699.com）', icon: 'bot' },
    ],
    assumptions: ['历史交易数据足以支撑灰度归因', '业务侧愿意采用 AI 定价建议'],
    constraints: ['不直接对外改价，仅输出建议', '受合规与价格管控约束'],
    risks: [
      { risk: '灰度样本不足导致归因偏差', level: '中', mitig: '扩大灰度窗口、引入对照组' },
      { risk: '策略被业务侧弃用', level: '低', mitig: '强化可解释性与业务共建' },
    ],
    success: ['定价迭代周期 < 5 天', '灰度策略命中率提升 ≥ 20%'],
    dependencies: ['依赖交易 / 转化数据源', '依赖 6699.com 数据 / 策略类 AI 员工'],
    aiNote: 'AI 综合战略契合度与市场机会判定达门槛，自动立项；分析过程与结论已写入留痕。',
  },
  churn: {
    meta: { portfolio: '增长与营销', owner: '苏婧', mode: 'AI 自治', source: 'CAND-0019', score: 85, threshold: 80, date: '2026-05-20' },
    background: '高价值会员流失缺乏前置信号，挽回动作普遍滞后。该候选达门槛后由 AI 自动立项，现已写入目标层。',
    purpose: '基于行为与交易序列构建会员流失预警模型，输出风险分层与建议动作，把挽回从事后补救前移到事前干预。',
    objectives: [
      { goal: '流失识别提前量', baseline: '约 7 天', target: '≥ 30 天', src: 'internal' },
      { goal: '高价值会员留存率', baseline: '当前基准', target: '提升 ≥ 8%', src: 'industry' },
    ],
    startpoint: '已有会员行为与交易数据，缺乏统一的流失预警与触达闭环。',
    scope: {
      in: ['流失预警模型与风险分层', '建议动作与会员运营触达对接'],
      out: ['具体营销预算分配', '线下挽回动作'],
    },
    deliverables: ['会员流失预警模型', '风险分层与建议动作', '运营触达对接'],
    milestones: [
      { phase: 'M1 · 数据与建模', when: '第 1–4 周', desc: '特征工程与模型训练' },
      { phase: 'M2 · 触达对接', when: '第 5–8 周', desc: '接入会员运营并验证挽回率' },
    ],
    cost: {
      items: [
        { k: '建模算力', v: '¥180,000', tag: '算力' },
        { k: '数据标注', v: '¥120,000', tag: '人力' },
      ],
      total: '¥300,000', gate: false,
      gateNote: '该金额为立项阶段的预估测算、尚未实际发生，立项不设成本阈值卡点；实际支出将在执行阶段按大额成本审批把关。',
    },
    stakeholders: [
      { role: '项目集负责人', who: '苏婧 · 增长与营销', icon: 'user' },
      { role: '立项发起', who: 'AI 自动立项', icon: 'bot' },
      { role: '协作 AI 员工', who: '数据接入 Agent、风控运营 Agent（6699.com）', icon: 'bot' },
    ],
    assumptions: ['历史流失样本足以训练可用模型'],
    constraints: ['预警仅供运营参考，不自动执行挽回'],
    risks: [
      { risk: '模型误报导致对会员的打扰', level: '中', mitig: '设置置信阈值与触达频控' },
    ],
    success: ['流失识别提前量 ≥ 30 天', '高价值会员留存率提升 ≥ 8%'],
    dependencies: ['依赖会员行为 / 交易数据源'],
    aiNote: '已完成 AI 自动立项并写入目标层，立项留痕可在「规则与留痕」追溯。',
  },
};

const CD_COST_TAG = { '采购': { c: 'var(--info)', bg: 'var(--info-bg)' }, '人力': { c: '#7C5CD6', bg: '#F3EEFB' }, '算力': { c: 'var(--ai)', bg: 'var(--ai-soft)' } };
const CD_RISK_TONE = { '高': { c: 'var(--danger)', bg: 'var(--danger-bg)' }, '中': { c: 'var(--warning)', bg: 'var(--warning-bg)' }, '低': { c: 'var(--success)', bg: 'var(--success-bg)' } };

// CDSec：立项表单的「编号小节」容器（序号 + 图标 + 标题 + 内容）。
function CDSec({ no, title, icon, children }) {
  return (
    <section className="cd-sec">
      <div className="cd-sec-head">
        <span className="cd-sec-no mono">{no}</span>
        <Icon name={icon} size={15} color="var(--blue-primary)" />
        <span className="cd-sec-title">{title}</span>
      </div>
      <div className="cd-sec-body">{children}</div>
    </section>
  );
}

/* CharterDoc — 根据 docKey 渲染一份完整立项表单（15 个编号小节）。
   status='chartered' 时顶部横幅变为「已立项」态。数据取自 CHARTER_DOCS[docKey]。 */
function CharterDoc({ docKey, status }) {
  const d = CHARTER_DOCS[docKey];
  if (!d) return null;
  const chartered = status === 'chartered';
  const met = d.meta.score >= d.meta.threshold;
  return (
    <div className="cd-doc">
      <div className={`cd-banner${chartered ? ' is-done' : ''}`}>
        <Icon name={chartered ? 'circle-check' : 'sparkles'} size={15} color={chartered ? 'var(--success)' : 'var(--ai)'} />
        <span>{chartered
          ? '本项目已由 AI 自动立项并写入目标层，以下为存档于履历留痕的完整立项表单（项目章程）。'
          : '以下为 AI 在立项分析阶段自动生成的完整立项表单（项目章程）：备选池综合评分达 80 分即自动触发立项、无需人工审批；表单已完整归档于履历留痕，可随时查看与调整。'}</span>
      </div>

      <CDSec no="01" title="立项概要" icon="file-badge">
        <div className="cd-meta-grid">
          <div className="cd-meta-item"><span className="cd-meta-k">所属项目集</span><span className="cd-meta-v">{d.meta.portfolio}</span></div>
          <div className="cd-meta-item"><span className="cd-meta-k">项目集负责人</span><span className="cd-meta-v">{d.meta.owner}</span></div>
          <div className="cd-meta-item"><span className="cd-meta-k">来源候选</span><span className="cd-meta-v mono">{d.meta.source}</span></div>
          <div className="cd-meta-item"><span className="cd-meta-k">综合评分 / 门槛</span><span className="cd-meta-v"><b style={{ color: met ? 'var(--success)' : 'var(--text-900)' }}>{d.meta.score}</b> / {d.meta.threshold}</span></div>
          <div className="cd-meta-item"><span className="cd-meta-k">运行模式</span><span className="cd-meta-v">{d.meta.mode}</span></div>
          <div className="cd-meta-item"><span className="cd-meta-k">立项日期</span><span className="cd-meta-v mono">{d.meta.date}</span></div>
        </div>
      </CDSec>

      <CDSec no="02" title="立项背景与缘由" icon="bookmark">
        <p className="cd-para">{d.background}</p>
      </CDSec>

      <CDSec no="03" title="核心价值与目的" icon="gem">
        <p className="cd-para">{d.purpose}</p>
      </CDSec>

      <CDSec no="04" title="项目目标与衡量指标" icon="target">
        <div className="cd-obj-head"><span>目标项</span><span>当前基线</span><span>目标值</span></div>
        {d.objectives.map((o, i) => (
          <div className="cd-obj" key={i}>
            <span className="cd-obj-name">{o.goal}</span>
            <span className="cd-obj-base mono">{o.baseline}</span>
            <span className="cd-obj-target mono">{o.target}</span>
            <span className="src-chip" data-t={o.src} title={o.src === 'industry' ? '行业预估' : '内部数据'}>
              <Icon name={o.src === 'industry' ? 'globe' : 'database'} size={10} color={o.src === 'industry' ? 'var(--info)' : 'var(--text-500)'} />
              {o.src === 'industry' ? '行业预估' : '内部数据'}
            </span>
          </div>
        ))}
      </CDSec>

      <CDSec no="05" title="当前起点与主要阻碍" icon="map-pin">
        <p className="cd-para">{d.startpoint}</p>
      </CDSec>

      <CDSec no="06" title="范围说明" icon="scan-line">
        <div className="cd-scope">
          <div className="cd-scope-col is-in">
            <div className="cd-scope-lab"><Icon name="check" size={13} color="var(--success)" />范围内</div>
            {d.scope.in.map((s, i) => <div className="cd-scope-li" key={i}>{s}</div>)}
          </div>
          <div className="cd-scope-col is-out">
            <div className="cd-scope-lab"><Icon name="x" size={13} color="var(--text-400)" />范围外</div>
            {d.scope.out.map((s, i) => <div className="cd-scope-li" key={i}>{s}</div>)}
          </div>
        </div>
      </CDSec>

      <CDSec no="07" title="关键可交付成果" icon="package">
        <div className="cd-list">
          {d.deliverables.map((s, i) => <div className="cd-li" key={i}><Icon name="check-circle-2" size={14} color="var(--blue-primary)" /><span>{s}</span></div>)}
        </div>
      </CDSec>

      <CDSec no="08" title="里程碑与时间计划" icon="flag">
        <div className="cd-mile">
          {d.milestones.map((m, i) => (
            <div className="cd-mile-row" key={i}>
              <span className="cd-mile-dot" />
              <div className="cd-mile-main">
                <div className="cd-mile-top"><span className="cd-mile-phase">{m.phase}</span><span className="cd-mile-when mono">{m.when}</span></div>
                <div className="cd-mile-desc">{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </CDSec>

      <CDSec no="09" title="资源与成本预估" icon="wallet">
        <div className="cd-cost">
          {d.cost.items.map((c, i) => (
            <div className="cd-cost-row" key={i}>
              <span className="cd-cost-tag" style={{ color: CD_COST_TAG[c.tag].c, background: CD_COST_TAG[c.tag].bg }}>{c.tag}</span>
              <span className="cd-cost-k">{c.k}</span>
              <span className="cd-cost-v mono">{c.v}</span>
            </div>
          ))}
          <div className="cd-cost-row is-total">
            <span className="cd-cost-k">合计预估</span>
            <span className="cd-cost-v mono">{d.cost.total}</span>
          </div>
        </div>
        <div className={`cd-gate${d.cost.gate ? ' is-on' : ''}`}>
          <Icon name={d.cost.gate ? 'flag' : 'circle-check'} size={13} color={d.cost.gate ? 'var(--danger)' : 'var(--success)'} />
          <span>{d.cost.gateNote}</span>
        </div>
      </CDSec>

      <CDSec no="10" title="关键干系人与职责" icon="users">
        <div className="cd-stake">
          {d.stakeholders.map((s, i) => (
            <div className="cd-stake-row" key={i}>
              <span className="cd-stake-ico"><Icon name={s.icon} size={14} color="var(--blue-primary)" /></span>
              <span className="cd-stake-role">{s.role}</span>
              <span className="cd-stake-who">{s.who}</span>
            </div>
          ))}
        </div>
      </CDSec>

      <CDSec no="11" title="假设与约束" icon="ruler">
        <div className="cd-ac">
          <div className="cd-ac-col">
            <div className="cd-ac-lab">关键假设</div>
            {d.assumptions.map((s, i) => <div className="cd-li" key={i}><Icon name="dot" size={14} color="var(--text-400)" /><span>{s}</span></div>)}
          </div>
          <div className="cd-ac-col">
            <div className="cd-ac-lab">主要约束</div>
            {d.constraints.map((s, i) => <div className="cd-li" key={i}><Icon name="dot" size={14} color="var(--text-400)" /><span>{s}</span></div>)}
          </div>
        </div>
      </CDSec>

      <CDSec no="12" title="风险与应对" icon="shield-alert">
        {d.risks.map((r, i) => (
          <div className="cd-risk" key={i}>
            <span className="cd-risk-lvl" style={{ color: CD_RISK_TONE[r.level].c, background: CD_RISK_TONE[r.level].bg }}>{r.level}风险</span>
            <div className="cd-risk-main">
              <div className="cd-risk-txt">{r.risk}</div>
              <div className="cd-risk-mitig"><Icon name="shield-check" size={12} color="var(--success)" />{r.mitig}</div>
            </div>
          </div>
        ))}
      </CDSec>

      <CDSec no="13" title="成功 / 验收标准" icon="circle-check">
        <div className="cd-list">
          {d.success.map((s, i) => <div className="cd-li" key={i}><Icon name="check-circle-2" size={14} color="var(--success)" /><span>{s}</span></div>)}
        </div>
      </CDSec>

      <CDSec no="14" title="依赖关系" icon="git-fork">
        <div className="cd-list">
          {d.dependencies.map((s, i) => <div className="cd-li" key={i}><Icon name="link" size={13} color="var(--text-400)" /><span>{s}</span></div>)}
        </div>
      </CDSec>

      <CDSec no="15" title="AI 立项结论与留痕" icon="sparkles">
        <div className="cd-ai-note"><Icon name="sparkles" size={14} color="var(--ai)" /><p>{d.aiNote}</p></div>
      </CDSec>
    </div>
  );
}

/* Charter — 自动立项页主体。
   状态：loading 加载；tab 立项中/已立项；items 立项中列表；done 已立项；active 当前查看的表单。
   核心交互：「无卡点」自动立项 — 加载完成后的 useEffect 错峰把「立项中」逐个移入「已立项」
     并弹 Toast。charterNow 为手动立即立项。⚠ setTimeout 为演示，真实开发由后端驱动。 */
function Charter() {
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState('pending');
  const [items, setItems] = React.useState(CHARTER_PENDING);
  const [done, setDone] = React.useState(CHARTER_DONE);
  const [active, setActive] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  /* 无卡点：达门槛后 AI 自动把「立项中」项目逐个完成立项并写入目标层 */
  React.useEffect(() => {
    if (loading) return;
    const timers = [];
    CHARTER_PENDING.forEach((item, idx) => {
      timers.push(setTimeout(() => {
        setItems(prev => prev.filter(i => i.id !== item.id));
        const newId = item.id.replace('PRJ-PENDING-', 'PRJ-2026-01');
        setDone(prev => prev.some(d => d.id === newId) ? prev : [{ ...item, id: newId, status: 'chartered' }, ...prev]);
        setToast({ msg: `「${item.name}」AI 自动立项完成 · 已写入目标层`, action: '进入目标树' });
      }, 1500 + idx * 1700));
    });
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const charterNow = (item) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    const newId = item.id.replace('PRJ-PENDING-', 'PRJ-2026-01');
    const moved = { ...item, id: newId, status: 'chartered' };
    setDone(prev => [moved, ...prev]);
    setActive(null);
    setToast({ msg: `「${item.name}」AI 自动立项完成 · 已写入目标层`, action: '进入目标树' });
    setTab('chartered');
  };

  const list = tab === 'pending' ? items : done;

  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: '项目管理工作台' }, { label: '自动立项' }]} />
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico"><Icon name="clipboard-check" size={22} color="var(--blue-primary)" /></span>
          <div>
            <h1 className="t-h1">自动立项</h1>
          </div>
        </div>
        <div className="page-head-right">
          <FeedbackEntry
            context={{ scene: '自动立项', did: `当前有 ${items.length} 个达门槛的备选项目，AI 正自动发起并完成立项，并把完整立项表单写入目标层`, ask: '某个项目的立项判断或立项表单内容' }}
            onClick={() => setToast({ msg: '异步反馈入口已打开（演示）' })} />
        </div>
      </div>

      <div className="ch-tabs">
        <button className="ch-tab" data-on={tab === 'pending'} onClick={() => setTab('pending')}>
          <Icon name="loader" size={15} color={tab === 'pending' ? 'var(--text-900)' : 'var(--text-500)'} />立项中<span className="ch-tab-n">{items.length}</span>
        </button>
        <button className="ch-tab" data-on={tab === 'chartered'} onClick={() => setTab('chartered')}>
          <Icon name="circle-check" size={15} color={tab === 'chartered' ? 'var(--text-900)' : 'var(--text-500)'} />已立项<span className="ch-tab-n">{done.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="ch-rows">{[0,1].map(i => <ChSkel key={i} />)}</div>
      ) : list.length === 0 ? (
        <Card><EmptyState glyph={tab === 'pending' ? 'clipboard-list' : 'package-check'} title={tab === 'pending' ? '暂无立项中的项目' : '尚无已立项项目'} desc={tab === 'pending' ? '备选池中综合评分达 80 分的项目会自动立项并直接写入目标层，无需人工卡点。' : '完成立项的项目将出现在此，并已写入目标层。'} /></Card>
      ) : (
        <div className="ch-rows">
          {list.map(item => {
            const chartered = item.status === 'chartered';
            return (
              <button className="ch-row" key={item.id} onClick={() => setActive(item)}>
                <span className="ch-row-ico"><Icon name="clipboard-check" size={18} color="var(--blue-primary)" /></span>
                <div className="ch-row-main">
                  <div className="ch-row-name">{item.name}</div>
                  <div className="ch-row-meta"><span className="mono">{item.id}</span> · {item.portfolio} · 源自 {item.from}</div>
                </div>
                <span className="ch-row-score">综合评分 <b className="mono">{item.score}</b></span>
                <span className="ch-row-status" data-done={chartered}>
                  <Icon name={chartered ? 'circle-check' : 'loader'} size={12} color={chartered ? 'var(--success)' : 'var(--ai)'} />
                  {chartered ? '已立项' : '立项中 · 自动写入目标层'}
                </span>
                <Icon name="chevron-right" size={16} color="var(--text-400)" />
              </button>
            );
          })}
        </div>
      )}

      <Drawer
        open={!!active}
        onClose={() => setActive(null)}
        width={760}
        icon={active ? { name: 'clipboard-check' } : null}
        title={active ? active.name : ''}
        sub={active ? `${active.id} · ${active.portfolio} · 立项表单` : ''}
        headRight={active && (
          <FeedbackEntry label="反馈"
            context={{ scene: '自动立项 · 立项表单', did: `当前查看「${active.name}」的完整立项表单（背景、目标、范围、里程碑、成本、风险等）`, ask: '立项表单中的某一项（如目标、范围、成本或风险判断）' }}
            onClick={() => {}} />
        )}
      >
        {active && <CharterDoc docKey={active.key} status={active.status} />}
      </Drawer>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

function ChSkel() {
  return (
    <div className="ch-row" style={{ cursor: 'default' }}>
      <Skel w={36} h={36} r={8} />
      <div style={{ flex: 1 }}><Skel w={180} h={15} /><Skel w={240} h={12} style={{ marginTop: 8 }} /></div>
      <Skel w={90} h={14} />
      <Skel w={96} h={22} r={999} />
    </div>
  );
}

/* ====== 2.4 · 大额成本审批（成本类唯一人工闸门 · 门槛 ≥ 50 万）======
   COST_THRESHOLD 门槛金额；COST_ITEMS 待审批的大额成本（含 AI 建议 aiTone：pass 建议批 / caution 提醒）。 */
const COST_THRESHOLD = 500000;

const COST_ITEMS = [
  { id: 'c2', project: '智能履约调度中台', pid: 'PRJ-2026-0137', type: '采购', amount: 1820000, waited: '1h 05m', from: '执行事务', fromDetail: '事务 T-0291 · 路况源选型',
    ai: '第三方地图路况 API 三年授权，单价低于基准约 8%，口径合规，建议批准。', aiTone: 'pass',
    breakdown: [ { k: '路况 API 三年授权', v: 1560000 }, { k: '高并发配额扩容', v: 260000 } ],
    rel: { goal: '中短期目标：调度时效提升 30%', task: '事务 T-0291 · 路况源选型' } },
  { id: 'c3', project: '区域运力预测引擎', pid: 'PRJ-2026-0151', type: '采购', amount: 1250000, waited: '4h 38m', from: '执行事务', fromDetail: '事务 T-0312 · 算力扩容',
    ai: '推理算力扩容方案 ROI 边际偏低，建议先按 60% 规模采购、验证后再追加。', aiTone: 'caution',
    breakdown: [ { k: 'GPU 推理集群扩容', v: 980000 }, { k: '存储与带宽', v: 270000 } ],
    rel: { goal: '阶段目标：履约时效 < 4h', task: '事务 T-0312 · 算力扩容' } },
  { id: 'c5', project: '营销内容生成平台', pid: 'PRJ-2026-0144', type: '人力', amount: 680000, waited: '11h 02m', from: '执行事务', fromDetail: '事务 T-0490 · 高峰人力',
    ai: '高峰时段创意人力扩充属临时性投入，回收周期约 8 周偏长，建议压缩规模或驳回。', aiTone: 'caution',
    breakdown: [ { k: '创意人力外包（高峰）', v: 520000 }, { k: '质量审核', v: 160000 } ],
    rel: { goal: '周目标：内容产出 200 篇 / 周', task: '事务 T-0490 · 高峰人力' } },
];

/* CostApproval — 大额成本审批页主体。
   状态：loading；items 待审列表；active 当前抽屉项。dispose 批准/驳回后从列表移除并写留痕。
   注：本系统不付款，批准仅解除成本卡点，实际付款在外部财务系统。 */
function CostApproval({ onNavigate }) {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState(COST_ITEMS);
  const [active, setActive] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const totalPending = items.reduce((s, i) => s + i.amount, 0);
  const procureN = items.filter(i => i.type === '采购').length;
  const laborN = items.filter(i => i.type === '人力').length;

  const dispose = (item, action, reason) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    setActive(null);
    setToast({ msg: `已${action === 'approve' ? '批准' : '驳回'}「${item.project}」大额成本 · 已写入留痕`, action: '查看留痕', onAction: () => { setToast(null); onNavigate && onNavigate('rules'); } });
  };

  const fmt = (n) => '¥' + n.toLocaleString('en-US');

  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: '项目管理工作台' }, { label: '介入工作台' }, { label: '大额成本审批' }]} />
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico" style={{ background: 'var(--danger-bg)' }}><Icon name="wallet" size={22} color="var(--danger)" /></span>
          <div>
            <h1 className="t-h1">大额成本审批</h1>
          </div>
        </div>
        <div className="page-head-right">
          <span className="src-badge" style={{ background: 'var(--danger-bg)', borderColor: '#F4C7C8', color: 'var(--danger)' }}><Icon name="flag" size={14} color="var(--danger)" />门槛参考 ≥ 50 万</span>
        </div>
      </div>

      {/* 概览指标 */}
      <div className="ca-stats">
        <div className="ca-stat">
          <div className="ca-stat-label"><Icon name="inbox" size={13} color="var(--text-400)" />待审批笔数</div>
          <div className="ca-stat-val">{loading ? '—' : items.length}</div>
          <div className="ca-stat-sub">需管理层拍板</div>
        </div>
        <div className="ca-stat">
          <div className="ca-stat-label"><Icon name="sigma" size={13} color="var(--text-400)" />待审批总额</div>
          <div className="ca-stat-val danger">{loading ? '—' : fmt(totalPending)}</div>
          <div className="ca-stat-sub">均超 50 万门槛</div>
        </div>
        <div className="ca-stat">
          <div className="ca-stat-label"><Icon name="shopping-cart" size={13} color="var(--text-400)" />对外采购</div>
          <div className="ca-stat-val">{loading ? '—' : procureN}</div>
          <div className="ca-stat-sub">笔</div>
        </div>
        <div className="ca-stat">
          <div className="ca-stat-label"><Icon name="users" size={13} color="var(--text-400)" />大量人力</div>
          <div className="ca-stat-val">{loading ? '—' : laborN}</div>
          <div className="ca-stat-sub">笔</div>
        </div>
      </div>

      <div className="ca-disclaimer">
        <Icon name="info" size={15} color="var(--text-400)" />
        仅对执行阶段实际发生的大额采购 / 人力成本做拍板与留痕；立项阶段的预估金额为未实际发生的测算，不再进入本队列。本系统不付款，真正的预算 / 财务执行在外部系统完成。
      </div>

      {loading ? (
        <div className="ca-list">{[0,1,2].map(i => <CaSkel key={i} />)}</div>
      ) : items.length === 0 ? (
        <Card><EmptyState glyph="circle-check" title="当前无待审批的大额成本" desc="没有超过 50 万门槛的对外采购或大量人力投入待拍板，成本闸门顺畅。" action={<span className="pill" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><span className="dot" style={{ background: 'var(--success)' }} />闸门顺畅</span>} /></Card>
      ) : (
        <div className="ca-list">
          {items.map(item => (
            <button key={item.id} className="ca-card" onClick={() => setActive(item)}>
              <span className="ca-card-bar" />
              <div className="ca-card-main">
                <div className="ca-card-top">
                  <span className="ca-card-proj">{item.project}</span>
                  <span className="ca-card-id">{item.pid}</span>
                  <span className="ca-cost-type" data-t={item.type}>
                    <Icon name={item.type === '采购' ? 'shopping-cart' : 'users'} size={12} color={item.type === '采购' ? 'var(--info)' : '#7C5CD6'} />
                    {item.type === '采购' ? '对外采购' : '大量人力'}
                  </span>
                  <span className="ca-trigger"><Icon name={item.from === '立项' ? 'clipboard-check' : 'square-check-big'} size={12} color="var(--text-400)" />触发自{item.from} · {item.fromDetail}</span>
                </div>
                <div className="ca-card-ai">
                  <Icon name="sparkles" size={14} color="var(--ai)" />
                  <span className="ca-card-ai-label">AI {item.aiTone === 'pass' ? '建议' : '提示'}</span>
                  {item.ai}
                </div>
              </div>
              <div className="ca-card-right">
                <span className="ca-amount">{fmt(item.amount)}</span>
                <span className="ca-over"><Icon name="trending-up" size={12} color="var(--danger)" />超门槛 {(item.amount / COST_THRESHOLD).toFixed(1)}×</span>
                <span className="ca-waited">已等待 {item.waited}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <Drawer
        open={!!active}
        onClose={() => setActive(null)}
        width={500}
        icon={active ? { name: 'wallet', color: 'var(--danger)' } : null}
        title={active ? active.project : ''}
        sub={active ? active.pid : ''}
        headRight={active && <FeedbackEntry label="反馈" onClick={() => {}} />}
      >
        {active && <CostDisposal item={active} fmt={fmt} onDispose={dispose} />}
      </Drawer>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

/* CostDisposal — 大额成本的抽屉处置体（批准/驳回的二步确认状态机）。
   mode: null 初始 → 点「批准」变 approve（再点才 commit）/ 点「驳回」变 reject（必填理由才 commit）。
   commit 调 onDispose(item, mode, reason)。 */
function CostDisposal({ item, fmt, onDispose }) {
  const [mode, setMode] = React.useState(null); // null | approve（待确认批准）| reject（待填理由驳回）
  const [reason, setReason] = React.useState('');
  const commit = () => {
    if (mode === 'reject' && !reason.trim()) return;
    onDispose(item, mode, reason.trim());
  };
  return (
    <>
      <div className="ca-d-amount">
        <div className="ca-d-amount-main">
          <div className="lbl">估算金额 · 超 50 万门槛</div>
          <div className="val">{fmt(item.amount)}</div>
        </div>
        <span className="ca-cost-type" data-t={item.type} style={{ alignSelf: 'flex-start' }}>
          <Icon name={item.type === '采购' ? 'shopping-cart' : 'users'} size={12} color={item.type === '采购' ? 'var(--info)' : '#7C5CD6'} />
          {item.type === '采购' ? '对外采购' : '大量人力'}
        </span>
      </div>

      <div className="disp-sec-label t-label-caps">成本明细</div>
      <div className="ca-d-breakdown">
        {item.breakdown.map((b, i) => (
          <div className="ca-d-brow" key={i}>
            <span className="k">{b.k}</span>
            <span className="v">{fmt(b.v)}</span>
          </div>
        ))}
        <div className="ca-d-brow total">
          <span className="k">合计</span>
          <span className="v">{fmt(item.amount)}</span>
        </div>
      </div>

      <div className="disp-sec-label t-label-caps">关联项目 / 事务</div>
      <div className="disp-ctx">
        <div className="disp-ctx-row">
          <Icon name={item.from === '立项' ? 'clipboard-check' : 'square-check-big'} size={16} color="var(--text-400)" />
          <span className="disp-ctx-key t-caption">触发来源</span>
          <span className="disp-ctx-val">{item.from} · {item.fromDetail}</span>
        </div>
        <div className="disp-ctx-row">
          <Icon name="target" size={16} color="var(--text-400)" />
          <span className="disp-ctx-key t-caption">关联目标</span>
          <span className="disp-ctx-val">{item.rel.goal}</span>
        </div>
        <div className="disp-ctx-row">
          <Icon name="square-check-big" size={16} color="var(--text-400)" />
          <span className="disp-ctx-key t-caption">关联事务</span>
          <span className="disp-ctx-val">{item.rel.task}</span>
        </div>
      </div>

      <div className="disp-ai" style={{ background: item.aiTone === 'pass' ? 'var(--ai-soft)' : 'var(--warning-bg)', borderColor: item.aiTone === 'pass' ? '#BEE6F8' : '#F2DDB6' }}>
        <div className="disp-ai-head" style={{ color: item.aiTone === 'pass' ? 'var(--ai)' : 'var(--warning)' }}>
          <Icon name={item.aiTone === 'pass' ? 'sparkles' : 'alert-triangle'} size={16} color={item.aiTone === 'pass' ? 'var(--ai)' : 'var(--warning)'} />
          <span>AI 依据与建议</span>
        </div>
        <p className="disp-ai-body">{item.ai}</p>
      </div>

      {mode === 'reject' && (
        <div className="disp-reason">
          <label className="t-caption" style={{ fontWeight: 500, color: 'var(--text-700)' }}>驳回理由<span style={{ color: 'var(--danger)' }}> *</span></label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="驳回须填写理由，将随处置写入留痕并回到对应执行事务…" autoFocus />
        </div>
      )}

      <div className="ca-disclaimer" style={{ marginTop: 18, marginBottom: 0 }}>
        <Icon name="info" size={14} color="var(--text-400)" />
        本系统不付款；批准仅解除成本卡点，实际付款在外部财务系统执行。
      </div>

      <div className="disp-actions">
        {mode !== 'reject' && <Button variant="primary" icon="check" className={mode === 'approve' ? 'is-armed' : ''} onClick={mode === 'approve' ? commit : () => setMode('approve')}>{mode === 'approve' ? '确认批准' : '批准'}</Button>}
        <Button variant="danger" onClick={mode === 'reject' ? commit : () => setMode('reject')} disabled={mode === 'approve'}>{mode === 'reject' ? '确认驳回' : '驳回（须给理由）'}</Button>
        {mode && <Button variant="text" onClick={() => { setMode(null); setReason(''); }}>取消</Button>}
      </div>
    </>
  );
}

function CaSkel() {
  return (
    <div className="ca-card" style={{ cursor: 'default' }}>
      <span className="ca-card-bar" style={{ background: 'var(--divider)' }} />
      <div className="ca-card-main">
        <div style={{ display: 'flex', gap: 10 }}><Skel w={160} h={15} /><Skel w={110} h={14} /></div>
        <Skel w="85%" h={13} style={{ marginTop: 14 }} />
      </div>
      <div className="ca-card-right" style={{ borderLeft: '1px solid var(--divider)' }}><Skel w={110} h={20} /><Skel w={70} h={12} style={{ marginTop: 8 }} /></div>
    </div>
  );
}

Object.assign(window, { Charter, CostApproval, CharterDoc, CDSec, CHARTER_DOCS });
