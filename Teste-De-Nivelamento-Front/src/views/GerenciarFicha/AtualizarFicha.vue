<!-- src/pages/AtualizarFicha.vue -->
<template>
  <CardFormulario :tituloFormulario="'Atualizar Ficha'" @salvar="salvar" @cancelar="cancelar">
    <FormSection titulo="Dados da Ficha" :campos="camposFicha" v-model="formFicha" />
  </CardFormulario>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import CardFormulario from '@/components/CardFormulario.vue'
import FormSection from '@/components/FormSection.vue'

const router = useRouter()
const route = useRoute()
const API_BASE = import.meta.env.VITE_API_BASE_URL

function buildUrl(path: string) {
  if (!API_BASE) throw new Error('VITE_API_BASE_URL não configurada. Crie .env.local com VITE_API_BASE_URL=http://localhost:8080')
  const base = String(API_BASE).replace(/\/$/, '')
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${base}${suffix}`
}

async function getJSON(url: string) {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`${url} -> HTTP ${r.status}`)
  return r.json()
}

/** ----------------- estado do formulário ----------------- **/
const formFicha = ref({
  NomePaciente: '',
  NumeroCarteiraPlano: '',
  IdPlanoDeSaude: null as number | null,
  IdEspecialidade: null as number | null
})

/** ----------------- combos ----------------- **/
const planosDeSaude = ref<Array<{ id: number; nome: string }>>([])
const especialidades = ref<Array<{ id: number; nome: string }>>([])

interface Campo {
  label: string
  nome: string
  tipo: 'texto' | 'combo' | 'numero' | 'data' | 'binario' | 'arquivo'
  placeholder?: string
  opcoes?: Array<string | { id: number | string; nome: string }>
}

const camposFicha = computed((): Campo[] => [
  { label: 'Nome do Paciente', nome: 'NomePaciente', tipo: 'texto', placeholder: 'Digite o nome' },
  { label: 'Número da Carteira', nome: 'NumeroCarteiraPlano', tipo: 'texto', placeholder: 'Digite o número da carteira' },
  { label: 'Plano de Saúde', nome: 'IdPlanoDeSaude', tipo: 'combo', opcoes: planosDeSaude.value },
  { label: 'Especialidade', nome: 'IdEspecialidade', tipo: 'combo', opcoes: especialidades.value }
])

async function carregarPlanosDeSaude() {
  try {
    const json = await getJSON(buildUrl('/planosdesaude/listar-planosdesaude'))
    planosDeSaude.value = (Array.isArray(json) ? json : [])
      .map((p: any) => ({ id: p?.id ?? p?.idplanodesaude, nome: p?.nome ?? p?.Nome ?? p?.descricao ?? '' }))
      .filter(p => p.id && p.nome)
      .sort((a, b) => a.nome.localeCompare(b.nome))
  } catch (e) {
    console.error('Erro ao carregar planos de saúde:', e)
  }
}

async function carregarEspecialidades() {
  try {
    const json = await getJSON(buildUrl('/especialidades/listar-especialidades'))
    especialidades.value = (Array.isArray(json) ? json : [])
      .map((e: any) => ({ id: e?.id ?? e?.idespecialidade, nome: e?.nome ?? e?.Nome ?? e?.descricao ?? '' }))
      .filter(e => e.id && e.nome)
      .sort((a, b) => a.nome.localeCompare(b.nome))
  } catch (e) {
    console.error('Erro ao carregar especialidades:', e)
  }
}

/** ----------------- carregar detalhe ----------------- **/
async function carregarFicha() {
  const fichaId = route.params.id
  if (!fichaId) {
    alert('ID da ficha não encontrado')
    router.push('/visualizar-fichas')
    return
  }

  try {
    const url = buildUrl(`/fichas-paciente/buscar-ficha/${encodeURIComponent(String(fichaId))}`)
    const r = await fetch(url)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const ficha = await r.json()

    // nomes tolerantes (caso DTO varie)
    const planoId = ficha.planoDeSaudeId ?? ficha.planoId ?? ficha.idPlanoDeSaude ?? null
    const especId = ficha.especialidadeId ?? ficha.idEspecialidade ?? null

    formFicha.value = {
      NomePaciente: ficha.nomePaciente ?? '',
      // se o back mandar numeroCarteiraPlano ou numeroCarteira, ambos são aceitos:
      NumeroCarteiraPlano: ficha.numeroCarteiraPlano ?? ficha.numeroCarteira ?? '',
      IdPlanoDeSaude: planoId != null ? Number(planoId) : null,
      IdEspecialidade: especId != null ? Number(especId) : null
    }
  } catch (e) {
    console.error('Erro ao carregar ficha:', e)
    alert('Erro ao carregar dados da ficha')
  }
}

/** ----------------- salvar ----------------- **/
async function salvar() {
  const fichaId = route.params.id
  if (!fichaId) {
    alert('ID inválido')
    return
  }

  if (!formFicha.value.IdPlanoDeSaude) {
    alert('Por favor, selecione um plano de saúde válido.')
    return
  }
  if (!formFicha.value.IdEspecialidade) {
    alert('Por favor, selecione uma especialidade válida.')
    return
  }

  // O back está validando "numeroCarteira" — enviamos ambos por compat.
  const payload: any = {
    nomePaciente: formFicha.value.NomePaciente,
    numeroCarteira: formFicha.value.NumeroCarteiraPlano,       // requerido pelo back
    numeroCarteiraPlano: formFicha.value.NumeroCarteiraPlano,  // compat
    // Alguns backs usam idPlanoDeSaude/idEspecialidade; se precisar, troque abaixo:
    planoDeSaudeId: Number(formFicha.value.IdPlanoDeSaude),
    especialidadeId: Number(formFicha.value.IdEspecialidade)
  }

  try {
    // rota principal que você usa
    let r = await fetch(buildUrl(`/fichas-paciente/atualizar-ficha/${encodeURIComponent(String(fichaId))}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    // fallback REST (se existir no seu back)
    if (r.status === 404 || r.status === 405) {
      r = await fetch(buildUrl(`/fichas-paciente/${encodeURIComponent(String(fichaId))}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    }

    if (!r.ok) {
      const txt = await r.text().catch(() => '')
      throw new Error(`Erro ao atualizar: HTTP ${r.status} ${txt}`)
    }

    alert('Ficha atualizada com sucesso!')
    router.push('/visualizar-fichas')
  } catch (e) {
    console.error('Erro ao atualizar ficha:', e)
    alert(e instanceof Error ? e.message : 'Erro ao atualizar ficha.')
  }
}

/** ----------------- navegação ----------------- **/
function cancelar() {
  router.push('/visualizar-fichas')
}

/** ----------------- boot ----------------- **/
onMounted(async () => {
  await carregarPlanosDeSaude()
  await carregarEspecialidades()
  await carregarFicha() // combos primeiro, detalhe depois => selects já selecionam
})
</script>
