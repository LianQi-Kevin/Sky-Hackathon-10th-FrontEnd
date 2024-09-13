<script lang="ts" setup>
import {UploadFilled} from "@element-plus/icons-vue";
import type {
  UploadFile,
  UploadFiles,
  UploadInstance,
  UploadProgressEvent,
  UploadProps,
  UploadRawFile,
} from "element-plus";
import {ElMessage, genFileId} from "element-plus";
import FilePreview from "@/components/FilePreview.vue";
import {getFileMD5} from "@/tools/file";
import type {FileUploadDBResponse} from "@/types/network/file";
import path from 'path-browserify';

interface propsType {
  autoUpload?: boolean;
  accept_type?: string;
  upload_limit?: number;
}

const props = withDefaults(defineProps<propsType>(), {
  autoUpload: true,
  accept_type: ".pdf",
  upload_limit: 1,
})

// el-upload
const uploadRef = ref<UploadInstance>()
// 自动替换上一个文件
const handleExceed: UploadProps['onExceed'] = (files: File[]) => {
  uploadRef.value!.clearFiles()
  const file = files[0] as UploadRawFile
  beforeUpload(file)
  file.uid = genFileId()
  uploadRef.value!.handleStart(file)
  uploadRef.value!.submit()
}
// 文件上传前钩子
const beforeUpload: UploadProps['beforeUpload'] = (rawFile: UploadRawFile) => {
  filePreviewRaw.value = rawFile as File;
  // 限制文件大小
  if (rawFile.size > 50 * 1024 * 1024) {
    console.error('file size must be less than 50mb')
    ElMessage.error('上传文件的尺寸必须小于 50mb')
    filePreviewProgress.value = 5
    filePreviewStatus.value = 'exception'
    return false
  }

  // 检查文件类型
  if (!props.accept_type.includes(path.extname(rawFile.name))) {
    console.error('file type is not supported, please re-upload')
    ElMessage.error('上传文件的不支持，请重新上传')
    filePreviewProgress.value = 5
    filePreviewStatus.value = 'exception'
    return false
  }

  // 重置状态
  filePreviewStatus.value = '';
  return true
}
// 请求参数添加文件md5
async function append_file_md5(raw_file: UploadRawFile): Promise<Record<string, any>> {
  const file_md5 = await getFileMD5(raw_file as File)
  return {'file_md5': file_md5}
}
// onSuccessfulEvt
const onSuccessfulEvt = (response: FileUploadDBResponse, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  filePreviewProgress.value = 100
  filePreviewStatus.value = 'success'
  emit('onSuccess', response, uploadFile, uploadFiles)
}

// filePreview
const filePreviewRaw = ref<File>()
const filePreviewProgress = ref<number>(0)
const filePreviewStatus = ref<'success' | 'warning' | 'exception' | ''>()
// onprogressEvt
const onprogressEvt = (evt: UploadProgressEvent) => {
  const progress: number = Math.floor((evt.loaded / evt.total) * 100)
  filePreviewProgress.value = progress !>= 99 ? 99 : progress
}

const emit = defineEmits<{
  (e: 'onSuccess', response: FileUploadDBResponse, uploadFile: UploadFile, uploadFiles: UploadFiles): void
  (e: 'onError', error: Error, uploadFile: UploadFile, uploadFiles: UploadFiles): void
}>()
</script>

<template>
  <div class="content">
    <el-upload
      ref="uploadRef"
      class="uploadMain"

      :accept="props.accept_type"
      :limit="props.upload_limit"

      :before-upload="beforeUpload"
      :data="append_file_md5"
      :on-progress="onprogressEvt"

      :on-success="(response, file, fileList) => onSuccessfulEvt(response, file, fileList)"

      :on-exceed="handleExceed"
      :show-file-list="false"
      action="/api/file/"
      :on-error="(error, file, fileList) => emit('onError', error, file, fileList)"
      method="post"

      :auto-upload="props.autoUpload"
      :drag="true"
    >
      <el-icon v-show="!filePreviewRaw" class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        <el-text>{{ !filePreviewRaw ? "拖拽 或 点击此处上传文件" : "拖拽 或 点击此处重新上传文件" }}</el-text>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          {{ "上传文件的尺寸必须小于 50mb" }}
        </div>
      </template>
    </el-upload>

    <FilePreview
      :progress="filePreviewProgress"
      :raw="filePreviewRaw"
      :status="filePreviewStatus"
      class="uploadPreview"
    />
  </div>
</template>

<style lang="scss" scoped>
.content {
  display: flex;
  flex-direction: column;
}

:deep(.el-upload-dragger) {
  padding: 20px 10px;

  .el-icon--upload {
    font-size: 50px;
    margin-bottom: 5px;
  }
}
</style>