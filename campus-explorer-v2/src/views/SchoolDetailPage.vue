<template>
  <div class="page detail-page" v-if="s">
    <!-- Cover -->
    <div class="cover" :style="{ background: s._bg }">
      <span class="cover-emoji">{{ s._emoji }}</span>
      <button class="cover-back" @click="$router.back()">
        <span><PhArrowLeft :size="18" /></span>
      </button>
      <div class="cover-acts">
        <button :class="{ on: isFav }" @click="toggleFav">
          <PhStar :size="18" :weight="isFav ? 'fill' : 'regular'" />
        </button>
        <button @click="shareIt"><PhShare :size="18" /></button>
      </div>
    </div>

    <!-- Basic Info -->
    <div class="sec info-sec">
      <h1 class="d-name">{{ s.name }}</h1>
      <div class="d-meta">
        <span class="d-type">{{ s.type }}</span>
        <span class="d-city">{{ s.city }}</span>
        <span>{{ s.province }}</span>
      </div>
      <div class="d-profile">
        <span class="pf-icon"><PhSparkle :size="20" /></span>
        <p>{{ s.profile }}</p>
      </div>
    </div>

    <!-- Scores -->
    <div class="sec">
      <h3 class="sl">综合评分</h3>
      <div class="score-row">
        <div class="score-item" v-for="(v, k) in s.scores" :key="k">
          <svg viewBox="0 0 36 36" class="s-svg">
            <path
              d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
              fill="none"
              stroke="var(--bdr)"
              stroke-width="3"
            />
            <path
              d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
              fill="none"
              :stroke="scoreColor(k)"
              stroke-width="3"
              stroke-linecap="round"
              :stroke-dasharray="(v / 5) * 100 + ',100'"
              transform="rotate(-90,18,18)"
            />
          </svg>
          <span class="s-val">{{ v.toFixed(1) }}</span>
          <span class="s-label">{{ k }}</span>
        </div>
      </div>
    </div>

    <!-- Dormitory -->
    <div class="sec">
      <h3 class="sl">宿舍条件</h3>
      <div class="dorm-card">
        <div class="dorm-icons">
          <div class="di" v-for="it in dormQuick" :key="it.l">
            <span class="di-icon" :class="it.v ? 'yes' : 'no'">
              <PhCheck :size="18" v-if="it.v" />
              <PhX :size="18" v-else />
            </span>
            <span>{{ it.l }}</span>
          </div>
        </div>
        <div class="dorm-detail" v-for="it in dormDetail" :key="it.l">
          <span class="dd-l">{{ it.l }}</span>
          <span class="dd-v">{{ it.v }}</span>
        </div>
        <div class="dorm-note" v-if="s.dormitory.note">
          <span><PhWarning :size="14" /></span>{{ s.dormitory.note }}
        </div>
        <p class="dorm-conf"><PhCheck :size="14" /> {{ s.dormitory.confirmed_by }} 位学长确认</p>
      </div>
    </div>

    <!-- Tags -->
    <div class="sec">
      <div class="tag-cloud">
        <button
          class="tag"
          v-for="t in s.tags"
          :key="t"
          @click="$router.push('/search?q=' + encodeURIComponent(t))"
        >
          {{ t }}
        </button>
      </div>
    </div>

    <!-- Reviews -->
    <div class="sec">
      <h3 class="sl">
        学生评价
        <span class="sl-sub">{{ sortedReviews.length }} 条</span>
      </h3>
      <div class="sort-row">
        <button :class="{ on: rs === 'helpful' }" @click="rs = 'helpful'">最有帮助</button>
        <button :class="{ on: rs === 'newest' }" @click="rs = 'newest'">最新</button>
      </div>
      <div class="review-card" v-for="r in sortedReviews" :key="r.id">
        <div class="rv-head">
          <div class="rv-author">
            <span class="rv-avatar">{{ r.author[0] }}</span>
            <div>
              <span class="rv-name">{{ r.author }}</span>
              <span class="rv-src">{{ r.source }}</span>
            </div>
          </div>
          <div class="rv-head-right">
            <span class="rv-star"><PhStar :size="14" weight="fill" /> {{ r.rating.综合 }}</span>
            <!-- 自己的评论：显示编辑/删除按钮 -->
            <div class="rv-own-acts" v-if="r._isUser && r.username === authStore.currentUser?.username">
              <button class="rv-edit" @click.stop="openEditReview(r)" title="编辑">
                <PhPencil :size="14" />
              </button>
              <button class="rv-del" @click.stop="deleteReview(r.id)" title="删除">
                <PhTrash :size="14" />
              </button>
            </div>
          </div>
        </div>
        <p class="rv-content">{{ r.content }}</p>
        <div class="rv-foot">
          <span>{{ r.created_at }}{{ r.editedAt ? ' · 已编辑' : '' }}</span>
          <button @click.stop="r.helpful++"><PhCaretUp :size="14" /> 有用({{ r.helpful }})</button>
        </div>
      </div>
      <button class="write-btn" @click="openNewReview"><PhNotePencil :size="16" /> 写评价</button>
    </div>

    <!-- AI Q&A -->
    <div class="sec">
      <h3 class="sl">AI 学长问答</h3>
      <div class="ai-card">
        <div class="ai-header">
          <span class="ai-avatar"><PhGraduationCap :size="24" /></span>
          <div>
            <span class="ai-name">{{ s.name }}学长</span>
            <span class="ai-on">在线</span>
          </div>
        </div>
        <p class="ai-greet">你好！我是{{ s.name }}的在校生，有什么想了解的？</p>
        <div class="ai-quick">
          <button v-for="q in quickQs" :key="q" @click="ask(q)">{{ q }}</button>
        </div>
        <div class="ai-chat" v-if="msgs.length">
          <div class="chat-msg" v-for="(m, i) in msgs" :key="i" :class="m.r">
            <span class="chat-bubble">{{ m.t }}</span>
          </div>
        </div>
        <div class="ai-input">
          <input
            v-model="aq"
            @keyup.enter="ask(aq)"
            placeholder="输入问题..."
          >
          <button @click="ask(aq)" :disabled="!aq.trim()"><PhPaperPlaneRight :size="18" /></button>
        </div>
        <p class="ai-note">内容由AI生成，仅供参考</p>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="bottom-bar">
      <button :class="{ on: isComp }" @click="toggleComp">
        <span><PhArrowsLeftRight :size="18" /></span>{{ isComp ? '已加入' : '对比' }}
      </button>
      <button :class="{ on: isFav }" @click="toggleFav">
        <span><PhStar :size="18" :weight="isFav ? 'fill' : 'regular'" /></span>收藏
      </button>
      <button @click="shareIt">
        <span><PhShare :size="18" /></span>分享
      </button>
      <button class="primary" @click="openNewReview">
        <span><PhNotePencil :size="18" /></span>写评价
      </button>
    </div>

    <!-- Review Modal -->
    <div class="modal-mask" v-if="showReview" @click.self="closeReviewModal">
      <div class="modal">
        <h3>{{ editingReviewId ? '编辑评价' : '写评价' }}</h3>
        <div class="stars-row">
          <span>综合评分</span>
          <span class="stars">
        <PhStar v-for="i in rating" :key="'fs'+i" :size="20" weight="fill" />
        <PhStar v-for="i in (5 - rating)" :key="'es'+i" :size="20" />
      </span>
        </div>
        <div class="star-btns">
          <button
            v-for="i in 5"
            :key="i"
            :class="{ on: i <= rating }"
            @click="rating = i"
          >
            <PhStar :size="24" :weight="i <= rating ? 'fill' : 'regular'" />
          </button>
        </div>
        <textarea
          v-model="reviewText"
          placeholder="分享你的真实体验..."
          maxlength="500"
        ></textarea>
        <div class="modal-acts">
          <label>
            <input type="checkbox" v-model="anon"> 匿名
          </label>
          <div>
            <button @click="closeReviewModal">取消</button>
            <button class="sbm" @click="submitReview" :disabled="reviewText.trim().length < 5">
              {{ editingReviewId ? '保存修改' : '发布' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div class="modal-mask" v-if="showDeleteConfirm" @click.self="cancelDelete">
      <div class="modal confirm-modal">
        <h3>确定删除评论？</h3>
        <p class="confirm-desc">删除后将无法恢复</p>
        <div class="confirm-acts">
          <button class="confirm-cancel" @click="cancelDelete">取消</button>
          <button class="confirm-danger" @click="confirmDelete">确定删除</button>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <transition name="toast">
      <div class="review-toast" v-if="toastMessage">{{ toastMessage }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SCHOOLS } from '../data/schools.js'
import { loadLS, saveLS } from '../utils/storage.js'
import { PhArrowLeft, PhStar, PhShare, PhSparkle, PhCheck, PhX, PhWarning, PhNotePencil, PhGraduationCap, PhPaperPlaneRight, PhArrowsLeftRight, PhCaretUp, PhPencil, PhTrash } from '@phosphor-icons/vue'
import { useAuthStore } from '../stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const favorites = ref(loadLS('cx-fav', []))
const compareList = ref(loadLS('cx-cmp', []))
const userReviews = ref(loadLS('cx-rev', []))

const s = computed(() => SCHOOLS.find(x => x.slug === route.params.slug))
const isFav = computed(() => favorites.value.includes(route.params.slug))
const isComp = computed(() => compareList.value.includes(route.params.slug))

const msgs = ref([])
const aq = ref('')
const rs = ref('helpful')
const showReview = ref(false)
const editingReviewId = ref(null)   // null=新建模式, 非null=编辑模式
const rating = ref(4)
const reviewText = ref('')
const anon = ref(true)
const toastMessage = ref('')
const showDeleteConfirm = ref(false)
const pendingDeleteId = ref(null)
let toastTimer = null

const quickQs = ['宿舍有空调吗', '食堂怎么样', '学校交通方便吗', '就业情况如何']

const dormQuick = computed(() => {
  const d = s.value?.dormitory
  if (!d) return []
  return [
    { l: '空调', v: d.has_ac },
    { l: '独卫', v: d.has_private_bath },
    { l: '阳台', v: d.has_balcony },
    { l: '热水器', v: d.has_water_heater },
    { l: '洗衣机', v: d.has_washing_machine }
  ]
})

const dormDetail = computed(() => {
  const d = s.value?.dormitory
  if (!d) return []
  return [
    { l: '空调类型', v: d.ac_type },
    { l: '床型', v: d.bed_type },
    { l: '标准间', v: d.room_size + '人间' },
    { l: '网络', v: d.internet },
    { l: '门禁', v: d.curfew }
  ]
})

const sortedReviews = computed(() => {
  if (!s.value) return []
  // 合并内置评论 + 当前学校的用户评论
  const userRevs = userReviews.value
    .filter(r => r.school_slug === s.value.slug)
    .map(r => ({ ...r, _isUser: true }))
  const r = [...userRevs, ...s.value.reviews]
  if (rs.value === 'helpful') r.sort((a, b) => (b.helpful || 0) - (a.helpful || 0))
  else r.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  return r
})

function scoreColor(k) {
  const m = {
    宿舍: '#C9A96E', 食堂: '#D4756B', 教学: '#6B8DBF',
    环境: '#7A9D7E', 社交: '#C17F59', 综合: '#1A1A2E'
  }
  return m[k] || '#C17F59'
}

function ask(q) {
  const t = (typeof q === 'string' ? q : aq.value).trim()
  if (!t) return
  aq.value = ''
  msgs.value.push({ r: 'user', t })
  setTimeout(() => {
    msgs.value.push({ r: 'bot', t: genAI(t, s.value) })
  }, 1000 + Math.random() * 2000)
}

function genAI(q, s) {
  if (!s) return '暂无数据'
  if (q.includes('空调')) return s.dormitory.has_ac ? '有' + s.dormitory.ac_type + '！夏天不用担心。' : '部分宿舍暂未全覆盖。'
  if (q.includes('食堂') || q.includes('吃')) return '食堂评分' + s.scores.食堂?.toFixed(1) + '分。选择挺多的！'
  if (q.includes('宿舍') || q.includes('住')) return s.dormitory.room_size + '人间，' + s.dormitory.bed_type + '，' + (s.dormitory.has_private_bath ? '有' : '部分有') + '独卫。'
  if (q.includes('交通')) return s.city + '公共交通比较方便。'
  if (q.includes('就业')) return s.type + '院校，毕业生就业认可度不错。'
  return '关于"' + q + '"，建议结合官网信息和在校生评价综合判断。'
}

function toggleFav() {
  const slug = route.params.slug
  const i = favorites.value.indexOf(slug)
  if (i > -1) favorites.value.splice(i, 1)
  else favorites.value.push(slug)
  saveLS('cx-fav', favorites.value)
}

function toggleComp() {
  const slug = route.params.slug
  const i = compareList.value.indexOf(slug)
  if (i > -1) compareList.value.splice(i, 1)
  else if (compareList.value.length < 4) compareList.value.push(slug)
  saveLS('cx-cmp', compareList.value)
}

function shareIt() {
  const url = location.href
  if (navigator.share) {
    navigator.share({ title: s.value?.name, url }).catch(() => {})
  } else {
    navigator.clipboard.writeText(url).then(() => alert('链接已复制')).catch(() => prompt('复制链接：', url))
  }
}

function submitReview() {
  const text = reviewText.value.trim()
  if (!text || !s.value) return

  if (editingReviewId.value) {
    // ---------- 编辑模式：更新已有评论 ----------
    const idx = userReviews.value.findIndex(r => r.id === editingReviewId.value)
    if (idx !== -1) {
      userReviews.value[idx] = {
        ...userReviews.value[idx],
        content: text,
        rating: { 综合: rating.value },
        author: anon.value ? '匿名用户' : '同学',
        editedAt: new Date().toISOString().split('T')[0]
      }
      saveLS('cx-rev', userReviews.value)
      showToast('✅ 评论已更新')
    }
    editingReviewId.value = null
  } else {
    // ---------- 新建模式 ----------
    const review = {
      id: 'ur_' + Date.now(),
      school_slug: s.value.slug,
      school_name: s.value.name,
      username: authStore.currentUser?.username || '',
      source: '用户原创',
      content: text,
      rating: { 综合: rating.value },
      author: anon.value ? '匿名用户' : '同学',
      helpful: 0,
      created_at: new Date().toISOString().split('T')[0]
    }
    userReviews.value.unshift(review)
    saveLS('cx-rev', userReviews.value)
    showToast('✅ 评论发布成功')
  }

  showReview.value = false
  reviewText.value = ''
  rating.value = 4
}

// ---------- 打开新建弹窗（始终重置为空白） ----------
function openNewReview() {
  editingReviewId.value = null
  reviewText.value = ''
  rating.value = 4
  anon.value = true
  showReview.value = true
}

// ---------- 打开编辑弹窗 ----------
function openEditReview(review) {
  editingReviewId.value = review.id
  reviewText.value = review.content
  rating.value = review.rating?.综合 || 4
  anon.value = review.author === '匿名用户'
  showReview.value = true
}

// ---------- 删除自己的评论 ----------
function deleteReview(id) {
  pendingDeleteId.value = id
  showDeleteConfirm.value = true
}

function confirmDelete() {
  if (pendingDeleteId.value) {
    userReviews.value = userReviews.value.filter(r => r.id !== pendingDeleteId.value)
    saveLS('cx-rev', userReviews.value)
    showToast('🗑 评论已删除')
  }
  showDeleteConfirm.value = false
  pendingDeleteId.value = null
}

function cancelDelete() {
  showDeleteConfirm.value = false
  pendingDeleteId.value = null
}

// ---------- 关闭弹窗（重置编辑状态） ----------
function closeReviewModal() {
  showReview.value = false
  editingReviewId.value = null
  reviewText.value = ''
  rating.value = 4
  anon.value = true
}

// ---------- Toast 提示 ----------
function showToast(msg) {
  toastMessage.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 2000)
}

// ==========================================================
// 切换学校时重置评论草稿 & 聊天记录
// （keep-alive 缓存了组件，路由参数变化不会重建实例）
// ==========================================================
watch(() => route.params.slug, () => {
  showReview.value = false
  editingReviewId.value = null
  reviewText.value = ''
  rating.value = 4
  anon.value = true
  msgs.value = []
  aq.value = ''
  rs.value = 'helpful'
})
</script>

<style scoped>
/* ====== DETAIL ====== */
.detail-page {
  padding-bottom: 80px;
}

.cover {
  position: relative;
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-emoji {
  font-size: 64px;
  opacity: .4;
}

.cover-back {
  position: absolute;
  top: 16px;
  left: 16px;
}

.cover-back span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, .85);
  backdrop-filter: blur(8px);
  border-radius: 50%;
  font-size: 16px;
  color: var(--text);
}

.cover-acts {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
}

.cover-acts button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, .85);
  backdrop-filter: blur(8px);
  border-radius: 50%;
  font-size: 16px;
  color: var(--text2);
}

.cover-acts button.on {
  color: var(--accent2);
}

.d-name {
  font-family: var(--font-heading);
  font-size: 30px;
  font-weight: 800;
  line-height: 1.2;
}

.d-meta {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  font-size: 12px;
}

.d-type {
  background: var(--text);
  color: var(--bg);
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-weight: 600;
}

.d-city {
  background: var(--surface2);
  color: var(--text2);
  padding: 3px 10px;
  border-radius: var(--radius-full);
}

.d-profile {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding: 16px;
  background: rgba(122, 157, 126, .08);
  border-radius: 8px;
  border-left: 3px solid var(--accent3);
}

.pf-icon {
  font-size: 20px;
  color: var(--accent3);
  flex-shrink: 0;
}

.d-profile p {
  font-size: 14px;
  color: var(--text);
  line-height: 1.6;
}

/* Scores */
.score-row {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  padding: 16px 20px;
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--bdr);
  box-shadow: var(--shadow);
  min-width: 80px;
  position: relative;
}

.s-svg {
  width: 56px;
  height: 56px;
}

.s-val {
  position: absolute;
  top: 38px;
  font-size: 14px;
  font-weight: 700;
}

.s-label {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text2);
}

/* Dormitory */
.dorm-card {
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--bdr);
  box-shadow: var(--shadow);
  padding: 20px;
}

.dorm-icons {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.di {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--text2);
}

.di-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 16px;
  font-weight: 700;
}

.di-icon.yes {
  background: rgba(122, 157, 126, .08);
  color: var(--accent3);
}

.di-icon.no {
  background: rgba(212, 117, 107, .08);
  color: var(--warn);
}

.dorm-detail {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-top: 1px solid var(--bdr);
}

.dd-l {
  font-size: 14px;
  color: var(--text2);
}

.dd-v {
  font-size: 14px;
  color: var(--text);
  font-weight: 500;
}

.dorm-note {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding: 12px 16px;
  background: rgba(201, 169, 110, .1);
  border-radius: 6px;
  font-size: 12px;
  color: var(--accent2);
  line-height: 1.5;
}

.dorm-note span {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent2);
  color: #fff;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.dorm-conf {
  margin-top: 12px;
  font-size: 12px;
  color: var(--text3);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Tags */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 6px 14px;
  background: #fff;
  border: 1px solid var(--bdr);
  border-radius: var(--radius-full);
  font-size: 12px;
  color: var(--text2);
}

.tag:hover {
  color: var(--text);
  border-color: var(--text3);
  background: var(--surface2);
}

/* Sort */
.sort-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.sort-row button {
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
  color: var(--text2);
  background: var(--surface2);
}

.sort-row button.on {
  background: var(--text);
  color: var(--bg);
}

/* Write Review */
.write-btn {
  width: 100%;
  padding: 12px;
  margin-top: 16px;
  background: #fff;
  border: 2px dashed var(--bdr);
  border-radius: 8px;
  font-size: 14px;
  color: var(--accent2);
  cursor: pointer;
}

.write-btn:hover {
  border-color: var(--accent2);
  background: rgba(193, 127, 89, .05);
}

/* AI Card */
.ai-card {
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--bdr);
  box-shadow: var(--shadow);
  padding: 20px;
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.ai-avatar {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface2);
  border-radius: 50%;
  font-size: 24px;
}

.ai-name {
  display: block;
  font-size: 15px;
  font-weight: 600;
}

.ai-on {
  font-size: 12px;
  color: var(--accent3);
}

.ai-greet {
  font-size: 14px;
  color: var(--text2);
  margin-bottom: 16px;
}

.ai-quick {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.ai-quick button {
  padding: 6px 12px;
  background: var(--surface2);
  border-radius: var(--radius-full);
  font-size: 12px;
  color: var(--text2);
  transition: all .15s;
}

.ai-quick button:hover {
  color: var(--accent2);
  background: rgba(193, 127, 89, .08);
}

.ai-chat {
  margin-bottom: 16px;
}

.chat-msg {
  margin-bottom: 8px;
}

.chat-bubble {
  display: inline-block;
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.6;
}

.chat-msg.user {
  text-align: right;
}

.chat-msg.user .chat-bubble {
  background: var(--text);
  color: var(--bg);
  border-bottom-right-radius: 4px;
}

.chat-msg.bot .chat-bubble {
  background: var(--surface2);
  color: var(--text);
  border-bottom-left-radius: 4px;
}

.ai-input {
  display: flex;
  gap: 8px;
}

.ai-input input {
  flex: 1;
  padding: 10px 14px;
  background: var(--surface2);
  border-radius: var(--radius-full);
  font-size: 14px;
}

.ai-input button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--text);
  color: var(--bg);
  border-radius: 50%;
  font-size: 16px;
  flex-shrink: 0;
}

.ai-input button:disabled {
  opacity: .4;
}

.ai-note {
  text-align: center;
  margin-top: 12px;
  font-size: 10px;
  color: var(--text3);
}

/* ====== 评论编辑/删除按钮 ====== */
.rv-head-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.rv-own-acts {
  display: flex;
  gap: 2px;
}

.rv-own-acts button {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: var(--text3);
  transition: all .15s;
}

.rv-edit:hover {
  color: var(--accent2);
  background: rgba(184, 115, 81, .08);
}

.rv-del:hover {
  color: var(--warn);
  background: rgba(196, 112, 98, .08);
}

/* ====== Toast 提示 ====== */
.review-toast {
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 400;
  padding: 10px 24px;
  background: var(--text);
  color: var(--bg);
  font-size: 14px;
  font-weight: 500;
  border-radius: var(--radius-full);
  box-shadow: 0 4px 20px rgba(0, 0, 0, .15);
  white-space: nowrap;
  pointer-events: none;
}

.toast-enter-active,
.toast-leave-active {
  transition: all .25s var(--ease);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

/* ====== 删除确认弹窗 ====== */
.confirm-modal {
  text-align: center;
  max-width: 320px;
  margin: auto;
  border-radius: 20px 20px 0 0;
}

.confirm-modal h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.confirm-desc {
  font-size: 14px;
  color: var(--text3);
  margin-bottom: 24px;
}

.confirm-acts {
  display: flex;
  gap: 12px;
}

.confirm-acts button {
  flex: 1;
  padding: 12px 0;
  border-radius: var(--radius-full);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s;
}

.confirm-cancel {
  background: var(--surface2);
  color: var(--text2);
}

.confirm-cancel:active {
  background: var(--bdr);
}

.confirm-danger {
  background: var(--warn);
  color: #fff;
}

.confirm-danger:active {
  background: #b05e54;
}
</style>
