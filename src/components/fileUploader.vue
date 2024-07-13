<script lang="ts" setup>
import {UploadFilled} from "@element-plus/icons-vue";
import type {UploadInstance, UploadProps, UploadRawFile, UploadRequestHandler, UploadRequestOptions} from "element-plus";
// import type {UploadProgressEvent} from "element-plus";
// import {isNil} from "lodash-es";

import { genFileId } from 'element-plus'

interface propsType {
  autoUpload?: boolean
  accept_type?: string
  upload_limit?: number
}

const props = withDefaults(defineProps<propsType>(), {
  autoUpload: true,
  accept_type: 'image/jpeg,image/png',
  upload_limit: 1,
})

const uploadRef = ref<UploadInstance>()

const handleExceed: UploadProps['onExceed'] = (files) => {
  uploadRef.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadRef.value!.handleStart(file)
}

const emit = defineEmits<{
  (e: 'fileUpload', option: UploadRequestOptions): XMLHttpRequest | Promise<unknown>
}>()

const customHttpRequestHandler: UploadRequestHandler = async (options) => {
  // Emit the custom event with the necessary payload
  return emit('fileUpload', options);
};

/**
 * 适配 el-upload 的 xhr请求对象，用于上传文件
 *
 * @param {UploadRequestOptions} option - The options for the upload request, including the file to be uploaded.
 * @returns {Promise<XMLHttpRequest>} - A Promise that resolves with the XMLHttpRequest object used for the upload.
 */
// async function ajaxUpload(option: UploadRequestOptions): Promise<XMLHttpRequest> {
//   // 锁定 submit btn 状态
//   submitLoading.value = true
//
//   // 构建请求
//   const xhr = new XMLHttpRequest();
//
//   const url = new URL(props.api_config.API_URL)
//   url.pathname = "/v1/files"
//
//   const action: string = url.toString() // 请求URL
//
//   // 进度
//   if (xhr.upload) {
//     xhr.upload.addEventListener('progress', (evt: ProgressEvent) => {
//       const progressEvt = evt as UploadProgressEvent
//       progressEvt.percent = evt.total > 0 ? (evt.loaded / evt.total) * 100 : 0
//       console.debug('progressEvt:', progressEvt)
//       const fileItem = findItemByUid(option.file.uid);
//       if (fileItem) {
//         // 更新该文件的上传进度
//         fileItem.progress = Math.trunc(progressEvt.percent);
//       }
//     })
//   }
//
//   // 构建发送数据
//   const formData = new FormData()
//   formData.append('file', option.file)
//   formData.append('purpose', 'assistants')
//
//   // 推送基本内容
//   uploadFileList.value.push({
//     raw: option.file,
//     uid: option.file.uid,
//     b64: (option.file.type.includes('image')) ? await getBase64(option.file) : undefined,
//     progress: 0,
//     xhr: xhr
//   })
//
//   xhr.addEventListener('error', () => {
//     // 发送请求失败
//     const fileItem = findItemByUid(option.file.uid);
//     if (fileItem) {
//       fileItem.status = 'exception';
//     }
//   })
//
//   xhr.addEventListener('load', () => {
//     // 发送请求成功
//     const fileItem = findItemByUid(option.file.uid);
//     if (fileItem) {
//       // 更新上传状态
//       fileItem.status = xhr.status < 200 || xhr.status >= 300 ? 'exception' : 'success';
//       if (fileItem.status === 'success') {
//         fileItem.progress = 100;
//         const response = getBody(xhr) as unknown as openaiFileResponseObject;
//         fileItem.url = `${action}/${response.id}/content`;
//       }
//     }
//   })
//
//   xhr.addEventListener('loadend', () => {
//     // 解锁 submit btn 状态
//     submitLoading.value = false
//   })
//
//   // 创建请求
//   xhr.open(option.method, action, true)
//
//   // 构建请求头
//   const headers = option.headers || {}
//   if (headers instanceof Headers) {
//     headers.forEach((value, key) => xhr.setRequestHeader(key, value))
//   } else {
//     for (const [key, value] of Object.entries(headers)) {
//       if (isNil(value)) continue
//       xhr.setRequestHeader(key, String(value))
//     }
//   }
//
//   xhr.send(formData)
//   return xhr
// }

</script>

<template>
  <el-upload
      ref="uploadRef"
      class="uploadMain"

      :accept="props.accept_type"
      :limit="props.upload_limit"
      :multiple="false"
      :show-file-list="true"
      action="#"

      :http-request="customHttpRequestHandler"

      :on-exceed="handleExceed"
      :before-upload="() => false"

      :auto-upload="false"
      :drag="true"
  >
    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
    <div class="el-upload__text">
      <el-text >拖拽 或 点击此处上传文件</el-text>
    </div>
    <template #tip>
      <div class="el-upload__tip">
        {{ "file size must be less than 50mb" }}
      </div>
    </template>
  </el-upload>
</template>

<style lang="scss" scoped>
:deep(.el-upload-dragger) {
  padding: 20px 10px;

  .el-icon--upload {
    font-size: 50px;
    margin-bottom: 5px;
  }
}
</style>