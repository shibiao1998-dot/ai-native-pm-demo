/* ============================================================
   批 8 · 页面 8.2 · 价值观对齐（组合级 · 治理）
   当 AI 产出没有逻辑错、但不符合公司价值观 / 核心竞争力 / 风格时，
   由人校正它使产出对齐。左·待对齐列表 → 右·对齐详情：
   产出 vs 价值观偏差 + 对齐动作区（人给方向 → AI 处理态调整）+ 对齐历史。
   该机制贯穿全程、不会停。
   ============================================================ */

const VA_DIM = {
  value: { label: '价值观', c: 'var(--warning)', bg: 'var(--warning-bg)', icon: 'heart-handshake' },
  edge:  { label: '核心竞争力', c: 'var(--info)', bg: 'var(--info-bg)', icon: 'gem' },
  style: { label: '风格', c: 'var(--ai)', bg: 'var(--ai-soft)', icon: 'palette' },
};

const VA_ITEMS = [
  {
    id: 'AL-2026-0231', dim: 'value', by: '执行编排 Agent', byId: 'AGT-EXEC-031', proj: 'PRJ-2026-0129', when: '12 分钟前',
    title: '客服自助话术含"绝对不会再出错"等过度承诺表述',
    output: '为客服知识中枢生成的自助应答话术中写道："本系统已全面升级，绝对不会再出现此类问题，您可以 100% 放心。" 逻辑与信息均无误，问题在于口吻。',
    deviation: '与公司「稳健诚信、不过度承诺」的核心价值观不符。对外表述应客观可兑现，避免"绝对""100%"等绝对化措辞，以免后续无法兑现损伤信任。',
    norms: [
      { t: '稳健诚信', s: '对外承诺须客观、可兑现，不使用绝对化措辞。' },
      { t: '长期信任优先', s: '宁可表述保守，也不透支用户信任。' },
    ],
    chips: ['改为客观可兑现表述', '去除绝对化措辞', '补充适用边界说明'],
    history: [
      { g: 'info', t: '人发起对齐 · 指出过度承诺', m: '管理层 · 06-02 14:20' },
      { g: 'ai', t: 'AI 据方向重写话术（系统层进化）', m: '价值观对齐 Agent · 处理中' },
    ],
  },
  {
    id: 'AL-2026-0228', dim: 'edge', by: '目标拆解 Agent', byId: 'AGT-PLAN-016', proj: 'PRJ-2026-0137', when: '40 分钟前',
    title: '调度方案采用通用规则，未发挥自有实时路况双源能力',
    output: '为履约调度生成的方案以通用最短路径规则为主，逻辑正确、可落地，但几乎未调用本公司已沉淀的实时路况双源数据能力。',
    deviation: '与「以自有数据与算法能力构筑差异化壁垒」的核心竞争力定位不符。同样目标下，应优先发挥自有可复用能力，而非退回到通用方案。',
    norms: [
      { t: '核心竞争力 · 自有数据壁垒', s: '优先调用实时路况双源等自有能力组件。' },
      { t: '能力复用优先', s: '已沉淀的可复用能力应作为默认首选。' },
    ],
    chips: ['优先接入实时路况双源', '复用自有调度能力组件', '保留通用方案作兜底'],
    history: [
      { g: 'info', t: '人发起对齐 · 要求发挥自有能力', m: '管理层 · 06-02 13:52' },
    ],
  },
  {
    id: 'AL-2026-0224', dim: 'style', by: '逐环审核 Agent', byId: 'AGT-PLAN-022', proj: 'PRJ-2026-0151', when: '2 小时前',
    title: '验收退回意见措辞生硬，缺少建设性引导',
    output: '退回意见写为："不达标，重做。" 判定本身正确、证据充分，但表达过于生硬，不符合协作沟通风格。',
    deviation: '与公司「对内沟通建设性、对事不对人」的风格规范不符。退回意见应说明差距、给出可执行的改进方向，而非仅下结论。',
    norms: [
      { t: '建设性沟通', s: '指出问题同时给出可执行改进方向。' },
      { t: '对事不对人', s: '聚焦产出差距，不评价主体。' },
    ],
    chips: ['补充具体差距说明', '给出可执行改进方向', '调整为建设性口吻'],
    history: [
      { g: 'info', t: '人发起对齐 · 要求建设性表达', m: '管理层 · 06-02 12:10' },
      { g: 'ai', t: 'AI 重写退回意见并附改进项', m: '价值观对齐 Agent · 06-02 12:14' },
      { g: 'success', t: '对齐完成 · 已留痕', m: '已沉淀，纳入风格技能库' },
    ],
  },
];

const VA_HIST_DOT = { info: 'var(--blue-primary)', ai: 'var(--ai)', success: 'var(--success)', warning: 'var(--warning)' };

/* ---------- 研判档案（抽屉体） ---------- */
function VADossier({ item, phase, picked, setPicked, onSubmit }) {
  const dim = VA_DIM[item.dim];
  const toggle = (c) => setPicked(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);
  const done = phase === 'done' || item._resolved;
  return (
    <DocDoc>
      <DocBanner tone={done ? 'success' : 'warning'} icon={done ? 'circle-check' : dim.icon}>
        {done
          ? '该产出已按对齐方向重写并留痕，本次校正已内化进价值观技能库（系统层进化）。以下为完整研判档案。'
          : `该 AI 产出逻辑无误，但在「${dim.label}」维度上与公司规范存在偏差，需由人给出对齐方向。以下为完整研判档案。`}
      </DocBanner>

      <DocSec no="01" title="对齐概要" icon="file-badge">
        <DocMeta items={[
          { k: '偏差维度', v: <span style={{ color: dim.c, fontWeight: 600 }}>{dim.label}</span> },
          { k: '产出方', v: <span style={{ color: 'var(--ai)' }}>{item.by}</span> },
          { k: '所属项目', v: <span className="mono">{item.proj}</span> },
          { k: '对齐编号', v: <span className="mono">{item.id}</span> },
          { k: '发起时间', v: item.when },
          { k: '当前状态', v: done ? <b style={{ color: 'var(--success)' }}>已对齐</b> : <b style={{ color: 'var(--warning)' }}>待研判</b> },
        ]} />
      </DocSec>

      <DocSec no="02" title="冲突点 · 产出 vs 价值观偏差" icon="git-compare">
        <DocCompare cols={[
          { label: 'AI 产出（逻辑无误）', tone: 'neutral', icon: 'bot', items: [item.output] },
          { label: `不对齐点 · ${dim.label}`, tone: 'warning', icon: dim.icon, items: [item.deviation] },
        ]} />
      </DocSec>

      <DocSec no="03" title={`对照的公司${dim.label}条款`} icon="scale">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {item.norms.map((n, i) => <DocQuote key={i} by={n.t}>{n.s}</DocQuote>)}
        </div>
      </DocSec>

      <DocSec no="04" title="研判与裁决 · 由人给出对齐方向" icon="compass">
        {done ? (
          <DocVerdict tone="pass" title="已对齐 · 产出按方向重写并留痕">
            采纳方向：{(item._picked || picked).join('、') || '（含补充说明）'}。本次校正已内化进价值观技能库（系统层进化），下次同类产出将自动对齐；结果可在「规则与留痕」全局审计中追溯。
          </DocVerdict>
        ) : phase === 'running' ? (
          <div className="va-ai">
            <Icon name="loader-2" size={20} color="var(--ai)" className="spin" />
            <div className="va-ai-main">
              <div className="va-ai-t">AI 正据对齐方向调整产出 · 系统层进化</div>
              <div className="va-ai-steps">
                <div className="va-ai-step"><Icon name="circle-check" size={15} color="var(--success)" />接收对齐方向：{picked.join('、') || '（含补充说明）'}</div>
                <div className="va-ai-step"><Icon name="loader-2" size={15} color="var(--ai)" className="spin" />重写产出并比对{dim.label}规范…</div>
                <div className="va-ai-step" style={{ color: 'var(--text-400)' }}><Icon name="circle" size={15} color="var(--text-400)" />内化进系统层进化并留痕</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="va-action">
            <div className="va-action-q">告诉 AI 该往哪个方向校正</div>
            <div className="va-action-s">选择对齐方向（可多选）或补充说明。AI 将据此调整产出，并把本次校正内化进系统层进化。</div>
            <div className="va-chips">
              {item.chips.map((c, i) => <button key={i} className="va-chip" data-on={picked.includes(c)} onClick={() => toggle(c)}>{picked.includes(c) && <Icon name="check" size={12} color="var(--blue-primary)" style={{ marginRight: 4 }} />}{c}</button>)}
            </div>
            <textarea placeholder="补充对齐方向（可选）：例如「整体语气更克制，承诺均需可兑现」…" />
          </div>
        )}
      </DocSec>

      <DocSec no="05" title="对齐历史 · 贯穿全程" icon="history">
        <DocChain items={(item.history || []).map(h => ({
          act: h.t, actor: h.m, ai: h.g === 'ai' || h.g === 'success',
        })).concat(done && !item._resolved ? [{ act: '对齐完成 · 已留痕并内化进技能库', actor: '价值观对齐 Agent · 刚刚', ai: true }] : [])} />
      </DocSec>
    </DocDoc>
  );
}

/* ---------- 8.2 主页面 ---------- */
function ValueAlignment({ onNavigate }) {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState(VA_ITEMS);
  const [active, setActive] = React.useState(null);
  const [picked, setPicked] = React.useState([]);
  const [phase, setPhase] = React.useState('idle');
  const [toast, setToast] = React.useState(null);
  React.useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);
  React.useEffect(() => { refreshIcons(); });
  React.useEffect(() => { setPicked([]); setPhase(active && active._resolved ? 'done' : 'idle'); }, [active && active.id]);

  const submit = () => {
    setPhase('running');
    setTimeout(() => {
      setPhase('done');
      setItems(prev => prev.map(it => it.id === active.id ? { ...it, _resolved: true, _picked: picked } : it));
      setToast({ msg: '对齐方向已下发，AI 已据此调整并留痕（演示）' });
    }, 2200);
  };

  const pending = items.filter(i => !i._resolved).length;

  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: '项目管理工作台' }, { label: '治理' }, { label: '价值观对齐' }]} />
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico"><Icon name="scale" size={22} color="var(--blue-primary)" /></span>
          <div>
            <h1 className="t-h1">价值观对齐</h1>
          </div>
        </div>
        <div className="page-head-right">
          <FeedbackEntry
            context={{ scene: '价值观对齐', did: `当前有 ${pending} 条待研判的价值观 / 核心竞争力 / 风格偏差，由人给出对齐方向后 AI 内化进系统层进化`, ask: '某条对齐判断、对照的价值观条款，或对齐机制本身' }}
            onClick={() => setToast({ msg: '异步反馈入口已打开（演示）' })} />
        </div>
      </div>

      <div className="va-banner">
        <span className="va-banner-ico"><Icon name="infinity" size={20} color="var(--blue-primary)" /></span>
        <div style={{ minWidth: 0 }}>
          <div className="va-banner-t">对齐是持续机制，不是一次性审查</div>
          <div className="va-banner-s">每次人工校正都会被 AI 内化，下次同类产出自动对齐；偏差越来越少，但机制始终在线。</div>
        </div>
      </div>

      {loading ? (
        <div className="dk-rows">{[0,1,2].map(i => <Card key={i} style={{ padding: 16 }}><Skel w="40%" h={14} /><Skel w="90%" h={18} style={{ marginTop: 10 }} /></Card>)}</div>
      ) : (
        <div className="dk-rows">
          {items.map(it => {
            const dim = VA_DIM[it.dim];
            const resolved = it._resolved;
            return (
              <DocRow key={it.id} icon={dim.icon} iconTone={resolved ? 'success' : 'warning'} iconColor={resolved ? 'var(--success)' : dim.c}
                name={it.title}
                badges={<span className="dk-chip" style={{ color: dim.c, background: dim.bg }}>{dim.label}偏差</span>}
                meta={<><span className="va-item-by" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="bot" size={12} color="var(--ai)" />{it.by}</span><span className="mono">{it.proj}</span><span>{it.when}</span></>}
                aside={<span className="dk-chip" style={{ color: resolved ? 'var(--success)' : 'var(--warning)', background: resolved ? 'var(--success-bg)' : 'var(--warning-bg)' }}><Icon name={resolved ? 'circle-check' : 'list-todo'} size={12} color={resolved ? 'var(--success)' : 'var(--warning)'} />{resolved ? '已对齐' : '待研判'}</span>}
                onClick={() => setActive(it)} />
            );
          })}
        </div>
      )}

      <Drawer
        open={!!active}
        onClose={() => setActive(null)}
        width={640}
        icon={active ? { name: VA_DIM[active.dim].icon, color: VA_DIM[active.dim].c } : null}
        title={active ? active.title : ''}
        sub={active ? `${active.id} · ${VA_DIM[active.dim].label}偏差 · 研判档案` : ''}
        headRight={active && (
          <FeedbackEntry label="反馈"
            context={{ scene: '价值观对齐 · 研判档案', did: `当前查看「${active.title}」的研判档案（冲突点、对照的${VA_DIM[active.dim].label}条款与裁决）`, ask: '该偏差判断、对照条款或对齐方向' }}
            onClick={() => {}} />
        )}
        footer={active && !active._resolved && phase !== 'done' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="t-micro" style={{ color: 'var(--text-400)', flex: 1 }}>已选 <span className="mono" style={{ fontWeight: 600, color: 'var(--text-700)' }}>{picked.length}</span> 个对齐方向</span>
            <Button variant="primary" icon="send" disabled={phase === 'running' || picked.length === 0} onClick={submit}>下发对齐方向</Button>
          </div>
        )}
      >
        {active && <VADossier item={active} phase={phase} picked={picked} setPicked={setPicked} onSubmit={submit} />}
      </Drawer>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

Object.assign(window, { ValueAlignment, VA_ITEMS });
