<template>
    <ul>
        <li v-for="verse in song.ordered_verses" :key="verse._id">
            <p :id="verse._id" v-html="verse.value" class="flex items-center h-screen justify-center text-6xl text-center bg-black text-white p-16 leading-loose"></p>
        </li>
    </ul>
</template>

<script lang="ts">

interface Song {
    id: number;
    user_created: string;
    date_created: string;
    user_updated: string | null;
    date_updated: string | null;
    title: string;
    alternate_title: string;
    lyrics: string;
    verse_order: string | null;
    copyright: string | null;
    comments: string | null;
    ccli_number: string | null;
    theme_name: string | null;
    search_title: string;
    search_lyrics: string;
    verses: Verse[]
    ordered_verses: Verse[]
    [key: string]: any; // Index signature for arbitrary string keys
}

interface Verse {
    label: string;
    type: string;
    value: string;
    _id?: string
}

interface Anchor {
    id: string
    index: number
}


export default defineNuxtComponent({
    async setup()  {
        const { $directus } = useNuxtApp()
        const route = useRoute()

        const { data: song } = await useAsyncData('song', () => {
            return $directus.items('songs').readOne( route.params.songId as string )
        });

        if ( !song.value ) throw createError({
            statusCode: 404,
            statusMessage: 'Post Not Found'
        });

        return {
            song: song.value as Song
        }
    },
    data() {
        const currentAnchor: Anchor = { id: '', index: -1 }

        return {
            currentAnchor
        }
    },
    mounted() {
        window.addEventListener('keydown', this.handleKeyDown);

        this.parseXmlToVerses()
        this.clearSpecialCharactersFromVerses()
        this.prepareVersesOrder( this.song.verses, this.song.verse_order )
    },
    methods: {
        async parseXmlToVerses() {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(this.song.lyrics, 'application/xml');
            const lyricsNode = xmlDoc.querySelector('lyrics');
            if ( lyricsNode ) {
                const song = xmlNodeToObject( lyricsNode );
                this.song.verses = song.verses || []
            }
        },

        clearSpecialCharactersFromVerses() {
            for ( const verse of this.song.verses ) {
                const cleanedValue = verse.value.replace(/\[(.*?)\]/g, ''); // Remove text inside square brackets
                const formattedValue = cleanedValue.replace(/\n/g, '<br />'); // Replace '\n' with '<br />'

                verse.value = formattedValue
            }
        },

        prepareVersesOrder( verses: Verse[], verseOrder: string | null ) {
            const orderedVerses = [];

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

            this.song.ordered_verses = orderedVerses.slice()

            if ( this.song.ordered_verses?.[0]._id ) {
                this.currentAnchor = { id: this.song.ordered_verses[0]._id, index: 0 }
            }
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
                // Add more cases for other key codes if needed
            }
        },

        handleArrowUp() {
            if ( this.currentAnchor.index > 0 ) {
                this.currentAnchor.index--
                if ( this.song.ordered_verses[this.currentAnchor.index]._id ) {
                    this.currentAnchor.id = this.song.ordered_verses[this.currentAnchor.index]._id ?? ''
                    scrollToElement( this.currentAnchor.id )
                }
            }
        },

        handleArrowDown() {
            if ( this.currentAnchor.index < this.song.ordered_verses.length - 1 ) {
                this.currentAnchor.index++
                if ( this.song.ordered_verses[this.currentAnchor.index]._id ) {
                    this.currentAnchor.id = this.song.ordered_verses[this.currentAnchor.index]._id ?? ''
                    scrollToElement( this.currentAnchor.id )
                }
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

            const verse: Verse = {
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

</script>
