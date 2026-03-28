<script setup lang="ts">
import type { Domain } from '../api'
import GroupCard from './GroupCard.vue'

defineProps<{ domain: Domain }>()
</script>

<template>
  <div class="domain-card">
    <div class="domain-name">{{ domain.name }}</div>
    <div class="groups">
      <GroupCard
        v-for="group in domain.groups"
        :key="group.id"
        :group="group"
      />
      <div v-if="!domain.groups.length" class="empty-hint">No groups</div>
    </div>
  </div>
</template>
