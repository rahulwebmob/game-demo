import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

function swVersionPlugin(): Plugin {
  return {
    name: 'sw-version',
    writeBundle(options) {
      const outDir = options.dir || 'dist'
      const swPath = resolve(outDir, 'sw.js')
      try {
        const content = readFileSync(swPath, 'utf-8')
        const buildId = Date.now().toString(36)
        writeFileSync(swPath, content.replace('__BUILD_ID__', buildId))
      } catch {}
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), swVersionPlugin()],
})
