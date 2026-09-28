<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { shopApi } from '../api'

const loading = ref(false)
const saving = ref(false)
const form = reactive({ configId: 1, payQrcode: '', deliveryTip: '', stockWarning: 10, shopStatus: 1 })
const loadConfig = async () => { loading.value = true; try { Object.assign(form, await shopApi.get()) } catch { ElMessage.error('店铺配置加载失败') } finally { loading.value = false } }
onMounted(loadConfig)
const upload = async (options) => { const data = new FormData(); data.append('file', options.file); try { form.payQrcode = (await shopApi.upload(data))?.url || ''; ElMessage.success('收款码上传成功') } catch { ElMessage.error('图片上传失败') } }
const save = async () => { saving.value = true; try { const latest = await shopApi.update(form); Object.assign(form, latest || {}); await loadConfig(); window.dispatchEvent(new CustomEvent('shop-config-updated', { detail: { shopStatus: form.shopStatus } })); ElMessage.success('店铺设置已保存') } catch { ElMessage.error('保存失败，请稍后重试') } finally { saving.value = false } }
</script>
<template>
  <section v-loading="loading" class="settings-layout"><div class="settings-main content-panel"><el-form label-position="top"><el-form-item label="店铺状态"><el-radio-group v-model="form.shopStatus"><el-radio-button :value="1">营业中</el-radio-button><el-radio-button :value="0">歇业中</el-radio-button></el-radio-group></el-form-item><el-form-item label="配送提示"><el-input v-model="form.deliveryTip" type="textarea" :rows="5" placeholder="例如：接单后约30分钟送达" /></el-form-item><el-form-item label="库存预警数量"><el-input-number v-model="form.stockWarning" :min="0" :max="999999" /></el-form-item></el-form><el-divider /><label>线下收款码</label><div class="qrcode-uploader"><div class="qrcode-preview"><img v-if="form.payQrcode" :src="form.payQrcode" /><span v-else>码</span></div><el-upload :show-file-list="false" :http-request="upload" accept="image/*"><el-button size="small" :icon="Upload">上传收款码</el-button></el-upload><small>图片按原比例完整展示</small></div><el-button type="primary" :loading="saving" @click="save">保存设置</el-button></div></section>
</template>
<style scoped>
.qrcode-uploader { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.qrcode-preview { width: 220px; aspect-ratio: 1; display: grid; place-items: center; overflow: hidden; border: 1px solid #e5e7eb; background: #f8fafc; }
.qrcode-preview img { width: 100%; height: 100%; object-fit: contain; display: block; }
.qrcode-preview span { color: #9ca3af; font-size: 32px; }
.qrcode-uploader small { color: #8b95a7; }
</style>
