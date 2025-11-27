<template>
  <el-header height="56px" class="topbar">
    <div class="left">
      <el-button round type="primary" plain @click="openConfigDialog">campaign config</el-button>
      <el-button round type="primary" plain @click="openAccountDialog">账户信息</el-button>
    </div>
    <div class="right">
      <el-button type="primary">提交</el-button>
    </div>
  </el-header>
  <AccountSelectDialog v-model="accountDialogVisible" @confirm="onAccountConfirm" />
  <CampaignConfigDialog v-model="configDialogVisible" @confirm="onConfigConfirm" />
</template>

<script setup>
import { ref } from 'vue'
import AccountSelectDialog from '@components/AccountSelectDialog.vue'
import CampaignConfigDialog from '@components/CampaignConfigDialog.vue'

const accountDialogVisible = ref(false)
const configDialogVisible = ref(false)

function openAccountDialog() { accountDialogVisible.value = true }
function openConfigDialog() { configDialogVisible.value = true }

function onAccountConfirm(rows) { console.log('selected accounts:', rows) }
function onConfigConfirm(rows) { console.log('selected campaigns:', rows) }
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
}
.left {
  display: flex;
  gap: 12px;
}
</style>


