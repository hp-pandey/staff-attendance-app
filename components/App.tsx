"use client";
import { useState } from "react";
import Dashboard from "./Dashboard";
import StaffTab from "./StaffTab";
import AttendanceTab from "./AttendanceTab";
import PaymentsTab from "./PaymentsTab";
import AdvancesTab from "./AdvancesTab";
import WorkSitesTab from "./WorkSitesTab";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "staff", label: "Staff", icon: "👥" },
  { id: "attendance", label: "Attendance", icon: "📅" },
  { id: "payments", label: "Payments", icon: "💵" },
  { id: "advances", label: "Advances", icon: "💰" },
  { id: "worksites", label: "Work Sites", icon: "🏗️" },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 flex-shrink-0 flex flex-col
          bg-gradient-to-b from-blue-800 to-blue-950 text-white
          transform transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
              🏢
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Staff Manager</p>
              <p className="text-white/60 text-xs">Attendance & Payroll</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSidebarOpen(false); }}
              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                ${tab === t.id
                  ? "bg-white/20 text-white shadow"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
            >
              <span className="text-lg">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 text-xs text-white/40 text-center">
          v1.0 · SQLite backed
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <h1 className="font-semibold text-gray-800 capitalize">
            {TABS.find((t) => t.id === tab)?.icon}{" "}
            {TABS.find((t) => t.id === tab)?.label}
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {tab === "dashboard" && <Dashboard />}
          {tab === "staff" && <StaffTab />}
          {tab === "attendance" && <AttendanceTab />}
          {tab === "payments" && <PaymentsTab />}
          {tab === "advances" && <AdvancesTab />}
          {tab === "worksites" && <WorkSitesTab />}
        </main>
      </div>
    </div>
  );
}
