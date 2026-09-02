import { NextRequest, NextResponse } from "next/server";
import { resetRateLimitStore } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const raw = req.cookies.get("mc_session")?.value;
  if (!raw) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const session = JSON.parse(raw);
    if (session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  resetRateLimitStore();
  return NextResponse.json({ success: true, message: "Rate limit store reset" });
}
