<script setup lang="ts">
import {Loading, Promotion} from "@element-plus/icons-vue";

// v-mode ref
const inputValue = defineModel<string>('inputValue', {required: true})
const submitLoading = defineModel<boolean>('submitLoading', {required: false, default: false})

// props
interface propsType {
  maxlength?: number;
  placeholder?: string;
  roleSize?: boolean | {minRows?: number, maxRows?: number};
}

const props = withDefaults(defineProps<propsType>(), {
  maxlength: 4000,
  placeholder: 'Please type here',
  roleSize: () => {return {minRows: 1, maxRows: 8}}
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
  <div class="chatPromptArea">
    <el-input class="inputText" type="textarea" autofocus v-model="inputValue"
              :autosize="props.roleSize" :maxlength="props.maxlength" :placeholder="props.placeholder"
              @keyup.enter.native="handleEnterKey" />
    <el-button :disabled="!(inputValue.length > 0) || submitLoading" class="submitBtn" @click="emit('submit')">
      <el-icon v-show="!submitLoading" size="17"><Promotion/></el-icon>
      <el-icon v-show="submitLoading" class="is-loading" size="17"><Loading/></el-icon>
    </el-button>
  </div>
</template>

<style scoped lang="scss">
.chatPromptArea {
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
</style>