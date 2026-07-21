<template>
  <div class="page">
    <div class="sr-head">
      <button class="back" @click="$router.push('/')">←</button>
      <div class="search-box" style="flex:1">
        <span class="s-icon">⊙</span>
        <input
          ref="inp"
          v-model="q"
          placeholder="搜索大学名称、城市..."
          class="s-input"
          @input="run"
        >
        <button v-if="q" class="clear" @click="q = ''">✕</button>
      </div>
    </div>
    <div class="filter-row">
      <button
        v-for="f in typeFilters"
        :key="f.v"
        class="f-chip"
        :class="{ on: ft === f.v }"
        @click="ft = ft === f.v ? '' : f.v"
      >
        {{ f.l }}
      </button>
      <span class="f-div"></span>
      <button
        v-for="f in facFilters"
        :key="f.v"
        class="f-chip"
        :class="{ on: ff === f.v }"
        @click="ff = ff === f.v ? '' : f.v"
      >
        {{ f.l }}
      </button>
    </div>
    <div class="sec">
      <p class="sum" v-if="q || ft || ff">
        共 {{ results.length }} 所
        <button class="clr" @click="q = ''; ft = ''; ff = ''">清除</button>
      </p>
      <div class="r-list" v-if="results.length">
        <div
          class="r-card"
          v-for="s in results"
          :key="s.slug"
          @click="$router.push('/school/' + s.slug)"
        >
          <div class="r-img" :style="{ background: s._bg }">
            <span class="r-emoji">{{ s._emoji }}</span>
          </div>
          <div class="r-body">
            <div class="r-head">
              <h3>{{ s.name }}</h3>
              <span class="r-score">★ {{ s.scores.综合.toFixed(1) }}</span>
            </div>
            <div class="r-meta">
              <span class="r-type">{{ s.type }}</span>
              <span class="r-loc">{{ s.city }} · {{ s.province }}</span>
            </div>
            <p class="r-profile">{{ s.profile }}</p>
          </div>
        </div>
      </div>
      <div v-else-if="q || ft || ff" class="empty">
        <span class="empty-icon">⊙</span>
        <p>没有找到匹配的学校</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { SCHOOLS } from '../data/schools.js'

const route = useRoute()
const q = ref('')
const ft = ref('')
const ff = ref('')
const inp = ref(null)
const results = ref([...SCHOOLS].sort((a, b) => b.scores.综合 - a.scores.综合))

const typeFilters = [
  { v: '985', l: '985' },
  { v: '211', l: '211' },
  { v: '双一流', l: '双一流' },
  { v: '普通本科', l: '本科' }
]
const facFilters = [
  { v: '空调宿舍', l: '空调' },
  { v: '独立卫浴', l: '独卫' },
  { v: '上床下桌', l: '上床下桌' }
]

function run() {
  let list = [...SCHOOLS]
  const kw = q.value.trim()
  if (kw) {
    list = list.filter(s =>
      s.name.includes(kw) ||
      s.city.includes(kw) ||
      s.province.includes(kw) ||
      s.type.includes(kw) ||
      s.tags.some(t => t.includes(kw))
    )
  }
  if (ft.value) list = list.filter(s => s.type === ft.value)
  if (ff.value) list = list.filter(s => s.tags.includes(ff.value))
  results.value = list.sort((a, b) => b.scores.综合 - a.scores.综合)
}

watch([q, ft, ff], run)

onMounted(() => {
  // Check for query param from navigation
  if (route.query.q) {
    q.value = route.query.q
  }
  nextTick(() => {
    inp.value?.focus()
  })
})
</script>

<style scoped>
/* ====== SEARCH ====== */
.sr-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  position: sticky;
  top: 0;
  background: rgba(254, 250, 246, .85);
  backdrop-filter: blur(16px);
  z-index: 10;
}

.clear {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--text3);
  border-radius: 50%;
  flex-shrink: 0;
}

.sum {
  font-size: 12px;
  color: var(--text2);
  margin-bottom: 12px;
}

.r-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.r-card {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--bdr);
  box-shadow: var(--shadow);
  margin-bottom: 10px;
  cursor: pointer;
}

.r-card:active {
  transform: scale(.98);
}

.r-img {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.r-emoji {
  font-size: 28px;
  opacity: .5;
}

.r-body {
  flex: 1;
  min-width: 0;
}

.r-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.r-head h3 {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 700;
}

.r-score {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent2);
  flex-shrink: 0;
}

.r-meta {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}

.r-type {
  padding: 1px 6px;
  background: var(--text);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  border-radius: 4px;
}

.r-loc {
  font-size: 12px;
  color: var(--text3);
}

.r-profile {
  font-size: 12px;
  color: var(--text2);
  margin-top: 6px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
