/* ============================================================
   总入口 Portal — 平台落地页
   · 模糊搜索全部项目名称 / ID → 进入该项目专属工作区
   · 右上角按钮 → 进入项目管理工作台
   两块功能在此分流，互为独立整体。
   ============================================================ */

/* 子序列模糊匹配（支持中文逐字 + 拼写连续）+ ID 包含 */
function portalMatch(q, p) {
  const query = q.trim().toLowerCase();
  if (!query) return true;
  const id = p.pid.toLowerCase();
  if (id.includes(query)) return true;
  const name = p.name.toLowerCase();
  if (name.includes(query)) return true;
  let i = 0;
  for (const ch of name) { if (ch === query[i]) i++; if (i === query.length) return true; }
  return false;
}

function Portal({ onEnterProject, onEnterWorkbench }) {
  const [q, setQ] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef(null);

  React.useEffect(() => { refreshIcons(); });

  // 全局快捷键聚焦
  React.useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); inputRef.current && inputRef.current.focus(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const results = React.useMemo(() => PROJECTS.filter(p => portalMatch(q, p)).slice(0, 8), [q]);
  React.useEffect(() => { setActive(0); }, [q]);
  const showResults = focused && q.trim().length > 0;

  const recent = PROJECTS.slice(0, 6);
  const kapianTotal = PROJECTS.reduce((s, p) => s + p.kapian, 0);

  const onKeyDown = (e) => {
    if (!showResults) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (results[active]) onEnterProject(results[active]); }
    else if (e.key === 'Escape') { setQ(''); inputRef.current && inputRef.current.blur(); }
  };

  return (
    <div className="portal">
      <header className="portal-top">
        <div className="portal-brand">
          <span className="brand-mark"><Icon name="orbit" size={19} color="#fff" /></span>
          <span className="portal-brand-name">AI 项目官网</span>
        </div>
        <div className="portal-top-right">
          <button className="portal-wb-btn" onClick={onEnterWorkbench} title="进入项目管理工作台">
            <Icon name="layout-dashboard" size={17} color="var(--blue-primary)" />
            <span>项目管理工作台</span>
            <Icon name="arrow-right" size={15} color="var(--text-400)" />
          </button>
          <button className="portal-avatar" title="账户">管</button>
        </div>
      </header>

      <main className="portal-main">
        <div className="portal-hero">
          <span className="portal-eyebrow"><Icon name="orbit" size={13} color="var(--blue-primary)" />AI 原生项目管理平台</span>
          <h1 className="portal-title">进入你的工作区</h1>
        </div>

        <div className="portal-search-wrap">
          <div className={`portal-search${focused ? ' focused' : ''}`} onClick={() => inputRef.current && inputRef.current.focus()}>
            <Icon name="search" size={20} color={focused ? 'var(--blue-primary)' : 'var(--text-400)'} />
            <input
              ref={inputRef}
              value={q}
              onChange={e => setQ(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 140)}
              onKeyDown={onKeyDown}
              placeholder="搜索项目名称或项目 ID，进入专属工作区…"
            />
            {q ? (
              <button className="portal-search-clear" onClick={() => { setQ(''); inputRef.current && inputRef.current.focus(); }} title="清除">
                <Icon name="x" size={18} color="var(--text-400)" />
              </button>
            ) : (
              <span className="portal-search-kbd">⌘K</span>
            )}
          </div>

          {showResults && (
            <div className="portal-results">
              <div className="portal-results-head">
                <span className="t-label-caps">项目 · 模糊匹配</span>
                <span className="t-micro" style={{ color: 'var(--text-400)' }}>{results.length} 个结果</span>
              </div>
              {results.length === 0 ? (
                <div className="portal-empty">没有匹配的项目，换个名称或项目 ID 试试。</div>
              ) : (
                <div className="portal-results-list">
                  {results.map((p, i) => (
                    <button
                      key={p.pid}
                      className="portal-res"
                      data-active={i === active}
                      onMouseEnter={() => setActive(i)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onEnterProject(p)}
                    >
                      <span className="portal-res-ico"><Icon name="box" size={18} color="var(--blue-primary)" /></span>
                      <span className="portal-res-main">
                        <span className="portal-res-name">{p.name}</span>
                        <span className="portal-res-sub">
                          <span className="portal-res-id">{p.pid}</span>
                          <span>·</span>
                          <span>{p.mode}</span>
                          <span>·</span>
                          <span>{p.owner}</span>
                        </span>
                      </span>
                      <Pill tone={HEALTH[p.health].tone}>{p.health}</Pill>
                      <span className="portal-res-enter">进入<Icon name="corner-down-left" size={13} color="var(--blue-primary)" /></span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <section className="portal-recent">
          <div className="portal-recent-head">
            <span className="portal-recent-title">最近访问</span>
          </div>
          <div className="portal-grid">
            {recent.map(p => (
              <button key={p.pid} className="portal-card" onClick={() => onEnterProject(p)}>
                <div className="portal-card-top">
                  <div style={{ minWidth: 0 }}>
                    <div className="portal-card-name">{p.name}</div>
                    <div className="portal-card-id">{p.pid}</div>
                  </div>
                  <Ring value={p.progress} size={44} stroke={5} color={p.progress >= 80 ? 'var(--success)' : p.progress >= 50 ? 'var(--blue-primary)' : 'var(--warning)'} />
                </div>
                <div className="portal-card-meta">
                  <Pill tone={HEALTH[p.health].tone}>{p.health}</Pill>
                  <span className="portal-card-mode"><Icon name={p.mode === 'AI 自治' ? 'bot' : 'user-cog'} size={13} color={p.mode === 'AI 自治' ? 'var(--ai)' : 'var(--text-500)'} />{p.mode}</span>
                </div>
                <div className="portal-card-foot">
                  <span className="portal-card-owner"><span className="portal-card-ava">{p.owner[0]}</span>{p.owner}</span>
                  <span className="t-caption mono" style={{ color: p.kapian > 0 ? 'var(--danger)' : 'var(--text-400)', fontWeight: 600 }}>
                    {p.kapian > 0 ? `${p.kapian} 卡点` : '无卡点'}
                  </span>
                </div>
              </button>
            ))}
          </div>

        </section>
      </main>
    </div>
  );
}

Object.assign(window, { Portal });
