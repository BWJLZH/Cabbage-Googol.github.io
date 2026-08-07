<template>
  <div class="page">
    <!-- ============================================================
         ① 搜索栏 — 页面最顶部，sticky
         ============================================================ -->
    <div class="top-bar">
      <div class="search-box" @click="$router.push('/search')">
        <span class="s-icon"><PhMagnifyingGlass :size="18" /></span>
        <span class="s-placeholder">搜索大学名称、城市...</span>
        <span class="s-arrow"><PhArrowRight :size="18" /></span>
      </div>
    </div>

    <!-- ============================================================
         ② 官方推荐院校 — 横向轮播 Banner，自动播放
            管理员主推院校，一次展示1张卡片
         ============================================================ -->
    <section class="carousel-sec" v-if="featuredSchools.length > 0">
      <div class="sec-head sec-head--carousel">
        <h2>官方推荐院校</h2>
        <div class="carousel-dots" v-if="featuredSchools.length > 1">
          <button
            v-for="(s, i) in featuredSchools"
            :key="s.slug"
            class="carousel-dot"
            :class="{ on: i === currentSlide }"
            @click="goToSlide(i)"
            :aria-label="'第' + (i + 1) + '张'"
          ></button>
        </div>
      </div>

      <div
        class="carousel-scroll"
        ref="carouselRef"
        @touchstart="pauseAuto"
        @touchend="resumeAuto"
        @scroll="onCarouselScroll"
      >
        <div
          class="carousel-card"
          v-for="(s, i) in featuredSchools"
          :key="s.slug"
          @click="$router.push('/school/' + s.slug)"
          :style="{ background: s._bg }"
        >
          <span class="cc-badge">{{ s.type }}</span>
          <span class="cc-emoji">{{ s._emoji }}</span>
          <div class="cc-info">
            <h3>{{ s.name }}</h3>
            <p class="cc-loc">{{ s.city }} · {{ s.province }}</p>
            <p class="cc-score"><PhStar :size="13" weight="fill" /> {{ s.scores.综合.toFixed(1) }}</p>
          </div>
          <p class="cc-desc">{{ s.profile }}</p>
        </div>
      </div>
    </section>

    <!-- ============================================================
         ③ 高频查询院校 — 网格卡片区域
            按综合评分排序，排除轮播已推荐院校
         ============================================================ -->
    <section class="sec grid-sec">
      <div class="sec-head">
        <h2>高频查询院校</h2>
        <span class="sec-more" @click="$router.push('/search')">全部 <PhArrowRight :size="14" /></span>
      </div>

      <!-- 类型筛选 -->
      <div class="type-strip">
        <button
          v-for="t in types"
          :key="t.v"
          class="type-chip"
          :class="{ on: activeType === t.v }"
          @click="activeType = activeType === t.v ? '' : t.v"
        >{{ t.l }}</button>
      </div>

      <!-- 双列网格 — 骨架屏 / 真实卡片 -->
      <div class="card-grid" v-if="gridLoading || gridSchools.length > 0">
        <!-- 加载中：骨架屏占位 -->
        <template v-if="gridLoading">
          <div class="card sk-card" v-for="i in 6" :key="'sk-' + i">
            <div class="card-img sk-img"></div>
            <div class="card-body sk-body">
              <div class="card-head">
                <div class="sk-line sk-name"></div>
                <div class="sk-line sk-score"></div>
              </div>
              <div class="sk-line sk-loc"></div>
              <div class="sk-line sk-desc"></div>
            </div>
          </div>
        </template>
        <!-- 加载完成：真实院校卡片 -->
        <template v-else>
          <div class="card" v-for="s in gridSchools" :key="s.slug" @click="$router.push('/school/' + s.slug)">
            <div class="card-img" :style="{ background: s._bg }">
              <span class="card-emoji">{{ s._emoji }}</span>
              <span class="card-type">{{ s.type }}</span>
            </div>
            <div class="card-body">
              <div class="card-head">
                <h3>{{ s.name }}</h3>
                <span class="card-score"><PhStar :size="13" weight="fill" /> {{ s.scores.综合.toFixed(1) }}</span>
              </div>
              <p class="card-loc">{{ s.city }} · {{ s.province }}</p>
              <p class="card-profile">{{ s.profile }}</p>
            </div>
          </div>
        </template>
      </div>

      <!-- 网格空状态 — 当筛选结果为空 -->
      <div class="empty" v-if="!gridLoading && gridSchools.length === 0">
        <p>没有匹配的院校</p>
      </div>
    </section>

    <!-- ============================================================
         ④ 高考热点 · 招生政策 — 纵向文字滚动播报栏
            仅手动滚动，管理员后台编辑
         ============================================================ -->
    <section class="sec news-ticker-sec">
      <div class="sec-head">
        <h2>高考热点 · 招生政策</h2>
      </div>

      <div class="news-ticker" v-if="newsItems.length > 0">
        <div
          class="news-item"
          v-for="n in newsItems"
          :key="n.id"
          @click="$router.push('/news/' + n.id)"
        >
          <span class="news-dot"></span>
          <div class="news-content">
            <div class="news-head-row">
              <span class="news-title">{{ n.title }}</span>
              <span class="news-chevron"><PhCaretRight :size="14" /></span>
            </div>
            <span class="news-meta">{{ n.source }} · {{ n.date }}</span>
          </div>
        </div>
      </div>

      <div class="empty" v-else>
        <p>暂无资讯</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { SCHOOLS } from '../data/schools.js'
import { useAdminDataStore } from '../stores/adminData.js'
import { PhMagnifyingGlass, PhArrowRight, PhStar, PhCaretRight } from '@phosphor-icons/vue'

const adminData = useAdminDataStore()

// ==========================================================
// 类型筛选
// ==========================================================
const activeType = ref('')
const types = [
  { v: '985', l: '985' },
  { v: '211', l: '211' },
  { v: '双一流', l: '双一流' },
  { v: '普通本科', l: '本科' }
]

// 网格骨架屏加载状态 — 初始 true，数据就绪后 false
const gridLoading = ref(true)

// 类型筛选切换时，短暂显示骨架屏避免"点击无反应"的空白卡顿
watch(activeType, () => {
  gridLoading.value = true
  setTimeout(() => {
    gridLoading.value = false
  }, 200)
})

// ==========================================================
// ② 轮播 — 官方推荐院校（管理员主推）
// ==========================================================
const featuredSchools = computed(() =>
  adminData.carousel.map(slug => SCHOOLS.find(s => s.slug === slug)).filter(Boolean)
)

const carouselRef = ref(null)
const currentSlide = ref(0)
let autoTimer = null
let resumeTimeout = null
const AUTO_INTERVAL = 3500

function scrollToSlide(index) {
  const container = carouselRef.value
  if (!container) return
  const cards = container.querySelectorAll('.carousel-card')
  if (!cards[index]) return

  // offsetLeft 是卡片相对于容器 border-edge 的位置（容器为 position:relative）
  // 第一张卡片的 offsetLeft = 容器 padding-left（即基准偏移量）
  // 目标滚动位置 = 卡片偏移 - 基准偏移 → 卡片吸附到与第一张相同的位置
  const baseOffset = cards[0].offsetLeft
  const targetLeft = cards[index].offsetLeft - baseOffset

  container.scrollTo({ left: targetLeft, behavior: 'smooth' })
  currentSlide.value = index
}

function goToSlide(index) {
  pauseAuto()
  scrollToSlide(index)
  resumeAuto()
}

function nextSlide() {
  if (featuredSchools.value.length <= 1) return
  const next = (currentSlide.value + 1) % featuredSchools.value.length
  scrollToSlide(next)
}

function startAutoPlay() {
  if (featuredSchools.value.length <= 1) return
  stopAutoPlay()
  autoTimer = setInterval(nextSlide, AUTO_INTERVAL)
}

function stopAutoPlay() {
  if (autoTimer) {
    clearInterval(autoTimer)
    autoTimer = null
  }
}

function pauseAuto() {
  stopAutoPlay()
  if (resumeTimeout) clearTimeout(resumeTimeout)
}

function resumeAuto() {
  if (resumeTimeout) clearTimeout(resumeTimeout)
  resumeTimeout = setTimeout(() => {
    // 根据当前滚动位置推断当前卡片
    updateCurrentFromScroll()
    startAutoPlay()
  }, 2000)
}

function onCarouselScroll() {
  // 滚动中实时更新指示点（debounced via passive listener）
  updateCurrentFromScroll()
}

let scrollTick = null
function updateCurrentFromScroll() {
  if (!carouselRef.value || featuredSchools.value.length === 0) return
  if (scrollTick) return
  scrollTick = requestAnimationFrame(() => {
    scrollTick = null
    const container = carouselRef.value
    const cards = container.querySelectorAll('.carousel-card')
    if (cards.length === 0) return
    const scrollLeft = container.scrollLeft
    // offsetLeft 从容器 border-edge 起算，基准偏移 = 第一张卡的 offsetLeft (= padding-left)
    const baseOffset = cards[0].offsetLeft
    let bestIdx = 0
    let bestDist = Infinity
    cards.forEach((card, i) => {
      // 卡片在视口中的位置 = offsetLeft - scrollLeft
      // 与吸附点（baseOffset）的距离越小，越接近当前卡片
      const dist = Math.abs(card.offsetLeft - scrollLeft - baseOffset)
      if (dist < bestDist) {
        bestDist = dist
        bestIdx = i
      }
    })
    if (bestIdx !== currentSlide.value) {
      currentSlide.value = bestIdx
    }
  })
}

// ==========================================================
// ③ 网格 — 高频查询院校（排除轮播项，按评分排序）
// ==========================================================
const gridSchools = computed(() => {
  const carouselSlugs = new Set(adminData.carousel)
  let list = SCHOOLS.filter(s => !carouselSlugs.has(s.slug))
  if (activeType.value) {
    list = list.filter(s => s.type === activeType.value)
  }
  // 按综合评分降序
  return [...list].sort((a, b) => b.scores.综合 - a.scores.综合).slice(0, 12)
})

const newsItems = computed(() => adminData.news)

// ==========================================================
// 生命周期
// ==========================================================
onMounted(() => {
  startAutoPlay()
  // 初始骨架屏：模拟数据加载，400ms 后渲染真实卡片
  setTimeout(() => {
    gridLoading.value = false
  }, 400)
})

onUnmounted(() => {
  stopAutoPlay()
  if (resumeTimeout) clearTimeout(resumeTimeout)
  if (scrollTick) cancelAnimationFrame(scrollTick)
})
</script>

<style scoped>
/* ============================================================
   ① 搜索栏
   ============================================================ */
.top-bar {
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--bg);
  padding: 12px 16px;
}
.search-box {
  display: flex; align-items: center; gap: 8px;
  background: #fff;
  border: 1px solid var(--bdr);
  border-radius: var(--radius-lg);
  padding: 4px 4px 4px 14px;
  box-shadow: var(--shadow);
  cursor: pointer; transition: all .15s;
}
.search-box:active { transform: scale(.98); }
.s-icon { color: var(--text2); flex-shrink: 0; display: flex; }
.s-placeholder { flex: 1; padding: 10px 4px; color: var(--text3); font-size: 15px; }
.s-arrow {
  width: 38px; height: 38px;
  display: flex; align-items: center; justify-content: center;
  background: var(--text); color: var(--bg);
  border-radius: 8px; flex-shrink: 0;
}

/* ============================================================
   ② 官方推荐院校轮播
   ============================================================ */
.carousel-sec {
  padding: 4px 0 0;
}
.sec-head--carousel {
  padding: 0 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sec-head--carousel h2 {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
}

/* 轮播指示点 */
.carousel-dots { display: flex; gap: 6px; align-items: center; }
.carousel-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--bdr);
  border: none; padding: 0;
  cursor: pointer;
  transition: all .2s var(--ease);
}
.carousel-dot.on {
  width: 18px;
  border-radius: 3px;
  background: var(--accent2);
}

/* 滚动容器 */
.carousel-scroll {
  display: flex;
  gap: 12px;
  padding: 0 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-left: 16px;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  scrollbar-width: none;
  position: relative;
}
.carousel-scroll::-webkit-scrollbar { display: none; }

/* 轮播卡片 — 一次展示1张，左侧与搜索栏/网格统一对齐 */
.carousel-card {
  flex: 0 0 100%;
  min-height: 160px;
  border-radius: var(--radius-lg);
  padding: 16px 18px;
  cursor: pointer;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform .2s;
}
.carousel-card:active { transform: scale(.98); }

.cc-badge {
  align-self: flex-start;
  padding: 3px 10px;
  background: rgba(255,255,255,.85);
  color: var(--text);
  font-size: 11px; font-weight: 600;
  border-radius: 4px;
  position: relative; z-index: 1;
}
.cc-emoji {
  position: absolute;
  right: 12px; top: 8px;
  font-size: 56px; opacity: .22;
  line-height: 1;
}
.cc-info {
  position: relative; z-index: 1;
}
.cc-info h3 {
  font-family: var(--font-heading);
  font-size: 20px; font-weight: 700;
  color: var(--text);
  margin-bottom: 2px;
}
.cc-loc {
  font-size: 12px; color: var(--text2);
  margin-bottom: 2px;
}
.cc-score {
  font-size: 13px; font-weight: 600;
  color: var(--accent2);
  display: flex; align-items: center; gap: 3px;
}
.cc-desc {
  position: relative; z-index: 1;
  font-size: 12px; color: var(--text2);
  line-height: 1.5;
  margin-top: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ============================================================
   ③ 高频查询院校网格
   ============================================================ */
.grid-sec { padding: 24px 16px; }

/* 类型筛选条 */
.type-strip {
  display: flex; gap: 8px;
  padding: 0 0 14px;
  overflow-x: auto; white-space: nowrap;
  -webkit-overflow-scrolling: touch; scroll-behavior: smooth;
  scrollbar-width: none;
}
.type-strip::-webkit-scrollbar { display: none; }
.type-chip {
  flex-shrink: 0; padding: 8px 18px;
  border-radius: var(--radius-full);
  font-size: 13px; font-weight: 500;
  color: var(--text2); background: #fff;
  border: 1px solid var(--bdr);
  cursor: pointer; transition: all .15s;
}
.type-chip.on { background: var(--text); color: var(--bg); border-color: var(--text); }

/* 卡片网格 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
@media (min-width: 500px) {
  .card-grid { grid-template-columns: repeat(3, 1fr); }
}
.card {
  background: #fff; border-radius: var(--radius-lg);
  border: 1px solid var(--bdr); overflow: hidden;
  cursor: pointer; box-shadow: var(--shadow); transition: all .2s;
}
.card:active { transform: scale(.98); }
.card-img {
  aspect-ratio: 4/3;
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.card-emoji { font-size: 40px; opacity: .6; }
.card-type {
  position: absolute; top: 8px; left: 8px;
  padding: 2px 8px;
  background: rgba(26,26,46,.75); color: #fff;
  font-size: 10px; font-weight: 600; border-radius: 4px;
}
.card-body { padding: 10px 14px 14px; }
.card-head {
  display: flex; justify-content: space-between;
  align-items: flex-start; gap: 8px;
}
.card-head h3 {
  font-family: var(--font-heading);
  font-size: 15px; font-weight: 600; line-height: 1.3;
  flex: 1; min-width: 0;
}
.card-score {
  display: flex; align-items: center; gap: 2px;
  font-size: 13px; font-weight: 600;
  color: var(--accent2); flex-shrink: 0;
}
.card-loc { font-size: 12px; color: var(--text2); }
.card-profile {
  font-size: 12px; color: var(--text2); line-height: 1.5;
  margin-top: 8px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ---- 骨架屏 ---- */
.sk-card {
  pointer-events: none;
  box-shadow: none;
}
.sk-card:active { transform: none; }

.sk-img {
  background: var(--surface2);
  animation: sk-pulse 1.5s ease-in-out infinite;
}

.sk-body {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sk-line {
  height: 10px;
  background: var(--surface2);
  border-radius: 4px;
  animation: sk-pulse 1.5s ease-in-out infinite;
}

.sk-name  { width: 70%; height: 15px; }
.sk-score { width: 32px; height: 15px; flex-shrink: 0; }
.sk-loc   { width: 45%; }
.sk-desc  { width: 90%; margin-top: 10px; }

/* 骨架屏行交错延迟，产生波浪流动感 */
.sk-line:nth-child(2) { animation-delay: 0.12s; }
.sk-line:nth-child(3) { animation-delay: 0.24s; }

/* 不同卡片之间的交错（模拟真实加载的不均匀感） */
.sk-card:nth-child(odd)  .sk-img,
.sk-card:nth-child(odd)  .sk-line { animation-delay: 0.05s; }
.sk-card:nth-child(even) .sk-img,
.sk-card:nth-child(even) .sk-line { animation-delay: 0.18s; }

@keyframes sk-pulse {
  0%, 100% { opacity: 0.35; }
  50%      { opacity: 0.7; }
}

/* ============================================================
   ④ 高考热点播报栏
   ============================================================ */
.news-ticker-sec {
  padding: 8px 16px 32px;
}

.news-ticker {
  max-height: 360px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  background: #fff;
  border: 1px solid var(--bdr);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.news-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--bdr);
  cursor: pointer;
  transition: background .12s;
}
.news-item:last-child { border-bottom: none; }
.news-item:active { background: var(--surface2); }

.news-dot {
  flex-shrink: 0;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--accent2);
  margin-top: 9px;
  transition: background .2s;
}
.news-content {
  flex: 1;
  min-width: 0;
}

.news-head-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.news-title {
  font-family: var(--font-heading);
  font-size: 14px; font-weight: 600;
  color: var(--text);
  line-height: 1.5;
  flex: 1;
}

.news-chevron {
  flex-shrink: 0;
  color: var(--text3);
  display: flex;
  align-items: center;
  margin-top: 2px;
}

.news-meta {
  display: block;
  font-size: 11px;
  color: var(--text3);
  margin-top: 4px;
}

/* ============================================================
   共享 Section 样式
   ============================================================ */
.sec-head {
  display: flex; justify-content: space-between;
  align-items: baseline; margin-bottom: 16px;
}
.sec-head h2 {
  font-family: var(--font-heading);
  font-size: 20px; font-weight: 700;
}
.sec-more {
  font-size: 13px; color: var(--accent2);
  cursor: pointer;
  display: flex; align-items: center; gap: 2px;
}

/* 空状态 */
.empty {
  text-align: center;
  padding: 32px 16px;
}
.empty p {
  font-size: 14px; color: var(--text3);
}
</style>
