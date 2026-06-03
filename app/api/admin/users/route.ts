import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleAuthError } from "@/lib/dal";
import { isAllowlistedAdmin } from "@/lib/admin";

export async function GET() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { staff: true, workSites: true } },
      },
    });

    // Counts that live under Staff (attendance / advances / payments),
    // grouped by the owning user in one query each.
    const [attByStaff, advByStaff, payByStaff, staffOwners] = await Promise.all([
      prisma.attendance.groupBy({ by: ["staffId"], _count: { _all: true } }),
      prisma.advance.groupBy({ by: ["staffId"], _count: { _all: true } }),
      prisma.payment.groupBy({ by: ["staffId"], _count: { _all: true } }),
      prisma.staff.findMany({ select: { id: true, userId: true } }),
    ]);

    const staffToUser = new Map(staffOwners.map((s) => [s.id, s.userId]));
    const tally = (rows: { staffId: number; _count: { _all: number } }[]) => {
      const m = new Map<string, number>();
      for (const r of rows) {
        const uid = staffToUser.get(r.staffId);
        if (uid) m.set(uid, (m.get(uid) ?? 0) + r._count._all);
      }
      return m;
    };
    const attMap = tally(attByStaff);
    const advMap = tally(advByStaff);
    const payMap = tally(payByStaff);

    const result = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      isAllowlistAdmin: isAllowlistedAdmin(u.email),
      counts: {
        staff: u._count.staff,
        worksites: u._count.workSites,
        attendance: attMap.get(u.id) ?? 0,
        advances: advMap.get(u.id) ?? 0,
        payments: payMap.get(u.id) ?? 0,
      },
    }));

    return NextResponse.json(result);
  } catch (err) {
    return handleAuthError(err);
  }
}
