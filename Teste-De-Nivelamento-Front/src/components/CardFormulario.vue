<template>
  <v-card>
    <v-card-title class="form-title">{{ tituloFormulario }}</v-card-title>
    <v-spacer></v-spacer>
    <v-card-text>
      <slot></slot>
    </v-card-text>
    <v-card-actions class="form-title">
      <v-spacer></v-spacer>
  <button class="form-btn" @click="$emit('salvar')">Salvar</button>
  <button class="form-btn" @click="$emit('cancelar')">Cancelar</button>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>

const props = defineProps<{
  tituloFormulario: string;
}>();

const emit = defineEmits<{
  (e: 'salvar'): void;
  (e: 'cancelar'): void;
}>();
</script>

<style scoped>
.form-title {
  background-color: #E2F3F8;
  color: #003366;
  font-weight: bold;
  font-size: 1.6rem;
  padding: 8px 12px;
}

.form-btn {
  background-color: #003366;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  margin-left: 8px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}
.form-btn:hover {
  background-color: #005599;
}
</style>
