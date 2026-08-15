import { describe, it, expect, beforeEach } from 'vitest'
import { buildBackup, validateBackup, restoreBackup, BACKUP_KEYS } from './backup.js'

// Node 环境没有 localStorage，注入简单内存实现
const store = new Map()
beforeEach(() => {
  store.clear()
  globalThis.localStorage = {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k)
  }
})

describe('buildBackup', () => {
  it('包含 5 个个人数据键与元信息', () => {
    localStorage.setItem('cx-fav', JSON.stringify(['tsinghua-university']))
    const b = buildBackup()
    expect(b.app).toBe('campus-explorer')
    expect(b.version).toBe(1)
    expect(typeof b.exportedAt).toBe('string')
    expect(Object.keys(b.data).sort()).toEqual([...BACKUP_KEYS].sort())
    expect(b.data['cx-fav']).toEqual(['tsinghua-university'])
  })

  it('空数据时列表键为 []、档案键为默认对象', () => {
    const b = buildBackup()
    expect(b.data['cx-fav']).toEqual([])
    expect(b.data['cx-user-profile']).toEqual({ province: '', subjects: [] })
  })
})

describe('validateBackup', () => {
  it('合法备份通过', () => {
    expect(validateBackup({ app: 'campus-explorer', version: 1, data: {} })).toBe(true)
  })
  it('非法输入拒绝', () => {
    expect(validateBackup(null)).toBe(false)
    expect(validateBackup({ app: 'other', data: {} })).toBe(false)
    expect(validateBackup({ app: 'campus-explorer' })).toBe(false)
    expect(validateBackup('xxx')).toBe(false)
  })
})

describe('restoreBackup', () => {
  it('只写入文件中存在的已知键', () => {
    const n = restoreBackup({ data: { 'cx-fav': ['a'], 'cx-unknown': 'x' } })
    expect(n).toBe(1)
    expect(localStorage.getItem('cx-fav')).toBe(JSON.stringify(['a']))
    expect(localStorage.getItem('cx-unknown')).toBeNull()
  })
})
