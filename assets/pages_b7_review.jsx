/* ============================================================
   批 7 · 结项  —  外壳 + 7.1 结项审核（正常结项）
   ------------------------------------------------------------
   作用：项目达成立项预设目标后，AI 自动发起结项、撰写结项材料，管理层审核拍板。
         不同意须说明理由 → AI 据理由判断是否新增目标 / 完善 → 动态更新理想化状态与节点。
   本文件含：结项外壳 ClosurePage（跨项目待结项队列 + 详情）+ 7.1 正常结项 ClosureReview。
         强制结项 ForceClose 在 b7_force.jsx。数据：CL_* / CL_QUEUE 均为 mock。
   ============================================================ */

/* 结项材料 · 三分区（目标达成 / 关键产出 / 过程要点）。 */
const CL_SECTIONS = [
  { n: '一', label: '目标达成', icon: 'target',
    body: '项目以「履约调度全面智能化、时效与成本双优」为理想化状态锚点立项，历时 11 周执行。两条中短期目标——「调度时效提升 30%」与「单均成本下降 15%」——均达成立项预设阈值；三条阶段目标全部验收通过，理想化状态推进度达 92%，满足正常结项条件。' },
  { n: '二', label: '关键产出', icon: 'package',
    list: [
      '智能调度算法灰度放量框架（支持区域 / 时段二维分桶 + 秒级回滚），已全量上线。',
      '异常调度自愈体系，自愈率稳定 91.4%，超过 90% 预设阈值。',
      '实时路况数据双源接入方案（吸取单点失败教训，落地冗余架构）。',
      '一套可复用的「智能调度中台」能力组件与外部依赖治理方法论。',
    ] },
  { n: '三', label: '过程要点', icon: 'route',
    list: [
      '第三方运力 API 联通连续失败，暴露单一外部依赖风险，触发理想化状态复盘并新增「双源冗余」约束。',
      '履约时效阶段曾两次验收未通过、标记卡点，经介入工作台放行采购后达标。',
      '全程 38 项事务、5 名 AI 员工协同，累计算力成本 ¥318,400，无大额成本超支。',
    ] },
];

/* 关键产出汇总 */
const CL_OUTPUTS = [
  { t: '调度算法灰度放量框架 v1.2', s: '研发 · 调度算法 Agent', icon: 'code-xml', c: 'oklch(0.52 0.12 250)', bg: 'oklch(0.966 0.018 250)', tag: '已上线', tagC: 'var(--success)', tagBg: 'var(--success-bg)' },
  { t: '异常自愈规则库 + 检测模型', s: '研发 · 风控建模 Agent', icon: 'shield-check', c: 'oklch(0.52 0.10 175)', bg: 'oklch(0.962 0.020 175)', tag: '已上线', tagC: 'var(--success)', tagBg: 'var(--success-bg)' },
  { t: '实时路况双源接入方案', s: '设计 · 数据接入 Agent', icon: 'milestone', c: 'oklch(0.55 0.13 285)', bg: 'oklch(0.968 0.018 285)', tag: '已交付', tagC: 'var(--info)', tagBg: 'var(--info-bg)' },
  { t: '调度灰度监控面板高保真稿', s: '设计 · 体验设计 Agent', icon: 'layout-dashboard', c: 'oklch(0.55 0.13 285)', bg: 'oklch(0.968 0.018 285)', tag: '已验收', tagC: 'var(--success)', tagBg: 'var(--success-bg)' },
];

/* 达成对照 · 各级目标 */
const CL_GOALS = [
  { lv: '中短期目标', t: '调度时效提升 30%', pct: 100, c: 'var(--success)' },
  { lv: '中短期目标', t: '单均成本下降 15%', pct: 96, c: 'var(--success)' },
  { lv: '阶段目标', t: '履约时效 < 4h', pct: 100, c: 'var(--success)' },
  { lv: '阶段目标', t: '异常自愈率 ≥ 90%', pct: 100, c: 'var(--success)' },
  { lv: '阶段目标', t: '算力成本优化', pct: 88, c: 'var(--blue-primary)' },
];

/* 量化收益 */
const CL_BENEFITS = [
  { v: '+31%', k: '区域履约时效提升', delta: '达标', deltaTone: 'success' },
  { v: '-15.4%', k: '单均调度成本', delta: '达标', deltaTone: 'success' },
  { v: '91.4%', k: '异常调度自愈率' },
  { v: '¥318.4k', k: '累计投入 · 无超支' },
];

/* 留痕归档 */
const CL_ARCHIVE = [
  { text: '全生命周期 38 项事务、所有验收与决策留痕 append-only 永久封存', icon: 'lock', tone: 'success' },
  { text: '结项材料与关键经验沉淀进知识库，标记「立项时可借鉴」', icon: 'library', tone: 'blue' },
  { text: '5 名参与 AI 员工的工作日志与产出记录归入各自档案', icon: 'bot', tone: 'ai' },
  { text: '占用的算力与 AI 员工配额已释放回项目集资源池', icon: 'gauge', tone: 'neutral' },
];

/* ---------- 7.1 结项审核（内容体） ----------
   ClosureReview：状态机 decision：pending 待拍板 → 同意 passed / 不同意 reasoning 填理由
     → evaluating AI 据理由重评。呈现结项材料 + 产出汇总 + 达成对照 + 审核决策。 */
function ClosureReview({ loading, onNavigate, onToast }) {
  const [decision, setDecision] = React.useState('pending'); // pending 待拍板 | reasoning 填理由 | evaluating 重评中 | passed 已同意
  const [reason, setReason] = React.useState('');
  React.useEffect(() => { refreshIcons(); });

  if (loading) {
    return (
      <div className="cl-layout">
        <div className="cl-main"><Card style={{ padding: 20 }}><Skel w="40%" h={18} /><Skel w="100%" h={140} r={10} style={{ marginTop: 16 }} /></Card></div>
        <div className="cl-rail"><Card style={{ padding: 20 }}><Skel w="60%" h={16} /><Skel w="100%" h={120} style={{ marginTop: 14 }} /></Card></div>
      </div>
    );
  }

  const submitReject = () => {
    setDecision('evaluating');
    onToast && onToast('已提交「不同意」理由 · AI 正据理由重新评估');
  };

  return (
    <>
      <div className="cl-initiate">
        <span className="cl-initiate-ico"><Icon name="package-check" size={22} color="var(--closure)" /></span>
        <div className="cl-initiate-main">
          <div className="cl-initiate-t">AI 自动发起结项审核<span className="cl-type normal"><Icon name="check-check" size={13} color="var(--closure)" />正常结项</span></div>
          <div className="cl-initiate-s">验收闭环检测到项目已达成立项预设目标（理想化状态推进度 92%），AI 已汇总全生命周期产出并撰写结项材料，待管理层审核拍板。</div>
        </div>
        <span className="pill" style={{ background: 'var(--ai-soft)', color: 'var(--ai)', flex: 'none' }}><Icon name="bot" size={13} color="var(--ai)" />AI 已撰写</span>
      </div>

      <div className="cl-layout">
        {/* 左：结项材料 + 产出汇总 */}
        <div className="cl-main">
          <div className="cl-material">
            <div className="cl-material-head">
              <Icon name="file-text" size={18} color="var(--closure)" />
              <span className="t">结项材料 · 全生命周期汇总</span>
              <span className="by"><Icon name="bot" size={13} color="var(--text-400)" />结项归纳 Agent · 06-14 撰写</span>
            </div>
            {CL_SECTIONS.map(s => (
              <div className="cl-sec" key={s.n}>
                <div className="cl-sec-label"><span className="n">{s.n}</span><Icon name={s.icon} size={15} color="var(--closure)" />{s.label}</div>
                {s.body && <div className="cl-sec-body">{s.body}</div>}
                {s.list && (
                  <ul className="cl-sec-list">
                    {s.list.map((it, i) => <li key={i}><span className="dot" />{it}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <Card style={{ padding: '18px 20px' }}>
            <div className="cl-card-label"><Icon name="boxes" size={14} color="var(--text-400)" />关键产出汇总 · {CL_OUTPUTS.length} 项</div>
            <div className="cl-outputs">
              {CL_OUTPUTS.map((o, i) => (
                <div className="cl-output" key={i}>
                  <span className="cl-output-ico" style={{ background: o.bg }}><Icon name={o.icon} size={17} color={o.c} /></span>
                  <div className="cl-output-main">
                    <div className="cl-output-t">{o.t}</div>
                    <div className="cl-output-s">{o.s}</div>
                  </div>
                  <span className="cl-output-tag" style={{ color: o.tagC, background: o.tagBg }}>{o.tag}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ padding: '18px 20px' }}>
            <div className="cl-card-label"><Icon name="trending-up" size={14} color="var(--text-400)" />量化收益 · 对比立项基线</div>
            <DocStats items={CL_BENEFITS} />
          </Card>

          <Card style={{ padding: '18px 20px' }}>
            <div className="cl-card-label"><Icon name="archive" size={14} color="var(--text-400)" />留痕归档</div>
            <DocList items={CL_ARCHIVE} />
          </Card>
        </div>

        {/* 右：达成对照 + 审核决策 */}
        <div className="cl-rail">
          <div className="cl-card">
            <div className="cl-card-label"><Icon name="target" size={14} color="var(--text-400)" />达成对照 · 理想化状态</div>
            <div className="cl-ideal">
              <Ring value={92} size={64} stroke={7} color="var(--success)" showVal={false} />
              <div className="cl-ideal-main">
                <div className="cl-ideal-pct">92%</div>
                <div className="cl-ideal-k">理想化状态推进度 · 达成正常结项条件</div>
              </div>
            </div>
            {CL_GOALS.map((g, i) => (
              <div className="cl-goal-row" key={i}>
                <span className="cl-goal-ico" style={{ background: g.pct >= 100 ? 'var(--success-bg)' : 'var(--blue-tint)' }}><Icon name={g.pct >= 100 ? 'circle-check' : 'milestone'} size={14} color={g.c} /></span>
                <div className="cl-goal-main">
                  <div className="cl-goal-lv">{g.lv}</div>
                  <div className="cl-goal-t">{g.t}</div>
                </div>
                <span className="cl-goal-pct" style={{ color: g.c }}>{g.pct}%</span>
              </div>
            ))}
          </div>

          <div className="cl-decision">
            {decision === 'passed' ? (
              <div className="cl-decision-q"><Icon name="circle-check" size={18} color="var(--success)" />管理层审核：已同意结项</div>
            ) : decision === 'evaluating' ? (
              <div className="cl-decision-q"><Icon name="loader-2" size={18} color="var(--ai)" className="spin" />AI 正据理由重新评估</div>
            ) : (
              <>
                <div className="cl-decision-q"><Icon name="gavel" size={18} color="var(--closure)" />管理层审核拍板</div>
                <div className="cl-decision-s">这是项目收尾的大决策。同意即结项并沉淀进知识库；不同意须说明理由，AI 将据理由判断是否新增目标 / 完善，并动态更新理想化状态与节点。</div>
              </>
            )}

            {decision === 'pending' && (
              <div className="cl-decision-btns">
                <Button variant="primary" icon="check" onClick={() => setDecision('passed')}>同意结项</Button>
                <Button variant="secondary" icon="x" onClick={() => setDecision('reasoning')}>不同意</Button>
              </div>
            )}

            {decision === 'reasoning' && (
              <div className="cl-reason">
                <div className="cl-reason-label">不同意理由（AI 将据此重新评估）</div>
                <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="例如：成本优化阶段仍有 12% 提升空间，建议新增一个收尾阶段目标后再结项…" />
                <div className="cl-decision-btns">
                  <Button variant="primary" icon="send" onClick={submitReject} disabled={!reason.trim()}>提交理由</Button>
                  <Button variant="secondary" onClick={() => setDecision('pending')}>取消</Button>
                </div>
              </div>
            )}

            {decision === 'evaluating' && (
              <>
                <div className="cl-ai-eval">
                  <Icon name="loader-2" size={20} color="var(--ai)" className="spin" />
                  <div className="cl-ai-eval-main">
                    <div className="cl-ai-eval-t">据理由重新评估中</div>
                    <div className="cl-ai-eval-s">解析管理层理由，判断是否需新增目标或完善后再结项。</div>
                  </div>
                </div>
                <div className="cl-ai-eval-steps">
                  <div className="cl-ai-eval-step"><Icon name="circle-check" size={15} color="var(--success)" className="ico" />已解析理由：成本优化仍有空间</div>
                  <div className="cl-ai-eval-step"><Icon name="loader-2" size={15} color="var(--ai)" className="ico spin" />正在草拟「成本收尾」阶段目标并更新理想化状态推进预期</div>
                </div>
                <div className="cl-decision-btns" style={{ marginTop: 14 }}>
                  <Button variant="secondary" icon="git-fork" onClick={() => onNavigate && onNavigate('p-tree')}>查看目标树更新</Button>
                  <Button variant="text" onClick={() => setDecision('pending')}>重置演示</Button>
                </div>
              </>
            )}

            {decision === 'passed' && (
              <>
                <div className="cl-passed">
                  <Icon name="library" size={20} color="var(--success)" />
                  <div className="cl-passed-main">
                    <div className="cl-passed-t">结项通过 · 成果已沉淀进知识库</div>
                    <div className="cl-passed-s">结项材料与关键经验已进入知识库，供新项目立项借鉴，全程留痕。</div>
                  </div>
                </div>
                <div className="cl-decision-btns" style={{ marginTop: 14 }}>
                  <Button variant="primary" icon="library" onClick={() => onNavigate && onNavigate('knowledge')}>查看知识库沉淀</Button>
                  <Button variant="text" onClick={() => setDecision('pending')}>重置演示</Button>
                </div>
              </>
            )}
          </div>

          <FeedbackEntry label="对结项材料留意见"
            context={{ scene: '结项 · 结项材料', did: '当前查看本项目的完整结项报告（目标达成、收益、复盘、留痕归档），AI 已撰写并等待管理层审核拍板', ask: '结项材料中的某一项结论、量化收益或复盘要点' }}
            onClick={() => {}} />
        </div>
      </div>
    </>
  );
}

/* ============================================================
   外壳：结项审批（组合级 · 跨项目）
   ------------------------------------------------------------
   结项是项目生命周期的终点闸门：由 AI 发起、管理层拍板。
   运行中的项目不展示结项入口——只有触发结项条件的项目才进入此队列。
   两种触发：正常结项（达成目标）/ 强制结项（战略变化）。
   ============================================================ */
const CL_TYPE = {
  normal: { label: '正常结项', icon: 'check-check', c: 'var(--closure)', bg: 'var(--closure-bg)', bd: 'var(--closure-bd)', trigK: '触发条件' },
  force:  { label: '强制结项', icon: 'octagon-alert', c: 'var(--danger)', bg: 'var(--danger-bg)', bd: 'var(--danger)', trigK: '触发原因' },
};

/* 跨项目待结项队列（达到结项条件的项目才在此出现） */
const CL_QUEUE = [
  {
    id: 'sched', type: 'normal', project: '智能履约调度中台', pid: 'PRJ-2026-0137', owner: '何沛',
    waited: '等待 1 天',
    trigger: '验收闭环检测到理想化状态推进度达 92%，两条中短期目标与三条阶段目标全部达成立项预设阈值。',
    metricK: '理想化状态推进度', metricV: '92%',
    ai: 'AI 已汇总全生命周期 38 项事务产出并撰写结项材料，建议同意结项并沉淀进知识库。',
  },
  {
    id: 'outbound', type: 'force', project: '智能外呼增长助手', pid: 'PRJ-2026-0151', owner: '周岚',
    waited: '等待 3 天',
    trigger: '战略调整：增长重心转向私域，外呼增长方向收缩，该项目剩余目标不再投入资源。',
    metricK: '已完成目标', metricV: '4 / 9',
    ai: 'AI 已分析当前产出与可迁移能力，生成强制结项报告，须管理层审批 + 负责人双重确认。',
  },
];

/* ---------- 待结项队列卡片 ---------- */
function ClosureQueueCard({ item, onOpen }) {
  const t = CL_TYPE[item.type];
  return (
    <button className="iv-card cl-qcard" onClick={() => onOpen(item)}>
      <span className="iv-card-bar" style={{ background: t.c }} />
      <div className="iv-card-main">
        <div className="iv-card-top">
          <span className="iv-proj">{item.project}</span>
          <span className="mono iv-pid">{item.pid}</span>
          <span className="iv-type-tag" style={{ color: t.c, background: t.bg }}><Icon name={t.icon} size={13} color={t.c} />{t.label}</span>
          <span className="iv-waited mono"><Icon name="clock" size={13} color="var(--text-400)" />{item.waited}</span>
        </div>
        <div className="ivx-why-line"><Icon name="git-pull-request-arrow" size={13} color={t.c} /><span className="ivx-why-label">{t.trigK}</span>{item.trigger}</div>
        <div className="cl-qcard-foot">
          <span className="cl-qcard-metric"><Icon name="target" size={13} color={t.c} />{item.metricK}<b className="mono" style={{ color: t.c }}>{item.metricV}</b></span>
          <span className="cl-qcard-owner"><span className="pl-ava sm">{item.owner[0]}</span>负责人 {item.owner}</span>
          <span className="iv-ai cl-qcard-ai"><Icon name="bot" size={13} color="var(--ai)" /><span className="iv-ai-label">AI 已撰写</span>{item.ai}</span>
        </div>
      </div>
      <span className="pill" style={{ background: t.bg, color: t.c, flex: 'none', alignSelf: 'center' }}>待拍板</span>
      <Icon name="chevron-right" size={18} color="var(--text-400)" />
    </button>
  );
}

/* ClosurePage — 结项审批外壳（组合级）。
   状态：sel=null 显示跨项目待结项队列；sel 为某条时进入该项目结项详情。
   详情按 sel.type 分发：normal → ClosureReview；force → ForceClose（b7_force.jsx）。 */
function ClosurePage({ onNavigate, onEnterProject }) {
  const [sel, setSel] = React.useState(null);   // null=队列；否则=某条结项详情
  const [loading, setLoading] = React.useState(true);
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => { setLoading(true); const t = setTimeout(() => setLoading(false), sel ? 700 : 600); return () => clearTimeout(t); }, [sel]);
  React.useEffect(() => { refreshIcons(); });
  const fireToast = (msg) => setToast({ msg });

  /* ---- 详情：某项目的结项审核 / 强制结项 ---- */
  if (sel) {
    const t = CL_TYPE[sel.type];
    return (
      <div className="content-inner page-fade">
        <Breadcrumb items={[{ label: '项目管理工作台', route: 'closure' }, { label: '结项审批', route: 'closure' }, { label: sel.project }]} />
        <div className="page-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="cl-back" onClick={() => setSel(null)} title="返回结项审批队列"><Icon name="arrow-left" size={18} color="var(--text-500)" /></button>
            <span className="page-head-ico" style={{ background: t.bg }}><Icon name={t.icon} size={22} color={t.c} /></span>
            <div>
              <h1 className="t-h1">{sel.project}</h1>
              <div className="cl-head-sub"><span className="mono">{sel.pid}</span><span className="cl-head-dot" /><span style={{ color: t.c, fontWeight: 600 }}>{t.label}</span><span className="cl-head-dot" />负责人 {sel.owner}</div>
            </div>
          </div>
          <div className="page-head-right">
            <Button variant="text" icon="box" onClick={() => onEnterProject && onEnterProject({ name: sel.project, pid: sel.pid })}>进入项目工作区</Button>
            <FeedbackEntry
              context={{ scene: `结项审批 · ${t.label}`, did: `当前审核「${sel.project}」的${t.label}材料，AI 已撰写并等待管理层拍板`, ask: '结项材料、达成判定或处置建议' }}
              onClick={() => fireToast('异步反馈入口已打开（演示）')} />
          </div>
        </div>

        {sel.type === 'normal'
          ? <ClosureReview loading={loading} onNavigate={onNavigate} onToast={fireToast} />
          : <ForceClose loading={loading} onNavigate={onNavigate} onToast={fireToast} />}

        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  /* ---- 队列：跨项目待结项 ---- */
  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: '项目管理工作台' }, { label: '结项审批' }]} />
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico" style={{ background: 'var(--closure-bg)' }}><Icon name="package-check" size={22} color="var(--closure)" /></span>
          <div>
            <h1 className="t-h1">结项审批</h1>
          </div>
        </div>
        <div className="page-head-right">
          <FeedbackEntry
            context={{ scene: '项目管理工作台 · 结项审批', did: '正在跨项目审视 AI 发起的结项申请', ask: '结项材料、达成判定或强制结项的处置逻辑' }}
            onClick={() => fireToast('异步反馈入口已打开（演示）')} />
        </div>
      </div>

      {/* 生命周期闸门 · 概念条 */}
      <div className="cl-model">
        <span className="cl-model-ico"><Icon name="package-check" size={20} color="var(--closure)" /></span>
        <div className="cl-model-main">
          <div className="cl-model-t">结项是项目生命周期的终点闸门，由 AI 发起、管理层拍板</div>
          <div className="cl-model-s">达成立项目标后 AI 自动发起<b>正常结项</b>；战略变化使某方向不再投入时被动触发<b>强制结项</b>。运行中的项目不展示结项入口——只有触发结项条件的项目才进入此队列。通过后成果沉淀进<button className="cl-inline-link" onClick={() => onNavigate && onNavigate('knowledge')}>知识库</button>，供新项目立项借鉴，形成良性循环。</div>
        </div>
        <div className="cl-model-stats">
          <div className="cl-model-stat"><span className="cl-model-stat-v mono" style={{ color: 'var(--closure)' }}>{loading ? '—' : CL_QUEUE.length}</span><span className="cl-model-stat-k">待审批结项</span></div>
        </div>
      </div>

      {loading ? (
        <div className="iv-list">{[0, 1].map(i => (
          <div className="iv-card" key={i} style={{ cursor: 'default' }}>
            <span className="iv-card-bar" style={{ background: 'var(--divider)' }} />
            <div className="iv-card-main">
              <div style={{ display: 'flex', gap: 10 }}><Skel w={150} h={14} /><Skel w={100} h={14} /></div>
              <Skel w="88%" h={13} style={{ marginTop: 12 }} />
              <Skel w="62%" h={12} style={{ marginTop: 12 }} />
            </div>
          </div>
        ))}</div>
      ) : (
        <>
          <div className="cl-q-label"><span className="t-label-caps">待结项项目 · 跨项目聚合</span><span className="mono cl-q-count">{CL_QUEUE.length}</span></div>
          <div className="iv-list">
            {CL_QUEUE.map(item => <ClosureQueueCard key={item.id} item={item} onOpen={setSel} />)}
          </div>
        </>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

Object.assign(window, { ClosurePage, ClosureReview, CL_SECTIONS, CL_OUTPUTS, CL_GOALS, CL_QUEUE, CL_TYPE });
