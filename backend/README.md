# sshop backend

Spring Boot 3.3 + Java 17 + MyBatis-Plus + MySQL backend.

Default admin: `admin` / `secret`. `POST /api/admin/login` returns `jwtToken`; send it as `Authorization: Bearer <jwtToken>`.

Admin endpoints: `GET /api/goods/list`, `GET/POST/PUT/DELETE /api/goods`, `GET /api/order/list`, `GET /api/order/{orderId}`, `PUT /api/order/accept/{id}`, `PUT /api/order/reject/{id}`, `PUT /api/order/finish/{id}`, `GET/PUT /api/shop/config`, `POST /api/upload`.

Mini-program endpoints: `POST /api/wx/login` returns `wxToken`, `GET /api/wx/user/info`, `GET /api/wx/goods/list`, `GET /api/wx/goods/{goodsId}`, `POST /api/wx/order/create`, `GET /api/wx/order/list`, `GET /api/wx/order/{orderNo}`, `GET /api/wx/shop/config`. User endpoints require `Wx-Token`.

Shop status is stored in `cs_shop_config.shop_status`: `1` is open and `0` is closed. Existing databases should run `migration-shop-status.sql`.

## S3-compatible object storage

`POST /api/upload` uses the independent `com.sshop.oss` package. It supports any S3-compatible provider, including Alibaba Cloud OSS, Tencent COS, Qiniu Kodo, and MinIO. Configure `app.oss` in `application.yml`:

```yaml
app:
  oss:
    enabled: true
    endpoint: https://your-provider-endpoint
    region: us-east-1
    access-key: ${OSS_ACCESS_KEY}
    secret-key: ${OSS_SECRET_KEY}
    bucket: ${OSS_BUCKET}
    public-url: https://cdn.example.com
    key-prefix: uploads
    path-style: false
```

Set `path-style: true` for MinIO when using path-style bucket addressing. `public-url` should be the bucket's public domain or CDN domain. When `enabled: false`, uploads use the configured local `app.upload-dir` directory.

Order status transitions are strictly `0 -> 1/3` and `1 -> 2`. Creation validates goods and quantity, atomically decrements stock to prevent overselling, and subscription-message failures are logged without affecting the order. Rejecting an order restores its stock.
