import { describe, it, expect } from 'vitest'
import { buildSchoolPrompt } from './schoolPrompt.js'

const school = {
  name: '清华大学', type: '985', city: '北京', province: '北京',
  scores: { 综合: 4.6, 宿舍: 4.2, 食堂: 4.5, 教学: 4.8, 环境: 4.3, 社交: 3.9 },
  dormitory: { room_size: 4, bed_type: '上床下桌', ac_type: '中央空调', has_private_bath: true, curfew: '23:30', internet: '校园网' },
  tags: ['空调宿舍', '985'],
  intro: '始建于1911年。'
}

describe('buildSchoolPrompt', () => {
  it('包含学校人设与档案数据', () => {
    const p = buildSchoolPrompt(school)
    expect(p).toContain('你是「清华大学」的在校生学长')
    expect(p).toContain('985')
    expect(p).toContain('综合4.6')
    expect(p).toContain('4人间')
    expect(p).toContain('中央空调')
    expect(p).toContain('有独卫')
    expect(p).toContain('空调宿舍、985')
  })

  it('无宿舍数据时不崩溃', () => {
    const p = buildSchoolPrompt({ ...school, dormitory: null })
    expect(p).toContain('清华大学')
  })

  it('school 为 null 返回 null', () => {
    expect(buildSchoolPrompt(null)).toBeNull()
  })
})
