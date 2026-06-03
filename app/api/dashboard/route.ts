import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, handleAuthError } from "@/lib/dal";

export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const [totalStaff, todayAttendance, totalAdvances, totalPayments] = await Promise.all([
      prisma.staff.count({ where: { active: true, userId } }),
      prisma.attendance.findMany({
        where: { date, staff: { userId } },
        include: { staff: { include: { workSite: true } } },
      }),
      prisma.advance.aggregate({ _sum: { amount: true }, where: { staff: { userId } } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { staff: { userId } } }),
    ]);

    const present = todayAttendance.filter((a) => a.status === "present").length;
    const absent = todayAttendance.filter((a) => a.status === "absent").length;
    const late = todayAttendance.filter((a) => a.status === "late").length;
    const overtime = todayAttendance.filter((a) => a.status === "overtime").length;

    return NextResponse.json({
      totalStaff,
      present,
      absent,
      late,
      overtime,
      unmarked: totalStaff - todayAttendance.length,
      totalAdvances: totalAdvances._sum.amount || 0,
      totalPayments: totalPayments._sum.amount || 0,
      recentAttendance: todayAttendance,
    });
  } catch (err) {
    return handleAuthError(err);
  }
}
