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
            router: useRouter(),
            songsStore: useSongsStore()
        }
    },

    data() {
        let intervalWatcher: NodeJS.Timer | undefined

        return {
            intervalWatcher,
            currentlySelectedAnchor: ''
        }
    },
    mounted() {
        this.songsStore.fetchSongById( this.route.params.songId as string )

        this.watchLocalStorage()
    },
    methods: {
        watchLocalStorage() {
            this.intervalWatcher = setInterval( () => {
                this.readLocalStorage()
            }, 100)
        },
        readLocalStorage() {
            const liveSongId = localStorage.getItem('directus-presenter-live-song-id' )
            const liveVerseAnchor = localStorage.getItem('directus-presenter-live-verse-anchor' )

            if ( liveSongId !== this.route.params.songId as string ) {
                this.router.replace( '/preview/song/' + liveSongId )
            }

            if ( liveVerseAnchor !== this.currentlySelectedAnchor ) {
                this.currentlySelectedAnchor = liveVerseAnchor ?? ''
                scrollToElement( this.currentlySelectedAnchor )
            }
        }
    }
})

function scrollToElement(id: string) {
    const element = document.getElementById(id);
    element?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
    });
}
</script>
