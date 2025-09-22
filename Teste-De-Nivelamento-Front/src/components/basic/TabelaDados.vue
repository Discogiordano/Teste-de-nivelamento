<template>
  <v-data-table
    :headers="headersFormatados"
    :items="dados"
    class="tabela-dinamica"
    density="comfortable"
    :items-per-page="-1"
    hide-default-footer
  >
    <template #headers="{ columns }">
      <tr>
        <th class="cabecalho-customizado text-center" scope="col">Ações</th>
        <th
          v-for="coluna in columns"
          :key="String(coluna.key)"
          class="cabecalho-customizado text-center"
          scope="col"
        >
          {{ coluna.title }}
        </th>
      </tr>
    </template>
    <template #item="{ item, index }">
      <tr :class="index % 2 === 0 ? 'linha-clara' : 'linha-escura'">
        <td class="text-center acoes">
          <v-btn
            size="small"
            color="blue"
            variant="elevated"
            class="botao-acao"
            @click="$emit('editar', item)"
          >
            Editar
          </v-btn>
          <v-btn
            size="small"
            color="red"
            variant="elevated"
            class="botao-acao"
            @click="$emit('deletar', item)"
          >
            Deletar
          </v-btn>
        </td>

        <td
          v-for="coluna in cabecalhos"
          :key="coluna"
          class="text-center"
        >
          {{ item[coluna] }}
        </td>
      </tr>
    </template>
  </v-data-table>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  cabecalhos: string[]
  dados: Record<string, any>[]
}

const props = defineProps<Props>()

const headersFormatados = computed(() =>
  props.cabecalhos.map((titulo) => ({
    title: titulo,
    key: titulo,
    align: "center" as const,
  }))
)
</script>

<style scoped>
.cabecalho-customizado {
  background-color: #dee2e6;
  color: #183b52;
  text-align: center;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 12px;
}

.text-center {
  text-align: center;
}

.linha-clara {
  background-color: #ffffff;
}

.linha-escura {
  background-color: #f2f2f2;
}

.acoes {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.botao-acao {
  margin: 0 4px;
  text-transform: none;
  font-size: 0.875rem;
}
</style>