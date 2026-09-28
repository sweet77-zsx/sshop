<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi } from '../api'
import { Lock, User, ArrowRight } from '@element-plus/icons-vue'

const router = useRouter(); const loading = ref(false)
const form = reactive({ username: '', password: '' })
const submit = async () => {
  if (!form.username || !form.password) return ElMessage.warning('请输入账号和密码')
  loading.value = true
  try {
    const result = await authApi.login(form)
    localStorage.setItem('sshop_token', result?.jwtToken || '')
    localStorage.setItem('sshop_user', JSON.stringify(result?.admin || { username: form.username }))
    router.push('/products')
  } catch (error) { ElMessage.error(error.response?.data?.message || '登录失败，请检查账号密码') } finally { loading.value = false }
}
</script>

<template>
  <main class="login-page"><div class="login-art"><div class="art-content"><div class="brand large"><div class="brand-mark">食</div><span>食刻商家</span></div><h1>让每一份美味<br /><span>准时抵达</span></h1><p>从商品、订单到店铺经营<br />在这里高效管理每个重要瞬间。</p><div class="art-stats"><div><strong>24<span>h</span></strong><small>全天候经营</small></div><div><strong>98<span>%</span></strong><small>商家满意度</small></div></div></div></div><section class="login-panel"><div class="login-box"><div class="mobile-logo"><div class="brand-mark">食</div><span>食刻商家</span></div><div class="eyebrow">WELCOME BACK</div><h2>欢迎回来</h2><p class="login-desc">登录您的商家账号，开始今天的经营。</p><el-form @submit.prevent="submit"><el-form-item><el-input v-model="form.username" size="large" placeholder="请输入账号" :prefix-icon="User" /></el-form-item><el-form-item><el-input v-model="form.password" size="large" type="password" show-password placeholder="请输入密码" :prefix-icon="Lock" @keyup.enter="submit" /></el-form-item><div class="form-options"><el-checkbox>记住我</el-checkbox><a href="#">忘记密码？</a></div><el-button class="login-button" type="primary" size="large" :loading="loading" @click="submit">登录 <el-icon><ArrowRight /></el-icon></el-button></el-form><p class="login-footer">还没有商家账号？ <a href="#">申请入驻</a></p></div><div class="copyright">© 2025 食刻平台 · 让经营更简单</div></section></main>
</template>
