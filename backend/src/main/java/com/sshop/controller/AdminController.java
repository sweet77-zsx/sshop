package com.sshop.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sshop.common.*;
import com.sshop.config.JwtService;
import com.sshop.entity.*;
import com.sshop.mapper.*;
import com.sshop.service.OrderService;
import com.sshop.oss.OssService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
public class AdminController {
    private final AdminMapper admins;
    private final GoodsMapper goods;
    private final OrderMapper orders;
    private final UserMapper users;
    private final ShopConfigMapper configs;
    private final OrderService orderService;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final OssService oss;

    public AdminController(AdminMapper a, GoodsMapper g, OrderMapper o, UserMapper u, ShopConfigMapper c, OrderService os, PasswordEncoder e, JwtService j, OssService oss) {
        admins = a;
        goods = g;
        orders = o;
        users = u;
        configs = c;
        orderService = os;
        encoder = e;
        jwt = j;
        this.oss = oss;
    }

    public record Login(@NotBlank String username, @NotBlank String password) {
    }

    @PostMapping("/api/admin/login")
    public ApiResponse<?> login(@Valid @RequestBody Login x) {
        Admin a = admins.selectOne(new QueryWrapper<Admin>().eq("username", x.username()));
        if (a == null || !encoder.matches(x.password(), a.getPassword())) throw new BizException("用户名或密码错误");
        return ApiResponse.ok(Map.of("jwtToken", jwt.create(a.getAdminId().toString(), "admin"), "admin", a));
    }

    @GetMapping("/api/goods/list")
    public ApiResponse<?> goodsList(@RequestParam(defaultValue = "1") long pageNum, @RequestParam(defaultValue = "10") long pageSize, @RequestParam(required = false) String goodsName, @RequestParam(required = false) Integer goodsStatus) {
        QueryWrapper<Goods> q = new QueryWrapper<Goods>().eq("del_flag", 0).orderByDesc("goods_id");
        if (goodsName != null && !goodsName.isBlank()) q.like("goods_name", goodsName);
        if (goodsStatus != null) q.eq("goods_status", goodsStatus);
        return ApiResponse.ok(goods.selectPage(new Page<>(pageNum, pageSize), q));
    }

    @GetMapping("/api/goods/stats")
    public ApiResponse<?> goodsStats() {
        ShopConfig config = configs.selectById(1);
        int warning = config == null || config.getStockWarning() == null ? 10 : config.getStockWarning();
        QueryWrapper<Goods> active = new QueryWrapper<Goods>().eq("del_flag", 0);
        long total = goods.selectCount(active);
        long onSale = goods.selectCount(new QueryWrapper<Goods>().eq("del_flag", 0).eq("goods_status", 1));
        long lowStock = goods.selectCount(new QueryWrapper<Goods>().eq("del_flag", 0).le("goods_stock", warning));
        return ApiResponse.ok(Map.of("total", total, "onSale", onSale, "lowStock", lowStock, "stockWarning", warning));
    }

    @PostMapping("/api/goods")
    public ApiResponse<?> add(@RequestBody Goods g) {
        g.setGoodsId(null);
        if (g.getGoodsStatus() == null) g.setGoodsStatus(1);
        if (g.getGoodsStock() == null) g.setGoodsStock(0);
        if (g.getGoodsSort() == null) g.setGoodsSort(0);
        g.setDelFlag(0);
        goods.insert(g);
        return ApiResponse.ok(g);
    }

    @PutMapping("/api/goods/{id}")
    public ApiResponse<?> edit(@PathVariable Long id, @RequestBody Goods g) {
        g.setGoodsId(id);
        if (g.getGoodsStatus() == null) g.setGoodsStatus(1);
        if (g.getGoodsStock() == null) g.setGoodsStock(0);
        if (g.getGoodsSort() == null) g.setGoodsSort(0);
        g.setDelFlag(0);
        goods.updateById(g);
        return ApiResponse.ok(goods.selectById(id));
    }

    @DeleteMapping("/api/goods/{goodsIds}")
    public ApiResponse<?> delete(@PathVariable String goodsIds) {
        List<Long> ids = Arrays.stream(goodsIds.split(",")).map(String::trim).filter(s -> !s.isEmpty()).map(Long::valueOf).toList();
        if (ids.isEmpty()) throw new BizException("商品ID不能为空");
        Goods update = new Goods();
        update.setDelFlag(1);
        goods.update(update, new QueryWrapper<Goods>().in("goods_id", ids));
        return ApiResponse.ok();
    }

    @GetMapping("/api/order/list")
    public ApiResponse<?> orderList(@RequestParam(defaultValue = "1") long pageNum, @RequestParam(defaultValue = "10") long pageSize, @RequestParam(required = false) String orderNo, @RequestParam(required = false) Integer orderStatus) {
        QueryWrapper<Order> q = new QueryWrapper<Order>().eq("del_flag", 0).orderByDesc("order_id");
        if (orderNo != null && !orderNo.isBlank()) q.like("order_no", orderNo);
        if (orderStatus != null) q.eq("order_status", orderStatus);
        Page<Order> result = orders.selectPage(new Page<>(pageNum, pageSize), q);
        result.getRecords().forEach(o -> {
            User u = users.selectById(o.getUserId());
            o.setUserNickName(u == null ? null : u.getNickName());
        });
        return ApiResponse.ok(result);
    }

    @GetMapping("/api/order/{orderId}")
    public ApiResponse<?> order(@PathVariable Long orderId) {
        return ApiResponse.ok(orderService.detail(orderId));
    }

    @GetMapping("/api/order/stats")
    public ApiResponse<?> orderStats() {
        long all = orders.selectCount(new QueryWrapper<Order>().eq("del_flag", 0));
        long pending = orders.selectCount(new QueryWrapper<Order>().eq("del_flag", 0).eq("order_status", 0));
        long delivering = orders.selectCount(new QueryWrapper<Order>().eq("del_flag", 0).eq("order_status", 1));
        long completed = orders.selectCount(new QueryWrapper<Order>().eq("del_flag", 0).eq("order_status", 2));
        long rejected = orders.selectCount(new QueryWrapper<Order>().eq("del_flag", 0).eq("order_status", 3));
        return ApiResponse.ok(Map.of("all", all, "pending", pending, "delivering", delivering, "completed", completed, "rejected", rejected));
    }

    @PutMapping("/api/order/accept/{id}")
    public ApiResponse<?> accept(@PathVariable Long id) {
        return ApiResponse.ok(orderService.transition(id, 1));
    }

    @PutMapping("/api/order/reject/{id}")
    public ApiResponse<?> reject(@PathVariable Long id) {
        return ApiResponse.ok(orderService.transition(id, 3));
    }

    @PutMapping("/api/order/finish/{id}")
    public ApiResponse<?> finish(@PathVariable Long id) {
        return ApiResponse.ok(orderService.transition(id, 2));
    }

    @GetMapping("/api/shop/config")
    public ApiResponse<?> shop() {
        ShopConfig config = configs.selectById(1);
        if (config == null) {
            config = new ShopConfig();
            config.setConfigId(1L);
            config.setStockWarning(10);
            config.setShopStatus(1);
        } else if (config.getStockWarning() == null) {
            config.setStockWarning(10);
        }
        if (config.getShopStatus() == null) config.setShopStatus(1);
        return ApiResponse.ok(config);
    }

    @PutMapping("/api/shop/config")
    public ApiResponse<?> shop(@RequestBody ShopConfig c) {
        c.setConfigId(1L);
        if (c.getStockWarning() == null || c.getStockWarning() < 0) {
            throw new BizException("库存预警数量不能小于0");
        }
        if (c.getShopStatus() == null || (c.getShopStatus() != 0 && c.getShopStatus() != 1)) {
            throw new BizException("店铺状态不合法");
        }
        configs.insertOrUpdate(c);
        return shop();
    }

    @PostMapping("/api/upload")
    public ApiResponse<?> upload(@RequestParam MultipartFile file) {
        return ApiResponse.ok(Map.of("url", oss.upload(file)));
    }
}
