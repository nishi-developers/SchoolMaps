import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // manifest.jsonのshortcutsはここをもとに書いている
  routes: [
    {
      path: '/:floor?/:id?',
      name: 'map',
      component: () => import('@/views/Map.vue'),
      meta: { title: '西高マップ' }
    },
    {
      path: '/guide',
      name: 'guide',
      component: () => import('@/views/Guide.vue'),
      meta: { title: '使い方 | 西高マップ' }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/About.vue'),
      meta: { title: 'このサイトについて | 西高マップ' }
    },
    {
      path: '/search/:searchWord?',
      name: 'search',
      component: () => import('@/views/Search.vue'),
      meta: { title: '検索 | 西高マップ' }
    },
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      component: () => import('@/views/404.vue'),
      meta: { title: '404 | 西高マップ' }
    }
  ]
})

// titleを後から変更する
router.afterEach((to) => {
  const TITLE = to.meta.title
  // const DESC = to.meta.desc
  document.title = TITLE
  // document.querySelector("meta[name='description']").setAttribute('content', DESC)
})

export default router
