import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleAuthError } from "@/lib/dal";
import { isAllowlistedAdmin } from "@/lib/admin";

// DELETE a user and ALL of their data (cascades via schema relations).
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId: adminId } = await requireAdmin();
    const { id } = await params;

    if (id === adminId) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id }, select: { email: true } });
    if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (isAllowlistedAdmin(target.email)) {
      return NextResponse.json(
        { error: "This account is a protected admin (ADMIN_EMAILS)" },
        { status: 400 },
      );
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleAuthError(err);
  }
}

// PATCH supports two actions: { action: "wipe" } and { action: "setRole", role }.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId: adminId } = await requireAdmin();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const action = body?.action as string | undefined;

    const target = await prisma.user.findUnique({ where: { id }, select: { email: true, role: true } });
    if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (action === "wipe") {
      // Removing staff cascades attendance/advances/payments; worksites are separate.
      const [staff, worksites] = await prisma.$transaction([
        prisma.staff.deleteMany({ where: { userId: id } }),
        prisma.workSite.deleteMany({ where: { userId: id } }),
      ]);
      return NextResponse.json({ ok: true, deletedStaff: staff.count, deletedWorksites: worksites.count });
    }

    if (action === "setRole") {
      const role = body?.role === "admin" ? "admin" : "user";
      if (id === adminId) {
        return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });
      }
      if (isAllowlistedAdmin(target.email)) {
        return NextResponse.json(
          { error: "This account's admin role is enforced by ADMIN_EMAILS" },
          { status: 400 },
        );
      }
      const updated = await prisma.user.update({
        where: { id },
        data: { role },
        select: { id: true, role: true },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return handleAuthError(err);
  }
}
