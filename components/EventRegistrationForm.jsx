'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Send, Users } from '@/components/Icons';
import { 
  Sparkle, 
  MapPin, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Download, 
  Info, 
  ShieldCheck,
  CreditCard,
  Building
} from 'lucide-react';
import Button from './Button';
import { Heading, Text } from './Typography';

const phoneRegex = /^\+?[0-9\s\-()]{10,20}$/;

const schema = z.object({
  fullName: z.string()
    .min(1, "Full name is required")
    .max(100, "Full name cannot exceed 100 characters")
    .refine(val => val.trim() !== "", "Full name cannot be empty"),
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(100, "Email cannot exceed 100 characters"),
  phone: z.string()
    .min(1, "Phone number is required")
    .regex(phoneRegex, "Please enter a valid 10-20 digit phone number"),
  age: z.coerce.number()
    .int("Age must be an integer")
    .min(1, "Age must be at least 1")
    .max(120, "Age must be less than 120"),
  gender: z.string().min(1, "Please select a gender"),
  city: z.string()
    .min(1, "City is required")
    .max(100, "City name cannot exceed 100 characters")
    .refine(val => val.trim() !== "", "City cannot be empty"),
  emergencyContact: z.string()
    .max(50, "Emergency contact cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  notes: z.string()
    .max(2000, "Special notes cannot exceed 2000 characters")
    .optional()
    .or(z.literal(""))
});

export default function EventRegistrationForm({ 
  eventId, 
  eventTitle, 
  eventPrice = 0, 
  eventDate = "",
  eventTime = "",
  eventLocation = "",
  spotsRemaining = null,
  onSuccess 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      age: '',
      gender: '',
      city: '',
      emergencyContact: '',
      notes: ''
    }
  });

  const isFree = !eventPrice || Number(eventPrice) === 0;
  const priceDisplay = isFree ? "Free Entry" : `₹${Number(eventPrice)}`;

  const onSubmit = async (values) => {
    setLoading(true);
    setApiError(null);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          eventId
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed. Please check details and try again.');
      }

      router.push(`/events/success?id=${data.data.id}`);
      router.refresh();
      if (onSuccess) {
        onSuccess(data.data);
      }
      reset();
    } catch (err) {
      console.error('Registration Submission Error:', err);
      setApiError(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  // Re-enable form view if needed
  const handleResetForm = () => {
    setSuccessData(null);
    setApiError(null);
  };

  // Render Success receipt view
  if (successData) {
    return (
      <motion.div 
        className="glass-card bg-white/80 p-8 md:p-12 rounded-[2.5rem] border border-beige/65 shadow-xl text-center max-w-2xl mx-auto"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Success check badge */}
        <div className="w-16 h-16 rounded-full bg-sage/10 text-sage flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle size={36} />
        </div>

        <Heading level={2} className="mb-2 text-2xl md:text-3xl font-serif">Registration Received</Heading>
        <Text variant="muted" className="font-light mb-8 max-w-md mx-auto">
          {isFree 
            ? "Your circle spot has been confirmed! An entry receipt has been generated below." 
            : "Pre-registration logged successfully. Complete the circle entry fee to secure your spot."
          }
        </Text>

        {/* High-fidelity Ticket Receipt Box */}
        <div className="bg-beige/25 border border-beige/60 rounded-3xl p-6 mb-8 text-left relative overflow-hidden">
          {/* Vertical decorative ticket punches */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-7 bg-cream rounded-r-full border-r border-y border-beige/60" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-7 bg-cream rounded-l-full border-l border-y border-beige/60" />

          {/* Ticket Header */}
          <div className="flex justify-between items-start gap-4 border-b border-beige/60 pb-4 mb-4">
            <div>
              <span className="font-sans text-[8px] uppercase tracking-widest text-warm-black/40">Gathering Spot Entry</span>
              <h4 className="font-serif text-lg font-medium text-warm-black mt-1 leading-snug">{eventTitle}</h4>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                isFree ? "bg-sage/10 border border-sage/20 text-sage" : "bg-terracotta/10 border border-terracotta/20 text-terracotta"
              }`}>
                {isFree ? "Confirmed" : "Payment Pending"}
              </span>
            </div>
          </div>

          {/* Ticket Details Grid */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-6 font-sans text-xs">
            <div>
              <span className="text-warm-black/40 text-[9px] uppercase tracking-wider block">Participant</span>
              <span className="text-warm-black font-semibold mt-0.5 block">{successData.fullName}</span>
            </div>
            <div>
              <span className="text-warm-black/40 text-[9px] uppercase tracking-wider block">Registration ID</span>
              <span className="text-warm-black font-mono font-medium mt-0.5 block truncate">{successData.id}</span>
            </div>
            
            {/* Conditional Schedule Fields */}
            {(eventDate || successData.event?.eventDate) && (
              <div>
                <span className="text-warm-black/40 text-[9px] uppercase tracking-wider block">Date</span>
                <span className="text-warm-black font-medium mt-0.5 block">
                  {eventDate || new Date(successData.event.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}
            {(eventTime || successData.event?.eventTime) && (
              <div>
                <span className="text-warm-black/40 text-[9px] uppercase tracking-wider block">Timing</span>
                <span className="text-warm-black font-medium mt-0.5 block">
                  {eventTime || successData.event.eventTime}
                </span>
              </div>
            )}
            
            <div className="col-span-2">
              <span className="text-warm-black/40 text-[9px] uppercase tracking-wider block">Location HQ</span>
              <span className="text-warm-black font-medium mt-0.5 block">
                {eventLocation || successData.event?.location || "Althan-Vesu boulevard, Surat"}
              </span>
            </div>
          </div>

          {/* Footer ticket message */}
          {!isFree && (
            <div className="mt-5 pt-4 border-t border-dashed border-beige/60 flex gap-2.5 items-start bg-terracotta/5 p-3 rounded-2xl border border-terracotta/10">
              <CreditCard size={15} className="text-terracotta shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed text-warm-black/70 font-light">
                Secure spot by scanning the WhatsApp payment invite or executing GPay to support desk. Our team will verify credentials within 12 hours.
              </p>
            </div>
          )}
        </div>

        {/* Dynamic CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button variant="secondary" size="md" href="/events" className="w-full sm:w-auto">
            Discover More Gatherings
          </Button>
          <Button variant="outline" size="md" onClick={handleResetForm} className="w-full sm:w-auto">
            Submit Another Entry
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="glass-card bg-white/70 p-8 md:p-12 rounded-[2.5rem] border border-beige/50 shadow-md">
      
      {/* Form Header */}
      <div className="border-b border-beige/40 pb-6 mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Heading level={6} className="text-sage flex items-center gap-1.5 leading-none">
              <Sparkle size={12} className="animate-spin-slow" /> Circle Gathering Signup
            </Heading>
            {spotsRemaining !== null && spotsRemaining > 0 && (
              <span className="inline-flex items-center gap-1 bg-sage/10 text-sage border border-sage/20 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider animate-pulse">
                🔥 {spotsRemaining} Spots Left
              </span>
            )}
          </div>
          <Heading level={3} serif={false} className="text-2xl font-semibold text-warm-black leading-snug">
            Reserve Your Spot
          </Heading>
        </div>
        <div className="bg-beige/30 border border-beige/50 px-4 py-2 rounded-2xl flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-widest text-warm-black/40 block leading-none">Standard Entry</span>
          <span className="font-serif text-sm font-semibold text-warm-black leading-none">{priceDisplay}</span>
        </div>
      </div>

      {/* Global API submission error alert */}
      {apiError && (
        <motion.div 
          className="bg-terracotta/10 border border-terracotta/20 p-4.5 rounded-2xl mb-8 flex gap-3 items-start text-xs text-terracotta font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider block mb-0.5">Booking Issue</span>
            {apiError}
          </div>
        </motion.div>
      )}

      {/* Active Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 relative">
        
        {/* Loading overlay to prevent interaction during submission */}
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 rounded-[2rem] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-8 w-8 text-terracotta" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-sans text-xs font-semibold text-warm-black/60 uppercase tracking-widest">Securing your spot...</span>
            </div>
          </div>
        )}
        {/* Full Name & Email row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-xs font-semibold uppercase tracking-wider text-warm-black/60 flex items-center gap-1">
              Full Name <span className="text-terracotta">*</span>
            </label>
            <input
              type="text"
              {...register('fullName')}
              placeholder="e.g. Advait Shah"
              disabled={loading}
              className={`w-full px-5 py-3.5 bg-cream/35 border ${
                errors.fullName ? "border-terracotta/50 focus:ring-terracotta/20" : "border-beige focus:ring-terracotta/40"
              } rounded-2xl font-sans text-sm focus:outline-none focus:ring-2 placeholder:text-warm-black/30 transition-all`}
            />
            {errors.fullName && (
              <span className="font-sans text-xs text-terracotta font-medium mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.fullName.message}
              </span>
            )}
          </div>

          {/* Email Address */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-xs font-semibold uppercase tracking-wider text-warm-black/60 flex items-center gap-1">
              Email Address <span className="text-terracotta">*</span>
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="e.g. advait@example.com"
              disabled={loading}
              className={`w-full px-5 py-3.5 bg-cream/35 border ${
                errors.email ? "border-terracotta/50 focus:ring-terracotta/20" : "border-beige focus:ring-terracotta/40"
              } rounded-2xl font-sans text-sm focus:outline-none focus:ring-2 placeholder:text-warm-black/30 transition-all`}
            />
            {errors.email && (
              <span className="font-sans text-xs text-terracotta font-medium mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.email.message}
              </span>
            )}
          </div>

        </div>

        {/* Phone & Age row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Phone Number */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-xs font-semibold uppercase tracking-wider text-warm-black/60 flex items-center gap-1">
              Phone Number <span className="text-terracotta">*</span>
            </label>
            <input
              type="tel"
              {...register('phone')}
              placeholder="e.g. 9876543210"
              disabled={loading}
              className={`w-full px-5 py-3.5 bg-cream/35 border ${
                errors.phone ? "border-terracotta/50 focus:ring-terracotta/20" : "border-beige focus:ring-terracotta/40"
              } rounded-2xl font-sans text-sm focus:outline-none focus:ring-2 placeholder:text-warm-black/30 transition-all`}
            />
            {errors.phone && (
              <span className="font-sans text-xs text-terracotta font-medium mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.phone.message}
              </span>
            )}
          </div>

          {/* Age */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-xs font-semibold uppercase tracking-wider text-warm-black/60 flex items-center gap-1">
              Age (Years) <span className="text-terracotta">*</span>
            </label>
            <input
              type="number"
              {...register('age')}
              placeholder="e.g. 26"
              disabled={loading}
              className={`w-full px-5 py-3.5 bg-cream/35 border ${
                errors.age ? "border-terracotta/50 focus:ring-terracotta/20" : "border-beige focus:ring-terracotta/40"
              } rounded-2xl font-sans text-sm focus:outline-none focus:ring-2 placeholder:text-warm-black/30 transition-all`}
            />
            {errors.age && (
              <span className="font-sans text-xs text-terracotta font-medium mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.age.message}
              </span>
            )}
          </div>

        </div>

        {/* Gender & City row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Gender */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-xs font-semibold uppercase tracking-wider text-warm-black/60 flex items-center gap-1">
              Gender Selection <span className="text-terracotta">*</span>
            </label>
            <select
              {...register('gender')}
              disabled={loading}
              className={`w-full px-5 py-3.5 bg-cream/35 border ${
                errors.gender ? "border-terracotta/50 focus:ring-terracotta/20" : "border-beige focus:ring-terracotta/40"
              } rounded-2xl font-sans text-sm focus:outline-none focus:ring-2 text-warm-black transition-all`}
            >
              <option value="" disabled>Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            {errors.gender && (
              <span className="font-sans text-xs text-terracotta font-medium mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.gender.message}
              </span>
            )}
          </div>

          {/* City */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-xs font-semibold uppercase tracking-wider text-warm-black/60 flex items-center gap-1">
              Residential City <span className="text-terracotta">*</span>
            </label>
            <input
              type="text"
              {...register('city')}
              placeholder="e.g. Surat"
              disabled={loading}
              className={`w-full px-5 py-3.5 bg-cream/35 border ${
                errors.city ? "border-terracotta/50 focus:ring-terracotta/20" : "border-beige focus:ring-terracotta/40"
              } rounded-2xl font-sans text-sm focus:outline-none focus:ring-2 placeholder:text-warm-black/30 transition-all`}
            />
            {errors.city && (
              <span className="font-sans text-xs text-terracotta font-medium mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.city.message}
              </span>
            )}
          </div>

        </div>

        {/* Emergency Contact */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-xs font-semibold uppercase tracking-wider text-warm-black/60">
            Emergency Contact Info (Optional)
          </label>
          <input
            type="text"
            {...register('emergencyContact')}
            placeholder="Name & Contact number (e.g. Father: 9876543211)"
            disabled={loading}
            className={`w-full px-5 py-3.5 bg-cream/35 border ${
              errors.emergencyContact ? "border-terracotta/50 focus:ring-terracotta/20" : "border-beige focus:ring-terracotta/40"
            } rounded-2xl font-sans text-sm focus:outline-none focus:ring-2 placeholder:text-warm-black/30 transition-all`}
          />
          {errors.emergencyContact && (
            <span className="font-sans text-xs text-terracotta font-medium mt-1 flex items-center gap-1">
              <AlertCircle size={12} /> {errors.emergencyContact.message}
            </span>
          )}
        </div>

        {/* Special Notes / Requests */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-xs font-semibold uppercase tracking-wider text-warm-black/60">
            Special Notes / Requests (Optional)
          </label>
          <textarea
            {...register('notes')}
            rows={4}
            placeholder="Mention any physical restrictions, medical history, diet guidelines, or group requests..."
            disabled={loading}
            className={`w-full px-5 py-3.5 bg-cream/35 border ${
              errors.notes ? "border-terracotta/50 focus:ring-terracotta/20" : "border-beige focus:ring-terracotta/40"
            } rounded-2xl font-sans text-sm focus:outline-none focus:ring-2 placeholder:text-warm-black/30 resize-none transition-all`}
          />
          {errors.notes && (
            <span className="font-sans text-xs text-terracotta font-medium mt-1 flex items-center gap-1">
              <AlertCircle size={12} /> {errors.notes.message}
            </span>
          )}
        </div>

        {/* Bottom trust validation footer */}
        <div className="pt-2 flex items-start gap-2 text-[10px] leading-relaxed text-warm-black/45">
          <ShieldCheck size={14} className="shrink-0 mt-0.5 text-sage" />
          <p>
            By booking a spot, you agree to Awaken Circle guidelines. All personal details are stored privately in compliance with data privacy standards and are never sold to external third parties.
          </p>
        </div>

        {/* Submit Action */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
          className="mt-4 w-full justify-center"
          icon={loading ? <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <Send size={15} />}
        >
          {loading ? 'Reserving Your Spot...' : 'Submit Registration'}
        </Button>

      </form>
    </div>
  );
}
