import { build } from "esbuild";
import { env } from "./env.js";

const argv = process.argv.slice(2);

// There are 3 modes: "development", "deploy" and "production".
// - "development" uses application configuration from the "development" key
//   in env.jsonc, whereas "deploy" and "production" use the "production" key
//   instead.
// - "development" includes the test server configuration for live-reloading
//   commands to a specific guild
// - "development" and "deploy" include Miniflare-specific code for deployment
//   to test and global servers.
// - "production" removes application secrets so they're not published
/** @type {"development" | "deploy" | "production"} */
const mode = argv[0];
const modes = ["development", "deploy", "production"];
if (!modes.includes(mode)) {
  throw new Error(`mode must be one of ${modes.join(", ")}`);
}
const useProductionApplication = mode !== "development";
const removeDeployCode = mode === "production";
const includeTestServer = mode === "development";

const testServerId = env.testServerId;
const application = useProductionApplication ? env.production : env.development;
const applicationId = application?.applicationId;
const applicationPublicKey = application?.applicationPublicKey;
const applicationSecret = application?.applicationSecret;

// Validate environment
function assert(name, value, warn = "") {
  if (value) return;
  if (!warn) throw new Error(`${name} must be set in env.jsonc`);
  console.warn(`⚠️ ${name} is not set in env.jsonc. ${warn}`);
}
if (mode === "development") {
  assert(
    "testServerId",
    testServerId,
    "You must include it to enable automatic reloading of commands."
  );
  assert("development.applicationId", applicationId);
  assert("development.applicationPublicKey", applicationPublicKey);
  assert("development.applicationSecret", applicationSecret);
} else if (mode === "deploy") {
  assert("production.applicationId", applicationId);
  assert("production.applicationPublicKey", applicationPublicKey);
  assert("production.applicationSecret", applicationSecret);
} else if (mode === "production") {
  assert("production.applicationId", applicationId);
  assert("production.applicationPublicKey", applicationPublicKey);
}

// Run esbuild
const define = {
  SLSHX_APPLICATION_ID: JSON.stringify(applicationId),
  SLSHX_APPLICATION_PUBLIC_KEY: JSON.stringify(applicationPublicKey),
  SLSHX_APPLICATION_SECRET: removeDeployCode
    ? "undefined" // Don't publish secret
    : JSON.stringify(applicationSecret),
  SLSHX_TEST_SERVER_ID: includeTestServer
    ? JSON.stringify(testServerId)
    : "undefined",
};
if (removeDeployCode) {
  // Force globalThis.MINIFLARE to be false, so esbuild can remove dead-code
  define["globalThis.MINIFLARE"] = "false";
}

await build({
  entryPoints: ["src/index.tsx"],
  outExtension: { ".js": ".mjs" },
  outdir: "dist",
  target: "esnext",
  format: "esm",
  logLevel: "info",
  bundle: true,
  minify: true,
  sourcemap: true,
  jsxFactory: "createElement",
  jsxFragment: "Fragment",
  define,
});
