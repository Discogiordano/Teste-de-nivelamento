<!-- src/components/basic/FiltrosTabela.vue -->
<template>
  <div class="filtros-tabela" :class="{ colapsado: !expandido }">
    <div class="filtros-header" @click="toggleExpandir" role="button">
      <span class="titulo-filtros">Filtros</span>

      <!-- Botão de abrir/fechar com cor diferente -->
      <v-btn
        class="toggle-btn"
        :color="expandido ? 'success' : 'info'"
        variant="flat"
        size="small"
        @click.stop="toggleExpandir"
      >
        <v-icon
          start
          :icon="expandido ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          class="chevron"
          :class="{ aberto: expandido }"
        />
        {{ expandido ? 'Ocultar' : 'Mostrar' }}
      </v-btn>
    </div>

    <transition name="fade">
      <div v-show="expandido" class="filtros-conteudo">
        <!-- Busca global -->
        <v-text-field
          v-model="valores.principal"
          prepend-inner-icon="mdi-magnify"
          label="Buscar..."
          density="comfortable"
          variant="outlined"
          clearable
          class="filtro-principal"
        />

        <!-- Filtros dinâmicos -->
        <div class="card-filtros" v-if="hasFiltros">
          <div v-for="filtro in filtros" :key="filtro.chave" class="filtro-item">
            <v-text-field
              v-if="filtro.tipo === 'texto'"
              v-model="valores[filtro.chave]"
              :label="filtro.label"
              variant="outlined"
              density="comfortable"
              clearable
            />
            <v-text-field
              v-else-if="filtro.tipo === 'numero'"
              v-model.number="valores[filtro.chave]"
              :label="filtro.label"
              type="number"
              variant="outlined"
              density="comfortable"
              clearable
            />
            <v-select
              v-else-if="filtro.tipo === 'select'"
              v-model="valores[filtro.chave]"
              :label="filtro.label"
              :items="filtro.opcoes ?? []"
              variant="outlined"
              density="comfortable"
              clearable
            />
          </div>

          <div class="acoes-filtros">
            <v-btn class="btn-limpar" variant="tonal" color="primary" @click="limpar">Limpar</v-btn>
            <v-btn class="btn-aplicar" variant="tonal" color="error" @click="aplicarFiltros">Aplicar</v-btn>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect, computed } from 'vue'

type Filtro =
  | { tipo: 'texto';  label: string; chave: string }
  | { tipo: 'numero'; label: string; chave: string }
  | { tipo: 'select'; label: string; chave: string; opcoes?: string[] }

const props = withDefaults(defineProps<{
  filtros?: Filtro[]
  inicialExpandido?: boolean   // permite controlar padrão de fora
}>(), {
  filtros: () => [],
  inicialExpandido: true
})

const emit = defineEmits<{ (e: 'filtrar', payload: Record<string, any>): void }>()

const expandido = ref(!!props.inicialExpandido)
const valores   = ref<Record<string, any>>({ principal: '' })
const hasFiltros = computed(() => Array.isArray(props.filtros) && props.filtros.length > 0)

// garante chaves no estado mesmo com mudanças
watchEffect(() => {
  if (!Array.isArray(props.filtros)) return
  for (const f of props.filtros) {
    if (!(f.chave in valores.value)) valores.value[f.chave] = null
  }
})

function toggleExpandir() {
  expandido.value = !expandido.value
}
function aplicarFiltros() {
  emit('filtrar', { ...valores.value })
}
function limpar() {
  Object.keys(valores.value).forEach(k => (valores.value[k] = k === 'principal' ? '' : null))
  aplicarFiltros()
}
</script>

<style scoped>
.filtros-tabela {
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  width: 100%;
  box-sizing: border-box;
  background-color: #f9f9f9;
  transition: background-color .2s ease, padding .2s ease;
  border: 1px solid rgba(0,0,0,.06);
}
.filtros-tabela.colapsado {
  background-color: #EFEFEF;
  padding: 8px 16px;
}
.filtros-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer; /* permite clicar no cabeçalho para abrir/fechar */
}
.titulo-filtros {
  font-size: 1.1rem;
  font-weight: 600;
  color: #183B52;
}
.toggle-btn {
  pointer-events: auto; /* garante clique no botão mesmo com header clicável */
}
.chevron {
  transition: transform .2s ease;
}
.chevron.aberto {
  transform: rotate(180deg);
}

.filtros-conteudo {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.filtro-principal { width: 100%; }

.card-filtros {
  background-color: rgba(0,0,0,.04);
  padding: 20px;
  border-radius: 10px;
  max-width: 900px;
  width: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.filtro-item { width: 100%; }

.acoes-filtros {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

/* animação */
.fade-enter-active, .fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.btn-limpar {
  background-color: #1976d2 !important; /* azul material */
  color: #fff !important;
}
.btn-aplicar {
  background-color: #d32f2f !important; /* vermelho material */
  color: #fff !important;
}
</style>
