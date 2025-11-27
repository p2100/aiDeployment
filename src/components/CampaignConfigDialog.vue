<template>
  <el-dialog
    v-model="visibleInner"
    title="campaign config 选择"
    fullscreen
    destroy-on-close
    :close-on-click-modal="false"
    class="campaign-config-dialog"
  >
    <div class="toolbar">
      <div class="left">
        <el-tag type="info" round>共 {{ filteredData.length }} 条</el-tag>
      </div>
      <div class="right">
        <el-input v-model="filters.keyword" placeholder="搜索 name_suffix / url_prefix / id" style="width: 260px" clearable />
        <el-select v-model="filters.country" placeholder="country" style="width: 120px" clearable>
          <el-option v-for="c in countries" :key="c" :label="c" :value="c" />
        </el-select>
        <el-button type="primary" @click="applyFilters">筛选</el-button>
        <el-button @click="resetFilters">重置</el-button>
      </div>
    </div>

    <el-table
      :data="pagedData"
      border
      height="70vh"
      row-key="id"
      :reserve-selection="true"
      @selection-change="onSelectionChange"
    >
      <el-table-column type="selection" width="48" />
      <el-table-column prop="id" label="ID" width="160" />
      <el-table-column prop="campaign" label="campaign" width="120" />
      <el-table-column prop="country" label="country" width="100" />
      <el-table-column prop="located" label="located" width="120" />
      <el-table-column prop="nameSuffix" label="name_suffi." width="140" />
      <el-table-column prop="urlPrefix" label="url_prefi." width="120" />
      <el-table-column prop="biddingType" label="Bidding Type" width="140" />
      <el-table-column prop="cpa" label="cpa" width="80" />
      <el-table-column prop="budget" label="budget" width="90" />
      <el-table-column prop="os" label="os" width="80" />
      <el-table-column prop="device" label="device" width="160" />
      <el-table-column prop="schedule" label="schedule" min-width="220" />
      <el-table-column prop="conversionGoal" label="conversion goal" min-width="180" />
      <!-- 操作列暂留空 -->
    </el-table>

    <div class="pagination" style="display: flex; justify-content: center; align-items: center; margin-top: 12px;">
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
      <span class="dialog-footer" style="width: 100%; display: flex; justify-content: center; align-items: center;">
        <el-button @click="visibleInner = false">取消</el-button>
        <el-button type="primary" @click="confirm">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'confirm'])

const visibleInner = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

// 假数据
const countries = ['AE', 'LK', 'UK', 'US', 'DE', 'FR']
const biddingTypes = ['TARGET_CPA', 'MAX_CONV', 'TARGET_ROAS']
const osList = ['all', 'iOS', 'Android']
const deviceList = ['all', 'DESKTOP', 'MOBILE', 'TABLET', 'DESKTOP MOBILE TABLET']

function rndId(len = 24) {
  const chars = 'abcdef0123456789'
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
function pick(list) {
  return list[Math.floor(Math.random() * list.length)]
}
function generateCampaigns(n = 120) {
  return Array.from({ length: n }).map((_, i) => {
    const country = pick(countries)
    return {
      id: rndId(24),
      campaign: Math.random() > 0.5 ? 'ae' : 'm_AE',
      country,
      located: 'campaign',
      nameSuffix: String(14000 + Math.floor(Math.random() * 300)) + pick(['G', 'L', 'V', 'R']),
      urlPrefix: pick(['dbsa', 'dsa', 'dvsa', 'drsa', 'dca', 'dsa2', 'dves']),
      biddingType: pick(biddingTypes),
      cpa: Number((Math.random() * 0.3 + 0.05).toFixed(2)),
      budget: [15, 20, 30][Math.floor(Math.random() * 3)],
      os: pick(osList),
      device: pick(deviceList),
      schedule: pick(['Everyday: 07:00 - 18:00', 'Everyday: 05:00 - 18:00', 'Everyday: 06:00 - 18:00', 'Everyday: 00:00 - 24:00']),
      conversionGoal: pick(['other-WEBSITE', 'PURCHASE-WEBSITE']),
    }
  })
}
const allData = ref(generateCampaigns(200))

// 过滤 + 分页
const filters = reactive({
  keyword: '',
  country: '',
})
const filteredData = computed(() => {
  const kw = filters.keyword.trim().toLowerCase()
  return allData.value.filter(r => {
    const okCountry = !filters.country || r.country === filters.country
    const okKw = !kw || [r.nameSuffix, r.urlPrefix, r.id].some(v => String(v).toLowerCase().includes(kw))
    return okCountry && okKw
  })
})
const page = ref(1)
const pageSize = ref(20)
const pagedData = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})
function applyFilters() { page.value = 1 }
function resetFilters() { filters.keyword = ''; filters.country = ''; page.value = 1 }

// 选择
const selectedRows = ref([])
function onSelectionChange(rows) { selectedRows.value = rows }
function confirm() {
  emit('confirm', selectedRows.value)
  visibleInner.value = false
}
</script>

<style scoped>
.campaign-config-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid var(--el-border-color);
  margin-right: 0;
  padding: 12px 16px;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0 12px;
}
.left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.right {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>


