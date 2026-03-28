<script setup lang="ts">
import { inject } from 'vue'
import type { Capability } from '../api'

const props = defineProps<{ capability: Capability }>()

const nodeActions = inject<{
  editNode: (id: string, level: number, initial: { name: string; description?: string | null; owner?: string | null }) => void
  deleteNode: (id: string) => void
  addNode: (parentId: string | null, level: number) => void
}>('nodeActions')!
</script>

<template>
  <div class="capability-card">
    <div class="card-header capability-name">
      <span>{{ capability.name }}</span>
      <div class="card-actions">
        <button class="btn-icon" title="Edit capability" @click.stop="nodeActions.editNode(capability.id, 3, { name: capability.name, description: capability.description, owner: capability.owner })">✎</button>
        <button class="btn-icon btn-icon-del" title="Delete capability" :disabled="capability.subCapabilities.length > 0" @click.stop="nodeActions.deleteNode(capability.id)">✕</button>
      </div>
    </div>
    <div v-if="capability.kind" class="capability-kind">{{ capability.kind }}</div>
    <dl v-if="Object.keys(capability.properties).length" class="capability-props">
      <template v-for="(val, key) in capability.properties" :key="key">
        <dt>{{ key }}</dt>
        <dd>{{ val }}</dd>
      </template>
    </dl>
    <ul v-if="capability.subCapabilities.length" class="subcapabilities">
      <li v-for="sub in capability.subCapabilities" :key="sub.id" class="subcap-item">
        <span>{{ sub.name }}</span>
        <div class="card-actions subcap-actions">
          <button class="btn-icon" title="Edit sub-capability" @click.stop="nodeActions.editNode(sub.id, 4, { name: sub.name, description: sub.description, owner: sub.owner })">✎</button>
          <button class="btn-icon btn-icon-del" title="Delete sub-capability" @click.stop="nodeActions.deleteNode(sub.id)">✕</button>
        </div>
      </li>
    </ul>
    <button class="add-btn" @click="nodeActions.addNode(capability.id, 4)">＋ Add Sub-capability</button>
  </div>
</template>
