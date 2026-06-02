"use client";
import { useState } from "react";
import { useApi, api } from "@/hooks/useApi";

interface Staff { id: number; name: string; workSite?: { name: string } | null }
interface AttendanceRecord {
  id: number; staffId: number; date: string; status: string; hours?: number; note?: string;
  staff: Staff;
}

const STATUSES = ["present", "absent", "late", "overtime"];
const STATUS_COLORS: Record<string, string> = {
  present: "bg-green-100 text-green-700 border-green-200",
  absent: "bg-red-100 text-red-700 border-red-200",
  late: "bg-amber-100 text-amber-700 border-amber-200",
  overtime: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function AttendanceTab() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [bulk, setBulk] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);

  const { data: staff } = useApi<Staff[]>("/api/staff");
  const { data: records, refetch } = useApi<AttendanceRecord[]>(`/api/attendance?date=${date}`, [date]);

  const markedMap: Record<number, AttendanceRecord> = {};
  records?.forEach((r) => (markedMap[r.staffId] = r));

  async function saveBulk() {
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(bulk).map(([staffId, status]) =>
          api("/api/attendance", "POST", { staffId: Number(staffId), date, status })
        )
      );
      setBulk({});
      refetch();
    } finally {
      setSaving(false); }
  }

  async function markOne(staffId: number, status: string) {
    await api("/api/attendance", "POST", { staffId, date, status });
    refetch();
  }

  const activeStaff = staff?.filter((s) => (s as Staff & { active: boolean }).active !== false) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">{records?.length ?? 0} marked of {activeStaff.length} staff</p>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setBulk({}); }}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
          />
          {Object.keys(bulk).length > 0 && (
            <button onClick={saveBulk} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium">
              {saving ? "Saving..." : `Save ${Object.keys(bulk).length}`}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {!activeStaff.length ? (
          <div className="text-center py-16 text-gray-400">No active staff. Add staff first.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {activeStaff.map((s) => {
              const current = bulk[s.id] ?? markedMap[s.id]?.status ?? "";
              return (
                <div key={s.id} className="flex items-center gap-4 px-5 py-3 flex-wrap">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-700 text-sm flex-shrink-0">
                    {s.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800">{s.name}</p>
                    {s.workSite && <p className="text-xs text-gray-400">{s.workSite.name}</p>}
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {STATUSES.map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          if (markedMap[s.id]) {
                            markOne(s.id, st);
                          } else {
                            setBulk((b) => ({ ...b, [s.id]: st }));
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all
                          ${current === st
                            ? STATUS_COLORS[st]
                            : "border-gray-200 text-gray-400 hover:border-gray-300"
                          }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
