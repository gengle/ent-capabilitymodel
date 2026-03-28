<script setup lang="ts">
import { inject } from 'vue'
import type { Group } from '../api'
import CapabilityCard from './CapabilityCard.vue'

const props = defineProps<{ group: Group }>()

const nodeActions = inject<{
  editNode: (id: string, level: number, initial: { name: string; description?: string | null }) => void
  deleteNode: (id: string) => void
  addNode: (parentId: string | null, level: number) => void
}>('nodeActions')!
</script>

<template>
  <div class="group-card">
    <div class="card-header group-name">
      <span>{{ group.name }}</span>
      <div class="card-actions">
        <button class="btn-icon" title="Edit group" @click.stop="nodeActions.editNode(group.id, 2, { name: group.name, description: group.description })">✎</button>
        <button class="btn-icon btn-icon-del" title="Delete group" :disabled="group.capabilities.length > 0" @click.stop="nodeActions.deleteNode(group.id)">✕</button>
      </div>
    </div>
    <div class="capabilities">
      <CapabilityCard
        v-for="cap in group.capabilities"
        :key="cap.id"
        :capability="cap"
      />
      <div v-if="!group.capabilities.length" class="empty-hint">No capabilities</div>
      <button class="add-btn" @click="nodeActions.addNode(group.id, 3)">＋ Add Capability</button>
    </div>
  </div>
</template>
