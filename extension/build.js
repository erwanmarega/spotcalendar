import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { copyFileSync, mkdirSync, existsSync, readFileSync, cpSync } from 'fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const isWatch = process.argv.includes('--watch');

// Charge le .env manuellement
if (existsSync('.env')) {
  readFileSync('.env', 'utf-8').split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
  });
}

const clientId = process.env.VITE_SPOTIFY_CLIENT_ID || '';

const sharedDefine = {
  'import.meta.env.VITE_SPOTIFY_CLIENT_ID': JSON.stringify(clientId),
};

async function buildBackground() {
  await build({
    configFile: false,
    plugins: [],
    build: {
      lib: {
        entry: resolve(__dirname, 'src/background/index.js'),
        formats: ['es'],
        fileName: () => 'background.js',
      },
      outDir: 'dist',
      emptyOutDir: false,
      target: 'esnext',
      minify: !isWatch,
    },
    define: sharedDefine,
  });
}

async function buildContent() {
  await build({
    configFile: false,
    plugins: [react()],
    css: {
      postcss: {
        plugins: [
          (await import('tailwindcss')).default,
          (await import('autoprefixer')).default,
        ],
      },
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/content/index.jsx'),
        formats: ['iife'],
        name: 'SpotcalendarContent',
        fileName: () => 'content.js',
      },
      rollupOptions: {
        external: [],
        output: {
          inlineDynamicImports: true,
        },
      },
      outDir: 'dist',
      emptyOutDir: false,
      target: 'esnext',
      minify: !isWatch,
    },
    define: {
      ...sharedDefine,
      'process.env.NODE_ENV': '"production"',
    },
  });
}

async function run() {
  mkdirSync('dist', { recursive: true });
  copyFileSync('manifest.json', 'dist/manifest.json');
  if (existsSync('public/icons')) {
    mkdirSync('dist/icons', { recursive: true });
    cpSync('public/icons', 'dist/icons', { recursive: true });
  }

  await buildBackground();
  await buildContent();

  console.log('✓ Build terminé → dist/');
}

run().catch(console.error);
