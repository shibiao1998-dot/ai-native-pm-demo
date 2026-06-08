/* ============================================================
   共享组件库 — components.jsx
   ------------------------------------------------------------
   作用：整个原型最底层的「UI 原语」集合。所有页面都从这里取用
         按钮 / 药丸 / 卡片 / 进度环 / 抽屉 / Toast 等基础组件，
         保证全站视觉与交互一致。改这里 = 影响全站。

   依赖：
     · lucide  —— 图标库，以 UMD 方式挂在 window.lucide（见 HTML 顶部 <script>）
     · React 18 —— 同样是全局 window.React（非模块化引入）

   导出方式：文件末尾用 Object.assign(window, {...}) 把组件挂到全局，
             其它 .jsx 文件直接按名字使用（Babel 各文件作用域独立，
             必须靠 window 共享，不能 import）。
   ============================================================ */

/* ---------- Lucide 图标渲染器 ----------
   实现逻辑：lucide 的工作方式是扫描 DOM 里的 <i data-lucide="name"> 占位元素，
   就地替换成 <svg>。每个 <Icon> 挂载后都需要触发一次扫描。如果每个图标各调
   一次会造成成百上千次重复扫描 → 用 requestAnimationFrame 把同一帧内的多次
   请求合并成一次全局扫描（_iconRaf 作为「本帧是否已排程」的闸门）。 */
let _iconRaf = null;
function refreshIcons() {
  if (_iconRaf) return;                       // 本帧已排程，直接忽略后续请求（去重）
  _iconRaf = requestAnimationFrame(() => {
    _iconRaf = null;                          // 释放闸门，允许下一帧再次排程
    if (window.lucide && window.lucide.createIcons) {
      try { window.lucide.createIcons({ attrs: { 'stroke-width': 1.5 } }); } catch (e) {}
    }
  });
}

/* <Icon> —— 全站唯一的图标组件
   作用：渲染一个 lucide 矢量图标。
   props 契约：
     name      图标名（lucide 命名，如 'search' / 'chevron-right'）
     size      像素尺寸，写入 CSS 变量 --ic-size
     color     描边颜色（继承 currentColor 体系，可传 var(--xxx)）
     sw        stroke-width 描边粗细，默认 1.5
   实现逻辑：先往 span 里塞一个 <i data-lucide> 占位，再调 refreshIcons()
     让 lucide 把它替换成 svg。name 变化时 effect 重跑，重新塞占位+扫描。 */
function Icon({ name, size = 20, color, sw, className = '', style = {} }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = `<i data-lucide="${name}"></i>`;  // 占位，等待 lucide 替换为 <svg>
    refreshIcons();
  }, [name]);
  return (
    <span
      ref={ref}
      className={`ic ${className}`}
      style={{ '--ic-size': size + 'px', '--ic-sw': sw || 1.5, color, ...style }}
      aria-hidden="true"
    />
  );
}

/* ---------- 按钮 ----------
   作用：标准按钮。
   props：variant 决定视觉（primary 主行动 / secondary 次要 / ghost 等，样式在 components.css）；
          size='sm' 紧凑型；icon / iconRight 在文字左右加图标；无 children 时自动变纯图标按钮。
          ...rest 透传 onClick、disabled、title 等原生属性。 */
function Button({ variant = 'secondary', size, icon, iconRight, children, className = '', ...rest }) {
  const cls = `btn btn-${variant}${size === 'sm' ? ' btn-sm' : ''}${!children ? ' btn-icon' : ''} ${className}`;
  return (
    <button className={cls} {...rest}>
      {icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 14 : 16} />}
    </button>
  );
}

/* ---------- Tag 标签 ----------
   作用：轻量文字标签。mono=true 时用等宽字体（适合 ID、编号、数字）。 */
function Tag({ children, mono, style }) {
  return <span className={`tag${mono ? ' mono' : ''}`} style={style}>{children}</span>;
}

/* ---------- 状态药丸 Pill ----------
   作用：带圆点的状态标记（如 进行中 / 已完成 / 风险）。
   STATUS 是「语义色 → CSS 变量」的映射表：tone 传 success/warning/danger/info/neutral/ai，
   组件据此取前景色 c 与背景色 bg，全站状态色统一在此一处维护。 */
const STATUS = {
  success: { c: 'var(--success)', bg: 'var(--success-bg)' },
  warning: { c: 'var(--warning)', bg: 'var(--warning-bg)' },
  danger:  { c: 'var(--danger)',  bg: 'var(--danger-bg)' },
  info:    { c: 'var(--info)',    bg: 'var(--info-bg)' },
  neutral: { c: 'var(--neutral)', bg: 'var(--neutral-bg)' },
  ai:      { c: 'var(--ai)',      bg: 'var(--ai-soft)' },
};
function Pill({ tone = 'neutral', children }) {
  const s = STATUS[tone] || STATUS.neutral;
  return (
    <span className="pill" style={{ background: s.bg, color: s.c }}>
      <span className="dot" style={{ background: s.c }} />
      {children}
    </span>
  );
}

/* ---------- 卡片 Card ----------
   作用：通用白底容器。hover=true 加悬停抬升效果（用于可点卡片）；pad=true 加内边距。 */
function Card({ hover, pad, className = '', style, children, ...rest }) {
  return (
    <div className={`card${hover ? ' card-hover' : ''}${pad ? ' card-pad' : ''} ${className}`} style={style} {...rest}>
      {children}
    </div>
  );
}

/* ---------- 数字滚动 Count-up ----------
   作用：把数字从旧值动画过渡到新值（用于看板大数字、金额等），增强「数据在更新」的感知。
   实现逻辑：
     · prev(useRef) 记住上一次的值，作为动画起点 from；新 value 是终点 to。
     · 用 requestAnimationFrame 逐帧推进，ease 为 ease-out 三次方缓动（开头快、结尾缓）。
     · 无障碍：若系统开启「减少动态效果」(prefers-reduced-motion) 则直接跳到终值，不做动画。
     · 卸载时 cancelAnimationFrame 防止内存泄漏。
   props：value 目标值；duration 时长 ms；decimals 小数位；prefix/suffix 前后缀（如 ¥ / %）。 */
function CountUp({ value, duration = 600, decimals = 0, prefix = '', suffix = '' }) {
  const [disp, setDisp] = React.useState(value);   // 当前显示值（每帧被更新）
  const prev = React.useRef(value);                // 动画起点：上一次的值
  React.useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = prev.current, to = value;
    prev.current = value;
    if (reduce || from === to) { setDisp(to); return; }   // 无动画分支：直接落终值
    let raf, start;
    const ease = t => 1 - Math.pow(1 - t, 3);             // ease-out cubic
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);     // 进度 0→1
      setDisp(from + (to - from) * ease(p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  const txt = Number(disp).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return <span>{prefix}{txt}{suffix}</span>;
}

/* ---------- 进度环 Ring ----------
   作用：SVG 圆环进度指示器（用于完成率、健康度等百分比）。
   实现逻辑：用 strokeDasharray = 周长、strokeDashoffset = 周长×(1-进度) 画出弧线；
     animate=true 时初始为 0，挂载后 60ms 再设为目标值，靠 CSS transition 平滑补间出「绘制」动画。
     transform rotate(-90) 让起点从 12 点钟方向开始。 */
function Ring({ value = 0, size = 56, stroke = 6, color = 'var(--blue-primary)', track = 'var(--divider)', showVal = true, animate = true }) {
  const r = (size - stroke) / 2;       // 半径（扣掉描边宽度，避免超出 viewBox）
  const c = 2 * Math.PI * r;           // 周长 = dasharray 总长
  const [v, setV] = React.useState(animate ? 0 : value);
  React.useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!animate || reduce) { setV(value); return; }
    const t = setTimeout(() => setV(value), 60);
    return () => clearTimeout(t);
  }, [value, animate]);
  return (
    <span className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c}
          strokeDashoffset={c * (1 - v / 100)}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dashoffset 700ms var(--ease-out)' }} />
      </svg>
      {showVal && <span className="ring-val" style={{ fontSize: size * 0.26 }}>{Math.round(v)}%</span>}
    </span>
  );
}

/* ---------- 迷你趋势图 Sparkline ----------
   作用：把一组数字画成小折线图（看板里的趋势缩略图）。
   实现逻辑：把 data 按索引映射到 x，按数值在 [min,max] 区间归一化映射到 y，
     拼出 path 的 M/L 指令；fill=true 时额外画一条渐变填充的面积。
     渐变 id 用随机串避免同页多个 Sparkline 的 <linearGradient> id 冲突。
   props：data=[数字数组]；w/h 尺寸；color 线色；fill 是否填充面积。 */
function Sparkline({ data, w = 132, h = 40, color = 'var(--blue-primary)', fill = true }) {
  const max = Math.max(...data), min = Math.min(...data);
  const span = max - min || 1;
  const pts = data.map((d, i) => [ (i / (data.length - 1)) * w, h - 4 - ((d - min) / span) * (h - 8) ]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  const id = React.useMemo(() => 'sg' + Math.random().toString(36).slice(2, 8), []);
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      {fill && (
        <>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.14" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${id})`} />
        </>
      )}
      <path d={line} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- 状态提示条 StatusBar ----------
   作用：页面内的横幅提示（左侧色条 + 图标 + 标题 + 说明），用于解释当前页状态或给出引导。
   tone 决定左色条与背景色（复用 STATUS 表）。 */
function StatusBar({ tone = 'info', icon, title, children }) {
  const s = STATUS[tone] || STATUS.info;
  return (
    <div className="statusbar" style={{ background: s.bg, borderLeftColor: s.c }}>
      {icon && <Icon name={icon} size={18} color={s.c} style={{ marginTop: 1 }} />}
      <div>
        {title && <div style={{ fontWeight: 600, color: 'var(--text-900)', fontSize: 14 }}>{title}</div>}
        {children && <div className="t-caption" style={{ marginTop: title ? 2 : 0 }}>{children}</div>}
      </div>
    </div>
  );
}

/* ---------- 空态 EmptyState ----------
   作用：列表/容器无数据时的占位（大图标 + 标题 + 说明 + 可选行动按钮）。 */
function EmptyState({ glyph = 'inbox', title, desc, action }) {
  return (
    <div className="empty">
      <span className="glyph"><Icon name={glyph} size={48} color="var(--blue-border)" /></span>
      <div className="t-h3">{title}</div>
      {desc && <div className="t-caption" style={{ maxWidth: 360 }}>{desc}</div>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}

/* ---------- 骨架屏块 Skel ----------
   作用：加载占位条（脉冲动画在 CSS）。w/h/r 控制宽高圆角。 */
function Skel({ w = '100%', h = 14, r = 6, style = {} }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

/* ---------- 右滑抽屉 Drawer ----------
   作用：全站统一的右侧抽屉容器（详情、表单、审核等都用它）。
   UI 状态机：由父组件的 open 布尔控制开/关；open=false 时直接 return null（不渲染）。
   关闭路径有三条：① 点击遮罩层 onClose ② 按 Esc 键 ③ 点头部关闭按钮。
   实现细节：
     · 用 ReactDOM.createPortal 渲染到 document.body —— 脱离父级层叠上下文，
       保证遮罩永远盖在最上层，不被父容器 overflow/transform 裁剪。
     · aside 上 stopPropagation：点抽屉内部不会冒泡到遮罩触发关闭。
   props：open/onClose 控制开关；width 宽度；title/sub/icon 头部；headRight 头部右侧自定义；
          footer 底部操作区；children 主体内容。 */
function Drawer({ open, onClose, width = 480, title, sub, icon, headRight, children, footer }) {
  React.useEffect(() => {
    const h = e => { if (e.key === 'Escape' && open) onClose(); };   // Esc 关闭
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);           // 卸载时解绑，防泄漏
  }, [open, onClose]);
  if (!open) return null;
  return ReactDOM.createPortal((          // 渲染到 body，脱离父级层叠/裁剪上下文
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer" style={{ width }} onClick={e => e.stopPropagation()} role="dialog" aria-label={title}>
        <header className="drawer-head">
          <div className="drawer-head-main">
            {icon && <span className="drawer-head-ico"><Icon name={icon.name} size={20} color={icon.color || 'var(--blue-primary)'} /></span>}
            <div style={{ minWidth: 0 }}>
              {title && <div className="t-h3" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>}
              {sub && <div className="t-micro" style={{ color: 'var(--text-400)', marginTop: 2 }}>{sub}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {headRight}
            <button className="icon-btn" onClick={onClose} aria-label="关闭"><Icon name="x" size={20} color="var(--text-500)" /></button>
          </div>
        </header>
        <div className="drawer-body">{children}</div>
        {footer && <footer className="drawer-foot">{footer}</footer>}
      </aside>
    </div>
  ), document.body);
}

/* ---------- Toast 轻提示（可点直达留痕） ----------
   作用：操作成功后的浮层反馈，4.2 秒后自动消失；可带一个行动按钮（如「查看留痕」跳转）。
   UI 状态机：toast 为对象时显示、为 null 时隐藏；显示后启动定时器自动 onClose。
   props：toast = { msg 文案, action? 按钮文字, onAction? 按钮回调 }；onClose 关闭回调。 */
function Toast({ toast, onClose }) {
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 4200);   // 自动消失
    return () => clearTimeout(t);          // toast 变化/卸载时清掉旧定时器
  }, [toast, onClose]);
  if (!toast) return null;
  return (
    <div className="toast-wrap">
      <div className="toast">
        <Icon name="circle-check" size={18} color="var(--success)" />
        <span className="toast-msg">{toast.msg}</span>
        {toast.action && <button className="toast-action" onClick={toast.onAction}>{toast.action}<Icon name="arrow-right" size={13} color="var(--blue-primary)" /></button>}
        <button className="icon-btn" onClick={onClose} style={{ width: 24, height: 24 }}><Icon name="x" size={15} color="var(--text-400)" /></button>
      </div>
    </div>
  );
}

/* 把全部原语挂到 window，供其它 .jsx 文件直接按名使用（见文件头说明）。 */
Object.assign(window, {
  Icon, Button, Tag, Pill, Card, CountUp, Ring, Sparkline, StatusBar, EmptyState, Skel, STATUS, refreshIcons, Drawer, Toast,
});
