var cart = require('../../utils/cart');

Page({
  data: {
    items: [],
    total: '0.00',
    totalCount: 0
  },

  onShow: function () {
    this.refresh();
  },

  refresh: function () {
    var items = cart.get();
    var count = items.reduce(function (sum, x) { return sum + x.goodsNum; }, 0);
    var total = items.reduce(function (sum, x) {
      return sum + Number(x.goodsPrice || 0) * x.goodsNum;
    }, 0).toFixed(2);

    this.setData({
      items: items,
      totalCount: count,
      total: total
    });
  },

  decrease: function (e) {
    var id = e.currentTarget.dataset.id;
    var item = this.data.items.filter(function (x) {
      return String(x.goodsId) === String(id);
    })[0];
    if (item) {
      if (item.goodsNum <= 1) {
        this.confirmRemove(id, item.goodsName);
        return;
      }
      cart.update(item.goodsId, item.goodsNum - 1);
      this.refresh();
    }
  },

  increase: function (e) {
    var id = e.currentTarget.dataset.id;
    var item = this.data.items.filter(function (x) {
      return String(x.goodsId) === String(id);
    })[0];
    if (item) {
      var stock = Number(item.goodsStock || 999999);
      if (item.goodsNum >= stock) {
        wx.showToast({ title: '已达到该商品库存上限', icon: 'none' });
        return;
      }
      cart.update(item.goodsId, item.goodsNum + 1);
      this.refresh();
    }
  },

  confirmRemove: function (id, name) {
    var self = this;
    wx.showModal({
      title: '移除商品',
      content: '确定从购物车中移除「' + (name || '此商品') + '」吗？',
      confirmColor: '#f43f5e',
      success: function (res) {
        if (res.confirm) {
          cart.remove(id);
          self.refresh();
        }
      }
    });
  },

  remove: function (e) {
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    this.confirmRemove(id, name);
  },

  clearAll: function () {
    var self = this;
    if (!this.data.items.length) return;
    wx.showModal({
      title: '清空购物车',
      content: '确定清空购物车中所有零食吗？',
      confirmColor: '#f43f5e',
      success: function (res) {
        if (res.confirm) {
          cart.clear();
          self.refresh();
          wx.showToast({ title: '已清空', icon: 'none' });
        }
      }
    });
  },

  goShop: function () {
    wx.switchTab({ url: '/pages/index/index' });
  },

  checkout: function () {
    if (!this.data.items.length) {
      wx.showToast({ title: '购物车为空', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/order/create/create' });
  }
});
