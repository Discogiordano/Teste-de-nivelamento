<!-- src/pages/VisualizarFichas.vue -->
<template>
  <v-container>
    <div class="d-flex justify-end mb-2">
      <v-btn color="primary" @click="cadastrar">Cadastrar</v-btn>
    </div>

    <FiltrosTabela
      :key="filtrosKey"
      :filtros="filtrosDef"
      :inicialExpandido="true"
      @filtrar="onFiltrar"
    />

    <TabelaDados
      :cabecalhos="cabecalhos"
      :dados="linhasTabela"
      @editar="editarDado"
      @deletar="deletarDado"
    />

    <v-row v-if="carregando" justify="center" class="mt-4">
      <v-col cols="auto" class="d-flex align-center ga-2">
        <v-progress-circular indeterminate size="22" color="primary" />
        <span>Carregando...</span>
      </v-col>
    </v-row>

    <div class="d-flex justify-end mt-6">
      <v-btn variant="tonal" color="secondary" @click="voltar">Voltar</v-btn>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import FiltrosTabela from '@/components/basic/FiltrosTabela.vue'
import TabelaDados from '@/components/basic/TabelaDados.vue'

const router = useRouter()
const API_BASE = import.meta.env.VITE_API_BASE_URL

function buildUrl(path: string) {
  if (!API_BASE) throw new Error('VITE_API_BASE_URL não configurada (.env.local).')
  const base = String(API_BASE).replace(/\/$/, '')
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${base}${suffix}`
}

async function getJSON(url: string) {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`${url} -> HTTP ${r.status}`)
  return r.json()
}

type FichaNorm = {
  id: number | string | null
  planoId: number | null
  especialidadeId: number | null
  nomePaciente: string
  numeroCarteiraPlano: string
  nomeEspecialidade: string
  nomePlanoDeSaude: string
}

function normalizaFicha(raw: any): FichaNorm {
  const planoId = Number(raw?.planoId ?? raw?.planoDeSaudeId ?? raw?.idplanodesaude ?? NaN)
  const especialidadeId = Number(raw?.especialidadeId ?? raw?.idespecialidade ?? NaN)
  return {
    id: raw?.id ?? raw?.idFicha ?? raw?.idficha ?? null,
    planoId: Number.isNaN(planoId) ? null : planoId,
    especialidadeId: Number.isNaN(especialidadeId) ? null : especialidadeId,
    nomePaciente: raw?.nomePaciente ?? raw?.nomepaciente ?? raw?.nome ?? '',
    numeroCarteiraPlano: raw?.numeroCarteiraPlano ?? raw?.numerocarteiraplano ?? '',
    nomeEspecialidade: raw?.nomeEspecialidade ?? raw?.especialidade ?? raw?.nomeespecialidade ?? '',
    nomePlanoDeSaude: raw?.nomePlanoDeSaude ?? raw?.planodesaude ?? raw?.plano ?? ''
  }
}

/* ----------------- estado ----------------- */
const cabecalhos = ['Ações', 'Nome', 'Nº Carteira', 'Especialidade', 'Plano']
const carregando = ref(false)
const dadosAPI = ref<FichaNorm[]>([])
const planosLista = ref<{ id: number, nome: string }[]>([])
const especialidadesLista = ref<{ id: number, nome: string }[]>([])

/** Selects usam APENAS string (nome) como item/value */
const filtrosKey = ref(0)
const filtrosDef = ref([
  { tipo: 'texto',  label: 'Nome do Cliente', chave: 'nomeCliente' },
  { tipo: 'texto',  label: 'Nº Carteira',     chave: 'numeroCarteira' },
  { tipo: 'select', label: 'Plano',           chave: 'planoNome',         opcoes: [] as string[] },
  { tipo: 'select', label: 'Especialidade',   chave: 'especialidadeNome', opcoes: [] as string[] }
])

const filtrosAtuais = ref<Record<string, any>>({})

function onFiltrar(payload: Record<string, any>) {
  filtrosAtuais.value = payload
  buscarFichas(payload)
}

/* ----------------- combos ----------------- */
async function carregarCombos() {
  try {
    const [planosJson, especJson] = await Promise.all([
      getJSON(buildUrl('/planosdesaude/listar-planosdesaude')),
      getJSON(buildUrl('/especialidades/listar-especialidades'))
    ])

    planosLista.value = (Array.isArray(planosJson) ? planosJson : [])
      .map((p: any) => ({ id: p?.id ?? p?.idplanodesaude, nome: p?.nome ?? p?.Nome ?? p?.descricao ?? '' }))
      .filter(p => p.id && p.nome)
      .sort((a, b) => a.nome.localeCompare(b.nome))

    especialidadesLista.value = (Array.isArray(especJson) ? especJson : [])
      .map((e: any) => ({ id: e?.id ?? e?.idespecialidade, nome: e?.nome ?? e?.Nome ?? e?.descricao ?? '' }))
      .filter(e => e.id && e.nome)
      .sort((a, b) => a.nome.localeCompare(b.nome))

    filtrosDef.value = [
      { tipo: 'texto',  label: 'Nome do Cliente', chave: 'nomeCliente' },
      { tipo: 'texto',  label: 'Nº Carteira',     chave: 'numeroCarteira' },
      { tipo: 'select', label: 'Plano',           chave: 'planoNome',         opcoes: planosLista.value.map(p => p.nome) },
      { tipo: 'select', label: 'Especialidade',   chave: 'especialidadeNome', opcoes: especialidadesLista.value.map(e => e.nome) }
    ]
    filtrosKey.value++
  } catch (e) {
    console.error('Erro ao carregar combos:', e)
  }
}

/* ----------------- busca usando seus endpoints específicos ----------------- */
async function buscarFichas(filtros: Record<string, any>) {
  carregando.value = true
  try {
    const nome     = (filtros?.nomeCliente ?? '').toString().trim()
    const carteira = (filtros?.numeroCarteira ?? '').toString().trim()
    const especNom = (filtros?.especialidadeNome ?? '').toString().trim()
    const planoNom = (filtros?.planoNome ?? '').toString().trim()

    // Decide o ENDPOINT PRIMÁRIO conforme prioridade
    let urlPrimaria = ''
    if (carteira) {
      urlPrimaria = buildUrl(`/fichas-paciente/listar-fichas-por-numero-plano?numeroCarteiraPlano=${encodeURIComponent(carteira)}`)
    } else if (nome) {
      urlPrimaria = buildUrl(`/fichas-paciente/listar-fichas-por-nome?nomePaciente=${encodeURIComponent(nome)}`)
    } else if (especNom) {
      urlPrimaria = buildUrl(`/fichas-paciente/listar-fichas-por-especialidade?especialidadeNome=${encodeURIComponent(especNom)}`)
    } else if (planoNom) {
      urlPrimaria = buildUrl(`/fichas-paciente/listar-fichas-por-plano?planoNome=${encodeURIComponent(planoNom)}`)
    } else {
      urlPrimaria = buildUrl('/fichas-paciente/listar-fichas-todas')
    }

    const json = await getJSON(urlPrimaria)
    let base: FichaNorm[] = (Array.isArray(json) ? json : []).map(normalizaFicha)

    // Aplica TODOS os filtros restantes em memória para combinar resultados
    const up = (s: string) => (s ?? '').toString().trim().toUpperCase()

    if (nome) {
      const termo = up(nome)
      base = base.filter(f => up(f.nomePaciente).includes(termo))
    }
    if (carteira) {
      const termo = up(carteira)
      base = base.filter(f => up(f.numeroCarteiraPlano).includes(termo))
    }
    if (especNom) {
      const alvo = up(especNom)
      base = base.filter(f => up(f.nomeEspecialidade) === alvo)
    }
    if (planoNom) {
      const alvo = up(planoNom)
      base = base.filter(f => up(f.nomePlanoDeSaude) === alvo)
    }

    dadosAPI.value = base
  } catch (e) {
    console.error('Erro ao buscar fichas:', e)
    dadosAPI.value = []
  } finally {
    carregando.value = false
  }
}

/* ----------------- tabela (view-model) ----------------- */
const linhasTabela = computed(() => {
  return (dadosAPI.value ?? []).map(f => ({
    id: f.id,
    Nome: f.nomePaciente,
    'Nº Carteira': f.numeroCarteiraPlano,
    Especialidade: f.nomeEspecialidade,
    Plano: f.nomePlanoDeSaude
  }))
})

/* ----------------- navegação ----------------- */
function cadastrar() { router.push('/cadastrar-ficha') }
function editarDado(item: any) { router.push(`/atualizar-ficha/${item.id}`) }
function deletarDado(item: any) { alert(`Deletar ficha: ${item.Nome}`) }
function voltar() { router.back() }

/* boot */
onMounted(async () => {
  await carregarCombos()
  await buscarFichas({}) // abre com todas
})
</script>
