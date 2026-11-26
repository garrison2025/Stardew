import {defineConfig} from 'astro/config';
import react from '@astrojs/react';
export default defineConfig({integrations:[react()],output:'static',outDir:process.argv.includes('workspace')?'./dist-workspace':'./dist',trailingSlash:'always',vite:{build:{assetsInlineLimit:0}},server:{host:true}});
