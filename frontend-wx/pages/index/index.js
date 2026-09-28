var request = require('../../utils/request');
var cart = require('../../utils/cart');
Page({
  data: { products: [], loading: true, keyword: '' },
  onLoad: function () { var self = this; request.get('/api/wx/shop/config').then(function (shop) { self.setData({ shop: shop, shopStatusText: Number(shop.shopStatus) === 0 ? '歇业中' : '营业中' }); }).catch(function () {}); this.load(); },
  onPullDownRefresh: function () { this.load(true); },
  load: function (refresh) {
    var self = this; self.setData({ loading: true });
    request.get('/api/wx/goods/list', { keyword: this.data.keyword }).then(function (res) {
       var list = res && (res.records || res.list) || [];
      self.setData({ products: list, loading: false });
      if (refresh) wx.stopPullDownRefresh();
    }).catch(function (e) { self.setData({ loading: false }); wx.showToast({ title: e.message, icon: 'none' }); });
  },
  search: function (e) { this.setData({ keyword: e.detail.value }); this.load(); },
  add: function (e) { var product = e.currentTarget.dataset.product; if (Number(product.goodsStock) <= 0) { wx.showToast({ title: '商品缺货', icon: 'none' }); return; } var before = cart.get().filter(function (item) { return String(item.goodsId) === String(product.goodsId); })[0]; if (before && before.goodsNum >= Number(product.goodsStock)) { wx.showToast({ title: '库存不足', icon: 'none' }); return; } cart.add(product); wx.showToast({ title: '已加入购物车', icon: 'success' }); }
});
