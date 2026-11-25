"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

async function customerRequest(method = "GET", body, id) {
  const res = await fetch(`/api/customers${id == null ? "" : `?id=${encodeURIComponent(id)}`}`, {
    method, cache: "no-store", credentials: "same-origin",
    ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || data.error || "Request failed");
  return data;
}

const ITEM_OPTIONS = [
  "Sulphuric Acid (98%)",
  "Hydrochloric Acid (30-33%)",
  "Nitric Acid",
  "Phosphoric Acid",
  "Acetic Acid",
  "Caustic Soda Lye",
  "Soda Ash",
  "Caustic Soda Flakes",
  "Citric Acid",
  "Oleum(23%)",
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const initialForm = {
  customerName: "",
  customerType: "Enduser",
  storeContact: "",
  purchaseContact: "",
  accountsContact: "",
  factoryAddress: "",
  officeAddress: "",
  contactPerson: "",
  otherContactPerson: "",
  contactNumber: "",
  alternateNumber: "",
  emailIds: [""],
  state: "",
  city: "",
  month: MONTHS[new Date().getMonth()],
  items: [{ itemName: "", qty: "", unit: "KG" }],
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";
const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

function SearchableSelect({ options, value, onChange, placeholder = "Search..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const typedName = searchTerm.trim();
  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(typedName.toLowerCase())
  );
  const exactMatch = options.find(
    (opt) => opt.toLowerCase() === typedName.toLowerCase()
  );
  const canAdd = Boolean(typedName && !exactMatch);

  function selectProduct(name) {
    onChange(name.trim());
    setSearchTerm("");
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        className={inputClass + " cursor-pointer flex justify-between items-center bg-white"}
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchTerm("");
        }}
      >
        <span className={value ? "text-slate-800" : "text-slate-400"}>
          {value || placeholder}
        </span>
        <span className="text-slate-400 text-xs">▼</span>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="p-2 border-b border-slate-100 sticky top-0 bg-white rounded-t-xl">
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (typedName) selectProduct(exactMatch || typedName);
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setIsOpen(false);
                }
              }}
              placeholder="Search or type new product..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-400">No items found</li>
            ) : (
              filteredOptions.map((opt) => (
                <li
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className="cursor-pointer rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {opt}
                </li>
              ))
            )}
          </ul>
          {canAdd && (
            <div className="border-t border-slate-100 p-2">
              <button
                type="button"
                onClick={() => selectProduct(typedName)}
                className="w-full break-words rounded-lg bg-emerald-50 px-3 py-2 text-left text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                + Add "{typedName}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [search, setSearch] = useState("");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");

  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState("");
  async function loadCustomers() {
    const result = await customerRequest();
    setCustomers(result.data);
    setLoadError("");
  }
  useEffect(() => {
    loadCustomers().catch(e => setLoadError(e.message)).finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  function updateField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: value,
      ...(name === "customerType" && value === "Trader" 
          ? { 
              factoryAddress: "", 
              // ✅ Trader select karne par teeno contacts clear ho jayenge
              storeContact: "",
              purchaseContact: "",
              accountsContact: "",
              items: prev.items.map(it => ({ ...it, qty: "" })) 
            } 
          : {})
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleItemChange(index, field, value) {
    const newItems = [...form.items];
    newItems[index][field] = value;
    setForm({ ...form, items: newItems });
    setErrors((prev) => {
       const newErrs = { ...prev };
       delete newErrs[`items[${index}].${field}`];
       return newErrs;
    });
  }

  function addItemRow() {
    setForm({ ...form, items: [...form.items, { itemName: "", qty: "", unit: "KG" }] });
  }

  function removeItemRow(index) {
    if (form.items.length === 1) return;
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
  }

  function validate() {
    const next = {};
    if (!form.customerName.trim()) next.customerName = "Customer Name is required.";
    if (!form.officeAddress.trim()) next.officeAddress = "Office Address is required.";
    
    if (form.customerType === "Enduser" && !form.factoryAddress.trim()) {
      next.factoryAddress = "Factory Address is required for Enduser.";
    }
    
    if (!form.contactPerson.trim()) next.contactPerson = "Contact Person is required.";
    if (!/^[0-9]{10}$/.test(form.contactNumber.trim())) next.contactNumber = "Enter a valid 10-digit number.";
    
    if (form.alternateNumber && !/^[0-9]{10}$/.test(form.alternateNumber.trim())) {
      next.alternateNumber = "Enter a valid 10-digit number.";
    }

    // Teeno department numbers ki validation (sirf Enduser ke liye)
    if (form.customerType === "Enduser") {
      if (form.storeContact && !/^[0-9]{10}$/.test(form.storeContact.trim())) {
        next.storeContact = "Enter a valid 10-digit number.";
      }
      if (form.purchaseContact && !/^[0-9]{10}$/.test(form.purchaseContact.trim())) {
        next.purchaseContact = "Enter a valid 10-digit number.";
      }
      if (form.accountsContact && !/^[0-9]{10}$/.test(form.accountsContact.trim())) {
        next.accountsContact = "Enter a valid 10-digit number.";
      }
    }
    
    form.emailIds.forEach((email, i) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next[`email-${i}`] = "Enter a valid email address.";
    });

    if (!form.state.trim()) next.state = "State is required.";
    if (!form.city.trim()) next.city = "City is required.";
    if (!form.month) next.month = "Month is required.";

    let itemErrors = false;
    form.items.forEach((item, idx) => {
      if (!item.itemName) {
        next[`items[${idx}].itemName`] = "Item required";
        itemErrors = true;
      }
      if (form.customerType === "Enduser" && (!item.qty || Number(item.qty) <= 0)) {
        next[`items[${idx}].qty`] = "Qty required";
        itemErrors = true;
      }
    });
    if (itemErrors) next.items = "Please fill all item details correctly.";

    return next;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const payload = { ...form, emailIds: form.emailIds.map(e => e.trim()), items: form.items.map(item => ({ ...item, qty: form.customerType === "Enduser" ? item.qty : "" })) };
      await customerRequest(editingId != null ? "PUT" : "POST", payload, editingId);
      setNotice(editingId != null ? "Customer updated successfully!" : "Customer added successfully!");
      closeForm();
      await loadCustomers().catch(e => setLoadError(e.message));
    } catch (e) { setErrors({ form: e.message }); }
    finally { setBusy(false); }
  }

  function openForm(customer = null) {
    if (customer) {
      setForm({
        ...customer,
        otherContactPerson: customer.otherContactPerson || "",
        emailIds: customer.emailIds?.length ? customer.emailIds : [customer.emailId || ""],
        items: customer.items || [{ itemName: "", qty: "", unit: "KG" }]
      });
      setEditingId(customer.id);
    } else {
      setForm(initialForm);
      setEditingId(null);
    }
    setErrors({});
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingId(null);
    setForm(initialForm);
    setErrors({});
  }

  async function handleDelete(id) {
    if (busy || !window.confirm("Are you sure you want to delete this customer?")) return;
    setBusy(true);
    try {
      await customerRequest("DELETE", undefined, id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      setNotice("Customer deleted.");
    } catch (e) { setNotice(e.message); }
    finally { setBusy(false); }
  }

  const productOptions = Array.from(new Map(
    [...ITEM_OPTIONS, ...customers.flatMap(c => (c.items || []).map(i => i.itemName)), ...form.items.map(i => i.itemName)]
      .filter(name => typeof name === "string" && name.trim())
      .map(name => [name.trim().toLowerCase(), name.trim()])
  ).values());

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    
    const hasItemMatch = c.items?.some((item) => 
      item.itemName.toLowerCase().includes(q)
    );

    const hasMonthMatch = c.month?.toLowerCase().includes(q);
    
    return (
      c.customerName.toLowerCase().includes(q) ||
      c.contactPerson.toLowerCase().includes(q) ||
      (c.otherContactPerson || "").toLowerCase().includes(q) ||
      c.emailIds?.some(email => email.toLowerCase().includes(q)) ||
      c.city?.toLowerCase().includes(q) ||
      c.state?.toLowerCase().includes(q) ||
      c.contactNumber.includes(q) ||
      hasItemMatch || 
      hasMonthMatch
    );
  });

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-black">S</div>
            <div>
              <p className="text-lg font-bold tracking-wide">SUDHA CHEMICALS</p>
              <p className="text-xs text-slate-400">Customer Master & Requirements</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/inventory" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold hover:bg-slate-900">Inventory</Link>
            <button onClick={() => openForm()} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-500">
              + Add Customer
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {notice && (
          <div className="fixed right-4 top-4 z-[100] rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl">
            {notice}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-black tracking-tight">Customer Directory</h1>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search name, city, month, or item..."
            className={inputClass + " max-w-lg"}
          />
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          {loadError ? (<div className="p-8 text-red-600">{loadError} <button onClick={() => loadCustomers().catch(e => setLoadError(e.message))}>Retry</button></div>) : !isReady ? (
            <div className="p-12 text-center text-slate-500">Loading...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-lg font-bold text-slate-800">No customers found</p>
              <p className="text-sm text-slate-500 mt-1">Try a different search term or add a new customer.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-bold">Customer Name</th>
                    <th className="px-5 py-4 font-bold">Contact / City</th>
                    <th className="px-5 py-4 font-bold">Department Contacts</th>
                    <th className="px-5 py-4 font-bold">Monthly Requirement</th>
                    <th className="px-5 py-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800">{c.customerName}</p>
                        <span className={`inline-flex mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${c.customerType === 'Enduser' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>
                          {c.customerType}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-slate-700 font-semibold">{c.contactPerson}</p>
                        <p className="text-xs text-slate-500">{c.contactNumber}</p>
                        {c.otherContactPerson && <p className="text-xs">Other: {c.otherContactPerson}</p>}
                        {c.emailIds?.map((email, i) => <p key={i} className="text-xs text-emerald-700 break-all">{email}</p>)}
                        <p className="text-xs text-slate-400 mt-1">{c.city}, {c.state}</p>
                      </td>
                      
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          {c.storeContact && (
                            <div className="flex justify-between gap-4 border-b border-slate-100 pb-1">
                              <span className="font-semibold text-slate-600">Store:</span>
                              <span className="font-bold text-slate-800">{c.storeContact}</span>
                            </div>
                          )}
                          {c.purchaseContact && (
                            <div className="flex justify-between gap-4 border-b border-slate-100 pb-1">
                              <span className="font-semibold text-slate-600">Purchase:</span>
                              <span className="font-bold text-slate-800">{c.purchaseContact}</span>
                            </div>
                          )}
                          {c.accountsContact && (
                            <div className="flex justify-between gap-4">
                              <span className="font-semibold text-slate-600">Accounts:</span>
                              <span className="font-bold text-slate-800">{c.accountsContact}</span>
                            </div>
                          )}
                          {!c.storeContact && !c.purchaseContact && !c.accountsContact && (
                            <span className="text-slate-400 italic">Not provided</span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="rounded-lg bg-amber-50 border border-amber-100 p-2">
                          <p className="text-xs font-bold text-amber-800 border-b border-amber-200 pb-1 mb-1">
                            {c.month || "Current"} Requirements
                          </p>
                          <ul className="list-disc pl-4 text-xs text-amber-900 space-y-0.5">
                            {c.items?.map((item, i) => (
                              <li key={i}>
                                {item.itemName} 
                                {item.qty && c.customerType === "Enduser" && (
                                  <> - <strong>{item.qty} {item.unit}</strong></>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openForm(c)} className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50">Edit</button>
                          <button onClick={() => handleDelete(c.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <section className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <h2 className="text-xl font-black">{editingId ? "Edit Customer Details" : "Add New Customer"}</h2>
              <button onClick={closeForm} className="rounded-xl px-3 py-2 text-xl text-slate-400 hover:bg-slate-100">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {errors.form && <p className="text-red-600 mb-4">{errors.form}</p>}
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-emerald-700">1. Basic Details</h3>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Customer Name <span className="text-red-500">*</span></label>
                  <input name="customerName" value={form.customerName} onChange={updateField} className={inputClass} placeholder="e.g. SHRIRAM ALKALI" />
                  {errors.customerName && <p className="text-xs text-red-600 mt-1">{errors.customerName}</p>}
                </div>

                <div>
                  <label className={labelClass}>Trader / Enduser <span className="text-red-500">*</span></label>
                  <select name="customerType" value={form.customerType} onChange={updateField} className={inputClass}>
                    <option value="Enduser">Enduser</option>
                    <option value="Trader">Trader</option>
                  </select>
                </div>

                {/* ✅ DEPARTMENT SECTION: SIRF Enduser KE LIYE DIKHEGA */}
                {form.customerType !== "Trader" && (
                  <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Department Contact Numbers (Optional)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>Store Contact No.</label>
                        <input name="storeContact" type="tel" maxLength={10} value={form.storeContact} onChange={updateField} className={inputClass} placeholder="10-digit" />
                        {errors.storeContact && <p className="text-xs text-red-600 mt-1">{errors.storeContact}</p>}
                      </div>
                      <div>
                        <label className={labelClass}>Purchase Contact No.</label>
                        <input name="purchaseContact" type="tel" maxLength={10} value={form.purchaseContact} onChange={updateField} className={inputClass} placeholder="10-digit" />
                        {errors.purchaseContact && <p className="text-xs text-red-600 mt-1">{errors.purchaseContact}</p>}
                      </div>
                      <div>
                        <label className={labelClass}>Accounts Contact No.</label>
                        <input name="accountsContact" type="tel" maxLength={10} value={form.accountsContact} onChange={updateField} className={inputClass} placeholder="10-digit" />
                        {errors.accountsContact && <p className="text-xs text-red-600 mt-1">{errors.accountsContact}</p>}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className={labelClass}>Contact Person <span className="text-red-500">*</span></label>
                  <input name="contactPerson" value={form.contactPerson} onChange={updateField} className={inputClass} placeholder="e.g. Ramesh Kumar" />
                  {errors.contactPerson && <p className="text-xs text-red-600 mt-1">{errors.contactPerson}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Contact No. <span className="text-red-500">*</span></label>
                    <input name="contactNumber" type="tel" maxLength={10} value={form.contactNumber} onChange={updateField} className={inputClass} placeholder="10-digit" />
                    {errors.contactNumber && <p className="text-xs text-red-600 mt-1">{errors.contactNumber}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Alt. Number</label>
                    <input name="alternateNumber" type="tel" maxLength={10} value={form.alternateNumber} onChange={updateField} className={inputClass} placeholder="10-digit" />
                    {errors.alternateNumber && <p className="text-xs text-red-600 mt-1">{errors.alternateNumber}</p>}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Other Contact Person</label>
                  <input name="otherContactPerson" value={form.otherContactPerson} onChange={updateField} className={inputClass} />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className={labelClass}>Email IDs *</label>
                  {form.emailIds.map((email, i) => <div key={i}>
                    <div className="flex gap-2">
                      <input type="email" value={email} onChange={e => setForm(prev => ({ ...prev, emailIds: prev.emailIds.map((v,j) => j === i ? e.target.value : v) }))} className={inputClass} placeholder="contact@example.com" />
                      <button type="button" disabled={form.emailIds.length === 1} onClick={() => setForm(prev => ({ ...prev, emailIds: prev.emailIds.filter((_,j) => j !== i) }))} className="rounded-lg border border-red-200 px-3 text-red-600 disabled:opacity-30">Remove</button>
                    </div>
                    {errors[`email-${i}`] && <p className="text-xs text-red-600">{errors[`email-${i}`]}</p>}
                  </div>)}
                  <button type="button" onClick={() => setForm(prev => ({ ...prev, emailIds: [...prev.emailIds, ""] }))} className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 w-full">+ Add Another Email</button>
                </div>
              </div>

              <h3 className="mb-4 mt-8 text-sm font-bold uppercase tracking-wider text-emerald-700 border-t border-slate-100 pt-6">2. Address Details</h3>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>State <span className="text-red-500">*</span></label>
                  <input name="state" value={form.state} onChange={updateField} className={inputClass} placeholder="e.g. Madhya Pradesh" />
                  {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state}</p>}
                </div>
                <div>
                  <label className={labelClass}>City <span className="text-red-500">*</span></label>
                  <input name="city" value={form.city} onChange={updateField} className={inputClass} placeholder="e.g. Gwalior" />
                  {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
                </div>

                {form.customerType === "Enduser" && (
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Factory Address <span className="text-red-500">*</span></label>
                    <textarea name="factoryAddress" value={form.factoryAddress} onChange={updateField} rows={2} className={inputClass} placeholder="Enter factory address..." />
                    {errors.factoryAddress && <p className="text-xs text-red-600 mt-1">{errors.factoryAddress}</p>}
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className={labelClass}>Office Address <span className="text-red-500">*</span></label>
                  <textarea name="officeAddress" value={form.officeAddress} onChange={updateField} rows={2} className={inputClass} placeholder="Enter office address..." />
                  {errors.officeAddress && <p className="text-xs text-red-600 mt-1">{errors.officeAddress}</p>}
                </div>
              </div>

              <div className="mb-4 mt-8 flex flex-col justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-end">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700">3. Monthly Items & Requirements</h3>
                  <p className="text-xs text-slate-500 mt-1">Add all the products this customer will buy this month.</p>
                </div>
                <div className="w-full sm:w-48">
                  <label className={labelClass}>Month <span className="text-red-500">*</span></label>
                  <select name="month" value={form.month} onChange={updateField} className={inputClass}>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {errors.items && <p className="mb-3 text-sm font-bold text-red-600 bg-red-50 p-2 rounded">{errors.items}</p>}

              <div className="space-y-3">
                {form.items.map((item, index) => (
                  <div key={index} className="flex flex-wrap items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    
                    <div className={form.customerType === "Trader" ? "w-[450px]" : "w-full sm:w-[750px]"}>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Item / Material</label>
                      <SearchableSelect 
                        options={productOptions}
                        value={item.itemName}
                        onChange={(val) => handleItemChange(index, 'itemName', val)}
                        placeholder="Search or add product..."
                      />
                      {errors[`items[${index}].itemName`] && <p className="text-[10px] text-red-600 mt-1">{errors[`items[${index}].itemName`]}</p>}
                    </div>

                    {form.customerType === "Enduser" && (
                      <div className="w-full sm:w-[320px]">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Qty</label>
                        <div className="flex gap-1">
                          <input 
                            type="number" 
                            value={item.qty} 
                            onChange={(e) => handleItemChange(index, 'qty', e.target.value)} 
                            className={inputClass + " bg-white text-right"} 
                            placeholder="0" 
                          />
                          <select 
                            value={item.unit} 
                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)} 
                            className={inputClass + " bg-white w-24 px-2 text-sm"}
                          >
                            <option value="KG">KG</option>
                            <option value="MT">MT</option>
                            <option value="L">L</option>
                            <option value="BAG">BAG</option>
                          </select>
                        </div>
                        {errors[`items[${index}].qty`] && <p className="text-[10px] text-red-600 mt-1">{errors[`items[${index}].qty`]}</p>}
                      </div>
                    )}

                    <div className="pt-5">
                      <button 
                        type="button" 
                        onClick={() => removeItemRow(index)} 
                        disabled={form.items.length === 1}
                        className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-30"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                type="button" 
                onClick={addItemRow} 
                className="mt-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100 w-full"
              >
                + Add Another Item
              </button>

              <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button type="button" onClick={closeForm} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={busy} className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700">
                  {editingId ? "Save Changes" : "Add Customer"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}