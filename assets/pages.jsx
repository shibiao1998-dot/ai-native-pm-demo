/* ============================================================
   页面 — pages.jsx
   ------------------------------------------------------------
   作用：项目总览首页的外壳 + 一批共享的看板组件（指标卡/总看板/健康分布）
         + 未交付页面的「占位页」。
   数据来源：COST_TREND / RUN_TREND 等为写死的 mock 趋势数组；看板大数字也是硬编码。
             真实开发需换为后端汇总接口。
   ============================================================ */

/* ---------- 状态演示分段控件 ----------
   作用：演示用的三态切换器（骨架/正常/空态），用于展示同一区域的不同加载态。
   受控组件：value 由父级持有，onChange 回传选中值。 */
function StateSeg({ value, onChange }) {
  const opts = [['loading', '骨架'], ['ready', '正常'], ['empty', '空态']];
  return (
    <div className="seg">
      {opts.map(([v, l]) => (
        <button key={v} className="seg-btn" data-on={value === v} onClick={() => onChange(v)}>{l}</button>
      ))}
    </div>
  );
}

/* ---------- 指标卡 MetricCard ----------
   作用：首页顶部的单个数据指标卡（图标 + 标题 + 大数字 + 同比 + 可选跳转链接）。
   关键交互：clickable=true 时整张数字区可点，点击走 onClick（通常跳介入工作台），
     底部显示 linkLabel 引导文案。大数字用 <CountUp> 滚动动画。
   props：delta 同比值（正负决定上/下箭头）；deltaTone success|danger 决定颜色；sub 副文本。 */
function MetricCard({ icon, iconColor, label, value, decimals = 0, prefix = '', delta, deltaTone, deltaText, sub, clickable, onClick, linkLabel = '进入介入工作台' }) {
  return (
    <div className="metric-card">
      <div className="head">
        <Icon name={icon} size={18} color={iconColor || 'var(--text-500)'} />
        <span className="t-caption" style={{ fontWeight: 500 }}>{label}</span>
      </div>
      <div className={clickable ? 'clickable' : ''} onClick={onClick} style={clickable ? { cursor: 'pointer' } : null}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span className="metric-xl"><CountUp value={value} decimals={decimals} prefix={prefix} /></span>
          {delta != null && (
            <span className="delta" style={{ color: deltaTone === 'danger' ? 'var(--danger)' : (deltaTone === 'success' ? 'var(--success)' : 'var(--text-500)') }}>
              <Icon name={delta >= 0 ? 'arrow-up-right' : 'arrow-down-right'} size={14} color="currentColor" />
              {Math.abs(delta)}
            </span>
          )}
          {delta != null && deltaText && <span className="t-micro" style={{ color: 'var(--text-400)', whiteSpace: 'nowrap' }}>{deltaText}</span>}
        </div>
        <div className="metric-sub t-micro" style={{ marginTop: 10 }}>
          <span style={{ color: 'var(--text-400)' }}>{sub}</span>
          {clickable && <span className="metric-link">{linkLabel}<Icon name="arrow-right" size={12} color="var(--blue-primary)" /></span>}
        </div>
      </div>
    </div>
  );
}

// MetricCardSkel：指标卡的骨架态（加载中占位）。
function MetricCardSkel() {
  return (
    <div className="metric-card">
      <div className="head"><Skel w={16} h={16} r={4} /><Skel w={84} h={12} /></div>
      <Skel w={120} h={32} r={6} />
      <Skel w={140} h={11} style={{ marginTop: 12 }} />
    </div>
  );
}

// 看板趋势图的 mock 数据（近 16 周）。⚠ 真实开发替换为后端时间序列。
const COST_TREND = [38,41,40,44,46,43,49,52,50,55,58,54,61,64,62,68];
const RUN_TREND  = [120,128,124,140,150,143,162,170,168,182,188,178,196,210,205,224];

/* ---------- 组合级总览首页（项目总览看板） ----------
   作用：workbench 默认落页。只负责页头 + 面包屑，主体看板委托给 <OverviewBoard>（pages_home_board.jsx）。
   props：onNavigate 页内跳转；onEnterProject 进入项目。 */
function HomePage({ onNavigate, onEnterProject }) {
  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: '项目管理工作台' }, { label: '项目总览' }]} />
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico"><Icon name="layout-dashboard" size={22} color="var(--blue-primary)" /></span>
          <div>
            <h1 className="t-h1">项目总览看板</h1>
          </div>
        </div>
        <div className="page-head-right">
          <Button variant="secondary" size="sm" icon="box" onClick={() => onNavigate('projects')}>项目列表</Button>
          <Button variant="secondary" size="sm" icon="gauge" onClick={() => onNavigate('cost-board')}>算力总看板</Button>
        </div>
      </div>

      <OverviewBoard onNavigate={onNavigate} onEnterProject={onEnterProject} />
    </div>
  );
}

/* ---------- 项目集总看板卡 PortfolioBoard ----------
   作用：首页「算力总看板」概览卡（总成本/运行次数/总费用 + 两条趋势图）。
   所有数值为 mock；底部链接点击 onNavigate('cost-board') 跳算力总看板明细。 */
function PortfolioBoard({ onNavigate }) {
  return (
    <Card className="board-card" pad>
      <div className="board-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="receipt" size={20} color="var(--text-500)" />
          <span className="t-h3">算力总看板</span>
        </div>
        <Pill tone="ai">实时数据流</Pill>
      </div>

      <div className="board-grid">
        <div className="board-stat">
          <div className="t-caption">总算力成本（累计）</div>
          <div className="metric" style={{ fontSize: 26, lineHeight: '34px', marginTop: 6 }}>¥<CountUp value={4820360} /></div>
          <div className="t-micro" style={{ color: 'var(--success)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="trending-down" size={13} color="var(--success)" />单位成本环比 -3.2%
          </div>
        </div>
        <div className="board-stat">
          <div className="t-caption">运行总次数</div>
          <div className="metric" style={{ fontSize: 26, lineHeight: '34px', marginTop: 6 }}><CountUp value={1938402} /></div>
          <div className="t-micro" style={{ color: 'var(--text-400)', marginTop: 6 }}>AI 员工累计调用</div>
        </div>
        <div className="board-stat">
          <div className="t-caption">整体费用（累计）</div>
          <div className="metric" style={{ fontSize: 26, lineHeight: '34px', marginTop: 6 }}>¥<CountUp value={6142800} /></div>
          <div className="t-micro" style={{ color: 'var(--text-400)', marginTop: 6 }}>含人力与对外采购</div>
        </div>
      </div>

      <div className="board-trend">
        <div className="trend-block">
          <div className="t-micro" style={{ color: 'var(--text-500)', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>近 16 周 · 算力成本（万元）</span><span className="mono" style={{ color: 'var(--blue-primary)', fontWeight: 600 }}>68.2</span>
          </div>
          <Sparkline data={COST_TREND} w={300} h={48} color="var(--blue-primary)" />
        </div>
        <div className="trend-block">
          <div className="t-micro" style={{ color: 'var(--text-500)', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>近 16 周 · 运行次数（千次）</span><span className="mono" style={{ color: 'var(--text-500)', fontWeight: 600 }}>224</span>
          </div>
          <Sparkline data={RUN_TREND} w={300} h={48} color="var(--text-400)" />
        </div>
      </div>

      <button className="board-foot-link" onClick={() => onNavigate('cost-board')}>
        <Icon name="gauge" size={15} color="var(--blue-primary)" />进入算力总看板查看明细<Icon name="arrow-right" size={14} color="var(--blue-primary)" />
      </button>
    </Card>
  );
}

/* ---------- 组合健康分布 HealthDist ----------
   作用：用进度环 + 分段条展示项目集「健康/需关注/卡点」占比。
   关键交互：只有「卡点」(danger) 图例可点，点击 onNavigate('intervene') 跳介入工作台
     —— 引导用户从「发现问题」直接走到「处理问题」。segs/total 为 mock。 */
function HealthDist({ onNavigate }) {
  const segs = [
    { label: '健康', n: 142, tone: 'success' },
    { label: '需关注', n: 34, tone: 'warning' },
    { label: '卡点', n: 11, tone: 'danger' },
  ];
  const total = segs.reduce((s, x) => s + x.n, 0);
  return (
    <Card className="dist-card" pad>
      <div className="board-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="trending-up" size={20} color="var(--text-500)" />
          <span className="t-h3">组合健康分布</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
        <Ring value={76} size={68} stroke={7} color="var(--success)" />
        <div>
          <div className="metric" style={{ fontSize: 22 }}>76<span style={{ fontSize: 14, color: 'var(--text-400)' }}>%</span></div>
          <div className="t-caption">组合整体健康度</div>
        </div>
      </div>
      <div className="dist-bar">
        {segs.map(s => (
          <span key={s.label} className="dist-seg" style={{ width: (s.n / total * 100) + '%', background: STATUS[s.tone].c }} />
        ))}
      </div>
      <div className="dist-legend">
        {segs.map(s => (
          <button key={s.label} className="dist-leg-item" onClick={() => s.tone === 'danger' && onNavigate('intervene')} data-click={s.tone === 'danger'}>
            <span className="dist-leg-dot" style={{ background: STATUS[s.tone].c }} />
            <span className="t-caption" style={{ color: 'var(--text-700)' }}>{s.label}</span>
            <span className="mono" style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: 'var(--text-900)' }}>{s.n}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

function BoardSkel() {
  return (
    <Card className="board-card" pad>
      <Skel w={160} h={18} style={{ marginBottom: 20 }} />
      <div className="board-grid">
        {[0,1,2].map(i => <div key={i}><Skel w={90} h={12} /><Skel w={130} h={28} r={6} style={{ marginTop: 10 }} /><Skel w={100} h={11} style={{ marginTop: 10 }} /></div>)}
      </div>
      <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
        <Skel w="100%" h={56} r={8} /><Skel w="100%" h={56} r={8} />
      </div>
    </Card>
  );
}
function DistSkel() {
  return (
    <Card className="dist-card" pad>
      <Skel w={120} h={18} style={{ marginBottom: 20 }} />
      <Skel w={68} h={68} r={999} />
      <Skel w="100%" h={12} r={6} style={{ marginTop: 24 }} />
      <div style={{ marginTop: 16 }}>{[0,1,2].map(i => <Skel key={i} w="100%" h={14} style={{ marginTop: 10 }} />)}</div>
    </Card>
  );
}

/* ---------- 占位页 PlaceholderPage ----------
   作用：未实现页面的统一占位（路由分发表未命中时的兑底）。
   实现逻辑：根据 id 查 PAGE_TITLES 取 [标题, 图标, 分组]；p-* 开头走项目面包屑。
   PAGE_TITLES：页面 id → 展示信息的映射表，加新页面时补一行即可。 */
const PAGE_TITLES = {
  strategy: ['战略意图识别', 'compass', '项目管理工作台'],
  pool: ['项目备选池', 'inbox', '项目管理工作台'],
  charter: ['立项', 'clipboard-check', '项目管理工作台'],
  intervene: ['介入工作台', 'list-checks', '项目管理工作台'],
  'cost-board': ['算力总看板', 'receipt', '项目管理工作台'],
  'ai-staff': ['AI 员工', 'bot', '治理'],
  rules: ['规则与留痕', 'history', '治理'],
  perm: ['权限', 'user-cog', '治理'],
  'p-home': ['项目主页', 'box', '项目专属工作区'],
  'p-tree': ['目标树', 'git-fork', '项目专属工作区'],
  'p-intervene': ['介入工作台', 'hand', '项目专属工作区'],
  'p-task': ['执行事务', 'square-check-big', '项目专属工作区'],
  'p-accept': ['验收与闭环', 'circle-check', '项目专属工作区'],
  'p-risk': ['风险事件', 'alert-triangle', '项目专属工作区'],
  'p-cost': ['项目费用看板', 'gauge', '项目专属工作区'],
  'closure': ['结项审批', 'package-check', '项目管理工作台'],
};
function PlaceholderPage({ id, inProject, project = SAMPLE_PROJECT }) {
  const [title, icon, group] = PAGE_TITLES[id] || ['页面', 'box', ''];
  const isProj = id.startsWith('p-');
  const crumb = isProj
    ? [{ label: project.name }, { label: title }]
    : [{ label: group }, { label: title }];
  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={crumb} />
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico"><Icon name={icon} size={22} color="var(--blue-primary)" /></span>
          <h1 className="t-h1">{title}</h1>
        </div>
      </div>
      <Card style={{ marginTop: 8 }}>
        <EmptyState
          glyph={icon}
          title={`「${title}」将在后续批次产出`}
          desc="本批（批 0）仅交付设计系统、全局外壳与组合级总览首页。该页面已在导航与信息架构中占位，可点击进入，详细设计将随后续批次（01–09）接入此原型。"
          action={<Tag mono>{isProj ? `${group} · ${project.id}` : group}</Tag>}
        />
      </Card>
    </div>
  );
}

Object.assign(window, { HomePage, PlaceholderPage, MetricCard });
