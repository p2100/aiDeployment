<script setup>
import TopBar from '@components/TopBar.vue'
import SideBar from '@components/SideBar.vue'
import CampaignGrid from '@components/CampaignGrid.vue'

const campaigns = Array.from({ length: 60 }).map((_, i) => ({
  title: `Campaign ${String(i + 1).padStart(3, '0')}`,
}))
</script>

<template>
  <el-container class="layout">
    <SideBar />
    <el-container direction="vertical" class="right">
      <TopBar />
      <el-main class="main">
        <div class="scroll">
          <CampaignGrid :list="campaigns" />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout {
  height: 100vh;
}
.right {
  width: 100%;
}
.main {
  padding: 16px;
  overflow: hidden; /* 主容器不滚动 */
  background: var(--el-bg-color-page);
}
.scroll {
  height: 100%;
  overflow-y: auto;   /* 只允许纵向滚动 */
  overflow-x: hidden; /* 禁止横向滚动 */
  padding-right: 4px;
}
</style>


