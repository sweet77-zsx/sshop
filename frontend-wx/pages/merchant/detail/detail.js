var request = require('../../../utils/admin-request');

function imageUrl(url) {
  if (!url) return '';
  if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) return url;
  return getApp().apiBaseUrl + url;
}

Page({
  data: {
    orderId: '',
    detail: null,
    statusText: '',
    statusClass: '',
    statusIcon: '📦'
  },

  onLoad: function (options) {
    if (options && options.orderId) {
      this.setData({ orderId: options.orderId });
      this.load();
    }
  },

  goBack: function () {
    wx.navigateBack({
      fail: function () {
        wx.redirectTo({ url: '/pages/merchant/orders/orders' });
      }
    });
  },

  load: function () {
    var self = this;
    request.get('/api/order/' + this.data.orderId).then(function (data) {
      var order = data && data.order ? data.order : {};
      var status = Number(order.orderStatus);
      var statusTexts = ['待接单', '配送中', '已完成', '已拒绝'];
      var statusIcons = ['⏳', '🛵', '✅', '❌'];
      var statusClasses = ['status-0', 'status-1', 'status-2', 'status-3'];

      var detail = Object.assign({}, data, {
        payQrcode: imageUrl(data && data.payQrcode),
        itemList: (data && data.itemList) || []
      });

      self.setData({
        detail: detail,
        statusText: statusTexts[status] || '未知状态',
        statusIcon: statusIcons[status] || '📦',
        statusClass: statusClasses[status] || ''
      });
    }).catch(function (e) {
      self.setData({ detail: null });
      wx.showToast({ title: e.message || '加载详情失败', icon: 'none' });
    });
  },

  openQrcode: function () {
    var url = this.data.detail && this.data.detail.payQrcode;
    if (!url) {
      wx.showToast({ title: '暂未上传收款码', icon: 'none' });
      return;
    }
    wx.previewImage({
      current: url,
      urls: [url]
    });
  },

  action: function (e) {
    var self = this;
    var type = e.currentTarget.dataset.type;
    var labels = { accept: '接单', reject: '拒绝订单', finish: '确认送达' };

    var execute = function () {
      wx.showLoading({ title: '处理中...' });
      request.put('/api/order/' + type + '/' + self.data.orderId).then(function () {
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
        content: '确定拒绝该订单吗？拒绝后相关商品库存将自动回退。',
        confirmColor: '#f43f5e',
        success: function (res) {
          if (res.confirm) execute();
        }
      });
    } else if (type === 'finish') {
      wx.showModal({
        title: '确认送达与收款',
        content: '请确认商品已送达至寝室，且顾客已完成线下扫码付款。',
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
