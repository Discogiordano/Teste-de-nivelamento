<template>
  <div v-if="mensagem" class="mensagem">{{ mensagem }}</div>
</template>

<script setup lang="ts">
defineProps<{ mensagem: string }>();
</script>

<style scoped>
.mensagem {
  color: #d32f2f;
  background: #fff3f3;
  border: 1px solid #d32f2f;
  padding: 8px 12px;
  margin-top: 12px;
  border-radius: 4px;
  font-weight: bold;
}
</style>
