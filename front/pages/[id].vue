<template>
    <pre>{{ song }}</pre>
</template>

<script setup>
const { $directus } = useNuxtApp();
const route = useRoute();

const { data: song } = await useAsyncData('song', () => {
    return $directus.items('songs').readOne(route.params.id);
});

if (!song.value) throw createError({
    statusCode: 404,
    statusMessage: 'Post Not Found'
});
</script>
