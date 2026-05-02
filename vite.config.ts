import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './src/manifest.json' with { type: 'json' };

const copyLicense = {
  name: 'copy-license',
  apply: 'build' as const,
  closeBundle() {
    copyFileSync(resolve(__dirname, 'LICENSE'), resolve(__dirname, 'dist/LICENSE'));
  },
};

export default defineConfig({
  plugins: [crx({ manifest }), copyLicense],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        panel: 'src/panel/panel.html',
      },
    },
  },
});
