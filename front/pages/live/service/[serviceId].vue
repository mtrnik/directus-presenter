<template>
    <div>
        <h3 @click="servicesStore.goLive()">Start presentation</h3>

        <p v-for="(serviceSong, index) in servicesStore.sortedSongs">
            <p @click="servicesStore.moveToSong( index )">{{ serviceSong.song.title }}</p>
        </p>
    </div>
</template>

<script lang="ts">
import {useServicesStore} from "~/store/services.store";
import {useSongsStore} from "~/store/songs.store";

export default defineNuxtComponent({

    async setup() {
        return {
            route: useRoute(),
            servicesStore: useServicesStore(),
            songsStore: useSongsStore()
        }
    },
    mounted() {
        this.servicesStore.fetchServiceById( this.route.params.serviceId as string )

        window.addEventListener('keydown', this.songsStore.handleKeyDown );
    },
    methods: {}
})
</script>
