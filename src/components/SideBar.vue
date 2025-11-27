<template>
  <el-aside width="280px" class="sidebar">
    <div class="title" style="border-bottom: 1px solid #e0e3eb; padding-bottom: 14px;">资源管理</div>
    <el-card shadow="always" class="block">
      <div class="block-title">素材库</div>
      <el-skeleton :rows="2" animated />
    </el-card>
    <el-card shadow="always" class="block">
      <div class="block-title">文案库</div>
      <el-skeleton :rows="2" animated />
    </el-card>
  </el-aside>
</template>

<script setup>
</script>

<style scoped>
.sidebar {
  padding: 16px;
  border-right: 1px solid var(--el-border-color);
  /* 柔和的浅色渐变背景，让页面更干净 */
  background: linear-gradient(180deg, #f7faff 0%, #ffffff 100%);
}
.title {
  font-weight: 600;
  margin-bottom: 16px;
}
.block {
  margin-bottom: 16px;
}
.block:hover {
  cursor: pointer;
}
.block-title {
  font-weight: 500;
  margin-bottom: 8px;
}
</style>


