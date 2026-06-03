/* ============================================================
   全局外壳 — shell.jsx
   顶栏 + 两级导航 + 面包屑 + ⌘K 命令面板 + AI 工作流弹层
   ============================================================ */

/* ---------- 导航数据 ---------- */
const NAV_PORTFOLIO = [
{ group: '项目管理工作台', items: [
  { id: 'home', label: '项目总览', icon: 'layout-dashboard' },
  { id: 'projects', label: '项目列表', icon: 'box' },
  { id: 'strategy', label: '战略意图识别', icon: 'compass' },
  { id: 'mgr-intent', label: '管理者意图', icon: 'pen-line' },
  { id: 'pool', label: '项目备选池', icon: 'inbox' },
  { id: 'charter', label: '自动立项', icon: 'clipboard-check' },
  { id: 'intervene', label: '介入工作台', icon: 'list-checks', badge: 6 },
  { id: 'cost-board', label: '算力总看板', icon: 'receipt' }]
},
{ group: '治理', items: [
  { id: 'ai-staff', label: 'AI 员工', icon: 'bot' },
  { id: 'knowledge', label: '知识库', icon: 'library' },
  { id: 'rules', label: '规则与留痕', icon: 'history' },
  { id: 'perm', label: '权限', icon: 'user-cog' }]
}];

const NAV_PROJECT = [
{ group: '项目专属工作区', project: true, items: [
  { id: 'p-home', label: '项目主页', icon: 'box' },
  { id: 'p-tree', label: '目标树', icon: 'git-fork' },
  { id: 'p-intervene', label: '介入工作台', icon: 'hand' },
  { id: 'p-task', label: '执行事务', icon: 'square-check-big' },
  { id: 'p-accept', label: '验收与闭环', icon: 'circle-check' },
  { id: 'p-risk', label: '风险与卡点', icon: 'alert-triangle' },
  { id: 'p-close', label: '结项', icon: 'package-check' },
  { id: 'p-cost', label: '项目费用看板', icon: 'gauge' }]
}];


const SAMPLE_PROJECT = { name: '智能履约调度中台', id: 'PRJ-2026-0137' };

/* ---------- 侧边导航（按 mode 分流：workbench = 项目管理工作台；project = 项目专属工作区） ---------- */
function Sidebar({ current, onNavigate, collapsed, mode = 'workbench', onExitProject, project = SAMPLE_PROJECT }) {
  const renderItem = (it, disabled) => {
    const active = current === it.id;
    return (
      <button
        key={it.id}
        className="nav-item"
        data-active={active}
        disabled={disabled}
        onClick={() => !disabled && onNavigate(it.id)}
        title={collapsed ? it.label : undefined}>
        
        <span className="nav-bar" />
        <Icon name={it.icon} size={20} color={active ? 'var(--blue-primary)' : disabled ? 'var(--text-400)' : 'var(--text-500)'} />
        {!collapsed && <span className="nav-label">{it.label}</span>}
        {!collapsed && it.badge != null && <span className="nav-badge mono">{it.badge}</span>}
        {collapsed && it.badge != null && <span className="nav-badge-dot" />}
      </button>);

  };

  // 项目专属工作区：仅项目导航，以项目 ID 区分的独立空间
  if (mode === 'project') {
    return (
      <nav className={`sidebar${collapsed ? ' collapsed' : ''}`}>
        <div className="nav-scroll">
          {!collapsed &&
          <div className="nav-ws-card">
              <span className="nav-ws-ico"><Icon name="box" size={18} color="var(--blue-primary)" /></span>
              <span className="nav-ws-meta">
                <span className="nav-ws-name">{project.name}</span>
                <span className="nav-ws-id mono">{project.id}</span>
              </span>
            </div>
          }
          {NAV_PROJECT.map((sec) =>
          <div className="nav-sec" key={sec.group}>
              {!collapsed && <div className="nav-sec-title t-label-caps">{sec.group}</div>}
              {sec.items.map((it) => renderItem(it, false))}
            </div>
          )}
        </div>
      </nav>);
  }

  // 项目管理工作台：全局视图 + 治理 + 设计系统
  return (
    <nav className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="nav-scroll">
        {NAV_PORTFOLIO.map((sec) =>
        <div className="nav-sec" key={sec.group}>
            {!collapsed && <div className="nav-sec-title t-label-caps">{sec.group}</div>}
            {sec.items.map((it) => renderItem(it, false))}
          </div>
        )}
      </div>
    </nav>);

}

/* ---------- 顶栏 ---------- */
function TopBar({ collapsed, onToggleNav, mode, onGoPortal, onGoWorkbench, onEnterProject, onOpenSearch, aiBusy, onOpenAI, project = SAMPLE_PROJECT }) {
  const [wsOpen, setWsOpen] = React.useState(false);
  const [wsQ, setWsQ] = React.useState('');
  const inProject = mode === 'project';
  React.useEffect(() => {if (!wsOpen) setWsQ('');}, [wsOpen]);
  const wsResults = React.useMemo(() => {
    const q = wsQ.trim().toLowerCase();
    const list = q ? PROJECTS.filter((p) => p.name.toLowerCase().includes(q) || p.pid.toLowerCase().includes(q)) : PROJECTS;
    return list.slice(0, 6);
  }, [wsQ]);
  return (
    <header className="topbar">
      <button className="icon-btn" onClick={onToggleNav} title="收起 / 展开导航" aria-label="切换导航">
        <Icon name={collapsed ? 'panel-left-open' : 'panel-left-close'} size={20} color="var(--text-500)" />
      </button>

      <div className="brand" onClick={onGoPortal} style={{ cursor: 'pointer' }} title="返回总入口">
        <span className="brand-mark"><Icon name="orbit" size={18} color="#fff" /></span>
        <span className="brand-name">AI 项目官网</span>
      </div>

      <button className="tb-home" onClick={onGoPortal} title="返回总览入口">
        <Icon name="arrow-left" size={15} color="var(--text-500)" />
        <span>返回总入口</span>
      </button>

      <button className="search-entry" onClick={onOpenSearch}>
        <Icon name="search" size={15} color="var(--text-400)" sw={2} className="search-entry-ic" />
        <span>搜索项目、目标节点、事务…</span>
      </button>

      <div className="topbar-right">
        <button className={`ai-light${aiBusy ? ' busy' : ''}`} onClick={onOpenAI} title="AI 状态">
          <span className="ai-dot" />
          {aiBusy && <span className="ai-ring" data-comment-anchor="fceffd092d-span-143-22" />}
          <span className="ai-text">{aiBusy ? 'AI 工作中' : 'AI 空闲'}</span>
        </button>

        <button className="cost-overview" title="今日算力花费 · 进入算力总看板" onClick={() => { window.__cbRange = 'today'; window.__crumbNav && window.__crumbNav('cost-board'); }}>
          <Icon name="gauge" size={16} color="var(--text-500)" />
          <span className="mono">¥<CountUp value={48210} /></span>
          <span className="t-micro" style={{ color: 'var(--text-400)' }}>今日</span>
        </button>

        <button className="icon-btn bell" title="通知">
          <Icon name="bell" size={19} color="var(--text-500)" />
          <span className="bell-dot" />
        </button>

        <span className="role-badge"><Icon name="shield-check" size={13} color="var(--blue-primary)" />管理层</span>

        <button className="avatar" title="账户">管</button>
      </div>
    </header>);

}

/* ---------- 面包屑 ---------- */
const CRUMB_ROUTE = {
  '项目管理工作台': 'home', '项目总览': 'home', '项目列表': 'projects', '全部项目': 'projects',
  '战略意图识别': 'strategy', '管理者意图': 'mgr-intent', '管理者意图录入': 'mgr-intent',
  '项目备选池': 'pool', '自动立项': 'charter', '介入工作台': 'intervene', '算力总看板': 'cost-board',
  'AI 员工': 'ai-staff', '价值观对齐': 'align', '知识库': 'knowledge', '规则与留痕': 'rules', '权限': 'perm',
  '项目主页': 'p-home', '目标树': 'p-tree', '目标书': 'p-tree', '目标树 / 目标书': 'p-tree', '介入工作台': 'p-intervene',
  '执行事务': 'p-task', '事务看板': 'p-task', '验收与闭环': 'p-accept', '逐级验收报告': 'p-accept',
  '风险与卡点': 'p-risk', '结项': 'p-close', '结项审核': 'p-close', '项目费用看板': 'p-cost',
};
function crumbRoute(item, i, items) {
  if (item.route) return item.route;
  if (item.mono) return 'p-home';                          // 项目编号 → 项目主页
  if (items[i + 1] && items[i + 1].mono) return 'p-home';  // 项目名（其后紧跟编号）→ 项目主页
  return CRUMB_ROUTE[item.label] || null;
}
function Breadcrumb({ items }) {
  return (
    <div className="crumb">
      {items.map((it, i) => {
        const last = i === items.length - 1;
        const route = last ? null : crumbRoute(it, i, items);
        const inner = it.mono ? <span className="mono">{it.label}</span> : it.label;
        return (
          <React.Fragment key={i}>
            {i > 0 && <Icon name="chevron-right" size={14} color="var(--text-400)" />}
            {route
              ? <button type="button" className="crumb-item is-link" onClick={() => window.__crumbNav && window.__crumbNav(route)}>{inner}</button>
              : <span className={`crumb-item${last ? ' cur' : ''}`}>{inner}</span>}
          </React.Fragment>
        );
      })}
    </div>);

}

/* ---------- ⌘K 命令面板 ---------- */
const SEARCH_DATA = [
{ cat: '项目', icon: 'box', label: '智能履约调度中台', sub: 'PRJ-2026-0137 · 项目管理工作台 › 项目', mono: 'PRJ-2026-0137' },
{ cat: '项目', icon: 'box', label: '客服知识中枢重构', sub: 'PRJ-2026-0129 · 项目管理工作台 › 项目', mono: 'PRJ-2026-0129' },
{ cat: '目标节点', icon: 'milestone', label: '阶段目标：履约时效 < 4h', sub: 'PRJ-2026-0137 › 目标树 › 阶段目标' },
{ cat: '事务', icon: 'square-check-big', label: '接入区域运力实时数据源', sub: 'PRJ-2026-0137 › 执行事务' },
{ cat: '留痕', icon: 'history', label: '大额成本审批 · ¥182,000', sub: 'PRJ-2026-0129 › 规则与留痕' },
{ cat: 'AI 员工', icon: 'bot', label: '目标拆解 Agent · 调度域', sub: 'AI 员工平台 6699.com' }];

function CommandPalette({ open, onClose }) {
  const [q, setQ] = React.useState('');
  const inputRef = React.useRef(null);
  React.useEffect(() => {if (open) {setQ('');setTimeout(() => inputRef.current && inputRef.current.focus(), 30);}}, [open]);
  React.useEffect(() => {
    const h = (e) => {if (e.key === 'Escape' && open) onClose();};
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  const filtered = q ? SEARCH_DATA.filter((d) => (d.label + d.sub).toLowerCase().includes(q.toLowerCase())) : SEARCH_DATA;
  const cats = [...new Set(filtered.map((d) => d.cat))];
  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="全局搜索">
        <div className="cmd-input">
          <Icon name="search" size={18} color="var(--text-400)" />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索项目（以 ID 落位）、目标节点、事务、留痕、AI 员工…  输入 > 触发命令" />
          <kbd className="mono">Esc</kbd>
        </div>
        <div className="cmd-body">
          {!q && <div className="cmd-hint t-micro">最近访问</div>}
          {filtered.length === 0 && <div className="cmd-empty t-caption">无匹配结果，换个关键词或项目 ID 试试。</div>}
          {cats.map((cat) =>
          <div key={cat} className="cmd-group">
              <div className="cmd-cat t-label-caps">{cat}</div>
              {filtered.filter((d) => d.cat === cat).map((d, i) =>
            <button key={i} className="cmd-row" onClick={onClose}>
                  <Icon name={d.icon} size={18} color="var(--text-500)" />
                  <div className="cmd-row-main">
                    <span className="cmd-row-label">{d.label}</span>
                    <span className="cmd-row-sub t-micro">{d.sub}</span>
                  </div>
                  <Icon name="corner-down-left" size={14} color="var(--text-400)" />
                </button>
            )}
            </div>
          )}
        </div>
        <div className="cmd-foot t-micro">
          <span><kbd className="mono">↑↓</kbd> 选择</span>
          <span><kbd className="mono">↵</kbd> 打开</span>
          <span><kbd className="mono">&gt;</kbd> 命令</span>
        </div>
      </div>
    </div>);

}

/* ---------- AI 工作流弹层 ---------- */
const AI_TASKS = [
{ proj: 'PRJ-2026-0137', label: '拆解阶段目标', step: '第 3/5 步', state: 'run' },
{ proj: 'PRJ-2026-0129', label: '逐环审核 · 展示环', step: '审核中', state: 'run' },
{ proj: 'PRJ-2026-0151', label: '生成验收结论', step: '即将完成', state: 'run' },
{ proj: 'PRJ-2026-0118', label: '周目标对齐校验', step: '已完成', state: 'done' }];

function AIWorkflow({ open, onClose, tasks = AI_TASKS }) {
  if (!open) return null;
  const running = tasks.filter((t) => t.state === 'run').length;
  return (
    <div className="ai-pop" onClick={(e) => e.stopPropagation()}>
      <div className="ai-pop-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="sparkles" size={18} color="var(--ai)" />
          <span className="t-h3">AI 工作流</span>
        </div>
        <span className="pill" style={{ background: running ? 'var(--ai-soft)' : 'var(--success-soft, #E8F5EC)', color: running ? 'var(--ai)' : 'var(--success)' }}>
          <span className="dot" style={{ background: running ? 'var(--ai)' : 'var(--success)' }} />{running ? `${running} 项进行中` : '全部完成'}
        </span>
      </div>
      <div className="ai-pop-list">
        {tasks.map((t, i) =>
        <div className="ai-task" key={i}>
            <span className={`ai-task-ico ${t.state}`}>
              <Icon name={t.state === 'done' ? 'circle-check' : 'loader-2'} size={16} color={t.state === 'done' ? 'var(--success)' : 'var(--ai)'} className={t.state === 'run' ? 'spin' : ''} />
            </span>
            <div className="ai-task-main">
              <span className="ai-task-label">{t.label}</span>
              <span className="mono ai-task-proj">{t.proj}</span>
            </div>
            <span className="ai-task-step t-micro" style={{ color: t.state === 'done' ? 'var(--success)' : 'var(--ai)' }}>{t.step}</span>
          </div>
        )}
      </div>
      <div className="ai-pop-foot">
        <span className="t-micro">{running ? '长任务可转入后台，完成后顶栏状态灯变绿提醒。' : '当前没有进行中的 AI 任务，顶栏状态灯已回到空闲。'}</span>
      </div>
    </div>);

}

Object.assign(window, { Sidebar, TopBar, Breadcrumb, CommandPalette, AIWorkflow, AI_TASKS, SAMPLE_PROJECT });