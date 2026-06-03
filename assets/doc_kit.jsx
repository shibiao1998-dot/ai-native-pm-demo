/* ============================================================
   文档套件 doc_kit — 共用「详情大表」组件
   复用 .cd-*（pages_b2.css）与 .dk-*（doc_kit.css）样式
   依赖 window.Icon
   ============================================================ */

const DK_TONE = {
  success: { c: 'var(--success)', bg: 'var(--success-bg)' },
  warning: { c: 'var(--warning)', bg: 'var(--warning-bg)' },
  danger:  { c: 'var(--danger)',  bg: 'var(--danger-bg)' },
  info:    { c: 'var(--info)',    bg: 'var(--info-bg)' },
  ai:      { c: 'var(--ai)',      bg: 'var(--ai-soft)' },
  neutral: { c: 'var(--text-500)', bg: 'var(--canvas)' },
  blue:    { c: 'var(--blue-primary)', bg: 'var(--blue-tint)' },
};
const dkTone = (t) => DK_TONE[t] || DK_TONE.blue;

/* 文档容器 */
function DocDoc({ children }) { return <div className="cd-doc">{children}</div>; }

/* 顶部状态横幅 */
function DocBanner({ tone = 'ai', icon = 'sparkles', children }) {
  const done = tone === 'success';
  return (
    <div className={`cd-banner${done ? ' is-done' : ''}`} style={tone !== 'ai' && !done ? { background: dkTone(tone).bg } : null}>
      <Icon name={icon} size={15} color={dkTone(tone).c} />
      <span>{children}</span>
    </div>
  );
}

/* 编号小节 */
function DocSec({ no, title, icon, children }) {
  return (
    <section className="cd-sec">
      <div className="cd-sec-head">
        {no && <span className="cd-sec-no">{no}</span>}
        {icon && <Icon name={icon} size={15} color="var(--blue-primary)" />}
        <span className="cd-sec-title">{title}</span>
      </div>
      <div className="cd-sec-body">{children}</div>
    </section>
  );
}

function DocPara({ children }) { return <p className="cd-para">{children}</p>; }

/* 键值元信息网格 · items: [{k, v}] */
function DocMeta({ items }) {
  return (
    <div className="cd-meta-grid">
      {items.map((it, i) => (
        <div className="cd-meta-item" key={i}>
          <span className="cd-meta-k">{it.k}</span>
          <span className="cd-meta-v">{it.v}</span>
        </div>
      ))}
    </div>
  );
}

/* 要点列表 · items: [string] 或 [{text, icon, tone}] */
function DocList({ items, icon = 'check-circle-2', tone = 'blue' }) {
  return (
    <div className="cd-list">
      {items.map((it, i) => {
        const o = typeof it === 'string' ? { text: it } : it;
        return (
          <div className="cd-li" key={i}>
            <Icon name={o.icon || icon} size={14} color={dkTone(o.tone || tone).c} />
            <span>{o.text}</span>
          </div>
        );
      })}
    </div>
  );
}

/* 两栏对照 · cols: [{label, tone, icon, items:[string]}] */
function DocCompare({ cols }) {
  return (
    <div className="cd-scope">
      {cols.map((col, i) => (
        <div className={`cd-scope-col${col.tone === 'success' ? ' is-in' : ' is-out'}`} key={i}>
          <div className="cd-scope-lab">
            {col.icon && <Icon name={col.icon} size={13} color={dkTone(col.tone || 'neutral').c} />}
            {col.label}
          </div>
          {col.items.map((s, j) => <div className="cd-scope-li" key={j}>{s}</div>)}
        </div>
      ))}
    </div>
  );
}

/* 指标表 · rows: [{goal, baseline, target, src}] */
function DocMetrics({ rows, head = ['指标', '当前基线', '目标值'] }) {
  return (
    <>
      <div className="cd-obj-head"><span>{head[0]}</span><span>{head[1]}</span><span>{head[2]}</span></div>
      {rows.map((o, i) => (
        <div className="cd-obj" key={i}>
          <span className="cd-obj-name">{o.goal}</span>
          <span className="cd-obj-base mono">{o.baseline}</span>
          <span className="cd-obj-target mono">{o.target}</span>
          {o.src && (
            <span className="src-chip" data-t={o.src}>
              <Icon name={o.src === 'industry' ? 'globe' : 'database'} size={10} color={o.src === 'industry' ? 'var(--info)' : 'var(--text-500)'} />
              {o.src === 'industry' ? '行业预估' : '内部数据'}
            </span>
          )}
        </div>
      ))}
    </>
  );
}

/* 里程碑时间线 · items: [{phase, when, desc}] */
function DocTimeline({ items }) {
  return (
    <div className="cd-mile">
      {items.map((m, i) => (
        <div className="cd-mile-row" key={i}>
          <span className="cd-mile-dot" />
          <div className="cd-mile-main">
            <div className="cd-mile-top"><span className="cd-mile-phase">{m.phase}</span>{m.when && <span className="cd-mile-when mono">{m.when}</span>}</div>
            {m.desc && <div className="cd-mile-desc">{m.desc}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* 风险行 · rows: [{risk, level, mitig}] */
const DK_RISK_TONE = { '高': 'danger', '中': 'warning', '低': 'success' };
function DocRisks({ rows }) {
  return (
    <>
      {rows.map((r, i) => {
        const tn = dkTone(DK_RISK_TONE[r.level] || 'neutral');
        return (
          <div className="cd-risk" key={i}>
            <span className="cd-risk-lvl" style={{ color: tn.c, background: tn.bg }}>{r.level}风险</span>
            <div className="cd-risk-main">
              <div className="cd-risk-txt">{r.risk}</div>
              {r.mitig && <div className="cd-risk-mitig"><Icon name="shield-check" size={12} color="var(--success)" />{r.mitig}</div>}
            </div>
          </div>
        );
      })}
    </>
  );
}

/* 干系人 / 角色 · rows: [{role, who, icon}] */
function DocPeople({ rows }) {
  return (
    <div className="cd-stake">
      {rows.map((s, i) => (
        <div className="cd-stake-row" key={i}>
          <span className="cd-stake-ico"><Icon name={s.icon || 'user'} size={14} color="var(--blue-primary)" /></span>
          <span className="cd-stake-role">{s.role}</span>
          <span className="cd-stake-who">{s.who}</span>
        </div>
      ))}
    </div>
  );
}

/* AI 结论note */
function DocAINote({ children, icon = 'sparkles' }) {
  return (
    <div className="cd-ai-note">
      <Icon name={icon} size={14} color="var(--ai)" />
      <p>{children}</p>
    </div>
  );
}

/* 成本表 · items:[{tag,k,v}] total gate gateNote */
const DK_COST_TAG = { '采购': 'info', '人力': 'ai', '算力': 'ai', '其他': 'neutral' };
function DocCost({ items, total, gate, gateNote }) {
  return (
    <>
      <div className="cd-cost">
        {items.map((c, i) => {
          const tn = dkTone(DK_COST_TAG[c.tag] || 'neutral');
          return (
            <div className="cd-cost-row" key={i}>
              {c.tag && <span className="cd-cost-tag" style={{ color: tn.c, background: tn.bg }}>{c.tag}</span>}
              <span className="cd-cost-k">{c.k}</span>
              <span className="cd-cost-v mono">{c.v}</span>
            </div>
          );
        })}
        {total && <div className="cd-cost-row is-total"><span className="cd-cost-k">合计</span><span className="cd-cost-v mono">{total}</span></div>}
      </div>
      {gateNote && (
        <div className={`cd-gate${gate ? ' is-on' : ''}`}>
          <Icon name={gate ? 'flag' : 'circle-check'} size={13} color={gate ? 'var(--danger)' : 'var(--success)'} />
          <span>{gateNote}</span>
        </div>
      )}
    </>
  );
}

/* ---- dk-* 新原语 ---- */

/* 指标磁贴行 · items: [{v, unit, k, delta, deltaTone}] */
function DocStats({ items }) {
  return (
    <div className="dk-stats">
      {items.map((s, i) => (
        <div className="dk-stat" key={i}>
          <div className="dk-stat-v">{s.v}{s.unit && <small>{s.unit}</small>}</div>
          <div className="dk-stat-k">{s.k}</div>
          {s.delta && <div className="dk-stat-delta" style={{ color: dkTone(s.deltaTone || 'success').c }}><Icon name={s.deltaTone === 'danger' ? 'arrow-down' : 'arrow-up'} size={11} color={dkTone(s.deltaTone || 'success').c} />{s.delta}</div>}
        </div>
      ))}
    </div>
  );
}

/* 横条 · rows: [{k, pct, v, tone}] */
function DocBars({ rows }) {
  return (
    <div className="dk-bars">
      {rows.map((r, i) => (
        <div className="dk-bar-row" key={i}>
          <span className="dk-bar-k">{r.k}</span>
          <span className="dk-bar-track"><span className="dk-bar-fill" style={{ width: `${r.pct}%`, background: dkTone(r.tone || 'blue').c }} /></span>
          <span className="dk-bar-v">{r.v != null ? r.v : `${r.pct}%`}</span>
        </div>
      ))}
    </div>
  );
}

/* 证据 / 附件 / 引用 · rows: [{icon, name, meta, tag, tagTone}] */
function DocEvidence({ rows }) {
  return (
    <div className="dk-ev">
      {rows.map((e, i) => (
        <div className="dk-ev-row" key={i}>
          <span className="dk-ev-ico"><Icon name={e.icon || 'file-text'} size={15} color="var(--text-500)" /></span>
          <div className="dk-ev-main">
            <div className="dk-ev-name">{e.name}</div>
            {e.meta && <div className="dk-ev-meta">{e.meta}</div>}
          </div>
          {e.tag && <span className="dk-ev-tag" style={{ color: dkTone(e.tagTone || 'neutral').c, background: dkTone(e.tagTone || 'neutral').bg }}>{e.tag}</span>}
        </div>
      ))}
    </div>
  );
}

/* 决策链 / 步骤 · items: [{act, actor, when, desc, basis, ai}] */
function DocChain({ items }) {
  return (
    <div className="dk-chain">
      {items.map((s, i) => (
        <div className="dk-chain-row" key={i}>
          <span className={`dk-chain-no${s.ai ? ' is-ai' : ''}`}>{i + 1}</span>
          <div className="dk-chain-main">
            <div className="dk-chain-top">
              <span className="dk-chain-act">{s.act}</span>
              {s.actor && <span className="dk-chain-actor"><Icon name={s.ai ? 'bot' : 'user'} size={11} color={s.ai ? 'var(--ai)' : 'var(--text-400)'} />{s.actor}</span>}
              {s.when && <span className="dk-chain-when">{s.when}</span>}
            </div>
            {s.desc && <div className="dk-chain-desc">{s.desc}</div>}
            {s.basis && <div className="dk-chain-basis"><Icon name="link" size={11} color="var(--text-400)" />依据：{s.basis}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* 引文块 */
function DocQuote({ children, by }) {
  return (
    <div className="dk-quote">
      <div className="dk-quote-txt">{children}</div>
      {by && <div className="dk-quote-by"><Icon name="bookmark" size={12} color="var(--text-400)" />{by}</div>}
    </div>
  );
}

/* 标签行 */
function DocTags({ tags }) {
  return <div className="dk-tags">{tags.map((t, i) => <span className="dk-tag" key={i}>{t}</span>)}</div>;
}

/* 裁决横幅 · tone: pass|warn|stop */
function DocVerdict({ tone = 'pass', icon, title, children }) {
  const ic = icon || (tone === 'pass' ? 'circle-check' : tone === 'stop' ? 'circle-x' : 'alert-triangle');
  const col = tone === 'pass' ? 'var(--success)' : tone === 'stop' ? 'var(--danger)' : 'var(--warning)';
  return (
    <div className={`dk-verdict is-${tone}`}>
      <Icon name={ic} size={18} color={col} />
      <div className="dk-verdict-main">
        <div className="dk-verdict-title">{title}</div>
        {children && <div className="dk-verdict-desc">{children}</div>}
      </div>
    </div>
  );
}

/* 日志表 · rows: [{when, main, tail}] */
function DocLog({ rows }) {
  return (
    <div className="dk-log">
      {rows.map((r, i) => (
        <div className="dk-log-row" key={i}>
          {r.when && <span className="dk-log-when">{r.when}</span>}
          <span className="dk-log-main">{r.main}</span>
          {r.tail && <span className="dk-log-tail">{r.tail}</span>}
        </div>
      ))}
    </div>
  );
}

/* 通用列表行 · 各模块「列表 → 详情」入口
   props: { icon, iconTone, name, badges, meta, aside, onClick } */
function DocRow({ icon, iconTone = 'blue', iconColor, name, badges, meta, aside, onClick }) {
  const tn = dkTone(iconTone);
  return (
    <button className="dk-row" onClick={onClick}>
      <span className="dk-row-ico" style={{ background: tn.bg }}><Icon name={icon} size={18} color={iconColor || tn.c} /></span>
      <div className="dk-row-main">
        <div className="dk-row-name">{name}{badges}</div>
        {meta && <div className="dk-row-meta">{meta}</div>}
      </div>
      <span className="dk-row-aside">{aside}</span>
      <Icon name="chevron-right" size={16} color="var(--text-400)" />
    </button>
  );
}

Object.assign(window, {
  DocDoc, DocBanner, DocSec, DocPara, DocMeta, DocList, DocCompare, DocMetrics,
  DocTimeline, DocRisks, DocPeople, DocAINote, DocCost,
  DocStats, DocBars, DocEvidence, DocChain, DocQuote, DocTags, DocVerdict, DocLog, DocRow,
  dkTone,
});
