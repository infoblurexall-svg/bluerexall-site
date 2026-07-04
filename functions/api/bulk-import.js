export async function onRequestPost(context) {

    const { request, env } = context;

    try {

        const body = await request.json();

        const serials = (body.serials || "")
            .split("\n")
            .map(s => s.trim().toUpperCase())
            .filter(Boolean);

        let imported = 0;
        let skipped = 0;

        const seen = new Set();

        for (const serial of serials) {

            if (!serial) {
                skipped++;
                continue;
            }

            if (seen.has(serial)) {
                skipped++;
                continue;
            }

            seen.add(serial);

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
            imported: imported,
            skipped: skipped,
            total: serials.length
        });

    } catch (err) {

        return Response.json({
            success: false,
            error: err.message
        }, { status: 500 });
    }
}