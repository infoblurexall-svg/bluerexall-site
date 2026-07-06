export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json();
  const code = (body.code || "").trim().toUpperCase();

  if (!code) {
    return Response.json(
      { ok: false, message: "Please enter a verification code." },
      { status: 400 }
    );
  }

  const record = await env.CODES_KV.get(code, { type: "json" });

  if (!record || record.valid !== true) {
    return Response.json(
      {
        ok: false,
        message: "Invalid code. Please check and try again."
      },
      { status: 404 }
    );
  }

  const now = new Date().toISOString().split("T")[0];

  const updated = {
    ...record,
    used: (record.used || 0) + 1,
    lastUsedAt: now
  };

  await env.CODES_KV.put(code, JSON.stringify(updated));

  return Response.json({
    ok: true,
    code,
    used: updated.used,
    lastUsedAt: updated.lastUsedAt,
    message: "This product has been verified by the Bluerexall team."
  });
}