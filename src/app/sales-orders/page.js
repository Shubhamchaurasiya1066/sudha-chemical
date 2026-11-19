"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

const companies = [
    "Sudha Chemical Company", "Sudha Core Chemical Pvt. Ltd.",
    "Nirmal Agencies Gwalior", "Nirmal Agencies Bilaspur",
];

const manufacturerOptions = [
    "DCM Shriram Industries Ltd.", "Grassim Industries Limited", "Meghmani Organics Limited",
    "GUJRAT ALKALIES AND CHEMICALS LIMITED (GACL)", "KUTCH COPPER LIMITED",
    "Atul-Indian Chemical Company", "Swastik Plasticizers", "Paradeep Phosphates Limited",
    "Lanxess-Energizing Chemistry", "Khaitan Chemicals and Fertilizers Limited",
    "Shreas Industries Limited", "TGV-SRAAC Limited Sree Rayalaseema Alkalies and Allied Chemicals Limited",
    "The Andhra Sugars Ltd.", "Payal Polyplast Pvt. Ltd.", "Accord Chemical Corportion",
];

const manufacturerDestinations = {
    "DCM Shriram Industries Ltd.": ["Kota","Jhagadia"],
    "Grassim Industries Limited": ["Rehla", "Renukoot", "Magda"],
    "Khaitan Chemicals and Fertilizers Limited": ["Jhansi", "Maluan", "Rajnandgoan","Nimrani"],
};

function getDestinationsForManufacturer(manufacturerName) {
    if (!manufacturerName) return [];
    const trimmed = String(manufacturerName).trim();
    const upper = trimmed.toUpperCase();
    if (manufacturerDestinations[trimmed]) return manufacturerDestinations[trimmed];
    const matchedKey = Object.keys(manufacturerDestinations).find((key) => key.toUpperCase() === upper);
    return matchedKey ? manufacturerDestinations[matchedKey] : [];
}

function money(value) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value) || 0);
}

function getQuantity(order) {
    return `${order.qty ?? ""}${order.qtyUnit ? ` ${order.qtyUnit}` : ""}`.trim() || "—";
}

function getGstExtra(order) {
    if (typeof order.gstExtra !== "boolean") return "Not specified";
    return order.gstExtra ? "GST Extra" : "No GST Extra";
}

function downloadCSV(orders) {
    const columns = [
        ["serialNo", "S.No."], ["orderNumber", "Order Number"], ["orderDate", "Order Date"],
        ["companyName", "Company Name"], ["manufacturerName", "Manufacturer / Trader"],
        ["place", "Place / Destination"], ["qty", "Quantity"], ["qtyUnit", "Quantity Unit"],
        ["filledBy", "Form Filled By"], ["ipAddress", "IP Address"], ["customerName", "Customer Name"],
        ["customerAddress", "Customer Address"], ["customerNumber", "Customer Number"],
        ["emailId", "Customer Email"], ["rate", "Rate"], ["gstExtra", "GST Extra"],
        ["freight", "Freight"], ["exFor", "Ex/For"], ["paymentTerms", "Payment Terms"],
        ["itemName", "Item Name"], ["brokerName", "Broker Name"],
        ["brokerContactNumber", "Broker Contact Number"], ["brokerEmailId", "Broker Email"],
        ["otherPersonName", "Other Person Name"],
    ];

    const escapeCSV = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [
        columns.map((column) => escapeCSV(column[1])).join(","),
        ...orders.map((order) =>
            columns.map(([key]) => {
                if (key === "qty") return escapeCSV(getQuantity(order));
                if (key === "gstExtra") return escapeCSV(getGstExtra(order));
                return escapeCSV(order[key]);
            }).join(",")
        ),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sudha-sales-orders.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

export default function SalesOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [ready, setReady] = useState(false);
    const [notice, setNotice] = useState("");

    // ✅ 1. Database se fetch karo
    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders() {
        try {
            setReady(false);
            const res = await fetch('/api/sales-orders');
            const data = await res.json();
            if (data.orders) {
                setOrders(data.orders);
            }
        } catch {
            setNotice("Failed to load sales orders.");
        } finally {
            setReady(true);
        }
    }

    useEffect(() => {
        if (!notice) return;
        const timeoutId = window.setTimeout(() => setNotice(""), 4000);
        return () => window.clearTimeout(timeoutId);
    }, [notice]);

    const filteredOrders = useMemo(() => {
        const query = search.trim().toLowerCase();
        return orders.filter((order) => {
            const searchable = [
                order.orderNumber, order.orderDate, order.companyName, order.manufacturerName,
                order.customerName, order.customerNumber, order.emailId, order.itemName,
                order.place, order.brokerName, order.otherPersonName, order.filledBy,
                getQuantity(order),
            ].join(" ").toLowerCase();
            return searchable.includes(query);
        }).sort((a, b) => Number(b.serialNo) - Number(a.serialNo));
    }, [orders, search]);

    const editFormDestinations = getDestinationsForManufacturer(editForm.manufacturerName);
    const showEditPlaceField = editFormDestinations.length > 0;

    // ✅ 2. Database se delete karo
    async function deleteOrder(order) {
        if (!window.confirm(`Delete Sales Order #${order.orderNumber}? This cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/sales-orders?id=${order.id}`, { method: 'DELETE' });
            if (res.ok) {
                setNotice(`Sales Order #${order.orderNumber} deleted.`);
                fetchOrders();
            } else {
                setNotice("Failed to delete order.");
            }
        } catch {
            setNotice("Server connection error.");
        }
    }

    function startEdit(order) {
        setEditingOrder(order);
        setEditForm({ ...order, qty: order.qty ?? "", qtyUnit: order.qtyUnit || "KG", gstExtra: typeof order.gstExtra === "boolean" ? order.gstExtra : true });
        setSelectedOrder(null);
    }

    // ✅ 3. Database me update karo
    async function saveEditedOrder(event) {
        event.preventDefault();
        if (!editingOrder) return;

        const qty = Number(editForm.qty);
        const rate = Number(editForm.rate);
        const freight = Number(editForm.freight ?? 0);

        if (!editForm.itemName) return setNotice("Please enter an item name.");
        if (!Number.isFinite(qty) || qty <= 0) return setNotice("Quantity must be > 0.");
        if (!Number.isFinite(rate) || rate < 0) return setNotice("Please enter a valid rate.");

        const updatedOrder = {
            ...editingOrder,
            ...editForm,
            itemName: editForm.itemName,
            qty,
            qtyUnit: editForm.qtyUnit,
            rate,
            freight: Number.isFinite(freight) ? freight : 0,
            place: showEditPlaceField ? editForm.place || "" : "",
        };

        try {
            const res = await fetch('/api/sales-orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedOrder),
            });

            if (res.ok) {
                setEditingOrder(null);
                setEditForm({});
                setNotice(`Sales Order #${editingOrder.orderNumber} updated successfully.`);
                fetchOrders();
            } else {
                setNotice("Failed to update order in database.");
            }
        } catch {
            setNotice("Server connection error.");
        }
    }

    function printOrder(order) {
        const rows = [
            ["Order Number", order.orderNumber], ["Order Date", order.orderDate],
            ["Company Name", order.companyName], ["Manufacturer / Trader", order.manufacturerName],
            ["Place / Destination", order.place], ["Quantity", getQuantity(order)],
            ["Filled By", order.filledBy], ["Customer Name", order.customerName],
            ["Customer Address", order.customerAddress], ["Customer Number", order.customerNumber],
            ["Email", order.emailId], ["Item Name", order.itemName], ["Rate", money(order.rate)],
            ["GST", getGstExtra(order)], ["Freight", money(order.freight)], ["Ex/For", order.exFor],
            ["Payment Terms", order.paymentTerms], ["Broker Name", order.brokerName],
            ["Broker Contact Number", order.brokerContactNumber], ["Broker Email", order.brokerEmailId],
            ["Other Person Name", order.otherPersonName],
        ];
        const printWindow = window.open("", "_blank", "width=900,height=700");
        if (!printWindow) return setNotice("Please allow pop-ups.");
        const esc = (value) => String(value ?? "—").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
        printWindow.document.write(`<!doctype html><html><head><title>Sales Order ${esc(order.orderNumber)}</title><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;color:#172033;padding:32px}h1{margin:0;color:#0f172a}p{color:#64748b;margin-top:6px}.top{border-bottom:3px solid #2563eb;padding-bottom:18px;margin-bottom:24px}table{width:100%;border-collapse:collapse}td{border:1px solid #cbd5e1;padding:11px;font-size:13px}td:first-child{font-weight:bold;background:#f1f5f9;width:34%}.footer{margin-top:30px;font-size:11px;color:#64748b}</style></head><body><div class="top"><h1>SUDHA CHEMICALS</h1><p>SALES ORDER</p></div><table>${rows.map(([label, value]) => `<tr><td>${esc(label)}</td><td>${esc(value || "—")}</td></tr>`).join("")}</table><p class="footer">Generated from Sudha Chemicals Sales Order Management.</p><script>window.onload=()=>{window.print();};</script></body></html>`);
        printWindow.document.close();
    }

    function shareOrder(order) {
        const subject = `Sudha Chemicals - Sales Order #${order.orderNumber}`;
        const body = [
            "SUDHA CHEMICALS", "SALES ORDER DETAILS", "",
            `Order Number: ${order.orderNumber || "-"}`, `Order Date: ${order.orderDate || "-"}`,
            `Company: ${order.companyName || "-"}`, `Manufacturer / Trader: ${order.manufacturerName || "-"}`,
            `Place / Destination: ${order.place || "-"}`, `Quantity: ${getQuantity(order)}`,
            `Customer: ${order.customerName || "-"}`, `Item: ${order.itemName || "-"}`,
            `Rate: ${money(order.rate)}`, `GST: ${getGstExtra(order)}`, `Freight: ${money(order.freight)}`,
        ].join("\n");
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    function shareFilteredOrders() {
        if (filteredOrders.length === 0) return;
        const subject = "Sudha Chemicals - Sales Orders";
        const body = filteredOrders.map((order) => `Order #${order.orderNumber} | Customer: ${order.customerName} | Item: ${order.itemName}`).join("\n\n");
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

    return (
        <main className="min-h-screen bg-slate-100 text-slate-900">
            <header className="bg-slate-950 text-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-xl font-black">S</div>
                        <div>
                            <p className="text-lg font-bold tracking-wide">SUDHA CHEMICALS</p>
                            <p className="text-xs text-slate-400">Sales Order Management</p>
                        </div>
                    </div>
                    <Link href="/inventory" className="rounded-xl border border-slate-700 px-5 py-3 text-center text-sm font-bold transition hover:bg-slate-900">Inventory Dashboard →</Link>
                    <Link href="/sales-order" className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-bold transition hover:bg-blue-500">+ Create Sales Order</Link>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Order Administration</p>
                    <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Sales Orders</h1>
                    <p className="mt-2 text-sm text-slate-500">Search, review, track and share your recorded customer orders.</p>
                </div>

                {notice && (
                    <div className="fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-md items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4 shadow-2xl">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-black text-blue-600">i</span>
                        <div className="min-w-0 flex-1">
                            <p className="mt-1 break-words text-sm font-bold text-blue-900">{notice}</p>
                        </div>
                        <button type="button" onClick={() => setNotice("")} className="rounded-lg px-2 py-1 text-lg font-bold text-slate-400 hover:bg-black/5">×</button>
                    </div>
                )}

                <div className="mb-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Total Sales Orders</p>
                        <p className="mt-2 text-3xl font-black text-slate-950">{ready ? orders.length : "—"}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Matching Results</p>
                        <p className="mt-2 text-3xl font-black text-blue-700">{ready ? filteredOrders.length : "—"}</p>
                    </div>
                </div>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
                    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-lg font-bold">Order Register</h2>
                            <p className="mt-1 text-sm text-slate-500">Review saved orders and export records for sharing.</p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer, company, item..." className={inputClass + " sm:min-w-64"} />
                            <button onClick={() => downloadCSV(filteredOrders)} disabled={filteredOrders.length === 0} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40">Export CSV ↓</button>
                        </div>
                    </div>

                    {!ready ? (
                        <div className="p-12 text-center text-sm text-slate-500">Loading sales orders...</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">{orders.length === 0 ? "▤" : "⌕"}</div>
                            <h3 className="mt-5 text-lg font-bold">{orders.length === 0 ? "No sales orders yet" : "No matching orders"}</h3>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1350px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-5 py-4 font-bold">Order</th>
                                        <th className="px-5 py-4 font-bold">Company</th>
                                        <th className="px-5 py-4 font-bold">Manufacturer</th>
                                        <th className="px-5 py-4 font-bold">Destination</th>
                                        <th className="px-5 py-4 font-bold">Customer</th>
                                        <th className="px-5 py-4 font-bold">Item Name</th>
                                        <th className="px-5 py-4 font-bold">Quantity</th>
                                        <th className="px-5 py-4 font-bold">Rate</th>
                                        <th className="px-5 py-4 font-bold">Filled By</th>
                                        <th className="px-5 py-4 font-bold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id} className="transition hover:bg-blue-50/40">
                                            <td className="px-5 py-4">
                                                <p className="font-bold text-blue-700">{order.orderNumber}</p>
                                                <p className="text-xs text-slate-400">{order.orderDate}</p>
                                            </td>
                                            <td className="px-5 py-4"><span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-800">{order.companyName || "—"}</span></td>
                                            <td className="px-5 py-4"><span className="rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-bold text-violet-800">{order.manufacturerName || "—"}</span></td>
                                            <td className="px-5 py-4">{order.place ? <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-800">📍 {order.place}</span> : "—"}</td>
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-800">{order.customerName || "—"}</p>
                                                <p className="mt-1 text-xs text-slate-400">{order.customerNumber || "—"}</p>
                                            </td>
                                            <td className="px-5 py-4 font-medium text-slate-700">{order.itemName || "—"}</td>
                                            <td className="px-5 py-4 font-semibold tabular-nums">{getQuantity(order)}</td>
                                            <td className="px-5 py-4 font-semibold tabular-nums">{money(order.rate)}</td>
                                            <td className="px-5 py-4 text-slate-700">{order.filledBy || "—"}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setSelectedOrder(order)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold hover:bg-blue-50">View</button>
                                                    <button onClick={() => startEdit(order)} className="rounded-lg border border-emerald-100 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50">Edit</button>
                                                    <button onClick={() => printOrder(order)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Print</button>
                                                    <button onClick={() => deleteOrder(order)} className="rounded-lg border border-red-100 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">Delete</button>
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

            {/* EDIT MODAL (Same design) */}
            {editingOrder && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
                    <section className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between gap-3 bg-slate-950 px-6 py-5 text-white">
                            <div><p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">Update Order Record</p><h2 className="mt-1 text-xl font-black">Edit Sales Order {editingOrder.orderNumber}</h2></div>
                            <button onClick={() => setEditingOrder(null)} className="rounded-xl border border-slate-700 px-3 py-2 hover:bg-slate-800">✕</button>
                        </div>
                        <form onSubmit={saveEditedOrder} className="p-6">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">Company Name</span><select value={editForm.companyName || ""} onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })} className={inputClass}><option value="">Select company</option>{companies.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
                                <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">Manufacturer / Trader</span><select value={editForm.manufacturerName || ""} onChange={(e) => setEditForm({ ...editForm, manufacturerName: e.target.value, place: "" })} className={inputClass}><option value="">Select manufacturer</option>{manufacturerOptions.map((m) => <option key={m} value={m}>{m}</option>)}</select></label>
                                {showEditPlaceField ? (
                                    <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">Destination</span><select value={editForm.place || ""} onChange={(e) => setEditForm({ ...editForm, place: e.target.value })} className={inputClass}><option value="">Select destination</option>{editFormDestinations.map((dest) => <option key={dest} value={dest}>📍 {dest}</option>)}</select></label>
                                ) : (
                                    <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">Destination</span><div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">No preset destination</div></label>
                                )}
                                {[["customerName", "Customer Name"], ["customerAddress", "Customer Address"], ["customerNumber", "Customer Number"], ["emailId", "Customer Email"], ["itemName", "Item Name"], ["rate", "Rate"], ["freight", "Freight"], ["exFor", "Ex/For"], ["paymentTerms", "Payment Terms"], ["filledBy", "Form Filled By"], ["brokerName", "Broker Name"], ["brokerContactNumber", "Broker Contact Number"], ["brokerEmailId", "Broker Email"], ["otherPersonName", "Other Person Name"]].map(([key, label]) => (
                                    <label key={key} className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span><input value={editForm[key] ?? ""} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} type={key === "rate" || key === "freight" ? "number" : "text"} className={inputClass} /></label>
                                ))}
                                <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">Quantity</span><div className="flex gap-2"><input required value={editForm.qty ?? ""} onChange={(e) => setEditForm({ ...editForm, qty: e.target.value })} className={inputClass} /><select value={editForm.qtyUnit || "KG"} onChange={(e) => setEditForm({ ...editForm, qtyUnit: e.target.value })} className={inputClass + " max-w-28"}>{[["L", "L"], ["KG", "KG"], ["MT", "MT"], ["BAG", "BAG"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></label>
                                <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">GST Setting</span><select value={String(editForm.gstExtra !== false)} onChange={(e) => setEditForm({ ...editForm, gstExtra: e.target.value === "true" })} className={inputClass}><option value="true">Rate + GST Extra</option><option value="false">No GST Extra</option></select></label>
                            </div>
                            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                                <button type="button" onClick={() => setEditingOrder(null)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700">Save Changes</button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {/* VIEW MODAL (Same design) */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedOrder(null); }}>
                    <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between gap-3 bg-slate-950 px-6 py-5 text-white">
                            <div><p className="text-xs font-semibold uppercase tracking-widest text-blue-300">Sales Order Details</p><h2 className="mt-1 text-xl font-black">{selectedOrder.orderNumber}</h2></div>
                            <button onClick={() => setSelectedOrder(null)} className="rounded-xl border border-slate-700 px-3 py-2 hover:bg-slate-800">✕</button>
                        </div>
                        <div className="grid gap-4 p-6 sm:grid-cols-2">
                            {[["Company Name", selectedOrder.companyName], ["Manufacturer / Trader", selectedOrder.manufacturerName], ["Order Date", selectedOrder.orderDate], ["Place / Destination", selectedOrder.place], ["Quantity", getQuantity(selectedOrder)], ["Form Filled By", selectedOrder.filledBy], ["Customer Name", selectedOrder.customerName], ["Customer Address", selectedOrder.customerAddress], ["Customer Number", selectedOrder.customerNumber], ["Customer Email", selectedOrder.emailId], ["Item Name", selectedOrder.itemName], ["Rate", money(selectedOrder.rate)], ["GST Extra", getGstExtra(selectedOrder)], ["Freight", money(selectedOrder.freight)], ["Ex/For", selectedOrder.exFor], ["Payment Terms", selectedOrder.paymentTerms], ["Broker Name", selectedOrder.brokerName], ["Broker Contact", selectedOrder.brokerContactNumber], ["Broker Email", selectedOrder.brokerEmailId], ["Other Person Name", selectedOrder.otherPersonName]].map(([label, value]) => (
                                <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 break-words text-sm font-bold text-slate-800">{value === null || value === undefined || value === "" ? "—" : value}</p></div>
                            ))}
                        </div>
                        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 p-5">
                            <button onClick={() => startEdit(selectedOrder)} className="rounded-xl border border-emerald-200 px-5 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50">Edit Order</button>
                            <button onClick={() => printOrder(selectedOrder)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Print Order</button>
                            <button onClick={() => setSelectedOrder(null)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Close</button>
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
}