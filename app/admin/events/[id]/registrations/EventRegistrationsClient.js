'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Calendar, MapPin, Users, Trash2, Eye, 
  Check, X, ChevronLeft, ChevronRight, Filter, Sparkles, 
  DollarSign, AlertCircle, Loader2, BookOpen, Layers, ShieldCheck,
  ArrowUpRight, ExternalLink, Mail, Phone, Map, ShieldAlert, CheckCircle2, 
  AlertTriangle, CalendarDays, Clock, Download, ArrowLeft, Landmark, Tag, Percent
} from 'lucide-react';

export default function EventRegistrationsClient({ session, event }) {
  // --- STATE MANAGEMENT ---
  const [registrations, setRegistrations] = useState(event.registrations || []);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [regStatusFilter, setRegStatusFilter] = useState('ALL');
  const [payStatusFilter, setPayStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // View / Delete Modal State
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeReg, setActiveReg] = useState(null);
  const [regToDelete, setRegToDelete] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Auto-dismiss notifications after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- ACTIONS & API HANDLERS ---
  const handleUpdateStatus = async (regId, updateFields) => {
    setUpdatingId(regId);
    try {
      const res = await fetch(`/api/admin/registrations/${regId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateFields)
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) throw new Error(resData.message || 'Status update failed.');

      // Update local state registrations list
      setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, ...updateFields } : r));
      
      // If modal is open and shows this active registration, sync it
      if (activeReg && activeReg.id === regId) {
        setActiveReg(prev => ({ ...prev, ...updateFields }));
      }

      setNotification({
        type: 'success',
        message: 'Registration status successfully saved.'
      });
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: err.message });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenDelete = (reg) => {
    setRegToDelete(reg);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!regToDelete) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/registrations/${regToDelete.id}`, {
        method: 'DELETE',
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) throw new Error(resData.message || 'Failed to delete registration.');

      setRegistrations(prev => prev.filter(r => r.id !== regToDelete.id));
      setIsDeleteOpen(false);
      
      // Close details view if open for this item
      if (activeReg && activeReg.id === regToDelete.id) {
        setIsViewOpen(false);
      }

      setNotification({
        type: 'success',
        message: `Roster entry for "${regToDelete.fullName}" permanently removed.`
      });
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
      setRegToDelete(null);
    }
  };

  // --- CSV EXPORTER UTILITY ---
  const handleExportCSV = () => {
    try {
      if (registrations.length === 0) {
        throw new Error("Roster database is empty. No data available to export.");
      }

      // 1. Formulate safe CSV Headers
      const headers = [
        "Registration ID",
        "Full Name",
        "Email",
        "Phone",
        "Age",
        "Gender",
        "City",
        "Emergency SOS Contact",
        "Registration Notes",
        "Registration Status",
        "Payment Status",
        "Created At Date"
      ];

      // 2. Map registrations data rows
      // Escaping values by replacing quotes with double-quotes to prevent CSV Injection/Excel formula injection
      const rows = registrations.map(reg => [
        reg.id,
        reg.fullName,
        reg.email,
        reg.phone,
        reg.age || "N/A",
        reg.gender || "N/A",
        reg.city || "N/A",
        reg.emergencyContact || "N/A",
        reg.notes || "",
        reg.registrationStatus,
        reg.paymentStatus,
        new Date(reg.createdAt).toLocaleString()
      ]);

      // 3. Create raw CSV contents string
      const escapeField = (field) => {
        const text = String(field);
        // If field contains quotes, commas, or newlines, wrap in quotes and escape internal quotes
        if (text.includes('"') || text.includes(',') || text.includes('\n')) {
          return `"${text.replace(/"/g, '""')}"`;
        }
        // Excel safety: prevent formula injection by prepending spaces if leading char is '=', '+', '-', or '@'
        if (text.startsWith('=') || text.startsWith('+') || text.startsWith('-') || text.startsWith('@')) {
          return `" ${text}"`;
        }
        return text;
      };

      const csvContent = [
        headers.map(escapeField).join(','),
        ...rows.map(row => row.map(escapeField).join(','))
      ].join('\n');

      // 4. Create local blob and trigger browser automated download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      // Filename standard: [event-slug]-registrations-[date].csv
      const dateTag = new Date().toISOString().split('T')[0];
      const filename = `${event.slug}-roster-${dateTag}.csv`;
      
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setNotification({
        type: 'success',
        message: `Successfully exported CSV roster file: "${filename}"`
      });
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  // --- FILTERS & SEARCH PROCESSOR ---
  const filteredRegistrations = registrations.filter(reg => {
    // 1. Text Search query matching
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      reg.fullName.toLowerCase().includes(searchLower) ||
      reg.email.toLowerCase().includes(searchLower) ||
      reg.phone.toLowerCase().includes(searchLower) ||
      (reg.city && reg.city.toLowerCase().includes(searchLower)) ||
      reg.id.toLowerCase().includes(searchLower);

    // 2. Registration Status Filter
    const matchesRegStatus = regStatusFilter === 'ALL' || reg.registrationStatus === regStatusFilter;

    // 3. Payment Status Filter
    const matchesPayStatus = payStatusFilter === 'ALL' || reg.paymentStatus === payStatusFilter;

    return matchesSearch && matchesRegStatus && matchesPayStatus;
  });

  // Calculate Paginated Chunk
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRegistrations.slice(indexOfFirstItem, indexOfLastItem);

  // Auto reset page if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, regStatusFilter, payStatusFilter]);

  // --- ATTENDEES CALCULATION ---
  const totalCount = registrations.length;
  const confirmedCount = registrations.filter(r => r.registrationStatus === 'CONFIRMED').length;
  const checkedInCount = registrations.filter(r => r.registrationStatus === 'CHECKED_IN').length;
  const attendedCount = registrations.filter(r => r.registrationStatus === 'ATTENDED').length;
  const pendingCount = registrations.filter(r => r.registrationStatus === 'PENDING').length;
  const cancelledCount = registrations.filter(r => r.registrationStatus === 'CANCELLED').length;
  
  // Total spot-occupying (active) bookings
  const spotsTaken = confirmedCount + checkedInCount + attendedCount;
  
  // Spots tracking
  const maxCapacity = event.maxParticipants || "Unlimited";
  const vacancyLeft = event.maxParticipants ? Math.max(0, event.maxParticipants - spotsTaken) : "Unlimited";

  // Attendance rate calculations
  const attendanceRate = spotsTaken > 0 ? Math.round(((checkedInCount + attendedCount) / spotsTaken) * 100) : 0;

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Status style helpers
  const getRegStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'PENDING':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse';
      case 'CHECKED_IN':
        return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
      case 'CANCELLED':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      case 'ATTENDED':
        return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
      default:
        return 'bg-white/5 border-white/10 text-cream/60';
    }
  };

  const getPayStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'PENDING':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'FREE':
        return 'bg-sage/10 border-sage/20 text-sage';
      case 'REFUNDED':
        return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
      case 'FAILED':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      default:
        return 'bg-white/5 border-white/10 text-cream/60';
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-cream p-4 md:p-8 select-none relative overflow-x-hidden pt-24">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-sage/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-terracotta/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Main Glass Wrap */}
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Breadcrumb Navigation Row */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-cream/40 font-medium">
          <Link href="/admin/events" className="hover:text-cream transition-colors flex items-center gap-1">
            <ArrowLeft size={11} /> Events Manager
          </Link>
          <span>/</span>
          <span className="text-terracotta font-semibold"> Roster </span>
        </div>

        {/* Header Action Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-terracotta font-medium text-xs uppercase tracking-widest">
              <Sparkles size={13} className="text-sage" />
              <span>Event Specific Registrations</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-light tracking-wide leading-tight">
              {event.title}
            </h1>
            <p className="text-xs text-cream/40 font-light flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1 shrink-0"><MapPin size={11} className="text-cream/30" /> {event.location}</span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1 shrink-0"><CalendarDays size={11} className="text-cream/30" /> {event.eventDate ? formatDate(event.eventDate) : 'TBD'}</span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1 shrink-0"><Clock size={11} className="text-cream/30" /> {event.eventTime}</span>
            </p>
          </div>
          
          <div className="flex gap-3 shrink-0">
            {/* Export Roster CSV Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-cream text-warm-black hover:bg-cream/90 rounded-2xl font-sans text-xs font-semibold uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-cream/5 active:scale-[0.98] cursor-pointer"
            >
              <Download size={14} />
              <span>Export CSV Roster</span>
            </button>
          </div>
        </div>

        {/* Dynamic System Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          
          {/* Total Registrations Card */}
          <div className="bg-[#141414]/90 border border-white/5 p-4 md:p-5 rounded-[1.8rem] flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-cream/40 font-medium">Total Registrations</p>
              <h3 className="text-2xl font-light font-serif mt-1">
                {totalCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-cream/60 shrink-0">
              <Users size={16} />
            </div>
          </div>

          {/* Confirmed Card */}
          <div className="bg-[#141414]/90 border border-white/5 p-4 md:p-5 rounded-[1.8rem] flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-cream/40 font-medium">Confirmed Spots</p>
              <h3 className="text-2xl font-light font-serif mt-1 text-emerald-400">
                {confirmedCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 size={16} />
            </div>
          </div>

          {/* Checked In Card */}
          <div className="bg-[#141414]/90 border border-white/5 p-4 md:p-5 rounded-[1.8rem] flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-cream/40 font-medium">Checked In</p>
              <h3 className="text-2xl font-light font-serif mt-1 text-indigo-400">
                {checkedInCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Clock size={16} />
            </div>
          </div>

          {/* Attendance Rate Card */}
          <div className="bg-[#141414]/90 border border-white/5 p-4 md:p-5 rounded-[1.8rem] flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-cream/40 font-medium">Attendance Rate</p>
              <h3 className="text-2xl font-light font-serif mt-1 text-sage">
                {attendanceRate}%
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sage/10 border border-sage/20 flex items-center justify-center text-sage shrink-0">
              <Percent size={16} />
            </div>
          </div>

          {/* Available Slots Card */}
          <div className="bg-[#141414]/90 border border-white/5 p-4 md:p-5 rounded-[1.8rem] flex items-center justify-between shadow-sm col-span-2 sm:col-span-1">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-cream/40 font-medium">Available Slots</p>
              <h3 className={`text-2xl font-light font-serif mt-1 ${vacancyLeft === 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {vacancyLeft}
              </h3>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
              vacancyLeft === 0 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              <AlertCircle size={16} />
            </div>
          </div>

        </div>

        {/* Live Filter Console */}
        <div className="bg-[#141414]/80 backdrop-blur-md border border-white/5 p-4 rounded-2xl flex flex-col gap-4">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Search Box */}
            <div className="lg:col-span-6 relative w-full">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-cream/35 pointer-events-none">
                <Search size={15} />
              </span>
              <input
                type="text"
                placeholder="Search attendee by name, email, phone, city, notes, registration ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#181818]/60 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-cream focus:outline-none focus:border-cream/20 transition-all duration-300 placeholder:text-cream/25 font-light"
              />
            </div>

            {/* Registration Status Dropdown */}
            <div className="lg:col-span-3 relative">
              <select
                value={regStatusFilter}
                onChange={(e) => setRegStatusFilter(e.target.value)}
                className="w-full bg-[#181818]/60 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-cream/80 focus:outline-none focus:border-cream/20 transition-all duration-300 cursor-pointer appearance-none pr-8 font-light"
              >
                <option value="ALL">All Roster States</option>
                <option value="PENDING">Pending Review</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="ATTENDED">Attended</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-cream/30 text-[8px]">▼</div>
            </div>

            {/* Payment Status Dropdown */}
            <div className="lg:col-span-3 relative">
              <select
                value={payStatusFilter}
                onChange={(e) => setPayStatusFilter(e.target.value)}
                className="w-full bg-[#181818]/60 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-cream/80 focus:outline-none focus:border-cream/20 transition-all duration-300 cursor-pointer appearance-none pr-8 font-light"
              >
                <option value="ALL">All Payment States</option>
                <option value="PENDING">Pending Payment</option>
                <option value="PAID">Paid</option>
                <option value="FREE">Free Entry</option>
                <option value="REFUNDED">Refunded</option>
                <option value="FAILED">Failed</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-cream/30 text-[8px]">▼</div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[10px] text-cream/40">
            <span>Roster matching criteria matches {filteredRegistrations.length} profiles</span>
            <span className="font-semibold uppercase tracking-wider bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
              Filtered Result Count: {filteredRegistrations.length}
            </span>
          </div>

        </div>

        {/* Table / List Roster Wrapper */}
        {filteredRegistrations.length === 0 ? (
          <div className="bg-[#141414]/90 border border-white/5 rounded-[2.5rem] p-16 text-center max-w-xl mx-auto flex flex-col gap-3 items-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-cream/40 mb-2">
              <ShieldAlert size={20} />
            </div>
            <h3 className="font-serif text-xl font-light text-cream">No Attendees Registered</h3>
            <p className="text-xs text-cream/40 font-light leading-relaxed max-w-xs">
              There are no attendee logs in our system matching this search criteria. Expand filters to discover more participants.
            </p>
          </div>
        ) : (
          /* Attendee Table */
          <div className="bg-[#141414]/90 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-auto">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-cream/40 bg-white/[0.01]">
                    <th className="px-6 py-4.5 font-semibold">Attendee Info</th>
                    <th className="px-6 py-4.5 font-semibold">Contact Coordinates</th>
                    <th className="px-6 py-4.5 font-semibold">Residency</th>
                    <th className="px-6 py-4.5 font-semibold">Status Badge</th>
                    <th className="px-6 py-4.5 font-semibold">Payment State</th>
                    <th className="px-6 py-4.5 font-semibold">Booked On</th>
                    <th className="px-6 py-4.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans text-xs">
                  {currentItems.map((reg) => (
                    <tr 
                      key={reg.id} 
                      className={`hover:bg-white/[0.01] transition-colors duration-150 ${
                        updatingId === reg.id ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      
                      {/* Name & ID */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-cream text-[13px]">{reg.fullName}</span>
                          <span className="font-mono text-[9px] text-cream/35">{reg.id}</span>
                        </div>
                      </td>

                      {/* Contact Coordinates */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5 font-light text-cream/70">
                          <span className="flex items-center gap-1"><Mail size={11} className="text-cream/30 shrink-0" /> {reg.email}</span>
                          <span className="flex items-center gap-1 mt-0.5"><Phone size={11} className="text-cream/30 shrink-0" /> {reg.phone}</span>
                        </div>
                      </td>

                      {/* Residency / Age & Gender */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5 font-light text-cream/60">
                          <span className="font-medium text-cream/80">{reg.city || 'Surat, Gujarat'}</span>
                          <span className="text-[10px] mt-0.5">{reg.gender || 'Not Disclosed'} • {reg.age ? `${reg.age} Yrs` : 'TBD'}</span>
                        </div>
                      </td>

                      {/* Registration Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${getRegStatusBadge(reg.registrationStatus)}`}>
                          {reg.registrationStatus}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${getPayStatusBadge(reg.paymentStatus)}`}>
                          {reg.paymentStatus}
                        </span>
                      </td>

                      {/* Book Date */}
                      <td className="px-6 py-4 font-light text-cream/50 whitespace-nowrap">
                        {formatDate(reg.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* Details Button */}
                          <button
                            onClick={() => {
                              setActiveReg(reg);
                              setIsViewOpen(true);
                            }}
                            title="View Extended Profile"
                            className="p-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 text-cream/70 hover:text-cream transition-all"
                          >
                            <Eye size={13} />
                          </button>

                          {/* Quick Toggle Action: Confirm Review */}
                          {reg.registrationStatus === 'PENDING' && (
                            <button
                              onClick={() => handleUpdateStatus(reg.id, { 
                                registrationStatus: 'CONFIRMED',
                                paymentStatus: Number(event.price) > 0 ? 'PAID' : 'FREE'
                              })}
                              title="Verify Spot Approval"
                              className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                            >
                              <Check size={13} />
                            </button>
                          )}

                          {/* Quick Toggle Action: Cancel Spot */}
                          {reg.registrationStatus !== 'CANCELLED' && (
                            <button
                              onClick={() => handleUpdateStatus(reg.id, { registrationStatus: 'CANCELLED' })}
                              title="Cancel Spot Reservation"
                              className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all"
                            >
                              <X size={13} />
                            </button>
                          )}

                          {/* Delete Item */}
                          <button
                            onClick={() => handleOpenDelete(reg)}
                            title="Delete Permanent Log"
                            className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 text-cream/40 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Segment */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-white/5 px-6 py-4 text-xs font-sans text-cream/40">
                <span className="font-light">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRegistrations.length)} of {filteredRegistrations.length} rosters
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-cream/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-white/5"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="font-medium text-cream bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-cream/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-white/5"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* --- NOTIFICATION CENTER ACCENTS --- */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4.5 rounded-2xl shadow-2xl backdrop-blur-md border ${
          notification.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-950/80 border-rose-500/20 text-rose-400'
        } animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-sm`}>
          {notification.type === 'success' ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
          <div className="font-sans text-xs">
            <span className="font-bold block mb-0.5">System Alert</span>
            <p className="font-light leading-relaxed">{notification.message}</p>
          </div>
        </div>
      )}

      {/* --- EXTENDED VIEW PROFILE MODAL --- */}
      {isViewOpen && activeReg && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          {/* Backdrop blur clickoff */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsViewOpen(false)} />
          
          <div className="relative z-10 w-full max-w-lg bg-[#141414]/95 border border-white/5 p-6 md:p-8 rounded-[2.5rem] shadow-2xl flex flex-col gap-6 max-h-[85vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div>
                <span className="text-[9px] font-bold text-terracotta uppercase tracking-widest block mb-0.5">Event Roster Entry Details</span>
                <h3 className="font-serif text-xl font-light text-cream">{activeReg.fullName}</h3>
                <code className="font-mono text-[9px] text-cream/30">{activeReg.id}</code>
              </div>
              <button 
                onClick={() => setIsViewOpen(false)} 
                className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 text-cream/40 hover:text-cream transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Profile Grid Info */}
            <div className="grid grid-cols-2 gap-4 font-sans text-[11px] text-cream/70 leading-normal">
              
              <div>
                <span className="text-[9px] uppercase tracking-wider text-cream/40 block mb-0.5">Access E-Mail</span>
                <span className="font-medium text-cream block truncate">{activeReg.email}</span>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-wider text-cream/40 block mb-0.5">WhatsApp Contact</span>
                <span className="font-medium text-cream block">{activeReg.phone}</span>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-wider text-cream/40 block mb-0.5">Residential Location</span>
                <span className="font-medium text-cream block flex items-center gap-1">
                  <MapPin size={11} className="text-sage" /> {activeReg.city || 'Surat, Gujarat'}
                </span>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-wider text-cream/40 block mb-0.5">Gender & Age Profile</span>
                <span className="font-medium text-cream block">
                  {activeReg.gender || 'Not Disclosed'} • {activeReg.age ? `${activeReg.age} Years` : 'TBD'}
                </span>
              </div>

              {activeReg.emergencyContact && (
                <div className="col-span-2 border-t border-white/5 pt-3 mt-1">
                  <span className="text-[9px] uppercase tracking-wider text-cream/40 block mb-0.5 flex items-center gap-1">
                    <ShieldAlert size={11} className="text-rose-400" /> Emergency SOS Contact
                  </span>
                  <span className="font-semibold text-cream block">{activeReg.emergencyContact}</span>
                </div>
              )}

              {activeReg.checkedInAt && (
                <div className="col-span-2 bg-indigo-500/5 border border-indigo-500/10 p-3.5 rounded-2xl flex items-center justify-between text-indigo-400 mt-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="shrink-0 text-indigo-400" />
                    <div>
                      <span className="text-[8px] uppercase tracking-widest font-semibold block text-indigo-300/60">Check-In Status Verified</span>
                      <span className="text-[10px] font-sans font-light">Participant checked-in successfully.</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] uppercase tracking-widest block text-indigo-300/50">TIMESTAMP</span>
                    <span className="text-[10px] font-mono font-medium">{new Date(activeReg.checkedInAt).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {activeReg.notes && (
                <div className="col-span-2 border-t border-white/5 pt-3 mt-1">
                  <span className="text-[9px] uppercase tracking-wider text-cream/40 block mb-1.5 flex items-center gap-1">
                    <BookOpen size={11} className="text-sage" /> Registration Notes / Medical Alert
                  </span>
                  <div className="bg-[#181818]/60 border border-white/5 p-3 rounded-xl font-light text-cream/60 leading-relaxed font-sans text-xs">
                    {activeReg.notes}
                  </div>
                </div>
              )}

            </div>

            {/* Inline Toggle Modifications in Modal */}
            <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row gap-3">
              
              {/* Payment Actions toggle */}
              <div className="flex-1 space-y-1.5">
                <span className="text-[9px] uppercase tracking-wider text-cream/40 block font-medium">Payment State Action</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(activeReg.id, { paymentStatus: 'PAID' })}
                    disabled={activeReg.paymentStatus === 'PAID'}
                    className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Confirm Paid
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(activeReg.id, { paymentStatus: 'PENDING' })}
                    disabled={activeReg.paymentStatus === 'PENDING'}
                    className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Reset Pending
                  </button>
                </div>
              </div>

              {/* Roster Actions toggle */}
              <div className="flex-1 space-y-1.5">
                <span className="text-[9px] uppercase tracking-wider text-cream/40 block font-medium">Registry Spot Action</span>
                <div className="flex gap-2">
                  {activeReg.registrationStatus === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(activeReg.id, { 
                        registrationStatus: 'CONFIRMED',
                        paymentStatus: Number(event.price) > 0 ? 'PAID' : 'FREE'
                      })}
                      className="flex-grow py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all"
                    >
                      Confirm Spot
                    </button>
                  )}
                  {activeReg.registrationStatus === 'CONFIRMED' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(activeReg.id, { registrationStatus: 'CHECKED_IN' })}
                        className="flex-grow py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition-all"
                      >
                        Check In
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(activeReg.id, { registrationStatus: 'ATTENDED' })}
                        className="flex-grow py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-all"
                      >
                        Mark Attended
                      </button>
                    </>
                  )}
                  {activeReg.registrationStatus === 'CHECKED_IN' && (
                    <button
                      onClick={() => handleUpdateStatus(activeReg.id, { registrationStatus: 'ATTENDED' })}
                      className="flex-grow py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-all"
                    >
                      Mark Attended
                    </button>
                  )}
                  {activeReg.registrationStatus !== 'CANCELLED' && (
                    <button
                      onClick={() => handleUpdateStatus(activeReg.id, { registrationStatus: 'CANCELLED' })}
                      className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                    >
                      Cancel Roster
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* --- PERMANENT DELETE WARNING PANEL --- */}
      {isDeleteOpen && regToDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDeleteOpen(false)} />
          
          <div className="relative z-10 w-full max-w-sm bg-[#141414]/95 border border-white/5 p-6 rounded-[2rem] shadow-2xl text-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert size={22} className="animate-bounce" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-serif text-lg text-cream font-medium">Delete Roster Entry</h3>
              <p className="font-sans text-[11px] text-cream/40 leading-relaxed font-light">
                Are you absolutely sure you want to permanently delete the registration record for <span className="font-semibold text-cream">{regToDelete.fullName}</span>? This action is highly destructive and cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 py-3 text-[10px] font-bold uppercase tracking-wider border border-white/10 hover:bg-white/5 rounded-xl transition-all"
              >
                No, Keep Log
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 text-[10px] font-bold uppercase tracking-wider rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
