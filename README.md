# 校园宿舍零食配送小程序

校园宿舍零食配送系统，面向校园小卖部和学生用户，支持微信原生小程序下单、Vue3 商家后台管理，以及小程序商家配送端。

项目采用自研轻量架构，不依赖若依等后台脚手架。

## 项目结构

```text
sshop/
├── backend/          Spring Boot 后端服务
├── frontend-web/     Vue3 + Element Plus 商家 PC 管理后台
├── frontend-wx/      微信原生小程序，包含顾客端和商家配送端
└── README.md
```

## 功能概览

### 顾客微信小程序

- 微信登录，自动获取用户身份
- 商品浏览和搜索
- 本地购物车
- 商品数量加减和库存限制
- 楼栋、房间号、备注下单
- 订单列表和订单详情
- 订单状态轮询
- 线下收款码展示
- 店铺营业中、歇业中状态展示
- 微信订阅消息授权入口

### 商家 PC 管理后台

- 管理员账号密码登录
- 商品新增、编辑、上下架、删除
- 商品价格、库存、排序和图片管理
- 商品总数、在售数量、库存预警统计
- 订单状态 Tab 和真实数量统计
- 订单详情、接单、拒绝、确认完成
- 店铺营业状态设置
- 配送提示设置
- 库存预警数量设置
- 线下收款码上传
- S3 兼容对象存储上传

### 商家配送小程序端

- 管理员账号密码登录
- 查看配送订单
- 查看顾客昵称、宿舍地址、备注和商品明细
- 接单、拒绝、确认完成
- 查看和打开线下收款码
- 退出配送端后返回“我的”页面
- 与顾客端共用同一个微信小程序，管理员 Token 与顾客 Token 独立

## 技术栈

### 后端

- Java 17
- Spring Boot 3.3
- MyBatis-Plus
- MySQL 8
- JWT 管理员鉴权
- 微信 `code2session` 登录
- AWS SDK S3，兼容阿里云 OSS、腾讯云 COS、七牛云 Kodo、MinIO 等 S3 协议服务

### 商家 Web

- Vue 3
- Vite
- Vue Router
- Element Plus
- Axios

### 微信小程序

- WXML
- WXSS
- JavaScript
- 不依赖第三方小程序组件库

## 后端启动

进入后端目录：

```powershell
cd backend
```

创建数据库并执行：

```text
backend/src/main/resources/schema.sql
```

已有旧数据库需要按实际情况执行迁移脚本：

```text
backend/src/main/resources/migration-stock-warning.sql
backend/src/main/resources/migration-shop-status.sql
```

配置数据库、微信和对象存储环境变量：

```powershell
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your-password"
$env:OSS_ACCESS_KEY = "your-access-key"
$env:OSS_SECRET_KEY = "your-secret-key"
$env:OSS_BUCKET = "your-bucket"
```

微信小程序配置在 `backend/src/main/resources/application.yml` 的 `app.wx` 中，生产环境建议改为环境变量或独立配置文件。

启动：

```powershell
mvn spring-boot:run
```

默认后端地址：

```text
http://localhost:8080
```

默认管理员账号：

```text
账号：admin
密码：secret
```

生产环境请立即修改管理员密码，并更换 JWT 密钥。

## 商家 Web 启动

```powershell
cd frontend-web
npm install
npm run dev
```

默认访问地址：

```text
http://localhost:5173
```

API 地址配置在 `frontend-web/.env`，可参考：

```text
frontend-web/.env.example
```

示例：

```text
VITE_API_BASE_URL=http://localhost:8080
```

## 微信小程序运行

使用微信开发者工具打开：

```text
frontend-wx
```

后端地址配置在：

```text
frontend-wx/app.js
```

开发环境示例：

```js
apiBaseUrl: 'http://127.0.0.1:8080'
```

真机调试时需要替换为可访问的 HTTPS 后端地址，并在微信公众平台配置合法域名。

## 主要接口

### 管理员接口

```text
POST /api/admin/login
GET  /api/goods/list
POST /api/goods
PUT  /api/goods/{goodsId}
DELETE /api/goods/{goodsIds}
GET  /api/goods/stats
GET  /api/order/list
GET  /api/order/stats
GET  /api/order/{orderId}
PUT  /api/order/accept/{orderId}
PUT  /api/order/reject/{orderId}
PUT  /api/order/finish/{orderId}
GET  /api/shop/config
PUT  /api/shop/config
POST /api/upload
```

### 顾客小程序接口

```text
POST /api/wx/login
GET  /api/wx/user/info
GET  /api/wx/goods/list
GET  /api/wx/goods/{goodsId}
POST /api/wx/order/create
GET  /api/wx/order/list
GET  /api/wx/order/{orderNo}
GET  /api/wx/shop/config
```

管理员接口使用：

```http
Authorization: Bearer {jwtToken}
```

顾客接口使用：

```http
Wx-Token: {wxToken}
```

两套 Token 相互独立。

## 订单与库存规则

订单状态：

```text
0 待接单 -> 1 配送中
0 待接单 -> 3 已拒绝
1 配送中 -> 2 已完成
```

下单时后端使用带库存条件的原子 SQL 扣减库存：

```text
goods_stock >= goods_num
```

库存不足时订单事务回滚，避免超卖和负库存。同一订单中的重复商品会先合并数量。商家拒绝订单时自动回补库存。

## 对象存储配置

上传接口保持不变：

```text
POST /api/upload
```

启用 S3 兼容存储：

```yaml
app:
  oss:
    enabled: true
    endpoint: https://your-s3-endpoint
    region: us-east-1
    access-key: ${OSS_ACCESS_KEY:}
    secret-key: ${OSS_SECRET_KEY:}
    bucket: ${OSS_BUCKET:}
    public-url: https://cdn.example.com
    key-prefix: uploads
    path-style: false
```

MinIO 通常使用：

```yaml
path-style: true
```

开发环境也可以设置 `enabled: false`，使用 `app.upload-dir` 本地存储。

## 数据库表

```text
cs_admin
cs_goods
cs_user
cs_order
cs_order_item
cs_shop_config
```

公共字段包括创建时间、更新时间和逻辑删除标记。

## 构建验证

后端：

```powershell
cd backend
mvn -q -DskipTests package
```

Web 前端：

```powershell
cd frontend-web
npm run build
```

小程序静态检查：

```powershell
cd frontend-wx
node --check pages/index/index.js
```

## 注意事项

- 项目不接入微信支付，订单金额仅用于展示。
- 顾客购物车只保存在小程序本地，不落库。
- 微信小程序真机必须使用 HTTPS 后端地址。
- 不要将数据库密码、微信 AppSecret、OSS 密钥提交到 Git。
- 不要提交 `node_modules`、`target`、`dist`、上传文件和本地环境配置。
