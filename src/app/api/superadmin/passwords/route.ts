import { NextResponse } from "next/server";

// In-memory persistent map within server runtime with baseline seed passwords
const staffPasswordsMap: Record<string, string> = {
  "superadmin@zhouconsulting.com": "SuperAdmin123!",
  "admin@zhouconsulting.com": "Admin123!",
  "ewi@zhou-consulting.com": "SuperAdmin123!",
  "dekhsafnan@gmail.com": "SuperAdmin123!",
};

export async function GET() {
  return NextResponse.json({
    success: true,
    passwords: staffPasswordsMap,
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

    if (email) staffPasswordsMap[String(email).toLowerCase().trim()] = String(password);
    if (nip) staffPasswordsMap[String(nip).toLowerCase().trim()] = String(password);
    if (id) staffPasswordsMap[String(id).toLowerCase().trim()] = String(password);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
      passwords: staffPasswordsMap,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
