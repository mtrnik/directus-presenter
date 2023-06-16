<template>
    <ul>
        <li v-for="verse in songsStore.song.ordered_verses" :key="verse._id">
            <p :id="verse._id" v-html="verse.value" class="flex items-center h-screen justify-center text-6xl text-center bg-black text-white p-16 leading-loose"></p>
        </li>
    </ul>
</template>

<script lang="ts">
import {useSongsStore} from "~/store/songs.store";

export default defineNuxtComponent({

    async setup()  {
        return {
            route: useRoute(),
            songsStore: useSongsStore()
        }
    },

    data() {
        return {}
    },
    mounted() {
        this.songsStore.fetchSongById( this.route.params.songId as string )

        window.addEventListener('keydown', this.songsStore.handleKeyDown );
    },
    methods: {}
})
</script>
