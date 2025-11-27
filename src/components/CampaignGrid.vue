<template>
  <div class="grid">
    <el-row :gutter="20">
      <el-col v-for="(item, index) in list" :key="index" :xs="24" :sm="12" :lg="12">
        <CampaignCard :title="item.title" />
      </el-col>
    </el-row>
  </div>
  </template>
  
  <script setup>
  import CampaignCard from '@components/CampaignCard.vue'
  
  const props = defineProps({
    list: {
      type: Array,
      default: () => [],
    },
  })
  </script>
  
  <style scoped>
  .grid :deep(.el-col) {
    margin-bottom: 20px;
  }
.grid {
  /* 抵消 el-row gutter 的负边距，避免横向滚动条 */
  padding: 0 10px;
  box-sizing: border-box;
}
/* 美化主内容区（.scroll）的滚动条，仅纵向可见，细而不突兀 */
:global(.scroll) {
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: var(--el-border-color) transparent;
}
:global(.scroll::-webkit-scrollbar) {
  width: 8px; /* 更细的滚动条 */
}
:global(.scroll::-webkit-scrollbar-track) {
  background: transparent;
}
:global(.scroll::-webkit-scrollbar-thumb) {
  background-color: var(--el-border-color);
  border-radius: 8px;
  border: 2px solid transparent; /* 让拇指更细一些 */
  background-clip: content-box;
}
:global(.scroll::-webkit-scrollbar-thumb:hover) {
  background-color: var(--el-text-color-placeholder);
}
  </style>

  

