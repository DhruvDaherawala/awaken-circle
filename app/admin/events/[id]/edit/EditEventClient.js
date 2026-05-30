'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Save, Calendar, MapPin, Users, Edit, Check, X, Sparkles, 
  DollarSign, AlertCircle, Loader2, BookOpen, Layers, 
  ArrowLeft, Trash2, ShieldCheck, ArrowRight, RefreshCw, Clock
} from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';

// --- ZOD VALIDATION SCHEMA ---
const eventFormSchema = z.object({
  title: z.string()
    .min(2, 'Title must be at least 2 characters')
    .max(150, 'Title cannot exceed 150 characters'),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(180, 'Slug cannot exceed 180 characters')
    .regex(/^[a-z0-9-_]+$/, 'Slug can only contain lowercase letters, numbers, hyphens, and underscores'),
  shortDescription: z.string()
    .max(255, 'Short description cannot exceed 255 characters')
    .optional()
    .nullable(),
  description: z.string()
    .min(10, 'Detailed description must be at least 10 characters'),
  
  communityId: z.string()
    .min(1, 'Please select a community circle group'),
  categoryId: z.coerce.number()
    .int()
    .positive('Please select an activity category')
    .optional()
    .nullable(),
  
  eventDate: z.string()
    .min(1, 'Event date is required'),
  eventTime: z.string()
    .min(1, 'Start time is required')
    .max(50),
  endTime: z.string()
    .max(50)
    .optional()
    .nullable(),
  
  location: z.string()
    .min(1, 'Physical location address is required')
    .max(255),
  googleMapsLink: z.string()
    .url('Invalid Maps URL format')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  price: z.coerce.number()
    .min(0, 'Admission price cannot be negative'),
  maxParticipants: z.coerce.number()
    .int()
    .positive('Capacity must be a positive number')
    .optional()
    .nullable()
    .or(z.literal('')),
  registrationDeadline: z.string()
    .optional()
    .nullable()
    .or(z.literal('')),
  
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']),
  featured: z.boolean().default(false),
  coverImage: z.string()
    .min(1, 'Please upload a cover image for the event'),
});

// --- LIGHTWEIGHT CUSTOM RESOLVER ---
const zodResolver = (schema) => async (data) => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { values: result.data, errors: {} };
  }

  const errors = {};
  result.error.errors.forEach((err) => {
    const fieldName = err.path[0];
    errors[fieldName] = {
      type: 'validation',
      message: err.message,
    };
  });

  return { values: {}, errors };
};

export default function EditEventClient({ session, event, communities, categories }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [restoredNotification, setRestoredNotification] = useState(false);
  const [lastSaved, setLastSaved] = useState('');

  // Scoped draft identifier to allow editing different listings concurrently
  const draftStorageKey = `awaken_event_edit_draft_${event.id}`;

  // --- REACT HOOK FORM SETUP ---
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event.title,
      slug: event.slug,
      shortDescription: event.shortDescription || '',
      description: event.description,
      communityId: event.communityId,
      categoryId: event.categoryId || '',
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      endTime: event.endTime || '',
      location: event.location,
      googleMapsLink: event.googleMapsLink || '',
      price: Number(event.price),
      maxParticipants: event.maxParticipants || '',
      registrationDeadline: event.registrationDeadline || '',
      status: event.status,
      featured: event.featured,
      coverImage: event.coverImage || '',
    }
  });

  const watchAllFields = watch();
  const titleValue = watch('title');

  // --- RESTORE DRAFT ON BOOT ---
  useEffect(() => {
    restoreDraft();
  }, []);

  const restoreDraft = () => {
    if (typeof window === 'undefined') return;
    const savedDraft = localStorage.getItem(draftStorageKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        reset(parsed);
        setRestoredNotification(true);
        updateSaveTimestamp();
      } catch (e) {
        console.error("Draft restoration failed:", e);
      }
    }
  };

  // --- AUTO-SAVE WORKSPACE CHANNELS ---
  useEffect(() => {
    // Only save draft if it differs from the base database event values
    const isDifferent = Object.keys(watchAllFields).some(key => {
      const dbVal = event[key];
      const formVal = watchAllFields[key];
      
      // Handle normalization differences
      if (key === 'price') return Number(dbVal) !== Number(formVal);
      if (key === 'categoryId') return (dbVal || '') !== (formVal || '');
      if (key === 'maxParticipants') return (dbVal || '') !== (formVal || '');
      if (key === 'registrationDeadline') return (dbVal || '') !== (formVal || '');
      
      return dbVal !== formVal;
    });

    if (isDifferent) {
      localStorage.setItem(draftStorageKey, JSON.stringify(watchAllFields));
      updateSaveTimestamp();
    }
  }, [watchAllFields, event, draftStorageKey]);

  const updateSaveTimestamp = () => {
    const now = new Date();
    setLastSaved(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const handleClearDraft = () => {
    if (confirm("Discard all draft modifications and reset to database values?")) {
      localStorage.removeItem(draftStorageKey);
      reset({
        title: event.title,
        slug: event.slug,
        shortDescription: event.shortDescription || '',
        description: event.description,
        communityId: event.communityId,
        categoryId: event.categoryId || '',
        eventDate: event.eventDate,
        eventTime: event.eventTime,
        endTime: event.endTime || '',
        location: event.location,
        googleMapsLink: event.googleMapsLink || '',
        price: Number(event.price),
        maxParticipants: event.maxParticipants || '',
        registrationDeadline: event.registrationDeadline || '',
        status: event.status,
        featured: event.featured,
        coverImage: event.coverImage || '',
      });
      setRestoredNotification(false);
      setLastSaved('');
    }
  };

  // --- MANUAL SLUG REGENERATION ---
  const handleRegenerateSlug = () => {
    if (titleValue) {
      const generatedSlug = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 180);
      
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  };

  // --- DYNAMIC PROGRESS CHECKLISTS ---
  const getSectionStatus = (fields) => {
    const hasError = fields.some(f => !!errors[f]);
    if (hasError) return 'error';

    const hasValue = fields.some(f => {
      const val = watchAllFields[f];
      return val !== undefined && val !== '' && val !== 0 && val !== false && val !== null;
    });

    if (hasValue) return 'valid';
    return 'empty';
  };

  const sectionsList = [
    { id: 'sec-basic', label: 'Basic Information', fields: ['title', 'slug', 'description'] },
    { id: 'sec-community', label: 'Community Selection', fields: ['communityId'] },
    { id: 'sec-category', label: 'Category Selection', fields: ['categoryId'] },
    { id: 'sec-schedule', label: 'Schedule Settings', fields: ['eventDate', 'eventTime'] },
    { id: 'sec-location', label: 'Location Details', fields: ['location'] },
    { id: 'sec-registration', label: 'Registration Settings', fields: ['price', 'maxParticipants'] },
    { id: 'sec-media', label: 'Media Upload', fields: ['coverImage'] },
  ];

  // --- SUBMIT PIPE ---
  const onSubmit = async (data) => {
    setSubmitting(true);
    setGlobalError('');

    // Format optional numeric parameters correctly
    const payload = {
      ...data,
      registrationDeadline: data.registrationDeadline || null,
      categoryId: data.categoryId ? Number(data.categoryId) : null,
      maxParticipants: data.maxParticipants ? Number(data.maxParticipants) : null
    };

    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to update event listing.');
      }

      // Clean browser storage draft on successful save
      localStorage.removeItem(draftStorageKey);
      router.push('/admin/events');
      router.refresh();

    } catch (err) {
      console.error(err);
      setGlobalError(err.message || 'An unexpected error occurred during save execution.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-cream p-4 md:p-8 select-none relative overflow-x-hidden pt-24 pb-20">
      {/* Background radial blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-sage/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-terracotta/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation Breadcrumb Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div className="space-y-1">
            <Link 
              href="/admin/events"
              className="inline-flex items-center gap-1.5 text-xs text-cream/40 hover:text-cream transition-colors group mb-2"
            >
              <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-1" />
              <span>Back to Events Curation</span>
            </Link>
            <div className="flex items-center gap-2 text-terracotta font-medium text-xs uppercase tracking-widest">
              <Edit size={13} />
              <span>Edit Composition Desk</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-light tracking-wide">
              Modify Event Listing
            </h1>
            <p className="text-xs text-cream/40 font-light font-mono truncate max-w-lg mt-1">
              Adjusting context parameters for: {event.title}
            </p>
          </div>

          {/* Persistent Draft Status */}
          <div className="flex flex-wrap items-center gap-3 bg-[#141414] border border-white/5 px-4.5 py-3 rounded-2xl md:self-end">
            <Save size={13} className="text-sage" />
            <div className="text-[11px] font-sans font-light leading-none">
              <span className="text-cream/35">Edit auto-save: </span>
              <span className="text-sage font-medium font-mono">
                {lastSaved ? `Active (${lastSaved})` : 'Synced with Server'}
              </span>
            </div>
          </div>
        </div>

        {/* Informative Warning Banner about live updates */}
        <div className="flex items-start gap-3.5 p-4.5 bg-terracotta/10 border border-terracotta/20 text-terracotta rounded-2xl">
          <Clock size={18} className="shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-serif text-xs font-semibold uppercase tracking-wider">Live Curation Alert</h4>
            <p className="font-sans text-[11px] text-cream/70 font-light leading-relaxed">
              This listing was created on {new Date(event.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}. Modifying crucial fields (like date, schedule, or locations) will instantly update booking itineraries for active participants.
            </p>
          </div>
        </div>

        {/* Global Error Banner */}
        {globalError && (
          <div className="flex items-center gap-2.5 p-4.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl animate-shake">
            <AlertCircle size={18} className="shrink-0" />
            <span className="font-sans text-xs font-light tracking-wide">{globalError}</span>
          </div>
        )}

        {/* Restored Draft Confirmation Alert */}
        {restoredNotification && (
          <div className="flex items-center justify-between gap-3 p-4 bg-sage/10 border border-sage/20 text-sage rounded-2xl">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="shrink-0 animate-bounce" />
              <span className="font-sans text-xs font-light">
                Restored unfinished draft modifications from your browser's persistent workspace.
              </span>
            </div>
            <button 
              type="button" 
              onClick={() => setRestoredNotification(false)}
              className="text-[10px] uppercase font-bold tracking-wider hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dynamic Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Sticky Progress Tracker */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            
            <div className="bg-[#141414]/90 border border-white/5 p-6 rounded-[2rem] space-y-4 shadow-xl">
              <h3 className="font-serif text-md font-light text-cream border-b border-white/5 pb-3.5">
                Curation Status
              </h3>
              
              <ul className="space-y-3.5">
                {sectionsList.map((sec, idx) => {
                  const status = getSectionStatus(sec.fields);
                  
                  return (
                    <li key={sec.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-cream/20">0{idx+1}</span>
                        <a 
                          href={`#${sec.id}`}
                          className="font-sans text-cream/60 hover:text-cream transition-colors font-light"
                        >
                          {sec.label}
                        </a>
                      </div>

                      {/* Visual badges */}
                      {status === 'error' && (
                        <span className="w-4 h-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-[8px] font-bold">
                          !
                        </span>
                      )}
                      {status === 'valid' && (
                        <div className="w-4 h-4 rounded-full bg-sage/10 border border-sage/20 flex items-center justify-center text-sage">
                          <Check size={8} className="stroke-[3]" />
                        </div>
                      )}
                      {status === 'empty' && (
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-white/10" />
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Reset to DB Values button */}
              <button
                type="button"
                onClick={handleClearDraft}
                className="w-full mt-4 flex items-center justify-center gap-1.5 py-3 bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/5 hover:border-red-500/20 rounded-xl font-sans text-[10px] font-semibold uppercase tracking-wider transition-all"
              >
                <RefreshCw size={11} className="animate-spin-slow" />
                <span>Discard Changes</span>
              </button>
            </div>

            {/* Quick Listing Info Card */}
            <div className="bg-[#141414]/90 border border-white/5 p-5 rounded-[1.8rem] space-y-4">
              <span className="text-[9px] uppercase tracking-widest text-cream/35 font-semibold">Listing Metadata</span>
              
              <div className="grid grid-cols-2 gap-3 text-[10px] font-light">
                <div className="bg-white/[0.01] border border-white/5 p-3.5 rounded-2xl">
                  <span className="text-cream/30 block uppercase tracking-wider text-[8px]">Database ID</span>
                  <span className="text-cream font-mono mt-1 block truncate">{event.id}</span>
                </div>
                
                <div className="bg-white/[0.01] border border-white/5 p-3.5 rounded-2xl">
                  <span className="text-cream/30 block uppercase tracking-wider text-[8px]">Last Sync</span>
                  <span className="text-cream mt-1 block font-mono">
                    {new Date(event.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Form Deck */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* 1. Basic Information Card */}
              <div id="sec-basic" className="bg-[#141414]/90 border border-white/5 p-6 md:p-8 rounded-[2.5rem] space-y-6 scroll-mt-24 shadow-lg">
                <div className="border-b border-white/5 pb-4">
                  <span className="text-[9px] uppercase tracking-widest text-terracotta font-semibold">Section One</span>
                  <h3 className="font-serif text-lg font-light text-cream mt-0.5">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                      Event Title
                    </label>
                    <input
                      {...register('title')}
                      type="text"
                      placeholder="Morning Run: Marine Drive"
                      className={`w-full bg-[#181818] border rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-sage/40 transition-all ${
                        errors.title ? 'border-red-500/40 focus:ring-red-500/40' : 'border-white/5 focus:border-cream/20'
                      }`}
                    />
                    {errors.title && (
                      <span className="text-[10px] text-red-400 ml-1">{errors.title.message}</span>
                    )}
                  </div>

                  {/* Slug */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50">
                        URL Slug
                      </label>
                      <button
                        type="button"
                        onClick={handleRegenerateSlug}
                        className="text-[9px] text-terracotta uppercase font-bold tracking-wider hover:underline flex items-center gap-1.5"
                      >
                        <RefreshCw size={8} />
                        Sync from Title
                      </button>
                    </div>
                    <input
                      {...register('slug')}
                      type="text"
                      placeholder="morning-run-marine-drive"
                      className={`w-full bg-[#181818] border rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-sage/40 transition-all font-mono ${
                        errors.slug ? 'border-red-500/40 focus:ring-red-500/40' : 'border-white/5 focus:border-cream/20'
                      }`}
                    />
                    {errors.slug && (
                      <span className="text-[10px] text-red-400 ml-1">{errors.slug.message}</span>
                    )}
                  </div>
                </div>

                {/* Short Description */}
                <div className="space-y-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                    Short Description (Catchy Outline, Max 255 chars)
                  </label>
                  <input
                    {...register('shortDescription')}
                    type="text"
                    placeholder="Surat's premier active running club sunrise run."
                    className={`w-full bg-[#181818] border rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-sage/40 transition-all ${
                      errors.shortDescription ? 'border-red-500/40 focus:ring-red-500/40' : 'border-white/5 focus:border-cream/20'
                    }`}
                  />
                  {errors.shortDescription && (
                    <span className="text-[10px] text-red-400 ml-1">{errors.shortDescription.message}</span>
                  )}
                </div>

                {/* Detailed Description */}
                <div className="space-y-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                    Detailed Event Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows="6"
                    placeholder="Enter detailed events outlines, gear checklists, schedule, hydration details..."
                    className={`w-full bg-[#181818] border rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-sage/40 transition-all resize-none font-sans font-light ${
                      errors.description ? 'border-red-500/40 focus:ring-red-500/40' : 'border-white/5 focus:border-cream/20'
                    }`}
                  />
                  {errors.description && (
                    <span className="text-[10px] text-red-400 ml-1">{errors.description.message}</span>
                  )}
                </div>

              </div>

              {/* 2. Community Selection Card */}
              <div id="sec-community" className="bg-[#141414]/90 border border-white/5 p-6 md:p-8 rounded-[2.5rem] space-y-4 scroll-mt-24 shadow-lg">
                <div className="border-b border-white/5 pb-4">
                  <span className="text-[9px] uppercase tracking-widest text-terracotta font-semibold">Section Two</span>
                  <h3 className="font-serif text-lg font-light text-cream mt-0.5">Community Selection</h3>
                </div>

                <div className="space-y-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                    Circle Group Host
                  </label>
                  <select
                    {...register('communityId')}
                    className={`w-full bg-[#181818] border rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-sage/40 transition-all cursor-pointer ${
                      errors.communityId ? 'border-red-500/40 focus:ring-red-500/40' : 'border-white/5 focus:border-cream/20'
                    }`}
                  >
                    <option value="" disabled>Select community circle...</option>
                    {communities.map(comm => (
                      <option key={comm.id} value={comm.id}>{comm.name}</option>
                    ))}
                  </select>
                  {errors.communityId && (
                    <span className="text-[10px] text-red-400 ml-1">{errors.communityId.message}</span>
                  )}
                </div>
              </div>

              {/* 3. Category Selection Card */}
              <div id="sec-category" className="bg-[#141414]/90 border border-white/5 p-6 md:p-8 rounded-[2.5rem] space-y-4 scroll-mt-24 shadow-lg">
                <div className="border-b border-white/5 pb-4">
                  <span className="text-[9px] uppercase tracking-widest text-terracotta font-semibold">Section Three</span>
                  <h3 className="font-serif text-lg font-light text-cream mt-0.5">Category Selection</h3>
                </div>

                <div className="space-y-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                    Event Category
                  </label>
                  <select
                    {...register('categoryId')}
                    className={`w-full bg-[#181818] border rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-sage/40 transition-all cursor-pointer ${
                      errors.categoryId ? 'border-red-500/40 focus:ring-red-500/40' : 'border-white/5 focus:border-cream/20'
                    }`}
                  >
                    <option value="">No specific category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <span className="text-[10px] text-red-400 ml-1">{errors.categoryId.message}</span>
                  )}
                </div>
              </div>

              {/* 4. Schedule Card */}
              <div id="sec-schedule" className="bg-[#141414]/90 border border-white/5 p-6 md:p-8 rounded-[2.5rem] space-y-6 scroll-mt-24 shadow-lg">
                <div className="border-b border-white/5 pb-4">
                  <span className="text-[9px] uppercase tracking-widest text-terracotta font-semibold">Section Four</span>
                  <h3 className="font-serif text-lg font-light text-cream mt-0.5">Schedule Settings</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Event Date */}
                  <div className="space-y-2">
                    <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                      Event Date
                    </label>
                    <input
                      {...register('eventDate')}
                      type="date"
                      className={`w-full bg-[#181818] border rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-sage/40 transition-all ${
                        errors.eventDate ? 'border-red-500/40 focus:ring-red-500/40' : 'border-white/5 focus:border-cream/20'
                      }`}
                    />
                    {errors.eventDate && (
                      <span className="text-[10px] text-red-400 ml-1">{errors.eventDate.message}</span>
                    )}
                  </div>

                  {/* Start Time */}
                  <div className="space-y-2">
                    <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                      Start Time
                    </label>
                    <input
                      {...register('eventTime')}
                      type="text"
                      placeholder="06:30 AM"
                      className={`w-full bg-[#181818] border rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-sage/40 transition-all ${
                        errors.eventTime ? 'border-red-500/40 focus:ring-red-500/40' : 'border-white/5 focus:border-cream/20'
                      }`}
                    />
                    {errors.eventTime && (
                      <span className="text-[10px] text-red-400 ml-1">{errors.eventTime.message}</span>
                    )}
                  </div>

                  {/* End Time */}
                  <div className="space-y-2">
                    <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                      End Time (Optional)
                    </label>
                    <input
                      {...register('endTime')}
                      type="text"
                      placeholder="08:00 AM"
                      className={`w-full bg-[#181818] border rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-sage/40 transition-all ${
                        errors.endTime ? 'border-red-500/40 focus:ring-red-500/40' : 'border-white/5 focus:border-cream/20'
                      }`}
                    />
                    {errors.endTime && (
                      <span className="text-[10px] text-red-400 ml-1">{errors.endTime.message}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 5. Location Card */}
              <div id="sec-location" className="bg-[#141414]/90 border border-white/5 p-6 md:p-8 rounded-[2.5rem] space-y-6 scroll-mt-24 shadow-lg">
                <div className="border-b border-white/5 pb-4">
                  <span className="text-[9px] uppercase tracking-widest text-terracotta font-semibold">Section Five</span>
                  <h3 className="font-serif text-lg font-light text-cream mt-0.5">Location Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Address */}
                  <div className="space-y-2">
                    <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                      Physical Address
                    </label>
                    <input
                      {...register('location')}
                      type="text"
                      placeholder="Marine Drive, Surat"
                      className={`w-full bg-[#181818] border rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-sage/40 transition-all ${
                        errors.location ? 'border-red-500/40 focus:ring-red-500/40' : 'border-white/5 focus:border-cream/20'
                      }`}
                    />
                    {errors.location && (
                      <span className="text-[10px] text-red-400 ml-1">{errors.location.message}</span>
                    )}
                  </div>

                  {/* Google Maps Link */}
                  <div className="space-y-2">
                    <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                      Google Maps Reference Link
                    </label>
                    <input
                      {...register('googleMapsLink')}
                      type="url"
                      placeholder="https://maps.google.com/?q=Marine+Drive"
                      className={`w-full bg-[#181818] border rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-sage/40 transition-all ${
                        errors.googleMapsLink ? 'border-red-500/40 focus:ring-red-500/40' : 'border-white/5 focus:border-cream/20'
                      }`}
                    />
                    {errors.googleMapsLink && (
                      <span className="text-[10px] text-red-400 ml-1">{errors.googleMapsLink.message}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 6. Registration Settings Card */}
              <div id="sec-registration" className="bg-[#141414]/90 border border-white/5 p-6 md:p-8 rounded-[2.5rem] space-y-6 scroll-mt-24 shadow-lg">
                <div className="border-b border-white/5 pb-4">
                  <span className="text-[9px] uppercase tracking-widest text-terracotta font-semibold">Section Six</span>
                  <h3 className="font-serif text-lg font-light text-cream mt-0.5">Registration Settings</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Price */}
                  <div className="space-y-2">
                    <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                      Admission Price (INR)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-cream/35 pointer-events-none">
                        ₹
                      </span>
                      <input
                        {...register('price')}
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        className={`w-full bg-[#181818] border rounded-xl pl-8 pr-4 py-3 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-sage/40 transition-all font-mono ${
                          errors.price ? 'border-red-500/40 focus:ring-red-500/40' : 'border-white/5 focus:border-cream/20'
                        }`}
                      />
                    </div>
                    {errors.price && (
                      <span className="text-[10px] text-red-400 ml-1">{errors.price.message}</span>
                    )}
                  </div>

                  {/* Max Capacity */}
                  <div className="space-y-2">
                    <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                      Max Capacity limit
                    </label>
                    <input
                      {...register('maxParticipants')}
                      type="number"
                      min="1"
                      placeholder="Unlimited"
                      className={`w-full bg-[#181818] border rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-sage/40 transition-all font-mono ${
                        errors.maxParticipants ? 'border-red-500/40 focus:ring-red-500/40' : 'border-white/5 focus:border-cream/20'
                      }`}
                    />
                    {errors.maxParticipants && (
                      <span className="text-[10px] text-red-400 ml-1">{errors.maxParticipants.message}</span>
                    )}
                  </div>

                  {/* Booking Deadline */}
                  <div className="space-y-2">
                    <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                      Booking Deadline Date
                    </label>
                    <input
                      {...register('registrationDeadline')}
                      type="date"
                      className={`w-full bg-[#181818] border rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-sage/40 transition-all ${
                        errors.registrationDeadline ? 'border-red-500/40 focus:ring-red-500/40' : 'border-white/5 focus:border-cream/20'
                      }`}
                    />
                    {errors.registrationDeadline && (
                      <span className="text-[10px] text-red-400 ml-1">{errors.registrationDeadline.message}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                  {/* Status */}
                  <div className="space-y-2">
                    <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                      Listing Status
                    </label>
                    <select
                      {...register('status')}
                      className="w-full bg-[#1c1c1c] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-cream focus:outline-none cursor-pointer"
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="CANCELLED">CANCELLED</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>

                  {/* Featured */}
                  <div className="flex items-center gap-3 pl-2 h-full pt-6">
                    <input
                      {...register('featured')}
                      type="checkbox"
                      id="featured"
                      className="w-4.5 h-4.5 bg-[#1c1c1c] border-white/10 rounded cursor-pointer accent-terracotta shrink-0"
                    />
                    <label htmlFor="featured" className="font-sans text-[11px] font-medium uppercase tracking-wider text-cream/70 cursor-pointer select-none">
                      Promote to Featured Hero Section
                    </label>
                  </div>
                </div>
              </div>

              {/* 7. Media Upload Card */}
              <div id="sec-media" className="bg-[#141414]/90 border border-white/5 p-6 md:p-8 rounded-[2.5rem] space-y-4 scroll-mt-24 shadow-lg">
                <div className="border-b border-white/5 pb-4">
                  <span className="text-[9px] uppercase tracking-widest text-terracotta font-semibold">Section Seven</span>
                  <h3 className="font-serif text-lg font-light text-cream mt-0.5">Media Upload</h3>
                </div>

                <div className="space-y-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                    Event Cover Banner Photo
                  </label>
                  <ImageUploader 
                    initialImageUrl={watchAllFields.coverImage}
                    type="cover"
                    slug={watchAllFields.slug || 'event'}
                    onUploadComplete={(uploadedAsset) => {
                      setValue('coverImage', uploadedAsset.secure_url, { shouldValidate: true });
                    }}
                  />
                  {errors.coverImage && (
                    <span className="text-[10px] text-red-400 ml-1 block mt-1">{errors.coverImage.message}</span>
                  )}
                </div>
              </div>

              {/* Submission CTA footer bar */}
              <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl flex items-center justify-between">
                <span className="text-[10px] font-sans font-light text-cream/35">
                  * Ensure all sections are validated in the tracker
                </span>
                
                <div className="flex items-center gap-3">
                  <Link
                    href="/admin/events"
                    className="px-5 py-3 bg-white/5 hover:bg-white/10 text-cream rounded-xl text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    Discard Changes
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-cream text-warm-black hover:bg-cream/90 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <span>Save Listing Changes</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
