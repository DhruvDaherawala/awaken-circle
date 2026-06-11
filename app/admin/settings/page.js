'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (status === 'loading') {
    return (<div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center"><Loader2 size={24} className="animate-spin text-cream/50" /></div>);
  }
  if (!session) { router.push('/admin/login'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); setSuccessMsg(''); setErrorMsg('');
    if (!oldPassword || !newPassword || !confirmPassword) { setErrorMsg('All fields are required.'); setIsLoading(false); return; }
    if (newPassword.length < 6) { setErrorMsg('New password must be at least 6 characters.'); setIsLoading(false); return; }
    if (newPassword !== confirmPassword) { setErrorMsg('Passwords do not match.'); setIsLoading(false); return; }
    try {
      const res = await fetch('/api/admin/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oldPassword, newPassword, confirmPassword }) });
      const data = await res.json();
      if (data.success) { setSuccessMsg(data.message); setOldPassword(''); setNewPassword(''); setConfirmPassword(''); }
      else { setErrorMsg(data.message || 'Failed to change password.'); }
    } catch { setErrorMsg('An unexpected error occurred.'); }
    finally { setIsLoading(false); }
  };

  const inputCls = `w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-cream font-sans text-sm focus:outline-none focus:ring-1 focus:ring-sage/40 focus:border-sage/40 transition-all duration-300 placeholder:text-cream/20`;

  const renderField = (id, label, value, setter, show, toggleShow) => (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-cream/30"><Lock size={16} /></div>
        <input id={id} type={show ? 'text' : 'password'} value={value} onChange={(e) => setter(e.target.value)} placeholder="••••••••" className={inputCls} disabled={isLoading} />
        <button type="button" onClick={() => toggleShow(!show)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-cream/30 hover:text-cream/60 transition-colors focus:outline-none" disabled={isLoading}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#0D0D0D] text-cream flex items-center justify-center p-4 md:p-8 select-none pt-24 pb-12">
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-sage/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-terracotta/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl space-y-6">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-cream/40 hover:text-cream/70 transition-colors font-sans text-xs uppercase tracking-widest">
          <ArrowLeft size={14} /><span>Back to Dashboard</span>
        </Link>

        <div className="bg-[#141414]/90 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-[2.5rem] shadow-2xl">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-sage/10 border border-sage/20 flex items-center justify-center text-sage"><ShieldCheck size={18} /></div>
            <div>
              <h1 className="font-serif text-2xl font-light text-cream tracking-wide">Account Settings</h1>
              <p className="font-sans text-[10px] text-cream/40 uppercase tracking-widest mt-0.5">{session.user.email} · {session.user.role}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#141414]/90 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-[2.5rem] shadow-2xl">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-terracotta/10 border border-terracotta/20 flex items-center justify-center text-terracotta"><KeyRound size={14} /></div>
            <h2 className="font-serif text-lg font-light text-cream">Change Password</h2>
          </div>

          {successMsg && (
            <div className="flex items-center gap-2.5 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl mb-6">
              <CheckCircle2 size={16} className="shrink-0" />
              <span className="font-sans text-xs font-light tracking-wide">{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="flex items-center gap-2.5 p-4 bg-terracotta/10 border border-terracotta/20 text-terracotta rounded-2xl mb-6">
              <AlertCircle size={16} className="shrink-0" />
              <span className="font-sans text-xs font-light tracking-wide">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {renderField('oldPassword', 'Current Password', oldPassword, setOldPassword, showOld, setShowOld)}
            {renderField('newPassword', 'New Password', newPassword, setNewPassword, showNew, setShowNew)}
            {renderField('confirmPassword', 'Confirm New Password', confirmPassword, setConfirmPassword, showConfirm, setShowConfirm)}
            <button type="submit" className="w-full flex items-center justify-center gap-2 py-4 bg-cream text-warm-black hover:bg-cream/90 rounded-2xl font-sans text-xs font-semibold uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-2" disabled={isLoading}>
              {isLoading ? (<><Loader2 size={14} className="animate-spin" /><span>Updating...</span></>) : (<span>Update Password</span>)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
