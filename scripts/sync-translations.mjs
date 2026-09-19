/**
 * Sync missing translation keys from messages/en.json into other locale files.
 *
 * Prefers DeepL (DEEPL_API_KEY). Falls back to Google Cloud Translation
 * (GOOGLE_TRANSLATE_API_KEY). Without either key, copies English as a stub
 * so catalogs stay complete for builds.
 *
 * Usage: node scripts/sync-translations.mjs
 *        pnpm i18n:sync
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MESSAGES_DIR = path.join(ROOT, "messages");
const FREEZE_PATH = path.join(MESSAGES_DIR, "_freeze.json");

/** Load KEY=VALUE pairs from .env.local / .env without printing secrets. */
function loadEnvFiles() {
  for (const name of [".env.local", ".env"]) {
    const filePath = path.join(ROOT, name);
    if (!fs.existsSync(filePath)) continue;
    for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  }
}

loadEnvFiles();

const LOCALES = [
  "fr",
  "es",
  "de",
  "pt",
  "ar",
  "zh",
  "ja",
  "hi",
  "it",
  "nl",
  "ko",
  "ru",
  "tr",
  "id",
  "sv",
  "pl",
  "th",
  "vi",
  "da",
  "no",
];

const DEEPL_LANG = {
  fr: "FR",
  es: "ES",
  de: "DE",
  pt: "PT-PT",
  ar: "AR",
  zh: "ZH",
  ja: "JA",
  it: "IT",
  nl: "NL",
  ko: "KO",
  ru: "RU",
  tr: "TR",
  id: "ID",
  sv: "SV",
  pl: "PL",
  da: "DA",
  no: "NB",
};

const GOOGLE_LANG = {
  fr: "fr",
  es: "es",
  de: "de",
  pt: "pt",
  ar: "ar",
  zh: "zh-CN",
  ja: "ja",
  hi: "hi",
  it: "it",
  nl: "nl",
  ko: "ko",
  ru: "ru",
  tr: "tr",
  id: "id",
  sv: "sv",
  pl: "pl",
  th: "th",
  vi: "vi",
  da: "da",
  no: "no",
};

function flatten(obj, prefix = "", out = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flatten(value, next, out);
    } else {
      out[next] = String(value);
    }
  }
  return out;
}

function nestFlat(flat) {
  const result = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".");
    let cur = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (typeof cur[p] !== "object" || cur[p] === null) cur[p] = {};
      cur = cur[p];
    }
    cur[parts[parts.length - 1]] = value;
  }
  return result;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function translateDeepL(texts, target) {
  const authKey = process.env.DEEPL_API_KEY;
  if (!authKey || !DEEPL_LANG[target]) return null;

  const endpoint = authKey.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  for (let attempt = 0; attempt < 6; attempt++) {
    const body = new URLSearchParams();
    body.set("target_lang", DEEPL_LANG[target]);
    body.set("source_lang", "EN");
    for (const text of texts) {
      // Protect {placeholders} without XML tag handling (HTML in copy breaks DeepL XML mode).
      body.append("text", text.replace(/\{(\w+)\}/g, "[[[$1]]]"));
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${authKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (res.status === 429) {
      const waitMs = 5000 * (attempt + 1);
      console.warn(`DeepL rate-limited; retrying in ${waitMs / 1000}s…`);
      await sleep(waitMs);
      continue;
    }

    if (!res.ok) {
      console.warn(`DeepL error ${res.status}: ${await res.text()}`);
      return null;
    }

    const data = await res.json();
    return (data.translations ?? []).map((row) =>
      String(row.text).replace(/\[\[\[(\w+)\]\]\]/g, "{$1}"),
    );
  }

  console.warn("DeepL still rate-limited after retries");
  return null;
}

async function translateGoogle(texts, target) {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey || !GOOGLE_LANG[target]) return null;

  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: texts,
      source: "en",
      target: GOOGLE_LANG[target],
      format: "text",
    }),
  });
  if (!res.ok) {
    console.warn(`Google Translate error ${res.status}: ${await res.text()}`);
    return null;
  }
  const data = await res.json();
  return (data.data?.translations ?? []).map((row) => row.translatedText);
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function translateGoogleFree(texts, target) {
  const lang = GOOGLE_LANG[target];
  if (!lang) return null;

  const results = [];
  for (const text of texts) {
    const protectedText = text.replace(/\{(\w+)\}/g, "⟦$1⟧");
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(lang)}&dt=t&q=${encodeURIComponent(protectedText)}`;

    let translated = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const res = await fetch(url);
        if (res.status === 429) {
          await sleep(1500 * (attempt + 1));
          continue;
        }
        if (!res.ok) {
          console.warn(`Google free error ${res.status}`);
          return null;
        }
        const data = await res.json();
        translated = Array.isArray(data?.[0])
          ? data[0].map((row) => row?.[0] ?? "").join("")
          : protectedText;
        break;
      } catch (err) {
        console.warn(`Google free failed: ${err.message}`);
        await sleep(1000 * (attempt + 1));
      }
    }

    if (translated == null) {
      console.warn("Google free giving up on one string; keeping English");
      results.push(text);
    } else {
      results.push(String(translated).replace(/⟦(\w+)⟧/g, "{$1}"));
    }
    await sleep(120);
  }
  return results;
}

async function translateBatch(texts, target) {
  if (texts.length === 0) return [];
  const deepl = await translateDeepL(texts, target);
  if (deepl) return deepl;
  const google = await translateGoogle(texts, target);
  if (google) return google;
  const free = await translateGoogleFree(texts, target);
  if (free) return free;
  return texts; // stub: keep English
}

async function syncLocale(locale, enFlat, freeze) {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  const existing = fs.existsSync(filePath) ? flatten(readJson(filePath)) : {};

  // Translate missing keys and English stubs (same text as en), except freeze list.
  const toTranslate = Object.keys(enFlat).filter((key) => {
    if (freeze.has(key)) return !(key in existing);
    return !(key in existing) || existing[key] === enFlat[key];
  });

  console.log(`[${locale}] translating ${toTranslate.length} keys`);

  const CHUNK = 8;
  const translated = { ...existing };

  for (let i = 0; i < toTranslate.length; i += CHUNK) {
    const chunkKeys = toTranslate.slice(i, i + CHUNK);
    const chunkTexts = chunkKeys.map((k) => enFlat[k]);
    const results = await translateBatch(chunkTexts, locale);
    chunkKeys.forEach((key, idx) => {
      if (freeze.has(key) && existing[key]) return;
      translated[key] = results[idx] ?? enFlat[key];
    });
    process.stdout.write(".");
    await sleep(400);
  }
  if (toTranslate.length) process.stdout.write("\n");

  // Ensure every English key exists.
  for (const [key, value] of Object.entries(enFlat)) {
    if (!(key in translated)) translated[key] = value;
  }

  writeJson(filePath, nestFlat(translated));
}

async function main() {
  const enPath = path.join(MESSAGES_DIR, "en.json");
  if (!fs.existsSync(enPath)) {
    console.error("messages/en.json not found. Run convert script first.");
    process.exit(1);
  }

  const hasDeepL = Boolean(process.env.DEEPL_API_KEY);
  const hasGoogle = Boolean(process.env.GOOGLE_TRANSLATE_API_KEY);
  console.log(
    `Translator: ${hasDeepL ? "DeepL" : hasGoogle ? "Google Cloud" : "free Google fallback (slow/unreliable)"}`,
  );

  const freeze = new Set(
    fs.existsSync(FREEZE_PATH) ? readJson(FREEZE_PATH) : [],
  );
  const enFlat = flatten(readJson(enPath));

  const requested = process.env.SYNC_LOCALES
    ? process.env.SYNC_LOCALES.split(",").map((s) => s.trim()).filter(Boolean)
    : LOCALES;

  for (const locale of requested) {
    if (!LOCALES.includes(locale)) {
      console.warn(`Skipping unknown locale: ${locale}`);
      continue;
    }
    await syncLocale(locale, enFlat, freeze);
  }

  console.log("Done. Locale catalogs synced from English.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
