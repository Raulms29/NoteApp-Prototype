import './styles/index.css';
import './styles/colors.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './views/App.vue';
import router from './router';
import naive from "naive-ui";
import { useGlobalError } from './stores/useGlobalError';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(naive);

// Global error store
const errorStore = useGlobalError();

app.config.errorHandler = (error: Error) => {
    errorStore.setError(error);
    console.error('Global error handler:', error);
};

window.addEventListener('error', (event) => {
    // Only show dialog for non-split errors, since there is no way to avoid them
    if (!event.filename.includes('split') && !event.message.includes("reading 'max'") && !event.filename.includes('404'))
        errorStore.setError(event.error || event.message);
    console.error('Window error event:', event);
    console.error('Error filename:', event.filename);
});

window.addEventListener('unhandledrejection', (event) => {
    errorStore.setError(event.reason);
});

// Mounting the main app
app.mount('#app');

console.log('👋 Renderer is ready. Welcome to Slate');

const art = String.raw`
███████╗██╗      █████╗ ████████╗███████╗
██╔════╝██║     ██╔══██╗╚══██╔══╝██╔════╝
███████╗██║     ███████║   ██║   █████╗  
╚════██║██║     ██╔══██║   ██║   ██╔══╝  
███████║███████╗██║  ██║   ██║   ███████╗
╚══════╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
`;

// %c tells the console to apply the CSS style provided in the second argument
console.log(`%c${art}`, 'color: #1976d2;');