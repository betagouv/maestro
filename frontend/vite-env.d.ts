/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEBSITE_URL: string;
  readonly VITE_PUBLIC_URL: string;
  readonly VITE_API_URL: string;
  readonly VITE_SUPPORT_EMAIL: string;
  readonly VITE_SATELLITE_STYLE: string;
  readonly VITE_MATOMO_TAG_MANAGER_CONTAINER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
