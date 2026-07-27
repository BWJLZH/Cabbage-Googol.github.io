<template>
  <div class="auth-page">
    <!-- ========== 系统名称 — 醒目展示 ========== -->
    <div class="auth-brand">
      <h1 class="brand-title">找到最适合</h1>
      <h2 class="brand-accent">你的大学</h2>
      <p class="brand-desc">像翻阅一本校园年鉴，浏览真实宿舍、食堂口碑、学长评价</p>
    </div>

    <!-- ========== 登录卡片 ========== -->
    <div class="auth-card">
      <!-- 身份切换 Tab -->
      <div class="identity-tabs">
        <button
          v-for="tab in identityTabs"
          :key="tab.key"
          class="identity-tab"
          :class="{ active: identity === tab.key }"
          :style="identity === tab.key ? { color: tab.color, borderColor: tab.color } : {}"
          @click="switchIdentity(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 登录/注册切换 — 仅学生/家长显示注册入口，其他身份仅提供登录 -->
      <div class="auth-tabs" v-if="identity !== 'admin'">
        <button
          class="auth-tab"
          :class="{ active: mode === 'login' }"
          @click="switchMode('login')"
        >登录</button>
        <button
          class="auth-tab"
          :class="{ active: mode === 'register' }"
          @click="switchMode('register')"
        >注册</button>
      </div>
      <div class="auth-tabs" v-else>
        <span class="admin-login-label">登录</span>
      </div>

      <!-- ============================================================
           登录表单
           ============================================================ -->
      <form v-if="mode === 'login'" @submit.prevent="handleLogin" novalidate>
        <div class="field">
          <label class="field-label">用户名 / 邮箱</label>
          <input
            v-model="loginForm.username"
            class="field-input"
            :class="{ 'field-input--error': loginErrors.username }"
            placeholder="请输入用户名或邮箱"
            @input="clearError('login', 'username')"
          />
          <p class="field-error" v-if="loginErrors.username">{{ loginErrors.username }}</p>
        </div>

        <div class="field">
          <label class="field-label">密码</label>
          <input
            v-model="loginForm.password"
            class="field-input"
            :class="{ 'field-input--error': loginErrors.password }"
            type="password"
            placeholder="请输入密码"
            @input="clearError('login', 'password')"
          />
          <p class="field-error" v-if="loginErrors.password">{{ loginErrors.password }}</p>
        </div>

        <!-- 当前身份提示 -->
        <p class="identity-hint" v-if="identity !== 'admin'">
          以<span class="hint-role">{{ identityLabel }}</span>身份登录
        </p>
        <p class="identity-hint identity-hint--admin" v-else>
          请登录您的账号
        </p>

        <button class="auth-btn" type="submit" :disabled="loginLoading">
          <span class="spinner" v-if="loginLoading"></span>
          {{ loginLoading ? '登录中...' : '登 录' }}
        </button>
      </form>

      <!-- ============================================================
           注册表单 — 仅学生/家长
           ============================================================ -->
      <form v-if="mode === 'register' && identity !== 'admin'" @submit.prevent="handleRegister" novalidate>
        <div class="field">
          <label class="field-label">用户名</label>
          <input
            v-model="registerForm.username"
            class="field-input"
            :class="{ 'field-input--error': registerErrors.username }"
            placeholder="2-20位字母、数字或下划线"
            @input="clearError('register', 'username')"
          />
          <p class="field-error" v-if="registerErrors.username">{{ registerErrors.username }}</p>
        </div>

        <div class="field">
          <label class="field-label">邮箱</label>
          <input
            v-model="registerForm.email"
            class="field-input"
            :class="{ 'field-input--error': registerErrors.email }"
            type="email"
            placeholder="请输入邮箱地址"
            @input="clearError('register', 'email')"
          />
          <p class="field-error" v-if="registerErrors.email">{{ registerErrors.email }}</p>
        </div>

        <div class="field">
          <label class="field-label">密码</label>
          <input
            v-model="registerForm.password"
            class="field-input"
            :class="{ 'field-input--error': registerErrors.password }"
            type="password"
            placeholder="至少6位密码"
            @input="clearError('register', 'password')"
          />
          <p class="field-error" v-if="registerErrors.password">{{ registerErrors.password }}</p>
        </div>

        <div class="field">
          <label class="field-label">确认密码</label>
          <input
            v-model="registerForm.confirmPassword"
            class="field-input"
            :class="{ 'field-input--error': registerErrors.confirmPassword }"
            type="password"
            placeholder="请再次输入密码"
            @input="clearError('register', 'confirmPassword')"
          />
          <p class="field-error" v-if="registerErrors.confirmPassword">{{ registerErrors.confirmPassword }}</p>
        </div>

        <p class="identity-hint">
          注册为<span class="hint-role">{{ identityLabel }}</span>身份
        </p>

        <button class="auth-btn" type="submit" :disabled="registerLoading">
          <span class="spinner" v-if="registerLoading"></span>
          {{ registerLoading ? '注册中...' : '注 册' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const authStore = useAuthStore()
const router = useRouter()

// ============================================================
// 身份切换
// ============================================================
const identityTabs = [
  { key: 'student', label: '学生', color: '#4A90D9' },
  { key: 'parent', label: '家长', color: '#5B9A6B' },
  { key: 'admin', label: '其他', color: '#B87351' }
]
const identity = ref('student')

const identityLabel = computed(() => {
  const tab = identityTabs.find(t => t.key === identity.value)
  return tab ? tab.label : ''
})

function switchIdentity(key) {
  identity.value = key
  if (key === 'admin') {
    // 管理员只有登录，强制切到登录模式
    mode.value = 'login'
  }
  clearAllErrors()
}

// ============================================================
// 登录/注册模式
// ============================================================
const mode = ref('login')

function switchMode(m) {
  mode.value = m
  clearAllErrors()
}

function clearAllErrors() {
  Object.keys(loginErrors).forEach(k => loginErrors[k] = '')
  Object.keys(registerErrors).forEach(k => registerErrors[k] = '')
}

// ============================================================
// 登录表单
// ============================================================
const loginForm = reactive({ username: '', password: '' })
const loginErrors = reactive({ username: '', password: '' })
const loginLoading = ref(false)

// ============================================================
// 注册表单
// ============================================================
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})
const registerErrors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})
const registerLoading = ref(false)

// ============================================================
// 清除单个字段错误
// ============================================================
function clearError(formType, field) {
  if (formType === 'login') {
    loginErrors[field] = ''
  } else {
    registerErrors[field] = ''
  }
}

// ============================================================
// 登录校验 & 提交
// ============================================================
function validateLogin() {
  let valid = true
  if (!loginForm.username.trim()) {
    loginErrors.username = '用户名不能为空'
    valid = false
  }
  if (!loginForm.password) {
    loginErrors.password = '密码不能为空'
    valid = false
  }
  return valid
}

async function handleLogin() {
  Object.keys(loginErrors).forEach(k => loginErrors[k] = '')

  if (!validateLogin()) return

  loginLoading.value = true
  try {
    await authStore.login(loginForm.username, loginForm.password)

    // 管理员登录后检查角色是否为 admin
    // 非管理员试图以管理员身份登录时，用户名/密码错误会直接抛异常
    loginForm.username = ''
    loginForm.password = ''

    // 登录成功 → 跳转首页
    router.replace('/')
  } catch (err) {
    loginErrors.username = err.message || '登录失败，请重试'
  } finally {
    loginLoading.value = false
  }
}

// ============================================================
// 注册校验 & 提交 — 角色由当前身份 Tab 决定
// ============================================================
function validateRegister() {
  let valid = true

  if (!registerForm.username.trim()) {
    registerErrors.username = '用户名不能为空'
    valid = false
  } else if (registerForm.username.trim().length < 2 || registerForm.username.trim().length > 20) {
    registerErrors.username = '用户名长度需在2-20位之间'
    valid = false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!registerForm.email.trim()) {
    registerErrors.email = '邮箱不能为空'
    valid = false
  } else if (!emailRegex.test(registerForm.email.trim())) {
    registerErrors.email = '邮箱格式不正确'
    valid = false
  }

  if (!registerForm.password) {
    registerErrors.password = '密码不能为空'
    valid = false
  } else if (registerForm.password.length < 6) {
    registerErrors.password = '密码至少需要6位'
    valid = false
  }

  if (!registerForm.confirmPassword) {
    registerErrors.confirmPassword = '请确认密码'
    valid = false
  } else if (registerForm.confirmPassword !== registerForm.password) {
    registerErrors.confirmPassword = '两次输入的密码不一致'
    valid = false
  }

  return valid
}

async function handleRegister() {
  Object.keys(registerErrors).forEach(k => registerErrors[k] = '')

  if (!validateRegister()) return

  registerLoading.value = true
  try {
    await authStore.register(
      registerForm.username.trim(),
      registerForm.email.trim(),
      registerForm.password,
      identity.value   // 角色来自身份 Tab
    )

    // 注册成功 → 自动登录
    await authStore.login(registerForm.username.trim(), registerForm.password)

    // 清空表单
    registerForm.username = ''
    registerForm.email = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''

    router.replace('/')
  } catch (err) {
    registerErrors.username = err.message || '注册失败，请重试'
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped>
/* ============================================================
   整体布局
   ============================================================ */
.auth-page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  background: var(--bg);
}

/* ============================================================
   系统名称 — 醒目配色
   ============================================================ */
.auth-brand {
  text-align: center;
  margin-bottom: 36px;
}

.brand-title {
  font-family: var(--font-heading);
  font-size: 44px;
  font-weight: 900;
  line-height: 1.15;
  color: var(--text);
  margin-bottom: 2px;
}

.brand-accent {
  font-family: var(--font-heading);
  font-size: 44px;
  font-weight: 900;
  line-height: 1.15;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #B87351 0%, #D4946A 40%, #8BA38C 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-desc {
  font-size: 15px;
  color: var(--text2);
  line-height: 1.7;
  letter-spacing: .02em;
}

/* ============================================================
   卡片
   ============================================================ */
.auth-card {
  width: 100%;
  max-width: 400px;
  background: var(--surface);
  border: 1px solid var(--bdr);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  padding: 28px 24px 32px;
}

/* ============================================================
   身份切换 Tab — 三色系统
   ============================================================ */
.identity-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 24px;
  background: var(--surface2);
  border-radius: 10px;
  padding: 4px;
}

.identity-tab {
  padding: 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text2);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all .2s;
  border-bottom: 2px solid transparent;
}

.identity-tab.active {
  background: var(--surface);
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
}

.identity-tab:hover:not(.active) {
  color: var(--text);
}

/* ============================================================
   登录/注册切换
   ============================================================ */
.auth-tabs {
  display: flex;
  margin-bottom: 24px;
  border-bottom: 2px solid var(--bdr);
}

.auth-tab {
  flex: 1;
  padding: 10px 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--text3);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  transition: all .2s;
}

.auth-tab.active {
  color: var(--accent2);
  border-bottom-color: var(--accent2);
}

.auth-tab:hover:not(.active) {
  color: var(--text2);
}

.admin-login-label {
  display: block;
  width: 100%;
  text-align: center;
  padding: 10px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--text2);
  border-bottom: 2px solid var(--bdr);
  margin-bottom: 24px;
}

/* ============================================================
   表单字段
   ============================================================ */
.field {
  margin-bottom: 18px;
}

.field-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 6px;
}

.field-input {
  width: 100%;
  padding: 12px 14px;
  font-size: 15px;
  color: var(--text);
  background: var(--surface2);
  border: 1px solid var(--bdr);
  border-radius: var(--radius);
  outline: none;
  transition: border-color .2s, box-shadow .2s;
  box-sizing: border-box;
}

.field-input::placeholder {
  color: var(--text3);
}

.field-input:focus {
  border-color: var(--accent2);
  box-shadow: 0 0 0 3px rgba(184, 115, 81, .1);
  background: var(--surface);
}

.field-input--error {
  border-color: var(--warn);
}

.field-input--error:focus {
  box-shadow: 0 0 0 3px rgba(196, 112, 98, .1);
}

.field-error {
  color: var(--warn);
  font-size: 13px;
  margin-top: 6px;
  line-height: 1.4;
}

/* ============================================================
   身份提示
   ============================================================ */
.identity-hint {
  text-align: center;
  font-size: 13px;
  color: var(--text3);
  margin-bottom: 12px;
}

.hint-role {
  font-weight: 600;
  color: var(--accent2);
}

.identity-hint--admin {
  color: var(--text2);
}

/* ============================================================
   提交按钮
   ============================================================ */
.auth-btn {
  width: 100%;
  padding: 14px 0;
  margin-top: 4px;
  font-size: 16px;
  font-weight: 600;
  color: var(--bg);
  background: var(--text);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all .2s;
}

.auth-btn:hover:not(:disabled) {
  background: #3a3a3f;
}

.auth-btn:disabled {
  opacity: .4;
  cursor: not-allowed;
}

/* ============================================================
   Loading 旋转器
   ============================================================ */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(252, 252, 250, .3);
  border-top-color: var(--bg);
  border-radius: 50%;
  animation: spin .6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

</style>
