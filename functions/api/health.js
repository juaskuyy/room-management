export async function onRequestGet(context) {
  try {
    await context.env.DB.prepare("SELECT 1").first();
    return Response.json({ ok: true, database: "connected" });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}

