/* ============================================================
   页面 2.1b · 管理者意图录入
   ------------------------------------------------------------
   作用：项目集负责人主动以自然语言 / 文件提交规划。复用「战略意图识别」的传导逻辑，
         但输入源由「每日战略文档」改为「负责人主动输入」。
   核心流程：AI 识别战略意图 → 自动落实 → 每次提交沉淀为一条「规划记录」
         （AI 自动总结标题 + 日期），可在记录间切换查看详情、影响与异步反馈。
   状态机（见 ManagerIntent.stage）：compose 录入 → analyzing 分析 → result 记录详情
         / newresult 新领域（冷启动，新建项目集）。
   依赖：复用 pages_b2_strategy.jsx 的 ActionReviewDialog / FeedbackEntry / PortfolioPicker。
   ============================================================ */

const TODAY = '2026-06-02';

/* summarizeTitle — 把用户输入的一段话自动提炼为记录标题（取首句、超 18 字截断）。
   ⚠ 真实开发：应由后端/大模型生成标题，此为前端简化模拟。 */
function summarizeTitle(text) {
  const t = (text || '').trim();
  if (!t) return '未命名规划';
  const seg = (t.split(/[，。；、,.!?\n]/)[0] || t).trim();
  return seg.length > 18 ? seg.slice(0, 18) + '…' : seg;
}

const MI_MEM_META = {
  add:    { label: '新增候选', color: 'var(--success)', bg: 'var(--success-bg)', icon: 'user-plus' },
  keep:   { label: '保留', color: 'var(--text-500)', bg: 'var(--neutral-bg)', icon: 'user-check' },
  down:   { label: '降为后备', color: 'var(--warning)', bg: 'var(--warning-bg)', icon: 'user-minus' },
  remove: { label: '移除候选', color: 'var(--danger)', bg: 'var(--danger-bg)', icon: 'user-x' },
};

/* 每个项目集 · 负责人规划记录（最新在前）。每条记录自带 AI 总结标题、日期、
   原始输入 input、识别意图 intent 与四类影响（结构同战略层，新增 members 「备选成员调整」）。
   ⚠ mock 数据：真实开发需接后端规划记录接口。 */
const INTENT_HISTORY = {
  service: [
    {
      id: 'svc-1', date: '2026-06-02', title: '客服自助延伸至售后办理',
      input: '希望把客服自助能力延伸到售后场景，重点是退换货和理赔的自助办理。另外这周和供应链团队对齐下来，工单里识别到的物流异常应该能自动同步给履约团队。',
      files: [{ name: '客户服务周会纪要-0531.docx' }],
      intent: { tag: '能力延伸 · 售后自助', summary: '识别为对「客户服务自助化」项目集的一项能力延伸规划：将自助能力从咨询 / 查询扩展到退换货与理赔，并打通工单异常向履约团队的同步。' },
      uptake: [
        { name: '客服知识中枢重构', parent: true, ops: [{ field: '中短期目标', op: 'modify', before: '客服自助率 ≥ 70%，覆盖咨询与查询场景。', after: '自助范围延伸至售后：退换货、理赔自助办理率 ≥ 50%。' }] },
        { name: '智能工单分派系统', parent: false, ops: [{ field: '受理范围', op: 'modify', before: '以咨询、查询类工单的自动分派为主。', after: '新增退换货 / 理赔类工单的自助前置与智能路由。' }] },
      ],
      newSub: [
        { parent: '客服知识中枢重构', goalOp: 'add', goal: '理想化状态新增「售后自助办理覆盖退换货 / 理赔全流程」', sub: '售后自助办理闭环', subDesc: '承接管理者规划，构建退换货与理赔的端到端自助办理能力。', status: '进入备选池分析' },
      ],
      pool: [
        { name: '售后自助办理引擎', prev: 64, score: 71, threshold: 80, result: 'hold', note: '由本次规划新沉淀，已达初评但未到门槛；进入备选池每日复盘。' },
      ],
      members: [
        { sub: '售后自助办理闭环', changes: [
          { op: 'add', name: '逆向物流 Agent', reason: '退换货场景新增逆向物流编排能力' },
          { op: 'add', name: '理赔风控 Agent', reason: '理赔自助需接入风控与规则校验' },
          { op: 'keep', name: '内容生成 Agent', reason: '复用其自助话术与知识卡片生成能力' },
          { op: 'down', name: '体验设计 Agent', reason: '接口未通（stub），暂降为后备候选' },
        ] },
      ],
    },
    {
      id: 'svc-2', date: '2026-05-30', title: '高峰坐席集中到情感与投诉场景',
      input: '大促高峰期希望把人工坐席集中到投诉与情感场景，常规咨询尽量全部走自助，缓解坐席压力。',
      files: [],
      intent: { tag: '资源再聚焦 · 坐席', summary: '识别为对坐席资源的再聚焦规划：高峰期常规咨询转自助，人工坐席集中于投诉与情感场景。' },
      uptake: [
        { name: '客服知识中枢重构', parent: true, ops: [{ field: '人力配置原则', op: 'modify', before: '坐席覆盖全部咨询与查询场景。', after: '高峰期坐席集中投诉 / 情感场景，常规咨询转自助兜底。' }] },
      ],
      newSub: [],
      pool: [
        { name: '坐席弹性调度引擎', prev: 60, score: 66, threshold: 80, result: 'hold', note: '高峰弹性价值明确但通用性不足，留池每日复盘。' },
      ],
      members: [],
    },
  ],
  fulfill: [
    {
      id: 'ful-1', date: '2026-06-01', title: '工单物流异常跨域联动',
      input: '把客服工单侧识别到的物流异常，做成可以实时触达履约调度的联动信号，让调度能在异常发生时主动介入。',
      files: [],
      intent: { tag: '风险联动 · 跨域协同', summary: '识别为对「履约与供应链」项目集的一项协同规划：将客服工单侧识别到的物流异常做成可实时触达履约调度的联动信号。' },
      uptake: [
        { name: '智能履约调度中台', parent: true, ops: [{ field: '核心价值', op: 'modify', before: '以履约时效与运力利用率最优为核心。', after: '新增「物流异常可被工单侧实时触达并联动调度」。' }] },
      ],
      newSub: [
        { parent: '智能履约调度中台', goalOp: 'add', goal: '里程碑新增「工单侧物流异常 5 分钟内联动调度」', sub: '异常信号跨域联动', subDesc: '打通客服工单与履约调度的异常信号通路，承接管理者规划。', status: '进入备选池分析' },
      ],
      pool: [
        { name: '跨域异常联动中台', prev: 48, score: 58, threshold: 80, result: 'hold', note: '外部成熟度不足，留池每日动态复盘。' },
      ],
      members: [
        { sub: '异常信号跨域联动', changes: [
          { op: 'add', name: '数据接入 Agent', reason: '需接入工单与物流双侧数据源' },
          { op: 'keep', name: '调度算法 Agent', reason: '复用现有跨区域调度联动能力' },
          { op: 'add', name: '风控运营 Agent', reason: '异常分级与处置规则' },
        ] },
      ],
    },
    {
      id: 'ful-2', date: '2026-05-29', title: '下沉重点区域运力前置布点',
      input: '下沉市场几个重点区域的运力明显不够，想提前布点，把网点密度先铺起来，支撑增长。',
      files: [{ name: '区域运力缺口梳理.xlsx' }],
      intent: { tag: '增长支撑 · 履约', summary: '识别为对下沉市场履约网络的前置布点规划：在重点区域提前补齐网点密度。' },
      uptake: [
        { name: '智能履约调度中台', parent: true, ops: [{ field: '里程碑', op: 'modify', before: '按既有网点完成调度联调。', after: '新增下沉重点区域网点前置布点与运力预置目标。' }] },
      ],
      newSub: [],
      pool: [
        { name: '区域履约网络扩张', prev: 70, score: 76, threshold: 80, result: 'hold', note: '距门槛 4 分，继续每日复盘。' },
      ],
      members: [],
    },
  ],
  growth: [
    {
      id: 'gro-1', date: '2026-06-01', title: '营销内容提优先级支撑下沉获客',
      input: '把营销内容生成的排期往前提，集中资源优先支撑下沉市场的获客投放。',
      files: [],
      intent: { tag: '资源再聚焦', summary: '识别为对「增长与营销」项目集的一项资源再聚焦规划：上调营销内容生成的优先级，集中支撑下沉市场获客。' },
      uptake: [
        { name: '营销内容生成平台', parent: false, ops: [{ field: '优先级', op: 'modify', before: '按既定排期推进 v3.0。', after: '按管理者规划上调优先级，优先支撑下沉市场获客投放。' }] },
      ],
      newSub: [],
      pool: [
        { name: '下沉获客增长引擎', prev: 70, score: 79, threshold: 80, result: 'hold', note: '距门槛 1 分，继续每日复盘。' },
      ],
      members: [],
    },
    {
      id: 'gro-2', date: '2026-05-27', title: '线下门店数字化收缩资源回流',
      input: '线下门店那块先收一收，把资源挪到线上增长方向上来。',
      files: [],
      intent: { tag: '收缩 · 资源回收', summary: '识别为对线下门店数字化投入的收缩规划：下调相关项目优先级，资源回流至线上增长。' },
      uptake: [
        { name: '门店选址评估模型', parent: false, ops: [{ field: '优先级', op: 'modify', before: '按规划 v0.9 正常推进。', after: '下调优先级，释放资源回流至线上增长方向。' }] },
      ],
      newSub: [],
      pool: [],
      members: [],
    },
  ],
  data: [
    {
      id: 'dat-1', date: '2026-06-02', title: '对账口径统一到全域',
      input: '把各业务线的对账口径统一到全域口径上，先从供应商对账开始落地。',
      files: [],
      intent: { tag: '口径统一', summary: '识别为对「数据与财务中台」项目集的一项治理规划：将各业务线对账口径统一到全域口径，先从供应商对账落地。' },
      uptake: [
        { name: '供应商对账自动化', parent: false, ops: [{ field: '数据口径', op: 'modify', before: '按各业务线现有口径分别对账。', after: '统一至全域对账口径，承接管理者本次治理规划。' }] },
      ],
      newSub: [],
      pool: [],
      members: [],
    },
  ],
};

const INTENT_SECTIONS = [
  { key: 'uptake', title: '现有项目承接规划', icon: 'git-fork', color: 'var(--blue-primary)', hint: 'AI 已执行' },
  { key: 'newSub', title: '新增子项目 · 沉淀备选池', icon: 'inbox', color: 'var(--success)' },
  { key: 'pool', title: '备选池动态复盘', icon: 'refresh-cw', color: 'var(--ai)' },
  { key: 'members', title: '子项目备选成员调整', icon: 'users', color: 'var(--info)' },
];

const MI_STEPS = [
  { icon: 'scan-search', t: '识别战略意图', s: '从输入与上传文件中提取规划要点与目标' },
  { icon: 'list-checks', t: '预估将执行的动作', s: '先给出 AI 拟采取的动作清单' },
  { icon: 'git-branch', t: '评估子项目与备选成员', s: '判断是否新增子项目、备选成员是否调整' },
  { icon: 'zap', t: '自动落实并沉淀记录', s: '复用与战略文档更新一致的传导逻辑执行' },
];

const fmtBytes = (n) => n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(1)} MB`;
const mdDate = (full) => full ? full.slice(5) : '';

/* ---------- 录入态：自然语言 + 文件 ----------
   IntentComposer：文本输入 + 拖拽/点击上传文件（最多 6 个）。
   交互：drag 状态控拖拽高亮；addFiles 追加文件；受控 text/files 由父级持有，onnSubmit 提交。 */
function IntentComposer({ text, onText, files, onFiles, onSubmit, placeholder }) {
  const fileRef = React.useRef(null);
  const [drag, setDrag] = React.useState(false);

  const addFiles = (list) => {
    const next = Array.from(list).map(f => ({ name: f.name, size: f.size || 0 }));
    onFiles([...files, ...next].slice(0, 6));
  };

  return (
    <Card className="mi-composer">
      <div className="mi-composer-head">
        <span className="mi-ai-ava"><Icon name="sparkles" size={16} color="var(--ai)" /></span>
        <div className="mi-composer-head-main">
          <div className="t-h3">请输入你的规划想法</div>
        </div>
      </div>

      <textarea
        className="mi-textarea"
        value={text}
        onChange={(e) => onText(e.target.value)}
        placeholder={placeholder || "例如：希望把客服自助能力延伸到售后场景，重点是退换货和理赔的自助办理…"}
      />

      <div
        className="mi-drop"
        data-drag={drag}
        onClick={() => fileRef.current && fileRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); }}
      >
        <Icon name="upload-cloud" size={20} color="var(--text-400)" />
        <div className="mi-drop-main">
          <span className="mi-drop-t">拖拽或点击上传文件</span>
          <span className="mi-drop-s">会议纪要、个人思考沉淀等 · AI 自动分析文件与文本内容</span>
        </div>
        <input ref={fileRef} type="file" multiple hidden onChange={(e) => { if (e.target.files.length) addFiles(e.target.files); e.target.value = ''; }} />
      </div>

      {files.length > 0 && (
        <div className="mi-files">
          {files.map((f, i) => (
            <span className="mi-file" key={i}>
              <Icon name="file-text" size={13} color="var(--blue-primary)" />
              <span className="mi-file-nm">{f.name}</span>
              {f.size > 0 && <span className="mi-file-sz mono">{fmtBytes(f.size)}</span>}
              <button className="mi-file-x" onClick={(e) => { e.stopPropagation(); onFiles(files.filter((_, j) => j !== i)); }} title="移除">
                <Icon name="x" size={12} color="var(--text-400)" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mi-composer-foot">
        <Button variant="primary" icon="sparkles" disabled={!text.trim() && files.length === 0} onClick={onSubmit}>提交并分析</Button>
      </div>
    </Card>
  );
}

/* ---------- 本项目集规划记录列表（录入态下方） ----------
   RecordsList：点某条 → onOpen(id) 打开该记录详情。 */
function RecordsList({ records, onOpen }) {
  return (
    <Card className="mi-recs">
      <div className="mi-recs-head">
        <Icon name="history" size={16} color="var(--blue-primary)" />
        <span className="t-h3" style={{ fontSize: 14 }}>本项目集规划记录</span>
        <span className="t-micro" style={{ color: 'var(--text-400)', marginLeft: 'auto' }}>{records.length} 条 · 每次提交沉淀一条</span>
      </div>
      <div className="mi-recs-list">
        {records.map(r => (
          <button className="mi-rec-row" key={r.id} onClick={() => onOpen(r.id)}>
            <span className="mi-rec-date mono">{mdDate(r.date)}</span>
            <span className="mi-rec-main">
              <span className="mi-rec-title">{r.title}</span>
              <span className="mi-rec-sub">{r.intent.summary}</span>
            </span>
            <span className="mi-rec-tag"><Icon name="scan-search" size={11} color="var(--ai)" />{r.intent.tag}</span>
            <Icon name="chevron-right" size={16} color="var(--text-400)" />
          </button>
        ))}
      </div>
    </Card>
  );
}

/* ---------- 规划记录标题选择器（替代日期选择） ----------
   TitlePicker：result 态下在记录间切换。open 控制下拉，点外部关闭。 */
function TitlePicker({ records, value, onChange }) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (!open) return;
    const h = () => setOpen(false);
    window.addEventListener('click', h);
    return () => window.removeEventListener('click', h);
  }, [open]);
  const cur = records.find(r => r.id === value) || records[0];
  return (
    <div className="mi-tpick" onClick={(e) => e.stopPropagation()}>
      <button className="mi-tpick-btn" onClick={() => setOpen(o => !o)}>
        <Icon name="file-text" size={15} color="var(--blue-primary)" />
        <span className="mi-tpick-label">{cur.title}</span>
        <span className="mi-tpick-date mono">{cur.date}</span>
        <Icon name="chevron-down" size={14} color="var(--text-400)" />
      </button>
      {open && (
        <div className="mi-tpick-menu">
          <div className="mi-tpick-menu-head t-label-caps">规划记录 · 选择标题查看</div>
          {records.map(r => (
            <button key={r.id} className="mi-tpick-opt" data-on={r.id === value} onClick={() => { onChange(r.id); setOpen(false); }}>
              <span className="mi-tpick-opt-main">
                <span className="mi-tpick-opt-title">{r.title}</span>
                <span className="mi-tpick-opt-tag">{r.intent.tag}</span>
              </span>
              <span className="mi-tpick-opt-date mono">{mdDate(r.date)}</span>
              {r.id === value && <Icon name="check" size={15} color="var(--blue-primary)" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- 分析态 ----------
   IntentAnalyzing：提交后的「AI 分析中」动画。step 计数器逐步点亮 MI_STEPS（识别→预估→评估→落实）。
   ⚠ 纯演示：用 setTimeout 逐步推进，真实开发以后端任务进度驱动。 */
function IntentAnalyzing() {
  const [step, setStep] = React.useState(0);
  React.useEffect(() => {
    const timers = MI_STEPS.map((_, i) => setTimeout(() => setStep(i + 1), 480 + i * 480));
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <Card className="mi-analyzing">
      <div className="mi-an-spinner"><span className="ai-spinner" /></div>
      <div className="t-h3">战略意图识别 AI 正在分析你的规划</div>
      <p className="t-caption" style={{ marginTop: 4 }}>先预估将执行的动作，再自动落实，并把本次提交沉淀为一条规划记录。</p>
      <div className="mi-an-steps">
        {MI_STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div className="mi-an-step" key={i} data-state={done ? 'done' : active ? 'run' : 'idle'}>
              <span className="mi-an-step-ico">
                <Icon name={done ? 'circle-check' : active ? 'loader-2' : s.icon} size={16}
                  color={done ? 'var(--success)' : active ? 'var(--ai)' : 'var(--text-400)'}
                  className={active ? 'spin' : ''} />
              </span>
              <div className="mi-an-step-main">
                <span className="mi-an-step-t">{s.t}</span>
                <span className="mi-an-step-s">{s.s}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ---------- 记录详情 · 影响看板 ----------
   IntentBoard：展示一条规划记录的原始输入、AI 识别意图、以及 AI 已执行的四类动作。
   交互：每条动作右上角反馈按钮 → onFeedback(action) 打开复核对话（同战略层）。
   props：record 记录对象；isNew 是否本轮刚提交（首部图标不同）。 */
function IntentBoard({ record, isNew, onFeedback }) {
  const buckets = { uptake: record.uptake, newSub: record.newSub, pool: record.pool, members: record.members };
  const total = buckets.uptake.length + buckets.newSub.length + buckets.pool.length + buckets.members.length;

  return (
    <>
      <Card className="mi-recap">
        <div className="mi-recap-head">
          <span className="mi-ai-ava"><Icon name={isNew ? 'check' : 'file-text'} size={15} color={isNew ? 'var(--success)' : 'var(--blue-primary)'} /></span>
          <div className="mi-recap-head-main">
            <div className="t-h3" style={{ fontSize: 15 }}>{record.title}</div>
          </div>
          <span className="mi-intent-tag"><Icon name="scan-search" size={12} color="var(--ai)" />{record.intent.tag}</span>
        </div>
        {record.input && <blockquote className="mi-quote">{record.input}</blockquote>}
        {record.files && record.files.length > 0 && (
          <div className="mi-files" style={{ marginTop: 10 }}>
            {record.files.map((f, i) => (
              <span className="mi-file" key={i}><Icon name="file-text" size={13} color="var(--blue-primary)" /><span className="mi-file-nm">{f.name}</span></span>
            ))}
          </div>
        )}
        <div className="mi-recap-intent"><Icon name="sparkles" size={13} color="var(--ai)" /><span><b>AI 识别意图：</b>{record.intent.summary}</span></div>
      </Card>

      <Card>
        <div className="st-panel-head">
          <Icon name="sparkles" size={17} color="var(--ai)" />
          <span className="t-h3">AI 已执行动作</span>
          <span className="t-micro" style={{ color: 'var(--text-400)', marginLeft: 'auto' }}>{total > 0 ? `${total} 项 · 可复核` : '本次无动作'}</span>
        </div>
        <div className="st-panel-body">
          {total === 0 ? (
            <div className="st-pf-empty"><Icon name="circle-check" size={16} color="var(--success)" />本次规划未影响该项目集内的项目，AI 无需执行任何动作。</div>
          ) : (
            <>
              <div className="st-exec-banner">
                <Icon name="zap" size={14} color="var(--ai)" />
                <span>AI 已识别本条规划并自动落实。你可逐条复核，点击右上角 <Icon name="message-square-text" size={12} color="var(--text-400)" style={{ verticalAlign: '-2px' }} /> 发起异步反馈，AI 将识别意图、给出调整方案（含回撤），确认后再次执行。</span>
              </div>
              <div className="st-imp">
                {INTENT_SECTIONS.map(sec => {
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
                          <div className="st-imp-item has-fb" key={i}>
                            <button className="st-fb-btn" title="对该动作发起异步反馈" onClick={() => onFeedback({ kind: 'modify', project: r.name, detail: r.ops.map(o => o.field).join('、'), summary: `AI 已修改其「${r.ops.map(o => o.field).join('、')}」等关键信息。` })}>
                              <Icon name="message-square-text" size={15} color="var(--text-400)" />
                            </button>
                            <div className="st-imp-row">
                              <span className="st-imp-name">{r.name}{r.parent && <span className="st-imp-tag">母项目</span>}</span>
                            </div>
                            <div className="st-imp-ops">
                              {r.ops.map((op, k) => (
                                <div className="st-op" data-op={op.op} key={k}>
                                  <div className="st-op-head">
                                    <span className="st-op-badge" data-op={op.op}>{op.op === 'modify' ? '修改' : op.op === 'add' ? '新增' : '删除'}</span>
                                    <span className="st-op-field">{op.field}</span>
                                  </div>
                                  <div className="st-op-diff">
                                    <div className="st-op-line is-before"><span className="st-op-lab">当前</span><span className="st-op-txt">{op.before}</span></div>
                                    <div className="st-op-line is-after"><span className="st-op-lab">AI 拟改为</span><span className="st-op-txt">{op.after}</span></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        {sec.key === 'newSub' && rows.map((r, i) => (
                          <div className="st-imp-item has-fb" key={i}>
                            <button className="st-fb-btn" title="对该动作发起异步反馈" onClick={() => onFeedback({ kind: 'newSub', project: r.sub, parent: r.parent, summary: `AI 已新增子项目并使其进入备选池分析。` })}>
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
                              <button className="st-fb-btn" title="对该动作发起异步反馈" onClick={() => onFeedback({ kind: met ? 'charter' : 'hold', project: c.name, summary: met ? `AI 复盘后该候选已达门槛，已自动立项。` : `AI 复盘后该候选未达门槛，已留在备选池继续每日复盘。` })}>
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

                        {sec.key === 'members' && rows.map((r, i) => (
                          <div className="st-imp-item has-fb" key={i}>
                            <button className="st-fb-btn" title="对该动作发起异步反馈" onClick={() => onFeedback({ kind: 'modify', project: r.sub, detail: '备选成员', summary: `AI 已调整其备选成员名单（${r.changes.length} 项变更）。` })}>
                              <Icon name="message-square-text" size={15} color="var(--text-400)" />
                            </button>
                            <div className="st-imp-row">
                              <span className="st-imp-name"><Icon name="users" size={14} color="var(--info)" />{r.sub}</span>
                              <span className="st-imp-action" style={{ color: 'var(--info)', background: 'var(--info-bg)' }}>备选成员复盘</span>
                            </div>
                            <div className="mi-mem-foot"><Icon name="info" size={12} color="var(--text-400)" />子项目复盘的备选成员（6699.com AI 员工）随本条规划重新评估：</div>
                            <div className="mi-mem-list">
                              {r.changes.map((m, k) => (
                                <div className="mi-mem-row" key={k}>
                                  <span className="mi-mem-badge" style={{ color: MI_MEM_META[m.op].color, background: MI_MEM_META[m.op].bg }}>
                                    <Icon name={MI_MEM_META[m.op].icon} size={11} color={MI_MEM_META[m.op].color} />{MI_MEM_META[m.op].label}
                                  </span>
                                  <span className="mi-mem-nm">{m.name}</span>
                                  <span className="mi-mem-reason">{m.reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </Card>
    </>
  );
}

/* ============================================================
   新领域 / 冷启动 · AI 归属判定 → 新建项目集
   现有项目集无法承接（或系统空库）时，意图不再被迫塞入既有项目集，
   而是由 AI 判定为全新方向 → 新建项目集 → 首个候选入池 → 登记进战略层。
   ============================================================ */
const NEW_DOMAIN_SAMPLE = {
  intentSummary: '识别为一个全新战略方向：面向线下门店导购的 AI 助手，现有项目集均未覆盖该场景。',
  reason: '逐一比对现有项目集的北极星与边界——「线下门店导购」既不属于客户服务自助化的线上自助范畴，也不在履约、增长、数据中台的边界内。AI 判定为全新方向，新建独立项目集承接，避免塞入既有项目集稀释其聚焦。',
  portfolio: { name: '智能门店导购', owner: 'AI 自治', ownerSuggest: '建议负责人 林越', north: '导购人效与连带率双升', scope: '面向线下门店导购，构建商品知识实时问答、销售话术生成与顾客跟进提醒的端到端 AI 助手能力。' },
  firstProject: { name: 'AI 导购助手', note: '作为新项目集的首个候选沉淀进备选池，AI 正在补齐六维分析与门槛校验，达标后自动立项。' },
  strategy: { note: '已作为「管理者发起」的新增战略方向登记进战略意图识别，纳入每日战略比对与向下传导；后续战略文档若涉及该方向，会与此归并。' },
};

/* NewDomainBoard — 新领域 / 冷启动的归属判定看板。
   作用：现有项目集都无法承接时，AI 判定为全新方向 → 新建项目集 → 首个候选入池 → 登记进战略层。
   交互：confirmed 控制「确认建立项目集」前后态；底部联动算力观测（读 OB_TRACES 算本次链路花费）。 */
function NewDomainBoard({ input, files, onNavigate, onToast }) {
  const d = NEW_DOMAIN_SAMPLE;
  const [confirmed, setConfirmed] = React.useState(false);
  const trc = (window.OB_TRACES || []).find(t => t.id === 'TRC-2026-0602-01');
  const agg = trc && window.obTraceAgg ? window.obTraceAgg(trc) : null;
  const costVal = agg ? (agg.cin + agg.cout).toFixed(1) : '10.2';
  const costLine = agg ? `从识别意图到草拟立项，AI 共 ${agg.calls} 次调用 · 耗时 ${window.obFmtMs(agg.ms)} · Token ${window.obFmtTok(agg.tin + agg.tout)}` : '从识别意图到草拟立项的全过程耗时与 Token 均已逐次记录';
  React.useEffect(() => { refreshIcons(); });
  return (
    <>
      <Card className="mi-recap">
        <div className="mi-recap-head">
          <span className="mi-ai-ava"><Icon name="sparkles" size={15} color="var(--ai)" /></span>
          <div className="mi-recap-head-main">
            <div className="t-h3" style={{ fontSize: 15 }}>{d.portfolio.name} · 新领域</div>
          </div>
          <span className="mi-intent-tag"><Icon name="scan-search" size={12} color="var(--ai)" />全新战略方向</span>
        </div>
        {input && <blockquote className="mi-quote">{input}</blockquote>}
        {files && files.length > 0 && (
          <div className="mi-files" style={{ marginTop: 10 }}>
            {files.map((f, i) => (
              <span className="mi-file" key={i}><Icon name="file-text" size={13} color="var(--blue-primary)" /><span className="mi-file-nm">{f.name}</span></span>
            ))}
          </div>
        )}
        <div className="mi-recap-intent"><Icon name="sparkles" size={13} color="var(--ai)" /><span><b>AI 识别意图：</b>{d.intentSummary}</span></div>
      </Card>

      {/* 1 · 归属判定 */}
      <Card>
        <div className="st-panel-head">
          <Icon name="git-pull-request-arrow" size={17} color="var(--ai)" />
          <span className="t-h3">战略意图归属判定</span>
          <span className="nd-verdict-tag"><Icon name="sparkles" size={12} color="var(--ai)" />新建项目集</span>
        </div>
        <div className="st-panel-body">
          <div className="nd-attr">
            <div className="nd-attr-lab">比对现有项目集</div>
            <div className="nd-attr-chips">
              {PORTFOLIOS.map(p => (
                <span className="nd-chip" key={p.id}>{p.name}<Icon name="x" size={11} color="var(--danger)" /></span>
              ))}
            </div>
          </div>
          <div className="nd-arrow"><Icon name="arrow-down" size={16} color="var(--text-400)" /></div>
          <div className="nd-verdict-card">
            <span className="nd-verdict-ico"><Icon name="sparkles" size={16} color="var(--ai)" /></span>
            <div className="nd-verdict-main">
              <div className="nd-verdict-t">现有项目集均无法承接 · 建议新建项目集</div>
              <div className="nd-verdict-s">{d.reason}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* 2 · 新建项目集 */}
      <Card>
        <div className="st-panel-head">
          <Icon name="layers" size={17} color="var(--blue-primary)" />
          <span className="t-h3">新建项目集 · 待确认</span>
          {confirmed
            ? <span className="nd-verdict-tag" style={{ color: 'var(--success)', background: 'var(--success-bg)' }}><Icon name="check" size={12} color="var(--success)" />已建立</span>
            : <span className="t-micro" style={{ color: 'var(--text-400)', marginLeft: 'auto' }}>AI 已草拟</span>}
        </div>
        <div className="st-panel-body">
          <div className="nd-pf">
            <div className="nd-pf-row"><span className="nd-pf-k">项目集名称</span><span className="nd-pf-v nd-pf-name">{d.portfolio.name}</span></div>
            <div className="nd-pf-row"><span className="nd-pf-k">负责模式</span><span className="nd-pf-v"><Icon name="bot" size={14} color="var(--ai)" />{d.portfolio.owner}<span className="nd-pf-suggest">{d.portfolio.ownerSuggest}</span></span></div>
            <div className="nd-pf-row"><span className="nd-pf-k">北极星指标</span><span className="nd-pf-v">{d.portfolio.north}</span></div>
            <div className="nd-pf-row"><span className="nd-pf-k">初始范围</span><span className="nd-pf-v">{d.portfolio.scope}</span></div>
          </div>
          {confirmed ? (
            <div className="st-exec-banner" style={{ marginTop: 14 }}>
              <Icon name="check-circle-2" size={14} color="var(--success)" />
              <span>项目集「{d.portfolio.name}」已建立，负责模式 {d.portfolio.owner}。此后该领域的管理者意图与战略变化都会自动归属到此项目集。</span>
            </div>
          ) : (
            <div className="nd-actions">
              <Button variant="primary" icon="check" onClick={() => { setConfirmed(true); onToast && onToast('已建立项目集 ·「' + d.portfolio.name + '」（演示）'); }}>确认建立项目集</Button>
              <FeedbackEntry label="对归属判定留意见"
                context={{ scene: '管理者意图 · 归属判定', did: 'AI 判定该意图为全新方向并草拟了新建项目集方案', ask: '归属判定结论、项目集命名或初始范围' }}
                onClick={() => {}} />
            </div>
          )}
        </div>
      </Card>

      {/* 3 · 首个候选入池 */}
      <Card>
        <div className="st-panel-head">
          <Icon name="inbox" size={17} color="var(--success)" />
          <span className="t-h3">首个候选项目 · 沉淀备选池</span>
        </div>
        <div className="st-panel-body">
          <div className="st-imp-item">
            <div className="st-imp-row">
              <span className="st-imp-name"><Icon name="git-branch" size={14} color="var(--success)" />{d.firstProject.name}</span>
              <span className="st-imp-action" style={{ color: 'var(--ai)', background: 'var(--ai-soft)' }}><Icon name="loader-2" size={12} color="var(--ai)" className="spin" />AI 多维分析中</span>
            </div>
            <div className="st-sub-foot"><Icon name="info" size={12} color="var(--text-400)" />{d.firstProject.note}</div>
          </div>
          <button className="nd-link" onClick={() => onNavigate && onNavigate('pool')}><Icon name="arrow-up-right" size={13} color="var(--blue-primary)" />前往项目备选池查看</button>
        </div>
      </Card>

      {/* 4 · 本次链路花费 · 联动算力观测 */}
      <div className="nd-cost">
        <span className="nd-cost-ico"><Icon name="gauge" size={18} color="var(--blue-primary)" /></span>
        <div className="nd-cost-main">
          <div className="nd-cost-t">本次链路已记录算力花费</div>
          <div className="nd-cost-s">{costLine}</div>
        </div>
        <div className="nd-cost-v"><span className="cur">¥</span><span className="mono">{costVal}</span></div>
        <Button variant="secondary" icon="git-fork" onClick={() => { window.__cbTab = 'trace'; window.__traceId = 'TRC-2026-0602-01'; onNavigate && onNavigate('cost-board'); }}>查看全链路成本</Button>
      </div>

      {/* 5 · 战略层登记（联动） */}
      <div className="nd-strat">
        <span className="nd-strat-ico"><Icon name="compass" size={18} color="var(--blue-primary)" /></span>
        <div className="nd-strat-main">
          <div className="nd-strat-t">已同步登记进「战略意图识别」</div>
          <div className="nd-strat-s">{d.strategy.note}</div>
        </div>
        <Button variant="secondary" icon="arrow-right" onClick={() => onNavigate && onNavigate('strategy')}>查看战略意图识别</Button>
      </div>
    </>
  );
}

/* ManagerIntent — 管理者意图页主体（状态机总控）。
   状态：pf 项目集（'__new__' 为新领域）；stage 四态；text/files 录入内容；
     extra 本会话新增的记录（pfId→[记录]）；selId 当前查看的记录；liveId 本轮刚提交的。
   submit：新领域走 newresult；否则拼一条新记录插入 extra（2.6s 模拟分析）后进 result。
   records：本会话新记录 + 历史记录合并（新的在前）。 */
function ManagerIntent({ onNavigate }) {
  const [pf, setPf] = React.useState(() => PORTFOLIOS[0].id);
  const [stage, setStage] = React.useState('compose'); // compose 录入 | analyzing 分析 | result 记录详情 | newresult 新领域
  const [text, setText] = React.useState('');
  const [files, setFiles] = React.useState([]);
  const [extra, setExtra] = React.useState({});       // pfId -> [新增记录]（本会话提交的）
  const [selId, setSelId] = React.useState(null);
  const [liveId, setLiveId] = React.useState(null);   // 本轮刚提交的记录 id（高亮「新」）
  const [fbAction, setFbAction] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  const isNewDomain = pf === '__new__';
  const curPf = PORTFOLIOS.find(p => p.id === pf);
  const records = React.useMemo(
    () => isNewDomain ? [] : [...(extra[pf] || []), ...(INTENT_HISTORY[pf] || [])],
    [extra, pf, isNewDomain]
  );
  const selected = records.find(r => r.id === selId) || records[0];

  const resetCompose = () => { setStage('compose'); setText(''); setFiles([]); setSelId(null); setLiveId(null); };
  const changePf = (v) => { setPf(v); resetCompose(); };

  const submit = () => {
    if (isNewDomain) {
      setStage('analyzing');
      setTimeout(() => setStage('newresult'), 2600);
      return;
    }
    const base = INTENT_HISTORY[pf][0];
    const rec = {
      id: 'live-' + Date.now(),
      date: TODAY,
      title: summarizeTitle(text),
      input: text.trim(),
      files,
      intent: base.intent,
      uptake: base.uptake, newSub: base.newSub, pool: base.pool, members: base.members,
    };
    setStage('analyzing');
    setTimeout(() => {
      setExtra(e => ({ ...e, [pf]: [rec, ...(e[pf] || [])] }));
      setSelId(rec.id);
      setLiveId(rec.id);
      setStage('result');
    }, 2600);
  };

  const openRecord = (id) => { setSelId(id); setLiveId(null); setStage('result'); };
  const newEntry = () => { setStage('compose'); setText(''); setFiles([]); };

  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: '项目管理工作台' }, { label: '管理者意图录入' }]} />
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico"><Icon name="pen-line" size={22} color="var(--blue-primary)" /></span>
          <div>
            <h1 className="t-h1">管理者意图录入</h1>
          </div>
        </div>
      </div>

      <div className="st-version-rail">
        <PortfolioPicker value={pf} onChange={changePf} allowNew />
        {stage === 'result' && records.length > 0 && (
          <>
            <span className="st-rail-div" />
            <TitlePicker records={records} value={selected.id} onChange={(id) => { setSelId(id); setLiveId(null); }} />
            <button className="mi-new-btn" onClick={newEntry}><Icon name="plus" size={15} color="var(--blue-primary)" />新建录入</button>
          </>
        )}
      </div>

      {/* 新领域 · 录入引导条 */}
      {isNewDomain && stage === 'compose' && (
        <div className="mi-nd-banner">
          <span className="mi-nd-banner-ico"><Icon name="sparkles" size={18} color="var(--ai)" /></span>
          <div className="mi-nd-banner-main">
            <div className="mi-nd-banner-t">新领域 · 不限定现有项目集</div>
            <div className="mi-nd-banner-s">描述一个全新方向，AI 会先比对现有项目集——若都无法承接，则判定为新领域并新建独立项目集，而非塞入既有项目集。系统冷启动（空库）时，第一条意图同样以此路径新建第一个项目集。</div>
          </div>
        </div>
      )}

      {stage === 'compose' && (
        <div className="mi-compose">
          <IntentComposer
            text={text} onText={setText} files={files} onFiles={setFiles} onSubmit={submit}
            placeholder={isNewDomain ? '例如：我们想做一个面向线下门店导购的 AI 助手，帮导购实时查商品知识、生成话术、跟进顾客——现在没有任何项目在做这块…' : undefined}
          />
          {!isNewDomain && records.length > 0 && <RecordsList records={records} onOpen={openRecord} />}
        </div>
      )}
      {stage === 'analyzing' && <IntentAnalyzing />}
      {stage === 'result' && selected && (
        <IntentBoard record={selected} isNew={selected.id === liveId} onFeedback={(a) => setFbAction({ ...a, date: selected.date })} />
      )}
      {stage === 'newresult' && (
        <NewDomainBoard input={text.trim()} files={files} onNavigate={onNavigate} onToast={(msg) => setToast({ msg })} />
      )}

      <ActionReviewDialog action={fbAction} pfName={curPf ? curPf.name : '新领域'} onClose={() => setFbAction(null)} onToast={setToast} />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

Object.assign(window, { ManagerIntent });
