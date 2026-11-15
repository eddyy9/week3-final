import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { build } from 'vite'
import react from '@vitejs/plugin-react'

const root = fileURLToPath(new URL('../', import.meta.url))

// Одна готовая страница: React, код и стили внутри HTML, без локального сервера.
const result = await build({
  root,
  configFile: false,
  plugins: [react()],
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    write: false,
    cssCodeSplit: false,
    lib: {
      entry: resolve(root, 'src/main.tsx'),
      name: 'UserDirectory',
      formats: ['iife'],
    },
  },
})

const files = (Array.isArray(result) ? result : [result]).flatMap(bundle => bundle.output)
const entry = files.find(file => file.type === 'chunk' && file.isEntry)
if (!entry) throw new Error('Не найден собранный JavaScript')

const styles = files
  .filter(file => file.type === 'asset' && file.fileName.endsWith('.css'))
  .map(file => typeof file.source === 'string' ? file.source : Buffer.from(file.source).toString('utf8'))
  .join('\n')

const html = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Directory — каталог пользователей</title>
    <style>${styles}</style>
  </head>
  <body>
    <div id="root"></div>
    <noscript>Для работы каталога включи JavaScript в браузере.</noscript>
    <script>${entry.code.replace(/<\/script/gi, '<\\/script')}</script>
  </body>
</html>
`

const destination = resolve(root, 'user-directory.html')
await writeFile(destination, html, 'utf8')
console.log(`Готовая страница: ${destination}`)
