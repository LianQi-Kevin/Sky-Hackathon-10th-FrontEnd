<script lang="ts" setup>
import type {UploadUserFile, UploadRawFile, UploadFile, UploadFiles} from "element-plus";
import {getFileMD5} from "@/tools/file";

const fileList: Ref<UploadUserFile[]> = ref([])
async function append_file_md5(raw_file: UploadRawFile): Promise<Record<string, any>> {
  const file_md5 = await getFileMD5(raw_file as File)
  return {'file_md5': file_md5}
}

interface FileUploadResponse {
  embedded_status: "pending" | "embedding" | "embedded";
  md5_code: string;
  file_suffix?: string;
  upload_time?: number;
}

interface FileUploadDBResponse extends FileUploadResponse {
  id: string;
}


interface FileEmbeddedResponse {
  status: "verified" | "success" | "embedding" | "field";
  data: FileUploadResponse;
  message: string;
}

interface InvokeResponse {
  status: "verifying" | "loading" | "extracting" | "retrieving" | "checking" | "summarizing" | "querying" | "success" | "field";
  message: string;
  result: string;
}

function onFileUploadSuccessStandard(res: FileUploadDBResponse, uploadFile: UploadFile, uploadFiles: UploadFiles) {
  console.debug(res)
  standard_response.value = res
}

function onFileUploadSuccessSchema(res: FileUploadDBResponse, uploadFile: UploadFile, uploadFiles: UploadFiles) {
  console.debug(res)
  schema_response.value = res
}

const standard_response = ref<FileUploadDBResponse>({
  embedded_status: "pending",
  id: "",
  md5_code: "",
  file_suffix: "",
  upload_time: 0.0
})

const schema_response = ref<FileUploadDBResponse>({
  embedded_status: "pending",
  id: "",
  md5_code: "",
  file_suffix: "",
  upload_time: 0.0
})

function fileEmbedded(file_id: string, file_md5: string, nv_api_key: string){
  console.debug("fileEmbedded", file_id, file_md5)

  const socket = new WebSocket(`/ws_api/file/${file_id}?file_md5=${file_md5}&nv_api_key=${nv_api_key}`)
  socket.onopen = function() {
    console.debug("socket open")
  }
  socket.onmessage = function(event) {
    console.debug("socket message", event.data)
    const data = JSON.parse(event.data) as FileEmbeddedResponse
    console.debug(data)
    if (data.status === "success") {
      result_ref.value = data.message
    }
  }
  socket.onerror = function(event) {
    console.debug("socket error", event)
  }
  socket.onclose = function(event) {
    console.debug("socket close", event)
  }
}

function invokeCompare(standard_file_id: string, schema_file_id: string, standard_file_md5: string, schema_file_md5: string, nv_api_key: string){
  console.debug("invokeCompare", standard_file_id, schema_file_id)

  const socket = new WebSocket(`/ws_api/invoke/compare?standard_file_id=${standard_file_id}&schema_file_id=${schema_file_id}&standard_file_md5=${standard_file_md5}&schema_file_md5=${schema_file_md5}&nv_api_key=${nv_api_key}`)
  socket.onopen = function() {
    console.debug("socket open")
  }
  socket.onmessage = function(event) {
    console.debug("socket message", event.data)
    const data = JSON.parse(event.data) as InvokeResponse
    console.debug(data)
    if (data.status === "success") {
      result_ref.value = data.result
    }
  }
  socket.onerror = function(event) {
    console.debug("socket error", event)
  }
  socket.onclose = function(event) {
    console.debug("socket close", event)
  }
}

function invokeQuery(standard_file_id: string, standard_file_md5: string, question: string, nv_api_key: string){
  console.debug("invokeQuery", standard_file_id, standard_file_md5)

  const socket = new WebSocket(`/ws_api/invoke/query?standard_file_id=${standard_file_id}&standard_file_md5=${standard_file_md5}&question=${question}&nv_api_key=${nv_api_key}`)
  socket.onopen = function() {
    console.debug("socket open")
  }
  socket.onmessage = function(event) {
    console.debug("socket message", event.data)
    const data = JSON.parse(event.data) as InvokeResponse
    console.debug(data)
    if (data.status === "success") {
      result_ref.value = data.result
    }
  }
  socket.onerror = function(event) {
    console.debug("socket error", event)
  }
  socket.onclose = function(event) {
    console.debug("socket close", event)
  }

}

const query_ref = ref<string>("我想设计一款最高时速能达到120km/h的电动自行车，是否符合国家标准？")
const result_ref = ref<string>("")
</script>

<template>
  <div>
    <el-upload
      :data="append_file_md5"
      :file-list="fileList"
      :on-success="onFileUploadSuccessStandard"
      action="/api/file/"
      method="post"
      multiple
    >
      <el-button type="primary">Click to upload standard</el-button>
      <template #tip>
        <div class="el-upload__tip">
          jpg/png files with a size less than 500KB.
        </div>
      </template>
    </el-upload>
    <el-upload
      :data="append_file_md5"
      :file-list="fileList"
      :on-success="onFileUploadSuccessSchema"
      action="/api/file/"
      method="post"
      multiple
    >
      <el-button type="primary">Click to upload schema</el-button>
      <template #tip>
        <div class="el-upload__tip">
          jpg/png files with a size less than 500KB.
        </div>
      </template>
    </el-upload>

    <el-button @click="fileEmbedded(
      standard_response.id,
      standard_response.md5_code,
      'nvapi-'
      )">embedded standard file</el-button>
    <br />
    <code>
      standard info:<br />
      id: {{ standard_response.id }}<br />
      md5_code: {{ standard_response.md5_code }}<br />
      embedded_status: {{ standard_response.embedded_status }}<br />
      file_suffix: {{ standard_response.file_suffix }}<br />
    </code>
    <br/>
    <code>
      schema info:<br />
      id: {{ schema_response.id }}<br />
      md5_code: {{ schema_response.md5_code }}<br />
      embedded_status: {{ schema_response.embedded_status }}<br />
      file_suffix: {{ schema_response.file_suffix }}<br />
    </code>
    <br/>

    <el-input v-model="query_ref" placeholder="query_ref" />

    <el-button @click="invokeQuery(
      standard_response.id,
      standard_response.md5_code,
      query_ref,
      'nvapi-'
      )">invoke query</el-button>
    <br />
    <el-button @click="invokeCompare(
      standard_response.id,
      schema_response.id,
      standard_response.md5_code,
      schema_response.md5_code,
      'nvapi-'
      )">invoke compare</el-button>
    <el-input v-model="result_ref" placeholder="result" />
  </div>

</template>

<style lang="scss" scoped>

</style>