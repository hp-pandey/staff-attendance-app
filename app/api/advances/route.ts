import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const advances = await prisma.advance.findMany({
    include: { staff: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(advances);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { staffId, amount, date, note } = body;
  if (!staffId || !amount || !date)
    return NextResponse.json({ error: "staffId, amount, date required" }, { status: 400 });

  const advance = await prisma.advance.create({
    data: { staffId: Number(staffId), amount: Number(amount), date, note },
    include: { staff: true },
  });
  return NextResponse.json(advance, { status: 201 });
}
