// ============================================================
// 用户个性化数据 (Pinia Store)
// - 生源省份
// - 选科信息（自由多选）
// - 高考/模考成绩记录
//
// 存储键：cx-user-profile
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const PROFILE_KEY = 'cx-user-profile'

// 全国 31 省市
export const PROVINCES = [
  '北京', '上海', '天津', '重庆',
  '河北', '山西', '辽宁', '吉林', '黑龙江',
  '江苏', '浙江', '安徽', '福建', '江西', '山东',
  '河南', '湖北', '湖南', '广东', '广西', '海南',
  '四川', '贵州', '云南', '西藏',
  '陕西', '甘肃', '青海', '宁夏', '新疆',
  '内蒙古'
]

// 选科选项
export const SUBJECT_OPTIONS = [
  { key: 'physics', label: '物理' },
  { key: 'chemistry', label: '化学' },
  { key: 'biology', label: '生物' },
  { key: 'history', label: '历史' },
  { key: 'politics', label: '政治' },
  { key: 'geography', label: '地理' }
]

// 考试类型
export const EXAM_TYPES = ['一模', '二模', '三模', '高考', '联考', '其他']

const DEFAULT_PROFILE = {
  province: '',
  subjects: []   // ['physics', 'chemistry', ...]
}

export const useUserDataStore = defineStore('userData', () => {
  // ==========================================================
  // 加载
  // ==========================================================
  const profile = ref(loadProfile())
  const scores = ref(loadScores())

  // ==========================================================
  // 计算属性
  // ==========================================================
  const hasProfile = computed(() => !!(profile.value.province || profile.value.subjects.length))

  // ==========================================================
  // 生源省份
  // ==========================================================
  function setProvince(p) {
    profile.value.province = p
    saveProfile(profile.value)
  }

  // ==========================================================
  // 选科（自由多选，toggle）
  // ==========================================================
  function toggleSubject(key) {
    const i = profile.value.subjects.indexOf(key)
    if (i > -1) {
      profile.value.subjects.splice(i, 1)
    } else {
      profile.value.subjects.push(key)
    }
    saveProfile(profile.value)
  }

  function getSubjectLabel(key) {
    const opt = SUBJECT_OPTIONS.find(s => s.key === key)
    return opt ? opt.label : key
  }

  // ==========================================================
  // 成绩记录
  // ==========================================================
  function addScore(record) {
    scores.value.push({
      id: Date.now(),
      ...record
    })
    saveScores(scores.value)
  }

  function updateScore(id, record) {
    const i = scores.value.findIndex(s => s.id === id)
    if (i > -1) {
      scores.value[i] = { ...scores.value[i], ...record }
      saveScores(scores.value)
    }
  }

  function deleteScore(id) {
    scores.value = scores.value.filter(s => s.id !== id)
    saveScores(scores.value)
  }

  // ==========================================================
  // 持久化
  // ==========================================================
  function loadProfile() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY)
      return raw ? JSON.parse(raw) : { ...DEFAULT_PROFILE }
    } catch {
      return { ...DEFAULT_PROFILE }
    }
  }

  function saveProfile(p) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
  }

  function loadScores() {
    try {
      const raw = localStorage.getItem('cx-user-scores')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  function saveScores(arr) {
    localStorage.setItem('cx-user-scores', JSON.stringify(arr))
  }

  return {
    profile,
    scores,
    hasProfile,
    setProvince,
    toggleSubject,
    getSubjectLabel,
    addScore,
    updateScore,
    deleteScore
  }
})
