// ============================================================
// 认证状态管理 (Pinia Store) — v2.1 角色体系
//
// 三种角色：student(学生) / parent(家长) / admin(管理员)
// - 学生/家长：可自助注册，仅浏览查询权限
// - 管理员：系统内置初始账号，无自助注册入口，管理员后台可新增
// - 登录过期：默认 7 天，管理员可在后台调整
// - 登录日志：记录每次登录的时间戳和 UA
//
// 所有数据存储于 localStorage，密码使用 SHA-256 哈希
// 后续接入真实后端时，替换 actions 中标注 TODO 处即可
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ============================================================
// 密码哈希工具 — 浏览器原生 SubtleCrypto (SHA-256)
// ============================================================
async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// ============================================================
// 预置密码哈希
// ============================================================
const PRESET_HASH_STUDENT123 = '703b0a3d6ad75b649a28adde7d83c6251da457549263bc7ff45ec709b0a8448b'  // SHA-256("student123")
const PRESET_HASH_PARENTS123 = '94dedb02d58bfd19fd6984cfe70f7b07afeb469bc60fd3e0eabae6b8a9e8887b'  // SHA-256("parents123")
const PRESET_HASH_ADMIN123 = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9' // SHA-256("admin123")

// ============================================================
// 预置测试账号
// ============================================================
const PRESET_USERS = [
  {
    username: 'student',
    email: 'student@campus.cn',
    passwordHash: PRESET_HASH_STUDENT123,
    nickname: '学生用户',
    avatar: '',
    role: 'student',
    createdAt: '2026-01-01'
  },
  {
    username: 'parents',
    email: 'parents@campus.cn',
    passwordHash: PRESET_HASH_PARENTS123,
    nickname: '家长用户',
    avatar: '',
    role: 'parent',
    createdAt: '2026-01-01'
  }
]

// 内置管理员 — 不可通过注册页面创建
const DEFAULT_ADMIN = {
  username: 'admin',
  email: 'admin@campus.cn',
  passwordHash: PRESET_HASH_ADMIN123,
  nickname: '系统管理员',
  avatar: '',
  role: 'admin',
  createdAt: '2026-01-01'
}

// ============================================================
// localStorage 键名
// ============================================================
const USERS_KEY = 'cx-users'
const CURRENT_USER_KEY = 'cx-current-user'
const LOGS_KEY = 'cx-login-log'
const CONFIG_KEY = 'cx-config'

// 默认系统配置
const DEFAULT_CONFIG = {
  sessionDays: 7
}

// ============================================================
// Pinia Store
// ============================================================
export const useAuthStore = defineStore('auth', () => {
  // ==========================================================
  // 状态
  // ==========================================================
  const currentUser = ref(loadCurrentUser())   // null = 未登录

  // ==========================================================
  // 计算属性
  // ==========================================================
  const isLoggedIn = computed(() => currentUser.value !== null)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')
  const userRole = computed(() => currentUser.value?.role || '')

  // ==========================================================
  // 初始化 — 预置测试账号 + 管理员（仅首次运行）
  // ==========================================================
  function initPresetAccounts() {
    const users = loadUsers()
    let changed = false

    // 预置学生/家长测试账号
    for (const preset of PRESET_USERS) {
      if (!users.find(u => u.username === preset.username)) {
        users.push({ ...preset })
        changed = true
      }
    }

    // 预置管理员账号
    if (!users.find(u => u.username === DEFAULT_ADMIN.username)) {
      users.push({ ...DEFAULT_ADMIN })
      changed = true
    }

    if (changed) {
      saveUsers(users)
      console.log('[AuthStore] 预置账号: student/student123(学生), parents/parents123(家长), admin/admin123(管理员)')
    }

    // 初始化配置
    if (!localStorage.getItem(CONFIG_KEY)) {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG))
    }

    // 初始化登录日志
    if (!localStorage.getItem(LOGS_KEY)) {
      localStorage.setItem(LOGS_KEY, JSON.stringify([]))
    }
  }

  // ==========================================================
  // 会话检查 — 是否过期
  // ==========================================================
  function checkSession() {
    if (!currentUser.value) return false
    const now = Date.now()
    if (currentUser.value.expireAt && now > currentUser.value.expireAt) {
      logout()
      return false
    }
    return true
  }

  // ==========================================================
  // 登录
  // ==========================================================
  async function login(username, password) {
    const users = loadUsers()
    const passwordHash = await hashPassword(password)

    const user = users.find(
      u => (u.username === username || u.email === username) &&
            u.passwordHash === passwordHash
    )

    if (!user) {
      throw new Error('用户名或密码错误')
    }

    const config = getConfig()
    const now = Date.now()
    const sessionDays = config.sessionDays || 7

    // 构造不含密码的用户对象，附加会话时间戳
    const { passwordHash: _, ...safeUser } = user
    safeUser.loginAt = now
    safeUser.expireAt = now + sessionDays * 24 * 60 * 60 * 1000

    currentUser.value = safeUser
    saveCurrentUser(safeUser)

    // 写入登录日志
    addLoginLog(user.username, user.role)
  }

  // ==========================================================
  // 注册 — 仅学生/家长，管理员不可自助注册
  // ==========================================================
  async function register(username, email, password, role = 'student') {
    if (role === 'admin') {
      throw new Error('管理员账号无法自助注册，请联系系统管理员')
    }
    if (!['student', 'parent'].includes(role)) {
      throw new Error('无效的角色类型')
    }

    const users = loadUsers()

    if (users.find(u => u.username === username)) {
      throw new Error('用户名已被注册')
    }
    if (users.find(u => u.email === email)) {
      throw new Error('邮箱已被注册')
    }

    const passwordHash = await hashPassword(password)

    const newUser = {
      username: username.trim(),
      email: email.trim(),
      passwordHash,
      nickname: username.trim(),
      avatar: '',
      role,
      createdAt: new Date().toISOString().split('T')[0]
    }

    users.push(newUser)
    saveUsers(users)
  }

  // ==========================================================
  // 退出登录
  // ==========================================================
  function logout() {
    currentUser.value = null
    localStorage.removeItem(CURRENT_USER_KEY)
  }

  // ==========================================================
  // 管理员新增管理员账号
  // ==========================================================
  async function addAdminAccount(username, email, password) {
    if (!isAdmin.value) throw new Error('仅管理员可执行此操作')

    const users = loadUsers()
    if (users.find(u => u.username === username)) {
      throw new Error('用户名已被注册')
    }
    if (users.find(u => u.email === email)) {
      throw new Error('邮箱已被注册')
    }

    const passwordHash = await hashPassword(password)
    const newAdmin = {
      username: username.trim(),
      email: email.trim(),
      passwordHash,
      nickname: username.trim(),
      avatar: '',
      role: 'admin',
      createdAt: new Date().toISOString().split('T')[0]
    }

    users.push(newAdmin)
    saveUsers(users)
  }

  // ==========================================================
  // 系统配置读写
  // ==========================================================
  function getConfig() {
    try {
      const raw = localStorage.getItem(CONFIG_KEY)
      return raw ? JSON.parse(raw) : DEFAULT_CONFIG
    } catch {
      return DEFAULT_CONFIG
    }
  }

  function updateSessionDays(days) {
    if (!isAdmin.value) throw new Error('仅管理员可修改')
    const config = { sessionDays: days }
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
  }

  // ==========================================================
  // 登录日志
  // ==========================================================
  function getLoginLogs() {
    try {
      const raw = localStorage.getItem(LOGS_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  function addLoginLog(username, role) {
    const logs = getLoginLogs()
    logs.push({
      username,
      role,
      loginAt: Date.now(),
      userAgent: navigator.userAgent.slice(0, 200)
    })
    // 保留最近 200 条
    if (logs.length > 200) logs.splice(0, logs.length - 200)
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
  }

  // ==========================================================
  // 修改昵称
  // ==========================================================
  async function updateNickname(newNickname) {
    if (!currentUser.value) throw new Error('未登录')

    const trimmed = newNickname.trim()
    if (!trimmed || trimmed.length < 1 || trimmed.length > 20) {
      throw new Error('昵称长度需在1-20位之间')
    }

    currentUser.value.nickname = trimmed
    saveCurrentUser(currentUser.value)

    const users = loadUsers()
    const idx = users.findIndex(u => u.username === currentUser.value.username)
    if (idx !== -1) {
      users[idx].nickname = trimmed
      saveUsers(users)
    }
  }

  // ==========================================================
  // 修改密码
  // ==========================================================
  async function changePassword(oldPassword, newPassword) {
    if (!currentUser.value) throw new Error('未登录')

    const users = loadUsers()
    const user = users.find(u => u.username === currentUser.value.username)
    if (!user) throw new Error('用户不存在')

    const oldHash = await hashPassword(oldPassword)
    if (oldHash !== user.passwordHash) {
      throw new Error('原密码不正确')
    }

    const newHash = await hashPassword(newPassword)
    user.passwordHash = newHash
    saveUsers(users)
  }

  // ==========================================================
  // 更换头像
  // ==========================================================
  async function updateAvatar(avatarData) {
    if (!currentUser.value) throw new Error('未登录')

    currentUser.value.avatar = avatarData
    saveCurrentUser(currentUser.value)

    const users = loadUsers()
    const idx = users.findIndex(u => u.username === currentUser.value.username)
    if (idx !== -1) {
      users[idx].avatar = avatarData
      saveUsers(users)
    }
  }

  // ==========================================================
  // 内部工具 — 用户数据读写
  // ==========================================================
  function loadUsers() {
    try {
      const raw = localStorage.getItem(USERS_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }

  function loadCurrentUser() {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  function saveCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  }

  // ==========================================================
  // 导出
  // ==========================================================
  return {
    currentUser,
    isLoggedIn,
    isAdmin,
    userRole,
    initPresetAccounts,
    checkSession,
    login,
    register,
    logout,
    addAdminAccount,
    getConfig,
    updateSessionDays,
    getLoginLogs,
    updateNickname,
    changePassword,
    updateAvatar
  }
})
