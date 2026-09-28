function request(options) {
  var app = getApp();
  var token = wx.getStorageSync('admin_token');
  var header = Object.assign({ 'content-type': 'application/json' }, options.header || {});
  if (token) header.Authorization = token.indexOf('Bearer ') === 0 ? token : 'Bearer ' + token;
  return new Promise(function (resolve, reject) {
    wx.request({
      url: (app.apiBaseUrl || '') + options.url,
      method: options.method || 'GET', data: options.data || {}, header: header,
      success: function (res) {
        if (res.statusCode === 401) { wx.removeStorageSync('admin_token'); reject(new Error('商家登录已过期')); return; }
        if (res.statusCode >= 200 && res.statusCode < 300 && res.data && res.data.code === 200) resolve(res.data.data);
        else reject(new Error((res.data && (res.data.message || res.data.msg)) || '请求失败'));
      }, fail: reject
    });
  });
}
module.exports = { get: function (url, data) { return request({ url: url, data: data }); }, post: function (url, data) { return request({ url: url, data: data, method: 'POST' }); }, put: function (url, data) { return request({ url: url, data: data, method: 'PUT' }); } };
