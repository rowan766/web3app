// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_ENDPOINT: string
  // 添加其他环境变量类型
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
