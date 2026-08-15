<template>
  <div class="page">
    <!-- ========================================================
         头像区域
         ======================================================== -->
    <div class="profile-header">
      <div class="avatar-wrapper" @click="triggerAvatarChange" title="点击更换头像">
        <img v-if="authStore.currentUser.avatar" :src="authStore.currentUser.avatar" class="avatar-img" alt="头像" />
        <span v-else class="avatar-placeholder">
          {{ (authStore.currentUser.nickname || authStore.currentUser.username)[0] }}
        </span>
        <span class="avatar-badge"><PhCamera :size="14" /></span>
      </div>
      <input ref="avatarInput" type="file" accept="image/*" style="display:none" @change="onAvatarSelected" />
      <input ref="backupInput" type="file" accept=".json,application/json" style="display:none" @change="onImportFile" />
      <h2 class="profile-nickname">{{ authStore.currentUser.nickname || authStore.currentUser.username }}</h2>
      <p class="profile-username">@{{ authStore.currentUser.username }}</p>
      <span class="role-badge" :class="'role-' + authStore.currentUser.role">
        {{ roleLabel }}
      </span>
    </div>

    <!-- ========================================================
         生源地 & 选科
         ======================================================== -->
    <div class="profile-card">
      <h3 class="card-title"><PhMapPin :size="18" /> 生源地 & 选科</h3>

      <label class="field-label">生源省份</label>
      <select class="prov-select" :value="profile.province" @change="onProvinceChange($event.target.value)">
        <option value="">-- 请选择 --</option>
        <option v-for="p in PROVINCES" :key="p" :value="p">{{ p }}</option>
      </select>

      <label class="field-label" style="margin-top:16px">选科（自由多选）</label>
      <div class="subject-grid">
        <button
          v-for="sub in SUBJECT_OPTIONS"
          :key="sub.key"
          class="sub-chip"
          :class="{ on: profile.subjects.includes(sub.key) }"
          @click="userData.toggleSubject(sub.key)"
        >{{ sub.label }}</button>
      </div>
    </div>

    <!-- ========================================================
         高考成绩记录
         ======================================================== -->
    <div class="profile-card">
      <div class="card-head-row">
        <h3 class="card-title"><PhExam :size="18" /> 高考成绩记录</h3>
        <button class="add-btn" @click="openScoreModal()"><PhPlus :size="16" /> 添加</button>
      </div>

      <div v-if="scores.length" class="score-list">
        <div class="score-item" v-for="s in scores" :key="s.id">
          <div class="score-info" @click="openScoreModal(s)">
            <span class="score-tag" :class="'tag-' + (s.type || '其他')">{{ s.type || '其他' }}</span>
            <span class="score-date">{{ s.date }}</span>
            <span class="score-total">{{ s.total }}分</span>
          </div>
          <button class="score-del" @click.stop="onDeleteScore(s.id)"><PhX :size="14" /></button>
        </div>
      </div>
      <p v-else class="empty-hint">暂未记录成绩，点击"添加"录入</p>
    </div>

    <!-- ========================================================
         院校收藏
         ======================================================== -->
    <div class="profile-card">
      <h3 class="card-title"><PhHeart :size="18" /> 院校收藏</h3>

      <div v-if="favSchools.length" class="fav-list">
        <div
          class="fav-item"
          v-for="s in favSchools"
          :key="s.slug"
          @click="$router.push('/school/' + s.slug)"
        >
          <span class="fav-emoji" :style="{ background: s._bg }">
            <img v-if="adminData.getSchoolImage(s.slug)" class="fav-img" :src="adminData.getSchoolImage(s.slug)" alt="" />
            <template v-else>{{ s._emoji }}</template>
          </span>
          <div class="fav-info">
            <span class="fav-name">{{ s.name }}</span>
            <span class="fav-meta">{{ s.city }} · {{ s.type }}</span>
          </div>
          <span class="fav-score"><PhStar :size="14" weight="fill" /> {{ s.scores.综合.toFixed(1) }}</span>
        </div>
      </div>
      <p v-else class="empty-hint">还没有收藏学校，去首页看看吧</p>
    </div>

    <!-- ========================================================
         账号设置
         ======================================================== -->
    <div class="profile-menu">
      <button class="menu-item" @click="showNicknameModal = true">
        <span class="menu-icon"><PhNotePencil :size="18" /></span>
        <span class="menu-label">修改昵称</span>
        <span class="menu-arrow"><PhCaretRight :size="16" /></span>
      </button>
      <button class="menu-item" @click="showPasswordModal = true">
        <span class="menu-icon"><PhLock :size="18" /></span>
        <span class="menu-label">修改密码</span>
        <span class="menu-arrow"><PhCaretRight :size="16" /></span>
      </button>
      <button class="menu-item" @click="showBackupModal = true">
        <span class="menu-icon"><PhDownloadSimple :size="18" /></span>
        <span class="menu-label">数据备份</span>
        <span class="menu-arrow"><PhCaretRight :size="16" /></span>
      </button>
      <button v-if="authStore.isAdmin" class="menu-item" @click="$router.push('/admin')">
        <span class="menu-icon"><PhGear :size="18" /></span>
        <span class="menu-label">管理后台</span>
        <span class="menu-arrow"><PhCaretRight :size="16" /></span>
      </button>
      <button class="menu-item menu-item--danger" @click="handleLogout">
        <span class="menu-icon"><PhPower :size="18" /></span>
        <span class="menu-label">退出登录</span>
        <span class="menu-arrow"><PhCaretRight :size="16" /></span>
      </button>
    </div>

    <!-- ========================================================
         成绩编辑弹窗
         ======================================================== -->
    <div class="modal-mask" v-if="showScoreModal" @click.self="showScoreModal = false">
      <div class="modal">
        <h3>{{ editingScore ? '编辑成绩' : '添加成绩' }}</h3>

        <div class="field">
          <label class="field-label">考试类型</label>
          <select v-model="scoreForm.type" class="field-input">
            <option v-for="t in EXAM_TYPES" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <div class="field">
          <label class="field-label">日期</label>
          <input v-model="scoreForm.date" class="field-input" type="date" />
        </div>

        <div class="field">
          <label class="field-label">总分</label>
          <input v-model.number="scoreForm.total" class="field-input" type="number" placeholder="输入总分" min="0" max="750" />
        </div>

        <p class="field-label" style="margin-bottom:8px">各科成绩（可选）</p>
        <div class="subject-scores">
          <div class="ss-row" v-for="sub in coreSubjects" :key="sub.key">
            <span class="ss-label">{{ sub.label }}</span>
            <input v-model.number="scoreForm.details[sub.key]" class="ss-input" type="number" placeholder="--" min="0" />
          </div>
        </div>

        <div class="modal-acts" style="justify-content:space-between">
          <button v-if="editingScore" class="modal-del" @click="onDeleteScore(editingScore.id); showScoreModal = false">删除</button>
          <span v-else></span>
          <div style="display:flex;gap:12px">
            <button @click="showScoreModal = false">取消</button>
            <button class="sbm" @click="onSaveScore" :disabled="!scoreForm.total">保存</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================
         修改昵称弹窗
         ======================================================== -->
    <div class="modal-mask" v-if="showNicknameModal" @click.self="showNicknameModal = false">
      <div class="modal">
        <h3>修改昵称</h3>
        <input v-model="nicknameForm.value" class="field-input" placeholder="请输入新昵称（1-20位）" maxlength="20" @input="nicknameForm.error = ''" />
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
         数据备份弹窗
         ======================================================== -->
    <div class="modal-mask" v-if="showBackupModal" @click.self="showBackupModal = false">
      <div class="modal">
        <h3>数据备份</h3>
        <p class="backup-desc">备份仅包含个人数据（生源地/选科/成绩/收藏/对比/评价），不含账号密码。导入将覆盖现有数据。</p>
        <div class="modal-acts">
          <button @click="exportBackup">导出数据</button>
          <button class="sbm" @click="triggerImport">导入数据</button>
        </div>
      </div>
    </div>

    <!-- ========================================================
         导入确认弹窗
         ======================================================== -->
    <div class="modal-mask" v-if="showImportConfirm" @click.self="showImportConfirm = false">
      <div class="modal confirm-modal">
        <h3>导入数据</h3>
        <p class="confirm-text">导入将覆盖现有数据，确定继续？</p>
        <div class="confirm-acts">
          <button class="clr-btn" @click="showImportConfirm = false">取消</button>
          <button class="sbm" @click="confirmImport">确定导入</button>
        </div>
      </div>
    </div>

    <!-- ========================================================
         退出登录确认弹窗
         ======================================================== -->
    <div class="modal-mask" v-if="showLogoutConfirm" @click.self="showLogoutConfirm = false">
      <div class="modal confirm-modal">
        <h3>退出登录</h3>
        <p class="confirm-text">确定要退出当前账号吗？</p>
        <div class="confirm-acts">
          <button class="clr-btn" @click="showLogoutConfirm = false">取消</button>
          <button class="sbm" @click="confirmLogout">确定退出</button>
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
          <input v-model="passwordForm.oldPassword" class="field-input" type="password" placeholder="请输入原密码" @input="passwordForm.errors.oldPassword = ''" />
          <p class="field-error" v-if="passwordForm.errors.oldPassword">{{ passwordForm.errors.oldPassword }}</p>
        </div>
        <div class="field">
          <label class="field-label">新密码</label>
          <input v-model="passwordForm.newPassword" class="field-input" type="password" placeholder="至少6位" @input="passwordForm.errors.newPassword = ''" />
          <p class="field-error" v-if="passwordForm.errors.newPassword">{{ passwordForm.errors.newPassword }}</p>
        </div>
        <div class="field">
          <label class="field-label">确认新密码</label>
          <input v-model="passwordForm.confirmPassword" class="field-input" type="password" placeholder="请再次输入新密码" @input="passwordForm.errors.confirmPassword = ''" />
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
import { reactive, ref, computed, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useUserDataStore, PROVINCES, SUBJECT_OPTIONS, EXAM_TYPES } from '../stores/userData.js'
import { SCHOOLS } from '../data/schools.js'
import { loadLS } from '../utils/storage.js'
import { buildBackup, validateBackup, restoreBackup } from '../utils/backup.js'
import { useAdminDataStore } from '../stores/adminData.js'
import { PhNotePencil, PhLock, PhPower, PhCamera, PhCaretRight, PhHeart, PhStar, PhMapPin, PhExam, PhPlus, PhX, PhGear, PhDownloadSimple } from '@phosphor-icons/vue'

// ============================================================
// Stores
// ============================================================
const authStore = useAuthStore()
const userData = useUserDataStore()
const adminData = useAdminDataStore()
const router = useRouter()

// ============================================================
// 响应式绑定
// ============================================================
const profile = computed(() => userData.profile)
const scores = computed(() => userData.scores)

// 收藏列表
// 每次激活页面时重置弹窗状态 + 刷新收藏列表
onActivated(() => {
  showLogoutConfirm.value = false
  showNicknameModal.value = false
  showPasswordModal.value = false
  showBackupModal.value = false
  showImportConfirm.value = false
  favList.value = loadLS('cx-fav', [])
})

const favList = ref(loadLS('cx-fav', []))
const favSchools = computed(() =>
  favList.value.map(sl => adminData.getMergedSchool(sl)).filter(Boolean)
)

// ============================================================
// 角色标签
// ============================================================
const roleLabel = computed(() => {
  const m = { student: '学生', parent: '家长', admin: '管理员' }
  return m[authStore.currentUser?.role] || ''
})

// 核心科目
const coreSubjects = [
  { key: 'chinese', label: '语文' },
  { key: 'math', label: '数学' },
  { key: 'english', label: '英语' },
  { key: 'physics', label: '物理' },
  { key: 'chemistry', label: '化学' },
  { key: 'biology', label: '生物' },
  { key: 'history', label: '历史' },
  { key: 'politics', label: '政治' },
  { key: 'geography', label: '地理' }
]

// ============================================================
// 生源地
// ============================================================
function onProvinceChange(val) {
  userData.setProvince(val)
}

// ============================================================
// 成绩编辑
// ============================================================
const showScoreModal = ref(false)
const editingScore = ref(null)
const scoreForm = reactive({
  type: '一模',
  date: '',
  total: null,
  details: {}
})

function openScoreModal(score) {
  if (score) {
    editingScore.value = score
    scoreForm.type = score.type || '一模'
    scoreForm.date = score.date || ''
    scoreForm.total = score.total || null
    scoreForm.details = { ...(score.details || {}) }
  } else {
    editingScore.value = null
    scoreForm.type = '一模'
    scoreForm.date = new Date().toISOString().split('T')[0]
    scoreForm.total = null
    scoreForm.details = {}
  }
  showScoreModal.value = true
}

function onSaveScore() {
  const data = {
    type: scoreForm.type,
    date: scoreForm.date,
    total: scoreForm.total,
    details: { ...scoreForm.details }
  }
  if (editingScore.value) {
    userData.updateScore(editingScore.value.id, data)
  } else {
    userData.addScore(data)
  }
  showScoreModal.value = false
}

function onDeleteScore(id) {
  if (confirm('确定删除这条成绩记录吗？')) {
    userData.deleteScore(id)
  }
}

// ============================================================
// 头像上传
// ============================================================
const avatarInput = ref(null)

function triggerAvatarChange() {
  avatarInput.value?.click()
}

function onAvatarSelected(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      await authStore.updateAvatar(e.target.result)
    } catch (err) {
      alert(err.message || '上传失败')
    }
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}

// ============================================================
// 修改昵称
// ============================================================
const showNicknameModal = ref(false)
const nicknameForm = reactive({ value: '', error: '', loading: false })

async function handleUpdateNickname() {
  nicknameForm.error = ''
  const val = nicknameForm.value.trim()
  if (!val) { nicknameForm.error = '昵称不能为空'; return }
  if (val.length < 1 || val.length > 20) { nicknameForm.error = '昵称长度需在1-20位之间'; return }
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
// 修改密码
// ============================================================
const showLogoutConfirm = ref(false)
const showPasswordModal = ref(false)
const passwordForm = reactive({
  oldPassword: '', newPassword: '', confirmPassword: '',
  errors: { oldPassword: '', newPassword: '', confirmPassword: '' },
  loading: false
})

function validatePasswordForm() {
  let valid = true
  if (!passwordForm.oldPassword) { passwordForm.errors.oldPassword = '请输入原密码'; valid = false }
  if (!passwordForm.newPassword) { passwordForm.errors.newPassword = '请输入新密码'; valid = false }
  else if (passwordForm.newPassword.length < 6) { passwordForm.errors.newPassword = '新密码至少需要6位'; valid = false }
  if (!passwordForm.confirmPassword) { passwordForm.errors.confirmPassword = '请确认新密码'; valid = false }
  else if (passwordForm.confirmPassword !== passwordForm.newPassword) { passwordForm.errors.confirmPassword = '两次输入的密码不一致'; valid = false }
  return valid
}

async function handleChangePassword() {
  Object.keys(passwordForm.errors).forEach(k => passwordForm.errors[k] = '')
  if (!validatePasswordForm()) return
  passwordForm.loading = true
  try {
    await authStore.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
    showPasswordModal.value = false
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (err) {
    if (err.message.includes('原密码')) passwordForm.errors.oldPassword = err.message
    else passwordForm.errors.newPassword = err.message || '修改失败'
  } finally {
    passwordForm.loading = false
  }
}

// ============================================================
// 数据备份（导出/导入）
// ============================================================
const showBackupModal = ref(false)
const showImportConfirm = ref(false)
const pendingBackup = ref(null)
const backupInput = ref(null)

function exportBackup() {
  const backup = buildBackup()
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `校园搜备份-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function triggerImport() {
  backupInput.value?.click()
}

function onImportFile(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const obj = JSON.parse(reader.result)
      if (!validateBackup(obj)) {
        alert('备份文件格式不正确')
        return
      }
      pendingBackup.value = obj
      showBackupModal.value = false
      showImportConfirm.value = true
    } catch {
      alert('备份文件格式不正确')
    }
  }
  reader.readAsText(file)
}

function confirmImport() {
  restoreBackup(pendingBackup.value)
  location.reload()
}

// ============================================================
// 退出登录
// ============================================================
function handleLogout() {
  showLogoutConfirm.value = true
}

function confirmLogout() {
  showLogoutConfirm.value = false
  authStore.logout()
  router.replace('/auth')
}
</script>

<style scoped>
/* ====== 角色徽章 ====== */
.role-badge {
  display: inline-block;
  margin-top: 8px;
  padding: 4px 14px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
}
.role-student { background: rgba(74, 144, 217, .1); color: #4A90D9; }
.role-parent { background: rgba(91, 154, 107, .1); color: #5B9A6B; }
.role-admin { background: rgba(184, 115, 81, .1); color: var(--accent2); }

/* ====== 信息卡片 ====== */
.profile-card {
  margin: 0 20px 16px;
  background: var(--surface);
  border: 1px solid var(--bdr);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow);
}

.card-title {
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text);
}

.card-head-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.card-head-row .card-title { margin-bottom: 0; }

/* ====== 省份选择 ====== */
.prov-select {
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  color: var(--text);
  background: var(--surface2);
  border: 1px solid var(--bdr);
  border-radius: var(--radius);
  outline: none;
  font-family: var(--font);
  appearance: auto;
}
.prov-select:focus {
  border-color: var(--accent2);
}

/* ====== 选科 ====== */
.subject-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sub-chip {
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 500;
  color: var(--text2);
  background: var(--surface2);
  border: 1px solid var(--bdr);
  cursor: pointer;
  transition: all .2s;
}
.sub-chip.on {
  background: var(--text);
  color: var(--bg);
  border-color: var(--text);
}

/* ====== 成绩列表 ====== */
.score-list { display: flex; flex-direction: column; gap: 8px; }

.score-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface2);
  border-radius: 8px;
  padding: 6px 12px;
}

.score-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  min-width: 0;
}

.score-tag {
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}
.tag-一模, .tag-二模, .tag-三模 { background: rgba(139, 163, 140, .15); color: var(--accent3); }
.tag-高考 { background: rgba(184, 115, 81, .15); color: var(--accent2); }
.tag-联考 { background: rgba(74, 144, 217, .15); color: #4A90D9; }
.tag-其他 { background: var(--surface2); color: var(--text3); }

.score-date {
  font-size: 13px;
  color: var(--text2);
}
.score-total {
  margin-left: auto;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.score-del {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--text3);
  flex-shrink: 0;
}
.score-del:hover { color: var(--warn); background: rgba(196, 112, 98, .08); }

/* ====== 添加按钮 ====== */
.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 13px;
  color: var(--accent2);
  font-weight: 500;
  background: rgba(184, 115, 81, .06);
  cursor: pointer;
  transition: all .15s;
}
.add-btn:hover { background: rgba(184, 115, 81, .12); }

/* ====== 收藏列表 ====== */
.fav-list { display: flex; flex-direction: column; gap: 8px; }

.fav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--surface2);
  border-radius: 8px;
  cursor: pointer;
  transition: all .15s;
}
.fav-item:active { transform: scale(.98); }

.fav-emoji {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
.fav-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
}
.fav-info {
  flex: 1;
  min-width: 0;
}
.fav-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}
.fav-meta {
  font-size: 12px;
  color: var(--text3);
}
.fav-score {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent2);
  flex-shrink: 0;
}

/* ====== 空提示 ====== */
.empty-hint {
  text-align: center;
  font-size: 13px;
  color: var(--text3);
  padding: 16px 0;
}

/* ====== 科目成绩输入 ====== */
.subject-scores {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ss-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ss-label {
  font-size: 13px;
  color: var(--text2);
  width: 36px;
  flex-shrink: 0;
  text-align: right;
}
.ss-input {
  flex: 1;
  padding: 8px 12px;
  font-size: 14px;
  background: var(--surface2);
  border: 1px solid var(--bdr);
  border-radius: 6px;
  outline: none;
  color: var(--text);
}
.ss-input:focus { border-color: var(--accent2); }

/* ====== 删除按钮 ====== */
.modal-del {
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-size: 14px;
  color: var(--warn);
  background: rgba(196, 112, 98, .06);
}
.modal-del:hover { background: rgba(196, 112, 98, .12); }

/* ====== 弹窗内字段 ====== */
.modal .field { margin-bottom: 16px; }
.modal .field-label { display: block; font-size: 14px; font-weight: 500; color: var(--text); margin-bottom: 6px; }
.modal .field-input { width: 100%; padding: 12px 14px; font-size: 15px; color: var(--text); background: var(--surface2); border: 1px solid var(--bdr); border-radius: 10px; outline: none; transition: border-color .2s; box-sizing: border-box; }
.modal .field-input:focus { border-color: var(--accent2); background: #fff; }
.modal .field-error { color: var(--warn); font-size: 13px; margin-top: 6px; }

/* ====== 头像区域 ====== */
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 20px 32px;
  border-bottom: 1px solid var(--bdr);
}
.avatar-wrapper { position: relative; width: 80px; height: 80px; border-radius: 50%; cursor: pointer; margin-bottom: 16px; transition: transform .15s; }
.avatar-wrapper:active { transform: scale(.95); }
.avatar-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 3px solid var(--surface2); }
.avatar-placeholder { width: 100%; height: 100%; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; color: var(--bg); background: var(--accent2); border: 3px solid var(--surface2); }
.avatar-badge { position: absolute; bottom: -2px; right: -2px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: var(--bg); border-radius: 50%; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,.1); }
.profile-nickname { font-family: var(--font-heading); font-size: 22px; font-weight: 700; color: var(--text); }
.profile-username { font-size: 14px; color: var(--text3); margin-top: 4px; }

/* ====== 设置菜单 ====== */
.profile-menu { padding: 0 20px; margin-top: 16px; }
.menu-item { width: 100%; display: flex; align-items: center; gap: 14px; padding: 18px 0; font-size: 15px; color: var(--text); background: none; border: none; border-bottom: 1px solid var(--bdr); cursor: pointer; transition: background .15s; border-radius: 0; }
.menu-item:active { background: var(--surface2); }
.menu-item--danger { color: var(--warn); border-bottom: none; }
.menu-icon { font-size: 18px; width: 28px; text-align: center; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.menu-label { flex: 1; text-align: left; font-weight: 500; }
.menu-arrow { font-size: 14px; color: var(--text3); display: flex; align-items: center; }

/* ====== 退出确认弹窗 ====== */
.confirm-modal { text-align: center; }
.confirm-text { font-size: 15px; color: var(--text2); margin: 12px 0 24px; line-height: 1.6; }
.backup-desc { font-size: 14px; color: var(--text2); line-height: 1.6; margin: 12px 0 24px; }
.confirm-acts { display: flex; gap: 12px; justify-content: center; }
.confirm-acts .clr-btn { padding: 10px 28px; }
.confirm-acts .sbm { padding: 10px 28px; background: var(--text); color: var(--bg); border-radius: var(--radius-full); font-size: 14px; font-weight: 600; }

/* ====== Loading ====== */
.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite; display: inline-block; vertical-align: middle; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
