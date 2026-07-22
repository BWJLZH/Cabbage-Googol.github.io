<template>
  <div class="page">
    <div class="pg-head">
      <!-- <button class="back" @click="$router.push('/')">← 返回</button> -->
      <h1>学校对比</h1>
    </div>
    <div class="empty" v-if="!list.length" style="padding:80px 0">
      <span class="empty-icon">◫</span>
      <p>还没有添加对比学校</p>
      <p class="eh">在详情页点击"对比"按钮添加</p>
    </div>
    <div v-else>
      <!-- Headers -->
      <div class="cmp-headers">
        <div class="cmp-label"></div>
        <div class="cmp-col" v-for="s in list" :key="s.slug">
          <button class="rmv" @click="toggleComp(s.slug)">✕</button>
          <span class="cmp-emoji">{{ s._emoji }}</span>
          <h3>{{ s.name }}</h3>
          <span class="cmp-type">{{ s.type }}</span>
        </div>
      </div>

      <!-- Scores -->
      <div class="cmp-sec">
        <div class="cmp-st">综合评分</div>
        <div class="cmp-row" v-for="dim in dims" :key="dim">
          <span class="cmp-lab">{{ dim }}</span>
          <span
            class="cmp-val"
            v-for="s in list"
            :key="s.slug"
            :class="{ hl: isHL(s, dim) }"
          >
            {{ s.scores[dim]?.toFixed(1) || '-' }}
          </span>
        </div>
      </div>

      <!-- Dormitory -->
      <div class="cmp-sec">
        <div class="cmp-st">宿舍条件</div>
        <div class="cmp-row" v-for="it in dormRows" :key="it.k">
          <span class="cmp-lab">{{ it.l }}</span>
          <span
            class="cmp-val"
            v-for="s in list"
            :key="s.slug"
            :class="{ hl: isDormDiff(it.k, s) }"
          >
            <template v-if="typeof s.dormitory[it.k] === 'boolean'">
              <span :class="{ dy: s.dormitory[it.k], dn: !s.dormitory[it.k] }">
                {{ s.dormitory[it.k] ? '✓' : '✗' }}
              </span>
            </template>
            <template v-else>
              {{ s.dormitory[it.k] || '-' }}
            </template>
          </span>
        </div>
      </div>

      <div style="text-align:center;padding:32px">
        <button class="clr-btn" @click="clearCompare">清空对比</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { SCHOOLS } from '../data/schools.js'
import { loadLS, saveLS } from '../utils/storage.js'

const compareList = ref(loadLS('cx-cmp', []))

const dims = ['宿舍', '食堂', '教学', '环境', '社交']
const dormRows = [
  { k: 'has_ac', l: '空调' },
  { k: 'has_private_bath', l: '独卫' },
  { k: 'bed_type', l: '床型' },
  { k: 'room_size', l: '标准间' },
  { k: 'has_balcony', l: '阳台' },
  { k: 'has_water_heater', l: '热水器' },
  { k: 'has_washing_machine', l: '洗衣机' },
  { k: 'internet', l: '网络' },
  { k: 'curfew', l: '门禁' }
]

const list = computed(() =>
  compareList.value.map(sl => SCHOOLS.find(s => s.slug === sl)).filter(Boolean)
)

function isHL(s, dim) {
  if (list.value.length < 2) return false
  const vals = list.value.map(x => x.scores[dim] || 0)
  const mx = Math.max(...vals)
  const mn = Math.min(...vals)
  return mx !== mn && (s.scores[dim] === mx || s.scores[dim] === mn)
}

function isDormDiff(k, s) {
  if (list.value.length < 2) return false
  const vals = list.value.map(x => x.dormitory[k])
  return new Set(vals.map(v => typeof v === 'boolean' ? v.toString() : v)).size > 1
}

function toggleComp(slug) {
  const i = compareList.value.indexOf(slug)
  if (i > -1) compareList.value.splice(i, 1)
  saveLS('cx-cmp', compareList.value)
}

function clearCompare() {
  compareList.value = []
  saveLS('cx-cmp', [])
}
</script>

<style scoped>
/* ====== COMPARE ====== */
.cmp-headers {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
}

.cmp-label {
  width: 60px;
  flex-shrink: 0;
}

.cmp-col {
  flex: 1;
  text-align: center;
  position: relative;
  padding: 16px 8px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid var(--bdr);
}

.rmv {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--text3);
  border-radius: 50%;
}

.rmv:hover {
  background: rgba(212, 117, 107, .08);
  color: var(--warn);
}

.cmp-emoji {
  font-size: 24px;
}

.cmp-col h3 {
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 600;
  margin-top: 4px;
}

.cmp-type {
  font-size: 11px;
  color: var(--text3);
}

.cmp-sec {
  margin-top: 24px;
}

.cmp-st {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .08em;
  color: var(--text2);
  padding: 0 20px 8px;
  border-bottom: 1px solid var(--bdr);
}

.cmp-row {
  display: flex;
  gap: 8px;
  padding: 8px 20px;
  align-items: center;
}

.cmp-lab {
  width: 60px;
  flex-shrink: 0;
  font-size: 14px;
  color: var(--text2);
}

.cmp-val {
  flex: 1;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  padding: 4px 0;
}

.cmp-val.hl {
  background: rgba(122, 157, 126, .08);
  border-radius: 4px;
  color: var(--accent3);
  font-weight: 600;
}

.dy {
  color: var(--accent3);
  font-weight: 700;
}

.dn {
  color: var(--warn);
  font-weight: 700;
}
</style>
