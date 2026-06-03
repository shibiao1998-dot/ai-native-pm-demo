/* ============================================================
   页面 5.3 · 6699.com 派发与回收
   事务按类型自动路由 → 传入六要素 → AI 执行 → 回收 → 验收 → 不达标退回迭代
   长期不达标 → 汇总问题提交 6699.com 改进（接口通自动发 / 不通沉淀）
   ============================================================ */

const DP_TYPE = window.TASK_TYPE;

const DP_FLOW = [
  { k: '按类型路由', s: '依事务类型标签自动分配对应 AI 员工', icon: 'route', on: 'done' },
  { k: '传入六要素', s: '名称 / 定义 / 背景 / 边界 / 验收 / 效果', icon: 'list-checks', on: 'done' },
  { k: 'AI 执行', s: '6699.com AI 员工执行并产出', icon: 'bot', on: 'run' },
  { k: '回收结果', s: '收回产出与过程留痕', icon: 'package', on: 'run' },
  { k: '验收审核', s: '验收 AI 按验收标准严格审', icon: 'shield-check', on: 'idle' },
];

const DP_ROSTER = [
  { name: '调度算法 Agent', type: 'dev', conn: 'live', rate: 96 },
  { name: '数据接入 Agent', type: 'dev', conn: 'live', rate: 94 },
  { name: '内容生成 Agent', type: 'resource', conn: 'live', rate: 98 },
  { name: '采购协同 Agent', type: 'other', conn: 'live', rate: 91 },
  { name: '风控运营 Agent', type: 'ops', conn: 'live', rate: 95 },
  { name: '数据标注 Agent', type: 'resource', conn: 'live', rate: 97 },
  { name: '体验设计 Agent', type: 'design', conn: 'stub', rate: null },
  { name: '集成测试 Agent', type: 'dev', conn: 'stub', rate: 74, low: true },
];

const DP_ITER = [
  { emp: '集成测试 Agent', type: 'dev', rounds: 3, route: 'sink',
    problem: '跨区域调度联调连续 3 次验收未达标',
    detail: '缺少跨区域时钟同步与乱序消息的边界用例，联调结果不稳定，多轮迭代仍未收敛。',
    suggest: '建议在 6699.com 为该 AI 员工补充「跨区域时钟同步 / 乱序消息」用例库，并提升集成测试覆盖率。' },
  { emp: '体验设计 Agent', type: 'design', rounds: 2, route: 'auto',
    problem: '产出风格与项目设计规范存在偏差',
    detail: '多次产出未严格复用设计系统 token，需人工返工对齐，影响交付节奏。',
    suggest: '建议接入项目设计规范 token 包，从源头约束色板与组件用法。' },
];

const rateColor = (r) => r == null ? 'var(--text-400)' : r >= 95 ? 'var(--success)' : r >= 85 ? 'var(--text-900)' : 'var(--danger)';

function IterItem({ it }) {
  const [open, setOpen] = React.useState(false);
  const ty = DP_TYPE[it.type];
  const auto = it.route === 'auto';
  return (
    <div className="dp-iter-item">
      <button className="dp-iter-bar" onClick={() => setOpen(o => !o)}>
        <span className="dp-iter-ico"><Icon name="wrench" size={16} color="var(--warning)" /></span>
        <div className="dp-iter-main">
          <div className="dp-iter-emp">{it.emp}<span className="tb-type" style={{ color: ty.c, background: ty.bg, marginLeft: 8, fontSize: 10 }}><span className="tb-type-dot" style={{ background: ty.c }} />{ty.label}</span></div>
          <div className="dp-iter-prob">{it.problem}</div>
        </div>
        <span className="dp-iter-route" style={auto ? { color: 'var(--success)', background: 'var(--success-bg)' } : { color: 'var(--text-500)', background: 'var(--neutral-bg)' }}>
          <Icon name={auto ? 'send' : 'archive'} size={11} color={auto ? 'var(--success)' : 'var(--text-500)'} />{auto ? '接口通 · 自动发' : '接口未通 · 沉淀'}
        </span>
        <Icon name="chevron-right" size={16} color="var(--text-400)" className="dp-iter-chev" data-open={open} />
      </button>
      {open && (
        <div className="dp-iter-body">
          <div className="dp-iter-block">
            <div className="dp-iter-block-label">问题</div>
            <div className="dp-iter-block-body">{it.detail}</div>
          </div>
          <div className="dp-iter-block">
            <div className="dp-iter-block-label">修改建议（提交 6699.com）</div>
            <div className="dp-iter-block-body">{it.suggest}</div>
          </div>
          <div className="dp-iter-rounds">
            {Array.from({ length: it.rounds }).map((_, i) => (
              <span className="dp-iter-round" key={i}><span className="rn">第 {i + 1} 轮</span>验收未达标 · 已退回迭代</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Dispatch6699({ onOpenTask, onNavigate, onToast }) {
  const liveCount = DP_ROSTER.filter(e => e.conn === 'live').length;
  return (
    <div className="page-fade">
      {/* 外部平台边界提示条 */}
      <div className="dp-boundary">
        <span className="dp-boundary-ico"><Icon name="plug" size={18} color="var(--blue-primary)" /></span>
        <div className="dp-boundary-main">
          <div className="dp-boundary-t">6699.com 是公司外部 AI 员工平台</div>
          <div className="dp-boundary-s">事务按类型自动路由至平台对应 AI 员工执行；本视图展示派发、回收与验收联动，部分员工为 v1 示意（stub）。</div>
        </div>
        <span className="dp-boundary-badge"><Icon name="link" size={13} color="var(--blue-primary)" />6699.com · API</span>
      </div>

      {/* 派发流程 */}
      <div className="dp-section">
        <div className="dp-sec-head">
          <Icon name="git-pull-request-arrow" size={18} color="var(--blue-primary)" />
          <span className="t">派发 · 执行 · 回收 · 验收流程</span>
          <span className="s">单条事务的生命周期</span>
        </div>
        <div className="dp-sec-desc">每条事务走相同链路：按类型路由给对应 AI 员工 → 传入六要素 → 执行产出 → 回收 → 验收 AI 按标准审；达标即通过，不达标则打包「问题 + 修改建议」退回迭代，直至通过。</div>
        <div className="dp-flow">
          {DP_FLOW.map((f, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="dp-step-arrow"><Icon name="chevron-right" size={20} color="currentColor" /></span>}
              <div className="dp-step" data-on={f.on}>
                <span className="dp-step-node"><Icon name={f.icon} size={22} color={f.on === 'done' ? 'var(--success)' : f.on === 'run' ? 'var(--ai)' : 'var(--text-400)'} className={f.icon === 'loader-2' ? 'spin' : ''} /></span>
                <span className="dp-step-k">{f.k}</span>
                <span className="dp-step-s">{f.s}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="dp-loop">
          <Icon name="repeat" size={16} color="var(--warning)" />
          <span className="t"><b>不达标即退回迭代：</b>验收 AI 打包「具体问题 + 修改建议」回传起草 AI 员工，重新执行并再验收，往返直到通过；通过的事务方可标记完成。</span>
          <span className="dp-loop-badge"><Icon name="rotate-ccw" size={11} color="var(--warning)" />迭代闭环</span>
        </div>
      </div>

      {/* AI 员工接入状态 */}
      <div className="dp-section">
        <div className="dp-sec-head">
          <Icon name="bot" size={18} color="var(--blue-primary)" />
          <span className="t">AI 员工接入状态</span>
          <span className="s">接口通 <b className="mono" style={{ color: 'var(--success)' }}>{liveCount}</b> · stub <b className="mono" style={{ color: 'var(--text-500)' }}>{DP_ROSTER.length - liveCount}</b></span>
        </div>
        <div className="dp-roster">
          {DP_ROSTER.map(e => {
            const ty = DP_TYPE[e.type];
            return (
              <div className="dp-emp" key={e.name}>
                <span className="dp-emp-av"><Icon name="bot" size={19} color="var(--ai)" /></span>
                <div className="dp-emp-main">
                  <div className="dp-emp-name">{e.name}{e.low && <Icon name="alert-triangle" size={13} color="var(--danger)" />}</div>
                  <div className="dp-emp-sub">
                    <span className="tb-type" style={{ color: ty.c, background: ty.bg, fontSize: 10 }}><span className="tb-type-dot" style={{ background: ty.c }} />{ty.label}</span>
                    <span className="dp-conn" data-c={e.conn}><span style={{ width: 6, height: 6, borderRadius: 999, background: e.conn === 'live' ? 'var(--success)' : 'var(--text-400)' }} />{e.conn === 'live' ? '接口通' : 'stub · 示意'}</span>
                  </div>
                </div>
                <span className="dp-emp-rate" style={{ color: rateColor(e.rate) }}>{e.rate == null ? 'v1' : e.rate + '%'}<div style={{ fontSize: 10, color: 'var(--text-400)', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>{e.rate == null ? '示意' : '达标率'}</div></span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 迭代建议 */}
      <div className="dp-section">
        <div className="dp-sec-head">
          <Icon name="wrench" size={18} color="var(--blue-primary)" />
          <span className="t">改进建议 · 提交 6699.com</span>
          <span className="s">长期不达标自动汇总</span>
        </div>
        <div className="dp-sec-desc">某 AI 员工长期不达标时，系统自动汇总问题与修改建议提交 6699.com：接口通则自动下发，接口未通则沉淀为迭代建议待平台对接。</div>
        <div className="dp-iter">
          {DP_ITER.map((it, i) => <IterItem key={i} it={it} />)}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Dispatch6699 });
