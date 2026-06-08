/* ============================================================
   主应用 / 路由总控 — app.jsx
   ------------------------------------------------------------
   作用：整个原型的根组件与「路由器」。所有页面都是在这里根据 route 状态
         切换渲染的——本项目是单页原型，没有真正的 URL 路由，「跳转」=改 route 状态。

   三个层级（mode），互为独立的整体：
     · portal    — 总入口官网（全屏，无侧边导航）
     · workbench — 项目管理工作台（全局视角：总览/立项/治理等）
     · project   — 项目专属工作区（进入单个项目后的独立空间，导航以项目为中心）
     路由前缀 'p-' = 项目内页面（见 PROJECT_ROUTES）。

   数据来源：顶层用到的 SAMPLE_PROJECT / AI_TASKS / NAV_* 都在 shell.jsx 里定义（mock 数据）。
   ============================================================ */

function App() {
  // ---- 全局 UI 状态 ----
  const [route, setRoute] = React.useState('home');        // 当前页面 id（见下方 page 分发）
  const [collapsed, setCollapsed] = React.useState(false); // 侧边导航是否收起
  const [mode, setMode] = React.useState('portal');        // 层级：'portal' | 'workbench' | 'project'
  const [project, setProject] = React.useState(SAMPLE_PROJECT); // 当前进入的项目（进入项目区时被赋值）
  const [cmdOpen, setCmdOpen] = React.useState(false);     // ⌘K 命令面板开关
  const [aiOpen, setAiOpen] = React.useState(false);       // 顶栏 AI 工作流弹层开关
  const [aiTasks, setAiTasks] = React.useState(AI_TASKS);  // AI 任务列表（顶栏状态灯与弹层共用同一数据源）
  const aiBusy = aiTasks.some(t => t.state === 'run');     // 派生状态：只要有任务在跑，顶栏灯亮为「忙」
  const [fadeKey, setFadeKey] = React.useState(0);         // 页面切换动画 key：改它会让 <main> 重挂载触发淡入

  // AI 状态生命周期（纯演示）：挂载后给每个「进行中」任务排一个定时器，错峰逐个置为完成。
  // 顶栏灯与弹层共享同一 aiTasks，全部完成后 aiBusy 自然变 false，灯回到「空闲」。
  // ⚠ 真实开发：这里的 setTimeout 需替换为后端任务状态轮询 / WebSocket 推送。
  React.useEffect(() => {
    const timers = [];
    aiTasks.forEach((t, i) => {
      if (t.state !== 'run') return;
      timers.push(setTimeout(() => {
        setAiTasks(prev => prev.map((p, j) => j === i ? { ...p, state: 'done', step: '已完成' } : p));
      }, 4000 + i * 3500));   // 错峰完成，造成「逐个完成」的观感
    });
    return () => timers.forEach(clearTimeout);   // 卸载时清理所有定时器
  }, []);
  const [focusNode, setFocusNode] = React.useState('week-a1a');  // 「当前聚焦的目标节点」id，跨页传递（复盘/卡片处置页用）

  // ⌘K / Ctrl+K 全局快捷键：切换命令面板。preventDefault 阻止浏览器默认行为。
  React.useEffect(() => {
    const h = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmdOpen(o => !o); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // 点击页面任意空白处关闭 AI 弹层（开层时才挂监听）。
  // 配合顶栏按钮里的 e.stopPropagation()，避免「点按钮打开」同一事件又被此处关闭。
  React.useEffect(() => {
    if (!aiOpen) return;
    const h = () => setAiOpen(false);
    window.addEventListener('click', h);
    return () => window.removeEventListener('click', h);
  }, [aiOpen]);

  React.useEffect(() => { refreshIcons(); });   // 每次渲染后补一次图标扫描（新增的 <Icon> 生效）

  // navigate — 最常用的页内跳转入口，传给每个页面的 onNavigate。
  // payload.nodeId 可携带「要聚焦哪个目标节点」，用于「点某节点 → 跳复盘/卡片处置页」的跨页传参。
  const navigate = (id, payload) => {
    if (payload && payload.nodeId) setFocusNode(payload.nodeId);
    setRoute(id);
  };

  // 面包屑导航：点面包屑任一层级回到对应界面。与 navigate 不同点：它会根据目标路由
  // 是否在 PROJECT_ROUTES 里，自动切换 mode（项目内页 → project；其余 → workbench）。
  const PROJECT_ROUTES = ['p-home', 'p-tree', 'p-intervene', 'p-task', 'p-accept', 'p-risk', 'p-cost', 'p-review', 'p-kapian', 'p-kanban'];
  const crumbNavigate = (id) => {
    setMode(PROJECT_ROUTES.includes(id) ? 'project' : 'workbench');
    setFadeKey(k => k + 1);     // 触发页面淡入
    setRoute(id);
    setAiOpen(false);
  };
  // 把 crumbNavigate 挂到 window.__crumbNav：让「不持有 onNavigate 的深层组件」（如
  // shell.jsx 里的面包屑、顶栏算力按钮）也能发起跳转，免去层层透传 props。
  React.useEffect(() => { window.__crumbNav = crumbNavigate; });

  // 三个层级之间的切换：总入口 ↔ 项目管理工作台 ↔ 项目专属工作区。
  const goPortal = () => { setMode('portal'); setAiOpen(false); };          // 回总入口官网
  const goWorkbench = () => {                                               // 进入/返回工作台
    setMode('workbench');
    setFadeKey(k => k + 1);
    if (route.startsWith('p-') || !route) setRoute('home');   // 若从项目内页返回，复位到总览
  };
  const enterProject = (p) => {                                            // 进入某个项目的专属工作区
    if (p) setProject({ ...p, name: p.name, id: p.pid || p.id });  // 兼容两种字段名（pid / id）
    setMode('project');
    setFadeKey(k => k + 1);
    setRoute('p-home');   // 进项目默认落在项目主页
  };

  // ===== 路由分发表 =====
  // route 状态 → 页面组件的一串 if/else。这就是全应用的「路由表」：
  //   想知道某个 route id 对应哪个页面组件、传了什么 props，看这里即可。
  //   p-* 开头为项目内页（传 project）；其余为工作台页。未命中走底部 PlaceholderPage 占位。
  let page;
  if (route === 'home') page = <HomePage onNavigate={navigate} onEnterProject={enterProject} />;
  else if (route === 'projects') page = <ProjectsList onEnterProject={enterProject} />;
  else if (route === 'intervene') page = <InterveneWorkbench onNavigate={navigate} onEnterProject={() => enterProject()} />;
  else if (route === 'strategy') page = <StrategyLayer onNavigate={navigate} />;
  else if (route === 'mgr-intent') page = <ManagerIntent onNavigate={navigate} />;
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
  else if (route === 'closure') page = <ClosurePage onNavigate={navigate} onEnterProject={enterProject} />;
  else if (route === 'knowledge') page = <KnowledgeStandalone onNavigate={navigate} />;
  else if (route === 'ai-staff') page = <AIStaffArchive onNavigate={navigate} />;
  else if (route === 'align') page = <ValueAlignment onNavigate={navigate} />;
  else if (route === 'rules') page = <RulesAndAudit onNavigate={navigate} />;
  else if (route === 'cost-board') page = <PortfolioCostBoard onNavigate={navigate} onEnterProject={enterProject} />;
  else if (route === 'p-cost') page = <ProjectCostBoard project={project} onNavigate={navigate} />;
  else if (route === 'perm') page = <PermissionSettings onNavigate={navigate} onEnterProject={enterProject} />;
  else if (route === 'design-system') page = <DesignSystemPage />;
  else page = <PlaceholderPage id={route} inProject={mode === 'project'} project={project} />;

  // portal 模式：全屏官网，不渲染顶栏/侧边外壳，独立一层。
  if (mode === 'portal') {
    return <Portal onEnterProject={enterProject} onEnterWorkbench={goWorkbench} />;
  }

  // workbench / project 模式：完整外壳 = 顶栏 + 侧边导航 + 主内容区（加命令面板/AI 弹层）。
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
        {/* key={fadeKey} ：fadeKey 变化时 React 会销毁重建 <main>，从而重跑入场动画形成页面淡入 */}
        <main className="content" key={fadeKey}>
          {page}
        </main>
      </div>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}

// 挂载到 #root（见 HTML），启动整个原型。
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
