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
    verses: SongVerse[]
    ordered_verses: SongVerse[]
    [key: string]: any; // Index signature for arbitrary string keys
}

export interface SongAnchor {
    id: string
    index: number
}

export interface SongVerse {
    label: string;
    type: string;
    value: string;
    _id?: string
}
