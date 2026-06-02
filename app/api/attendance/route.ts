import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const staffId = searchParams.get("staffId");

  const where: Record<string, unknown> = {};
  if (date) where.date = date;
  if (staffId) where.staffId = Number(staffId);

  const records = await prisma.attendance.findMany({
    where,
    include: { staff: { include: { workSite: true } } },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { staffId, date, status, hours, note } = body;
  if (!staffId || !date || !status)
    return NextResponse.json({ error: "staffId, date, status required" }, { status: 400 });

  const record = await prisma.attendance.upsert({
    where: { staffId_date: { staffId: Number(staffId), date } },
    create: { staffId: Number(staffId), date, status, hours, note },
    update: { status, hours, note },
    include: { staff: true },
  });
  return NextResponse.json(record, { status: 201 });
}
