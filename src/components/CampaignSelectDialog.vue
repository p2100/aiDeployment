<template>
  <el-dialog
    v-model="dialogVisible"
    title="campaign 选择"
    width="90%"
    top="5vh"
    append-to-body
    destroy-on-close
    @close="handleClose"
  >
    <div class="dialog-content">
      <!-- 表格 -->
      <el-table
        ref="tableRef"
        :data="tableData"
        border
        size="small"
        height="500"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="150">
          <template #default="{ row }">
            <div class="id-cell">
              {{ row.id }}
              <el-icon class="copy-icon" @click="copyId(row.id)">
                <DocumentCopy />
              </el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="campaig" label="campaig" width="100">
          <template #header>
            <div class="header-with-sort">
              campaig
              <el-icon class="sort-icon"><Sort /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="country" label="country" width="100" />
        <el-table-column prop="located" label="located" width="120" />
        <el-table-column prop="name_suffi" label="name_suffi" width="120">
          <template #header>
            <div class="header-with-sort">
              name_suffi
              <el-icon class="sort-icon"><Sort /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="url_prefi" label="url_prefi" width="120">
          <template #header>
            <div class="header-with-sort">
              url_prefi
              <el-icon class="sort-icon"><Sort /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="bidding_type" label="Bidding Type" width="150" />
        <el-table-column prop="cpa" label="cpa" width="80" />
        <el-table-column prop="budget" label="budget" width="100" />
        <el-table-column prop="os" label="os" width="80" />
        <el-table-column prop="device" label="device" width="150">
          <template #default="{ row }">
            <div class="device-list">
              <div v-for="(device, index) in row.device" :key="index">
                {{ device }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="schedule" label="schedule" width="150">
          <template #default="{ row }">
            <div class="schedule-cell">
              <div>{{ row.schedule.day }}</div>
              <div>{{ row.schedule.time }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="conversion_goal" label="conversion goal" width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSaveNew">没有想要的 新建</el-button>
        <el-button type="success" @click="handleConfirm">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentCopy, Sort } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'save-new'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 表格数据
const tableData = ref([
  {
    id: '65817ca883e77f7eaa...',
    campaig: 'campaign',
    country: 'AE',
    located: 'AE',
    name_suffi: '25000G',
    url_prefi: 'ardg',
    bidding_type: 'TARGET_CPA',
    cpa: '0.2',
    budget: '33',
    os: 'all',
    device: ['MOBILE', 'TABLET', 'DESKTOP'],
    schedule: {
      day: 'Everyday:',
      time: '04:00 - 12:00'
    },
    conversion_goal: 'other-WEBSITE'
  },
  {
    id: '68d25b8068418ff4c...',
    campaig: 'campaign',
    country: 'AE',
    located: 'AE',
    name_suffi: '55001V',
    url_prefi: 'v1',
    bidding_type: 'TARGET_CPA',
    cpa: '0.25',
    budget: '15',
    os: 'all',
    device: ['all'],
    schedule: {
      day: 'Everyday:',
      time: '06:00 - 22:00'
    },
    conversion_goal: 'PURCHASE-WEBSITE'
  },
])

const selectedRows = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(789)
const tableRef = ref(null)

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const copyId = (id) => {
  navigator.clipboard.writeText(id)
  ElMessage.success('已复制ID')
}

const viewDetail = (row) => {
  console.log('查看详情:', row)
}

const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

const handleClose = () => {
  dialogVisible.value = false
}

const handleSaveNew = () => {
  emit('save-new')
  handleClose()
}

const handleConfirm = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一条数据')
    return
  }
  emit('confirm', selectedRows.value)
  handleClose()
}
</script>

<style scoped lang="scss">
:deep(.el-dialog) {
  z-index: 3000 !important;
}

:deep(.el-overlay) {
  z-index: 2999 !important;
}

.dialog-content {
  padding: 0;
}

.id-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .copy-icon {
    color: #409eff;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      color: #66b1ff;
    }
  }
}

.header-with-sort {
  display: flex;
  align-items: center;
  gap: 4px;

  .sort-icon {
    color: #909399;
    cursor: pointer;
    font-size: 12px;
  }
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
}

.schedule-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  padding: 16px 0;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

:deep(.el-table) {
  font-size: 13px;

  .el-table__header th {
    background: #f5f7fa;
    color: #606266;
    font-weight: 500;
  }

  .el-table__body td {
    padding: 8px 0;
  }
}
</style>

