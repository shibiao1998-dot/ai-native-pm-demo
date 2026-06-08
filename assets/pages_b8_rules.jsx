/* ============================================================
   批 8 · 页面 8.3 · 规则与留痕 → 治理监督台（组合级治理）
   重新定位「人在这里做什么」：
   AI 自治运行、全程 append-only 留痕；管理层不操作日常，只在两类时刻介入 ——
   ① 系统升级到你的决策点：授权 / 风险越级 / 规则确认（待我处理队列）
   ② 你主动抽查与追溯留痕（全局留痕事件流）
   规则不再是静态清单，而是可溯源、可确认（人工设定 / 决策显性化 / AI 自主进化）。
   数据：RU_RULES 生效规则 / RU_EVENTS 留痕事件 / RU_EXTRA 事件依据，均为 mock。
   ============================================================ */

/* ---------- 生效规则（可溯源 / 可确认） ----------
   source: human 人工设定 / decision 由管理决策显性化 / auto AI 自主进化。
   pending=true 的规则待管理层确认后才全域生效；govern 列出受该规则约束的 AI 技能。 */
const RU_RULES = [
  { id: 'R-CHARTER', ico: 'clipboard-check', t: '统一立项门槛', s: '候选方向须通过战略对齐、可行性与算力配额三项校验方可立项。', source: 'human', srcText: '管理层设定 · 制度固化', by: '管理层', when: '2026-03-01', govern: ['AI 立项 · 立项门槛校验'] },
  { id: 'R-DECOMP', ico: 'git-fork', t: '理想化状态自上而下拆解', s: '目标须由理想化状态逐级拆解，每级可追溯、可验收，不漂移。', source: 'human', srcText: '管理层设定 · 制度固化', by: '管理层', when: '2026-03-01', govern: ['AI 项目负责人 · 理想化状态建模 / 目标分级拆解'] },
  { id: 'R-ACCEPT-CRIT', ico: 'scan-text', t: '目标须带可量化验收口径', s: '任何进入执行编排的目标，必须在拆解阶段即附可量化验收口径，否则不予放行。', source: 'decision', srcText: '由一次管理决策显性化 · 知识库 DEC-2026-0061', srcRoute: 'knowledge', by: '张明', when: '2026-06-02', govern: ['AI 项目负责人 · 目标分级拆解', 'AI 验收官 · 逐环审核'] },
  { id: 'R-ACCEPT-LOOP', ico: 'circle-check', t: '逐级验收闭环', s: '每级目标自下而上逐环验收，附可量化证据，未达标即退回。', source: 'human', srcText: '管理层设定 · 制度固化', by: '管理层', when: '2026-03-01', govern: ['AI 验收官 · 逐环审核 / 验收判定'] },
  { id: 'R-COST', ico: 'receipt', t: '大额成本审批', s: '单次算力 / 采购成本超阈值（¥50,000）须经管理层授权并全程留痕。', source: 'human', srcText: '管理层设定 · 制度固化', by: '管理层', when: '2026-03-01', govern: ['AI 风控官 · 卡点识别 / 越级上报'] },
  { id: 'R-CLOSURE', ico: 'octagon-alert', t: '强制结项双重确认', s: '强制结项须经管理层审批与负责人确认双重签署方可生效。', source: 'human', srcText: '管理层设定 · 制度固化', by: '管理层', when: '2026-03-01', govern: ['结项 Agent', 'AI 风控官'] },
  { id: 'R-RISK-TREND', ico: 'trending-down', t: '风险分级趋势降权', s: '风险分级须结合趋势：短时波动降权，仅持续恶化才升级越报。', source: 'auto', srcText: 'AI 风控官自主进化 · 风险分级 v2.3', srcRoute: 'ai-staff', pending: true, govern: ['AI 风控官 · 风险分级'],
    pendingWhy: 'AI 风控官据「关注级误报过多、淹没真实风险」自主进化出该规则（v2.3），将影响全局风险分级，须你确认后方可全域生效。', pendingSince: '2 小时前' },
  { id: 'R-TRANSFER', ico: 'recycle', t: '结项能力须做可迁移性标注', s: '强制结项时须对能力组件做「可迁移 / 归档 / 终止」三态标注，可迁移部分转入复用池。', source: 'decision', srcText: '由一次管理决策显性化 · 知识库 DEC-2026-0047', srcRoute: 'knowledge', pending: true, govern: ['结项 Agent · 强制结项归纳', 'AI 战略分析师 · 机会方向识别'],
    pendingWhy: '由管理层在一次强制结项中的决策显性化而来（知识库 DEC-2026-0047），将作为强制结项的默认规则，须你确认后方可全域生效。', pendingSince: '1 天前' },
  { id: 'R-AUDIT', ico: 'lock', t: '留痕不可篡改', s: '所有动作 append-only 写入，唯一事实来源，仅可追加、不可删改。', source: 'human', srcText: '系统固化 · 不可关闭', by: '系统', when: '—', govern: ['全局留痕审计'] },
];
const RU_RULE_SRC = {
  human: { label: '人工设定', icon: 'user-cog', c: 'var(--text-500)', bg: 'var(--neutral-bg)' },
  decision: { label: '决策显性化', icon: 'lightbulb', c: 'var(--blue-primary)', bg: 'var(--blue-tint)' },
  auto: { label: 'AI 自主进化', icon: 'sparkles', c: 'var(--ai)', bg: 'var(--ai-soft)' },
};

const RU_TYPES = {
  charter: { label: '立项', c: 'var(--info)', bg: 'var(--info-bg)', dot: 'var(--info)' },
  accept:  { label: '验收', c: 'var(--success)', bg: 'var(--success-bg)', dot: 'var(--success)' },
  cost:    { label: '成本', c: 'var(--warning)', bg: 'var(--warning-bg)', dot: 'var(--warning)' },
  closure: { label: '结项', c: 'var(--neutral)', bg: 'var(--neutral-bg)', dot: 'var(--neutral)' },
  rule:    { label: '规则', c: 'var(--blue-primary)', bg: 'var(--blue-tint)', dot: 'var(--blue-primary)' },
};
const RU_RISK = {
  info: { label: '提示', c: 'var(--blue-primary)', bg: 'var(--blue-tint)', icon: 'info' },
  warn: { label: '关注', c: 'var(--warning)', bg: 'var(--warning-bg)', icon: 'alert-triangle' },
  risk: { label: '风险', c: 'var(--danger)', bg: 'var(--danger-bg)', icon: 'octagon-alert' },
};

const RU_EVENTS = [
  { id: 'TR-2026-118402', time: '14:22', date: '06-02', type: 'cost', risk: 'warn', aiActor: false, actor: '管理层',
    act: '授权通过大额算力采购 · ¥182,000', proj: 'PRJ-2026-0129',
    detail: '客服知识中枢重构申请追加批量推理算力，金额超大额审批阈值，按「大额成本审批」规则上报，管理层授权通过并留痕。',
    trace: [
      { t: 'AI 风控官触发大额成本规则', m: '06-02 14:18 · 自动' },
      { t: '系统生成授权单并通知管理层', m: '06-02 14:19' },
      { t: '管理层授权通过', m: '06-02 14:22 · 管理层' },
    ],
    jumps: [{ k: '关联事务', t: '批量推理算力扩容', icon: 'square-check-big', route: 'p-task' }, { k: '关联 AI 员工', t: 'AI 风控官', icon: 'bot', route: 'ai-staff' }] },
  { id: 'TR-2026-118399', time: '14:14', date: '06-02', type: 'rule', risk: 'info', aiActor: false, actor: '管理层',
    act: '确认「目标须带可量化验收口径」规则全域生效', proj: '全局',
    detail: '管理层在治理监督台确认由知识库管理决策 DEC-2026-0061 显性化而来的规则，全域统一生效，AI 项目负责人与 AI 验收官据此校验。',
    trace: [
      { t: '知识库把一次管理决策显性化为规则', m: '06-01 14:25 · 自动' },
      { t: '规则进入「待管理层确认」队列', m: '06-01 14:26 · 自动' },
      { t: '管理层确认规则全域生效', m: '06-02 14:14 · 管理层' },
    ],
    jumps: [{ k: '关联知识', t: 'DEC-2026-0061 · 管理决策经验', icon: 'lightbulb', route: 'knowledge' }, { k: '关联 AI 员工', t: 'AI 验收官', icon: 'bot', route: 'ai-staff' }] },
  { id: 'TR-2026-118395', time: '13:48', date: '06-02', type: 'accept', risk: 'info', aiActor: true, actor: 'AI 验收官',
    act: '逐环审核通过「展示环」并沉淀验收记录', proj: 'PRJ-2026-0129',
    detail: '展示环验收附可量化证据，判定达标并自下而上回写阶段目标推进度，验收记录 append-only 永久留痕。',
    trace: [
      { t: 'AI 执行官提交展示环产出', m: '06-02 13:40 · 自动' },
      { t: 'AI 验收官给出达标评级', m: '06-02 13:48 · 自动' },
      { t: '推进度回写、验收记录留痕', m: '06-02 13:48 · 自动' },
    ],
    jumps: [{ k: '关联目标节点', t: '阶段目标 · 检索采纳率 ≥ 65%', icon: 'milestone', route: 'p-tree' }, { k: '关联 AI 员工', t: 'AI 验收官', icon: 'bot', route: 'ai-staff' }] },
  { id: 'TR-2026-118390', time: '11:05', date: '06-02', type: 'closure', risk: 'risk', aiActor: true, actor: 'AI 风控官',
    act: '识别强制结项触发条件并越级高亮', proj: 'PRJ-2026-0151',
    detail: '顶层战略方向收缩，平台被动触发强制结项条件。AI 风控官标记为风险级、越级高亮至管理层，等待双重确认。',
    trace: [
      { t: '外部战略 Agent 推送方向收缩', m: '06-02 10:50 · 外部 API' },
      { t: 'AI 风控官判定强制结项条件成立', m: '06-02 11:05 · 自动' },
      { t: '风险级预警越级高亮至管理层', m: '06-02 11:05 · 自动' },
    ],
    jumps: [{ k: '关联项目', t: '智能外呼增长助手', icon: 'box', route: 'projects' }, { k: '关联 AI 员工', t: 'AI 风控官', icon: 'bot', route: 'ai-staff' }] },
  { id: 'TR-2026-118384', time: '10:22', date: '06-02', type: 'accept', risk: 'info', aiActor: true, actor: 'AI 执行官',
    act: '接入区域运力实时数据源 · 自愈 2 次后联通', proj: 'PRJ-2026-0137',
    detail: '运力数据接入事务执行中接口两次超时，AI 执行官按退避策略自愈并切换双源，最终联通成功，全过程留痕。',
    trace: [
      { t: '事务启动 · 调用第三方运力 API', m: '06-02 10:18 · 自动' },
      { t: '两次超时 · 触发退避自愈与双源切换', m: '06-02 10:20 · 自动' },
      { t: '联通成功 · 进度回写并留痕', m: '06-02 10:22 · 自动' },
    ],
    jumps: [{ k: '关联事务', t: '接入区域运力实时数据源', icon: 'square-check-big', route: 'p-task' }, { k: '关联 AI 员工', t: 'AI 执行官', icon: 'bot', route: 'ai-staff' }] },
  { id: 'TR-2026-118377', time: '09:14', date: '06-02', type: 'rule', risk: 'info', aiActor: true, actor: 'AI 项目负责人',
    act: '据「可验收性」规则补全周目标验收口径', proj: 'PRJ-2026-0137',
    detail: '拆解阶段目标时按可验收性前置校验规则，对低于阈值的周目标自动补充验收口径，减少下游退回。',
    trace: [
      { t: '拆解「履约时效 < 4h」为 6 条周目标', m: '06-02 09:10 · 自动' },
      { t: '可验收性校验 · 2 条低于阈值', m: '06-02 09:12 · 自动' },
      { t: '自动补充验收口径并留痕', m: '06-02 09:14 · 自动' },
    ],
    jumps: [{ k: '关联目标节点', t: '阶段目标 · 履约时效 < 4h', icon: 'milestone', route: 'p-tree' }, { k: '关联 AI 员工', t: 'AI 项目负责人', icon: 'bot', route: 'ai-staff' }] },
  { id: 'TR-2026-118361', time: '08:36', date: '06-02', type: 'charter', risk: 'info', aiActor: true, actor: 'AI 立项官',
    act: '新候选方向通过立项三项门槛校验', proj: 'PRJ-2026-0160',
    detail: '供应链风险预警中台候选方向通过战略对齐、可行性与算力配额校验，进入正式立项，全程留痕。',
    trace: [
      { t: '战略层传导新增方向至备选池', m: '06-01 18:00 · 自动' },
      { t: 'AI 立项官执行三项门槛校验', m: '06-02 08:30 · 自动' },
      { t: '校验通过 · 生成立项记录', m: '06-02 08:36 · 自动' },
    ],
    jumps: [{ k: '关联流程', t: '立项门槛规则', icon: 'clipboard-check', route: 'charter' }, { k: '关联战略', t: '供应链风险预警中台', icon: 'compass', route: 'strategy' }] },
];

const RU_FILTERS = [
  { id: 'all', label: '全部' },
  { id: 'charter', label: '立项' },
  { id: 'accept', label: '验收' },
  { id: 'cost', label: '成本' },
  { id: 'closure', label: '结项' },
  { id: 'rule', label: '规则' },
];

const RU_EXTRA = {
  'TR-2026-118402': { trigger: '客服知识中枢重构申请追加批量推理算力，金额 ¥182,000 超过大额成本审批阈值（¥50,000）。', basis: [{ k: '命中规则', v: '大额成本审批 · 单次成本超阈值须管理层授权' }, { k: '数据依据', v: '比价表 QUOTE-0129 · 预算口径校验通过' }] },
  'TR-2026-118399': { trigger: '知识库把一次管理决策（DEC-2026-0061）显性化为可复用规则，进入待管理层确认。', basis: [{ k: '命中规则', v: '规则变更须经管理层确认方可全域生效' }, { k: '规则来源', v: '知识库 · 管理决策经验 DEC-2026-0061' }] },
  'TR-2026-118395': { trigger: 'AI 执行官提交「展示环」产出，自动进入逐环验收。', basis: [{ k: '命中规则', v: '逐级验收闭环 · 须附可量化证据' }, { k: '验收证据', v: '检索采纳率实测 67% ≥ 阈值 65%' }] },
  'TR-2026-118390': { trigger: '外部战略 Agent 推送顶层方向收缩，命中强制结项触发条件。', basis: [{ k: '命中规则', v: '强制结项双重确认 · 管理层审批 + 负责人确认' }, { k: '外部信号', v: '战略方向收缩（外部 API 推送）' }] },
  'TR-2026-118384': { trigger: '运力数据接入事务执行中，第三方 API 连续两次超时。', basis: [{ k: '命中规则', v: '留痕不可篡改 · 全过程 append-only' }, { k: '自愈策略', v: '异常自愈 · 指数退避 + 双源切换' }] },
  'TR-2026-118377': { trigger: '拆解阶段目标时，2 条周目标可验收性评分低于阈值。', basis: [{ k: '命中规则', v: '目标须带可量化验收口径' }, { k: '触发阈值', v: '可验收性评分 < 0.7 须自动补充验收口径' }] },
  'TR-2026-118361': { trigger: '战略层传导新增方向至备选池，达到自动立项条件。', basis: [{ k: '命中规则', v: '统一立项门槛 · 战略对齐 / 可行性 / 算力配额三项校验' }, { k: '校验结果', v: '三项门槛校验全部通过' }] },
};

/* ============================================================
   事件详情抽屉 · 留痕完整回溯
   ------------------------------------------------------------
   RuleEventDrawer：点某条留痕事件，用 doc_kit 展开完整回溯：概要 / 触发条件 / 决策链 /
     依据 / 关联实体跳转。RU_EXTRA 为该事件补充「触发条件 + 依据」。 */
function RuleEventDrawer({ ev, onClose, onNavigate }) {
  const ty = ev ? RU_TYPES[ev.type] : null;
  const rk = ev ? RU_RISK[ev.risk] : null;
  const extra = ev ? RU_EXTRA[ev.id] : null;
  React.useEffect(() => { refreshIcons(); });
  return (
    <Drawer open={!!ev} onClose={onClose} width={620}
      title={ev ? `留痕详情 · ${ev.id}` : ''} sub={ev ? `${ev.date} ${ev.time} · append-only 唯一事实来源` : ''}
      icon={{ name: 'history', color: 'var(--blue-primary)' }}
      headRight={ev && (
        <FeedbackEntry label="反馈"
          context={{ scene: '规则与留痕 · 事件详情', did: `当前查看留痕 ${ev.id}「${ev.act}」的完整回溯（触发、决策链、依据与关联）`, ask: '该事件的某一步决策、依据或风险定级' }}
          onClick={() => {}} />
      )}
      footer={ev && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="t-micro" style={{ color: 'var(--text-400)', flex: 1 }}>留痕只增不减，是唯一事实来源。</span>
          <span className="ru-append"><Icon name="lock" size={11} color="var(--success)" />不可篡改</span>
        </div>
      )}>
      {ev && (
        <DocDoc>
          <DocBanner tone={ev.risk === 'risk' ? 'danger' : ev.risk === 'warn' ? 'warning' : 'info'} icon={rk.icon}>
            {ev.detail}
          </DocBanner>

          <DocSec no="01" title="留痕概要" icon="file-badge">
            <DocMeta items={[
              { k: '动作', v: ev.act },
              { k: '动作类型', v: <span className="ru-type-tag" style={{ color: ty.c, background: ty.bg }}>{ty.label}</span> },
              { k: '触发人 / 主体', v: ev.aiActor ? <span style={{ color: 'var(--ai)' }}>{ev.actor}</span> : <b>{ev.actor}</b> },
              { k: '触发地点', v: <span className="mono">{ev.proj}</span> },
              { k: '风险级别', v: <span style={{ color: rk.c, fontWeight: 600 }}>{rk.label}级</span> },
              { k: '触发时间', v: <span className="mono">{ev.date} {ev.time}</span> },
            ]} />
          </DocSec>

          {extra && (
            <DocSec no="02" title="触发条件" icon="zap">
              <DocVerdict tone={ev.risk === 'risk' ? 'stop' : ev.risk === 'warn' ? 'warn' : 'pass'} icon={rk.icon} title="本次留痕的触发起点">
                {extra.trigger}
              </DocVerdict>
            </DocSec>
          )}

          <DocSec no="03" title="决策链 · 逐步回溯" icon="git-commit-horizontal">
            <DocChain items={ev.trace.map(t => ({ act: t.t, actor: t.m, ai: /自动|API/.test(t.m) }))} />
          </DocSec>

          {extra && (
            <DocSec no="04" title="依据" icon="scale">
              <DocPeople rows={extra.basis.map(b => ({ role: b.k, who: b.v, icon: b.k === '命中规则' ? 'book-check' : b.k.includes('数据') || b.k.includes('证据') || b.k.includes('校验') ? 'database' : 'link' }))} />
            </DocSec>
          )}

          <DocSec no="05" title="回溯 · 关联实体" icon="link">
            <div className="ru-jump">
              {ev.jumps.map((j, i) => (
                <button className="ru-jump-btn" key={i} onClick={() => { onNavigate && onNavigate(j.route); onClose(); }}>
                  <span className="ru-jump-ico"><Icon name={j.icon} size={16} color="var(--blue-primary)" /></span>
                  <div className="ru-jump-main">
                    <div className="ru-jump-k">{j.k}</div>
                    <div className="ru-jump-t">{j.t}</div>
                  </div>
                  <Icon name="arrow-up-right" size={15} color="var(--text-400)" />
                </button>
              ))}
            </div>
          </DocSec>
        </DocDoc>
      )}
    </Drawer>
  );
}

/* ============================================================
   规则详情抽屉 · 来源 + 确认状态 + 治理范围
   ------------------------------------------------------------
   RuleDrawer：展示一条规则的内容/来源/确认状态/治理范围/近期命中留痕。
   isPending（待确认）时底部提供「确认生效」按钮 → onRatify(id)。 */
function RuleDrawer({ rule, ratified, onClose, onNavigate, onRatify }) {
  React.useEffect(() => { refreshIcons(); });
  if (!rule) return null;
  const src = RU_RULE_SRC[rule.source];
  const isPending = rule.pending && !ratified;
  const relEvents = RU_EVENTS.filter(e => (RU_EXTRA[e.id] && (RU_EXTRA[e.id].basis || []).some(b => b.v && b.v.includes(rule.t.slice(0, 4))))).slice(0, 3);
  return (
    <Drawer open={!!rule} onClose={onClose} width={560}
      title={rule.t} sub={`${rule.id} · 生效规则 · AI 照着走的稳定轨道`}
      icon={{ name: rule.ico, color: 'var(--blue-primary)' }}
      footer={
        isPending ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="t-micro" style={{ color: 'var(--text-400)', flex: 1 }}>该规则由 AI 自主进化，待你确认后全域生效。</span>
            <Button variant="secondary" size="sm" onClick={onClose}>暂不</Button>
            <Button variant="primary" size="sm" icon="check" onClick={() => { onRatify(rule.id); onClose(); }}>确认生效</Button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="t-micro" style={{ color: 'var(--text-400)', flex: 1 }}>规则全域统一生效，所有命中动作自动留痕。</span>
            <span className="ru-rule-status ratified"><Icon name="circle-check" size={12} color="var(--success)" />已确认生效</span>
          </div>
        )
      }>
      <DocDoc>
        <DocBanner tone={isPending ? 'warning' : 'success'} icon={isPending ? 'alert-triangle' : 'shield-check'}>
          {isPending
            ? '这是一条 AI 自主进化出的新规则，尚未全域生效 —— 需要你作为管理层确认。这正是你在本页的职责：把关规则变更，而非操作日常。'
            : '这是一条全域生效的规则，AI 照着它稳定运行。你的职责是把关它的来源与变更，并可随时溯源命中它的留痕。'}
        </DocBanner>

        <DocSec no="01" title="规则内容" icon="book-check">
          <div className="kb-rule">
            <span className="kb-rule-ico"><Icon name={rule.ico} size={20} color="var(--blue-primary)" /></span>
            <div><div className="kb-rule-txt">{rule.s}</div></div>
          </div>
        </DocSec>

        <DocSec no="02" title="规则来源" icon="route">
          <div className={`ru-srcbox ${rule.source}`}>
            <span className="ru-srcbox-ico"><Icon name={src.icon} size={16} color={rule.source === 'auto' ? 'var(--ai)' : rule.source === 'decision' ? 'var(--blue-primary)' : 'var(--text-500)'} /></span>
            <div className="ru-srcbox-main">
              <div className="ru-srcbox-t">{src.label}</div>
              <div className="ru-srcbox-s">{rule.srcText}</div>
              {rule.srcRoute && (
                <button className="ru-srcbox-link" onClick={() => { onNavigate && onNavigate(rule.srcRoute); onClose(); }}>
                  查看来源<Icon name="arrow-up-right" size={13} color="var(--blue-primary)" />
                </button>
              )}
            </div>
          </div>
        </DocSec>

        <DocSec no="03" title="确认状态" icon="badge-check">
          {isPending ? (
            <DocVerdict tone="warn" icon="clock" title="待管理层确认">
              该规则由 AI 自主进化产生，影响全局，须你确认后方可全域生效。确认与否都会写入留痕。
            </DocVerdict>
          ) : (
            <DocMeta items={[
              { k: '当前状态', v: <span className="ru-rule-status ratified"><Icon name="circle-check" size={12} color="var(--success)" />已确认生效</span> },
              { k: '确认人', v: ratified ? '你（管理层）' : rule.by },
              { k: '确认时间', v: <span className="mono">{ratified ? '刚刚' : rule.when}</span> },
              { k: '生效范围', v: '全域统一' },
            ]} />
          )}
        </DocSec>

        <DocSec no="04" title="治理范围 · AI 照此运行" icon="bot">
          <DocList items={rule.govern} icon="bot" tone="blue" />
        </DocSec>

        {relEvents.length > 0 && (
          <DocSec no="05" title="近期命中留痕" icon="history">
            <DocLog rows={relEvents.map(e => ({ when: `${e.date} ${e.time}`, main: e.act, tail: e.proj }))} />
          </DocSec>
        )}
      </DocDoc>
    </Drawer>
  );
}

/* ============================================================
   主页面 · 治理监督台
   ------------------------------------------------------------
   RulesAndAudit：状态 filter 留痕类型筛选 / q 检索 / activeEv 事件抽屉 / activeRule 规则抽屉 /
     ratified 已确认规则 / dismissed 已驳回规则。
   pendingRules：本页唯一需你主动决策的事——确认规则变更（不覆盖介入工作台的项目级处置）。
     ratifyRule / dismissRule 确认 / 驳回规则并写留痕。events 按类型+检索过滤留痕流。 */
function RulesAndAudit({ onNavigate }) {
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('all');
  const [q, setQ] = React.useState('');
  const [activeEv, setActiveEv] = React.useState(null);
  const [activeRule, setActiveRule] = React.useState(null);
  const [ratified, setRatified] = React.useState({});   // ruleId -> true
  const [dismissed, setDismissed] = React.useState({}); // ruleId -> true（驳回）
  const [toast, setToast] = React.useState(null);
  React.useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);
  React.useEffect(() => { refreshIcons(); });

  const fireToast = (msg, ev) => setToast({ msg, action: ev ? '查看留痕' : null, onAction: ev ? () => { setActiveEv(ev); setToast(null); } : null });

  // 本页唯一需你主动决策的事：确认规则变更（不覆盖「介入工作台」的项目级处置）
  const pendingRules = RU_RULES.filter(r => r.pending && !ratified[r.id] && !dismissed[r.id]);
  const ratifyRule = (id) => { setRatified(r => ({ ...r, [id]: true })); fireToast('已确认规则全域生效 · 写入留痕'); };
  const dismissRule = (id) => { setDismissed(d => ({ ...d, [id]: true })); fireToast('已驳回规则变更 · 决策写入留痕'); };

  const ratifiedCount = RU_RULES.filter(r => !r.pending || ratified[r.id]).length;

  const events = RU_EVENTS.filter(e => {
    if (filter !== 'all' && e.type !== filter) return false;
    if (q) { const s = (e.act + e.proj + e.actor + e.id).toLowerCase(); if (!s.includes(q.toLowerCase())) return false; }
    return true;
  });

  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: '项目管理工作台' }, { label: '治理' }, { label: '规则与留痕' }]} />
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico"><Icon name="gavel" size={22} color="var(--blue-primary)" /></span>
          <div>
            <h1 className="t-h1">规则与留痕</h1>
          </div>
        </div>
        <div className="page-head-right">
          <FeedbackEntry
            context={{ scene: '规则与留痕', did: '这里只管「规则」与「留痕」：AI 照统一规则自治运行、全程留痕；管理层只确认规则变更、抽查追溯留痕。项目执行中的具体处置在「介入工作台」', ask: '某条规则、某条留痕，或你在此的职责边界' }}
            onClick={() => setToast({ msg: '异步反馈入口已打开（演示）' })} />
        </div>
      </div>

      {loading ? (
        <>
          <Card style={{ padding: 18, marginBottom: 18 }}>{[0,1,2].map(i => <Skel key={i} w="100%" h={56} style={{ marginBottom: 10 }} />)}</Card>
          <div className="ru-layout">
            <Card style={{ padding: 18 }}>{[0,1,2,3].map(i => <Skel key={i} w="100%" h={40} style={{ marginBottom: 10 }} />)}</Card>
            <Card style={{ padding: 18 }}>{[0,1,2,3,4].map(i => <Skel key={i} w="100%" h={48} style={{ marginBottom: 10 }} />)}</Card>
          </div>
        </>
      ) : (
        <>
          {/* 待确认的规则变更 —— 本页唯一需要你主动决策的事 */}
          <div className="ru-todo-wrap">
            <div className="ru-todo-head">
              <span className="t"><Icon name="gavel" size={17} color="var(--blue-primary)" />待确认的规则变更{pendingRules.length > 0 && <span className="ru-todo-n">{pendingRules.length}</span>}</span>
            </div>
            {pendingRules.length === 0 ? (
              <div className="ru-todo-empty">
                <span className="ru-todo-empty-ico"><Icon name="check-check" size={22} color="var(--success)" /></span>
                <div>
                  <div className="ru-todo-empty-t">当前没有待确认的规则变更</div>
                  <div className="ru-todo-empty-s">现行规则均已确认生效，AI 照此自治运行。有规则被自主进化或从决策显性化时，会在此请你确认。</div>
                </div>
              </div>
            ) : (
              pendingRules.map(r => {
                const src = RU_RULE_SRC[r.source];
                return (
                  <div className="ru-todo-item" key={r.id}>
                    <span className="ru-todo-ico" style={{ background: src.bg }}><Icon name={r.ico} size={20} color={src.c} /></span>
                    <div className="ru-todo-main">
                      <div className="ru-todo-toprow">
                        <span className="ru-todo-kind" style={{ color: src.c, background: src.bg }}><Icon name={src.icon} size={11} color={src.c} />{src.label}</span>
                        <span className="ru-todo-t">{r.t}</span>
                      </div>
                      <div className="ru-todo-why">{r.pendingWhy}</div>
                      <div className="ru-todo-meta">
                        <span>规则内容：{r.s}</span>
                      </div>
                      <div className="ru-todo-meta">
                        <span><Icon name="clock" size={11} color="var(--text-400)" style={{ verticalAlign: '-2px', marginRight: 3 }} />提交于 {r.pendingSince}</span>
                      </div>
                      <div className="ru-todo-acts">
                        <Button variant="primary" size="sm" icon="check" onClick={() => ratifyRule(r.id)}>确认生效</Button>
                        <Button variant="secondary" size="sm" icon="file-search" onClick={() => setActiveRule(r)}>查看详情</Button>
                        <Button variant="secondary" size="sm" onClick={() => dismissRule(r.id)}>驳回</Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="ru-layout">
            {/* 左 · 生效规则（可点开溯源 / 确认） */}
            <div className="ru-rules">
              <div className="ru-rules-head">
                <Icon name="book-check" size={17} color="var(--blue-primary)" />
                <span className="t">生效规则</span>
                <span className="s">{ratifiedCount}/{RU_RULES.length} 已确认</span>
              </div>
              {RU_RULES.map((r) => {
                const isPending = r.pending && !ratified[r.id];
                const src = RU_RULE_SRC[r.source];
                return (
                  <button className="ru-rule-btn" key={r.id} data-pending={isPending} onClick={() => setActiveRule(r)}>
                    <span className="ru-rule-ico"><Icon name={r.ico} size={16} color="var(--blue-primary)" /></span>
                    <div className="ru-rule-main">
                      <div className="ru-rule-t">{r.t}</div>
                      <div className="ru-rule-s">{r.s}</div>
                      <div className="ru-rule-foot">
                        <span className={`ru-rule-src ${r.source}`}><Icon name={src.icon} size={11} color={r.source === 'auto' ? 'var(--ai)' : r.source === 'decision' ? 'var(--blue-primary)' : 'var(--text-500)'} />{src.label}</span>
                        {isPending
                          ? <span className="ru-rule-status pending"><Icon name="clock" size={11} color="var(--warning)" />待你确认</span>
                          : <span className="ru-rule-status ratified"><Icon name="circle-check" size={11} color="var(--success)" />已生效</span>}
                      </div>
                    </div>
                    <span className="ru-rule-cta"><Icon name="chevron-right" size={16} color="var(--text-400)" /></span>
                  </button>
                );
              })}
            </div>

            {/* 右 · 全局留痕事件流 */}
            <div className="ru-stream">
              <div className="ru-stream-head">
                <span className="t"><Icon name="history" size={17} color="var(--blue-primary)" />全局留痕 <span className="ru-append"><Icon name="lock" size={11} color="var(--success)" />append-only</span></span>
                <div className="ru-filters">
                  {RU_FILTERS.map(f => <button key={f.id} className="ru-filter" data-on={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</button>)}
                </div>
              </div>
              <div style={{ padding: '11px 18px', borderBottom: '1px solid var(--divider)' }}>
                <div className="b8-search" style={{ height: 36 }}>
                  <Icon name="search" size={15} color="var(--text-400)" />
                  <input value={q} onChange={e => setQ(e.target.value)} placeholder="追溯留痕：动作 / 触发人 / 触发地点 / 留痕号…" style={{ fontSize: 13 }} />
                  {q && <button className="icon-btn" style={{ width: 24, height: 24 }} onClick={() => setQ('')}><Icon name="x" size={14} color="var(--text-400)" /></button>}
                </div>
              </div>

              {events.length === 0 ? (
                <div style={{ padding: 40 }}><EmptyState glyph="history" title="无匹配留痕" desc="换个类型或关键词试试。留痕只增不减，是唯一事实来源。" action={<Button variant="secondary" icon="rotate-ccw" onClick={() => { setFilter('all'); setQ(''); }}>清除筛选</Button>} /></div>
              ) : (
                <div className="ru-events">
                  {events.map(e => {
                    const ty = RU_TYPES[e.type];
                    const rk = RU_RISK[e.risk];
                    return (
                      <button className="ru-event" key={e.id} onClick={() => setActiveEv(e)}>
                        <div className="ru-event-time">
                          <div className="t">{e.time}</div>
                          <div className="d">{e.date}</div>
                        </div>
                        <div className="ru-event-rail">
                          <span className="ru-event-dot" style={{ color: ty.dot, background: ty.dot }} />
                          <span className="ru-event-line" />
                        </div>
                        <div className="ru-event-main">
                          <div className="ru-event-act">{e.act}</div>
                          <div className="ru-event-meta">
                            <span className="ru-type-tag" style={{ color: ty.c, background: ty.bg }}>{ty.label}</span>
                            <span className="ru-actor" data-ai={e.aiActor}><Icon name={e.aiActor ? 'bot' : 'user-round-check'} size={12} color={e.aiActor ? 'var(--ai)' : 'var(--text-500)'} />{e.actor}</span>
                            <span className="ru-event-proj">{e.proj}</span>
                            {e.risk !== 'info' && <span className="ru-risk-flag" style={{ color: rk.c, background: rk.bg }}><Icon name={rk.icon} size={11} color={rk.c} />{rk.label}</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <RuleEventDrawer ev={activeEv} onClose={() => setActiveEv(null)} onNavigate={onNavigate} />
      <RuleDrawer rule={activeRule} ratified={activeRule ? !!ratified[activeRule.id] : false} onClose={() => setActiveRule(null)} onNavigate={onNavigate} onRatify={(id) => ratifyRule(id)} />      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

Object.assign(window, { RulesAndAudit, RU_EVENTS });
