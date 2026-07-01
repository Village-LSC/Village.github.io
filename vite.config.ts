import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// Кастомный плагин для автоматической трансформации старых путей ассетов
const pathFixerPlugin = () => ({
  name: 'transform-legacy-asset-paths',
  transform(code: string, id: string) {
    // Обрабатываем только файлы исходного кода (ts, tsx, js, jsx)
    if (/\.(ts|tsx|js|jsx)$/.test(id)) {
      let updatedCode = code;
      
      // Авто-замена для картинок: /src/assets/images/ -> /images/
      updatedCode = updatedCode.replace(/\/src\/assets\/images\//g, '/images/');
      
      // Авто-замена для аудио: /src/assets/lobby.mp3 -> /lobby.mp3
      updatedCode = updatedCode.replace(/\/src\/assets\/lobby\.mp3/g, '/lobby.mp3');
      
      return {
        code: updatedCode,
        map: null // отключаем sourcemap для скорости
      };
    }
  }
});

export default defineConfig(() => {
  return {
    base: '/', 
    plugins: [pathFixerPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
