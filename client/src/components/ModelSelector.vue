<script setup lang="ts">
import type { ModelSummary } from '../api'

const props = defineProps<{
  models: ModelSummary[]
  modelValue: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [id: string]
}>()
</script>

<template>
  <div class="model-selector">
    <label for="model-select">Capability Model</label>
    <select
      id="model-select"
      :value="modelValue ?? ''"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="" disabled>Select a model...</option>
      <option v-for="m in models" :key="m.id" :value="m.id">
        {{ m.name }} <span v-if="m.modelType">({{ m.modelType }})</span>
      </option>
    </select>
  </div>
</template>
