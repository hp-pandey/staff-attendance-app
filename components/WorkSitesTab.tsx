"use client";
import { useState } from "react";
import { useApi, api } from "@/hooks/useApi";

interface WorkSite { id: number; name: string; location?: string; _count?: { staff: number } }

export default function WorkSitesTab() {
  const { data: sites, refetch } = useApi<WorkSite[]>("/api/worksites");
  const [form, setForm] = useState({ name: "", location: "" });
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      await api("/api/worksites", "POST", form);
      setForm({ name: "", location: "" });
      refetch();
    } catch (e) { setErr(String(e)); }
  }

  async function remove(id: number) {
    if (!confirm("Delete work site? Staff assigned here will lose their site.")) return;
    await api(`/api/worksites/${id}`, "DELETE");
    refetch();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
        <h3 className="font-semibold text-gray-700">Add Work Site</h3>
        {err && <p className="text-red-500 text-xs">{err}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-full" placeholder="Site Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-full" placeholder="Location (optional)" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-medium text-sm">Add Site</button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {!sites?.length ? (
          <div className="text-center py-16 text-gray-400">No work sites added yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {sites.map((s) => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">🏗️</div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-800">{s.name}</p>
                  {s.location && <p className="text-xs text-gray-400">{s.location}</p>}
                </div>
                <button onClick={() => remove(s.id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-medium">Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
