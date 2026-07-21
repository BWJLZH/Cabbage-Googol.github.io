import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomePage.vue')
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
    component: () => import('../views/ComparePage.vue')
  },
  {
    path: '/match',
    name: 'match',
    component: () => import('../views/MatchPage.vue')
  },
  {
    path: '/community',
    name: 'community',
    component: () => import('../views/CommunityPage.vue')
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('../views/LoginRegister.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfilePage.vue')
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

export default router
