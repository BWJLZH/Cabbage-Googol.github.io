<template>
  <div class="page">
    <div class="pg-head">
      <h1>评价社区</h1>
      <span class="total" v-if="all.length">{{ all.length }}条</span>
    </div>
    <div class="filter-row">
      <button :class="{ on: af === 'all' }" @click="af = 'all'">全部</button>
      <button
        v-for="d in dims"
        :key="d"
        :class="{ on: af === d }"
        @click="af = d"
      >
        {{ d }}
      </button>
    </div>
    <div class="sec" v-if="filtered.length">
      <div
        class="review-card"
        v-for="r in filtered"
        :key="r.id"
        @click="$router.push('/school/' + r.school_slug)"
      >
        <div class="rv-head">
          <div class="rv-author">
            <span class="rv-avatar">{{ (r.school_name || '?')[0] }}</span>
            <div>
              <span class="rv-name">{{ r.school_name || r.school_slug }}</span>
              <span class="rv-src">{{ r.author }} · {{ r.created_at }}</span>
            </div>
          </div>
          <span class="rv-star"><PhStar :size="14" weight="fill" /> {{ r.rating?.综合 || '-' }}</span>
        </div>
        <p class="rv-content">{{ r.content }}</p>
        <div class="rv-foot">
          <span class="r-src-tag">{{ r.source }}</span>
          <button @click.stop="r.helpful = (r.helpful || 0) + 1">
            <PhCaretUp :size="14" /> 有用({{ r.helpful || 0 }})
          </button>
        </div>
      </div>
    </div>
    <div v-else class="empty" style="padding:80px 0">
      <span class="empty-icon"><PhUsersThree :size="40" /></span>
      <p>还没有评价</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { SCHOOLS } from '../data/schools.js'
import { loadLS } from '../utils/storage.js'
import { PhStar, PhCaretUp, PhUsersThree } from '@phosphor-icons/vue'

const af = ref('all')
const dims = ['宿舍', '食堂', '教学', '环境', '社交']
const userReviews = ref(loadLS('cx-rev', []))

const all = computed(() => {
  const revs = []
  SCHOOLS.forEach(s => {
    s.reviews.forEach(r => revs.push({ ...r, school_slug: s.slug, school_name: s.name }))
  })
  userReviews.value.forEach(r => revs.unshift({ ...r, id: r.id || 'ur_' + Date.now() }))
  return revs.sort((a, b) => (b.helpful || 0) - (a.helpful || 0))
})

const filtered = computed(() => {
  if (af.value === 'all') return all.value.slice(0, 20)
  return all.value.filter(r => {
    const rt = r.rating || {}
    const entries = Object.entries(rt).filter(([k]) => k !== '综合')
    if (!entries.length) return false
    entries.sort((a, b) => b[1] - a[1])
    return entries[0][0] === af.value
  }).slice(0, 20)
})
</script>

<style scoped>
/* ====== COMMUNITY ====== */
.total {
  font-size: 12px;
  color: var(--text3);
  margin-left: auto;
}
</style>
