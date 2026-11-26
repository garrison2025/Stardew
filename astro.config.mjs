import {defineConfig} from 'astro/config';
import react from '@astrojs/react';
export default defineConfig({integrations:[react()],output:'static',trailingSlash:'always',vite:{build:{assetsInlineLimit:0}},server:{host:true}});
