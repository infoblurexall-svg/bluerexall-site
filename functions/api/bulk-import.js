export async function onRequestPost(context) {

    const { env } = context;

    return Response.json({
        hasKV: !!env.BLUEREXALL_SERIALS
    });
}