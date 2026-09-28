package com.sshop.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sshop.common.*;
import com.sshop.entity.*;
import com.sshop.mapper.*;
import com.sshop.service.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.*;

@RestController @RequestMapping("/api/wx")
public class WxController {
  private static final Logger log = LoggerFactory.getLogger(WxController.class);
  private final WxAuth auth; private final UserMapper users; private final GoodsMapper goods; private final ShopConfigMapper shops; private final OrderMapper orders; private final OrderService service; private final ObjectMapper objectMapper;
  public WxController(WxAuth a,UserMapper u,GoodsMapper g,ShopConfigMapper s,OrderMapper o,OrderService os,ObjectMapper om){auth=a;users=u;goods=g;shops=s;orders=o;service=os;objectMapper=om;}
  public record Login(@NotBlank String code,String nickName,String avatarUrl,String phone){}
  @PostMapping("/login") public ApiResponse<?> login(@Valid @RequestBody Login x){auth.configured();String body=RestClient.create().get().uri("https://api.weixin.qq.com/sns/jscode2session?appid={appid}&secret={secret}&js_code={code}&grant_type=authorization_code",auth.appId,auth.secret,x.code()).retrieve().body(String.class);log.info("微信 code2session 响应: {}",body);try{JsonNode result=objectMapper.readTree(body);if(result==null||result.get("openid")==null||result.get("openid").isNull()){String errmsg=result==null?"empty response":result.path("errmsg").asText("unknown error");String errcode=result==null?"":result.path("errcode").asText("");throw new BizException("微信登录失败"+(errcode.isBlank()?"":"("+errcode+")")+": "+errmsg);}String openid=result.get("openid").asText();User u=users.selectOne(new QueryWrapper<User>().eq("openid",openid));if(u==null){u=new User();u.setOpenid(openid);}u.setNickName(x.nickName());u.setAvatarUrl(x.avatarUrl());u.setPhone(x.phone());if(u.getUserId()==null)users.insert(u);else users.updateById(u);return ApiResponse.ok(Map.of("wxToken",auth.token(u),"user",u));}catch(BizException e){throw e;}catch(Exception e){log.error("解析微信 code2session 响应失败: {}",body,e);throw new BizException("微信登录响应格式错误");}}
  private User user(HttpServletRequest r){String t=r.getHeader("Wx-Token");if(t==null||t.isBlank())throw new BizException("缺少Wx-Token");return auth.user(t);}
  @GetMapping("/user/info") public ApiResponse<?> info(HttpServletRequest r){return ApiResponse.ok(user(r));}
  @GetMapping("/goods/list") public ApiResponse<?> goodsList(@RequestParam(defaultValue="1")long pageNum,@RequestParam(defaultValue="10")long pageSize){return ApiResponse.ok(goods.selectPage(new Page<>(pageNum,pageSize),new QueryWrapper<Goods>().eq("goods_status",1).eq("del_flag",0).orderByDesc("goods_id")));}
  @GetMapping("/goods/{goodsId}") public ApiResponse<?> goods(@PathVariable Long goodsId){Goods g=goods.selectById(goodsId);if(g==null||g.getGoodsStatus()!=1)throw new BizException("商品不存在");return ApiResponse.ok(g);}
  @GetMapping("/shop/config") public ApiResponse<?> shop(){ShopConfig config=shops.selectById(1);if(config==null){config=new ShopConfig();config.setConfigId(1L);config.setShopStatus(1);config.setStockWarning(10);}else{if(config.getShopStatus()==null)config.setShopStatus(1);if(config.getStockWarning()==null)config.setStockWarning(10);}return ApiResponse.ok(config);}
  public record Create(@NotBlank String addressInfo,String remark,@NotEmpty List<Map<String,Object>> itemList){}
  @PostMapping("/order/create") public ApiResponse<?> create(HttpServletRequest r,@Valid @RequestBody Create x){return ApiResponse.ok(service.create(user(r).getUserId(),x.addressInfo(),x.remark(),x.itemList()));}
  @GetMapping("/order/list") public ApiResponse<?> list(HttpServletRequest r,@RequestParam(required=false)Integer orderStatus){QueryWrapper<Order> q=new QueryWrapper<Order>().eq("user_id",user(r).getUserId()).eq("del_flag",0).orderByDesc("order_id");if(orderStatus!=null)q.eq("order_status",orderStatus);return ApiResponse.ok(orders.selectList(q));}
  @GetMapping("/order/{orderNo}") public ApiResponse<?> detail(HttpServletRequest r,@PathVariable String orderNo){User u=user(r);Order o=orders.selectOne(new QueryWrapper<Order>().eq("order_no",orderNo).eq("user_id",u.getUserId()).eq("del_flag",0));if(o==null)throw new BizException("订单不存在");return ApiResponse.ok(service.detail(o.getOrderId()));}
}
