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
    const used = Number(record.used || 0);
    const maxUses = Number(record.maxUses || 3);

    if (used >= maxUses) {
      return Response.json(
        {
          ok: false,
          code,
          message: "This code has already been used before.",
          used,
          maxUses,
          lastUsedAt: record.lastUsedAt || null,
          status: "used_up"
        },
        { status: 409 }
      );
    }

    const updatedRecord = {
      ...record,
      used: used + 1,
      maxUses,
      lastUsedAt: new Date().toISOString(),
      status: used + 1 >= maxUses ? "used_up" : "valid"
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
        maxUses: updatedRecord.maxUses,
        remainingUses: updatedRecord.maxUses - updatedRecord.used,
        lastUsedAt: updatedRecord.lastUsedAt,
        status: updatedRecord.status
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