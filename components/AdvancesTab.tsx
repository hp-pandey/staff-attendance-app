"use client";
import { useState } from "react";
import { useApi, api } from "@/hooks/useApi";

interface Staff { id: number; name: string }
interface Advance { id: number; amount: number; date: string; note?: string; repaid: boolean; staff: Staff }

export default function AdvancesTab() {
  const { data: advances, refetch } = useApi<Advance[]>("/api/advances");
  const { data: staff } = useApi<Staff[]>("/api/staff");
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({ staffId: "", amount: "", date: today, note: "" });
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "repaid">("all");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      await api("/api/advances", "POST", form);
      setForm({ staffId: "", amount: "", date: today, note: "" });
      refetch();
    } catch (e) { setErr(String(e)); }
  }

  async function toggleRepaid(a: Advance) {
    await api(`/api/advances/${a.id}`, "PATCH", { repaid: !a.repaid });
    refetch();
  }

  async function remove(id: number) {
    if (!confirm("Delete advance?")) return;
    await api(`/api/advances/${id}`, "DELETE");
    refetch();
  }

  const filtered = advances?.filter((a) => {
    if (filter === "pending") return !a.repaid;
    if (filter === "repaid") return a.repaid;
    return true;
  });

  const totalPending = advances?.filter(a => !a.repaid).reduce((s, a) => s + a.amount, 0) ?? 0;

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
        <h3 className="font-semibold text-gray-700">Give Advance</h3>
        {err && <p className="text-red-500 text-xs">{err}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select required className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-full" value={form.staffId} onChange={e => setForm(f => ({ ...f, staffId: e.target.value }))}>
            <option value="">Select Staff *</option>
            {staff?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input required type="number" min="1" className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-full" placeholder="Amount (₹) *" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
          <input required type="date" className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-full" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <input className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-full" placeholder="Note" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
        </div>
        <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl font-medium text-sm">Record Advance</button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-2">
            {(["all", "pending", "repaid"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-sm text-amber-600 font-medium">Pending: ₹{totalPending.toLocaleString("en-IN")}</p>
        </div>
        {!filtered?.length ? (
          <div className="text-center py-12 text-gray-400">No advances found</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((a) => (
              <div key={a.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-800">{a.staff.name}</p>
                  <p className="text-xs text-gray-400">{a.date}{a.note ? ` · ${a.note}` : ""}</p>
                </div>
                <span className="font-semibold text-amber-600 text-sm">₹{a.amount.toLocaleString("en-IN")}</span>
                <button
                  onClick={() => toggleRepaid(a)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${a.repaid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                >
                  {a.repaid ? "Repaid" : "Pending"}
                </button>
                <button onClick={() => remove(a.id)} className="text-xs text-red-500 hover:text-red-700">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
