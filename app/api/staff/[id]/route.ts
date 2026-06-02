import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, role, phone, workSiteId, active } = body;
  const staff = await prisma.staff.update({
    where: { id: Number(id) },
    data: { name, role, phone, workSiteId: workSiteId ?? undefined, active },
    include: { workSite: true },
  });
  return NextResponse.json(staff);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.staff.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
