<script setup lang="ts">
import { ref } from 'vue'
import type { ModelType } from '../api'

const props = defineProps<{
  mode: 'create' | 'edit'
  initial?: { name: string; description?: string | null }
  modelTypes: ModelType[]
}>()

const emit = defineEmits<{
  submit: [payload: { name: string; description: string; modelTypeId: string }]
  cancel: []
}>()

const name = ref(props.initial?.name ?? '')
const description = ref(props.initial?.description ?? '')
const modelTypeId = ref(props.modelTypes[0]?.id ?? '')
const nameError = ref('')

function handleSubmit() {
  if (!name.value.trim()) {
    nameError.value = 'Name is required'
    return
  }
  if (props.mode === 'create' && !modelTypeId.value) {
    return
  }
  emit('submit', { name: name.value.trim(), description: description.value, modelTypeId: modelTypeId.value })
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('cancel')">
    <div class="modal">
      <h2>{{ mode === 'create' ? 'New Model' : 'Edit Model' }}</h2>

      <div class="form-group">
        <label for="mf-name">Name <span class="required">*</span></label>
        <input id="mf-name" v-model="name" type="text" placeholder="e.g. Business Capability Map" @input="nameError = ''" />
        <div v-if="nameError" class="field-error">{{ nameError }}</div>
      </div>

      <div class="form-group">
        <label for="mf-desc">Description</label>
        <textarea id="mf-desc" v-model="description" rows="2" placeholder="Optional description" />
      </div>

      <div v-if="mode === 'create'" class="form-group">
        <label for="mf-type">Model Type <span class="required">*</span></label>
        <select id="mf-type" v-model="modelTypeId">
          <option v-for="t in modelTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
        <div v-if="!modelTypes.length" class="field-error">No model types available</div>
      </div>

      <div class="form-actions">
        <button class="btn btn-ghost" type="button" @click="emit('cancel')">Cancel</button>
        <button class="btn btn-primary" type="button" @click="handleSubmit">
          {{ mode === 'create' ? 'Create' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>
