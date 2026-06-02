import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const payment = await prisma.payment.update({
    where: { id: Number(id) },
    data: body,
  });
  return NextResponse.json(payment);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.payment.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
