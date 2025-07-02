import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue-jsx';

export default defineConfig({
    plugins: [vue()],

    test: {
        environment: 'happy-dom',
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov', 'json', 'html'],
            reportsDirectory: './coverage',
        },
    }
});
