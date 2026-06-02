import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const staff = await prisma.staff.findMany({
    include: { workSite: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(staff);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, role, phone, workSiteId } = body;
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const staff = await prisma.staff.create({
    data: { name, role, phone, workSiteId: workSiteId || null },
    include: { workSite: true },
  });
  return NextResponse.json(staff, { status: 201 });
}
