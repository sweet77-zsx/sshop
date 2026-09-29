var request = require('../../../utils/admin-request');

Page({
  data: {
    username: '',
    password: '',
    loading: false
  },

  input: function (e) {
    var d = {};
    d[e.currentTarget.dataset.field] = e.detail.value;
    this.setData(d);
  },

  goCustomer: function () {
    wx.switchTab({ url: '/pages/mine/mine' });
  },

  submit: function () {
    var self = this;
    if (!this.data.username.trim() || !this.data.password.trim()) {
      wx.showToast({ title: '请输入账号和密码', icon: 'none' });
      return;
    }
    self.setData({ loading: true });
    request.post('/api/admin/login', {
      username: this.data.username.trim(),
      password: this.data.password.trim()
    }).then(function (data) {
      wx.setStorageSync('admin_token', data.jwtToken);
      wx.setStorageSync('admin_user', data.admin);
      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(function () {
        wx.redirectTo({ url: '/pages/merchant/orders/orders' });
      }, 300);
    }).catch(function (e) {
      wx.showToast({ title: e.message || '登录失败', icon: 'none' });
    }).then(function () {
      self.setData({ loading: false });
    });
  }
});
