import { ref } from 'vue'
import { logoApi } from '@api'
import { ElMessage } from 'element-plus'

/**
 * Logo 管理 Composable
 */
export function useLogo() {
  const logos = ref([])
  const selectedLogoIds = ref([])
  const loading = ref(false)

  // 获取 Logo 列表
  const fetchLogos = async (params = {}) => {
    loading.value = true
    try {
      // 根据 SP 项目的接口要求，必须传 project 参数
      const requestParams = {
        project: params.project || 'default',  // 必需参数！
        ...params
      }
      const res = await logoApi.getLogoList(requestParams)
      // 处理返回数据
      const list = res?.data?.logo_images || res?.data || []
      logos.value = list.map(item => ({
        id: item._id || item.id,
        url: item.url || item.img_url,
        name: item.name || '',
        ...item
      }))
      return logos.value
    } catch (error) {
      console.error('获取 Logo 列表失败:', error)
      logos.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  // 设置选中的 Logo IDs
  const setSelectedLogoIds = (ids) => {
    selectedLogoIds.value = ids
  }

  // 上传 Logo
  const uploadLogo = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const res = await logoApi.uploadLogo(formData)
      ElMessage.success('上传成功')
      await fetchLogos() // 重新获取列表
      return res.data
    } catch (error) {
      console.error('上传 Logo 失败:', error)
      throw error
    }
  }

  // 删除 Logo
  const deleteLogo = async (id) => {
    try {
      await logoApi.deleteLogo({ logo_id: id })
      logos.value = logos.value.filter(logo => logo.id !== id)
      selectedLogoIds.value = selectedLogoIds.value.filter(logoId => logoId !== id)
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除 Logo 失败:', error)
    }
  }

  return {
    logos,
    selectedLogoIds,
    loading,
    fetchLogos,
    setSelectedLogoIds,
    uploadLogo,
    deleteLogo
  }
}

