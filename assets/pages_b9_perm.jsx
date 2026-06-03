/* ============================================================
   批 9 · 页面 9.3 · 权限系统（RBAC · 组合级治理）
   模型：角色 = 权限模板，集中维护；成员 = 被赋予角色标签，自动继承该角色权限。
   · 上：四个角色卡片 = 各自的「权限模板维护入口」（编辑该角色的查看 / 编辑权限 + 工作台准入）。
   · 下：成员表（可检索）= 为每个成员分配角色；成员权限随角色走，只读展示。
   · 主开关：精细化权限控制 —— 开启后可维护角色模板并分配角色。
   ============================================================ */

const PM_PERSONAS = [
  { id: 'admin', name: '管理层', sub: '全平台最高权限 · 超级管理员', icon: 'shield-check', workbench: true,
    c: 'var(--blue-primary)', bg: 'var(--blue-tint)', badge: 'ADMIN', badgeBg: 'var(--blue-tint)', badgeC: 'var(--blue-deep)' },
  { id: 'pflead', name: '项目集负责人', sub: '管自己的项目集', icon: 'folder-kanban', workbench: true,
    c: '#7C3AED', bg: '#F1ECFE', badge: 'PF-LEAD', badgeBg: '#F1ECFE', badgeC: '#6D28D9' },
  { id: 'projlead', name: '项目负责人', sub: '只进专属工作台', icon: 'user-cog', workbench: false,
    c: 'var(--success)', bg: 'var(--success-bg)', badge: 'PROJ-LEAD', badgeBg: 'var(--success-bg)', badgeC: 'var(--success)' },
  { id: 'viewer', name: '查看者', sub: '只读浏览', icon: 'eye', workbench: false,
    c: 'var(--text-500)', bg: 'var(--neutral-bg)', badge: 'VIEWER', badgeBg: 'var(--neutral-bg)', badgeC: 'var(--text-500)' },
];
const PM_PERSONA_MAP = Object.fromEntries(PM_PERSONAS.map(p => [p.id, p]));
const PM_AVATAR_C = { admin: 'var(--blue-primary)', pflead: '#7C3AED', projlead: 'var(--success)', viewer: 'var(--text-400)' };

/* 权限资源 —— 取自已建成的工作台模块 */
const PM_RES = [
  { group: '组合级 · 项目管理工作台', icon: 'layout-dashboard', items: [
    { id: 'intervene', t: '介入处置', s: '决策 / 卡点 / 问题 / 审批', scoped: true },
    { id: 'charter', t: '立项与战略', s: '备选池 / 自动立项 / 战略意图' },
    { id: 'cost', t: '算力与成本看板', s: '组合级费用与配额' },
    { id: 'staff', t: 'AI 员工与技能', s: 'AI 项目操作 / 技能迭代' },
    { id: 'knowledge', t: '知识库', s: '经验与决策沉淀' },
    { id: 'rules', t: '规则与留痕', s: '规则确认 / 审计追溯' },
    { id: 'perm', t: '权限管理', s: '角色模板与成员分配' },
  ] },
  { group: '项目级 · 专属工作台', icon: 'box', items: [
    { id: 'p-goal', t: '目标拆解与目标树', s: '' },
    { id: 'p-exec', t: '执行事务', s: '' },
    { id: 'p-accept', t: '验收与闭环', s: '' },
    { id: 'p-risk', t: '风险与卡点', s: '' },
    { id: 'p-close', t: '结项', s: '' },
    { id: 'p-cost', t: '项目费用', s: '' },
  ] },
];
const PM_RES_FLAT = PM_RES.flatMap(g => g.items);
const PM_COMBO_IDS = PM_RES[0].items.map(i => i.id);
const PM_PROJ_IDS = PM_RES[1].items.map(i => i.id);

/* 角色默认权限模板：none | view | edit（edit 含 view） */
function pmDefaultPerms(roleId) {
  const all = {};
  PM_RES_FLAT.forEach(it => all[it.id] = 'none');
  if (roleId === 'admin') {
    PM_RES_FLAT.forEach(it => all[it.id] = 'edit');
  } else if (roleId === 'pflead') {
    all.intervene = 'edit'; all.charter = 'view'; all.cost = 'view'; all.staff = 'edit';
    all.knowledge = 'edit'; all.rules = 'view'; all.perm = 'none';
    PM_PROJ_IDS.forEach(id => all[id] = 'edit');
  } else if (roleId === 'projlead') {
    PM_PROJ_IDS.forEach(id => all[id] = 'edit');
  } else if (roleId === 'viewer') {
    all.knowledge = 'view'; all.cost = 'view';
    PM_PROJ_IDS.forEach(id => all[id] = 'view');
  }
  return all;
}

const PM_MEMBERS = [
  { name: '陈航', short: '陈', id: 'U-1001', role: 'admin', title: '组合负责人', pf: null },
  { name: '苏婧', short: '苏', id: 'U-1042', role: 'pflead', title: '客户服务自助化', pf: 'service' },
  { name: '何沛', short: '何', id: 'U-1078', role: 'pflead', title: '履约与供应链', pf: 'fulfill' },
  { name: '林越', short: '林', id: 'U-1057', role: 'pflead', title: '增长与营销', pf: 'growth' },
  { name: '周岚', short: '周', id: 'U-1063', role: 'pflead', title: '数据与财务中台', pf: 'data' },
  { name: '高远', short: '高', id: 'U-1112', role: 'projlead', title: '区域运力预测引擎', pf: 'fulfill', projects: [['区域运力预测引擎', 'PRJ-2026-0151']] },
  { name: '吴桐', short: '吴', id: 'U-1120', role: 'projlead', title: '财务凭证识别', pf: 'data', projects: [['财务凭证识别', 'PRJ-2026-0118']] },
  { name: '沈黎', short: '沈', id: 'U-1126', role: 'projlead', title: '营销内容生成平台', pf: 'growth', projects: [['营销内容生成平台', 'PRJ-2026-0144']] },
  { name: '郑可', short: '郑', id: 'U-1090', role: 'viewer', title: '业务观察员', pf: null },
  { name: '陈屿', short: '陈', id: 'U-1095', role: 'viewer', title: '财务审阅', pf: null },
];

const PM_ROLE_FILTERS = [
  { id: 'all', label: '全部成员' },
  { id: 'admin', label: '管理层' },
  { id: 'pflead', label: '项目集负责人' },
  { id: 'projlead', label: '项目负责人' },
  { id: 'viewer', label: '查看者' },
];

function pmRolePill(role) {
  const p = PM_PERSONA_MAP[role];
  return <span className="pm-role-pill" style={{ color: p.badgeC, background: p.badgeBg }}><Icon name={p.icon} size={13} color={p.badgeC} />{p.name}</span>;
}
function pmCount(perms, ids) {
  let edit = 0, view = 0;
  ids.forEach(id => { if (perms[id] === 'edit') edit++; else if (perms[id] === 'view') view++; });
  return { edit, view };
}

/* ---------- 权限矩阵（角色编辑 / 成员只读共用） ---------- */
function PermMatrix({ perms, wb, scopedRole, editable, onToggle }) {
  React.useEffect(() => { refreshIcons(); });
  const cell = (resId, kind) => {
    const v = perms[resId];
    const on = kind === 'view' ? (v === 'view' || v === 'edit') : v === 'edit';
    return (
      <button className="pm-check" data-on={on} data-kind={kind} disabled={!editable}
        onClick={() => editable && onToggle(resId, kind)} aria-label={kind}>
        {on && <Icon name="check" size={14} color="#fff" />}
      </button>
    );
  };
  return (
    <div className="pm-matrix">
      <div className="pm-matrix-head">
        <span className="lbl">资源 / 模块</span>
        <span className="c view">查看</span>
        <span className="c edit">编辑</span>
      </div>
      {PM_RES.map(g => (
        <React.Fragment key={g.group}>
          <div className="pm-matrix-group-t"><Icon name={g.icon} size={13} color="var(--text-500)" />{g.group}</div>
          {g.items.map(it => {
            const blockedCombo = !wb && PM_COMBO_IDS.includes(it.id);
            return (
              <div className="pm-matrix-row" key={it.id}>
                <div>
                  <div className="pm-matrix-name">{it.t}</div>
                  {it.s && <div className="pm-matrix-sub">{it.s}</div>}
                  {it.scoped && scopedRole === 'pflead' && <div className="pm-matrix-note"><Icon name="info" size={11} color="#7C3AED" />本集可编辑 · 他集仅查看</div>}
                  {blockedCombo && <div className="pm-matrix-note" style={{ color: 'var(--text-400)' }}><Icon name="lock" size={11} color="var(--text-400)" />无工作台准入</div>}
                </div>
                <div className="pm-cell">{cell(it.id, 'view')}</div>
                <div className="pm-cell">{cell(it.id, 'edit')}</div>
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ---------- 角色权限模板抽屉（集中维护） ---------- */
function RoleDrawer({ roleId, perms, wb, editable, onTogglePerm, onToggleWb, onReset, onClose }) {
  React.useEffect(() => { refreshIcons(); });
  if (!roleId) return null;
  const p = PM_PERSONA_MAP[roleId];
  const memberN = PM_MEMBERS.length; // 演示用
  return (
    <Drawer open={!!roleId} onClose={onClose} width={560}
      title={`${p.name} · 权限模板`} sub={`${p.badge} · 维护该角色权限，被赋予此角色的成员自动继承`}
      icon={{ name: p.icon, color: p.c }}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="t-micro" style={{ color: 'var(--text-400)', flex: 1 }}>
            {editable ? '修改即应用到该角色全部成员并写入留痕（演示）。' : '开启顶部「精细化权限控制」后可编辑模板。'}
          </span>
          {editable && <Button variant="secondary" size="sm" icon="rotate-ccw" onClick={() => onReset(roleId)}>恢复默认模板</Button>}
        </div>
      }>
      <div className="pm-dr-hero">
        <span className="pm-dr-avatar" style={{ background: p.c }}><Icon name={p.icon} size={20} color="#fff" /></span>
        <div style={{ minWidth: 0 }}>
          <div className="pm-dr-name">{p.name}</div>
          <div className="pm-dr-sub">{p.sub}</div>
        </div>
      </div>

      {/* 工作台准入 */}
      <div className="pm-dr-label"><Icon name="log-in" size={14} color="var(--text-400)" />工作台准入</div>
      <div className="pm-wb-toggle">
        <span className="pm-toggle-ico" style={{ width: 34, height: 34, background: '#fff', border: '1px solid var(--border-200)' }}><Icon name={wb ? 'check-circle-2' : 'minus-circle'} size={17} color={wb ? 'var(--success)' : 'var(--text-400)'} /></span>
        <div className="pm-wb-toggle-main">
          <div className="pm-wb-toggle-t">可进入「项目管理工作台」</div>
          <div className="pm-wb-toggle-s">{wb ? '该角色可进入组合级工作台' : '该角色仅能进入项目「专属工作台」'}</div>
        </div>
        <button className="pm-switch" data-on={wb} disabled={!editable} onClick={() => editable && onToggleWb(roleId)} aria-label="工作台准入"><span className="pm-switch-knob" /></button>
      </div>

      {/* 权限矩阵 */}
      <div className="pm-dr-label"><Icon name="sliders-horizontal" size={14} color="var(--text-400)" />模块权限 · 查看 / 编辑</div>
      <div className="pm-matrix-tools">
        <span className="pm-matrix-hint">{editable ? '勾选维护该角色权限；编辑含增删改、自动包含查看。' : '只读展示，开启精细化权限控制后可编辑。'}</span>
      </div>
      <PermMatrix perms={perms} wb={wb} scopedRole={roleId} editable={editable} onToggle={(resId, kind) => onTogglePerm(roleId, resId, kind)} />
      <div className="pm-legend">
        <span className="pm-legend-i"><span className="pm-legend-sw view" />查看权限 · 仅浏览</span>
        <span className="pm-legend-i"><span className="pm-legend-sw edit" />编辑权限 · 增 / 删 / 改</span>
      </div>
    </Drawer>
  );
}

/* ---------- 成员抽屉（分配角色 · 权限随角色继承只读） ---------- */
function MemberDrawer({ member, role, rolePerms, roleWb, editable, onAssignRole, onOpenRole, onClose, onEnterProject }) {
  React.useEffect(() => { refreshIcons(); });
  if (!member) return null;
  const p = PM_PERSONA_MAP[role];
  const wb = roleWb[role];
  const pfName = member.pf ? (window.PF_NAME ? window.PF_NAME[member.pf] : member.pf) : null;

  return (
    <Drawer open={!!member} onClose={onClose} width={520}
      title={member.name} sub={`${member.id} · ${member.title}`}
      icon={{ name: 'user', color: 'var(--blue-primary)' }}
      headRight={pmRolePill(role)}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="t-micro" style={{ color: 'var(--text-400)', flex: 1 }}>{editable ? '分配角色即生效，权限随角色继承。' : '开启「精细化权限控制」后可分配角色。'}</span>
          <Button variant="secondary" size="sm" icon="sliders-horizontal" onClick={() => onOpenRole(role)}>维护「{p.name}」权限</Button>
        </div>
      }>
      <div className="pm-dr-hero">
        <span className="pm-dr-avatar" style={{ background: PM_AVATAR_C[role] }}>{member.short}</span>
        <div style={{ minWidth: 0 }}>
          <div className="pm-dr-name">{member.name}</div>
          <div className="pm-dr-sub">{member.title}<span className="mono">· {member.id}</span></div>
        </div>
      </div>

      {/* 分配角色 */}
      <div className="pm-dr-label"><Icon name="user-cog" size={14} color="var(--text-400)" />分配角色{!editable && <span className="pm-role-assign-hint">开启精细化权限控制后可分配</span>}</div>
      <div className="pm-role-assign">
        {PM_PERSONAS.map(rp => (
          <button key={rp.id} className="pm-role-opt" data-on={role === rp.id} disabled={!editable} onClick={() => onAssignRole(member.id, rp.id)}>
            <Icon name={rp.icon} size={15} color={role === rp.id ? 'var(--blue-primary)' : 'var(--text-500)'} />
            {rp.name}
            {role === rp.id && <Icon name="check" size={14} color="var(--blue-primary)" style={{ marginLeft: 'auto' }} />}
          </button>
        ))}
      </div>

      {/* 归属 */}
      <div className="pm-dr-label" style={{ marginTop: 20 }}><Icon name="log-in" size={14} color="var(--text-400)" />工作台准入与归属</div>
      <div className="pm-dr-caps" style={{ padding: '12px 14px' }}>
        <div className={`pm-cap${wb ? '' : ' off'}`} style={{ marginBottom: member.pf || member.projects ? 10 : 0 }}>
          <Icon name={wb ? 'check-circle-2' : 'minus-circle'} size={16} color={wb ? 'var(--success)' : 'var(--text-400)'} className="pm-cap-ico" />
          <span className="pm-cap-t">{wb ? '可进入「项目管理工作台」' : '不可进入工作台 · 仅项目「专属工作台」'}</span>
        </div>
        {member.pf && <div className="pm-belong" style={{ paddingLeft: 26 }}><Icon name="folder-kanban" size={13} color="#7C3AED" />负责项目集 · {pfName}</div>}
        {member.projects && member.projects.map(([nm, pid]) => (
          <button className="pm-belong" key={pid} style={{ paddingLeft: 26, marginTop: 8, border: 'none', background: 'transparent', cursor: 'pointer' }} onClick={() => onEnterProject && onEnterProject({ name: nm, pid })}>
            <Icon name="box" size={13} color="var(--blue-primary)" />{nm}<span className="mono">{pid}</span><Icon name="arrow-up-right" size={12} color="var(--text-400)" />
          </button>
        ))}
        {role === 'admin' && <div className="pm-belong" style={{ paddingLeft: 26 }}><Icon name="globe" size={13} color="var(--text-400)" />跨全部项目集监督</div>}
      </div>

      {/* 继承的权限（只读，来自角色） */}
      <div className="pm-dr-label" style={{ marginTop: 20 }}><Icon name="shield-check" size={14} color="var(--text-400)" />继承的权限 · 来自角色「{p.name}」</div>
      <div className="pm-inherit-note"><Icon name="info" size={14} color="var(--blue-primary)" />成员权限随角色统一维护。要调整，请在角色「{p.name}」的权限模板中修改。</div>
      <PermMatrix perms={rolePerms[role]} wb={wb} scopedRole={role} editable={false} onToggle={() => {}} />
    </Drawer>
  );
}

/* ---------- 主页面 ---------- */
function PermissionSettings({ onNavigate, onEnterProject }) {
  const [loading, setLoading] = React.useState(true);
  const [roleFilter, setRoleFilter] = React.useState('all');
  const [q, setQ] = React.useState('');
  const [activeMember, setActiveMember] = React.useState(null);
  const [activeRole, setActiveRole] = React.useState(null);
  const [custom, setCustom] = React.useState(false);
  const [rolePerms, setRolePerms] = React.useState(() => Object.fromEntries(PM_PERSONAS.map(p => [p.id, pmDefaultPerms(p.id)])));
  const [roleWb, setRoleWb] = React.useState(() => Object.fromEntries(PM_PERSONAS.map(p => [p.id, p.workbench])));
  const [roleMap, setRoleMap] = React.useState(() => Object.fromEntries(PM_MEMBERS.map(m => [m.id, m.role])));
  const [toast, setToast] = React.useState(null);
  React.useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);
  React.useEffect(() => { refreshIcons(); });

  const roleOf = (m) => roleMap[m.id] || m.role;

  const togglePerm = (roleId, resId, kind) => setRolePerms(prev => {
    const cur = prev[roleId][resId];
    let next;
    if (kind === 'view') next = (cur === 'view' || cur === 'edit') ? 'none' : 'view';
    else next = cur === 'edit' ? 'view' : 'edit';
    return { ...prev, [roleId]: { ...prev[roleId], [resId]: next } };
  });
  const toggleWb = (roleId) => setRoleWb(prev => ({ ...prev, [roleId]: !prev[roleId] }));
  const resetRole = (roleId) => {
    setRolePerms(prev => ({ ...prev, [roleId]: pmDefaultPerms(roleId) }));
    setRoleWb(prev => ({ ...prev, [roleId]: PM_PERSONA_MAP[roleId].workbench }));
    setToast({ msg: `已恢复「${PM_PERSONA_MAP[roleId].name}」的默认权限模板` });
  };
  const assignRole = (mid, newRole) => {
    setRoleMap(prev => ({ ...prev, [mid]: newRole }));
    setToast({ msg: `已分配角色「${PM_PERSONA_MAP[newRole].name}」· 权限随角色继承` });
  };
  const onToggleCustom = () => setCustom(c => { const nv = !c; setToast({ msg: nv ? '已开启精细化权限控制 · 可维护角色模板并分配角色' : '已关闭 · 全部只读' }); return nv; });

  const members = PM_MEMBERS.filter(m => {
    if (roleFilter !== 'all' && roleOf(m) !== roleFilter) return false;
    if (q) { const s = (m.name + m.id + m.title).toLowerCase(); if (!s.includes(q.toLowerCase())) return false; }
    return true;
  });
  const counts = {};
  PM_ROLE_FILTERS.slice(1).forEach(f => counts[f.id] = PM_MEMBERS.filter(m => roleOf(m) === f.id).length);
  const memberCountByRole = (rid) => PM_MEMBERS.filter(m => roleOf(m) === rid).length;

  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: '项目管理工作台' }, { label: '治理' }, { label: '权限' }]} />
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico"><Icon name="shield-check" size={22} color="var(--blue-primary)" /></span>
          <div>
            <h1 className="t-h1">权限</h1>
          </div>
        </div>
        <div className="page-head-right">
          <FeedbackEntry
            context={{ scene: '权限', did: 'RBAC：角色 = 权限模板（集中维护），成员被赋予角色标签、自动继承权限', ask: '某个角色模板、某成员的角色分配或资源边界' }}
            onClick={() => {}} />
        </div>
      </div>

      {loading ? (
        <>
          <div className="pm-compare">{[0,1,2,3].map(i => <Card key={i} style={{ padding: 18 }}><Skel w="50%" h={18} /><Skel w="100%" h={110} style={{ marginTop: 14 }} /></Card>)}</div>
          <Card style={{ padding: 18, marginTop: 16 }}>{[0,1,2,3].map(i => <Skel key={i} w="100%" h={44} style={{ marginBottom: 10 }} />)}</Card>
        </>
      ) : (
        <>
          {/* 精细化权限控制 · 主开关 */}
          <div className="pm-toggle-bar" data-on={custom}>
            <span className="pm-toggle-ico"><Icon name="sliders-horizontal" size={19} color={custom ? 'var(--blue-primary)' : 'var(--text-500)'} /></span>
            <div className="pm-toggle-main">
              <div className="pm-toggle-t">精细化权限控制<span className="pm-toggle-state" style={{ color: custom ? 'var(--blue-primary)' : 'var(--text-400)' }}>{custom ? '已开启' : '已关闭'}</span></div>
              <div className="pm-toggle-s">{custom ? '可维护角色权限模板、并为成员分配角色。' : '关闭时全部只读。开启后可编辑角色模板并分配角色。'}</div>
            </div>
            <button className="pm-switch" data-on={custom} onClick={onToggleCustom} aria-label="精细化权限控制开关"><span className="pm-switch-knob" /></button>
          </div>

          {/* 角色 = 权限模板维护入口 */}
          <div className="pm-sec-label"><Icon name="layers" size={14} color="var(--text-400)" />角色权限模板 · 点击集中维护</div>
          <div className="pm-rolelist">
            {PM_PERSONAS.map(p => {
              const sum = pmCount(rolePerms[p.id], PM_RES_FLAT.map(r => r.id));
              const none = PM_RES_FLAT.length - sum.edit - sum.view;
              return (
                <button className="pm-rolerow" key={p.id} onClick={() => setActiveRole(p.id)}>
                  <span className="pm-rolerow-ico" style={{ background: p.bg }}><Icon name={p.icon} size={20} color={p.c} /></span>
                  <div className="pm-rolerow-main">
                    <div className="pm-rolerow-name">{p.name}<span className="pm-rolerow-badge" style={{ background: p.badgeBg, color: p.badgeC }}>{p.badge}</span></div>
                    <div className="pm-rolerow-sub">{p.sub}</div>
                  </div>
                  <span className={`pm-persona-access pm-rolerow-access ${roleWb[p.id] ? 'can' : 'cannot'}`}><Icon name={roleWb[p.id] ? 'check' : 'x'} size={11} color={roleWb[p.id] ? 'var(--success)' : 'var(--text-500)'} />{roleWb[p.id] ? '可进工作台' : '仅专属'}</span>
                  <div className="pm-rolerow-perms">
                    <div className="pm-rolerow-perm"><span className="v edit">{sum.edit}</span><span className="k">编辑</span></div>
                    <div className="pm-rolerow-perm"><span className="v">{sum.view}</span><span className="k">查看</span></div>
                    <div className="pm-rolerow-perm"><span className="v" style={{ color: 'var(--text-400)' }}>{none}</span><span className="k">无权限</span></div>
                  </div>
                  <span className="pm-rolerow-members">{memberCountByRole(p.id)} 名成员</span>
                  <span className="pm-rolerow-cta">维护权限<Icon name="chevron-right" size={15} color="var(--blue-primary)" /></span>
                </button>
              );
            })}
          </div>

          {/* 成员 → 角色分配（可检索） */}
          <div className="pm-sec-label" style={{ marginTop: 20 }}><Icon name="users" size={14} color="var(--text-400)" />成员与角色分配</div>
          <div className="b8-toolbar">
            <div className="b8-search">
              <Icon name="search" size={17} color="var(--text-400)" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="检索成员：姓名 / 工号 / 职务 / 项目…" />
              {q && <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={() => setQ('')}><Icon name="x" size={15} color="var(--text-400)" /></button>}
            </div>
            <div className="b8-seg">
              {PM_ROLE_FILTERS.map(f => <button key={f.id} className="b8-seg-btn" data-on={roleFilter === f.id} onClick={() => setRoleFilter(f.id)}>{f.label}{f.id !== 'all' && <span style={{ marginLeft: 5, fontFamily: 'var(--font-mono)', color: 'var(--text-400)' }}>{counts[f.id]}</span>}</button>)}
            </div>
          </div>
          <div className="b8-count">共 <span className="mono">{members.length}</span> 名成员{q && <> · 匹配「{q}」</>}</div>

          {members.length === 0 ? (
            <Card><EmptyState glyph="users" title="无匹配成员" desc="换个姓名、工号、职务或角色试试。" action={<Button variant="secondary" icon="rotate-ccw" onClick={() => { setQ(''); setRoleFilter('all'); }}>清除筛选</Button>} /></Card>
          ) : (
            <div className="st-tablewrap">
              <table className="dtable">
                <thead><tr>
                  <th><span className="th-in">成员 / 职务</span></th>
                  <th><span className="th-in">角色标签</span></th>
                  <th><span className="th-in">工作台准入</span></th>
                  <th><span className="th-in">继承权限</span></th>
                  <th style={{ width: 44 }}></th>
                </tr></thead>
                <tbody>
                  {members.map(m => {
                    const mrole = roleOf(m);
                    const wb = roleWb[mrole];
                    const sum = pmCount(rolePerms[mrole], PM_RES_FLAT.map(r => r.id));
                    return (
                      <tr key={m.id} style={{ cursor: 'pointer' }} onClick={() => setActiveMember(m)}>
                        <td>
                          <div className="pm-member-name">
                            <span className="pm-avatar" style={{ background: PM_AVATAR_C[mrole] }}>{m.short}</span>
                            <div className="pm-member-main">
                              <div className="pm-member-t">{m.name}</div>
                              <div className="pm-member-id">{m.id} · {m.title}</div>
                            </div>
                          </div>
                        </td>
                        <td>{pmRolePill(mrole)}</td>
                        <td><span className={`pm-wb ${wb ? 'yes' : 'no'}`}><Icon name={wb ? 'check-circle-2' : 'x-circle'} size={14} color={wb ? 'var(--success)' : 'var(--text-400)'} />{wb ? '可进入' : '仅专属'}</span></td>
                        <td>
                          <span className="pm-perm-sum">
                            <span className="pm-perm-chip edit"><Icon name="pencil" size={11} color="var(--blue-primary)" />编辑 {sum.edit}</span>
                            <span className="pm-perm-chip view"><Icon name="eye" size={11} color="var(--text-500)" />查看 {sum.view}</span>
                          </span>
                        </td>
                        <td><span className="cb-bar-cta"><Icon name="chevron-right" size={16} color="var(--text-400)" /></span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <RoleDrawer roleId={activeRole} perms={activeRole ? rolePerms[activeRole] : null} wb={activeRole ? roleWb[activeRole] : false}
        editable={custom} onTogglePerm={togglePerm} onToggleWb={toggleWb} onReset={resetRole} onClose={() => setActiveRole(null)} />
      <MemberDrawer member={activeMember} role={activeMember ? roleOf(activeMember) : null} rolePerms={rolePerms} roleWb={roleWb}
        editable={custom} onAssignRole={assignRole} onOpenRole={(rid) => { setActiveMember(null); setActiveRole(rid); }}
        onClose={() => setActiveMember(null)} onEnterProject={onEnterProject} />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

Object.assign(window, { PermissionSettings });
