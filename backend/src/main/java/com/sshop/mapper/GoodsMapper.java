package com.sshop.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.sshop.entity.Goods;
import org.apache.ibatis.annotations.Update;

public interface GoodsMapper extends BaseMapper<Goods> {
    @Update("UPDATE cs_goods SET goods_stock = goods_stock - #{quantity} WHERE goods_id = #{goodsId} AND goods_status = 1 AND del_flag = 0 AND goods_stock >= #{quantity}")
    int deductStock(Long goodsId, Integer quantity);

    @Update("UPDATE cs_goods SET goods_stock = goods_stock + #{quantity} WHERE goods_id = #{goodsId} AND del_flag = 0")
    int restoreStock(Long goodsId, Integer quantity);
}
