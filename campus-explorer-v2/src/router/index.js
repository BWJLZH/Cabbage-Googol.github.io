import { createRouter, createWebHashHistory } from 'vue-router'

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
    path: '/compare',
    name: 'compare',
    component: () => import('../views/ComparePage.vue'),
    meta: { tab: true }
  },
  {
    path: '/match',
    name: 'match',
    component: () => import('../views/MatchPage.vue')
  },
  {
    path: '/community',
    name: 'community',
    component: () => import('../views/CommunityPage.vue'),
    meta: { tab: true }
  },
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
// 底部 Tab 路由守卫：Tab 之间切换不写入历史记录
// 任何导航到 Tab 页面的 push 都会自动转为 replace，
// 保证点击浏览器返回时直接退出网站，而不是逐页回退 Tab 历史
// ============================================================

/**
 * 判断目标路由是否为底部 Tab 页面
 */
function isTabRoute(to) {
  // 字符串路径（如 '/'  '/compare'）
  if (typeof to === 'string') {
    return routes.some(r => r.meta?.tab && r.path === to)
  }
  // 对象路径（如 { path: '/' }  { name: 'home' }）
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
