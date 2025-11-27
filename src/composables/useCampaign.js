import { ref, computed } from 'vue'
import { campaignApi } from '@api'
import { ElMessage } from 'element-plus'

/**
 * Campaign 管理 Composable
 */
export function useCampaign() {
  const campaigns = ref([])
  const loading = ref(false)
  const campaignConfigs = ref([])
  const campaignTemplates = ref([])

  // 获取 Campaign 配置列表
  const fetchCampaigns = async (data = {}) => {
    loading.value = true
    try {
      const res = await campaignApi.getCampaignList(data)
      // 处理返回数据
      const list = res?.data || res || []
      campaigns.value = Array.isArray(list) ? list : []
      return campaigns.value
    } catch (error) {
      console.error('获取 Campaign 列表失败:', error)
      campaigns.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  // 获取 Campaign 分组
  const fetchCampaignGroups = async (data) => {
    try {
      const res = await campaignApi.getCampaignGroupName(data)
      return res?.data || []
    } catch (error) {
      console.error('获取 Campaign 分组失败:', error)
      return []
    }
  }

  // 创建 Campaign 配置
  const createCampaign = async (data) => {
    try {
      const res = await campaignApi.createCampaign(data)
      ElMessage.success('创建成功')
      return res.data
    } catch (error) {
      console.error('创建 Campaign 失败:', error)
      throw error
    }
  }

  // 更新 Campaign 配置
  const updateCampaign = async (data) => {
    try {
      await campaignApi.updateCampaign(data)
      ElMessage.success('更新成功')
    } catch (error) {
      console.error('更新 Campaign 失败:', error)
    }
  }

  // 删除 Campaign 配置
  const deleteCampaign = async (data) => {
    try {
      await campaignApi.deleteCampaign(data)
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除 Campaign 失败:', error)
    }
  }

  // 提交广告任务
  const submitAdTask = async (data) => {
    try {
      const res = await campaignApi.uploadAdTask(data)
      ElMessage.success('提交成功')
      return res.data
    } catch (error) {
      console.error('提交任务失败:', error)
      throw error
    }
  }

  // 获取广告单元
  const fetchAdUnits = async (data) => {
    try {
      const res = await campaignApi.getAdUnit(data)
      return res?.data || []
    } catch (error) {
      console.error('获取广告单元失败:', error)
      return []
    }
  }

  // Campaign 统计信息
  const totalCampaignCount = computed(() => campaigns.value.length)
  
  const totalMaterialCount = computed(() => {
    let count = 0
    campaigns.value.forEach(campaign => {
      if (campaign.adGroups) {
        campaign.adGroups.forEach(adGroup => {
          count += adGroup.materials?.length || 0
        })
      }
    })
    return count
  })

  return {
    campaigns,
    loading,
    campaignConfigs,
    campaignTemplates,
    totalCampaignCount,
    totalMaterialCount,
    fetchCampaigns,
    fetchCampaignGroups,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    submitAdTask,
    fetchAdUnits
  }
}

