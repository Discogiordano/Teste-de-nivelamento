<template>
  <CardFormulario :tituloFormulario="'Cadastrar Poço'" @salvar="salvar" @cancelar="cancelar">
    <FormSection titulo="Dados da Ficha" :campos="camposFicha" v-model="formFicha" />
  </CardFormulario>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import CardFormulario from '@/components/CardFormulario.vue';
import FormSection from '@/components/FormSection.vue';

const router = useRouter();
const API_BASE = import.meta.env.VITE_API_BASE_URL;

function buildUrl(path: string) {
  if (!API_BASE) {
    throw new Error('VITE_API_BASE_URL não configurada. Crie um arquivo .env.local com VITE_API_BASE_URL=http://localhost:8080 (ou a URL da API).');
  }
  const base = String(API_BASE).replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

const formFicha = ref({
  NomePaciente: '',
  NumeroCarteiraPlano: '',
  IdPlanoDeSaude: '',
  IdEspecialidade: ''
});

const planosDeSaude = ref<Array<{id: number, nome: string}>>([]);
const especialidades = ref<Array<{id: number, nome: string}>>([]);

interface Campo {
  label: string;
  nome: string;
  tipo: 'texto' | 'combo' | 'numero' | 'data' | 'binario' | 'arquivo';
  placeholder?: string;
  opcoes?: Array<string | { id: number | string; nome: string }>;
}

const camposFicha = computed((): Campo[] => [
  { label: 'Nome do Paciente', nome: 'NomePaciente', tipo: 'texto', placeholder: 'Digite o nome' },
  { label: 'Número da Carteira', nome: 'NumeroCarteiraPlano', tipo: 'texto', placeholder: 'Digite o número da carteira' },
  { label: 'Plano de Saúde', nome: 'IdPlanoDeSaude', tipo: 'combo', opcoes: planosDeSaude.value },
  { label: 'Especialidade', nome: 'IdEspecialidade', tipo: 'combo', opcoes: especialidades.value }
]);

async function carregarPlanosDeSaude() {
  try {
  const response = await fetch(buildUrl('/planosdesaude/listar-planosdesaude'));
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok) {
      const body = contentType.includes('application/json') ? await response.json() : await response.text();
      throw new Error(`HTTP ${response.status} - ${typeof body === 'string' ? body : JSON.stringify(body)}`);
    }
    if (!contentType.includes('application/json')) {
      const bodyText = await response.text();
      throw new Error(`Resposta não é JSON. content-type=${contentType}. Corpo: ${bodyText.substring(0, 200)}...`);
    }
    planosDeSaude.value = await response.json();
  } catch (error) {
    console.error('Erro ao carregar planos de saúde:', error);
  }
}

async function carregarEspecialidades() {
  try {
  const response = await fetch(buildUrl('/especialidades/listar-especialidades'));
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok) {
      const body = contentType.includes('application/json') ? await response.json() : await response.text();
      throw new Error(`HTTP ${response.status} - ${typeof body === 'string' ? body : JSON.stringify(body)}`);
    }
    if (!contentType.includes('application/json')) {
      const bodyText = await response.text();
      throw new Error(`Resposta não é JSON. content-type=${contentType}. Corpo: ${bodyText.substring(0, 200)}...`);
    }
    especialidades.value = await response.json();
  } catch (error) {
    console.error('Erro ao carregar especialidades:', error);
  }
}

onMounted(async () => {
  await carregarPlanosDeSaude();
  await carregarEspecialidades();
});

async function salvar() {
  // Com item-title/item-value no v-select, Ids já estão nos models
  if (!formFicha.value.IdPlanoDeSaude) {
    alert('Por favor, selecione um plano de saúde válido.');
    return;
  }
  if (!formFicha.value.IdEspecialidade) {
    alert('Por favor, selecione uma especialidade válida.');
    return;
  }

  const payload = {
    nomePaciente: formFicha.value.NomePaciente,
    numeroCarteira: formFicha.value.NumeroCarteiraPlano,
    planoDeSaudeId: Number(formFicha.value.IdPlanoDeSaude),
    especialidadeId: Number(formFicha.value.IdEspecialidade)
  };
  try {
  const response = await fetch(buildUrl('/fichas-paciente/cadastrar-ficha'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) {
      alert(result);
    } else {
      alert('Ficha cadastrada com sucesso!');
      // Limpa o formulário ou navega para outra página
      formFicha.value = {
        NomePaciente: '',
        NumeroCarteiraPlano: '',
        IdPlanoDeSaude: '',
        IdEspecialidade: ''
      };
        // Redireciona para HomeView
        router.push('/');
    }
  } catch (error) {
    console.error('Erro ao cadastrar ficha:', error);
    alert('Erro ao cadastrar ficha.');
  }
}

function cancelar() {
  // Aqui você pode navegar para outra página ou limpar o formulário
  formFicha.value = {
    NomePaciente: '',
    NumeroCarteiraPlano: '',
    IdPlanoDeSaude: '',
    IdEspecialidade: ''
  };
}
</script>

