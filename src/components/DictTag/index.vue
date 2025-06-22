<template>
  <div>
    <template v-for="(item, index) in options" :key="item.value">
      <template v-if="values.includes(String(item.value))">
        <el-tag
            v-if="getTagType(item.value)"
            :type="getTagType(item.value)"
            :disable-transitions="true"
            style="margin-right: 4px"
        >
          {{ item.label }}
        </el-tag>
        <span v-else style="margin-right: 4px">{{ item.label }}</span>
      </template>
    </template>
    <template v-if="unmatch && showValue">
      <span v-for="(val, idx) in unmatchArray" :key="idx" style="margin-right: 4px">{{ val }}</span>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  options: {
    type: Array,
    default: () => [],
  },
  value: [Number, String, Array],
  showValue: {
    type: Boolean,
    default: true,
  },
  separator: {
    type: String,
    default: ',',
  }
})

const unmatchArray = ref([])

const values = computed(() => {
  if (props.value === null || props.value === undefined || props.value === '') return []
  return Array.isArray(props.value) ? props.value.map(String) : String(props.value).split(props.separator)
})

const unmatch = computed(() => {
  unmatchArray.value = []
  if (!values.value.length || !Array.isArray(props.options)) return false
  let foundUnmatch = false
  values.value.forEach(val => {
    if (!props.options.some(opt => String(opt.value) === val)) {
      unmatchArray.value.push(val)
      foundUnmatch = true
    }
  })
  return foundUnmatch
})

// 默认颜色映射（你可以根据字段扩展更多 value => tagType 映射）
function getTagType(value) {
  const typeMap = {
    1: 'success',   // 绿色：上线
    2: 'danger',    // 红色：下线
    3: 'info',      // 蓝色：模拟
    0: 'warning'    // 黄色：例如“禁用”等
  }
  return typeMap[value] || ''
}
</script>