<template>
  <el-dialog
    v-model="dialogVisible"
    title="选择logo"
    width="800px"
    append-to-body
    destroy-on-close
    :before-close="handleClose"
  >
    <div class="logo-select-content">
      <div class="logo-grid">
        <div
          v-for="logo in logos"
          :key="logo.logo_name"
          :class="['logo-item', { selected: isSelected(logo.logo_name) }]"
          @click="toggleSelect(logo.logo_name)"
        >
          <el-checkbox
            :model-value="isSelected(logo.logo_name)"
            @click.stop
            @change="toggleSelect(logo.logo_name)"
            class="logo-checkbox"
          />
          <papaya-image
            :src="`https://static.spga.xyz/${logo.logo_name}`"
            :preview="[`https://static.spga.xyz/${logo.logo_name}`]"
            fit="contain"
          ></papaya-image>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { indexApi } from "@api/index";
import PapayaImage from "@components/papaya-image.vue";
import axios from "axios";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  selectedLogos: {
    type: Array,
    default: () => [],
  },
  site: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// Logo 列表数据
const logos = ref([]);

// 当前选中的 logo IDs
const selectedIds = ref([...props.selectedLogos]);

// 监听弹窗打开，重新获取数据
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      selectedIds.value = [...props.selectedLogos];
      getLogoImages();
    }
  }
);

const getLogoImages = async () => {
  const params = {};
  if (props.site) {
    params.project = props.site;
    const res = await indexApi.getLogoImages(params);
    // const res = await axios.get("http://new.sp.com/material_square/auto_ads/placement/get_logo_images", { params });
    logos.value = res.result;
  }
};

// 判断是否选中
const isSelected = (id) => {
  return selectedIds.value.includes(id);
};

// 切换选中状态
const toggleSelect = (id) => {
  const index = selectedIds.value.indexOf(id);
  if (index > -1) {
    selectedIds.value.splice(index, 1);
  } else {
    selectedIds.value.push(id);
  }
};

// 上传
const handleUpload = () => {
  console.log("上传 logo");
  // 这里可以添加上传逻辑
};

// 关闭
const handleClose = () => {
  dialogVisible.value = false;
};

// 确认
const handleConfirm = () => {
  emit("confirm", selectedIds.value);
  handleClose();
};
</script>

<style scoped>
.logo-select-content {
  /* padding: 20px 0; */
}

.logo-actions {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.logo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 16px;
}

.logo-item {
  position: relative;
  /* width: 100px; */
  /* height: 100px; */
  /* border: 2px solid #e0e3eb; */
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logo-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.logo-item.selected {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.5);
  background-color: #ecf5ff;
}

.logo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-checkbox {
  position: absolute;
  top: -4px;
  left: 4px;
  z-index: 10;
}

.logo-checkbox :deep(.el-checkbox__inner) {
  background-color: rgba(255, 255, 255, 0.9);
}

.logo-item.selected .logo-checkbox :deep(.el-checkbox__inner) {
  background-color: #409eff;
  border-color: #409eff;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>
