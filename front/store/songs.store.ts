import { defineStore } from 'pinia'
import {Song, SongAnchor, SongVerse} from "~/types/types";
import {useServicesStore} from "~/store/services.store";

export const useSongsStore = defineStore('songs', {
    state: () => {
        return {
            song: {} as Song,
            currentAnchor: { id: '', index: -1 } as SongAnchor
        }
    },
    getters: {},
    actions: {
        async fetchSongById( songId: string ) {
            const { $directus } = useNuxtApp()

            this.song = await $directus.items('songs').readOne( songId ) as Song
            this.song = this.processSong( this.song )

            if ( this.song.ordered_verses?.[0]._id ) {
                this.currentAnchor = { id: this.song.ordered_verses[0]._id, index: 0 }
            }
        },

        processSong(song: Song): Song {
            song.verses = this.parseXmlToVerses( song )
            this.clearSpecialCharactersFromVerses( song )
            song.ordered_verses = this.prepareVersesOrder( song.verses, song.verse_order )

            return song
        },

        parseXmlToVerses(song: Song) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString( song.lyrics, 'application/xml');
            const lyricsNode = xmlDoc.querySelector('lyrics');
            if ( lyricsNode ) {
                const song = xmlNodeToObject( lyricsNode );
                return song.verses || []
            }

            return []
        },

        clearSpecialCharactersFromVerses(song: Song) {
            for ( const verse of song.verses ) {
                const cleanedValue = verse.value.replace(/\[(.*?)\]/g, ''); // Remove text inside square brackets
                const formattedValue = cleanedValue.replace(/\n/g, '<br />'); // Replace '\n' with '<br />'

                verse.value = formattedValue
            }
        },

        prepareVersesOrder(verses: SongVerse[], verseOrder: string | null ) {
            const orderedVerses: SongVerse[] = [];

            if ( verseOrder ) {
                const verseLabels = verseOrder.split(' ');
                for (const labelIndex in verseLabels) {
                    const label = verseLabels[labelIndex]
                    const verse = verses.find((verse) => `${verse.type}${verse.label}` === label);
                    if ( verse ) {
                        orderedVerses.push({ ...verse, _id: `${labelIndex}-${verse.type}${verse.label}` });
                    }
                }
            } else {
                for ( const verseIndex in verses ) {
                    const verse = verses[verseIndex]
                    orderedVerses.push( { ...verse, _id: `${verseIndex}-${verse.type}${verse.label}` } )
                }
            }

            return orderedVerses.slice()
        },

        handleKeyDown(event: KeyboardEvent) {
            switch (event.key) {
                case 'ArrowUp':
                    event.preventDefault()
                    this.handleArrowUp();
                    break;
                case 'ArrowDown':
                    event.preventDefault()
                    this.handleArrowDown();
                    break;
            }
        },

        handleArrowUp() {
            if ( this.currentAnchor.index > 0 ) {
                this.currentAnchor.index--
                this.changeSelectedSongVerse()
            } else {
                useServicesStore().moveToPreviousSong()
            }
        },

        handleArrowDown() {
            if ( this.currentAnchor.index < this.song.ordered_verses.length - 1 ) {
                this.currentAnchor.index++
                this.changeSelectedSongVerse()
            } else {
                useServicesStore().moveToNextSong()
            }
        },

        changeSelectedSongVerse() {
            if ( this.song.ordered_verses[this.currentAnchor.index]._id ) {
                this.currentAnchor.id = this.song.ordered_verses[ this.currentAnchor.index ]._id ?? ''
                localStorage.setItem('directus-presenter-live-verse-anchor', this.currentAnchor.id )
            }
        }


    },
})

function xmlNodeToObject(node: Element): Partial<Song> {
    const obj: Partial<Song> = {};
    const children = node.children;

    for (let i = 0; i < children.length; i++) {
        const child = children[i] as Element;
        const nodeName = child.nodeName;
        const nodeValue = child.textContent;

        if (nodeName === 'verse') {
            if (!obj.verses) {
                obj.verses = [];
            }

            const verse: SongVerse = {
                label: child.getAttribute('label') || '',
                type: child.getAttribute('type') || '',
                value: nodeValue || ''
            };

            obj.verses.push(verse);
        } else if (child.children.length > 0) {
            obj[nodeName] = xmlNodeToObject(child);
        } else if (nodeValue) {
            obj[nodeName] = nodeValue;
        } else {
            obj[nodeName] = {};
        }
    }

    return obj as Partial<Song>;
}

