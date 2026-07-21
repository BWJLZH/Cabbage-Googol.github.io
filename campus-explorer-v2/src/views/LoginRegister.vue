<template>
  <div class="auth-page">
    <!-- 背景图占位 — 替换 --bg-image 变量即可 -->
    <div class="auth-card">
      <!-- 切换 Tab -->
      <div class="auth-tabs">
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

      <!-- ========== 登录表单 ========== -->
      <form v-if="mode === 'login'" @submit.prevent="handleLogin" novalidate>
        <!-- 用户名 -->
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

        <!-- 密码 -->
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

        <button class="auth-btn" type="submit" :disabled="loginLoading">
          <span class="spinner" v-if="loginLoading"></span>
          {{ loginLoading ? '登录中...' : '登 录' }}
        </button>
      </form>

      <!-- ========== 注册表单 ========== -->
      <form v-if="mode === 'register'" @submit.prevent="handleRegister" novalidate>
        <!-- 用户名 -->
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

        <!-- 邮箱 -->
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

        <!-- 密码 -->
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

        <!-- 确认密码 -->
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

        <button class="auth-btn" type="submit" :disabled="registerLoading">
          <span class="spinner" v-if="registerLoading"></span>
          {{ registerLoading ? '注册中...' : '注 册' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useAuthStore } from '../stores/auth.js'

// ============================================================
// 注入 auth store — 登录/注册成功后通过 store 通知父组件
// ============================================================
const authStore = useAuthStore()

// ============================================================
// 当前模式：'login' | 'register'
// ============================================================
const mode = ref('login')

// ============================================================
// 登录表单数据
// ============================================================
const loginForm = reactive({
  username: '',
  password: ''
})
const loginErrors = reactive({
  username: '',
  password: ''
})
const loginLoading = ref(false)

// ============================================================
// 注册表单数据
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
// 切换模式 — 清空所有表单和错误
// ============================================================
function switchMode(m) {
  mode.value = m
  // 清空登录
  loginForm.username = ''
  loginForm.password = ''
  Object.keys(loginErrors).forEach(k => loginErrors[k] = '')
  loginLoading.value = false
  // 清空注册
  registerForm.username = ''
  registerForm.email = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
  Object.keys(registerErrors).forEach(k => registerErrors[k] = '')
  registerLoading.value = false
}

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
  // 清除旧错误
  Object.keys(loginErrors).forEach(k => loginErrors[k] = '')

  if (!validateLogin()) return

  loginLoading.value = true
  try {
    // ============================================================
    // TODO: 接入真实后端时，替换为 fetch API 调用：
    // const res = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     username: loginForm.username,
    //     password: loginForm.password
    //   })
    // })
    // const data = await res.json()
    // if (!res.ok) throw new Error(data.message || '登录失败')
    // localStorage.setItem('token', data.token)
    // ============================================================

    // 当前：调用 auth store 的 login 方法（localStorage 模拟后端）
    await authStore.login(loginForm.username, loginForm.password)
    // 登录成功后，authStore.currentUser 会被设置，
    // 父组件（ProfilePage）通过 isLoggedIn 响应式自动切换视图
  } catch (err) {
    loginErrors.username = err.message || '登录失败，请重试'
  } finally {
    loginLoading.value = false
  }
}

// ============================================================
// 注册校验 & 提交
// ============================================================
function validateRegister() {
  let valid = true

  // 用户名：不能为空 + 3-20位
  if (!registerForm.username.trim()) {
    registerErrors.username = '用户名不能为空'
    valid = false
  } else if (registerForm.username.trim().length < 2 || registerForm.username.trim().length > 20) {
    registerErrors.username = '用户名长度需在2-20位之间'
    valid = false
  }

  // 邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!registerForm.email.trim()) {
    registerErrors.email = '邮箱不能为空'
    valid = false
  } else if (!emailRegex.test(registerForm.email.trim())) {
    registerErrors.email = '邮箱格式不正确'
    valid = false
  }

  // 密码：不能为空 + 至少6位
  if (!registerForm.password) {
    registerErrors.password = '密码不能为空'
    valid = false
  } else if (registerForm.password.length < 6) {
    registerErrors.password = '密码至少需要6位'
    valid = false
  }

  // 确认密码一致
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
  // 清除旧错误
  Object.keys(registerErrors).forEach(k => registerErrors[k] = '')

  if (!validateRegister()) return

  registerLoading.value = true
  try {
    // ============================================================
    // TODO: 接入真实后端时，替换为 fetch API 调用：
    // const res = await fetch('/api/auth/register', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     username: registerForm.username.trim(),
    //     email: registerForm.email.trim(),
    //     password: registerForm.password
    //   })
    // })
    // const data = await res.json()
    // if (!res.ok) throw new Error(data.message || '注册失败')
    // ============================================================

    // 当前：调用 auth store 的 register 方法（localStorage 模拟后端）
    await authStore.register(
      registerForm.username.trim(),
      registerForm.email.trim(),
      registerForm.password
    )
    // 注册成功后自动切到登录模式，让用户用新账号登录
    mode.value = 'login'
    // 清空注册表单
    registerForm.username = ''
    registerForm.email = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
  } catch (err) {
    registerErrors.username = err.message || '注册失败，请重试'
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped>
/* ============================================================
   背景图变量 — 替换为你自己的图片
   ============================================================ */
.auth-page {
  /*
   * TODO: 替换背景图
   * background-image: url('@/assets/auth-bg.jpg');
   * 或者用渐变 + 图片叠加:
   * background: linear-gradient(135deg, rgba(0,0,0,.15), rgba(0,0,0,.05)), url('@/assets/auth-bg.jpg');
   */
  --bg-image: none; /* ← 替换为 url(...) */
  background-image: var(--bg-image);
  background-color: var(--bg); /* 统一用产品背景色 #FCFCFA */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

/* ============================================================
   卡片 — 沿用产品 card 风格：白色底 + 细边框 + 轻阴影
   ============================================================ */
.auth-card {
  width: 100%;
  max-width: 400px;
  background: var(--surface);
  border: 1px solid var(--bdr);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  padding: 36px 28px 32px;
}

/* ============================================================
   切换 Tab — 暖色系
   ============================================================ */
.auth-tabs {
  display: flex;
  margin-bottom: 32px;
  border-bottom: 2px solid var(--bdr);
}

.auth-tab {
  flex: 1;
  padding: 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--text3);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  transition: all .2s;
}

/* 激活态：暖色 accent2 */
.auth-tab.active {
  color: var(--accent2);
  border-bottom-color: var(--accent2);
}

.auth-tab:hover:not(.active) {
  color: var(--text2);
}

/* ============================================================
   表单字段 — 产品统一风格
   ============================================================ */
.field {
  margin-bottom: 20px;
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

/* 聚焦态：暖色光晕 */
.field-input:focus {
  border-color: var(--accent2);
  box-shadow: 0 0 0 3px rgba(184, 115, 81, .1);
  background: var(--surface);
}

/* 错误态：产品内建的 warn 色 */
.field-input--error {
  border-color: var(--warn);
}

.field-input--error:focus {
  box-shadow: 0 0 0 3px rgba(196, 112, 98, .1);
}

/* ============================================================
   错误提示 — 红字，与产品 warn 色一致
   ============================================================ */
.field-error {
  color: var(--warn);
  font-size: 13px;
  margin-top: 6px;
  line-height: 1.4;
  min-height: 0; /* 不占位，由 v-if 控制 */
}

/* ============================================================
   提交按钮 — 深底白字，与首页 CTA 按钮、底部操作栏风格一致
   ============================================================ */
.auth-btn {
  width: 100%;
  padding: 14px 0;
  margin-top: 8px;
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
  transition: background .2s, opacity .2s;
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
  to {
    transform: rotate(360deg);
  }
}
</style>
