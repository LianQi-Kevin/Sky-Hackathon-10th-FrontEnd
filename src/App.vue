<script lang="ts" setup>
import {RouterView} from 'vue-router'
import mainHeader from '@/components/mainHeader.vue';

</script>

<template>
  <div class="mainContainer">
    <mainHeader style="flex-grow: 0"/>
    <RouterView style="flex-grow: 1"/>
  </div>
</template>

<style lang="scss">
// 覆盖全局滚动条样式（仿 el-scrollbar）
::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar:horizontal {
  height: 10px;
}

::-webkit-scrollbar-track {
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb {
  background-color: var(--el-scrollbar-bg-color, var(--el-text-color-secondary));
  border-radius: 9999px;
  transition: all 0.2s ease-in-out;
}
</style>

<style lang="scss" scoped>
.mainContainer {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
