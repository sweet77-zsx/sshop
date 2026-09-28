<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { Menu, Close, Box, List, Setting, Bell, UserFilled, Expand, Fold } from '@element-plus/icons-vue'
import { orderApi, shopApi } from '../api'

const route = useRoute()
const router = useRouter()
const collapsed = ref(false)
const mobileOpen = ref(false)
const user = JSON.parse(localStorage.getItem('sshop_user') || '{"name":"店铺管理员"}')
const shopStatus = ref(1)
const pendingOrders = ref(0)
const title = computed(() => route.meta.title || '工作台')
const shopStatusText = computed(() => shopStatus.value === 1 ? '营业中' : '歇业中')
const handleShopConfigUpdated = (event) => {
  if (event.detail && event.detail.shopStatus !== undefined) {
    shopStatus.value = Number(event.detail.shopStatus)
  }
}
onMounted(async () => {
  try { const config = await shopApi.get(); shopStatus.value = Number(config?.shopStatus ?? 1) } catch {}
  try { const stats = await orderApi.stats(); pendingOrders.value = Number(stats?.pending || 0) } catch {}
  window.addEventListener('shop-config-updated', handleShopConfigUpdated)
})
onBeforeUnmount(() => window.removeEventListener('shop-config-updated', handleShopConfigUpdated))
const navigate = (path) => { router.push(path); mobileOpen.value = false }
const logout = () => ElMessageBox.confirm('确定退出当前账号吗？', '退出登录', { type: 'warning' }).then(() => {
  localStorage.removeItem('sshop_token'); localStorage.removeItem('sshop_user'); router.push('/login')
}).catch(() => {})
</script>

<template>
  <div class="app-shell">
    <div class="mobile-mask" :class="{ show: mobileOpen }" @click="mobileOpen = false" />
    <aside class="sidebar" :class="{ collapsed, 'mobile-open': mobileOpen }">
      <div class="brand"><div class="brand-mark">食</div><span>食刻商家</span></div>
       <div class="shop-badge"><span class="status-dot" :class="{ closed: shopStatus === 0 }" /> {{ shopStatusText }}</div>
      <nav class="nav-menu">
        <button :class="{ active: route.name === 'products' }" @click="navigate('/products')"><el-icon><Box /></el-icon><span>商品管理</span></button>
         <button :class="{ active: route.name === 'orders' }" @click="navigate('/orders')"><el-icon><List /></el-icon><span>订单管理</span><b v-if="pendingOrders > 0">{{ pendingOrders }}</b></button>
        <button :class="{ active: route.name === 'settings' }" @click="navigate('/settings')"><el-icon><Setting /></el-icon><span>店铺设置</span></button>
      </nav>
      <div class="sidebar-bottom"><div class="help-line">需要帮助？<strong>联系平台客服</strong></div><div class="version">食刻商家后台 · v1.0.0</div></div>
    </aside>
    <main class="main-area">
      <header class="topbar">
        <button class="icon-button mobile-toggle" @click="mobileOpen = !mobileOpen"><el-icon><Menu /></el-icon></button>
        <button class="icon-button desktop-toggle" @click="collapsed = !collapsed"><el-icon><Expand v-if="collapsed" /><Fold v-else /></el-icon></button>
        <div class="breadcrumb"><span>商家中心</span><i>/</i><strong>{{ title }}</strong></div>
        <div class="top-actions"><button class="notification"><el-icon><Bell /></el-icon><em /></button><el-dropdown trigger="click"><div class="profile"><span class="avatar"><el-icon><UserFilled /></el-icon></span><span class="profile-name">{{ user.name || '店铺管理员' }}</span><el-icon class="arrow"><Expand /></el-icon></div><template #dropdown><el-dropdown-menu><el-dropdown-item @click="logout">退出登录</el-dropdown-item></el-dropdown-menu></template></el-dropdown></div>
      </header>
      <section class="page-content"><router-view /></section>
    </main>
  </div>
</template>
