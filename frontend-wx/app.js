var request = require('./utils/request');

App({
  // 开发环境请替换为后端可访问地址，真机不能使用 localhost。
  apiBaseUrl: 'http://127.0.0.1:8080',
  globalData: { user: null, shop: null, subscribeTemplateIds: [], orderListStatus: undefined },
  onLaunch: function () {
    var user = wx.getStorageSync('wx_user');
    if (user) this.globalData.user = user;
  },
  login: function () {
    var self = this;
    return new Promise(function (resolve, reject) {
      wx.login({
        success: function (loginRes) {
          if (!loginRes.code) { reject(new Error('微信登录失败')); return; }
          request.post('/api/wx/login', { code: loginRes.code }, { skipLogin: true }).then(function (res) {
            var data = res;
            var token = data && data.wxToken;
            var user = data && data.user;
            if (!token) { reject(new Error('登录接口未返回 Wx-Token')); return; }
            wx.setStorageSync('Wx-Token', token);
            wx.setStorageSync('wx_user', user);
            self.globalData.user = user;
            resolve(user);
          }).catch(reject);
        },
        fail: reject
      });
    });
  }
});
