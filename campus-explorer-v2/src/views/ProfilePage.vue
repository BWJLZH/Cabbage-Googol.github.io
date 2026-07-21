<template>
  <div class="page">
    <!-- ========================================================
         未登录状态 → 嵌入登录/注册组件
         ======================================================== -->
    <div v-if="!authStore.isLoggedIn">
      <LoginRegister />
    </div>

    <!-- ========================================================
         已登录状态 → 个人中心
         ======================================================== -->
    <div v-else class="profile-center">
      <!-- 头像 + 昵称 -->
      <div class="profile-header">
        <!--
          头像区域：点击触发更换头像
          TODO: 接入真实后端时，改为 <input type="file" accept="image/*"> 上传到 OSS/CDN
        -->
        <div class="avatar-wrapper" @click="triggerAvatarChange" title="点击更换头像">
          <img
            v-if="authStore.currentUser.avatar"
            :src="authStore.currentUser.avatar"
            class="avatar-img"
            alt="头像"
          />
          <span v-else class="avatar-placeholder">
            {{ (authStore.currentUser.nickname || authStore.currentUser.username)[0] }}
          </span>
          <span class="avatar-badge">📷</span>
        </div>

        <!--
          隐藏的文件选择器 — 模拟头像上传
          TODO: 接入真实后端时，去掉 base64 模拟，直接上传文件
        -->
        <input
          ref="avatarInput"
          type="file"
          accept="image/*"
          style="display:none"
          @change="onAvatarSelected"
        />

        <h2 class="profile-nickname">{{ authStore.currentUser.nickname || authStore.currentUser.username }}</h2>
        <p class="profile-username">@{{ authStore.currentUser.username }}</p>
      </div>

      <!-- 功能列表 — 仅保留三个实用功能 -->
      <div class="profile-menu">
        <!-- 修改昵称 -->
        <button class="menu-item" @click="showNicknameModal = true">
          <span class="menu-icon">✎</span>
          <span class="menu-label">修改昵称</span>
          <span class="menu-arrow">→</span>
        </button>

        <!-- 修改密码 -->
        <button class="menu-item" @click="showPasswordModal = true">
          <span class="menu-icon">🔒</span>
          <span class="menu-label">修改密码</span>
          <span class="menu-arrow">→</span>
        </button>

        <!-- 退出登录 -->
        <button class="menu-item menu-item--danger" @click="handleLogout">
          <span class="menu-icon">⏻</span>
          <span class="menu-label">退出登录</span>
          <span class="menu-arrow">→</span>
        </button>
      </div>
    </div>

    <!-- ========================================================
         修改昵称弹窗
         ======================================================== -->
    <div class="modal-mask" v-if="showNicknameModal" @click.self="showNicknameModal = false">
      <div class="modal">
        <h3>修改昵称</h3>
        <input
          v-model="nicknameForm.value"
          class="field-input"
          placeholder="请输入新昵称（1-20位）"
          maxlength="20"
          @input="nicknameForm.error = ''"
        />
        <p class="field-error" v-if="nicknameForm.error">{{ nicknameForm.error }}</p>
        <div class="modal-acts">
          <button @click="showNicknameModal = false">取消</button>
          <button class="sbm" :disabled="nicknameForm.loading" @click="handleUpdateNickname">
            <span class="spinner" v-if="nicknameForm.loading"></span>
            {{ nicknameForm.loading ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================================
         修改密码弹窗
         ======================================================== -->
    <div class="modal-mask" v-if="showPasswordModal" @click.self="showPasswordModal = false">
      <div class="modal">
        <h3>修改密码</h3>
        <div class="field">
          <label class="field-label">原密码</label>
          <input
            v-model="passwordForm.oldPassword"
            class="field-input"
            type="password"
            placeholder="请输入原密码"
            @input="passwordForm.errors.oldPassword = ''"
          />
          <p class="field-error" v-if="passwordForm.errors.oldPassword">{{ passwordForm.errors.oldPassword }}</p>
        </div>
        <div class="field">
          <label class="field-label">新密码</label>
          <input
            v-model="passwordForm.newPassword"
            class="field-input"
            type="password"
            placeholder="至少6位"
            @input="passwordForm.errors.newPassword = ''"
          />
          <p class="field-error" v-if="passwordForm.errors.newPassword">{{ passwordForm.errors.newPassword }}</p>
        </div>
        <div class="field">
          <label class="field-label">确认新密码</label>
          <input
            v-model="passwordForm.confirmPassword"
            class="field-input"
            type="password"
            placeholder="请再次输入新密码"
            @input="passwordForm.errors.confirmPassword = ''"
          />
          <p class="field-error" v-if="passwordForm.errors.confirmPassword">{{ passwordForm.errors.confirmPassword }}</p>
        </div>
        <div class="modal-acts">
          <button @click="showPasswordModal = false">取消</button>
          <button class="sbm" :disabled="passwordForm.loading" @click="handleChangePassword">
            <span class="spinner" v-if="passwordForm.loading"></span>
            {{ passwordForm.loading ? '保存中...' : '确认修改' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import LoginRegister from './LoginRegister.vue'

// ============================================================
// 注入依赖
// ============================================================
const authStore = useAuthStore()
const router = useRouter()

// ============================================================
// 修改昵称 — 表单状态
// ============================================================
const showNicknameModal = ref(false)
const nicknameForm = reactive({
  value: '',
  error: '',
  loading: false
})

// ============================================================
// 修改密码 — 表单状态
// ============================================================
const showPasswordModal = ref(false)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
  errors: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  },
  loading: false
})

// ============================================================
// 头像更换
// ============================================================
const avatarInput = ref(null)

function triggerAvatarChange() {
  // 触发隐藏的 <input type="file">
  avatarInput.value?.click()
}

function onAvatarSelected(event) {
  const file = event.target.files?.[0]
  if (!file) return

  // TODO: 接入真实后端时，上传文件到 OSS/CDN，使用返回的 URL
  // const formData = new FormData()
  // formData.append('avatar', file)
  // const res = await fetch('/api/user/avatar', { method: 'POST', body: formData })
  // const data = await res.json()

  // 当前模拟：将图片转为 base64 存储在 localStorage
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      await authStore.updateAvatar(e.target.result)
    } catch (err) {
      alert(err.message || '上传失败')
    }
  }
  reader.readAsDataURL(file)

  // 清空 input，确保重复选择同一文件时也能触发 change
  event.target.value = ''
}

// ============================================================
// 修改昵称 — 校验 & 提交
// ============================================================
async function handleUpdateNickname() {
  nicknameForm.error = ''

  const val = nicknameForm.value.trim()
  if (!val) {
    nicknameForm.error = '昵称不能为空'
    return
  }
  if (val.length < 1 || val.length > 20) {
    nicknameForm.error = '昵称长度需在1-20位之间'
    return
  }

  nicknameForm.loading = true
  try {
    await authStore.updateNickname(val)
    showNicknameModal.value = false
    nicknameForm.value = ''
  } catch (err) {
    nicknameForm.error = err.message || '修改失败'
  } finally {
    nicknameForm.loading = false
  }
}

// ============================================================
// 修改密码 — 校验 & 提交
// ============================================================
function validatePasswordForm() {
  let valid = true

  if (!passwordForm.oldPassword) {
    passwordForm.errors.oldPassword = '请输入原密码'
    valid = false
  }

  if (!passwordForm.newPassword) {
    passwordForm.errors.newPassword = '请输入新密码'
    valid = false
  } else if (passwordForm.newPassword.length < 6) {
    passwordForm.errors.newPassword = '新密码至少需要6位'
    valid = false
  }

  if (!passwordForm.confirmPassword) {
    passwordForm.errors.confirmPassword = '请确认新密码'
    valid = false
  } else if (passwordForm.confirmPassword !== passwordForm.newPassword) {
    passwordForm.errors.confirmPassword = '两次输入的密码不一致'
    valid = false
  }

  return valid
}

async function handleChangePassword() {
  // 清除旧错误
  Object.keys(passwordForm.errors).forEach(k => passwordForm.errors[k] = '')

  if (!validatePasswordForm()) return

  passwordForm.loading = true
  try {
    await authStore.changePassword(
      passwordForm.oldPassword,
      passwordForm.newPassword
    )
    showPasswordModal.value = false
    // 清空表单
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (err) {
    // 根据错误消息判断哪个字段出问题
    if (err.message.includes('原密码')) {
      passwordForm.errors.oldPassword = err.message
    } else {
      passwordForm.errors.newPassword = err.message || '修改失败'
    }
  } finally {
    passwordForm.loading = false
  }
}

// ============================================================
// 退出登录
// ============================================================
function handleLogout() {
  authStore.logout()
  // 退出后自动回到首页
  router.push('/')
}
</script>

<style scoped>
/* ============================================================
   个人中心
   ============================================================ */

/* ---- 头像区域 ---- */
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 20px 32px;
  border-bottom: 1px solid var(--bdr);
}

.avatar-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  cursor: pointer;
  margin-bottom: 16px;
  transition: transform .15s;
}

.avatar-wrapper:active {
  transform: scale(.95);
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--surface2);
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: var(--bg);
  background: var(--accent2);
  border: 3px solid var(--surface2);
}

.avatar-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  border-radius: 50%;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .1);
}

.profile-nickname {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
}

.profile-username {
  font-size: 14px;
  color: var(--text3);
  margin-top: 4px;
}

/* ---- 功能菜单 ---- */
.profile-menu {
  padding: 0 20px;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 0;
  font-size: 15px;
  color: var(--text);
  background: none;
  border: none;
  border-bottom: 1px solid var(--bdr);
  cursor: pointer;
  transition: background .15s;
  border-radius: 0;
}

.menu-item:active {
  background: var(--surface2);
}

.menu-item--danger {
  color: var(--warn);
  border-bottom: none;
}

.menu-icon {
  font-size: 18px;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}

.menu-label {
  flex: 1;
  text-align: left;
  font-weight: 500;
}

.menu-arrow {
  font-size: 14px;
  color: var(--text3);
}

/* ---- 弹窗内输入框 ---- */
.modal .field {
  margin-bottom: 16px;
}

.modal .field-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 6px;
}

.modal .field-input {
  width: 100%;
  padding: 12px 14px;
  font-size: 15px;
  color: var(--text);
  background: var(--surface2);
  border: 1px solid var(--bdr);
  border-radius: 10px;
  outline: none;
  transition: border-color .2s;
  box-sizing: border-box;
}

.modal .field-input:focus {
  border-color: var(--accent2);
  background: #fff;
}

.modal .field-error {
  color: var(--warn);
  font-size: 13px;
  margin-top: 6px;
  min-height: 0;
}

/* ---- Loading 旋转器 ---- */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, .3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .6s linear infinite;
  display: inline-block;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
