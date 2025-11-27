<template>
  <el-card class="campaign-card" shadow="hover">
    <div class="inner">
      <el-avatar :size="56" class="avatar">
        <el-icon>
          <component :is="icon" />
        </el-icon>
      </el-avatar>
      <div class="title">{{ title }}</div>
      <div class="subtitle">点击编辑详情</div>
    </div>
  </el-card>
</template>
  
  <script setup>
  import { computed } from 'vue'
  import { MagicStick } from '@element-plus/icons-vue'
  
  const props = defineProps({
    title: {
      type: String,
      default: 'Campaign',
    },
    icon: {
      type: [String, Object],
      default: () => MagicStick,
    },
  })
  
  const icon = computed(() => props.icon || MagicStick)
  </script>
  
  <style scoped>
  .campaign-card {
    height: 220px;
    display: flex;
  }
  .campaign-card:hover {
    cursor: pointer;
  }
  .inner {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-align: center;
  }
  .avatar {
    background: #eef4ff;
    color: var(--el-color-primary);
  }
  .title {
    font-weight: 600;
  }
  .subtitle {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
  </style>
  

