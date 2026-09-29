var app = getApp();

function viewData(user) {
  var name = user && (user.nickName || user.nick_name || user.nickname);
  return {
    user: user || null,
    avatarText: name ? name.charAt(0) : '食'
  };
}

Page({
  data: {
    user: null,
    avatarText: '食'
  },

  onShow: function () {
    this.setData(viewData(app.globalData.user || wx.getStorageSync('wx_user')));
  },

  login: function () {
    var self = this;
    wx.showLoading({ title: '正在登录...' });
    app.login().then(function (u) {
      wx.hideLoading();
      self.setData(viewData(u));
      wx.showToast({ title: '登录成功', icon: 'success' });
    }).catch(function (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '登录失败', icon: 'none' });
    });
  },

  orders: function () {
    var app = getApp();
    if (app && app.globalData) {
      app.globalData.orderListStatus = '';
    }
    wx.switchTab({ url: '/pages/order/list/list' });
  },

  goOrderStatus: function (e) {
    var status = e.currentTarget.dataset.status;
    var app = getApp();
    if (app && app.globalData) {
      app.globalData.orderListStatus = status !== undefined && status !== null ? String(status) : '';
    }
    wx.switchTab({ url: '/pages/order/list/list' });
  },

  merchant: function () {
    // 检查是否已有管理员 Token
    if (wx.getStorageSync('admin_token')) {
      wx.navigateTo({ url: '/pages/merchant/orders/orders' });
    } else {
      wx.navigateTo({ url: '/pages/merchant/login/login' });
    }
  },

  aboutDelivery: function () {
    wx.showModal({
      title: '校园配送服务说明',
      content: '1. 覆盖全校各宿舍楼宇，免收配送费\n2. 接单后火速专人送至寝室门口\n3. 支持线下当面扫码验货付款',
      showCancel: false,
      confirmColor: '#10b981'
    });
  },

  clear: function () {
    var self = this;
    wx.showModal({
      title: '退出登录',
      content: '确定退出当前微信登录账号吗？',
      confirmColor: '#f43f5e',
      success: function (res) {
        if (res.confirm) {
          wx.removeStorageSync('Wx-Token');
          wx.removeStorageSync('wx_user');
          app.globalData.user = null;
          self.setData(viewData(null));
          wx.showToast({ title: '已退出登录', icon: 'none' });
        }
      }
    });
  }
});
