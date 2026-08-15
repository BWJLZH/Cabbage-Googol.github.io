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

describe('getSchoolImage', () => {
  it('无上传图时返回 null（页面回落占位）', () => {
    const store = useAdminDataStore()
    expect(store.getSchoolImage('tsinghua-university')).toBeNull()
  })
  it('上传后返回 base64 图，删除后回落 null', () => {
    const store = useAdminDataStore()
    store.setSchoolImage('tsinghua-university', 'data:image/png;base64,AAA')
    expect(store.getSchoolImage('tsinghua-university')).toBe('data:image/png;base64,AAA')
    store.deleteSchoolImage('tsinghua-university')
    expect(store.getSchoolImage('tsinghua-university')).toBeNull()
  })
})
