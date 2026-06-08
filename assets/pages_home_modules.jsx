/* ============================================================
   项目主页 · 模块分区组件（pages_home_modules.jsx）
   ------------------------------------------------------------
   作用：渲染项目主页六大模块的 UI（数据来自 pages_home_data.jsx 的 HOME_*）。
         每个模块独占一个区域，保留旧系统结构以降低迁移成本。
   依赖：components.jsx（Icon/Ring/Button）、pages_home_data.jsx（HOME_* 数据）。
   关键契约：onOpen(detail) — 所有模块的「点项 → 开详情」都调这个回调，
         由父组件 ProjectHome 统一弹出详情抽屉（detail 是一个描述该目标的对象）。
   ============================================================ */

/* ---------- 共享小件 ----------
   ImpBadge 重要度徽章 / VerChip 版本片 / ModuleHead 模块头 /
   MiniTabs 小页签（可带计数）/ ProgInline 行内进度条。 */
function ImpBadge({ v = 5 }) {
  return <span className="hm-imp"><span className="hm-imp-k">重要度</span><span className="hm-imp-v">{v}</span></span>;
}
function VerChip({ children }) {
  return <span className="hm-verchip"><Icon name="git-commit-horizontal" size={11} color="var(--blue-primary)" />{children}</span>;
}
function ModuleHead({ idx, icon, c, bg, title, en, count, hint, right }) {
  return (
    <div className="hm-head">
      <span className="hm-head-ico" style={{ background: bg }}><Icon name={icon} size={19} color={c} /></span>
      <div className="hm-head-tt">
        <div className="hm-head-title">{title}</div>
      </div>
      {right && <div className="hm-head-right">{right}</div>}
    </div>
  );
}
function MiniTabs({ tabs, active, onPick }) {
  return (
    <div className="hm-tabs">
      {tabs.map(t => {
        const key = typeof t === 'string' ? t : t.k;
        const n = typeof t === 'string' ? null : t.n;
        return (
          <button key={key} className="hm-tab" data-on={active === key} onClick={() => onPick(key)}>
            {key}{n != null && <span className="hm-tab-n">{n}</span>}
          </button>
        );
      })}
    </div>
  );
}
function ProgInline({ p }) {
  return (
    <span className="hm-prog">
      <span className="hm-prog-bar"><span style={{ width: p + '%', background: progColor(p) }} /></span>
      <span className="hm-prog-n mono" style={{ color: progColor(p) }}>{p}%</span>
    </span>
  );
}

/* ---------- 模块一 · 理想化状态 ----------
   作用：展示项目终态锡点。分类页签过滤 + 重要度 + 进度环。
   交互：cat 状态控制分类筛选；点任一行调 onOpen() 传出该理想态的详情对象。 */
function IdealModule({ onOpen, sectionRef }) {
  const [cat, setCat] = React.useState('全部');
  const items = HOME_IDEAL.items.filter(it => cat === '全部' || it.cat === cat);
  const tabs = HOME_IDEAL.cats.map(c => ({ k: c, n: c === '全部' ? HOME_IDEAL.items.length : HOME_IDEAL.items.filter(i => i.cat === c).length }));
  return (
    <section className="hm-sec" ref={sectionRef} id="sec-ideal">
      <ModuleHead idx="01" icon="target" c="var(--blue-primary)" bg="var(--blue-tint)" title="理想化状态" en="IDEAL STATE"
        count={HOME_IDEAL.items.length} hint="项目达成后的稳定终态 · 向下拆解的总锚点" />
      <MiniTabs tabs={tabs} active={cat} onPick={setCat} />
      <div className="hm-ideal-list">
        {items.map(it => (
          <button key={it.id} className="hm-ideal-row" onClick={() => onOpen({
            level: 'ideal', title: it.text, imp: it.imp, def: it.def, prog: it.prog,
            meta: [{ k: '所属分类', v: it.cat }, { k: '推进度', v: it.prog + '%' }],
            up: null, down: [], note: '理想化状态是项目根基三要素之一，作为向下拆解中短期 / 阶段 / 周目标的总锚点。',
          })}>
            <span className="hm-ideal-dot" style={{ background: progColor(it.prog) }} />
            <span className="hm-ideal-main">
              <span className="hm-ideal-text">{it.text}</span>
              <span className="hm-ideal-tags"><ImpBadge v={it.imp} /><span className="hm-cat">{it.cat}</span></span>
            </span>
            <span className="hm-ideal-prog"><Ring value={it.prog} size={40} stroke={4} color={progColor(it.prog)} animate={false} /></span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------- 模块二 · 目标用户 ----------
   作用：展示各类目标用户。sel 状态控制当前选中哪个用户，点胶囊切换右侧详情面板。 */
function UsersModule({ sectionRef }) {
  const [sel, setSel] = React.useState(HOME_USERS[0].id);
  const u = HOME_USERS.find(x => x.id === sel) || HOME_USERS[0];
  return (
    <section className="hm-sec" ref={sectionRef} id="sec-users">
      <ModuleHead idx="02" icon="users" c="var(--ai)" bg="var(--ai-soft)" title="目标用户" en="TARGET USERS"
        count={HOME_USERS.length} hint="描述语言请使用正向描述" />
      <div className="hm-users-pills">
        {HOME_USERS.map(x => (
          <button key={x.id} className="hm-upill" data-on={sel === x.id} onClick={() => setSel(x.id)}>
            <span className="hm-upill-name">{x.name}</span>
            <span className="hm-upill-role">{x.role}</span>
          </button>
        ))}
      </div>
      <div className="hm-user-panel">
        <div className="hm-user-def">
          <div className="hm-user-name">{u.name}</div>
          <div className="hm-user-deftext">{u.def}</div>
        </div>
        <div className="hm-user-grid">
          <div className="hm-user-block hm-user-traits">
            <div className="hm-sub-label" style={{ color: 'var(--success)' }}>特征属性描述</div>
            <div className="hm-trait-list">
              {u.traits.map((t, i) => (
                <div className="hm-trait" key={i}>
                  <span className="hm-trait-dot" />
                  <span className="hm-trait-k">{t.k}</span>
                  <span className="hm-trait-v">{t.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hm-user-side">
            <div className="hm-user-block">
              <div className="hm-sub-label" style={{ color: 'var(--success)' }}>目标用户市场</div>
              <div className="hm-user-market"><Icon name="globe" size={15} color="var(--text-400)" />{u.market}</div>
            </div>
            <div className="hm-user-block">
              <div className="hm-sub-label" style={{ color: 'var(--success)' }}>典型用户场景</div>
              <div className="hm-user-scene">{u.scenario}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 模块三 · 核心价值 ----------
   作用：展示干系人价值。open 为「哪些卡展开」的字典，点「展开更多」切换该卡的实现方式可见性。 */
function ValueModule({ sectionRef }) {
  const [open, setOpen] = React.useState({});
  const V = HOME_VALUE;
  return (
    <section className="hm-sec" ref={sectionRef} id="sec-value">
      <ModuleHead idx="03" icon="gem" c="var(--success)" bg="var(--success-bg)" title="核心价值" en="CORE VALUE"
        count={V.items.length} />
      <div className="hm-value-list">
        {V.items.map(it => {
          const expanded = open[it.id];
          return (
            <div className="hm-value-card" key={it.id}>
              <div className="hm-value-top">
                <span className="hm-value-who"><Icon name="user-round" size={14} color="var(--text-500)" />干系人：<b>{it.who}</b></span>
                <span className="hm-prio"><span className="hm-prio-k">优先级</span><span className="hm-prio-v">{it.priority}</span></span>
                <button className="hm-value-toggle" onClick={() => setOpen(o => ({ ...o, [it.id]: !o[it.id] }))}>
                  {expanded ? '收起' : '展开更多'}<Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color="var(--blue-primary)" />
                </button>
              </div>
              <div className="hm-value-body">
                <div className="hm-value-row">
                  <div className="hm-sub-label" style={{ color: 'var(--blue-primary)' }}>实现价值</div>
                  <div className="hm-value-text">{it.value}</div>
                </div>
                {expanded && (
                  <div className="hm-value-row">
                    <div className="hm-sub-label" style={{ color: 'var(--success)' }}>实现方式</div>
                    <div className="hm-value-text">{it.method}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- 中短期 / 阶段 / 周 共用的三个组件 ----------
   VersionPicker 版本选择器：variant='tabs' 为页签式；默认 'select' 为带时间周期的下拉。
     open 状态控制下拉菜单；选中后 onChange(id) 回传父级，父级据此联动下一级（季→月→周）。 */
function VersionPicker({ value, options, onChange, variant = 'select' }) {
  const [open, setOpen] = React.useState(false);
  const cur = options.find(o => o.id === value) || options[0] || {};
  if (variant === 'tabs') {
    return (
      <div className="hm-vtabs">
        {options.map(o => (
          <button key={o.id} className="hm-vtab" data-on={o.id === value} onClick={() => onChange(o.id)}>{o.big || o.id}</button>
        ))}
      </div>
    );
  }
  return (
    <div className="hm-vsel">
      <button className="hm-vsel-btn" onClick={() => setOpen(o => !o)}>
        <span className="hm-vsel-col">
          <span className="hm-vsel-num">v{cur.num || cur.id}<Icon name="chevron-down" size={14} color="var(--text-400)" /></span>
          <span className="hm-vsel-range mono">{cur.sub}</span>
        </span>
      </button>
      {open && (
        <div className="hm-vmenu" onMouseLeave={() => setOpen(false)}>
          <div className="hm-vmenu-h">切换版本 · 时间周期</div>
          {options.map(o => (
            <button key={o.id} className="hm-vitem" data-on={o.id === value} onClick={() => { onChange(o.id); setOpen(false); }}>
              <span className="hm-vitem-num">v{o.num || o.id}</span>
              <span className="hm-vitem-range mono">{o.sub}</span>
              {o.tag && <span className={`hm-vitem-tag${o.current ? ' cur' : ''}`}>{o.tag}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// StepBar 步骤条：展示「审核通过 → 执行中 → 验收」进度。state: done 已完成/cur 当前/todo 待办。
function StepBar({ items }) {
  if (!items || !items.length) return null;
  return (
    <div className="hm-steps">
      {items.map((s, i) => (
        <React.Fragment key={s.k}>
          <div className="hm-step" data-state={s.state}>
            <span className="hm-step-dot">{s.state === 'done' ? <Icon name="check" size={13} color="#fff" /> : (i + 1)}</span>
            <div className="hm-step-tt"><div className="hm-step-k">{s.k}</div><div className="hm-step-d mono">{s.date}</div></div>
          </div>
          {i < items.length - 1 && <span className="hm-step-line" data-done={items[i + 1].state !== 'todo'} />}
        </React.Fragment>
      ))}
    </div>
  );
}

// GoalRow 目标行：全站目标列表的统一行。显示状态药丸 + 标题 + 重要度 + 承接来源 + 进度，
// 整行可点（onClick 通常走 onOpen 开详情）。status='kapian' 时行高亮提醒。
function GoalRow({ status, title, imp, prog, worth, source, onClick }) {
  const st = status ? HOME_STATUS[status] : null;
  return (
    <button className="hm-goal-row" data-kapian={status === 'kapian'} onClick={onClick}>
      <span className="hm-goal-main">
        <span className="hm-goal-titlerow">
          {st && <span className="hm-statuspill" style={{ background: st.bg, color: st.c }}><Icon name={st.icon} size={11} color={st.c} className={st.spin ? 'spin' : ''} />{st.label}</span>}
          <span className="hm-goal-title">{title}</span>
        </span>
        <span className="hm-goal-sub">
          <ImpBadge v={imp} />
          {source && <span className="hm-source"><Icon name="corner-left-up" size={12} color="var(--text-400)" />承接{source.label}{source.ver && <VerChip>v{source.ver}</VerChip>}<span className="hm-source-t">{source.title}</span></span>}
          {worth && <span className="hm-worth">值得</span>}
        </span>
      </span>
      <span className="hm-goal-right"><ProgInline p={prog} /><Icon name="chevron-right" size={16} color="var(--text-400)" /></span>
    </button>
  );
}

/* ---------- 模块四 · 中短期目标 ----------
   作用：按季度大版本（v1.0/2.0/3.0）展示中短期目标。
   关键交互：quarter 由父级 ProjectHome 持有（因为要联动下方阶段/周模块），
     换季时 onChangeQuarter 回传；tab 状态态本地过滤（全部/执行中/卡点/通过验收/未验收）。
     list 里未显式给 status 的，按 prog 推导（≥100 已验收 / >0 执行中 / 否则编写中）。 */
function MidModule({ quarter, onChangeQuarter, onOpen, sectionRef }) {
  const [tab, setTab] = React.useState('全部');
  React.useEffect(() => { setTab('全部'); }, [quarter]);
  const qv = MID_VERSIONS.find(v => v.id === quarter) || MID_VERSIONS[0];
  const list = (HOME_MID.byVer[quarter] || []).map(it => ({ ...it, status: it.status || (it.prog >= 100 ? 'accepted' : it.prog > 0 ? 'run' : 'draft') }));
  const items = tab === '全部' ? list
    : tab === '执行中' ? list.filter(i => i.status === 'run')
    : tab === '卡点' ? list.filter(i => i.status === 'kapian')
    : tab === '通过验收' ? list.filter(i => i.status === 'accepted')
    : list.filter(i => i.status !== 'accepted');
  const cnt = (s) => list.filter(i => i.status === s).length;
  const tabs = [{ k: '全部', n: list.length }, { k: '通过验收', n: cnt('accepted') }, { k: '执行中', n: cnt('run') }, { k: '卡点', n: cnt('kapian') }, { k: '未验收', n: list.filter(i => i.status !== 'accepted').length }];
  const opts = MID_VERSIONS.map(v => ({ id: v.id, sub: `${v.q} · ${v.range}`, tag: v.tag, current: v.current }));
  return (
    <section className="hm-sec" ref={sectionRef} id="sec-mid">
      <ModuleHead icon="flag" c="var(--blue-primary)" bg="var(--blue-tint)" title="中短期目标"
        right={<VersionPicker value={quarter} options={opts} onChange={onChangeQuarter} />} />
      <StepBar items={qv.step} />
      <MiniTabs tabs={tabs} active={tab} onPick={setTab} />
      {items.length === 0 ? <div className="hm-empty">该版本下暂无中短期目标</div> : (
        <div className="hm-card-list">
          {items.map(it => (
            <GoalRow key={it.id} status={it.status} title={it.title} imp={it.imp} prog={it.prog}
              source={{ label: '理想化状态', title: it.up.title }}
              onClick={() => onOpen({
                level: 'mid', title: it.title, imp: it.imp, def: it.def, prog: it.prog,
                meta: [{ k: '时间周期', v: qv.range, mono: true }, { k: '版本', v: 'v' + quarter, mono: true }, { k: '负责人', v: it.owner }],
                up: it.up, down: it.down,
              })} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------- 模块五 · 阶段结项目标 ----------
   作用：按月版本展示阶段目标。month 由父级持有，随 quarter 联动（MONTHS_OF(quarter) 取可选月）。
     每个阶段目标携 source = 「来源中短期版本」，详情里通过 up/down 与上下层互链。 */
function PhaseModule({ quarter, month, onChangeMonth, onOpen, sectionRef }) {
  const months = MONTHS_OF(quarter);
  const mv = MONTH_OF(month) || months[0] || {};
  const data = HOME_PHASE.byVer[month] || { statusTabs: [{ k: '全部', n: 0 }], items: [] };
  const [tab, setTab] = React.useState('全部');
  React.useEffect(() => { setTab('全部'); }, [month]);
  const items = tab === '全部' ? data.items
    : tab === '执行中' ? data.items.filter(i => i.status === 'run')
    : tab === '卡点' ? data.items.filter(i => i.status === 'kapian')
    : tab === '通过验收' ? data.items.filter(i => i.status === 'accepted')
    : data.items.filter(i => i.status !== 'accepted');
  const opts = months.map(m => ({ id: m.id, sub: `${m.label} · ${m.range}`, tag: m.cropped ? '立项裁剪' : '' }));
  return (
    <section className="hm-sec" ref={sectionRef} id="sec-phase">
      <ModuleHead icon="milestone" c="var(--info)" bg="var(--info-bg)" title="阶段结项目标"
        right={<VersionPicker value={month} options={opts} onChange={onChangeMonth} />} />
      <StepBar items={mv.step} />
      <MiniTabs tabs={data.statusTabs} active={tab} onPick={setTab} />
      {items.length === 0 ? <div className="hm-empty">该阶段版本下暂无目标</div> : (
        <div className="hm-card-list">
          {items.map(it => (
            <GoalRow key={it.id} status={it.status} title={it.title} imp={it.imp} prog={it.prog}
              source={{ label: '中短期', ver: it.source.ver, title: it.source.title }}
              onClick={() => onOpen({
                level: 'phase', title: it.title, imp: it.imp, def: it.title, prog: it.prog,
                meta: [{ k: '时间周期', v: mv.range, mono: true }, { k: '负责人', v: it.owner }, { k: '版本', v: 'v' + month, mono: true }],
                up: it.up, down: it.down, kapian: it.kapian, status: it.status,
              })} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------- 模块六 · 周计划 ----------
   作用：最细粒度层。按周展示计划及其「拆解事务」。week 随 month 联动（WEEKS_OF(month)）。
     若该月未拆解出周，显示「规划中」空态。点周计划调 onOpen 传出该周详情（含 tasks 事务列表）。 */
function WeekModule({ month, week, onChangeWeek, onOpen, sectionRef }) {
  const weeks = WEEKS_OF(month);
  const data = HOME_WEEK.byWeek[week] || { step: [], statusTabs: [{ k: '全部', n: 0 }], items: [] };
  const [tab, setTab] = React.useState('全部');
  React.useEffect(() => { setTab('全部'); }, [week]);
  if (!weeks.length) {
    return (
      <section className="hm-sec" ref={sectionRef} id="sec-week">
        <ModuleHead icon="calendar-range" c="var(--ai)" bg="var(--ai-soft)" title="周计划" />
        <div className="hm-empty">该阶段月份的周计划尚未拆解，规划中。</div>
      </section>
    );
  }
  const items = tab === '全部' ? data.items
    : tab === '执行中' ? data.items.filter(i => i.status === 'run')
    : tab === '已验收' ? data.items.filter(i => i.status === 'accepted')
    : data.items.filter(i => i.status === 'draft');
  const opts = weeks.map((w, i) => ({ id: w, num: `${month}.${i + 1}`, sub: w }));
  return (
    <section className="hm-sec" ref={sectionRef} id="sec-week">
      <ModuleHead icon="calendar-range" c="var(--ai)" bg="var(--ai-soft)" title="周计划"
        right={<VersionPicker value={week} options={opts} onChange={onChangeWeek} />} />
      <StepBar items={data.step} />
      <MiniTabs tabs={data.statusTabs} active={tab} onPick={setTab} />
      {items.length === 0 ? <div className="hm-empty">该周暂无周计划</div> : (
        <div className="hm-card-list">
          {items.map(it => (
            <GoalRow key={it.id} status={it.status} title={it.title} imp={it.imp} prog={it.prog}
              source={{ label: '阶段', ver: it.source.ver, title: it.source.title }}
              onClick={() => onOpen({
                level: 'week', title: it.title, imp: it.imp, def: it.steps, prog: it.prog,
                meta: [{ k: '所属周', v: week }, { k: '承接阶段', v: 'v' + it.source.ver, mono: true }],
                up: it.up, tasks: it.tasks,
              })} />
          ))}
        </div>
      )}
    </section>
  );
}

Object.assign(window, { IdealModule, UsersModule, ValueModule, MidModule, PhaseModule, WeekModule, VersionPicker, StepBar, GoalRow, ImpBadge, VerChip, progColor });
