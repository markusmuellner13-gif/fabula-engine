import { NextResponse } from "next/server";

// Asset-generation backend seam.
//
// When a hosted image-generation service is configured (HIGGSFIELD_API_KEY +
// HIGGSFIELD_ENDPOINT, or any compatible provider), wire the call here and
// return { dataUrl }. Until then we return 204 so the client transparently
// falls back to the built-in offline procedural generator.
export const runtime = "nodejs";

export async function POST(req: Request) {
  const { kind, prompt } = await req.json().catch(() => ({}));
  if (!kind || !prompt) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  const key = process.env.HIGGSFIELD_API_KEY;
  const endpoint = process.env.HIGGSFIELD_ENDPOINT;
  if (!key || !endpoint) {
    // No backend configured — tell the client to generate locally.
    return new NextResponse(null, { status: 204 });
  }

  try {
    // Example shape; adapt to the provider's contract when you wire one in.
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({ prompt: `${kind}: ${prompt}` }),
    });
    if (!res.ok) return new NextResponse(null, { status: 204 });
    const data = await res.json();
    const dataUrl = data.image || data.dataUrl || data.url;
    if (!dataUrl) return new NextResponse(null, { status: 204 });
    return NextResponse.json({ dataUrl });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
