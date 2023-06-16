import { defineStore } from 'pinia'
import {Service, ServiceSong} from "~/types/types";

export const useServicesStore = defineStore('services', {
    state: () => {
        return {
            service: {} as Service,
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
        },

    },
})

