
<template>
  <v-container>
    <div class="d-flex justify-end">
      <v-btn color="primary" @click="cadastrar">Cadastrar</v-btn>
    </div>
  </v-container>
  <v-container>
    <FiltrosTabela
      :filtros="filtros"
      @filtrar="filtrarDados"
    />
    <TabelaDados
      :cabecalhos="cabecalhos"
      :dados="dadosFiltrados"
      @editar="editarDado"
      @deletar="deletarDado"
    />
    
    <!-- Indicador de carregamento -->
    <v-row v-if="carregando" justify="center" class="mt-2">
      <v-col cols="auto">
        <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
        <span class="ml-2">Carregando...</span>
      </v-col>
    </v-row>
  </v-container>    
  <v-container class="pa-4">
    <div class="d-flex justify-end">
      <v-btn color="secondary" @click="voltar">Voltar</v-btn>
    </div>
  </v-container>
</template>


<script lang="ts" setup>
import FiltrosTabela from '../../components/basic/FiltrosTabela.vue';
// Update the import path if the file is located elsewhere, for example:
import TabelaDados from '@/components/basic/TabelaDados.vue';
// Or, if the file does not exist, create '../../components/basic/TabelaDados.vue' with a basic Vue component:
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';

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

// Cabeçalhos da tabela baseados no DTO
const cabecalhos = ['Nome', 'Nº Carteira', 'Especialidade', 'Plano'];

// Dados das fichas carregados da API
const fichas = ref<Array<{
  id?: number;
  nomePaciente: string;
  numeroCarteiraPlano: string;
  nomeEspecialidade: string;
  nomePlanoDeSaude: string;
}>>([]);

// Dados filtrados para exibição na tabela
const dadosFiltrados = ref<Array<any>>([]);

// Controle de carregamento
const carregando = ref(false);

// Variáveis para filtros
const planos = ref<Array<string>>([]);
const especialidades = ref<Array<string>>([]);

const filtros = ref([
  { tipo: "select" as const, label: 'Plano', chave: 'plano', opcoes: planos.value },
  { tipo: "select" as const, label: 'Especialidade', chave: 'especialidade', opcoes: especialidades.value }
]);

// Função para carregar todas as fichas da API
async function carregarFichas() {
  try {
    carregando.value = true;
    const response = await fetch(buildUrl('/fichas-paciente/listar-fichas-todas'));
    const contentType = response.headers.get('content-type') || '';
    
    if (!response.ok) {
      const body = contentType.includes('application/json') ? await response.json() : await response.text();
      throw new Error(`HTTP ${response.status} - ${typeof body === 'string' ? body : JSON.stringify(body)}`);
    }
    
    if (!contentType.includes('application/json')) {
      const bodyText = await response.text();
      throw new Error(`Resposta não é JSON. content-type=${contentType}. Corpo: ${bodyText.substring(0, 200)}...`);
    }
    
    const fichásAPI = await response.json();
    
    // Transformar os dados do DTO para o formato da tabela
    fichas.value = fichásAPI.map((ficha: any, index: number) => ({
      id: index + 1, // ID baseado no índice
      Nome: ficha.nomePaciente,
      'Nº Carteira': ficha.numeroCarteiraPlano,
      Especialidade: ficha.nomeEspecialidade,
      Plano: ficha.nomePlanoDeSaude
    }));
    
    dadosFiltrados.value = [...fichas.value];
    
    // Extrair planos e especialidades únicos para os filtros
    const planosUnicos = [...new Set(fichas.value.map((f: any) => f.Plano))];
    const especialidadesUnicas = [...new Set(fichas.value.map((f: any) => f.Especialidade))];
    
    planos.value = planosUnicos;
    especialidades.value = especialidadesUnicas;
    
    // Atualizar filtros
    filtros.value = [
      { tipo: "select" as const, label: 'Plano', chave: 'plano', opcoes: planosUnicos },
      { tipo: "select" as const, label: 'Especialidade', chave: 'especialidade', opcoes: especialidadesUnicas }
    ];
    
  } catch (error) {
    console.error('Erro ao carregar fichas:', error);
    alert('Erro ao carregar fichas. Verifique se a API está funcionando.');
  } finally {
    carregando.value = false;
  }
}

function filtrarDados(filtros: any) {
  dadosFiltrados.value = fichas.value.filter((item: any) => {
    const matchNome = filtros.nome ? item.Nome.toLowerCase().includes(filtros.nome.toLowerCase()) : true;
    const matchPlano = filtros.plano ? item.Plano === filtros.plano : true;
    const matchEspecialidade = filtros.especialidade ? item.Especialidade === filtros.especialidade : true;
    // Só retorna se todos os filtros forem verdadeiros
    return matchNome && matchPlano && matchEspecialidade;
  });
}

function editarDado(item: any) {
  // Navega para a página de atualização com o ID da ficha
  router.push(`/atualizar-ficha/${item.id}`);
}

async function deletarDado(item: any) {
  // Implementar ação de deletar
  if (confirm(`Tem certeza que deseja deletar a ficha de ${item.Nome}?`)) {
    try {
      const response = await fetch(buildUrl(`/fichas-paciente/${item.id}`), {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        alert('Erro ao deletar: ' + errorText);
        return;
      }
      
      alert('Ficha deletada com sucesso!');
      // Recarregar as fichas após deletar
      await carregarFichas();
      
    } catch (error) {
      console.error('Erro ao deletar ficha:', error);
      alert('Erro ao deletar ficha.');
    }
  }
}

function voltar() {
  router.back();
}

function cadastrar() {
  router.push('/cadastrar-ficha');
}

// Carregar dados ao montar o componente
onMounted(() => {
  carregarFichas();
});
</script>
