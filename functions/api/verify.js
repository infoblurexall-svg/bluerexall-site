export async function onRequestPost(context) {

    const { request, env } = context;

    try {

        const body = await request.json();
        const serial = (body.serial || "").trim().toUpperCase();

        if (!serial) {
            return Response.json({
                success: false,
                message: "Serial number is required."
            }, { status: 400 });
        }

        const data = await env.SERIALS.get(serial);

        if (!data) {
            return Response.json({
                success: false,
                status: "Invalid"
            });
        }

        let product;

        try {
            product = JSON.parse(data);
        } catch {

            // اگر داده به صورت متن ساده ذخیره شده باشد
            product = {
                batch: "UNKNOWN",
                verificationCount: 0
            };
        }

        if (typeof product.verificationCount !== "number") {
            product.verificationCount = 0;
        }

        product.verificationCount++;

        await env.SERIALS.put(serial, JSON.stringify(product));

        return Response.json({
            success: true,
            serial: serial,
            status: "Valid",
            batch: product.batch,
            verificationCount: product.verificationCount
        });

    } catch (err) {

        return Response.json({
            success: false,
            status: "Error",
            message: err.message
        }, { status: 500 });

    }

}