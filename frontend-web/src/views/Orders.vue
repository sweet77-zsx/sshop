<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, View, Check, Close, CircleCheck } from '@element-plus/icons-vue'
import { orderApi } from '../api'

const loading = ref(false)
const drawer = ref(false)
const detail = ref({})
const orders = ref([])
const total = ref(0)
const filters = reactive({ status: '', page: 1, pageSize: 10 })
const stats = reactive({ all: 0, pending: 0, delivering: 0, completed: 0, rejected: 0 })
const statusText = (status) => ({ 0: '待接单', 1: '配送中', 2: '已完成', 3: '已拒绝' })[Number(status)] || '未知状态'
const load = async () => {
  loading.value = true
  try { const result = await orderApi.list(filters); orders.value = result?.records || []; total.value = result?.total || 0; Object.assign(stats, await orderApi.stats() || {}) } catch { orders.value = [] } finally { loading.value = false }
}
const showDetail = async (row) => { try { const result = await orderApi.detail(row.orderId); detail.value = result?.order ? { ...result.order, itemList: result.itemList || [], payQrcode: result.payQrcode, deliveryTip: result.deliveryTip } : result } catch { detail.value = { ...row, itemList: [] } }; drawer.value = true }
const act = async (row, type) => { try { await orderApi[type](row.orderId); ElMessage.success('操作成功'); load() } catch { ElMessage.error('操作失败') } }
onMounted(load)
</script>
<template>
  <div class="page-heading"><div><h1>订单管理</h1><p>及时处理订单，掌握店铺经营动态</p></div></div>
   <section class="content-panel"><div class="order-tabs"><button :class="{ active: filters.status === '' }" @click="filters.status = ''; filters.page = 1; load()">全部 <b>{{ stats.all }}</b></button><button :class="{ active: filters.status === '0' }" @click="filters.status = '0'; filters.page = 1; load()">待接单 <b>{{ stats.pending }}</b></button><button :class="{ active: filters.status === '1' }" @click="filters.status = '1'; filters.page = 1; load()">配送中 <b>{{ stats.delivering }}</b></button><button :class="{ active: filters.status === '2' }" @click="filters.status = '2'; filters.page = 1; load()">已完成 <b>{{ stats.completed }}</b></button><button :class="{ active: filters.status === '3' }" @click="filters.status = '3'; filters.page = 1; load()">已拒绝 <b>{{ stats.rejected }}</b></button></div><div class="filter-bar order-filter"><el-select v-model="filters.status" placeholder="全部状态" clearable><el-option label="待接单" value="0" /><el-option label="配送中" value="1" /><el-option label="已完成" value="2" /><el-option label="已拒绝" value="3" /></el-select><el-button type="primary" @click="filters.page = 1; load()">筛选</el-button><el-button :icon="Refresh" @click="Object.assign(filters, { status: '', page: 1, pageSize: 10 }); load()">重置</el-button></div>
     <el-table v-loading="loading" :data="orders" stripe class="data-table" empty-text="暂无订单数据"><el-table-column prop="orderNo" label="订单编号" min-width="170" /><el-table-column label="顾客" width="130"><template #default="{ row }">{{ row.userNickName || row.user?.userNickName || '-' }}</template></el-table-column><el-table-column prop="createTime" label="下单时间" width="170" /><el-table-column label="订单金额" width="130"><template #default="{ row }"><b class="price">¥{{ Number(row.totalAmount || 0).toFixed(2) }}</b></template></el-table-column><el-table-column label="订单状态" width="120"><template #default="{ row }"><el-tag :type="Number(row.orderStatus) === 0 ? 'warning' : Number(row.orderStatus) === 1 ? 'primary' : Number(row.orderStatus) === 2 ? 'success' : 'info'">{{ statusText(row.orderStatus) }}</el-tag></template></el-table-column><el-table-column label="操作" min-width="220" fixed="right"><template #default="{ row }"><el-button link :icon="View" @click="showDetail(row)">详情</el-button><el-button link type="primary" :icon="Check" v-if="Number(row.orderStatus) === 0" @click="act(row, 'accept')">接单</el-button><el-button link type="danger" :icon="Close" v-if="Number(row.orderStatus) === 0" @click="act(row, 'reject')">拒绝</el-button><el-button link type="success" :icon="CircleCheck" v-if="Number(row.orderStatus) === 1" @click="act(row, 'finish')">完成</el-button></template></el-table-column></el-table>
    <div class="pagination"><span>共 {{ total }} 条</span><el-pagination v-model:current-page="filters.page" v-model:page-size="filters.pageSize" layout="prev, pager, next" :total="total" @change="load" /></div>
  </section>
   <el-drawer v-model="drawer" title="订单详情" size="480px"><div class="drawer-detail"><div><label>订单编号</label>{{ detail.orderNo }}</div><div><label>顾客</label>{{ detail.userNickName || detail.user?.userNickName || '-' }}</div><div><label>订单状态</label>{{ statusText(detail.orderStatus) }}</div><div><label>收货地址</label>{{ detail.addressInfo }}</div><div><label>学生备注</label>{{ detail.remark || '无' }}</div><div><label>订单金额</label><b class="price">¥{{ Number(detail.totalAmount || 0).toFixed(2) }}</b></div><div><label>下单时间</label>{{ detail.createTime }}</div><div v-if="detail.itemList?.length" class="order-items"><label>商品明细</label><div v-for="item in detail.itemList" :key="item.itemId" class="order-item"><span>{{ item.goodsName }} × {{ item.goodsNum }}</span><b>¥{{ Number(item.goodsPrice || 0).toFixed(2) }}</b></div></div><div v-if="detail.deliveryTip"><label>配送提示</label>{{ detail.deliveryTip }}</div></div></el-drawer>
</template>
