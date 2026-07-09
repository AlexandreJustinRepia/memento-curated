import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// GET /api/admin/users — list all auth users merged with profiles
export async function GET() {
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, role, status, created_at");

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const users = authData.users.map((u) => {
    const profile = profileMap.get(u.id);
    return {
      id:         u.id,
      email:      u.email ?? "",
      name:       profile?.name ?? u.user_metadata?.name ?? "",
      role:       profile?.role ?? "customer",
      status:     profile?.status ?? "active",
      created_at: u.created_at,
    };
  });

  return NextResponse.json(users);
}

// POST /api/admin/users — admin creates a user directly
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { name, email, password, role, status } = body ?? {};

  if (!email || !password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: name ?? "" },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Upsert profile with chosen role/status
  await supabase.from("profiles").upsert({
    id:     data.user.id,
    name:   name ?? "",
    role:   role ?? "customer",
    status: status ?? "active",
  });

  return NextResponse.json({ id: data.user.id }, { status: 201 });
}
