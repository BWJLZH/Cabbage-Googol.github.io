import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

// ============================================================
// 路由定义
// ============================================================
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomePage.vue'),
    meta: { tab: true }
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('../views/SearchPage.vue'),
    props: route => ({ query: route.query.q })
  },
  {
    path: '/school/:slug',
    name: 'school-detail',
    component: () => import('../views/SchoolDetailPage.vue')
  },
  {
    path: '/school/:slug/map',
    name: 'school-map',
    component: () => import('../views/MapPlaceholderPage.vue')
  },
  {
    path: '/compare',
    name: 'compare',
    component: () => import('../views/ComparePage.vue'),
    meta: { tab: true }
  },
  {
    path: '/match',
    name: 'match',
    component: () => import('../views/MatchPage.vue'),
    meta: { tab: true }
  },
  {
    path: '/community',
    name: 'community',
    component: () => import('../views/CommunityPage.vue'),
    meta: { tab: true }
  },
  // ==========================================================
  // 登录/注册页 — 唯一公开路由，不需要登录即可访问
  // ==========================================================
  {
    path: '/auth',
    name: 'auth',
    component: () => import('../views/LoginRegister.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfilePage.vue'),
    meta: { tab: true }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminPage.vue'),
    meta: { adminOnly: true }
  },
  {
    path: '/news/:id',
    name: 'news-detail',
    component: () => import('../views/NewsPage.vue'),
    props: true
  },
  {
    path: '/news',
    name: 'news',
    component: () => import('../views/NewsPage.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// ============================================================
// 全局前置守卫 — 强制登录 + 会话过期检测
//
// 规则：
//   1. /auth（登录页）→ 直接放行（已登录用户会由组件自行跳转）
//   2. 未登录 → 强制跳转 /auth
//   3. 已登录但会话过期 → 自动登出 + 跳转 /auth
//   4. 已登录且有效 → 放行
//   5. 管理员路由 → 仅 admin 角色可访问
// ============================================================
router.beforeEach((to, from, next) => {
  // 登录页直接放行
  if (to.path === '/auth') {
    return next()
  }

  // 需要 Pinia 实例已挂载（main.js 中 app.use(pinia) 在 router 之前）
  const authStore = useAuthStore()

  // 未登录
  if (!authStore.isLoggedIn) {
    return next('/auth')
  }

  // 已登录但会话已过期
  if (!authStore.checkSession()) {
    return next('/auth')
  }

  // 管理员路由仅 admin 可访问
  if (to.meta.adminOnly && !authStore.isAdmin) {
    return next('/')
  }

  next()
})

// ============================================================
// 底部 Tab 路由守卫：Tab 之间切换不写入历史记录
// 任何导航到 Tab 页面的 push 都会自动转为 replace，
// 保证点击浏览器返回时直接退出网站，而不是逐页回退 Tab 历史
// ============================================================
function isTabRoute(to) {
  if (typeof to === 'string') {
    return routes.some(r => r.meta?.tab && r.path === to)
  }
  if (to && typeof to === 'object') {
    if (to.path) return routes.some(r => r.meta?.tab && r.path === to.path)
    if (to.name) return routes.some(r => r.meta?.tab && r.name === to.name)
  }
  return false
}

const originalPush = router.push.bind(router)
router.push = function (to) {
  if (isTabRoute(to)) {
    return router.replace(to)
  }
  return originalPush(to)
}

export default router
