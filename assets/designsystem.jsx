/* ============================================================
   设计系统总览页 — designsystem.jsx
   ------------------------------------------------------------
   作用：批 0 设计规范样板页（路由 'design-system'）。集中展示色彩 / 字阶 / 间距圆角阴影 /
         核心组件 / 图标 / 动效。纯展示页，供开发与设计对齐规范，不含业务逻辑。
   所有 token 与原语都来自 components.jsx / tokens.css，此处只是取用展示。
   ============================================================ */

/* DSSection · Swatch — 本页专用的分节容器与色板色块（仅规范页使用）。 */
function DSSection({ id, num, title, desc, children }) {
  return (
    <section className="ds-sec" id={id}>
      <div className="ds-sec-head">
        <span className="ds-sec-num mono">{num}</span>
        <div>
          <h2 className="t-h2">{title}</h2>
          {desc && <p className="t-caption" style={{ marginTop: 2 }}>{desc}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, hex, role, dark }) {
  return (
    <div className="swatch">
      <div className="swatch-chip" style={{ background: hex, border: hex.toUpperCase() === '#FFFFFF' ? '1px solid var(--border-200)' : 'none' }}>
        {dark && <span style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>Aa</span>}
      </div>
      <div className="swatch-meta">
        <span className="swatch-name">{name}</span>
        <span className="mono swatch-hex">{hex}</span>
        {role && <span className="t-micro" style={{ color: 'var(--text-400)' }}>{role}</span>}
      </div>
    </div>
  );
}

/* DesignSystemPage — 设计系统页主体。由 06 个 DSSection 组成：
   01 色彩 / 02 字体字阶 / 03 间距圆角阴影 / 04 核心组件 / 05 Icon / 06 动效与 Loading。
   顶部常量（typeScale/spacing/radii/shadows/iconMap/motion）为展示用清单。 */
function DesignSystemPage() {
  const typeScale = [
    ['Display', '32 / 40 · 600', 'display'],
    ['H1', '24 / 32 · 600', 'h1'],
    ['H2', '20 / 28 · 600', 'h2'],
    ['H3', '16 / 24 · 600', 'h3'],
    ['Body-L', '15 / 24 · 400', 'bodyl'],
    ['Body', '14 / 22 · 400', 'body'],
    ['Caption', '13 / 20 · 400', 'caption'],
    ['Micro', '12 / 16 · 500', 'micro'],
  ];
  const spacing = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64];
  const radii = [['xs', 4], ['sm', 6], ['md', 10], ['lg', 12], ['full', 999]];
  const shadows = [['xs', 'var(--shadow-xs)'], ['sm', 'var(--shadow-sm)'], ['md', 'var(--shadow-md)'], ['lg', 'var(--shadow-lg)']];
  const iconMap = [
    ['总览看板', 'layout-dashboard'], ['项目', 'box'], ['项目 ID', 'hash'], ['顶层战略文档', 'scroll-text'],
    ['战略层', 'compass'], ['项目备选池', 'inbox'], ['立项', 'clipboard-check'], ['大额成本审批', 'wallet'],
    ['理想化状态', 'target'], ['核心价值', 'gem'], ['目标用户', 'users'], ['目标树', 'git-fork'],
    ['中短期/周目标', 'flag'], ['阶段目标', 'milestone'], ['事务', 'square-check-big'], ['逐环审核', 'shield-check'],
    ['卡点', 'alert-triangle'], ['验收', 'circle-check'], ['进度推进度', 'trending-up'], ['AI 员工', 'bot'],
    ['AI 平台 6699', 'plug'], ['AI 工作中', 'sparkles'], ['算力成本', 'gauge'], ['费用看板', 'receipt'],
    ['结项', 'package-check'], ['强制结项', 'octagon-alert'], ['介入工作台', 'list-checks'], ['异步反馈', 'message-square-text'],
    ['规则与留痕', 'history'], ['知识库', 'library'], ['权限/角色', 'user-cog'], ['搜索', 'search'],
  ];
  const motion = [
    ['页面转场', '路由切换', '200ms', 'ease-out · 淡入 + 上移 4px'],
    ['工作区切换', '组合级 ⇄ 项目', '240ms', 'ease-in-out · 交叉淡入'],
    ['卡片悬浮', 'hover', '120ms', 'ease-out · 阴影 + 上移 2px'],
    ['数字滚动', '指标 / 金额更新', '600ms', 'ease-out · 等宽翻滚'],
    ['骨架 → 内容', '数据返回', '200ms', 'ease-out · 上移 4px'],
    ['状态流转', '事务 / 看板落位', '300ms', 'spring · 色脉冲 + FLIP'],
    ['抽屉滑出', '下钻 / 反馈', '240ms', 'ease-out'],
    ['卡点滑入', '新卡点', '260ms', 'ease-out · 橙脉冲'],
  ];

  const [skelKey, setSkelKey] = React.useState(0);
  const [countVal, setCountVal] = React.useState(48210);

  return (
    <div className="content-inner page-fade ds-page">
      <Breadcrumb items={[{ label: '规范' }, { label: '设计系统' }]} />
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="page-head-ico"><Icon name="palette" size={22} color="var(--blue-primary)" /></span>
          <div>
            <h1 className="t-h1">设计系统</h1>
          </div>
        </div>
        <Pill tone="info">批 0 · 规范样板</Pill>
      </div>

      {/* 01 色彩 */}
      <DSSection num="01" title="色彩" desc="白 / 画布灰 ≈75% · 中性文字线 ≈15% · 蓝色强调 ≈8% · 语义色 ≈2%。一屏蓝色面积 ≤10%。">
        <div className="ds-block-label t-label-caps">主色 · 商务蓝</div>
        <div className="swatch-grid">
          <Swatch name="主蓝 Primary" hex="#2563EB" role="主按钮 / 选中 / 进度环" dark />
          <Swatch name="主蓝 Hover" hex="#1D4ED8" role="悬停 / 按下" dark />
          <Swatch name="深蓝 Deep" hex="#1E3A8A" role="品牌 / 图表深段" dark />
          <Swatch name="浅蓝 Tint" hex="#EFF5FF" role="选中行 / 当前导航底" />
          <Swatch name="浅蓝 Soft" hex="#DBE7FE" role="标签底 / 骨架扫光" />
          <Swatch name="蓝-边框" hex="#BFD4FE" role="蓝色描边 / 聚焦环" />
        </div>
        <div className="ds-block-label t-label-caps" style={{ marginTop: 24 }}>中性灰阶</div>
        <div className="swatch-grid">
          <Swatch name="纯白" hex="#FFFFFF" role="卡片 / 弹窗底" />
          <Swatch name="画布灰" hex="#F7F9FC" role="页面底（微冷）" />
          <Swatch name="分隔灰 100" hex="#F1F4F9" role="表头 / 分隔线" />
          <Swatch name="描边灰 200" hex="#E4E8EF" role="默认描边" />
          <Swatch name="描边灰 300" hex="#D2D8E2" role="输入框 / hover 描边" />
          <Swatch name="辅助文字 400" hex="#9AA4B2" role="占位 / 禁用 / icon" dark />
          <Swatch name="次级文字 500" hex="#647084" role="辅助说明 / 时间戳" dark />
          <Swatch name="正文 700" hex="#3A4355" role="正文 / 表格主文字" dark />
          <Swatch name="标题 900" hex="#1A2233" role="标题 / 关键数字" dark />
        </div>
        <div className="ds-block-label t-label-caps" style={{ marginTop: 24 }}>语义色 · 状态强绑定</div>
        <div className="sem-grid">
          {[
            ['Success 通过 / 健康', 'success', '验收通过 · 项目健康'],
            ['Warning 关注 / 卡点', 'warning', '卡点 · 需关注 · 临界'],
            ['Danger 阻断 / 失败', 'danger', '大额待批 · 验收失败'],
            ['Info 中性 / 进行中', 'info', '普通提示 · 进行中'],
            ['Neutral 草稿 / 未开始', 'neutral', '草稿 · 待拆解'],
            ['AI 进行中 · 特色', 'ai', 'AI 处理态 · 自动推进'],
          ].map(([label, tone, use]) => (
            <div className="sem-item" key={tone}>
              <div className="sem-swatches">
                <span className="sem-main" style={{ background: STATUS[tone].c }} />
                <span className="sem-bg" style={{ background: STATUS[tone].bg }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-900)' }}>{label}</div>
                <div className="t-micro" style={{ color: 'var(--text-400)' }}>{use}</div>
                <div style={{ marginTop: 6 }}><Pill tone={tone}>{tone === 'ai' ? 'AI 处理中' : label.split(' ')[0]}</Pill></div>
              </div>
            </div>
          ))}
        </div>
      </DSSection>

      {/* 02 字体与字阶 */}
      <DSSection num="02" title="字体与字阶" desc="Inter / PingFang SC · 字重仅 400 / 500 / 600；数字、ID、金额、百分比一律等宽 mono（tabular-nums）。">
        <Card pad style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {typeScale.map(([token, spec, cls]) => (
            <div className="type-row" key={token}>
              <span className={`tp tp-${cls}`}>项目治理 · AI 自主推进</span>
              <div className="type-meta">
                <span className="type-token">{token}</span>
                <span className="mono t-micro" style={{ color: 'var(--text-400)' }}>{spec}</span>
              </div>
            </div>
          ))}
          <div className="type-row">
            <span className="metric-xl">¥1,938,402.50</span>
            <div className="type-meta"><span className="type-token">Metric-XL</span><span className="mono t-micro" style={{ color: 'var(--text-400)' }}>30 / 36 · 600 mono</span></div>
          </div>
          <div className="type-row" style={{ borderBottom: 'none' }}>
            <span className="mono" style={{ fontSize: 14, color: 'var(--text-700)' }}>PRJ-2026-0137 · 76.4% · 4h</span>
            <div className="type-meta"><span className="type-token">Mono 等宽</span><span className="mono t-micro" style={{ color: 'var(--text-400)' }}>tabular-nums</span></div>
          </div>
        </Card>
      </DSSection>

      {/* 03 间距 + 圆角 + 阴影 */}
      <DSSection num="03" title="间距 · 圆角 · 阴影" desc="4px 基准标尺；静态用描边定义层次，悬浮才上阴影；禁用 16px+ 大圆角。">
        <div className="ds-cols-2">
          <Card pad>
            <div className="ds-block-label t-label-caps" style={{ marginBottom: 14 }}>间距标尺 · 4px 基准</div>
            <div className="space-scale">
              {spacing.map(s => (
                <div className="space-item" key={s}>
                  <span className="space-bar" style={{ width: s }} />
                  <span className="mono t-micro" style={{ color: 'var(--text-500)' }}>{s}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card pad>
            <div className="ds-block-label t-label-caps" style={{ marginBottom: 14 }}>圆角</div>
            <div className="radius-row">
              {radii.map(([n, v]) => (
                <div className="radius-item" key={n}>
                  <span className="radius-box" style={{ borderRadius: v === 999 ? 999 : v }} />
                  <span className="t-micro" style={{ color: 'var(--text-500)' }}>{n} · {v === 999 ? 'full' : v}</span>
                </div>
              ))}
            </div>
            <div className="ds-block-label t-label-caps" style={{ margin: '20px 0 14px' }}>阴影</div>
            <div className="shadow-row">
              {shadows.map(([n, v]) => (
                <div className="shadow-item" key={n}>
                  <span className="shadow-box" style={{ boxShadow: v }} />
                  <span className="t-micro" style={{ color: 'var(--text-500)' }}>{n}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </DSSection>

      {/* 04 核心组件 */}
      <DSSection num="04" title="核心组件" desc="白底 · 描边定义层次 · 状态文案与色强绑定（同状态不允许多色）。">
        <div className="ds-cols-2">
          <Card pad>
            <div className="ds-block-label t-label-caps" style={{ marginBottom: 14 }}>按钮</div>
            <div className="comp-row">
              <Button variant="primary" icon="check">主按钮</Button>
              <Button variant="secondary" icon="filter">次按钮</Button>
              <Button variant="text" icon="plus">文字按钮</Button>
              <Button variant="danger" icon="octagon-alert">危险</Button>
              <Button variant="primary" disabled>禁用</Button>
            </div>
            <div className="ds-block-label t-label-caps" style={{ margin: '20px 0 14px' }}>标签 / 状态药丸</div>
            <div className="comp-row">
              <Tag mono>PRJ-2026-0137</Tag>
              <Tag>战略方向</Tag>
              <Pill tone="success">健康</Pill>
              <Pill tone="warning">需关注</Pill>
              <Pill tone="danger">卡点</Pill>
              <Pill tone="info">进行中</Pill>
              <Pill tone="neutral">草稿</Pill>
              <Pill tone="ai">AI 处理中</Pill>
            </div>
            <div className="ds-block-label t-label-caps" style={{ margin: '20px 0 14px' }}>状态提示条</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <StatusBar tone="danger" icon="wallet" title="大额成本待批 · ¥182,000">对外采购超过阈值，需管理层拍板后方可执行。</StatusBar>
              <StatusBar tone="ai" icon="sparkles" title="AI 正在拆解阶段目标 · 第 3 / 5 步">预计 2 分钟完成，可转入后台。</StatusBar>
            </div>
          </Card>
          <Card pad>
            <div className="ds-block-label t-label-caps" style={{ marginBottom: 14 }}>指标卡 + 进度环</div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
              <div style={{ flex: 1 }}>
                <MetricCard icon="box" iconColor="var(--blue-primary)" label="在运行项目" value={187} delta={6} deltaTone="neutral" deltaText="" sub="较上周" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0 8px' }}>
                <Ring value={76} size={72} stroke={7} />
                <span className="t-micro" style={{ color: 'var(--text-500)' }}>推进度</span>
              </div>
            </div>
            <div className="ds-block-label t-label-caps" style={{ margin: '20px 0 14px' }}>表格</div>
            <div style={{ border: '1px solid var(--border-200)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
              <table className="dtable">
                <thead><tr>
                  <th><span className="th-in">项目</span></th>
                  <th><span className="th-in">状态</span></th>
                  <th className="num"><span className="th-in">推进度 <Icon name="chevron-down" size={13} color="var(--text-400)" /></span></th>
                </tr></thead>
                <tbody>
                  {[['智能履约调度中台','PRJ-2026-0137','success','健康','82%'],
                    ['客服知识中枢重构','PRJ-2026-0129','warning','需关注','54%'],
                    ['区域运力预测引擎','PRJ-2026-0151','danger','卡点','37%']].map((r, i) => (
                    <tr key={i} className={i === 0 ? 'selected' : ''}>
                      <td><div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontWeight: 500, color: 'var(--text-900)' }}>{r[0]}</span><span className="mono t-micro" style={{ color: 'var(--text-400)' }}>{r[1]}</span></div></td>
                      <td><Pill tone={r[2]}>{r[3]}</Pill></td>
                      <td className="num" style={{ fontWeight: 600, color: 'var(--text-900)' }}>{r[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        <Card pad style={{ marginTop: 16 }}>
          <div className="ds-block-label t-label-caps" style={{ marginBottom: 14 }}>空态</div>
          <EmptyState glyph="inbox" title="项目备选池暂无候选项目" desc="待战略层分析后自动沉淀，无需手动创建。" action={<Button variant="primary" icon="compass">前往战略层</Button>} />
        </Card>
      </DSSection>

      {/* 05 Icon */}
      <DSSection num="05" title="统一 Icon · Lucide 线性 outline" desc="全系统单一图标族，线宽 1.5、端点 round；术语 ↔ icon 一一绑定，永远配文字标签。">
        <div className="icon-gallery">
          {iconMap.map(([label, name]) => (
            <div className="icon-cell" key={name}>
              <Icon name={name} size={22} color="var(--text-500)" />
              <span className="icon-cell-label">{label}</span>
              <span className="mono icon-cell-name">{name}</span>
            </div>
          ))}
        </div>
      </DSSection>

      {/* 06 动效与 Loading */}
      <DSSection num="06" title="动效与 Loading" desc="分场景而非全用转圈：骨架屏 · 进度环 · 数字滚动 · AI 分步进度。微交互 ≤300ms，叙事 ≤1.2s，尊重 reduce-motion。">
        <div className="ds-cols-2">
          <Card pad>
            <div className="ds-block-label t-label-caps" style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>骨架屏 + 数字滚动</span>
              <Button variant="text" size="sm" icon="play" onClick={() => { setSkelKey(k => k + 1); setCountVal(v => v === 48210 ? 61240 : 48210); }}>重放</Button>
            </div>
            <div key={skelKey} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Skel w="70%" h={14} /><Skel w="92%" h={14} /><Skel w="55%" h={14} />
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}><Skel w={44} h={44} r={8} /><div style={{ flex: 1 }}><Skel w="80%" h={12} /><Skel w="40%" h={12} style={{ marginTop: 8 }} /></div></div>
            </div>
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--divider)' }}>
              <span className="t-caption">今日算力成本</span>
              <div className="metric-xl" style={{ marginTop: 4 }}>¥<CountUp value={countVal} /></div>
            </div>
          </Card>
          <Card pad>
            <div className="ds-block-label t-label-caps" style={{ marginBottom: 14 }}>AI 处理态 · 分步进度（系统特色）</div>
            <div className="ai-strip">
              <div className="ai-strip-bar"><span className="ai-strip-fill" /></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
                <Icon name="sparkles" size={18} color="var(--ai)" className="spin-slow" />
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ai)' }}>正在拆解阶段目标</span>
                <span className="mono t-micro" style={{ marginLeft: 'auto', color: 'var(--text-500)' }}>第 3 / 5 步</span>
              </div>
              <div className="ai-steps">
                {['立项校验', '目标拆解', '审核中', '生成验收结论', '完成'].map((s, i) => (
                  <div className="ai-step" key={s} data-state={i < 2 ? 'done' : i === 2 ? 'run' : 'wait'}>
                    <span className="ai-step-dot" />{s}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
        <Card pad style={{ marginTop: 16 }}>
          <div className="ds-block-label t-label-caps" style={{ marginBottom: 14 }}>动效清单</div>
          <table className="dtable">
            <thead><tr><th><span className="th-in">动效</span></th><th><span className="th-in">触发</span></th><th><span className="th-in">时长</span></th><th><span className="th-in">缓动 / 说明</span></th></tr></thead>
            <tbody>
              {motion.map((m, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500, color: 'var(--text-900)' }}>{m[0]}</td>
                  <td className="t-caption">{m[1]}</td>
                  <td><span className="mono" style={{ fontSize: 13, color: 'var(--blue-primary)', fontWeight: 600 }}>{m[2]}</span></td>
                  <td className="t-caption">{m[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </DSSection>
    </div>
  );
}

Object.assign(window, { DesignSystemPage });
