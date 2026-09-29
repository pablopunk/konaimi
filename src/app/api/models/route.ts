import { fetchCatalog, InvalidKeyError } from "@/lib/catalog";
import { demoCatalog } from "@/lib/demo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store, max-age=0", "Vary": "Cookie" };

export async function GET() {
  return Response.json(demoCatalog, { headers });
}

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length")) > 4096) {
    return Response.json({ error: "Invalid API key." }, { status: 400, headers });
  }
  try {
    const body: unknown = await request.json();
    const key = body && typeof body === "object" && "key" in body ? body.key : null;
    if (typeof key !== "string" || !key.trim() || key.length > 2048) {
      return Response.json({ error: "Enter a valid API key." }, { status: 400, headers });
    }
    return Response.json(await fetchCatalog(key.trim()), { headers });
  } catch (error) {
    if (error instanceof InvalidKeyError) {
      return Response.json({ error: "This key was not accepted by Artificial Analysis." }, { status: 401, headers });
    }
    return Response.json({ error: "Model data is unavailable. Please try again later." }, { status: 503, headers });
  }
}
