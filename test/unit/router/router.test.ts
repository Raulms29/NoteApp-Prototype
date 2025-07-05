import { describe, it, expect } from 'vitest';
import { createRouter, createWebHashHistory } from 'vue-router';
import routes from '../../../src/router/index';

// Helper to create a fresh router instance for each test
function setupRouter() {
    return createRouter({
        history: createWebHashHistory(),
        routes: routes.options.routes,
    });
}

describe('Router', () => {
    it('should have expected routes', () => {
        const router = setupRouter();
        const routeNames = router.getRoutes().map(r => r.name);
        expect(routeNames).toContain('workspace');
        expect(routeNames).toContain('noteSpace');
        expect(routeNames).toContain('newWorkspace');
    });

    it('should resolve / to workspace', () => {
        const router = setupRouter();
        const match = router.resolve('/');
        expect(match.name).toBe('workspace');
    });

    it('should resolve /workspace/ to noteSpace', () => {
        const router = setupRouter();
        const match = router.resolve('/workspace/');
        expect(match.name).toBe('noteSpace');
    });

    it('should resolve /workspace/new to newWorkspace', () => {
        const router = setupRouter();
        const match = router.resolve('/workspace/new');
        expect(match.name).toBe('newWorkspace');
    });
});
