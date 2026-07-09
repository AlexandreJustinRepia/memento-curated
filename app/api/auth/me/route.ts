import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const raw = req.cookies.get("mc_session")?.value;
  if (!raw) return NextResponse.json(null);

  try {
    const session = JSON.parse(raw);
    // Only expose safe fields — never the full token
    return NextResponse.json({
      id:    session.id,
      email: session.email,
      name:  session.name,
      role:  session.role,
    });
  } catch {
    return NextResponse.json(null);
  }
}
