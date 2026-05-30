import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Container from '@/components/Container';
import Section from '@/components/Section';
import { Heading, Text } from '@/components/Typography';
import { 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkle, 
  Copy,
  ChevronRight,
  ArrowLeft,
  Mail,
  PhoneCall,
  QrCode,
  DollarSign
} from 'lucide-react';
import CopyButton from './CopyButton';

// Dynamic metadata for SEO
export const metadata = {
  title: 'Registration Confirmed | Awaken Circle',
  description: 'Your spot at the Awaken Circle gathering has been successfully reserved.',
  robots: { index: false, follow: false } // Success pages shouldn't be indexed
};

export default async function RegistrationSuccessPage({ searchParams }) {
  // Await searchParams in Next.js 15+ environments
  const params = await searchParams;
  const registrationId = params.id;

  let registration = null;
  let isFree = true;

  if (registrationId) {
    registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        event: {
          include: {
            community: true
          }
        }
      }
    });

    if (registration) {
      isFree = !registration.event.price || Number(registration.event.price) === 0;
    }
  }

  // Format Dates safely
  const formatEventDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      {/* Visual background gradient accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sage/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-terracotta/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <Section background="cream" padding="lg" className="min-h-[85vh] flex items-center pt-24 pb-16">
        <Container className="max-w-4xl">
          
          {/* Header Back Link */}
          <div className="mb-8">
            <Link 
              href="/events" 
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-warm-black/50 hover:text-warm-black transition-all group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Gathering Catalog
            </Link>
          </div>

          {!registration ? (
            /* Fallback empty or missing registration view */
            <div className="glass-card bg-white/70 p-8 md:p-16 rounded-[2.5rem] border border-beige/60 text-center shadow-md">
              <div className="w-16 h-16 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="opacity-50" />
              </div>
              <Heading level={2} className="mb-3 font-serif">Inquiry Logged</Heading>
              <Text variant="body" className="font-light mb-8 max-w-sm mx-auto text-warm-black/60">
                If you just submitted a general enquiry or booking request, our concierge is already processing it. If you were looking for a ticket pass, please verify your email links.
              </Text>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/events" className="inline-flex justify-center items-center px-6 py-3.5 bg-warm-black text-cream font-sans text-xs font-semibold uppercase tracking-wider rounded-2xl hover:bg-terracotta transition-colors shadow-sm">
                  Explore Events
                </Link>
                <Link href="/contact" className="inline-flex justify-center items-center px-6 py-3.5 border border-beige hover:bg-beige/10 font-sans text-xs font-semibold uppercase tracking-wider rounded-2xl text-warm-black transition-colors">
                  Contact Support Desk
                </Link>
              </div>
            </div>
          ) : (
            /* Successful Registration Receipt Dashboard */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column (8 Cols): Success Summary and Details */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Success Card */}
                <div className="glass-card bg-white/90 p-8 md:p-10 rounded-[2.5rem] border border-beige/60 shadow-lg relative overflow-hidden">
                  
                  {/* Confirmed / Pending absolute badge */}
                  <div className="absolute top-6 right-6">
                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      isFree ? "bg-sage/10 border border-sage/20 text-sage" : "bg-terracotta/10 border border-terracotta/20 text-terracotta"
                    }`}>
                      <Sparkle size={10} className="animate-spin-slow" />
                      {isFree ? "Confirmed Spot" : "Pre-Registered"}
                    </span>
                  </div>

                  {/* Header */}
                  <div className="flex gap-4 items-start mb-6">
                    <div className="w-12 h-12 rounded-full bg-sage/10 text-sage flex items-center justify-center shrink-0">
                      <CheckCircle size={28} />
                    </div>
                    <div>
                      <span className="font-sans text-[10px] uppercase tracking-widest text-sage font-bold block mb-1">Success! Entry Reserved</span>
                      <Heading level={2} className="text-2xl md:text-3xl font-serif text-warm-black leading-snug">
                        {registration.fullName.split(' ')[0]}, You're In!
                      </Heading>
                    </div>
                  </div>

                  <Text variant="body" className="font-light text-warm-black/70 mb-8 leading-relaxed">
                    {isFree 
                      ? "Your registration for this Awaken Circle gathering is complete. We've verified your spot and loaded it into the entry roster. See you soon!"
                      : "We have registered your details for this circle. Please complete the pending fee using our secure options below to lock in your confirmed slot."
                    }
                  </Text>

                  {/* Ticket Details Panel */}
                  <div className="border-t border-beige/40 pt-8 mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div>
                      <span className="font-sans text-[10px] uppercase tracking-wider text-warm-black/40 block mb-1">Participant Profile</span>
                      <p className="font-sans text-sm font-semibold text-warm-black">{registration.fullName}</p>
                      <p className="font-sans text-xs text-warm-black/60 mt-0.5">{registration.email}</p>
                      <p className="font-sans text-xs text-warm-black/60">{registration.phone}</p>
                    </div>

                    <div>
                      <span className="font-sans text-[10px] uppercase tracking-wider text-warm-black/40 block mb-1">Residential Residence</span>
                      <p className="font-sans text-sm font-semibold text-warm-black">{registration.city || "Surat, Gujarat"}</p>
                      <p className="font-sans text-xs text-warm-black/60 mt-0.5">Age: {registration.age} Years</p>
                      <p className="font-sans text-xs text-warm-black/60">Gender: {registration.gender}</p>
                    </div>

                    <div className="md:col-span-2 bg-beige/20 border border-beige/50 p-4.5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <span className="font-sans text-[9px] uppercase tracking-wider text-warm-black/45 block mb-0.5">Unique Registration ID</span>
                        <code className="font-mono text-xs font-semibold text-warm-black select-all bg-white/80 border border-beige/40 px-2 py-0.5 rounded-lg">{registration.id}</code>
                      </div>
                      <CopyButton text={registration.id} />
                    </div>

                  </div>

                </div>

                {/* Event Summary Card */}
                <div className="glass-card bg-white/70 p-8 rounded-[2.5rem] border border-beige/45 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                  {registration.event.coverImage && (
                    <div className="w-full md:w-36 h-28 rounded-2xl overflow-hidden shrink-0 border border-beige/40 shadow-sm relative">
                      <img 
                        src={registration.event.coverImage} 
                        alt={registration.event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-grow w-full">
                    <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-sage bg-sage/10 px-2.5 py-0.5 rounded-full inline-block mb-2">
                      {registration.event.community?.name || "Awaken Circle"}
                    </span>
                    <h3 className="font-serif text-xl font-medium text-warm-black leading-snug">{registration.event.title}</h3>
                    
                    {/* Event summary grid details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-4 text-xs font-sans text-warm-black/75">
                      <div className="flex items-center gap-2 text-warm-black/70">
                        <Calendar size={13} className="text-sage" />
                        <span>{formatEventDate(registration.event.eventDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-warm-black/70">
                        <Clock size={13} className="text-sage" />
                        <span>{registration.event.eventTime}</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-2 text-warm-black/70 mt-1">
                        <MapPin size={13} className="text-terracotta shrink-0" />
                        <span className="truncate">{registration.event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next Steps Card */}
                <div className="glass-card bg-white/60 p-8 rounded-[2.5rem] border border-beige/40 shadow-sm">
                  <Heading level={4} className="mb-6 font-serif">What Happens Next?</Heading>
                  
                  <div className="flex flex-col gap-6 font-sans text-sm text-warm-black/70">
                    
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-sage/10 text-sage font-bold flex items-center justify-center shrink-0 text-xs">
                        1
                      </div>
                      <div>
                        <h4 className="font-bold text-warm-black mb-1">WhatsApp Verification Thread</h4>
                        <p className="font-light text-xs leading-relaxed">
                          Our support concierge desk automatically initiates a chat on your registered number (<span className="font-semibold">{registration.phone}</span>) within 12 hours. We will coordinate group details and entry schedules.
                        </p>
                      </div>
                    </div>

                    {!isFree && (
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-terracotta/10 text-terracotta font-bold flex items-center justify-center shrink-0 text-xs animate-pulse">
                          2
                        </div>
                        <div>
                          <h4 className="font-bold text-warm-black mb-1">Execute Ticket Payment</h4>
                          <p className="font-light text-xs leading-relaxed">
                            Transfer the entry fee of <span className="font-semibold text-terracotta">₹{Number(registration.event.price)}</span> using GPay or the verification link on WhatsApp. Once executed, your status transitions automatically to CONFIRMED.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-sage/10 text-sage font-bold flex items-center justify-center shrink-0 text-xs">
                        {isFree ? "2" : "3"}
                      </div>
                      <div>
                        <h4 className="font-bold text-warm-black mb-1">Roster Presentation</h4>
                        <p className="font-light text-xs leading-relaxed">
                          You do not need to print this pass. Just quote your name or show the registration ID (<span className="font-mono font-medium text-warm-black">{registration.id}</span>) at the reception desk on the day of the gathering.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Right Column (4 Cols): Secure Payment & Concierge Info */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* QR Code / Payment Desk Card */}
                {!isFree && (
                  <div className="glass-card bg-white/95 p-6 rounded-[2rem] border border-beige/65 shadow-md text-center">
                    <div className="w-10 h-10 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto mb-4">
                      <DollarSign size={20} />
                    </div>
                    <h4 className="font-serif text-base font-semibold text-warm-black mb-1">Instant GPay Entry</h4>
                    <p className="font-sans text-[11px] text-warm-black/50 font-light mb-6">
                      Scan to settle the amount of <span className="font-semibold text-warm-black">₹{Number(registration.event.price)}</span> instantly.
                    </p>
                    
                    {/* Dummy Elegant QR Code Container */}
                    <div className="bg-cream/40 border border-beige/50 p-4.5 rounded-2xl w-40 h-40 mx-auto mb-6 flex items-center justify-center relative">
                      <QrCode size={120} className="text-warm-black opacity-80" />
                      <div className="absolute inset-0 bg-white/5 backdrop-blur-[0.5px] rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="bg-warm-black text-cream px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest">
                          GPay UPI Desk
                        </span>
                      </div>
                    </div>

                    <div className="font-sans text-[10px] text-warm-black/45 leading-relaxed bg-beige/25 p-3.5 rounded-xl border border-beige/50 text-left">
                      <span className="font-semibold text-warm-black block mb-0.5">UPI ID:</span>
                      <code className="font-mono text-warm-black select-all block mb-2 font-medium">awakencircle@okaxis</code>
                      <span className="text-[9px] block">
                        ⚠️ Send a screenshot of the confirmation message on our WhatsApp desk to trigger fast-track confirmation.
                      </span>
                    </div>
                  </div>
                )}

                {/* Support Concierge Desk Card */}
                <div className="glass-card bg-white/80 p-6 rounded-[2rem] border border-beige/50 shadow-sm text-center">
                  <span className="font-sans text-[8px] uppercase tracking-widest text-warm-black/40 block mb-1.5">Direct Assistance</span>
                  <h4 className="font-serif text-base font-medium text-warm-black mb-4">Concierge Desk</h4>
                  
                  <div className="flex flex-col gap-3 font-sans text-xs text-left">
                    <a href="https://wa.me/919876543210" className="flex items-center gap-3 p-3 bg-beige/20 hover:bg-beige/35 border border-beige/50 rounded-xl transition-all group">
                      <PhoneCall size={14} className="text-sage group-hover:scale-110 transition-transform" />
                      <div>
                        <span className="font-semibold text-warm-black block text-[11px]">WhatsApp Desk</span>
                        <span className="text-[10px] text-warm-black/50">+91 98765 43210</span>
                      </div>
                    </a>

                    <a href="mailto:hello@awakencircle.com" className="flex items-center gap-3 p-3 bg-beige/20 hover:bg-beige/35 border border-beige/50 rounded-xl transition-all group">
                      <Mail size={14} className="text-sage group-hover:scale-110 transition-transform" />
                      <div>
                        <span className="font-semibold text-warm-black block text-[11px]">Support Email</span>
                        <span className="text-[10px] text-warm-black/50">hello@awakencircle.com</span>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Safety Guarantee Info */}
                <div className="glass-card bg-sage/5 p-5 rounded-[2rem] border border-sage/10 text-center flex flex-col gap-2 items-center">
                  <ShieldCheck size={20} className="text-sage" />
                  <span className="font-sans text-[9px] font-bold text-sage uppercase tracking-wider">Awaken Circle Safe Gate</span>
                  <p className="font-sans text-[10px] leading-relaxed text-warm-black/55 font-light">
                    Every gathering adheres to premium standards, including qualified runners, medical safety back-ups, and verified local groups.
                  </p>
                </div>

              </div>

            </div>
          )}

        </Container>
      </Section>
    </>
  );
}
