"use client";
import { useState } from "react";
import { useApi, api } from "@/hooks/useApi";

interface WorkSite { id: number; name: string }
interface Staff {
  id: number; name: string; role?: string; phone?: string; active: boolean;
  workSite?: WorkSite | null;
}

export default function StaffTab() {
  const { data: staff, refetch } = useApi<Staff[]>("/api/staff");
  const { data: sites } = useApi<WorkSite[]>("/api/worksites");
  const [form, setForm] = useState({ name: "", role: "", phone: "", workSiteId: "" });
  const [editing, setEditing] = useState<Staff | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      if (editing) {
        await api(`/api/staff/${editing.id}`, "PATCH", {
          ...form,
          workSiteId: form.workSiteId ? Number(form.workSiteId) : null,
        });
        setEditing(null);
      } else {
        await api("/api/staff", "POST", {
          ...form,
          workSiteId: form.workSiteId ? Number(form.workSiteId) : null,
        });
      }
      setForm({ name: "", role: "", phone: "", workSiteId: "" });
      setShowForm(false);
      refetch();
    } catch (e) { setErr(String(e)); }
  }

  function startEdit(s: Staff) {
    setEditing(s);
    setForm({ name: s.name, role: s.role || "", phone: s.phone || "", workSiteId: s.workSite?.id.toString() || "" });
    setShowForm(true);
  }

  async function toggleActive(s: Staff) {
    await api(`/api/staff/${s.id}`, "PATCH", { active: !s.active });
    refetch();
  }

  async function remove(id: number) {
    if (!confirm("Delete this staff member?")) return;
    await api(`/api/staff/${id}`, "DELETE");
    refetch();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{staff?.length ?? 0} staff members</p>
        <button
          onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: "", role: "", phone: "", workSiteId: "" }); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition-all"
        >
          {showForm ? "Cancel" : "+ Add Staff"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
          <h3 className="font-semibold text-gray-700">{editing ? "Edit Staff" : "New Staff"}</h3>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input required className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-full" placeholder="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-full" placeholder="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
            <input className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-full" placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-full" value={form.workSiteId} onChange={e => setForm(f => ({ ...f, workSiteId: e.target.value }))}>
              <option value="">No work site</option>
              {sites?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-medium text-sm">
            {editing ? "Save Changes" : "Add Staff"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {!staff?.length ? (
          <div className="text-center py-16 text-gray-400">No staff added yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {staff.map((s) => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-700 text-sm flex-shrink-0">
                  {s.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-800 text-sm">{s.name}</p>
                    {!s.active && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Inactive</span>}
                  </div>
                  <p className="text-xs text-gray-400">
                    {s.role || "—"} {s.workSite ? `· ${s.workSite.name}` : ""} {s.phone ? `· ${s.phone}` : ""}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => startEdit(s)} className="text-xs border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-gray-600 font-medium">Edit</button>
                  <button onClick={() => toggleActive(s)} className="text-xs border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-gray-600 font-medium">
                    {s.active ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => remove(s.id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-medium">Del</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
