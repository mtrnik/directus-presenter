<template>
    <ul>
        <li v-for="verse in song.ordered_verses">
            <p v-html="verse.value"></p>
        </li>
    </ul>
    <pre>{{ song }}</pre>
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
}


export default defineNuxtComponent({
    async setup()  {
        const { $directus } = useNuxtApp()
        const route = useRoute()

        const { data: song } = await useAsyncData('song', () => {
            return $directus.items('songs').readOne( route.params.id as string )
        });

        if ( !song.value ) throw createError({
            statusCode: 404,
            statusMessage: 'Post Not Found'
        });

        return {
            song: song.value as Song
        }
    },
    mounted() {
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
                for (const label of verseLabels) {
                    const matchingVerse = verses.find((verse) => `${verse.type}${verse.label}` === label);
                    if (matchingVerse) {
                        orderedVerses.push(matchingVerse);
                    }
                }
            } else {
                orderedVerses.push( ...verses )
            }

            this.song.ordered_verses = orderedVerses.slice()
        }
    }
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
