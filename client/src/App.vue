<script setup lang="ts">
import { ref, watch, provide } from 'vue'
import {
  fetchModels, fetchModelTree, fetchModelTypes, fetchNodeKinds,
  createModel, updateModel, deleteModel,
  createNode, updateNode, deleteNode,
} from './api'
import type { ModelSummary, ModelTree, ModelType, NodeKind } from './api'
import ModelSelector from './components/ModelSelector.vue'
import CapabilityMap from './components/CapabilityMap.vue'
import ModelForm from './components/ModelForm.vue'
import NodeForm from './components/NodeForm.vue'

// ─── Core state ───────────────────────────────────────────────────────────────

const models = ref<ModelSummary[]>([])
const selectedModelId = ref<string | null>(null)
const tree = ref<ModelTree | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// ─── Reference data ───────────────────────────────────────────────────────────

const modelTypes = ref<ModelType[]>([])
const nodeKinds = ref<NodeKind[]>([])

// ─── Error toast ──────────────────────────────────────────────────────────────

const errorToast = ref<string | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showError(message: string) {
  errorToast.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { errorToast.value = null }, 4000)
}

// ─── Modal state ──────────────────────────────────────────────────────────────

interface ModelFormState {
  mode: 'create' | 'edit'
  model?: ModelSummary
}

interface NodeFormState {
  mode: 'create'
  level: number
  parentId: string | null
  modelId: string
}

interface NodeEditFormState {
  mode: 'edit'
  nodeId: string
  level: number
  initial: { name: string; description?: string | null; owner?: string | null }
}

const modelFormState = ref<ModelFormState | null>(null)
const nodeFormState = ref<NodeFormState | NodeEditFormState | null>(null)

// ─── Startup fetches ──────────────────────────────────────────────────────────

async function loadModels() {
  const data = await fetchModels()
  models.value = data
  if (data.length === 1) selectedModelId.value = data[0].id
}

loadModels().catch((err: Error) => {
  error.value = `Could not load models: ${err.message}`
})

Promise.all([fetchModelTypes(), fetchNodeKinds()])
  .then(([types, kinds]) => {
    modelTypes.value = types
    nodeKinds.value = kinds
  })
  .catch(() => { /* non-critical; forms show empty selectors */ })

// ─── Tree loading ─────────────────────────────────────────────────────────────

async function refreshTree() {
  if (!selectedModelId.value) return
  const updated = await fetchModelTree(selectedModelId.value)
  tree.value = updated
}

watch(selectedModelId, async (id) => {
  if (!id) { tree.value = null; return }
  loading.value = true
  error.value = null
  try {
    tree.value = await fetchModelTree(id)
  } catch (err: unknown) {
    error.value = `Could not load model: ${(err as Error).message}`
    tree.value = null
  } finally {
    loading.value = false
  }
})

// ─── Model CRUD ───────────────────────────────────────────────────────────────

async function handleModelSubmit(payload: { name: string; description: string; modelTypeId: string }) {
  const state = modelFormState.value
  if (!state) return
  try {
    if (state.mode === 'create') {
      const created = await createModel(payload.name, payload.description || undefined, payload.modelTypeId)
      await loadModels()
      selectedModelId.value = created.id
    } else if (state.model) {
      await updateModel(state.model.id, { name: payload.name, description: payload.description || undefined })
      await loadModels()
    }
    modelFormState.value = null
  } catch (err: unknown) {
    showError((err as Error).message)
  }
}

async function handleDeleteModel(model: ModelSummary) {
  if (!confirm(`Delete model "${model.name}"? This cannot be undone.`)) return
  try {
    await deleteModel(model.id)
    if (selectedModelId.value === model.id) {
      selectedModelId.value = null
      tree.value = null
    }
    await loadModels()
  } catch (err: unknown) {
    showError((err as Error).message)
  }
}

// ─── Node CRUD (via provide/inject) ──────────────────────────────────────────

async function handleNodeSubmit(payload: { name: string; description: string; owner: string; kindId?: string; properties?: Record<string, unknown> }) {
  const state = nodeFormState.value
  if (!state) return
  try {
    if (state.mode === 'create') {
      await createNode(state.modelId, {
        name: payload.name,
        description: payload.description || undefined,
        owner: payload.owner || undefined,
        level: state.level,
        parentId: state.parentId ?? undefined,
        kindId: payload.kindId,
        properties: payload.properties,
      })
    } else {
      await updateNode(state.nodeId, {
        name: payload.name,
        description: payload.description || undefined,
        owner: payload.owner || undefined,
      })
    }
    nodeFormState.value = null
    await refreshTree()
  } catch (err: unknown) {
    showError((err as Error).message)
  }
}

provide('nodeActions', {
  editNode(nodeId: string, level: number, initial: { name: string; description?: string | null; owner?: string | null }) {
    nodeFormState.value = { mode: 'edit', nodeId, level, initial }
  },
  async deleteNode(nodeId: string) {
    if (!confirm('Delete this node? This cannot be undone.')) return
    try {
      await deleteNode(nodeId)
      await refreshTree()
    } catch (err: unknown) {
      showError((err as Error).message)
    }
  },
  addNode(parentId: string | null, level: number) {
    if (!selectedModelId.value) return
    nodeFormState.value = { mode: 'create', level, parentId, modelId: selectedModelId.value }
  },
})
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>Enterprise Capability Model</h1>
      <ModelSelector v-model="selectedModelId" :models="models" />
      <div class="model-actions">
        <button
          v-if="selectedModelId"
          class="btn-icon-header"
          title="Edit model"
          @click="modelFormState = { mode: 'edit', model: models.find(m => m.id === selectedModelId) }"
        >✎</button>
        <button
          v-if="selectedModelId"
          class="btn-icon-header btn-icon-danger"
          title="Delete model"
          @click="handleDeleteModel(models.find(m => m.id === selectedModelId)!)"
        >✕</button>
      </div>
      <button class="btn btn-sm btn-outline" @click="modelFormState = { mode: 'create' }">+ New Model</button>
    </header>

    <main class="app-main">
      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-else-if="loading" class="loading-spinner">Loading...</div>
      <div v-else-if="!selectedModelId" class="empty-hint">Select a model to view its capability map.</div>
      <CapabilityMap v-else-if="tree" :tree="tree" :node-kinds="nodeKinds" />
      <div v-else-if="models.length === 0" class="empty-hint">No models available. Create a model to get started.</div>
    </main>

    <!-- Error toast -->
    <div v-if="errorToast" class="error-toast">
      <span>{{ errorToast }}</span>
      <button class="toast-close" @click="errorToast = null">✕</button>
    </div>

    <!-- Model form modal -->
    <ModelForm
      v-if="modelFormState"
      :mode="modelFormState.mode"
      :initial="modelFormState.model"
      :model-types="modelTypes"
      @submit="handleModelSubmit"
      @cancel="modelFormState = null"
    />

    <!-- Node form modal -->
    <NodeForm
      v-if="nodeFormState"
      :mode="nodeFormState.mode"
      :level="nodeFormState.level"
      :initial="nodeFormState.mode === 'edit' ? nodeFormState.initial : undefined"
      :node-kinds="nodeKinds"
      @submit="handleNodeSubmit"
      @cancel="nodeFormState = null"
    />
  </div>
</template>
