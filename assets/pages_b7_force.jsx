/* ============================================================
   批 7 · 页面 7.2 · 强制结项（Danger 基调）
   ------------------------------------------------------------
   作用：战略变化导致某方向不再做时被动触发：AI 自动发起、分析当前产出、
         生成结项报告与表单，双重确认（管理层审批 + 项目负责人确认）。
         管理层可判断结项是否正确，判错填理由 → AI 学习。
   由 ClosurePage 的强制结项视图渲染（见 b7_knowledge.jsx）。数据：FC_PROJECT/FC_OUTPUTS（mock）。
   ============================================================ */

/* 被强制结项的项目（由战略层第 4 条传导触发）。 */
const FC_PROJECT = { name: '智能外呼增长助手', pid: 'PRJ-2026-0151' };

/* 当前产出分析（AI 自动分析该项目当前阶段全部产出） */
const FC_OUTPUTS = [
  { t: '外呼话术生成与合规校验引擎', s: '研发 · 内容生成 Agent · 完成度 80%', icon: 'code-xml', disp: 'keep', dispT: '可复用' },
  { t: '客户意向识别模型 v0.6', s: '研发 · 风控建模 Agent · 完成度 65%', icon: 'shield-check', disp: 'keep', dispT: '可复用' },
  { t: '外呼增长效果分析看板', s: '设计 · 体验设计 Agent · 完成度 90%', icon: 'layout-dashboard', disp: 'archive', dispT: '归档' },
  { t: '外呼线路与号码资源采购方案', s: '其他 · 采购协同 Agent · 完成度 40%', icon: 'package', disp: 'drop', dispT: '终止' },
];

const FC_DISP = {
  keep: { icon: 'recycle' }, archive: { icon: 'archive' }, drop: { icon: 'circle-slash' },
};

/* ---------- 7.2 强制结项（内容体） ----------
   ForceClose：状态机 judge：pending 待判断 → confirmed 确认结项 /
     reasoning 填保留理由 → learning AI 据理由学习。
   呈现：触发链（战略→本项目）+ 产出去留分析 + 双重确认状态条 + 管理层判断。 */
function ForceClose({ loading, onNavigate, onToast }) {
  const [judge, setJudge] = React.useState('pending'); // pending 待判断 | confirmed 已确认 | reasoning 填理由 | learning 学习中
  const [reason, setReason] = React.useState('');
  React.useEffect(() => { refreshIcons(); });

  if (loading) {
    return (
      <>
        <Card style={{ padding: 20, marginBottom: 16 }}><Skel w="50%" h={20} /><Skel w="100%" h={50} style={{ marginTop: 14 }} /></Card>
        <Card style={{ padding: 20 }}><Skel w="40%" h={16} /><Skel w="100%" h={80} r={10} style={{ marginTop: 14 }} /></Card>
      </>
    );
  }

  const submitWrong = () => { setJudge('learning'); onToast && onToast('已提交「判断有误」理由 · AI 将据理由学习，今后判断更准'); };

  return (
    <>
      {/* 强制结项卡 */}
      <div className="fc-banner">
        <span className="fc-banner-ico"><Icon name="octagon-alert" size={24} color="var(--danger)" /></span>
        <div className="fc-banner-main">
          <div className="fc-banner-t">强制结项<span className="cl-type force"><Icon name="octagon-alert" size={13} color="var(--danger)" />被动触发 · 及时止损</span></div>
          <div className="fc-banner-s">顶层战略调整为「自助化优先」，外呼增长方向不再作为投入重点。平台被动触发该在跑项目的强制结项，AI 已自动分析当前产出并生成结项报告与表单。</div>
          <div className="fc-banner-proj">
            <Icon name="box" size={16} color="var(--text-500)" />
            <span className="nm">{FC_PROJECT.name}</span>
            <span className="id mono">{FC_PROJECT.pid}</span>
            <span className="pill" style={{ background: 'var(--ai-soft)', color: 'var(--ai)', marginLeft: 'auto' }}><Icon name="bot" size={12} color="var(--ai)" />AI 已生成报告</span>
          </div>
        </div>
      </div>

      {/* 触发链 */}
      <div className="fc-chain">
        <div className="fc-sec-head"><Icon name="git-commit-horizontal" size={17} color="var(--danger)" /><span className="t">触发链 · 战略 → 本项目</span><span className="s">来自战略层第 4 条传导</span></div>
        <div className="fc-chain-flow">
          <div className="fc-chain-node" data-tone="blue">
            <div className="fc-chain-k"><Icon name="compass" size={13} color="var(--blue-primary)" />战略变化</div>
            <div className="fc-chain-v">战略主轴切换为「自助化优先」</div>
          </div>
          <span className="fc-chain-arrow"><Icon name="chevron-right" size={20} color="currentColor" /></span>
          <div className="fc-chain-node">
            <div className="fc-chain-k"><Icon name="x-circle" size={13} color="var(--text-500)" />不再做的方向</div>
            <div className="fc-chain-v">主动外呼增长收缩，资源转向自助服务</div>
          </div>
          <span className="fc-chain-arrow"><Icon name="chevron-right" size={20} color="currentColor" /></span>
          <div className="fc-chain-node" data-tone="danger">
            <div className="fc-chain-k"><Icon name="octagon-alert" size={13} color="var(--danger)" />本项目</div>
            <div className="fc-chain-v">{FC_PROJECT.name} · 触发强制结项</div>
          </div>
        </div>
      </div>

      {/* 当前产出分析 */}
      <div className="fc-chain" style={{ marginBottom: 16 }}>
        <div className="fc-sec-head"><Icon name="scan-search" size={17} color="var(--danger)" /><span className="t">当前产出分析 · AI 自动评估</span><span className="s">{FC_OUTPUTS.length} 项产出 · 标注去留</span></div>
        <div className="fc-outputs">
          {FC_OUTPUTS.map((o, i) => (
            <div className="fc-output" key={i}>
              <span className="fc-output-ico" style={{ background: o.disp === 'drop' ? 'var(--neutral-bg)' : o.disp === 'archive' ? 'var(--info-bg)' : 'var(--success-bg)' }}><Icon name={o.icon} size={16} color={o.disp === 'drop' ? 'var(--text-500)' : o.disp === 'archive' ? 'var(--info)' : 'var(--success)'} /></span>
              <div className="fc-output-main">
                <div className="fc-output-t">{o.t}</div>
                <div className="fc-output-s">{o.s}</div>
              </div>
              <span className="fc-disp" data-d={o.disp}><Icon name={FC_DISP[o.disp].icon} size={12} color="currentColor" />{o.dispT}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 双重确认状态条 */}
      <div className="fc-chain" style={{ marginBottom: 16 }}>
        <div className="fc-sec-head"><Icon name="user-check" size={17} color="var(--danger)" /><span className="t">双重确认</span><span className="s">管理层审批 + 负责人确认，缺一不可</span></div>
        <div className="fc-confirm">
          <div className="fc-confirm-step" data-s={judge === 'confirmed' ? 'done' : 'wait'}>
            <span className="fc-confirm-ico"><Icon name={judge === 'confirmed' ? 'check' : 'gavel'} size={18} color={judge === 'confirmed' ? 'var(--success)' : 'var(--warning)'} /></span>
            <div className="fc-confirm-main">
              <div className="fc-confirm-role">管理层审批</div>
              <div className="fc-confirm-t">{judge === 'confirmed' ? '已审批确认强制结项' : '待审批'}</div>
              <div className="fc-confirm-s">{judge === 'confirmed' ? <span className="mono">06-14 16:20 · 何沛</span> : '判断结项是否正确，确认或驳回'}</div>
            </div>
          </div>
          <div className="fc-confirm-step" data-s={judge === 'confirmed' ? 'done' : 'wait'}>
            <span className="fc-confirm-ico"><Icon name={judge === 'confirmed' ? 'check' : 'clock'} size={18} color={judge === 'confirmed' ? 'var(--success)' : 'var(--warning)'} /></span>
            <div className="fc-confirm-main">
              <div className="fc-confirm-role">项目负责人 / 关键决策角色</div>
              <div className="fc-confirm-t">{judge === 'confirmed' ? '已确认产出去留' : '待确认'}</div>
              <div className="fc-confirm-s">{judge === 'confirmed' ? <span className="mono">06-14 17:05 · 林岚</span> : '确认产出去留与交接安排'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 管理层判断 + 理由 */}
      <div className="fc-judge">
        {judge === 'confirmed' ? (
          <>
            <div className="fc-judge-q"><Icon name="circle-check" size={18} color="var(--success)" />强制结项已确认</div>
            <div className="fc-judge-s">双重确认完成，可复用产出已转入知识库沉淀，归档与终止项已留痕。</div>
            <div className="fc-judge-btns">
              <Button variant="primary" icon="library" onClick={() => onToast && onToast('可复用产出已进入知识库（切到「知识库」标签查看）')}>查看知识库沉淀</Button>
              <Button variant="text" onClick={() => setJudge('pending')}>重置演示</Button>
            </div>
          </>
        ) : judge === 'learning' ? (
          <>
            <div className="fc-judge-q"><Icon name="brain" size={18} color="var(--ai)" />AI 学习中 · 据理由修正判断</div>
            <div className="fc-judge-s">管理层判断本次结项有误、属需保留的特殊个例，AI 正据理由学习，今后对该方向的结项判断将更准。</div>
            <div className="fc-learn">
              <Icon name="loader-2" size={20} color="var(--ai)" className="spin" />
              <div className="fc-learn-main">
                <div className="fc-learn-t">已记录特例理由并回流模型</div>
                <div className="fc-learn-s">「外呼能力可迁移至自助场景的智能引导，不应整体终止」—— 该判断规则将纳入今后强制结项评估。</div>
              </div>
            </div>
            <div className="fc-judge-btns">
              <Button variant="secondary" icon="undo-2" onClick={() => setJudge('pending')}>撤销保留、回到判断</Button>
            </div>
          </>
        ) : judge === 'reasoning' ? (
          <>
            <div className="fc-judge-q"><Icon name="message-square-warning" size={18} color="var(--warning)" />判断有误 · 该项目应保留</div>
            <div className="fc-judge-s">请说明保留理由（特殊个例）。AI 将据理由学习，避免今后误判。</div>
            <div className="cl-reason" style={{ marginTop: 14 }}>
              <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="例如：外呼意向识别模型可迁移至自助服务的智能引导场景，应保留并转立新项目…" />
            </div>
            <div className="fc-judge-btns">
              <Button variant="primary" icon="send" onClick={submitWrong} disabled={!reason.trim()}>提交理由 · AI 学习</Button>
              <Button variant="text" onClick={() => setJudge('pending')}>取消</Button>
            </div>
          </>
        ) : (
          <>
            <div className="fc-judge-q"><Icon name="gavel" size={18} color="var(--danger)" />管理层判断：本次强制结项是否正确？</div>
            <div className="fc-judge-s">确认即完成双重确认、强制结项生效；若判错（属需保留的特殊个例），须给理由，AI 据理由学习、今后判断更准。</div>
            <div className="fc-judge-btns">
              <Button variant="danger" icon="octagon-alert" onClick={() => setJudge('confirmed')}>确认强制结项</Button>
              <Button variant="secondary" icon="shield-x" onClick={() => setJudge('reasoning')}>判断有误 · 应保留</Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

Object.assign(window, { ForceClose, FC_PROJECT, FC_OUTPUTS });
