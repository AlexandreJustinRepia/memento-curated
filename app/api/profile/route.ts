import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

function getSessionId(req: NextRequest): string | null {
  return req.cookies.get("mc_session")?.value ?? null;
}

async function getSession(req: NextRequest) {
  const raw = getSessionId(req);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", session.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: session.id,
    email: session.email,
    name: data?.name ?? session.name ?? "",
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession(req);
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { name, email } = body ?? {};

  if (!name && !email) {
    return NextResponse.json({ error: "name or email is required" }, { status: 400 });
  }

  if (email && typeof email !== "string") {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (name !== undefined && typeof name !== "string") {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name.trim();
  if (email !== undefined) updates.email = email.trim();

  if (email) {
    const { error: authError } = await supabase.auth.admin.updateUserById(session.id, {
      email: email.trim(),
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }
  }

  if (name !== undefined) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ name: name.trim() })
      .eq("id", session.id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
  }

  const updatedEmail = email ?? session.email;
  const updatedName = name ?? (await getSession(req))?.name ?? session.name;

  const response = NextResponse.json({
    id: session.id,
    email: updatedEmail,
    name: updatedName,
  });

  if (email) {
    const newSession = {
      ...session,
      email: updatedEmail,
    };
    response.cookies.set("mc_session", JSON.stringify(newSession), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return response;
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { currentPassword, newPassword } = body ?? {};

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "currentPassword and newPassword are required" },
      { status: 400 }
    );
  }

  if (typeof newPassword !== "string" || newPassword.length < 6) {
    return NextResponse.json(
      { error: "New password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const authClient = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error: verifyError } = await authClient.auth.signInWithPassword({
    email: session.email,
    password: currentPassword,
  });

  if (verifyError) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 401 }
    );
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(session.id, {
    password: newPassword,
  });

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
