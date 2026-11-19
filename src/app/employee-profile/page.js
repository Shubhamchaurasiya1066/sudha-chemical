"use client";

import { useState, useEffect } from "react";

const initialProfile = {
  empName: "",
  empId: "",
  empNumber: "",
  laptopNumber: "",
  fatherName: "",
  designation: "",
  department: "",
  aadharNo: "",
  panNo: "",
  pfNo: "",
  esiNo: "",
  bankName: "",
  accountNo: "",
  ifscCode: "",
  cvFileName: "",
  cvFileData: "",
  photo: "",
};

// Image compression
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please select a valid image."));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 500;

        let width = img.width;
        let height = img.height;

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", 0.65));
      };

      img.onerror = () => reject(new Error("Image could not be loaded."));
      img.src = event.target.result;
    };

    reader.onerror = () => reject(new Error("Image reading failed."));
    reader.readAsDataURL(file);
  });
};

export default function EmployeeProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [employees, setEmployees] = useState([]);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [editingOriginalId, setEditingOriginalId] = useState("");

  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompressing, setIsCompressing] = useState(false);

  // ✅ Database se employees fetch karo
  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    try {
      setIsLoading(true);
      const res = await fetch('/api/employees');
      const data = await res.json();

      if (data.employees) {
        // MySQL data (snake_case) ko React format (camelCase) me convert karo
        const formatted = data.employees.map(emp => ({
          empId: emp.emp_id,
          empName: emp.emp_name,
          empNumber: emp.emp_number || "",
          laptopNumber: emp.laptop_number || "",
          fatherName: emp.father_name || "",
          designation: emp.designation || "",
          department: emp.department || "",
          aadharNo: emp.aadhar_no || "",
          panNo: emp.pan_no || "",
          pfNo: emp.pf_no || "",
          esiNo: emp.esi_no || "",
          bankName: emp.bank_name || "",
          accountNo: emp.account_no || "",
          ifscCode: emp.ifsc_code || "",
          cvFileName: emp.cv_file_name || "",
          cvFileData: emp.cv_file_data || "",
          photo: emp.photo || "",
        }));
        setEmployees(formatted);
      }
    } catch (error) {
      console.error("Failed to fetch employees", error);
      alert("Failed to load employees from database.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const handleEmployeeSelect = (e) => {
    const empId = e.target.value;
    setSelectedEmployeeId(empId);

    if (!empId) {
      setProfile({ ...initialProfile });
      setEditingOriginalId("");
      setIsSaved(false);
      return;
    }

    const selectedEmployee = employees.find((employee) => employee.empId === empId);

    if (selectedEmployee) {
      setProfile({ ...initialProfile, ...selectedEmployee });
      setEditingOriginalId(selectedEmployee.empId);
      setIsSaved(true);
    }
  };

  const handleAddNew = () => {
    setProfile({ ...initialProfile });
    setSelectedEmployeeId("");
    setEditingOriginalId("");
    setIsSaved(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert("Photo size must be less than 5MB.");

    try {
      setIsCompressing(true);
      const compressedPhoto = await compressImage(file);
      setProfile((prev) => ({ ...prev, photo: compressedPhoto }));
      setIsSaved(false);
    } catch (error) {
      alert("Unable to process photo.");
    } finally {
      setIsCompressing(false);
      e.target.value = "";
    }
  };

  const handleCVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!/\.(pdf|doc|docx)$/i.test(file.name)) {
      alert("Please upload PDF, DOC or DOCX file.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("CV size must be less than 5MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfile((prev) => ({
        ...prev,
        cvFileName: file.name,
        cvFileData: event.target.result, // ✅ Base64 data save karo
      }));
      setIsSaved(false);
      alert("CV Selected: " + file.name);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ✅ Database me save/update karo
  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanEmpId = profile.empId.trim();
    const cleanEmpName = profile.empName.trim();

    if (!cleanEmpId) return alert("Please enter Employee ID.");
    if (!cleanEmpName) return alert("Please enter Employee Name.");

    const duplicateEmployee = employees.find(
      (employee) => employee.empId.toLowerCase() === cleanEmpId.toLowerCase() && employee.empId !== editingOriginalId
    );

    if (duplicateEmployee) return alert("This Employee ID already exists.");

    const payload = {
      ...profile,
      empId: cleanEmpId,
      empName: cleanEmpName,
      fatherName: profile.fatherName.trim(),
    };

    try {
      const method = editingOriginalId ? "PUT" : "POST";
      const res = await fetch('/api/employees', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert(editingOriginalId ? "Employee updated successfully!" : "New employee added successfully!");
        fetchEmployees(); // Refresh list
        setProfile(payload);
        setSelectedEmployeeId(cleanEmpId);
        setEditingOriginalId(cleanEmpId);
        setIsSaved(true);
      } else {
        alert("Database Error: " + data.error);
      }
    } catch (error) {
      alert("Unable to connect to server.");
    }
  };

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";
  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        Loading Employee Master...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Employee Master</h1>
            <p className="text-slate-500 mt-2">Manage employee profiles, documents and bank details.</p>
          </div>
          <div className="flex items-center gap-3">
            {isSaved && (
              <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg text-sm font-bold">✓ Saved</div>
            )}
            <button type="button" onClick={handleAddNew} className="bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition">
              + Add New Employee
            </button>
          </div>
        </div>

        {/* EMPLOYEE SELECTOR */}
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <label className={labelClass}>Select Existing Employee to Edit</label>
              <select value={selectedEmployeeId} onChange={handleEmployeeSelect} className={inputClass}>
                <option value="">-- Add New Employee / Select Employee --</option>
                {employees.map((employee, index) => (
                  <option key={`${employee.empId}-${index}`} value={employee.empId}>
                    {employee.empName} ({employee.empId})
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-emerald-50 text-emerald-800 rounded-xl px-5 py-3 text-sm font-bold">
              Total Employees: {employees.length}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* FORM */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-black">{editingOriginalId ? "Edit Employee" : "Add New Employee"}</h2>
              {editingOriginalId && (
                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-2 rounded-lg">Editing: {editingOriginalId}</span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* PHOTO */}
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-emerald-700 mb-4">Profile Photo</h2>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-slate-200 border-2 border-slate-300 overflow-hidden flex items-center justify-center text-slate-400 text-3xl font-bold">
                    {profile.photo ? (
                      <img src={profile.photo} alt="Profile" className="h-full w-full object-cover" />
                    ) : ("📷")}
                  </div>
                  <div>
                    <label className="cursor-pointer bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-700 transition inline-block">
                      {isCompressing ? "Processing..." : "Upload Photo"}
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoUpload} disabled={isCompressing} className="hidden" />
                    </label>
                    <p className="text-xs text-slate-500 mt-2">JPG, PNG, WEBP (Max 5MB)</p>
                    <p className="text-xs text-emerald-600 mt-1">Photo automatically compressed.</p>
                  </div>
                </div>
              </div>

              {/* BASIC INFORMATION */}
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-emerald-700 mb-4">Basic Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className={labelClass}>Employee Name *</label><input name="empName" value={profile.empName} onChange={handleChange} className={inputClass} placeholder="Full Name" required /></div>
                  <div><label className={labelClass}>Employee ID *</label><input name="empId" value={profile.empId} onChange={handleChange} className={inputClass} placeholder="EMP-001" required /></div>
                  <div><label className={labelClass}>Employee Number</label><input name="empNumber" value={profile.empNumber} onChange={handleChange} className={inputClass} placeholder="e.g. 1001" /></div>
                  <div><label className={labelClass}>Laptop Number</label><input name="laptopNumber" value={profile.laptopNumber} onChange={handleChange} className={inputClass} placeholder="e.g. LP-2024-001" /></div>
                  <div><label className={labelClass}>Father Name</label><input name="fatherName" value={profile.fatherName} onChange={handleChange} className={inputClass} placeholder="Father's Full Name" /></div>
                  <div><label className={labelClass}>Designation</label><input name="designation" value={profile.designation} onChange={handleChange} className={inputClass} placeholder="e.g. Manager" /></div>
                  <div><label className={labelClass}>Department</label><input name="department" value={profile.department} onChange={handleChange} className={inputClass} placeholder="e.g. Sales" /></div>
                </div>
              </div>

              {/* ID PROOFS */}
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-emerald-700 mb-4">ID Proofs & Statutory</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className={labelClass}>Aadhar Card Number</label><input name="aadharNo" value={profile.aadharNo} onChange={handleChange} className={inputClass} placeholder="XXXX-XXXX-XXXX" /></div>
                  <div><label className={labelClass}>PAN Card Number</label><input name="panNo" value={profile.panNo} onChange={handleChange} className={inputClass} placeholder="ABCDE1234F" /></div>
                  <div><label className={labelClass}>PF Number</label><input name="pfNo" value={profile.pfNo} onChange={handleChange} className={inputClass} placeholder="e.g. PF/12345/678" /></div>
                  <div><label className={labelClass}>ESI Number</label><input name="esiNo" value={profile.esiNo} onChange={handleChange} className={inputClass} placeholder="e.g. 1234567890" /></div>
                </div>
              </div>

              {/* BANK DETAILS */}
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-emerald-700 mb-4">Bank Details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className={labelClass}>Bank Name</label><input name="bankName" value={profile.bankName} onChange={handleChange} className={inputClass} placeholder="HDFC / SBI" /></div>
                  <div><label className={labelClass}>Account Number</label><input name="accountNo" value={profile.accountNo} onChange={handleChange} className={inputClass} placeholder="1234567890" /></div>
                  <div><label className={labelClass}>IFSC Code</label><input name="ifscCode" value={profile.ifscCode} onChange={handleChange} className={inputClass} placeholder="HDFC0001234" /></div>
                </div>
              </div>

              {/* CV UPLOAD */}
              <div>
                <h2 className="text-lg font-bold text-emerald-700 mb-4">Documents (CV/Resume)</h2>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition">
                  <label className="cursor-pointer">
                    <span className="text-sm font-bold text-slate-700">Click to upload CV</span>
                    <span className="text-xs text-slate-500 block mt-1">PDF, DOCX up to 5MB</span>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleCVUpload} className="hidden" />
                  </label>
                  {profile.cvFileName && (
                    <div className="mt-3 text-sm text-emerald-600 font-bold bg-emerald-50 py-2 rounded">
                      {profile.cvFileData ? (
                        <a
                          href={profile.cvFileData}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-blue-600 cursor-pointer"
                        >
                          📄 View: {profile.cvFileName}
                        </a>
                      ) : (
                        <span>📄 Attached: {profile.cvFileName}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={isCompressing} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50">
                {isCompressing ? "Please Wait..." : editingOriginalId ? "Update Employee" : "Save New Employee"}
              </button>
            </form>
          </div>

          {/* EMPLOYEE CARD */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl sticky top-10">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700">
                <div className="h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center text-2xl font-black overflow-hidden border-2 border-emerald-400">
                  {profile.photo ? (
                    <img src={profile.photo} alt="Profile" className="h-full w-full object-cover" />
                  ) : (profile.empName ? profile.empName.charAt(0).toUpperCase() : "E")}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold break-words">{profile.empName || "Employee Name"}</h2>
                  <p className="text-sm text-emerald-400">{profile.designation || "Designation"}</p>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div><p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Employee ID</p><p className="font-semibold">{profile.empId || "-"}</p></div>
                <div><p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Employee Number</p><p className="font-semibold">{profile.empNumber || "-"}</p></div>
                <div><p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Laptop Number</p><p className="font-semibold">{profile.laptopNumber || "-"}</p></div>
                <div><p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Father Name</p><p className="font-semibold">{profile.fatherName || "-"}</p></div>
                <div><p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Department</p><p className="font-semibold">{profile.department || "-"}</p></div>
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">ID & Statutory</p>
                  <p>Aadhar: <span className="font-semibold">{profile.aadharNo || "-"}</span></p>
                  <p>PAN: <span className="font-semibold">{profile.panNo || "-"}</span></p>
                  <p>PF: <span className="font-semibold">{profile.pfNo || "-"}</span></p>
                  <p>ESI: <span className="font-semibold">{profile.esiNo || "-"}</span></p>
                </div>
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Bank Info</p>
                  <p>{profile.bankName || "-"}</p>
                  <p className="font-mono text-xs mt-1">A/C: {profile.accountNo || "-"}</p>
                  <p className="font-mono text-xs">IFSC: {profile.ifscCode || "-"}</p>
                </div>
                <div><p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Resume / CV</p><p className="font-semibold text-emerald-400 break-words">{profile.cvFileName ? `📄 ${profile.cvFileName}` : "Not Uploaded"}</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* EMPLOYEE DIRECTORY */}
        <div className="mt-8 bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl font-black">Employee Directory</h2>
              <p className="text-sm text-slate-500 mt-1">Select an employee from the list above to edit their details.</p>
            </div>
            <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg">{employees.length} Employees</span>
          </div>

          {employees.length === 0 ? (
            <div className="text-center py-10 text-slate-500">No employees added yet. Use the form above to add your first employee.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-600">
                    <th className="p-3 rounded-l-lg">Employee ID</th>
                    <th className="p-3">Employee Name</th>
                    <th className="p-3">Designation</th>
                    <th className="p-3">Department</th>
                    <th className="p-3 rounded-r-lg">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee, index) => (
                    <tr key={`${employee.empId}-${index}`} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">{employee.empId}</td>
                      <td className="p-3">{employee.empName}</td>
                      <td className="p-3">{employee.designation || "-"}</td>
                      <td className="p-3">{employee.department || "-"}</td>
                      <td className="p-3">
                        <button type="button" onClick={() => { setSelectedEmployeeId(employee.empId); setEditingOriginalId(employee.empId); setProfile({ ...initialProfile, ...employee }); setIsSaved(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-emerald-700 font-bold hover:underline">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}