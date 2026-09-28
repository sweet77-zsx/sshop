var app = getApp();
function viewData(user) {
  var name = user && (user.nickName || user.nick_name || user.nickname);
  return { user: user || null, avatarText: name ? name.charAt(0) : '?' };
}
Page({
  data: { user: null, avatarText: '?' },
  onShow: function () { this.setData(viewData(app.globalData.user || wx.getStorageSync('wx_user'))); },
  login: function () { var self = this; app.login().then(function (u) { self.setData(viewData(u)); }).catch(function (e) { wx.showToast({ title: e.message, icon: 'none' }); }); },
  orders: function () { wx.navigateTo({ url: '/pages/order/list/list' }); },
  merchant: function () { wx.navigateTo({ url: '/pages/merchant/login/login' }); },
  clear: function () { wx.removeStorageSync('Wx-Token'); wx.removeStorageSync('wx_user'); app.globalData.user = null; this.setData(viewData(null)); }
});
