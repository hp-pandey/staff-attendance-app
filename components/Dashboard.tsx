"use client";
import { useState } from "react";
import { useApi } from "@/hooks/useApi";

interface DashboardData {
  totalStaff: number;
  present: number;
  absent: number;
  late: number;
  overtime: number;
  unmarked: number;
  totalAdvances: number;
  totalPayments: number;
  recentAttendance: Array<{
    id: number;
    status: string;
    staff: { name: string; workSite?: { name: string } | null };
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  present: "bg-green-100 text-green-700",
  absent: "bg-red-100 text-red-700",
  late: "bg-amber-100 text-amber-700",
  overtime: "bg-purple-100 text-purple-700",
};

export default function Dashboard() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const { data, loading } = useApi<DashboardData>(`/api/dashboard?date=${date}`, [date]);

  const stats = [
    { label: "Total Staff", value: data?.totalStaff ?? 0, color: "bg-blue-600", icon: "👥" },
    { label: "Present", value: data?.present ?? 0, color: "bg-green-600", icon: "✅" },
    { label: "Absent", value: data?.absent ?? 0, color: "bg-red-500", icon: "❌" },
    { label: "Late", value: data?.late ?? 0, color: "bg-amber-500", icon: "⏰" },
    { label: "Overtime", value: data?.overtime ?? 0, color: "bg-purple-600", icon: "💪" },
    { label: "Unmarked", value: data?.unmarked ?? 0, color: "bg-slate-400", icon: "❓" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-gray-800">Today&apos;s Overview</h2>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-lg mb-3`}>
                  {s.icon}
                </div>
                <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3">Total Advances Given</h3>
              <p className="text-3xl font-bold text-orange-600">₹{data?.totalAdvances.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3">Total Payments Made</h3>
              <p className="text-3xl font-bold text-green-600">₹{data?.totalPayments.toLocaleString("en-IN")}</p>
            </div>
          </div>

          {data?.recentAttendance && data.recentAttendance.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-700">Attendance for {date}</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {data.recentAttendance.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="font-medium text-sm text-gray-800">{a.staff.name}</p>
                      {a.staff.workSite && (
                        <p className="text-xs text-gray-400">{a.staff.workSite.name}</p>
                      )}
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[a.status] || "bg-gray-100 text-gray-600"}`}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
