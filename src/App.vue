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

<style lang="scss" scoped>
.mainContainer {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
