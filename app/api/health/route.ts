import { NextResponse } from "next/server";

// Public, unauthenticated endpoint for platform health checks.
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
