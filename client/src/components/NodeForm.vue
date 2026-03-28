<script setup lang="ts">
import { ref, computed } from 'vue'
import type { NodeKind } from '../api'

const LEVEL_LABELS: Record<number, string> = { 1: 'Domain', 2: 'Group', 3: 'Capability', 4: 'Sub-capability' }

const props = defineProps<{
  mode: 'create' | 'edit'
  level: number
  initial?: { name?: string; description?: string | null; owner?: string | null; kindId?: string }
  nodeKinds: NodeKind[]
}>()

const emit = defineEmits<{
  submit: [payload: { name: string; description: string; owner: string; kindId?: string; properties?: Record<string, unknown> }]
  cancel: []
}>()

const name = ref(props.initial?.name ?? '')
const description = ref(props.initial?.description ?? '')
const owner = ref(props.initial?.owner ?? '')
const kindId = ref(props.initial?.kindId ?? props.nodeKinds[0]?.id ?? '')
const propertiesJson = ref('{}')
const nameError = ref('')
const propertiesError = ref('')

const needsKind = computed(() => props.level >= 3)
const title = computed(() => {
  const label = LEVEL_LABELS[props.level] ?? 'Node'
  return props.mode === 'create' ? `Add ${label}` : `Edit ${label}`
})

function handleSubmit() {
  if (!name.value.trim()) {
    nameError.value = 'Name is required'
    return
  }
  if (needsKind.value && props.mode === 'create' && !kindId.value) {
    return
  }
  let properties: Record<string, unknown> | undefined
  if (needsKind.value && props.mode === 'create') {
    try {
      properties = JSON.parse(propertiesJson.value || '{}')
      propertiesError.value = ''
    } catch {
      propertiesError.value = 'Must be valid JSON (e.g. {"maturity": "initial"})'
      return
    }
  }
  emit('submit', {
    name: name.value.trim(),
    description: description.value,
    owner: owner.value,
    ...(needsKind.value && props.mode === 'create' ? { kindId: kindId.value, properties } : {}),
  })
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('cancel')">
    <div class="modal">
      <h2>{{ title }}</h2>

      <div class="form-group">
        <label for="nf-name">Name <span class="required">*</span></label>
        <input id="nf-name" v-model="name" type="text" :placeholder="`e.g. ${LEVEL_LABELS[level] ?? 'Node'} name`" @input="nameError = ''" />
        <div v-if="nameError" class="field-error">{{ nameError }}</div>
      </div>

      <div class="form-group">
        <label for="nf-desc">Description</label>
        <textarea id="nf-desc" v-model="description" rows="2" placeholder="Optional description" />
      </div>

      <div v-if="level >= 3" class="form-group">
        <label for="nf-owner">Owner</label>
        <input id="nf-owner" v-model="owner" type="text" placeholder="e.g. Team or person name" />
      </div>

      <div v-if="needsKind && mode === 'create'" class="form-group">
        <label for="nf-kind">Kind <span class="required">*</span></label>
        <select id="nf-kind" v-model="kindId">
          <option v-for="k in nodeKinds" :key="k.id" :value="k.id">{{ k.name }}</option>
        </select>
        <div v-if="!nodeKinds.length" class="field-error">No node kinds available</div>
      </div>

      <div v-if="needsKind && mode === 'create'" class="form-group">
        <label for="nf-props">Properties <span class="hint">(JSON)</span></label>
        <textarea id="nf-props" v-model="propertiesJson" rows="3" placeholder='{"maturity": "Initial"}' />
        <div v-if="propertiesError" class="field-error">{{ propertiesError }}</div>
      </div>

      <div class="form-actions">
        <button class="btn btn-ghost" type="button" @click="emit('cancel')">Cancel</button>
        <button class="btn btn-primary" type="button" @click="handleSubmit">
          {{ mode === 'create' ? 'Add' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>
