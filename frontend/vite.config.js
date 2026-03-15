import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true 
      },
      manifest: {
        name: 'Aegis-AI Neural System',
        short_name: 'Aegis-AI',
        description: 'Advanced Medical Diagnostic Interface',
        theme_color: '#050810',
        background_color: '#050810',
        display: 'standalone',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '640x640',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '640x640',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})

