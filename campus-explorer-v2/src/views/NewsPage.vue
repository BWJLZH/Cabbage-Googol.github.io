<template>
  <div class="page">
    <!-- ============================================================
         Header — always visible, back button on the left
         ============================================================ -->
    <div class="pg-head">
      <button class="back" @click="$router.back()">
        <PhArrowLeft :size="18" />
      </button>
      <h1>{{ pageTitle }}</h1>
    </div>

    <!-- ============================================================
         Detail mode — single news item, full content
         ============================================================ -->
    <div class="sec" v-if="detailItem">
      <article class="detail-card">
        <h2 class="detail-title">{{ detailItem.title }}</h2>
        <div class="detail-meta">
          <span class="detail-source">{{ detailItem.source }}</span>
          <span class="detail-date">{{ detailItem.date }}</span>
        </div>
        <div class="detail-body">{{ detailItem.desc }}</div>
      </article>
    </div>

    <!-- ============================================================
         List mode — all news items (when no :id param)
         ============================================================ -->
    <div class="sec" v-else>
      <div class="news-list" v-if="adminStore.news.length">
        <article
          class="news-card"
          v-for="item in adminStore.news"
          :key="item.id"
          @click="$router.push('/news/' + item.id)"
        >
          <h2 class="news-title">{{ item.title }}</h2>
          <div class="news-meta">
            <span class="news-source">{{ item.source }}</span>
            <span class="news-date">{{ item.date }}</span>
          </div>
          <p class="news-desc">{{ item.desc }}</p>
        </article>
      </div>

      <div v-else class="empty" style="padding:80px 0">
        <p>暂无资讯</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { PhArrowLeft } from '@phosphor-icons/vue'
import { useAdminDataStore } from '../stores/adminData.js'

const props = defineProps({
  id: { type: [String, Number], default: null }
})

const route = useRoute()
const adminStore = useAdminDataStore()

// Resolve id from props (preferred) or route.params (keep-alive fallback)
const newsId = computed(() => {
  const raw = props.id ?? route.params.id
  if (raw == null) return null
  return Number(raw)
})

const detailItem = computed(() => {
  if (newsId.value == null) return null
  return adminStore.news.find(n => n.id === newsId.value) || null
})

const pageTitle = computed(() => {
  return detailItem.value ? '热点详情' : '高考热点 · 招生政策'
})
</script>

<style scoped>
/* ============================================================
   Shared
   ============================================================ */
.news-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ============================================================
   List mode — each card is clickable to enter detail
   ============================================================ */
.news-card {
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--bdr);
  box-shadow: var(--shadow);
  padding: 18px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all .15s;
}

.news-card:active {
  transform: scale(.98);
}

.news-title {
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 10px;
  color: var(--text);
}

.news-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.news-source {
  padding: 2px 8px;
  background: rgba(184, 115, 81, .08);
  color: var(--accent2);
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
}

.news-date {
  font-size: 12px;
  color: var(--text3);
}

.news-desc {
  font-size: 14px;
  color: var(--text);
  line-height: 1.8;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ============================================================
   Detail mode — single item, full content, not clickable
   ============================================================ */
.detail-card {
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--bdr);
  box-shadow: var(--shadow);
  padding: 24px 20px;
}

.detail-title {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
  line-height: 1.35;
  margin-bottom: 14px;
  color: var(--text);
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.detail-source {
  padding: 3px 10px;
  background: rgba(184, 115, 81, .08);
  color: var(--accent2);
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
}

.detail-date {
  font-size: 13px;
  color: var(--text3);
}

.detail-body {
  font-size: 15px;
  color: var(--text);
  line-height: 2;
  white-space: pre-wrap;
}
</style>
