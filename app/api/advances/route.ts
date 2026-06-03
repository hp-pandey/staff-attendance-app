import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, handleAuthError } from "@/lib/dal";

export async function GET() {
  try {
    const userId = await requireUserId();
    const advances = await prisma.advance.findMany({
      where: { staff: { userId } },
      include: { staff: true },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(advances);
  } catch (err) {
    return handleAuthError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await req.json();
    const { staffId, amount, date, note } = body;
    if (!staffId || !amount || !date)
      return NextResponse.json({ error: "staffId, amount, date required" }, { status: 400 });

    const staff = await prisma.staff.findFirst({
      where: { id: Number(staffId), userId },
      select: { id: true },
    });
    if (!staff) return NextResponse.json({ error: "Invalid staff" }, { status: 403 });

    const advance = await prisma.advance.create({
      data: { staffId: Number(staffId), amount: Number(amount), date, note },
      include: { staff: true },
    });
    return NextResponse.json(advance, { status: 201 });
  } catch (err) {
    return handleAuthError(err);
  }
}
