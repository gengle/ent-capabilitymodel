<script setup lang="ts">
import type { Capability } from '../api'

defineProps<{ capability: Capability }>()
</script>

<template>
  <div class="capability-card">
    <div class="capability-name">{{ capability.name }}</div>
    <div v-if="capability.kind" class="capability-kind">{{ capability.kind }}</div>
    <dl v-if="Object.keys(capability.properties).length" class="capability-props">
      <template v-for="(val, key) in capability.properties" :key="key">
        <dt>{{ key }}</dt>
        <dd>{{ val }}</dd>
      </template>
    </dl>
    <ul v-if="capability.subCapabilities.length" class="subcapabilities">
      <li v-for="sub in capability.subCapabilities" :key="sub.id">
        {{ sub.name }}
      </li>
    </ul>
  </div>
</template>
