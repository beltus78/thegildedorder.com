// POST /api/contact → stores the message in KV namespace bound as GILDED_KV.
export async function onRequestPost({ request, env }) {
  let d; try { d = await request.json(); } catch { return new Response("Bad request", { status: 400 }); }
  const msg = {
    name: String(d.name || "").slice(0, 120),
    email: String(d.email || "").slice(0, 200),
    subject: String(d.subject || "").slice(0, 200),
    message: String(d.message || "").slice(0, 5000),
    at: new Date().toISOString()
  };
  if (!msg.email.includes("@") || !msg.message) return new Response("Missing fields", { status: 400 });
  if (env.GILDED_KV) await env.GILDED_KV.put(`contact:${msg.at}:${crypto.randomUUID()}`, JSON.stringify(msg));
  return new Response("OK");
}
