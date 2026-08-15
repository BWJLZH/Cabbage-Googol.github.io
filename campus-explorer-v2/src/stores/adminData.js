// ============================================================
// 管理员数据管理 (Pinia Store)
//
// 管理首页轮播、热点资讯、学校数据覆盖、校园图片
// 存储键：cx-carousel / cx-news / cx-school-images / cx-school-overrides
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { SCHOOLS } from '../data/schools.js'

const CAROUSEL_KEY = 'cx-carousel'
const NEWS_KEY = 'cx-news'
const IMAGES_KEY = 'cx-school-images'
const OVERRIDES_KEY = 'cx-school-overrides'

// 默认轮播（评分最高6所）
function defaultCarousel() {
  return [...SCHOOLS].sort((a, b) => b.scores.综合 - a.scores.综合).slice(0, 6).map(s => s.slug)
}

// 默认资讯
function defaultNews() {
  return [
    { id: 1, title: '2026年高考全国统考时间确定', desc: '教育部发布通知，2026年全国普通高等学校招生统一考试将于6月7日至8日举行。', source: '教育部', date: '2026-07-20' },
    { id: 2, title: '多所"双一流"高校公布2026年招生章程', desc: '清华、北大、浙大等高校陆续发布2026年本科招生章程，新增人工智能交叉学科专业。', source: '中国教育在线', date: '2026-07-18' },
    { id: 3, title: '新高考选科指南：物理+化学组合覆盖率超90%', desc: '最新统计显示，"物理+化学"组合可报考专业覆盖率最高，但竞争也更加激烈。', source: '阳光高考', date: '2026-07-15' },
    { id: 4, title: '2026年高考志愿填报新变化解读', desc: '今年多地实行"院校专业组"平行志愿模式，考生可填报志愿数量有所增加。', source: '各省教育考试院', date: '2026-07-10' }
  ]
}

export const useAdminDataStore = defineStore('adminData', () => {
  // ==========================================================
  // 状态
  // ==========================================================
  const carousel = ref(loadList(CAROUSEL_KEY, defaultCarousel))
  const news = ref(loadList(NEWS_KEY, defaultNews))
  const schoolImages = ref(loadObj(IMAGES_KEY))
  const schoolOverrides = ref(loadObj(OVERRIDES_KEY))

  // ==========================================================
  // 轮播管理
  // ==========================================================
  function setCarousel(slugs) {
    carousel.value = slugs
    saveList(CAROUSEL_KEY, slugs)
  }

  function addCarousel(slug) {
    if (!carousel.value.includes(slug)) {
      carousel.value.push(slug)
      saveList(CAROUSEL_KEY, carousel.value)
    }
  }

  function removeCarousel(slug) {
    carousel.value = carousel.value.filter(s => s !== slug)
    saveList(CAROUSEL_KEY, carousel.value)
  }

  function moveCarousel(from, to) {
    const item = carousel.value.splice(from, 1)[0]
    carousel.value.splice(to, 0, item)
    saveList(CAROUSEL_KEY, carousel.value)
  }

  // ==========================================================
  // 资讯管理
  // ==========================================================
  function addNews(item) {
    news.value.push({ id: Date.now(), ...item })
    saveList(NEWS_KEY, news.value)
  }

  function updateNews(id, item) {
    const i = news.value.findIndex(n => n.id === id)
    if (i > -1) {
      news.value[i] = { ...news.value[i], ...item }
      saveList(NEWS_KEY, news.value)
    }
  }

  function deleteNews(id) {
    news.value = news.value.filter(n => n.id !== id)
    saveList(NEWS_KEY, news.value)
  }

  // ==========================================================
  // 校园图片相册 — 每校多图，第一张为主图
  // 兼容旧数据：旧格式为单张 base64 字符串，读取时自动归一为数组
  // ==========================================================
  function getSchoolGallery(slug) {
    const v = schoolImages.value[slug]
    if (Array.isArray(v)) return v
    return v ? [v] : []
  }

  // 学校主图：相册第一张；无图返回 null，页面回落 _bg+_emoji 占位
  function getSchoolImage(slug) {
    const g = getSchoolGallery(slug)
    return g[0] || null
  }

  function setSchoolImage(slug, base64) {
    const g = getSchoolGallery(slug)
    g.push(base64)
    schoolImages.value[slug] = g
    saveObj(IMAGES_KEY, schoolImages.value)
  }

  function deleteSchoolImage(slug, index) {
    const g = getSchoolGallery(slug)
    g.splice(index, 1)
    if (g.length) {
      schoolImages.value[slug] = g
    } else {
      delete schoolImages.value[slug]
    }
    saveObj(IMAGES_KEY, schoolImages.value)
  }

  // 将第 index 张设为主图（移到第一位）
  function setMainSchoolImage(slug, index) {
    const g = getSchoolGallery(slug)
    if (index <= 0 || index >= g.length) return
    const [img] = g.splice(index, 1)
    g.unshift(img)
    schoolImages.value[slug] = g
    saveObj(IMAGES_KEY, schoolImages.value)
  }

  // ==========================================================
  // 学校数据覆盖
  // ==========================================================
  function setSchoolOverride(slug, data) {
    schoolOverrides.value[slug] = { ...schoolOverrides.value[slug], ...data }
    saveObj(OVERRIDES_KEY, schoolOverrides.value)
  }

  // 获取合并后的学校数据（原始 + 覆盖）
  function getMergedSchool(slug) {
    const original = SCHOOLS.find(s => s.slug === slug)
    if (!original) return null
    const override = schoolOverrides.value[slug] || {}
    return {
      ...original,
      ...override,
      scores: { ...original.scores, ...(override.scores || {}) },
      dormitory: { ...original.dormitory, ...(override.dormitory || {}) },
      tags: override.tags || original.tags,
      intro: override.intro || original.intro,
      _bg: override._bg || original._bg,
      _emoji: override._emoji || original._emoji
    }
  }

  function getAllMergedSchools() {
    return SCHOOLS.map(s => getMergedSchool(s.slug)).filter(Boolean)
  }

  // ==========================================================
  // 持久化
  // ==========================================================
  function loadList(key, fallbackFn) {
    try {
      const raw = localStorage.getItem(key)
      if (raw) return JSON.parse(raw)
    } catch {}
    return typeof fallbackFn === 'function' ? fallbackFn() : fallbackFn
  }

  function saveList(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr))
  }

  function loadObj(key) {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : {}
    } catch { return {} }
  }

  function saveObj(key, obj) {
    localStorage.setItem(key, JSON.stringify(obj))
  }

  return {
    carousel,
    news,
    schoolImages,
    schoolOverrides,
    setCarousel,
    addCarousel,
    removeCarousel,
    moveCarousel,
    addNews,
    updateNews,
    deleteNews,
    getSchoolGallery,
    setSchoolImage,
    deleteSchoolImage,
    setMainSchoolImage,
    getSchoolImage,
    setSchoolOverride,
    getMergedSchool,
    getAllMergedSchools
  }
})
