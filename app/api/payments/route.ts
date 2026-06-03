import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, handleAuthError } from "@/lib/dal";

export async function GET() {
  try {
    const userId = await requireUserId();
    const payments = await prisma.payment.findMany({
      where: { staff: { userId } },
      include: { staff: true },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(payments);
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

    const payment = await prisma.payment.create({
      data: { staffId: Number(staffId), amount: Number(amount), date, note },
      include: { staff: true },
    });
    return NextResponse.json(payment, { status: 201 });
  } catch (err) {
    return handleAuthError(err);
  }
}
