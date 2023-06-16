<template>
    <div>
        <p v-for="songId in sortedSongs">
            <nuxt-link :to="'http://localhost:3000/preview/song/' + songId.song.id">{{ songId.song.id }}</nuxt-link>
        </p>
    </div>

</template>

<script lang="ts">

interface Service {
    id: number;
    songs: SongRef[]
}

interface SongRef {
    sort: number
    song: { id: number }
}

export default defineNuxtComponent({
    async setup() {
        const {$directus} = useNuxtApp()
        const route = useRoute()

        const {data: service} = await useAsyncData('service', () => {
            return $directus.items('services').readOne(route.params.serviceId as string, {
                fields: [ '*', "songs.sort", "songs.song.id", ]
            })
        });

        if (!service.value) throw createError({
            statusCode: 404,
            statusMessage: 'Service Not Found'
        });

        return {
            service: service.value as Service
        }
    },
    computed: {
        sortedSongs(): SongRef[] {
            return this.service.songs.sort(( a, b) => a.sort - b.sort )
        }
    }
})
</script>
