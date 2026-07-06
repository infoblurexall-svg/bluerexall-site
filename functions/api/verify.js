export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const code = String(body.code || "").trim().toUpperCase();

    if (!code) {
      return Response.json(
        {
          ok: false,
          message: "Please enter a verification code."
        },
        { status: 400 }
      );
    }

    const raw = await context.env.CODES_KV.get(code);

    if (!raw) {
      return Response.json(
        {
          ok: false,
          message: "Invalid code. Please check the code and try again."
        },
        { status: 404 }
      );
    }

    const record = JSON.parse(raw);

    const updatedRecord = {
      ...record,
      used: Number(record.used || 0) + 1,
      lastUsedAt: new Date().toISOString()
    };

    await context.env.CODES_KV.put(
      code,
      JSON.stringify(updatedRecord)
    );

    return Response.json(
      {
        ok: true,
        code,
        message: "This product has been verified by the Bluerexall team.",
        used: updatedRecord.used,
        lastUsedAt: updatedRecord.lastUsedAt,
        status: updatedRecord.status || "valid"
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Unable to verify the code right now. Please try again later."
      },
      { status: 500 }
    );
  }
}