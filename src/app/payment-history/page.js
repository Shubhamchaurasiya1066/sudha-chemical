"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function formatCurrency(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

export default function PaymentHistoryPage() {
  const [advices, setAdvices] = useState([]);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");

  // ✅ 1. Database se fetch karo
  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      setReady(false);
      const res = await fetch('/api/payment-advices');
      const data = await res.json();
      if (data.advices) {
        setAdvices(data.advices);
      }
    } catch {
      setAdvices([]);
    } finally {
      setReady(true);
    }
  }

  // ✅ 2. Database se delete karo
  async function handleDelete(id) {
    if (!window.confirm("Delete this payment advice?")) return;
    try {
      const res = await fetch(`/api/payment-advices?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAdvices(advices.filter((a) => a.id !== id));
      } else {
        alert("Failed to delete from database.");
      }
    } catch {
      alert("Server connection error.");
    }
  }

  const filtered = advices.filter((a) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      String(a.party_name || "").toLowerCase().includes(q) ||
      String(a.advice_number || "").toLowerCase().includes(q) ||
      String(a.transaction_ref || "").toLowerCase().includes(q)
    );
  });

  const totalPaid = advices.reduce((s, a) => s + (Number(a.total_amount) || 0), 0);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-black">S</div>
            <div>
              <p className="text-lg font-bold tracking-wide">SUDHA CHEMICALS</p>
              <p className="text-xs text-slate-400">Payment History</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/payment-advice" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-500">+ New Payment Advice</Link>
            <Link href="/dashboard" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold hover:bg-slate-900">Home</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight">Payment History</h1>
          <p className="mt-2 text-sm text-slate-500">All recorded payment advices.</p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Advices</p>
            <p className="mt-2 text-2xl font-black text-slate-800">{advices.length}</p>
          </div>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-red-700">Total Paid</p>
            <p className="mt-2 text-2xl font-black text-red-800">{formatCurrency(totalPaid)}</p>
          </div>
        </div>

        <div className="mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search by party, advice no, or reference..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 sm:max-w-md"
          />
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          {!ready ? (
            <div className="p-12 text-center text-slate-500">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-3xl">💳</div>
              <p className="mt-3 font-bold">No payment advices yet</p>
              <p className="mt-1 text-sm text-slate-500">Create your first payment advice to see it here.</p>
              <Link href="/payment-advice" className="mt-4 inline-block rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-800">+ New Payment Advice</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-bold">Advice No / Date</th>
                    <th className="px-5 py-4 font-bold">Supplier Name</th>
                    <th className="px-5 py-4 font-bold">Payment Mode</th>
                    <th className="px-5 py-4 font-bold">Bank</th>
                    <th className="px-5 py-4 font-bold">Ref No.</th>
                    <th className="px-5 py-4 font-bold text-right">Total Amount</th>
                    <th className="px-5 py-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        {/* ✅ Database me columns snake_case me hain (advice_number) */}
                        <p className="font-bold text-blue-700">{a.advice_number}</p>
                        <p className="text-xs text-slate-400">
                          {a.advice_date ? a.advice_date.split("T")[0].split("-").reverse().join("/") : "-"}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-semibold">{a.party_name || "-"}</td>
                      <td className="px-5 py-4">{a.payment_mode || "-"}</td>
                      <td className="px-5 py-4">{a.bank_name || "-"}</td>
                      <td className="px-5 py-4 font-mono text-xs">{a.transaction_ref || "-"}</td>
                      <td className="px-5 py-4 text-right font-bold">{formatCurrency(a.total_amount)}</td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
