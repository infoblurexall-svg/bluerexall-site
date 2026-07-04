export async function onRequestPost(context) {

    const { env } = context;

    return Response.json({
        ok: true,
        kv: !!env.BLUEREXALL_SERIALS
    });

}