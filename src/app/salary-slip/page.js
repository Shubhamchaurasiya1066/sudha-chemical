"use client";

import { useRef, useState, useEffect } from "react";

export default function SalarySlipPage() {
  const pdfRef = useRef(null);

  const [form, setForm] = useState({
    companyName: "SUN INDCHEMICALS", // Naya dropdown field
    month: "March, 2026",
    code: "68",
    empName: "SHASHWAT NAYYAR",
    department: "ACCOUNTS/LOGISTICS/MARKETING",
    attTotal: "29.00",
    attWD: "28.0",
    attRest: "1.00",
    fatherName: "VINAY KUMAR NAYYAR",
    designation: "MARKETING",
    basicRate: "21540.00",
    payable: "20150.00",

    hra: "13098.00", fooding: "0.00", conv: "0.00",
    exp: "0.00", pIncv: "0.00", arrear: "0.00",
    special: "0.00", incv: "0.00", medical: "0.00",
    mobileAlw: "0.00", transport: "8354.00", washing: "0.00",

    pf: "1800.00", mobileDed: "0.00", esi: "0.00",
    labWel: "5.00", shortage: "0.00", fine: "0.00", profTax: "200.00",
    loan: "", tds: "", nSal: "", sAdvance: "2000.00", rAdvance: "625",

    totalAllow: "41602.00",
    totalDed: "4005.00",
    netPayable: "37597.00",
    signatureDate: "",
  });
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  useEffect(() => {
    async function loadEmployees() {
      try {
        const res = await fetch('/api/employees');
        const data = await res.json();
        if (data.employees) {
          setEmployees(data.employees);
        } else {
          setEmployees([]);
        }
      } catch (error) {
        console.error("Employee loading error:", error);
        setEmployees([]);
      }
    }
    loadEmployees();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEmployeeSelect = (e) => {
    const empId = e.target.value;
    setSelectedEmployeeId(empId);

    // Database se aane wale employees me keys snake_case me hain (emp_id, emp_name)
    const selectedEmployee = employees.find(
      (employee) => employee.emp_id === empId
    );

    if (!selectedEmployee) {
      setForm((prev) => ({
        ...prev, code: "", empName: "", fatherName: "", department: "", designation: "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      code: selectedEmployee.emp_id || "",
      empName: selectedEmployee.emp_name || "",
      fatherName: selectedEmployee.father_name || "",
      department: selectedEmployee.department || "",
      designation: selectedEmployee.designation || "",
    }));
  };

  const getCurrentDateTimeString = () => {
    const now = new Date();
    return now.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const generatePDF = async () => {
    if (!pdfRef.current) return;

    // ✅ API Call: Salary Slip database me save karo
    try {
      const newSlip = {
        ...form,
        id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      };

      const res = await fetch('/api/salary-slips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlip),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save salary slip");
      }
    } catch (error) {
      console.error("Save Error:", error);
      alert("Error saving to database: " + error.message);
      return; // Agar save fail ho jaye to PDF generate mat karo
    }

    // ✅ PDF Generate Code (Same as before)
    setForm((prev) => ({ ...prev, signatureDate: getCurrentDateTimeString() }));
    await new Promise((resolve) => setTimeout(resolve, 150));

    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const canvas = await html2canvas(pdfRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Salary_Slip_${form.empName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <main style={{ background: "#f0f0f0", minHeight: "100vh", padding: 20 }}>

      {/* ================= FORM ================= */}
      <div style={styles.formBox}>
        <h2 style={{ textAlign: "center", marginTop: 0, color: "#1e3a8a" }}>Salary Slip Form</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
          <div>
            <h3 style={{ fontSize: 14, borderBottom: "1px solid #ccc" }}>Basic Info</h3>

            {/* NAYA DROPDOWN: Company Name */}
            <label style={styles.label}>Company Name</label>
            <select style={styles.input} name="companyName" value={form.companyName} onChange={handleChange}>
              <option value="SUDHA CHEMICAL COMPANY">SUDHA CHEMICAL COMPANY</option>
              <option value="SUDHA CORE CHEMICAL PVT. LTD.">SUDHA CORE CHEMICAL PVT. LTD.</option>
              <option value="NIRMAL AGENCIES GWALIOR">NIRMAL AGENCIES GWALIOR</option>
              <option value="NIRMAL AGENCIES BILASPUR">NIRMAL AGENCIES BILASPUR</option>
            </select>

            <label style={styles.label}>Code</label>

            <input
              style={styles.input}
              name="code"
              value={form.code}
              onChange={handleChange}
            />

            <label style={styles.label}>Select Employee</label>

            <select
              style={styles.input}
              value={selectedEmployeeId}
              onChange={handleEmployeeSelect}
            >
              <option value="">-- Select Employee --</option>

              {employees.map((employee) => (
                <option key={employee.emp_id} value={employee.emp_id}>
                  {employee.emp_name} ({employee.emp_id})
                </option>
              ))}
            </select>

            {employees.length === 0 && (
              <p style={{ color: "#dc2626", fontSize: 12, marginTop: 5 }}>
                No employees found. Please add employees in Employee Master first.
              </p>
            )}

            <label style={styles.label}>Employee Name</label>

            <input
              style={styles.input}
              name="empName"
              value={form.empName}
              onChange={handleChange}
            />
            <label style={styles.label}>Department</label><input style={styles.input} name="department" value={form.department} onChange={handleChange} />
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <div style={{ flex: 1 }}><label style={styles.label}>Att. Total</label><input style={styles.input} name="attTotal" value={form.attTotal} onChange={handleChange} /></div>
              <div style={{ flex: 1 }}><label style={styles.label}>WD</label><input style={styles.input} name="attWD" value={form.attWD} onChange={handleChange} /></div>
              <div style={{ flex: 1 }}><label style={styles.label}>REST</label><input style={styles.input} name="attRest" value={form.attRest} onChange={handleChange} /></div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 14, borderBottom: "1px solid #ccc" }}>Other Details</h3>
            <label style={styles.label}>Month</label><input style={styles.input} name="month" value={form.month} onChange={handleChange} />
            <label style={styles.label}>Father's/Husband's Name</label><input style={styles.input} name="fatherName" value={form.fatherName} onChange={handleChange} />
            <label style={styles.label}>Designation</label><input style={styles.input} name="designation" value={form.designation} onChange={handleChange} />
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <div style={{ flex: 1 }}><label style={styles.label}>Basic Rate</label><input style={styles.input} name="basicRate" value={form.basicRate} onChange={handleChange} /></div>
              <div style={{ flex: 1 }}><label style={styles.label}>Payable</label><input style={styles.input} name="payable" value={form.payable} onChange={handleChange} /></div>
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: 14, borderBottom: "1px solid #ccc", marginTop: 20 }}>Allowances</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div><label style={styles.label}>HRA</label><input style={styles.input} name="hra" value={form.hra} onChange={handleChange} /></div>
          <div><label style={styles.label}>Fooding</label><input style={styles.input} name="fooding" value={form.fooding} onChange={handleChange} /></div>
          <div><label style={styles.label}>Conv.</label><input style={styles.input} name="conv" value={form.conv} onChange={handleChange} /></div>
          <div><label style={styles.label}>Exp.</label><input style={styles.input} name="exp" value={form.exp} onChange={handleChange} /></div>
          <div><label style={styles.label}>P. Incv.</label><input style={styles.input} name="pIncv" value={form.pIncv} onChange={handleChange} /></div>
          <div><label style={styles.label}>Arrear</label><input style={styles.input} name="arrear" value={form.arrear} onChange={handleChange} /></div>
          <div><label style={styles.label}>Special</label><input style={styles.input} name="special" value={form.special} onChange={handleChange} /></div>
          <div><label style={styles.label}>Incv.</label><input style={styles.input} name="incv" value={form.incv} onChange={handleChange} /></div>
          <div><label style={styles.label}>Medical</label><input style={styles.input} name="medical" value={form.medical} onChange={handleChange} /></div>
          <div><label style={styles.label}>Mobile</label><input style={styles.input} name="mobileAlw" value={form.mobileAlw} onChange={handleChange} /></div>
          <div><label style={styles.label}>Transport</label><input style={styles.input} name="transport" value={form.transport} onChange={handleChange} /></div>
          <div><label style={styles.label}>Washing</label><input style={styles.input} name="washing" value={form.washing} onChange={handleChange} /></div>
        </div>

        <h3 style={{ fontSize: 14, borderBottom: "1px solid #ccc", marginTop: 20 }}>Deductions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div><label style={styles.label}>PF</label><input style={styles.input} name="pf" value={form.pf} onChange={handleChange} /></div>
          <div><label style={styles.label}>Mobile</label><input style={styles.input} name="mobileDed" value={form.mobileDed} onChange={handleChange} /></div>
          <div><label style={styles.label}>ESI</label><input style={styles.input} name="esi" value={form.esi} onChange={handleChange} /></div>
          <div><label style={styles.label}>Lab. Wel.</label><input style={styles.input} name="labWel" value={form.labWel} onChange={handleChange} /></div>
          <div><label style={styles.label}>Shortage</label><input style={styles.input} name="shortage" value={form.shortage} onChange={handleChange} /></div>
          <div><label style={styles.label}>Fine</label><input style={styles.input} name="fine" value={form.fine} onChange={handleChange} /></div>
          <div><label style={styles.label}>Prof. Tax</label><input style={styles.input} name="profTax" value={form.profTax} onChange={handleChange} /></div>
          <div><label style={styles.label}>Loan</label><input style={styles.input} name="loan" value={form.loan} onChange={handleChange} /></div>
          <div><label style={styles.label}>TDS</label><input style={styles.input} name="tds" value={form.tds} onChange={handleChange} /></div>
          <div><label style={styles.label}>N.Sal.</label><input style={styles.input} name="nSal" value={form.nSal} onChange={handleChange} /></div>
          <div><label style={styles.label}>S. Advance</label><input style={styles.input} name="sAdvance" value={form.sAdvance} onChange={handleChange} /></div>
          <div><label style={styles.label}>R. Advance</label><input style={styles.input} name="rAdvance" value={form.rAdvance} onChange={handleChange} /></div>
        </div>

        <h3 style={{ fontSize: 14, borderBottom: "1px solid #ccc", marginTop: 20 }}>Totals</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div><label style={styles.label}>Total Allow.</label><input style={styles.input} name="totalAllow" value={form.totalAllow} onChange={handleChange} /></div>
          <div><label style={styles.label}>Total Ded.</label><input style={styles.input} name="totalDed" value={form.totalDed} onChange={handleChange} /></div>
          <div><label style={styles.label}>Net Amount Payable</label><input style={styles.input} name="netPayable" value={form.netPayable} onChange={handleChange} /></div>
        </div>

        <button style={styles.button} onClick={generatePDF}>Download PDF</button>
      </div>

      {/* ================= PDF LAYOUT ================= */}
      <div ref={pdfRef} style={styles.pdfPage}>

        {/* Title with Dropdown Value and Full Width Underline */}
        <div style={{ width: "100%", marginBottom: 25 }}>
          <h1 style={{
            fontSize: 26,
            fontWeight: "bold",
            color: "#1e3a8a",
            margin: 0,
            letterSpacing: 1,
            paddingBottom: 5,
            borderBottom: "2px solid #1e3a8a",
            display: "block",      // Inline-block se block kar diya
            width: "100%",         // Poori width de di
            textAlign: "center"    // Text ko beech me rakhne ke liye
          }}>
            {form.companyName}
          </h1>
        </div>

        {/* Top Details Section */}
        <div style={{ width: "100%", borderBottom: "2px solid #1e3a8a", paddingBottom: 12, marginBottom: 15 }}>
          <div style={{ display: "flex", width: "100%", gap: 20 }}>

            <div style={{ flex: 1 }}>
              <div style={styles.row}><span style={styles.labelPdf}>Code</span><span style={styles.colonPdf}>:</span><span style={styles.valPdf}>{form.code}</span></div>
              <div style={styles.row}><span style={styles.labelPdf}>Employee Name</span><span style={styles.colonPdf}>:</span><span style={styles.valPdf}>{form.empName}</span></div>
              <div style={styles.row}><span style={styles.labelPdf}>Department</span><span style={styles.colonPdf}>:</span><span style={styles.valPdf}>{form.department}</span></div>
              <div style={styles.row}><span style={styles.labelPdf}>Attendance</span><span style={styles.colonPdf}>:</span><span style={styles.valPdf}>{form.attTotal} &nbsp; WD: {form.attWD} &nbsp; REST: {form.attRest}</span></div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={styles.row}><span style={styles.labelPdfR}>Month</span><span style={styles.colonPdf}>:</span><span style={styles.valPdf}>{form.month}</span></div>
              <div style={styles.row}><span style={styles.labelPdfR}>Father's/Husband's Name</span><span style={styles.colonPdf}>:</span><span style={styles.valPdf}>{form.fatherName}</span></div>
              <div style={styles.row}><span style={styles.labelPdfR}>Designation</span><span style={styles.colonPdf}>:</span><span style={styles.valPdf}>{form.designation}</span></div>

              <div style={{ marginTop: 8, border: "1px solid #1e3a8a", display: "flex", background: "#e0e7ff" }}>
                <div style={{ flex: 1, padding: "6px 10px", borderRight: "1px solid #1e3a8a", fontWeight: "bold", fontSize: 13 }}>
                  Basic Rate : <span style={{ marginLeft: 10 }}>{form.basicRate}</span>
                </div>
                <div style={{ flex: 1, padding: "6px 10px", fontWeight: "bold", fontSize: 13 }}>
                  Payable : <span style={{ marginLeft: 10 }}>{form.payable}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Sections (Allowances & Deductions) */}
        <div style={{ display: "flex", width: "100%", gap: 15, marginBottom: 15 }}>

          {/* ALLOWANCES */}
          <div style={{ flex: 1, border: "1px solid #1e3a8a" }}>
            <div style={{ backgroundColor: "#1e3a8a", color: "#fff", fontWeight: "bold", fontSize: 13, padding: "6px 10px", letterSpacing: 1 }}>
              ALLOWANCES :-
            </div>
            <div style={{ padding: "12px 10px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px 5px" }}>
              <div style={styles.row}><span style={styles.labelBox}>HRA</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.hra}</span></div>
              <div style={styles.row}><span style={styles.labelBox}>Fooding</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.fooding}</span></div>
              <div style={styles.row}><span style={styles.labelBox}>Conv.</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.conv}</span></div>

              <div style={styles.row}><span style={styles.labelBox}>Exp.</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.exp}</span></div>
              <div style={styles.row}><span style={styles.labelBox}>P. Incv.</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.pIncv}</span></div>
              <div style={styles.row}><span style={styles.labelBox}>Arrear</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.arrear}</span></div>

              <div style={styles.row}><span style={styles.labelBox}>Special</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.special}</span></div>
              <div style={styles.row}><span style={styles.labelBox}>Incv.</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.incv}</span></div>
              <div style={styles.row}><span style={styles.labelBox}>Medical</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.medical}</span></div>

              <div style={styles.row}><span style={styles.labelBox}>Mobile</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.mobileAlw}</span></div>
              <div style={styles.row}><span style={styles.labelBox}>Trans.</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.transport}</span></div>
              <div style={styles.row}><span style={styles.labelBox}>Washing</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.washing}</span></div>
            </div>
          </div>

          {/* DEDUCTIONS */}
          <div style={{ flex: 1, border: "1px solid #1e3a8a" }}>
            <div style={{ backgroundColor: "#1e3a8a", color: "#fff", fontWeight: "bold", fontSize: 13, padding: "6px 10px", letterSpacing: 1 }}>
              DEDUCTIONS :-
            </div>
            <div style={{ padding: "12px 10px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px 5px" }}>
              <div style={styles.row}><span style={styles.labelBox}>PF</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.pf}</span></div>
              <div style={styles.row}><span style={styles.labelBox}>Mobile</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.mobileDed}</span></div>
              <div style={styles.row}><span style={styles.labelBox}>ESI</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.esi}</span></div>

              <div style={styles.row}><span style={styles.labelBox}>Lab.Wel.</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.labWel}</span></div>
              <div style={styles.row}></div>
              <div style={styles.row}><span style={styles.labelBox}>Short.</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.shortage}</span></div>

              <div style={styles.row}></div>
              <div style={styles.row}></div>
              <div style={styles.row}><span style={styles.labelBox}>Fine</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.fine}</span></div>

              <div style={styles.row}></div>
              <div style={styles.row}></div>
              <div style={styles.row}><span style={styles.labelBox}>P.Tax.</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.profTax}</span></div>

              <div style={styles.row}><span style={styles.labelBox}>Loan</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.loan}</span></div>
              <div style={styles.row}><span style={styles.labelBox}>Tds</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.tds}</span></div>
              <div style={styles.row}></div>

              <div style={styles.row}><span style={styles.labelBox}>N.Sal.</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.nSal}</span></div>
              <div style={styles.row}><span style={styles.labelBox}>S.Adv.</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.sAdvance}</span></div>
              <div style={styles.row}><span style={styles.labelBox}>R.Adv.</span><span style={styles.colonBox}>:</span><span style={styles.valBox}>{form.rAdvance}</span></div>
            </div>
          </div>
        </div>

        {/* Bottom Totals Row */}
        <div style={{ display: "flex", width: "100%", border: "1px solid #1e3a8a", padding: "12px 0" }}>
          {/* TOTAL ALLOW */}
          <div style={{ flex: 1, paddingLeft: 15, paddingRight: 10, fontWeight: "bold", fontSize: 13, borderRight: "1px solid #1e3a8a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ whiteSpace: "nowrap" }}>TOTAL ALLOW. :</span>
            <span style={{ fontSize: 15 }}>{form.totalAllow}</span>
          </div>

          {/* TOTAL DED */}
          <div style={{ flex: 1, paddingLeft: 15, paddingRight: 10, fontWeight: "bold", fontSize: 13, borderRight: "1px solid #1e3a8a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ whiteSpace: "nowrap" }}>TOTAL DED. :</span>
            <span style={{ fontSize: 15 }}>{form.totalDed}</span>
          </div>

          {/* NET AMOUNT PAYABLE */}
          <div style={{ flex: 1.2, paddingLeft: 15, paddingRight: 15, fontWeight: "bold", fontSize: 13, color: "#1e3a8a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ whiteSpace: "nowrap" }}>NET AMOUNT PAYABLE :</span>
            <span style={{ fontSize: 16 }}>{form.netPayable}</span>
          </div>
        </div>

        {/* Signatures */}
        <div style={{ marginTop: 50, display: "flex", justifyContent: "flex-end", paddingRight: 20 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: "bold", color: "#1e3a8a", marginBottom: 50 }}>
              For {form.companyName}
            </div>

            <div style={{ fontSize: 14, fontWeight: "bold", color: "#1e3a8a" }}>
              Auth. Signatory
            </div>
            {/* {form.signatureDate && (
               <div style={{ fontSize: 10, color: "#555", marginTop: 4 }}>
                 Date: {form.signatureDate}
               </div>
            )} */}
          </div>
        </div>

      </div>
    </main>
  );
}

/* ================= STYLES ================= */
const styles = {
  formBox: {
    maxWidth: 900,
    margin: "0 auto 20px auto",
    background: "#fff",
    padding: "20px 25px",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  label: {
    display: "block",
    marginTop: 8,
    fontWeight: "bold",
    fontSize: 12,
    color: "#555"
  },
  input: {
    width: "100%",
    padding: "6px 8px",
    marginTop: 4,
    boxSizing: "border-box",
    border: "1px solid #ccc",
    borderRadius: 4,
    fontSize: 13,
  },
  button: {
    marginTop: 25,
    width: "100%",
    padding: 14,
    background: "#1e3a8a",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
  },
  pdfPage: {
    width: "210mm",
    minHeight: "297mm",
    background: "#fff",
    margin: "0 auto",
    padding: "15mm 15mm",
    boxSizing: "border-box",
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#000",
    position: "relative",
  },
  /* Row & Text Alignments */
  row: {
    display: "flex",
    alignItems: "center",
    marginBottom: 6,
  },
  labelPdf: {
    width: "100px",
    fontSize: 12,
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  labelPdfR: {
    width: "150px",
    fontSize: 12,
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  colonPdf: {
    width: "15px",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  valPdf: {
    flex: 1,
    fontSize: 12,
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  /* Grid Box Styles */
  labelBox: {
    width: "45px",
    fontSize: 11,
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  colonBox: {
    width: "10px",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  valBox: {
    flex: 1,
    fontSize: 11,
    fontWeight: "bold",
    whiteSpace: "nowrap",
  }
};