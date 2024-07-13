<script lang="ts" setup>
import chatInputArea from "@/components/chatInputArea.vue";
import FileUploader from "@/components/fileUploader.vue";

// File Upload Actions
const modeSwitchRef = ref<boolean>(false)

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

      <chatInputArea v-model:inputValue="inputValue" v-model:submitLoading="submitLoading" @submit="submitMessage"/>
    </div>

    <div class="fileUploadArea">
      <div class="fileUploadArea__ModeSwitch">
        <el-switch v-model="modeSwitchRef" active-text="方案对比" inactive-text="对话咨询" size="large"/>
      </div>

      <h4>国家标准</h4>

      <file-uploader />

      <h4>设计参数</h4>


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