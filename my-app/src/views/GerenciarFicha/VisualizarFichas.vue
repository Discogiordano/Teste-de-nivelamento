<template>
  <div>
    <h2>Visualizar Fichas</h2>
    <v-row>
      <v-col cols="12" md="4">
        <v-text-field v-model="filtro.nome" label="Nome do paciente" clearable></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-select v-model="filtro.plano" :items="planos" label="Plano de saúde" clearable></v-select>
      </v-col>
      <v-col cols="12" md="4">
        <v-select v-model="filtro.especialidade" :items="especialidades" label="Especialidade" clearable></v-select>
      </v-col>
    </v-row>
    <v-table>
      <thead>
        <tr>
          <th scope="col">Nome</th>
          <th scope="col">Nº Carteira</th>
          <th scope="col">Especialidade</th>
          <th scope="col">Plano</th>
          <th scope="col">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ficha in fichasFiltradas" :key="ficha.id">
          <td>{{ ficha.nome }}</td>
          <td>{{ ficha.numeroCarteira }}</td>
          <td>{{ ficha.especialidade }}</td>
          <td>{{ ficha.plano }}</td>
          <td>
            <v-btn color="primary" @click="editar(ficha)">Editar</v-btn>
            <v-btn color="error" @click="deletar(ficha)">Deletar</v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
    <Mensagem :mensagem="mensagem" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Mensagem from '../../components/Mensagem.vue';

const filtro = ref({ nome: '', plano: '', especialidade: '' });
const planos = ['Plano A', 'Plano B'];
const especialidades = ['Cardiologia', 'Ortopedia'];

const fichas = ref([
  { id: 1, nome: 'João', numeroCarteira: '123', especialidade: 'Cardiologia', plano: 'Plano A' },
  { id: 2, nome: 'Maria', numeroCarteira: '456', especialidade: 'Ortopedia', plano: 'Plano B' }
]);

const mensagem = ref('');

const fichasFiltradas = computed(() => {
  return fichas.value.filter(f => {
    const nomeOk = !filtro.value.nome || f.nome.toLowerCase().includes(filtro.value.nome.toLowerCase());
    const planoOk = !filtro.value.plano || f.plano === filtro.value.plano;
    const espOk = !filtro.value.especialidade || f.especialidade === filtro.value.especialidade;
    return nomeOk && planoOk && espOk;
  });
});

function editar(ficha: any) {
  mensagem.value = 'Função de edição não implementada.';
}

function deletar(ficha: any) {
  fichas.value = fichas.value.filter(f => f.id !== ficha.id);
  mensagem.value = 'Ficha deletada com sucesso!';
}
</script>
