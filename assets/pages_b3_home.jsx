/* ============================================================
   页面 3.1 · 项目主页（重构）
   —— 模块逐区陈列的无限滚动画布 + 实时目标数看板
   —— 顶部：版本切换 / 历史数据；任一目标可弹出「上层继承 + 下层拆解」详情
   ============================================================ */

/* 项目元数据（以 SAMPLE_PROJECT 为主，按 ID 兜底；多页共用，须保留导出） */
const PROJECT_META = {
  name: '智能履约调度中台', pid: 'PRJ-2026-0137',
  health: '健康', mode: 'AI 自治', owner: '何沛', stage: '执行 · v2.3', version: 'v2.3',
  progress: 82, cost: 318400, started: '2026-03-12', goals: 14, tasks: 38, kapian: 1, aiStaff: 5
};
const HEALTH_TONE = { 健康: 'success', 关注: 'warning', 卡点: 'danger' };

/* ---------- 目标树 → 实时看板（按层归集，up=父 / down=子） ---------- */
function buildBoard() {
  const byLevel = { ideal: [], mid: [], phase: [], week: [], task: [] };
  const parent = {};
  (function walk(nodes, par) {
    nodes.forEach((n) => {
      parent[n.id] = par;
      if (byLevel[n.level]) byLevel[n.level].push(n);
      if (n.children) walk(n.children, n);
    });
  })(window.GOAL_TREE || [], null);
  return { byLevel, parent };
}
const BOARD_LANES = [
{ level: 'ideal', label: '理想化状态', icon: 'target', c: 'var(--blue-primary)' },
{ level: 'mid', label: '中短期目标', icon: 'flag', c: 'var(--blue-primary)' },
{ level: 'phase', label: '阶段结项目标', icon: 'milestone', c: 'var(--info)' },
{ level: 'week', label: '周计划', icon: 'calendar-range', c: 'var(--ai)' },
{ level: 'task', label: '执行事务', icon: 'square-check-big', c: 'var(--success)' }];


/* ---------- 滚动到模块 ---------- */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const c = el.closest('.content');
  if (c) c.scrollTo({ top: el.offsetTop - 70, behavior: 'smooth' });
}
const LEVEL_SECTION = { ideal: 'sec-ideal', mid: 'sec-mid', phase: 'sec-phase', week: 'sec-week', task: 'sec-week' };

/* ============================================================
   实时目标数看板
   ============================================================ */
function GoalBoard({ onOpen, onNavigate }) {
  const { byLevel, parent } = React.useMemo(buildBoard, []);
  const NS = window.NODE_STATUS;
  const openNode = (n) => {
    const par = parent[n.id];
    onOpen({
      level: n.level, title: n.title, def: n.def, prog: n.progress,
      statusPill: NS[n.status],
      meta: [{ k: 'AI 员工', v: n.ai }],
      kapian: n.kapian ? n.kapian.reason : null,
      up: par ? { level: par.level, id: par.id, title: window.NODE_LEVEL[par.level].label + '：' + par.title } : null,
      down: (n.children || []).map((c) => ({ level: c.level, id: c.id, title: c.title }))
    });
  };
  return (
    <section className="hm-board" id="sec-board">
      <div className="hm-board-head">
        <div className="hm-board-tt">
          <span className="hm-live"><span className="hm-live-dot" />实时</span>
          <span className="hm-board-title">当前执行看板</span>
        </div>
        <button className="hm-board-link" onClick={() => onNavigate && onNavigate('p-tree')}>进入完整目标树<Icon name="arrow-up-right" size={14} color="var(--blue-primary)" /></button>
      </div>
      <div className="hm-lanes">
        {BOARD_LANES.map((lane, li) => {
          const items = byLevel[lane.level] || [];
          return (
            <div className="hm-lane" key={lane.level}>
              <div className="hm-lane-head" style={{ '--lane-c': lane.c }}>
                <Icon name={lane.icon} size={15} color={lane.c} />
                <span className="hm-lane-label">{lane.label}</span>
                <span className="hm-lane-n mono">{items.length}</span>
              </div>
              <div className="hm-lane-body">
                {items.map((n) => {
                  const st = NS[n.status];
                  return (
                    <button key={n.id} className="hm-chip" data-kapian={n.status === 'kapian'} onClick={() => openNode(n)}>
                      <span className="hm-chip-top">
                        <span className="hm-chip-status" style={{ background: st.bg, color: st.c }}><Icon name={st.icon} size={10} color={st.c} className={st.spin ? 'spin' : ''} />{st.label}</span>
                        <span className="hm-chip-prog mono" style={{ color: window.PROG_COLOR(n.status) }}>{n.progress}%</span>
                      </span>
                      <span className="hm-chip-title">{n.title}</span>
                      <span className="hm-chip-ai"><span className="hm-chip-ava">{n.ai[0]}</span>{n.ai}</span>
                    </button>);

                })}
              </div>
              {li < BOARD_LANES.length - 1 && <span className="hm-lane-arrow"><Icon name="chevron-right" size={16} color="var(--border-300)" /></span>}
            </div>);

        })}
      </div>
    </section>);

}

/* ============================================================
   统一详情抽屉 · 上层继承 + 下层拆解
   ============================================================ */
function GoalDetail({ detail, onClose, onJump }) {
  if (!detail) return null;
  const lvl = HOME_LEVEL[detail.level] || HOME_LEVEL.mid;
  const sp = detail.statusPill || detail.status && HOME_STATUS[detail.status] || null;
  const LevelTag = ({ level, label }) => {
    const l = HOME_LEVEL[level] || HOME_LEVEL.mid;
    return <span className="gd-lvtag" style={{ color: l.c }}><Icon name={l.icon} size={11} color={l.c} />{label || l.label}</span>;
  };
  const jump = (level) => {onClose();setTimeout(() => scrollToSection(LEVEL_SECTION[level] || 'sec-ideal'), 80);};
  return (
    <Drawer open={!!detail} onClose={onClose} width={520}
    icon={{ name: lvl.icon, color: lvl.c }} title={lvl.label}
    sub="点击上层 / 下层目标可定位到对应模块">
      <div className="gd-title">{detail.title}</div>
      <div className="gd-pills">
        {sp && <span className="hm-statuspill" style={{ background: sp.bg, color: sp.c }}><Icon name={sp.icon} size={11} color={sp.c} className={sp.spin ? 'spin' : ''} />{sp.label}</span>}
        {detail.imp != null && <ImpBadge v={detail.imp} />}
        {detail.prog != null && <span className="gd-progpill mono" style={{ color: progColor(detail.prog) }}>推进度 {detail.prog}%</span>}
      </div>

      {detail.meta &&
      <div className="gd-meta">
          {detail.meta.map((m, i) =>
        <div className="gd-meta-item" key={i}><span className="gd-meta-k">{m.k}</span><span className={`gd-meta-v${m.mono ? ' mono' : ''}`}>{m.v}</span></div>
        )}
        </div>
      }

      {detail.kapian &&
      <div className="gd-kapian"><Icon name="alert-triangle" size={15} color="var(--warning)" /><div><div className="gd-kapian-h">卡点</div><div className="gd-kapian-b">{detail.kapian}</div></div></div>
      }

      {detail.prog != null &&
      <div className="gd-sec">
          <div className="hm-sub-label">推进度</div>
          <div className="gd-progrow"><span className="gd-progbar"><span style={{ width: detail.prog + '%', background: progColor(detail.prog) }} /></span><span className="mono" style={{ fontWeight: 600 }}>{detail.prog}%</span></div>
        </div>
      }

      <div className="gd-sec">
        <div className="hm-sub-label">{detail.level === 'week' ? '执行步骤' : '定义 / 内容'}</div>
        <div className="gd-def">{detail.def}</div>
        {detail.note && <div className="gd-note"><Icon name="info" size={13} color="var(--text-400)" />{detail.note}</div>}
      </div>

      {/* 上层继承 */}
      {detail.up &&
      <div className="gd-sec">
          <div className="hm-sub-label"><Icon name="corner-left-up" size={12} color="var(--text-400)" style={{ marginRight: 4 }} />继承于上层目标</div>
          <button className="gd-rel up" onClick={() => jump(detail.up.level)}>
            <LevelTag level={detail.up.level} />
            <span className="gd-rel-t">{detail.up.title}</span>
            <Icon name="arrow-right" size={14} color="var(--text-400)" />
          </button>
        </div>
      }

      {/* 下层拆解 */}
      {detail.down && detail.down.length > 0 &&
      <div className="gd-sec">
          <div className="hm-sub-label"><Icon name="git-fork" size={12} color="var(--text-400)" style={{ marginRight: 4 }} />向下拆解（{detail.down.length}）</div>
          <div className="gd-downs">
            {detail.down.map((d, i) =>
          <button className="gd-rel" key={i} onClick={() => jump(d.level)}>
                <LevelTag level={d.level} />
                <span className="gd-rel-t">{d.title}</span>
                <Icon name="arrow-right" size={14} color="var(--text-400)" />
              </button>
          )}
          </div>
        </div>
      }

      {/* 周计划 → 拆解事务 + 绑定关联 */}
      {detail.tasks &&
      <div className="gd-sec">
          <div className="hm-sub-label"><Icon name="square-check-big" size={12} color="var(--success)" style={{ marginRight: 4 }} />拆解事务 · 绑定关联（{detail.tasks.length}）</div>
          <div className="gd-tasks">
            {detail.tasks.map((t) => {
            const st = HOME_STATUS[t.status];
            return (
              <div className="gd-task" key={t.id}>
                  <span className="gd-task-status" style={{ background: st.bg, color: st.c }}><Icon name={st.icon} size={10} color={st.c} className={st.spin ? 'spin' : ''} /></span>
                  <span className="gd-task-main">
                    <span className="gd-task-title">{t.title}</span>
                    <span className="gd-task-sub"><span className="hm-chip-ava sm">{t.ai[0]}</span>{t.ai}<span className="mono" style={{ color: progColor(t.prog) }}>· {t.prog}%</span></span>
                  </span>
                  <span className={`gd-bind${t.bound ? ' on' : ''}`}><Icon name={t.bound ? 'link' : 'link-2-off'} size={12} color={t.bound ? 'var(--success)' : 'var(--text-400)'} />{t.bound ? '已绑定' : '待绑定'}</span>
                </div>);

          })}
          </div>
        </div>
      }
    </Drawer>);

}

/* ============================================================
   主组件 · ProjectHome
   ============================================================ */
function ProjectHome({ project, onNavigate }) {
  const [loading, setLoading] = React.useState(true);
  const ver = (project && project.version) || PROJECT_META.version;
  const [detail, setDetail] = React.useState(null);
  const [activeSec, setActiveSec] = React.useState('sec-board');
  const [toast, setToast] = React.useState(null);
  // 季度 → 月 → 周 的嵌套版本（动态联动）
  const [quarter, setQuarter] = React.useState('1.0');
  const [month, setMonth] = React.useState('1.2');
  const [week, setWeek] = React.useState('2026年06月第1周');
  const changeQuarter = (q) => { setQuarter(q); const ms = MONTHS_OF(q); const m0 = (ms[0] || {}).id; setMonth(m0); setWeek((WEEKS_OF(m0) || [])[0] || ''); };
  const changeMonth = (m) => { setMonth(m); setWeek((WEEKS_OF(m) || [])[0] || ''); };
  const p = { ...PROJECT_META, ...(project || {}) };

  React.useEffect(() => {const t = setTimeout(() => setLoading(false), 800);return () => clearTimeout(t);}, []);
  React.useEffect(() => {refreshIcons();});

  // 滚动监听：高亮当前模块
  React.useEffect(() => {
    const c = document.querySelector('.content');
    if (!c) return;
    const ids = ['sec-board', 'sec-ideal', 'sec-users', 'sec-value', 'sec-mid', 'sec-phase', 'sec-week'];
    const onScroll = () => {
      let cur = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop - 80 <= c.scrollTop) cur = id;
      }
      setActiveSec(cur);
    };
    c.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => c.removeEventListener('scroll', onScroll);
  }, [loading]);

  const NAV = [
  { id: 'sec-ideal', label: '理想化状态', icon: 'target' },
  { id: 'sec-users', label: '目标用户', icon: 'users' },
  { id: 'sec-value', label: '核心价值', icon: 'gem' },
  { id: 'sec-mid', label: '中短期目标', icon: 'flag' },
  { id: 'sec-phase', label: '阶段结项目标', icon: 'milestone' },
  { id: 'sec-week', label: '周计划', icon: 'calendar-range' }];


  if (loading) return <ProjectHomeSkel project={p} />;

  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: p.name }, { label: '项目主页' }]} />

      {/* Hero */}
      <div className="ph-hero">
        <div className="ph-hero-top">
          <div className="ph-hero-id">
            <span className="ph-hero-mark"><Icon name="box" size={24} color="var(--blue-primary)" /></span>
            <div>
              <div className="ph-hero-name">{p.name}</div>
            </div>
          </div>
          <div className="ph-hero-actions">
            <FeedbackEntry onClick={() => setToast({ msg: '异步反馈入口已打开（演示）' })} />
            <Button variant="primary" icon="git-fork" onClick={() => onNavigate('p-tree')}>进入目标树</Button>
          </div>
        </div>
        <div className="ph-meta">
          <div className="ph-meta-item"><span className="ph-meta-k">负责模式</span><span className="ph-meta-v"><Icon name={p.mode === 'AI 自治' ? 'bot' : 'user-cog'} size={15} color={p.mode === 'AI 自治' ? 'var(--ai)' : 'var(--text-500)'} />{p.mode}</span></div>
          <div className="ph-meta-item"><span className="ph-meta-k">项目负责人</span><span className="ph-meta-v"><span className="pl-ava">{p.owner[0]}</span>{p.owner}</span></div>
          <div className="ph-meta-item"><span className="ph-meta-k">目标 / 事务数</span><span className="ph-meta-v mono">{p.goals} / {p.tasks}</span></div>
          <div className="ph-meta-item"><span className="ph-meta-k">累计算力成本</span><span className="ph-meta-v mono">¥{p.cost.toLocaleString('en-US')}</span></div>
          <div className="ph-progress-wrap">
            <Ring value={p.progress} size={58} stroke={6} color={p.progress >= 80 ? 'var(--success)' : 'var(--blue-primary)'} />
            <div><div className="ph-meta-k">整体推进度</div><div className="t-micro" style={{ color: 'var(--text-400)', marginTop: 4 }}>按已验收事务加权</div></div>
          </div>
        </div>
      </div>

      {/* 实时目标数看板 */}
      <GoalBoard onOpen={setDetail} onNavigate={onNavigate} />

      {/* 模块画布：模块全宽对齐看板；锚点导航为横向贴顶工具条 */}
      <div className="hm-canvas">
        <nav className="hm-rail">
          <div className="hm-rail-items">
            {NAV.map((n) =>
            <button key={n.id} className="hm-rail-item" data-on={activeSec === n.id} onClick={() => scrollToSection(n.id)}>
                <Icon name={n.icon} size={14} color={activeSec === n.id ? 'var(--blue-primary)' : 'var(--text-400)'} />
                <span>{n.label}</span>
              </button>
            )}
          </div>
        </nav>

        <div className="hm-modules">
          <IdealModule onOpen={setDetail} />
          <UsersModule />
          <ValueModule />
          <MidModule quarter={quarter} onChangeQuarter={changeQuarter} onOpen={setDetail} />
          <PhaseModule quarter={quarter} month={month} onChangeMonth={changeMonth} onOpen={setDetail} />
          <WeekModule month={month} week={week} onChangeWeek={setWeek} onOpen={setDetail} />
        </div>
      </div>

      <GoalDetail detail={detail} onClose={() => setDetail(null)} />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>);

}

function ProjectHomeSkel({ project }) {
  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: project.name }, { label: '项目主页' }]} />
      <Card style={{ padding: 24 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}><Skel w={44} h={44} r={10} /><div><Skel w={220} h={22} /><Skel w={140} h={14} style={{ marginTop: 8 }} /></div></div>
        <div style={{ display: 'flex', gap: 30, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--divider)' }}>
          {[0, 1, 2, 3].map((i) => <div key={i}><Skel w={60} h={11} /><Skel w={90} h={16} style={{ marginTop: 8 }} /></div>)}
        </div>
      </Card>
      <Card style={{ padding: 20, marginTop: 16 }}>
        <Skel w={200} h={16} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginTop: 16 }}>
          {[0, 1, 2, 3, 4].map((i) => <Skel key={i} w="100%" h={120} r={10} />)}
        </div>
      </Card>
    </div>);

}

Object.assign(window, { ProjectHome, PROJECT_META, GoalDetail });