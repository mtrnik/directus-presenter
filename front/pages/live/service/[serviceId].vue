<template>
    <div>
        <p v-for="songId in servicesStore.sortedSongs">
            <p @click="openPresenter( songId.song.id )">{{ songId.song.title }}</p>
        </p>
    </div>
</template>

<script lang="ts">
import {useServicesStore} from "~/store/services.store";

export default defineNuxtComponent({

    async setup() {
        return {
            route: useRoute(),
            servicesStore: useServicesStore()
        }
    },
    mounted() {
        this.servicesStore.fetchServiceById( this.route.params.serviceId as string )
    },
    methods: {
        openPresenter(songId: number) {
            window.open( window.location.origin + '/preview/song/' + songId , "_blank", "location=yes" );
        },
    }
})
</script>
