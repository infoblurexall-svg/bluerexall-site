export async function onRequestPost(context) {

    const { request, env } = context;

    try {

        // ❗ فقط یک بار body خوانده می‌شود
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
            return Response.json({
                success: false,
                message: "No file uploaded"
            }, { status: 400 });
        }

        // ✅ Cloudflare safe read
        const bytes = new Uint8Array(await file.arrayBuffer());

        const XLSX = await import("xlsx");

        const workbook = XLSX.read(bytes, { type: "array" });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const rows = XLSX.utils.sheet_to_json(sheet);

        const seen = new Set();

        let imported = 0;
        let skipped = 0;

        for (const row of rows) {

            const serial = (row["Serial Code"] || row["ID"] || "")
                .toString()
                .trim()
                .toUpperCase();

            if (!serial) {
                skipped++;
                continue;
            }

            if (seen.has(serial)) {
                skipped++;
                continue;
            }

            seen.add(serial);

            // ✅ KV binding درست تو
            const exists = await env.BLUEREXALL_SERIALS.get(serial);

            if (exists) {
                skipped++;
                continue;
            }

            await env.BLUEREXALL_SERIALS.put(serial, JSON.stringify({
                batch: "FS-260701",
                verificationCount: 0
            }));

            imported++;
        }

        return Response.json({
            success: true,
            imported,
            skipped,
            total: rows.length
        });

    } catch (err) {

        return Response.json({
            success: false,
            message: err.message || "Import failed"
        }, { status: 500 });
    }
}