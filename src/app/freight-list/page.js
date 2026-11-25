"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const API_BASE = "/api/freight-list";

const defaultTransporters = [
  "BDR Logistics",
  "SBT Logistics",
  "Renuchem International",
  "Sharda Logistics",
  "New Mahaveer Transport",
  "Maa durga Transport",
];

export default function FreightListPage() {
  const [freights, setFreights] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("success");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAction, setAdminAction] = useState(null);
  const [adminCredentials, setAdminCredentials] = useState({ adminId: "", adminPassword: "" });
  const [adminError, setAdminError] = useState("");
  const [verifyingAdmin, setVerifyingAdmin] = useState(false);
  
  const [showTransporterDropdown, setShowTransporterDropdown] = useState(false);
  const transporterWrapperRef = useRef(null);

  const [form, setForm] = useState({
    fromPlace: "",
    toPlace: "",
    ratePerTon: "",
    transporterName: "",
    itemName: "",
    contactNumber: "",       
    alternateNumber: "",     
  });

  // ✅ 1. DATABASE SE DATA FETCH KARNA
  async function fetchFreights() {
    try {
      const res = await fetch(API_BASE);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setFreights(json.data);
        setIsAdmin(json.canManage === true);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }

  useEffect(() => {
    // Initial API synchronization after the client component mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFreights();
  }, []);

  // Bahar click karne par dropdown band karna
  useEffect(() => {
    function handleClickOutside(event) {
      if (transporterWrapperRef.current && !transporterWrapperRef.current.contains(event.target)) {
        setShowTransporterDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function showNotice(msg, type = "success") {
    setNotice(msg);
    setNoticeType(type);
    setTimeout(() => setNotice(""), 4000);
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectTransporter = (name) => {
    const existingFreight = freights.find(f => f.transporterName === name);

    if (existingFreight) {
      setForm((prev) => ({
        ...prev,
        transporterName: name,
        contactNumber: existingFreight.contactNumber || "",
        alternateNumber: existingFreight.alternateNumber || "",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        transporterName: name,
      }));
    }
    setShowTransporterDropdown(false);
  };

  // ✅ 2. ADD / UPDATE FROM API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fromPlace || !form.toPlace || !form.ratePerTon || !form.transporterName || !form.itemName) {
      showNotice("Kripya sabhi zaroori fields bharein.", "error");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        // UPDATE
        const res = await fetch(`${API_BASE}?id=${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, ...adminCredentials }),
        });
        const json = await res.json();

        if (!res.ok || !json.success) {
          showNotice(json.message || "Update failed.", "error");
          return;
        }

        await fetchFreights();
        setEditingId(null);
        setAdminCredentials({ adminId: "", adminPassword: "" });
        showNotice("Freight updated successfully!");
      } else {
        // ADD
        const res = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const json = await res.json();

        if (!res.ok || !json.success) {
          showNotice(json.message || "Save failed.", "error");
          return;
        }

        await fetchFreights();
        showNotice("Freight added successfully!");
      }

      resetForm();
    } catch (err) {
      console.error(err);
      showNotice("Server error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const beginEdit = (item) => {
    setForm({
      fromPlace: item.fromPlace,
      toPlace: item.toPlace,
      ratePerTon: item.ratePerTon,
      transporterName: item.transporterName,
      itemName: item.itemName,
      contactNumber: item.contactNumber || "",
      alternateNumber: item.alternateNumber || "",
    });
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const requestAdminAction = (type, item) => {
    setAdminAction({ type, item });
    setAdminCredentials({ adminId: "", adminPassword: "" });
    setAdminError("");
  };

  const closeAdminModal = () => {
    if (verifyingAdmin) return;
    setAdminAction(null);
    setAdminCredentials({ adminId: "", adminPassword: "" });
    setAdminError("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setAdminCredentials({ adminId: "", adminPassword: "" });
    resetForm();
  };

  const resetForm = () => {
    setForm({ 
      fromPlace: "", 
      toPlace: "", 
      ratePerTon: "", 
      transporterName: "", 
      itemName: "",
      contactNumber: "",
      alternateNumber: ""
    });
  };

  // ✅ 3. DELETE FROM API
  const confirmAdminAction = async (e) => {
    e.preventDefault();
    if (!adminAction || !adminCredentials.adminId.trim() || !adminCredentials.adminPassword) {
      setAdminError("Admin ID aur password dono bharein.");
      return;
    }

    setVerifyingAdmin(true);
    setAdminError("");
    try {
      if (adminAction.type === "edit") {
        const res = await fetch(API_BASE, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(adminCredentials),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          setAdminError(json.message || json.error || "Admin verification failed.");
          return;
        }

        const item = adminAction.item;
        setAdminAction(null);
        beginEdit(item);
        showNotice("Admin verified. Ab freight edit karke update karein.");
      } else {
        const itemId = adminAction.item.id;
        const res = await fetch(`${API_BASE}?id=${itemId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(adminCredentials),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          setAdminError(json.message || json.error || "Delete failed.");
          return;
        }

        await fetchFreights();
        if (editingId === itemId) {
          setEditingId(null);
          resetForm();
        }
        setAdminAction(null);
        setAdminCredentials({ adminId: "", adminPassword: "" });
        showNotice("Freight deleted.");
      }
    } catch (err) {
      console.error(err);
      setAdminError("Server error. Please try again.");
    } finally {
      setVerifyingAdmin(false);
    }
  };

  const filteredFreights = freights.filter((item) => {
    const query = searchQuery.toLowerCase();
    const placeCombined = `${item.fromPlace} - ${item.toPlace}`.toLowerCase();
    const contact = (item.contactNumber || "").toLowerCase();
    const altContact = (item.alternateNumber || "").toLowerCase();

    return (
      placeCombined.includes(query) ||
      item.transporterName.toLowerCase().includes(query) ||
      item.itemName.toLowerCase().includes(query) ||
      contact.includes(query) ||
      altContact.includes(query)
    );
  });

  const allTransporterNames = Array.from(new Set([
    ...defaultTransporters,
    ...freights.map(f => f.transporterName).filter(Boolean)
  ]));

  const filteredTransporterOptions = allTransporterNames.filter(t => 
    t.toLowerCase().includes(form.transporterName.toLowerCase())
  );

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";
  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-black">S</div>
            <div>
              <p className="text-lg font-bold tracking-wide">SUDHA CHEMICALS</p>
              <p className="text-xs text-slate-400">Freight List</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold hover:bg-slate-900">Home</Link>
            <Link href="/delivery-order" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold hover:bg-slate-900">Delivery Order</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Freight Management</h1>
          <p className="text-slate-500 mt-2">
            Naya freight add aur search karein. Edit aur delete sirf admin verification ke baad available hain.
          </p>
        </div>

        {/* NOTICE */}
        {notice && (
          <div className={`mb-6 flex items-center justify-between rounded-xl border bg-white p-4 text-sm font-semibold ${noticeType === "error" ? "border-red-200 text-red-700" : "border-emerald-200 text-emerald-800"}`}>
            {notice}
            <button onClick={() => setNotice("")} className="text-xl">×</button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* ✅ FORM SECTION */}
          <section className="lg:col-span-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 h-fit">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-black">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                {editingId ? "✏️" : "➕"}
              </span>
              {editingId ? "Edit Freight" : "Add Freight"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Place (From - To)</label>
                <div className="flex items-center gap-2">
                  <input
                    name="fromPlace"
                    value={form.fromPlace}
                    onChange={handleChange}
                    placeholder="From (e.g. Gwalior)"
                    className={inputClass}
                  />
                  <span className="text-slate-400 font-bold">-</span>
                  <input
                    name="toPlace"
                    value={form.toPlace}
                    onChange={handleChange}
                    placeholder="To (e.g. Jhagadia)"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Rate per Ton (₹)</label>
                <input
                  name="ratePerTon"
                  type="number"
                  value={form.ratePerTon}
                  onChange={handleChange}
                  placeholder="e.g. 2500"
                  className={inputClass}
                />
              </div>

              <div className="relative" ref={transporterWrapperRef}>
                <label className={labelClass}>Transporter Name</label>
                <input
                  name="transporterName"
                  value={form.transporterName}
                  onChange={handleChange}
                  onFocus={() => setShowTransporterDropdown(true)}
                  placeholder="Type or select transporter..."
                  className={inputClass}
                  autoComplete="off"
                />

                {showTransporterDropdown && (
                  <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                    {filteredTransporterOptions.length === 0 ? (
                      <div className="p-3 text-sm text-slate-400">
                        {form.transporterName ? "No match found." : "No transporters saved yet."}
                      </div>
                    ) : (
                      <ul className="py-1">
                        {filteredTransporterOptions.map((name) => (
                          <li
                            key={name}
                            onClick={() => handleSelectTransporter(name)}
                            className="cursor-pointer px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            {name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>Item Name</label>
                <input
                  name="itemName"
                  value={form.itemName}
                  onChange={handleChange}
                  placeholder="e.g. CAUSTIC SODA FLAKES"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Contact Number</label>
                <input
                  name="contactNumber"
                  type="tel"
                  value={form.contactNumber}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Alternate Number</label>
                <input
                  name="alternateNumber"
                  type="tel"
                  value={form.alternateNumber}
                  onChange={handleChange}
                  placeholder="e.g. 9123456789"
                  className={inputClass}
                />
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {loading ? "Saving..." : (editingId ? "Update Freight" : "Save Freight")}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-1/3 rounded-xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* ✅ LIST & SEARCH SECTION */}
          <section className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="flex items-center gap-2 text-lg font-black">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">📋</span>
                Freight List ({filteredFreights.length})
              </h2>
              
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search by Place, Transporter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-bold whitespace-nowrap">Place (From - To)</th>
                    <th className="px-4 py-3 font-bold whitespace-nowrap">Rate / Ton</th>
                    <th className="px-4 py-3 font-bold whitespace-nowrap">Transporter</th>
                    <th className="px-4 py-3 font-bold whitespace-nowrap">Item Name</th>
                    <th className="px-4 py-3 font-bold whitespace-nowrap">Contact No.</th>
                    <th className="px-4 py-3 font-bold whitespace-nowrap">Alt. Number</th>
                    {isAdmin && <th className="px-4 py-3 font-bold text-center whitespace-nowrap">Admin Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFreights.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 7 : 6} className="px-4 py-8 text-center text-slate-400">
                        Koi data nahi mila.
                      </td>
                    </tr>
                  ) : (
                    filteredFreights.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                          {item.fromPlace} <span className="text-slate-400">→</span> {item.toPlace}
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-700 whitespace-nowrap">₹{item.ratePerTon}</td>
                        <td className="px-4 py-3">{item.transporterName}</td>
                        <td className="px-4 py-3">{item.itemName}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{item.contactNumber || "-"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{item.alternateNumber || "-"}</td>

                        {isAdmin && (
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => requestAdminAction("edit", item)}
                                className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => requestAdminAction("delete", item)}
                                className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>

      {adminAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeAdminModal();
          }}
        >
          <form onSubmit={confirmAdminAction} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Admin verification</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  {adminAction.type === "edit" ? "Edit Freight" : "Delete Freight"}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {adminAction.type === "edit"
                    ? "Edit access ke liye apna admin ID aur password enter karein."
                    : "Is entry ko delete karne ke liye apna admin ID aur password enter karein."}
                </p>
              </div>
              <button type="button" onClick={closeAdminModal} className="rounded-lg px-3 py-1 text-2xl text-slate-400 hover:bg-slate-100" aria-label="Close">
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Admin ID</label>
                <input
                  autoFocus
                  required
                  autoComplete="username"
                  value={adminCredentials.adminId}
                  onChange={(event) => setAdminCredentials((current) => ({ ...current, adminId: event.target.value }))}
                  className={inputClass}
                  placeholder="Enter admin ID"
                />
              </div>
              <div>
                <label className={labelClass}>Admin Password</label>
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  value={adminCredentials.adminPassword}
                  onChange={(event) => setAdminCredentials((current) => ({ ...current, adminPassword: event.target.value }))}
                  className={inputClass}
                  placeholder="Enter admin password"
                />
              </div>
              {adminError && (
                <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{adminError}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeAdminModal} disabled={verifyingAdmin} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-60">
                Cancel
              </button>
              <button
                type="submit"
                disabled={verifyingAdmin}
                className={`rounded-xl px-5 py-3 text-sm font-bold text-white disabled:opacity-60 ${adminAction.type === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {verifyingAdmin ? "Verifying..." : adminAction.type === "edit" ? "Verify & Edit" : "Verify & Delete"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
