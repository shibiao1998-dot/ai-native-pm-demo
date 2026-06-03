/* ============================================================
   页面 1.2 · 全部项目列表（组合级 · 浏览 / 检索 / 下钻）
   ============================================================ */

const HEALTH = {
  健康: { tone: 'success' }, 关注: { tone: 'warning' }, 卡点: { tone: 'danger' }
};

/* 项目集（每个项目集有对应负责人 / 管理者） */
const PORTFOLIOS = [
  { id: 'service', name: '客户服务自助化', owner: '苏婧' },
  { id: 'fulfill', name: '履约与供应链', owner: '何沛' },
  { id: 'growth', name: '增长与营销', owner: '林越' },
  { id: 'data', name: '数据与财务中台', owner: '周岚' },
];
const PF_NAME = Object.fromEntries(PORTFOLIOS.map(p => [p.id, p.name]));

const PROJECTS = [
{ name: '智能履约调度中台', pid: 'PRJ-2026-0137', portfolio: 'fulfill', health: '健康', mode: 'AI 自治', owner: '何沛', stage: '执行 · v2.3', progress: 82, kapian: 1, cost: 318400 },
{ name: '客服知识中枢重构', pid: 'PRJ-2026-0129', portfolio: 'service', health: '关注', mode: '人工负责', owner: '苏婧', stage: '执行 · v1.7', progress: 54, kapian: 0, cost: 241800 },
{ name: '区域运力预测引擎', pid: 'PRJ-2026-0151', portfolio: 'fulfill', health: '卡点', mode: 'AI 自治', owner: '何沛', stage: '验收 · v1.2', progress: 37, kapian: 2, cost: 196500 },
{ name: '营销内容生成平台', pid: 'PRJ-2026-0144', portfolio: 'growth', health: '卡点', mode: 'AI 自治', owner: '林越', stage: '执行 · v3.0', progress: 61, kapian: 1, cost: 287900 },
{ name: '供应商对账自动化', pid: 'PRJ-2026-0162', portfolio: 'data', health: '关注', mode: 'AI 自治', owner: '苏婧', stage: '执行 · v1.0', progress: 49, kapian: 1, cost: 132600 },
{ name: '旧版报表迁移', pid: 'PRJ-2026-0096', portfolio: 'data', health: '健康', mode: '人工负责', owner: '周岚', stage: '结项审核 · v4.1', progress: 98, kapian: 0, cost: 88200 },
{ name: '智能工单分派系统', pid: 'PRJ-2026-0173', portfolio: 'service', health: '健康', mode: 'AI 自治', owner: '林越', stage: '执行 · v2.0', progress: 74, kapian: 0, cost: 205300 },
{ name: '财务凭证识别', pid: 'PRJ-2026-0118', portfolio: 'data', health: '健康', mode: 'AI 自治', owner: '周岚', stage: '执行 · v1.5', progress: 88, kapian: 0, cost: 167400 },
{ name: '门店选址评估模型', pid: 'PRJ-2026-0155', portfolio: 'growth', health: '关注', mode: '人工负责', owner: '何沛', stage: '规划 · v0.9', progress: 28, kapian: 0, cost: 74800 },
{ name: '会员流失预警', pid: 'PRJ-2026-0140', portfolio: 'growth', health: '健康', mode: 'AI 自治', owner: '苏婧', stage: '执行 · v2.2', progress: 79, kapian: 0, cost: 152900 },
{ name: '合同条款抽取', pid: 'PRJ-2026-0167', portfolio: 'data', health: '卡点', mode: 'AI 自治', owner: '林越', stage: '验收 · v1.1', progress: 42, kapian: 1, cost: 119600 },
{ name: '库存调拨优化', pid: 'PRJ-2026-0133', portfolio: 'fulfill', health: '健康', mode: 'AI 自治', owner: '周岚', stage: '执行 · v3.4', progress: 91, kapian: 0, cost: 263100 },
{ name: '智能排班引擎', pid: 'PRJ-2026-0149', portfolio: 'fulfill', health: '关注', mode: '人工负责', owner: '何沛', stage: '执行 · v1.3', progress: 57, kapian: 0, cost: 141200 },
{ name: '客诉根因分析', pid: 'PRJ-2026-0158', portfolio: 'service', health: '健康', mode: 'AI 自治', owner: '苏婧', stage: '执行 · v2.1', progress: 83, kapian: 0, cost: 178500 }];


const OWNERS = ['何沛', '苏婧', '林越', '周岚'];

function FilterChip({ label, options, value, onChange }) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (!open) return;
    const h = () => setOpen(false);
    window.addEventListener('click', h);
    return () => window.removeEventListener('click', h);
  }, [open]);
  return (
    <div className="filt" onClick={(e) => e.stopPropagation()}>
      <button className="filt-btn" data-on={value !== options[0]} onClick={() => setOpen((o) => !o)}>
        <span className="t-micro" style={{ color: 'var(--text-400)' }}>{label}</span>
        <span className="filt-val">{value}</span>
        <Icon name="chevron-down" size={14} color="var(--text-400)" />
      </button>
      {open &&
      <div className="filt-menu">
          {options.map((o) =>
        <button key={o} className="filt-opt" data-on={o === value} onClick={() => {onChange(o);setOpen(false);}}>
              {o}{o === value && <Icon name="check" size={15} color="var(--blue-primary)" style={{ marginLeft: 'auto' }} />}
            </button>
        )}
        </div>
      }
    </div>);

}

function ProjectsList({ onEnterProject }) {
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState('table');
  const [density, setDensity] = React.useState('comfort');
  const [q, setQ] = React.useState('');
  const [fHealth, setFHealth] = React.useState('全部');
  const [fMode, setFMode] = React.useState('全部');
  const [fKapian, setFKapian] = React.useState('全部');
  const [fOwner, setFOwner] = React.useState('全部');
  const [fPf, setFPf] = React.useState('全部');
  const [sortKey, setSortKey] = React.useState('progress');
  const [sortDir, setSortDir] = React.useState('desc');

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const rows = React.useMemo(() => {
    let v = PROJECTS.filter((p) =>
    (fHealth === '全部' || p.health === fHealth) && (
    fMode === '全部' || p.mode === fMode) && (
    fKapian === '全部' || (fKapian === '有卡点' ? p.kapian > 0 : p.kapian === 0)) && (
    fOwner === '全部' || p.owner === fOwner) && (
    fPf === '全部' || PF_NAME[p.portfolio] === fPf) && (
    !q || p.name.includes(q) || p.pid.toLowerCase().includes(q.toLowerCase()))
    );
    v = [...v].sort((a, b) => {
      const d = sortDir === 'desc' ? -1 : 1;
      return (a[sortKey] - b[sortKey]) * d;
    });
    return v;
  }, [q, fHealth, fMode, fKapian, fOwner, fPf, sortKey, sortDir]);

  const toggleSort = (k) => {
    if (sortKey === k) setSortDir((d) => d === 'desc' ? 'asc' : 'desc');else
    {setSortKey(k);setSortDir('desc');}
  };
  const sortIcon = (k) => sortKey !== k ? 'chevrons-up-down' : sortDir === 'desc' ? 'chevron-down' : 'chevron-up';

  const hasFilter = fHealth !== '全部' || fMode !== '全部' || fKapian !== '全部' || fOwner !== '全部' || fPf !== '全部' || q;
  const resetFilters = () => {setFHealth('全部');setFMode('全部');setFKapian('全部');setFOwner('全部');setFPf('全部');setQ('');};

  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: '项目管理工作台' }, { label: '全部项目' }]} />
      <div className="page-head" style={{ alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico"><Icon name="box" size={22} color="var(--blue-primary)" /></span>
          <div>
            <h1 className="t-h1">项目列表</h1>
          </div>
        </div>
        <div className="page-head-right">
          <div className="seg">
            <button className="seg-btn" data-on={view === 'table'} onClick={() => setView('table')}>表格</button>
            <button className="seg-btn" data-on={view === 'grid'} onClick={() => setView('grid')}>卡片</button>
          </div>
        </div>
      </div>

      {/* 筛选条 */}
      <div className="pl-toolbar">
        <div className="pl-search">
          <Icon name="search" size={16} color="var(--text-400)" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="按项目名 / 项目 ID 检索…" />
        </div>
        <FilterChip label="项目集" options={['全部', ...PORTFOLIOS.map(p => p.name)]} value={fPf} onChange={setFPf} />
        <FilterChip label="健康态" options={['全部', '健康', '关注', '卡点']} value={fHealth} onChange={setFHealth} />
        <FilterChip label="负责模式" options={['全部', 'AI 自治', '人工负责']} value={fMode} onChange={setFMode} />
        <FilterChip label="卡点" options={['全部', '有卡点', '无卡点']} value={fKapian} onChange={setFKapian} />
        <FilterChip label="负责人" options={['全部', ...OWNERS]} value={fOwner} onChange={setFOwner} />
        {hasFilter && <Button variant="text" size="sm" icon="x" onClick={resetFilters}>清除</Button>}
        {view === 'table' &&
        <div className="seg" style={{ marginLeft: 'auto' }}>
            <button className="seg-btn" data-on={density === 'comfort'} onClick={() => setDensity('comfort')}>舒适</button>
            <button className="seg-btn" data-on={density === 'compact'} onClick={() => setDensity('compact')}>紧凑</button>
          </div>
        }
      </div>

      {loading ?
      <Card style={{ overflow: 'hidden' }}><PlSkel /></Card> :
      rows.length === 0 ?
      <Card><EmptyState glyph="search" title="无匹配项目" desc="当前筛选与检索条件下没有项目，试试放宽条件。" action={<Button variant="secondary" icon="x" onClick={resetFilters}>清除筛选</Button>} /></Card> :
      view === 'table' ?
      <Card style={{ overflow: 'hidden' }}>
          <table className={`dtable pl-table${density === 'compact' ? ' compact' : ''}`}>
            <thead>
              <tr>
                <th><span className="th-in">项目</span></th>
                <th><span className="th-in">项目集</span></th>
                <th><span className="th-in">健康态</span></th>
                <th><span className="th-in">负责模式</span></th>
                <th><span className="th-in">负责人</span></th>
                <th><span className="th-in">当前阶段</span></th>
                <th className="num"><span className="th-in" onClick={() => toggleSort('progress')}>推进度 <Icon name={sortIcon('progress')} size={13} color={sortKey === 'progress' ? 'var(--blue-primary)' : 'var(--text-400)'} /></span></th>
                <th className="num"><span className="th-in" onClick={() => toggleSort('kapian')}>卡点 <Icon name={sortIcon('kapian')} size={13} color={sortKey === 'kapian' ? 'var(--blue-primary)' : 'var(--text-400)'} /></span></th>
                <th className="num"><span className="th-in" onClick={() => toggleSort('cost')}>累计算力成本 <Icon name={sortIcon('cost')} size={13} color={sortKey === 'cost' ? 'var(--blue-primary)' : 'var(--text-400)'} /></span></th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) =>
            <tr key={p.pid} className={p.kapian > 0 ? 'has-kapian' : ''} onClick={() => onEnterProject(p)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div className="pl-proj">
                      <span className="pl-proj-name">{p.name}</span>
                      <span className="mono pl-proj-id">{p.pid}</span>
                    </div>
                  </td>
                  <td><span className="pl-pf">{PF_NAME[p.portfolio]}</span></td>
                  <td><Pill tone={HEALTH[p.health].tone}>{p.health}</Pill></td>
                  <td><span className="pl-mode"><Icon name={p.mode === 'AI 自治' ? 'bot' : 'user-cog'} size={14} color={p.mode === 'AI 自治' ? 'var(--ai)' : 'var(--text-500)'} />{p.mode}</span></td>
                  <td><span className="pl-owner"><span className="pl-ava">{p.owner[0]}</span>{p.owner}</span></td>
                  <td className="t-caption mono" style={{ color: 'var(--text-500)' }}>{p.stage}</td>
                  <td className="num">
                    <div className="pl-prog">
                      <span className="pl-prog-bar"><span className="pl-prog-fill" style={{ width: p.progress + '%', background: p.progress >= 80 ? 'var(--success)' : p.progress >= 50 ? 'var(--blue-primary)' : 'var(--warning)' }} /></span>
                      <span className="mono pl-prog-n">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="num">{p.kapian > 0 ? <span className="mono pl-kapian">{p.kapian}</span> : <span className="mono" style={{ color: 'var(--text-400)' }}>0</span>}</td>
                  <td className="num mono" style={{ color: 'var(--text-900)', fontWeight: 600 }}>¥{p.cost.toLocaleString('en-US')}</td>
                  <td><Icon name="chevron-right" size={16} color="var(--text-400)" /></td>
                </tr>
            )}
            </tbody>
          </table>
        </Card> :

      <div className="pl-grid">
          {rows.map((p) =>
        <button key={p.pid} className={`pl-gcard${p.kapian > 0 ? ' has-kapian' : ''}`} onClick={() => onEnterProject(p)}>
              <div className="pl-gcard-top">
                <div style={{ minWidth: 0 }}>
                  <div className="pl-proj-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div className="mono pl-proj-id" style={{ marginTop: 2 }}>{p.pid}</div>
                </div>
                <Ring value={p.progress} size={48} stroke={5} color={p.progress >= 80 ? 'var(--success)' : p.progress >= 50 ? 'var(--blue-primary)' : 'var(--warning)'} />
              </div>
              <div className="pl-gcard-meta">
                <span className="pl-pf">{PF_NAME[p.portfolio]}</span>
                <Pill tone={HEALTH[p.health].tone}>{p.health}</Pill>
                <span className="pl-mode"><Icon name={p.mode === 'AI 自治' ? 'bot' : 'user-cog'} size={13} color={p.mode === 'AI 自治' ? 'var(--ai)' : 'var(--text-500)'} />{p.mode}</span>
                {p.kapian > 0 && <span className="pl-gcard-kapian"><Icon name="alert-triangle" size={13} color="var(--danger)" />{p.kapian}</span>}
              </div>
              <div className="pl-gcard-foot">
                <span className="pl-owner"><span className="pl-ava">{p.owner[0]}</span>{p.owner}</span>
                <span className="mono" style={{ color: 'var(--text-700)', fontWeight: 600 }}>¥{p.cost.toLocaleString('en-US')}</span>
              </div>
            </button>
        )}
        </div>
      }
    </div>);

}

function PlSkel() {
  return (
    <div style={{ padding: '4px 0' }}>
      <div className="skeleton" style={{ height: 40, borderRadius: 0, opacity: .5 }} />
      {[0, 1, 2, 3, 4, 5].map((i) =>
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '0 16px', height: 56, borderBottom: '1px solid var(--divider)' }}>
          <Skel w={180} h={14} /><Skel w={56} h={20} r={999} /><Skel w={80} h={14} /><Skel w={70} h={14} style={{ marginLeft: 'auto' }} /><Skel w={90} h={14} />
        </div>
      )}
    </div>);

}

Object.assign(window, { ProjectsList, PROJECTS, HEALTH, PORTFOLIOS, PF_NAME });