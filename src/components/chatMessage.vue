<script setup lang="ts">
import md from '@/markdown/markdown'
import {CopyDocument, Help, Loading} from "@element-plus/icons-vue";
import {useClipboard, useThrottleFn} from "@vueuse/core";

import "@/styles/github-markdown.css"
import {ElMessage} from "element-plus";

export interface ChatMessagePropsType {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

const props = defineProps<ChatMessagePropsType>()

const { copy, copied, isSupported } = useClipboard()
const throttledCopy = useThrottleFn(copyContent, 500);
function copyContent() {
  if (isSupported) {
    if (props.content.length === 0) {
      ElMessage({
        message: 'Fail to copy, content is Empty',
        type: 'warning'
      })
    } else {
      copy(props.content)
      if(copied){
        console.debug(`Copied to clipboard: ${props.content}`)
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
  <div class="flexBox">
    <div v-if="props.role === 'user'" class="userMessage">
      {{ props.content }}
    </div>

    <div v-else-if="props.role === 'assistant'" class="assistantMessage">
      <el-icon class="icon"><Help /></el-icon>
      <div class="messageMainBox">
        <article ref="codeBlocksContainer" class="markdown-body">
          <div v-if="props.content" class="markdown" v-html="md.render(props.content)" />
          <el-icon v-else class="is-loading" style="margin: 0 10px 0 0; font-size: 17px;"><Loading /></el-icon>
        </article>

        <div class="assistantToolBar">
          <el-button link @click="throttledCopy">
            <el-icon><CopyDocument /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

  </div>
</template>

<style lang="scss" scoped>
.flexBox {
  display: flex;
  flex-direction: column;

  padding: 18px 20px;

  .userMessage {
    max-width: 70%;
    margin: 0 0 0 auto;

    padding: 10px 20px;

    // border
    border: 1px solid var(--el-border-color-light);
    border-radius: 1.5rem;

    // text
    word-wrap: break-word;
    white-space: pre-wrap;
    //line-height: 1.5rem;
  }

  .assistantMessage {
    display: flex;
    flex-direction: row;
    gap: 1.5rem;

    flex-grow: 1;

    .icon {
      // center display
      display: flex;
      align-items: center;
      overflow: hidden;

      // border
      border: 1px solid var(--el-border-color-light);
      border-radius: 9999px;
      min-width: 32px;
      min-height: 32px;
    }

    .messageMainBox {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .markdown-body {
        width: 100%;
      }

      .assistantToolBar {
        svg {
          display: none;
        }
      }
    }

    .messageMainBox:active, .messageMainBox:hover {
      .assistantToolBar {
        svg {
          display: block;
        }
      }
    }
  }
}

.flexBox:last-child .assistantMessage .messageMainBox .assistantToolBar svg {
  display: block;
}
</style>