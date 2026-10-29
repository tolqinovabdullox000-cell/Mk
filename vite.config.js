import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /node_modules\/(react|react-dom)\// },
            { name: 'router-vendor', test: /node_modules\/react-router/ },
            { name: 'supabase-vendor', test: /node_modules\/@supabase\// },
          ],
        },
      },
    },
  },
})
