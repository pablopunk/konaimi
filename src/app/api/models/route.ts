import { getCatalog } from "@/lib/catalog";

export const runtime = "nodejs";

export async function GET() {
  try {
    const catalog = await getCatalog();
    return Response.json(catalog, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch (error) {
    console.error("Could not load model catalog", error);
    return Response.json({ error: "Model data is unavailable. Please try again later." }, { status: 503 });
  }
}
