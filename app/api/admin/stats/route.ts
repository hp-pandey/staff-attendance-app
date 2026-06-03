import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleAuthError } from "@/lib/dal";

// SQLite database size = page_count * page_size (works regardless of file path,
// including a Railway volume — and avoids filesystem tracing in the bundle).
async function databaseSizeBytes(): Promise<number | null> {
  try {
    const pc = await prisma.$queryRawUnsafe<{ page_count: number }[]>("PRAGMA page_count");
    const ps = await prisma.$queryRawUnsafe<{ page_size: number }[]>("PRAGMA page_size");
    const pageCount = Number(pc?.[0]?.page_count ?? 0);
    const pageSize = Number(ps?.[0]?.page_size ?? 0);
    if (!pageCount || !pageSize) return null;
    return pageCount * pageSize;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    await requireAdmin();
    const [users, staff, worksites, attendance, advances, payments, size] = await Promise.all([
      prisma.user.count(),
      prisma.staff.count(),
      prisma.workSite.count(),
      prisma.attendance.count(),
      prisma.advance.count(),
      prisma.payment.count(),
      databaseSizeBytes(),
    ]);

    return NextResponse.json({
      users,
      staff,
      worksites,
      attendance,
      advances,
      payments,
      databaseSizeBytes: size,
    });
  } catch (err) {
    return handleAuthError(err);
  }
}
