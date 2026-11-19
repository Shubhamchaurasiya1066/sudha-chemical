"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ username: "", password: "", name: "", role: "staff" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ Password Reset States
  const [resetUser, setResetUser] = useState(null); // Kis user ka reset kar rahe hain
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleAddUser(e) {
    e.preventDefault();
    setError(""); setSuccess("");

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess("User created successfully!");
        setForm({ username: "", password: "", name: "", role: "staff" });
        fetchUsers();
      } else {
        setError(data.message || "Failed to create user");
      }
    } catch (err) {
      setError("Network error");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        fetchUsers();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Network error");
    }
  }

  // ✅ Password Reset handler
  async function handleResetPassword(e) {
    e.preventDefault();
    setResetError(""); setResetSuccess("");

    if (newPassword.length < 4) {
      setResetError("Password must be at least 4 characters.");
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resetUser.id, newPassword })
      });
      const data = await res.json();

      if (res.ok) {
        setResetSuccess("Password reset successfully!");
        setNewPassword("");
        setTimeout(() => setResetUser(null), 1500); // 1.5 sec baad modal band
      } else {
        setResetError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setResetError("Network error");
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800">User Management</h1>
            <p className="text-sm text-slate-500 mt-1">Manage employee logins, roles, and passwords.</p>
          </div>
          <Link href="/" className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800">
            ← Back to Home
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Form */}
          <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
            <h2 className="text-lg font-bold mb-4">Add New User</h2>
            
            {error && <div className="bg-red-50 text-red-700 text-xs font-bold p-3 rounded-lg mb-3">{error}</div>}
            {success && <div className="bg-emerald-50 text-emerald-700 text-xs font-bold p-3 rounded-lg mb-3">{success}</div>}

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border p-2.5 rounded-lg text-sm" placeholder="e.g. Shubham" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username *</label>
                <input required type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full border p-2.5 rounded-lg text-sm" placeholder="e.g. shubham" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                <input required type="text" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full border p-2.5 rounded-lg text-sm" placeholder="Min 4 chars" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full border p-2.5 rounded-lg text-sm">
                  <option value="staff">Staff (Normal)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700">
                Create User
              </button>
            </form>
          </div>

          {/* Table */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b">
                <tr>
                  <th className="px-5 py-4 font-bold">Name</th>
                  <th className="px-5 py-4 font-bold">Username</th>
                  <th className="px-5 py-4 font-bold">Role</th>
                  <th className="px-5 py-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={4} className="p-5 text-center">Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={4} className="p-5 text-center text-slate-400">No users found.</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-800">{u.name}</td>
                    <td className="px-5 py-4 text-slate-600">{u.username}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
                        {u.role?.toUpperCase() || 'STAFF'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => { setResetUser(u); setNewPassword(""); setResetError(""); setResetSuccess(""); }} className="text-blue-600 hover:bg-blue-50 font-bold text-xs bg-slate-100 px-3 py-1.5 rounded-lg transition">
                          Reset Pass
                        </button>
                        {u.username !== 'admin' ? (
                          <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:bg-red-100 font-bold text-xs bg-red-50 px-3 py-1.5 rounded-lg transition">
                            Delete
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold px-2 py-1.5">Protected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✅ Reset Password Modal */}
      {resetUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Reset Password</h3>
            <p className="text-xs text-slate-500 mb-4">Set a new password for <strong>{resetUser.name}</strong> (@{resetUser.username}).</p>

            {resetError && <div className="bg-red-50 text-red-700 text-xs font-bold p-2 rounded-lg mb-3">{resetError}</div>}
            {resetSuccess && <div className="bg-emerald-50 text-emerald-700 text-xs font-bold p-2 rounded-lg mb-3">{resetSuccess}</div>}

            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                <input required type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border p-2.5 rounded-lg text-sm" placeholder="Enter new password" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setResetUser(null)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}