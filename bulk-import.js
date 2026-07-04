import fs from "fs";
import dotenv from "dotenv";
import * as XLSX from "xlsx";

dotenv.config();

const API_TOKEN = process.env.CF_API_TOKEN;
const ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const NAMESPACE_ID = process.env.CF_NAMESPACE_ID;

if (!API_TOKEN || !ACCOUNT_ID || !NAMESPACE_ID) {
    console.error("❌ Missing .env variables");
    process.exit(1);
}

const FILE = "codes.xlsx";

if (!fs.existsSync(FILE)) {
    console.error("❌ codes.xlsx not found");
    process.exit(1);
}

const workbook = XLSX.readFile(FILE);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet);

console.log("📥 Reading Excel...");

const map = new Map();

let blank = 0;
let duplicate = 0;

for (const row of rows) {

    const serial = (row["Serial Code"] || "")
        .toString()
        .trim()
        .toUpperCase();

    if (!serial) {
        blank++;
        continue;
    }

    if (map.has(serial)) {
        duplicate++;
        continue;
    }

    map.set(serial, true);
}

const serials = [...map.keys()];

console.log("Total rows:", rows.length);
console.log("Blank:", blank);
console.log("Duplicates:", duplicate);
console.log("Unique:", serials.length);

const BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}`;

const headers = {
    Authorization: `Bearer ${API_TOKEN}`,
    "Content-Type": "application/json"
};

let imported = 0;
let skipped = 0;
let failed = 0;

function progress(i, total) {
    const p = Math.floor((i / total) * 30);
    process.stdout.write(
        `\r[${"█".repeat(p)}${"░".repeat(30 - p)}] ${((i / total) * 100).toFixed(1)}%`
    );
}

async function exists(key) {
    const url = `${BASE}/values/${encodeURIComponent(key)}`;

    const res = await fetch(url, { headers });

    return res.status === 200;
}

async function put(key) {
    const url = `${BASE}/values/${encodeURIComponent(key)}`;

    await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify({
            batch: "FS-260701",
            verificationCount: 0
        })
    });
}

console.log("\n🔍 Checking KV...\n");

for (let i = 0; i < serials.length; i++) {

    const serial = serials[i];

    progress(i + 1, serials.length);

    try {

        const ok = await exists(serial);

        if (ok) {
            skipped++;
            continue;
        }

        await put(serial);
        imported++;

    } catch (e) {
        failed++;
    }
}

console.log("\n\n====================");
console.log("IMPORT DONE");
console.log("====================");
console.log("Imported:", imported);
console.log("Skipped:", skipped);
console.log("Failed:", failed);