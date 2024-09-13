<script lang="ts" setup>
/* 创建文件展示列表 */
import {Document} from "@element-plus/icons-vue";
import {formatFileSize} from "@/tools/file";

interface propsType {
  raw?: File,
  progress?: number,
  status?: 'success' | 'warning' | 'exception' | null
}

const props = withDefaults(defineProps<propsType>(), {});
</script>

<template>
  <div class="content">
    <div class="fileBox">
      <div v-if="props.raw" class="fileCard">
        <el-icon class="viewIcon" size="33"><Document /></el-icon>
        <div class="fileInfo" >
          <el-text class="fileName" size="small" truncated>{{ props.raw.name }}</el-text>
          <div v-if="progress == 100 || !progress" class="fileInfo__main">
            <el-text class="fileInfo__type" size="small" type="info">
              {{ props.raw.name.split('.')[props.raw.name.split('.').length - 1].toUpperCase() }}
            </el-text>
            <el-text class="fileInfo__size" size="small" type="info">
              {{ formatFileSize(props.raw.size) }}
            </el-text>
          </div>
          <el-progress v-else :duration="5" :percentage="progress" :status="status" :stroke-width="4" class="fileInfo__progress"
                       striped striped-flow/>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
::-webkit-scrollbar {
  display: none !important;
}

.content {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;

  padding: 5px;
  height: 100%;

  //overflow-y: auto;
  //overflow-x: hidden;

  .fileBox {
    //flex-basis: 150px;
    flex-grow: 1;
    //max-width: 245px;
    //position: relative;

    .fileCard {
      max-height: 55px;

      box-sizing: border-box;
      border: grey 1px solid;
      border-radius: 8px;
      box-shadow: var(--el-box-shadow-lighter);

      padding: 8px;

      display: flex;
      flex-direction: row;
      align-items: center;

      gap: 10px;

      .viewIcon {
        border-radius: 8px;

        height: 35px;
        width: 35px;
      }

      .fileInfo {
        max-width: 150px;
        width: 100%;

        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .fileName {
          width: 100%;
        }

        .fileInfo__main {
          display: flex;
          flex-direction: row;
          gap: 10px;
        }

        .fileInfo__progress{
          width: 100%;

          :deep(.el-progress__text) {
            min-width: unset;
            font-size: 12px!important;
          }
        }
      }
    }
  }

  @media screen and (max-width: 450px) {
    .fileBox {
      max-width: 400px;

      .fileInfo {
        max-width: 200px;
      }
    }
  }
}
</style>