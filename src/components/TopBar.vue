<template>
  <el-header height="56px" class="topbar">
    <div class="left"></div>
    <div class="right">
      <div class="select-group">
        <div class="select-item">
          <span class="select-label">站点：</span>
          <el-select
            v-model="selectedSite"
            placeholder="请选择站点"
            style="width: 180px"
            filterable
          >
            <el-option
              v-for="item in adUnitCopy"
              :key="item.abbr"
              :label="item.abbr"
              :value="item.abbr"
            />
          </el-select>
        </div>
        <div class="select-item">
          <span class="select-label">投放方式：</span>
          <el-select
            v-model="selectedMethod"
            placeholder="请选择投放方式"
            style="width: 180px"
          >
            <el-option label="DC" value="DC" />
          </el-select>
        </div>
      </div>
      <div class="logo-section">
        <span class="logo-label">logo:</span>
        <div class="logo-list">
          <div v-for="logo in selectedLogos" :key="getLogoKey(logo)" class="logo-icon">
            <papaya-image
              :src="`https://static.spga.xyz/${getLogoName(logo)}`"
              :preview="[`https://static.spga.xyz/${getLogoName(logo)}`]"
              fit="contain"
              width="36"
              height="36"
            ></papaya-image>
            <div class="logo-delete" @click.stop="removeLogo(logo)">
              <el-icon><Close /></el-icon>
            </div>
          </div>
          <div class="logo-add" @click="openLogoDialog">
            <el-icon><Plus /></el-icon>
          </div>
        </div>
      </div>
      <el-button type="primary" @click="openAccountDialog">
        账户信息
        <span v-if="accountSelectedCount > 0" class="account-count">
          ({{ accountSelectedCount }})
        </span>
      </el-button>
      <el-button type="success" @click="handleSubmit">提交</el-button>
    </div>
  </el-header>
  <AccountSelectDialog
    v-model="accountDialogVisible"
    :site="selectedSite"
    :selected-infos="accountSelectedInfos"
    @confirm="onAccountConfirm"
  />
  <CampaignConfigDialog
    v-model="configDialogVisible"
    @confirm="onConfigConfirm"
  />
  <LogoSelectDialog
    v-model="logoDialogVisible"
    :selected-logos="normalizeLogosForDialog(selectedLogos)"
    :site="selectedSite"
    @confirm="onLogoConfirm"
  />
</template>

<script setup>
import { ref, inject, onMounted, watch, computed } from "vue";
import { Plus, Close } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import AccountSelectDialog from "@components/AccountSelectDialog.vue";
import LogoSelectDialog from "@components/LogoSelectDialog.vue";
import { indexApi } from "@api/index";
import PapayaImage from "@components/papaya-image.vue";
import axios from "axios";

const props = defineProps({
  accountSelectedInfos: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:account-selected-infos'])

// 计算已选择的账户数量
const accountSelectedCount = computed(() => {
  return props.accountSelectedInfos?.length || 0
})

// 注入父组件提供的提交方法
const handleSubmitFromParent = inject("handleSubmit", null);

const accountDialogVisible = ref(false);
const configDialogVisible = ref(false);
const logoDialogVisible = ref(false);

// 站点和投放方式
const selectedSite = ref("");
const selectedMethod = ref("DC");
const adUnitCopy = ref([]);

// Logo 选中列表（存储完整的 logo 对象数组）
const selectedLogos = ref([]);

// 记录上一次的站点值
const previousSite = ref("");

onMounted(async () => {
  getAdUnitCopy();
});

// 监听站点变化，清空logo数据
watch(selectedSite, (newSite, oldSite) => {
  if (oldSite !== "" && newSite !== oldSite) {
    selectedLogos.value = [];
    // ElMessage.info("站点已切换，已清空logo选择");
  }
  previousSite.value = newSite;
});

const getAdUnitCopy = async () => {
  const res = await indexApi.getAdUnitCopy();
  adUnitCopy.value = res.result;
};

function getLogoUrl(id) {
  return "";
}

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
  emit('update:account-selected-infos', rows)
  ElMessage.success(`已选择 ${rows.length} 个账户`);
}

function onConfigConfirm(rows) {
  console.log("selected campaigns:", rows);
}

// 标准化 logos 数据用于传递给对话框（兼容字符串数组和对象数组）
function normalizeLogosForDialog(logos) {
  if (!logos || logos.length === 0) {
    return [];
  }
  // 如果已经是对象数组，直接返回
  if (typeof logos[0] === 'object' && logos[0] !== null) {
    return logos;
  }
  // 如果是字符串数组，转换为对象数组（只包含 logo_name）
  return logos.map(logoName => ({ logo_name: logoName }));
}

// 获取 logo 的唯一标识（兼容字符串和对象）
function getLogoKey(logo) {
  if (typeof logo === 'string') {
    return logo;
  }
  return logo.logo_name || logo._id || JSON.stringify(logo);
}

// 获取 logo 名称（兼容字符串和对象）
function getLogoName(logo) {
  if (typeof logo === 'string') {
    return logo;
  }
  return logo.logo_name || '';
}

function onLogoConfirm(selectedLogosArray) {
  // 接收完整的 logo 对象数组
  selectedLogos.value = selectedLogosArray;
  ElMessage.success(`已选择 ${selectedLogosArray.length} 个logo`);
}

function removeLogo(logo) {
  // 兼容处理：支持对象和字符串
  selectedLogos.value = selectedLogos.value.filter(item => {
    if (typeof logo === 'string') {
      return item !== logo && (typeof item !== 'object' || item.logo_name !== logo);
    } else {
      return (typeof item !== 'object' || item.logo_name !== logo.logo_name) && item !== logo;
    }
  });
  ElMessage.success("已删除logo");
}

// 提交
const handleSubmit = () => {
  if (handleSubmitFromParent) {
    handleSubmitFromParent();
  } else {
    ElMessage.warning("提交功能不可用");
  }
};

// 暴露给父组件的方法
defineExpose({
  selectedSite,
  selectedMethod,
  // 返回完整的 logo 对象数组
  selectedLogoIds: computed(() => selectedLogos.value),
});
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
.account-count {
  margin-left: 4px;
  font-size: 14px;
  font-weight: 500;
}

.logo-add:hover {
  border-color: #409eff;
  color: #409eff;
  background-color: #ecf5ff;
}
</style>
