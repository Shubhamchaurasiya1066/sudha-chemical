"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const modules = [
  { title: "Transporters", desc: "Manage transport & vehicles", href: "/transporters", icon: "🚚", color: "from-blue-500 to-cyan-400" },
  { title: "Freight List", desc: "Freight rates & routes", href: "/freight-list", icon: "🏭", color: "from-emerald-500 to-teal-400" },
  { title: "Customers", desc: "Customer directory", href: "/customers", icon: "👥", color: "from-violet-500 to-purple-400" },
  { title: "Purchases", desc: "Company purchase orders", href: "/purchase-orders", icon: "🛒", color: "from-amber-500 to-orange-400" },
  { title: "Sales", desc: "Customer sales orders", href: "/sales-orders", icon: "💰", color: "from-pink-500 to-rose-400" },
  { title: "Company Purchases", desc: "Company-wise purchase analytics", href: "/company-purchases", icon: "🏢", color: "from-cyan-500 to-blue-400" },
  { title: "Company Sales", desc: "Company-wise sales analytics", href: "/company-sales", icon: "🏢", color: "from-teal-500 to-emerald-400" }, // ✅ Added
  { title: "Dispatch", desc: "Delivery & PDF challans", href: "/dispatch-order", icon: "📦", color: "from-indigo-500 to-blue-400" },
  { title: "Order Book", desc: "Profit/Loss dashboard", href: "/sheet", icon: "📊", color: "from-rose-500 to-red-400" },
  { title: "Inventory", desc: "Live stock & alerts", href: "/inventory", icon: "📦", color: "from-orange-500 to-amber-400" },
  { title: "Users", desc: "Manage staff access", href: "/users", icon: "👥", color: "from-fuchsia-500 to-pink-400" },
  {
    title: "Employee Profile",
    desc: "Manage employee details & records",
    href: "/employee-profile",
    icon: "👨‍💼",
    color: "from-sky-500 to-blue-600"
  },
  {
    title: "Salary Slip",
    desc: "Generate & manage employee salary slips",
    href: "/salary-slip",
    icon: "💳",
    color: "from-emerald-500 to-green-600"
  },
];

function formatCurrency(v) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(v) || 0);
}

export default function Home() {
  const router = useRouter();

  // ✅ States for dynamic values
  const [year, setYear] = useState(null);
  const [currentDate, setCurrentDate] = useState("");

  const [stats, setStats] = useState({ purchase: 0, sale: 0, profit: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Fix: Date calculation inside useEffect
    setYear(new Date().getFullYear());
    setCurrentDate(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));


    async function fetchData() {
      try {
        setLoading(true);

        const res = await fetch("/api/dashboard-summary", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Dashboard API error: ${res.status}`);
        }

        const data = await res.json();

        setStats({
          purchase: Number(data.purchase) || 0,
          sale: Number(data.sale) || 0,
          profit: Number(data.profit) || 0,
        });
      } catch (error) {
        console.error("Dashboard loading failed:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error", error);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans selection:bg-blue-500/30">

      {/* PREMIUM HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B1120]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl font-black text-white shadow-lg shadow-blue-500/30">
              S
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">SUDHA CHEMICALS</h1>
              <p className="text-xs font-medium text-slate-400">Business Intelligence</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* WELCOME SECTION */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Overview Dashboard</h2>
            <p className="mt-1 text-sm text-slate-400">Here is what's happening with your business today.</p>
          </div>
          <div className="flex gap-2 text-sm font-medium text-slate-400 bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
            <span>📅</span> {currentDate || "Loading date..."}
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-violet-500/20 blur-2xl"></div>
            <p className="text-sm font-medium text-slate-400">Total Purchases</p>
            <h3 className="mt-2 text-4xl font-black text-white">{loading ? "..." : formatCurrency(stats.purchase)}</h3>
            <div className="mt-4 flex items-center text-sm font-semibold text-violet-400">
              <span className="bg-violet-500/20 px-2 py-1 rounded-md">Outflow</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl"></div>
            <p className="text-sm font-medium text-slate-400">Total Sales Revenue</p>
            <h3 className="mt-2 text-4xl font-black text-white">{loading ? "..." : formatCurrency(stats.sale)}</h3>
            <div className="mt-4 flex items-center text-sm font-semibold text-blue-400">
              <span className="bg-blue-500/20 px-2 py-1 rounded-md">Inflow</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-emerald-500/20 blur-2xl"></div>
            <p className="text-sm font-medium text-slate-400">Gross Profit</p>
            <h3 className={`mt-2 text-4xl font-black ${stats.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {loading ? "..." : formatCurrency(stats.profit)}
            </h3>
            <div className="mt-4 flex items-center text-sm font-semibold text-emerald-400">
              <span className="bg-emerald-500/20 px-2 py-1 rounded-md">Net Margin</span>
            </div>
          </div>
        </div>

        {/* CHART SECTION */}
        <div className="mb-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Financial Overview</h3>
            <div className="flex gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-violet-500"></span> Purchase</div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-500"></span> Sale</div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="flex h-full items-center justify-center text-slate-400">Loading analytics...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: '#1e293b' }}
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="purchase" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="sale" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* MODULES GRID */}
        <h3 className="mb-6 text-xl font-bold text-white">Quick Access</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {modules.map((mod) => (
            <Link
              key={mod.title}
              href={mod.href}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${mod.color} text-2xl shadow-lg`}>
                  {mod.icon}
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-base font-bold text-slate-100 group-hover:text-white">{mod.title}</h4>
                <p className="mt-1 text-xs text-slate-400">{mod.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
