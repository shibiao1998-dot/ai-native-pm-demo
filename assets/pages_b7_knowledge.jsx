/* ============================================================
   批 7 · 页面 7.3 · 知识库（经验沉淀 + RAG 赋能）
   两类知识：
   ① 结项经验 —— 项目正常 / 强制结项后沉淀的可复用范式（既有）。
   ② 管理决策经验 —— 管理层在工作台的交互动作背后的逻辑与理由，
      把过去的隐性管理经验（隐性规则）不断显性化为可复用规则。
   两类知识统一通过 RAG 在 AI 执行任务时增强其上下文，赋能整个系统。
   ============================================================ */

/* ---------- ① 结项经验 ---------- */
const KB_ENTRIES = [
  {
    id: 'PRJ-2026-0137', name: '智能履约调度中台', type: 'normal', date: '2026-06-14',
    exp: '以理想化状态为锚自上而下拆解、逐级验收闭环，是中台类项目可复制的范式；外部依赖须早做冗余。',
    tags: ['调度中台', '逐级验收', '外部依赖治理'], borrow: true,
    lessons: [
      '理想化状态 → 中短期 → 阶段 → 周 → 事务的五级拆解，配合自下而上逐级验收，目标不漂移、进度可追溯。',
      '关键外部数据依赖应在立项阶段即要求双源冗余，避免单点联通失败阻断核心目标（本项目曾因此两次卡点）。',
      '灰度放量 + 秒级回滚是高风险算法上线的稳妥范式，可直接复用。',
    ],
    full: ['项目以「履约调度全面智能化、时效与成本双优」为理想化状态立项，历时 11 周达成两条中短期目标与三条阶段目标，理想化状态推进度 92%，正常结项。',
      '关键产出包括智能调度灰度放量框架、异常自愈体系（自愈率 91.4%）、实时路况双源接入方案与一套可复用的中台能力组件。',
      '过程中第三方运力 API 联通连续失败暴露单点依赖风险，触发理想化状态复盘并沉淀「双源冗余」方法论。'],
    meta: { mode: '正常结项', dur: '11 周', cost: '¥318,400', staff: '5 名 AI 员工' },
    sealer: '结项 Agent · 经项目负责人确认', ver: 'v1.1',
    scope: ['中台 / 平台类项目的目标拆解与逐级验收', '存在关键外部数据依赖的项目', '高风险算法上线的灰度放量策略'],
    citedBy: [
      { when: '2026-06-20', main: '立项「智能定价试验台」引用「灰度 + 回滚」范式', tail: '立项' },
      { when: '2026-06-02', main: 'AI 项目负责人内化「双源冗余」方法论 v3.1', tail: '内化' },
      { when: '2026-05-28', main: 'AI 执行官复用异常自愈策略包', tail: '复用' },
    ],
    versions: [
      { act: '结项沉淀 v1.0 · 自动生成', actor: '结项 Agent', when: '2026-06-14', desc: '项目正常结项后由 AI 自动提炼关键经验并入库。' },
      { act: 'v1.1 · 补充双源冗余案例', actor: 'AI 风控官', when: '2026-06-16', desc: '关联两次外部依赖卡点复盘，强化依赖治理条目。' },
    ],
  },
  {
    id: 'PRJ-2026-0151', name: '智能外呼增长助手', type: 'force', date: '2026-06-14',
    exp: '战略收缩导致强制结项，但意向识别与话术合规能力可迁移；强制结项不等于产出归零。',
    tags: ['外呼增长', '强制结项', '能力迁移'], borrow: true,
    lessons: [
      '强制结项时应区分「方向终止」与「能力可迁移」：本项目话术合规引擎与意向识别模型已转入自助服务场景复用。',
      '战略级方向收缩越早触发止损，沉没成本越低；本项目在执行中期触发，避免了号码资源大额采购。',
    ],
    full: ['顶层战略切换为「自助化优先」，主动外呼增长方向收缩，平台被动触发本项目强制结项。',
      'AI 分析当前阶段全部产出后，标注话术引擎与意向识别模型为「可复用」、效果看板为「归档」、线路采购为「终止」，经管理层审批与负责人双重确认后生效。'],
    meta: { mode: '强制结项', dur: '6 周', cost: '¥96,200', staff: '3 名 AI 员工' },
    sealer: '结项 Agent · 经管理层审批 + 负责人确认', ver: 'v1.0',
    scope: ['战略收缩 / 主动止损场景', '含可迁移能力组件的项目强制结项'],
    citedBy: [
      { when: '2026-06-18', main: '话术合规引擎迁移至「智能客服自助引擎」', tail: '迁移' },
    ],
    versions: [
      { act: '强制结项沉淀 v1.0', actor: '结项 Agent', when: '2026-06-14', desc: '强制结项后区分「方向终止 / 能力可迁移」并入库。' },
    ],
  },
  {
    id: 'PRJ-2025-0488', name: '客服知识中枢重构', type: 'normal', date: '2026-03-02',
    exp: '知识库冷启动靠存量工单聚类 + 人审；检索体验决定采纳率，应早做。',
    tags: ['知识中枢', '冷启动', '检索体验'], borrow: true,
    lessons: [
      '知识条目冷启动可由存量工单聚类生成草稿、再经人审定稿，比从零撰写快约 3 倍。',
      '检索召回与排序体验直接决定一线采纳率，应作为阶段目标尽早验收。',
    ],
    full: ['项目重构客服知识中枢，达成知识覆盖率与检索采纳率双目标，正常结项。',
      '沉淀的工单聚类冷启动方法与检索体验规范，已被多个后续项目借鉴。'],
    meta: { mode: '正常结项', dur: '9 周', cost: '¥204,500', staff: '4 名 AI 员工' },
    sealer: '结项 Agent · 经项目负责人确认', ver: 'v1.0',
    scope: ['知识库 / 内容库冷启动', '检索体验优先的项目'],
    citedBy: [
      { when: '2026-05-10', main: '「客服知识中枢重构(0129)」复用工单聚类冷启动', tail: '复用' },
    ],
    versions: [
      { act: '结项沉淀 v1.0', actor: '结项 Agent', when: '2026-03-02', desc: '项目正常结项后由 AI 自动提炼并入库。' },
    ],
  },
];

/* ---------- ② 管理决策经验（隐性 → 显性） ---------- */
const KB_DECISIONS = [
  {
    id: 'DEC-2026-0061', kind: 'decision', date: '2026-06-01',
    rule: '进入执行的目标，必须在拆解阶段即附可量化验收口径',
    scene: '逐环审核', sceneRoute: 'p-accept', who: '张明', whoRole: '高级项目管理',
    relObj: '关联 · AI 项目负责人 / AI 验收官',
    action: '管理层在「逐环审核」中连续三次退回缺少可量化验收口径的目标，并批注：「这种目标到验收时一定各执一词、来回返工。」',
    tacit: '资深管理者凭经验就知道：没有明确验收口径的目标，验收时各方各执一词，最终演变成来回返工和扯皮。这是过去靠人盯、靠经验把关的隐性规则。',
    explicit: '任何进入执行编排的目标，必须在拆解阶段即带可量化的验收口径，否则不予放行。',
    logic: [
      { t: '为什么要这么操作', d: '把"可验收性"从验收末端前移到拆解源头，让分歧在最便宜的阶段（拆解时）暴露并解决，而不是堆到验收时集中爆发。' },
      { t: '背后的逻辑', d: '目标是否达成应当是客观可判定的；只要判定口径在事后才补，就给了主观解释空间，评级一致性必然下降。' },
    ],
    scope: ['目标拆解', '逐级验收', '中台 / 平台类项目', '多方协作目标'],
    usage30: 38,
    rag: [
      { ent: 'AI 项目负责人 · 目标分级拆解', ver: 'v3.2', route: 'ai-staff', how: '拆解时检索本规则，强制每个叶子目标带验收口径，否则不允许进入执行编排。', hits: 24 },
      { ent: 'AI 验收官 · 逐环审核', ver: 'v4.1', route: 'ai-staff', how: '验收时以本规则作为评级前置校验，缺口径直接判待补。', hits: 14 },
    ],
    versions: [
      { act: '从一次管理决策显性化为可复用规则', actor: '知识库 Agent', when: '2026-06-01', desc: '系统捕获管理层在逐环审核中的退回动作与批注，提炼为显性规则并入库。' },
      { act: 'v1.1 · 适用范围扩展至多方协作目标', actor: '知识库 Agent', when: '2026-06-02', desc: '据后续两次同类退回，扩展规则适用范围。' },
    ],
    ver: 'v1.1',
  },
  {
    id: 'DEC-2026-0058', kind: 'decision', date: '2026-05-25',
    rule: '风险分级须结合趋势：短时波动降权，仅持续恶化才升级越报',
    scene: '规则与留痕', sceneRoute: 'rules', who: '王彬', whoRole: '风控负责人',
    relObj: '关联 · AI 风控官',
    action: '管理层反馈「关注级预警过多、淹没了真实风险」，并手动下调了 AI 风控官的关注级触发敏感度。',
    tacit: '老风控凭直觉知道：频繁报警会让人麻木，真正的大风险反而被噪声淹没。何时该报、何时该忍，是多年盯盘攒出来的手感。',
    explicit: '风险分级不看单点瞬时值，须结合同类风险历史趋势：短时波动降权处理，只有持续恶化的风险才升级并越级上报。',
    logic: [
      { t: '为什么要这么操作', d: '预警的价值在于信噪比。把每个波动都升级，等于没有预警；管理层注意力是稀缺资源，必须留给真正持续恶化的信号。' },
      { t: '背后的逻辑', d: '风险是过程量而非瞬时量，趋势比单点更能反映真实恶化；"狼来了"会系统性损害预警的可信度。' },
    ],
    scope: ['风险分级', '全局留痕审计', '越级上报阈值设定'],
    usage30: 52,
    rag: [
      { ent: 'AI 风控官 · 风险分级', ver: 'v2.3', route: 'ai-staff', how: '分级时检索本规则，引入趋势预测对短时波动降权，仅持续恶化才升级。', hits: 52 },
    ],
    versions: [
      { act: '从一次阈值调整显性化为分级规则', actor: '知识库 Agent', when: '2026-05-25', desc: '系统捕获管理层对关注级敏感度的下调动作与理由，提炼为显性规则。' },
    ],
    ver: 'v1.0',
  },
  {
    id: 'DEC-2026-0047', kind: 'decision', date: '2026-05-12',
    rule: '强制结项须对能力组件做"可迁移性"标注，不等于产出归零',
    scene: '结项', sceneRoute: 'knowledge', who: '李航', whoRole: '管理层',
    relObj: '关联 · 结项 Agent / 立项',
    action: '在一次战略收缩触发的强制结项中，管理层没有简单作废项目，而是要求逐一标注哪些能力组件可迁移复用。',
    tacit: '有经验的管理者不会把"方向砍掉"等同于"全部白做"——他们本能地会去项目残值里翻可复用的东西。这种"翻残值"的意识是隐性的。',
    explicit: '强制结项时，须对项目已沉淀的能力组件逐一做"可迁移 / 归档 / 终止"三态标注，可迁移部分转入复用池，避免产出归零。',
    logic: [
      { t: '为什么要这么操作', d: '方向终止是战略判断，能力价值是资产判断，两者必须分开评估；否则一次战略调整会连带浪费大量可复用资产。' },
      { t: '背后的逻辑', d: '能力组件的价值独立于其首次所在的项目方向；显式区分"方向终止"与"能力可迁移"才能让沉没成本最小化。' },
    ],
    scope: ['强制结项 / 主动止损', '含可迁移能力组件的项目', '战略收缩场景'],
    usage30: 9,
    rag: [
      { ent: '结项 Agent · 强制结项归纳', ver: 'v2.0', route: null, how: '强制结项时检索本规则，自动对能力组件做三态标注并生成迁移建议。', hits: 6 },
      { ent: 'AI 战略分析师 · 机会方向识别', ver: 'v2.1', route: 'ai-staff', how: '识别新机会时优先检索复用池中的可迁移能力，发挥自有壁垒。', hits: 3 },
    ],
    versions: [
      { act: '从一次强制结项决策显性化为规则', actor: '知识库 Agent', when: '2026-05-12', desc: '系统捕获管理层的能力标注动作与理由，提炼为显性规则。' },
    ],
    ver: 'v1.0',
  },
  {
    id: 'DEC-2026-0072', kind: 'decision', date: '2026-06-02',
    rule: '高风险算法上线必须灰度放量 + 可秒级回滚',
    scene: '介入工作台', sceneRoute: 'intervene', who: '王彬', whoRole: '风控负责人',
    relObj: '关联 · AI 执行官',
    action: '管理层在一次算法上线介入中，要求执行编排必须配套灰度比例与秒级回滚开关后才放行。',
    tacit: '踩过线上事故的管理者都知道：再有把握的算法也要留后路。全量直上、出事再修，是用线上当测试环境——这是用代价换来的教训。',
    explicit: '任何高风险算法上线，执行编排须默认配套灰度放量与可秒级回滚的开关，不具备回滚能力的不予放行。',
    logic: [
      { t: '为什么要这么操作', d: '把不可逆的全量风险，换成可控、可回退的小步风险；事故的代价远高于灰度带来的少量速度损失。' },
      { t: '背后的逻辑', d: '线上系统的第一性原则是可恢复；上线动作的风险敞口应当始终被回滚能力兜住。' },
    ],
    scope: ['高风险算法上线', '执行编排', '灰度放量策略'],
    usage30: 16,
    rag: [
      { ent: 'AI 执行官 · 事务编排', ver: 'v5.4', route: 'ai-staff', how: '编排上线类事务时检索本规则，自动插入灰度与回滚步骤，缺回滚能力则阻断。', hits: 16 },
    ],
    versions: [
      { act: '从一次上线介入显性化为规则', actor: '知识库 Agent', when: '2026-06-02', desc: '系统捕获管理层的放行条件与理由，提炼为显性规则。' },
    ],
    ver: 'v1.0',
  },
];

const KB_CATS = [
  { id: 'all', label: '全部' },
  { id: 'decision', label: '管理决策经验' },
  { id: 'closure', label: '结项经验' },
];
const KB_TYPE = {
  normal: { label: '正常结项', icon: 'package-check', c: 'var(--closure)', bg: 'var(--closure-bg)' },
  force:  { label: '强制结项', icon: 'octagon-alert', c: 'var(--danger)', bg: 'var(--danger-bg)' },
};

/* ============================================================
   抽屉 A · 结项经验详情（既有）
   ============================================================ */
function KnowledgeDrawer({ entry, onClose, onNavigate, onToast }) {
  const ty = entry ? KB_TYPE[entry.type] : null;
  return (
    <Drawer open={!!entry} onClose={onClose} width={620}
      title={entry ? entry.name : ''} sub={entry ? `${entry.id} · 结项经验 · 知识详情` : ''}
      icon={entry ? { name: ty.icon, color: ty.c } : null}
      headRight={entry && (
        <FeedbackEntry label="反馈"
          context={{ scene: '知识库 · 结项经验', did: `当前查看「${entry.name}」的结项沉淀知识（来源、适用范围、引用与版本）`, ask: '这条知识的某个结论、适用范围或引用情况' }}
          onClick={() => {}} />
      )}
      footer={entry && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="t-micro" style={{ color: 'var(--text-400)', flex: 1 }}>{entry.borrow ? '本条已标记「立项时可借鉴」。' : '本条暂未标记为立项可借鉴。'}</span>
          <Button variant="primary" icon="clipboard-check" onClick={() => onNavigate && onNavigate('charter')}>立项时引用借鉴</Button>
        </div>
      )}>
      {entry && (
        <DocDoc>
          <DocBanner tone="success" icon="bookmark-check">
            该项目{entry.meta.mode}后，结项成果已沉淀为可检索的数据资产，供后续检索、新项目立项借鉴，并通过 RAG 赋能 AI 执行。
          </DocBanner>

          <DocSec no="01" title="知识概要 · 来源" icon="file-badge">
            <DocMeta items={[
              { k: '来源项目', v: <span className="mono">{entry.id}</span> },
              { k: '结项类型', v: <span style={{ color: ty.c, fontWeight: 600 }}>{entry.meta.mode}</span> },
              { k: '沉淀时间', v: <span className="mono">{entry.date}</span> },
              { k: '当前版本', v: <span className="mono">{entry.ver}</span> },
              { k: '项目周期', v: entry.meta.dur },
              { k: '累计成本', v: <span className="mono">{entry.meta.cost}</span> },
              { k: '参与 AI', v: entry.meta.staff },
              { k: '入库方', v: entry.sealer },
            ]} />
          </DocSec>

          <DocSec no="02" title="关键经验提炼" icon="lightbulb">
            <DocList items={entry.lessons} icon="check-circle-2" tone="success" />
          </DocSec>

          <DocSec no="03" title="适用范围" icon="scan-line">
            <DocTags tags={entry.scope} />
            <p className="t-micro" style={{ color: 'var(--text-400)', marginTop: 10 }}>
              <Icon name="info" size={12} color="var(--text-400)" style={{ verticalAlign: '-2px', marginRight: 4 }} />
              新项目立项或 AI 执行任务时，会按上述适用范围自动检索并增强上下文。
            </p>
          </DocSec>

          <DocSec no="04" title="结项材料全文" icon="file-text">
            {entry.full.map((p, i) => <DocPara key={i}>{p}</DocPara>)}
          </DocSec>

          <DocSec no="05" title="引用情况" icon="quote">
            {entry.citedBy && entry.citedBy.length > 0 ? (
              <DocLog rows={entry.citedBy} />
            ) : (
              <p className="cd-para" style={{ color: 'var(--text-400)' }}>尚未被其他项目或 AI 员工引用。</p>
            )}
          </DocSec>

          <DocSec no="06" title="版本历史" icon="git-commit-horizontal">
            <DocChain items={entry.versions.map(v => ({ act: v.act, actor: v.actor, when: v.when, desc: v.desc, ai: true }))} />
          </DocSec>
        </DocDoc>
      )}
    </Drawer>
  );
}

/* ============================================================
   抽屉 B · 管理决策经验详情（隐性 → 显性 + RAG 赋能）
   ============================================================ */
function DecisionDrawer({ entry, onClose, onNavigate }) {
  return (
    <Drawer open={!!entry} onClose={onClose} width={640}
      title={entry ? entry.rule : ''} sub={entry ? `${entry.id} · 管理决策经验 · 隐性规则显性化` : ''}
      icon={entry ? { name: 'lightbulb', color: 'var(--blue-primary)' } : null}
      headRight={entry && (
        <FeedbackEntry label="反馈"
          context={{ scene: '知识库 · 管理决策经验', did: `当前查看一条由管理层动作显性化而来的规则「${entry.rule}」（含背后逻辑与 RAG 赋能）`, ask: '这条规则的逻辑、适用范围或希望如何调整' }}
          onClick={() => {}} />
      )}
      footer={entry && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="t-micro" style={{ color: 'var(--text-400)', flex: 1 }}>该规则正通过 RAG 赋能 {entry.rag.length} 个 AI 技能 · 近 30 日调用 {entry.usage30} 次。</span>
          {entry.rag.some(r => r.route) && <Button variant="primary" icon="bot" onClick={() => onNavigate && onNavigate('ai-staff')}>查看被赋能的 AI 员工</Button>}
        </div>
      )}>
      {entry && (
        <DocDoc>
          <DocBanner tone="ai" icon="sparkles">
            这条知识来自管理层在工作台的一次决策动作。系统把动作背后的隐性经验显性化为可复用规则，并通过 RAG 在 AI 执行任务时增强其上下文 —— 让过去靠人盯的管理经验，沉淀为整个系统的能力。
          </DocBanner>

          <DocSec no="01" title="决策来源" icon="file-badge">
            <DocMeta items={[
              { k: '动作场景', v: entry.scene },
              { k: '操作人', v: <b>{entry.who}</b> },
              { k: '角色', v: entry.whoRole },
              { k: '发生时间', v: <span className="mono">{entry.date}</span> },
              { k: '关联对象', v: entry.relObj },
              { k: '当前版本', v: <span className="mono">{entry.ver}</span> },
            ]} />
          </DocSec>

          <DocSec no="02" title="当时的动作" icon="mouse-pointer-click">
            <DocPara>{entry.action}</DocPara>
          </DocSec>

          <DocSec no="03" title="隐性经验 → 显性规则" icon="arrow-right-left">
            <div className="kb-transform">
              <div className="kb-tf-col tacit">
                <div className="kb-tf-k"><Icon name="brain" size={12} color="var(--text-400)" />隐性经验</div>
                <div className="kb-tf-txt">{entry.tacit}</div>
              </div>
              <div className="kb-tf-arrow"><Icon name="arrow-right" size={16} color="var(--blue-primary)" /></div>
              <div className="kb-tf-col explicit">
                <div className="kb-tf-k"><Icon name="scan-text" size={12} color="var(--blue-primary)" />显性规则</div>
                <div className="kb-tf-txt">{entry.explicit}</div>
              </div>
            </div>
          </DocSec>

          <DocSec no="04" title="背后的逻辑 · 为什么这么做" icon="git-branch-plus">
            <div className="kb-logic">
              {entry.logic.map((l, i) => (
                <div className="kb-logic-row" key={i}>
                  <span className="kb-logic-no">{i + 1}</span>
                  <div className="kb-logic-main">
                    <div className="kb-logic-t">{l.t}</div>
                    <div className="kb-logic-d">{l.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </DocSec>

          <DocSec no="05" title="显性化规则" icon="badge-check">
            <div className="kb-rule">
              <span className="kb-rule-ico"><Icon name="scan-text" size={20} color="var(--blue-primary)" /></span>
              <div>
                <div className="kb-rule-txt">{entry.explicit}</div>
                <div className="kb-rule-sub">已作为可复用规则入库，参与 RAG 检索增强。</div>
              </div>
            </div>
          </DocSec>

          <DocSec no="06" title="适用范围" icon="scan-line">
            <DocTags tags={entry.scope} />
          </DocSec>

          <DocSec no="07" title="RAG 赋能 · 增强了哪些 AI" icon="bot">
            <div className="kb-ragnote">
              <Icon name="zap" size={14} color="var(--ai)" />
              <span>AI 执行任务时，会按适用范围把本规则作为上下文检索增强（RAG）注入对应技能，使其判断与公司既定理解一致。近 30 日共被调用 <b className="mono">{entry.usage30}</b> 次。</span>
            </div>
            <div className="kb-rag">
              {entry.rag.map((r, i) => (
                <div className="kb-rag-row" key={i}>
                  <span className="kb-rag-ico"><Icon name="puzzle" size={16} color="var(--ai)" /></span>
                  <div className="kb-rag-main">
                    <div className="kb-rag-ent">{r.ent}<span className="kb-rag-ver">{r.ver}</span></div>
                    <div className="kb-rag-how">{r.how}</div>
                  </div>
                  <span className="kb-rag-hits">{r.hits} 次</span>
                </div>
              ))}
            </div>
          </DocSec>

          <DocSec no="08" title="沉淀历史" icon="git-commit-horizontal">
            <DocChain items={entry.versions.map(v => ({ act: v.act, actor: v.actor, when: v.when, desc: v.desc, ai: true }))} />
          </DocSec>
        </DocDoc>
      )}
    </Drawer>
  );
}

/* ============================================================
   7.3 知识库内容体（组合级治理 & 项目结项页复用）
   ============================================================ */
function KnowledgeBase({ loading, onNavigate, onToast }) {
  const [q, setQ] = React.useState('');
  const [cat, setCat] = React.useState('all');
  const [active, setActive] = React.useState(null);       // 结项经验
  const [activeDec, setActiveDec] = React.useState(null); // 管理决策经验
  React.useEffect(() => { refreshIcons(); });

  if (loading) {
    return (
      <>
        <Skel w="100%" h={74} r={12} style={{ marginBottom: 16 }} />
        <div className="kb-toolbar"><Skel w="60%" h={40} r={10} /><Skel w={240} h={36} r={8} /></div>
        <div className="kb-grid">{[0, 1, 2, 3].map(i => <Card key={i} style={{ padding: 18 }}><Skel w="60%" h={18} /><Skel w="100%" h={50} style={{ marginTop: 12 }} /></Card>)}</div>
      </>
    );
  }

  const ql = q.toLowerCase();
  const decs = KB_DECISIONS.filter(e => {
    if (cat === 'closure') return false;
    if (q) { const s = (e.rule + e.id + e.scene + e.who + e.explicit + e.tacit + e.scope.join('')).toLowerCase(); if (!s.includes(ql)) return false; }
    return true;
  });
  const clos = KB_ENTRIES.filter(e => {
    if (cat === 'decision') return false;
    if (q) { const s = (e.name + e.id + e.exp + e.tags.join('')).toLowerCase(); if (!s.includes(ql)) return false; }
    return true;
  });
  const total = decs.length + clos.length;
  const ragHits = KB_DECISIONS.reduce((s, d) => s + d.usage30, 0);

  return (
    <>
      <div className="kb-intro">
        <span className="kb-intro-ico"><Icon name="library-big" size={20} color="var(--blue-primary)" /></span>
        <div className="kb-intro-main">
          <div className="kb-intro-t">不止结项数据 —— 把管理经验沉淀为系统能力</div>
          <div className="kb-intro-s">知识库统一沉淀两类知识：项目<b>结项经验</b>，以及管理层在工作台交互、触发动作背后的<b>决策经验</b>。后者把过去靠人盯的隐性管理规则不断显性化，连同结项经验一起通过 RAG 在 AI 执行任务时增强上下文，赋能整个 AI 项目系统。</div>
          <span className="kb-intro-rag"><Icon name="zap" size={13} color="var(--ai)" />近 30 日 RAG 调用 {ragHits} 次 · 显性化规则 {KB_DECISIONS.length} 条</span>
        </div>
      </div>

      <div className="kb-toolbar">
        <div className="kb-search">
          <Icon name="search" size={17} color="var(--text-400)" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="检索结项经验 / 管理决策规则 / 关键词…" />
          {q && <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={() => setQ('')}><Icon name="x" size={15} color="var(--text-400)" /></button>}
        </div>
        <div className="kb-filters">
          {KB_CATS.map(f => (
            <button key={f.id} className="kb-filter-btn" data-on={cat === f.id} onClick={() => setCat(f.id)}>{f.label}</button>
          ))}
        </div>
      </div>

      <div className="kb-count">共 <span className="mono">{total}</span> 条知识{cat === 'decision' && <> · 管理决策经验</>}{cat === 'closure' && <> · 结项经验</>}{q && <> · 匹配「{q}」</>}</div>

      {total === 0 ? (
        <Card style={{ marginTop: 4 }}>
          <EmptyState glyph="library" title="暂无匹配的知识" desc="换个关键词试试。管理层在工作台触发动作、或项目结项后，相关经验会自动沉淀进知识库。" action={<Button variant="secondary" icon="rotate-ccw" onClick={() => { setQ(''); setCat('all'); }}>清除筛选</Button>} />
        </Card>
      ) : (
        <div className="kb-grid">
          {decs.map(e => (
            <button className="kb-item is-dec" key={e.id} onClick={() => setActiveDec(e)}>
              <div className="kb-item-top">
                <span className="kb-item-ico"><Icon name="lightbulb" size={19} color="var(--blue-primary)" /></span>
                <div className="kb-item-titles">
                  <div className="kb-item-name">{entryScene(e)}</div>
                  <div className="kb-item-id">{e.id} · {e.who}</div>
                </div>
                <span className="kb-kind dec"><Icon name="lightbulb" size={12} color="var(--blue-primary)" />管理决策</span>
              </div>
              <div className="kb-dec-rule">{e.rule}</div>
              <div className="kb-dec-trans"><span className="from">隐性经验</span><Icon name="arrow-right" size={13} color="var(--blue-primary)" /><span className="to">显性规则</span></div>
              <div className="kb-item-foot">
                <span className="kb-item-date"><Icon name="calendar" size={12} color="var(--text-400)" />{e.date}</span>
                <span className="kb-rag-foot"><Icon name="zap" size={12} color="var(--ai)" />RAG 赋能 {e.rag.length} 个技能</span>
              </div>
            </button>
          ))}
          {clos.map(e => {
            const ty = KB_TYPE[e.type];
            return (
              <button className="kb-item" key={e.id} onClick={() => setActive(e)}>
                <div className="kb-item-top">
                  <span className="kb-item-ico" style={{ background: ty.bg }}><Icon name={ty.icon} size={19} color={ty.c} /></span>
                  <div className="kb-item-titles">
                    <div className="kb-item-name">{e.name}</div>
                    <div className="kb-item-id">{e.id}</div>
                  </div>
                  <span className="kb-kind clo"><Icon name="package-check" size={12} color="var(--closure)" />结项经验</span>
                </div>
                <div className="kb-item-exp">{e.exp}</div>
                <div className="kb-item-tags">
                  {e.tags.map((t, i) => <span className="kb-item-tag" key={i}>{t}</span>)}
                </div>
                <div className="kb-item-foot">
                  <span className="kb-item-date"><Icon name="calendar" size={12} color="var(--text-400)" />{e.date}</span>
                  {e.borrow && <span className="kb-borrow"><Icon name="bookmark-check" size={12} color="var(--closure)" />立项可借鉴</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <KnowledgeDrawer entry={active} onClose={() => setActive(null)} onNavigate={onNavigate} onToast={onToast} />
      <DecisionDrawer entry={activeDec} onClose={() => setActiveDec(null)} onNavigate={onNavigate} />
    </>
  );
}

function entryScene(e) { return `${e.scene} · 一次管理决策`; }

/* ---------- 组合级治理 · 知识库独立页 ---------- */
function KnowledgeStandalone({ onNavigate }) {
  const [loading, setLoading] = React.useState(true);
  const [toast, setToast] = React.useState(null);
  React.useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);
  React.useEffect(() => { refreshIcons(); });
  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: '项目管理工作台' }, { label: '治理' }, { label: '知识库' }]} />
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico" style={{ background: 'var(--blue-tint)' }}><Icon name="library-big" size={22} color="var(--blue-primary)" /></span>
          <div>
            <h1 className="t-h1">知识库</h1>
          </div>
        </div>
        <div className="page-head-right">
          <FeedbackEntry
            context={{ scene: '知识库', did: `知识库已沉淀 ${KB_ENTRIES.length} 条结项经验与 ${KB_DECISIONS.length} 条管理决策经验，通过 RAG 赋能 AI 执行`, ask: '某条知识、其适用范围或 RAG 赋能情况' }}
            onClick={() => setToast({ msg: '异步反馈入口已打开（演示）' })} />
        </div>
      </div>
      <KnowledgeBase loading={loading} onNavigate={onNavigate} onToast={(msg) => setToast({ msg })} />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

Object.assign(window, { KnowledgeBase, KnowledgeStandalone, KB_ENTRIES, KB_DECISIONS, KB_TYPE });
