/* ============================================================
   页面 5.2 · 事务详情（六要素）
   单条事务作为派给 6699.com AI 员工执行与验收的完整输入
   ============================================================ */

const TD_TYPE = window.TASK_TYPE;
const TD_STATUS = window.TASK_STATUS;

/* 六要素定义（②~⑥；① 名称即标题） */
const SIX_DEF = [
  { key: 'what',     n: '02', label: '是什么', en: 'definition', icon: 'file-text', hint: '定义' },
  { key: 'why',      n: '03', label: '为什么做', en: 'background', icon: 'help-circle', hint: '背景' },
  { key: 'how',      n: '04', label: '期望怎么做', en: 'boundary', icon: 'square-dashed', hint: '只给范围边界，不教步骤' },
  { key: 'criteria', n: '05', label: '验收标准', en: 'criteria', icon: 'list-checks', hint: '验收 AI 依据' },
  { key: 'effect',   n: '06', label: '期望达到的效果', en: 'effect', icon: 'target', hint: '效果' },
];

/* 缺省六要素生成器 */
function buildSix(task) {
  if (task.six) return task.six;
  const ty = TD_TYPE[task.type];
  return {
    what: `${task.title}：由「${task.ai}」承接执行的${ty.label}类事务，作为达成本周目标的一个执行单元。`,
    why: '为达成周目标，AI 将目标拆解为该事务进入执行层，须明确六要素后再行派发。',
    how: ['在既有约束与规范内完成，不引入越界变更。', '仅给出范围边界，具体实现由 AI 员工自行决定。'],
    criteria: ['产出符合事务定义与效果预期。', '通过验收 AI 的标准审核。'],
    effect: '该事务交付后，对应的周目标推进度按计划前进。',
  };
}

function ProcessTimeline({ steps }) {
  return (
    <div className="td-process">
      {steps.map((s, i) => (
        <div className="td-proc-item" key={i}>
          <span className={`td-proc-dot${s.done ? ' done' : ''}`} />
          <div className="td-proc-main">
            <div className="td-proc-t">{s.t}</div>
            <div className="td-proc-s">{s.s} · <span className="td-proc-time">{s.time}</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AcceptBar({ accept }) {
  if (!accept) return null;
  const map = {
    pass:    { r: 'pass', icon: 'circle-check', color: 'var(--success)', title: '验收通过' },
    fail:    { r: 'fail', icon: 'x-circle', color: 'var(--danger)', title: '验收未通过 · 已打回迭代' },
    running: { r: 'running', icon: 'loader-2', color: 'var(--ai)', title: '验收中 · 验收 AI 按标准审核', spin: true },
    pending: { r: 'pending', icon: 'clock', color: 'var(--text-500)', title: '尚未进入验收' },
  };
  const m = map[accept.state] || map.pending;
  return (
    <div className="td-accept" data-r={m.r}>
      <span style={{ flex: 'none', marginTop: 1 }}><Icon name={m.icon} size={20} color={m.color} className={m.spin ? 'spin' : ''} /></span>
      <div className="td-accept-main">
        <div className="td-accept-title">{m.title}</div>
        <div className="td-accept-sub">
          {accept.note || (accept.state === 'pass' ? '产出符合验收标准，已标记完成。' : accept.state === 'fail' ? '验收 AI 已打包问题与修改建议退回起草方迭代。' : accept.state === 'running' ? '默认不实时监测，验收结论生成后更新。' : '事务进入待验收后由验收 AI 自动审核。')}
          {accept.date && <> · <span className="mono">{accept.date}</span></>}
        </div>
      </div>
    </div>
  );
}

function TaskDetail({ task, onBack, onNavigate, onToast }) {
  const [showProcess, setShowProcess] = React.useState(false);
  const ty = TD_TYPE[task.type];
  const st = TD_STATUS[task.status];
  const six = buildSix(task);

  const metas = [
    { k: '负责 AI 员工', v: task.ai, icon: 'bot' },
    { k: 'Deadline', v: task.dl, icon: 'flag', mono: true },
    { k: '算力成本', v: window.fmtCost(task.cost), icon: 'cpu', mono: true },
  ];

  return (
    <>
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="td-back" onClick={onBack}><Icon name="arrow-left" size={15} color="var(--text-500)" />看板</button>
          <div>
            <h1 className="t-h1" style={{ fontSize: 20 }}>事务详情</h1>
          </div>
        </div>
        <div className="page-head-right">
          <FeedbackEntry label="对产出留意见" onClick={() => onToast && onToast('已记录意见 · 可触发「局部重写 / 任务打回」（动作层）')} />
          <Button variant="secondary" size="sm" icon="plug" onClick={() => onNavigate && onNavigate('p-task')}>查看 6699 派发</Button>
        </div>
      </div>

      <div className="td-layout">
        <div className="td-main">
          {/* 事务头 */}
          <div className="td-head">
            <div className="td-head-top">
              <span className="tb-type" style={{ color: ty.c, background: ty.bg }}><span className="tb-type-dot" style={{ background: ty.c }} />{ty.label}</span>
              <span className="pill" style={{ background: st.bg, color: st.c }}><Icon name={st.icon} size={13} color={st.c} className={st.spin ? 'spin' : ''} />{st.label}</span>
              <span className="mono" style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-400)' }}>{task.id}</span>
            </div>
            <div className="td-head-title">{task.title}</div>
            {(task.blocked || task.fail) && (
              <div style={{ marginTop: 14 }}>
                <StatusBar tone={task.status === 'failed' ? 'danger' : 'warning'} icon={task.status === 'failed' ? 'x-circle' : 'ban'} title={task.status === 'failed' ? '事务失败' : '事务阻塞'}>
                  {task.fail || task.blocked}
                </StatusBar>
              </div>
            )}
            <div className="td-head-meta">
              {metas.map(m => (
                <div className="td-head-m" key={m.k}>
                  <span className="td-head-mk">{m.k}</span>
                  <span className={`td-head-mv${m.mono ? ' mono' : ''}`}>
                    {m.icon === 'bot' ? <span className="tb-card-ai" style={{ fontSize: 13 }}><span className="av">{task.ai[0]}</span></span> : <Icon name={m.icon} size={14} color="var(--text-400)" />}
                    {m.v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 六要素 */}
          <div className="td-six">
            <div className="td-six-head">
              <Icon name="list-checks" size={17} color="var(--blue-primary)" />
              <span className="t">事务六要素 · 派发必填</span>
              <span className="req"><Icon name="shield-check" size={13} color="var(--text-400)" />六要素齐备方可派发执行</span>
            </div>

            {/* ① 名称 */}
            <div className="td-el">
              <span className="td-el-n">01</span>
              <div className="td-el-main">
                <div className="td-el-label">名称<span className="en">name</span></div>
                <div className="td-el-body">{task.title}</div>
              </div>
            </div>

            {SIX_DEF.map(d => (
              <div className="td-el" key={d.key}>
                <span className="td-el-n">{d.n}</span>
                <div className="td-el-main">
                  <div className="td-el-label">{d.label}<span className="en">{d.en}</span>{d.hint && <span className="td-el-hint"><Icon name="info" size={12} color="var(--text-400)" />{d.hint}</span>}</div>
                  {Array.isArray(six[d.key]) ? (
                    <ul className={`td-el-list${d.key === 'criteria' ? ' crit' : ''}`}>
                      {six[d.key].map((it, i) => <li key={i}><span className="dot" />{it}</li>)}
                    </ul>
                  ) : (
                    <div className="td-el-body">{six[d.key]}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 执行产出 */}
          <div className="td-output">
            <div className="td-sec-head">
              <Icon name="package-open" size={17} color="var(--text-500)" />
              <span className="t">执行产出</span>
              <span className="right">
                {task.output && <button className="td-out-toggle" onClick={() => setShowProcess(s => !s)}><Icon name={showProcess ? 'eye-off' : 'eye'} size={13} color="var(--text-500)" />{showProcess ? '收起产出过程' : '查看产出过程'}</button>}
              </span>
            </div>
            {task.output ? (
              <div className="td-out-card">
                <div className="td-out-row">
                  <span className="td-out-ico"><Icon name="sparkles" size={17} color="var(--ai)" /></span>
                  <div className="td-out-main">
                    <div className="td-out-title">{task.output.title}</div>
                    <div className="td-out-sub">{task.output.sub}</div>
                  </div>
                </div>
                {showProcess && task.output.process && <ProcessTimeline steps={task.output.process} />}
                {!showProcess && <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--text-400)', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="info" size={12} color="var(--text-400)" />默认不实时监测执行过程，可展开查看产出过程留痕。</div>}
              </div>
            ) : (
              <div className="td-out-card" style={{ color: 'var(--text-400)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="hourglass" size={15} color="var(--text-400)" />{task.status === 'draft' ? '事务仍在草稿态，尚未派发执行，暂无产出。' : '尚未产生执行产出。'}
              </div>
            )}
            {task.accept && <div style={{ marginTop: 14 }}><AcceptBar accept={task.accept} /></div>}
          </div>
        </div>

        {/* 右栏 */}
        <aside className="td-rail">
          <div className="td-rail-card">
            <div className="td-rail-label">本事务算力成本</div>
            <div className="td-cost"><span className="td-cost-v">{task.cost === 0 ? '—' : '¥' + task.cost.toLocaleString('en-US')}</span><span className="td-cost-u">累计</span></div>
            <div className="td-cost-rows">
              <div className="td-cost-row"><span className="td-cost-k"><Icon name="bot" size={13} color="var(--text-400)" />AI 员工调用</span><span className="td-cost-val">{task.cost === 0 ? '0' : Math.round(task.cost / 8)} 次</span></div>
              <div className="td-cost-row"><span className="td-cost-k"><Icon name="repeat" size={13} color="var(--text-400)" />验收迭代</span><span className="td-cost-val">{task.status === 'failed' ? '3 轮' : task.status === 'done' ? '1 轮' : '进行中'}</span></div>
              <div className="td-cost-row"><span className="td-cost-k"><Icon name="gauge" size={13} color="var(--text-400)" />占周成本</span><span className="td-cost-val">{task.cost === 0 ? '0%' : Math.round(task.cost / 188 * 10) / 10 + '%'}</span></div>
            </div>
          </div>

          <div className="td-rail-card">
            <div className="td-rail-label">异步反馈 · 动作层</div>
            <button className="td-link" onClick={() => onToast && onToast('已发起「局部重写」· AI 将按意见局部修订产出')}>
              <Icon name="pencil-line" size={14} color="var(--blue-primary)" /><span>对产出局部重写</span><Icon name="arrow-right" size={13} color="var(--text-400)" className="arr" />
            </button>
            <button className="td-link" onClick={() => onToast && onToast('已「任务打回」· 事务退回执行层重做')}>
              <Icon name="undo-2" size={14} color="var(--warning)" /><span>任务打回重做</span><Icon name="arrow-right" size={13} color="var(--text-400)" className="arr" />
            </button>
          </div>

          <div className="td-rail-card">
            <div className="td-rail-label">派发与路由</div>
            <button className="td-link" onClick={() => onNavigate && onNavigate('p-task')}>
              <Icon name="plug" size={14} color="var(--blue-primary)" /><span>在 6699.com 查看派发</span><Icon name="arrow-right" size={13} color="var(--text-400)" className="arr" />
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}

Object.assign(window, { TaskDetail });
