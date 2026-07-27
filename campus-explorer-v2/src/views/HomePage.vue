<template>
  <div class="page">
    <!-- ============================================================
         顶部搜索框
         ============================================================ -->
    <div class="top-bar">
      <div class="search-box" @click="$router.push('/search')">
        <span class="s-icon"><PhMagnifyingGlass :size="18" /></span>
        <span class="s-placeholder">搜索大学名称、城市...</span>
        <span class="s-arrow"><PhArrowRight :size="18" /></span>
      </div>
    </div>

    <!-- ============================================================
         热门学校轮播
         ============================================================ -->
    <section class="carousel-sec">
      <div class="sec-head">
        <h2>热门推荐</h2>
      </div>
      <div class="carousel">
        <div
          class="carousel-card"
          v-for="s in featuredSchools"
          :key="s.slug"
          @click="$router.push('/school/' + s.slug)"
          :style="{ background: s._bg }"
        >
          <span class="cc-type">{{ s.type }}</span>
          <span class="cc-emoji">{{ s._emoji }}</span>
          <div class="cc-info">
            <h3>{{ s.name }}</h3>
            <p>{{ s.city }} · <PhStar :size="11" weight="fill" /> {{ s.scores.综合.toFixed(1) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================
         热门学校
         ============================================================ -->
    <section class="sec">
      <div class="sec-head">
        <h2>热门学校</h2>
        <span class="sec-more" @click="$router.push('/search')">全部 <PhArrowRight :size="14" /></span>
      </div>
      <div class="type-strip">
        <button
          v-for="t in types"
          :key="t.v"
          class="type-chip"
          :class="{ on: activeType === t.v }"
          @click="activeType = activeType === t.v ? '' : t.v"
        >{{ t.l }}</button>
      </div>
      <div class="card-grid">
        <div class="card" v-for="s in displaySchools" :key="s.slug" @click="$router.push('/school/' + s.slug)">
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
      </div>
    </section>

    <!-- ============================================================
         高考热点资讯
         ============================================================ -->
    <section class="sec news-sec">
      <div class="sec-head">
        <h2>高考热点</h2>
        <span class="sec-more">更多 <PhArrowRight :size="14" /></span>
      </div>
      <div class="news-list">
        <div class="news-card" v-for="n in newsItems" :key="n.id">
          <div class="news-body">
            <h3 class="news-title">{{ n.title }}</h3>
            <p class="news-desc">{{ n.desc }}</p>
            <div class="news-meta">
              <span class="news-source">{{ n.source }}</span>
              <span class="news-date">{{ n.date }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================
         CTA
         ============================================================ -->
    <section class="sec cta-sec">
      <div class="cta-card" @click="$router.push('/match')">
        <span class="cta-icon"><PhSparkle :size="32" /></span>
        <h2>AI 志愿匹配</h2>
        <p>输入分数，AI帮你找冲、稳、保三档大学</p>
        <span class="cta-btn">开始匹配 <PhArrowRight :size="16" /></span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { SCHOOLS } from '../data/schools.js'
import { useAdminDataStore } from '../stores/adminData.js'
import { PhMagnifyingGlass, PhArrowRight, PhStar, PhSparkle } from '@phosphor-icons/vue'

const adminData = useAdminDataStore()

const activeType = ref('')
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

// 轮播：使用管理员配置的顺序
const featuredSchools = computed(() =>
  adminData.carousel.map(slug => SCHOOLS.find(s => s.slug === slug)).filter(Boolean)
)

// 高考热点资讯：使用管理员编辑的数据
const newsItems = computed(() => adminData.news)
</script>

<style scoped>
/* ====== 顶部搜索 ====== */
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

/* ====== 轮播 ====== */
.carousel-sec { padding: 8px 0 8px; }
.carousel-sec .sec-head { padding: 0 16px; margin-bottom: 12px; }

.carousel {
  display: flex;
  gap: 12px;
  padding: 0 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  scrollbar-width: none;
}
.carousel::-webkit-scrollbar { display: none; }

.carousel-card {
  min-width: 200px;
  height: 120px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 14px 16px;
  cursor: pointer;
  scroll-snap-align: start;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  transition: all .2s;
}
.carousel-card:active { transform: scale(.97); }

.cc-type {
  align-self: flex-start;
  padding: 2px 8px;
  background: rgba(255,255,255,.85);
  color: var(--text);
  font-size: 10px; font-weight: 600;
  border-radius: 4px;
}
.cc-emoji {
  position: absolute;
  right: 10px; bottom: 6px;
  font-size: 48px; opacity: .3;
}
.cc-info { position: relative; z-index: 1; }
.cc-info h3 {
  font-family: var(--font-heading);
  font-size: 16px; font-weight: 700;
  color: var(--text); margin-bottom: 2px;
}
.cc-info p {
  font-size: 12px; color: var(--text2);
  display: flex; align-items: center; gap: 2px;
}

/* ====== TYPE STRIP ====== */
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

/* ====== SECTION / CARDS ====== */
.sec-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; }
.sec-head h2 { font-family: var(--font-heading); font-size: 20px; font-weight: 700; }
.sec-more { font-size: 13px; color: var(--accent2); cursor: pointer; display: flex; align-items: center; gap: 2px; }

.card-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
@media (min-width: 500px) { .card-grid { grid-template-columns: repeat(3, 1fr); } }
.card {
  background: #fff; border-radius: var(--radius-lg);
  border: 1px solid var(--bdr); overflow: hidden;
  cursor: pointer; box-shadow: var(--shadow); transition: all .2s;
}
.card:active { transform: scale(.98); }
.card-img { aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; position: relative; }
.card-emoji { font-size: 40px; opacity: .6; }
.card-type { position: absolute; top: 8px; left: 8px; padding: 2px 8px; background: rgba(26,26,46,.75); color: #fff; font-size: 10px; font-weight: 600; border-radius: 4px; }
.card-body { padding: 10px 14px 14px; }
.card-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
.card-head h3 { font-family: var(--font-heading); font-size: 15px; font-weight: 600; line-height: 1.3; flex: 1; min-width: 0; }
.card-score { display: flex; align-items: center; gap: 2px; font-size: 13px; font-weight: 600; color: var(--accent2); flex-shrink: 0; }
.card-loc { font-size: 12px; color: var(--text2); }
.card-profile { font-size: 12px; color: var(--text2); line-height: 1.5; margin-top: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* ====== 高考资讯 ====== */
.news-list { display: flex; flex-direction: column; gap: 10px; }
.news-card {
  background: #fff;
  border: 1px solid var(--bdr);
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: var(--shadow);
}
.news-title {
  font-family: var(--font-heading);
  font-size: 15px; font-weight: 600;
  color: var(--text); line-height: 1.4; margin-bottom: 6px;
}
.news-desc {
  font-size: 13px; color: var(--text2); line-height: 1.6;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.news-meta { display: flex; gap: 12px; margin-top: 10px; }
.news-source { font-size: 11px; color: var(--accent2); background: rgba(184,115,81,.08); padding: 2px 8px; border-radius: 4px; }
.news-date { font-size: 11px; color: var(--text3); }

/* ====== CTA ====== */
.cta-sec { padding: 32px 16px; }
.cta-card {
  background: var(--text); border-radius: 24px;
  padding: 32px 24px; text-align: center;
  cursor: pointer; transition: all .2s;
}
.cta-card:active { transform: scale(.98); }
.cta-icon { display: block; margin-bottom: 16px; color: var(--accent2); }
.cta-card h2 { font-family: var(--font-heading); font-size: 24px; font-weight: 700; color: var(--bg); margin-bottom: 8px; }
.cta-card p { font-size: 14px; color: rgba(254,250,246,.6); margin-bottom: 20px; }
.cta-btn { display: inline-flex; align-items: center; gap: 4px; padding: 12px 28px; background: var(--bg); color: var(--text); font-weight: 600; font-size: 15px; border-radius: var(--radius-full); }
</style>
