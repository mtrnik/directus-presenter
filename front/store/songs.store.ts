import { defineStore } from 'pinia'
import {Song, SongAnchor, SongVerse} from "~/types/types";

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

            const song = await $directus.items('songs').readOne( songId ) as Song
            this.song = song
            this.song.verses = this.parseXmlToVerses( this.song )
            this.clearSpecialCharactersFromVerses( this.song )
            this.song.ordered_verses = this.prepareVersesOrder( this.song.verses, this.song.verse_order )

            if ( this.song.ordered_verses?.[0]._id ) {
                this.currentAnchor = { id: this.song.ordered_verses[0]._id, index: 0 }
            }
        },

        parseXmlToVerses(song: Song) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(this.song.lyrics, 'application/xml');
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
            }
        },

        handleArrowDown() {
            if ( this.currentAnchor.index < this.song.ordered_verses.length - 1 ) {
                this.currentAnchor.index++
                this.changeSelectedSongVerse()
            }
        },

        changeSelectedSongVerse() {
            if ( this.song.ordered_verses[this.currentAnchor.index]._id ) {
                this.currentAnchor.id = this.song.ordered_verses[ this.currentAnchor.index ]._id ?? ''
                scrollToElement( this.currentAnchor.id )
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

function scrollToElement(id: string) {
    const element = document.getElementById(id);
    element?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
    });
}

