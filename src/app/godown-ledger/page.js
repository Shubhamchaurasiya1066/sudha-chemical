"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "sudha_godown_ledger";

const MONTHS = [
  "April 2026-27", "May 2026-27", "June 2026-27", "July 2026-27",
  "August 2026-27", "September 2026-27", "October 2026-27", "November 2026-27",
  "December 2026-27", "January 2026-27", "February 2026-27", "March 2026-27",
];

const DEFAULT_PARTIES = ["JAIN TRADE LINK", "STERLING AGRO", "P.D. POLYCHEM", "J.K.TYRE BANMORE", "BAPUNA BREWERS"];
const DEFAULT_WEIGHTS = ["60 KG", "35 KG", "50 KG", "1 CAN"];

const initialForm = {
  partyName: "",
  itemName: "HCL",
  purchase: "",
  canQty: "",
  canWeight: "",
  totalQty: "",
  dispatchDate: "",
  canQtyReceived: "",
  receivedDate: "",
};

export default function GodownLedgerPage() {
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(initialForm);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [customParties, setCustomParties] = useState([]);
  const [customItems, setCustomItems] = useState([]);
  const [customWeights, setCustomWeights] = useState([]);

  // ✅ Opening Balances state
  const [openingBalances, setOpeningBalances] = useState({});
  const [showOpeningSetup, setShowOpeningSetup] = useState(false);
  const [setupForm, setSetupForm] = useState({ itemName: "HCL", balance: "", date: "" });
  
  // ✅ Filter
  const [filterItem, setFilterItem] = useState("ALL");

  // Load data on mount or month change
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (saved[selectedMonth]) {
        setOpeningBalances(saved[selectedMonth].openingBalances || {});
        setRecords(saved[selectedMonth].records || []);
      } else {
        setOpeningBalances({});
        setRecords([]);
      }
    } catch {
      setRecords([]);
    }
  }, [selectedMonth]);

  // Save data to localStorage
  function saveData(updatedRecords, updatedOpening = openingBalances) {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    saved[selectedMonth] = {
      openingBalances: updatedOpening,
      records: updatedRecords,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    setRecords(updatedRecords);
    setOpeningBalances(updatedOpening);
  }

  // Handle Opening Setup
  function handleOpeningSetupSubmit(e) {
    e.preventDefault();
    const item = setupForm.itemName.trim();
    if (!item) return alert("Item name is required");
    
    const updatedOpening = { 
      ...openingBalances, 
      [item]: { balance: setupForm.balance, date: setupForm.date } 
    };
    saveData(records, updatedOpening);
    
    // Save custom item if new
    if (!customItems.includes(item) && item !== "HCL") {
      setCustomItems([...customItems, item]);
    }
    
    setShowOpeningSetup(false);
  }

  // Delete Opening Setup
  function handleDeleteOpeningSetup(item) {
    if (!window.confirm(`Delete Opening Balance for ${item}?`)) return;
    const updated = { ...openingBalances };
    delete updated[item];
    saveData(records, updated);
    setShowOpeningSetup(false);
  }

  // ✅ CALCULATION LOGIC: Har item ka alag balance
  const calculatedRecords = records.map((r) => {
    const item = r.itemName || "HCL";
    // Us particular item ki saari entries nikalo
    const itemRecords = records.filter(rec => (rec.itemName || "HCL") === item);
    // Current record us item ki list me kahan hai
    const indexInItem = itemRecords.findIndex(rec => rec.id === r.id);
    
    const prevRecord = indexInItem > 0 ? itemRecords[indexInItem - 1] : null;
    const openingForItem = Number(openingBalances[item]?.balance) || 0;
    
    // Pichhla balance nikalo
    let prevBalance = indexInItem === 0 ? openingForItem : (prevRecord.calculatedBalance || 0);
    let currentBalance = prevBalance;
    
    // Calculation
    if (r.purchase) currentBalance += Number(r.purchase);
    if (r.totalQty) currentBalance -= Number(r.totalQty);

    return { ...r, calculatedBalance: currentBalance };
  });

  // Filter apply karo
  const filteredRecords = filterItem === "ALL" 
    ? calculatedRecords 
    : calculatedRecords.filter(r => (r.itemName || "HCL") === filterItem);

  // Closing balance of current view
  const currentItemOpening = filterItem === "ALL" ? 0 : (Number(openingBalances[filterItem]?.balance) || 0);
  const currentItemDate = filterItem === "ALL" ? "" : (openingBalances[filterItem]?.date || "");
  
  const finalClosingBalance = filteredRecords.length > 0 
    ? filteredRecords[filteredRecords.length - 1].calculatedBalance 
    : currentItemOpening;

  // Input Change
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Form Submit (Add/Update)
  function handleSubmit(e) {
    e.preventDefault();
    if (!form.partyName && !form.purchase && !form.totalQty) {
      alert("Please enter at least Party Name, Purchase or Total Qty.");
      return;
    }

    if (editingId) {
      const updated = records.map(r => r.id === editingId ? { ...form, id: editingId } : r);
      saveData(updated);
      setEditingId(null);
    } else {
      const newRecord = { ...form, id: Date.now().toString() };
      saveData([...records, newRecord]);
    }

    // Save custom dropdown values
    if (form.partyName && !DEFAULT_PARTIES.includes(form.partyName) && !customParties.includes(form.partyName)) {
      setCustomParties([...customParties, form.partyName]);
    }
    if (form.itemName && form.itemName !== "HCL" && !customItems.includes(form.itemName)) {
      setCustomItems([...customItems, form.itemName]);
    }
    if (form.canWeight && !DEFAULT_WEIGHTS.includes(form.canWeight) && !customWeights.includes(form.canWeight)) {
      setCustomWeights([...customWeights, form.canWeight]);
    }

    setForm(initialForm);
    setShowForm(false);
  }

  function editRecord(record) {
    setForm(record);
    setEditingId(record.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteRecord(id) {
    if (!window.confirm("Delete this entry?")) return;
    saveData(records.filter(r => r.id !== id));
  }

  // Export CSV
  function exportCSV() {
    const headers = ["Party Name", "Item Name", "Purchase", "Can Qty", "Can Weight", "Total Qty", "Balance Qty", "Dispatch Date", "Can Qty Received", "Received Date"];
    const rows = filteredRecords.map(r => [
      r.partyName, r.itemName, r.purchase, r.canQty, r.canWeight, r.totalQty, 
      r.calculatedBalance, r.dispatchDate, r.canQtyReceived, r.receivedDate
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell || ""}"`).join(","))
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Ledger_${selectedMonth.replace(/\s/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import CSV
  function importCSV(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split("\n").filter(line => line.trim() !== "");
      
      let newRecords = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        const cleanRow = row.map(cell => cell.replace(/^"|"$/g, '').trim());

        if (cleanRow.length >= 1) {
          const party = cleanRow[0];
          const item = cleanRow[1] || "HCL";
          const purchase = cleanRow[2];
          const canQty = cleanRow[3];
          const canWeight = cleanRow[4];
          const totalQty = cleanRow[5];
          const dispatchDate = cleanRow[6];
          const canReceived = cleanRow[7];
          const recDate = cleanRow[8];

          if (party || purchase || totalQty) {
            newRecords.push({
              id: Date.now().toString() + i,
              partyName: party,
              itemName: item,
              purchase,
              canQty,
              canWeight,
              totalQty,
              dispatchDate,
              canQtyReceived: canReceived,
              receivedDate: recDate,
            });
          }
        }
      }

      if (newRecords.length > 0) {
        saveData([...records, ...newRecords]);
        alert(`${newRecords.length} records imported successfully!`);
      } else {
        alert("No valid data found. Please check CSV format.");
      }
      e.target.value = ""; 
    };
    reader.readAsText(file);
  }

  const allParties = Array.from(new Set([...DEFAULT_PARTIES, ...customParties]));
  const allWeights = Array.from(new Set([...DEFAULT_WEIGHTS, ...customWeights]));
  const allItems = Array.from(new Set(["HCL", ...Object.keys(openingBalances), ...customItems]));

  const inputClass = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 pb-20">
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-xl font-black">S</div>
            <div>
              <p className="text-lg font-bold tracking-wide">SUDHA CHEMICALS</p>
              <p className="text-xs text-slate-400">Godown Ledger</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-bold text-white outline-none">
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            
            <select value={filterItem} onChange={(e) => setFilterItem(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-bold text-white outline-none">
              <option value="ALL">All Items</option>
              {allItems.map(item => <option key={item} value={item}>{item}</option>)}
            </select>

            <button onClick={exportCSV} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500">Export ↓</button>
            <label className="cursor-pointer rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-500">
              Import ↑
              <input type="file" accept=".csv" onChange={importCSV} className="hidden" />
            </label>
            <button onClick={() => { setForm(initialForm); setEditingId(null); setShowForm(!showForm); }} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500">
              {showForm ? "Close Form" : "+ Add Entry"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-black text-slate-800">{selectedMonth} {filterItem !== "ALL" && `- ${filterItem}`}</h1>
          <button onClick={() => { setSetupForm({ itemName: filterItem === "ALL" ? "HCL" : filterItem, balance: "", date: "" }); setShowOpeningSetup(!showOpeningSetup); }} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 shadow-sm">
            ⚙️ Setup Opening Balance
          </button>
        </div>

        {showOpeningSetup && (
          <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 p-5 shadow-md">
            <h2 className="mb-3 text-lg font-bold text-indigo-800">Set Opening Balance</h2>
            <form onSubmit={handleOpeningSetupSubmit} className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[150px]">
                <label className="mb-1 block text-xs font-semibold text-indigo-700">Item Name</label>
                <input list="setup-items" value={setupForm.itemName} onChange={(e) => setSetupForm({ ...setupForm, itemName: e.target.value })} placeholder="e.g. HCL" className={inputClass} required />
                <datalist id="setup-items">
                  {allItems.map(p => <option key={p} value={p} />)}
                </datalist>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="mb-1 block text-xs font-semibold text-indigo-700">Opening Balance Qty</label>
                <input type="number" value={setupForm.balance} onChange={(e) => setSetupForm({ ...setupForm, balance: e.target.value })} placeholder="e.g. 209550" className={inputClass} required />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="mb-1 block text-xs font-semibold text-indigo-700">Opening Date</label>
                <input type="date" value={setupForm.date} onChange={(e) => setSetupForm({ ...setupForm, date: e.target.value })} className={inputClass} />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-bold text-white hover:bg-indigo-700">Save Setup</button>
                {openingBalances[setupForm.itemName] && (
                  <button type="button" onClick={() => handleDeleteOpeningSetup(setupForm.itemName)} className="rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">Delete</button>
                )}
              </div>
            </form>
          </div>
        )}

        {showForm && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-blue-700">{editingId ? "Edit Entry" : "Add New Entry"}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Party Name</label>
                <input list="parties" name="partyName" value={form.partyName} onChange={handleChange} placeholder="Type or select..." className={inputClass} />
                <datalist id="parties">{allParties.map(p => <option key={p} value={p} />)}</datalist>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Item Name</label>
                <input list="items" name="itemName" value={form.itemName} onChange={handleChange} placeholder="e.g. HCL" className={inputClass} />
                <datalist id="items">{allItems.map(p => <option key={p} value={p} />)}</datalist>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Purchase</label>
                <input type="number" name="purchase" value={form.purchase} onChange={handleChange} placeholder="0" className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Can Qty</label>
                <input type="text" name="canQty" value={form.canQty} onChange={handleChange} placeholder="e.g. 33 CARBO" className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Can Weight</label>
                <input list="weights" name="canWeight" value={form.canWeight} onChange={handleChange} placeholder="e.g. 60 KG" className={inputClass} />
                <datalist id="weights">{allWeights.map(p => <option key={p} value={p} />)}</datalist>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Total Qty (Number)</label>
                <input type="number" name="totalQty" value={form.totalQty} onChange={handleChange} placeholder="0" className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Dispatch Date</label>
                <input type="date" name="dispatchDate" value={form.dispatchDate} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Can Qty Received</label>
                <input type="text" name="canQtyReceived" value={form.canQtyReceived} onChange={handleChange} placeholder="e.g. 33 CARBO RECEIVED" className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Received Date</label>
                <input type="date" name="receivedDate" value={form.receivedDate} onChange={handleChange} className={inputClass} />
              </div>
              <div className="flex items-end gap-2">
                <button type="submit" className="w-full rounded-md bg-blue-600 py-2 text-sm font-bold text-white hover:bg-blue-700">{editingId ? "Update" : "Add"}</button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-lg">
          <table className="w-full min-w-[1200px] text-left text-sm border-collapse">
            <thead className="bg-[#5d9cec] text-white">
              <tr>
                <th className="border border-slate-300 px-3 py-3 font-bold">PARTY NAME</th>
                <th className="border border-slate-300 px-3 py-3 font-bold">ITEM NAME</th>
                <th className="border border-slate-300 px-3 py-3 font-bold text-right">PURCHASE</th>
                <th className="border border-slate-300 px-3 py-3 font-bold text-center">CAN QTY.</th>
                <th className="border border-slate-300 px-3 py-3 font-bold text-center">CAN WEIGHT</th>
                <th className="border border-slate-300 px-3 py-3 font-bold text-right">TOTAL QTY.</th>
                <th className="border border-slate-300 px-3 py-3 font-bold text-right">BALANCE QTY.</th>
                <th className="border border-slate-300 px-3 py-3 font-bold text-center">DISPACH DATE</th>
                <th className="border border-slate-300 px-3 py-3 font-bold text-center">CAN QTY. RECEIVED</th>
                <th className="border border-slate-300 px-3 py-3 font-bold text-center">RECEIVED DATE</th>
                <th className="border border-slate-300 px-3 py-3 font-bold text-center">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filterItem === "ALL" ? (
                Object.entries(openingBalances).map(([item, data]) => (
                  <tr key={item} className="bg-white font-bold">
                    <td className="border border-slate-300 px-3 py-2">OPENING BALANCE</td>
                    <td className="border border-slate-300 px-3 py-2 text-center">{item}</td>
                    <td className="border border-slate-300 px-3 py-2 text-right">{data.balance || "0"}</td>
                    <td className="border border-slate-300 px-3 py-2"></td>
                    <td className="border border-slate-300 px-3 py-2"></td>
                    <td className="border border-slate-300 px-3 py-2"></td>
                    <td className="border border-slate-300 px-3 py-2 text-right font-bold text-blue-700">{Number(data.balance) || 0}</td>
                    <td className="border border-slate-300 px-3 py-2 text-center text-xs">{data.date ? data.date.split("-").reverse().join(".") : ""}</td>
                    <td className="border border-slate-300 px-3 py-2"></td>
                    <td className="border border-slate-300 px-3 py-2"></td>
                    <td className="border border-slate-300 px-3 py-2 text-center text-xs text-slate-400">Setup ↑</td>
                  </tr>
                ))
              ) : (
                <tr className="bg-white font-bold">
                  <td className="border border-slate-300 px-3 py-2">OPENING BALANCE</td>
                  <td className="border border-slate-300 px-3 py-2 text-center">{filterItem}</td>
                  <td className="border border-slate-300 px-3 py-2 text-right">{currentItemOpening || "0"}</td>
                  <td className="border border-slate-300 px-3 py-2"></td>
                  <td className="border border-slate-300 px-3 py-2"></td>
                  <td className="border border-slate-300 px-3 py-2"></td>
                  <td className="border border-slate-300 px-3 py-2 text-right font-bold text-blue-700">{currentItemOpening}</td>
                  <td className="border border-slate-300 px-3 py-2 text-center text-xs">{currentItemDate ? currentItemDate.split("-").reverse().join(".") : ""}</td>
                  <td className="border border-slate-300 px-3 py-2"></td>
                  <td className="border border-slate-300 px-3 py-2"></td>
                  <td className="border border-slate-300 px-3 py-2 text-center text-xs text-slate-400">Setup ↑</td>
                </tr>
              )}

              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 bg-white">
                  <td className="border border-slate-300 px-3 py-2 uppercase">{r.partyName || "-"}</td>
                  <td className="border border-slate-300 px-3 py-2 text-center">{r.itemName || "-"}</td>
                  <td className="border border-slate-300 px-3 py-2 text-right">{r.purchase || ""}</td>
                  <td className="border border-slate-300 px-3 py-2 text-center">{r.canQty || ""}</td>
                  <td className="border border-slate-300 px-3 py-2 text-center">{r.canWeight || ""}</td>
                  <td className="border border-slate-300 px-3 py-2 text-right">{r.totalQty || ""}</td>
                  <td className="border border-slate-300 px-3 py-2 text-right font-bold">{r.calculatedBalance}</td>
                  <td className="border border-slate-300 px-3 py-2 text-center">{r.dispatchDate ? r.dispatchDate.split("-").reverse().join(".") : ""}</td>
                  <td className="border border-slate-300 px-3 py-2 text-center uppercase text-xs">{r.canQtyReceived || ""}</td>
                  <td className="border border-slate-300 px-3 py-2 text-center">{r.receivedDate ? r.receivedDate.split("-").reverse().join(".") : ""}</td>
                  <td className="border border-slate-300 px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => editRecord(r)} className="rounded bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 hover:bg-blue-200">Edit</button>
                      <button onClick={() => deleteRecord(r.id)} className="rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-200">Del</button>
                    </div>
                  </td>
                </tr>
              ))}

              <tr className="bg-slate-100 font-bold">
                <td className="border border-slate-300 px-3 py-2">CLOSING BALANCE</td>
                <td className="border border-slate-300 px-3 py-2 text-center">{filterItem === "ALL" ? "Multiple" : filterItem}</td>
                <td className="border border-slate-300 px-3 py-2"></td>
                <td className="border border-slate-300 px-3 py-2"></td>
                <td className="border border-slate-300 px-3 py-2"></td>
                <td className="border border-slate-300 px-3 py-2"></td>
                <td className="border border-slate-300 px-3 py-2 text-right text-red-600 text-base">{filterItem === "ALL" ? "Select Item" : finalClosingBalance}</td>
                <td className="border border-slate-300 px-3 py-2"></td>
                <td className="border border-slate-300 px-3 py-2"></td>
                <td className="border border-slate-300 px-3 py-2"></td>
                <td className="border border-slate-300 px-3 py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}