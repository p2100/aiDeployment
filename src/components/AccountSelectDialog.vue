<template>
  <el-dialog
    v-model="visibleInner"
    title="账户信息选择"
    width="90%"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
    class="account-dialog"
    top="5vh"
  >
    <div class="toolbar">
      <div class="left">
        <el-tag type="info" round>共 {{ allSelectedRows.length }} 条</el-tag>
      </div>
    </div>

    <el-table
      ref="tableRef"
      :data="accountInfos"
      border
      height="60vh"
      row-key="id"
      :reserve-selection="true"
      @selection-change="onSelectionChange"
      @select-all="handleSelectAll"
      v-loading="loading"
    >
      <el-table-column type="selection" width="48" />
      <el-table-column prop="site" label="site" width="120">
        <template #header>
          <div class="header-with-search">
            <span>site</span>
            <el-input
              v-model="filters.site"
              placeholder=""
              size="small"
              clearable
              class="header-search-input"
              @input="handleFilterChange"
            >
              <template #suffix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="mcc_id" label="MCC ID" width="160">
        <template #header>
          <div class="header-with-search">
            <span>MCC ID</span>
            <el-input
              v-model="filters.mcc_id"
              placeholder=""
              size="small"
              clearable
              class="header-search-input"
              @input="handleFilterChange"
            >
              <template #suffix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="id" width="180">
        <template #header>
          <div class="header-with-search">
            <span>id</span>
            <el-input
              v-model="filters.customer_id"
              placeholder=""
              size="small"
              clearable
              class="header-search-input"
              @input="handleFilterChange"
            >
              <template #suffix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="name" min-width="240" show-overflow-tooltip>
        <template #header>
          <div class="header-with-search">
            <span>name</span>
            <el-input
              v-model="filters.name"
              placeholder=""
              size="small"
              clearable
              class="header-search-input"
              @input="handleFilterChange"
            >
              <template #suffix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="today_placed_num" label="campaign_num" width="120" />
      <el-table-column prop="pmax_count" label="Active PMax Count" width="160" />
      <el-table-column prop="cost" label="cost" width="140" />
      <el-table-column prop="cost_yesterday" label="cost_yesterday" width="160" />
      <el-table-column prop="date" label="LOC" width="200">
        <template #default="{ row }">
          {{ formatDateTime(row.date) }}
        </template>
      </el-table-column>
      <el-table-column prop="update_time" label="最近投放时间" width="200">
        <template #default="{ row }">
          {{ formatDateTime(row.update_time) }}
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        background
        layout="prev, pager, next, jumper, ->, total, sizes"
        :total="total"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visibleInner = false">取消</el-button>
        <el-button type="primary" @click="confirm">确认</el-button>
      </div>
    </template>
  </el-dialog>
  </template>
  
  <script setup>
  import { computed, reactive, ref, watch, nextTick, onBeforeUnmount } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Search } from '@element-plus/icons-vue'
  import { indexApi } from '@api/index'
  import axios from "axios";
  
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    site: {
      type: String,
      default: ''
    },
    selectedInfos: {
      type: Array,
      default: () => []
    }
  })
  const emit = defineEmits(['update:modelValue', 'confirm'])
  
  const visibleInner = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
  })
  
  // 数据
  const accountInfos = ref([])
  const loading = ref(false)
  const total = ref(0)
  
  // 分页
  const page = ref(1)
  const pageSize = ref(20)
  
  // 过滤
  const filters = reactive({
    site: '',
    mcc_id: '',
    customer_id: '',
    name: '',
  })
  
  // 防抖定时器
  let filterTimer = null
  
  // 获取账户信息
  const getAccountInfos = async () => {
    // site 优先使用表头筛选的值，如果没有则使用 props.site
    const siteValue = filters.site || props.site
    if (!siteValue) {
      ElMessage.warning('请先选择站点')
      return
    }
    
    loading.value = true
    try {
      const params = {
        site: siteValue,
        page: page.value,
        offset: pageSize.value,
        order: {
          order_by: 'cost',
          order_dir: 'desc'
        }
      }
      
      // 添加筛选条件（如果表头输入了值）
      if (filters.mcc_id) {
        params.mcc_id = filters.mcc_id
      }
      if (filters.customer_id) {
        params.customer_id = filters.customer_id
      }
      if (filters.name) {
        params.name = filters.name
      }
      
      const res = await indexApi.getAccountInfos(params)
      accountInfos.value = res.result.data || []
      total.value = res.result.total || 0
      
      // 恢复选择会在 watch accountInfos 中自动执行
    } catch (error) {
      console.error('获取账户信息失败:', error)
      ElMessage.error('获取账户信息失败')
      accountInfos.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }
  
  // 恢复已选择的数据
  const restoreSelection = () => {
    if (!tableRef.value || !accountInfos.value || accountInfos.value.length === 0) {
      return
    }
    
    if (allSelectedRows.value.length === 0) {
      selectedRows.value = []
      return
    }
    
    // 清空当前选择
    tableRef.value.clearSelection()
    
    // 创建已选择数据的 ID 映射，提高匹配效率
    const selectedIdsMap = new Map()
    allSelectedRows.value.forEach(selected => {
      // 支持多种 ID 格式
      const selectedId = selected?.id || selected?.customer_id || selected
      if (selectedId) {
        selectedIdsMap.set(String(selectedId), selected)
      }
    })
    
    // 恢复当前页的选择
    const currentPageSelected = []
    accountInfos.value.forEach(row => {
      const rowId = String(row.id || row.customer_id || '')
      if (selectedIdsMap.has(rowId)) {
        try {
          tableRef.value.toggleRowSelection(row, true)
          currentPageSelected.push(row)
        } catch (error) {
          console.error('恢复选择失败:', error, row)
        }
      }
    })
    
    // 更新当前页的 selectedRows
    selectedRows.value = currentPageSelected
  }
  
  // 筛选条件变化时调用接口
  const handleFilterChange = () => {
    // 清除之前的定时器
    if (filterTimer) {
      clearTimeout(filterTimer)
    }
    
    // 重置到第一页
    page.value = 1
    
    // 防抖处理，500ms 后调用接口
    filterTimer = setTimeout(() => {
      getAccountInfos()
    }, 500)
  }
  
  // 分页变化
  const handlePageChange = (val) => {
    page.value = val
    getAccountInfos()
  }
  
  const handleSizeChange = (val) => {
    pageSize.value = val
    page.value = 1
    getAccountInfos()
  }
  
  // 选择 - 维护全局已选择列表（跨页选择）
  const allSelectedRows = ref([])
  const selectedRows = ref([])
  const tableRef = ref()
  
  function onSelectionChange(rows) {
    // 获取当前页的所有 ID
    const currentPageIds = accountInfos.value.map(row => String(row.id || row.customer_id || ''))
    
    // 移除当前页之前的选择（通过 ID 匹配）
    allSelectedRows.value = allSelectedRows.value.filter(selected => {
      const selectedId = String(selected?.id || selected?.customer_id || selected || '')
      return !currentPageIds.includes(selectedId)
    })
    
    // 添加当前页新选中的行（深拷贝，避免引用问题）
    const newRows = rows.map(row => JSON.parse(JSON.stringify(row)))
    allSelectedRows.value.push(...newRows)
    
    selectedRows.value = rows
  }
  
  function handleSelectAll(selection) {
    if (selection.length > 0) {
      // 全选当前页
      onSelectionChange(selection)
    } else {
      // 取消全选当前页
      const currentPageIds = accountInfos.value.map(row => String(row.id || row.customer_id || ''))
      allSelectedRows.value = allSelectedRows.value.filter(selected => {
        const selectedId = String(selected?.id || selected?.customer_id || selected || '')
        return !currentPageIds.includes(selectedId)
      })
      selectedRows.value = []
    }
  }
  
  // 监听弹窗打开
  watch(() => props.modelValue, async (newVal) => {
    if (newVal) {
      // 重置筛选条件
      filters.site = ''
      filters.mcc_id = ''
      filters.customer_id = ''
      filters.name = ''
      
      // 初始化已选择列表 - 从 accountSelectedInfos 恢复
      if (props.selectedInfos && props.selectedInfos.length > 0) {
        // 深拷贝，避免引用问题
        allSelectedRows.value = JSON.parse(JSON.stringify(props.selectedInfos))
      } else {
        allSelectedRows.value = []
      }
      selectedRows.value = []
      page.value = 1
      
      // 等待弹窗完全打开后再加载数据
      await nextTick()
      await getAccountInfos()
    } else {
      // 弹窗关闭时清空当前页选择
      selectedRows.value = []
    }
  })
  
  // 监听站点变化
  watch(() => props.site, (newVal) => {
    if (visibleInner.value && newVal) {
      page.value = 1
      getAccountInfos()
    }
  })
  
  // 监听表格数据变化，自动恢复选择
  watch(() => accountInfos.value, async () => {
    if (visibleInner.value && accountInfos.value && accountInfos.value.length > 0 && allSelectedRows.value.length > 0) {
      // 等待 DOM 更新完成
      await nextTick()
      await nextTick()
      restoreSelection()
    }
  }, { deep: true })
  
  // 监听 selectedInfos 变化，同步更新已选择列表（仅在弹窗打开时）
  watch(() => props.selectedInfos, async (newVal) => {
    if (visibleInner.value) {
      if (newVal && newVal.length > 0) {
        allSelectedRows.value = JSON.parse(JSON.stringify(newVal))
        // 恢复当前页的选择 - 等待 DOM 更新
        await nextTick()
        await nextTick()
        restoreSelection()
      } else {
        allSelectedRows.value = []
        if (tableRef.value) {
          tableRef.value.clearSelection()
        }
        selectedRows.value = []
      }
    }
  }, { deep: true })
  
  // 格式化日期时间
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return ''
    
    try {
      // 处理 ISO 格式：2025-11-27T18:02:49.931000
      const date = new Date(dateTimeStr)
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        return dateTimeStr
      }
      
      // 格式化为 YYYY-MM-DD HH:mm:ss
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    } catch (error) {
      console.error('日期格式化失败:', error)
      return dateTimeStr
    }
  }
  
  function confirm() {
    // 返回所有已选择的数据（跨页）- 深拷贝避免引用问题
    const selectedData = allSelectedRows.value.map(row => JSON.parse(JSON.stringify(row)))
    emit('confirm', selectedData)
    visibleInner.value = false
  }
  
  // 组件卸载时清除定时器
  onBeforeUnmount(() => {
    if (filterTimer) {
      clearTimeout(filterTimer)
    }
  })
  </script>
  
  <style scoped>
  .account-dialog :deep(.el-dialog__header) {
    border-bottom: 1px solid var(--el-border-color);
    margin-right: 0;
    padding: 16px 20px;
    background: linear-gradient(180deg, #f7faff 0%, #ffffff 100%);
  }
  
  .account-dialog :deep(.el-dialog__title) {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
  
  .account-dialog :deep(.el-dialog__body) {
    padding: 20px;
  }
  
  .account-dialog :deep(.el-dialog__footer) {
    border-top: 1px solid var(--el-border-color);
    padding: 16px 20px;
  }
  
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid #e0e3eb;
  }
  
  .left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    padding-top: 16px;
  }
  
  .account-dialog :deep(.el-table) {
    border-radius: 8px;
    overflow: hidden;
  }
  
  .account-dialog :deep(.el-table th) {
    background-color: #f5f7fa;
    font-weight: 600;
    padding: 8px 4px;
    vertical-align: top;
  }
  
  .account-dialog :deep(.el-table th .cell) {
    padding: 0 4px;
    white-space: normal;
    word-break: break-word;
  }
  
  .header-with-search {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    min-width: 80px;
    align-items: flex-start;
  }
  
  .header-with-search span {
    white-space: nowrap;
    font-size: 12px;
    font-weight: 500;
    color: #606266;
    line-height: 1.2;
  }
  
  .header-search-input {
    width: 100%;
    max-width: 100%;
  }
  
  .header-search-input :deep(.el-input) {
    width: 100%;
  }
  
  .header-search-input :deep(.el-input__wrapper) {
    padding-left: 3px !important;
    padding-right: 3px !important;
    box-shadow: none;
    border: 0px;
    width: 100%;
  }
  
  .header-search-input :deep(.el-input__wrapper:hover) {
    box-shadow: none;
  }
  
  .header-search-input :deep(.el-input__wrapper.is-focus) {
    box-shadow: none;
  }
  
  .account-dialog :deep(.el-button) {
    font-weight: 500;
  }
  
  .dialog-footer {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
  }
  </style>
  

