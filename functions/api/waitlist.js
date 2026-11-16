// POST /api/waitlist → stores {email, tier} in KV namespace bound as GILDED_KV.
export async function onRequestPost({ request, env }) {
  let d; try { d = await request.json(); } catch { return new Response("Bad request", { status: 400 }); }
  const email = String(d.email || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) return new Response("Invalid email", { status: 400 });
  const tier = ["initiate", "member", "patron"].includes(d.tier) ? d.tier : "initiate";
  if (env.GILDED_KV) await env.GILDED_KV.put(`waitlist:${email}`, JSON.stringify({ email, tier, at: new Date().toISOString() }));
  return new Response("OK");
}
