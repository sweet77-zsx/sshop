import axios from 'axios'
import router from '../router'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || __API_BASE_URL__,
  timeout: 15000
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('sshop_token')
  if (token) config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`
  return config
})

request.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && body.code !== 200) return Promise.reject(new Error(body.message || '请求失败'))
    return body?.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sshop_token')
      localStorage.removeItem('sshop_user')
      ElMessage.error('登录已过期，请重新登录')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default request
