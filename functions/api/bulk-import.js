export async function onRequestPost(context) {

    const { request, env } = context;

    try {

        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
            return Response.json({
                success: false,
                message: "No file uploaded"
            }, { status: 400 });
        }

        // ✅ FIX نهایی (کاملاً سازگار با Cloudflare)
        const buffer = Buffer.from(await file.arrayBuffer());

        const XLSX = await import("xlsx");

        const workbook = XLSX.read(buffer, { type: "buffer" });

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

            const exists = await env.SERIALS.get(serial);

            if (exists) {
                skipped++;
                continue;
            }

            await env.SERIALS.put(serial, JSON.stringify({
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
            message: err.message
        }, { status: 500 });
    }
}