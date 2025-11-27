import { ref, computed } from 'vue'
import { materialApi } from '@api'
import { ElMessage } from 'element-plus'

/**
 * 素材管理 Composable
 */
export function useMaterial() {
  const materials = ref([])
  const loading = ref(false)
  const filters = ref({
    language: [],
    tag: [],
    designer: []
  })

  // 获取素材列表
  const fetchMaterials = async (params = {}) => {
    loading.value = true
    try {
      // 根据 SP 项目的接口要求构建参数
      const requestData = {
        workbench_type: params.workbench_type || 1,  // 必需参数！
        page: params.page || 1,
        offset: params.offset || 100,  // SP 使用 offset 而不是 page_size
        project: params.project || null,
        tag: params.tag || null,
        ch_name: params.ch_name || null,
        status: params.status || null,
        ...params
      }
      const res = await materialApi.getMaterialList(requestData)
      
      // 处理返回数据，sp 项目返回格式: { code: 0, data: { list: [...], total: ... } }
      const list = res?.data?.list || res?.list || res?.data || []
      materials.value = list.map(item => ({
        id: item._id || item.id,
        url: item.img_url || item.url,
        tag: item.tag || '',
        language: item.language || '',
        designer: item.designer_name || item.designer || '',
        selected: false,
        ...item
      }))
      return materials.value
    } catch (error) {
      console.error('获取素材列表失败:', error)
      materials.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  // 筛选后的素材列表
  const filteredMaterials = computed(() => {
    return materials.value.filter(material => {
      const languageMatch = filters.value.language.length === 0 || 
        filters.value.language.includes(material.language)
      const tagMatch = filters.value.tag.length === 0 || 
        filters.value.tag.includes(material.tag)
      const designerMatch = filters.value.designer.length === 0 || 
        filters.value.designer.includes(material.designer)
      return languageMatch && tagMatch && designerMatch
    })
  })

  // 获取选中的素材
  const getSelectedMaterials = () => {
    return materials.value.filter(m => m.selected)
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    const allSelected = filteredMaterials.value.every(m => m.selected)
    filteredMaterials.value.forEach(m => {
      m.selected = !allSelected
    })
  }

  // 更新素材
  const updateMaterial = async (id, data) => {
    try {
      await materialApi.updateMaterial(id, data)
      ElMessage.success('更新成功')
      // 更新本地数据
      const index = materials.value.findIndex(m => m.id === id)
      if (index > -1) {
        materials.value[index] = { ...materials.value[index], ...data }
      }
    } catch (error) {
      console.error('更新素材失败:', error)
    }
  }

  // 删除素材
  const deleteMaterial = async (id) => {
    try {
      await materialApi.deleteMaterial(id)
      materials.value = materials.value.filter(m => m.id !== id)
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除素材失败:', error)
    }
  }

  // 批量删除素材
  const batchDeleteMaterials = async (ids) => {
    try {
      await materialApi.batchDeleteMaterial(ids)
      materials.value = materials.value.filter(m => !ids.includes(m.id))
      ElMessage.success(`已删除 ${ids.length} 个素材`)
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }

  return {
    materials,
    loading,
    filters,
    filteredMaterials,
    fetchMaterials,
    getSelectedMaterials,
    toggleSelectAll,
    updateMaterial,
    deleteMaterial,
    batchDeleteMaterials
  }
}

