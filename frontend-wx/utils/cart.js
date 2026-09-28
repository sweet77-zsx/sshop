var KEY = 'sshop_cart';
function get() { return wx.getStorageSync(KEY) || []; }
function save(items) { wx.setStorageSync(KEY, items); return items; }
function add(product, quantity) {
  var items = get(), id = product.goodsId;
  var found = items.filter(function (item) { return String(item.goodsId) === String(id); })[0];
  var stock = Number(product.goodsStock == null ? 999999 : product.goodsStock);
  if (stock <= 0) return save(items);
  if (found) found.goodsNum = Math.min(stock, found.goodsNum + (quantity || 1));
  else items.push({ goodsId: id, goodsName: product.goodsName, goodsPrice: Number(product.goodsPrice || 0), goodsCover: product.goodsCover, goodsStock: stock, goodsNum: Math.min(stock, quantity || 1) });
  return save(items);
}
function remove(id) { return save(get().filter(function (item) { return String(item.goodsId) !== String(id); })); }
function update(id, quantity) { return save(get().map(function (item) { if (String(item.goodsId) === String(id)) item.goodsNum = Math.min(Number(item.goodsStock == null ? 999999 : item.goodsStock), Math.max(1, quantity)); return item; })); }
module.exports = { get: get, add: add, remove: remove, update: update, clear: function () { return save([]); } };
