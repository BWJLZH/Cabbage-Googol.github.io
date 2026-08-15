import { describe, it, expect } from 'vitest'
import { SCHOOLS } from '../data/schools.js'
import { effectiveLine, tierFor, matchSchools } from './matchAlgorithm.js'

const qh = SCHOOLS.find(s => s.slug === 'tsinghua-university')
const szu = SCHOOLS.find(s => s.slug === 'shenzhen-university')

describe('effectiveLine', () => {
  it('参考线 + 省份调整', () => {
    expect(effectiveLine(qh, '河南')).toBe(700)
    expect(effectiveLine(szu, '北京')).toBe(570)
  })
  it('未知省份调整值为 0', () => {
    expect(effectiveLine(qh, '火星')).toBe(qh.admit_line)
  })
})

describe('tierFor', () => {
  it('边界值：+15 保底、+14 稳妥、-15 冲刺、-14 稳妥', () => {
    expect(tierFor(700, 685)).toBe('safe')
    expect(tierFor(699, 685)).toBe('steady')
    expect(tierFor(670, 685)).toBe('reach')
    expect(tierFor(671, 685)).toBe('steady')
  })
})

describe('matchSchools', () => {
  const opts = { score: 620, province: '河南', cities: [], priority: 'comprehensive' }

  it('深大线差+35 保底；西电线差0 稳妥；清华线差-80 冲刺', () => {
    const rs = matchSchools(SCHOOLS, opts)
    const bySlug = Object.fromEntries(rs.map(r => [r.slug, r]))
    expect(bySlug['shenzhen-university'].tier).toBe('保底')
    expect(bySlug['shenzhen-university'].diff).toBe(35)
    expect(bySlug['xidian-university'].tier).toBe('稳妥')
    expect(bySlug['xidian-university'].diff).toBe(0)
    expect(bySlug['tsinghua-university'].tier).toBe('冲刺')
  })

  it('每档最多 4 所且档内按偏好分降序', () => {
    const rs = matchSchools(SCHOOLS, opts)
    for (const tier of ['冲刺', '稳妥', '保底']) {
      const list = rs.filter(r => r.tier === tier)
      expect(list.length).toBeLessThanOrEqual(4)
      for (let i = 1; i < list.length; i++) {
        expect(list[i]._pref).toBeLessThanOrEqual(list[i - 1]._pref)
      }
    }
  })

  it('750 分全部保底；300 分全部冲刺', () => {
    expect(matchSchools(SCHOOLS, { ...opts, score: 750 }).every(r => r.tier === '保底')).toBe(true)
    expect(matchSchools(SCHOOLS, { ...opts, score: 300 }).every(r => r.tier === '冲刺')).toBe(true)
  })

  it('结果包含有效线与线差', () => {
    const rs = matchSchools(SCHOOLS, opts)
    for (const r of rs) {
      expect(typeof r.line).toBe('number')
      expect(r.diff).toBe(opts.score - r.line)
    }
  })
})
