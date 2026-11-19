import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Arquivos fixos do "app shell" (em public/) que o service worker guarda
const SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/respire.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon-180.png',
]

// Gera dist/sw.js no build a partir de src/pwa/sw-template.js, com a lista exata dos
// arquivos do build (nomes com hash) e uma versão que muda a cada build diferente.
// Escrito à mão: sem dependência de PWA.
function serviceWorker(): Plugin {
  return {
    name: 'respire-service-worker',
    apply: 'build',
    enforce: 'post',
    generateBundle(_opcoes, bundle) {
      const arquivos = Object.keys(bundle)
        .filter((nome) => !nome.endsWith('.map') && !nome.endsWith('.woff')) // .woff2 já cobre os navegadores atuais
        .map((nome) => `/${nome}`)
      const lista = [...new Set([...SHELL, ...arquivos])].sort()
      const versao = createHash('sha256').update(lista.join('|')).digest('hex').slice(0, 12)

      const modelo = readFileSync(fileURLToPath(new URL('./src/pwa/sw-template.js', import.meta.url)), 'utf8')
      const codigo = modelo.replaceAll('__VERSAO__', versao).replaceAll('__ARQUIVOS__', JSON.stringify(lista))
      if (codigo.includes('__VERSAO__') || codigo.includes('__ARQUIVOS__')) {
        this.error('sw-template.js: marcadores não substituídos')
      }
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: codigo })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serviceWorker()],
})
