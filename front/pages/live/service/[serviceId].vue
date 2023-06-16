<template>
    <div>
        <p v-for="songId in sortedSongs">
            <p @click="openPresenter( songId.song.id )">{{ songId.song.title }}</p>
        </p>
    </div>
</template>

<script lang="ts">
import {Service, ServiceSong} from "~/types/types";

export default defineNuxtComponent({
    async setup() {
        const {$directus} = useNuxtApp()
        const route = useRoute()

        const {data: service} = await useAsyncData('service', () => {
            return $directus.items('services').readOne(route.params.serviceId as string, {
                fields: [ '*', "songs.sort", "songs.song.*", ]
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
        sortedSongs(): ServiceSong[] {
            return this.service.songs.sort(( a, b) => a.sort - b.sort )
        }
    },
    methods: {
        openPresenter(songId: number) {
            window.open( window.location.origin + '/preview/song/' + songId , "_blank", "location=yes" );
        },
    }
})
</script>
