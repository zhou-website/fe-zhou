import { NextResponse } from "next/server";

declare global {
  // eslint-disable-next-line no-var
  var __staffPasswordsMap: Record<string, string> | undefined;
}

// Global runtime persistent map to survive route re-evaluations
if (!globalThis.__staffPasswordsMap) {
  globalThis.__staffPasswordsMap = {
    "superadmin@zhouconsulting.com": "SuperAdmin123!",
    "admin@zhouconsulting.com": "Admin123!",
    "ewi@zhou-consulting.com": "SuperAdmin123!",
    "dekhsafnan@gmail.com": "SuperAdmin123!",
  };
}

export async function GET() {
  return NextResponse.json({
    success: true,
    passwords: globalThis.__staffPasswordsMap,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, nip, id, password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, message: "Password is required" },
        { status: 400 }
      );
    }

    const map = globalThis.__staffPasswordsMap || {};
    if (email) map[String(email).toLowerCase().trim()] = String(password);
    if (nip) map[String(nip).toLowerCase().trim()] = String(password);
    if (id) {
      map[String(id).toLowerCase().trim()] = String(password);
      map[`stf-be-${String(id).toLowerCase().trim()}`] = String(password);
    }
    globalThis.__staffPasswordsMap = map;

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
      passwords: globalThis.__staffPasswordsMap,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
