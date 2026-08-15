<template>
  <div>
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </transition>
    </router-view>

    <!-- 底部导航栏 — 学校详情页和登录页隐藏 -->
    <nav class="bottom-nav" v-if="showNav">
      <!-- 首页 -->
      <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }" replace>
        <span class="nav-icon"><PhHouse :size="20" /></span>
        <span class="nav-label">首页</span>
      </router-link>

      <!-- 匹配 -->
      <router-link to="/match" class="nav-item" :class="{ active: $route.path === '/match' }" replace>
        <span class="nav-icon"><PhSparkle :size="20" /></span>
        <span class="nav-label">匹配</span>
      </router-link>

      <!-- 对比 — 含数量角标 -->
      <router-link to="/compare" class="nav-item" :class="{ active: $route.path === '/compare' }" replace>
        <span class="nav-icon"><PhArrowsLeftRight :size="20" /></span>
        <span class="nav-label">对比</span>
        <span class="nav-badge" v-if="compareCount">{{ compareCount }}</span>
      </router-link>

      <!-- 社区 -->
      <router-link to="/community" class="nav-item" :class="{ active: $route.path === '/community' }" replace>
        <span class="nav-icon"><PhUsersThree :size="20" /></span>
        <span class="nav-label">社区</span>
      </router-link>

      <!-- 我的 -->
      <router-link to="/profile" class="nav-item" :class="{ active: $route.path === '/profile' }" replace>
        <span class="nav-icon nav-profile-icon" v-if="authStore.isLoggedIn" aria-hidden="true">
          {{ (authStore.currentUser?.nickname || authStore.currentUser?.username || '我')[0] }}
        </span>
        <span class="nav-icon nav-profile-icon--ph" v-else aria-hidden="true">
          <PhUserCircle :size="22" />
        </span>
        <span class="nav-label">我的</span>
      </router-link>
    </nav>

    <!-- AI 问答悬浮球 — 登录页隐藏 -->
    <AiFloatingBall v-if="showAiBall" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { loadLS } from './utils/storage.js'
import { useAuthStore } from './stores/auth.js'
import AiFloatingBall from './components/AiFloatingBall.vue'
import { PhHouse, PhSparkle, PhArrowsLeftRight, PhUsersThree, PhUserCircle } from '@phosphor-icons/vue'

const route = useRoute()
const authStore = useAuthStore()
const compareList = ref(loadLS('cx-cmp', []))

const showNav = computed(() => {
  return !route.path.startsWith('/school/') && route.path !== '/auth' && route.path !== '/search'
})

const showAiBall = computed(() => {
  return route.path !== '/auth'
})

const compareCount = computed(() => compareList.value.length)

watch(() => route.path, () => {
  compareList.value = loadLS('cx-cmp', [])
})

onMounted(() => {
  window.addEventListener('storage', () => {
    compareList.value = loadLS('cx-cmp', [])
  })
})
</script>

<style scoped>
/* "我的"导航图标 — 已登录显示实心圆+首字 */
.nav-profile-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  background: var(--text2);
  color: var(--bg);
  transition: background .15s;
}
.nav-item.active .nav-profile-icon {
  background: var(--accent2);
}

/* 未登录 — Phosphor 用户图标继承父级颜色 */
.nav-profile-icon--ph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text2);
  transition: color .15s;
}
.nav-item.active .nav-profile-icon--ph {
  color: var(--accent2);
}
</style>
