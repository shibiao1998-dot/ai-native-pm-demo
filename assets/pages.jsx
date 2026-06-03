/* ============================================================
   页面 — 组合级总览首页 + 占位页
   ============================================================ */

/* ---------- 状态演示分段控件 ---------- */
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

/* ---------- 指标卡 ---------- */
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

function MetricCardSkel() {
  return (
    <div className="metric-card">
      <div className="head"><Skel w={16} h={16} r={4} /><Skel w={84} h={12} /></div>
      <Skel w={120} h={32} r={6} />
      <Skel w={140} h={11} style={{ marginTop: 12 }} />
    </div>
  );
}

const COST_TREND = [38,41,40,44,46,43,49,52,50,55,58,54,61,64,62,68];
const RUN_TREND  = [120,128,124,140,150,143,162,170,168,182,188,178,196,210,205,224];

/* ---------- 组合级总览首页 ---------- */
function HomePage({ onNavigate }) {
  const [state, setState] = React.useState('loading');
  React.useEffect(() => {
    if (state !== 'loading') return;
    const t = setTimeout(() => setState('ready'), 1100);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: '项目管理工作台' }, { label: '项目总览' }]} />
      <div className="page-head">
        <div>
          <h1 className="t-h1">项目总览</h1>
        </div>
        <div className="page-head-right">
          <Button variant="secondary" size="sm" icon="refresh-cw" onClick={() => setState('loading')}>刷新</Button>
        </div>
      </div>

      {state === 'empty' ? (
        <Card style={{ marginTop: 8 }}>
          <EmptyState
            glyph="layout-dashboard"
            title="暂无在运行项目"
            desc="项目备选池经战略层分析、立项通过后将自动沉淀至此。当前组合中尚无正式立项的项目。"
            action={<Button variant="primary" icon="inbox" onClick={() => onNavigate('pool')}>前往项目备选池</Button>}
          />
        </Card>
      ) : (
        <>
          {/* 三枚核心指标 */}
          <div className="metric-row">
            {state === 'loading' ? (
              <><MetricCardSkel /><MetricCardSkel /><MetricCardSkel /></>
            ) : (
              <>
                <MetricCard icon="box" iconColor="var(--blue-primary)" label="在运行项目总数" value={187}
                  delta={6} deltaTone="neutral" deltaText=" 较上周" sub="覆盖 12 个战略方向" clickable
                  onClick={() => onNavigate('projects')} linkLabel="查看全部项目" />
                <MetricCard icon="circle-check" iconColor="var(--success)" label="健康项目数" value={142}
                  delta={4} deltaTone="success" deltaText=" 较上周" sub="健康占比 76%" />
                <MetricCard icon="alert-triangle" iconColor="var(--danger)" label="异常或卡点项目数" value={11}
                  delta={3} deltaTone="danger" deltaText=" 较上周" sub="6 项待人工拍板" clickable
                  onClick={() => onNavigate('intervene')} />
              </>
            )}
          </div>

          {/* 项目集总看板 + 健康分布 */}
          <div className="board-row">
            {state === 'loading' ? (
              <><BoardSkel /><DistSkel /></>
            ) : (
              <>
                <PortfolioBoard onNavigate={onNavigate} />
                <HealthDist onNavigate={onNavigate} />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- 项目集总看板卡 ---------- */
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

/* ---------- 组合健康分布 ---------- */
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

/* ---------- 占位页（后续批次产出） ---------- */
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
  'p-risk': ['风险与卡点', 'alert-triangle', '项目专属工作区'],
  'p-close': ['结项', 'package-check', '项目专属工作区'],
  'p-cost': ['项目费用看板', 'gauge', '项目专属工作区'],
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
