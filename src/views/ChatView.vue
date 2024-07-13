<script lang="ts" setup>
import {Loading, Promotion, UploadFilled} from "@element-plus/icons-vue";

// File Upload Actions
const modeSwitchRef = ref<boolean>(false)
const accept_type = ref<string>('.pdf')

// Chat Messages Tools
interface ChatMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

const chatMessagesLists = ref<ChatMessage[]>([])

chatMessagesLists.value = [
  {role: 'system', content: 'Hello, I am a system.'},
  {role: 'user', content: 'Hello, I am a user.'},
  {role: 'assistant', content: 'Hello, I am an assistant.'},
  {role: 'user', content: 'Hello, I am a user.'},
  {role: 'assistant', content: 'Here is some python example. \n ' +
      '```python\n' +
      'def test_func():\n    ' +
      'print("Hello, I am a assistant.Hello")\n```'
  },
]

// Prompt Input Actions
const inputValue = ref<string>('')
const submitLoading = ref<boolean>(false)
function handleEnterKey(event: KeyboardEvent) {
  // todo: 或重建 el-input 以控制 enter 动作
  // 支持 ctrl + enter 换行
  if ((event.ctrlKey || event.shiftKey) && event.target instanceof HTMLTextAreaElement) {
    // 在当前光标位置插入一个新行字符
    const start = event.target.selectionStart;
    const end = event.target.selectionEnd;
    inputValue.value = inputValue.value.substring(0, start) + "\n" + inputValue.value.substring(end);
    // 将光标移动到插入的新行字符之后
    setTimeout(() => {
      if (event.target instanceof HTMLTextAreaElement) {
        event.target.selectionStart = event.target.selectionEnd = start + 1;
      }
    }, 0);
  } else {
    // 输入内容非空或全为\n
    if (inputValue.value.trim() !== '' && !inputValue.value.match(/^\n+$/)) {
      submitMessage()
    }
  }
}
function submitMessage() {
  console.log(inputValue.value)
  chatMessagesLists.value.push({role: 'user', content: inputValue.value})
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
</script>

<template>
  <div class="container">
    <div class="chatContainer">
      <div class="chatMessages" >
        <template v-for="(message, index) in chatMessagesLists" :key="index">
          <chat-message :content="message.content" :role="message.role"/>
        </template>
      </div>

      <div class="chatPromptArea">
        <el-input v-model="inputValue" :autosize="{ minRows: 1, maxRows: 8 }" autofocus
                  class="inputText" maxlength="4000"
                  placeholder="Please type here" type="textarea" @keyup.enter.native="handleEnterKey"
        />
        <el-button :disabled="!(inputValue.length > 0) || submitLoading" class="submitBtn" @click="submitMessage">
          <el-icon v-show="!submitLoading" size="17"><Promotion/></el-icon>
          <el-icon v-show="submitLoading" class="is-loading" size="17"><Loading/></el-icon>
        </el-button>
      </div>
    </div>

    <div class="fileUploadArea">
      <div class="fileUploadArea__ModeSwitch">
        <el-switch v-model="modeSwitchRef" active-text="方案对比" inactive-text="对话咨询" size="large"/>
      </div>

      <el-upload
        ref="uploadRef"
        :accept="accept_type"
        :auto-upload="true"
        :limit="1"
        :multiple="true"
        :show-file-list="false"
        action="#"
        class="uploadMain"
        drag
        method="post"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          Drop file here or <em>click to upload</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            jpg/png files with a size less than 500kb
          </div>
        </template>
    </el-upload>
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

      .chatMessage {
        font-size: 1rem;
      }
    }

    .chatPromptArea {
      //flex-grow: 0;
      //min-height: 50px;
      border: 1px solid var(--el-box-shadow);
      box-shadow: var(--el-box-shadow-lighter);

      border-radius: 6px;

      display: flex;
      flex-direction: row;
      align-items: end;

      padding: 10px;

      margin: 0 10px 10px 20px;

      .inputText {
        :deep(.el-textarea__inner) {
          border-radius: 10px;
          resize: none;
          border: none;
          font-size: 16px;
          font-weight: 400;
          box-shadow: none;
        }
      }

      .submitBtn {
        height: 34px;
        margin: 0 0 0 5px;
        border-radius: 10px;
      }
    }
  }

  .fileUploadArea {
    width: 100%;
    max-width: 250px;

    display: flex;
    flex-direction: column;
    gap: 10px;

    .fileUploadArea__ModeSwitch {
      display: flex;
      justify-content: center;

      border-radius: 6px;
      border: 1px dashed var(--el-border-color)
    }
  }

  @media only screen and (max-width: 600px) {
    .fileUploadArea {
      display: none;
    }
  }
}
</style>