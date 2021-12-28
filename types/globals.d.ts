export {};

declare global {
  // Replaced by esbuild when bundling, see scripts/build.js (do not edit)
  const SLSHX_APPLICATION_ID: string;
  const SLSHX_APPLICATION_PUBLIC_KEY: string;
  const SLSHX_APPLICATION_SECRET: string | undefined;
  const SLSHX_TEST_SERVER_ID: string | undefined;
}
