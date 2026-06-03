/* ============================================================
   批 9 · 页面 9.2 · 项目费用看板（项目专属）
   单个项目实时统计、记录已消耗算力成本总金额。
   累计成本大卡（Metric-XL + 数字滚动）+ 运行次数 + 成本趋势折线
   + 按事务成本明细表（关联事务，点行 → 跳事务详情 批 5）。
   ============================================================ */

/* 本项目按事务的算力成本明细（关联批 5 执行事务） */
const PC_TASK_COSTS = [
  { id: 'T-0291', name: '接入区域运力实时数据源', type: '数据接入', cost: 86400, runs: 52680, status: 'done' },
  { id: 'T-0312', name: '调度算力扩容与压测', type: '算力', cost: 64200, runs: 39150, status: 'done' },
  { id: 'T-0276', name: '目标拆解与周目标对齐', type: '规划', cost: 41800, runs: 25490, status: 'done' },
  { id: 'T-0301', name: '异常调度自愈策略迭代', type: '执行', cost: 38600, runs: 23540, status: 'run' },
  { id: 'T-0288', name: '逐环验收与证据核验', type: '验收', cost: 32700, runs: 19940, status: 'done' },
  { id: 'T-0319', name: '路况双源对账批处理', type: '执行', cost: 27500, runs: 16770, status: 'run' },
  { id: 'T-0264', name: '调度域目标书生成', type: '规划', cost: 16900, runs: 10310, status: 'done' },
  { id: 'T-0327', name: '风险卡点识别与留痕', type: '治理', cost: 10300, runs: 6280, status: 'run' },
];

/* 本项目近 16 周算力成本（万元）与运行次数（千次） */
const PC_COST_TREND = [1.2,1.5,1.4,1.8,2.1,1.9,2.4,2.7,2.5,2.9,3.2,2.8,3.4,3.6,3.3,3.9];
const PC_RUN_TREND  = [9,11,10,13,15,14,17,19,18,21,23,20,24,26,24,28];

const PC_TYPE_TONE = { 数据接入: 'var(--info)', 算力: 'var(--ai)', 规划: 'var(--blue-primary)', 执行: 'var(--success)', 验收: 'var(--success)', 治理: 'var(--text-500)' };

function ProjectCostBoard({ project, onNavigate }) {
  const p = project || { name: '智能履约调度中台', pid: 'PRJ-2026-0137' };
  const [loading, setLoading] = React.useState(true);
  const [range, setRange] = React.useState('all');
  const [split, setSplit] = React.useState('task'); // task | time
  const [sort, setSort] = React.useState('cost');
  const [toast, setToast] = React.useState(null);
  React.useEffect(() => { const t = setTimeout(() => setLoading(false), 650); return () => clearTimeout(t); }, []);
  React.useEffect(() => { refreshIcons(); });

  const totalCost = PC_TASK_COSTS.reduce((s, t) => s + t.cost, 0);
  const totalRuns = PC_TASK_COSTS.reduce((s, t) => s + t.runs, 0);
  const maxCost = Math.max(...PC_TASK_COSTS.map(t => t.cost));
  const rows = [...PC_TASK_COSTS].sort((a, b) => sort === 'runs' ? b.runs - a.runs : b.cost - a.cost);

  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: p.name }, { label: '项目费用看板' }]} />
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico"><Icon name="gauge" size={22} color="var(--blue-primary)" /></span>
          <div>
            <h1 className="t-h1">项目费用看板</h1>
          </div>
        </div>
        <div className="page-head-right">
          <div className="cb-range">
            {[['all','累计'],['30d','近 30 天'],['7d','近 7 天']].map(([id, lb]) => (
              <button key={id} className="cb-range-btn" data-on={range === id} onClick={() => setRange(id)}>{lb}</button>
            ))}
          </div>
          <FeedbackEntry onClick={() => setToast({ msg: '异步反馈入口已打开（演示）' })} />
        </div>
      </div>

      {loading ? (
        <>
          <div className="pc-hero">
            <Card style={{ padding: 22 }}><Skel w="40%" h={14} /><Skel w="70%" h={40} style={{ marginTop: 16 }} /></Card>
            <Card style={{ padding: 20 }}><Skel w="60%" h={14} /><Skel w="50%" h={26} style={{ marginTop: 14 }} /></Card>
            <Card style={{ padding: 20 }}><Skel w="60%" h={14} /><Skel w="50%" h={26} style={{ marginTop: 14 }} /></Card>
          </div>
          <Card style={{ padding: 20 }}>{[0,1,2,3,4].map(i => <Skel key={i} w="100%" h={40} style={{ marginBottom: 10 }} />)}</Card>
        </>
      ) : (
        <>
          {/* 累计成本大卡 + 运行次数 + 占组合比 */}
          <div className="pc-hero">
            <div className="pc-hero-main">
              <span className="cb-live"><span className="dot" />实时记账</span>
              <div className="pc-hero-k"><Icon name="gauge" size={15} color="var(--blue-primary)" />本项目累计算力成本</div>
              <div className="pc-hero-v"><span className="cur">¥</span><CountUp value={totalCost} /></div>
              <div className="pc-hero-foot">
                <span className="cb-core-delta" style={{ color: 'var(--success)', background: 'var(--success-bg)' }}><Icon name="trending-down" size={12} color="var(--success)" />单位成本 -2.8%</span>
                <span className="cb-core-note">经公司网关逐次采集 · {p.pid}</span>
              </div>
            </div>
            <div className="pc-mini">
              <div className="pc-mini-k"><Icon name="activity" size={14} color="var(--ai)" />本项目运行次数</div>
              <div className="pc-mini-v"><CountUp value={totalRuns} /></div>
              <div className="pc-mini-s">AI 员工经网关调用 API 次数</div>
            </div>
            <div className="pc-mini">
              <div className="pc-mini-k"><Icon name="pie-chart" size={14} color="var(--text-500)" />占组合算力成本</div>
              <div className="pc-mini-v">6.6<span style={{ fontSize: 15, color: 'var(--text-400)' }}>%</span></div>
              <div className="pc-mini-s">全平台累计 ¥4,820,360</div>
            </div>
          </div>

          {/* 成本趋势 + 运行次数趋势 */}
          <div className="pc-split">
            <div className="cb-chart">
              <div className="cb-chart-head">
                <div><div className="cb-chart-t">算力成本趋势</div><div className="cb-chart-s">近 16 周 · 万元</div></div>
                <div className="cb-chart-now"><div className="cb-chart-now-v">3.9</div><div className="cb-chart-now-k">本周（万元）</div></div>
              </div>
              <DualLineChart primary={PC_COST_TREND} labels={CB_WEEK_LABELS} h={140} valueFmt={(v) => `¥${v} 万`} />
              <div className="lc-legend"><span className="lc-legend-item"><span className="lc-legend-swatch" style={{ background: 'var(--blue-primary)' }} />本项目算力成本</span></div>
            </div>
            <div className="cb-chart">
              <div className="cb-chart-head">
                <div><div className="cb-chart-t">运行次数趋势</div><div className="cb-chart-s">近 16 周 · 千次</div></div>
                <div className="cb-chart-now"><div className="cb-chart-now-v">28</div><div className="cb-chart-now-k">本周（千次）</div></div>
              </div>
              <DualLineChart primary={PC_RUN_TREND} labels={CB_WEEK_LABELS} h={140} primaryColor="var(--ai)" valueFmt={(v) => `${v} 千次`} />
              <div className="lc-legend"><span className="lc-legend-item"><span className="lc-legend-swatch" style={{ background: 'var(--ai)' }} />本项目运行次数</span></div>
            </div>
          </div>

          {/* 按事务成本明细表 */}
          <div className="pc-table-wrap">
            <div className="pc-table-head">
              <span className="t"><Icon name="square-check-big" size={18} color="var(--blue-primary)" />按事务的算力成本</span>
              <div className="cb-dist-sort" style={{ marginLeft: 'auto' }}>
                <div className="seg" style={{ marginRight: 8 }}>
                  <button className="seg-btn" data-on={split === 'task'} onClick={() => setSplit('task')}>按事务</button>
                  <button className="seg-btn" data-on={split === 'time'} onClick={() => setSplit('time')}>按时间</button>
                </div>
                {split === 'task' && <>
                  <button className="cb-sort-btn" data-on={sort === 'cost'} onClick={() => setSort('cost')}><Icon name="arrow-down-wide-narrow" size={13} color={sort === 'cost' ? 'var(--blue-deep)' : 'var(--text-500)'} />成本</button>
                  <button className="cb-sort-btn" data-on={sort === 'runs'} onClick={() => setSort('runs')}><Icon name="arrow-down-wide-narrow" size={13} color={sort === 'runs' ? 'var(--blue-deep)' : 'var(--text-500)'} />次数</button>
                </>}
              </div>
            </div>

            {split === 'time' ? (
              <div style={{ padding: '22px 22px 6px' }}>
                <div className="cb-chart-head" style={{ marginBottom: 12 }}>
                  <div><div className="cb-chart-t">按周分解算力成本</div><div className="cb-chart-s">近 16 周 · 万元 · 与上方趋势同源</div></div>
                </div>
                <DualLineChart primary={PC_COST_TREND} labels={CB_WEEK_LABELS} h={170} valueFmt={(v) => `¥${v} 万`} />
                <div className="lc-legend" style={{ paddingBottom: 14 }}><span className="lc-legend-item"><span className="lc-legend-swatch" style={{ background: 'var(--blue-primary)' }} />本项目算力成本（按周）</span></div>
              </div>
            ) : (
              <table className="dtable">
                <thead><tr>
                  <th><span className="th-in">事务 / 类型</span></th>
                  <th className="num"><span className="th-in">算力成本</span></th>
                  <th><span className="th-in">占本项目</span></th>
                  <th className="num"><span className="th-in">运行次数</span></th>
                  <th><span className="th-in">状态</span></th>
                  <th style={{ width: 44 }}></th>
                </tr></thead>
                <tbody>
                  {rows.map(t => (
                    <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('p-task')}>
                      <td>
                        <div className="pc-tname">
                          <span className="pc-tname-ico"><Icon name="square-check-big" size={16} color={PC_TYPE_TONE[t.type] || 'var(--text-500)'} /></span>
                          <div className="pc-tname-main">
                            <div className="pc-tname-t">{t.name}</div>
                            <div className="pc-tname-id">{t.id} · {t.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="num"><span className="cb-bar-cost">¥{t.cost.toLocaleString('en-US')}</span></td>
                      <td>
                        <span className="pc-share">
                          <span className="pc-share-track"><span className="pc-share-fill" style={{ width: `${(t.cost / maxCost) * 100}%` }} /></span>
                          <span className="mono" style={{ fontSize: 12, color: 'var(--text-500)', width: 38, textAlign: 'right' }}>{((t.cost / totalCost) * 100).toFixed(1)}%</span>
                        </span>
                      </td>
                      <td className="num"><span className="cb-bar-runs">{t.runs.toLocaleString('en-US')}</span></td>
                      <td>{t.status === 'run' ? <Pill tone="ai">执行中</Pill> : <Pill tone="success">已完成</Pill>}</td>
                      <td><span className="cb-bar-cta"><Icon name="chevron-right" size={16} color="var(--text-400)" /></span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="cb-dist-foot">
              <Icon name="info" size={13} color="var(--text-400)" />
              共 <span className="mono">{PC_TASK_COSTS.length}</span> 个计费事务 · 累计 <span className="mono">¥{totalCost.toLocaleString('en-US')}</span> · 点事务行查看其执行详情与产出
            </div>
          </div>
        </>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

Object.assign(window, { ProjectCostBoard });
