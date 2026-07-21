<template>
  <div class="page detail-page" v-if="s">
    <!-- Cover -->
    <div class="cover" :style="{ background: s._bg }">
      <span class="cover-emoji">{{ s._emoji }}</span>
      <button class="cover-back" @click="$router.back()">
        <span>←</span>
      </button>
      <div class="cover-acts">
        <button :class="{ on: isFav }" @click="toggleFav">
          {{ isFav ? '★' : '☆' }}
        </button>
        <button @click="shareIt">↗</button>
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
        <span class="pf-icon">✦</span>
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
              {{ it.v ? '✓' : '✗' }}
            </span>
            <span>{{ it.l }}</span>
          </div>
        </div>
        <div class="dorm-detail" v-for="it in dormDetail" :key="it.l">
          <span class="dd-l">{{ it.l }}</span>
          <span class="dd-v">{{ it.v }}</span>
        </div>
        <div class="dorm-note" v-if="s.dormitory.note">
          <span>!</span>{{ s.dormitory.note }}
        </div>
        <p class="dorm-conf">✓ {{ s.dormitory.confirmed_by }} 位学长确认</p>
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
          <span class="rv-star">★ {{ r.rating.综合 }}</span>
        </div>
        <p class="rv-content">{{ r.content }}</p>
        <div class="rv-foot">
          <span>{{ r.created_at }}</span>
          <button @click="r.helpful++">▲ 有用({{ r.helpful }})</button>
        </div>
      </div>
      <button class="write-btn" @click="showReview = true">✎ 写评价</button>
    </div>

    <!-- AI Q&A -->
    <div class="sec">
      <h3 class="sl">AI 学长问答</h3>
      <div class="ai-card">
        <div class="ai-header">
          <span class="ai-avatar">🎓</span>
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
          <button @click="ask(aq)" :disabled="!aq.trim()">→</button>
        </div>
        <p class="ai-note">内容由AI生成，仅供参考</p>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="bottom-bar">
      <button :class="{ on: isComp }" @click="toggleComp">
        <span>◫</span>{{ isComp ? '已加入' : '对比' }}
      </button>
      <button :class="{ on: isFav }" @click="toggleFav">
        <span>{{ isFav ? '★' : '☆' }}</span>收藏
      </button>
      <button @click="shareIt">
        <span>↗</span>分享
      </button>
      <button class="primary" @click="showReview = true">
        <span>✎</span>写评价
      </button>
    </div>

    <!-- Review Modal -->
    <div class="modal-mask" v-if="showReview" @click.self="showReview = false">
      <div class="modal">
        <h3>写评价</h3>
        <div class="stars-row">
          <span>综合评分</span>
          <span class="stars">{{ '★'.repeat(rating) }}{{ '☆'.repeat(5 - rating) }}</span>
        </div>
        <div class="star-btns">
          <button
            v-for="i in 5"
            :key="i"
            :class="{ on: i <= rating }"
            @click="rating = i"
          >
            ★
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
            <button @click="showReview = false">取消</button>
            <button class="sbm" @click="submitReview" :disabled="reviewText.trim().length < 10">
              发布
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SCHOOLS } from '../data/schools.js'
import { loadLS, saveLS } from '../utils/storage.js'

const route = useRoute()
const router = useRouter()

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
const rating = ref(4)
const reviewText = ref('')
const anon = ref(true)

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
  const r = [...s.value.reviews]
  if (rs.value === 'helpful') r.sort((a, b) => b.helpful - a.helpful)
  else r.sort((a, b) => b.created_at.localeCompare(a.created_at))
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
  if (!reviewText.value.trim() || !s.value) return
  const review = {
    id: 'ur_' + Date.now(),
    school_slug: s.value.slug,
    school_name: s.value.name,
    source: '用户原创',
    content: reviewText.value.trim(),
    rating: { 综合: rating.value },
    author: anon.value ? '匿名用户' : '同学',
    helpful: 0,
    created_at: new Date().toISOString().split('T')[0]
  }
  userReviews.value.unshift(review)
  saveLS('cx-rev', userReviews.value)
  showReview.value = false
  reviewText.value = ''
  rating.value = 4
}
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
</style>
