var request = require('../../../utils/admin-request');
function decorate(order) { order.statusText = ['待接单', '配送中', '已完成', '已拒绝'][Number(order.orderStatus)] || '未知状态'; return order; }
Page({
  data: { orders: [], loading: false, config: null },
  onShow: function () { if (!wx.getStorageSync('admin_token')) { wx.redirectTo({ url: '/pages/merchant/login/login' }); return; } this.load(); },
  onPullDownRefresh: function () { this.load(true); },
  load: function (refresh) { var self = this; self.setData({ loading: true, orders: [] }); Promise.all([request.get('/api/order/list', { pageNum: 1, pageSize: 100 }), request.get('/api/shop/config')]).then(function (result) { var page = result[0] || {}; var orders = (page.records || []).map(decorate); self.setData({ orders: orders, config: result[1] || {} }); }).catch(function (e) { self.setData({ orders: [] }); wx.showToast({ title: e.message, icon: 'none' }); }).then(function () { self.setData({ loading: false }); if (refresh) wx.stopPullDownRefresh(); }); },
  detail: function (e) { wx.navigateTo({ url: '/pages/merchant/detail/detail?orderId=' + e.currentTarget.dataset.id }); },
  action: function (e) { var self = this; var id = e.currentTarget.dataset.id; var type = e.currentTarget.dataset.type; var labels = { accept: '接单', reject: '拒绝订单', finish: '确认完成' }; var execute = function () { request.put('/api/order/' + type + '/' + id).then(function () { wx.showToast({ title: labels[type] + '成功', icon: 'success' }); self.load(); }).catch(function (error) { wx.showToast({ title: error.message, icon: 'none' }); }); }; if (type === 'reject' || type === 'finish') { wx.showModal({ title: type === 'reject' ? '拒绝订单' : '确认完成', content: type === 'reject' ? '确定拒绝这个订单吗？库存将回补。' : '确认顾客已经收到商品并完成线下付款了吗？', success: function (result) { if (result.confirm) execute(); } }); } else execute(); },
  logout: function () { wx.removeStorageSync('admin_token'); wx.removeStorageSync('admin_user'); wx.reLaunch({ url: '/pages/mine/mine' }); }
});
