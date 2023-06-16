export interface Service {
    id: number;
    songs: ServiceSong[]
}

export interface ServiceSong {
    sort: number
    song: Song
}

export interface Song {
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

export interface Verse {
    label: string;
    type: string;
    value: string;
    _id?: string
}
