<template>
  <div class="page">
    <div class="pg-head">
      <!-- <button class="back" @click="$router.back()">← 返回</button> -->
      <h1>AI 志愿匹配</h1>
    </div>

    <!-- Steps -->
    <div class="steps-row">
      <div class="step" :class="{ on: step >= 1, done: step > 1 }">
        <span class="st-num"><PhCheck :size="16" v-if="step > 1" /><template v-else>1</template></span>分数
      </div>
      <span class="st-line" :class="{ on: step > 1 }"></span>
      <div class="step" :class="{ on: step >= 2, done: step > 2 }">
        <span class="st-num"><PhCheck :size="16" v-if="step > 2" /><template v-else>2</template></span>偏好
      </div>
      <span class="st-line" :class="{ on: step > 2 }"></span>
      <div class="step" :class="{ on: step >= 3 }">
        <span class="st-num">3</span>结果
      </div>
    </div>

    <!-- Step 1: Score + Province -->
    <div v-if="step === 1" class="form-card">
      <label class="fl">你的高考分数</label>
      <input
        v-model.number="score"
        type="number"
        class="fi"
        placeholder="输入分数"
        min="0"
        max="750"
      >
      <label class="fl" style="margin-top:20px">所在省份</label>
      <div class="prov-grid">
        <button
          v-for="p in provs"
          :key="p"
          :class="{ on: province === p }"
          @click="province = p"
        >
          {{ p }}
        </button>
      </div>
      <button class="fs" :disabled="!score || !province" @click="step = 2">
        下一步 <PhArrowRight :size="16" />
      </button>
    </div>

    <!-- Step 2: Preferences -->
    <div v-if="step === 2" class="form-card">
      <label class="fl">意向城市</label>
      <div class="city-pick">
        <button
          v-for="c in hotCities"
          :key="c"
          :class="{ on: cities.includes(c) }"
          @click="toggleCity(c)"
        >
          {{ c }}
        </button>
      </div>
      <label class="fl" style="margin-top:20px">偏好</label>
      <div class="pref-list">
        <button
          v-for="p in prefs"
          :key="p.v"
          :class="{ on: priority === p.v }"
          @click="priority = p.v"
        >
          <span><component :is="p.icon" :size="18" /></span>
          <span>{{ p.l }}</span>
          <span class="pref-desc">{{ p.d }}</span>
        </button>
      </div>
      <div class="form-acts">
        <button class="fb" @click="step = 1"><PhArrowLeft :size="16" /> 上一步</button>
        <button class="fs" style="flex:1;margin:0" @click="runMatch">开始匹配</button>
      </div>
    </div>

    <!-- Step 3: Results -->
    <div v-if="step === 3">
      <p class="ms">基于你的分数（{{ score }}分 / {{ province }}），匹配结果：</p>
      <template v-for="tier in ['冲刺', '稳妥', '保底']" :key="tier">
        <div class="mt" v-if="results.filter(r => r.tier === tier).length">
          <span class="td" :class="'td-' + tier"></span>{{ tier }}
          <span class="to">
            {{
              tier === '冲刺' ? '录取概率 20-40%' :
              tier === '稳妥' ? '录取概率 50-80%' :
              '录取概率 85%+'
            }}
          </span>
        </div>
        <div
          class="m-card"
          v-for="r in results.filter(x => x.tier === tier)"
          :key="r.slug"
          @click="$router.push('/school/' + r.slug)"
        >
          <span class="mc-emoji">{{ r._emoji }}</span>
          <div class="mc-body">
            <h3>{{ r.name }}</h3>
            <p>{{ r.city }} · {{ r.type }}</p>
            <p class="mc-line">参考线 {{ r.line }} 分 · 线差 {{ r.diff > 0 ? '+' : '' }}{{ r.diff }}</p>
            <p class="mc-reason">{{ r.reason }}</p>
          </div>
          <span class="mc-tier" :class="'mc-' + tier">{{ tier }}</span>
        </div>
      </template>
      <div class="form-acts" style="justify-content:center">
        <button class="fb" @click="step = 1">重新匹配</button>
        <button class="fs" v-if="results.length >= 2" @click="goCompare">
          对比这些学校 <PhArrowRight :size="16" />
        </button>
      </div>
      <p class="md">匹配结果基于模拟数据，仅供参考。填报志愿请以各省教育考试院官方信息为准。</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { SCHOOLS } from '../data/schools.js'
import { loadLS, saveLS } from '../utils/storage.js'
import { PROVINCES } from '../stores/userData.js'
import { matchSchools } from '../utils/matchAlgorithm.js'
import { PhCheck, PhArrowRight, PhArrowLeft, PhDiamond, PhHouse, PhDot, PhStar } from '@phosphor-icons/vue'

const router = useRouter()

const step = ref(1)
const score = ref(null)
const province = ref('')
const cities = ref([])
const priority = ref('comprehensive')
const results = ref([])
const compareList = ref(loadLS('cx-cmp', []))

const provs = PROVINCES
const hotCities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安']
const prefs = [
  { v: 'comprehensive', icon: PhDiamond, l: '综合推荐', d: '平衡各项指标' },
  { v: 'dormitory', icon: PhHouse, l: '宿舍优先', d: '宿舍条件最好' },
  { v: 'city', icon: PhDot, l: '城市优先', d: '一线/新一线' },
  { v: 'prestige', icon: PhStar, l: '名校优先', d: '985/211为主' }
]

function toggleCity(c) {
  const i = cities.value.indexOf(c)
  if (i > -1) cities.value.splice(i, 1)
  else cities.value.push(c)
}

function runMatch() {
  results.value = matchSchools(SCHOOLS, {
    score: score.value,
    province: province.value,
    cities: cities.value,
    priority: priority.value
  })
  step.value = 3
}

function goCompare() {
  results.value.slice(0, 4).forEach(r => {
    if (!compareList.value.includes(r.slug)) {
      compareList.value.push(r.slug)
    }
  })
  saveLS('cx-cmp', compareList.value)
  router.replace('/compare')
}
</script>

<style scoped>
/* ====== MATCH ====== */
.steps-row {
  display: flex;
  align-items: center;
  padding: 0 20px 24px;
  gap: 0;
}

.step {
  display: flex;
  align-items: center;
  gap: 8px;
}

.st-num {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  background: var(--surface2);
  color: var(--text2);
}

.step.on .st-num {
  background: var(--text);
  color: var(--bg);
}

.step.done .st-num {
  background: var(--accent3);
  color: #fff;
}

.st-line {
  flex: 1;
  height: 2px;
  background: var(--surface2);
  margin: 0 8px;
}

.st-line.on {
  background: var(--text);
}

.form-card {
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--bdr);
  padding: 24px 20px;
  margin: 0 20px;
  box-shadow: var(--shadow);
}

.fl {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 12px;
}

.fi {
  width: 100%;
  padding: 14px;
  background: var(--surface2);
  border-radius: 8px;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
}

.prov-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.prov-grid button {
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  color: var(--text2);
  background: var(--surface2);
}

.prov-grid button.on {
  background: var(--text);
  color: #fff;
}

.fs {
  width: 100%;
  margin-top: 24px;
  padding: 14px;
  background: var(--text);
  color: var(--bg);
  border-radius: var(--radius-full);
  font-size: 16px;
  font-weight: 600;
}

.fs:disabled {
  opacity: .3;
}

.city-pick {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.city-pick button {
  padding: 8px 14px;
  border-radius: var(--radius-full);
  font-size: 14px;
  color: var(--text2);
  background: var(--surface2);
}

.city-pick button.on {
  background: var(--text);
  color: #fff;
}

.pref-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pref-list button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px;
  border-radius: 8px;
  border: 1px solid var(--bdr);
  text-align: left;
}

.pref-list button.on {
  border-color: var(--text);
  background: var(--surface2);
}

.pref-list button span:first-child {
  font-size: 18px;
}

.pref-list button span:nth-child(2) {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.pref-desc {
  font-size: 12px;
  color: var(--text2);
  margin-left: auto;
}

.form-acts {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}

.fb {
  padding: 14px 24px;
  font-size: 14px;
  color: var(--text2);
}

.ms {
  font-size: 14px;
  color: var(--text2);
  padding: 0 20px;
  margin-bottom: 20px;
  line-height: 1.6;
}

.mt {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  margin: 20px 0 12px;
  font-size: 14px;
  font-weight: 600;
}

.td {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.td-冲刺 { background: var(--accent2); }
.td-稳妥 { background: var(--accent3); }
.td-保底 { background: var(--info); }

.to {
  margin-left: auto;
  font-size: 12px;
  color: var(--text3);
  font-weight: 400;
}

.m-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: #fff;
  border-bottom: 1px solid var(--bdr);
  cursor: pointer;
}

.m-card:active {
  transform: scale(.98);
}

.mc-emoji {
  font-size: 20px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface2);
  border-radius: 8px;
  flex-shrink: 0;
}

.mc-body {
  flex: 1;
  min-width: 0;
}

.mc-body h3 {
  font-size: 14px;
  font-weight: 600;
}

.mc-body p {
  font-size: 12px;
  color: var(--text2);
}

.mc-reason {
  font-size: 12px;
  color: var(--text3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mc-line {
  font-size: 11px;
  color: var(--accent2);
  font-weight: 500;
}

.mc-tier {
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}

.mc-冲刺 { background: rgba(201, 169, 110, .1); color: var(--accent2); }
.mc-稳妥 { background: rgba(122, 157, 126, .08); color: var(--accent3); }
.mc-保底 { background: rgba(107, 141, 191, .1); color: var(--info); }

.md {
  text-align: center;
  margin-top: 24px;
  font-size: 10px;
  color: var(--text3);
  line-height: 1.5;
  padding: 0 20px;
}
</style>
