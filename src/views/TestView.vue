<script lang="ts" setup>
import type {UploadUserFile, UploadRawFile} from "element-plus";
import type {FileUploadResponse, FileUploadDBResponse} from "@/types/network/file";
import {getFileMD5} from "@/tools/file";

const fileList: Ref<UploadUserFile[]> = ref([])
async function append_file_md5(raw_file: UploadRawFile): Promise<Record<string, any>> {
  const file_md5 = await getFileMD5(raw_file as File)
  return {'file_md5': file_md5}
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

function onFileUploadSuccessStandard(res: FileUploadDBResponse) {
  console.debug(res)
  standard_response.value = res
}

function onFileUploadSuccessSchema(res: FileUploadDBResponse) {
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

interface embeddedParams {
  file_id: string;
  file_md5: string;
  nv_api_key: string;
}

function fileEmbedded({file_id, file_md5, nv_api_key}: embeddedParams){
  console.debug("fileEmbedded", file_id, file_md5)

  const baseUrl = `/api/file/${file_id}`;
	const params = new URLSearchParams({
	 file_md5: file_md5,
	 nv_api_key: nv_api_key,
  });
  const socket = new WebSocket(`${baseUrl}?${params.toString()}`)
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

interface invokeParams {
  standard_file_id: string;
  standard_file_md5: string;
  schema_file_id?: string;
  schema_file_md5?: string;
  nv_api_key: string;
  question?: string;
  request_type?: 'query' | 'compare';
}

function invoke({
                  standard_file_id,
                  standard_file_md5,
                  schema_file_id,
                  schema_file_md5,
                  nv_api_key,
                  question,
                  request_type = 'compare'
                }: invokeParams) {
	// build socket url
	const baseUrl = "/api/invoke";
	const params = new URLSearchParams({
	 standard_file_id: standard_file_id,
	 standard_file_md5: standard_file_md5,
	 nv_api_key: nv_api_key
	});
	if (request_type === "compare") {
	 if (!schema_file_id || !schema_file_md5) {
	   console.error("schema_file_id or schema_file_md5 is missing");
	   return;
	 }
	 params.append("schema_file_id", schema_file_id);
	 params.append("schema_file_md5", schema_file_md5);
	} else {
	 if (!question) {
	   console.error("question is missing");
	   return;
	 }
	 params.append("question", question);
	}
	const socketUrl = `${baseUrl}/${request_type}?${params.toString()}`;
	console.debug(socketUrl);

  // create socket
  const socket: WebSocket = new WebSocket(socketUrl.toString())

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

    if (event.code !== 1000){
      console.error("socket close with error", event)
    }
  }
}

const nvapi_ref = ref<string>("")
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

    <el-button @click="fileEmbedded({
      file_id: standard_response.id,
      file_md5: standard_response.md5_code,
      nv_api_key:nvapi_ref
      })">embedded standard file</el-button>
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
    <span>nvapi:</span>
    <el-input v-model="nvapi_ref" placeholder="nvapi" />
    <br/>
    <span>query:</span>
    <el-input v-model="query_ref" placeholder="query_ref" />

    <el-button @click="invoke({
      standard_file_id: standard_response.id,
      standard_file_md5: standard_response.md5_code,
      nv_api_key: nvapi_ref,
      question: query_ref,
      request_type: 'query'
    })">invoke query</el-button>
    <br />
    <el-button @click="invoke({
      standard_file_id: standard_response.id,
      standard_file_md5: standard_response.md5_code,
      schema_file_id: schema_response.id,
      schema_file_md5: schema_response.md5_code,
      nv_api_key: nvapi_ref,
      request_type: 'compare'
    })">invoke compare</el-button>
    <br/>
    <br/>
    <span>result:</span>
    <el-input v-model="result_ref" placeholder="result" />
  </div>

</template>

<style lang="scss" scoped>

</style>