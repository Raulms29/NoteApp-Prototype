import { createRouter, createWebHashHistory } from 'vue-router';
import Workspace from '../views/Workspace.vue';
import NoteSpace from '../views/NoteSpace.vue';
import NewWorkspace from '../views/NewWorkspace.vue';

const routes = [
    { path: '/', name: 'workspace', component: Workspace },
    { path: '/workspace/', name: 'noteSpace', component: NoteSpace },
    { path: '/workspace/new', name: 'newWorkspace', component: NewWorkspace },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;