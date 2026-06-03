import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, handleAuthError } from "@/lib/dal";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await req.json();
    const { name, role, phone, workSiteId, active } = body;

    const owned = await prisma.staff.findFirst({
      where: { id: Number(id), userId },
      select: { id: true },
    });
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (workSiteId) {
      const site = await prisma.workSite.findFirst({
        where: { id: Number(workSiteId), userId },
        select: { id: true },
      });
      if (!site) return NextResponse.json({ error: "Invalid work site" }, { status: 400 });
    }

    const staff = await prisma.staff.update({
      where: { id: Number(id) },
      data: { name, role, phone, workSiteId: workSiteId ?? undefined, active },
      include: { workSite: true },
    });
    return NextResponse.json(staff);
  } catch (err) {
    return handleAuthError(err);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const result = await prisma.staff.deleteMany({ where: { id: Number(id), userId } });
    if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleAuthError(err);
  }
}
