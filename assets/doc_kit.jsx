/* ============================================================
   文档套件 doc_kit.jsx — 「详情大表 / 文档」组件库
   ------------------------------------------------------------
   作用：全站各类「文档型详情」的拼装积木。立项书、验收报告、复盘纪要、
         风险单、成本表等都是由这些 Doc* 原语拼出来的，不需各页重复写表格。
         这些组件几乎都是「纯展示」（无状态），只负责把传入的数据渲染成统一版式。

   数据来源：本文件不含任何数据，全部通过 props 从调用页传入（见每个组件的 props 契约）。
   样式：.cd-*（pages_b2.css，早期立项书样式）+ .dk-*（doc_kit.css，后加原语）。
   依赖：window.Icon。导出：文件末尾 Object.assign(window, {...})。
   ============================================================ */

/* 语义色 → CSS 变量映射表（与 components.jsx 的 STATUS 同理，但多了 blue 主色）。
   dkTone(t) 是带默认值的安全取色函数，未知 tone 一律回退到 blue。 */
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

/* 文档容器 — 所有 Doc* 片段的最外层包裹，统一文档内边距与排版。 */
function DocDoc({ children }) { return <div className="cd-doc">{children}</div>; }

/* 顶部状态横幅 — 文档顶部的一句话提示（如「AI 已生成 / 待人工确认」）。
   tone='success' 时走完成态（绿色）；其余 tone 取 DK_TONE 背景色。 */
function DocBanner({ tone = 'ai', icon = 'sparkles', children }) {
  const done = tone === 'success';
  return (
    <div className={`cd-banner${done ? ' is-done' : ''}`} style={tone !== 'ai' && !done ? { background: dkTone(tone).bg } : null}>
      <Icon name={icon} size={15} color={dkTone(tone).c} />
      <span>{children}</span>
    </div>
  );
}

/* 编号小节 — 文档里带序号圆点 + 标题的分节容器。no=序号，icon=标题图标。 */
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

/* 段落文字 */
function DocPara({ children }) { return <p className="cd-para">{children}</p>; }

/* 键值元信息网格 · 两列「字段名 : 值」网格。props: items=[{k 字段名, v 值}] */
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

/* 要点列表 · 带勾选/图标的要点。props: items 可传纯字符串数组，或 [{text, icon, tone}] 逐项定制 */
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

/* 两栏对照 · 常用于「范围内 / 范围外」。tone='success' 的列走绿色「在内」样式。
   props: cols=[{label 标题, tone, icon, items:[string]}] */
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

/* 指标表 · 三列「指标 / 基线 / 目标」。src 标记数据来源（industry=行业预估 / 其他=内部数据）。
   props: rows=[{goal, baseline, target, src?}]；head 可改表头文案 */
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

/* 里程碑时间线 · 竖向点状时间线。props: items=[{phase 阶段, when 时间, desc 说明}] */
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

/* 风险行 · 每行一个风险 + 等级药丸 + 缓解措施。
   DK_RISK_TONE：高/中/低 三个等级映射到 danger/warning/success 颜色。
   props: rows=[{risk 描述, level '高'|'中'|'低', mitig 缓解措施}] */
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

/* 干系人 / 角色 · props: rows=[{role 角色, who 人名, icon?}] */
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

/* AI 结论批注 · 紫色 AI 色调的一段结论提示，用于标识「这是 AI 生成的观点」。 */
function DocAINote({ children, icon = 'sparkles' }) {
  return (
    <div className="cd-ai-note">
      <Icon name={icon} size={14} color="var(--ai)" />
      <p>{children}</p>
    </div>
  );
}

/* 成本表 · 逐项成本 + 合计 + 可选「闸门」提示（超阈需审批）。
   DK_COST_TAG：成本类别 采购/人力/算力/其他 映射到标签颜色。
   props: items=[{tag 类别, k 名称, v 金额}]；total 合计；gate=true 走红色闸门；gateNote 闸门说明 */
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

/* ====== 以下为 dk-* 新原语（后期扩展，用于复盘 / 评估 / 留痕类详情） ====== */

/* 指标磁贴行 · 一排大数字磁贴，可带同比增减。
   props: items=[{v 数值, unit 单位, k 名称, delta 增减, deltaTone success|danger}] */
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

/* 横条 · 水平进度条列表。props: rows=[{k 名称, pct 百分比, v? 右侧文案(默认显示 pct%), tone}] */
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

/* 证据 / 附件 / 引用 · 文件行列表。props: rows=[{icon, name 文件名, meta 副信息, tag? 右侧标签, tagTone}] */
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

/* 决策链 / 步骤 · 带序号的决策/操作链，ai=true 时序号与执行人标记为 AI（区分人/机操作）。
   props: items=[{act 动作, actor 执行人, when 时间, desc 说明, basis 依据, ai 是否 AI}] */
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

/* 引文块 · 引用原文/发言，by=出处。 */
function DocQuote({ children, by }) {
  return (
    <div className="dk-quote">
      <div className="dk-quote-txt">{children}</div>
      {by && <div className="dk-quote-by"><Icon name="bookmark" size={12} color="var(--text-400)" />{by}</div>}
    </div>
  );
}

/* 标签行 · props: tags=[string] */
function DocTags({ tags }) {
  return <div className="dk-tags">{tags.map((t, i) => <span className="dk-tag" key={i}>{t}</span>)}</div>;
}

/* 裁决横幅 · 验收/审核结论的大横幅。tone: pass 通过(绿) | warn 警告(黄) | stop 驳回(红)，
   未传 icon 时按 tone 自动选图标。props: tone, icon?, title, children 说明 */
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

/* 日志表 · 留痕/时间线列表。props: rows=[{when 时间, main 主体, tail 尾部补充}] */
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

/* 把全部 Doc* 原语与 dkTone 挂到 window，供各页面文件拼装详情使用。 */
Object.assign(window, {
  DocDoc, DocBanner, DocSec, DocPara, DocMeta, DocList, DocCompare, DocMetrics,
  DocTimeline, DocRisks, DocPeople, DocAINote, DocCost,
  DocStats, DocBars, DocEvidence, DocChain, DocQuote, DocTags, DocVerdict, DocLog, DocRow,
  dkTone,
});
