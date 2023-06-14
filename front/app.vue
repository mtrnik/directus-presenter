<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
    const {$directus} = useNuxtApp()
    console.debug($directus)
</script>
