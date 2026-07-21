// ============================================================
// 认证状态管理 (Pinia Store)
// 模拟后端：用户数据存储在 localStorage，密码使用 SHA-256 哈希
// 后续接入真实后端时，只需替换 actions 中的 TODO 标注处
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ============================================================
// 密码哈希工具 — 使用浏览器原生 SubtleCrypto (SHA-256)
// 真实项目应在后端做加盐哈希 (bcrypt / argon2)
// ============================================================
async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// ============================================================
// 预置测试账号 — SHA-256("123456") 的哈希值
// ============================================================
const PRESET_HASH_123456 = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'

const PRESET_USERS = [
  {
    username: '张三',
    email: 'zhangsan@test.com',
    passwordHash: PRESET_HASH_123456,
    nickname: '张三',
    avatar: '',
    createdAt: '2026-01-01'
  },
  {
    username: '李四',
    email: 'lisi@test.com',
    passwordHash: PRESET_HASH_123456,
    nickname: '李四',
    avatar: '',
    createdAt: '2026-01-01'
  }
]

// ============================================================
// localStorage 键名
// ============================================================
const USERS_KEY = 'cx-users'
const CURRENT_USER_KEY = 'cx-current-user'

export const useAuthStore = defineStore('auth', () => {
  // ==========================================================
  // 状态
  // ==========================================================
  const currentUser = ref(loadCurrentUser()) // 当前登录用户，null 表示未登录

  // ==========================================================
  // 计算属性
  // ==========================================================
  const isLoggedIn = computed(() => currentUser.value !== null)

  // ==========================================================
  // 初始化 — 预置测试账号（仅首次运行）
  // ==========================================================
  function initTestAccounts() {
    const users = loadUsers()
    let changed = false

    for (const preset of PRESET_USERS) {
      const exists = users.find(u => u.username === preset.username)
      if (!exists) {
        users.push({ ...preset })
        changed = true
      }
    }

    if (changed) {
      saveUsers(users)
      console.log('[AuthStore] 已预置测试账号：张三 / 123456, 李四 / 123456')
    }
  }

  // ==========================================================
  // 登录
  // ==========================================================
  async function login(username, password) {
    // TODO: 替换为真实登录 API
    // const res = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ username, password })
    // })
    // const data = await res.json()
    // if (!res.ok) throw new Error(data.message || '登录失败')

    const users = loadUsers()
    const passwordHash = await hashPassword(password)

    const user = users.find(
      u => (u.username === username || u.email === username) && u.passwordHash === passwordHash
    )

    if (!user) {
      throw new Error('用户名或密码错误')
    }

    // 构造不含密码的当前用户对象
    const { passwordHash: _, ...safeUser } = user
    currentUser.value = safeUser
    saveCurrentUser(safeUser)
  }

  // ==========================================================
  // 注册
  // ==========================================================
  async function register(username, email, password) {
    // TODO: 替换为真实注册 API
    // const res = await fetch('/api/auth/register', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ username, email, password })
    // })
    // const data = await res.json()
    // if (!res.ok) throw new Error(data.message || '注册失败')

    const users = loadUsers()

    // 检查用户名是否已存在
    if (users.find(u => u.username === username)) {
      throw new Error('用户名已被注册')
    }

    // 检查邮箱是否已存在
    if (users.find(u => u.email === email)) {
      throw new Error('邮箱已被注册')
    }

    // 对新密码做哈希处理，确保和登录逻辑一致
    const passwordHash = await hashPassword(password)

    const newUser = {
      username,
      email,
      passwordHash,
      nickname: username, // 默认昵称 = 用户名
      avatar: '',
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
  // 修改昵称
  // ==========================================================
  async function updateNickname(newNickname) {
    if (!currentUser.value) throw new Error('未登录')

    // TODO: 替换为真实 API
    // const res = await fetch('/api/user/nickname', {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   },
    //   body: JSON.stringify({ nickname: newNickname })
    // })
    // if (!res.ok) throw new Error('修改失败')

    const trimmed = newNickname.trim()
    if (!trimmed || trimmed.length < 1 || trimmed.length > 20) {
      throw new Error('昵称长度需在1-20位之间')
    }

    // 更新 currentUser
    currentUser.value.nickname = trimmed
    saveCurrentUser(currentUser.value)

    // 同步更新 users 表中的 nickname
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

    // TODO: 替换为真实 API
    // const res = await fetch('/api/user/password', {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   },
    //   body: JSON.stringify({ oldPassword, newPassword })
    // })
    // if (!res.ok) throw new Error('修改失败')

    const users = loadUsers()
    const user = users.find(u => u.username === currentUser.value.username)
    if (!user) throw new Error('用户不存在')

    // 验证旧密码（用同样的哈希算法比对）
    const oldHash = await hashPassword(oldPassword)
    if (oldHash !== user.passwordHash) {
      throw new Error('原密码不正确')
    }

    // 新密码哈希
    const newHash = await hashPassword(newPassword)
    user.passwordHash = newHash
    saveUsers(users)
  }

  // ==========================================================
  // 更换头像
  // ==========================================================
  async function updateAvatar(avatarData) {
    if (!currentUser.value) throw new Error('未登录')

    // TODO: 替换为真实上传头像 API
    // const formData = new FormData()
    // formData.append('avatar', avatarFile)
    // const res = await fetch('/api/user/avatar', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    //   body: formData
    // })
    // const data = await res.json()
    // if (!res.ok) throw new Error('上传失败')
    // avatarData = data.url

    // 模拟：将图片转为 base64 存储
    currentUser.value.avatar = avatarData
    saveCurrentUser(currentUser.value)

    // 同步更新 users 表中的 avatar
    const users = loadUsers()
    const idx = users.findIndex(u => u.username === currentUser.value.username)
    if (idx !== -1) {
      users[idx].avatar = avatarData
      saveUsers(users)
    }
  }

  // ==========================================================
  // 内部工具 — 用户数据读写（模拟数据库）
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

  return {
    // 状态
    currentUser,
    // 计算属性
    isLoggedIn,
    // 方法
    initTestAccounts,
    login,
    register,
    logout,
    updateNickname,
    changePassword,
    updateAvatar
  }
})
