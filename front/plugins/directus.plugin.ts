import { Directus } from '@directus/sdk';
const directus = new Directus('http://0.0.0.0:8055');

export default defineNuxtPlugin(() => {
    return {
        provide: { directus },
    };
});
