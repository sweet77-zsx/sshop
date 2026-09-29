var request = require('../../../utils/request');

Page({
  data: {
    tabs: [
      { key: '', name: '全部' },
      { key: '0', name: '待接单' },
      { key: '1', name: '配送中' },
      { key: '2', name: '已完成' },
      { key: '3', name: '已拒绝' }
    ],
    active: '',
    orders: [],
    loading: false,
    hasToken: true
  },

  onLoad: function (options) {
    if (options && options.status !== undefined) {
      this.setData({ active: options.status });
    }
  },

  onShow: function () {
    var app = getApp();
    if (app && app.globalData && app.globalData.orderListStatus !== undefined) {
      this.setData({ active: app.globalData.orderListStatus });
      app.globalData.orderListStatus = undefined;
    }
    this.checkLoginAndLoad();
  },

  onPullDownRefresh: function () {
    this.load(true);
  },

  checkLoginAndLoad: function () {
    var token = wx.getStorageSync('Wx-Token');
    this.setData({ hasToken: !!token });
    if (token) {
      this.load();
    } else {
      this.setData({ orders: [], loading: false });
    }
  },

  select: function (e) {
    this.setData({ active: e.currentTarget.dataset.status });
    this.load();
  },

  load: function (refresh) {
    var self = this;
    if (!wx.getStorageSync('Wx-Token')) {
      self.setData({ orders: [], loading: false, hasToken: false });
      if (refresh) wx.stopPullDownRefresh();
      return;
    }

    self.setData({ loading: true, hasToken: true });
    var data = this.data.active === '' ? {} : { orderStatus: Number(this.data.active) };

    request.get('/api/wx/order/list', data).then(function (orders) {
      var statusMap = ['待接单', '配送中', '已完成', '已拒绝'];
      var iconMap = ['⏳', '🛵', '✅', '❌'];
      var list = (orders || []).map(function (o) {
        var status = Number(o.orderStatus);
        o.statusText = statusMap[status] || '处理中';
        o.statusIcon = iconMap[status] || '📦';
        o.statusClass = 'status-' + status;
        return o;
      });
      self.setData({ orders: list, loading: false });
      if (refresh) wx.stopPullDownRefresh();
    }).catch(function (e) {
      self.setData({ orders: [], loading: false });
      wx.showToast({ title: e.message || '加载失败', icon: 'none' });
      if (refresh) wx.stopPullDownRefresh();
    });
  },

  detail: function (e) {
    var orderNo = e.currentTarget.dataset.orderNo;
    wx.navigateTo({ url: '/pages/order/detail/detail?orderNo=' + orderNo });
  },

  copyOrderNo: function (e) {
    var orderNo = e.currentTarget.dataset.no;
    wx.setClipboardData({
      data: orderNo,
      success: function () {
        wx.showToast({ title: '单号已复制', icon: 'none' });
      }
    });
  },

  goLogin: function () {
    var self = this;
    var app = getApp();
    if (app && app.login) {
      app.login().then(function () {
        self.checkLoginAndLoad();
      }).catch(function (e) {
        wx.showToast({ title: e.message || '登录失败', icon: 'none' });
      });
    } else {
      wx.switchTab({ url: '/pages/mine/mine' });
    }
  },

  goShop: function () {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
