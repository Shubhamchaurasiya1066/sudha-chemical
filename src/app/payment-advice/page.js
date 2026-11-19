"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const PAYMENT_MODES = ["NEFT", "RTGS", "UPI", "Cheque", "Cash"];

const suppliers = [
  "DCM Shriram Industries Ltd.", "Grassim Industries Limited", "Meghmani Organics Limited",
  "GUJRAT ALKALIES AND CHEMICALS LIMITED (GACL)", "KUTCH COPPER LIMITED", "Atul-Indian Chemical Company",
  "Swastik Plasticizers", "Paradeep Phosphates Limited", "Lanxess-Energizing Chemistry",
  "Khaitan Chemicals and Fertilizers Limited", "Shreas Industries Limited",
  "TGV-SRAAC Limited Sree Rayalaseema Alkalies and Allied Chemicals Limited",
  "The Andhra Sugars Ltd.", "Payal Polyplast Pvt. Ltd.", "Accord Chemical Corportion",
];

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

const emptyBill = { billNo: "", billDate: "", billAmount: "", adjustedAmount: "", tds: "", tcs: "" };

function numberToWords(num) {
  if (!num || num === 0) return "Zero Rupees Only";
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const inWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "");
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
  };
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = `${inWords(rupees)} Rupees`;
  if (paise > 0) result += ` and ${inWords(paise)} Paise`;
  return result + " Only";
}

function formatDate(str) {
  if (!str) return "-";
  try {
    return str.split("-").reverse().join("/");
  } catch {
    return str;
  }
}

export default function PaymentAdvicePage() {
  const [form, setForm] = useState({
    type: "Paid",
    partyName: "",
    adviceDate: "",
    paymentMode: "NEFT",
    bankName: "",
    transactionRef: "",
    remarks: "",
    bills: [{ ...emptyBill }],
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [allAdvices, setAllAdvices] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setForm((prev) => ({ ...prev, adviceDate: new Date().toISOString().slice(0, 10) }));
    fetchAdvices();
  }, []);

  async function fetchAdvices() {
    try {
      const res = await fetch('/api/payment-advices');
      const data = await res.json();
      if (data.advices) {
        setAllAdvices(data.advices);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function getPaidAmountForBill(billNo) {
    if (!billNo) return 0;
    return allAdvices.reduce((sum, adv) => {
      const matchedBills = (adv.bills || []).filter((b) => b.billNo === billNo);
      return sum + matchedBills.reduce((s, b) => s + (Number(b.adjustedAmount) || 0), 0);
    }, 0);
  }

  function updateField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function updateBill(index, field, value) {
    const newBills = [...form.bills];
    newBills[index][field] = value;
    setForm((prev) => ({ ...prev, bills: newBills }));
  }

  function addBill() {
    setForm((prev) => ({ ...prev, bills: [...prev.bills, { ...emptyBill }] }));
  }

  function removeBill(index) {
    if (form.bills.length === 1) return;
    setForm((prev) => ({ ...prev, bills: prev.bills.filter((_, i) => i !== index) }));
  }

  function validate() {
    const next = {};
    if (!form.partyName.trim()) next.partyName = "Party Name is required.";
    if (!form.adviceDate) next.adviceDate = "Advice Date is required.";
    if (!form.bankName.trim()) next.bankName = "Bank Name is required.";
    if (!form.transactionRef.trim()) next.transactionRef = "Transaction Reference is required.";

    let billError = false;
    form.bills.forEach((b, i) => {
      if (!b.billNo) { next[`bill_${i}_no`] = "Bill No required"; billError = true; }
      if (!b.billAmount || Number(b.billAmount) < 0) { next[`bill_${i}_amt`] = "Invalid amount"; billError = true; }
      if (!b.adjustedAmount || Number(b.adjustedAmount) < 0) { next[`bill_${i}_adj`] = "Invalid amount"; billError = true; }
    });
    if (billError) next.bills = "Please fill bill details correctly.";
    return next;
  }

  async function handleDownloadPDF(e) {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsDownloading(true);

    try {
      const nextSerial = allAdvices.length + 1;
      const adviceNumber = `PA-${new Date().getFullYear()}-${String(nextSerial).padStart(4, "0")}`;

      const totalAmount = form.bills.reduce((sum, b) => sum + (Number(b.adjustedAmount) || 0), 0);

      const newAdvice = {
        ...form,
        adviceNumber,
        totalAmount,
        id: `${Date.now()}-${nextSerial}`,
        createdAt: new Date().toISOString(),
      };

      // ✅ API Call Karo (Save to Database)
      const res = await fetch('/api/payment-advices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdvice),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      // PDF Generate Code (Same as before)
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "210mm";
      container.innerHTML = buildPdfHtml(newAdvice);
      document.body.appendChild(container);

      const canvas = await html2canvas(container.firstElementChild, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Payment_Advice_${adviceNumber}.pdf`);

      document.body.removeChild(container);

      setForm({
        type: "Paid", partyName: "", adviceDate: new Date().toISOString().slice(0, 10),
        paymentMode: "NEFT", bankName: "", transactionRef: "", remarks: "", bills: [{ ...emptyBill }],
      });
      fetchAdvices(); // Refresh list for next calculation
      setSuccess(`Payment Advice ${adviceNumber} generated & saved!`);
    } catch (e) {
      console.error(e);
      alert("Error: " + e.message);
    } finally {
      setIsDownloading(false);
    }
  }

  // buildPdfHtml function same as before (no changes needed)
  function buildPdfHtml(advice) {
    const billsRows = advice.bills.map((b) => `
      <tr>
        <td style="padding:8px;border:1px solid #000;text-align:left;">${b.billNo}</td>
        <td style="padding:8px;border:1px solid #000;text-align:left;">${b.billDate ? b.billDate.split("-").reverse().join("/") : "-"}</td>
        <td style="padding:8px;border:1px solid #000;text-align:right;">₹ ${Number(b.billAmount || 0).toFixed(2)}</td>
        <td style="padding:8px;border:1px solid #000;text-align:right;">₹ ${Number(b.adjustedAmount || 0).toFixed(2)}</td>
        <td style="padding:8px;border:1px solid #000;text-align:right;">₹ ${Number(b.tds || 0).toFixed(2)}</td>
        <td style="padding:8px;border:1px solid #000;text-align:right;">₹ ${Number(b.tcs || 0).toFixed(2)}</td>
        <td style="padding:8px;border:1px solid #000;text-align:right;">₹ ${(Number(b.adjustedAmount || 0) - Number(b.tds || 0) - Number(b.tcs || 0)).toFixed(2)}</td>
      </tr>
    `).join("");

    const totalAdjusted = advice.bills.reduce((s, b) => s + Number(b.adjustedAmount || 0), 0);
    const totalTds = advice.bills.reduce((s, b) => s + Number(b.tds || 0), 0);
    const totalTcs = advice.bills.reduce((s, b) => s + Number(b.tcs || 0), 0);
    const grandTotal = totalAdjusted - totalTds - totalTcs;

    return `
      <div style="font-family:'Times New Roman',serif;padding:15mm 16mm;width:210mm;box-sizing:border-box;color:#000;background:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <div style="width:35%;"><img src="/Sudha Chemical Company Logo.png" style="width:250px;object-fit:contain;" /></div>
          <div style="width:60%;text-align:right;font-size:12px;line-height:1.4;color:#333;">
            <div style="font-weight:bold;font-size:16px;margin-bottom:4px;">SUDHA CHEMICAL COMPANY</div>
            <div>Sukh-Swaroop Sadan, Danaoli</div>
            <div>Lashkar, Gwalior - 474 001 (M.P.)</div>
            <div>Phone: 0751-4926338, 4041862</div>
            <div>Email: sudhachemical@rediffmail.com</div>
            <div><b>GSTIN:</b> 23AAXXXXXXX</div>
          </div>
        </div>
        <hr style="border:none;border-top:2px solid #000;margin:8px 0 18px 0;" />
        <div style="text-align:center;font-size:18px;font-weight:bold;margin-bottom:20px;text-decoration:underline;">
          PAYMENT ADVICE
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:20px;font-size:13px;line-height:1.6;">
          <div>
            <div><b>Advice No:</b> ${advice.adviceNumber}</div>
            <div><b>Advice Date:</b> ${advice.adviceDate.split("-").reverse().join("/")}</div>
            <div><b>Party Name:</b> ${advice.partyName}</div>
            <div><b>Payment Mode:</b> ${advice.paymentMode}</div>
          </div>
          <div style="text-align:right;">
            <div><b>Bank Name:</b> ${advice.bankName}</div>
            <div><b>Transaction Ref:</b> ${advice.transactionRef}</div>
            <div><b>Type:</b> Amount Paid</div>
          </div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr style="background:#f0f0f0;">
              <th style="padding:8px;border:1px solid #000;text-align:left;">Bill No</th>
              <th style="padding:8px;border:1px solid #000;text-align:left;">Bill Date</th>
              <th style="padding:8px;border:1px solid #000;text-align:right;">Bill Amount</th>
              <th style="padding:8px;border:1px solid #000;text-align:right;">Adjusted Amt</th>
              <th style="padding:8px;border:1px solid #000;text-align:right;">TDS</th>
              <th style="padding:8px;border:1px solid #000;text-align:right;">TCS</th>
              <th style="padding:8px;border:1px solid #000;text-align:right;">Net Adjusted</th>
            </tr>
          </thead>
          <tbody>${billsRows}</tbody>
          <tfoot>
            <tr style="background:#f9f9f9;font-weight:bold;">
              <td colspan="3" style="padding:8px;border:1px solid #000;text-align:right;">Total</td>
              <td style="padding:8px;border:1px solid #000;text-align:right;">₹ ${totalAdjusted.toFixed(2)}</td>
              <td style="padding:8px;border:1px solid #000;text-align:right;">₹ ${totalTds.toFixed(2)}</td>
              <td style="padding:8px;border:1px solid #000;text-align:right;">₹ ${totalTcs.toFixed(2)}</td>
              <td style="padding:8px;border:1px solid #000;text-align:right;">₹ ${grandTotal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        <div style="margin-top:15px;font-size:13px;border:1px solid #000;padding:10px;background:#fafafa;">
          <b>Total Amount Paid:</b> ₹ ${grandTotal.toFixed(2)}
          <br/><br/>
          <b>Amount in Words:</b> ${numberToWords(grandTotal)}
        </div>
        ${advice.remarks ? `<div style="margin-top:12px;font-size:12px;"><b>Remarks:</b> ${advice.remarks}</div>` : ""}
        <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:40px;padding:0 10px;">
          <div style="font-size:12px;line-height:1.6;color:#333;font-style:italic;">
            <div style="font-weight:bold;font-size:14px;color:#0f766e;margin-bottom:4px;">Thank You!</div>
            <div>We appreciate your business and look forward to</div>
            <div>continuing our partnership.</div>
            <div style="margin-top:6px;font-size:10px;color:#888;">For any queries, contact us at sudhachemical@rediffmail.com</div>
          </div>
          <div style="text-align:center;padding-right:20px;">
            <div style="border-top:1px solid #000;margin-top:5px;padding-top:5px;width:200px;text-align:center;font-size:12px;font-weight:bold;">
              Authorized Signatory
            </div>
          </div>
        </div>
      </div>
    `;
  }

  const previewTotalAdjusted = form.bills.reduce((s, b) => s + (Number(b.adjustedAmount) || 0), 0);
  const previewTotalTds = form.bills.reduce((s, b) => s + (Number(b.tds) || 0), 0);
  const previewTotalTcs = form.bills.reduce((s, b) => s + (Number(b.tcs) || 0), 0);
  const previewGrandTotal = previewTotalAdjusted - previewTotalTds - previewTotalTcs;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black">S</div>
            <div>
              <p className="text-lg font-bold tracking-wide">SUDHA CHEMICALS</p>
              <p className="text-xs text-slate-400">Payment Advice</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/payment-history" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold hover:bg-slate-900">Payment History →</Link>
            <Link href="/" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold hover:bg-slate-900">Home</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Create Payment Advice</h1>
          <p className="mt-2 text-sm text-slate-500">Fill the form, check the preview, then download PDF.</p>
        </div>

        {success && (
          <div className="fixed right-4 top-4 z-[100] rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-800 shadow-2xl">
            ✓ {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleDownloadPDF} className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-black">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">01</span>
                Basic Details
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Advice Date *</label>
                  <input type="date" name="adviceDate" value={form.adviceDate} onChange={updateField} className={inputClass} />
                  {errors.adviceDate && <p className="mt-1 text-xs text-red-600">{errors.adviceDate}</p>}
                </div>
                <div>
                  <label className={labelClass}>Supplier Name *</label>
                  <select name="partyName" value={form.partyName} onChange={updateField} className={inputClass}>
                    <option value="">Select Supplier</option>
                    {suppliers.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {errors.partyName && <p className="mt-1 text-xs text-red-600">{errors.partyName}</p>}
                </div>
                <div>
                  <label className={labelClass}>Payment Mode *</label>
                  <select name="paymentMode" value={form.paymentMode} onChange={updateField} className={inputClass}>
                    {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Bank Name *</label>
                  <input type="text" name="bankName" value={form.bankName} onChange={updateField} placeholder="e.g. HDFC Bank" className={inputClass} />
                  {errors.bankName && <p className="mt-1 text-xs text-red-600">{errors.bankName}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Transaction / UTR Reference *</label>
                  <input type="text" name="transactionRef" value={form.transactionRef} onChange={updateField} placeholder="e.g. UTR123456789" className={inputClass} />
                  {errors.transactionRef && <p className="mt-1 text-xs text-red-600">{errors.transactionRef}</p>}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-black">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">02</span>
                  Bill Details
                </h2>
                <button type="button" onClick={addBill} className="rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-700">
                  + Add Bill
                </button>
              </div>

              {errors.bills && <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm font-semibold text-red-600">{errors.bills}</p>}

              <div className="space-y-3">
                {form.bills.map((bill, index) => (
                  <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Bill No / Order</label>
                        <input type="text" value={bill.billNo} onChange={(e) => updateBill(index, "billNo", e.target.value)} placeholder="e.g. PO-2026-0001" className={inputClass + " bg-white"} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Bill Date</label>
                        <input type="date" value={bill.billDate} onChange={(e) => updateBill(index, "billDate", e.target.value)} className={inputClass + " bg-white"} />
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Bill Amt</label>
                        <input type="number" value={bill.billAmount} onChange={(e) => updateBill(index, "billAmount", e.target.value)} placeholder="0" className={inputClass + " bg-white"} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Adjusted</label>
                        <input type="number" value={bill.adjustedAmount} onChange={(e) => updateBill(index, "adjustedAmount", e.target.value)} placeholder="0" className={inputClass + " bg-white"} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">TDS</label>
                        <input type="number" value={bill.tds} onChange={(e) => updateBill(index, "tds", e.target.value)} placeholder="0" className={inputClass + " bg-white"} />
                      </div>
                      <div className="flex gap-1">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">TCS</label>
                          <input type="number" value={bill.tcs} onChange={(e) => updateBill(index, "tcs", e.target.value)} placeholder="0" className={inputClass + " bg-white"} />
                        </div>
                        <button type="button" onClick={() => removeBill(index)} disabled={form.bills.length === 1} className="mt-5 rounded-lg bg-red-100 px-2 text-xs font-bold text-red-600 hover:bg-red-200 disabled:opacity-30">✕</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-black">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">03</span>
                Remarks (Optional)
              </h2>
              <textarea name="remarks" value={form.remarks} onChange={updateField} rows={2} placeholder="Any additional notes..." className={inputClass} />
            </section>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => window.location.reload()} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Reset</button>
              <button type="submit" disabled={isDownloading} className="rounded-xl bg-blue-700 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-blue-800 disabled:opacity-50">
                {isDownloading ? "⏳ Generating..." : "📥 Download PDF & Save"}
              </button>
            </div>
          </form>

          {/* LIVE PREVIEW COLUMN (same as before) */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-lg overflow-hidden">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-black">👁 Live Preview</h2>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">A4</span>
              </div>
              <div className="overflow-auto rounded-2xl border border-slate-200 bg-white max-h-[850px]">
                <div style={{ fontFamily: "'Times New Roman', serif", width: "210mm", minHeight: "297mm", padding: "15mm 16mm", boxSizing: "border-box", color: "#000", background: "#fff", transform: "scale(0.55)", transformOrigin: "top left", marginBottom: "-45%", marginRight: "-45%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div style={{ width: "35%" }}><img src="/Sudha Chemical Company Logo.png" alt="Logo" style={{ width: "220px", objectFit: "contain" }} /></div>
                    <div style={{ width: "60%", textAlign: "right", fontSize: "11px", lineHeight: "1.4", color: "#333" }}>
                      <div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "4px" }}>SUDHA CHEMICAL COMPANY</div>
                      <div>Sukh-Swaroop Sadan, Danaoli</div>
                      <div>Lashkar, Gwalior - 474 001 (M.P.)</div>
                      <div>Phone: 0751-4926338, 4041862</div>
                      <div>Email: sudhachemical@rediffmail.com</div>
                      <div><b>GSTIN:</b> 23AAXXXXXXX</div>
                    </div>
                  </div>
                  <hr style={{ border: "none", borderTop: "2px solid #000", margin: "8px 0 18px 0" }} />
                  <div style={{ textAlign: "center", fontSize: "17px", fontWeight: "bold", marginBottom: "18px", textDecoration: "underline" }}>PAYMENT ADVICE</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "18px", fontSize: "12px", lineHeight: "1.6" }}>
                    <div>
                      <div><b>Advice No:</b> PA-Auto</div>
                      <div><b>Advice Date:</b> {formatDate(form.adviceDate)}</div>
                      <div><b>Party Name:</b> {form.partyName || "-"}</div>
                      <div><b>Payment Mode:</b> {form.paymentMode}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div><b>Bank Name:</b> {form.bankName || "-"}</div>
                      <div><b>Transaction Ref:</b> {form.transactionRef || "-"}</div>
                      <div><b>Type:</b> Amount Paid</div>
                    </div>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                    <thead>
                      <tr style={{ background: "#f0f0f0" }}>
                        <th style={{ padding: "7px", border: "1px solid #000", textAlign: "left" }}>Bill No</th>
                        <th style={{ padding: "7px", border: "1px solid #000", textAlign: "left" }}>Bill Date</th>
                        <th style={{ padding: "7px", border: "1px solid #000", textAlign: "right" }}>Bill Amt</th>
                        <th style={{ padding: "7px", border: "1px solid #000", textAlign: "right" }}>Adjusted</th>
                        <th style={{ padding: "7px", border: "1px solid #000", textAlign: "right" }}>TDS</th>
                        <th style={{ padding: "7px", border: "1px solid #000", textAlign: "right" }}>TCS</th>
                        <th style={{ padding: "7px", border: "1px solid #000", textAlign: "right" }}>Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.bills.map((b, i) => (
                        <tr key={i}>
                          <td style={{ padding: "7px", border: "1px solid #000" }}>{b.billNo || "-"}</td>
                          <td style={{ padding: "7px", border: "1px solid #000" }}>{formatDate(b.billDate)}</td>
                          <td style={{ padding: "7px", border: "1px solid #000", textAlign: "right" }}>₹{(Number(b.billAmount) || 0).toFixed(2)}</td>
                          <td style={{ padding: "7px", border: "1px solid #000", textAlign: "right" }}>₹{(Number(b.adjustedAmount) || 0).toFixed(2)}</td>
                          <td style={{ padding: "7px", border: "1px solid #000", textAlign: "right" }}>₹{(Number(b.tds) || 0).toFixed(2)}</td>
                          <td style={{ padding: "7px", border: "1px solid #000", textAlign: "right" }}>₹{(Number(b.tcs) || 0).toFixed(2)}</td>
                          <td style={{ padding: "7px", border: "1px solid #000", textAlign: "right" }}>₹{(Number(b.adjustedAmount || 0) - Number(b.tds || 0) - Number(b.tcs || 0)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: "#f9f9f9", fontWeight: "bold" }}>
                        <td colSpan={3} style={{ padding: "7px", border: "1px solid #000", textAlign: "right" }}>Total</td>
                        <td style={{ padding: "7px", border: "1px solid #000", textAlign: "right" }}>₹{previewTotalAdjusted.toFixed(2)}</td>
                        <td style={{ padding: "7px", border: "1px solid #000", textAlign: "right" }}>₹{previewTotalTds.toFixed(2)}</td>
                        <td style={{ padding: "7px", border: "1px solid #000", textAlign: "right" }}>₹{previewTotalTcs.toFixed(2)}</td>
                        <td style={{ padding: "7px", border: "1px solid #000", textAlign: "right" }}>₹{previewGrandTotal.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                  <div style={{ marginTop: "15px", fontSize: "12px", border: "1px solid #000", padding: "10px", background: "#fafafa" }}>
                    <b>Total Amount Paid:</b> ₹{previewGrandTotal.toFixed(2)}
                    <br /><br />
                    <b>Amount in Words:</b> {numberToWords(previewGrandTotal)}
                  </div>
                  {form.remarks && <div style={{ marginTop: "10px", fontSize: "11px" }}><b>Remarks:</b> {form.remarks}</div>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "35px", padding: "0 10px" }}>
                    <div style={{ fontSize: "11px", lineHeight: "1.6", color: "#333", fontStyle: "italic" }}>
                      <div style={{ fontWeight: "bold", fontSize: "13px", color: "#0f766e", marginBottom: "4px" }}>Thank You!</div>
                      <div>We appreciate your business and look forward to</div>
                      <div>continuing our partnership.</div>
                      <div style={{ marginTop: "6px", fontSize: "9px", color: "#888" }}>For any queries, contact us at sudhachemical@rediffmail.com</div>
                    </div>
                    <div style={{ textAlign: "center", paddingRight: "10px" }}>
                      <div style={{ borderTop: "1px solid #000", marginTop: "5px", paddingTop: "5px", width: "180px", textAlign: "center", fontSize: "11px", fontWeight: "bold" }}>Authorized Signatory</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}