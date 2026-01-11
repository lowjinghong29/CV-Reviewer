

declare module '*.md?raw' {
    const content: string;
    export default content;
}

// Fix: Add explicit type definitions for import.meta.env to resolve TypeScript errors.
interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string;
}
  
interface ImportMeta {
    readonly env: ImportMetaEnv;
}