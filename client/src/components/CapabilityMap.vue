<script setup lang="ts">
import type { ModelTree } from '../api'
import DomainCard from './DomainCard.vue'

defineProps<{ tree: ModelTree }>()
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
  </div>
</template>
