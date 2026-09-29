var request = require('../../../utils/request');
var cart = require('../../../utils/cart');

Page({
  data: {
    items: [],
    total: '0.00',
    totalCount: 0,
    addressInfo: '',
    remark: '',
    submitting: false,
    buildingPresets: ['1号楼', '2号楼', '3号楼', '5号楼', '6号楼', '8号楼', '10号楼', '12号楼'],
    remarkPresets: ['放门口即可', '轻敲门即可', '到了先打电话', '放门把手']
  },

  onLoad: function () {
    var items = cart.get();
    var count = items.reduce(function (sum, x) { return sum + x.goodsNum; }, 0);
    var total = items.reduce(function (s, x) {
      return s + Number(x.goodsPrice) * x.goodsNum;
    }, 0).toFixed(2);

    var savedAddress = wx.getStorageSync('sshop_last_address') || '';

    this.setData({
      items: items,
      totalCount: count,
      total: total,
      addressInfo: savedAddress
    });
  },

  input: function (e) {
    var d = {};
    d[e.currentTarget.dataset.field] = e.detail.value;
    this.setData(d);
  },

  quickBuilding: function (e) {
    var val = e.currentTarget.dataset.val;
    var current = this.data.addressInfo || '';
    if (!current) {
      this.setData({ addressInfo: val + ' ' });
    } else if (current.indexOf(val) === -1) {
      this.setData({ addressInfo: val + ' ' + current.trim() });
    }
  },

  quickRemark: function (e) {
    var tag = e.currentTarget.dataset.tag;
    var current = this.data.remark || '';
    if (!current) {
      this.setData({ remark: tag });
    } else if (current.indexOf(tag) === -1) {
      this.setData({ remark: current + '，' + tag });
    }
  },

  submit: function () {
    var self = this;
    var address = (this.data.addressInfo || '').trim();
    if (!address) {
      wx.showToast({ title: '请填写宿舍楼栋和房间号', icon: 'none' });
      return;
    }

    if (!this.data.items.length) {
      wx.showToast({ title: '商品清单为空', icon: 'none' });
      return;
    }

    var create = function () {
      self.setData({ submitting: true });
      request.post('/api/wx/order/create', {
        addressInfo: address,
        remark: self.data.remark,
        itemList: self.data.items.map(function (item) {
          return { goodsId: item.goodsId, goodsNum: item.goodsNum };
        })
      }).then(function (order) {
        // 保存常用地址方便下次复用
        wx.setStorageSync('sshop_last_address', address);
        cart.clear();
        wx.showToast({ title: '下单成功', icon: 'success' });
        setTimeout(function () {
          wx.redirectTo({ url: '/pages/order/detail/detail?orderNo=' + order.orderNo });
        }, 300);
      }).catch(function (e) {
        self.setData({ submitting: false });
        wx.showToast({ title: e.message || '下单失败', icon: 'none' });
      });
    };

    request.get('/api/wx/shop/config').then(function (shop) {
      if (Number(shop.shopStatus) === 0) {
        wx.showToast({ title: '店铺歇业中，暂不接受订单', icon: 'none' });
        return;
      }
      var tmplIds = getApp().globalData.subscribeTemplateIds || [];
      if (!tmplIds.length || !wx.requestSubscribeMessage) {
        create();
        return;
      }
      wx.requestSubscribeMessage({ tmplIds: tmplIds, complete: create });
    }).catch(function (e) {
      wx.showToast({ title: e.message || '检查店铺状态失败', icon: 'none' });
    });
  }
});
