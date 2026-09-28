<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete, Upload } from '@element-plus/icons-vue'
import { productApi } from '../api'

const loading = ref(false); const dialogVisible = ref(false); const editing = ref(false); const uploadRef = ref()
const filters = reactive({ keyword: '', status: '', page: 1, pageSize: 10 })
const categories = ['全部分类', '主食', '小吃', '饮品', '甜品']
const products = ref([]); const total = ref(0); const stats = reactive({ total: 0, onSale: 0, lowStock: 0, stockWarning: 10 })
const form = reactive({ goodsId: null, goodsName: '', goodsPrice: '', goodsStock: '', goodsCover: '', goodsStatus: 1, goodsSort: 0, goodsRemark: '' })
const load = async () => {
  loading.value = true
  try { const result = await productApi.list(filters); products.value = result?.records || result?.list || []; total.value = result?.total || 0; const summary = await productApi.stats(); Object.assign(stats, summary || {}) } catch { products.value = [] } finally { loading.value = false }
}
const reset = () => { filters.keyword = ''; filters.status = ''; filters.page = 1; load() }
const open = (item) => { editing.value = !!item; Object.assign(form, item || { goodsId: null, goodsName: '', goodsPrice: '', goodsStock: '', goodsCover: '', goodsStatus: 1, goodsSort: 0, goodsRemark: '' }); dialogVisible.value = true }
const save = async () => { if (!form.goodsName || !form.goodsPrice) return ElMessage.warning('请填写商品名称和售价'); try { editing.value ? await productApi.update(form.goodsId, form) : await productApi.create(form); ElMessage.success('保存成功'); dialogVisible.value = false; load() } catch { ElMessage.error('保存失败') } }
const remove = (item) => ElMessageBox.confirm(`确定删除商品「${item.goodsName}」吗？`, '删除确认', { type: 'warning' }).then(async () => { await productApi.remove(item.goodsId); ElMessage.success('已删除'); load() }).catch(() => {})
const upload = async (options) => { const data = new FormData(); data.append('file', options.file); try { const result = await productApi.upload(data); form.goodsCover = result?.url || ''; ElMessage.success('图片上传成功') } catch { ElMessage.error('图片上传失败') } }
onMounted(load)
</script>

<template>
  <div class="page-heading"><div><h1>商品管理</h1><p>管理您的商品信息、库存与展示内容</p></div><el-button type="primary" :icon="Plus" @click="open()">新增商品</el-button></div>
   <div class="stat-strip"><div><span class="stat-icon blue">▦</span><div><small>商品总数</small><strong>{{ stats.total }} <em>件</em></strong></div></div><div><span class="stat-icon green">↗</span><div><small>在售商品</small><strong>{{ stats.onSale }} <em>件</em></strong></div></div><div><span class="stat-icon orange">!</span><div><small>库存预警</small><strong>{{ stats.lowStock }} <em>件</em></strong></div></div></div>
   <section class="content-panel"><div class="filter-bar"><el-input v-model="filters.keyword" placeholder="搜索商品名称" clearable :prefix-icon="Search" @keyup.enter="filters.page = 1; load()" /><el-select v-model="filters.status" placeholder="全部状态" clearable><el-option label="在售" :value="1" /><el-option label="已下架" :value="0" /></el-select><el-button type="primary" @click="filters.page = 1; load()">搜索</el-button><el-button :icon="Refresh" @click="reset">重置</el-button></div>
   <el-table v-loading="loading" :data="products" stripe class="data-table" empty-text="暂无商品数据"><el-table-column prop="goodsName" label="商品名称" min-width="220"><template #default="{ row }"><div class="product-cell"><div class="product-thumb">{{ row.goodsCover ? '' : '食' }}<img v-if="row.goodsCover" :src="row.goodsCover" /></div><div><strong>{{ row.goodsName }}</strong><small>{{ row.goodsRemark || '暂无描述' }}</small></div></div></template></el-table-column><el-table-column prop="goodsPrice" label="售价" width="130"><template #default="{ row }"><b class="price">¥{{ Number(row.goodsPrice || 0).toFixed(2) }}</b></template></el-table-column><el-table-column prop="goodsStock" label="库存" width="110" /><el-table-column prop="goodsStatus" label="状态" width="110"><template #default="{ row }"><el-tag :type="row.goodsStatus === 0 ? 'info' : 'success'">{{ row.goodsStatus === 0 ? '已下架' : '在售' }}</el-tag></template></el-table-column><el-table-column label="操作" width="150" fixed="right"><template #default="{ row }"><el-button link type="primary" :icon="Edit" @click="open(row)">编辑</el-button><el-button link type="danger" :icon="Delete" @click="remove(row)">删除</el-button></template></el-table-column></el-table>
    <div class="pagination"><span>共 {{ total }} 条</span><el-pagination v-model:current-page="filters.page" v-model:page-size="filters.pageSize" layout="prev, pager, next" :total="total" @change="load" /></div>
  </section>
    <el-dialog v-model="dialogVisible" :title="editing ? '编辑商品' : '新增商品'" width="560px" destroy-on-close><el-form label-width="80px"><el-form-item label="商品图片"><div class="upload-row"><div class="form-image"> <img v-if="form.goodsCover" :src="form.goodsCover" /><span v-else>食</span></div><el-upload ref="uploadRef" :show-file-list="false" :http-request="upload" accept="image/*"><el-button :icon="Upload">上传图片</el-button></el-upload><small>支持 JPG、PNG，大小不超过 5MB</small></div></el-form-item><el-form-item label="商品名称" required><el-input v-model="form.goodsName" placeholder="请输入商品名称" /></el-form-item><div class="form-grid"><el-form-item label="售价" required><el-input v-model="form.goodsPrice" type="number"><template #prepend>¥</template></el-input></el-form-item><el-form-item label="库存"><el-input v-model="form.goodsStock" type="number" /></el-form-item></div><el-form-item label="销售状态"><el-select v-model="form.goodsStatus" style="width: 100%"><el-option label="在售" :value="1" /><el-option label="已下架" :value="0" /></el-select></el-form-item><el-form-item label="排序"><el-input v-model="form.goodsSort" type="number" /></el-form-item><el-form-item label="描述"><el-input v-model="form.goodsRemark" type="textarea" :rows="3" /></el-form-item></el-form><template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="save">保存商品</el-button></template></el-dialog>
</template>
