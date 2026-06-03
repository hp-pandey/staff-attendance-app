import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, handleAuthError } from "@/lib/dal";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await req.json();

    const owned = await prisma.payment.findFirst({
      where: { id: Number(id), staff: { userId } },
      select: { id: true },
    });
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { amount, date, note } = body;
    const payment = await prisma.payment.update({
      where: { id: Number(id) },
      data: {
        amount: amount !== undefined ? Number(amount) : undefined,
        date,
        note,
      },
    });
    return NextResponse.json(payment);
  } catch (err) {
    return handleAuthError(err);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const result = await prisma.payment.deleteMany({
      where: { id: Number(id), staff: { userId } },
    });
    if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleAuthError(err);
  }
}
