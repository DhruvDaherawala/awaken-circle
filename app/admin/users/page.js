'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft, UserPlus, Users, Trash2, ShieldCheck, Mail, User, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('EDITOR');
  const [showPwd, setShowPwd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch { setErrorMsg('Failed to load users.'); }
    finally { setLoadingUsers(false); }
  }, []);

  useEffect(() => { if (session?.user?.role === 'SUPERADMIN') fetchUsers(); }, [session, fetchUsers]);

  if (status === 'loading') {
    return (<div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center"><Loader2 size={24} className="animate-spin text-cream/50" /></div>);
  }
  if (!session) { router.push('/admin/login'); return null; }
  if (session.user.role !== 'SUPERADMIN') {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-cream flex items-center justify-center p-8">
        <div className="bg-[#141414]/90 border border-white/5 p-8 rounded-[2.5rem] text-center max-w-md">
          <ShieldCheck size={40} className="mx-auto text-terracotta mb-4" />
          <h1 className="font-serif text-2xl text-cream mb-2">Access Restricted</h1>
          <p className="text-cream/40 text-sm mb-6">Only Superadmin accounts can manage users.</p>
          <Link href="/admin/dashboard" className="px-6 py-3 bg-cream text-warm-black rounded-xl font-sans text-xs font-semibold uppercase tracking-widest">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); setSuccessMsg(''); setErrorMsg('');
    if (!name.trim() || !email.trim() || !password) { setErrorMsg('All fields are required.'); setIsSubmitting(false); return; }
    try {
      const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), email: email.trim(), password, role }) });
      const data = await res.json();
      if (data.success) { setSuccessMsg(data.message); setName(''); setEmail(''); setPassword(''); setRole('EDITOR'); setShowForm(false); fetchUsers(); }
      else { setErrorMsg(data.message || 'Failed to create user.'); }
    } catch { setErrorMsg('An unexpected error occurred.'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id, userName) => {
    if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
    setDeletingId(id); setSuccessMsg(''); setErrorMsg('');
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { setSuccessMsg(data.message); fetchUsers(); }
      else { setErrorMsg(data.message); }
    } catch { setErrorMsg('Failed to delete user.'); }
    finally { setDeletingId(null); }
  };

  const inputCls = `w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-cream font-sans text-sm focus:outline-none focus:ring-1 focus:ring-sage/40 focus:border-sage/40 transition-all duration-300 placeholder:text-cream/20`;

  const roleBadge = (r) => {
    const colors = { SUPERADMIN: 'bg-amber-500/10 border-amber-500/20 text-amber-400', ADMIN: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400', EDITOR: 'bg-sage/10 border-sage/20 text-sage' };
    return `inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider border ${colors[r] || colors.EDITOR}`;
  };

  return (
    <div className="relative min-h-screen bg-[#0D0D0D] text-cream p-4 md:p-8 select-none pt-24 pb-12">
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-sage/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-terracotta/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl mx-auto space-y-6">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-cream/40 hover:text-cream/70 transition-colors font-sans text-xs uppercase tracking-widest">
          <ArrowLeft size={14} /><span>Back to Dashboard</span>
        </Link>

        {/* Header */}
        <div className="bg-[#141414]/90 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400"><Users size={18} /></div>
            <div>
              <h1 className="font-serif text-2xl font-light text-cream tracking-wide">User Management</h1>
              <p className="font-sans text-[10px] text-cream/40 uppercase tracking-widest mt-0.5">Create and manage admin & editor accounts</p>
            </div>
          </div>
          <button onClick={() => { setShowForm(!showForm); setSuccessMsg(''); setErrorMsg(''); }} className="flex items-center gap-2 px-5 py-3 bg-cream text-warm-black hover:bg-cream/90 rounded-xl font-sans text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer shrink-0">
            <UserPlus size={14} /><span>{showForm ? 'Cancel' : 'New User'}</span>
          </button>
        </div>

        {/* Notifications */}
        {successMsg && (<div className="flex items-center gap-2.5 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl"><CheckCircle2 size={16} className="shrink-0" /><span className="font-sans text-xs">{successMsg}</span></div>)}
        {errorMsg && (<div className="flex items-center gap-2.5 p-4 bg-terracotta/10 border border-terracotta/20 text-terracotta rounded-2xl"><AlertCircle size={16} className="shrink-0" /><span className="font-sans text-xs">{errorMsg}</span></div>)}

        {/* Create Form */}
        {showForm && (
          <div className="bg-[#141414]/90 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-[2.5rem] shadow-2xl">
            <h2 className="font-serif text-lg font-light text-cream mb-5">Create New Account</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-cream/30"><User size={16} /></div>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className={inputCls} disabled={isSubmitting} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-cream/30"><Mail size={16} /></div>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@awakencircle.com" className={inputCls} disabled={isSubmitting} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-cream/30"><Lock size={16} /></div>
                    <input type={showPwd ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className={`${inputCls} !pr-12`} disabled={isSubmitting} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-cream/30 hover:text-cream/60 transition-colors">{showPwd ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">Role</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-cream font-sans text-sm focus:outline-none focus:ring-1 focus:ring-sage/40 transition-all" disabled={isSubmitting}>
                    <option value="EDITOR" className="bg-[#141414] text-cream">Editor</option>
                    <option value="ADMIN" className="bg-[#141414] text-cream">Admin</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 py-4 bg-cream text-warm-black hover:bg-cream/90 rounded-2xl font-sans text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting}>
                {isSubmitting ? (<><Loader2 size={14} className="animate-spin" /><span>Creating...</span></>) : (<><UserPlus size={14} /><span>Create Account</span></>)}
              </button>
            </form>
          </div>
        )}

        {/* Users List */}
        <div className="bg-[#141414]/90 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-[2.5rem] shadow-2xl">
          <h2 className="font-serif text-lg font-light text-cream mb-5">All Users ({users.length})</h2>
          {loadingUsers ? (
            <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-cream/50" /></div>
          ) : users.length === 0 ? (
            <p className="text-cream/40 text-sm text-center py-8">No users found.</p>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-cream/10 border border-cream/20 flex items-center justify-center text-cream shrink-0"><User size={16} /></div>
                    <div className="min-w-0">
                      <p className="font-sans text-sm font-medium text-cream truncate">{u.name}</p>
                      <p className="font-sans text-[10px] text-cream/40 truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={roleBadge(u.role)}>{u.role}</span>
                    {u.role !== 'SUPERADMIN' && u.id !== session.user.id && (
                      <button onClick={() => handleDelete(u.id, u.name)} disabled={deletingId === u.id} className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50 cursor-pointer">
                        {deletingId === u.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
