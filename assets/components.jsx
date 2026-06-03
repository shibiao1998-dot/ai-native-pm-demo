/* ============================================================
   共享组件 — components.jsx
   依赖：lucide (UMD 全局) + React 18
   ============================================================ */

/* ---------- Lucide Icon ---------- */
let _iconRaf = null;
function refreshIcons() {
  if (_iconRaf) return;
  _iconRaf = requestAnimationFrame(() => {
    _iconRaf = null;
    if (window.lucide && window.lucide.createIcons) {
      try { window.lucide.createIcons({ attrs: { 'stroke-width': 1.5 } }); } catch (e) {}
    }
  });
}

function Icon({ name, size = 20, color, sw, className = '', style = {} }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = `<i data-lucide="${name}"></i>`;
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

/* ---------- 按钮 ---------- */
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

/* ---------- Tag ---------- */
function Tag({ children, mono, style }) {
  return <span className={`tag${mono ? ' mono' : ''}`} style={style}>{children}</span>;
}

/* ---------- 状态药丸 ---------- */
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

/* ---------- 卡片 ---------- */
function Card({ hover, pad, className = '', style, children, ...rest }) {
  return (
    <div className={`card${hover ? ' card-hover' : ''}${pad ? ' card-pad' : ''} ${className}`} style={style} {...rest}>
      {children}
    </div>
  );
}

/* ---------- 数字滚动 Count-up（等宽防抖） ---------- */
function CountUp({ value, duration = 600, decimals = 0, prefix = '', suffix = '' }) {
  const [disp, setDisp] = React.useState(value);
  const prev = React.useRef(value);
  React.useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = prev.current, to = value;
    prev.current = value;
    if (reduce || from === to) { setDisp(to); return; }
    let raf, start;
    const ease = t => 1 - Math.pow(1 - t, 3);
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      setDisp(from + (to - from) * ease(p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  const txt = Number(disp).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return <span>{prefix}{txt}{suffix}</span>;
}

/* ---------- 进度环 ---------- */
function Ring({ value = 0, size = 56, stroke = 6, color = 'var(--blue-primary)', track = 'var(--divider)', showVal = true, animate = true }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
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

/* ---------- 迷你趋势图 Sparkline ---------- */
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

/* ---------- 状态提示条 ---------- */
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

/* ---------- 空态 ---------- */
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

/* ---------- 骨架块 ---------- */
function Skel({ w = '100%', h = 14, r = 6, style = {} }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

/* ---------- 右滑抽屉 Drawer ---------- */
function Drawer({ open, onClose, width = 480, title, sub, icon, headRight, children, footer }) {
  React.useEffect(() => {
    const h = e => { if (e.key === 'Escape' && open) onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return ReactDOM.createPortal((
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

/* ---------- Toast（可点直达留痕） ---------- */
function Toast({ toast, onClose }) {
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 4200);
    return () => clearTimeout(t);
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

Object.assign(window, {
  Icon, Button, Tag, Pill, Card, CountUp, Ring, Sparkline, StatusBar, EmptyState, Skel, STATUS, refreshIcons, Drawer, Toast,
});
