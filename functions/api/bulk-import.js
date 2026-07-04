export async function onRequestPost(context) {

    const { request, env } = context;

    try {

        // 🔥 بررسی KV اول (برای جلوگیری از 500 بی‌دلیل)
        if (!env.BLUEREXALL_SERIALS) {
            return Response.json({
                success: false,
                message: "KV Binding BLUEREXALL_SERIALS not found"
            }, { status: 500 });
        }

        // 📥 گرفتن JSON
        const body = await request.json();

        const input = body.serials || "";

        if (!input || typeof input !== "string") {
            return Response.json({
                success: false,
                message: "No serials provided"
            }, { status: 400 });
        }

        // 🔄 تبدیل به آرایه
        const serials = input
            .split("\n")
            .map(s => s.trim().toUpperCase())
            .filter(Boolean);

        const seen = new Set();

        let imported = 0;
        let skipped = 0;

        // 🔁 پردازش
        for (const serial of serials) {

            if (seen.has(serial)) {
                skipped++;
                continue;
            }

            seen.add(serial);

            try {

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

            } catch (innerErr) {
                skipped++;
            }
        }

        // 📤 خروجی نهایی (حتماً عدد واقعی)
        return Response.json({
            success: true,
            imported: imported,
            skipped: skipped,
            total: serials.length
        });

    } catch (err) {

        return Response.json({
            success: false,
            message: err.message || "Bulk import failed"
        }, { status: 500 });
    }
}