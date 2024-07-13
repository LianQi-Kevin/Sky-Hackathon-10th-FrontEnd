<script setup lang="ts">
import {useRouter} from "vue-router";
const router = useRouter()

interface PropsTypes {
  id?: number
}

const props = withDefaults(defineProps<PropsTypes>(), {
  id: 404
})
</script>

<template>
  <div class="container">
    <h1>{{props.id}} ERROR</h1>
    <p>This page have some problems</p>
    <el-button-group>
      <el-button size="large" @click="() => {router.back()}">Go Back</el-button>
      <el-button size="large" @click="() => {router.push('/home')}">Go Home</el-button>
    </el-button-group>
  </div>
</template>

<style scoped lang="scss">
.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>