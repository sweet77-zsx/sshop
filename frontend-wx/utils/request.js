function request(options) {
  var app = getApp();
  var token = wx.getStorageSync('Wx-Token');
  var url = (app.apiBaseUrl || '') + (options.url || '');
  var header = Object.assign({ 'content-type': 'application/json' }, options.header || {});
  if (token && !options.skipLogin) header['Wx-Token'] = token;
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url, method: options.method || 'GET', data: options.data || {}, header: header,
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (!res.data || res.data.code !== 200) { reject(new Error((res.data && res.data.message) || '请求失败')); return; }
          resolve(res.data.data);
        }
        else if (res.statusCode === 401 && !options.skipLogin) {
          wx.removeStorageSync('Wx-Token');
          app.login().then(function () { request(options).then(resolve).catch(reject); }).catch(reject);
        } else reject(new Error((res.data && (res.data.message || res.data.msg)) || '请求失败'));
      },
      fail: reject
    });
  });
}
module.exports = {
  get: function (url, data) { return request({ url: url, data: data }); },
  post: function (url, data, extra) { return request(Object.assign({ url: url, data: data, method: 'POST' }, extra || {})); },
  put: function (url, data) { return request({ url: url, data: data, method: 'PUT' }); }
};
