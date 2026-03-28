<script setup lang="ts">
import { ref, watch } from 'vue'
import { fetchModels, fetchModelTree } from './api'
import type { ModelSummary, ModelTree } from './api'
import ModelSelector from './components/ModelSelector.vue'
import CapabilityMap from './components/CapabilityMap.vue'

const models = ref<ModelSummary[]>([])
const selectedModelId = ref<string | null>(null)
const tree = ref<ModelTree | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

fetchModels()
  .then((data) => {
    models.value = data
    if (data.length === 1) selectedModelId.value = data[0].id
  })
  .catch((err: Error) => {
    error.value = `Could not load models: ${err.message}`
  })

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
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>Enterprise Capability Model</h1>
      <ModelSelector v-model="selectedModelId" :models="models" />
    </header>

    <main class="app-main">
      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-else-if="loading" class="loading-spinner">Loading...</div>
      <div v-else-if="!selectedModelId" class="empty-hint">Select a model to view its capability map.</div>
      <CapabilityMap v-else-if="tree" :tree="tree" />
      <div v-else-if="models.length === 0" class="empty-hint">No models available. Create a model to get started.</div>
    </main>
  </div>
</template>
