var request = require('../../../utils/admin-request');

function decorate(order) {
  var status = Number(order.orderStatus);
  var texts = ['待接单', '配送中', '已完成', '已拒绝'];
  var icons = ['⏳', '🛵', '✅', '❌'];
  var classes = ['status-0', 'status-1', 'status-2', 'status-3'];

  order.statusText = texts[status] || '未知';
  order.statusIcon = icons[status] || '📦';
  order.statusClass = classes[status] || '';
  return order;
}

Page({
  data: {
    allOrders: [],
    orders: [],
    loading: false,
    config: null,
    activeTab: 'all',
    tabs: [
      { key: 'all', name: '全部' },
      { key: '0', name: '待接单' },
      { key: '1', name: '配送中' },
      { key: '2', name: '已完成' }
    ]
  },

  onShow: function () {
    if (!wx.getStorageSync('admin_token')) {
      wx.redirectTo({ url: '/pages/merchant/login/login' });
      return;
    }
    this.load();
  },

  onPullDownRefresh: function () {
    this.load(true);
  },

  setTab: function (e) {
    var tab = e.currentTarget.dataset.key;
    this.setData({ activeTab: tab });
    this.filterOrders();
  },

  filterOrders: function () {
    var tab = this.data.activeTab;
    if (tab === 'all') {
      this.setData({ orders: this.data.allOrders });
    } else {
      var filtered = this.data.allOrders.filter(function (o) {
        return String(o.orderStatus) === String(tab);
      });
      this.setData({ orders: filtered });
    }
  },

  load: function (refresh) {
    var self = this;
    self.setData({ loading: true });

    Promise.all([
      request.get('/api/order/list', { pageNum: 1, pageSize: 100 }),
      request.get('/api/shop/config')
    ]).then(function (result) {
      var page = result[0] || {};
      var rawOrders = (page.records || []).map(decorate);
      self.setData({
        allOrders: rawOrders,
        config: result[1] || {}
      });
      self.filterOrders();
    }).catch(function (e) {
      wx.showToast({ title: e.message || '加载订单失败', icon: 'none' });
    }).then(function () {
      self.setData({ loading: false });
      if (refresh) wx.stopPullDownRefresh();
    });
  },

  detail: function (e) {
    wx.navigateTo({ url: '/pages/merchant/detail/detail?orderId=' + e.currentTarget.dataset.id });
  },

  noop: function () {},

  action: function (e) {
    var self = this;
    var id = e.currentTarget.dataset.id;
    var type = e.currentTarget.dataset.type;
    var labels = { accept: '接单', reject: '拒绝订单', finish: '确认送达' };

    var execute = function () {
      wx.showLoading({ title: '处理中...' });
      request.put('/api/order/' + type + '/' + id).then(function () {
        wx.hideLoading();
        wx.showToast({ title: labels[type] + '成功', icon: 'success' });
        self.load();
      }).catch(function (error) {
        wx.hideLoading();
        wx.showToast({ title: error.message || '操作失败', icon: 'none' });
      });
    };

    if (type === 'reject') {
      wx.showModal({
        title: '拒绝订单',
        content: '确定拒绝该订单吗？拒绝后相关商品库存将立即自动回退。',
        confirmColor: '#f43f5e',
        success: function (res) {
          if (res.confirm) execute();
        }
      });
    } else if (type === 'finish') {
      wx.showModal({
        title: '确认送达与收款',
        content: '请确认商品已送达至寝室，且顾客已完成扫码线下支付。',
        confirmColor: '#10b981',
        success: function (res) {
          if (res.confirm) execute();
        }
      });
    } else {
      execute();
    }
  },

  logout: function () {
    wx.showModal({
      title: '退出配送端',
      content: '确定退出管理员配送中心并返回顾客端吗？',
      confirmColor: '#f43f5e',
      success: function (res) {
        if (res.confirm) {
          wx.removeStorageSync('admin_token');
          wx.removeStorageSync('admin_user');
          wx.reLaunch({ url: '/pages/mine/mine' });
        }
      }
    });
  }
});
