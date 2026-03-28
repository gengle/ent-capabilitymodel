<script setup lang="ts">
import { inject } from 'vue'
import type { Domain } from '../api'
import GroupCard from './GroupCard.vue'

const props = defineProps<{ domain: Domain }>()

const nodeActions = inject<{
  editNode: (id: string, level: number, initial: { name: string; description?: string | null }) => void
  deleteNode: (id: string) => void
  addNode: (parentId: string | null, level: number) => void
}>('nodeActions')!
</script>

<template>
  <div class="domain-card">
    <div class="card-header domain-name">
      <span>{{ domain.name }}</span>
      <div class="card-actions">
        <button class="btn-icon" title="Edit domain" @click.stop="nodeActions.editNode(domain.id, 1, { name: domain.name, description: domain.description })">✎</button>
        <button class="btn-icon btn-icon-del" title="Delete domain" :disabled="domain.groups.length > 0" @click.stop="nodeActions.deleteNode(domain.id)">✕</button>
      </div>
    </div>
    <div class="groups">
      <GroupCard
        v-for="group in domain.groups"
        :key="group.id"
        :group="group"
      />
      <div v-if="!domain.groups.length" class="empty-hint">No groups</div>
      <button class="add-btn" @click="nodeActions.addNode(domain.id, 2)">＋ Add Group</button>
    </div>
  </div>
</template>
