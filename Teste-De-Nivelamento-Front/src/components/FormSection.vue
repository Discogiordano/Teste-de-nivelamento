<template>
  <div class="form-section">
    <div class="form-section-title">
      {{ titulo }}
    </div>
    <div class="form-section-body">
      <v-row dense>
        <v-col
          v-for="(campo, index) in campos"
          :key="index"
          v-show="verificarCondicao(campo)"
          cols="12"
          md="4"
        >
          <template v-if="campo.tipo === 'texto'">
            <label class="campo-label" :for="campo.nome">{{ campo.label }}</label>
            <v-text-field
              v-model="valores[campo.nome]"
              :placeholder="campo.placeholder"
              :id="campo.nome"
              variant="outlined"
              density="comfortable"
              clearable
            ></v-text-field>
          </template>
          <template v-else-if="campo.tipo === 'numero'">
            <label class="campo-label" :for="campo.nome">{{ campo.label }}</label>
            <v-text-field
              v-model="valores[campo.nome]"
              type="number"
              :placeholder="campo.placeholder"
              :id="campo.nome"
              variant="outlined"
              density="comfortable"
              clearable
            ></v-text-field>
          </template>
          <template v-else-if="campo.tipo === 'data'">
            <label class="campo-label" :for="campo.nome">{{ campo.label }}</label>
            <v-text-field
              v-model="valores[campo.nome]"
              type="date"
              :placeholder="campo.placeholder"
              :id="campo.nome"
              variant="outlined"
              density="comfortable"
              clearable
            ></v-text-field>
          </template>
          <template v-else-if="campo.tipo === 'binario'">
            <label class="campo-label" :for="campo.nome">{{ campo.label }}</label>
            <v-radio-group
              v-model="valores[campo.nome]"
              inline
              :id="campo.nome"
            >
              <v-radio label="Sim" value="sim"></v-radio>
              <v-radio label="Não" value="nao"></v-radio>
            </v-radio-group>
          </template>
          <template v-else-if="campo.tipo === 'arquivo'">
            <label class="campo-label" :for="campo.nome">{{ campo.label }}</label>
            <v-file-input
              v-model="files"
              accept="image/*,application/pdf"
              variant="outlined"
              density="comfortable"
              clearable
              multiple
              label="Selecione arquivos"
              style="width: 600px;"
              :id="campo.nome"
            >
              <template v-slot:selection="{ fileNames }">
                <v-list density="compact">
                  <v-list-item
                    v-for="(file, index) in files"
                    :key="index"
                  >
                    <template #prepend>
                      <v-icon :icon="getFileIcon(file)" color="primary"></v-icon>
                    </template>
                    <v-list-item-title>{{ file.name }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </template>
            </v-file-input>
          </template>
          <template v-else-if="campo.tipo === 'combo'">
            <label class="campo-label" :for="campo.nome">{{ campo.label }}</label>
            <v-select
              v-model="valores[campo.nome]"
              :items="campo.opcoes"
              :placeholder="campo.placeholder"
              :id="campo.nome"
              variant="outlined"
              density="comfortable"
              clearable
            ></v-select>
          </template>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from 'vue';

const files = ref<File[]>([]);

interface Condicao {
  dependeDe: string;
  valor: string | number | boolean;
}

interface Campo {
  label: string;
  nome: string;
  tipo: 'texto' | 'numero' | 'combo' | 'data' | 'binario' | 'arquivo';
  placeholder?: string;
  opcoes?: string[];
  condicao?: Condicao;
}

interface Props {
  titulo: string;
  campos: Campo[];
  modelValue: Record<string, any>;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

const valores = reactive<Record<string, any>>({ ...props.modelValue });

watch(valores, (novoValor) => {
  emit('update:modelValue', novoValor);
}, { deep: true });

function verificarCondicao(campo: Campo): boolean {
  if (!campo.condicao) return true;
  const { dependeDe, valor } = campo.condicao;
  return valores[dependeDe] === valor;
}

function getFileIcon(file: File) {
  if (file.type.startsWith("image/")) {
    return "mdi-image";
  } else if (file.type === "application/pdf") {
    return "mdi-file-pdf-box";
  }
  return "mdi-file";
}
</script>

<style scoped>
.form-section {
  border: 1px solid #ccc;
  margin-bottom: 8px;
}
.form-section-title {
  background-color: #E2F3F8;
  color: #003366;
  font-weight: bold;
  font-size: 0.9rem;
  padding: 8px 12px;
}
.form-section-body {
  background-color: #FFFFFF;
  padding: 10px;
}
.campo-label {
  display: block;
  color: #000000;
  font-size: 1rem;
  margin-bottom: 4px;
}
:deep(.v-field input::placeholder) {
  font-size: 14px;
}
</style>
