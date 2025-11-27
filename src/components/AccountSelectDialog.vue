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
        <!-- <el-button type="primary" plain @click="addOne">+ 新增一下一账户（已选择 {{ selectedRows.length }}）</el-button> -->
        <el-tag type="info" round>共 {{ filteredData.length }} 条</el-tag>
      </div>
      <div class="right">
        <el-select v-model="filters.country" placeholder="国家" style="width: 120px" clearable>
          <el-option v-for="c in countries" :key="c" :label="c" :value="c" />
        </el-select>
        <el-input v-model="filters.mccId" placeholder="MCC ID" style="width: 160px" clearable />
        <el-input v-model="filters.accountId" placeholder="id" style="width: 180px" clearable />
        <el-button type="primary" @click="applyFilters">筛选</el-button>
        <el-button @click="resetFilters">重置</el-button>
      </div>
    </div>

    <el-table
      ref="tableRef"
      :data="pagedData"
      border
      height="60vh"
      row-key="id"
      :reserve-selection="true"
      @selection-change="onSelectionChange"
    >
      <el-table-column type="selection" width="48" />
      <el-table-column prop="country" label="LK" width="80" />
      <el-table-column prop="mccId" label="MCC ID" width="140" />
      <el-table-column prop="id" label="id" width="160" />
      <el-table-column prop="name" label="name" min-width="220" show-overflow-tooltip />
      <el-table-column prop="campaignNum" label="campaign_num" width="120" />
      <el-table-column prop="activePmaxCount" label="Active PMax Count" width="160" />
      <el-table-column prop="cost" label="cost" width="140" />
      <el-table-column prop="costYesterday" label="cost_yesterday" width="160" />
      <el-table-column prop="loc" label="LOC" width="200" />
      <el-table-column prop="lastTime" label="最近投放时间" width="200" />
    </el-table>

    <div class="pagination">
      <el-pagination
        background
        layout="prev, pager, next, jumper, ->, total, sizes"
        :total="filteredData.length"
        :current-page="page"
        :page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        @current-change="v => (page = v)"
        @size-change="v => (pageSize = v)"
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
  import { computed, reactive, ref } from 'vue'
  
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
  })
  const emit = defineEmits(['update:modelValue', 'confirm'])
  
  const visibleInner = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
  })
  
  // 假数据
  const countries = ['LK', 'UK', 'US', 'DE', 'FR']
  function randomId(len = 10) {
    return Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join('')
  }
  function randomName(i) {
    const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][Math.floor(Math.random() * 5)]
    return `LK_${String(i).padStart(2, '0')}_${day}_DG`
  }
  function randomDate(offsetDays = 30) {
    const d = new Date(Date.now() - Math.floor(Math.random() * offsetDays) * 24 * 3600 * 1000)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
  }
  function generate(n = 63) {
    return Array.from({ length: n }).map((_, i) => ({
      country: 'LK',
      mccId: String(130000000 + Math.floor(Math.random() * 999999)),
      id: randomId(10),
      name: randomName(i + 1),
      campaignNum: Math.floor(Math.random() * 30),
      activePmaxCount: Math.floor(Math.random() * 10),
      cost: (Math.random() * 4000 + 100).toFixed(6),
      costYesterday: (Math.random() * 1200).toFixed(6),
      loc: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')} 01:00:00`,
      lastTime: randomDate(15),
    }))
  }
  
  const allData = ref(generate(63))
  
  // 过滤与分页
  const filters = reactive({
    country: '',
    mccId: '',
    accountId: '',
  })
  const filteredData = computed(() =>
    allData.value.filter((r) => {
      const okCountry = !filters.country || r.country === filters.country
      const okMcc = !filters.mccId || String(r.mccId).includes(filters.mccId)
      const okId = !filters.accountId || String(r.id).includes(filters.accountId)
      return okCountry && okMcc && okId
    })
  )
  const page = ref(1)
  const pageSize = ref(20)
  const pagedData = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return filteredData.value.slice(start, start + pageSize.value)
  })
  function applyFilters() {
    page.value = 1
  }
  function resetFilters() {
    filters.country = ''
    filters.mccId = ''
    filters.accountId = ''
    page.value = 1
  }
  
  // 选择
  const selectedRows = ref([])
  const tableRef = ref()
  function onSelectionChange(rows) {
    selectedRows.value = rows
  }
  
  function confirm() {
    emit('confirm', selectedRows.value)
    visibleInner.value = false
  }
  
  function addOne() {
    allData.value.unshift(generate(1)[0])
  }
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
  

