/* ============================================================
   项目级 · 介入工作台（pages_b3_intervene.jsx）
   把「需要人工介入的交互操作」从目标树剥离至此，集中处置。
   目标树 = 只读执行预览；本页 = 项目负责人 / 管理层的操作入口。
   依赖：components.jsx、pages_home_data.jsx（HOME_LEVEL）
   ============================================================ */

const PIV_TONE = {
  warning: { c: 'var(--warning)', bg: 'var(--warning-bg)', bd: '#F2DDB6' },
  danger:  { c: 'var(--danger)', bg: 'var(--danger-bg)', bd: '#F3CFCF' },
  info:    { c: 'var(--info)', bg: 'var(--info-bg)', bd: 'var(--blue-border)' },
  ai:      { c: 'var(--ai)', bg: 'var(--ai-soft)', bd: '#BEE6F8' },
};

const PIV_ITEMS = [
  { id: 'iv-1', type: '卡点处置', tone: 'warning', icon: 'alert-triangle', level: 'phase', ver: 'v1.1',
    title: '履约时效 < 4h', owner: '黄世彪',
    sub: '路况源选型连续两次验收未通过，实时数据管道时延超标，阶段目标被阻断。',
    suggest: 'AI 建议：放行路况源采购并补充高峰时段压测。', action: '卡点处置', route: 'p-kapian', nodeId: 'phase-a1' },
  { id: 'iv-2', type: '大额成本审批', tone: 'danger', icon: 'wallet', level: 'task', ver: '事务',
    title: '路况源选型与采购', owner: '采购协同 Agent',
    sub: '采购金额 ¥1,820,000 触发大额成本审批，待管理层拍板。',
    suggest: 'AI 建议：金额在预算阈值内，建议放行并留痕。', action: '前往审批', route: 'cost-approval' },
  { id: 'iv-3', type: '排期确认', tone: 'info', icon: 'stamp', level: 'week', ver: '2026年06月第1周',
    title: '本周 3 条周计划待确认排期', owner: '项目官网 AI 负责人',
    sub: 'AI 已完成周版本拆解与事务绑定，待项目负责人确认排期后进入执行。',
    suggest: 'AI 建议：排期与上周节奏一致，可批量确认。', action: '确认排期' },
  { id: 'iv-4', type: '验收复核', tone: 'ai', icon: 'clipboard-check', level: 'phase', ver: 'v1.1',
    title: '异常调度自愈率 ≥ 90%', owner: '验收 AI',
    sub: 'AI 已汇总执行数据并发起验收，待人工复核验收结论。',
    suggest: 'AI 建议：指标达成，建议通过验收。', action: '进入验收', route: 'p-accept' },
];

function ProjectIntervene({ project, onNavigate }) {
  const [loading, setLoading] = React.useState(true);
  const [done, setDone] = React.useState({});
  const [toast, setToast] = React.useState(null);
  const p = { ...window.PROJECT_META, ...(project || {}) };

  React.useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);
  React.useEffect(() => { refreshIcons(); });

  const pending = PIV_ITEMS.filter(i => !done[i.id]);

  const act = (it) => {
    if (it.route) { onNavigate && onNavigate(it.route, it.nodeId ? { nodeId: it.nodeId } : undefined); return; }
    setDone(d => ({ ...d, [it.id]: true }));
    setToast({ msg: `已${it.action}：${it.title}（演示）` });
  };

  if (loading) {
    return (
      <div className="content-inner page-fade">
        <Breadcrumb items={[{ label: p.name }, { label: '介入工作台' }]} />
        <Card style={{ padding: 24, marginTop: 8 }}>
          {[0, 1, 2].map(i => <Skel key={i} w="100%" h={88} r={10} style={{ marginBottom: 12 }} />)}
        </Card>
      </div>
    );
  }

  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: p.name }, { label: '介入工作台' }]} />
      <div className="gtree-head">
        <div className="gtree-head-l">
          <span className="page-head-ico"><Icon name="hand" size={22} color="var(--blue-primary)" /></span>
          <h1 className="t-h1">介入工作台</h1>
          <span className="iv-scope">项目级</span>
        </div>
        <div className="gtree-head-r">
          <span className="iv-count"><span className="iv-count-n mono">{pending.length}</span> 项待介入</span>
          <Button variant="secondary" size="sm" icon="git-fork" onClick={() => onNavigate && onNavigate('p-tree')}>返回目标树</Button>
        </div>
      </div>

      <StatusBar tone="info" icon="info" title="集中处置当前项目需要人工介入的事项">
        目标树仅做执行预览；卡点处置、大额审批、排期确认、验收复核等需要人工拍板的操作统一在此完成，处置后自动回写到目标树与各模块。
      </StatusBar>

      {pending.length === 0 ? (
        <Card style={{ marginTop: 16 }}>
          <EmptyState glyph="check-circle-2" title="当前没有待介入事项" desc="所有需要人工拍板的事项均已处置，项目按 AI 自动化节奏推进中。" />
        </Card>
      ) : (
        <div className="iv-list">
          {pending.map(it => {
            const t = PIV_TONE[it.tone];
            const lv = window.HOME_LEVEL[it.level];
            return (
              <div className="iv-card" key={it.id} style={{ '--iv-c': t.c }}>
                <span className="iv-card-rail" />
                <div className="iv-card-main">
                  <div className="iv-card-top">
                    <span className="iv-type" style={{ background: t.bg, color: t.c, borderColor: t.bd }}><Icon name={it.icon} size={13} color={t.c} />{it.type}</span>
                    <span className="iv-level"><Icon name={lv.icon} size={12} color="var(--text-400)" />{lv.label}</span>
                    <span className="iv-ver mono">{it.ver}</span>
                  </div>
                  <div className="iv-card-title">{it.title}</div>
                  <div className="iv-card-sub">{it.sub}</div>
                  <div className="iv-card-suggest"><Icon name="sparkles" size={13} color="var(--ai)" />{it.suggest}</div>
                </div>
                <div className="iv-card-side">
                  <span className="iv-owner"><span className="hm-owner-ava">{it.owner[0]}</span>{it.owner}</span>
                  <Button variant="primary" size="sm" icon={it.icon} onClick={() => act(it)}>{it.action}</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

Object.assign(window, { ProjectIntervene, PIV_ITEMS });
