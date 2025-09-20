<template>
  <CardFormulario :tituloFormulario="'Cadastrar Poço'" @salvar="salvar" @cancelar="cancelar">
    <FormSection titulo="Dados da Ficha" :campos="camposFicha" :modelValue="formFicha" />
  </CardFormulario>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FormSection from '../../components/FormSection.vue';
import CardFormulario from '../../components/CardFormulario.vue';

const formFicha = ref({
  NomePaciente: '',
  NumeroCarteiraPlano: '',
  IdPlanoDeSaude: '',
  IdEspecialidade: ''
});

// Interface Campo garante que cada campo do formulário siga o formato esperado pelo componente FormSection.
// Ela define os tipos permitidos, obrigatoriedade e opções, evitando erros de digitação e facilitando o autocomplete.
interface Campo {
  label: string; // Texto exibido como label do campo
  nome: string; // Nome da propriedade no objeto de dados
  tipo: 'texto' | 'combo' | 'numero' | 'data' | 'binario' | 'arquivo'; // Tipo do campo suportado pelo FormSection
  placeholder?: string; // Texto de placeholder para campos de texto
  opcoes?: string[]; // Opções para campos do tipo combo
}

const camposFicha: Campo[] = [
  { label: 'Nome do Paciente', nome: 'NomePaciente', tipo: 'texto', placeholder: 'Digite o nome' },
  { label: 'Número da Carteira', nome: 'NumeroCarteiraPlano', tipo: 'texto', placeholder: 'Digite o número da carteira' },
  { label: 'Plano de Saúde', nome: 'IdPlanoDeSaude', tipo: 'combo', opcoes: ['Plano A', 'Plano B'] },
  { label: 'Especialidade', nome: 'IdEspecialidade', tipo: 'combo', opcoes: ['Cardiologia', 'Ortopedia'] }
];

function salvar() {
  // Aqui você faria o POST para o backend
}
function cancelar() {
  // Aqui você pode navegar para outra página ou limpar o formulário
}
</script>
