export async function onRequestPost(context) {

    const { request, env } = context;

    try {

        const body = await request.json();

        return Response.json({
            received: body,
            hasKV: !!env.BLUEREXALL_SERIALS
        });

    } catch (err) {

        return Response.json({
            error: err.message,
            stack: err.stack
        }, { status: 500 });
    }
}