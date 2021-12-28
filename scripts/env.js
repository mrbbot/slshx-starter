import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "..", "env.jsonc");

/**
 * @typedef {Object} Env~Application
 * @property {[string]} applicationId
 * @property {[string]} applicationPublicKey
 * @property {[string]} applicationSecret
 */

/**
 * @typedef {Object} Env
 * @property {[string]} testServerId
 * @property {[Env~Application]} development
 * @property {[Env~Application]} production
 */

/**
 * @type {Env}
 */
export let env = {};
try {
  const envJson = (await fs.readFile(envPath, "utf8"))
    .split("\n")
    // Remove "//" comments
    .map((line) => line.replace(/\/\/.*$/, "").trim())
    .filter(Boolean)
    .join("\n");
  env = JSON.parse(envJson);
} catch {}
