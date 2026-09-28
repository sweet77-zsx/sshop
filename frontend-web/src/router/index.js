import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: () => import('../views/Login.vue'), meta: { guest: true } },
    {
      path: '/', component: () => import('../layouts/AppLayout.vue'),
      children: [
        { path: '', redirect: '/products' },
        { path: 'products', name: 'products', component: () => import('../views/Products.vue'), meta: { title: '商品管理' } },
        { path: 'orders', name: 'orders', component: () => import('../views/Orders.vue'), meta: { title: '订单管理' } },
        { path: 'settings', name: 'settings', component: () => import('../views/Settings.vue'), meta: { title: '店铺设置' } }
      ]
    }
  ]
})

router.beforeEach((to) => {
  if (!to.meta.guest && !localStorage.getItem('sshop_token')) return '/login'
  if (to.name === 'login' && localStorage.getItem('sshop_token')) return '/products'
})

export default router
