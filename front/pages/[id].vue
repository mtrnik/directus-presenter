<template>
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
        // console.debug('mounted', JSON.stringify(this.song) )
        this.parseXmlToVerses()
    },
    methods: {
        async parseXmlToVerses() {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(this.song.lyrics, 'application/xml');
            const songNode = xmlDoc.querySelector('song');
            if ( songNode ) {
                const song: Record<string, any> = xmlNodeToObject( songNode );
                this.song.verses = song.lyrics.verses
            }
        }
    }
})

function xmlNodeToObject(node: Element): Song {
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

    return obj as Song;
}

</script>
