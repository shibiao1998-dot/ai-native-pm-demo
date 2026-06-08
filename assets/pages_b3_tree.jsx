/* ============================================================
   页面 3.2 · 目标树  +  3.3 · 目标书（项目专属 · 同源切换）
   ------------------------------------------------------------
   作用：项目的五层目标体系可视化。本文件含两种呈现：
         · 思维导图画布（GoalTreeBook，当前主用）— 只读展示当前执行路径的活跃链路
         · 树/侧栏/目标书（TreeNode/TreeSidebar/GoalBook）— 早期结构，保留备用
   层级：理想化状态 → 中短期目标 → 阶段目标 → 周目标 → 执行事务。
         根基三要素（理想化状态 ∥ 核心价值 ∥ 目标用户）并行编写。
   数据：GOAL_TREE 为本文件 mock 树（导出供项目主页看板复用）；思维导图另从 HOME_* 重建。
   ============================================================ */

/* 节点状态 → 视觉映射（五态：编写中/审核中/已展示/卡点/已验收）。 */
const NODE_STATUS = {
  drafting: { label: '编写中', tone: 'neutral', icon: 'pencil-line', c: 'var(--text-500)', bg: 'var(--neutral-bg)' },
  review:   { label: '审核中', tone: 'ai', icon: 'loader-2', c: 'var(--ai)', bg: 'var(--ai-soft)', spin: true },
  shown:    { label: '已展示', tone: 'info', icon: 'eye', c: 'var(--info)', bg: 'var(--info-bg)' },
  kapian:   { label: '卡点', tone: 'warning', icon: 'alert-triangle', c: 'var(--warning)', bg: 'var(--warning-bg)' },
  accepted: { label: '已验收', tone: 'success', icon: 'circle-check', c: 'var(--success)', bg: 'var(--success-bg)' },
};

const NODE_LEVEL = {
  ideal: { label: '理想化状态', icon: 'target', short: '理想化状态' },
  value: { label: '核心价值', icon: 'gem', short: '核心价值' },
  users: { label: '目标用户', icon: 'users', short: '目标用户' },
  mid:   { label: '中短期目标', icon: 'flag', short: '中短期' },
  phase: { label: '阶段目标', icon: 'milestone', short: '阶段' },
  week:  { label: '周目标', icon: 'calendar-range', short: '周' },
  task:  { label: '执行事务', icon: 'square-check-big', short: '事务' },
};

/* ---------- 目标树数据 ----------
   树形结构：每节点含 level 层级 / status 状态 / progress 进度 / ai 负责 Agent /
   def 定义 / rel 关联节点 / audit 审核记录 / kapian 卡点（若有）/ children 子节点。
   ⚠ mock 数据：真实开发换为后端目标树接口。 */
const GOAL_TREE = [
  { id: 'ideal', level: 'ideal', title: '履约调度全面智能化，时效与成本双优', status: 'shown', progress: 72,
    ai: '调度域 · 总控', def: '项目达成后的稳定终态：履约调度由系统自驱，时效稳定 < 4h、单均成本下降 ≥ 15%、异常自愈率 ≥ 90%。是向下拆解的总锚点。',
    rel: [{ id: 'mid-a', t: '中短期：调度时效提升 30%' }, { id: 'mid-b', t: '中短期：单均成本下降 15%' }],
    audit: [ { act: '随战略「自助化优先」校准', by: 'AI · 战略对齐', date: '05-30', tone: 'info' }, { act: '管理层确认展示', by: '管理层', date: '05-09', tone: 'success' } ],
    children: [
      { id: 'mid-a', level: 'mid', title: '调度时效提升 30%', status: 'shown', progress: 78, ai: '调度域 · 时效',
        def: '在 6 个月内将区域履约平均时效较立项基线提升 30%，对应理想化状态的「时效优」分支。',
        rel: [{ id: 'ideal', t: '理想化状态（上级）' }, { id: 'phase-a1', t: '阶段：履约时效 < 4h' }, { id: 'phase-a2', t: '阶段：异常自愈率 ≥ 90%' }],
        audit: [ { act: '拆解为 2 个阶段目标', by: 'AI · 目标拆解', date: '05-12', tone: 'info' } ],
        children: [
          { id: 'phase-a1', level: 'phase', title: '履约时效 < 4h', status: 'kapian', progress: 64, ai: '调度域 · 路况',
            def: '区域履约链路端到端时效稳定低于 4 小时，高峰时段不劣化。当前因实时路况数据源未就位而阻断。',
            kapian: { reason: '路况源选型连续两次验收未通过，实时数据管道时延超标。', action: '建议放行路况源采购并要求补充高峰时段压测。' },
            rel: [{ id: 'mid-a', t: '中短期（上级）' }, { id: 'week-a1a', t: '周：接入区域实时路况' }, { id: 'week-a1b', t: '周：调度算法灰度上线' }],
            audit: [ { act: '验收未通过（第 2 次）', by: 'AI · 验收', date: '06-01', tone: 'warning' }, { act: '标记卡点并上抛介入工作台', by: '系统', date: '06-01', tone: 'warning' } ],
            children: [
              { id: 'week-a1a', level: 'week', title: '接入区域实时路况', status: 'review', progress: 55, ai: '数据域 · 接入',
                def: '完成区域实时路况数据源的选型、采购与数据管道搭建，供调度算法消费。',
                rel: [{ id: 'phase-a1', t: '阶段（上级）' }, { id: 'task-1', t: '事务：路况源选型与采购' }, { id: 'task-2', t: '事务：实时数据管道搭建' }],
                audit: [ { act: '提交审核', by: 'AI · 接入', date: '05-31', tone: 'info' } ],
                children: [
                  { id: 'task-1', level: 'task', title: '路况源选型与采购', status: 'kapian', progress: 40, ai: '采购协同 Agent',
                    def: '对比候选第三方路况 API，完成选型并发起大额采购（已触发成本审批）。',
                    kapian: { reason: '采购金额 ¥1,820,000 触发大额成本审批，待管理层拍板。', action: '前往大额成本审批处置。' },
                    rel: [{ id: 'week-a1a', t: '周（上级）' }], audit: [ { act: '触发大额成本审批', by: '系统', date: '05-30', tone: 'warning' } ] },
                  { id: 'task-2', level: 'task', title: '实时数据管道搭建', status: 'review', progress: 60, ai: '数据工程 Agent',
                    def: '搭建低时延实时数据管道，保障路况数据端到端时延 < 30s。',
                    rel: [{ id: 'week-a1a', t: '周（上级）' }], audit: [ { act: '提交审核', by: 'AI · 数据', date: '05-31', tone: 'info' } ] },
                ] },
              { id: 'week-a1b', level: 'week', title: '调度算法灰度上线', status: 'shown', progress: 70, ai: '算法域 · 调度',
                def: '调度算法以灰度方式上线，按区域与时段逐步放量并归因效果。',
                rel: [{ id: 'phase-a1', t: '阶段（上级）' }, { id: 'task-3', t: '事务：灰度策略配置' }, { id: 'task-4', t: '事务：A/B 效果归因' }],
                audit: [ { act: '展示通过', by: '管理层', date: '05-28', tone: 'success' } ],
                children: [
                  { id: 'task-3', level: 'task', title: '灰度策略配置', status: 'accepted', progress: 100, ai: '调度算法 Agent',
                    def: '配置灰度放量策略与回滚阈值，支持按区域 / 时段维度灰度。',
                    rel: [{ id: 'week-a1b', t: '周（上级）' }], audit: [ { act: '验收通过', by: 'AI · 验收', date: '05-26', tone: 'success' } ] },
                  { id: 'task-4', level: 'task', title: 'A/B 效果归因', status: 'shown', progress: 65, ai: '归因分析 Agent',
                    def: '对灰度与对照组做时效 / 成本归因，输出可解释的效果结论。',
                    rel: [{ id: 'week-a1b', t: '周（上级）' }], audit: [ { act: '展示通过', by: '管理层', date: '05-29', tone: 'success' } ] },
                ] },
            ] },
          { id: 'phase-a2', level: 'phase', title: '异常调度自愈率 ≥ 90%', status: 'shown', progress: 80, ai: '风控域 · 自愈',
            def: '调度异常（超时、失败、资源抖动）具备自动检测与自愈能力，自愈率稳定 ≥ 90%。',
            rel: [{ id: 'mid-a', t: '中短期（上级）' }, { id: 'week-a2a', t: '周：异常检测模型迭代' }],
            audit: [ { act: '展示通过', by: '管理层', date: '05-27', tone: 'success' } ],
            children: [
              { id: 'week-a2a', level: 'week', title: '异常检测模型迭代', status: 'accepted', progress: 100, ai: '风控建模 Agent',
                def: '迭代异常检测模型，提升召回与时效，降低误报。',
                rel: [{ id: 'phase-a2', t: '阶段（上级）' }, { id: 'task-5', t: '事务：特征工程优化' }],
                audit: [ { act: '验收通过', by: 'AI · 验收', date: '05-24', tone: 'success' } ],
                children: [
                  { id: 'task-5', level: 'task', title: '特征工程优化', status: 'accepted', progress: 100, ai: '特征工程 Agent',
                    def: '补充时序与空间特征，提升异常检测模型表现。',
                    rel: [{ id: 'week-a2a', t: '周（上级）' }], audit: [ { act: '验收通过', by: 'AI · 验收', date: '05-22', tone: 'success' } ] },
                ] },
            ] },
        ] },
      { id: 'mid-b', level: 'mid', title: '单均调度成本下降 15%', status: 'shown', progress: 66, ai: '成本域 · 优化',
        def: '在保障时效的前提下，将单均调度成本较立项基线下降 ≥ 15%，对应理想化状态的「成本优」分支。',
        rel: [{ id: 'ideal', t: '理想化状态（上级）' }, { id: 'phase-b1', t: '阶段：算力成本优化' }],
        audit: [ { act: '拆解为 1 个阶段目标', by: 'AI · 目标拆解', date: '05-14', tone: 'info' } ],
        children: [
          { id: 'phase-b1', level: 'phase', title: '算力成本优化', status: 'review', progress: 48, ai: '成本域 · 算力',
            def: '通过推理资源弹性调度与模型轻量化，降低单均算力成本。',
            rel: [{ id: 'mid-b', t: '中短期（上级）' }, { id: 'week-b1a', t: '周：推理资源弹性调度' }],
            audit: [ { act: '提交审核', by: 'AI · 成本', date: '05-30', tone: 'info' } ],
            children: [
              { id: 'week-b1a', level: 'week', title: '推理资源弹性调度', status: 'drafting', progress: 20, ai: '算力调度 Agent',
                def: '按负载弹性伸缩推理资源，高峰扩容、低谷回收，降低闲置成本。',
                rel: [{ id: 'phase-b1', t: '阶段（上级）' }, { id: 'task-6', t: '事务：配额弹性策略' }],
                audit: [ { act: '开始编写', by: 'AI · 算力', date: '05-31', tone: 'neutral' } ],
                children: [
                  { id: 'task-6', level: 'task', title: '配额弹性策略', status: 'drafting', progress: 15, ai: '算力调度 Agent',
                    def: '定义推理配额的弹性伸缩规则与成本上限。',
                    rel: [{ id: 'week-b1a', t: '周（上级）' }], audit: [ { act: '开始编写', by: 'AI · 算力', date: '05-31', tone: 'neutral' } ] },
                ] },
            ] },
        ] },
    ] },
  { id: 'value', level: 'value', title: '核心价值', status: 'shown', progress: 100, ai: '战略对齐',
    def: '把调度从「人盯人」升级为「系统自驱」，释放调度人力；时效与成本双优改善单位经济模型；沉淀可复用的智能调度中台能力。',
    rel: [{ id: 'ideal', t: '理想化状态（并行根基）' }, { id: 'users', t: '目标用户（并行根基）' }],
    audit: [ { act: '补充「能力外溢」价值', by: 'AI · 战略对齐', date: '05-30', tone: 'info' } ] },
  { id: 'users', level: 'users', title: '目标用户', status: 'shown', progress: 100, ai: '战略对齐',
    def: '区域履约调度团队（转为审核与例外处置）、履约运营负责人（关注时效与成本）、一线履约人员（接收更合理调度指令）。',
    rel: [{ id: 'ideal', t: '理想化状态（并行根基）' }, { id: 'value', t: '核心价值（并行根基）' }],
    audit: [ { act: '细化一线人员诉求', by: 'AI · 战略对齐', date: '05-22', tone: 'info' } ] },
];

/* 扁平化索引：递归把树展平为 NODE_MAP[id]→节点，供关联跳转、反查。 */
const NODE_MAP = {};
(function flatten(nodes) { nodes.forEach(n => { NODE_MAP[n.id] = n; if (n.children) flatten(n.children); }); })(GOAL_TREE);

const AUDIT_TONE = { info: 'var(--info)', success: 'var(--success)', warning: 'var(--warning)', neutral: 'var(--text-400)' };
const PROG_COLOR = (s) => s === 'kapian' ? 'var(--warning)' : s === 'accepted' ? 'var(--success)' : s === 'review' ? 'var(--ai)' : 'var(--blue-primary)';

/* ---------- 树节点（递归） ----------
   TreeNode：可展折的树行。hasKids 决定是否显示展折按钮；isOpen 默认展开（expanded[id]!==false）。
   交互：onToggle 展折；onSelect 选中（高亮并在侧栏显详情）。 */
function TreeNode({ node, depth, expanded, onToggle, selected, onSelect }) {
  const lvl = NODE_LEVEL[node.level];
  const st = NODE_STATUS[node.status];
  const hasKids = node.children && node.children.length > 0;
  const isOpen = expanded[node.id] !== false; // 默认展开
  return (
    <div className="gt-node">
      <div className={`gt-node-row${depth > 0 ? ' child' : ''}`}>
        {hasKids
          ? <button className="gt-toggle" onClick={() => onToggle(node.id)} aria-label="展开折叠"><Icon name={isOpen ? 'minus' : 'plus'} size={13} color="var(--text-500)" /></button>
          : <span className="gt-toggle placeholder" />}
        <button className="gt-card" data-sel={selected === node.id} data-kapian={node.status === 'kapian'} onClick={() => onSelect(node.id)}>
          <span className="gt-card-ico" style={{ background: st.bg }}><Icon name={lvl.icon} size={17} color={st.c} /></span>
          <span className="gt-card-main">
            <span className="gt-card-level">{lvl.label}</span>
            <span className="gt-card-title">{node.title}</span>
          </span>
          <span className="gt-card-meta">
            <span className="pill" style={{ background: st.bg, color: st.c, padding: '2px 8px', fontSize: 12 }}>
              <Icon name={st.icon} size={12} color={st.c} className={st.spin ? 'spin' : ''} />{st.label}
            </span>
            <span className="gt-ai-staff"><span className="av">{node.ai[0]}</span>{node.ai}</span>
            <Ring value={node.progress} size={34} stroke={4} color={PROG_COLOR(node.status)} animate={false} />
          </span>
        </button>
      </div>
      {hasKids && isOpen && (
        <div className="gt-children">
          {node.children.map(c => (
            <TreeNode key={c.id} node={c} depth={depth + 1} expanded={expanded} onToggle={onToggle} selected={selected} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- 详情侧栏 ----------
   TreeSidebar：选中节点的详情（定义/进度/关联/审核记录）。
   交互：有卡点时显「卡点处置」+（AI 模式下）「介入工作台」按钮；「进入逐环审核」跳复盘。
   未选中时显示空态提示。 */
function TreeSidebar({ node, onSelect, onJumpKapian, onEnterReview, onEnterKapian, aiMode }) {
  if (!node) {
    return (
      <div className="gt-side">
        <div className="gt-side-empty">
          <EmptyState glyph="mouse-pointer-click" title="选择一个目标节点" desc="点击左侧任一节点，查看其定义、状态、关联、审核记录与推进度。" />
        </div>
      </div>
    );
  }
  const lvl = NODE_LEVEL[node.level];
  const st = NODE_STATUS[node.status];
  return (
    <div className="gt-side">
      <div className="gt-side-head">
        <span className="gt-side-level"><Icon name={lvl.icon} size={13} color="var(--blue-primary)" />{lvl.label}</span>
        <div className="gt-side-title">{node.title}</div>
        <div className="gt-side-pills">
          <span className="pill" style={{ background: st.bg, color: st.c }}><Icon name={st.icon} size={13} color={st.c} className={st.spin ? 'spin' : ''} />{st.label}</span>
          <span className="gt-ai-staff"><span className="av">{node.ai[0]}</span>{node.ai}</span>
        </div>
      </div>

      {node.kapian && (
        <div className="gt-side-kapian">
          <div className="gt-side-kapian-head"><Icon name="alert-triangle" size={15} color="var(--warning)" />卡点</div>
          <div className="gt-side-kapian-body">{node.kapian.reason}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="primary" size="sm" icon="alert-triangle" onClick={onEnterKapian}>卡点处置</Button>
            {aiMode && <Button variant="secondary" size="sm" icon="arrow-up-right" onClick={onJumpKapian}>介入工作台</Button>}
          </div>
        </div>
      )}

      <div className="gt-side-sec" style={{ padding: '0 18px', marginTop: 4, marginBottom: 16 }}>
        <Button variant={node.kapian ? 'secondary' : 'primary'} size="sm" icon="shield-check" onClick={onEnterReview} style={{ width: '100%', justifyContent: 'center' }}>进入逐环审核</Button>
      </div>

      <div className="gt-side-body">
        <div className="gt-side-sec">
          <div className="gt-side-sec-label">定义</div>
          <div className="gt-side-def">{node.def}</div>
        </div>

        <div className="gt-side-sec">
          <div className="gt-side-sec-label">推进度</div>
          <div className="gt-prog-row">
            <span className="gt-prog-bar"><span className="gt-prog-fill" style={{ width: node.progress + '%', background: PROG_COLOR(node.status) }} /></span>
            <span className="gt-prog-n">{node.progress}%</span>
          </div>
        </div>

        {node.rel && (
          <div className="gt-side-sec">
            <div className="gt-side-sec-label">关联节点</div>
            <div className="gt-rel">
              {node.rel.map((r, i) => (
                <div className="gt-rel-item" key={i} onClick={() => NODE_MAP[r.id] && onSelect(r.id)}>
                  <Icon name="git-fork" size={14} color="var(--text-400)" />
                  <span style={{ minWidth: 0 }}>{r.t}</span>
                  <Icon name="arrow-right" size={13} color="var(--text-400)" className="arr" />
                </div>
              ))}
            </div>
          </div>
        )}

        {node.audit && (
          <div className="gt-side-sec">
            <div className="gt-side-sec-label">审核记录</div>
            <div className="gt-audit">
              {node.audit.map((a, i) => (
                <div className="gt-audit-item" key={i}>
                  <span className="gt-audit-dot" style={{ background: AUDIT_TONE[a.tone] }} />
                  <div className="gt-audit-main">
                    <div className="gt-audit-act">{a.act}</div>
                    <div className="gt-audit-meta">{a.by} · <span className="mono">{a.date}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 目标书 ----------
   GoalBook：目标树的文档化互补形态（大纲 + 文档正文 + 双向链接），与树同源。
   交互：点大纲/双向链 scrollTo 定位到对应元素并高亮；selected 变化时闪烁提醒（flash）。 */
function GoalBook({ selected, onSelect }) {
  const flashRef = React.useRef(null);
  React.useEffect(() => {
    if (!selected) return;
    const el = document.getElementById('gb-' + selected);
    if (el) {
      el.scrollIntoView ? el.classList.add('flash') : null;
      const t = setTimeout(() => el.classList.remove('flash'), 1400);
      return () => clearTimeout(t);
    }
  }, [selected]);

  // 大纲：根 + 中短期
  const outline = [
    { id: 'ideal', label: '理想化状态', lv: 1 },
    { id: 'mid-a', label: '调度时效提升 30%', lv: 2 },
    { id: 'mid-b', label: '单均成本下降 15%', lv: 2 },
    { id: 'value', label: '核心价值', lv: 1 },
    { id: 'users', label: '目标用户', lv: 1 },
  ];

  const scrollTo = (id) => {
    onSelect(id);
    const el = document.getElementById('gb-' + id);
    if (el) { const c = el.closest('.content'); if (c) c.scrollTop = el.offsetTop - 80; }
  };

  const Element = ({ node, h }) => {
    const lvl = NODE_LEVEL[node.level];
    const st = NODE_STATUS[node.status];
    return (
      <div className="gb-el" id={'gb-' + node.id} data-sel={selected === node.id}>
        <div className="gb-el-head">
          <Icon name={lvl.icon} size={16} color={st.c} />
          <span className="gb-el-title">{node.title}</span>
          <span className="gb-el-badges">
            <span className="pill" style={{ background: st.bg, color: st.c, fontSize: 12, padding: '2px 8px' }}><Icon name={st.icon} size={12} color={st.c} className={st.spin ? 'spin' : ''} />{st.label}</span>
            <span className="gb-el-prog"><span className="b"><span style={{ width: node.progress + '%', background: PROG_COLOR(node.status) }} /></span><span className="mono">{node.progress}%</span></span>
          </span>
        </div>
        <div className="gb-el-def">{node.def}</div>
        {node.rel && (
          <div className="gb-links">
            <div className="gb-links-label">关联内容 · 双向链接</div>
            <div className="gb-link-chips">
              {node.rel.map((r, i) => (
                <span className="gb-link-chip" key={i} onClick={() => NODE_MAP[r.id] && scrollTo(r.id)}>
                  <Icon name="link" size={12} color="var(--text-500)" />{r.t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const ideal = NODE_MAP['ideal'];
  return (
    <div className="gb-layout">
      <nav className="gb-outline">
        <div className="gb-outline-title">大纲</div>
        {outline.map(o => (
          <button key={o.id} className={`gb-outline-item${o.lv === 2 ? ' lv2' : ''}`} data-on={selected === o.id} onClick={() => scrollTo(o.id)}>
            {o.lv === 1 && <span className="gb-out-dot" style={{ background: NODE_STATUS[NODE_MAP[o.id].status].c }} />}
            {o.label}
          </button>
        ))}
      </nav>

      <article className="gb-doc">
        <h1 className="gb-doc-title">智能履约调度中台 · 目标书</h1>
        <div className="gb-doc-sub">
          <span className="mono">PRJ-2026-0137</span>
          <span>·</span><span>v2.3</span>
          <span>·</span><span>目标树的文档化互补形态，与目标树同源</span>
        </div>
        <div className="gb-doc-divider" />

        {/* 根基三要素 */}
        <h2 className="gb-h2"><span className="gb-h2-ico" style={{ background: 'var(--blue-tint)' }}><Icon name="target" size={17} color="var(--blue-primary)" /></span>一、理想化状态（根基）</h2>
        <Element node={ideal} />

        <h2 className="gb-h2"><span className="gb-h2-ico" style={{ background: 'var(--success-bg)' }}><Icon name="gem" size={17} color="var(--success)" /></span>二、核心价值（根基）</h2>
        <Element node={NODE_MAP['value']} />

        <h2 className="gb-h2"><span className="gb-h2-ico" style={{ background: 'var(--ai-soft)' }}><Icon name="users" size={17} color="var(--ai)" /></span>三、目标用户（根基）</h2>
        <Element node={NODE_MAP['users']} />

        <div className="gb-doc-divider" />

        {/* 拆解链 */}
        <h2 className="gb-h2"><span className="gb-h2-ico" style={{ background: 'var(--info-bg)' }}><Icon name="git-fork" size={17} color="var(--info)" /></span>四、目标拆解链</h2>
        {ideal.children.map(mid => (
          <React.Fragment key={mid.id}>
            <h3 className="gb-h3" id={'gb-h-' + mid.id}>中短期目标 · {mid.title}</h3>
            <Element node={mid} />
            {mid.children.map(phase => (
              <React.Fragment key={phase.id}>
                <Element node={phase} />
                {phase.children && phase.children.map(week => <Element key={week.id} node={week} />)}
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </article>
    </div>
  );
}

/* ---------- 目标树主页面（含 树↔书 同源切换） ----------
   目标树（重构）· 当前执行路径的实时只读视图。
   仅展示「当前中短期版本 → 执行中阶段 → 当前周 → 当前事务」的活跃链路。
   与项目主页同源（HOME_*）；纯展示，详情点开看；操作剥离至介入工作台。 */
/* 五级层级元信息：理想化状态 → 中短期目标 → 阶段结项目标 → 周计划 → 事务 */
const MM_LV = {
  ideal: { tag: '理想化状态', c: '#1E3A8A', icon: 'target' },
  mid:   { tag: '中短期目标', c: '#2563EB', icon: 'flag' },
  phase: { tag: '阶段结项目标', c: '#1D4ED8', icon: 'milestone' },
  week:  { tag: '周计划', c: '#0E7490', icon: 'calendar-range' },
  task:  { tag: '事务', c: '#475569', icon: 'square-check-big' },
};
/* 进度 → 状态（执行中 / 已完成 / 已验收 / 未开始） */
function mmStatus(node) {
  if (node.status) {
    const map = { draft: '未开始', run: '执行中', kapian: '卡点', accepted: '已验收' };
    const c = window.HOME_STATUS[node.status] ? window.HOME_STATUS[node.status].c : 'var(--text-400)';
    return { label: map[node.status] || node.status, c };
  }
  const pr = node.prog || 0;
  if (pr >= 100) return { label: '已验收', c: 'var(--success)' };
  if (pr > 0) return { label: '执行中', c: 'var(--ai)' };
  return { label: '未开始', c: 'var(--text-400)' };
}

/* GoalTreeBook — 目标树思维导图页主体。
   数据构建：useMemo 从 HOME_IDEAL/MID/PHASE/WEEK 重建一棵完整五级树（root→ideal→mid→phase→week→task），
     同时产出 edges（连线关系）。IDEAL_MIDS 是「理想态→中短期」的归属映射。
   关键交互：
     · open(node)：点节点 → 按层级组装 detail 并开详情抽屉（复用 GoalDetail）。
     · computeLinks：基于真实 DOM 测量每个节点位置，算出 SVG 贝塞尔连线的起止点（随布局/缩放/resize 重算）。
     · 拖拽平移：onDown/onMove/onUp 记录指针位移改 scrollLeft/Top；guard() 防止「拖动中误触发点击」。
     · centerOnRoot：首次加载把根节点居中。 */
function GoalTreeBook({ project, onNavigate }) {
  const [loading, setLoading] = React.useState(true);
  const [detail, setDetail] = React.useState(null);
  const [sel, setSel] = React.useState(null);
  const p = { ...window.PROJECT_META, ...(project || {}) };
  const GoalDetail = window.GoalDetail;

  const canvasRef = React.useRef(null);
  const innerRef = React.useRef(null);
  const nodeRefs = React.useRef({});
  const [links, setLinks] = React.useState([]);

  React.useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);
  React.useEffect(() => { refreshIcons(); });

  // —— 仅展示当前版本，构建完整五级树：项目 → 理想化状态 → 中短期 → 阶段结项 → 周计划 → 事务 ——
  const quarter = '1.0';
  const qv = window.MID_VERSIONS.find(v => v.id === quarter) || window.MID_VERSIONS[0];

  const { rootNode, edges } = React.useMemo(() => {
    const ideals = window.HOME_IDEAL.items;
    const mids = window.HOME_MID.byVer[quarter] || [];
    const midById = {}; mids.forEach(m => (midById[m.id] = m));
    // 理想化状态 → 中短期目标 归属
    const IDEAL_MIDS = { 'idl-1': ['mid-c'], 'idl-2': ['mid-a'], 'idl-3': ['mid-b'], 'idl-4': ['mid-d'], 'idl-5': [], 'idl-6': [], 'idl-7': [] };
    // 全局索引：阶段结项 / 周计划
    const phaseIndex = {}; Object.values(window.HOME_PHASE.byVer).forEach(v => v.items.forEach(ph => (phaseIndex[ph.id] = ph)));
    const weekIndex = {}; Object.values(window.HOME_WEEK.byWeek).forEach(v => v.items.forEach(w => (weekIndex[w.id] = w)));

    const buildTask = (t, pk) => ({ key: pk + '/t-' + t.id, level: 'task', title: t.title, prog: t.prog, status: t.status, ai: t.ai, bound: t.bound, raw: t, children: [] });
    const buildWeek = (w, pk) => { const key = pk + '/w-' + w.id; return { key, level: 'week', title: w.title, imp: w.imp, prog: w.prog, status: w.status, raw: w, children: (w.tasks || []).map(t => buildTask(t, key)) }; };
    const buildPhase = (ph, pk) => { const key = pk + '/p-' + ph.id; return { key, level: 'phase', title: ph.title, imp: ph.imp, prog: ph.prog, status: ph.status, raw: ph, children: (ph.down || []).map(d => weekIndex[d.id]).filter(Boolean).map(w => buildWeek(w, key)) }; };
    const buildMid = (m, pk) => { const key = pk + '/m-' + m.id; return { key, level: 'mid', title: m.title, imp: m.imp, prog: m.prog, raw: m, children: (m.down || []).map(d => phaseIndex[d.id]).filter(Boolean).map(ph => buildPhase(ph, key)) }; };
    const buildIdeal = (idl) => { const key = 'i-' + idl.id; return { key, level: 'ideal', title: idl.text, imp: idl.imp, prog: idl.prog, raw: idl, children: (IDEAL_MIDS[idl.id] || []).map(id => midById[id]).filter(Boolean).map(m => buildMid(m, key)) }; };

    const root = { key: 'root', level: 'root', children: ideals.map(buildIdeal) };
    const eds = [];
    const walk = (n) => n.children.forEach(c => { eds.push({ from: n.key, to: c.key, level: c.level }); walk(c); });
    walk(root);
    return { rootNode: root, edges: eds };
  }, [quarter]);

  const open = (node) => {
    setSel(node.key);
    const r = node.raw;
    if (node.level === 'ideal') {
      setDetail({ level: 'ideal', title: r.text, imp: r.imp, prog: r.prog, def: r.def,
        meta: [{ k: '所属分类', v: r.cat }],
        note: '理想化状态是层层向下拆解（中短期目标 → 阶段结项目标 → 周计划 → 事务）的总锚点。',
        down: node.children.map(c => ({ level: 'mid', title: c.title })) });
    } else if (node.level === 'mid') {
      setDetail({ level: 'mid', title: r.title, imp: r.imp, prog: r.prog, def: r.def,
        meta: [{ k: '时间周期', v: qv.range, mono: true }, { k: '当前版本', v: 'v' + quarter, mono: true }, { k: '负责人', v: r.owner }],
        up: r.up, down: r.down });
    } else if (node.level === 'phase') {
      setDetail({ level: 'phase', title: r.title, imp: r.imp, prog: r.prog, def: r.title, status: r.status, kapian: r.kapian,
        meta: [{ k: '来源中短期', v: 'v' + r.source.ver, mono: true }, { k: '负责人', v: r.owner }],
        up: r.up, down: r.down });
    } else if (node.level === 'week') {
      setDetail({ level: 'week', title: r.title, imp: r.imp, prog: r.prog, def: r.steps, status: r.status,
        meta: [{ k: '承接阶段', v: 'v' + r.source.ver, mono: true }],
        up: r.up, tasks: r.tasks });
    } else {
      setDetail({ level: 'task', title: r.title, prog: r.prog, status: r.status,
        meta: [{ k: '执行 AI', v: r.ai }, { k: '绑定状态', v: r.bound ? '已绑定' : '待绑定' }] });
    }
  };
  const close = () => { setDetail(null); setSel(null); };

  // —— 连线计算（基于真实 DOM 测量）——
  const computeLinks = React.useCallback(() => {
    const inner = innerRef.current; if (!inner) return;
    const ib = inner.getBoundingClientRect();
    const out = [];
    edges.forEach(e => {
      const a = nodeRefs.current[e.from], b = nodeRefs.current[e.to];
      if (!a || !b) return;
      const ab = a.getBoundingClientRect(), bb = b.getBoundingClientRect();
      out.push({ id: e.from + '>' + e.to, level: e.level,
        x1: ab.right - ib.left, y1: ab.top + ab.height / 2 - ib.top,
        x2: bb.left - ib.left, y2: bb.top + bb.height / 2 - ib.top });
    });
    setLinks(out);
  }, [edges]);

  // 初始定位：让根节点（项目）落在可视区左侧中部
  const centered = React.useRef(false);
  const centerOnRoot = React.useCallback(() => {
    const c = canvasRef.current, inner = innerRef.current, root = nodeRefs.current['root'];
    if (!c || !inner || !root || centered.current) return;
    const ib = inner.getBoundingClientRect(), rb = root.getBoundingClientRect();
    const ry = rb.top + rb.height / 2 - ib.top;
    c.scrollTop = Math.max(0, ry - c.clientHeight / 2);
    c.scrollLeft = 0;
    centered.current = true;
  }, []);

  React.useLayoutEffect(() => {
    if (loading) return;
    const raf = requestAnimationFrame(() => { computeLinks(); centerOnRoot(); });
    const t1 = setTimeout(() => { computeLinks(); centerOnRoot(); }, 260);
    const t2 = setTimeout(computeLinks, 650);
    const ro = new ResizeObserver(computeLinks);
    if (innerRef.current) ro.observe(innerRef.current);
    window.addEventListener('resize', computeLinks);
    return () => { cancelAnimationFrame(raf); clearTimeout(t1); clearTimeout(t2); ro.disconnect(); window.removeEventListener('resize', computeLinks); };
  }, [loading, computeLinks]);

  // —— 拖拽平移 ——
  const pan = React.useRef({ down: false, x: 0, y: 0, sl: 0, st: 0, moved: false });
  const onDown = (e) => { const c = canvasRef.current; if (!c) return; pan.current = { down: true, x: e.clientX, y: e.clientY, sl: c.scrollLeft, st: c.scrollTop, moved: false }; c.classList.add('grabbing'); };
  const onMove = (e) => { if (!pan.current.down) return; const c = canvasRef.current; if (!c) return; const dx = e.clientX - pan.current.x, dy = e.clientY - pan.current.y; if (Math.abs(dx) + Math.abs(dy) > 4) pan.current.moved = true; c.scrollLeft = pan.current.sl - dx; c.scrollTop = pan.current.st - dy; };
  const onUp = () => { pan.current.down = false; const c = canvasRef.current; if (c) c.classList.remove('grabbing'); };
  const guard = (fn) => () => { if (pan.current.moved) return; fn(); };

  const linkPath = (l) => { const dx = Math.max(24, Math.abs(l.x2 - l.x1) * 0.5); return `M ${l.x1} ${l.y1} C ${l.x1 + dx} ${l.y1}, ${l.x2 - dx} ${l.y2}, ${l.x2} ${l.y2}`; };

  const NodeCard = ({ node }) => {
    const lv = MM_LV[node.level];
    const st = node.level === 'ideal' ? null : mmStatus(node);
    const pc = window.progColor(node.prog || 0);
    return (
      <button className="mm-node" data-level={node.level} data-on={sel === node.key}
        ref={el => (nodeRefs.current[node.key] = el)} style={{ '--lc': lv.c }} onClick={guard(() => open(node))}>
        <span className="mm-head">
          <span className="mm-tag" style={{ color: lv.c, background: `color-mix(in srgb, ${lv.c} 11%, #fff)` }}>
            <Icon name={lv.icon} size={11} color={lv.c} />{lv.tag}
          </span>
          {st && <span className="mm-st" style={{ color: st.c }}><i className="mm-dot" style={{ background: st.c }} />{st.label}</span>}
        </span>
        <span className="mm-text">{node.title}</span>
        {node.level === 'task' &&
          <span className="mm-ai"><span className="mm-ava">{node.ai[0]}</span>{node.ai}</span>}
        <span className="mm-foot">
          {node.imp != null ? <span className="mm-imp mono">重要度 {node.imp}</span> : <span />}
          {node.prog != null &&
            <span className="mm-prog">
              <span className="mm-prog-bar"><i style={{ width: node.prog + '%', background: pc }} /></span>
              <span className="mm-prog-n mono" style={{ color: pc }}>{node.prog}%</span>
            </span>}
        </span>
      </button>
    );
  };

  const Branch = ({ node }) => (
    <div className="mm-branch">
      {node.level === 'root'
        ? <div className="mm-node mm-root" ref={el => (nodeRefs.current['root'] = el)}>
            <span className="mm-root-badge"><Icon name="folder-tree" size={12} color="#fff" />项目</span>
            <span className="mm-root-name">{p.name}</span>
          </div>
        : <NodeCard node={node} />}
      {node.children.length > 0 &&
        <div className="mm-kids">{node.children.map(c => <Branch key={c.key} node={c} />)}</div>}
    </div>
  );

  if (loading) {
    return (
      <div className="content-inner page-fade">
        <Breadcrumb items={[{ label: p.name }, { label: '目标树' }]} />
        <Card style={{ padding: 24, marginTop: 8 }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{ marginLeft: i * 18, marginBottom: 14 }}><Skel w={`${Math.max(40, 86 - i * 10)}%`} h={56} r={10} /></div>
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: p.name }, { label: '目标树' }]} />
      <div className="gtree-head">
        <div className="gtree-head-l">
          <span className="page-head-ico"><Icon name="git-fork" size={22} color="var(--blue-primary)" /></span>
          <h1 className="t-h1">目标树</h1>
          <span className="gtree-live"><span className="gtree-live-dot" />实时执行视图</span>
        </div>
        <div className="gtree-head-r">
          <span className="gtree-ctxchip mono"><Icon name="git-commit-horizontal" size={13} color="var(--blue-primary)" />当前版本 v{quarter} · {qv.q}</span>
          <Button variant="secondary" size="sm" icon="arrow-up-right" onClick={() => onNavigate && onNavigate('p-intervene')}>介入工作台</Button>
        </div>
      </div>

      <div className="mm-legend">
        {['ideal', 'mid', 'phase', 'week', 'task'].map(k => (
          <span key={k}><i className="mm-lg-dot" style={{ background: MM_LV[k].c }} />{MM_LV[k].tag}</span>
        ))}
        <span className="mm-legend-hint"><Icon name="move" size={13} color="var(--text-400)" />可拖拽平移 · 点击节点看详情</span>
      </div>

      <div className="mm-canvas" ref={canvasRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
        <div className="mm-inner" ref={innerRef}>
          <svg className="mm-links" xmlns="http://www.w3.org/2000/svg">
            {links.map(l => (<path key={l.id} d={linkPath(l)} className="mm-link" data-level={l.level} />))}
          </svg>
          <Branch node={rootNode} />
        </div>
      </div>

      {GoalDetail && <GoalDetail detail={detail} onClose={close} />}
    </div>
  );
}

Object.assign(window, { GoalTreeBook, GOAL_TREE, NODE_MAP, NODE_STATUS, NODE_LEVEL, PROG_COLOR, AUDIT_TONE });
