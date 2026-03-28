<script setup lang="ts">
import { inject } from 'vue'
import type { ModelTree, NodeKind } from '../api'
import DomainCard from './DomainCard.vue'

defineProps<{ tree: ModelTree; nodeKinds: NodeKind[] }>()

const nodeActions = inject<{
  addNode: (parentId: string | null, level: number) => void
}>('nodeActions')!
</script>

<template>
  <div class="capability-map">
    <div v-if="!tree.domains.length" class="empty-hint">This model has no domains yet.</div>
    <div class="domains-grid">
      <DomainCard
        v-for="domain in tree.domains"
        :key="domain.id"
        :domain="domain"
      />
    </div>
    <button class="add-btn add-domain-btn" @click="nodeActions.addNode(null, 1)">＋ Add Domain</button>
  </div>
</template>
