<template>
  <div class="page">
    <div class="pg-head">
      <button class="back" @click="$router.push('/')"><PhArrowLeft :size="18" /></button>
      <h1>管理后台</h1>
    </div>

    <!-- Tab 切换 -->
    <div class="admin-tabs">
      <button v-for="t in tabs" :key="t.key" class="atab" :class="{ on: tab === t.key }" @click="tab = t.key">{{ t.label }}</button>
    </div>

    <!-- ============================================================
         Tab 1: 首页轮播
         ============================================================ -->
    <div class="sec" v-if="tab === 'carousel'">
      <h3 class="sl">轮播学校（拖拽排序）</h3>
      <p class="muted">已选 {{ adminData.carousel.length }} 所，将在首页顶部滚动展示</p>
      <div class="car-list">
        <div class="car-item" v-for="(slug, i) in adminData.carousel" :key="slug">
          <span class="car-idx">{{ i + 1 }}</span>
          <span class="car-name">{{ getSchoolName(slug) }}</span>
          <div class="car-acts">
            <button class="car-btn" @click="adminData.moveCarousel(i, i - 1)" :disabled="i === 0">↑</button>
            <button class="car-btn" @click="adminData.moveCarousel(i, i + 1)" :disabled="i === adminData.carousel.length - 1">↓</button>
            <button class="car-btn car-rm" @click="adminData.removeCarousel(slug)"><PhX :size="14" /></button>
          </div>
        </div>
      </div>
      <div style="margin-top:16px">
        <select v-model="addSlug" class="prov-select" @change="onAddCar">
          <option value="">+ 添加学校到轮播</option>
          <option v-for="s in availableSchools" :key="s.slug" :value="s.slug">{{ s.name }}</option>
        </select>
      </div>
    </div>

    <!-- ============================================================
         Tab 2: 热点资讯
         ============================================================ -->
    <div class="sec" v-if="tab === 'news'">
      <h3 class="sl">热点资讯</h3>
      <button class="add-btn" @click="openNewsModal()"><PhPlus :size="16" /> 新增资讯</button>
      <div class="news-list" style="margin-top:12px">
        <div class="news-card" v-for="n in adminData.news" :key="n.id">
          <div class="news-body">
            <h3 class="news-title">{{ n.title }}</h3>
            <p class="news-desc">{{ n.desc }}</p>
            <div class="news-meta">
              <span class="news-source">{{ n.source }}</span>
              <span class="news-date">{{ n.date }}</span>
            </div>
          </div>
          <div class="news-acts">
            <button @click="openNewsModal(n)">编辑</button>
            <button class="del" @click="adminData.deleteNews(n.id)">删除</button>
          </div>
        </div>
      </div>

      <!-- 资讯弹窗 -->
      <div class="modal-mask" v-if="showNewsModal" @click.self="showNewsModal = false">
        <div class="modal">
          <h3>{{ editingNews ? '编辑资讯' : '新增资讯' }}</h3>
          <div class="field">
            <label class="field-label">标题</label>
            <input v-model="newsForm.title" class="field-input" placeholder="资讯标题" />
          </div>
          <div class="field">
            <label class="field-label">摘要</label>
            <textarea v-model="newsForm.desc" class="field-input" rows="3" placeholder="资讯摘要"></textarea>
          </div>
          <div class="field">
            <label class="field-label">来源</label>
            <input v-model="newsForm.source" class="field-input" placeholder="来源" />
          </div>
          <div class="field">
            <label class="field-label">日期</label>
            <input v-model="newsForm.date" class="field-input" type="date" />
          </div>
          <div class="modal-acts">
            <button @click="showNewsModal = false">取消</button>
            <button class="sbm" @click="onSaveNews">保存</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         Tab 3: 学校数据编辑
         ============================================================ -->
    <div class="sec" v-if="tab === 'school'">
      <h3 class="sl">学校数据编辑</h3>
      <select v-model="editSlug" class="prov-select" @change="onSelectSchool">
        <option value="">选择学校</option>
        <option v-for="s in SCHOOLS" :key="s.slug" :value="s.slug">{{ s.name }}</option>
      </select>

      <div v-if="editSlug && editData" style="margin-top:20px">
        <div class="field">
          <label class="field-label">背景色</label>
          <input v-model="editData._bg" class="field-input" type="color" />
        </div>
        <div class="field">
          <label class="field-label">学校简介</label>
          <textarea v-model="editData.intro" class="field-input" rows="3"></textarea>
        </div>
        <div class="field">
          <label class="field-label">标签（逗号分隔）</label>
          <input v-model="tagsStr" class="field-input" placeholder="空调宿舍, 985, 211" />
        </div>
        <h4 style="margin:16px 0 8px;font-weight:600">评分</h4>
        <div class="edit-grid">
          <div v-for="k in scoreKeys" :key="k" class="eg-item">
            <span class="eg-label">{{ k }}</span>
            <input v-model.number="editData.scores[k]" class="ss-input" type="number" step="0.1" min="0" max="5" />
          </div>
        </div>
        <h4 style="margin:16px 0 8px;font-weight:600">宿舍信息</h4>
        <div class="edit-grid">
          <div class="eg-item">
            <span class="eg-label">空调</span>
            <select v-model="editData.dormitory.has_ac" class="prov-select">
              <option :value="true">有</option>
              <option :value="false">无</option>
            </select>
          </div>
          <div class="eg-item">
            <span class="eg-label">独卫</span>
            <select v-model="editData.dormitory.has_private_bath" class="prov-select">
              <option :value="true">有</option>
              <option :value="false">无</option>
            </select>
          </div>
          <div class="eg-item">
            <span class="eg-label">床型</span>
            <input v-model="editData.dormitory.bed_type" class="ss-input" />
          </div>
          <div class="eg-item">
            <span class="eg-label">间型</span>
            <select v-model.number="editData.dormitory.room_size" class="prov-select">
              <option :value="4">4人间</option>
              <option :value="6">6人间</option>
              <option :value="8">8人间</option>
            </select>
          </div>
          <div class="eg-item">
            <span class="eg-label">备注</span>
            <input v-model="editData.dormitory.note" class="ss-input" />
          </div>
        </div>
        <h4 style="margin:16px 0 8px;font-weight:600">学习与生活</h4>
        <div class="edit-grid">
          <div class="eg-item">
            <span class="eg-label">校区位置</span>
            <input v-model="editData.campuses" class="ss-input" placeholder="如：仙林/鼓楼校区" />
          </div>
          <div class="eg-item">
            <span class="eg-label">专业课难度(1-5)</span>
            <input v-model.number="editData.major_difficulty" class="ss-input" type="number" step="0.1" min="1" max="5" />
          </div>
          <div class="eg-item">
            <span class="eg-label">食堂价格(人均)</span>
            <input v-model="editData.canteen_price" class="ss-input" placeholder="如：15-25元" />
          </div>
        </div>
        <button class="sbm" style="width:100%;margin-top:20px;padding:12px" @click="onSaveSchool">保存学校数据</button>
      </div>
    </div>

    <!-- ============================================================
         Tab 4: 校园图片
         ============================================================ -->
    <div class="sec" v-if="tab === 'images'">
      <h3 class="sl">校园图片管理</h3>
      <p class="muted">每校可上传多张图片，第一张为主图（首页/详情页封面显示）</p>
      <div class="img-grid">
        <div class="img-item" v-for="s in SCHOOLS" :key="s.slug">
          <div class="img-preview" :style="{ background: adminData.getSchoolImage(s.slug) ? 'none' : s._bg }">
            <img v-if="adminData.getSchoolImage(s.slug)" :src="adminData.getSchoolImage(s.slug)" alt="" />
            <span v-else class="img-emoji">{{ s._emoji }}</span>
          </div>
          <span class="img-name">{{ s.name }}</span>

          <div class="gal-thumbs" v-if="adminData.getSchoolGallery(s.slug).length">
            <div class="gal-thumb" v-for="(img, i) in adminData.getSchoolGallery(s.slug)" :key="i">
              <img :src="img" alt="" />
              <span v-if="i === 0" class="gal-main-tag">主图</span>
              <button v-else class="gal-move" title="设为主图" @click="adminData.setMainSchoolImage(s.slug, i)">设主图</button>
              <button class="gal-del" title="移除" @click="adminData.deleteSchoolImage(s.slug, i)"><PhX :size="12" /></button>
            </div>
          </div>

          <label class="img-upload">
            <PhCamera :size="14" /> {{ adminData.getSchoolGallery(s.slug).length ? '添加图片' : '上传图片' }}
            <input type="file" accept="image/*" style="display:none" @change="e => onUploadImage(s.slug, e)" />
          </label>
        </div>
      </div>
    </div>

    <!-- ============================================================
         Tab 5: 校园视频
         ============================================================ -->
    <div class="sec" v-if="tab === 'videos'">
      <h3 class="sl">校园视频</h3>
      <select v-model="videoSlug" class="prov-select" @change="loadVideoList">
        <option value="">选择学校</option>
        <option v-for="s in SCHOOLS" :key="s.slug" :value="s.slug">{{ s.name }}</option>
      </select>

      <template v-if="videoSlug">
        <div style="margin-top:16px">
          <input v-model="videoTitle" class="field-input" placeholder="视频标题" style="margin-bottom:8px" />
          <input type="file" accept="video/*" style="display:none" ref="videoFileInput" @change="onVideoFileSelected" />
          <button class="add-btn" @click="videoFileInput?.click()">选择视频文件（≤50MB）</button>
          <span v-if="videoFileName" class="muted" style="margin-left:8px">{{ videoFileName }}</span>
          <p class="muted" v-if="videoFile && !videoTitle.trim()" style="margin-top:8px">已选择 {{ videoFileName }}，请填写标题后点击上传</p>
          <button class="sbm" style="width:100%;margin-top:12px;padding:12px" :disabled="!videoFile || videoUploading" @click="uploadVideo">
            {{ videoUploading ? '上传中...' : '上传视频' }}
          </button>
        </div>

        <div style="margin-top:16px">
          <p class="muted" v-if="!videoList.length">该校暂无视频</p>
          <div class="v-item" v-for="v in videoList" :key="v.id">
            <span class="v-title">{{ v.title }}</span>
            <span class="v-meta">{{ fmtSize(v.size) }} · {{ fmtDate(v.createdAt) }}</span>
            <button class="v-del" @click="removeVideo(v)">删除</button>
          </div>
        </div>
      </template>
    </div>

    <!-- ============================================================
         Tab 6: 系统设置
         ============================================================ -->
    <div class="sec" v-if="tab === 'settings'">
      <h3 class="sl">系统设置</h3>

      <div class="set-row">
        <span>会话过期天数</span>
        <div class="set-val">
          <input v-model.number="sessionDays" class="ss-input" type="number" min="1" max="365" style="width:80px;text-align:center" />
          <button class="add-btn" @click="onSaveSession">保存</button>
        </div>
      </div>

      <h4 style="margin:24px 0 12px;font-weight:600">新增管理员</h4>
      <div class="field">
        <input v-model="newAdmin.username" class="field-input" placeholder="用户名" style="margin-bottom:8px" />
        <input v-model="newAdmin.email" class="field-input" placeholder="邮箱" style="margin-bottom:8px" />
        <input v-model="newAdmin.password" class="field-input" type="password" placeholder="密码(至少6位)" />
        <p class="field-error" v-if="adminError">{{ adminError }}</p>
        <button class="add-btn" style="margin-top:8px" @click="onAddAdmin">新增管理员</button>
      </div>

      <h4 style="margin:24px 0 12px;font-weight:600">登录日志（最近20条）</h4>
      <div class="log-list" v-if="logs.length">
        <div class="log-item" v-for="l in logs" :key="l.loginAt">
          <span class="log-user">{{ l.username }}</span>
          <span class="log-role" :class="'role-' + l.role">{{ roleMap[l.role] || l.role }}</span>
          <span class="log-time">{{ fmtTime(l.loginAt) }}</span>
        </div>
      </div>
      <p v-else class="empty-hint">暂无登录记录</p>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, reactive, computed } from 'vue'
import { SCHOOLS } from '../data/schools.js'
import { useAuthStore } from '../stores/auth.js'
import { useAdminDataStore } from '../stores/adminData.js'
import { PhArrowLeft, PhPlus, PhX, PhCamera } from '@phosphor-icons/vue'
import { addVideo, listVideos, deleteVideo } from '../utils/videoStore.js'
import { showToast, showConfirm } from '../composables/ui.js'

const authStore = useAuthStore()
const adminData = useAdminDataStore()

const tabs = [
  { key: 'carousel', label: '首页轮播' },
  { key: 'news', label: '热点资讯' },
  { key: 'school', label: '学校数据' },
  { key: 'images', label: '校园图片' },
  { key: 'videos', label: '校园视频' },
  { key: 'settings', label: '系统设置' }
]
const tab = ref('carousel')

// ====== 轮播 ======
const addSlug = ref('')
const availableSchools = computed(() =>
  SCHOOLS.filter(s => !adminData.carousel.includes(s.slug))
)
function getSchoolName(slug) {
  return SCHOOLS.find(s => s.slug === slug)?.name || slug
}
function onAddCar() {
  if (addSlug.value) {
    adminData.addCarousel(addSlug.value)
    addSlug.value = ''
  }
}

// ====== 资讯 ======
const showNewsModal = ref(false)
const editingNews = ref(null)
const newsForm = reactive({ title: '', desc: '', source: '', date: '' })
function openNewsModal(item) {
  if (item) {
    editingNews.value = item
    Object.assign(newsForm, { title: item.title, desc: item.desc, source: item.source, date: item.date })
  } else {
    editingNews.value = null
    Object.assign(newsForm, { title: '', desc: '', source: '', date: new Date().toISOString().split('T')[0] })
  }
  showNewsModal.value = true
}
function onSaveNews() {
  if (!newsForm.title.trim()) return
  if (editingNews.value) {
    adminData.updateNews(editingNews.value.id, { ...newsForm })
  } else {
    adminData.addNews({ ...newsForm })
  }
  showNewsModal.value = false
}

// ====== 学校数据 ======
const editSlug = ref('')
const scoreKeys = ['综合', '宿舍', '食堂', '教学', '环境', '社交']
const editData = ref(null)
const tagsStr = ref('')

function onSelectSchool() {
  if (!editSlug.value) { editData.value = null; return }
  const s = SCHOOLS.find(x => x.slug === editSlug.value)
  const merged = adminData.getMergedSchool(editSlug.value)
  editData.value = {
    _bg: merged._bg,
    intro: merged.intro,
    scores: { ...merged.scores },
    dormitory: { ...merged.dormitory },
    campuses: merged.campuses,
    major_difficulty: merged.major_difficulty,
    canteen_price: merged.canteen_price
  }
  tagsStr.value = merged.tags.join(', ')
}
function onSaveSchool() {
  if (!editSlug.value) return
  adminData.setSchoolOverride(editSlug.value, {
    _bg: editData.value._bg,
    intro: editData.value.intro,
    scores: editData.value.scores,
    dormitory: editData.value.dormitory,
    tags: tagsStr.value.split(',').map(t => t.trim()).filter(Boolean),
    campuses: editData.value.campuses,
    major_difficulty: editData.value.major_difficulty,
    canteen_price: editData.value.canteen_price
  })
  showToast('保存成功')
}

// ====== 图片 ======
function onUploadImage(slug, e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 500 * 1024) { showToast('图片不能超过500KB'); return }
  const reader = new FileReader()
  reader.onload = () => adminData.setSchoolImage(slug, reader.result)
  reader.readAsDataURL(file)
  e.target.value = ''
}

// ====== 校园视频 ======
const videoSlug = ref('')
const videoTitle = ref('')
const videoFile = shallowRef(null)
const videoFileName = ref('')
const videoUploading = ref(false)
const videoList = ref([])
const videoFileInput = ref(null)

async function loadVideoList() {
  if (!videoSlug.value) { videoList.value = []; return }
  videoList.value = await listVideos(videoSlug.value)
}

function onVideoFileSelected(e) {
  const f = e.target.files?.[0]
  e.target.value = ''
  if (!f) return
  // Windows 下部分视频文件 MIME 为空，扩展名兜底识别
  const isVideo = f.type.startsWith('video/') || /\.(mp4|webm|ogg|mov|m4v|mkv|avi|flv|wmv)$/i.test(f.name)
  if (!isVideo) { showToast('请选择视频文件（mp4/webm/mov/mkv 等）'); return }
  if (f.size > 50 * 1024 * 1024) { showToast('视频不能超过50MB'); return }
  videoFile.value = f
  videoFileName.value = f.name
}

async function uploadVideo() {
  if (!videoFile.value) return
  if (!videoTitle.value.trim()) { showToast('请填写视频标题'); return }
  videoUploading.value = true
  try {
    await addVideo({
      slug: videoSlug.value,
      title: videoTitle.value.trim(),
      blob: videoFile.value,
      size: videoFile.value.size,
      createdAt: Date.now()
    })
    videoFile.value = null
    videoFileName.value = ''
    videoTitle.value = ''
    await loadVideoList()
    showToast('上传成功')
  } finally {
    videoUploading.value = false
  }
}

async function removeVideo(v) {
  const ok = await showConfirm({ title: '删除视频', message: `确定删除视频「${v.title}」？删除后无法恢复。`, danger: true })
  if (!ok) return
  await deleteVideo(v.id)
  await loadVideoList()
}

function fmtSize(bytes) { return (bytes / 1024 / 1024).toFixed(1) + ' MB' }
function fmtDate(ts) { return new Date(ts).toLocaleDateString('zh-CN') }

// ====== 系统设置 ======
const sessionDays = ref(authStore.getConfig().sessionDays || 7)
const newAdmin = reactive({ username: '', email: '', password: '' })
const adminError = ref('')
const roleMap = { student: '学生', parent: '家长', admin: '管理员' }
const logs = computed(() => authStore.getLoginLogs().reverse().slice(0, 20))

function onSaveSession() {
  if (sessionDays.value < 1) { showToast('至少1天'); return }
  authStore.updateSessionDays(sessionDays.value)
  showToast('已更新')
}
async function onAddAdmin() {
  adminError.value = ''
  if (!newAdmin.username.trim() || !newAdmin.email.trim() || !newAdmin.password) {
    adminError.value = '所有字段必填'; return
  }
  if (newAdmin.password.length < 6) { adminError.value = '密码至少6位'; return }
  try {
    await authStore.addAdminAccount(newAdmin.username.trim(), newAdmin.email.trim(), newAdmin.password)
    newAdmin.username = ''
    newAdmin.email = ''
    newAdmin.password = ''
    showToast('管理员添加成功')
  } catch (err) { adminError.value = err.message }
}
function fmtTime(ts) {
  return new Date(ts).toLocaleString('zh-CN')
}
</script>

<style scoped>
/* ====== TABS ====== */
.admin-tabs {
  display: flex; gap: 4px;
  padding: 0 16px 12px;
  overflow-x: auto; scrollbar-width: none;
}
.admin-tabs::-webkit-scrollbar { display: none; }
.atab {
  flex-shrink: 0; padding: 8px 16px;
  border-radius: var(--radius-full);
  font-size: 13px; font-weight: 500;
  color: var(--text2); background: var(--surface2);
  border: 1px solid var(--bdr); cursor: pointer;
  transition: all .15s;
}
.atab.on { background: var(--text); color: var(--bg); border-color: var(--text); }

/* ====== COMMON ====== */
.muted { font-size: 13px; color: var(--text3); margin-bottom: 12px; }
.field { margin-bottom: 16px; }
.field-label { display: block; font-size: 14px; font-weight: 500; color: var(--text); margin-bottom: 6px; }
.field-input { width: 100%; padding: 10px 14px; font-size: 14px; color: var(--text); background: var(--surface2); border: 1px solid var(--bdr); border-radius: var(--radius); outline: none; box-sizing: border-box; font-family: var(--font); }
.field-input:focus { border-color: var(--accent2); }
.field-error { color: var(--warn); font-size: 13px; margin-top: 6px; }

/* ====== CAROUSEL LIST ====== */
.car-list { display: flex; flex-direction: column; gap: 8px; }
.car-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; background: #fff;
  border: 1px solid var(--bdr); border-radius: 8px;
}
.car-idx { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: var(--text); color: var(--bg); border-radius: 50%; font-size: 12px; font-weight: 600; flex-shrink: 0; }
.car-name { flex: 1; font-size: 14px; font-weight: 500; }
.car-acts { display: flex; gap: 4px; }
.car-btn { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; font-size: 12px; color: var(--text2); background: var(--surface2); }
.car-btn:disabled { opacity: .3; }
.car-rm { color: var(--warn); }

/* ====== NEWS ====== */
.news-card { background: #fff; border: 1px solid var(--bdr); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 10px; box-shadow: var(--shadow); }
.news-title { font-size: 15px; font-weight: 600; margin-bottom: 6px; }
.news-desc { font-size: 13px; color: var(--text2); line-height: 1.6; }
.news-meta { display: flex; gap: 12px; margin-top: 8px; }
.news-source { font-size: 11px; color: var(--accent2); background: rgba(184,115,81,.08); padding: 2px 8px; border-radius: 4px; }
.news-date { font-size: 11px; color: var(--text3); }
.news-acts { display: flex; gap: 8px; margin-top: 10px; }
.news-acts button { padding: 4px 12px; border-radius: var(--radius-full); font-size: 12px; color: var(--accent2); background: rgba(184,115,81,.06); cursor: pointer; }
.news-acts button.del { color: var(--warn); background: rgba(196,112,98,.06); }

/* ====== EDIT GRID ====== */
.edit-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.eg-item { display: flex; flex-direction: column; gap: 4px; }
.eg-label { font-size: 12px; color: var(--text3); }

/* ====== IMAGES ====== */
.img-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.img-item { text-align: center; background: #fff; border: 1px solid var(--bdr); border-radius: 8px; padding: 12px; }
.img-preview { width: 100%; height: 80px; border-radius: 6px; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-bottom: 8px; }
.img-preview img { width: 100%; height: 100%; object-fit: cover; }
.img-emoji { font-size: 28px; opacity: .5; }
.img-name { font-size: 13px; font-weight: 500; display: block; margin-bottom: 4px; }
.img-upload { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: var(--radius-full); font-size: 11px; color: var(--accent2); background: rgba(184,115,81,.06); cursor: pointer; margin-top: 6px; }
.img-del { display: block; margin: 4px auto 0; font-size: 11px; color: var(--warn); }

/* ====== GALLERY THUMBS (ADMIN) ====== */
.gal-thumbs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; justify-content: center; }
.gal-thumb { position: relative; width: 56px; height: 56px; border-radius: 6px; overflow: hidden; }
.gal-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.gal-main-tag {
  position: absolute; left: 0; top: 0;
  padding: 1px 5px; background: var(--accent2); color: #fff;
  font-size: 9px; border-radius: 0 0 6px 0;
}
.gal-move {
  position: absolute; right: 0; top: 0;
  padding: 1px 4px; background: rgba(26,26,46,.7); color: #fff;
  font-size: 9px; border-radius: 0 0 0 6px; cursor: pointer;
}
.gal-del {
  position: absolute; right: 0; bottom: 0;
  width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;
  background: rgba(196,112,98,.85); color: #fff;
  font-size: 10px; border-radius: 6px 0 0 0; cursor: pointer;
}

/* ====== VIDEOS ====== */
.v-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; background: #fff;
  border: 1px solid var(--bdr); border-radius: 8px;
  margin-bottom: 8px;
}
.v-title { flex: 1; min-width: 0; font-size: 14px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.v-meta { flex-shrink: 0; font-size: 11px; color: var(--text3); }
.v-del { flex-shrink: 0; padding: 4px 12px; border-radius: var(--radius-full); font-size: 12px; color: var(--warn); background: rgba(196,112,98,.06); cursor: pointer; }

/* ====== SETTINGS ====== */
.set-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--bdr); }
.set-val { display: flex; align-items: center; gap: 8px; }
.log-list { display: flex; flex-direction: column; gap: 6px; }
.log-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--surface2); border-radius: 6px; font-size: 13px; }
.log-user { font-weight: 600; }
.log-role { padding: 1px 8px; border-radius: 4px; font-size: 10px; font-weight: 500; }
.role-student { background: rgba(74,144,217,.1); color: #4A90D9; }
.role-parent { background: rgba(91,154,107,.1); color: #5B9A6B; }
.role-admin { background: rgba(184,115,81,.1); color: var(--accent2); }
.log-time { margin-left: auto; font-size: 11px; color: var(--text3); }

/* ====== ADD / BUTTON ====== */
.add-btn { display: inline-flex; align-items: center; gap: 4px; padding: 8px 16px; border-radius: var(--radius-full); font-size: 13px; color: var(--accent2); font-weight: 500; background: rgba(184,115,81,.06); cursor: pointer; transition: all .15s; }
.add-btn:hover { background: rgba(184,115,81,.12); }
.prov-select { width: 100%; padding: 10px 14px; font-size: 14px; color: var(--text); background: var(--surface2); border: 1px solid var(--bdr); border-radius: var(--radius); outline: none; font-family: var(--font); appearance: auto; }
.prov-select:focus { border-color: var(--accent2); }

/* ====== MODAL ====== */
.modal textarea.field-input { resize: vertical; min-height: 60px; font-family: var(--font); }

/* ====== Empty ====== */
.empty-hint { text-align: center; font-size: 13px; color: var(--text3); padding: 16px 0; }
</style>
