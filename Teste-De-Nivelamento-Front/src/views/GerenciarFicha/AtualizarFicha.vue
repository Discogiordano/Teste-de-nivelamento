<template>
  <CardFormulario :tituloFormulario="'Atualizar Ficha'" @salvar="salvar" @cancelar="cancelar">
    <FormSection titulo="Dados da Ficha" :campos="camposFicha" v-model="formFicha" />
  </CardFormulario>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import CardFormulario from '@/components/CardFormulario.vue';
import FormSection from '@/components/FormSection.vue';

const router = useRouter();
const route = useRoute();
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

async function carregarFicha() {
  const fichaId = route.params.id;
  if (!fichaId) {
    alert('ID da ficha não encontrado');
    router.push('/visualizar-fichas');
    return;
  }

  try {
    const response = await fetch(buildUrl(`/fichas-paciente/buscar-ficha/${fichaId}`));
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok) {
      const body = contentType.includes('application/json') ? await response.json() : await response.text();
      throw new Error(`HTTP ${response.status} - ${typeof body === 'string' ? body : JSON.stringify(body)}`);
    }
    if (!contentType.includes('application/json')) {
      const bodyText = await response.text();
      throw new Error(`Resposta não é JSON. content-type=${contentType}. Corpo: ${bodyText.substring(0, 200)}...`);
    }
    
    const ficha = await response.json();
    formFicha.value = {
      NomePaciente: ficha.nomePaciente || '',
      NumeroCarteiraPlano: ficha.numeroCarteira || '',
      IdPlanoDeSaude: ficha.planoDeSaudeId || '',
      IdEspecialidade: ficha.especialidadeId || ''
    };
  } catch (error) {
    console.error('Erro ao carregar ficha:', error);
    alert('Erro ao carregar dados da ficha');
  }
}

onMounted(async () => {
  await carregarPlanosDeSaude();
  await carregarEspecialidades();
  await carregarFicha();
});

async function salvar() {
  const fichaId = route.params.id;
  
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
    const response = await fetch(buildUrl(`/fichas-paciente/atualizar-ficha/${fichaId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      alert('Erro ao atualizar: ' + errorText);
      return;
    }
    
    alert('Ficha atualizada com sucesso!');
    router.push('/visualizar-fichas');
  } catch (error) {
    console.error('Erro ao atualizar ficha:', error);
    if (error && typeof (error as any).message === 'string') {
      alert('Erro ao atualizar ficha: ' + (error as any).message);
    } else {
      alert('Erro ao atualizar ficha.');
    }
  }
}

function cancelar() {
  router.push('/visualizar-fichas');
}
</script>