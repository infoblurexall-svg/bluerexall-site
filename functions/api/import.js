import * as XLSX from "xlsx";

export async function onRequestPost(context) {

    const { request, env } = context;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
        return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    let count = 0;

    for (const row of rows) {

        const serial = (row["Serial Code"] || "").toString().trim();

        if (!serial) continue;

        await env.SERIALS.put(serial, JSON.stringify({
            batch: "FS-260701",
            verificationCount: 0
        }));

        count++;
    }

    return Response.json({
        success: true,
        imported: count
    });
}