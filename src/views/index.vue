<script setup>
import { ref, provide, onMounted, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import TopBar from "@components/TopBar.vue";
import SideBar from "@components/SideBar.vue";
import CampaignGrid from "@components/CampaignGrid.vue";
import { createDefaultCampaignSet } from '@types/campaign'
import { useLogo } from '@/composables'

const topBarRef = ref(null)
const sidebarRef = ref(null)
const campaignGridRef = ref(null)

// CampaignSets 数据 (对应 SP 项目)
const campaignSets = ref([])

// Logo 管理
const { 
  logos, 
  fetchLogos
} = useLogo()

// logoMap (提供给子组件)
const logoMap = computed(() => {
  const map = {}
  logos.value.forEach(logo => {
    map[logo.id] = logo.url
  })
  return map
})

// Campaign 剪贴板
const campaignClipboard = ref(null)

// 自动保存相关
const autoSaveEnabled = ref(true)
const lastSaveTime = ref(null)
const CACHE_KEY = 'campaign_assembly_cache'
const SAVE_INTERVAL = 30000 // 30秒自动保存一次

// 组件挂载时加载数据
onMounted(async () => {
  // 加载 Logo 列表
  await fetchLogos()
  
  // 尝试从缓存恢复数据
  loadCacheData()
  
  // 如果没有数据，初始化一个 CampaignSet
  if (campaignSets.value.length === 0) {
    campaignSets.value.push(createDefaultCampaignSet())
  }
  
  // 启动自动保存
  if (autoSaveEnabled.value) {
    startAutoSave()
  }
})

// 监听 campaignSets 变化，自动保存到 localStorage
watch(campaignSets, () => {
  if (autoSaveEnabled.value) {
    saveCacheData()
  }
}, { deep: true })

// 保存到缓存
const saveCacheData = () => {
  try {
    const cacheData = {
      campaignSets: campaignSets.value,
      timestamp: Date.now()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    lastSaveTime.value = new Date()
  } catch (error) {
    console.error('保存缓存失败:', error)
  }
}

// 从缓存加载
const loadCacheData = () => {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY)
    if (cacheStr) {
      const cacheData = JSON.parse(cacheStr)
      // 只加载 24 小时内的缓存
      if (Date.now() - cacheData.timestamp < 86400000) {
        campaignSets.value = cacheData.campaignSets || []
        lastSaveTime.value = new Date(cacheData.timestamp)
        ElMessage.success('已从缓存恢复数据')
      }
    }
  } catch (error) {
    console.error('加载缓存失败:', error)
  }
}

// 清除缓存
const clearCacheData = () => {
  localStorage.removeItem(CACHE_KEY)
  lastSaveTime.value = null
}

// 启动自动保存
const startAutoSave = () => {
  setInterval(() => {
    if (campaigns.value.length > 0) {
      saveCacheData()
    }
  }, SAVE_INTERVAL)
}

// 格式化缓存时间
const formatCacheTime = computed(() => {
  if (!lastSaveTime.value) return ''
  const date = new Date(lastSaveTime.value)
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
})

// 添加新卡片
const handleAddNew = () => {
  campaignSets.value.push(createDefaultCampaignSet())
  ElMessage.success('已添加新配置面板')
}

// 删除卡片
const handleDelete = (index) => {
  if (index >= 0 && index < campaignSets.value.length) {
    campaignSets.value.splice(index, 1)
    ElMessage.success('已删除配置面板')
  }
}

// 获取侧边栏选中的素材
const getSelectedImages = () => {
  if (sidebarRef.value) {
    return sidebarRef.value.getSelectedImages()
  }
  return []
}

// 获取选中的单元 IDs (对应 SP 项目)
const selectUnitIds = computed(() => {
  return sidebarRef.value?.getSelectedUnitIds?.() || []
})

// 获取 adUnitMap (对应 SP 项目)
const adUnitMap = computed(() => {
  return sidebarRef.value?.adUnitMap || new Map()
})

// 清空选择
const clearSelect = () => {
  // TODO: 实现清空选择逻辑
}

// 复制 CampaignSet 数据
const copyCampaignData = (data) => {
  campaignClipboard.value = JSON.parse(JSON.stringify(data))
  ElMessage.success('已复制数据')
}

// 粘贴 CampaignSet 数据
const pasteCampaignData = (targetData, targetInstance) => {
  if (!campaignClipboard.value) {
    ElMessage.warning('剪贴板为空')
    return
  }
  
  const copiedData = JSON.parse(JSON.stringify(campaignClipboard.value))
  
  Object.assign(targetData, {
    campaigns: copiedData.campaigns || [],
    campaign_configs: copiedData.campaign_configs || [],
    logo_ids: copiedData.logo_ids || [],
    call_to_action_text: copiedData.call_to_action_text || '',
    call_to_action_lang: copiedData.call_to_action_lang || ''
  })
  
  ElMessage.success('已粘贴数据')
}

// 同步配置到所有其他卡片
const syncCampaignConfig = (sourceConfigs, sourceCardRef) => {
  if (campaignGridRef.value) {
    campaignGridRef.value.syncConfigToAllCards(sourceConfigs, sourceCardRef)
  }
  // 同步到服务器
  if (sourceConfigs && sourceConfigs.length > 0) {
    syncConfigApi(sourceConfigs)
  }
}

// 提交到服务器
const handleSubmit = async () => {
  try {
    // 获取顶部栏的站点和投放方式
    const site = topBarRef.value?.selectedSite || 'PT'
    const method = topBarRef.value?.selectedMethod || 'DC'
    const logoIds = topBarRef.value?.selectedLogoIds || []
    
    // 准备提交数据
    const submitData = {
      site,
      method,
      logoIds,
      campaigns: campaigns.value
    }
    
    // TODO: 调用提交接口
    console.log('提交数据:', submitData)
    ElMessage.success('提交成功')
    
    // 清除缓存
    clearCacheData()
  } catch (error) {
    console.error('提交失败:', error)
  }
}

// 提供给子组件使用
provide('copyCampaignData', copyCampaignData)
provide('pasteCampaignData', pasteCampaignData)
provide('syncCampaignConfig', syncCampaignConfig)
provide('handleSubmit', handleSubmit)
provide('logoMap', logoMap)
provide('clearSelect', clearSelect)

// 暴露方法
defineExpose({
  handleSubmit,
  saveCacheData,
  clearCacheData
})
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <TopBar ref="topBarRef" />
      </el-header>
      <el-container>
        <el-aside><SideBar ref="sidebarRef" /></el-aside>
        <el-main>
          <div class="scroll">
            <CampaignGrid 
              ref="campaignGridRef"
              :campaign-sets="campaignSets" 
              :select-unit-ids="selectUnitIds"
              :ad-unit-map="adUnitMap"
              @add-new="handleAddNew"
              @delete="handleDelete"
              @clear-select="clearSelect"
            />
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped lang="scss">
.common-layout {
  height: 100vh;
  
  .el-container {
    height: 100%;
  }
  
  .el-header {
    height: 56px;
    padding: 0px;
  }
  
  .el-aside {
    width: 400px;
    height: calc(100vh - 61px); //61px为顶部header盒子高度
    overflow-y: auto;
  }
  
  .el-main {
    padding: 0 !important;
    height: calc(100vh - 61px); //61px为顶部header盒子高度
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
}

.page-header {
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
  
  .page-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
  
  .auto-save-info {
    font-size: 12px;
    color: #909399;
    padding: 4px 12px;
    background: #f5f7fa;
    border-radius: 4px;
  }
}

.scroll {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.gap-4 {
  gap: 16px;
}
</style>
