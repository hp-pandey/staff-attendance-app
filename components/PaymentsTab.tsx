"use client";
import { useState } from "react";
import { useApi, api } from "@/hooks/useApi";

interface Staff { id: number; name: string }
interface Payment { id: number; amount: number; date: string; note?: string; staff: Staff }

export default function PaymentsTab() {
  const { data: payments, refetch } = useApi<Payment[]>("/api/payments");
  const { data: staff } = useApi<Staff[]>("/api/staff");
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({ staffId: "", amount: "", date: today, note: "" });
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      await api("/api/payments", "POST", form);
      setForm({ staffId: "", amount: "", date: today, note: "" });
      refetch();
    } catch (e) { setErr(String(e)); }
  }

  async function remove(id: number) {
    if (!confirm("Delete this payment?")) return;
    await api(`/api/payments/${id}`, "DELETE");
    refetch();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
        <h3 className="font-semibold text-gray-700">Record Payment</h3>
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
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-medium text-sm">Record Payment</button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700">Payment History</h3>
          <p className="text-sm text-gray-400">
            Total: ₹{(payments?.reduce((s, p) => s + p.amount, 0) ?? 0).toLocaleString("en-IN")}
          </p>
        </div>
        {!payments?.length ? (
          <div className="text-center py-12 text-gray-400">No payments recorded</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-800">{p.staff.name}</p>
                  <p className="text-xs text-gray-400">{p.date}{p.note ? ` · ${p.note}` : ""}</p>
                </div>
                <span className="font-semibold text-green-600 text-sm">₹{p.amount.toLocaleString("en-IN")}</span>
                <button onClick={() => remove(p.id)} className="text-xs text-red-500 hover:text-red-700 ml-2">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
