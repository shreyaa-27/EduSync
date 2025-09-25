import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// For GitHub Pages:
// - Set base to '/edusync/' (replace with your repo name)
// - Output build to 'docs' so Pages can serve it without Actions
export default defineConfig({
  plugins: [react()],
  base: '/edusync/',
  build: { outDir: 'docs' },
});

