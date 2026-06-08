/* ============================================================
   项目总览看板 · 组件（pages_home_board.jsx）
   ------------------------------------------------------------
   作用：首页总览看板的主体 UI。顶部统计带 + 项目集「思维导图」（母→子→二级子，
         递归渲染，含目标承接关系）。点节点进入该项目专属工作区。
   依赖：components.jsx + pages_home_board_data.jsx（OB_* 数据与派生工具）。
   ============================================================ */

// 健康态 / 进度 → 颜色的本页取色工具。
const obHealthColor = (h) => h === '健康' ? 'var(--success)' : h === '关注' ? 'var(--warning)' : 'var(--danger)';
const obProgColor = (p) => p >= 80 ? 'var(--success)' : p >= 45 ? 'var(--blue-primary)' : 'var(--warning)';

/* ---------- 顶部统计带 ObStats ----------
   作用：三块概览 — 项目总数（含母/子比）、简化状态分布（三桶）、AI 执行占比。
   数据：s 由 obStats(项目列表) 生成（见 board_data）。 */
function ObStats({ s }) {
  return (
    <div className="ob-stats">
      <div className="ob-stat">
        <div className="ob-stat-head">
          <span className="ob-stat-ico" style={{ background: 'var(--blue-tint)' }}><Icon name="box" size={16} color="var(--blue-primary)" /></span>
          在运行项目总数
        </div>
        <div className="ob-stat-main">
          <span className="ob-stat-num"><CountUp value={s.total} /></span>
          <span className="ob-stat-unit">个项目</span>
          {s.kapian > 0 && <span className="ob-stat-flag"><Icon name="alert-triangle" size={12} color="var(--danger)" />{s.kapian} 卡点</span>}
        </div>
        <div className="ob-stat-foot">
          <div className="ob-mini-bar">
            <i style={{ width: (s.parents / s.total * 100) + '%', background: 'var(--text-700)' }} />
            <i style={{ width: (s.children / s.total * 100) + '%', background: 'var(--border-300)' }} />
          </div>
          <div className="ob-stat-legend">
            <span><span className="ob-rel-dot" style={{ background: 'var(--text-700)' }} />母项目 <b>{s.parents}</b></span>
            <span><span className="ob-rel-dot" style={{ background: 'var(--border-300)' }} />子项目 <b>{s.children}</b></span>
          </div>
        </div>
      </div>

      {/* 简化状态分布（三类，取代原先 6 个阶段标签） */}
      <div className="ob-stat">
        <div className="ob-stat-head">
          <span className="ob-stat-ico" style={{ background: 'var(--success-bg)' }}><Icon name="activity" size={16} color="var(--success)" /></span>
          状态分布
        </div>
        <div className="ob-stat-buckets">
          {OB_BUCKETS.map(b => (
            <div className="ob-bk" key={b.k}>
              <span className="ob-bk-ico" style={{ background: b.bg }}><Icon name={b.icon} size={14} color={b.c} /></span>
              <div className="ob-bk-main">
                <span className="ob-bk-n" style={{ color: b.c }}>{s.byBucket[b.k].length}</span>
                <span className="ob-bk-lbl">{b.label}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="ob-stat-foot">
          <div className="ob-mini-bar">
            {OB_BUCKETS.map(b => <i key={b.k} style={{ width: (s.byBucket[b.k].length / s.total * 100) + '%', background: b.c }} />)}
          </div>
        </div>
      </div>

      {/* AI 执行占比（重点） */}
      <div className="ob-ai">
        <div className="ob-ai-ring">
          <Ring value={s.aiPct} size={84} stroke={9} color="var(--ai)" track="var(--ai-soft)" showVal={false} />
          <div className="ob-ai-ring-cap">
            <span className="ob-ai-ring-pct">{s.aiPct}%</span>
            <span className="ob-ai-ring-lbl">AI 自治</span>
          </div>
        </div>
        <div className="ob-ai-body">
          <div className="ob-ai-title"><Icon name="bot" size={15} color="var(--ai)" />AI 与人工执行占比</div>
          <span className="ob-live"><span className="ob-ai-live-dot" />实时</span>
          <div className="ob-ai-bar">
            <span className="ob-ai-bar-seg" style={{ width: s.aiPct + '%', background: 'var(--ai)' }} />
            <span className="ob-ai-bar-seg" style={{ width: (100 - s.aiPct) + '%', background: 'var(--text-400)' }} />
          </div>
          <div className="ob-ai-legend">
            <div className="ob-ai-leg">
              <span className="ob-ai-leg-dot" style={{ background: 'var(--ai)' }} />
              <span className="ob-ai-leg-k">AI 自治执行</span>
              <span className="ob-ai-leg-v">{s.ai}<small>个</small></span>
            </div>
            <div className="ob-ai-leg">
              <span className="ob-ai-leg-dot" style={{ background: 'var(--text-400)' }} />
              <span className="ob-ai-leg-k">人工负责</span>
              <span className="ob-ai-leg-v">{s.human}<small>个</small></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 思维导图：项目节点（递归） ----------
   作用：画一个项目卡，并递归渲染其子项目（OB_CHILDREN(p.id)）。
     卡上显示：层级标签/ID/卡点、名称与健康点、承接的上级目标、状态桶/负责模式/进度。
   交互：点卡调 onOpen(p)（看板主体里 = 进入该项目专属工作区）。 */
function MMNode({ p, onOpen }) {
  const pf = OB_PF_MAP[p.pf];
  const mode = OB_MODE[p.mode];
  const bucket = OB_BUCKET_MAP[OB_BUCKET_OF(p.stage)];
  const gk = OB_GOAL_KIND[p.gk];
  const kids = OB_CHILDREN(p.id);
  const kindLabel = OB_KIND_LABEL(p);

  return (
    <div className="obm-node">
      <button className="obm-card" data-mode={p.mode} onClick={() => onOpen(p)}>
        <span className="obm-card-rail" style={{ background: pf.c }} />
        <div className="obm-card-head">
          <span className="obm-kind">{kindLabel}</span>
          <span className="obm-id mono">{p.id}</span>
          {p.kapian > 0 && <span className="obm-kapian"><Icon name="alert-triangle" size={10} color="var(--danger)" />{p.kapian}</span>}
        </div>
        <div className="obm-card-title">
          <span className="obm-health" style={{ background: obHealthColor(p.health) }} />
          {p.name}
        </div>
        <div className="obm-goal">
          <Icon name="corner-down-right" size={12} color="var(--text-400)" />
          <span className="obm-goal-kind" style={{ color: gk.c, background: 'color-mix(in oklch, ' + gk.c + ' 12%, white)' }}>{gk.label}</span>
          <span className="obm-goal-txt">{p.gt}</span>
        </div>
        <div className="obm-card-foot">
          <span className="obm-bucket" style={{ color: bucket.c, background: bucket.bg }}>
            <Icon name={bucket.icon} size={11} color={bucket.c} className={bucket.spin ? 'spin' : ''} />{bucket.label}
          </span>
          <span className="obm-mode" data-m={p.mode} style={p.mode === 'human' ? { background: mode.bg, color: mode.c } : null}>
            <Icon name={mode.icon} size={11} color={mode.c} />{mode.label}
          </span>
          <span className="obm-prog" style={{ color: obProgColor(p.prog) }}>{p.prog}%</span>
        </div>
      </button>

      {kids.length > 0 && (
        <div className="obm-kids">
          {kids.map(k => (
            <div className="obm-subtree" key={k.id}><MMNode p={k} onOpen={onOpen} /></div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- 思维导图：以项目集为根 MindMap ----------
   作用：以项目集（pfId）为根节点，向下挂载各母项目子树。
   细节：挂载/切项目集/进入全屏时，用 useEffect 重算 scrollTop 把根卡垂直居中。
     onExpand 存在时显示「全屏查看」按钮；fullscreen 控制画布是否为全屏样式。 */
function MindMap({ pfId, onOpen, fullscreen, onExpand }) {
  const pf = OB_PF_MAP[pfId];
  const parents = OB_PARENTS_OF(pfId);
  const st = obPfStats(pfId);
  const wrapRef = React.useRef(null);

  React.useEffect(() => {
    const w = wrapRef.current; if (!w) return;
    const rc = w.querySelector('.obm-root-card'); if (!rc) return;
    const wb = w.getBoundingClientRect(), cb = rc.getBoundingClientRect();
    w.scrollTop += (cb.top - wb.top) - (w.clientHeight - cb.height) / 2;
    w.scrollLeft = 0;
  }, [pfId, fullscreen]);

  return (
    <div className="obm-canvas">
      {onExpand && (
        <button className="obm-expand" onClick={onExpand} title="全屏查看">
          <Icon name="maximize" size={14} color="var(--text-700)" />全屏查看
        </button>
      )}
      <div className={`obm-wrap${fullscreen ? ' obm-wrap--fs' : ''}`} ref={wrapRef}>
        <div className="obm-node obm-root">
        <div className="obm-root-card" style={{ borderColor: pf.c, background: 'color-mix(in oklch, ' + pf.c + ' 7%, white)' }}>
          <div className="obm-root-top">
            <span className="obm-root-badge" style={{ background: pf.c }}><Icon name="folder-tree" size={17} color="#fff" /></span>
            <div className="obm-root-titles">
              <div className="obm-root-kind">项目集</div>
              <div className="obm-root-name">{pf.name}</div>
            </div>
          </div>
          <div className="obm-root-north" style={{ color: pf.c }}>
            <Icon name="compass" size={13} color={pf.c} />北极星 · {pf.north}
          </div>
          <div className="obm-root-meta">
            <span><Icon name="user-round" size={12} color="var(--text-400)" />{pf.owner}</span>
            <span><Icon name="layers" size={12} color="var(--text-400)" />{st.parents} 母 / {st.children} 子</span>
            <span><Icon name="bot" size={12} color="var(--ai)" />AI {st.aiPct}%</span>
          </div>
        </div>

        <div className="obm-kids">
          {parents.map(p => (
            <div className="obm-subtree" key={p.id}><MMNode p={p} onOpen={onOpen} /></div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

/* ---------- 项目集下拉选择器（复用） ---------- */
function ObmPfSelect({ pfId, setPfId }) {
  const pf = OB_PF_MAP[pfId];
  return (
    <label className="obm-pf-select-wrap">
      <span className="obm-pf-select-lab">项目集</span>
      <span className="obm-pf-dot" style={{ background: pf.c }} />
      <select className="obm-pf-select" value={pfId} onChange={e => setPfId(e.target.value)}>
        {OB_PORTFOLIOS.map(p => {
          const n = OB_PROJECTS.filter(x => x.pf === p.id).length;
          return <option key={p.id} value={p.id}>{p.name} · {n} 个项目</option>;
        })}
      </select>
      <Icon name="chevron-down" size={15} color="var(--text-400)" />
    </label>
  );
}

/* ---------- 图例（复用） ---------- */
function ObmLegend() {
  return (
    <div className="obm-legend">
      {OB_BUCKETS.map(b => (
        <span className="obm-legend-item" key={b.k}><Icon name={b.icon} size={12} color={b.c} className={b.spin ? 'spin' : ''} />{b.label}</span>
      ))}
      <span className="obm-legend-sep" />
      <span className="obm-legend-item"><Icon name="corner-down-right" size={12} color="var(--text-400)" />承接上级目标</span>
    </div>
  );
}

/* ---------- 看板主体 OverviewBoard ----------
   作用：组装统计带 + 工具栏（项目集选择 + 图例）+ 思维导图，并提供全屏查看。
   状态：pfId 当前项目集；fs 是否全屏（Esc 关闭，用 createPortal 渲到 body）。
   交互：openProject 把节点映射为 {name, pid} 调 onEnterProject 进项目。 */
function OverviewBoard({ onNavigate, onEnterProject }) {
  const [pfId, setPfId] = React.useState(OB_PORTFOLIOS[0].id);
  const [fs, setFs] = React.useState(false);
  const fullStats = React.useMemo(() => obStats(OB_PROJECTS), []);
  const openProject = (p) => onEnterProject && onEnterProject({ name: p.name, pid: p.id });

  React.useEffect(() => {
    if (!fs) return;
    const onKey = (e) => { if (e.key === 'Escape') setFs(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fs]);

  return (
    <>
      <ObStats s={fullStats} />

      <div className="obm-toolbar">
        <ObmPfSelect pfId={pfId} setPfId={setPfId} />
        <ObmLegend />
      </div>

      <MindMap pfId={pfId} onOpen={openProject} onExpand={() => setFs(true)} />

      {fs && ReactDOM.createPortal((
        <div className="obm-fs" role="dialog" aria-modal="true">
          <div className="obm-fs-head">
            <div className="obm-fs-title"><Icon name="folder-tree" size={18} color="var(--blue-primary)" />项目集思维导图</div>
            <ObmPfSelect pfId={pfId} setPfId={setPfId} />
            <ObmLegend />
            <button className="obm-fs-close" onClick={() => setFs(false)} aria-label="关闭全屏" title="关闭（Esc）">
              <Icon name="x" size={18} color="var(--text-700)" />
            </button>
          </div>
          <MindMap pfId={pfId} onOpen={openProject} fullscreen />
        </div>
      ), document.body)}
    </>
  );
}

Object.assign(window, { OverviewBoard, ObStats, MindMap, MMNode, ObmPfSelect, ObmLegend, obHealthColor, obProgColor });
