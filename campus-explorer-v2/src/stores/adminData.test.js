import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAdminDataStore } from './adminData.js'

beforeEach(() => {
  setActivePinia(createPinia())
  const store = new Map()
  globalThis.localStorage = {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k)
  }
})

describe('getMergedSchool 新字段合并', () => {
  it('无覆盖时返回原始值', () => {
    const store = useAdminDataStore()
    const s = store.getMergedSchool('tsinghua-university')
    expect(typeof s.campuses).toBe('string')
    expect(s.campuses.length).toBeGreaterThan(0)
    expect(typeof s.major_difficulty).toBe('number')
    expect(s.major_difficulty).toBeGreaterThan(0)
    expect(s.major_difficulty).toBeLessThanOrEqual(5)
    expect(typeof s.canteen_price).toBe('string')
    expect(s.canteen_price.length).toBeGreaterThan(0)
  })

  it('覆盖时新字段生效', () => {
    const store = useAdminDataStore()
    store.setSchoolOverride('tsinghua-university', {
      campuses: '测试校区',
      major_difficulty: 3.5,
      canteen_price: '5-10元'
    })
    const s = store.getMergedSchool('tsinghua-university')
    expect(s.campuses).toBe('测试校区')
    expect(s.major_difficulty).toBe(3.5)
    expect(s.canteen_price).toBe('5-10元')
  })
})

describe('校园图片相册', () => {
  it('无上传图时主图与相册均为空', () => {
    const store = useAdminDataStore()
    expect(store.getSchoolGallery('tsinghua-university')).toEqual([])
    expect(store.getSchoolImage('tsinghua-university')).toBeNull()
  })
  it('上传多张：第一张为主图', () => {
    const store = useAdminDataStore()
    store.setSchoolImage('tsinghua-university', 'data:image/png;base64,AAA')
    store.setSchoolImage('tsinghua-university', 'data:image/png;base64,BBB')
    expect(store.getSchoolGallery('tsinghua-university')).toHaveLength(2)
    expect(store.getSchoolImage('tsinghua-university')).toBe('data:image/png;base64,AAA')
  })
  it('设为主图：移动后主图切换', () => {
    const store = useAdminDataStore()
    store.setSchoolImage('tsinghua-university', 'AAA')
    store.setSchoolImage('tsinghua-university', 'BBB')
    store.setMainSchoolImage('tsinghua-university', 1)
    expect(store.getSchoolImage('tsinghua-university')).toBe('BBB')
  })
  it('删除指定张，删空后回落 null', () => {
    const store = useAdminDataStore()
    store.setSchoolImage('tsinghua-university', 'AAA')
    store.setSchoolImage('tsinghua-university', 'BBB')
    store.deleteSchoolImage('tsinghua-university', 0)
    expect(store.getSchoolImage('tsinghua-university')).toBe('BBB')
    store.deleteSchoolImage('tsinghua-university', 0)
    expect(store.getSchoolImage('tsinghua-university')).toBeNull()
  })
  it('兼容旧格式：单张字符串归一为数组', () => {
    globalThis.localStorage.setItem('cx-school-images', JSON.stringify({ 'peking-university': 'data:old' }))
    const store = useAdminDataStore()
    expect(store.getSchoolGallery('peking-university')).toEqual(['data:old'])
  })
})
