// Configuration file for TypeScript
// This file is used to declare modules and types for TypeScript
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<object, object, unknown>
    export default component
}


