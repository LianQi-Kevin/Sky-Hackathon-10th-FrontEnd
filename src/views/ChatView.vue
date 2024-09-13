<script lang="ts" setup>
import type {ChatMessagePropsType} from "@/components/chatMessage.vue";
import chatInputArea from "@/components/chatInputArea.vue";
import FileUploader from "@/components/fileUploader.vue";
import type {FileUploadDBResponse, FileEmbeddedResponse} from "@/types/network/file";
import type {InvokeResponse} from "@/types/network/invoke";
import {ElMessage} from "element-plus";
import {Loading} from "@element-plus/icons-vue";

// File Upload Actions
const modeSwitchRef = ref<boolean>(false)
const standardModeRef = ref<boolean>(false)

// global submit lock
const submitLock = ref<boolean>(false)

// Chat Messages Tools
const chatMessagesLists = ref<ChatMessagePropsType[]>([])

// Prompt Input Actions
const inputValue = ref<string>('')
const submitLoadingStatus = ref<boolean>(false)
const statusBoxVisible = ref<boolean>(false) // todo StatusBox待从ChatInputArea中抽离
const statusBoxStatus = ref<'' | 'info' | 'success' | 'primary' | 'warning' | 'danger'>('')
const statusBoxMessage = ref<string>('')

// Langchain RAG Supported File Types
const Vite_Langchain_Supported_FileTypes: string = import.meta.env.VITE_LANGCHAIN_SUPPORTED_FILETYPES

// NVAPI Key
const nvapi_ref = ref<string>('')

// File Upload Params cache
const standardFileParams = ref<FileUploadDBResponse>()
const schemaFileParams = ref<FileUploadDBResponse>()

// file/ onSuccess
function onFileUploadSuccess(res: FileUploadDBResponse, type: 'standard' | 'schema') {
  console.debug(res)
  if (type === 'standard') {
    standardFileParams.value = res
  } else {
    schemaFileParams.value = res
  }

  console.debug("standardFileParams", standardFileParams.value)
  console.debug("schemaFileParams", schemaFileParams.value)
}

// file/ embedded API
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
    submitLoadingStatus.value = true
  }
  socket.onmessage = function(event: MessageEvent) {
    statusBoxVisible.value = true;
    console.debug("socket message")
    console.debug(event.data)
    const data = JSON.parse(event.data) as FileEmbeddedResponse
    switch (data.status) {
      case "success":
        statusBoxMessage.value = data.message
        statusBoxStatus.value = 'success'
        if (standardFileParams.value && data.data) {
          Object.assign(standardFileParams.value, data.data);
        }
        break;
      case "embedding":
        statusBoxMessage.value = data.status
        statusBoxStatus.value = 'primary'
        break;
      case "field":
        statusBoxMessage.value = data.message
        statusBoxStatus.value = 'danger'
        break;
      default:
        statusBoxMessage.value = data.message
        statusBoxStatus.value = 'info'
    }
  }
  socket.onerror = function(event: Event) {
    console.debug("socket error", event);
    statusBoxVisible.value = false;
  }
  socket.onclose = function(event: CloseEvent) {
    console.debug("socket close", event);
    if (event.code === 1000) {
      console.debug("socket close success");
      console.log("standardFileParams", standardFileParams)
    } else {
      console.error("socket close error", event)
      ElMessage.error(event.reason)
      statusBoxStatus.value = 'danger';
      statusBoxMessage.value = event.reason;
    }
    statusBoxVisible.value = false;
  }
}


// invoke API
interface invokeParams {
  standard_file_id: string;
  standard_file_md5: string;
  schema_file_id?: string;
  schema_file_md5?: string;
  nv_api_key: string;
  question?: string;
  request_type?: 'query' | 'compare';
  chat_model?: string;
  embedder_model?: string;
}

function invoke({
                  standard_file_id,
                  standard_file_md5,
                  schema_file_id,
                  schema_file_md5,
                  nv_api_key,
                  question,
                  request_type = 'compare',
                  chat_model = '01-ai/yi-large',
                  embedder_model = 'nvidia/nv-embed-v1',
                }: invokeParams) {
  // build socket url
  const baseUrl = "/api/invoke";
  const params = new URLSearchParams({
    standard_file_id: standard_file_id,
    standard_file_md5: standard_file_md5,
    nv_api_key: nv_api_key,
    chat_model: chat_model,
    embedder_model: embedder_model
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

  // set submit lock
  submitLock.value = true

  // create socket
  const socket: WebSocket = new WebSocket(socketUrl.toString())

  socket.onopen = function () {
    console.debug("socket open")
    submitLoadingStatus.value = true
  }

  socket.onmessage = function (event) {
    console.debug("socket message", event.data)
    const data = JSON.parse(event.data) as InvokeResponse
    console.debug(data)
    switch (data.status) {
      case "success":
        // 遍历 data.result 模仿打字机输出
        let i = 0;
        const lastMessage = chatMessagesLists.value[chatMessagesLists.value.length - 1];
        const interval = setInterval(() => {
          // 更新 chatMessagesLists 中最后一个消息对象的内容
          lastMessage.content += data.result[i++];
          if (i === data.result.length) {
            clearInterval(interval);
          }
        }, 30);
        statusBoxVisible.value = false
        submitLoadingStatus.value = false
        submitLock.value = false
        break;
      case "field":
        console.error(data.message)
        ElMessage.error(data.message)
        statusBoxVisible.value = false
        break;
      case "checking":
      case "extracting":
      case "loading":
      case "querying":
      case "retrieving":
      case "summarizing":
      case "verifying":
        statusBoxVisible.value = true
        statusBoxMessage.value = data.status
        statusBoxStatus.value = 'primary'
        break;
      default:
        console.error("unknown status", data)

    }
    if (data.status === "success")

      socket.onerror = function (event) {
        console.debug("socket error", event)
      }

    socket.onclose = function (event) {
      console.debug("socket close", event)

      if (event.code !== 1000) {
        console.error("socket close with error", event)
        ElMessage.error(event.reason)
      }
    }
  }
}

// Query Submit Message
function querySubmitMessage() {
  // check global submit lock
  if (submitLock.value) {
    console.error("submit lock is true")
    return
  }

  console.debug("inputValue: ", inputValue.value)
  // 验证 nvapi-key 是否存在
  if (!nvapi_ref.value) {
    // nvapi.startsWith = 'nvapi-' && nvapi.length == 70
    if (!nvapi_ref.value.startsWith('nvapi-') || nvapi_ref.value.length !== 70) {
      console.error('请填写正确的NVIDIA NIM API-KEY')
      ElMessage.error('请填写正确的NVIDIA NIM API-KEY')
      return
    }
    console.error('请填写NVIDIA NIM API-KEY')
    ElMessage.error('请填写NVIDIA NIM API-KEY')
    return
  }

  // 检查 standardFileParams 是否存在
  if (!standardFileParams.value) {
    console.error('请上传国家标准文件')
    ElMessage.error('请上传国家标准文件')
    return
  }

  // 开始提交
  submitLock.value = true
  submitLoadingStatus.value = true

  // 添加 query 到 chatMessagesLists
  chatMessagesLists.value.push({role: 'user', content: inputValue.value})

  // 检查 standardFileParams.embedded_status 是否为 embedded
  if (standardFileParams.value.embedded_status !== 'embedded') {
    // 调用 fileEmbedded
    fileEmbedded({
      file_id: standardFileParams.value.id,
      file_md5: standardFileParams.value.md5_code,
      nv_api_key: nvapi_ref.value
    })
  }

  // 创建 query
  chatMessagesLists.value.push({role: 'assistant', content: ''})
  invoke({
    standard_file_id: standardFileParams.value.id,
    standard_file_md5: standardFileParams.value.md5_code,
    nv_api_key: nvapi_ref.value,
    question: inputValue.value,
    request_type: 'query'
  })

  // clear input value
  inputValue.value = ''

  // move scrollbar to bottom
  nextTick(() => {
    const chatMessages = document.querySelector('.chatMessages')
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight
    }
  })
}

// Compare Submit Message
function compareSubmitMessage() {
  // check global submit lock
  if (submitLock.value) {
    console.error("submit lock is true")
    return
  }

  console.debug("standardFileParams", standardFileParams.value)
  console.debug("schemaFileParams", schemaFileParams.value)

  // 验证 nvapi-key 是否存在
  if (!nvapi_ref.value) {
    // nvapi.startsWith = 'nvapi-' && nvapi.length == 70
    if (!nvapi_ref.value.startsWith('nvapi-') || nvapi_ref.value.length !== 70) {
      console.error('请填写正确的NVIDIA NIM API-KEY')
      ElMessage.error('请填写正确的NVIDIA NIM API-KEY')
      return
    }
    console.error('请填写NVIDIA NIM API-KEY')
    ElMessage.error('请填写NVIDIA NIM API-KEY')
    return
  }

  // 检查 standardFileParams 是否存在
  if (!standardFileParams.value) {
    console.error('请上传国家标准文件')
    ElMessage.error('请上传国家标准文件')
    return
  }

  // 检查 schemaFileParams 是否存在
  if (!schemaFileParams.value) {
    console.error('请上传设计参数文件')
    ElMessage.error('请上传设计参数文件')
    return
  }

  // 开始提交
  submitLock.value = true

  // 检查 standardFileParams.embedded_status 是否为 embedded
  if (standardFileParams.value.embedded_status !== 'embedded') {
    // 调用 fileEmbedded
    fileEmbedded({
      file_id: standardFileParams.value.id,
      file_md5: standardFileParams.value.md5_code,
      nv_api_key: nvapi_ref.value
    })
  }

  // 创建 compare
  if (chatMessagesLists.value.length !== 0) {
    // clear chatMessagesLists
    chatMessagesLists.value.length = 0
  }

  chatMessagesLists.value.push({role: 'assistant', content: ''})
  invoke({
    standard_file_id: standardFileParams.value.id,
    standard_file_md5: standardFileParams.value.md5_code,
    schema_file_id: schemaFileParams.value.id,
    schema_file_md5: schemaFileParams.value.md5_code,
    nv_api_key: nvapi_ref.value,
    request_type: 'compare'
  })
}

// chatMessagesLists 更新时滚动页面到底部
const chatMessagesRef = ref()
watch(chatMessagesLists, () => {
  if (chatMessagesRef) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }
}, {deep: true, flush: 'post'})
</script>

<template>
  <div class="container">
    <div class="chatContainer">
      <div class="chatMessages" v-show="chatMessagesLists.length === 0">
        <el-empty style="height: 100%;">
          <template #default>
            <h2>欢迎使用国标咨询工具</h2>
            <p v-if="modeSwitchRef">请在上传您的设计参数文档以进行校验</p>
            <p v-else>请在下方输入框输入您的问题</p>
          </template>
        </el-empty>
      </div>
      <div v-show="chatMessagesLists.length !== 0" ref="chatMessagesRef" class="chatMessages">
        <template v-for="(message, index) in chatMessagesLists" :key="index">
          <chat-message :content="message.content" :role="message.role"/>
        </template>
      </div>

      <el-button v-if="modeSwitchRef" :disabled="submitLoadingStatus" class="invokeBtn" round @click="compareSubmitMessage">开始对比</el-button>
      <chatInputArea v-else v-model:inputValue="inputValue" v-model:submitLoading="submitLoadingStatus" :show-status-box="statusBoxVisible"
                     class="queryBtn" @submit="querySubmitMessage">
        <div class="status__inner">
          <el-icon v-if="statusBoxStatus !== 'success' && statusBoxStatus !== 'danger'" class="is-loading"
                   style="margin: 0 10px 0 0; font-size: 17px;">
            <Loading/>
          </el-icon>
          <el-text :type="statusBoxStatus" size="large" text>{{ statusBoxMessage }}</el-text>
        </div>
      </chatInputArea>
    </div>

    <div class="fileUploadArea">
      <h4 style="margin: 24px 0 0 0">NVIDIA NIM API-KEY</h4>
      <div class="fileUploadArea__nvapiKey">
        <el-input v-model="nvapi_ref" clearable placeholder="请输入您的API Key"/>
      </div>
      <el-divider style="flex-grow: 0; margin: 14px 0"/>
      <h4 style="margin: 0">交互模式</h4>
      <div class="fileUploadArea__ModeSwitch">
        <el-switch v-model="modeSwitchRef" active-text="方案对比" inactive-text="对话咨询" size="large" @change="() => {
          // 清理 chatMessagesLists
          chatMessagesLists.length = 0;
        }"/>
      </div>
      <el-divider style="flex-grow: 0; margin: 14px 0"/>
      <div class="uploadArea">
        <div class="standard">
          <div class="standard__title"
               style="display: flex; flex-direction: row; justify-content: space-between; align-items: baseline">
            <h4 style="margin: 0">国家标准</h4>
            <!-- todo: 使用现有标准未完成 -->
            <el-switch v-model="standardModeRef" active-text="选择现有标准" disabled inactive-text="上传新标准"
                       size="small" style="display: none; "/>
          </div>
          <el-select v-show="standardModeRef"/>
          <file-uploader v-show="!standardModeRef" :accept_type="Vite_Langchain_Supported_FileTypes"
                         class="standard_upload"
                         @on-success="(response) => {onFileUploadSuccess(response, 'standard')}"
          />
        </div>
        <el-divider v-if="modeSwitchRef" style="flex-grow: 0; margin: 14px 0"/>
        <div v-show="modeSwitchRef" class="schema">
          <h4 style="margin: 0">设计参数文档</h4>
          <file-uploader :accept_type="Vite_Langchain_Supported_FileTypes" class="schema_upload"
                         @on-success="(response) => {onFileUploadSuccess(response, 'schema')}"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  height: 100%;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 10px 0 10px 0;


  display: flex;
  flex-direction: row;
  justify-content: start;
  gap: 15px;

  overflow: hidden;

  .chatContainer {
    height: 100%;
    width: 100%;

    display: flex;
    flex-direction: column;
    gap: 10px;

    ::-webkit-scrollbar {
      display: block;
    }

    .chatMessages{
      flex-grow: 1;
      overflow-y: auto;
      overflow-x: hidden;

      :deep(.el-empty__description) {
        display: none;
      }
    }

    .invokeBtn {
      padding: 10px;
      margin: 0 10px 10px 20px;
    }

    .queryBtn {
      margin: 2px 10px 10px 20px;
    }
  }

  .fileUploadArea {
    width: 100%;
    max-width: 260px;

    display: flex;
    flex-direction: column;
    gap: 10px;

    overflow-x: hidden;
    overflow-y: auto;


    .fileUploadArea__ModeSwitch {
      display: flex;
      justify-content: center;

      border-radius: 6px;
      border: 1px dashed var(--el-border-color)
    }

    .uploadArea {
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: start;

      .standard {
        flex-grow: 1;

        .standard_upload {
          margin: 20px 0 0 0;
        }
      }

      .schema {
        flex-grow: 1;

        .schema_upload {
          margin: 20px 0;
        }
      }
    }
  }

  @media only screen and (max-width: 1000px) {
    .fileUploadArea {
      margin-right: 20px;
    }
  }

  @media only screen and (max-width: 600px) {
    .fileUploadArea {
      display: none;
    }
  }
}
</style>