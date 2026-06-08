/* ============================================================
   批 8 · 页面 8.1 · AI 员工后台管理（组合级 · 治理）
   ------------------------------------------------------------
   作用：统一管理官网平台内置的全部 AI 员工。
         三个视图依次下钻：花名册 → 员工档案（身份 + 环节定位 + 技能库）→ 技能详情。
   依赖：技能详情 SkillDetail 在 pages_b8_skill.jsx；数据 STAFF/FLOW_STAGES 在 pages_b8_staff_data.jsx。
   ============================================================ */

/* SkCrumb — 内部小面包屑（视图间导航，不走全局路由，仅在本页三视图间切换）。 */
function SkCrumb({ items }) {
  return (
    <div className="crumb">
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 && <Icon name="chevron-right" size={14} color="var(--text-400)" />}
            {!last && it.onClick
              ? <button type="button" className="crumb-item is-link" onClick={it.onClick}>{it.label}</button>
              : <span className={`crumb-item${last ? ' cur' : ''}`}>{it.label}</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function staffStatusPill(s) {
  return s === 'run' ? <Pill tone="ai">工作中</Pill> : <Pill tone="neutral">空闲</Pill>;
}

const STAFF_LAYERS = [
  { id: 'all', label: '全部环节' },
  { id: '战略', label: '战略' },
  { id: '规划', label: '规划' },
  { id: '执行', label: '执行' },
  { id: '验收', label: '验收' },
  { id: '治理', label: '治理' },
];

/* ============================================================
   视图 A · 花名册
   ------------------------------------------------------------
   StaffRoster：状态 stage 环节筛选 / q 检索 / sort 排序（达标率/技能数/产出）。
   表格点行 onOpen(员工) 进入员工档案。数据取自 STAFF。
   ============================================================ */
function StaffRoster({ onOpen }) {
  const [loading, setLoading] = React.useState(true);
  const [stage, setStage] = React.useState('all');
  const [q, setQ] = React.useState('');
  const [sort, setSort] = React.useState('pass');
  React.useEffect(() => { const t = setTimeout(() => setLoading(false), 550); return () => clearTimeout(t); }, []);
  React.useEffect(() => { refreshIcons(); });

  let rows = STAFF.filter(s => {
    if (stage !== 'all' && s.stage !== stage) return false;
    if (q) { const str = (s.name + s.id + s.domain + s.role + s.skillBase.map(k => k.name).join('')).toLowerCase(); if (!str.includes(q.toLowerCase())) return false; }
    return true;
  });
  rows = [...rows].sort((a, b) => sort === 'pass' ? b.pass - a.pass : sort === 'skills' ? b.skillBase.length - a.skillBase.length : b.output30 - a.output30);

  const avgPass = (STAFF.reduce((s, x) => s + x.pass, 0) / STAFF.length).toFixed(1);
  const running = STAFF.filter(s => s.status === 'run').length;
  const totalSkills = STAFF.reduce((s, x) => s + x.skillBase.length, 0);
  const iters30 = STAFF.reduce((s, x) => s + x.iters30, 0);

  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: '项目管理工作台' }, { label: '治理' }, { label: 'AI 员工' }]} />
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico"><Icon name="users-round" size={22} color="var(--blue-primary)" /></span>
          <div>
            <h1 className="t-h1">AI 员工管理</h1>
          </div>
        </div>
        <div className="page-head-right">
          <FeedbackEntry
            context={{ scene: 'AI 员工管理', did: `当前共 ${STAFF.length} 名内置 AI 员工，覆盖战略 / 规划 / 执行 / 验收 / 治理全流程，平均达标率 ${avgPass}%`, ask: '某个 AI 员工的定位、技能或迭代方向' }} />
        </div>
      </div>

      {loading ? (
        <>
          <div className="b8-stats">{[0,1,2,3].map(i => <div className="b8-stat" key={i}><Skel w="50%" h={14} /><Skel w="40%" h={26} style={{ marginTop: 14 }} /></div>)}</div>
          <div className="st-tablewrap" style={{ padding: 16 }}>{[0,1,2,3].map(i => <Skel key={i} w="100%" h={44} style={{ marginBottom: 8 }} />)}</div>
        </>
      ) : (
        <>
          <div className="b8-stats">
            <div className="b8-stat"><div className="b8-stat-k"><Icon name="users-round" size={14} color="var(--blue-primary)" />内置 AI 员工</div><div className="b8-stat-v">{STAFF.length}</div></div>
            <div className="b8-stat"><div className="b8-stat-k"><Icon name="layers" size={14} color="var(--text-500)" />技能总数</div><div className="b8-stat-v">{totalSkills}</div></div>
            <div className="b8-stat"><div className="b8-stat-k"><Icon name="target" size={14} color="var(--success)" />平均达标率</div><div className="b8-stat-v" style={{ color: 'var(--success)' }}>{avgPass}%</div><div className="b8-stat-sub">近 30 日 · 较上月 <b style={{ color: 'var(--success)' }}>+1.3pt</b></div></div>
            <div className="b8-stat"><div className="b8-stat-k"><Icon name="git-commit-horizontal" size={14} color="var(--ai)" />近 30 日迭代</div><div className="b8-stat-v" style={{ color: 'var(--ai)' }}>{iters30}</div><div className="b8-stat-sub">人工干预 + 自主进化</div></div>
          </div>

          <div className="b8-toolbar">
            <div className="b8-search">
              <Icon name="search" size={17} color="var(--text-400)" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="按角色 / 专业领域 / 技能检索 AI 员工…" />
              {q && <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={() => setQ('')}><Icon name="x" size={15} color="var(--text-400)" /></button>}
            </div>
            <div className="b8-seg">
              {STAFF_LAYERS.map(f => <button key={f.id} className="b8-seg-btn" data-on={stage === f.id} onClick={() => setStage(f.id)}>{f.label}</button>)}
            </div>
          </div>

          <div className="b8-count">共 <span className="mono">{rows.length}</span> 名 AI 员工{q && <> · 匹配「{q}」</>}</div>

          {rows.length === 0 ? (
            <Card><EmptyState glyph="users-round" title="无匹配的 AI 员工" desc="换个角色、专业领域或技能关键词试试。" action={<Button variant="secondary" icon="rotate-ccw" onClick={() => { setQ(''); setStage('all'); }}>清除筛选</Button>} /></Card>
          ) : (
            <div className="st-tablewrap">
              <table className="dtable">
                <thead><tr>
                  <th><span className="th-in">AI 员工 / 专业领域</span></th>
                  <th><span className="th-in">负责环节</span></th>
                  <th className="num"><span className="th-in" onClick={() => setSort('skills')} style={{ color: sort === 'skills' ? 'var(--text-900)' : undefined }}>技能数 <Icon name="chevron-down" size={13} color={sort === 'skills' ? 'var(--blue-primary)' : 'var(--text-400)'} /></span></th>
                  <th className="num"><span className="th-in" onClick={() => setSort('pass')} style={{ color: sort === 'pass' ? 'var(--text-900)' : undefined }}>达标率 <Icon name="chevron-down" size={13} color={sort === 'pass' ? 'var(--blue-primary)' : 'var(--text-400)'} /></span></th>
                  <th className="st-spark"><span className="th-in">近期产出量</span></th>
                  <th><span className="th-in">状态</span></th>
                  <th style={{ width: 44 }}></th>
                </tr></thead>
                <tbody>
                  {rows.map(s => {
                    const fs = FLOW_STAGES.find(f => f.id === s.stage);
                    return (
                      <tr key={s.id} onClick={() => onOpen(s)}>
                        <td>
                          <div className="st-name">
                            <span className="st-avatar"><Icon name={s.icon} size={18} color="var(--blue-primary)" /></span>
                            <div className="st-name-main">
                              <div className="st-name-t">{s.name}</div>
                              <div className="st-name-id">{s.id} · {s.domain}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="st-skilltag" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name={fs.icon} size={12} color="var(--blue-primary)" />{fs.k}</span>
                        </td>
                        <td className="num"><span className="mono" style={{ fontWeight: 600, color: 'var(--text-900)' }}>{s.skillBase.length}</span></td>
                        <td className="num"><span className="st-rate"><span className="v" style={{ color: 'var(--success)' }}>{s.pass}%</span></span></td>
                        <td className="st-spark">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9, justifyContent: 'flex-end' }}>
                            <span className="mono" style={{ fontWeight: 600, color: 'var(--text-900)' }}>{s.output30}</span>
                            <Sparkline data={s.outTrend} w={64} h={24} color="var(--blue-primary)" fill={false} />
                          </div>
                        </td>
                        <td>{staffStatusPill(s.status)}</td>
                        <td><span className="st-row-cta"><Icon name="chevron-right" size={16} color="var(--text-400)" /></span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ============================================================
   视图 B · 员工档案（身份 + 环节定位 + 技能库）
   ------------------------------------------------------------
   EmployeeProfile：展示单个 AI 员工的身份卡、在项目流转中的环节定位、绩效、技能库、工作日志与产出。
   交互：点技能卡 onOpenSkill(技能) 进入技能详情；onBack 返回花名册。
   ============================================================ */
function EmployeeProfile({ staff, onBack, onOpenSkill, onToast }) {
  React.useEffect(() => { refreshIcons(); });
  const fs = FLOW_STAGES.find(f => f.id === staff.stage);

  return (
    <div className="content-inner page-fade">
      <SkCrumb items={[
        { label: 'AI 员工', onClick: onBack },
        { label: staff.name },
      ]} />

      {/* 身份卡 */}
      <div className="sk-prof-hero">
        <span className="sk-prof-avatar"><Icon name={staff.icon} size={28} color="var(--blue-primary)" /></span>
        <div className="sk-prof-main">
          <div className="sk-prof-namerow">
            <span className="sk-prof-name">{staff.name}</span>
            <span className="sk-prof-role">{staff.role}</span>
            {staffStatusPill(staff.status)}
          </div>
          <div className="sk-prof-sub">
            <span>{staff.domain}</span>
            <span className="sk-prof-dot" />
            <span>{staff.layer}</span>
            <span className="sk-prof-dot" />
            <span className="mono">{staff.id}</span>
          </div>
          <p className="sk-prof-charter" dangerouslySetInnerHTML={{ __html: staff.charter.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') }} />

          {/* 在 AI 项目流转中的环节定位 */}
          <div className="sk-flow">
            {FLOW_STAGES.map(f => (
              <div className={`sk-flow-step${f.id === staff.stage ? ' is-on' : ''}`} key={f.id}>
                <span className="sk-flow-k"><Icon name={f.icon} size={12} color={f.id === staff.stage ? 'var(--blue-primary)' : 'var(--text-400)'} />{f.k}</span>
                <div className="sk-flow-t">{f.t}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 'none' }}>
          <FeedbackEntry label="反馈"
            context={{ scene: 'AI 员工档案', did: `当前查看「${staff.name}」（${staff.role}），负责 ${fs.k} 环节，共 ${staff.skillBase.length} 项技能`, ask: '该员工的定位、某项技能或迭代方向' }} />
        </div>
      </div>

      {/* 绩效概览 */}
      <div className="b8-stats">
        <div className="b8-stat"><div className="b8-stat-k"><Icon name="target" size={14} color="var(--success)" />平均达标率</div><div className="b8-stat-v" style={{ color: 'var(--success)' }}>{staff.pass}%</div><div className="b8-stat-sub">近 30 日 · <b style={{ color: 'var(--success)' }}>{staff.passDelta}</b></div></div>
        <div className="b8-stat"><div className="b8-stat-k"><Icon name="undo-2" size={14} color="var(--warning)" />被退回率</div><div className="b8-stat-v">{staff.reject}%</div><div className="b8-stat-sub">近 30 日 · <b style={{ color: staff.rejectDelta.startsWith('-') ? 'var(--success)' : 'var(--warning)' }}>{staff.rejectDelta}</b></div></div>
        <div className="b8-stat"><div className="b8-stat-k"><Icon name="package" size={14} color="var(--blue-primary)" />近 30 日产出</div><div className="b8-stat-v">{staff.output30}</div><div className="b8-stat-sub">承接 {fs.k} 环节任务</div></div>
        <div className="b8-stat"><div className="b8-stat-k"><Icon name="layers" size={14} color="var(--text-500)" />技能数</div><div className="b8-stat-v">{staff.skillBase.length}</div><div className="b8-stat-sub">近 30 日迭代 <b>{staff.iters30}</b> 次</div></div>
      </div>

      {/* 技能库 */}
      <div className="sk-sec-head">
        <span className="sk-sec-ico"><Icon name="layers" size={17} color="var(--blue-primary)" /></span>
        <span className="sk-sec-t">技能库</span>
        <span className="sk-sec-s">Skill Base · 每个技能背后是一套提示词与逻辑，像 Skill 一样被调用</span>
        <span className="sk-sec-aside">共 <span className="mono">{staff.skillBase.length}</span> 项技能</span>
      </div>
      <div className="sk-base">
        {staff.skillBase.map(sk => (
          <button className="sk-card" key={sk.id} onClick={() => onOpenSkill(sk)}>
            <div className="sk-card-top">
              <span className="sk-card-ico"><Icon name="puzzle" size={17} color="var(--text-500)" /></span>
              <span className="sk-card-name">{sk.name}</span>
              <span className="sk-card-ver">{sk.curVer || 'v1.4'}</span>
            </div>
            <div className="sk-card-intro">{sk.intro}</div>
            <div className="sk-card-foot">
              <span className="sk-card-stat">{skillDots(sk.weight)}</span>
              <span className="sk-card-stat"><Icon name="activity" size={13} color="var(--text-400)" />近30日 <span className="v">{sk.calls30}</span> 次</span>
              <span className="sk-card-cta">查看技能逻辑<Icon name="chevron-right" size={14} color="var(--blue-primary)" /></span>
            </div>
          </button>
        ))}
      </div>

      {/* 工作日志 + 产出 */}
      <div className="sk-sec-head">
        <span className="sk-sec-ico"><Icon name="clock" size={17} color="var(--blue-primary)" /></span>
        <span className="sk-sec-t">负责域与近期工作</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }} className="sk-prof-bottom">
        <div className="sk-panel">
          <div className="sk-panel-head"><Icon name="history" size={15} color="var(--blue-primary)" /><span className="sk-panel-t">工作日志</span></div>
          <div className="sk-panel-body">
            <div className="st-log">
              {staff.logs.map((l, i) => (
                <div className="st-log-item" key={i}>
                  <span className="st-log-ico"><Icon name={l.ico} size={16} color="var(--blue-primary)" /></span>
                  <div className="st-log-main">
                    <div className="st-log-act">{l.act}</div>
                    <div className="st-log-meta">
                      <span className="st-log-proj"><Icon name="box" size={12} color="var(--blue-primary)" />{l.proj}</span>
                      <span className="mono">{l.date}</span>
                    </div>
                    <div className="st-log-out"><Icon name="package" size={13} color="var(--text-400)" />{l.out}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="sk-panel">
          <div className="sk-panel-head"><Icon name="package" size={15} color="var(--blue-primary)" /><span className="sk-panel-t">做过的产出</span></div>
          <div className="sk-panel-body">
            <div className="st-outs">
              {staff.outs.map((o, i) => {
                const st = STATUS[o.tone] || STATUS.neutral;
                return (
                  <div className="st-out" key={i}>
                    <span className="st-out-ico"><Icon name={o.ico} size={16} color="var(--text-500)" /></span>
                    <div className="st-out-main">
                      <div className="st-out-t">{o.t}</div>
                      <div className="st-out-s">{o.s}</div>
                    </div>
                    <span className="st-out-tag" style={{ color: st.c, background: st.bg }}>{o.tag}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   路由：花名册 → 员工档案 → 技能详情
   ------------------------------------------------------------
   AIStaffArchive：本页的「内部路由器」。view 三态（list / employee / skill），
   staff/skill 保存当前选中对象；openSkill 用 enrichSkill 给技能补充员工上下文。
   ============================================================ */
function AIStaffArchive({ onNavigate }) {
  const [view, setView] = React.useState('list');   // 'list' 花名册 | 'employee' 档案 | 'skill' 技能详情
  const [staff, setStaff] = React.useState(null);
  const [skill, setSkill] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  React.useEffect(() => { window.scrollTo && window.scrollTo(0, 0); }, [view]);

  const openEmployee = (s) => { setStaff(s); setView('employee'); };
  const openSkill = (sk) => { setSkill(enrichSkill(sk, staff)); setView('skill'); };
  const backToList = () => { setView('list'); };
  const backToEmployee = () => { setView('employee'); };

  return (
    <>
      {view === 'list' && <StaffRoster onOpen={openEmployee} />}
      {view === 'employee' && staff && <EmployeeProfile staff={staff} onBack={backToList} onOpenSkill={openSkill} onToast={(msg) => setToast({ msg })} />}
      {view === 'skill' && staff && skill && (
        <SkillDetail staff={staff} skill={skill} onBackList={backToList} onBackEmployee={backToEmployee} onToast={(msg, action, onAction) => setToast({ msg, action, onAction })} />
      )}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

Object.assign(window, { AIStaffArchive, StaffRoster, EmployeeProfile, SkCrumb, staffStatusPill });
