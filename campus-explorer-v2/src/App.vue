<template>
  <div>
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </transition>
    </router-view>

    <!--
      底部导航栏
      仅在学校详情页隐藏（详情页有自己的底部操作栏）
      -->
    <nav class="bottom-nav" v-if="showNav">
      <!-- 首页 -->
      <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }" replace>
        <span class="nav-icon">⌂</span>
        <span class="nav-label">首页</span>
      </router-link>

      <!-- 对比 — 含数量角标 -->
      <router-link to="/compare" class="nav-item" :class="{ active: $route.path === '/compare' }" replace>
        <span class="nav-icon">◫</span>
        <span class="nav-label">对比</span>
        <span class="nav-badge" v-if="compareCount">{{ compareCount }}</span>
      </router-link>

      <!-- 社区 -->
      <router-link to="/community" class="nav-item" :class="{ active: $route.path === '/community' }" replace>
        <span class="nav-icon">◈</span>
        <span class="nav-label">社区</span>
      </router-link>

      <!-- 我的 — 最右侧，图标使用几何圆形，跟 ⌂ ◫ ◈ 风格统一 -->
      <router-link to="/profile" class="nav-item" :class="{ active: $route.path === '/profile' }" replace>
        <!--
          未登录：空心圆（currentColor 继承父级颜色，激活时自动变暖色）
          已登录：实心圆 + 昵称首字（同样跟随 currentColor 变色）
          -->
        <span class="nav-icon nav-profile-icon" v-if="authStore.isLoggedIn" aria-hidden="true">
          {{ (authStore.currentUser?.nickname || authStore.currentUser?.username || '我')[0] }}
        </span>
        <span class="nav-icon nav-profile-icon nav-profile-icon--outline" v-else aria-hidden="true"></span>
        <span class="nav-label">我的</span>
      </router-link>
    </nav>

    <!-- AI 问答悬浮球 — 全局显示，所有路由页面可见 -->
    <AiFloatingBall />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { loadLS } from './utils/storage.js'
import { useAuthStore } from './stores/auth.js'
import AiFloatingBall from './components/AiFloatingBall.vue'

const route = useRoute()
const authStore = useAuthStore()
const compareList = ref(loadLS('cx-cmp', []))

// 底部导航栏的显示逻辑：学校详情页隐藏（详情页有独立底部栏），独立 auth 页隐藏
const showNav = computed(() => {
  return !route.path.startsWith('/school/') && route.path !== '/auth'
})

const compareCount = computed(() => compareList.value.length)

// 路由变化时同步 compareList（跨组件共享 localStorage 数据）
watch(() => route.path, () => {
  compareList.value = loadLS('cx-cmp', [])
})

// 监听跨标签页的 storage 变更
onMounted(() => {
  window.addEventListener('storage', () => {
    compareList.value = loadLS('cx-cmp', [])
  })
})
</script>

<style scoped>
/*
 * "我的"导航图标 — 几何圆形，跟 ⌂ ◫ ◈ 视觉一致
 *
 * 颜色逻辑（通过父级 .nav-item 的 .active 类驱动，不使用 currentColor）：
 *   未激活 → 灰色圆（背景 var(--text2) / 边框 var(--text2)）
 *   激活   → 暖陶色圆（背景 var(--accent2) / 边框 var(--accent2)）
 */

/* 基础圆形样式（已登录 — 实心圆 + 首字） */
.nav-profile-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  /* 默认灰色 */
  background: var(--text2);
  color: var(--bg);
  transition: background .15s;
}

/* 父级激活 → 暖色 */
.nav-item.active .nav-profile-icon {
  background: var(--accent2);
}

/* 未登录 — 空心圆 */
.nav-profile-icon--outline {
  background: transparent;
  border: 2px solid var(--text2);
}
.nav-item.active .nav-profile-icon--outline {
  border-color: var(--accent2);
}
</style>
