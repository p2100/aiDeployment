<template>
  <span
    :class="['img-viewer', props.class]"
    @mouseover="_mouseoverFn"
    @mouseout="_mouseoutFn"
    :style="{
      width: `auto`,
      height: `${props.height}px`,
    }"
  >
    <successIconSvg
      class="success-icon"
      v-if="props.border && loaded && props.success"
    />
    <el-image
      class="papaya-image"
      :class="[
        loaded && props.border ? 'border-mode' : '',
        loaded && props.border && props.selectedMode && selected
          ? 'selected-state'
          : '',
      ]"
      :style="{
        width: `${props.width}px`,
        height: `${props.height}px`,
      }"
      :fit="props.fit"
      :src="props.src"
      :lazy="props.lazy"
      :preview-src-list="props.selectedMode ? [] : previewList"
      :initial-index="props.initialIndex"
      :preview-teleported="true"
      :hide-on-click-modal="true"
      @load="loadHandler"
      :scrollContainer="scrollContainer"
    >
      <template #error>
        <el-image
          class="papaya-image"
          :src="failImage"
          :style="{ width: `${props.width}px`, height: `${props.height}px` }"
        ></el-image>
      </template>
      <template #placeholder>
        <div
          class="image-loading loader"
          :style="{
            width: `${props.width || 1.9 * props.height}px`,
            height: `${props.height}px`,
          }"
        >
          <el-image
            class="papaya-image"
            :src="loadingImageSvg"
            :style="{
              width: `${props.width || 1.9 * props.height}px`,
              height: `${props.height}px`,
            }"
          >
          </el-image>
          <div class="loading"></div>
        </div>
      </template>
    </el-image>
    <div class="iv-close-container" v-show="mouse && props.isDel" @click="del">
      <el-icon class="iv-close-status" color="#fff"><Close /></el-icon>
    </div>
  </span>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import placeholderImage from "@/assets/placeholder-image.png";
import failImage from "@/assets/fail-image.png";
import loadingImageSvg from "@/assets/loading-image.svg?url";
import successIconSvg from "@/assets/success-icon.svg?component";

const TYPE = [".png", ".jpg", ".jpeg"];
function isShowErrorTitle(name) {
  return TYPE.filter((item) => name.includes(item)).length;
}

interface Props {
  src?: string;
  preview?: string[];
  initialIndex?: number;
  height?: number;
  width?: number;
  lazy?: boolean;
  isDel?: boolean;
  hideInError?: boolean;
  border?: boolean;
  selectedMode?: boolean;
  success?: boolean;
  scrollContainer?: string | HTMLElement | undefined;
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit
   */
  fit?: "fill" | "contain" | "cover" | "none" | "scale-down";
  class?: any;
}

const props = withDefaults(defineProps<Props>(), {
  src: placeholderImage,
  height: 60,
  lazy: false,
  preview: () => [],
  isDel: false,
  hideInError: false,
  border: false,
  selectedMode: false,
  success: false,
  scrollContainer: undefined,
});

const loaded = ref(false);
const selected = ref(false);
let timer;

defineExpose({
  toggleSelected: () => {
    selected.value = !selected.value;
    console.log("Exec: ", selected.value);
  },
});

function loadHandler() {
  loaded.value = true;
}

const previewList = ref([props.src, ...props.preview]);
const mouse = ref(false);

watch(props, (newData) => {
  previewList.value = [newData.src, ...newData.preview];
});
const emits = defineEmits(["delete"]);
function del() {
  emits("delete");
}
function _mouseoverFn() {
  if (!props.isDel) {
    return;
  }
  mouse.value = true;
}

function _mouseoutFn() {
  if (!props.isDel) {
    return;
  }
  mouse.value = false;
}
</script>

<style scoped lang="scss">
.img-viewer {
  display: inline-block;
  position: relative;
  cursor: pointer;

  .papaya-image {
    overflow: unset;
  }
  .border-mode {
    border-radius: 4px;
    border: 1px solid var(--ty-border-color2);
    padding: 10px 16px;
  }

  .selected-state {
    border-color: var(--ty-color-primary);
    background-color: var(--ty-color-primary-6);
  }

  .success-icon {
    position: absolute;
    top: 2px;
    right: 2px;
  }
}

.iv-close-container {
  width: 20px;
  height: 20px;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 20;
  background-color: #f56c6c;

  .iv-close-status {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 40%;
    padding-top: 50%;
    font-weight: bolder;

    svg {
      position: absolute;
      top: 0;
    }
  }
}

.image-loading {
  position: relative;
  .loading {
    position: absolute;
    width: 44%;
    height: 6%;
    left: 28%;
    bottom: 24%;
    transform: scaleY(0.5);
    background: lightgrey;
    border-radius: 10px;
    overflow: hidden;
    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 50%;
      height: 100%;
      background: #1470fc;
      border-radius: 10px;
      z-index: 1;
      animation: loading 0.6s alternate infinite;
    }
  }
}

@keyframes bit {
  from {
    opacity: 0.3;
  }
  to {
    opacity: 1;
  }
}

@keyframes loading {
  0% {
    // left: -25%;
    transform: translateX(-25%);
  }
  100% {
    // left: 70%;
    transform: translateX(100%);
  }
  0% {
    // left: -25%;
    transform: translateX(-25%);
  }
}
</style>
