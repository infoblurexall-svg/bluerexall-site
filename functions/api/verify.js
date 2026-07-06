export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const code = String(body.code || "").trim().toUpperCase();

    if (!code) {
      return Response.json(
        { ok: false, message: "لطفاً کد Verify را وارد کنید." },
        { status: 400 }
      );
    }

    const raw = await context.env.BLUEREXALL_CODES.get(code);

    if (!raw) {
      return Response.json(
        { ok: false, message: "کد اشتباه می‌باشد. کد را بررسی کنید." },
        { status: 404 }
      );
    }

    const record = JSON.parse(raw);

    return Response.json({
      ok: true,
      code,
      message: "این محصول مورد تایید توسط تیم Bluerexall می‌باشد."
    });
  } catch (error) {
    return Response.json(
      { ok: false, message: "خطا در بررسی کد." },
      { status: 500 }
    );
  }
}