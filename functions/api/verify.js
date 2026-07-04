export async function onRequestPost(context) {

    const { request, env } = context;

    try {

        const body = await request.json();
        const serial = (body.serial || "").trim().toUpperCase();

        if (!serial) {
            return Response.json({
                success: false,
                message: "Serial is required"
            }, { status: 400 });
        }

        const data = await env.SERIALS.get(serial);

        if (!data) {
            return Response.json({
                success: false,
                message: "Invalid Serial"
            });
        }

        let product = {
            batch: "UNKNOWN",
            verificationCount: 0
        };

        try {
            const parsed = JSON.parse(data);
            product = {
                batch: parsed.batch || "UNKNOWN",
                verificationCount: parsed.verificationCount || 0
            };
        } catch {
            // اگر JSON خراب بود
        }

        product.verificationCount += 1;

        await env.SERIALS.put(serial, JSON.stringify(product));

        return Response.json({
            success: true,
            serial,
            batch: product.batch,
            verificationCount: product.verificationCount
        });

    } catch (err) {

        return Response.json({
            success: false,
            message: err.message
        }, { status: 500 });

    }
}