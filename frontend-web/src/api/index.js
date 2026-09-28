import request from './request'

export const authApi = {
  login: (data) => request.post('/api/admin/login', data)
}
export const productApi = {
  list: (params) => request.get('/api/goods/list', { params: { pageNum: params.page, pageSize: params.pageSize, goodsName: params.keyword || undefined, goodsStatus: params.status || undefined } }),
  stats: () => request.get('/api/goods/stats'),
  create: (data) => request.post('/api/goods', data),
  update: (id, data) => request.put(`/api/goods/${id}`, data),
  remove: (id) => request.delete(`/api/goods/${id}`),
  upload: (data) => request.post('/api/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })
}
export const orderApi = {
  list: (params) => request.get('/api/order/list', { params: { pageNum: params.page, pageSize: params.pageSize, orderNo: params.orderNo || undefined, orderStatus: params.status === '' ? undefined : params.status } }),
  stats: () => request.get('/api/order/stats'),
  detail: (id) => request.get(`/api/order/${id}`),
  accept: (id) => request.put(`/api/order/accept/${id}`),
  reject: (id) => request.put(`/api/order/reject/${id}`),
  finish: (id) => request.put(`/api/order/finish/${id}`)
}
export const shopApi = {
  get: () => request.get('/api/shop/config'),
  update: (data) => request.put('/api/shop/config', data),
  upload: (data) => request.post('/api/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })
}
