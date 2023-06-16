import { defineStore } from 'pinia'
import {Service, ServiceSong} from "~/types/types";
import {useSongsStore} from "~/store/songs.store";

export const useServicesStore = defineStore('services', {
    state: () => {
        return {
            service: {} as Service,
            liveSongIndex: -1
        }
    },
    getters: {
        sortedSongs(): ServiceSong[] {
            return this.service?.songs?.sort(( a, b) => a.sort - b.sort ) ?? []
        }
    },
    actions: {
        async fetchServiceById( serviceId: string ) {
            const { $directus } = useNuxtApp()

            this.service = await $directus.items('services').readOne( serviceId, {
                fields: [ '*', "songs.sort", "songs.song.*", ]
            } ) as Service

            this.service.songs.map( serviceSong => {
                serviceSong.song = useSongsStore().processSong( serviceSong.song )
            })
        },

        goLive() {
            const serviceSong = this.sortedSongs[ 0 ]
            window.open( window.location.origin + '/live/song/' + serviceSong.song.id , "_blank", "location=yes" );

            this.moveToSong( 0 )
        },


        moveToPreviousSong() {
            if ( this.liveSongIndex > 0 ) {
                this.moveToSong( this.liveSongIndex - 1 )
            }
        },

        moveToNextSong() {
            if ( this.liveSongIndex < this.sortedSongs.length - 1 ) {
                this.moveToSong( this.liveSongIndex + 1 )
            }
        },

        moveToSong( index: number ) {
            this.liveSongIndex = index
            const serviceSong = this.sortedSongs[ index ]
            useSongsStore().song = serviceSong.song

            localStorage.setItem('directus-presenter-live-song-id', serviceSong.song.id.toString() )

            const currentAnchorId = serviceSong.song.ordered_verses?.[0]._id ?? ''

            localStorage.setItem('directus-presenter-live-verse-anchor', currentAnchorId )
            useSongsStore().currentAnchor = { id: currentAnchorId, index: 0 }
        }
    },
})

