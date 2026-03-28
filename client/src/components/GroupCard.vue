<script setup lang="ts">
import type { Group } from '../api'
import CapabilityCard from './CapabilityCard.vue'

defineProps<{ group: Group }>()
</script>

<template>
  <div class="group-card">
    <div class="group-name">{{ group.name }}</div>
    <div class="capabilities">
      <CapabilityCard
        v-for="cap in group.capabilities"
        :key="cap.id"
        :capability="cap"
      />
      <div v-if="!group.capabilities.length" class="empty-hint">No capabilities</div>
    </div>
  </div>
</template>
