import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, handleAuthError } from "@/lib/dal";

export async function GET() {
  try {
    const userId = await requireUserId();
    const sites = await prisma.workSite.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(sites);
  } catch (err) {
    return handleAuthError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await req.json();
    const { name, location } = body;
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const existing = await prisma.workSite.findFirst({ where: { userId, name } });
    if (existing) {
      return NextResponse.json({ error: "A work site with this name already exists" }, { status: 409 });
    }

    const site = await prisma.workSite.create({ data: { name, location, userId } });
    return NextResponse.json(site, { status: 201 });
  } catch (err) {
    return handleAuthError(err);
  }
}
