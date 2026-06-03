/* ============================================================
   批 6 · 页面 6.3 · 验收复盘
   每次验收通过都据实际结果回填、修正根基三要素（理想化状态 / 核心价值 / 目标用户），
   让三要素始终反映现实。区分「达成验收（达成没）」与「复盘调整（要不要改）」，二者并存不互斥。
   ============================================================ */

const RETRO_DATA = [
  {
    key: 'ideal', title: '理想化状态', en: 'IDEAL STATE', icon: 'target', c: 'var(--blue-primary)', bg: 'var(--blue-tint)',
    changed: true, updated: '本次复盘 · 06-01',
    before: '履约调度全面智能化，区域时效稳定 < 4h、单均成本下降 ≥ 15%、异常自愈率 ≥ 90%。',
    after: ['履约调度全面智能化，区域时效稳定 < 4h、单均成本下降 ≥ 15%、异常自愈率 ≥ 90%；',
      { ins: '新增约束：关键外部数据依赖须双源冗余，避免单点联通风险阻断时效目标。' }],
    cause: {
      quote: '路况源选型连续两次未通过、第三方运力 API 三轮联通失败，暴露「单一外部依赖」对时效目标的高阻断风险。',
      from: '阶段验收 · 履约时效 < 4h', grade: 'D', date: '06-01',
    },
    impacts: [
      { lv: '中短期目标', t: '调度时效提升 30%', node: 'mid-a' },
      { lv: '阶段目标', t: '履约时效 < 4h', node: 'phase-a1' },
      { lv: '周目标', t: '接入区域实时路况', node: 'week-a1a' },
    ],
  },
  {
    key: 'value', title: '核心价值', en: 'CORE VALUE', icon: 'gem', c: 'var(--success)', bg: 'var(--success-bg)',
    changed: true, updated: '本次复盘 · 06-01',
    before: '把调度从「人盯人」升级为「系统自驱」，沉淀可复用的智能调度中台能力，外溢至同类业务。',
    after: ['把调度从「人盯人」升级为「系统自驱」，沉淀可复用的智能调度中台能力',
      { ins: '与「外部依赖治理」方法论' }, '，外溢至同类业务。'],
    cause: {
      quote: '异常自愈率阶段验收通过（91.4%）印证「系统自驱」价值成立；同期外部依赖受阻，提示治理能力本身即是可外溢的价值资产。',
      from: '阶段验收 · 异常自愈率 ≥ 90%', grade: 'B', date: '05-27',
    },
    impacts: [
      { lv: '中短期目标', t: '单均成本下降 15%', node: 'mid-b' },
    ],
  },
  {
    key: 'users', title: '目标用户', en: 'TARGET USERS', icon: 'users', c: 'var(--ai)', bg: 'var(--ai-soft)',
    changed: false, updated: '上次复盘 · 05-22',
    keep: '区域履约调度团队（转审核与例外处置）、履约运营负责人（关注时效与成本）、一线履约人员（接收更合理调度指令）。',
    cause: {
      quote: '本次验收结果未触及用户构成与诉求变化，三要素「达成验收」与「复盘调整」并存不互斥 —— 此项经评估维持原状，不做漂移。',
      from: '阶段验收 · 异常自愈率 ≥ 90%', grade: 'B', date: '05-27',
    },
    impacts: [],
  },
];

/* 改后文本渲染（支持 ins 高亮） */
function AfterText({ parts }) {
  return (
    <span>
      {parts.map((p, i) => typeof p === 'string'
        ? <React.Fragment key={i}>{p}</React.Fragment>
        : <ins key={i}>{p.ins}</ins>)}
    </span>
  );
}

/* ---------- 6.3 验收复盘（内容体） ---------- */
function AcceptRetro({ loading, onNavigate, onToast }) {
  React.useEffect(() => { refreshIcons(); });

  if (loading) {
    return (
      <>
        <div className="rt-dual"><Card style={{ padding: 18 }}><Skel w="60%" h={16} /><Skel w="100%" h={40} style={{ marginTop: 12 }} /></Card><Card style={{ padding: 18 }}><Skel w="60%" h={16} /><Skel w="100%" h={40} style={{ marginTop: 12 }} /></Card></div>
        {[0, 1].map(i => <Card key={i} style={{ padding: 20, marginBottom: 16 }}><Skel w="40%" h={18} /><Skel w="100%" h={90} r={10} style={{ marginTop: 16 }} /></Card>)}
      </>
    );
  }

  const jump = (node) => { onNavigate && onNavigate('p-tree', { nodeId: node }); };

  return (
    <>
      {/* 双轨说明 */}
      <div className="rt-dual">
        <div className="rt-dual-card accept">
          <span className="rt-dual-ico"><Icon name="circle-check" size={20} color="var(--success)" /></span>
          <div className="rt-dual-main">
            <div className="rt-dual-q">达成验收 · 达成没？</div>
            <div className="rt-dual-t">按验收标准审计目标是否达成</div>
            <div className="rt-dual-d">产出评级与「通过 / 未通过」结论 —— 见逐级验收报告。</div>
          </div>
        </div>
        <div className="rt-dual-card retro">
          <span className="rt-dual-ico"><Icon name="refresh-cw" size={20} color="var(--blue-primary)" /></span>
          <div className="rt-dual-main">
            <div className="rt-dual-q">复盘调整 · 要不要改？</div>
            <div className="rt-dual-t">据实际结果回填修正根基三要素</div>
            <div className="rt-dual-d">让理想化状态 / 核心价值 / 目标用户始终反映现实，与验收并存不互斥。</div>
          </div>
        </div>
      </div>

      {/* 三要素前后对照卡 */}
      {RETRO_DATA.map(d => (
        <div className="rt-card" key={d.key}>
          <div className="rt-card-head">
            <span className="rt-card-ico" style={{ background: d.bg }}><Icon name={d.icon} size={20} color={d.c} /></span>
            <div className="rt-card-titles">
              <div className="rt-card-en">{d.en}</div>
              <div className="rt-card-t">{d.title}</div>
            </div>
            {d.changed
              ? <span className="pill" style={{ background: 'var(--blue-tint)', color: 'var(--blue-primary)' }}><span className="dot" style={{ background: 'var(--blue-primary)' }} />本次复盘已调整</span>
              : <span className="pill" style={{ background: 'var(--neutral-bg)', color: 'var(--text-500)' }}><span className="dot" style={{ background: 'var(--text-400)' }} />本次维持原状</span>}
            <span className="rt-card-upd" style={{ marginLeft: 12 }}><Icon name="clock" size={13} color="var(--text-400)" />{d.updated}</span>
          </div>

          {d.changed ? (
            <div className="rt-diff">
              <div className="rt-diff-side rt-diff-before">
                <span className="rt-diff-tag before"><Icon name="corner-up-left" size={12} color="var(--text-500)" />改前</span>
                <div className="rt-diff-text">{d.before}</div>
              </div>
              <div className="rt-diff-arrow"><Icon name="arrow-right" size={20} color="var(--blue-primary)" /></div>
              <div className="rt-diff-side rt-diff-after">
                <span className="rt-diff-tag after"><Icon name="sparkles" size={12} color="var(--blue-primary)" />改后</span>
                <div className="rt-diff-text"><AfterText parts={d.after} /></div>
              </div>
            </div>
          ) : (
            <div className="rt-diff" style={{ gridTemplateColumns: '1fr' }}>
              <div className="rt-diff-side rt-diff-before" style={{ background: 'var(--canvas)' }}>
                <span className="rt-diff-tag before"><Icon name="shield-check" size={12} color="var(--text-500)" />经评估维持不变</span>
                <div className="rt-diff-text">{d.keep}</div>
              </div>
            </div>
          )}

          {/* 复盘动因 */}
          <div className="rt-cause">
            <div className="rt-cause-label"><Icon name="quote" size={13} color="var(--text-400)" />复盘动因 · 来自验收结果</div>
            <div className="rt-cause-quote">{d.cause.quote}</div>
            <div className="rt-cause-src">
              来源
              <span className="chip">{d.cause.from}</span>
              <span className="grade-mini" style={{ color: GRADE[d.cause.grade].c }}>评级 {GRADE[d.cause.grade].label}</span>
              · <span className="mono">{d.cause.date}</span>
            </div>
          </div>

          {/* 下游影响 */}
          {d.impacts.length > 0 ? (
            <div className="rt-impact">
              <div className="rt-impact-label"><Icon name="git-fork" size={13} color="var(--text-400)" />下游影响 · 复盘后需联动调整的目标（{d.impacts.length}）</div>
              <div className="rt-impact-grid">
                {d.impacts.map((im, i) => (
                  <button className="rt-impact-item" key={i} onClick={() => jump(im.node)}>
                    <span className="rt-impact-ico" style={{ background: d.bg }}><Icon name="milestone" size={15} color={d.c} /></span>
                    <div className="rt-impact-main">
                      <div className="rt-impact-lv">{im.lv}</div>
                      <div className="rt-impact-t">{im.t}</div>
                    </div>
                    <span className="rt-impact-act">跳转目标树联动</span>
                    <span className="rt-impact-arr"><Icon name="arrow-up-right" size={16} color="var(--text-400)" /></span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rt-impact">
              <div className="rt-impact-label"><Icon name="git-fork" size={13} color="var(--text-400)" />下游影响</div>
              <div className="rt-impact-item" style={{ cursor: 'default', color: 'var(--text-500)' }}>
                <span className="rt-impact-ico" style={{ background: 'var(--neutral-bg)' }}><Icon name="minus" size={15} color="var(--text-400)" /></span>
                <div className="rt-impact-main"><div className="rt-impact-t" style={{ color: 'var(--text-500)', fontWeight: 500 }}>本次无需联动调整下游目标</div></div>
              </div>
            </div>
          )}

          {/* 人可对复盘结论留意见 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 20px 18px' }}>
            <FeedbackEntry label="对复盘结论留意见" onClick={() => onToast && onToast('已记录管理层意见 · 复盘 AI 将异步回应并按需重评')} />
          </div>
        </div>
      ))}
    </>
  );
}

Object.assign(window, { AcceptRetro });
