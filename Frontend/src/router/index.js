import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:floor?/:id?',
      name: 'map',
      component: () => import('@/views/Map.vue'),
      meta: { title: '西高Map', desc: 'マップ' }
    },
    {
      path: '/guide',
      name: 'guide',
      component: () => import('@/views/Guide.vue'),
      meta: { title: '使い方 |西高Map', desc: '使い方' }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/About.vue'),
      meta: { title: 'このサイトについて |西高Map', desc: 'このサイトについて' }
    }
  ]
})

// titleを後から変更する
router.afterEach((to) => {
  const TITLE = to.meta.title
  const DESC = to.meta.desc
  document.title = TITLE
  document.querySelector("meta[name='description']").setAttribute('content', DESC)
})

export default router
