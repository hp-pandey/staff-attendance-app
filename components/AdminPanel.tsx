"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Stats = {
  users: number;
  staff: number;
  worksites: number;
  attendance: number;
  advances: number;
  payments: number;
  databaseSizeBytes: number | null;
};

type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
  isAllowlistAdmin: boolean;
  counts: {
    staff: number;
    worksites: number;
    attendance: number;
    advances: number;
    payments: number;
  };
};

function formatBytes(n: number | null): string {
  if (n == null) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export default function AdminPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [s, u] = await Promise.all([
        fetch("/api/admin/stats").then((r) => r.json()),
        fetch("/api/admin/users").then((r) => r.json()),
      ]);
      setStats(s);
      setUsers(u);
    } catch {
      setError("Failed to load admin data.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(
    user: AdminUser,
    method: "DELETE" | "PATCH",
    body?: unknown,
    confirmMsg?: string,
  ) {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusy(user.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Action failed.");
      } else {
        await load();
      }
    } finally {
      setBusy(null);
    }
  }

  const statCards: { label: string; value: string | number }[] = stats
    ? [
        { label: "Users", value: stats.users },
        { label: "Staff", value: stats.staff },
        { label: "Work sites", value: stats.worksites },
        { label: "Attendance", value: stats.attendance },
        { label: "Advances", value: stats.advances },
        { label: "Payments", value: stats.payments },
        { label: "Database size", value: formatBytes(stats.databaseSizeBytes) },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-100 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-sm text-gray-500">Manage users, data, and storage</p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            ← Back to app
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-8">
          {statCards.map((c) => (
            <div key={c.label} className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-xs text-gray-400">{c.label}</p>
              <p className="text-lg font-bold text-gray-800 mt-1">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Users */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Users ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="px-5 py-2 font-medium">User</th>
                  <th className="px-3 py-2 font-medium">Role</th>
                  <th className="px-3 py-2 font-medium">Staff</th>
                  <th className="px-3 py-2 font-medium">Sites</th>
                  <th className="px-3 py-2 font-medium">Att.</th>
                  <th className="px-3 py-2 font-medium">Adv.</th>
                  <th className="px-3 py-2 font-medium">Pay.</th>
                  <th className="px-5 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{u.name || "—"}</p>
                      <p className="text-gray-400 text-xs">{u.email}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {u.role}
                        {u.isAllowlistAdmin && " 🔒"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-700">{u.counts.staff}</td>
                    <td className="px-3 py-3 text-gray-700">{u.counts.worksites}</td>
                    <td className="px-3 py-3 text-gray-700">{u.counts.attendance}</td>
                    <td className="px-3 py-3 text-gray-700">{u.counts.advances}</td>
                    <td className="px-3 py-3 text-gray-700">{u.counts.payments}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 justify-end flex-wrap">
                        {!u.isAllowlistAdmin && (
                          <button
                            disabled={busy === u.id}
                            onClick={() =>
                              act(u, "PATCH", {
                                action: "setRole",
                                role: u.role === "admin" ? "user" : "admin",
                              })
                            }
                            className="px-2.5 py-1 rounded-lg text-xs font-medium text-blue-700 hover:bg-blue-50"
                          >
                            {u.role === "admin" ? "Demote" : "Make admin"}
                          </button>
                        )}
                        <button
                          disabled={busy === u.id}
                          onClick={() =>
                            act(
                              u,
                              "PATCH",
                              { action: "wipe" },
                              `Wipe ALL data for ${u.email}? Their account stays, but staff, attendance, advances, payments and work sites will be deleted.`,
                            )
                          }
                          className="px-2.5 py-1 rounded-lg text-xs font-medium text-amber-700 hover:bg-amber-50"
                        >
                          Wipe data
                        </button>
                        {!u.isAllowlistAdmin && (
                          <button
                            disabled={busy === u.id}
                            onClick={() =>
                              act(
                                u,
                                "DELETE",
                                undefined,
                                `Delete ${u.email} and ALL of their data permanently? This cannot be undone.`,
                              )
                            }
                            className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          🔒 = admin enforced by <code>ADMIN_EMAILS</code> (cannot be demoted or deleted here).
        </p>
      </div>
    </div>
  );
}
