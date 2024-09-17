<script lang="ts" setup>
import {Loading, Promotion} from "@element-plus/icons-vue";

// v-mode ref
const inputValue = defineModel<string>('inputValue', {required: true})
const submitLoading = defineModel<boolean>('submitLoading', {required: false, default: false})

// props
interface propsType {
  maxlength?: number;
  placeholder?: string;
  roleSize?: boolean | {minRows?: number, maxRows?: number};
  showStatusBox?: boolean;
  StatusBoxStatus?: 'warning' | 'danger' | 'success' | 'info' | '' | 'primary';
}

const props = withDefaults(defineProps<propsType>(), {
  maxlength: 4000,
  placeholder: 'Please type here',
  roleSize: () => {return {minRows: 1, maxRows: 15}},
  showStatusBox: false,
  StatusBoxStatus: 'info'
})

// actions
const emit = defineEmits<{
  submit: []
}>()

// func
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
      emit('submit')
    }
  }
}
</script>

<template>
  <div class="content" style="position: relative">
    <div class="fill"/>
    <div class="chatPromptArea">
      <div v-if="props.showStatusBox" class="status_box">
        <slot />
      </div>
      <div class="inputBox">
        <el-input v-model="inputValue" :autosize="props.roleSize" :maxlength="props.maxlength" :placeholder="props.placeholder"
                  autofocus class="inputText" type="textarea"
                  @keyup.enter.native="handleEnterKey" />
        <el-button v-if="!submitLoading" :disabled="!(inputValue.length > 0)" class="submitBtn" @click="emit('submit')">
          <el-icon size="17"><Promotion/></el-icon>
        </el-button>
        <el-button v-else :disabled="true" class="submitBtn">
          <el-icon class="is-loading" size="17"><Loading/></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
html.dark {
  --el-blur-glass: mix(var(--el-bg-color), #4C4C4C, 0.7);
}
html {
  --el-blur-glass: mix(var(--el-bg-color), #FFFFFF, 0.7);
}
</style>

<style lang="scss" scoped>
.fill {
  //border: 1px white solid;
  padding: 10px;
  margin: 0 10px 10px 20px;
}

.chatPromptArea {
  // absolute
  position: absolute;
  bottom: -10px;
  width: 100%;

  margin: 0 10px 10px 0;
  gap: 10px;

  display: flex;
  flex-direction: column;

  .status_box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0;

    // 毛玻璃
    //background: transparentize(var(--el-color-warning), 0.7) !important;
    background: var(--el-blur-glass) !important;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(15px);

    box-shadow: var(--el-box-shadow-lighter);
    border-radius: 10px;
    padding: 10px;
  }

  .inputBox {
    // 毛玻璃
    //background: transparentize(var(--el-bg-color), 0.7) !important;
    background: var(--el-blur-glass) !important;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(15px);

    display: flex;
    flex-direction: row;
    align-items: end;

    box-shadow: var(--el-box-shadow-lighter);
    border-radius: 10px;

    padding: 10px;
  }

  .inputText {
    :deep(.el-textarea__inner) {
      background: none;
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
</style>