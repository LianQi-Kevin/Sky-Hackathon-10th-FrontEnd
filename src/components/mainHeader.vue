<script lang="ts" setup>
import {Moon, Sunny} from "@element-plus/icons-vue";
import router from "@/router";
import {useDark} from "@vueuse/core";

// header switch
const activeIndex = ref<string>('/home')

// theme switch
const isDark = useDark()
</script>

<template>
  <el-menu
    :default-active="activeIndex"
    :ellipsis="false"
    class="header"
    mode="horizontal"
    @select="(key: string) => {router.push(key)}"
  >
    <h2 class="title mainTitle">Sky-Hackathon 10th</h2>
    <h3 class="title subTitle">Team: 无辑</h3>

    <div class="titleFill"/>
    <!--      <h2>标准对比器</h2>-->
    <div class="titleFill"/>

    <el-menu-item index="/home">Chat</el-menu-item>
    <el-menu-item index="/about">About</el-menu-item>

    <div class="titleFillMini" style="flex-grow: 1"/>

    <el-divider direction="vertical"/>
    <el-switch
      v-model="isDark"
      :active-action-icon="Moon"
      :inactive-action-icon="Sunny"
      style="--el-switch-on-color: var(--el-switch-off-color)"
    >
      <el-option v-if="isDark" label="Light" value="light"/>
      <el-option v-else label="Dark" value="dark"/>
    </el-switch>
    <el-divider direction="vertical"/>
    <el-link :underline="false" href="https://github.com/LianQi-Kevin/Sky-Hackathon-10th" target="_blank">
      <img v-if="isDark" alt="github_logo" class="logo" src="@/assets/svg/github-mark-white.svg"/>
      <img v-else alt="github_logo" class="logo" src="@/assets/svg/github-mark.svg"/>
    </el-link>
  </el-menu>
</template>

<style lang="scss" scoped>
.header {
  padding: 10px 10px 5px 0;
  display: flex;
  justify-content: start;
  align-items: center;

  .title {
    margin: 0 0 0 15px;
  }

  .mainTitle {
    color: var(--el-color-primary);
    font-size: 20px;
  }

  .subTitle {
    font-size: 18px;
  }

  .titleFill {
    flex-grow: 1;
  }

  .logo {
    height: 20px;
    margin: 0 7px;
  }
}

@media only screen and (max-width: 620px) {
  .mainTitle {
    display: none;
  }
}

@media only screen and (min-width: 426px) {
  .titleFillMini {
    display: none;
  }
}

@media only screen and (max-width: 426px) {
  .title, .titleFill {
    display: none;
    flex-grow: 0;
  }

  .titleFillMini {
    display: flex;
    flex-grow: 1;
  }
}
</style>