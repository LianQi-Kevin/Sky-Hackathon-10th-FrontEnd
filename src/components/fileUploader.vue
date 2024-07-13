<script lang="ts" setup>
import {UploadFilled} from "@element-plus/icons-vue";
import type {UploadInstance} from "element-plus";

interface propsType {
  URL: string

  method?: string
  accept_type?: string
  upload_limit?: number
  max_size?: number
}

const props = withDefaults(defineProps<propsType>(), {
  URL: '',
  method: 'post',
  accept_type: 'image/jpeg,image/png',
  upload_limit: 1,
  max_size: 500
})

const uploadRef = ref<UploadInstance>()
</script>

<template>
  <div class="uploadBox">
    <input type="file" />
  </div>

  <el-upload ref="uploadRef" :accept="props.accept_type" :auto-upload="true" :limit="1" :multiple="false"
             :show-file-list="false" :action="props.URL" class="uploadMain" drag :method="props.method"
  >
    <div class="el-upload__text">
      <el-icon size="25"><upload-filled /></el-icon>
      Drop file here or <em>click to upload</em>
    </div>
    <template #tip>
      <div class="el-upload__tip">
        {{ "jpg / png files with a size less than 500kb" }}
      </div>
    </template>
  </el-upload>
</template>

<style lang="scss" scoped>

</style>