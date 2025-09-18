<template>
  <div>
    <h2>Cadastrar Ficha do Paciente</h2>
    <FormSection
      :titulo="'Dados da Ficha'"
      :campos="campos"
      v-model="form"
    />
    <v-btn color="primary" @click="salvar">Salvar</v-btn>
    <Mensagem :mensagem="mensagem" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FormSection from '../../components/FormSection.vue';
import Mensagem from '../../components/Mensagem.vue';

const form = ref({
  nome: '',
  numeroCarteira: '',
  especialidade: '',
  plano: ''
});

const campos = [
  { label: 'Nome do paciente', nome: 'nome', tipo: 'texto', placeholder: 'Digite o nome' },
  { label: 'Número da carteira', nome: 'numeroCarteira', tipo: 'texto', placeholder: 'Digite o número da carteira' },
  { label: 'Especialidade desejada', nome: 'especialidade', tipo: 'combo', opcoes: ['Cardiologia', 'Ortopedia'] },
  { label: 'Plano de saúde', nome: 'plano', tipo: 'combo', opcoes: ['Plano A', 'Plano B'] }
];

const mensagem = ref('');

function salvar() {
  // Simulação de validação de duplicidade
  // Substitua por chamada à API/backend
  if (form.value.nome === 'João' && form.value.plano === 'Plano A' && form.value.especialidade === 'Cardiologia') {
    mensagem.value = 'Esta especialidade Cardiologia já foi utilizada para o plano Plano A';
  } else {
    mensagem.value = 'Ficha cadastrada com sucesso!';
    // Aqui você faria o POST para o backend
  }
}
</script>
