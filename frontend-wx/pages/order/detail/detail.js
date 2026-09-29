var request = require('../../../utils/request');

Page({
  data: {
    order: null,
    orderNo: '',
    timer: null,
    statusMeta: {
      title: '订单加载中',
      desc: '',
      icon: '⏳',
      bgClass: 'hero-pending'
    }
  },

  onLoad: function (options) {
    if (options && options.orderNo) {
      this.setData({ orderNo: options.orderNo });
      this.load();
    }
  },

  onUnload: function () {
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
  },

  load: function () {
    var self = this;
    if (!wx.getStorageSync('Wx-Token')) {
      self.setData({ order: null });
      return;
    }

    request.get('/api/wx/order/' + this.data.orderNo).then(function (result) {
      if (!result || !result.order) return;
      var raw = result.order;
      var status = Number(raw.orderStatus);
      var statusTexts = ['待接单', '配送中', '已完成', '已拒绝'];
      
      var metas = [
        { title: '等待商家接单', desc: '订单已提交给小卖部，商家接单后将火速为您配送', icon: '⏳', bgClass: 'hero-pending' },
        { title: '正在极速配送中', desc: '专人已带上美味零食，正快马加鞭前往您的寝室', icon: '🛵', bgClass: 'hero-delivering' },
        { title: '订单已顺利完成', desc: '商品已成功送达，感谢您的支持，祝您用餐愉快！', icon: '🎉', bgClass: 'hero-completed' },
        { title: '订单已被拒绝', desc: '抱歉，小卖部暂时无法配送该订单，库存已自动回退', icon: '❌', bgClass: 'hero-rejected' }
      ];

      var order = Object.assign({}, raw, {
        itemList: result.itemList || [],
        statusText: statusTexts[status] || '未知状态',
        payQrcode: result.payQrcode,
        deliveryTip: result.deliveryTip
      });

      self.setData({
        order: order,
        statusMeta: metas[status] || metas[0]
      });

      // 待接单或配送中状态下，自动轮询更新最新配送状态
      if ([0, 1].indexOf(status) >= 0) {
        if (self.data.timer) clearTimeout(self.data.timer);
        self.data.timer = setTimeout(function () {
          self.load();
        }, 5000);
      }
    }).catch(function (e) {
      wx.showToast({ title: e.message || '加载详情失败', icon: 'none' });
    });
  },

  previewQrcode: function () {
    if (this.data.order && this.data.order.payQrcode) {
      wx.previewImage({
        current: this.data.order.payQrcode,
        urls: [this.data.order.payQrcode]
      });
    }
  },

  copyOrderNo: function () {
    if (this.data.order && this.data.order.orderNo) {
      wx.setClipboardData({
        data: this.data.order.orderNo,
        success: function () {
          wx.showToast({ title: '订单号已复制', icon: 'none' });
        }
      });
    }
  },

  goHome: function () {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
