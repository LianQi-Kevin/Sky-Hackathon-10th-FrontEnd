<script lang="ts" setup>
import { codeToHtml } from 'shiki/bundle/full'
import {useClipboard, useThrottleFn} from '@vueuse/core'
import { CopyDocument } from "@element-plus/icons-vue";
import {ElMessage} from "element-plus";

interface propsType {
  lang?: string;
  content: string;
  themes?: {
    dark: string;
    light: string;
  }
}

const props = withDefaults(defineProps<propsType>(), {
  lang: 'plaintext',
  themes: () => ({
    dark: import.meta.env.VITE_SHIKI_THEME_DARK,
    light: import.meta.env.VITE_SHIKI_THEME_LIGHT,
  })
});


const html = ref<string>('')
const copyCodeBtnText = ref<string>('Copy code')

onMounted(async () => {
  // console.debug({ 'lang': props.lang, 'content': props.content, })

  // noinspection JSUnresolvedReference,JSCheckFunctionSignatures
  codeToHtml(props.content, {
    lang: props.lang,
    themes: props.themes
  }).then((res) => {
    html.value = res
  })
});

const { copy, copied, isSupported } = useClipboard()
const throttledCopyCode = useThrottleFn(copyCode, 500);
function copyCode() {
  if (isSupported) {
    if (props.content.length === 0) {
      ElMessage({
        message: 'No code to copy',
        type: 'warning'
      })
    } else {
      copy(props.content)
      if(copied){
        console.debug(`Copied to clipboard: ${props.content}`)
        copyCodeBtnText.value = 'Copied'
        setTimeout(() => {
          copyCodeBtnText.value = 'Copy code'
        }, 1000)
      }
    }
  } else {
    ElMessage({
      message: 'Your browser does not support copying',
      type: 'error'
    })
  }
}

</script>

<template>
  <div class="codeCard">
    <div class="codeCard__header">
      <el-text size="small">
        {{ props.lang }}
      </el-text>
      <el-button link size="small" @click="throttledCopyCode">
        <el-icon style="margin-right: 3px">
          <CopyDocument style="transform: scale(1.1)"/>
        </el-icon>
        {{ copyCodeBtnText }}
      </el-button>
    </div>
    <div class="codeCard__code" v-html="html" />
  </div>
</template>

<style lang="scss">
// 用于切换shiKi黑白主题
html.dark .shiki,
html.dark .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}
</style>

<style lang="scss" scoped>
.codeCard {
  box-shadow: var(--el-box-shadow-lighter);
  word-wrap: break-word;

  display: flex;
  flex-direction: column;

  border-radius: .375rem;
  background-color: var(--el-border-color-light);

  margin: 0;

  .codeCard__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
  }


  .codeCard__code {
    display: grid;
    width: 100%;
    position: relative;

    :deep(pre) {
      overflow-y: hidden;
      border-radius: 0 0 .375rem .375rem;
      margin: 0;
    }
  }
}
</style>