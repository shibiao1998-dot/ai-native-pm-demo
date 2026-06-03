/* ============================================================
   风险与卡点（项目专属工作区 · p-risk）
   项目级风险登记册：列表 → 完整风险档案（等级 / 影响 / 应对 / 责任 AI）。
   风险由风险预警 Agent 持续识别、分级与跟踪，管理层可介入。
   ============================================================ */

const RK_LEVEL = {
  high: { label: '高', c: 'var(--danger)', bg: 'var(--danger-bg)', tone: 'danger' },
  mid:  { label: '中', c: 'var(--warning)', bg: 'var(--warning-bg)', tone: 'warning' },
  low:  { label: '低', c: 'var(--success)', bg: 'var(--success-bg)', tone: 'success' },
};
const RK_STATUS = {
  open:       { label: '未处置', c: 'var(--danger)', bg: 'var(--danger-bg)', icon: 'circle-alert' },
  mitigating: { label: '处置中', c: 'var(--warning)', bg: 'var(--warning-bg)', icon: 'loader-2' },
  watching:   { label: '观察中', c: 'var(--info)', bg: 'var(--info-bg)', icon: 'eye' },
  closed:     { label: '已闭环', c: 'var(--success)', bg: 'var(--success-bg)', icon: 'circle-check' },
};
const RK_CAT = {
  depend: '外部依赖', tech: '技术稳定性', cost: '成本', schedule: '进度', quality: '质量',
};

const RK_RISKS = [
  {
    id: 'RK-0137-01', level: 'high', cat: 'depend', status: 'mitigating', owner: '风险预警 Agent',
    title: '实时路况数据源单点依赖', found: '05-28', goal: '阶段目标：履约时效 < 4h',
    desc: '履约时效强依赖单一第三方实时路况数据源，该源连续两次联通失败已两度阻断阶段目标。属典型外部依赖单点风险。',
    impactStats: [{ v: '高', k: '风险等级', deltaTone: 'danger' }, { v: '2', unit: '次', k: '已致阻断', deltaTone: 'danger' }, { v: '1', unit: '个', k: '受威胁阶段目标' }],
    impactList: [
      { text: '直接威胁阶段目标「履约时效 < 4h」，曾两次验收未通过', icon: 'target', tone: 'danger' },
      { text: '下游 2 个周目标推进受阻', icon: 'git-fork', tone: 'warning' },
    ],
    plan: [
      { act: '接入第二路况数据源，建立双源冗余', actor: '数据接入 Agent', desc: '已完成选型比价，采购上抛大额审批，待放行后接入。', done: true },
      { act: '单源故障自动切换 + 降级兜底', actor: '执行编排 Agent', desc: '接口超时即切换备源，仍失败则启用历史均值降级。', done: true },
      { act: '接入后重跑阶段验收', actor: '验收 Agent', desc: '双源就绪后自动重跑「履约时效 < 4h」验收。', done: false },
    ],
    trace: [
      { act: '风险预警 Agent 识别单点依赖并定级「高」', actor: '05-28 · 自动', ai: true },
      { act: '触发理想化状态复盘，新增「双源冗余」约束', actor: '05-28 · 自动', ai: true },
      { act: '采购第二数据源 · 上抛大额成本审批', actor: '06-01 · 自动', ai: true },
    ],
  },
  {
    id: 'RK-0137-02', level: 'high', cat: 'tech', status: 'open', owner: '风险预警 Agent',
    title: '调度 AI 员工调用超时率突增', found: '今日', goal: '中短期目标：调度时效提升 30%',
    desc: '调度 AI 员工调用超时率由 1.1% 突增至 6.2%，超过实时阈值（5%），已自动降级保护，但根因（算力 / 依赖服务）待核查。',
    impactStats: [{ v: '6.2%', k: '调用超时率', deltaTone: 'danger', delta: '突增' }, { v: '5%', k: '实时阈值' }, { v: '已降级', k: '保护状态', deltaTone: 'warning' }],
    impactList: [
      { text: '实时调度时效受影响，威胁中短期目标', icon: 'target', tone: 'danger' },
      { text: '已自动排队降级，避免雪崩，但用户感知时延上升', icon: 'server', tone: 'warning' },
    ],
    plan: [
      { act: '超时请求自动降级排队', actor: '调度 Agent', desc: '已对超时调用启用排队降级，防止级联失败。', done: true },
      { act: '核查算力与依赖服务状态', actor: '管理层 / 现场', desc: '已上抛介入工作台，建议立即转入项目现场核查。', done: false },
    ],
    trace: [
      { act: '监控 Agent 实时阈值告警（超时率 6.2%）', actor: '刚刚 · 自动', ai: true },
      { act: '调度 Agent 自动降级保护', actor: '刚刚 · 自动', ai: true },
      { act: '风险级预警越级高亮至介入工作台', actor: '刚刚 · 自动', ai: true },
    ],
  },
  {
    id: 'RK-0137-03', level: 'mid', cat: 'cost', status: 'watching', owner: '风险预警 Agent',
    title: '高峰时段算力成本超预算风险', found: '05-30', goal: '中短期目标：单均成本下降 15%',
    desc: '高峰时段推理算力消耗高于预期，若维持当前增速，本季度算力成本预计超预算约 9%，尚未触及硬上限。',
    impactStats: [{ v: '+9%', k: '预计超预算', deltaTone: 'warning' }, { v: '中', k: '风险等级', deltaTone: 'warning' }, { v: '未触限', k: '当前状态' }],
    impactList: [
      { text: '可能侵蚀中短期目标「单均成本下降 15%」', icon: 'target', tone: 'warning' },
      { text: '尚在预算软区间，未触发硬上限阻断', icon: 'wallet', tone: 'neutral' },
    ],
    plan: [
      { act: '高峰算力弹性配额 + 低峰自动回收', actor: '资源 Agent', desc: '已上线弹性策略，仅高峰临时扩容，低峰回收。', done: true },
      { act: '持续观察一个结算周期再决策', actor: '风险预警 Agent', desc: '若超预算趋势延续则升级为「高」并上抛审批。', done: false },
    ],
    trace: [
      { act: '风险预警 Agent 监测到算力成本上行并定级「中」', actor: '05-30 · 自动', ai: true },
      { act: '上线高峰弹性配额策略', actor: '06-01 · 自动', ai: true },
    ],
  },
  {
    id: 'RK-0137-04', level: 'low', cat: 'quality', status: 'closed', owner: '风险预警 Agent',
    title: '灰度回滚演练覆盖不足', found: '05-20', goal: '阶段目标：调度算法灰度上线',
    desc: '调度算法灰度上线初期，回滚演练仅覆盖区域维度、未覆盖时段维度，存在回滚盲区。现已补齐演练，风险闭环。',
    impactStats: [{ v: '低', k: '风险等级', deltaTone: 'success' }, { v: '已闭环', k: '当前状态', deltaTone: 'success' }, { v: '3.2s', k: '回滚实测时延' }],
    impactList: [
      { text: '曾存在时段维度回滚盲区，已补齐演练', icon: 'shield-check', tone: 'success' },
      { text: '回滚时延 3.2s 达标，灰度上线风险已闭环', icon: 'circle-check', tone: 'success' },
    ],
    plan: [
      { act: '补充时段维度回滚演练', actor: '执行编排 Agent', desc: '补齐区域 × 时段两维回滚演练，验证回滚时延。', done: true },
      { act: '纳入灰度上线默认检查项', actor: '逐环审核 Agent', desc: '将「双维回滚演练」设为灰度上线验收硬约束。', done: true },
    ],
    trace: [
      { act: '风险预警 Agent 识别回滚盲区并定级「低」', actor: '05-20 · 自动', ai: true },
      { act: '补齐双维回滚演练', actor: '05-22 · 自动', ai: true },
      { act: '复核通过 · 风险闭环', actor: '05-23 · 自动', ai: true },
    ],
  },
];

/* ---------- 风险档案抽屉 ---------- */
function RiskDrawer({ risk, onClose }) {
  if (!risk) return null;
  const lv = RK_LEVEL[risk.level];
  const st = RK_STATUS[risk.status];
  const doneCount = risk.plan.filter(p => p.done).length;
  const verdictTone = risk.status === 'closed' ? 'pass' : risk.level === 'high' ? 'stop' : 'warn';
  return (
    <Drawer open={!!risk} onClose={onClose} width={620}
      title={risk.title} sub={`${risk.id} · ${RK_CAT[risk.cat]} · 风险档案`}
      icon={{ name: 'alert-triangle', color: lv.c }}
      headRight={
        <FeedbackEntry label="反馈"
          context={{ scene: '风险与卡点 · 风险档案', did: `当前查看「${risk.title}」的完整风险档案（等级、影响、应对方案与责任 AI）`, ask: '该风险的定级、影响判断或应对方案' }}
          onClick={() => {}} />
      }>
      <DocDoc>
        <DocBanner tone={risk.status === 'closed' ? 'success' : lv.tone} icon={st.icon}>
          {risk.status === 'closed'
            ? '该风险已完成应对并闭环，以下为存档的完整风险档案。'
            : `该风险由风险预警 Agent 持续跟踪，当前「${st.label}」。以下为完整风险档案。`}
        </DocBanner>

        <DocSec no="01" title="风险概要" icon="file-badge">
          <DocMeta items={[
            { k: '风险等级', v: <span style={{ color: lv.c, fontWeight: 600 }}>{lv.label}风险</span> },
            { k: '风险类别', v: RK_CAT[risk.cat] },
            { k: '当前状态', v: <span style={{ color: st.c, fontWeight: 600 }}>{st.label}</span> },
            { k: '责任 AI', v: <span style={{ color: 'var(--ai)' }}>{risk.owner}</span> },
            { k: '发现时间', v: risk.found },
            { k: '关联目标', v: risk.goal },
          ]} />
        </DocSec>

        <DocSec no="02" title="风险描述" icon="alert-triangle">
          <DocPara>{risk.desc}</DocPara>
        </DocSec>

        <DocSec no="03" title="影响面" icon="radar">
          <DocStats items={risk.impactStats} />
          <div style={{ marginTop: 14 }}><DocList items={risk.impactList} /></div>
        </DocSec>

        <DocSec no="04" title={`应对方案 · ${doneCount}/${risk.plan.length} 已执行`} icon="shield-check">
          <DocChain items={risk.plan.map(p => ({
            act: p.act, actor: p.actor, ai: !/管理层|现场/.test(p.actor), desc: p.desc,
            when: p.done ? '已执行' : '待执行',
          }))} />
        </DocSec>

        <DocSec no="05" title="责任 AI 与处置进展" icon="bot">
          <DocVerdict tone={verdictTone} icon={st.icon} title={`${risk.owner} · ${st.label}`}>
            {risk.status === 'closed'
              ? '风险已闭环，应对措施已纳入默认检查项，防止复发。'
              : risk.status === 'open'
                ? '风险待处置，已上抛介入工作台，部分自动化保护措施已生效，剩余动作需管理层 / 现场介入。'
                : '风险预警 Agent 正按应对方案持续处置与观察，达到收敛条件后自动闭环。'}
          </DocVerdict>
        </DocSec>

        <DocSec no="06" title="留痕" icon="history">
          <DocChain items={risk.trace} />
        </DocSec>
      </DocDoc>
    </Drawer>
  );
}

/* ---------- 主页面 ---------- */
function RiskRegister({ project, onNavigate }) {
  const [loading, setLoading] = React.useState(true);
  const [active, setActive] = React.useState(null);
  const [filter, setFilter] = React.useState('all');
  const [toast, setToast] = React.useState(null);
  const p = window.PROJECT_META || { name: '智能履约调度中台', pid: 'PRJ-2026-0137' };
  React.useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);
  React.useEffect(() => { refreshIcons(); });

  const counts = { high: 0, mid: 0, low: 0, open: 0 };
  RK_RISKS.forEach(r => { counts[r.level]++; if (r.status !== 'closed') counts.open++; });

  const list = RK_RISKS.filter(r => filter === 'all' ? true : filter === 'open' ? r.status !== 'closed' : r.level === filter);

  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: p.name }, { label: '风险与卡点' }]} />
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico"><Icon name="alert-triangle" size={22} color="var(--blue-primary)" /></span>
          <div>
            <h1 className="t-h1">风险与卡点</h1>
          </div>
        </div>
        <div className="page-head-right">
          <FeedbackEntry
            context={{ scene: '风险与卡点', did: `本项目当前有 ${counts.open} 条未闭环风险（高 ${counts.high} / 中 ${counts.mid} / 低 ${counts.low}），由风险预警 Agent 跟踪`, ask: '某条风险的定级、影响或应对方案' }}
            onClick={() => setToast({ msg: '异步反馈入口已打开（演示）' })} />
        </div>
      </div>

      <div className="dk-stats" style={{ marginBottom: 18 }}>
        {[['high', '高风险'], ['mid', '中风险'], ['low', '低风险'], ['open', '未闭环']].map(([k, label]) => (
          <button key={k} className="dk-stat" data-on={filter === k} onClick={() => setFilter(filter === k ? 'all' : k)} style={{ cursor: 'pointer', textAlign: 'left', borderColor: filter === k ? 'var(--blue-border)' : undefined }}>
            <div className="dk-stat-v" style={{ color: k === 'open' ? 'var(--text-900)' : RK_LEVEL[k].c }}>{loading ? '—' : counts[k]}</div>
            <div className="dk-stat-k">{label}</div>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="dk-rows">{[0,1,2].map(i => <Card key={i} style={{ padding: 16 }}><Skel w="50%" h={16} /><Skel w="80%" h={12} style={{ marginTop: 10 }} /></Card>)}</div>
      ) : (
        <div className="dk-rows">
          {list.map(r => {
            const lv = RK_LEVEL[r.level];
            const st = RK_STATUS[r.status];
            return (
              <DocRow key={r.id} icon="alert-triangle" iconTone={lv.tone} iconColor={lv.c}
                name={r.title}
                badges={<span className="dk-chip" style={{ color: lv.c, background: lv.bg }}>{lv.label}风险</span>}
                meta={<><span className="mono">{r.id}</span><span>{RK_CAT[r.cat]}</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="bot" size={12} color="var(--ai)" />{r.owner}</span><span>发现 {r.found}</span></>}
                aside={<span className="dk-chip" style={{ color: st.c, background: st.bg }}><Icon name={st.icon} size={12} color={st.c} />{st.label}</span>}
                onClick={() => setActive(r)} />
            );
          })}
        </div>
      )}

      <RiskDrawer risk={active} onClose={() => setActive(null)} />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

Object.assign(window, { RiskRegister, RK_RISKS });
