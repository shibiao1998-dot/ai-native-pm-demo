/* ============================================================
   页面 4.2 · 卡点处置（项目专属 · 管理层介入）
   某关键要素审核反复仍不通过（AI 往返多轮无法解决）→ 升级卡点。
   卡点上下文 + 关联链路 + AI 尝试摘要 + 处置动作（修改方向 / 放行 / 驳回返工）
   ============================================================ */

const KP_SEV = window.SEV;
const KP_RoundItem = window.RoundItem;
const KP_MAP = window.NODE_MAP;
const KP_NL = window.NODE_LEVEL;

function KapianDisposal({ nodeId, onNavigate }) {
  const [demo, setDemo] = React.useState('filled');   // filled | empty（演示空态）
  const [stage, setStage] = React.useState('open');   // open | resolved
  const [pending, setPending] = React.useState(null); // 当前待确认动作
  const [reason, setReason] = React.useState('');
  const [toast, setToast] = React.useState(null);

  const id = nodeId || 'phase-a1';
  const node = KP_MAP[id] || KP_MAP['phase-a1'];
  const rec = window.buildRecord(node);
  const kp = rec.kapian;
  const p = window.PROJECT_META || { name: '智能履约调度中台', pid: 'PRJ-2026-0137' };
  const lvl = KP_NL[node.level];

  React.useEffect(() => { setStage('open'); setPending(null); setReason(''); }, [nodeId]);

  const ACTIONS = [
    { k: 'direction', label: '给出修改方向', variant: 'primary', icon: 'compass', reason: true,
      done: '已给出修改方向 · 卡点退回起草方按方向修订' },
    { k: 'pass', label: '放行', variant: 'secondary', icon: 'check',
      done: '已放行 · 卡点解除，要素回到正常流转' },
    { k: 'reject', label: '驳回返工', variant: 'danger', icon: 'undo-2', reason: true,
      done: '已驳回返工 · 要素退回编写阶段重做' },
  ];

  const commit = (a) => {
    if (a.reason && pending !== a.k) { setPending(a.k); return; }
    if (a.reason && !reason.trim()) return;
    setStage('resolved');
    setToast({ msg: a.done + ' · 已写入留痕', action: '查看留痕', onAction: () => { setToast(null); onNavigate && onNavigate('rules'); } });
  };

  /* 空态：该项目当前无卡点 */
  const StateToggle = (
    <div className="seg">
      {[['filled', '有卡点'], ['empty', '无卡点']].map(([v, l]) => (
        <button key={v} className="seg-btn" data-on={demo === v} onClick={() => { setDemo(v); setStage('open'); setPending(null); }}>{l}</button>
      ))}
    </div>
  );

  return (
    <div className="content-inner page-fade">
      <Breadcrumb items={[{ label: p.name }, { label: '目标树' }, { label: '卡点处置' }]} />
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico" style={{ background: 'var(--warning-bg)' }}><Icon name="alert-triangle" size={22} color="var(--warning)" /></span>
          <div>
            <h1 className="t-h1">卡点处置</h1>
          </div>
        </div>
        <div className="page-head-right">
          <span className="t-micro" style={{ color: 'var(--text-400)' }}>演示状态</span>
          {StateToggle}
          <FeedbackEntry onClick={() => {}} />
        </div>
      </div>

      {demo === 'empty' || !kp ? (
        <Card className="kp-empty">
          <EmptyState
            glyph="shield-check"
            title="该项目当前无卡点"
            desc="所有关键要素的「编写 → 审核 → 展示」均在正常流转，独立审核往返均在可解决范围内，无需管理层介入。"
            action={<span className="pill" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><span className="dot" style={{ background: 'var(--success)' }} />逐环把关 · 运行顺畅</span>}
          />
        </Card>
      ) : (
        <div className="kp-layout">
          {/* 左 · 卡点详情 + 往返历史 + 关联 */}
          <div className="kp-main">
            {/* 卡点详情卡 */}
            <div className="kp-detail">
              <div className="kp-detail-top">
                <span className="kp-detail-ico"><Icon name="alert-triangle" size={24} color="var(--warning)" /></span>
                <div className="kp-detail-main">
                  <span className="kp-detail-eyebrow"><Icon name="alert-triangle" size={12} color="var(--warning)" />卡点 · 待管理层处置</span>
                  <div className="kp-detail-title">{node.title}</div>
                  <div className="kp-detail-tags">
                    <span className="kp-chip"><Icon name={lvl.icon} size={13} color="var(--text-500)" />{lvl.label}</span>
                    <span className="kp-chip warn"><Icon name="shield-x" size={13} color="var(--warning)" />卡在审核环</span>
                    <span className="kp-chip"><Icon name="repeat" size={13} color="var(--text-500)" />已往返 <span className="mono">{kp.rounds}</span> 轮</span>
                    <span className="kp-chip"><Icon name="bot" size={13} color="var(--ai)" />起草 {node.ai}</span>
                  </div>
                </div>
              </div>

              <div className="kp-detail-divider" />

              <div className="kp-sec-label"><Icon name="list-x" size={14} color="var(--text-400)" />无法解决的具体问题</div>
              <ul className="kp-problems">
                {rec.conclusion.issues.map((is, i) => (
                  <li className="kp-problem" key={i}>
                    <span className="kp-problem-sev" style={{ color: KP_SEV.blocker.c, background: KP_SEV.blocker.bg }}>阻断</span>
                    <span className="kp-problem-text">{is}</span>
                  </li>
                ))}
              </ul>

              <div className="kp-sec-label" style={{ marginTop: 22 }}><Icon name="sparkles" size={14} color="var(--ai)" />AI 尝试摘要</div>
              <div className="kp-attempt">
                <div className="kp-attempt-head"><Icon name="bot" size={15} color="var(--ai)" />独立审核与起草方已往返 {kp.rounds} 轮</div>
                <div className="kp-attempt-body">{kp.attempt}</div>
                <div className="kp-attempt-stats">
                  {kp.stats.map((s, i) => (
                    <div className="kp-attempt-stat" key={i}>
                      <div className="kp-attempt-stat-v">{s.v}</div>
                      <div className="kp-attempt-stat-k">{s.k}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 往返历史时间线 */}
            <div className="kp-history">
              <div className="kp-history-head">
                <Icon name="history" size={17} color="var(--text-500)" />
                <span className="t">审核往返历史</span>
                <span className="cnt">连续未通过 · <span className="mono">{kp.rounds}</span> 轮</span>
              </div>
              <div className="lr-rounds">
                {(rec.rounds || []).map((rd, i) => (
                  <KP_RoundItem key={i} round={rd} idx={i} total={rec.rounds.length} defaultOpen={i === rec.rounds.length - 1} />
                ))}
              </div>
            </div>

            {/* 关联链路 */}
            <div className="kp-history">
              <div className="kp-history-head">
                <Icon name="link" size={17} color="var(--text-500)" />
                <span className="t">关联链路</span>
              </div>
              <div className="kp-links">
                {kp.links.map((l, i) => (
                  <button className="kp-link" key={i} onClick={() => {
                    if (l.id === 'task-1') onNavigate && onNavigate('cost-approval');
                    else if (KP_MAP[l.id]) onNavigate && onNavigate('p-review', { nodeId: l.id });
                  }}>
                    <span className="kp-link-ico" style={{ background: 'var(--blue-tint)' }}><Icon name={l.icon} size={16} color="var(--blue-primary)" /></span>
                    <span className="kp-link-main">
                      <span className="kp-link-k">{l.k}</span>
                      <span className="kp-link-v">{l.v}</span>
                    </span>
                    <Icon name="arrow-up-right" size={16} color="var(--text-400)" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 右 · 处置动作（sticky） */}
          <aside className="kp-dispose">
            <div className="kp-dispose-head">
              <Icon name="gavel" size={17} color="var(--blue-primary)" />
              <span className="t">{stage === 'resolved' ? '处置完成' : '管理层处置'}</span>
            </div>

            {stage === 'resolved' ? (
              <div className="kp-resolved">
                <span className="kp-resolved-ico"><Icon name="circle-check" size={28} color="var(--success)" /></span>
                <div className="kp-resolved-t">卡点已解除</div>
                <div className="kp-resolved-s">处置已写入留痕，要素回到正常流转，AI 将据此继续推进并重新提交逐环审核。</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                  <Button variant="secondary" size="sm" icon="git-fork" onClick={() => onNavigate && onNavigate('p-tree')}>返回目标树</Button>
                  <Button variant="text" size="sm" onClick={() => { setStage('open'); setPending(null); setReason(''); }}>撤销演示</Button>
                </div>
              </div>
            ) : (
              <div className="kp-dispose-body">
                <div className="kp-ai">
                  <div className="kp-ai-head"><Icon name="sparkles" size={14} color="var(--ai)" />AI 建议</div>
                  <div className="kp-ai-body">{kp.ai}</div>
                </div>

                {pending && ACTIONS.find(a => a.k === pending && a.reason) && (
                  <div className="kp-reason">
                    <div className="kp-action-label">{pending === 'direction' ? '修改方向 / 处置意见' : '驳回理由'}<span style={{ color: 'var(--danger)' }}> *</span></div>
                    <textarea value={reason} onChange={e => setReason(e.target.value)} autoFocus
                      placeholder={pending === 'direction' ? '例如：放行主用路况源采购，并要求补充高峰时段连续 3 日压测后重新提交审核…' : '请说明驳回返工的具体理由，将随处置写入留痕…'} />
                  </div>
                )}

                <div className="kp-actions">
                  {pending && <div className="kp-action-label">确认处置动作</div>}
                  {ACTIONS.map(a => (
                    (!pending || pending === a.k || !a.reason) && (
                      <Button key={a.k} variant={a.variant} icon={a.icon}
                        onClick={() => commit(a)}
                        className={pending === a.k ? 'is-armed' : ''}>
                        {pending === a.k ? '确认处置' : a.label}
                      </Button>
                    )
                  ))}
                  {pending && <Button variant="text" onClick={() => { setPending(null); setReason(''); }}>取消</Button>}
                </div>

                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--divider)', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Icon name="history" size={13} color="var(--text-400)" />
                  <span className="t-micro" style={{ color: 'var(--text-400)' }}>任一处置都会写入留痕，项目负责人与 AI 可见。</span>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

Object.assign(window, { KapianDisposal });
