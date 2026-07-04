import xlsx from "xlsx";
import fs from "fs";
import { execSync } from "child_process";

const file = "codes.xlsx"; // فایل اکسل را اینجا بگذار

const workbook = xlsx.readFile(file);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

const data = xlsx.utils.sheet_to_json(sheet);

for (const row of data) {

    const serial = (row["Serial Code"] || "").toString().trim();

    if (!serial) continue;

    const value = JSON.stringify({
        batch: "FS-260701",
        verificationCount: 0
    });

    try {
        execSync(`wrangler kv key put ${serial} '${value}' --binding SERIALS --remote`);
        console.log("Inserted:", serial);
    } catch (e) {
        console.log("Error:", serial);
    }
}

console.log("DONE");