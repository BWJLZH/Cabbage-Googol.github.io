// ============================================================
// 志愿匹配算法 — 纯函数（可单测）
// 有效线 = admit_line + 省份调整；线差分档：
//   d ≥ +15 → 保底(85%+)；-15 < d < +15 → 稳妥(50-80%)；d ≤ -15 → 冲刺(20-40%)
// 偏好只影响档内排序，每档最多取 4 所
// 参考线/调整值均为模拟数据（见 data/schools.js）
// ============================================================
import { PROVINCE_OFFSETS } from '../data/schools.js'

export const TIER_LABELS = { reach: '冲刺', steady: '稳妥', safe: '保底' }

export function effectiveLine(school, province) {
  return school.admit_line + (PROVINCE_OFFSETS[province] || 0)
}

export function tierFor(score, line) {
  const d = score - line
  if (d >= 15) return 'safe'
  if (d > -15) return 'steady'
  return 'reach'
}

// 偏好打分（档内排序用）— 保留原 MatchPage 的加权逻辑
export function preferenceScore(s, { cities, priority }) {
  let sc = 0
  if (s.type === '985') sc += 30
  else if (s.type === '211') sc += 20
  else if (s.type === '双一流') sc += 15
  else sc += 5
  if (cities.includes(s.city)) sc += 20
  if (priority === 'dormitory') {
    sc += (s.scores.宿舍 || 3) * 3
  } else if (priority === 'city') {
    if (['北京', '上海', '广州', '深圳', '杭州'].includes(s.city)) sc += 25
  } else if (priority === 'prestige') {
    if (s.type === '985') sc += 20
  } else {
    sc += (s.scores.综合 || 3) * 4
  }
  sc += (s.scores.综合 || 3) * 3
  return sc
}

export function matchSchools(schools, { score, province, cities, priority }) {
  const tiers = { reach: [], steady: [], safe: [] }
  for (const s of schools) {
    const line = effectiveLine(s, province)
    const diff = score - line
    const key = tierFor(score, line)
    tiers[key].push({
      slug: s.slug,
      name: s.name,
      city: s.city,
      type: s.type,
      _emoji: s._emoji,
      tier: TIER_LABELS[key],
      line,
      diff,
      reason: (s.profile || '').slice(0, 30) + '...',
      _pref: preferenceScore(s, { cities, priority })
    })
  }
  for (const k of Object.keys(tiers)) {
    tiers[k].sort((a, b) => b._pref - a._pref)
    tiers[k] = tiers[k].slice(0, 4)
  }
  return [...tiers.reach, ...tiers.steady, ...tiers.safe]
}
