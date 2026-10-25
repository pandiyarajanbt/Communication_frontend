/// <reference types="vite/client" />

declare module '*.gql?raw' {
  const source: string
  export default source
}

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
