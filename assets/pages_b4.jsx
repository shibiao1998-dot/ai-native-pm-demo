/* ============================================================
   批 4 · 逐环审核（4.1） + 卡点处置（4.2）  —  项目专属
   ------------------------------------------------------------
   作用：拆解链上每个关键要素的「编写 → 审核 → 展示」三段流水；
         反复审核不过即升级为卡点。本文件是 4.1 逐环审核（LoopReview）。
   依赖：承接批 0 设计系统、批 3 目标树（NODE_MAP / NODE_STATUS / NODE_LEVEL / GOAL_TREE）。
   ============================================================ */

const B4_NS = window.NODE_STATUS;      // 节点状态表
const B4_NL = window.NODE_LEVEL;       // 节点层级表
const B4_PC = window.PROG_COLOR;       // 推进度颜色函数
const B4_TREE = window.GOAL_TREE;      // 目标树
const B4_MAP = window.NODE_MAP;        // 扁平化节点索引

/* 段位定义：编写 / 审核 / 展示三段。 */
const SEG = {
  write:  { key: 'write',  label: '编写', icon: 'pencil-line' },
  review: { key: 'review', label: '审核', icon: 'shield-check' },
  show:   { key: 'show',   label: '展示', icon: 'eye' },
};
const SEG_ORDER = ['write', 'review', 'show'];

/* 问题严重度 */
const SEV = {
  blocker: { label: '阻断', c: 'var(--danger)',  bg: 'var(--danger-bg)' },
  major:   { label: '主要', c: 'var(--warning)', bg: 'var(--warning-bg)' },
  minor:   { label: '次要', c: 'var(--text-500)', bg: 'var(--neutral-bg)' },
};

/* segOf — 由节点状态推导出三段流水状态 + 默认 tab + 当前段位。
   例如 status='review' → 编写已完、审核进行中、展示待办，默认打开审核 tab。 */
function segOf(status) {
  switch (status) {
    case 'drafting': return { write: 'current', review: 'todo',    show: 'todo',    tab: 'write',  cur: 'write'  };
    case 'review':   return { write: 'done',    review: 'current', show: 'todo',    tab: 'review', cur: 'review' };
    case 'kapian':   return { write: 'done',    review: 'warn',    show: 'todo',    tab: 'review', cur: 'review' };
    case 'shown':    return { write: 'done',    review: 'done',    show: 'current', tab: 'show',   cur: 'show'   };
    case 'accepted': return { write: 'done',    review: 'done',    show: 'done',    tab: 'show',   cur: 'show'   };
    default:         return { write: 'current', review: 'todo',    show: 'todo',    tab: 'write',  cur: 'write'  };
  }
}

/* siblingsOf — 取节点的同层兑弟（同父），用于「关键要素切换器」。
   根基三要素互为兑弟；其余节点递归查找其父的 children。 */
function siblingsOf(id) {
  for (const root of B4_TREE) {
    if (root.id === id) return B4_TREE;            // 根基三要素互为兄弟
    const found = walkSiblings(root, id);
    if (found) return found;
  }
  return [B4_MAP[id]].filter(Boolean);
}
function walkSiblings(node, id) {
  if (node.children) {
    if (node.children.some(c => c.id === id)) return node.children;
    for (const c of node.children) { const r = walkSiblings(c, id); if (r) return r; }
  }
  return null;
}

/* ============================================================
   逐环审核数据（按关键要素 id 精编；缺省走生成器 buildRecord）
   每条记录结构：draft 起草 / rounds 审核往返轮次 / conclusion 结论 / show 展示定稿 / kapian 卡点详情。
   ⚠ mock 数据。
   ============================================================ */
const REVIEW_AUTHORED = {
  /* 审核中 · 多轮往返 */
  'week-a1a': {
    draft: {
      by: '数据接入 Agent', role: '起草方 · AI 员工 · 数据域', time: '05-31 14:20', version: 'v3',
      intro: '在区域履约链路接入实时路况数据，供调度算法消费，支撑「履约时效 < 4h」阶段目标。',
      blocks: [
        { label: '范围', items: ['覆盖区域主干道与配送末端，早晚高峰与平峰全时段。', '路况字段：拥堵指数、平均车速、事件点位。'] },
        { label: '验收口径', items: ['数据端到端时延 < 30s。', '关键字段完整率 ≥ 99.5%。', '高峰时段不劣化：连续 3 日压测全部达标。'] },
        { label: '依赖', items: ['第三方路况 API：选型与采购（关联事务：路况源选型与采购）。', '实时数据管道：低时延接入与缓存（关联事务：实时数据管道搭建）。'] },
      ],
    },
    rounds: [
      { date: '05-31 15:40', result: 'fail', auditor: 'AI · 独立审核',
        issues: [
          { sev: 'major', text: '验收口径仅写「低时延」，未给出可度量阈值，无法据以验收。' },
          { sev: 'major', text: '未声明高峰时段压测方案，存在高峰劣化未被覆盖的风险。' },
          { sev: 'minor', text: '候选数据源 SLA 未登记，后续追责口径缺失。' },
        ],
        revision: { by: '数据接入 Agent', date: '05-31 17:05', note: '补充端到端时延 < 30s 的量化口径；新增早晚高峰各 1h 的压测方案；登记 2 个候选源的 SLA。' } },
      { date: '06-01 09:10', result: 'fail', auditor: 'AI · 独立审核',
        issues: [
          { sev: 'major', text: '压测仅覆盖单日，样本不足以证明「不劣化」的稳定性。' },
          { sev: 'minor', text: '数据源异常时缺少降级与回滚预案。' },
        ],
        revision: { by: '数据接入 Agent', date: '06-01 11:25', note: '压测扩展至连续 3 日；补充主备源切换与回滚预案，明确降级阈值。' } },
      { date: '06-01 14:30', result: 'reviewing', auditor: 'AI · 独立审核' },
    ],
    conclusion: { state: 'reviewing', date: '06-01 14:30', auditor: 'AI · 独立审核' },
  },

  /* 卡点 · 反复未通过 */
  'phase-a1': {
    draft: {
      by: '调度域 · 路况 Agent', role: '起草方 · AI 员工 · 调度域', time: '05-28 10:05', version: 'v4',
      intro: '区域履约链路端到端时效稳定低于 4 小时，高峰时段不劣化，作为「调度时效提升 30%」的关键阶段目标。',
      blocks: [
        { label: '达成口径', items: ['端到端履约时效 P90 < 4h；高峰时段 P90 < 4.5h。', '连续 2 周达标方可展示。'] },
        { label: '关键依赖', items: ['实时路况数据源（端到端时延 < 30s）。', '调度算法灰度放量到位。'] },
      ],
    },
    rounds: [
      { date: '05-30 16:20', result: 'fail', auditor: 'AI · 独立审核',
        issues: [
          { sev: 'blocker', text: '实时路况数据源未就位，时效口径缺乏可达成的数据基础。' },
          { sev: 'major', text: '高峰时段时效目标缺少压测支撑。' },
        ],
        revision: { by: '调度域 · 路况 Agent', date: '05-31 09:40', note: '接入备选路况源 A，重跑端到端链路并补充高峰压测样本。' } },
      { date: '05-31 18:00', result: 'fail', auditor: 'AI · 独立审核',
        issues: [
          { sev: 'blocker', text: '备选源 A 端到端时延实测 38s，仍高于 30s 口径，时效无法稳定达标。' },
          { sev: 'major', text: '压测留痕不完整，缺少高峰时段连续样本。' },
        ],
        revision: { by: '调度域 · 路况 Agent', date: '06-01 08:30', note: '发起主用路况源采购（已触发大额成本审批），并补齐压测留痕；主用源到位前时效无法收敛。' } },
      { date: '06-01 10:15', result: 'fail', auditor: 'AI · 独立审核',
        issues: [
          { sev: 'blocker', text: '主用路况源采购尚未拍板，数据管道时延无法降至口径内，目标阻断。' },
        ] },
    ],
    conclusion: {
      state: 'fail', date: '06-01 10:15', auditor: 'AI · 独立审核',
      issues: [
        '实时路况数据源时延无法达标（最优 38s > 30s 口径）。',
        '主用数据源采购未拍板，缺乏可收敛时延的数据基础。',
        '高峰时段时效达标缺少连续压测支撑。',
      ],
      kapian: true,
    },
    kapian: {
      stuckSeg: 'review', rounds: 3,
      attempt: '已尝试 2 个备选路况源、调整数据管道批处理窗口与缓存策略，端到端时延最优收敛至 38s，仍高于 30s 验收口径。根因为主用数据源采购未拍板，缺乏可达标的数据基础，AI 多轮往返无法在现有条件下解决。',
      stats: [
        { v: '3', k: '审核往返轮次' },
        { v: '38s', k: '时延最优实测' },
        { v: '30s', k: '验收口径' },
      ],
      links: [
        { icon: 'flag',   k: '父目标 · 中短期', v: '调度时效提升 30%', id: 'mid-a' },
        { icon: 'square-check-big', k: '阻塞依赖 · 事务', v: '路况源选型与采购（待大额成本审批）', id: 'task-1' },
      ],
      ai: '根因在采购未拍板而非编写质量。建议给出修改方向：放行主用源采购并要求补充高峰时段连续压测后重新提交审核。',
    },
  },

  /* 已展示 · 通过定稿 */
  'mid-a': {
    draft: {
      by: '调度域 · 时效 Agent', role: '起草方 · AI 员工 · 调度域', time: '05-10 11:00', version: 'v2',
      intro: '在 6 个月内将区域履约平均时效较立项基线提升 30%，对应理想化状态的「时效优」分支。',
      blocks: [
        { label: '衡量口径', items: ['区域履约平均时效较立项基线下降 ≥ 30%。', '拆解为 2 个阶段目标：履约时效 < 4h、异常自愈率 ≥ 90%。'] },
      ],
    },
    rounds: [
      { date: '05-11 10:20', result: 'fail', auditor: 'AI · 独立审核',
        issues: [
          { sev: 'major', text: '「平均时效」未界定统计口径（均值 / 分位数），易产生歧义。' },
        ],
        revision: { by: '调度域 · 时效 Agent', date: '05-11 15:00', note: '明确采用 P90 分位数口径，并锁定立项基线快照。' } },
      { date: '05-12 09:30', result: 'pass', auditor: 'AI · 独立审核' },
    ],
    conclusion: { state: 'pass', date: '05-12 09:30', auditor: 'AI · 独立审核', passNote: '口径清晰、可度量、拆解充分，具备展示资格。' },
    show: {
      synced: true, syncedAt: '05-12 09:31',
      finalIntro: '在 6 个月内将区域履约平均时效（P90）较立项基线提升 30%，对应理想化状态的「时效优」分支。',
      finalBlocks: [
        { label: '衡量口径', items: ['区域履约时效 P90 较立项基线快照下降 ≥ 30%。'] },
        { label: '拆解', items: ['阶段目标①：履约时效 < 4h。', '阶段目标②：异常调度自愈率 ≥ 90%。'] },
      ],
    },
  },

  /* 编写中 · 审核未开始 */
  'week-b1a': {
    draft: {
      by: '算力调度 Agent', role: '起草方 · AI 员工 · 算力域', time: '05-31 16:40', version: 'v1 · 草稿',
      intro: '按负载弹性伸缩推理资源，高峰扩容、低谷回收，降低闲置算力成本，支撑「算力成本优化」阶段目标。',
      blocks: [
        { label: '初稿要点', items: ['定义推理配额的弹性伸缩规则与成本上限。', '高峰自动扩容、低谷回收，目标闲置率 < 8%。'] },
        { label: '待补充', items: ['弹性阈值与冷启动时延的量化口径仍在编写。'] },
      ],
    },
    rounds: [],
    conclusion: { state: 'drafting' },
  },
};

/* buildRecord — 生成器：未精编的节点按其状态生成合理的三段记录。
   优先取 REVIEW_AUTHORED[id]，没有则按 status（drafting/review/shown）造出对应的草稿+往返+结论。 */
function buildRecord(node) {
  if (REVIEW_AUTHORED[node.id]) return REVIEW_AUTHORED[node.id];
  const lvl = B4_NL[node.level];
  const draft = {
    by: (node.ai || 'AI 起草') + ' Agent', role: '起草方 · AI 员工', time: '05-30 10:00', version: 'v1',
    intro: node.def || `${node.title} 的关键要素定义。`,
    blocks: [
      { label: '关联', items: (node.rel || []).map(r => r.t) },
    ].filter(b => b.items.length),
  };
  const st = node.status;
  if (st === 'drafting') {
    return { draft, rounds: [], conclusion: { state: 'drafting' } };
  }
  if (st === 'review') {
    return {
      draft,
      rounds: [
        { date: '05-30 14:00', result: 'fail', auditor: 'AI · 独立审核',
          issues: [{ sev: 'major', text: '定义需补充可度量的验收口径，避免展示后无法验收。' }],
          revision: { by: draft.by, date: '05-30 16:30', note: '补充量化口径与边界条件，重新提交审核。' } },
        { date: '05-31 09:00', result: 'reviewing', auditor: 'AI · 独立审核' },
      ],
      conclusion: { state: 'reviewing', date: '05-31 09:00', auditor: 'AI · 独立审核' },
    };
  }
  // shown / accepted → 通过定稿
  return {
    draft,
    rounds: [
      { date: '05-24 11:00', result: 'fail', auditor: 'AI · 独立审核',
        issues: [{ sev: 'minor', text: '措辞需更精确，统计口径补充说明。' }],
        revision: { by: draft.by, date: '05-24 15:00', note: '按意见修订并锁定口径。' } },
      { date: '05-25 10:00', result: 'pass', auditor: 'AI · 独立审核' },
    ],
    conclusion: { state: 'pass', date: '05-25 10:00', auditor: 'AI · 独立审核', passNote: '内容清晰、口径明确，具备展示资格。' },
    show: { synced: true, syncedAt: '05-25 10:01', finalIntro: node.def, finalBlocks: draft.blocks },
  };
}

/* ============================================================
   小组件
   ------------------------------------------------------------
   FlowStepper 段位流水条 / ElementSwitcher 关键要素切换器 /
   WriteTab・ReviewTab・ShowTab 三个 tab / RoundItem 单轮往返。
   ============================================================ */

/* FlowStepper — 顶部「编写→审核→展示」流水条。根据 seg 状态上色与打时间戳。 */
function FlowStepper({ seg, rec }) {
  const stamp = (k) => {
    if (k === 'write') return rec.draft ? rec.draft.time : '—';
    if (k === 'review') return rec.conclusion && rec.conclusion.date ? rec.conclusion.date : '—';
    if (k === 'show') return rec.show && rec.show.syncedAt ? rec.show.syncedAt : '—';
  };
  const vText = (k, state) => {
    if (k === 'write') return state === 'current' ? '编写中' : '已编写';
    if (k === 'review') return state === 'current' ? '审核中' : state === 'warn' ? '卡点' : state === 'done' ? '已通过' : '待审核';
    if (k === 'show') return state === 'current' ? '已展示' : state === 'done' ? '已验收' : '未展示';
  };
  return (
    <div className="lr-flow">
      {SEG_ORDER.map((k, i) => {
        const state = seg[k];
        const s = SEG[k];
        const iconName = state === 'done' ? (k === 'show' ? s.icon : 'check') : state === 'warn' ? 'alert-triangle' : s.icon;
        const iconColor = (state === 'done' || state === 'current' || state === 'warn') ? '#fff' : 'var(--text-400)';
        return (
          <React.Fragment key={k}>
            {i > 0 && <span className="lr-flow-arrow"><Icon name="chevron-right" size={18} color="var(--border-300)" /></span>}
            <div className="lr-flow-seg" data-on={state}>
              <span className="lr-flow-node"><Icon name={iconName} size={16} color={iconColor} /></span>
              <div className="lr-flow-main">
                <div className="lr-flow-k">{s.label}</div>
                <div className="lr-flow-v">{vText(k, state)}<span className="mono" style={{ fontWeight: 400, fontSize: 11, color: 'var(--text-400)', marginLeft: 6 }}>{stamp(k)}</span></div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ElementSwitcher — 关键要素切换器（在同层兑弟间切换审核）。
   open 控下拉，点外部关闭；选中后 onPick(id) 切换当前要素。 */
function ElementSwitcher({ nodeId, onPick }) {
  const [open, setOpen] = React.useState(false);
  const sibs = siblingsOf(nodeId);
  const cur = B4_MAP[nodeId];
  React.useEffect(() => {
    if (!open) return;
    const h = () => setOpen(false);
    window.addEventListener('click', h);
    return () => window.removeEventListener('click', h);
  }, [open]);
  return (
    <div className="lr-switch" onClick={e => e.stopPropagation()}>
      <button className="lr-switch-btn" onClick={() => setOpen(o => !o)}>
        <Icon name="arrow-left-right" size={14} color="var(--text-500)" />
        <span className="lbl">{cur ? cur.title : '切换要素'}</span>
        <Icon name="chevrons-up-down" size={13} color="var(--text-400)" />
      </button>
      {open && (
        <div className="lr-switch-menu">
          <div className="lr-switch-menu-head">同层关键要素 · 切换审核</div>
          {sibs.map(n => {
            const st = B4_NS[n.status], lvl = B4_NL[n.level];
            return (
              <button key={n.id} className="lr-switch-opt" data-on={n.id === nodeId} onClick={() => { onPick(n.id); setOpen(false); }}>
                <span className="lr-switch-opt-ico" style={{ background: st.bg }}><Icon name={lvl.icon} size={15} color={st.c} /></span>
                <span className="lr-switch-opt-main">
                  <span className="lr-switch-opt-title">{n.title}</span>
                  <span className="lr-switch-opt-sub">{lvl.label} · {st.label}</span>
                </span>
                {n.id === nodeId && <Icon name="check" size={15} color="var(--blue-primary)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* WriteTab — 编写 tab：展示起草人/版本/时间与草稿文档内容。 */
function WriteTab({ rec }) {
  const d = rec.draft;
  return (
    <div className="lr-panel">
      <div className="lr-draft-meta">
        <span className="lr-draft-av">{d.by[0]}</span>
        <div style={{ minWidth: 0 }}>
          <div className="lr-draft-by">{d.by}</div>
          <div className="lr-draft-role">{d.role}</div>
        </div>
        <span className="lr-draft-tag"><Icon name="git-commit-horizontal" size={13} color="var(--text-400)" />版本 <span className="mono">{d.version}</span></span>
        <span className="lr-draft-tag"><Icon name="clock" size={13} color="var(--text-400)" /><span className="mono">{d.time}</span></span>
      </div>

      <div className="lr-doc">
        <div className="lr-doc-intro">{d.intro}</div>
        {d.blocks.map((b, i) => (
          <div className="lr-doc-block" key={i}>
            <div className="lr-doc-block-label"><span className="bar" />{b.label}</div>
            <ul className="lr-doc-list">
              {b.items.map((it, j) => <li key={j}><span className="dot" />{it}</li>)}
            </ul>
          </div>
        ))}
        <div className="lr-draft-watermark"><Icon name="bot" size={13} color="var(--text-400)" />由 AI 员工起草，提交独立审核后方可进入展示位。</div>
      </div>
    </div>
  );
}

/* RoundItem — 单轮审核往返（可折叠）：显示本轮裁决 + 问题列表 + 起草方修订回应。 */
function RoundItem({ round, idx, total, defaultOpen }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const r = round.result;
  const verdictText = r === 'pass' ? '通过' : r === 'reviewing' ? '审核中' : '未通过';
  const verdictIcon = r === 'pass' ? 'check' : r === 'reviewing' ? 'loader-2' : 'x';
  const issueCount = round.issues ? round.issues.length : 0;
  return (
    <div className="lr-round">
      <span className="lr-round-dot" data-r={r} />
      <div className="lr-round-card">
        <button className="lr-round-bar" onClick={() => setOpen(o => !o)}>
          <span className="lr-round-no">第 {idx + 1} / {total} 轮</span>
          <span className="lr-round-verdict" data-r={r}><Icon name={verdictIcon} size={12} color="currentColor" className={r === 'reviewing' ? 'spin' : ''} />{verdictText}</span>
          {issueCount > 0 && <span className="t-micro" style={{ color: 'var(--text-500)' }}>{issueCount} 项问题</span>}
          <span className="lr-round-meta"><span className="mono">{round.date}</span><Icon name="chevron-right" size={15} color="var(--text-400)" className="lr-round-chev" data-open={open} /></span>
        </button>
        {open && (
          <div className="lr-round-body">
            {r === 'reviewing' ? (
              <div className="lr-round-side"><span className="av aud">审</span>{round.auditor} · 正在核对本轮修订…</div>
            ) : (
              <>
                <div className="lr-round-side"><span className="av aud">审</span>{round.auditor} · 审核意见</div>
                <ul className="lr-issues">
                  {round.issues.map((is, k) => {
                    const sv = SEV[is.sev];
                    return (
                      <li className="lr-issue" key={k}>
                        <span className="lr-issue-sev" style={{ color: sv.c, background: sv.bg }}>{sv.label}</span>
                        <span className="lr-issue-text">{is.text}</span>
                      </li>
                    );
                  })}
                </ul>
                {round.revision && (
                  <>
                    <div className="lr-round-side"><span className="av wri">起</span>{round.revision.by} · 修订回应</div>
                    <div className="lr-revision">
                      <div className="lr-revision-note">{round.revision.note}</div>
                      <div className="lr-revision-meta">已修订并重新提交 · <span className="mono">{round.revision.date}</span></div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ReviewTab — 审核 tab：多轮往返记录 + 审核结论条（通过/审核中/未通过）。
   未通过且 kapian=true 时展示「已升级卡点」并提供 onEnterKapian 跳卡点处置。 */
function ReviewTab({ rec, onEnterKapian }) {
  const c = rec.conclusion;
  const rounds = rec.rounds || [];
  if (c.state === 'drafting') {
    return (
      <div className="lr-panel">
        <EmptyState glyph="shield" title="审核尚未开始" desc="该关键要素仍在编写阶段，起草完成并提交后，独立审核角色将进入逐轮把关。" />
      </div>
    );
  }
  return (
    <div className="lr-panel">
      <div className="lr-rev-head">
        <Icon name="shield-check" size={17} color="var(--blue-primary)" />
        <span className="t">独立审核 · 往返迭代记录</span>
        <span className="cnt">默认严格把关 · 已往返 <span className="mono">{rounds.length}</span> 轮</span>
      </div>

      {c.state === 'reviewing' && (
        <div className="lr-aiproc">
          <span className="lr-aiproc-spin" />
          <div className="lr-aiproc-main">
            <div className="lr-aiproc-step">独立审核进行中 · 正在核对第 {rounds.length} 轮修订…</div>
            <div className="lr-aiproc-sub">逐项比对验收口径与压测留痕，结论生成后将更新审核结论条。</div>
          </div>
        </div>
      )}

      <div className="lr-rounds">
        {rounds.map((rd, i) => (
          <RoundItem key={i} round={rd} idx={i} total={rounds.length} defaultOpen={i === rounds.length - 1} />
        ))}
      </div>

      {/* 审核结论条 */}
      {c.state === 'pass' && (
        <div className="lr-concl" data-r="pass">
          <span className="lr-concl-ico"><Icon name="circle-check" size={20} color="var(--success)" /></span>
          <div className="lr-concl-main">
            <div className="lr-concl-title">审核通过 · 已具备展示资格</div>
            <div className="lr-concl-sub">{c.passNote} · {c.auditor} · <span className="mono">{c.date}</span></div>
          </div>
        </div>
      )}
      {c.state === 'reviewing' && (
        <div className="lr-concl" data-r="reviewing">
          <span className="lr-concl-ico"><Icon name="loader-2" size={20} color="var(--ai)" className="spin" /></span>
          <div className="lr-concl-main">
            <div className="lr-concl-title">审核中 · 结论待生成</div>
            <div className="lr-concl-sub">通过一条才会同步到展示位；未通过将标注具体问题并退回修订。</div>
          </div>
        </div>
      )}
      {c.state === 'fail' && (
        <div className="lr-concl" data-r="fail">
          <span className="lr-concl-ico"><Icon name="x-circle" size={20} color="var(--danger)" /></span>
          <div className="lr-concl-main">
            <div className="lr-concl-title">审核未通过 · 具体问题如下</div>
            <div className="lr-concl-sub">{c.auditor} · <span className="mono">{c.date}</span></div>
            <ol className="lr-concl-issues">
              {c.issues.map((is, i) => <li key={i}><span className="n">{String(i + 1).padStart(2, '0')}</span><span>{is}</span></li>)}
            </ol>
            {c.kapian && (
              <div className="lr-concl-kapian">
                <Icon name="alert-triangle" size={16} color="var(--warning)" />
                <span className="t">多轮往返仍无法解决，已升级为<b style={{ color: 'var(--warning)' }}>卡点</b>，需管理层介入处置。</span>
                <Button variant="secondary" size="sm" icon="arrow-up-right" onClick={onEnterKapian}>卡点处置</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ShowTab — 展示 tab：体现「通过一条、展示一条」原则。
   已同步（show.synced）显定稿；未通过显问题并不上墙；审核中/编写中显待展示。 */
function ShowTab({ rec }) {
  const c = rec.conclusion;
  // 已通过 → 同步展示定稿
  if (rec.show && rec.show.synced) {
    return (
      <div className="lr-panel">
        <div className="lr-show-banner" data-s="synced">
          <Icon name="eye" size={18} color="var(--info)" />
          <div className="lr-show-banner-main">
            <div className="lr-show-banner-t">已同步到展示位 · 对外正式呈现</div>
            <div className="lr-show-banner-s">审核通过后，该关键要素的定稿已上墙展示。</div>
          </div>
          <span className="lr-show-stamp"><Icon name="clock" size={13} color="var(--text-400)" />同步于 <span className="mono">{rec.show.syncedAt}</span></span>
        </div>
        <div className="lr-doc">
          <div className="lr-doc-intro">{rec.show.finalIntro}</div>
          {rec.show.finalBlocks.map((b, i) => (
            <div className="lr-doc-block" key={i}>
              <div className="lr-doc-block-label"><span className="bar" style={{ background: 'var(--success)' }} />{b.label}</div>
              <ul className="lr-doc-list">
                {b.items.map((it, j) => <li key={j}><span className="dot" style={{ background: 'var(--success)' }} />{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="lr-show-rule"><Icon name="info" size={14} color="var(--text-400)" />通过一条、展示一条 —— 仅审核通过的定稿才会同步到展示位。</div>
      </div>
    );
  }
  // 未通过 / 卡点 → 标未通过 + 具体问题
  if (c.state === 'fail') {
    return (
      <div className="lr-panel">
        <div className="lr-show-banner" data-s="failed">
          <Icon name="eye-off" size={18} color="var(--danger)" />
          <div className="lr-show-banner-main">
            <div className="lr-show-banner-t">未通过 · 暂不同步展示位</div>
            <div className="lr-show-banner-s">审核未通过的内容不会对外展示，下列具体问题需先解决。</div>
          </div>
        </div>
        <ol className="lr-concl-issues" style={{ marginTop: 0 }}>
          {c.issues.map((is, i) => <li key={i}><span className="n">{String(i + 1).padStart(2, '0')}</span><span>{is}</span></li>)}
        </ol>
        <div className="lr-show-rule"><Icon name="info" size={14} color="var(--text-400)" />通过一条才同步到展示位；当前停留在审核环，未取得展示资格。</div>
      </div>
    );
  }
  // 审核中 / 编写中 → 待展示
  return (
    <div className="lr-panel">
      <div className="lr-show-banner" data-s="pending">
        <Icon name="hourglass" size={18} color="var(--text-500)" />
        <div className="lr-show-banner-main">
          <div className="lr-show-banner-t">尚未取得展示资格</div>
          <div className="lr-show-banner-s">{c.state === 'reviewing' ? '正处于审核环，审核通过后将自动同步展示位。' : '仍在编写阶段，完成编写与审核后才会展示。'}</div>
        </div>
      </div>
      <div className="lr-show-pending">
        <EmptyState glyph="eye" title="通过一条，展示一条" desc="只有审核通过的定稿才会同步到展示位对外呈现，确保展示内容均已逐环把关。" />
      </div>
    </div>
  );
}

/* ============================================================
   页面 4.1 · 逐环审核
   ------------------------------------------------------------
   LoopReview：状态 curId 当前要素（可由入参 nodeId 跨页指定）；tab 当前页签。
     rec 由 buildRecord(node) 得出；seg 由节点状态推导。切换要素时重置默认 tab。
     enterKapian：跳转卡点处置页并携带 curId。 */
function LoopReview({ nodeId, onNavigate }) {
  const [curId, setCurId] = React.useState(nodeId || 'week-a1a');
  const node = B4_MAP[curId] || B4_MAP['week-a1a'];
  const rec = React.useMemo(() => buildRecord(node), [node]);
  const seg = segOf(node.status);
  const [tab, setTab] = React.useState(seg.tab);

  React.useEffect(() => { setCurId(nodeId || 'week-a1a'); }, [nodeId]);
  React.useEffect(() => { setTab(segOf(node.status).tab); }, [curId]);

  const lvl = B4_NL[node.level];
  const st = B4_NS[node.status];
  const p = window.PROJECT_META || { name: '智能履约调度中台', pid: 'PRJ-2026-0137' };
  const enterKapian = () => onNavigate && onNavigate('p-kapian', { nodeId: curId });

  const tabs = [
    { k: 'write', ...SEG.write, dot: seg.write },
    { k: 'review', ...SEG.review, dot: seg.review },
    { k: 'show', ...SEG.show, dot: seg.show },
  ];
  const dotColor = (s) => s === 'done' ? 'var(--success)' : s === 'current' ? 'var(--blue-primary)' : s === 'warn' ? 'var(--warning)' : 'var(--border-300)';

  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: p.name }, { label: '目标树' }, { label: node.title }]} />
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico"><Icon name="shield-check" size={22} color="var(--blue-primary)" /></span>
          <div>
            <h1 className="t-h1">逐环审核</h1>
          </div>
        </div>
        <div className="page-head-right">
          <span className="lr-seg-chip" style={{ background: seg.cur === 'review' && node.status === 'kapian' ? 'var(--warning-bg)' : st.bg, color: st.c }}>
            <Icon name={st.icon} size={14} color={st.c} className={st.spin ? 'spin' : ''} />当前：{st.label}
          </span>
          <ElementSwitcher nodeId={curId} onPick={setCurId} />
          <FeedbackEntry onClick={() => {}} />
        </div>
      </div>

      <FlowStepper seg={seg} rec={rec} />

      <div className="lr-layout">
        <div className="lr-main">
          <div className="lr-elhead">
            <div className="lr-elhead-top">
              <span className="lr-elhead-ico" style={{ background: st.bg }}><Icon name={lvl.icon} size={20} color={st.c} /></span>
              <div className="lr-elhead-main">
                <span className="lr-elhead-level"><Icon name={lvl.icon} size={12} color="var(--text-400)" />{lvl.label}</span>
                <div className="lr-elhead-title">{node.title}</div>
                <div className="lr-elhead-pills">
                  <span className="pill" style={{ background: st.bg, color: st.c }}><Icon name={st.icon} size={13} color={st.c} className={st.spin ? 'spin' : ''} />{st.label}</span>
                  <span className="gt-ai-staff"><span className="av">{node.ai[0]}</span>起草 {node.ai}</span>
                  <span className="gt-ai-staff"><span className="av" style={{ background: 'var(--blue-tint)', color: 'var(--blue-primary)' }}>审</span>审核 AI · 独立审核</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lr-tabs">
            {tabs.map(t => (
              <button key={t.k} className="lr-tab" data-on={tab === t.k} onClick={() => setTab(t.k)}>
                <span className="lr-tab-dot" style={{ background: dotColor(t.dot) }} />
                <Icon name={t.icon} size={15} color={tab === t.k ? 'var(--text-900)' : 'var(--text-500)'} />{t.label}
              </button>
            ))}
          </div>

          {tab === 'write' && <WriteTab rec={rec} />}
          {tab === 'review' && <ReviewTab rec={rec} onEnterKapian={enterKapian} />}
          {tab === 'show' && <ShowTab rec={rec} />}
        </div>

        {/* 关联侧栏 */}
        <aside className="lr-rail">
          <div className="lr-rail-card">
            <div className="lr-rail-label">推进度</div>
            <div className="lr-rail-prog">
              <span className="lr-rail-prog-bar"><span className="lr-rail-prog-fill" style={{ width: node.progress + '%', background: B4_PC(node.status) }} /></span>
              <span className="lr-rail-prog-n">{node.progress}%</span>
            </div>
            <div style={{ marginTop: 14 }}>
              <div className="lr-rail-stat"><span className="lr-rail-stat-k"><Icon name="repeat" size={14} color="var(--text-400)" />审核往返</span><span className="lr-rail-stat-v mono">{(rec.rounds || []).length} 轮</span></div>
              <div className="lr-rail-stat"><span className="lr-rail-stat-k"><Icon name="git-commit-horizontal" size={14} color="var(--text-400)" />当前版本</span><span className="lr-rail-stat-v mono">{rec.draft.version}</span></div>
              <div className="lr-rail-stat"><span className="lr-rail-stat-k"><Icon name="activity" size={14} color="var(--text-400)" />当前段位</span><span className="lr-rail-stat-v">{SEG[seg.cur].label}</span></div>
            </div>
          </div>

          {node.status === 'kapian' && (
            <div className="lr-rail-card warn">
              <div className="lr-rail-warn-head"><Icon name="alert-triangle" size={15} color="var(--warning)" />已升级为卡点</div>
              <div className="lr-rail-warn-body">独立审核多轮往返仍未通过，需管理层介入处置。</div>
              <Button variant="primary" size="sm" icon="arrow-up-right" onClick={enterKapian}>进入卡点处置</Button>
            </div>
          )}

          {node.rel && (
            <div className="lr-rail-card">
              <div className="lr-rail-label">关联节点</div>
              <div className="lr-rel">
                {node.rel.map((r, i) => (
                  <button className="lr-rel-item" key={i} onClick={() => B4_MAP[r.id] && setCurId(r.id)} disabled={!B4_MAP[r.id]}>
                    <Icon name="git-fork" size={13} color="var(--text-400)" />
                    <span style={{ minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.t}</span>
                    {B4_MAP[r.id] && <Icon name="arrow-right" size={13} color="var(--text-400)" className="arr" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="lr-rail-card">
            <div className="lr-rail-label">返回</div>
            <div className="lr-rel">
              <button className="lr-rel-item" onClick={() => onNavigate && onNavigate('p-tree')}>
                <Icon name="git-fork" size={13} color="var(--text-400)" /><span>返回目标树</span><Icon name="arrow-right" size={13} color="var(--text-400)" className="arr" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { LoopReview, B4_MAP, buildRecord, SEV, SEG, RoundItem, siblingsOf });
