<template>
  <el-dialog
    v-model="dialogVisible"
    title=""
    width="100vw"
    top="0"
    append-to-body
    destroy-on-close
    :show-close="false"
    @close="handleClose"
    class="campaign-select-dialog"
    :fullscreen="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <!-- 自定义标题栏 -->
    <template #header>
      <div class="dialog-header">
        <div class="header-left">
          <span class="dialog-title">campagin 选择</span>
          <el-icon class="refresh-icon" @click="handleRefresh">
            <Refresh />
          </el-icon>
        </div>
        <el-icon class="close-icon" @click="handleClose">
          <Close />
        </el-icon>
      </div>
    </template>

    <!-- 表格内容 -->
    <div class="dialog-content">
      <div class="table-wrapper">
        <el-table
          ref="tableRef"
          :data="tableData"
          border
          size="small"
          :height="tableHeight"
          @selection-change="handleSelectionChange"
          @select-all="handleSelectAll"
        >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="_id" label="ID" width="200">
          <template #default="{ row }">
            <div class="id-cell">
              <span class="id-text">{{ row._id }}</span>
              <el-icon class="copy-icon" @click="copyId(row._id)">
                <DocumentCopy />
              </el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name_loc" label="campaig" :min-width="150">
          <template #header>
            <div class="header-with-search">
              <span>campaig</span>
              <el-input
                v-model="filters.campaig"
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
        <el-table-column prop="country" label="country" width="100" />
        <el-table-column prop="located" label="located" width="120" />
        <el-table-column prop="name_suffix" label="name suffi:" :min-width="150">
          <template #header>
            <div class="header-with-search">
              <span>name suffix:</span>
              <el-input
                v-model="filters.name_suffix"
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
        <el-table-column prop="url_prefix" label="url_prefix:" :min-width="150">
          <template #header>
            <div class="header-with-search">
              <span>url_prefix:</span>
              <el-input
                v-model="filters.url_prefix"
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
        <!-- <el-table-column prop="bidding_type" label="Bidding Type" width="150" /> -->
        <el-table-column prop="cpa" label="cpa" width="80" />
        <el-table-column prop="budget" label="budget" width="100" />
        <el-table-column prop="os" label="os" width="80">
          <template #default="{ row }">
            <div class="os-list">
              <span v-if="Array.isArray(row.os)">
                <span v-for="(osItem, index) in row.os" :key="index">
                  {{ getOs(osItem) || osItem }}<span v-if="index < row.os.length - 1">, </span>
                </span>
              </span>
              <span v-else>
                {{ getOs(row.os) || row.os }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="device" label="device" width="180">
          <template #default="{ row }">
            <div class="device-list">
              <span v-for="(device, index) in row.device" :key="index">
                {{ device }}<span v-if="index < row.device.length - 1">, </span>
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="schedule" label="schedule" width="200">
          <template #default="{ row }">
            <div class="schedule-cell">
              <div class="schedule-label">Everyday:</div>
              <div class="schedule-time">{{ formatSchedule(row.schedule) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="conversion goals"
          :min-width="150"
        >
          <template #default="scope">
            <div>
              {{
                scope.row.conversion_goals &&
                scope.row.conversion_goals.length > 0
                  ? `${CATEGORY_MAP[scope.row.conversion_goals[0].category]}-${
                      ORIGIN_MAP[scope.row.conversion_goals[0].origin]
                    }`
                  : "/"
              }}
            </div>
            <div
              v-if="
                scope.row.conversion_goals &&
                scope.row.conversion_goals.length > 1
              "
            >
              ...
            </div>
          </template>
        </el-table-column>
      </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <div class="pagination-left">
          <span class="total-text">共{{ total }}条</span>
          <el-select v-model="pageSize" size="small" style="width: 100px; margin-left: 16px" @change="handleSizeChange">
            <el-option label="20条/页" :value="20" />
            <el-option label="50条/页" :value="50" />
            <el-option label="100条/页" :value="100" />
          </el-select>
        </div>
        <div class="pagination-right">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            :pager-count="7"
            layout="prev, pager, next"
            @current-change="handleCurrentChange"
          />
          <div class="pagination-jumper">
            <span>前往</span>
            <el-input
              v-model="jumperPage"
              size="small"
              style="width: 60px; margin: 0 8px"
              @keyup.enter="handleJumper"
            />
            <span>页</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button type="success" @click="handleConfirm">确认</el-button>
        <el-button @click="handleClose">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentCopy, Close, Refresh, Search } from '@element-plus/icons-vue'
import {CATEGORY_MAP, ORIGIN_MAP } from "@/utils/const.js";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  campaignConfigs: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 表格引用
const tableRef = ref(null)

// 表格高度（固定高度）
const tableHeight = ref('680px')



// 分页参数
const currentPage = ref(1)
const pageSize = ref(20)
const jumperPage = ref('1')

// 筛选条件
const filters = ref({
  campaig: '',
  name_suffix: '',
  url_prefix: ''
})

// 存储所有选中的行（跨页选择）
const allSelectedRows = ref([])
const selectedRows = ref([])

// 筛选后的数据
const filteredData = computed(() => {
  let data = props.campaignConfigs || []
  console.log(data)
  
  // 应用筛选条件
  if (filters.value.campaig) {
    data = data.filter(item => 
      item.name_loc?.toLowerCase().includes(filters.value.campaig.toLowerCase())
    )
  }
  if (filters.value.name_suffix) {
    data = data.filter(item => 
      item.name_suffix?.toLowerCase().includes(filters.value.name_suffix.toLowerCase())
    )
  }
  if (filters.value.url_prefix) {
    data = data.filter(item => 
      item.url_prefix?.toLowerCase().includes(filters.value.url_prefix.toLowerCase())
    )
  }
  
  return data
})

// 总数据量（筛选后的）
const total = computed(() => filteredData.value.length)

// 分页后的表格数据（先筛选，再分页）
const tableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 恢复当前页的选中状态
const restoreSelection = () => {
  if (tableRef.value && allSelectedRows.value.length > 0) {
    tableRef.value.clearSelection()
    setTimeout(() => {
      tableData.value.forEach(row => {
        const isSelected = allSelectedRows.value.some(
          selectedRow => selectedRow._id === row._id
        )
        if (isSelected) {
          tableRef.value.toggleRowSelection(row, true)
        }
      })
    }, 0)
  }
}

// 监听弹窗打开，重置分页和选择
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    currentPage.value = 1
    pageSize.value = 20
    jumperPage.value = '1'
    selectedRows.value = []
    allSelectedRows.value = []
    filters.value = {
      campaig: '',
      name_suffix: '',
      url_prefix: ''
    }
  }
})

// 监听筛选条件变化，重置到第一页
watch(() => filters.value, () => {
  currentPage.value = 1
  jumperPage.value = '1'
}, { deep: true })

// 监听表格数据变化，恢复选中状态
watch(() => tableData.value, () => {
  restoreSelection()
}, { deep: true })

// 选择变化
const handleSelectionChange = (selection) => {
  const currentPageIds = tableData.value.map(row => row._id)
  
  // 移除当前页之前的选择
  allSelectedRows.value = allSelectedRows.value.filter(
    row => !currentPageIds.includes(row._id)
  )
  
  // 添加当前页新选中的行
  allSelectedRows.value.push(...selection)
  
  selectedRows.value = selection
}

// 全选
const handleSelectAll = (selection) => {
  if (selection.length > 0) {
    // 全选当前页
    handleSelectionChange(selection)
  } else {
    // 取消全选当前页
    const currentPageIds = tableData.value.map(row => row._id)
    allSelectedRows.value = allSelectedRows.value.filter(
      row => !currentPageIds.includes(row._id)
    )
    selectedRows.value = []
  }
}

// 复制ID
const copyId = (id) => {
  navigator.clipboard.writeText(id)
  ElMessage.success('已复制ID')
}

// 处理 OS 显示
const getOs = (item) => {
  switch (item) {
    case "operatingSystemVersionConstants/630374":
      return "Android";
    case "operatingSystemVersionConstants/630153":
      return "iOS";
    case "operatingSystemVersionConstants/630340":
      return "Windows Phone";
    default:
      return null;
  }
}

// 格式化时间（补零）
const formatTime = (hour, minute) => {
  const h = String(hour).padStart(2, '0')
  const m = String(minute).padStart(2, '0')
  return `${h}:${m}`
}

// 格式化 schedule 显示
const formatSchedule = (schedule) => {
  if (!schedule) return ''
  
  // 如果是数组
  if (Array.isArray(schedule) && schedule.length > 0) {
    return schedule.map(item => {
      const startTime = formatTime(item.start_hour || 0, item.start_minute || 0)
      const endTime = formatTime(item.end_hour || 0, item.end_minute || 0)
      return `${startTime} - ${endTime}`
    }).join(', ')
  }
  
  // 如果是对象
  if (typeof schedule === 'object' && schedule.start_hour !== undefined) {
    const startTime = formatTime(schedule.start_hour || 0, schedule.start_minute || 0)
    const endTime = formatTime(schedule.end_hour || 0, schedule.end_minute || 0)
    return `${startTime} - ${endTime}`
  }
  
  return ''
}

// 筛选变化
const handleFilterChange = () => {
  currentPage.value = 1
  jumperPage.value = '1'
}

// 分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  jumperPage.value = '1'
  restoreSelection()
}

// 页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  jumperPage.value = String(val)
  restoreSelection()
}

// 跳转页面
const handleJumper = () => {
  const page = parseInt(jumperPage.value)
  const maxPage = Math.ceil(total.value / pageSize.value)
  if (page >= 1 && page <= maxPage) {
    currentPage.value = page
    restoreSelection()
  } else {
    ElMessage.warning(`请输入1-${maxPage}之间的页码`)
    jumperPage.value = String(currentPage.value)
  }
}

// 刷新
const handleRefresh = () => {
  currentPage.value = 1
  pageSize.value = 20
  jumperPage.value = '1'
  selectedRows.value = []
  allSelectedRows.value = []
  filters.value = {
    campaig: '',
    name_suffix: '',
    url_prefix: ''
  }
  ElMessage.success('已刷新')
}

// 关闭
const handleClose = () => {
  dialogVisible.value = false
}

// 确认
const handleConfirm = () => {
  if (allSelectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一条数据')
    return
  }
  emit('confirm', allSelectedRows.value)
  handleClose()
}

</script>

<style scoped lang="scss">
:deep(.el-overlay) {
  z-index: 2999 !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  overflow: hidden !important;
}

.campaign-select-dialog {
  :deep(.el-dialog) {
    z-index: 3000 !important;
    position: fixed !important;
    margin: 0 !important;
    height: 800px !important;
    max-height: 800px !important;
    width: 100vw !important;
    max-width: 100vw !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
  }

  :deep(.el-dialog__header) {
    padding: 0 !important;
    flex-shrink: 0 !important;
    height: auto !important;
    max-height: none !important;
    box-sizing: border-box !important;
  }

  :deep(.el-dialog__body) {
    padding: 0 !important;
    flex: 1 !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
    min-height: 0 !important;
    height: 680px !important; // 固定高度：800px - header(60px) - footer(60px)
    max-height: 680px !important;
    box-sizing: border-box !important;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 20px !important;
    border-top: 1px solid #e4e7ed !important;
    flex-shrink: 0 !important;
    height: auto !important;
    max-height: none !important;
    box-sizing: border-box !important;
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .dialog-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .refresh-icon {
      font-size: 18px;
      color: #606266;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #409eff;
      }
    }
  }

  .close-icon {
    font-size: 20px;
    color: #909399;
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: #606266;
    }
  }
}

.dialog-content {
  padding: 16px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  max-height: 100%;
  height: 100%;
}

.table-wrapper {
  flex: 1;
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.id-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .id-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .copy-icon {
    color: #409eff;
    cursor: pointer;
    font-size: 14px;
    flex-shrink: 0;

    &:hover {
      color: #66b1ff;
    }
  }
}

.header-with-search {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  min-width: 120px;
  align-items: flex-start;

  span {
    white-space: nowrap;
    font-size: 12px;
    font-weight: 500;
    color: #606266;
    line-height: 1.2;
  }

  .header-search-input {
    width: 100%;
    max-width: 100%;

    :deep(.el-input) {
      width: 100%;
    }

    :deep(.el-input__wrapper) {
      padding-left: 3px !important;
      padding-right: 3px !important;
      box-shadow: none;
      border: 0px;
      width: 100%;
    }

    :deep(.el-input__wrapper:hover) {
      box-shadow: none;
    }

    :deep(.el-input__wrapper.is-focus) {
      box-shadow: none;
    }
  }
}

.device-list {
  font-size: 12px;
  line-height: 1.5;
}

.schedule-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .schedule-label {
    font-weight: 600;
    font-size: 13px;
    color: #303133;
  }

  .schedule-time {
    font-size: 12px;
    color: #909399;
    font-weight: normal;
  }
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  flex-shrink: 0;

  .pagination-left {
    display: flex;
    align-items: center;

    .total-text {
      color: #606266;
      font-size: 14px;
    }
  }

  .pagination-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .pagination-jumper {
      display: flex;
      align-items: center;
      color: #606266;
      font-size: 14px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-table) {
  font-size: 13px;
  display: flex;
  flex-direction: column;
  height: 100%;

  .el-table__header-wrapper {
    flex-shrink: 0;
  }

  .el-table__body-wrapper {
    flex: 1;
    overflow-y: auto !important;
    overflow-x: auto !important;
    min-height: 0;
  }

  .el-table__header th {
    background: #f5f7fa;
    color: #606266;
    font-weight: 500;
    padding: 8px 4px;
    vertical-align: top;
    
    // 确保表头单元格有足够高度显示筛选输入框
    &.is-leaf {
      height: auto;
      min-height: 60px;
    }
    
    // 确保表头内容能够完整显示
    .cell {
      padding: 0 4px;
      white-space: normal;
      word-break: break-word;
    }
  }

  .el-table__body td {
    padding: 8px 0;
  }
}
</style>

