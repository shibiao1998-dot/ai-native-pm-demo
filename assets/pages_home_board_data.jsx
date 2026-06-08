/* ============================================================
   项目总览看板 · 数据层（pages_home_board_data.jsx）
   ------------------------------------------------------------
   作用：首页「项目总览看板」的全部 mock 数据与派生工具。纯数据文件，无 UI。
   ⚠ 真实开发：下面所有 OB_* 常量都需换为后端项目树 / 状态接口，派生工具函数可保留。

   关系模型：项目集 Portfolio → 母项目 → 子项目 → 二级子项目…（可多级承接）。
   每个项目携：生命周期阶段 stage / 简化状态桶 bucket / 负责模式 mode（ai|human）
              / 健康 health / 推进度 prog / 承接的上级目标（gk 类型 + gt 文案）。
   ============================================================ */

/* ---------- 生命周期阶段（精细阶段，进入项目后可见） ----------
   每阶段带颜色/背景/描述；按 k 取用。OB_STAGE_MAP 是 k→阶段对象的快查表。 */
const OB_STAGES = [
  { k: 'charter', label: '立项中',   short: '立项', icon: 'file-pen-line',  c: 'var(--text-500)', bg: 'var(--neutral-bg)', rail: 'var(--text-400)', desc: '战略意图已识别，正在自动立项与边界确认' },
  { k: 'plan',    label: '规划中',   short: '规划', icon: 'git-fork',       c: 'var(--info)',     bg: 'var(--info-bg)',    rail: 'var(--info)',     desc: '目标树拆解中，尚未冻结排期' },
  { k: 'ready',   label: '待执行',   short: '待执行', icon: 'circle-dashed', c: 'oklch(0.55 0.14 285)', bg: 'oklch(0.967 0.018 285)', rail: 'oklch(0.55 0.14 285)', desc: '规划已完成、排期已冻结，待派发执行' },
  { k: 'exec',    label: '执行中',   short: '执行', icon: 'loader-2', spin: true, c: 'var(--ai)',   bg: 'var(--ai-soft)',    rail: 'var(--ai)',       desc: '事务正在 AI / 人协同推进' },
  { k: 'accept',  label: '验收中',   short: '验收', icon: 'clipboard-check', c: 'var(--warning)', bg: 'var(--warning-bg)', rail: 'var(--warning)',  desc: '阶段产出待验收闭环' },
  { k: 'close',   label: '已结项',   short: '结项', icon: 'package-check',  c: 'var(--success)',  bg: 'var(--success-bg)', rail: 'var(--success)',  desc: '目标达成，已归档沉淀' },
];
const OB_STAGE_MAP = Object.fromEntries(OB_STAGES.map(s => [s.k, s]));

/* ---------- 简化状态桶（看板主视图只用这三类，避免标签过多） ----------
   OB_BUCKET_OF(stage)：把 6 个精细阶段归并为 3 个桶（close→done / exec,accept→active / 其余→prep）。 */
const OB_BUCKETS = [
  { k: 'prep',   label: '筹备中', icon: 'git-fork',       c: 'var(--info)',     bg: 'var(--info-bg)',    desc: '立项 / 规划 / 待执行' },
  { k: 'active', label: '执行中', icon: 'loader-2', spin: true, c: 'var(--ai)',  bg: 'var(--ai-soft)',    desc: '执行 / 验收' },
  { k: 'done',   label: '已结项', icon: 'package-check',  c: 'var(--success)',  bg: 'var(--success-bg)', desc: '已达成归档' },
];
const OB_BUCKET_MAP = Object.fromEntries(OB_BUCKETS.map(b => [b.k, b]));
const OB_BUCKET_OF = (stage) => stage === 'close' ? 'done' : (stage === 'exec' || stage === 'accept') ? 'active' : 'prep';

/* ---------- 负责模式 ---------- */
const OB_MODE = {
  ai:    { label: 'AI 自治', icon: 'bot',        c: 'var(--ai)',      bg: 'var(--ai-soft)' },
  human: { label: '人工负责', icon: 'user-round', c: 'var(--text-500)', bg: 'var(--neutral-bg)' },
};

/* ---------- 承接的目标类型（goal alignment） ---------- */
const OB_GOAL_KIND = {
  north:  { label: '强化状态', c: 'oklch(0.55 0.14 300)' },
  mid:    { label: '中短期目标', c: 'var(--blue-primary)' },
  phase:  { label: '阶段目标', c: 'oklch(0.55 0.14 285)' },
  week:   { label: '周目标',   c: 'var(--text-500)' },
};

/* ---------- 项目集（每个有主色 · 负责人 · 北极星/强化状态） ---------- */
const OB_PORTFOLIOS = [
  { id: 'fulfill', name: '履约与供应链',   owner: '何沛', c: 'oklch(0.55 0.10 185)', bg: 'oklch(0.965 0.020 185)', north: '履约时效与成本双优' },
  { id: 'service', name: '客户服务自助化', owner: '苏婧', c: 'var(--blue-primary)',  bg: 'var(--blue-tint)',       north: '客户自助率 ≥ 70%' },
  { id: 'growth',  name: '增长与营销',     owner: '林越', c: 'oklch(0.55 0.14 300)', bg: 'oklch(0.966 0.018 300)', north: '营销 ROI 与增长效率提升' },
  { id: 'data',    name: '数据与财务中台', owner: '周岚', c: 'oklch(0.60 0.12 65)',  bg: 'oklch(0.968 0.026 70)',  north: '财务与数据全流程自动化' },
];
const OB_PF_MAP = Object.fromEntries(OB_PORTFOLIOS.map(p => [p.id, p]));

/* ---------- 项目树（母 / 子 / 二级子 …） ----------
   每条记录的关键字段：
     parent: null = 母项目（承接项目集北极星）；否则为所属上级项目 id
     gk: 承接目标类型（north | mid | phase | week）  gt: 承接的具体目标文案
     kapian: 卡点数（>0 时看板高亮提醒）
*/
const OB_PROJECTS = [
  /* ===== 履约与供应链 ===== */
  { id: 'P-0137', name: '智能履约调度中台', pf: 'fulfill', parent: null,     stage: 'exec',   mode: 'ai',    health: '健康', prog: 82, owner: '何沛', kapian: 0, gk: 'north', gt: '履约时效 ↑ 30%' },
  { id: 'P-0151', name: '区域路况数据接入', pf: 'fulfill', parent: 'P-0137', stage: 'exec',   mode: 'ai',    health: '健康', prog: 68, owner: '何沛', kapian: 0, gk: 'mid',   gt: '实时路况覆盖率 ≥ 95%' },
  { id: 'P-0151a', name: '实时路况清洗管道', pf: 'fulfill', parent: 'P-0151', stage: 'exec',  mode: 'ai',    health: '健康', prog: 58, owner: '何沛', kapian: 0, gk: 'phase', gt: '路况数据延迟 < 5s' },
  { id: 'P-0191', name: '调度算法灰度引擎', pf: 'fulfill', parent: 'P-0137', stage: 'exec',   mode: 'ai',    health: '关注', prog: 54, owner: '何沛', kapian: 1, gk: 'mid',   gt: '调度命中率 ↑ 20%' },
  { id: 'P-0188', name: '异常自愈规则库',   pf: 'fulfill', parent: 'P-0137', stage: 'accept', mode: 'human', health: '健康', prog: 90, owner: '苏婧', kapian: 0, gk: 'phase', gt: '异常自愈率 ≥ 85%' },
  { id: 'P-0202', name: '调度可视化看板',   pf: 'fulfill', parent: 'P-0137', stage: 'plan',   mode: 'ai',    health: '健康', prog: 22, owner: '何沛', kapian: 0, gk: 'phase', gt: '调度状态实时可视' },

  { id: 'P-0133', name: '全国仓网布局优化', pf: 'fulfill', parent: null,     stage: 'plan',   mode: 'human', health: '关注', prog: 30, owner: '何沛', kapian: 0, gk: 'north', gt: '仓网综合成本 ↓ 15%' },
  { id: 'P-0149', name: '库存调拨优化',     pf: 'fulfill', parent: 'P-0133', stage: 'exec',   mode: 'ai',    health: '健康', prog: 76, owner: '周岚', kapian: 0, gk: 'mid',   gt: '调拨周转效率 ↑ 25%' },
  { id: 'P-0149a', name: '调拨需求预测模型', pf: 'fulfill', parent: 'P-0149', stage: 'plan', mode: 'ai',    health: '健康', prog: 30, owner: '周岚', kapian: 0, gk: 'phase', gt: '需求预测误差 < 12%' },
  { id: 'P-0166', name: '智能排班引擎',     pf: 'fulfill', parent: 'P-0133', stage: 'ready',  mode: 'human', health: '健康', prog: 12, owner: '何沛', kapian: 0, gk: 'phase', gt: '排班人效 ↑ 18%' },

  /* ===== 客户服务自助化 ===== */
  { id: 'P-0129', name: '客服知识中枢重构', pf: 'service', parent: null,     stage: 'exec',   mode: 'human', health: '关注', prog: 54, owner: '苏婧', kapian: 1, gk: 'north', gt: '客户自助率 ≥ 70%' },
  { id: 'P-0173', name: '智能工单分派系统', pf: 'service', parent: 'P-0129', stage: 'exec',   mode: 'ai',    health: '健康', prog: 74, owner: '林越', kapian: 0, gk: 'mid',   gt: '工单分派准确率 ≥ 92%' },
  { id: 'P-0173a', name: '分派规则自学习',  pf: 'service', parent: 'P-0173', stage: 'exec',  mode: 'ai',    health: '健康', prog: 70, owner: '林越', kapian: 0, gk: 'phase', gt: '规则自优化周期 < 1 周' },
  { id: 'P-0158', name: '客诉根因分析',     pf: 'service', parent: 'P-0129', stage: 'accept', mode: 'ai',    health: '健康', prog: 88, owner: '苏婧', kapian: 0, gk: 'phase', gt: '根因定位准确率 ≥ 88%' },
  { id: 'P-0210', name: '知识库语义检索',   pf: 'service', parent: 'P-0129', stage: 'charter', mode: 'ai',   health: '健康', prog: 4,  owner: '苏婧', kapian: 0, gk: 'phase', gt: '检索召回率 ≥ 90%' },

  { id: 'P-0181', name: '全渠道自助应答',   pf: 'service', parent: null,     stage: 'ready',  mode: 'ai',    health: '健康', prog: 16, owner: '苏婧', kapian: 0, gk: 'north', gt: '全渠道自助覆盖' },

  /* ===== 增长与营销 ===== */
  { id: 'P-0144', name: '营销内容生成平台', pf: 'growth',  parent: null,     stage: 'exec',   mode: 'ai',    health: '卡点', prog: 61, owner: '林越', kapian: 2, gk: 'north', gt: '营销 ROI 提升' },
  { id: 'P-0140', name: '会员流失预警',     pf: 'growth',  parent: 'P-0144', stage: 'exec',   mode: 'ai',    health: '健康', prog: 79, owner: '苏婧', kapian: 0, gk: 'mid',   gt: '高价值会员留存 ↑ 8%' },
  { id: 'P-0155', name: '门店选址评估模型', pf: 'growth',  parent: 'P-0144', stage: 'plan',   mode: 'human', health: '关注', prog: 28, owner: '何沛', kapian: 0, gk: 'phase', gt: '选址命中率提升' },
  { id: 'P-0214', name: '投放归因建模',     pf: 'growth',  parent: 'P-0144', stage: 'charter', mode: 'ai',   health: '健康', prog: 2,  owner: '林越', kapian: 0, gk: 'phase', gt: '归因偏差 < 10%' },

  /* ===== 数据与财务中台 ===== */
  { id: 'P-0118', name: '财务自动化中台',   pf: 'data',    parent: null,     stage: 'exec',   mode: 'ai',    health: '健康', prog: 88, owner: '周岚', kapian: 0, gk: 'north', gt: '财务流程自动化率 ≥ 90%' },
  { id: 'P-0162', name: '供应商对账自动化', pf: 'data',    parent: 'P-0118', stage: 'exec',   mode: 'ai',    health: '关注', prog: 49, owner: '苏婧', kapian: 0, gk: 'mid',   gt: '对账自动化率 ≥ 95%' },
  { id: 'P-0124', name: '财务凭证识别',     pf: 'data',    parent: 'P-0118', stage: 'accept', mode: 'ai',    health: '健康', prog: 92, owner: '周岚', kapian: 0, gk: 'phase', gt: '凭证识别准确率 ≥ 99%' },
  { id: 'P-0167', name: '合同条款抽取',     pf: 'data',    parent: 'P-0118', stage: 'accept', mode: 'ai',    health: '卡点', prog: 42, owner: '林越', kapian: 1, gk: 'phase', gt: '条款抽取覆盖率 ≥ 95%' },
  { id: 'P-0096', name: '旧版报表迁移',     pf: 'data',    parent: 'P-0118', stage: 'close',  mode: 'human', health: '健康', prog: 100, owner: '周岚', kapian: 0, gk: 'phase', gt: '历史报表 100% 迁移' },
];

/* ---------- 派生工具（在项目树上做查询/统计） ----------
   OB_CHILDREN(pid)  取某项目的直接子项目
   OB_PARENTS_OF(pf) 取某项目集下的全部母项目（parent===null）
   OB_IS_PARENT(p)   是否母项目
   OB_DEPTH(p)       沿 parent 链向上数到根，得到层级深度（0=母）
   OB_KIND_LABEL(p)  根据深度输出「母/子/二级子」中文标签 */
const OB_CHILDREN = (pid) => OB_PROJECTS.filter(p => p.parent === pid);
const OB_PARENTS_OF = (pfId) => OB_PROJECTS.filter(p => p.pf === pfId && p.parent === null);
const OB_IS_PARENT = (p) => p.parent === null;
const OB_DEPTH = (p) => { let d = 0, cur = p; while (cur && cur.parent) { d++; cur = OB_PROJECTS.find(x => x.id === cur.parent); } return d; };
const OB_KIND_LABEL = (p) => { const d = OB_DEPTH(p); return d === 0 ? '母项目' : d === 1 ? '子项目' : d === 2 ? '二级子项目' : '下级子项目'; };

/* 统计：对传入项目列表汇总 — 总数/母子数/模式占比/卡点数/按状态桶分组。看板顶部指标由此生成。 */
function obStats(list) {
  const total = list.length;
  const parents = list.filter(OB_IS_PARENT).length;
  const children = total - parents;
  const ai = list.filter(p => p.mode === 'ai').length;
  const human = total - ai;
  const kapian = list.reduce((s, p) => s + p.kapian, 0);
  const byBucket = Object.fromEntries(OB_BUCKETS.map(b => [b.k, list.filter(p => OB_BUCKET_OF(p.stage) === b.k)]));
  const aiPct = total ? Math.round(ai / total * 100) : 0;
  return { total, parents, children, ai, human, aiPct, kapian, byBucket };
}

/* 单个项目集的统计 */
function obPfStats(pfId) {
  const list = OB_PROJECTS.filter(p => p.pf === pfId);
  return { ...obStats(list), list };
}

Object.assign(window, {
  OB_STAGES, OB_STAGE_MAP, OB_BUCKETS, OB_BUCKET_MAP, OB_BUCKET_OF, OB_MODE, OB_GOAL_KIND,
  OB_PORTFOLIOS, OB_PF_MAP, OB_PROJECTS, OB_CHILDREN, OB_PARENTS_OF, OB_IS_PARENT,
  OB_DEPTH, OB_KIND_LABEL, obStats, obPfStats,
});
