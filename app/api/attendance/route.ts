import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, handleAuthError } from "@/lib/dal";

export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const staffId = searchParams.get("staffId");

    const where: Record<string, unknown> = { staff: { userId } };
    if (date) where.date = date;
    if (staffId) where.staffId = Number(staffId);

    const records = await prisma.attendance.findMany({
      where,
      include: { staff: { include: { workSite: true } } },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(records);
  } catch (err) {
    return handleAuthError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await req.json();
    const { staffId, date, status, hours, note } = body;
    if (!staffId || !date || !status)
      return NextResponse.json({ error: "staffId, date, status required" }, { status: 400 });

    // Ensure the staff member belongs to this user.
    const staff = await prisma.staff.findFirst({
      where: { id: Number(staffId), userId },
      select: { id: true },
    });
    if (!staff) return NextResponse.json({ error: "Invalid staff" }, { status: 403 });

    const record = await prisma.attendance.upsert({
      where: { staffId_date: { staffId: Number(staffId), date } },
      create: { staffId: Number(staffId), date, status, hours, note },
      update: { status, hours, note },
      include: { staff: true },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    return handleAuthError(err);
  }
}
