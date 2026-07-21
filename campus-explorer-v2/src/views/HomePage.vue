<template>
  <div class="page">
    <section class="hero">
      <h1 class="hero-title">
        <span>找到最适合</span>
        <span class="hero-accent">你的大学</span>
      </h1>
      <p class="hero-desc">像翻阅一本校园年鉴，浏览真实宿舍、食堂口碑、学长评价</p>
      <div class="search-box" @click="$router.push('/search')">
        <span class="s-icon">⊙</span>
        <span class="s-placeholder">搜索大学名称、城市...</span>
        <span class="s-arrow">→</span>
      </div>
      <div class="city-tags">
        <button v-for="c in cities" :key="c" class="city-tag" @click="searchCity(c)">{{ c }}</button>
      </div>
    </section>
    <div class="type-strip">
      <button
        v-for="t in types"
        :key="t.v"
        class="type-chip"
        :class="{ on: activeType === t.v }"
        @click="activeType = activeType === t.v ? '' : t.v"
      >
        {{ t.l }}
      </button>
    </div>
    <section class="sec">
      <div class="sec-head">
        <h2>热门学校</h2>
        <span class="sec-more" @click="$router.push('/search')">全部 →</span>
      </div>
      <div class="card-grid">
        <div
          class="card"
          v-for="s in displaySchools"
          :key="s.slug"
          @click="$router.push('/school/' + s.slug)"
        >
          <div class="card-img" :style="{ background: s._bg }">
            <span class="card-emoji">{{ s._emoji }}</span>
            <span class="card-type">{{ s.type }}</span>
          </div>
          <div class="card-body">
            <div class="card-head">
              <h3>{{ s.name }}</h3>
              <span class="card-score">★ {{ s.scores.综合.toFixed(1) }}</span>
            </div>
            <p class="card-loc">{{ s.city }} · {{ s.province }}</p>
            <p class="card-profile">{{ s.profile }}</p>
          </div>
        </div>
      </div>
    </section>
    <section class="sec cta-sec">
      <div class="cta-card" @click="$router.push('/match')">
        <span class="cta-icon">✦</span>
        <h2>AI 志愿匹配</h2>
        <p>输入分数，AI帮你找冲、稳、保三档大学</p>
        <span class="cta-btn">开始匹配 →</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { SCHOOLS } from '../data/schools.js'

const router = useRouter()
const activeType = ref('')
const cities = ['北京', '上海', '广州', '武汉', '南京', '成都', '杭州', '西安']
const types = [
  { v: '985', l: '985' },
  { v: '211', l: '211' },
  { v: '双一流', l: '双一流' },
  { v: '普通本科', l: '本科' }
]

const displaySchools = computed(() => {
  let list = SCHOOLS
  if (activeType.value) list = list.filter(s => s.type === activeType.value)
  return list.slice(0, 12)
})

function searchCity(c) {
  router.push('/search?q=' + encodeURIComponent(c))
}
</script>

<style scoped>
/* ====== HERO ====== */
.hero {
  padding: 40px 20px 24px;
}

.hero-title {
  font-family: var(--font-heading);
  font-weight: 900;
  line-height: 1.15;
  margin-bottom: 16px;
}

.hero-title span {
  display: block;
  font-size: clamp(32px, 8vw, 44px);
  color: var(--text);
}

.hero-accent {
  color: var(--accent2);
}

.hero-desc {
  font-size: 16px;
  color: var(--text2);
  line-height: 1.7;
  margin-bottom: 20px;
}

.city-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.city-tag {
  padding: 6px 14px;
  background: #fff;
  border: 1px solid var(--bdr);
  border-radius: var(--radius-full);
  font-size: 13px;
  color: var(--text2);
  transition: all .15s;
}

.city-tag:hover {
  color: var(--text);
  border-color: var(--text3);
  background: var(--surface2);
}

.type-strip {
  display: flex;
  gap: 8px;
  padding: 8px 20px;
  border-bottom: 1px solid var(--bdr);
  overflow-x: auto;
}

.type-chip {
  flex-shrink: 0;
  padding: 8px 18px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 500;
  color: var(--text2);
  background: #fff;
  border: 1px solid var(--bdr);
  transition: all .15s;
}

.type-chip.on {
  background: var(--text);
  color: var(--bg);
  border-color: var(--text);
}

.sec-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
}

.sec-head h2 {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
}

.sec-more {
  font-size: 13px;
  color: var(--accent2);
  cursor: pointer;
}

/* ====== CARDS ====== */
.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 500px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.card {
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--bdr);
  overflow: hidden;
  cursor: pointer;
  box-shadow: var(--shadow);
  transition: all .2s;
}

.card:active {
  transform: scale(.98);
}

.card-img {
  aspect-ratio: 4/3;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.card-emoji {
  font-size: 40px;
  opacity: .6;
}

.card-type {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 8px;
  background: rgba(26, 26, 46, .75);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  border-radius: 4px;
}

.card-body {
  padding: 10px 14px 14px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.card-head h3 {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
  flex: 1;
  min-width: 0;
}

.card-score {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent2);
  flex-shrink: 0;
}

.card-loc {
  font-size: 12px;
  color: var(--text2);
}

.card-profile {
  font-size: 12px;
  color: var(--text2);
  line-height: 1.5;
  margin-top: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ====== CTA ====== */
.cta-sec {
  padding: 32px 20px;
}

.cta-card {
  background: var(--text);
  border-radius: 24px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all .2s;
}

.cta-card:active {
  transform: scale(.98);
}

.cta-icon {
  font-size: 32px;
  color: var(--accent2);
  display: block;
  margin-bottom: 16px;
}

.cta-card h2 {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 700;
  color: var(--bg);
  margin-bottom: 8px;
}

.cta-card p {
  font-size: 14px;
  color: rgba(254, 250, 246, .6);
  margin-bottom: 20px;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 12px 28px;
  background: var(--bg);
  color: var(--text);
  font-weight: 600;
  font-size: 15px;
  border-radius: var(--radius-full);
}
</style>
