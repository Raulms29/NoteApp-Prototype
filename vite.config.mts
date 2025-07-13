import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuejsx from '@vitejs/plugin-vue-jsx';
import path from 'path';

export default defineConfig({
    plugins: [vue(), vuejsx()],

    test: {
        environment: 'jsdom',
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov', 'json', 'html'],
            reportsDirectory: './coverage',
            include: ['src/**/*.ts'],
            exclude: ['src/main.ts', 'src/preload.ts', 'src/renderer.ts', 'src/**/*.vue', 'src/utils/**', 'src/types/**', 'src/**/*.d.ts', 'src/components/editor/extensions/**']
        },
        alias: {
            'icons': path.resolve(__dirname, 'node_modules/vue-material-design-icons'),
        }
    }
});
