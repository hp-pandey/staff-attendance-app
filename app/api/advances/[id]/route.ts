import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, handleAuthError } from "@/lib/dal";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await req.json();

    const owned = await prisma.advance.findFirst({
      where: { id: Number(id), staff: { userId } },
      select: { id: true },
    });
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Only allow safe, scalar fields to be updated.
    const { amount, date, repaid, note } = body;
    const advance = await prisma.advance.update({
      where: { id: Number(id) },
      data: {
        amount: amount !== undefined ? Number(amount) : undefined,
        date,
        repaid,
        note,
      },
    });
    return NextResponse.json(advance);
  } catch (err) {
    return handleAuthError(err);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const result = await prisma.advance.deleteMany({
      where: { id: Number(id), staff: { userId } },
    });
    if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleAuthError(err);
  }
}
