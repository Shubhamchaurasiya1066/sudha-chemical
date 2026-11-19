"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatQty(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({
    purchaseQty: 0,
    purchaseValue: 0,
    saleQty: 0,
    saleValue: 0,
    remainingQty: 0,
    profit: 0,
  });
  const [ready, setReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/reports');
        
        // ✅ Fix 1: Check if API returns valid JSON
        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType || !contentType.includes("application/json")) {
          throw new Error("Session expire ho gaya hai ya API me error hai. Kripya page refresh karein.");
        }

        const data = await res.json();

        // ✅ Fix 2: Ensure data is always an array
        const purchases = Array.isArray(data.purchases) ? data.purchases : [];
        const sales = Array.isArray(data.sales) ? data.sales : [];

        const itemMap = new Map();

        const getKey = (itemName, unit) =>
          `${String(itemName || "Unknown").trim().toLowerCase()}::${String(unit || "KG").toUpperCase()}`;

        const ensureItem = (itemName, unit) => {
          const key = getKey(itemName, unit);
          if (!itemMap.has(key)) {
            itemMap.set(key, {
              itemName: String(itemName || "Unknown Item").trim(),
              unit: String(unit || "KG").toUpperCase(),
              purchaseQty: 0,
              purchaseValue: 0,
              saleQty: 0,
              saleValue: 0,
            });
          }
          return itemMap.get(key);
        };

        // Process Purchases
        purchases.forEach((order) => {
          if (!order || !order.itemName) return;
          const item = ensureItem(order.itemName, order.qtyUnit);
          const qty = Number(order.qty) || 0;
          const price = Number(order.billingPrice) || Number(order.actualPrice) || 0;

          item.purchaseQty += qty;
          item.purchaseValue += qty * price;
        });

        // Process Sales
        sales.forEach((order) => {
          if (!order || !order.itemName) return;
          if (order.status === "Cancelled") return;

          const item = ensureItem(order.itemName, order.qtyUnit);
          const qty = Number(order.qty) || 0;
          const price = Number(order.rate) || 0;

          item.saleQty += qty;
          item.saleValue += qty * price;
        });

        // Calculate Averages, Remaining & Profit
        const computed = Array.from(itemMap.values()).map((item) => {
          const avgPurchaseRate = item.purchaseQty > 0 ? item.purchaseValue / item.purchaseQty : 0;
          const avgSaleRate = item.saleQty > 0 ? item.saleValue / item.saleQty : 0;
          const remainingQty = item.purchaseQty - item.saleQty;

          const remainingPurchaseValue = item.purchaseValue - (item.saleQty * avgPurchaseRate);
          const remainingAverageCost = remainingQty > 0 ? remainingPurchaseValue / remainingQty : 0;

          const costOfGoodsSold = item.saleQty * avgPurchaseRate;
          const profit = item.saleValue - costOfGoodsSold;

          return {
            ...item,
            avgPurchaseRate,
            avgSaleRate,
            remainingQty,
            remainingAverageCost,
            profit,
          };
        });

        const grand = computed.reduce(
          (acc, item) => ({
            purchaseQty: acc.purchaseQty + item.purchaseQty,
            purchaseValue: acc.purchaseValue + item.purchaseValue,
            saleQty: acc.saleQty + item.saleQty,
            saleValue: acc.saleValue + item.saleValue,
            remainingQty: acc.remainingQty + item.remainingQty,
            profit: acc.profit + item.profit,
          }),
          { purchaseQty: 0, purchaseValue: 0, saleQty: 0, saleValue: 0, remainingQty: 0, profit: 0 }
        );

        setItems(computed);
        setTotals(grand);
      } catch (error) {
        console.error("Failed to load inventory:", error);
        setErrorMsg(error.message || "Data load karne me dikkat aayi.");
      } finally {
        setReady(true);
      }
    }

    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => 
      (item.itemName || "").toLowerCase().includes(q) || 
      (item.unit || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-slate-950 text-white sticky top-0 z-10 shadow-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition">
              S
            </Link>
            <div>
              <p className="text-lg font-bold tracking-wide">Inventory & Stock</p>
              <p className="text-xs text-slate-400">Live Business Data</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/sheet" className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold hover:bg-slate-700 transition">
              📊 Order Book
            </Link>
            <Link href="/purchase-order" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold hover:bg-violet-500 transition">
              + Purchase
            </Link>
            <Link href="/sales-order" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold hover:bg-blue-500 transition">
              + Sale
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Stock & Profit Summary</h1>
          <p className="mt-1 text-sm text-slate-500">Item-wise purchase, sale, remaining stock, and profit overview.</p>
        </div>

        {/* Error Message Display */}
        {errorMsg && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Purchase</p>
            <p className="mt-2 text-2xl font-black text-violet-700">{formatCurrency(totals.purchaseValue)}</p>
            <p className="mt-1 text-xs font-semibold text-slate-400">{formatQty(totals.purchaseQty)} Total Qty</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Sale</p>
            <p className="mt-2 text-2xl font-black text-blue-700">{formatCurrency(totals.saleValue)}</p>
            <p className="mt-1 text-xs font-semibold text-slate-400">{formatQty(totals.saleQty)} Total Qty</p>
          </div>
          <div className={`rounded-2xl border p-5 shadow-sm ${totals.remainingQty >= 0 ? "border-slate-200 bg-white" : "border-red-200 bg-red-50"}`}>
            <p className={`text-xs font-bold uppercase tracking-wider ${totals.remainingQty >= 0 ? "text-slate-500" : "text-red-700"}`}>Remaining Stock</p>
            <p className={`mt-2 text-2xl font-black ${totals.remainingQty >= 0 ? "text-amber-600" : "text-red-700"}`}>{formatQty(totals.remainingQty)}</p>
            <p className="mt-1 text-xs font-semibold text-slate-400">Across all items</p>
          </div>
          <div className={`rounded-2xl border p-5 shadow-sm ${totals.profit >= 0 ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
            <p className={`text-xs font-bold uppercase tracking-wider ${totals.profit >= 0 ? "text-emerald-700" : "text-red-700"}`}>
              {totals.profit >= 0 ? "Estimated Profit" : "Estimated Loss"}
            </p>
            <p className={`mt-2 text-2xl font-black ${totals.profit >= 0 ? "text-emerald-800" : "text-red-800"}`}>
              {formatCurrency(Math.abs(totals.profit))}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Sale - Cost</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search by Item Name or Unit..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 sm:max-w-md shadow-sm"
          />
        </div>

        {/* Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          {!ready ? (
            <div className="p-12 text-center text-sm font-bold text-slate-400 animate-pulse">Loading inventory data...</div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">📦</div>
              <h3 className="mt-5 text-lg font-bold text-slate-700">No inventory data found</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Create purchase orders and sales orders to see the summary here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-4 font-bold">Item Details</th>
                    <th className="px-5 py-4 font-bold text-right bg-violet-50/50">Pur. Qty</th>
                    <th className="px-5 py-4 font-bold text-right bg-violet-50/50">Avg Pur. Rate</th>
                    <th className="px-5 py-4 font-bold text-right bg-violet-50/50">Pur. Value</th>
                    <th className="px-5 py-4 font-bold text-right bg-blue-50/50">Sale Qty</th>
                    <th className="px-5 py-4 font-bold text-right bg-blue-50/50">Avg Sale Rate</th>
                    <th className="px-5 py-4 font-bold text-right bg-blue-50/50">Sale Value</th>
                    <th className="px-5 py-4 font-bold text-right bg-amber-50">Remaining Rate</th>
                    <th className="px-5 py-4 font-bold text-right bg-amber-50">Stock Left</th>
                    <th className="px-5 py-4 font-bold text-right bg-emerald-50/50">Profit/Loss</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800 text-base">{item.itemName}</p>
                        <p className="text-xs font-semibold text-slate-400 mt-0.5">Unit: {item.unit}</p>
                      </td>
                      
                      {/* Purchase Data */}
                      <td className="px-5 py-4 text-right tabular-nums bg-violet-50/30">
                        {formatQty(item.purchaseQty)}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums text-slate-500 bg-violet-50/30">
                        {formatCurrency(item.avgPurchaseRate)}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums font-semibold text-slate-700 bg-violet-50/30">
                        {formatCurrency(item.purchaseValue)}
                      </td>

                      {/* Sale Data */}
                      <td className="px-5 py-4 text-right tabular-nums bg-blue-50/30">
                        {formatQty(item.saleQty)}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums text-slate-500 bg-blue-50/30">
                        {formatCurrency(item.avgSaleRate)}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums font-semibold text-slate-700 bg-blue-50/30">
                        {formatCurrency(item.saleValue)}
                      </td>

                      {/* Remaining Data */}
                      <td className="px-5 py-4 text-right tabular-nums text-amber-600 bg-amber-50/30">
                        {item.remainingQty > 0 ? formatCurrency(item.remainingAverageCost) : "—"}
                      </td>
                      <td className={`px-5 py-4 text-right tabular-nums font-bold text-base bg-amber-50/30 ${item.remainingQty > 0 ? "text-amber-600" : item.remainingQty < 0 ? "text-red-600" : "text-slate-500"}`}>
                        {formatQty(item.remainingQty)}
                      </td>

                      {/* Profit */}
                      <td className={`px-5 py-4 text-right tabular-nums font-bold bg-emerald-50/30 ${item.profit > 0 ? "text-emerald-600" : item.profit < 0 ? "text-red-600" : "text-slate-500"}`}>
                        {formatCurrency(item.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-6 text-center text-xs font-semibold text-slate-400">
          Sudha Chemicals · Inventory Management
        </p>
      </div>
    </main>
  );
}