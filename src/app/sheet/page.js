"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

// Helper Functions
function formatCurrency(v) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(v) || 0);
}
function formatNum(v) {
  return Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

// ✅ Reliable Date Formatter
function formatDate(dateStr) {
  if (!dateStr) return "";
  const str = String(dateStr).trim();
  
  const ymd = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) return `${ymd[3]}/${ymd[2]}/${ymd[1]}`;
  
  const dmy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmy) return `${dmy[1].padStart(2, '0')}/${dmy[2].padStart(2, '0')}/${dmy[3]}`;

  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (e) {}

  return str.split(/[ ,]+/)[0];
}

function isDateInRange(dateStr, from, to) {
  if (!dateStr) return true;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;
  
  if (from) {
    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    if (d < fromDate) return false;
  }
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    if (d > toDate) return false;
  }
  return true;
}

export default function SheetPage() {
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [ready, setReady] = useState(false);
  const [openGroups, setOpenGroups] = useState({});

  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/reports');
        const data = await res.json();
        setPurchases(data.purchases || []);
        setSales(data.sales || []);
      } catch (err) {
        console.error(err);
      } finally {
        setReady(true);
      }
    }
    fetchData();
  }, []);

  const companyList = useMemo(() => {
    const set = new Set();
    purchases.forEach(p => { if (p.manufacturerName) set.add(p.manufacturerName); });
    sales.forEach(s => { if (s.manufacturerName) set.add(s.manufacturerName); });
    return Array.from(set).sort();
  }, [purchases, sales]);

  const filteredPurchases = useMemo(() => {
    const q = search.trim().toLowerCase();
    return purchases.filter(p => {
      const matchSearch = !q || 
        (p.manufacturerName || "").toLowerCase().includes(q) ||
        (p.place || "").toLowerCase().includes(q) ||
        (p.purchaseOrderNumber || "").toLowerCase().includes(q) ||
        (p.itemName || "").toLowerCase().includes(q);
      
      const matchCompany = !companyFilter || p.manufacturerName === companyFilter;
      const matchDate = isDateInRange(p.orderDate, fromDate, toDate);
      
      return matchSearch && matchCompany && matchDate;
    });
  }, [purchases, search, companyFilter, fromDate, toDate]);

  const filteredSales = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sales.filter(s => {
      const matchSearch = !q || 
        (s.manufacturerName || "").toLowerCase().includes(q) ||
        (s.place || "").toLowerCase().includes(q) ||
        (s.orderNumber || "").toLowerCase().includes(q) ||
        (s.customerName || "").toLowerCase().includes(q) ||
        (s.brokerName || "").toLowerCase().includes(q) ||
        (s.itemName || "").toLowerCase().includes(q);
      
      const matchCompany = !companyFilter || s.manufacturerName === companyFilter;
      const matchDate = isDateInRange(s.orderDate, fromDate, toDate);
      
      return matchSearch && matchCompany && matchDate;
    });
  }, [sales, search, companyFilter, fromDate, toDate]);

  const excelGroups = useMemo(() => {
    const map = new Map();

    // ✅ NAYA: Group key me Product aur Unit bhi add kiya
    const getGroup = (m, p, item, unit) => {
      const key = `${m || "Unknown"}::${p || "No Place"}::${item || "Unknown Item"}::${unit || "KG"}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          manufacturer: m || "Unknown Company",
          place: p || "",
          itemName: item || "Unknown Product",
          unit: unit || "KG",
          purchases: [],
          sales: [],
          totalPurchaseQty: 0, totalPurchaseValue: 0,
          totalSaleQty: 0, totalSaleValue: 0,
        });
      }
      return map.get(key);
    };

    filteredPurchases.forEach(item => {
      const group = getGroup(item.manufacturerName, item.place, item.itemName, item.qtyUnit);
      const qty = Number(item.qty) || 0;
      const rate = Number(item.billingPrice) || Number(item.actualPrice) || 0;
      const total = qty * rate;
      
      group.purchases.push({ ...item, calcRate: rate, calcTotal: total });
      group.totalPurchaseQty += qty;
      group.totalPurchaseValue += total;
    });

    filteredSales.forEach(item => {
      const group = getGroup(item.manufacturerName, item.place, item.itemName, item.qtyUnit);
      const qty = Number(item.qty) || 0;
      const rate = Number(item.rate) || 0;
      const total = qty * rate;

      group.sales.push({ ...item, calcRate: rate, calcTotal: total });
      group.totalSaleQty += qty;
      group.totalSaleValue += total;
    });

    return Array.from(map.values()).sort((a, b) => {
      // Pehle manufacturer se sort karo
      if (a.manufacturer !== b.manufacturer) {
        return a.manufacturer.localeCompare(b.manufacturer);
      }
      // Phir item name se sort karo
      return a.itemName.localeCompare(b.itemName);
    });
  }, [filteredPurchases, filteredSales]);

  const toggleGroup = (key) => setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));

  function resetFilters() {
    setSearch("");
    setCompanyFilter("");
    setFromDate("");
    setToDate("");
  }

  // --- CSV HELPERS ---
  function generateCSV(rows) {
    const escapeCSV = (val) => {
      const str = String(val ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    const csv = rows.map(row => row.map(escapeCSV).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    return url;
  }

  function downloadCSV(url, filename) {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function getGroupCSVRows(group, isGlobalExport = false) {
    const rows = [];
    
    if (isGlobalExport) {
      rows.push([`${group.manufacturer} ${group.place ? `- ${group.place}` : ""} (${group.itemName} - ${group.unit})`]);
    }
    rows.push(["PURCHASE", "", "", "", "", "", "SALE", "", "", "", "", ""]);
    rows.push(["DATE", "PO NO", "QTY", "BASIC", "TOTAL", "", "DATE", "SALE NO", "CUSTOMER", "QTY", "BASIC", "TOTAL", "BROKER"]);

    const maxLen = Math.max(group.purchases.length, group.sales.length);
    for (let i = 0; i < maxLen; i++) {
      const p = group.purchases[i];
      const s = group.sales[i];
      
      rows.push([
        formatDate(p?.orderDate),
        p?.purchaseOrderNumber || "",
        p?.qty ? Number(p.qty) : "",
        p?.calcRate ? Number(p.calcRate) : "",
        p?.calcTotal ? Number(p.calcTotal) : "",
        "", 
        formatDate(s?.orderDate),
        s?.orderNumber || "",
        s?.customerName || "",
        s?.qty ? Number(s.qty) : "",
        s?.calcRate ? Number(s.calcRate) : "",
        s?.calcTotal ? Number(s.calcTotal) : "",
        s?.brokerName || ""
      ]);
    }

    const avgPurchaseRate = group.totalPurchaseQty > 0 ? group.totalPurchaseValue / group.totalPurchaseQty : 0;
    const avgSaleRate = group.totalSaleQty > 0 ? group.totalSaleValue / group.totalSaleQty : 0;
    const balanceQty = group.totalPurchaseQty - group.totalSaleQty;
    const profit = group.totalSaleValue - (group.totalSaleQty * avgPurchaseRate);

    rows.push([]); 
    rows.push([
      "TOTAL QTY:", "", group.totalPurchaseQty, `AVG: ${avgPurchaseRate.toFixed(2)}`, group.totalPurchaseValue, "",
      "TOTAL QTY:", "", "", group.totalSaleQty, `AVG: ${avgSaleRate.toFixed(2)}`, group.totalSaleValue, ""
    ]);
    rows.push([
      "BALANCE QTY:", "", balanceQty, "", "", "",
      "PROFIT/LOSS:", "", "", "", "", profit.toFixed(2), ""
    ]);

    if (isGlobalExport) {
      rows.push([]);
      rows.push([]);
    }
    return rows;
  }

  function exportGlobalCSV() {
    let allRows = [];
    excelGroups.forEach(group => {
      allRows = allRows.concat(getGroupCSVRows(group, true));
    });
    const url = generateCSV(allRows);
    downloadCSV(url, `Full-Order-Book-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  function exportGroupCSV(group) {
    const rows = getGroupCSVRows(group, false);
    const safeName = `${group.manufacturer.replace(/[^a-z0-9]/gi, '_')}${group.place ? `-${group.place.replace(/[^a-z0-9]/gi, '_')}` : ''}-${group.itemName.replace(/[^a-z0-9]/gi, '_')}`;
    const url = generateCSV(rows);
    downloadCSV(url, `${safeName}-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-slate-950 text-white p-5">
        <div className="max-w-[1500px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-lg font-bold">SUDHA CHEMICALS · Order Book</h1>
          <div className="flex gap-3">
            <button onClick={exportGlobalCSV} disabled={excelGroups.length === 0} className="bg-emerald-600 px-5 py-2 rounded-xl text-sm font-bold hover:bg-emerald-500 disabled:opacity-50">
              Export All Data ↓
            </button>
            <Link href="/inventory" className="bg-slate-800 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-700">
              Inventory
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-[1500px] mx-auto p-4 space-y-6">
        
        <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search Manufacturer, Place, Product, PO, Customer..." 
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-500" 
            />
            <select 
              value={companyFilter} 
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-500"
            >
              <option value="">All Manufacturers</option>
              {companyList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex gap-2 lg:col-span-2">
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500" title="From Date" />
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500" title="To Date" />
              <button onClick={resetFilters} className="whitespace-nowrap rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                Reset
              </button>
            </div>
          </div>
        </section>

        {!ready ? (
          <p className="text-center p-10 font-bold text-slate-500">Loading Data...</p>
        ) : excelGroups.length === 0 ? (
          <div className="bg-white p-12 rounded-xl text-center shadow-sm">
            <p className="text-lg font-bold text-slate-700">No records found</p>
            <p className="text-sm text-slate-500 mt-2">Try changing the filters or add new purchase/sale orders.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {excelGroups.map(group => {
              const isOpen = openGroups[group.key] !== false;
              const balanceQty = group.totalPurchaseQty - group.totalSaleQty;
              const avgPurchaseRate = group.totalPurchaseQty > 0 ? group.totalPurchaseValue / group.totalPurchaseQty : 0;
              const avgSaleRate = group.totalSaleQty > 0 ? group.totalSaleValue / group.totalSaleQty : 0;
              
              const profit = group.totalSaleValue - (group.totalSaleQty * avgPurchaseRate);

              return (
                <div key={group.key} className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-300">
                  <div className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border-b border-slate-200 transition">
                    <div onClick={() => toggleGroup(group.key)} className="flex items-center gap-4 cursor-pointer flex-1 text-left">
                      <span className="bg-slate-800 text-white w-10 h-10 flex items-center justify-center rounded-lg font-black shrink-0">
                        {group.manufacturer.charAt(0)}
                      </span>
                      <div>
                        {/* ✅ NAYA: Header me Product aur Unit add kiya */}
                        <h2 className="text-lg font-black text-slate-800 flex flex-wrap items-center gap-2">
                          {group.manufacturer} {group.place ? `- ${group.place}` : ""}
                          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-md border border-blue-200 shadow-sm">
                            {group.itemName} ({group.unit})
                          </span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                          {group.purchases.length} Purchase Orders · {group.sales.length} Sale Orders · Balance: <strong className={balanceQty < 0 ? "text-red-600" : "text-emerald-600"}>{formatNum(balanceQty)} {group.unit}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          exportGroupCSV(group); 
                        }}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition shadow-sm hidden sm:block"
                      >
                        Export CSV ↓
                      </button>
                      <span onClick={() => toggleGroup(group.key)} className="text-2xl text-slate-400 cursor-pointer px-2">
                        {isOpen ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="overflow-x-auto">
                      <div className="p-3 bg-white border-b border-slate-200 sm:hidden">
                         <button onClick={() => exportGroupCSV(group)} className="w-full rounded-lg bg-slate-100 py-2 text-xs font-bold text-slate-700">
                           Export {group.manufacturer} Data ↓
                         </button>
                      </div>

                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="bg-slate-100 text-xs uppercase text-slate-600 border-b border-slate-300">
                            <th colSpan={5} className="px-4 py-2 text-center border-r-4 border-slate-300 bg-violet-50 text-violet-800">PURCHASE (Kharida)</th>
                            <th colSpan={7} className="px-4 py-2 text-center bg-blue-50 text-blue-800">SALE (Becha)</th>
                          </tr>
                          <tr className="bg-white text-[11px] font-bold text-slate-500 border-b border-slate-300 uppercase">
                            <th className="px-3 py-2 border-r border-slate-200">DATE</th>
                            <th className="px-3 py-2 border-r border-slate-200">PO NO</th>
                            <th className="px-3 py-2 border-r border-slate-200 text-right">QTY ({group.unit})</th>
                            <th className="px-3 py-2 border-r border-slate-200 text-right">BASIC</th>
                            <th className="px-3 py-2 border-r-4 border-slate-300 text-right">TOTAL</th>

                            <th className="px-3 py-2 border-r border-slate-200">DATE</th>
                            <th className="px-3 py-2 border-r border-slate-200">SALE NO</th>
                            <th className="px-3 py-2 border-r border-slate-200">CUSTOMER</th>
                            <th className="px-3 py-2 border-r border-slate-200 text-right">QTY ({group.unit})</th>
                            <th className="px-3 py-2 border-r border-slate-200 text-right">BASIC</th>
                            <th className="px-3 py-2 border-r border-slate-200 text-right">TOTAL</th>
                            <th className="px-3 py-2">BROKER</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {Array.from({ length: Math.max(group.purchases.length, group.sales.length) }).map((_, idx) => {
                            const p = group.purchases[idx];
                            const s = group.sales[idx];
                            return (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="px-3 py-2 border-r border-slate-100 text-slate-500 whitespace-nowrap">{formatDate(p?.orderDate)}</td>
                                <td className="px-3 py-2 border-r border-slate-100 font-semibold text-violet-700">{p?.purchaseOrderNumber || ""}</td>
                                <td className="px-3 py-2 border-r border-slate-100 text-right tabular-nums">{p?.qty ? formatNum(p.qty) : ""}</td>
                                <td className="px-3 py-2 border-r border-slate-100 text-right tabular-nums">{p?.calcRate ? formatNum(p.calcRate) : ""}</td>
                                <td className="px-3 py-2 border-r-4 border-slate-300 text-right font-semibold tabular-nums">{p?.calcTotal ? formatNum(p.calcTotal) : ""}</td>

                                <td className="px-3 py-2 border-r border-slate-100 text-slate-500 whitespace-nowrap">{formatDate(s?.orderDate)}</td>
                                <td className="px-3 py-2 border-r border-slate-100 font-semibold text-blue-700">{s?.orderNumber || ""}</td>
                                <td className="px-3 py-2 border-r border-slate-100">{s?.customerName || ""}</td>
                                <td className="px-3 py-2 border-r border-slate-100 text-right tabular-nums">{s?.qty ? formatNum(s.qty) : ""}</td>
                                <td className="px-3 py-2 border-r border-slate-100 text-right tabular-nums">{s?.calcRate ? formatNum(s.calcRate) : ""}</td>
                                <td className="px-3 py-2 border-r border-slate-100 text-right font-semibold tabular-nums">{s?.calcTotal ? formatNum(s.calcTotal) : ""}</td>
                                <td className="px-3 py-2 text-xs">{s?.brokerName || ""}</td>
                              </tr>
                            );
                          })}
                        </tbody>

                        <tfoot className="bg-slate-100 border-t-2 border-slate-400 font-bold text-xs">
                          <tr>
                            <td colSpan={2} className="px-3 py-2 border-r border-slate-300 text-right uppercase text-slate-500">TOTAL QTY:</td>
                            <td className="px-3 py-2 border-r border-slate-300 text-right text-violet-800 tabular-nums">{formatNum(group.totalPurchaseQty)} {group.unit}</td>
                            <td className="px-3 py-2 border-r border-slate-300 text-right text-violet-800 tabular-nums" title="Average Purchase Rate">AVG: {formatNum(avgPurchaseRate)}</td>
                            <td className="px-3 py-2 border-r-4 border-slate-300 text-right text-violet-800 tabular-nums">{formatNum(group.totalPurchaseValue)}</td>

                            <td colSpan={2} className="px-3 py-2 border-r border-slate-300 text-right uppercase text-slate-500">TOTAL QTY:</td>
                            <td className="px-3 py-2 border-r border-slate-300"></td>
                            <td className="px-3 py-2 border-r border-slate-300 text-right text-blue-800 tabular-nums">{formatNum(group.totalSaleQty)} {group.unit}</td>
                            <td className="px-3 py-2 border-r border-slate-300 text-right text-blue-800 tabular-nums" title="Average Sale Rate">AVG: {formatNum(avgSaleRate)}</td>
                            <td className="px-3 py-2 border-r border-slate-300 text-right text-blue-800 tabular-nums">{formatNum(group.totalSaleValue)}</td>
                            <td className="px-3 py-2"></td>
                          </tr>
                          
                          <tr className="bg-slate-800 text-white text-sm">
                            <td colSpan={3} className="px-3 py-3 text-right uppercase tracking-wider text-slate-300">BALANCE QTY:</td>
                            <td colSpan={2} className="px-3 py-3 border-r-4 border-slate-600 text-left text-lg text-amber-400">
                              {formatNum(balanceQty)} {group.unit}
                            </td>
                            <td colSpan={4} className="px-3 py-3 text-right uppercase tracking-wider text-slate-300">PROFIT / LOSS:</td>
                            <td colSpan={3} className={`px-3 py-3 text-left text-lg font-black ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {profit >= 0 ? "+" : ""}{formatCurrency(profit)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}