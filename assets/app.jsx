/* ============================================================
   主应用 — app.jsx
   ============================================================ */

function App() {
  const [route, setRoute] = React.useState('home');
  const [collapsed, setCollapsed] = React.useState(false);
  const [mode, setMode] = React.useState('portal'); // 'portal' | 'workbench' | 'project'
  const [project, setProject] = React.useState(SAMPLE_PROJECT);
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const [aiOpen, setAiOpen] = React.useState(false);
  const [aiTasks, setAiTasks] = React.useState(AI_TASKS);
  const aiBusy = aiTasks.some(t => t.state === 'run');
  const [fadeKey, setFadeKey] = React.useState(0);

  // AI 状态生命周期：任务逐个完成，顶栏灯与弹层共享同一任务源，全部完成后自然回到空闲
  React.useEffect(() => {
    const timers = [];
    aiTasks.forEach((t, i) => {
      if (t.state !== 'run') return;
      timers.push(setTimeout(() => {
        setAiTasks(prev => prev.map((p, j) => j === i ? { ...p, state: 'done', step: '已完成' } : p));
      }, 4000 + i * 3500));
    });
    return () => timers.forEach(clearTimeout);
  }, []);
  const [focusNode, setFocusNode] = React.useState('week-a1a');

  // ⌘K 全局
  React.useEffect(() => {
    const h = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmdOpen(o => !o); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // 点击空白关闭 AI 弹层
  React.useEffect(() => {
    if (!aiOpen) return;
    const h = () => setAiOpen(false);
    window.addEventListener('click', h);
    return () => window.removeEventListener('click', h);
  }, [aiOpen]);

  React.useEffect(() => { refreshIcons(); });

  const navigate = (id, payload) => {
    if (payload && payload.nodeId) setFocusNode(payload.nodeId);
    setRoute(id);
  };

  // 面包屑导航：点击任一层级回到对应界面（按目标路由自动切换 工作台 / 项目 视图）
  const PROJECT_ROUTES = ['p-home', 'p-tree', 'p-intervene', 'p-task', 'p-accept', 'p-risk', 'p-close', 'p-cost', 'p-review', 'p-kapian', 'p-kanban'];
  const crumbNavigate = (id) => {
    setMode(PROJECT_ROUTES.includes(id) ? 'project' : 'workbench');
    setFadeKey(k => k + 1);
    setRoute(id);
    setAiOpen(false);
  };
  React.useEffect(() => { window.__crumbNav = crumbNavigate; });

  // 总入口 ↔ 项目管理工作台 ↔ 项目专属工作区（互为独立整体）
  const goPortal = () => { setMode('portal'); setAiOpen(false); };
  const goWorkbench = () => {
    setMode('workbench');
    setFadeKey(k => k + 1);
    if (route.startsWith('p-') || !route) setRoute('home');
  };
  const enterProject = (p) => {
    if (p) setProject({ ...p, name: p.name, id: p.pid || p.id });
    setMode('project');
    setFadeKey(k => k + 1);
    setRoute('p-home');
  };

  let page;
  if (route === 'home') page = <HomePage onNavigate={navigate} />;
  else if (route === 'projects') page = <ProjectsList onEnterProject={enterProject} />;
  else if (route === 'intervene') page = <InterveneWorkbench onNavigate={navigate} onEnterProject={() => enterProject()} />;
  else if (route === 'strategy') page = <StrategyLayer />;
  else if (route === 'mgr-intent') page = <ManagerIntent />;
  else if (route === 'pool') page = <CandidatePool />;
  else if (route === 'charter') page = <Charter />;
  else if (route === 'cost-approval') page = <CostApproval onNavigate={navigate} />;
  else if (route === 'p-home') page = <ProjectHome project={project} onNavigate={navigate} />;
  else if (route === 'p-tree') page = <GoalTreeBook project={project} onNavigate={navigate} />;
  else if (route === 'p-intervene') page = <ProjectIntervene project={project} onNavigate={navigate} />;
  else if (route === 'p-review') page = <LoopReview nodeId={focusNode} onNavigate={navigate} />;
  else if (route === 'p-kapian') page = <KapianDisposal nodeId={focusNode} onNavigate={navigate} />;
  else if (route === 'p-task') page = <ExecutionTasks project={project} onNavigate={navigate} />;
  else if (route === 'p-accept') page = <AcceptanceLoop project={project} onNavigate={navigate} />;
  else if (route === 'p-risk') page = <RiskRegister project={project} onNavigate={navigate} />;
  else if (route === 'p-close') page = <ClosurePage project={project} onNavigate={navigate} />;
  else if (route === 'knowledge') page = <KnowledgeStandalone onNavigate={navigate} />;
  else if (route === 'ai-staff') page = <AIStaffArchive onNavigate={navigate} />;
  else if (route === 'align') page = <ValueAlignment onNavigate={navigate} />;
  else if (route === 'rules') page = <RulesAndAudit onNavigate={navigate} />;
  else if (route === 'cost-board') page = <PortfolioCostBoard onNavigate={navigate} onEnterProject={enterProject} />;
  else if (route === 'p-cost') page = <ProjectCostBoard project={project} onNavigate={navigate} />;
  else if (route === 'perm') page = <PermissionSettings onNavigate={navigate} onEnterProject={enterProject} />;
  else if (route === 'design-system') page = <DesignSystemPage />;
  else page = <PlaceholderPage id={route} inProject={mode === 'project'} project={project} />;

  if (mode === 'portal') {
    return <Portal onEnterProject={enterProject} onEnterWorkbench={goWorkbench} />;
  }

  return (
    <div className="app-shell">
      <TopBar
        collapsed={collapsed}
        onToggleNav={() => setCollapsed(c => !c)}
        mode={mode}
        onGoPortal={goPortal}
        onGoWorkbench={goWorkbench}
        onEnterProject={enterProject}
        onOpenSearch={() => setCmdOpen(true)}
        aiBusy={aiBusy}
        onOpenAI={(e) => { e.stopPropagation(); setAiOpen(o => !o); }}
        project={project}
      />
      {aiOpen && <div className="ai-pop-wrap"><AIWorkflow open={aiOpen} onClose={() => setAiOpen(false)} tasks={aiTasks} /></div>}
      <div className="app-body">
        <Sidebar current={route} onNavigate={navigate} collapsed={collapsed} mode={mode} onExitProject={goPortal} project={project} />
        <main className="content" key={fadeKey}>
          {page}
        </main>
      </div>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
