// ============================================================
// 数据备份 — 导出/导入个人数据（纯逻辑，可单测）
// 仅包含个人数据键；不含账号密码哈希、登录日志、系统配置、
// 管理员数据（轮播/资讯/图片/覆盖）。
// ============================================================
import { loadLS, saveLS } from './storage.js'

export const BACKUP_KEYS = [
  'cx-user-profile',
  'cx-user-scores',
  'cx-fav',
  'cx-cmp',
  'cx-rev'
]

// 各键在无数据时的默认值（保证恢复后类型正确）
const FALLBACKS = {
  'cx-user-profile': { province: '', subjects: [] },
  'cx-user-scores': [],
  'cx-fav': [],
  'cx-cmp': [],
  'cx-rev': []
}

const APP_TAG = 'campus-explorer'

export function buildBackup() {
  const data = {}
  for (const key of BACKUP_KEYS) {
    data[key] = loadLS(key, FALLBACKS[key])
  }
  return {
    app: APP_TAG,
    version: 1,
    exportedAt: new Date().toISOString(),
    data
  }
}

export function validateBackup(obj) {
  return !!(
    obj &&
    typeof obj === 'object' &&
    obj.app === APP_TAG &&
    obj.data &&
    typeof obj.data === 'object'
  )
}

// 遍历已知键，文件中存在则写入；返回恢复的键数
export function restoreBackup(obj) {
  let restored = 0
  for (const key of BACKUP_KEYS) {
    if (key in obj.data) {
      saveLS(key, obj.data[key])
      restored++
    }
  }
  return restored
}
