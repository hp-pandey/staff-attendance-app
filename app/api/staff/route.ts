import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, handleAuthError } from "@/lib/dal";

export async function GET() {
  try {
    const userId = await requireUserId();
    const staff = await prisma.staff.findMany({
      where: { userId },
      include: { workSite: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(staff);
  } catch (err) {
    return handleAuthError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await req.json();
    const { name, role, phone, workSiteId } = body;
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    // Ensure the chosen work site belongs to this user.
    if (workSiteId) {
      const site = await prisma.workSite.findFirst({
        where: { id: Number(workSiteId), userId },
        select: { id: true },
      });
      if (!site) return NextResponse.json({ error: "Invalid work site" }, { status: 400 });
    }

    const staff = await prisma.staff.create({
      data: { name, role, phone, workSiteId: workSiteId || null, userId },
      include: { workSite: true },
    });
    return NextResponse.json(staff, { status: 201 });
  } catch (err) {
    return handleAuthError(err);
  }
}
