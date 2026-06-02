import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const payments = await prisma.payment.findMany({
    include: { staff: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(payments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { staffId, amount, date, note } = body;
  if (!staffId || !amount || !date)
    return NextResponse.json({ error: "staffId, amount, date required" }, { status: 400 });

  const payment = await prisma.payment.create({
    data: { staffId: Number(staffId), amount: Number(amount), date, note },
    include: { staff: true },
  });
  return NextResponse.json(payment, { status: 201 });
}
