import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { 
  Sparkles, LogOut, ShieldCheck, Mail, User, Users, 
  CheckCircle2, Clock, Percent, AlertCircle, CalendarDays, Layers 
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

/**
 * GET /admin/dashboard
 * Administrative analytics dashboard. Performs secure server-side session checks, 
 * runs highly efficient Prisma aggregate queries, and displays dynamic system-wide metrics.
 */
export default async function AdminDashboardPage() {
  // 1. Safeguard session authorization
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/admin/login');
  }

  // 2. Perform database aggregate computations for registrations
  const totalRegistrations = await prisma.registration.count();
  
  const confirmedRegistrations = await prisma.registration.count({
    where: { registrationStatus: 'CONFIRMED' }
  });

  const checkedInRegistrations = await prisma.registration.count({
    where: { registrationStatus: 'CHECKED_IN' }
  });

  const attendedRegistrations = await prisma.registration.count({
    where: { registrationStatus: 'ATTENDED' }
  });

  // Calculate spots occupied by confirmed, checked-in, or attended participants
  const spotsTaken = confirmedRegistrations + checkedInRegistrations + attendedRegistrations;

  // Attendance rate is the percentage of active registrations that checked-in or attended
  const attendanceRate = spotsTaken > 0 ? Math.round(((checkedInRegistrations + attendedRegistrations) / spotsTaken) * 100) : 0;

  // 3. Perform database aggregations for events to determine available capacity
  const events = await prisma.event.findMany({
    include: {
      registrations: {
        where: { registrationStatus: { in: ['CONFIRMED', 'CHECKED_IN', 'ATTENDED'] } },
        select: { id: true }
      }
    }
  });

  let totalMaxCapacity = 0;
  let totalBookings = 0;
  let hasUnlimitedEvents = false;

  events.forEach(evt => {
    if (evt.maxParticipants) {
      totalMaxCapacity += evt.maxParticipants;
      totalBookings += evt.registrations.length;
    } else {
      hasUnlimitedEvents = true;
    }
  });

  const totalAvailableSlots = hasUnlimitedEvents 
    ? "Unlimited" 
    : (totalMaxCapacity > 0 ? Math.max(0, totalMaxCapacity - totalBookings) : 0);

  return (
    <div className="relative min-h-screen bg-[#0D0D0D] text-cream flex items-center justify-center p-4 md:p-8 select-none pt-24 pb-12">
      
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-sage/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-terracotta/5 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Subtle Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Main Glassmorphic Layout Container */}
      <div className="relative z-10 w-full max-w-6xl space-y-8">
        
        {/* Welcome Banner Card */}
        <div className="bg-[#141414]/90 backdrop-blur-xl border border-white/5 p-6 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            {/* Secure Session Verification Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cream/5 border border-cream/10 rounded-full">
              <Sparkles size={10} className="text-terracotta" />
              <span className="font-sans text-[9px] font-semibold uppercase tracking-widest text-cream/70">
                Secure Session Active
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-light text-cream tracking-wide leading-tight">
              Awaken Control Center
            </h1>
            <p className="font-sans text-xs text-cream/40 font-light max-w-xl leading-relaxed">
              Curate upcoming urban events, manage attendee registry databases, and view live aggregate analytics. Welcome back, <span className="font-semibold text-cream">{session.user.name || 'Admin'}</span>.
            </p>
          </div>

          {/* Profile metadata card on right */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 shrink-0 flex items-center gap-3 max-w-xs font-sans text-xs leading-normal">
            <div className="w-10 h-10 rounded-xl bg-cream/10 border border-cream/20 flex items-center justify-center text-cream shrink-0">
              <User size={18} />
            </div>
            <div className="overflow-hidden">
              <span className="text-[8px] uppercase tracking-wider text-cream/40 block leading-none">ADMIN PROFILE</span>
              <span className="font-semibold text-cream block truncate mt-0.5">{session.user.email}</span>
              <span className="text-[9px] text-terracotta uppercase tracking-wider font-semibold block mt-0.5">
                Role: {session.user.role || 'SUPERADMIN'}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Aggregated Analytics Dashboard Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          
          {/* Card 1: Total Registrations */}
          <div className="bg-[#141414]/90 border border-white/5 p-5 rounded-[1.8rem] flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-cream/40 font-medium">Total Registrations</p>
              <h3 className="text-2xl font-light font-serif mt-1 text-cream">{totalRegistrations}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-cream/60 shrink-0">
              <Users size={16} />
            </div>
          </div>

          {/* Card 2: Confirmed Registrations */}
          <div className="bg-[#141414]/90 border border-white/5 p-5 rounded-[1.8rem] flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-cream/40 font-medium">Confirmed Spots</p>
              <h3 className="text-2xl font-light font-serif mt-1 text-emerald-400">{confirmedRegistrations}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 size={16} />
            </div>
          </div>

          {/* Card 3: Checked In Attendees */}
          <div className="bg-[#141414]/90 border border-white/5 p-5 rounded-[1.8rem] flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-cream/40 font-medium">Checked In</p>
              <h3 className="text-2xl font-light font-serif mt-1 text-indigo-400">{checkedInRegistrations}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Clock size={16} />
            </div>
          </div>

          {/* Card 4: Attendance Rate */}
          <div className="bg-[#141414]/90 border border-white/5 p-5 rounded-[1.8rem] flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-cream/40 font-medium">Attendance Rate</p>
              <h3 className="text-2xl font-light font-serif mt-1 text-sage">{attendanceRate}%</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sage/10 border border-sage/20 flex items-center justify-center text-sage shrink-0">
              <Percent size={16} />
            </div>
          </div>

          {/* Card 5: Available Slots */}
          <div className="bg-[#141414]/90 border border-white/5 p-5 rounded-[1.8rem] flex items-center justify-between shadow-sm col-span-2 sm:col-span-1">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-cream/40 font-medium">Available Slots</p>
              <h3 className={`text-2xl font-light font-serif mt-1 ${totalAvailableSlots === 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {totalAvailableSlots}
              </h3>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
              totalAvailableSlots === 0 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              <AlertCircle size={16} />
            </div>
          </div>

        </div>

        {/* Dashboard Navigation Actions and Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card: Events Desk */}
          <div className="bg-[#141414]/90 border border-white/5 p-6 rounded-[2rem] flex flex-col justify-between gap-6 hover:border-white/10 transition-colors">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-terracotta/10 border border-terracotta/20 flex items-center justify-center text-terracotta">
                <CalendarDays size={18} />
              </div>
              <h3 className="font-serif text-lg font-light text-cream">Events Manager</h3>
              <p className="font-sans text-[11px] text-cream/40 leading-relaxed font-light">
                Curate community gatherings, set pricing tiers, track dynamic capacity constraints, and view registrations rosters.
              </p>
            </div>
            <Link
              href="/admin/events"
              className="w-full py-3 bg-terracotta text-cream hover:bg-terracotta/90 rounded-xl font-sans text-xs font-semibold uppercase tracking-widest transition-all duration-300 shadow-md text-center"
            >
              Manage Events
            </Link>
          </div>

          {/* Card: Registrations Desk */}
          <div className="bg-[#141414]/90 border border-white/5 p-6 rounded-[2rem] flex flex-col justify-between gap-6 hover:border-white/10 transition-colors">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sage/10 border border-sage/20 flex items-center justify-center text-sage">
                <Users size={18} />
              </div>
              <h3 className="font-serif text-lg font-light text-cream">Registrations Roster</h3>
              <p className="font-sans text-[11px] text-cream/40 leading-relaxed font-light">
                View system-wide registration records, filter search coordinates, manage payment confirmations, and export reports to CSV.
              </p>
            </div>
            <Link
              href="/admin/registrations"
              className="w-full py-3 bg-white/5 border border-white/5 hover:bg-white/10 text-cream rounded-xl font-sans text-xs font-semibold uppercase tracking-widest transition-all duration-300 text-center"
            >
              Manage Roster
            </Link>
          </div>

          {/* Card: System Utility Control */}
          <div className="bg-[#141414]/90 border border-white/5 p-6 rounded-[2rem] flex flex-col justify-between gap-6 hover:border-white/10 transition-colors">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cream/5 border border-white/5 flex items-center justify-center text-cream/60">
                <ShieldCheck size={18} />
              </div>
              <h3 className="font-serif text-lg font-light text-cream">Sign Out & Exit</h3>
              <p className="font-sans text-[11px] text-cream/40 leading-relaxed font-light">
                View the front-end community page, test new user event registrations, or sign out to safely close this secure admin session.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/"
                className="flex-1 py-3 bg-cream text-warm-black hover:bg-cream/90 rounded-xl font-sans text-xs font-semibold uppercase tracking-widest transition-all duration-300 text-center"
              >
                Website
              </Link>
              <a
                href="/api/auth/signout"
                className="flex-1 py-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-xl font-sans text-xs font-semibold uppercase tracking-widest transition-all duration-300 text-center flex items-center justify-center gap-1.5"
              >
                <LogOut size={11} />
                <span>Log Out</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
