/// <reference types="vite/client" />

/**
 * Declared explicitly because `noPropertyAccessFromIndexSignature` blocks
 * dot access on Vite's default index-signature-only ImportMetaEnv.
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
