var request = require('../../utils/request');
var cart = require('../../utils/cart');

Page({
  data: {
    shop: null,
    shopStatusText: '营业中',
    products: [],
    loading: true,
    keyword: '',
    currentCategory: '全部',
    categories: ['全部', '热销推荐', '休闲零食', '饮料冲饮', '方便速食'],
    cartCount: 0,
    cartTotal: '0.00'
  },

  onLoad: function () {
    var self = this;
    request.get('/api/wx/shop/config').then(function (shop) {
      self.setData({
        shop: shop,
        shopStatusText: Number(shop.shopStatus) === 0 ? '歇业中' : '营业中'
      });
    }).catch(function () {});
    this.load();
  },

  onShow: function () {
    this.updateCartInfo();
  },

  onPullDownRefresh: function () {
    this.load(true);
  },

  load: function (refresh) {
    var self = this;
    self.setData({ loading: true });
    request.get('/api/wx/goods/list', { pageNum: 1, pageSize: 50, keyword: this.data.keyword }).then(function (res) {
      var list = res && (res.records || res.list) || [];
      self.setData({ products: list, loading: false });
      self.updateCartInfo();
      if (refresh) wx.stopPullDownRefresh();
    }).catch(function (e) {
      self.setData({ loading: false });
      wx.showToast({ title: e.message || '加载失败', icon: 'none' });
      if (refresh) wx.stopPullDownRefresh();
    });
  },

  updateCartInfo: function () {
    var items = cart.get();
    var count = items.reduce(function (sum, item) { return sum + item.goodsNum; }, 0);
    var total = items.reduce(function (sum, item) { return sum + Number(item.goodsPrice) * item.goodsNum; }, 0).toFixed(2);
    
    // Map cart count onto products for display
    var map = {};
    items.forEach(function (i) { map[i.goodsId] = i.goodsNum; });
    var updated = this.data.products.map(function (p) {
      p.cartNum = map[p.goodsId] || 0;
      return p;
    });

    this.setData({
      cartCount: count,
      cartTotal: total,
      products: updated
    });
  },

  onSearchInput: function (e) {
    this.setData({ keyword: e.detail.value });
  },

  search: function (e) {
    var val = e.detail.value != null ? e.detail.value : this.data.keyword;
    this.setData({ keyword: val });
    this.load();
  },

  clearSearch: function () {
    this.setData({ keyword: '' });
    this.load();
  },

  selectCategory: function (e) {
    var cat = e.currentTarget.dataset.name;
    this.setData({ currentCategory: cat });
    if (cat === '全部') {
      this.setData({ keyword: '' });
      this.load();
    } else {
      this.setData({ keyword: cat === '热销推荐' ? '' : cat });
      this.load();
    }
  },

  add: function (e) {
    var product = e.currentTarget.dataset.product;
    if (this.data.shop && Number(this.data.shop.shopStatus) === 0) {
      wx.showToast({ title: '店铺歇业中，暂不支持下单', icon: 'none' });
      return;
    }
    if (Number(product.goodsStock) <= 0) {
      wx.showToast({ title: '商品已售罄', icon: 'none' });
      return;
    }
    var before = cart.get().filter(function (item) {
      return String(item.goodsId) === String(product.goodsId);
    })[0];
    if (before && before.goodsNum >= Number(product.goodsStock)) {
      wx.showToast({ title: '库存不足，不可超选', icon: 'none' });
      return;
    }
    cart.add(product);
    this.updateCartInfo();
    wx.showToast({ title: '已加入', icon: 'none', duration: 800 });
  },

  goCart: function () {
    wx.switchTab({ url: '/pages/cart/cart' });
  }
});
