<template>
  <div>
    <svg-icon icon-class="github" @click="goto" />
  </div>
</template>

<script setup>
const url = ref('https://github.com/ixiaoku/risk-engine-x')

function goto() {
  window.open(url.value)
}
</script>
