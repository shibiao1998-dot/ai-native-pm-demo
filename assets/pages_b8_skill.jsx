/* ============================================================
   批 8 · 技能详情（组合级 · 治理）
   ------------------------------------------------------------
   作用：进入某 AI 员工的技能库后，点开一个技能的完整详情：
         功能介绍 + 调用契约 + 内部逻辑与底层 Prompt（结构化展示）
         + 自然语言迭代（输入 → 预演方案 → 确认落实）
         + 版本控制与回滚（一改一版本 · 非破坏性）+ 进化日志（人为干预 / 自主进化）。
   ============================================================ */

/* bumpVer — 版本号自增（minor +1，如 v3.2 → v3.3）。 */
function bumpVer(v) {
  const m = String(v).replace(/^v/, '').split('.');
  const major = parseInt(m[0] || '1', 10);
  const minor = parseInt(m[1] || '0', 10) + 1;
  return `v${major}.${minor}`;
}

const SK_SRC = {
  human: { label: '人为干预', icon: 'user-pen', cls: 'human' },
  auto: { label: '自主进化', icon: 'sparkles', cls: 'auto' },
  rollback: { label: '回滚', icon: 'rotate-ccw', cls: 'rollback' },
};

/* ============================================================
   自然语言迭代面板
   ------------------------------------------------------------
   SkillIterationPanel：状态机 stage：input 输入 → thinking 预演中 → plan 展示修改方案
     → applied 已落实（生成新版本）。buildPlan 把一句话识别为对底层 prompt 的修改方案（前/后 diff）。
   确认后 onApply(plan) 回传父级生成新版。⚠ 预演为演示，真实开发走后端/大模型。 */
function SkillIterationPanel({ skill, nextVer, onApply }) {
  const [text, setText] = React.useState('');
  const [stage, setStage] = React.useState('input'); // input 输入 | thinking 预演中 | plan 方案 | applied 已落实
  const [plan, setPlan] = React.useState(null);
  const [appliedVer, setAppliedVer] = React.useState(null);
  const taRef = React.useRef(null);
  React.useEffect(() => { refreshIcons(); });

  const chips = skill.iterChips || [
    `调整「${skill.name}」的判定口径`,
    '补充一条约束规则',
    '修正与公司理解不一致之处',
  ];

  const buildPlan = (input) => {
    const before = (skill.prompt && skill.prompt.principles && skill.prompt.principles[0]) || `${skill.name}沿用既有判定逻辑`;
    const after = input.length > 46 ? input.slice(0, 46) + '…' : input;
    return {
      summary: `识别到你希望调整「${skill.name}」的内在逻辑。我将把这条意见内化进该技能的底层提示词与处理逻辑，生成新版本 ${nextVer}，并写入进化日志。`,
      before,
      after: `${after}（作为新的首要原则，覆盖原表述）`,
      impact: '该调整影响此技能的核心判定口径；确认后将一改一版本生成新版，下游引用在下次调用时自动生效，旧版本保留可回滚。',
      userText: input,
    };
  };

  const send = () => {
    const t = text.trim();
    if (!t) return;
    setStage('thinking');
    setTimeout(() => { setPlan(buildPlan(t)); setStage('plan'); }, 1100);
  };

  const confirm = () => {
    setAppliedVer(nextVer);
    onApply(plan);
    setStage('applied');
  };

  const reset = () => { setText(''); setPlan(null); setStage('input'); setTimeout(() => taRef.current && taRef.current.focus(), 40); };

  return (
    <div className="sk-it">
      <div className="sk-it-head">
        <span className="sk-it-head-ico"><Icon name="wand-sparkles" size={18} color="var(--ai)" /></span>
        <div>
          <div className="sk-it-head-t">自然语言迭代</div>
          <div className="sk-it-head-s">查看技能逻辑时，若发现与公司过往理解不一致，直接用一句话说明你的调整建议 —— AI 会预演一个修改方案，确认后即落实并生成新版本。</div>
        </div>
      </div>
      <div className="sk-it-body">
        {(stage === 'input' || stage === 'thinking') && (
          <>
            <div className="sk-it-chips">
              {chips.map((c, i) => <button className="sk-it-chip" key={i} onClick={() => { setText(c); setTimeout(() => taRef.current && taRef.current.focus(), 20); }}>{c}</button>)}
            </div>
            <textarea ref={taRef} className="sk-it-ta" value={text} disabled={stage === 'thinking'}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); }}
              placeholder="例如：理想化状态应以可落地的阶段性终态为锚，而不是纯理论最优 —— 这与我们过往的理解更一致…" />
            <div className="sk-it-foot">
              <span className="sk-it-foot-hint">⌘ / Ctrl + Enter 发送 · 修改将生成新版本 {nextVer}</span>
              <Button variant="primary" icon="send" onClick={send} disabled={!text.trim() || stage === 'thinking'}>预演修改方案</Button>
            </div>
            {stage === 'thinking' && (
              <div className="sk-it-thinking">
                <span className="sk-it-typing"><i /><i /><i /></span>
                正在分析你的意见，并预演对「{skill.name}」底层逻辑的修改…
              </div>
            )}
          </>
        )}

        {stage === 'plan' && plan && (
          <div className="sk-plan">
            <div className="sk-plan-head">
              <Icon name="git-pull-request-arrow" size={15} color="var(--ai)" />
              <span className="sk-plan-head-t">预演修改方案</span>
              <span className="sk-plan-head-ver">{nextVer}</span>
            </div>
            <div className="sk-plan-body">
              <div className="sk-plan-sum">{plan.summary}</div>
              <div className="sk-plan-label">底层逻辑变更（预览）</div>
              <div className="sk-diff">
                <div className="sk-diff-row">
                  <div className="sk-diff-side sk-diff-old"><span className="tag">原</span><span className="txt">{plan.before}</span></div>
                  <div className="sk-diff-side sk-diff-new"><span className="tag">新</span><span className="txt">{plan.after}</span></div>
                </div>
              </div>
              <div className="sk-plan-impact"><Icon name="info" size={14} color="var(--text-500)" /><span>{plan.impact}</span></div>
              <div className="sk-plan-foot">
                <Button variant="primary" size="sm" icon="check" onClick={confirm}>确认并落实迭代</Button>
                <Button variant="secondary" size="sm" icon="rotate-ccw" onClick={reset}>重新描述</Button>
                <span className="sk-plan-hint">不满意？重新描述，我会改方案</span>
              </div>
            </div>
          </div>
        )}

        {stage === 'applied' && (
          <>
            <div className="sk-applied">
              <Icon name="circle-check" size={18} color="var(--success)" />
              <span>已落实迭代，技能升级为 <b>{appliedVer}</b> 并设为当前版本。本次修改已写入版本历史与进化日志（来源 · 人为干预）。</span>
            </div>
            <div className="sk-it-foot" style={{ marginTop: 12 }}>
              <span className="sk-it-foot-hint">需要继续调整？可再次发起。</span>
              <Button variant="secondary" size="sm" icon="plus" onClick={reset}>再发起一次迭代</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   版本内容查看（抽屉）
   ------------------------------------------------------------
   VersionSnapshot：只读查看某个历史版本的信息、核心变更与进化来源。 */
function VersionSnapshot({ skill, version, curVer, evolution, onClose }) {
  React.useEffect(() => { refreshIcons(); });
  if (!version) return null;
  const isCur = version.ver === curVer;
  const src = SK_SRC[version.source] || SK_SRC.human;
  const evo = evolution.find(e => e.ver === version.ver);
  return (
    <Drawer open={!!version} onClose={onClose} width={480}
      title={`${skill.name} · ${version.ver}`} sub={isCur ? '当前使用版本' : '历史版本 · 只读'}
      icon={{ name: 'file-clock', color: 'var(--ai)' }}>
      <div className="sk-snap-block">
        <div className="sk-snap-label"><Icon name="info" size={13} color="var(--blue-primary)" />版本信息</div>
        <DocMeta items={[
          { k: '版本号', v: <span className="mono">{version.ver}</span> },
          { k: '生成时间', v: <span className="mono">{version.date}</span> },
          { k: '来源', v: <span className={`sk-ver-src ${src.cls}`} style={{ marginLeft: 0 }}><Icon name={src.icon} size={11} />{src.label}</span> },
          { k: '操作者', v: version.author || (version.source === 'auto' ? 'AI 自主' : '系统') },
          { k: '当前状态', v: isCur ? <b style={{ color: 'var(--blue-primary)' }}>使用中</b> : '已归档' },
        ]} />
      </div>
      <div className="sk-snap-block">
        <div className="sk-snap-label"><Icon name="git-commit-horizontal" size={13} color="var(--blue-primary)" />本版核心变更</div>
        <div className="sk-intro" style={{ fontSize: 13 }}>{version.summary}</div>
      </div>
      {evo && (
        <div className="sk-snap-block">
          <div className="sk-snap-label"><Icon name="route" size={13} color="var(--blue-primary)" />进化来源</div>
          <div className={`sk-evo-reason${evo.type === 'auto' ? ' decision' : ''}`}>
            {evo.decision && <><span className="lab">AI 决策背景</span>{evo.decision}</>}
            {evo.decision && evo.reason && <div style={{ height: 8 }} />}
            {evo.reason && <><span className="lab">{evo.type === 'auto' ? '触发原因' : '调整原因'}</span>{evo.reason}</>}
          </div>
        </div>
      )}
    </Drawer>
  );
}

/* ============================================================
   技能详情主页面
   ------------------------------------------------------------
   SkillDetail：状态 versions 版本列表 / evolution 进化日志 / curVer 当前版 / snapVer 查看版 / rollbackVer 回滚确认。
   applyIteration：落实一次迭代 → 插入新版本 + 进化日志并设为当前版（一改一版）。
   doRollback：回滚到某版 — 只改「当前版」指针，后续版本不作废、保留为历史（非破坏性）。 */
function SkillDetail({ staff, skill, onBackList, onBackEmployee, onToast }) {
  const [versions, setVersions] = React.useState(() => skill.versions.map(v => ({ ...v })));
  const [evolution, setEvolution] = React.useState(() => skill.evolution.map(e => ({ ...e })));
  const [curVer, setCurVer] = React.useState(skill.curVer);
  const [snapVer, setSnapVer] = React.useState(null);
  const [rollbackVer, setRollbackVer] = React.useState(null);
  React.useEffect(() => { refreshIcons(); });

  const nextVer = bumpVer(curVer);

  const applyIteration = (plan) => {
    const ver = nextVer;
    const date = '2026-06-03';
    setVersions(vs => [{ ver, date, source: 'human', author: '你（管理层）', summary: `据自然语言迭代：${plan.userText}` }, ...vs]);
    setEvolution(es => [{ ver, type: 'human', when: '06-03 今天', who: '你（管理层）', act: '人为干预 · 自然语言迭代', reason: `管理层在技能详情页指出逻辑与公司理解不一致，直接输入调整建议：「${plan.userText}」。AI 预演方案经确认后落实。` }, ...es]);
    setCurVer(ver);
    onToast(`已落实迭代 · ${skill.name} 升级为 ${ver}`);
  };

  const doRollback = (v) => {
    setCurVer(v.ver);
    setEvolution(es => [{ ver: v.ver, type: 'rollback', when: '06-03 今天', who: '你（管理层）', act: `回滚 · 当前版本恢复为 ${v.ver}`, reason: `管理层手动回滚到 ${v.ver}。后续版本保留为历史记录，未作废，可随时再次切换。` }, ...es]);
    setRollbackVer(null);
    onToast(`已回滚 · 当前版本恢复为 ${v.ver}（后续版本保留）`);
  };

  const fs = FLOW_STAGES.find(f => f.id === staff.stage);

  return (
    <div className="content-inner page-fade">
      <SkCrumb items={[
        { label: 'AI 员工', onClick: onBackList },
        { label: staff.name, onClick: onBackEmployee },
        { label: skill.name },
      ]} />

      {/* 头部 */}
      <div className="sk-d-head">
        <span className="sk-d-ico"><Icon name="puzzle" size={24} color="var(--blue-primary)" /></span>
        <div className="sk-d-main">
          <div className="sk-d-namerow">
            <span className="sk-d-name">{skill.name}</span>
            <span className="sk-d-curver">当前 {curVer}</span>
            {skillDots(skill.weight)}
          </div>
          <div className="sk-d-sub">
            <span className="sk-d-belong"><Icon name={staff.icon} size={13} color="var(--blue-primary)" />{staff.name}</span>
            <span className="sk-prof-dot" />
            <span>{fs.k} 环节</span>
            <span className="sk-prof-dot" />
            <span className="mono">{skill.id}</span>
          </div>
          <div className="sk-d-metrics">
            <div className="sk-d-metric"><div className="v">{skill.calls30}</div><div className="k">近 30 日调用</div></div>
            <div className="sk-d-metric"><div className="v" style={{ color: 'var(--success)' }}>{skill.success}%</div><div className="k">成功率</div></div>
            <div className="sk-d-metric"><div className="v mono">{skill.latency}</div><div className="k">平均时延</div></div>
            <div className="sk-d-metric"><div className="v">{versions.length}</div><div className="k">历史版本</div></div>
          </div>
        </div>
      </div>

      <div className="sk-detail">
        {/* 左主栏 */}
        <div className="sk-main">
          {/* 功能介绍 */}
          <div className="sk-panel">
            <div className="sk-panel-head"><Icon name="text-cursor-input" size={15} color="var(--blue-primary)" /><span className="sk-panel-t">功能介绍</span></div>
            <div className="sk-panel-body"><p className="sk-intro">{skill.intro}</p></div>
          </div>

          {/* 调用契约 */}
          <div className="sk-panel">
            <div className="sk-panel-head"><Icon name="terminal" size={15} color="var(--blue-primary)" /><span className="sk-panel-t">调用契约</span><span className="sk-panel-s">像 Skill 一样被调用 · 输入 → 输出</span></div>
            <div className="sk-panel-body">
              <div className="sk-contract">
                <div className="sk-contract-row">
                  <div className="sk-contract-k"><Icon name="zap" size={12} color="var(--warning)" />触发条件</div>
                  <div className="sk-contract-trig">{skill.contract.trigger}</div>
                </div>
                <div className="sk-contract-row">
                  <div className="sk-contract-k"><Icon name="log-in" size={12} color="var(--blue-primary)" />输入</div>
                  <div className="sk-io">
                    {skill.contract.input.map((io, i) => (
                      <div className="sk-io-item" key={i}><Icon name="dot" size={14} color="var(--text-400)" /><span><span className="mono">{io.k}</span> — {io.v}</span></div>
                    ))}
                  </div>
                </div>
                <div className="sk-contract-row">
                  <div className="sk-contract-k"><Icon name="log-out" size={12} color="var(--success)" />输出</div>
                  <div className="sk-io">
                    {skill.contract.output.map((io, i) => (
                      <div className="sk-io-item" key={i}><Icon name="dot" size={14} color="var(--text-400)" /><span><span className="mono">{io.k}</span> — {io.v}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 内部逻辑与构成 */}
          <div className="sk-panel">
            <div className="sk-panel-head"><Icon name="workflow" size={15} color="var(--blue-primary)" /><span className="sk-panel-t">内部逻辑与构成</span><span className="sk-panel-s">调用后按预设逻辑产出</span></div>
            <div className="sk-panel-body">
              <DocChain items={skill.logic.map(l => ({ act: l.act, actor: l.actor, ai: l.actor === 'AI', desc: l.desc }))} />
            </div>
          </div>

          {/* 底层 Prompt */}
          <div className="sk-panel">
            <div className="sk-panel-head"><Icon name="braces" size={15} color="var(--blue-primary)" /><span className="sk-panel-t">底层 Prompt</span><span className="sk-panel-s">该技能背后的提示词与逻辑</span></div>
            <div className="sk-panel-body">
              <div className="sk-prompt">
                <div className="sk-prompt-block">
                  <span className="sk-prompt-k"># 角色</span>
                  {skill.prompt.role}
                </div>
                <div className="sk-prompt-block">
                  <span className="sk-prompt-k"># 原则</span>
                  {skill.prompt.principles.map((p, i) => <div className="sk-prompt-li" key={i}><span>{p}</span></div>)}
                </div>
                <div className="sk-prompt-block">
                  <span className="sk-prompt-k"># 处理流程</span>
                  {skill.prompt.steps.map((s, i) => <div className="sk-prompt-li" key={i}><span>{s}</span></div>)}
                </div>
                <div className="sk-prompt-block">
                  <span className="sk-prompt-k"># 产出结构</span>
                  <span className="sk-prompt-em">{skill.prompt.output}</span>
                </div>
                <div className="sk-prompt-block">
                  <span className="sk-prompt-k"># 护栏</span>
                  {skill.prompt.guardrails.map((g, i) => <div className="sk-prompt-li" key={i}><span>{g}</span></div>)}
                </div>
              </div>
              <div className="sk-prompt-note"><Icon name="lock" size={12} color="var(--text-400)" />提示词为只读展示。如需调整逻辑，请在下方用自然语言发起迭代。</div>
            </div>
          </div>

          {/* 自然语言迭代 */}
          <SkillIterationPanel skill={skill} nextVer={nextVer} onApply={applyIteration} />
        </div>

        {/* 右侧栏 */}
        <div className="sk-side">
          {/* 版本历史 */}
          <div className="sk-panel">
            <div className="sk-panel-head"><Icon name="git-branch" size={15} color="var(--blue-primary)" /><span className="sk-panel-t">版本历史</span><span className="sk-panel-s">一改一版本 · {versions.length} 版</span></div>
            <div className="sk-ver">
              {versions.map((v, i) => {
                const isCur = v.ver === curVer;
                const src = SK_SRC[v.source] || SK_SRC.human;
                return (
                  <div className={`sk-ver-row${isCur ? ' is-cur' : ''}`} key={v.ver + i}>
                    <div className="sk-ver-rail">
                      <span className={`sk-ver-node ${src.cls}`} />
                      {i < versions.length - 1 && <span className="sk-ver-line" />}
                    </div>
                    <div className="sk-ver-main">
                      <div className="sk-ver-toprow">
                        <span className="sk-ver-ver">{v.ver}</span>
                        {isCur && <span className="sk-ver-cur-pill">当前</span>}
                        <span className={`sk-ver-src ${src.cls}`}><Icon name={src.icon} size={11} />{src.label}</span>
                      </div>
                      <div className="sk-ver-sum">{v.summary}</div>
                      <div className="sk-ver-meta">{v.date}{v.author ? ' · ' + v.author : v.source === 'auto' ? ' · AI 自主' : ''}</div>
                      <div className="sk-ver-acts">
                        <button className="sk-ver-btn" onClick={() => setSnapVer(v)}><Icon name="eye" size={13} color="var(--text-500)" />查看内容</button>
                        <button className="sk-ver-btn danger" disabled={isCur} onClick={() => setRollbackVer(v.ver)}><Icon name="rotate-ccw" size={13} color="var(--text-500)" />回滚到此版</button>
                      </div>
                      {rollbackVer === v.ver && (
                        <div className="sk-rollback-confirm">
                          <div className="q">回滚后，当前使用版本将恢复为 <b className="mono">{v.ver}</b>；{curVer} 等后续版本不会作废，保留为历史记录、可随时再切回。确认回滚？</div>
                          <div className="acts">
                            <Button variant="primary" size="sm" icon="rotate-ccw" onClick={() => doRollback(v)}>确认回滚</Button>
                            <Button variant="secondary" size="sm" onClick={() => setRollbackVer(null)}>取消</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 进化日志 */}
          <div className="sk-panel">
            <div className="sk-panel-head"><Icon name="route" size={15} color="var(--ai)" /><span className="sk-panel-t">进化日志</span><span className="sk-panel-s">Evolution Log</span></div>
            <div className="sk-panel-body tight" style={{ paddingTop: 16, paddingBottom: 16 }}>
              <div className="sk-evo">
                {evolution.map((e, i) => {
                  const src = SK_SRC[e.type] || SK_SRC.human;
                  return (
                    <div className="sk-evo-item" key={i}>
                      <span className={`sk-evo-ico ${src.cls}`}><Icon name={src.icon} size={14} color={e.type === 'auto' ? 'var(--ai)' : e.type === 'rollback' ? 'var(--text-500)' : 'var(--blue-primary)'} /></span>
                      <div className="sk-evo-main">
                        <div className="sk-evo-top">
                          <span className="sk-evo-ver">{e.ver}</span>
                          <span className={`sk-evo-type ${src.cls}`}>{src.label}</span>
                          <span className="sk-evo-when">{e.when}</span>
                        </div>
                        <div className="sk-evo-act">{e.act}</div>
                        {e.who && <div className="sk-evo-who"><Icon name="user" size={11} color="var(--text-400)" />{e.who}</div>}
                        {e.decision && (
                          <div className="sk-evo-reason decision"><span className="lab">AI 决策背景</span>{e.decision}</div>
                        )}
                        {e.reason && (
                          <div className="sk-evo-reason"><span className="lab">{e.type === 'auto' ? '触发原因' : e.type === 'rollback' ? '回滚说明' : '调整原因'}</span>{e.reason}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <VersionSnapshot skill={skill} version={snapVer} curVer={curVer} evolution={evolution} onClose={() => setSnapVer(null)} />
    </div>
  );
}

Object.assign(window, { SkillDetail, SkillIterationPanel, VersionSnapshot, bumpVer });
