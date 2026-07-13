import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';

export default defineConfig([
  globalIgnores(['assets/*', 'node_modules/*', '_site/*', 'admin/*']),
  js.configs.recommended,
  {
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      // ponytail: off to keep vendored Chirpy js untouched (img-popup.js swap), drop when upstream fixes it
      'no-useless-assignment': 'off'
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ['_javascript/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ClipboardJS: 'readonly',
        GLightbox: 'readonly',
        Theme: 'readonly',
        dayjs: 'readonly',
        mermaid: 'readonly',
        tocbot: 'readonly',
        swconf: 'readonly'
      }
    }
  }
]);
