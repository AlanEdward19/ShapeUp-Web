/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CAPTURE_AUTH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*?inline' {
  const content: string;
  export default content;
}
