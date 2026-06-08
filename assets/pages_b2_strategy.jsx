/* ============================================================
   页面 2.1 · 战略层  +  2.2 · 项目备选池（组合级）
   ------------------------------------------------------------
   业务模型：战略从外部进入、立项全 AI 自主。本平台不生产战略，只接收
         外部「顶层战略 Agent」推送，比对更新、判断影响、向下传导。

   本文件包含三块：
     ① 异步反馈子系统（FeedbackEntry / ActionReviewDialog 等）—— 全平台复用的「对话式反馈」：
        识别当前对象 → 引导输入 → 识别意图并给出调整方向 → 确认后执行 / 往复迭代。
     ② StrategyLayer（战略层页）—— 按日期版本 + 项目集查看战略文档、更新点、AI 已执行动作。
     ③ CandidatePool（备选池页）—— 候选项目多维评分 + 门槛判定 + 自动立项。
   数据：本文件内 STRATEGY_* / PORTFOLIO_IMPACT / CANDIDATES 等均为 mock。
   ============================================================ */

/* ====== 异步反馈子系统（通用）====== */

/* 反馈分类（预留，当前以自由文本为主）。 */
const FEEDBACK_CATS = ['理解偏差', '结论存疑', '补充信息', '其他建议'];

/* fbSubject — 由按钮文案推断本次反馈针对的对象。
   例如「对复盘结论留意见」→ 主题「复盘结论」。传入 context 时优先用 context。 */
function fbSubject(label, context) {
  if (context) return context;
  if (!label) return '';
  const s = label.replace(/^对/, '').replace(/(留意见|留言|反馈|意见)$/g, '').trim();
  return (!s || s === '异步' || s === '异步反馈') ? '' : s;
}

const FB_INTENT_LABEL = {
  revoke: '撤销 / 回撤', close: '终止 / 移除', rework: '返工 / 重做',
  reprioritize: '调整优先级', adjust: '调整内容',
};

/* 引导语 · 结合当前模块抓取到的信息，给出针对性的提示（而非千篇一律的一句话） */
function fbIntro({ scene, did, ask } = {}, subj) {
  const tailAsk = ask ? `如果你对${ask}有异议` : (subj ? `如果你对「${subj}」里 AI 的判断或产出有异议` : '如果你对这里 AI 的判断或产出有异议');
  const tail = `${tailAsk}，用一段话告诉我，我会识别你的意图、先给出一个调整方向，你确认后我再执行。`;
  if (scene || did) {
    const head = scene ? `我已读取「${scene}」当前的情况` : '我已读取当前模块的情况';
    return `${head}${did ? `：${did}。` : '。'}${tail}`;
  }
  if (subj) return `我已读取「${subj}」相关内容。${tail}`;
  return `我已读取当前模块的情况。${tail}`;
}

/* 通用处理方案 · 适配全平台任意反馈对象 */
function fbBuildPlan(subject, intent) {
  const s = subject || '当前内容';
  const S = (icon, text) => ({ icon, text });
  const trace = S('history', '本次反馈、识别到的意图与处理过程全部写入留痕，可随时回溯');
  const reassess = S('git-fork', `重新评估对「${s}」相关下游内容的影响并同步`);
  if (intent === 'revoke' || intent === 'close') return {
    summary: `我理解你认为「${s}」当前的 AI 判断 / 处理需要撤回或移除。我将：`,
    steps: [S('undo-2', `撤回「${s}」的当前结论 / 动作，回退到本次变更前的状态`), reassess, trace],
  };
  if (intent === 'rework') return {
    summary: `我理解你认为「${s}」做得不到位、需要返工。我将：`,
    steps: [S('refresh-cw', `按你的反馈重做「${s}」并重新生成结论`), reassess, trace],
  };
  if (intent === 'reprioritize') return {
    summary: `我理解你希望调整「${s}」的优先级 / 节奏。我将：`,
    steps: [S('arrow-up-down', `按你的反馈调整「${s}」的优先级与处理顺序`), trace],
  };
  return {
    summary: `我理解你希望进一步调整「${s}」。我将：`,
    steps: [S('pencil-line', `按你的反馈修订「${s}」的相关内容`), reassess, trace],
  };
}

/* FeedbackEntry — 全平台统一的异步反馈入口（一个按钮 + 对话式抽屉）。
   交互状态机（这是本平台最核心的交互模式，多处复用）：
     ① 点按钮 → open=true 打开抽屉；抽屉打开后先清空消息、进入 thinking，850ms 后
        推送一条 AI 引导语（fbIntro，结合当前模块上下文）。
     ② 用户输入发送 → detectIntent() 识别意图 → 850ms 后返回一条 plan 消息（fbBuildPlan）。
     ③ 点「确认并执行」→ execute()：标记该条已执行、追加一条完成消息，并回调父级 onClick（确认动作）。
     ④ 不满意可继续输入 → 重新走 ②，形成往复迭代。
   副作用：msgs/thinking 变化时自动滚到底（bodyRef）。快捷键：Cmd/Ctrl+Enter 发送。
   props：label 按钮文案；onClick 执行后的确认回调；context 当前模块上下文；subject 显式指定反馈对象。 */
function FeedbackEntry({ label = '异步反馈', onClick, title = '异步反馈', context, subject }) {
  const [open, setOpen] = React.useState(false);
  const [msgs, setMsgs] = React.useState([]);
  const [text, setText] = React.useState('');
  const [thinking, setThinking] = React.useState(false);
  const bodyRef = React.useRef(null);
  const taRef = React.useRef(null);
  const subj = fbSubject(label, subject);

  React.useEffect(() => {
    if (!open) return;
    setMsgs([]);
    setText('');
    setThinking(true);
    const t = setTimeout(() => {
      setMsgs([{ role: 'ai', type: 'text', content: fbIntro(typeof context === 'object' ? context : (context ? { did: context } : null), subj) }]);
      setThinking(false);
      setTimeout(() => taRef.current && taRef.current.focus(), 60);
    }, 850);
    return () => clearTimeout(t);
  }, [open]);

  React.useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, thinking]);

  const send = () => {
    const t = text.trim();
    if (!t || thinking) return;
    const intent = detectIntent(t);
    setMsgs(m => [...m, { role: 'user', type: 'text', content: t }]);
    setText('');
    setThinking(true);
    setTimeout(() => {
      const plan = fbBuildPlan(subj, intent);
      setThinking(false);
      setMsgs(m => [...m, { role: 'ai', type: 'plan', intent, plan }]);
    }, 850);
  };

  const execute = (mi) => {
    setMsgs(m => m.map((msg, i) => i === mi ? { ...msg, done: true } : msg));
    setMsgs(m => [...m, { role: 'ai', type: 'text', content: `已按方案执行完成${subj ? `，并对「${subj}」重新评估` : ''}。本次往返已全部写入留痕。` }]);
    if (typeof onClick === 'function') onClick();
  };

  return (
    <>
      <button className="feedback-entry" onClick={() => setOpen(true)}>
        <Icon name="message-square-text" size={15} color="var(--text-500)" />{label}
      </button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        width={460}
        title={title}
        sub={subj ? `针对「${subj}」· 由对应 AI 异步处理并写入留痕` : '反馈异步进入系统层 · 由对应 AI 处理并写入留痕'}
        icon={{ name: 'message-square-text' }}
        footer={
          <div className="afb-input">
            <textarea
              ref={taRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); }}
              placeholder="用一段话说明你的意见、疑问或希望的调整…"
              rows={2}
            />
            <Button variant="primary" icon="send" onClick={send} disabled={!text.trim() || thinking}>发送</Button>
          </div>
        }
      >
        <div className="afb" ref={bodyRef}>
          {msgs.map((m, i) => (
            <div className={`afb-msg afb-${m.role}`} key={i}>
              {m.role === 'ai' && <span className="afb-ava"><Icon name="sparkles" size={13} color="var(--ai)" /></span>}
              <div className="afb-bubble">
                {m.type === 'text' && <p>{m.content}</p>}
                {m.type === 'plan' && (
                  <div className="afb-plan">
                    <div className="afb-plan-intent"><Icon name="scan-search" size={13} color="var(--ai)" />识别意图 · {FB_INTENT_LABEL[m.intent]}</div>
                    <p className="afb-plan-sum">{m.plan.summary}</p>
                    <div className="afb-steps">
                      {m.plan.steps.map((s, j) => (
                        <div className="afb-step" key={j}>
                          <span className="afb-step-no">{j + 1}</span>
                          <Icon name={s.icon} size={14} color="var(--text-500)" />
                          <span>{s.text}</span>
                        </div>
                      ))}
                    </div>
                    {m.done ? (
                      <div className="afb-done"><Icon name="check-circle-2" size={14} color="var(--success)" />已执行</div>
                    ) : (
                      <div className="afb-plan-foot">
                        <Button variant="primary" size="sm" icon="check" onClick={() => execute(i)}>确认并执行</Button>
                        <span className="afb-plan-hint">不满意？在下方继续补充，我会修改方案</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="afb-msg afb-ai">
              <span className="afb-ava"><Icon name="sparkles" size={13} color="var(--ai)" /></span>
              <div className="afb-bubble"><span className="afb-typing"><i /><i /><i /></span></div>
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
}

/* ============================================================
   2.1 · 战略层
   ============================================================ */

const STRATEGY_VERSIONS = [
  { date: '06-02', full: '2026-06-02', tag: '今日 · 当前', cur: true },
  { date: '06-01', full: '2026-06-01', tag: '昨日' },
  { date: '05-31', full: '2026-05-31', tag: '' },
  { date: '05-30', full: '2026-05-30', tag: '' },
  { date: '05-29', full: '2026-05-29', tag: '' },
];

const STRATEGY_CLAUSES = [
  { no: '01', name: '战略主轴：以「自助化优先」重塑客户服务体系', kicker: '总纲 · 全域适用',
    change: { k: 'adjust', label: '本次调整' }, pf: ['service'],
    relate: { service: '直接重塑本项目集的服务导向，是承接「自助化优先」主轴的核心战场。' },
    body: '将客户服务的核心导向由「效率优先」调整为「自助化优先」，要求各服务类项目优先建设客户可自助完成的能力闭环，人工坐席退居复杂与情感场景。',
    prev: '上一版表述为「效率优先：以缩短响应与处理时长为首要目标」。' },
  { no: '02', name: '增长重心：区域下沉市场履约网络扩张', kicker: '增长 · 高权重', pf: ['fulfill', 'growth'],
    relate: { fulfill: '维持本项目集运力与网点扩张的资源倾斜、算力配额优先级不变。', growth: '下沉市场为增长第一引擎，关联本项目集的获客与履约协同。' },
    body: '继续将下沉市场的履约时效与覆盖密度作为增长第一引擎，维持资源倾斜与算力配额优先级不变。' },
  { no: '03', name: '新增方向：构建供应链风险预警中台', kicker: '能力 · 新设',
    change: { k: 'add', label: '本次新增' }, pf: ['fulfill'],
    relate: { fulfill: '新增横向方向，将沉淀为本项目集候选，并与现有履约调度联动。' },
    body: '面向供应链中断、价格波动与供应商履约风险，建立跨域统一的实时预警能力，作为新的横向中台沉淀，向下传导为可立项的候选方向。' },
  { no: '04', name: '收缩方向：暂停线下门店数字化改造投入', kicker: '收缩 · 资源回收',
    change: { k: 'shrink', label: '本次收缩' }, pf: ['growth'],
    relate: { growth: '收缩方向命中本项目集线下门店相关在跑项目，需评估强制结项。' },
    body: '鉴于线下客流持续向线上迁移，暂停门店数字化相关的新增投入，存量在跑项目需评估强制结项，释放的算力与人力回流至自助化与供应链方向。' },
  { no: '05', name: '能力基线：全域数据资产统一治理', kicker: '基线 · 长期', pf: ['data'],
    relate: { data: '维持本项目集统一治理基线不变，治理类项目保持常态推进。' },
    body: '维持数据口径、血缘与质量的统一治理基线不变，为上述各方向提供一致的数据底座，治理类项目保持常态推进。' },
];

const STRATEGY_UPDATES = [
  { k: 'adjust', pf: ['service'], text: '战略主轴由「**效率优先**」调整为「**自助化优先**」，服务类项目导向随之重排。' },
  { k: 'add', pf: ['fulfill'], text: '新增横向方向「**供应链风险预警中台**」，将沉淀为备选池候选。' },
  { k: 'shrink', pf: ['growth'], text: '收缩「**线下门店数字化改造**」，相关在跑项目需进入强制结项评估。' },
];

/* 本次战略更新对各「项目集」下具体项目的影响
   三个层面：新立项目 / 加入备选池 / 对现有项目的影响（含母项目→子项目、关键信息调整、结项） */
const PORTFOLIO_IMPACT = {
  service: {
    affected: true,
    uptake: [
      { name: '客服知识中枢重构', parent: true,
        ops: [
          { field: '核心价值', op: 'modify',
            before: '以缩短人工响应时长、提升坐席处理效率为核心衡量。',
            after: '以客户自助完成率为核心价值，人工坐席退为复杂与情感场景的兜底。' },
          { field: '中短期目标', op: 'modify',
            before: '客服平均响应时长压缩至 30 秒以内。',
            after: '客服自助率 ≥ 70%，人工工单量同比下降 30%。' },
        ] },
      { name: '智能工单分派系统', parent: false,
        ops: [
          { field: '目标用户', op: 'modify',
            before: '以一线客服坐席为主要使用对象。',
            after: '新增 C 端自助用户为一级使用对象，坐席转为协同角色。' },
        ] },
    ],
    newSub: [
      { parent: '客服知识中枢重构',
        goalOp: 'add',
        goal: '理想化状态新增「常见诉求自助完成率 ≥ 80%」（原目标未覆盖自助场景）',
        sub: '多模态自助知识库',
        subDesc: '融合文本 / 图片 / 语音的自助知识闭环，承接母项目新增的自助率目标。',
        status: '进入备选池分析' },
    ],
    pool: [
      { name: '智能客服自助引擎', prev: 82, score: 88, threshold: 80, result: 'charter' },
      { name: '多模态工单理解', prev: 59, score: 62, threshold: 80, result: 'hold', note: '分值上调但未达门槛，作为备选信息沉淀池中，每日复盘。' },
    ],
  },
  fulfill: {
    affected: true,
    uptake: [
      { name: '智能履约调度中台', parent: true,
        ops: [
          { field: '核心价值', op: 'modify',
            before: '以履约时效与运力利用率最优为核心。',
            after: '在时效最优基础上，新增「供应链风险可预警、可联动」的核心价值。' },
        ] },
    ],
    newSub: [
      { parent: '智能履约调度中台',
        goalOp: 'add',
        goal: '里程碑新增「高风险信号 5 分钟内可预警、可联动调度」',
        sub: '风险信号接入与联动',
        subDesc: '接入供应链风险信号并与履约调度联动，承接母项目新增里程碑。',
        status: '进入备选池分析' },
    ],
    pool: [
      { name: '供应链风险预警中台', prev: 51, score: 56, threshold: 80, result: 'hold', note: '外部市场尚不成熟，暂不立项；作为备选信息沉淀池中，每日动态复盘。' },
    ],
  },
  growth: {
    affected: true,
    uptake: [
      { name: '门店选址评估模型', parent: false, closure: true,
        ops: [
          { field: '项目整体', op: 'delete',
            before: '面向线下门店扩张的选址评估数据模型，当前推进至规划 v0.9。',
            reason: '战略收缩「暂停线下门店数字化改造」，存量项目进入强制结项评估。' },
        ] },
    ],
    newSub: [],
    pool: [],
  },
  data: {
    affected: false,
    uptake: [], newSub: [], pool: [],
  },
};

/* 影响分析 · 战略文档进入后逐层处理：现有项目承接 → 新增子项目入池 → 备选池复盘立项 */
const IMPACT_SECTIONS = [
  { key: 'uptake', title: '现有项目承接需求', icon: 'git-fork', color: 'var(--blue-primary)', hint: 'AI 已执行' },
  { key: 'newSub', title: '新增子项目 · 沉淀备选池', icon: 'inbox', color: 'var(--success)' },
  { key: 'pool', title: '备选池动态复盘', icon: 'refresh-cw', color: 'var(--ai)' },
];

const MOVE_COLOR = { success: 'var(--success)', warning: 'var(--warning)', info: 'var(--info)', danger: 'var(--danger)', neutral: 'var(--text-500)' };

/* 项目集选择器（含负责人，默认首个项目集）
   allowNew：追加「新领域 · 全新尝试」目标；portfolios：可覆盖列表（冷启动传空） */
function PortfolioPicker({ value, onChange, allowNew = false, portfolios = PORTFOLIOS, newId = '__new__' }) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (!open) return;
    const h = () => setOpen(false);
    window.addEventListener('click', h);
    return () => window.removeEventListener('click', h);
  }, [open]);
  const empty = portfolios.length === 0;
  const isNew = value === newId;
  const cur = portfolios.find(p => p.id === value);
  const label = isNew ? '新领域 · 全新尝试' : empty ? '从零开始 · 暂无项目集' : cur ? cur.name : '选择项目集';
  return (
    <div className="st-pf-pick" onClick={(e) => e.stopPropagation()}>
      <button className="st-pf-btn" data-on={true} data-new={isNew || empty} onClick={() => setOpen(o => !o)}>
        <Icon name={isNew || empty ? 'sparkles' : 'layers'} size={15} color={isNew || empty ? 'var(--ai)' : 'var(--blue-primary)'} />
        <span className="st-pf-label">{label}</span>
        {!isNew && !empty && cur && <span className="st-pf-owner">{cur.owner}</span>}
        <Icon name="chevron-down" size={14} color="var(--text-400)" />
      </button>
      {open && (
        <div className="st-pf-menu">
          {empty && <div className="st-pf-menu-empty"><Icon name="inbox" size={13} color="var(--text-400)" />系统暂无项目集 · 从「新领域」开始构建第一个</div>}
          {portfolios.map(p => {
            const aff = PORTFOLIO_IMPACT[p.id] && PORTFOLIO_IMPACT[p.id].affected;
            return (
              <button key={p.id} className="st-pf-opt" data-on={value === p.id} onClick={() => { onChange(p.id); setOpen(false); }}>
                <span>{p.name}</span>
                <span className="st-pf-opt-sub">负责人 {p.owner}</span>
                <span className="st-pf-dot" data-aff={aff} title={aff ? '本次受影响' : '本次无影响'} />
                {value === p.id && <Icon name="check" size={15} color="var(--blue-primary)" />}
              </button>
            );
          })}
          {allowNew && (
            <>
              {!empty && <div className="st-pf-menu-sep" />}
              <button className="st-pf-opt st-pf-opt-new" data-on={isNew} onClick={() => { onChange(newId); setOpen(false); }}>
                <Icon name="sparkles" size={14} color="var(--ai)" />
                <span>新领域 · 全新尝试</span>
                <span className="st-pf-opt-sub">AI 判断是否新建项目集</span>
                {isNew && <Icon name="check" size={15} color="var(--ai)" />}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- 异步反馈 · 意图识别 + 处理方案 ----------
   detectIntent：用正则关键词把用户自然语言归类为五种意图之一。
     ⚠ 真实开发：这是规则式模拟，应替换为 NLU / 大模型意图识别。 */
function detectIntent(text) {
  const t = text || '';
  if (/撤销|撤回|回撤|退回|不该|不应|别立项|不立项|取消立项/.test(t)) return 'revoke';
  if (/删除|结项|砍|下线|停掉|停止|关掉|不做/.test(t)) return 'close';
  if (/返工|重做|重新做|做错|错了|不对|方向错|有问题/.test(t)) return 'rework';
  if (/优先级|提前|延后|加急|降级|升级|往后|往前/.test(t)) return 'reprioritize';
  return 'adjust';
}

const INTENT_LABEL = {
  revoke: '撤销 / 回撤', close: '终止 / 结项', rework: '返工 / 重做',
  reprioritize: '调整优先级', adjust: '微调内容',
};

// buildPlan：根据「AI 已执行的动作 action」+「用户意图 intent」生成自然语言处理方案。
// 按 action.kind（charter 立项 / hold 留池 / newSub 新子项 / closure 结项 / modify 修改）分支，
// 每个分支再按 intent 给出不同的 summary + steps（步骤）。返回结构 { summary, steps:[{icon,text}] }。
function buildPlan(action, intent, pfName) {
  const n = action.project;
  const S = (icon, text) => ({ icon, text });
  const trace = S('history', '本条反馈、识别到的意图与回撤动作全过程写入留痕，可再次回溯');

  if (action.kind === 'charter') {
    if (intent === 'revoke' || intent === 'close') return {
      summary: `我理解你认为「${n}」不应被自动立项，希望回撤。我将执行以下动作，并重新评估其影响覆盖面：`,
      steps: [
        S('undo-2', `撤销「${n}」的自动立项，状态回退为「备选」`),
        intent === 'close'
          ? S('package-check', `直接进入结项流程，归档已产出物，不再退回备选池`)
          : S('inbox', `退回项目备选池，保留已完成的多维分析与评分，供下次复盘`),
        S('cpu', `释放其已占用的算力配额与人力，回流至「${pfName}」项目集`),
        S('git-fork', `重新评估覆盖面：解除关联子项目 / 里程碑依赖，受影响项已逐一标注`),
        trace,
      ],
    };
    return {
      summary: `我理解你希望调整「${n}」的立项范围或内容。我将在保留立项状态的前提下：`,
      steps: [
        S('pencil-line', `按你的反馈修订「${n}」的立项目标与范围`),
        S('git-fork', `重新评估对关联子项目与里程碑的影响并同步`),
        trace,
      ],
    };
  }

  if (action.kind === 'hold') {
    if (intent === 'close' || intent === 'revoke') return {
      summary: `我理解你认为「${n}」不必继续留在备选池。我将：`,
      steps: [
        S('archive', `将「${n}」移出备选池，标记为「已搁置」并停止每日复盘`),
        S('git-fork', `重新评估其原关联方向的覆盖面，确认无遗漏需求`),
        trace,
      ],
    };
    if (intent === 'reprioritize') return {
      summary: `我理解你希望调整「${n}」的复盘优先级。我将：`,
      steps: [
        S('arrow-up-down', `按你的反馈调整「${n}」的评分权重与复盘频次`),
        S('refresh-cw', `立即触发一次重新打分，更新其与门槛的差距`),
        trace,
      ],
    };
    return {
      summary: `我理解你希望调整「${n}」的备选评估方式。我将：`,
      steps: [
        S('sliders-horizontal', `按你的反馈修订其多维分析口径并重新打分`),
        trace,
      ],
    };
  }

  if (action.kind === 'newSub') {
    if (intent === 'revoke' || intent === 'close') return {
      summary: `我理解你认为不应新增子项目「${n}」。我将回撤这次拆解：`,
      steps: [
        S('undo-2', `撤回「${n}」，将其移出备选池分析队列`),
        S('git-branch', `回退母项目「${action.parent}」本次新增的关联目标`),
        S('git-fork', `重新评估该需求是否仍需承接，结论已附在留痕中`),
        trace,
      ],
    };
    return {
      summary: `我理解你希望调整子项目「${n}」的范围或归属。我将：`,
      steps: [
        S('pencil-line', `按你的反馈修订「${n}」的目标与说明`),
        S('git-branch', `同步校正其与母项目「${action.parent}」的目标对齐关系`),
        trace,
      ],
    };
  }

  if (action.kind === 'closure') {
    if (intent === 'revoke') return {
      summary: `我理解你认为「${n}」不应被强制结项，希望保留。我将：`,
      steps: [
        S('undo-2', `撤销「${n}」的强制结项评估，恢复为「在跑」`),
        S('cpu', `恢复其原有算力配额与人力占用`),
        S('git-fork', `重新评估其与本次战略收缩的冲突，结论已附在留痕`),
        trace,
      ],
    };
    return {
      summary: `我理解你希望调整「${n}」的结项方式。我将：`,
      steps: [
        S('pencil-line', `按你的反馈修订结项范围（部分保留 / 整体归档）`),
        trace,
      ],
    };
  }

  // modify
  if (intent === 'revoke' || intent === 'rework') return {
    summary: `我理解你认为对「${n}」的本次修改有误，希望回退或返工。我将：`,
    steps: [
      S('undo-2', `回退「${n}」的「${action.detail}」到本次更新前的版本`),
      S('git-fork', `重新评估该回退对其下游目标与子项目的影响`),
      trace,
    ],
  };
  return {
    summary: `我理解你希望进一步调整对「${n}」的修改。我将：`,
    steps: [
      S('pencil-line', `按你的反馈在「${action.detail}」基础上继续修订`),
      S('git-fork', `重新评估修订后的下游影响并同步`),
      trace,
    ],
  };
}

const ACTION_KIND_META = {
  charter:  { label: 'AI 已自动立项', icon: 'circle-check' },
  hold:     { label: 'AI 已留池复盘', icon: 'history' },
  newSub:   { label: 'AI 已新增子项目入池', icon: 'git-branch' },
  closure:  { label: 'AI 已发起强制结项', icon: 'package-check' },
  modify:   { label: 'AI 已修改项目信息', icon: 'pencil-line' },
};

/* ActionReviewDialog — 「复核 AI 已执行动作」的异步反馈对话（与 FeedbackEntry 同构）。
   与 FeedbackEntry 区别：本抽屉是针对某条「AI 已执行动作」(action) 发起的，
     开场先播报该动作，用户提异议后走 detectIntent → buildPlan → execute（含回撤）。
   状态：action 为真时抽屉打开；execute 后通过 onToast 弹提示并可跳「查看留痕」。 */
function ActionReviewDialog({ action, pfName, onClose, onToast }) {
  const open = !!action;
  const [msgs, setMsgs] = React.useState([]);
  const [text, setText] = React.useState('');
  const [thinking, setThinking] = React.useState(false);
  const bodyRef = React.useRef(null);
  const taRef = React.useRef(null);

  React.useEffect(() => {
    if (!action) return;
    const meta = ACTION_KIND_META[action.kind];
    setMsgs([{ role: 'ai', type: 'text', content: `这是 AI 在 ${action.date} 已执行的动作：${meta.label} —「${action.project}」。${action.summary} 如对该动作有异议，请在下方用自然语言告诉我，我会识别你的意图并给出处理方案。` }]);
    setText('');
    setThinking(false);
    setTimeout(() => taRef.current && taRef.current.focus(), 80);
  }, [action]);

  React.useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, thinking]);

  const send = () => {
    const t = text.trim();
    if (!t || thinking) return;
    const intent = detectIntent(t);
    setMsgs(m => [...m, { role: 'user', type: 'text', content: t }]);
    setText('');
    setThinking(true);
    setTimeout(() => {
      const plan = buildPlan(action, intent, pfName);
      setThinking(false);
      setMsgs(m => [...m, { role: 'ai', type: 'plan', intent, plan }]);
    }, 850);
  };

  const execute = (mi) => {
    setMsgs(m => m.map((msg, i) => i === mi ? { ...msg, done: true } : msg));
    setMsgs(m => [...m, { role: 'ai', type: 'text', content: `已按方案执行完成，并对受影响项目重新评估。「${action.project}」的最新状态与本次往返已全部写入留痕。` }]);
    onToast && onToast({ msg: `已执行异步反馈调整 ·「${action.project}」`, action: '查看留痕' });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={480}
      title="异步反馈 · 复核 AI 已执行的动作"
      sub={action ? `${pfName} · ${action.date}` : ''}
      icon={{ name: 'message-square-text' }}
      footer={
        <div className="afb-input">
          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); }}
            placeholder="例如：这个项目不该立项，应该退回备选池…"
            rows={2}
          />
          <Button variant="primary" icon="send" onClick={send} disabled={!text.trim() || thinking}>发送</Button>
        </div>
      }
    >
      <div className="afb" ref={bodyRef}>
        {msgs.map((m, i) => (
          <div className={`afb-msg afb-${m.role}`} key={i}>
            {m.role === 'ai' && <span className="afb-ava"><Icon name="sparkles" size={13} color="var(--ai)" /></span>}
            <div className="afb-bubble">
              {m.type === 'text' && <p>{m.content}</p>}
              {m.type === 'plan' && (
                <div className="afb-plan">
                  <div className="afb-plan-intent"><Icon name="scan-search" size={13} color="var(--ai)" />识别意图 · {INTENT_LABEL[m.intent]}</div>
                  <p className="afb-plan-sum">{m.plan.summary}</p>
                  <div className="afb-steps">
                    {m.plan.steps.map((s, j) => (
                      <div className="afb-step" key={j}>
                        <span className="afb-step-no">{j + 1}</span>
                        <Icon name={s.icon} size={14} color="var(--text-500)" />
                        <span>{s.text}</span>
                      </div>
                    ))}
                  </div>
                  {m.done ? (
                    <div className="afb-done"><Icon name="check-circle-2" size={14} color="var(--success)" />已执行</div>
                  ) : (
                    <div className="afb-plan-foot">
                      <Button variant="primary" size="sm" icon="check" onClick={() => execute(i)}>确认并执行</Button>
                      <span className="afb-plan-hint">不满意？在下方继续补充，我会修改方案</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="afb-msg afb-ai">
            <span className="afb-ava"><Icon name="sparkles" size={13} color="var(--ai)" /></span>
            <div className="afb-bubble"><span className="afb-typing"><i /><i /><i /></span></div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

/* StrategyLayer — 战略层页主体。
   状态：ver 日期版本下标；pf 当前项目集；fbAction 当前复核的动作；open 哪些条款展开。
   核心逻辑：buckets 按选中项目集从 PORTFOLIO_IMPACT 取出三类影响（承接/新子项/备选池）；
     clauses/updates 按项目集过滤战略条款与更新点。改 pf / ver 即联动全页。
     openFb(a)：点某条动作的反馈按钮 → 打开 ActionReviewDialog。 */
function StrategyLayer({ onNavigate }) {
  const [ver, setVer] = React.useState(0);
  const [pf, setPf] = React.useState(() => PORTFOLIOS[0].id);
  const [fbAction, setFbAction] = React.useState(null);
  const [open, setOpen] = React.useState({ '01': true, '03': true, '04': true });
  const [toast, setToast] = React.useState(null);

  const toggle = (no) => setOpen(o => ({ ...o, [no]: !o[no] }));

  const buckets = React.useMemo(() => {
    const out = { uptake: [], newSub: [], pool: [] };
    const imp = PORTFOLIO_IMPACT[pf];
    if (imp) {
      out.uptake.push(...imp.uptake);
      out.newSub.push(...imp.newSub);
      out.pool.push(...imp.pool);
    }
    return out;
  }, [pf]);
  const totalImpact = buckets.uptake.length + buckets.newSub.length + buckets.pool.length;
  const clauses = STRATEGY_CLAUSES.filter(c => c.pf.includes(pf));
  const updates = STRATEGY_UPDATES.filter(u => u.pf.includes(pf));
  const curPf = PORTFOLIOS.find(p => p.id === pf);
  const verDate = STRATEGY_VERSIONS[ver].full;

  // 打开某条「AI 已执行动作」的异步反馈对话
  const openFb = (a) => setFbAction({ ...a, date: verDate });

  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: '项目管理工作台' }, { label: '战略意图识别' }]} />
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico"><Icon name="compass" size={22} color="var(--blue-primary)" /></span>
          <div>
            <h1 className="t-h1">战略意图识别</h1>
          </div>
        </div>
      </div>

      {/* 每日版本 · 日期查询 */}
      <div className="st-version-rail">
        <label className="st-datepick">
          <Icon name="calendar" size={15} color="var(--text-400)" />
          <input
            type="date"
            value={STRATEGY_VERSIONS[ver].full}
            min={STRATEGY_VERSIONS[STRATEGY_VERSIONS.length - 1].full}
            max={STRATEGY_VERSIONS[0].full}
            onChange={(e) => {
              const idx = STRATEGY_VERSIONS.findIndex(v => v.full === e.target.value);
              if (idx >= 0) setVer(idx);
            }}
          />
        </label>
        <span className="st-datepick-tag" data-cur={STRATEGY_VERSIONS[ver].cur || false}>
          {STRATEGY_VERSIONS[ver].cur && <span className="st-version-dot" />}
          {STRATEGY_VERSIONS[ver].tag || '历史版本'}
        </span>
        <span className="st-rail-div" />
        <PortfolioPicker value={pf} onChange={setPf} />
      </div>

      {/* 归属判定 · 战略意图与管理者意图共用同一管道 */}
      <div className="st-attr-banner">
        <span className="st-attr-ico"><Icon name="git-pull-request-arrow" size={18} color="var(--ai)" /></span>
        <div className="st-attr-main">
          <div className="st-attr-t">每条战略意图先经「归属判定」再向下传导</div>
          <div className="st-attr-s">无论来自<b>每日顶层战略文档</b>还是<button className="st-inline-link" onClick={() => onNavigate && onNavigate('mgr-intent')}>管理者意图</button>，AI 都先判定它是<b>承接到现有项目集</b>还是<b>需新建项目集</b>。系统冷启动（空库）时，第一条意图即以此路径新建第一个项目集。</div>
        </div>
      </div>

      <div className="st-grid">
        {/* 左：战略文档卡 */}
        <Card className="st-doc">
          <div className="st-doc-head">
            <div className="st-doc-title">
              <Icon name="scroll-text" size={18} color="var(--blue-primary)" />
              <span className="t-h3">顶层战略文档</span>
              <span className="mono t-micro" style={{ color: 'var(--text-400)' }}>v2026.06.02</span>
            </div>
            <span className="t-micro" style={{ color: 'var(--text-400)' }}>与本项目集相关 · {clauses.length} 条</span>
          </div>
          <div className="st-doc-scope">
            <Icon name="sparkles" size={13} color="var(--ai)" />
            AI 已比对 昨日→今日 战略文档（并纳入「管理者意图」新增方向），按「{curPf.name}」筛选出相关变动并二次分析
          </div>
          <div className="st-clauses">
            {clauses.map(c => (
              <div className="st-clause" key={c.no}>
                <button className="st-clause-head" onClick={() => toggle(c.no)}>
                  <span className="st-clause-no">{c.no}</span>
                  <span className="st-clause-main">
                    <span className="st-clause-name">{c.name}</span>
                    <span className="st-clause-kicker">{c.kicker}</span>
                  </span>
                  <span className="st-clause-marks">
                    {c.change && <span className="chg-mark" data-k={c.change.k}><Icon name={c.change.k === 'add' ? 'plus' : c.change.k === 'shrink' ? 'minus' : 'replace'} size={11} color={c.change.k === 'add' ? 'var(--success)' : c.change.k === 'shrink' ? 'var(--warning)' : 'var(--info)'} />{c.change.label}</span>}
                    <Icon name={open[c.no] ? 'chevron-up' : 'chevron-down'} size={16} color="var(--text-400)" />
                  </span>
                </button>
                {open[c.no] && (
                  <div className="st-clause-body open">
                    <p>{c.body}</p>
                    {c.prev && <div className="st-clause-prev"><b>与上一版相比：</b>{c.prev}</div>}
                    {c.relate && c.relate[pf] && (
                      <div className="st-clause-relate">
                        <Icon name="sparkles" size={13} color="var(--ai)" />
                        <span><b>与本项目集的关联（AI 二次分析）：</b>{c.relate[pf]}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* 右：更新与影响面板 */}
        <div className="st-side">
          <Card>
            <div className="st-panel-head">
              <Icon name="sparkle" size={17} color="var(--info)" />
              <span className="t-h3">本次更新点</span>
              <span className="t-micro" style={{ color: 'var(--text-400)', marginLeft: 'auto' }}>与上一版相比</span>
            </div>
            <div className="st-panel-body">
              <div className="st-update-list">
                {updates.length === 0 ? (
                  <div className="st-pf-empty" style={{ margin: 0 }}>
                    <Icon name="circle-check" size={16} color="var(--success)" />
                    本项目集本次无战略变动。
                  </div>
                ) : updates.map((u, i) => (
                  <div className="st-update-item" key={i}>
                    <span className="st-update-ico" style={{ background: u.k === 'add' ? 'var(--success-bg)' : u.k === 'shrink' ? 'var(--warning-bg)' : 'var(--info-bg)' }}>
                      <Icon name={u.k === 'add' ? 'plus' : u.k === 'shrink' ? 'minus' : 'replace'} size={13} color={u.k === 'add' ? 'var(--success)' : u.k === 'shrink' ? 'var(--warning)' : 'var(--info)'} />
                    </span>
                    <p dangerouslySetInnerHTML={{ __html: u.text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') }} />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="st-panel-head">
              <Icon name="sparkles" size={17} color="var(--ai)" />
              <span className="t-h3">AI 已执行动作</span>
              <span className="t-micro" style={{ color: 'var(--text-400)', marginLeft: 'auto' }}>
                {totalImpact > 0 ? `${totalImpact} 项 · 可复核` : '本次无动作'}
              </span>
            </div>
            <div className="st-panel-body">
              {totalImpact === 0 ? (
                <div className="st-pf-empty">
                  <Icon name="circle-check" size={16} color="var(--success)" />
                  本次战略更新未影响该范围内的项目，AI 无需执行任何动作。
                </div>
              ) : (
                <>
                <div className="st-exec-banner">
                  <Icon name="zap" size={14} color="var(--ai)" />
                  <span>AI 已于 <b>{verDate}</b> 自动落实本次战略变化并执行以下动作。你可逐条复核，点击右上角 <Icon name="message-square-text" size={12} color="var(--text-400)" style={{ verticalAlign: '-2px' }} /> 发起异步反馈，AI 将识别意图、给出调整方案（含回撤），确认后再次执行。</span>
                </div>
                <div className="st-imp">
                  {IMPACT_SECTIONS.map(sec => {
                    const rows = buckets[sec.key];
                    if (!rows.length) return null;
                    return (
                      <div className="st-imp-sec" key={sec.key}>
                        <div className="st-imp-sec-head">
                          <Icon name={sec.icon} size={15} color={sec.color} />
                          <span className="st-imp-sec-title">{sec.title}</span>
                          <span className="st-imp-sec-count">{rows.length}</span>
                          {sec.hint && <span className="st-imp-sec-hint">{sec.hint}</span>}
                        </div>
                        <div className="st-imp-rows">
                          {sec.key === 'uptake' && rows.map((r, i) => (
                            <div className={`st-imp-item has-fb${r.closure ? ' is-closure' : ''}`} key={i}>
                              <button className="st-fb-btn" title="对该动作发起异步反馈" onClick={() => openFb({ kind: r.closure ? 'closure' : 'modify', project: r.name, detail: r.ops.map(o => o.field).join('、'), summary: r.closure ? `AI 已将其转入强制结项评估。` : `AI 已修改其「${r.ops.map(o => o.field).join('、')}」等关键信息。` })}>
                                <Icon name="message-square-text" size={15} color="var(--text-400)" />
                              </button>
                              <div className="st-imp-row">
                                <span className="st-imp-name">
                                  {r.name}
                                  {r.parent && <span className="st-imp-tag">母项目</span>}
                                </span>
                                {r.closure && <span className="st-imp-action" style={{ color: 'var(--danger)', background: 'var(--danger-bg)' }}>强制结项评估</span>}
                              </div>
                              <div className="st-imp-ops">
                                {r.ops.map((op, k) => (
                                  <div className="st-op" data-op={op.op} key={k}>
                                    <div className="st-op-head">
                                      <span className="st-op-badge" data-op={op.op}>{op.op === 'modify' ? '修改' : op.op === 'add' ? '新增' : '删除'}</span>
                                      <span className="st-op-field">{op.field}</span>
                                      {op.note && <span className="st-op-note">{op.note}</span>}
                                    </div>
                                    {op.op === 'modify' && (
                                      <div className="st-op-diff">
                                        <div className="st-op-line is-before"><span className="st-op-lab">当前</span><span className="st-op-txt">{op.before}</span></div>
                                        <div className="st-op-line is-after"><span className="st-op-lab">AI 拟改为</span><span className="st-op-txt">{op.after}</span></div>
                                      </div>
                                    )}
                                    {op.op === 'delete' && (
                                      <div className="st-op-diff">
                                        <div className="st-op-line is-before"><span className="st-op-lab">当前</span><span className="st-op-txt">{op.before}</span></div>
                                        <div className="st-op-line is-reason"><Icon name="git-commit-horizontal" size={13} color="var(--danger)" /><span className="st-op-txt">{op.reason}</span></div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}

                          {sec.key === 'newSub' && rows.map((r, i) => (
                            <div className="st-imp-item has-fb" key={i}>
                              <button className="st-fb-btn" title="对该动作发起异步反馈" onClick={() => openFb({ kind: 'newSub', project: r.sub, parent: r.parent, summary: `AI 已新增子项目并使其进入备选池分析。` })}>
                                <Icon name="message-square-text" size={15} color="var(--text-400)" />
                              </button>
                              <div className="st-imp-row">
                                <span className="st-imp-name"><Icon name="git-branch" size={14} color="var(--success)" />{r.sub}</span>
                                <span className="st-imp-action" style={{ color: 'var(--ai)', background: 'var(--ai-soft)' }}>{r.status}</span>
                              </div>
                              <div className="st-sub-meta">
                                <div className="st-sub-line"><span className="st-sub-lab">母项目</span><span className="st-sub-val">{r.parent}</span></div>
                                {r.goalOp === 'add' && (
                                  <div className="st-sub-line">
                                    <span className="st-op-badge" data-op="add" style={{ flex: 'none' }}>母项目新增目标</span>
                                    <span className="st-sub-val">{r.goal}</span>
                                  </div>
                                )}
                                <div className="st-sub-line"><span className="st-sub-lab">子项目说明</span><span className="st-sub-val">{r.subDesc}</span></div>
                              </div>
                              <div className="st-sub-foot"><Icon name="info" size={12} color="var(--text-400)" />子项目须先经备选池多维分析与门槛校验，达标后方可自动立项。</div>
                            </div>
                          ))}

                          {sec.key === 'pool' && rows.map((c, i) => {
                            const met = c.score >= c.threshold;
                            const delta = c.score - c.prev;
                            return (
                              <div className="st-imp-item has-fb" key={i}>
                                <button className="st-fb-btn" title="对该动作发起异步反馈" onClick={() => openFb({ kind: met ? 'charter' : 'hold', project: c.name, summary: met ? `AI 复盘后该候选已达门槛，已自动立项。` : `AI 复盘后该候选未达门槛，已留在备选池继续每日复盘。` })}>
                                  <Icon name="message-square-text" size={15} color="var(--text-400)" />
                                </button>
                                <div className="st-imp-row">
                                  <span className="st-imp-name">{c.name}</span>
                                  <span className="st-pool-delta" data-up={delta >= 0}>{delta >= 0 ? '+' : ''}{delta} 分</span>
                                </div>
                                <div className="st-pool-meter">
                                  <span className="st-pool-score" data-met={met}>{c.score}</span>
                                  <div className="st-pool-track">
                                    <div className="st-pool-fill" style={{ width: c.score + '%', background: met ? 'var(--success)' : 'var(--ai)' }} />
                                    <div className="st-pool-th-mark" style={{ left: c.threshold + '%' }} />
                                  </div>
                                  <span className="st-pool-th">门槛 {c.threshold}</span>
                                </div>
                                <div className={`st-pool-result is-${c.result}`}>
                                  <Icon name={c.result === 'charter' ? 'circle-check' : 'history'} size={13} color={c.result === 'charter' ? 'var(--success)' : 'var(--text-500)'} />
                                  {c.result === 'charter' ? '已达门槛 · 系统自动立项' : (c.note || '未达门槛 · 沉淀池中，每日复盘')}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 异步反馈对话 */}
      <ActionReviewDialog action={fbAction} pfName={curPf.name} onClose={() => setFbAction(null)} onToast={setToast} />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

/* ============================================================
   2.2 · 项目备选池
   ============================================================ */

/* ====== 2.2 · 项目备选池 数据 ======
   POOL_REVIEW_DATES 复盘批次；CANDIDATES 候选项目（score 综合评分 / threshold 门槛 /
   analyzing 是否分析中 / complete 分析完成度 / tavily 是否可借外部调研）。 */
const POOL_REVIEW_DATES = ['2026-06-02', '2026-06-01', '2026-05-31', '2026-05-30', '2026-05-29'];

const POOL_DIRECTIONS = ['全部', '自助化优先', '供应链风险预警', '下沉市场扩张', '数据统一治理', '增长重心'];

const CANDIDATES = [
  { name: '智能客服自助引擎', id: 'CAND-0042', portfolio: 'service', dir: '自助化优先', score: 88, threshold: 80, analyzing: false, complete: 92, prio: 'up', tavily: true,
    sum: '面向 C 端客户与一线客服，构建咨询 / 查询 / 办理的自助闭环。' },
  { name: '智能定价试验台', id: 'CAND-0051', portfolio: 'growth', dir: '增长重心', score: 83, threshold: 80, analyzing: false, complete: 81, prio: 'up', tavily: true,
    sum: '搭建可灰度的智能定价试验环境，支撑增长重心下的弹性定价。' },
  { name: '区域履约网络扩张', id: 'CAND-0037', portfolio: 'fulfill', dir: '下沉市场扩张', score: 74, threshold: 80, analyzing: false, complete: 76, prio: 'flat', tavily: false,
    sum: '在下沉市场补齐履约网点密度与时效，承接增长第一引擎。' },
  { name: '全域数据资产编目', id: 'CAND-0045', portfolio: 'data', dir: '数据统一治理', score: 68, threshold: 80, analyzing: false, complete: 64, prio: 'down', tavily: false,
    sum: '统一数据口径、血缘与质量，为各方向提供一致数据底座。' },
  { name: '供应链风险预警中台', id: 'CAND-0058', portfolio: 'fulfill', dir: '供应链风险预警', score: 56, threshold: 80, analyzing: true, complete: 38, prio: 'up', tavily: true,
    sum: '本周由战略层新增方向沉淀，AI 正在补齐多维分析。' },
  { name: '多模态工单理解', id: 'CAND-0049', portfolio: 'service', dir: '自助化优先', score: 62, threshold: 80, analyzing: false, complete: 55, prio: 'flat', tavily: false,
    sum: '融合文本 / 图片 / 语音的工单意图理解，反哺自助引擎。' },
];

const PRIO_LABEL = { up: '优先级 ↑', down: '优先级 ↓', flat: '优先级 —' };

/* REPORT_DIMS — 候选项目的六个评分维度（战略契合/市场/技术/资源/风险/收益）。
   每维携 score(A–C 评级) + body 结论 + src 证据来源（映射 SOURCE_DETAIL）。 */
const REPORT_DIMS = [
  { name: '战略契合度', icon: 'compass', score: 'A', tone: 'success', body: '与本周战略主轴「自助化优先」高度契合，属总纲直接派生方向。', src: { t: '战略层影响分析', mono: 'STRAT-0602', link: true } },
  { name: '市场机会', icon: 'trending-up', score: 'A-', tone: 'success', body: '客户自助化工具市场年增约 24%，头部企业自助率普遍达 60%+。', src: { t: '外部调研 · Tavily', mono: 'TAVILY', link: true } },
  { name: '技术可行性', icon: 'cpu', score: 'B+', tone: 'info', body: '现有对话与知识库 NLP 能力可复用约 70%，新增工程量适中。', src: { t: '内部能力盘点', mono: 'CAP-AUDIT' } },
  { name: '资源投入', icon: 'gauge', score: 'B', tone: 'info', body: '预估算力与人力投入中等，高峰期需扩充推理配额一档。', src: { t: 'AI 成本预估', mono: 'AI-EST' } },
  { name: '潜在风险', icon: 'shield-alert', score: 'B-', tone: 'warning', body: '客户对自助化的接受度存在区域差异，需灰度验证用户迁移率。', src: { t: '历史项目对照', mono: 'HIST-REF' } },
  { name: '预期收益', icon: 'target', score: 'A-', tone: 'success', body: '预计人工坐席依赖下降约 30%，对应客服综合成本同步回落。', src: { t: '行业预估', mono: 'INDUSTRY', link: true } },
];

const SCORE_TONE = { success: 'var(--success)', info: 'var(--info)', warning: 'var(--warning)' };

/* 门槛参考分 · 围绕每个项目集校准的六维加权口径 */
const POOL_DIMS6 = ['战略契合度', '市场机会', '技术可行性', '资源投入', '潜在风险', '预期收益'];
const POOL_SCORING = {
  service: { th: 80, emphasis: '战略契合度 与 预期收益', w: [25, 20, 15, 10, 10, 20],
    calib: '这个项目集主打让客户自己就能把事办好，所以更看重一个项目跟这个方向贴不贴、能不能真的减少人工、把成本省下来。' },
  fulfill: { th: 80, emphasis: '技术可行性 与 资源投入', w: [20, 15, 22, 18, 15, 10],
    calib: '这个项目集做的是履约和供应链，落地难不难、要占多少运力和成本很关键，所以更看重能不能做得出来、花得值不值，不轻易上太悬的项目。' },
  growth:  { th: 80, emphasis: '市场机会 与 预期收益', w: [18, 25, 12, 10, 12, 23],
    calib: '这个项目集是冲增长的，所以更看重有没有市场、能不能赚回来，回报来得快的项目更容易过门槛。' },
  data:    { th: 80, emphasis: '战略契合度 与 潜在风险', w: [24, 12, 20, 12, 22, 10],
    calib: '这个项目集是给各业务打底座的，所以更看重跟统一治理的方向合不合、数据和合规上有没有风险。' },
};

/* ThresholdInfo — 门槛参考分说明的弹出口径卡（随所选项目集变化）。
   作用：解释「综合评分≥门槛即自动立项」的六维加权口径（按项目集校准、侧重不同）。
   状态：open 控制弹层；点外部关闭（window click + 外层 stopPropagation）。数据：POOL_SCORING。 */
function ThresholdInfo({ pfName }) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (!open) return;
    const h = () => setOpen(false);
    window.addEventListener('click', h);
    return () => window.removeEventListener('click', h);
  }, [open]);
  const pf = PORTFOLIOS.find(p => p.name === pfName) || PORTFOLIOS[0];
  const sc = POOL_SCORING[pf.id];
  const maxW = Math.max(...sc.w);
  return (
    <div className="cp-th" onClick={(e) => e.stopPropagation()}>
      <button className="cp-th-btn" data-on={open} onClick={() => setOpen(o => !o)}>
        门槛参考分 <span className="mono cp-th-val">{sc.th}</span>
        <Icon name="info" size={13} color={open ? 'var(--blue-primary)' : 'var(--text-400)'} />
      </button>
      {open && (
        <div className="cp-th-pop">
          <div className="cp-th-pop-head">
            <Icon name="gauge" size={16} color="var(--blue-primary)" />
            <span className="cp-th-pop-title">门槛参考分口径 · {pf.name}</span>
          </div>
          <p className="cp-th-lead">综合评分是候选项目能否被 AI <b>自动立项</b>的基准线。达到或超过 <b className="mono">{sc.th}</b> 即自动立项；未达则留在备选池，AI 每日动态复盘并重新打分。</p>
          <div className="cp-th-sec">综合评分构成 · 六维加权（按本项目集校准）</div>
          <div className="cp-th-dims">
            {POOL_DIMS6.map((d, i) => (
              <div className="cp-th-dim" key={i}>
                <span className="cp-th-dim-nm">{d}</span>
                <span className="cp-th-bar"><span className="cp-th-bar-fill" style={{ width: (sc.w[i] / maxW * 100) + '%' }} /></span>
                <span className="cp-th-w mono">{sc.w[i]}%</span>
              </div>
            ))}
          </div>
          <div className="cp-th-emph"><Icon name="target" size={13} color="var(--blue-primary)" /><span>本项目集侧重 <b>{sc.emphasis}</b></span></div>
          <div className="cp-th-calib"><Icon name="sparkles" size={13} color="var(--ai)" /><span>{sc.calib}</span></div>
        </div>
      )}
    </div>
  );
}

/* 分维结论的来源 · 点击展开的示意（Mock）来源详情 */
const SOURCE_DETAIL = {
  'STRAT-0602': { kind: '战略层影响分析', icon: 'compass', date: '2026-06-02', external: false,
    excerpt: '战略主轴由「效率优先」调整为「自助化优先」，要求各服务类项目优先建设客户可自助完成的能力闭环，人工坐席退居复杂与情感场景。',
    fields: [{ k: '引用条款', v: '01 · 以「自助化优先」重塑客户服务体系' }, { k: 'AI 关联', v: '与本候选强相关，战略契合度评 A' }, { k: '留痕编号', v: 'STRAT-0602' }] },
  'TAVILY': { kind: '外部调研 · Tavily', icon: 'globe', date: '2026-05-31', external: true,
    excerpt: '客户自助化工具市场近三年年增约 24%，头部企业自助率普遍达 60% 以上，工具链与用户接受度均趋成熟。',
    fields: [{ k: '检索式', v: 'customer self-service market 2026' }, { k: '命中来源', v: '3 篇行业报告 · 已交叉验证' }, { k: '置信度', v: '高' }] },
  'CAP-AUDIT': { kind: '内部能力盘点', icon: 'cpu', date: '2026-05-30', external: false,
    excerpt: '现有对话与知识库 NLP 能力可复用约 70%，新增工程量集中在自助流程编排与多模态接入，整体可行性中上。',
    fields: [{ k: '盘点范围', v: '对话引擎 / 知识库 / 工单系统' }, { k: '可复用度', v: '约 70%' }, { k: '技术可行性评级', v: 'B+' }] },
  'AI-EST': { kind: 'AI 成本预估', icon: 'gauge', date: '2026-06-01', external: false,
    excerpt: '预估算力与人力投入中等，高峰期推理配额需扩充一档；按当前单价测算，月度增量成本在可接受区间。',
    fields: [{ k: '算力配额', v: '中等 · 高峰 +1 档' }, { k: '人力投入', v: '中等' }, { k: '资源投入评级', v: 'B' }] },
  'HIST-REF': { kind: '历史项目对照', icon: 'history', date: '2026-05-27', external: false,
    excerpt: '对照历史自助化项目，客户对自助化的接受度存在区域差异，需灰度验证用户迁移率，避免一次性全量切换。',
    fields: [{ k: '对照项目', v: '3 个历史自助化项目' }, { k: '主要风险', v: '区域接受度差异' }, { k: '潜在风险评级', v: 'B-' }] },
  'INDUSTRY': { kind: '行业预估', icon: 'trending-up', date: '2026-05-28', external: true,
    excerpt: '同类自助化项目落地后，人工坐席依赖平均下降 25%–35%，客服综合成本同步回落，回收周期约 2–3 个季度。',
    fields: [{ k: '对标样本', v: '6 个同业公开案例' }, { k: '测算口径', v: '坐席人月成本 × 降幅区间' }, { k: '预期收益评级', v: 'A-' }] },
};

/* RepDimSource — 分维结论的「来源」展开行。
   作用：点击展开某个评分维度的证据来源详情（内/外部、摘录、字段）。
   数据：SOURCE_DETAIL（mock 示意），src.mono 为索引键。open 控制展开。 */
function RepDimSource({ src }) {
  const [open, setOpen] = React.useState(false);
  const d = SOURCE_DETAIL[src.mono];
  return (
    <div className="rep-src-wrap">
      <button className={`rep-dim-src is-click${src.link ? ' is-link' : ''}`} onClick={() => setOpen(o => !o)}>
        <Icon name={src.link ? 'external-link' : 'link'} size={12} color={src.link ? 'var(--blue-primary)' : 'var(--text-400)'} />
        来源：{src.t}<span className="mono">· {src.mono}</span>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={13} color="var(--text-400)" />
      </button>
      {open && d && (
        <div className="rep-src-detail">
          <div className="rep-src-head">
            <span className="rep-src-ico"><Icon name={d.icon} size={15} color="var(--blue-primary)" /></span>
            <div className="rep-src-head-main">
              <span className="rep-src-kind">{d.kind}</span>
              <span className="rep-src-meta mono">{src.mono} · {d.date}</span>
            </div>
            <span className="rep-src-badge" data-ext={d.external}>{d.external ? '外部来源' : '内部来源'}</span>
          </div>
          <p className="rep-src-excerpt">{d.excerpt}</p>
          <div className="rep-src-fields">
            {d.fields.map((f, k) => (
              <div className="rep-src-field" key={k}><span className="rep-src-fk">{f.k}</span><span className="rep-src-fv">{f.v}</span></div>
            ))}
          </div>
          <div className="rep-src-foot">
            <span className="rep-src-open">
              <Icon name={d.external ? 'external-link' : 'history'} size={13} color="var(--blue-primary)" />
              {d.external ? '打开原始来源' : '查看完整留痕'}
            </span>
            <span className="rep-src-note mono">Mock · 示意数据</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* CandidatePool — 项目备选池页主体。
   状态：loading 加载态；revDate 复盘批次日期；view 卡片/表格；met 门槛筛选；
     cpPf 项目集；sortDir 排序；active 展开的候选详情；fbAction 复核动作。
   rows：按项目集 + 门槛筛选 CANDIDATES 并按评分排序。每个候选携 six-dim 评分与门槛。 */
function CandidatePool() {
  const [loading, setLoading] = React.useState(true);
  const [revDate, setRevDate] = React.useState(() => POOL_REVIEW_DATES[0]);
  const [view, setView] = React.useState('grid');
  const [met, setMet] = React.useState('全部');
  const [cpPf, setCpPf] = React.useState(() => PORTFOLIOS[0].name);
  const [sortDir, setSortDir] = React.useState('desc');
  const [active, setActive] = React.useState(null);
  const [fbAction, setFbAction] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const rows = React.useMemo(() => {
    let v = CANDIDATES.filter(c =>
      PF_NAME[c.portfolio] === cpPf &&
      (met === '全部' || (met === '已达门槛' ? c.score >= c.threshold : c.score < c.threshold))
    );
    v = [...v].sort((a, b) => (sortDir === 'desc' ? -1 : 1) * (a.score - b.score));
    return v;
  }, [met, cpPf, sortDir]);

  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: '项目管理工作台' }, { label: '项目备选池' }]} />
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico"><Icon name="inbox" size={22} color="var(--blue-primary)" /></span>
          <div>
            <h1 className="t-h1">项目备选池</h1>
          </div>
        </div>
        <div className="page-head-right">
          <div className="seg">
            <button className="seg-btn" data-on={view === 'grid'} onClick={() => setView('grid')}>卡片</button>
            <button className="seg-btn" data-on={view === 'table'} onClick={() => setView('table')}>表格</button>
          </div>
        </div>
      </div>

      {/* 工具条：复盘批次 + 多维筛选 */}
      <div className="cp-toolbar">
        <div className="cp-review">
          <label className="st-datepick">
            <Icon name="calendar" size={15} color="var(--text-400)" />
            <input
              type="date"
              value={revDate}
              min={POOL_REVIEW_DATES[POOL_REVIEW_DATES.length - 1]}
              max={POOL_REVIEW_DATES[0]}
              onChange={(e) => setRevDate(e.target.value)}
            />
          </label>
          <span className="st-datepick-tag" data-cur={revDate === POOL_REVIEW_DATES[0]}>
            {revDate === POOL_REVIEW_DATES[0] && <span className="st-version-dot" />}
            {revDate === POOL_REVIEW_DATES[0] ? '今日复盘' : '历史复盘'}
          </span>
        </div>
        <FilterChip label="项目集" options={PORTFOLIOS.map(p => p.name)} value={cpPf} onChange={setCpPf} />
        <FilterChip label="门槛达成" options={['全部', '已达门槛', '未达门槛']} value={met} onChange={setMet} />
        <FilterChip label="优先级排序" options={['评分降序', '评分升序']} value={sortDir === 'desc' ? '评分降序' : '评分升序'} onChange={v => setSortDir(v === '评分降序' ? 'desc' : 'asc')} />
        <span style={{ marginLeft: 'auto' }}><ThresholdInfo pfName={cpPf} /></span>
      </div>

      {loading ? (
        <div className="cp-grid">{[0,1,2,3].map(i => <CpSkel key={i} />)}</div>
      ) : rows.length === 0 ? (
        <Card><EmptyState glyph="inbox" title="待战略层分析后自动沉淀候选项目" desc="当前批次 / 筛选下暂无候选项目。战略层落实后，新方向会自动沉淀到此，AI 随即开始多维分析。" /></Card>
      ) : view === 'grid' ? (
        <div className="cp-grid">
          {rows.map(c => {
            const gap = c.score - c.threshold;
            const ready = gap >= 0;
            return (
              <button key={c.id} className={`cp-card${ready ? ' is-ready' : ''}`} onClick={() => setActive(c)}>
                <div className="cp-card-top">
                  <div style={{ minWidth: 0 }}>
                    <div className="cp-card-name">{c.name}</div>
                    <div className="cp-card-src"><span className="pl-pf">{PF_NAME[c.portfolio]}</span></div>
                  </div>
                  <span className="cp-prio" data-d={c.prio}>
                    <Icon name={c.prio === 'up' ? 'arrow-up' : c.prio === 'down' ? 'arrow-down' : 'minus'} size={12} color={c.prio === 'up' ? 'var(--success)' : c.prio === 'down' ? 'var(--warning)' : 'var(--text-500)'} />
                    {PRIO_LABEL[c.prio].replace('优先级 ', '')}
                  </span>
                </div>

                {c.analyzing ? (
                  <div className="ai-processing">
                    <span className="ai-spinner" />
                    <span className="ai-processing-txt">AI <b>多维分析中</b> · 已完成 {c.complete}%</span>
                  </div>
                ) : (
                  <div className="cp-analysis">
                    <div className="cp-an-row">
                      <span className="cp-an-label">分析完成度</span>
                      <span className="cp-an-bar"><span className="cp-an-fill" style={{ width: c.complete + '%', background: 'var(--ai)' }} /></span>
                      <span className="cp-an-val">{c.complete}%</span>
                    </div>
                    <div className="cp-an-row">
                      <span className="cp-an-label">综合评分</span>
                      <span className="cp-an-bar"><span className="cp-an-fill" style={{ width: c.score + '%', background: ready ? 'var(--success)' : 'var(--blue-primary)' }} /></span>
                      <span className="cp-an-val">{c.score}</span>
                    </div>
                  </div>
                )}

                <div className="cp-gap">
                  <Icon name={ready ? 'circle-check' : 'flag'} size={15} color={ready ? 'var(--success)' : 'var(--warning)'} />
                  <span className="cp-gap-label">{ready ? '已达立项门槛' : '距立项门槛'}</span>
                  <span className="cp-gap-val" data-met={ready}>{gap >= 0 ? `+${gap}` : gap} 分</span>
                </div>

                <div className="cp-card-foot">
                  {c.tavily && <span className="cp-tavily"><Icon name="globe" size={12} color="var(--text-500)" />可借外部调研 · Tavily</span>}
                  <span className="cp-view">查看分析报告<Icon name="arrow-right" size={13} color="var(--blue-primary)" /></span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <Card style={{ overflow: 'hidden' }}>
          <table className="dtable">
            <thead>
              <tr>
                <th><span className="th-in">备选项目</span></th>
                <th className="num"><span className="th-in">分析完成度</span></th>
                <th className="num"><span className="th-in" onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}>综合评分 <Icon name={sortDir === 'desc' ? 'chevron-down' : 'chevron-up'} size={13} color="var(--blue-primary)" /></span></th>
                <th className="num"><span className="th-in">距门槛</span></th>
                <th><span className="th-in">优先级</span></th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(c => {
                const gap = c.score - c.threshold;
                const ready = gap >= 0;
                return (
                  <tr key={c.id} onClick={() => setActive(c)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div className="pl-proj">
                        <span className="pl-proj-name">{c.name}</span>
                        <span className="mono pl-proj-id">{c.id}{c.tavily ? ' · Tavily' : ''}</span>
                      </div>
                    </td>
                    <td className="num">{c.analyzing ? <span className="pill" style={{ background: 'var(--ai-soft)', color: 'var(--ai)' }}><span className="dot" style={{ background: 'var(--ai)' }} />{c.complete}%</span> : <span className="mono">{c.complete}%</span>}</td>
                    <td className="num mono" style={{ color: 'var(--text-900)', fontWeight: 600 }}>{c.score}</td>
                    <td className="num mono" style={{ color: ready ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>{gap >= 0 ? `+${gap}` : gap}</td>
                    <td>
                      <span className="cp-prio" data-d={c.prio}>
                        <Icon name={c.prio === 'up' ? 'arrow-up' : c.prio === 'down' ? 'arrow-down' : 'minus'} size={12} color={c.prio === 'up' ? 'var(--success)' : c.prio === 'down' ? 'var(--warning)' : 'var(--text-500)'} />
                        {PRIO_LABEL[c.prio].replace('优先级 ', '')}
                      </span>
                    </td>
                    <td><Icon name="chevron-right" size={16} color="var(--text-400)" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* 分析报告抽屉 */}
      <Drawer
        open={!!active}
        onClose={() => setActive(null)}
        width={520}
        icon={active ? { name: 'inbox' } : null}
        title={active ? active.name : ''}
        sub={active ? `${active.id} · ${PF_NAME[active.portfolio]}` : ''}
        headRight={active && (
          <button className="feedback-entry" onClick={() => {
            const met = active.score >= active.threshold;
            setFbAction({
              kind: met ? 'charter' : 'hold',
              project: active.name,
              date: revDate,
              summary: met
                ? `AI 复盘后该候选综合评分 ${active.score} 已达门槛，已自动立项。`
                : `AI 复盘后该候选综合评分 ${active.score} 未达门槛（差 ${active.threshold - active.score} 分），已留在备选池继续每日复盘。`,
            });
          }}>
            <Icon name="message-square-text" size={15} color="var(--text-500)" />异步反馈
          </button>
        )}
        footer={active && (
          <div className="rep-foot-status" data-met={active.score >= active.threshold}>
            <Icon name={active.score >= active.threshold ? 'circle-check' : 'history'} size={15} color={active.score >= active.threshold ? 'var(--success)' : 'var(--text-500)'} />
            <span>{active.score >= active.threshold
              ? '综合评分已达门槛 · AI 已自动立项，全程无需人工操作'
              : '综合评分未达门槛 · 留在备选池，AI 每日复盘并重新打分'}</span>
            <span className="rep-foot-note">如有异议可在右上角发起异步反馈</span>
          </div>
        )}
      >
        {active && (
          <>
            <div className="rep-summary">
              <Ring value={active.complete} size={52} stroke={5} color="var(--ai)" />
              <div className="rep-summary-main">
                <div className="t-h3" style={{ fontSize: 14 }}>多维分析{active.analyzing ? '进行中' : '结论'}</div>
                <div className="t-caption" style={{ marginTop: 2 }}>{active.sum}</div>
              </div>
            </div>

            {active.analyzing && (
              <div className="ai-processing" style={{ marginBottom: 18 }}>
                <span className="ai-spinner" />
                <span className="ai-processing-txt">AI <b>分析中</b>：部分维度结论将随分析推进陆续生成，每条结论均挂来源。</span>
              </div>
            )}

            <div className="disp-sec-label t-label-caps">分维结论 · 每条挂来源</div>
            <div className="rep-grade-note">
              <Icon name="info" size={14} color="var(--blue-primary)" />
              <span>每个维度由 AI 评 <b>A–C 级</b>（A 最好、C 最弱）。各维度评级按本项目集的权重加权，汇总成上方的<b>综合评分</b>；评分达到门槛即由 AI 自动立项，未达则留池每日复盘。每条右侧的 <b className="mono">%</b> 是该维度在本项目集的权重，权重越高对结果影响越大。</span>
            </div>
            {REPORT_DIMS.map((d, i) => (
              <div className="rep-dim" key={i} style={active.analyzing && i >= 3 ? { opacity: .4 } : null}>
                <div className="rep-dim-head">
                  <Icon name={d.icon} size={17} color={SCORE_TONE[d.tone]} />
                  <span className="rep-dim-name">{d.name}</span>
                  <span className="rep-dim-w mono" title="该维度在本项目集的权重">{POOL_SCORING[active.portfolio] ? POOL_SCORING[active.portfolio].w[i] : 0}%</span>
                  <span className="rep-dim-score" style={{ color: SCORE_TONE[d.tone] }}>{active.analyzing && i >= 3 ? '—' : d.score}</span>
                </div>
                <p className="rep-dim-body">{active.analyzing && i >= 3 ? '待分析完成后生成结论…' : d.body}</p>
                <RepDimSource src={d.src} />
              </div>
            ))}
          </>
        )}
      </Drawer>

      <ActionReviewDialog action={fbAction} pfName={active ? PF_NAME[active.portfolio] : ''} onClose={() => setFbAction(null)} onToast={setToast} />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

function CpSkel() {
  return (
    <div className="cp-card" style={{ cursor: 'default' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}><Skel w={160} h={16} /><Skel w={56} h={20} r={999} /></div>
      <Skel w="70%" h={12} />
      <Skel w="100%" h={6} r={999} style={{ marginTop: 6 }} />
      <Skel w="100%" h={6} r={999} />
      <Skel w="100%" h={40} r={6} style={{ marginTop: 6 }} />
    </div>
  );
}

Object.assign(window, { StrategyLayer, CandidatePool, FeedbackEntry, PortfolioPicker, ActionReviewDialog });
