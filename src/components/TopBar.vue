<template>
  <el-header height="56px" class="topbar">
    <div class="left">快速投放</div>
    <div class="right">
      <div class="select-group">
        <div class="select-item">
          <span class="select-label">站点：</span>
          <el-select v-model="selectedSite" placeholder="请选择站点" style="width: 180px">
            <el-option label="PT" value="PT" />
            <el-option label="TK" value="TK" />
            <el-option label="FB" value="FB" />
            <el-option label="GG" value="GG" />
          </el-select>
        </div>
        <div class="select-item">
          <span class="select-label">投放方式：</span>
          <el-select v-model="selectedMethod" placeholder="请选择投放方式" style="width: 180px">
            <el-option label="DC" value="DC" />
            <el-option label="RC" value="RC" />
            <el-option label="Auto" value="Auto" />
          </el-select>
        </div>
      </div>
      <div class="logo-section">
        <span class="logo-label">logo:</span>
        <div class="logo-list">
          <div 
            v-for="logoId in selectedLogos" 
            :key="logoId"
            class="logo-icon"
          >
            <img :src="getLogoUrl(logoId)" alt="logo" />
            <div class="logo-delete" @click.stop="removeLogo(logoId)">
              <el-icon><Close /></el-icon>
            </div>
          </div>
          <div class="logo-add" @click="openLogoDialog">
            <el-icon><Plus /></el-icon>
          </div>
        </div>
      </div>
      <el-button type="primary" @click="openAccountDialog"
        >账户信息</el-button
      >
      <el-button type="success" @click="handleSubmit">提交</el-button>
    </div>
  </el-header>
  <AccountSelectDialog
    v-model="accountDialogVisible"
    @confirm="onAccountConfirm"
  />
  <CampaignConfigDialog
    v-model="configDialogVisible"
    @confirm="onConfigConfirm"
  />
  <LogoSelectDialog
    v-model="logoDialogVisible"
    :selected-logos="selectedLogos"
    @confirm="onLogoConfirm"
  />
</template>

<script setup>
import { ref, onMounted, computed, inject } from "vue";
import { Plus, Close } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import AccountSelectDialog from "@components/AccountSelectDialog.vue";
import LogoSelectDialog from "@components/LogoSelectDialog.vue";
import { useLogo, useAccount } from '@/composables';

// 注入父组件提供的提交方法
const handleSubmitFromParent = inject('handleSubmit', null);

const accountDialogVisible = ref(false);
const configDialogVisible = ref(false);
const logoDialogVisible = ref(false);

// 站点和投放方式
const selectedSite = ref('PT');
const selectedMethod = ref('DC');

// 使用 Logo 管理 composable
const { 
  logos, 
  selectedLogoIds, 
  fetchLogos, 
  setSelectedLogoIds,
  deleteLogo: deleteLogoApi
} = useLogo()

// 使用账户管理 composable
const {
  accounts,
  fetchAccounts,
  selectAccounts
} = useAccount()

// Logo 数据映射
const logoMap = computed(() => {
  const map = {}
  logos.value.forEach(logo => {
    map[logo.id] = logo.url
  })
  return map
})

function getLogoUrl(id) {
  return logoMap.value[id] || '';
}

// 组件挂载时获取数据
onMounted(async () => {
  await Promise.all([
    fetchLogos(),
    fetchAccounts()
  ])
})

function openAccountDialog() {
  accountDialogVisible.value = true;
}
function openConfigDialog() {
  configDialogVisible.value = true;
}
function openLogoDialog() {
  logoDialogVisible.value = true;
}

function onAccountConfirm(rows) {
  console.log("selected accounts:", rows);
  ElMessage.success(`已选择 ${rows.length} 个账户`)
}

function onConfigConfirm(rows) {
  console.log("selected campaigns:", rows);
}

function onLogoConfirm(logoIds) {
  setSelectedLogoIds(logoIds)
  ElMessage.success(`已选择 ${logoIds.length} 个logo`)
}

async function removeLogo(logoId) {
  await deleteLogoApi(logoId)
  const newLogoIds = selectedLogoIds.value.filter(id => id !== logoId)
  setSelectedLogoIds(newLogoIds)
}

// 提交
const handleSubmit = () => {
  if (handleSubmitFromParent) {
    handleSubmitFromParent()
  } else {
    ElMessage.warning('提交功能不可用')
  }
}

// 暴露给父组件的方法
defineExpose({
  selectedSite,
  selectedMethod,
  selectedLogoIds
})
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
}
.left {
  color: #1470fc;
  font-family: Inter;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
  margin-left: 10px;
  flex: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}
.right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.select-group {
  display: flex;
  align-items: center;
  gap: 16px;
}
.select-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.select-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
}
.logo-section {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  border-left: 1px solid var(--el-border-color);
  border-right: 1px solid var(--el-border-color);
}
.logo-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
}
.logo-list {
  display: flex;
  align-items: center;
  gap: 8px;
}
.logo-icon {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  overflow: visible;
  border: 1px solid #e0e3eb;
  cursor: pointer;
  transition: all 0.3s ease;
}
.logo-icon:hover {
  border-color: #409eff;
  transform: scale(1.05);
}
.logo-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}
.logo-icon .logo-delete {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 18px;
  height: 18px;
  background: #f56c6c;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
}
.logo-icon:hover .logo-delete {
  opacity: 1;
}
.logo-delete:hover {
  background: #f23030;
  transform: scale(1.1);
}
.logo-add {
  width: 36px;
  height: 36px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #909399;
}
.logo-add:hover {
  border-color: #409eff;
  color: #409eff;
  background-color: #ecf5ff;
}
</style>
