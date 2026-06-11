import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Section from '@/components/Section';
import Container from '@/components/Container';
import { Heading, Text } from '@/components/Typography';
import Button from '@/components/Button';
import EventCard from '@/components/EventCard';
import EventGallery from './EventGallery';
import EventRegistrationForm from '@/components/EventRegistrationForm';
import { Calendar, MapPin, Clock, ArrowRight, ShieldCheck, Sparkles, SlidersHorizontal } from '@/components/Icons';
import { ChevronLeft, ChevronRight, Info, CalendarRange, Users, Sparkle, ExternalLink } from 'lucide-react';

import { unstable_cache } from 'next/cache';

// ISR: revalidate every 15 seconds instead of force-dynamic
export const revalidate = 15;

const formatEventDate = (dateVal) => {
  if (!dateVal) return { dateStr: "", dayNumber: "01", month: "JAN", year: "2026" };
  const d = new Date(dateVal);
  
  const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
  const monthNameLong = d.toLocaleDateString('en-US', { month: 'long' });
  const dayNum = d.getDate();
  const year = d.getFullYear();
  
  const dateStr = `${dayName}, ${monthNameLong} ${dayNum}, ${year}`;
  const dayNumber = String(dayNum).padStart(2, '0');
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  
  return { dateStr, dayNumber, month, year };
};

const formatEventDateShort = (dateVal) => {
  if (!dateVal) return { dateStr: "", dayNumber: "01", month: "JAN" };
  const d = new Date(dateVal);
  const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
  const monthNameLong = d.toLocaleDateString('en-US', { month: 'long' });
  const dayNum = d.getDate();
  
  const dateStr = `${dayName}, ${monthNameLong} ${dayNum}`;
  const dayNumber = String(dayNum).padStart(2, '0');
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  
  return { dateStr, dayNumber, month };
};

const mapDbEventToClient = (dbEvt) => {
  const { dateStr, dayNumber, month } = formatEventDateShort(dbEvt.eventDate);
  const priceLabel = !dbEvt.price || Number(dbEvt.price) === 0 ? "Free Entry" : `₹${Number(dbEvt.price)}`;
  const timeRange = `${dbEvt.eventTime}${dbEvt.endTime ? ` - ${dbEvt.endTime}` : ''}`;
  
  const catName = dbEvt.category?.name || '';
  const catSlug = dbEvt.category?.slug || '';
  
  let filterCategory = 'socials';
  const slug = dbEvt.community?.slug || '';
  if (slug === 'awaken-run') {
    filterCategory = 'running';
  } else if (
    slug === 'awaken-balak' || 
    slug === 'awaken-fitcorp' || 
    catSlug === 'wellness' || 
    catName.toLowerCase().includes('wellness') || 
    catName.toLowerCase().includes('bath')
  ) {
    filterCategory = 'wellness';
  } else if (
    catSlug === 'workshops' || 
    catName.toLowerCase().includes('pottery') || 
    catName.toLowerCase().includes('workshop')
  ) {
    filterCategory = 'workshops';
  } else if (slug === 'awaken-escape' || slug === 'awaken-entertainment' || catSlug === 'socials') {
    filterCategory = 'socials';
  }

  return {
    id: dbEvt.id,
    title: dbEvt.title,
    description: dbEvt.shortDescription || dbEvt.description,
    date: dateStr,
    dayNumber,
    month,
    time: timeRange,
    location: dbEvt.location,
    image: dbEvt.coverImage || "/images/events/run-marathon.jpg",
    price: priceLabel,
    tag: catName || "Gathering",
    category: filterCategory,
    seatsLeft: dbEvt.maxParticipants ? `${dbEvt.maxParticipants} spots` : "Open",
    slug: dbEvt.slug
  };
};

// Shared cached event fetch — used by both generateMetadata and page()
// This eliminates the duplicate DB query that was happening before
const getCachedEvent = unstable_cache(
  async (slug) => {
    return prisma.event.findUnique({
      where: { slug },
      include: {
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
            shortDescription: true,
            description: true,
            themeColor: true,
            logo: true,
          },
        },
        category: { select: { id: true, name: true, slug: true } },
        galleries: { select: { imageUrl: true } },
      },
    });
  },
  ['event-detail'],
  { revalidate: 15 }
);

// Dynamic SEO metadata generator for search engines
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const event = await getCachedEvent(slug);

  if (!event || event.status !== 'PUBLISHED') {
    return {
      title: 'Event Not Found | Awaken Circle',
      description: 'The requested event could not be found or is no longer active.'
    };
  }

  const title = `${event.title} | Awaken ${event.community?.name || 'Circle'} Event`;
  const description = event.shortDescription || event.description.substring(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: event.coverImage ? [{ url: event.coverImage }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: event.coverImage ? [event.coverImage] : [],
    }
  };
}

export default async function EventDetailPage({ params }) {
  const { slug } = await params;

  // 1. Fetch main event using the shared cached function (same cache key as generateMetadata)
  const event = await getCachedEvent(slug);

  // 2. Graceful Themed Fallback: If not found or not published, display a premium "Event Not Found" view with other upcoming options
  if (!event || event.status !== 'PUBLISHED') {
    // Load general upcoming events as options
    const upcomingEvents = await prisma.event.findMany({
      where: { status: 'PUBLISHED', eventDate: { gte: new Date() } },
      take: 3,
      orderBy: { eventDate: 'asc' },
      include: { community: true, category: true }
    });
    const mappedUpcoming = upcomingEvents.map(mapDbEventToClient);

    return (
      <div className="min-h-screen bg-cream flex flex-col justify-center">
        {/* Error Banner */}
        <section className="py-24 border-b border-beige/40 bg-beige/25">
          <Container className="text-center max-w-2xl">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-terracotta/10 text-terracotta mb-6">
              <Info size={24} />
            </div>
            <Heading level={2} className="mb-4">Experience Not Found</Heading>
            <Text variant="body" className="font-light mb-8 max-w-md mx-auto">
              The gathering you are looking for has either passed, been rescheduled, or is currently set to private. Browse our upcoming circles in Surat below.
            </Text>
            <Button variant="secondary" size="md" href="/events" icon={<ChevronLeft size={14} />} iconPosition="left">
              Back to All Events
            </Button>
          </Container>
        </section>

        {/* Suggest Upcoming Events */}
        {mappedUpcoming.length > 0 && (
          <Section background="cream" padding="lg">
            <Container>
              <div className="text-center mb-12">
                <Heading level={3} className="mb-2">Other Upcoming Circles</Heading>
                <Text variant="muted" className="font-light">Secure a spot in one of our upcoming weekend routines.</Text>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mappedUpcoming.map((evt) => (
                  <EventCard
                    key={evt.id}
                    title={evt.title}
                    description={evt.description}
                    date={evt.date}
                    dayNumber={evt.dayNumber}
                    month={evt.month}
                    time={evt.time}
                    location={evt.location}
                    image={evt.image}
                    price={evt.price}
                    tag={evt.tag}
                    href={`/events/${evt.slug}`}
                  />
                ))}
              </div>
            </Container>
          </Section>
        )}
      </div>
    );
  }

  // 3. Batch registration count + similar events fetch into a single Promise.all
  // This saves ~200ms by running both queries concurrently instead of sequentially
  const now = new Date();
  
  const [registrationsCount, similarDbEvents] = await Promise.all([
    // Count non-cancelled registrations
    prisma.registration.count({
      where: {
        eventId: event.id,
        registrationStatus: { not: 'CANCELLED' }
      }
    }),
    // Fetch 3 similar events in same category or community
    prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: event.id },
        eventDate: { gte: now },
        OR: [
          ...(event.categoryId ? [{ categoryId: event.categoryId }] : []),
          { communityId: event.communityId }
        ]
      },
      take: 3,
      orderBy: { eventDate: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        description: true,
        eventDate: true,
        eventTime: true,
        endTime: true,
        location: true,
        coverImage: true,
        price: true,
        maxParticipants: true,
        category: { select: { name: true, slug: true } },
        community: { select: { name: true, slug: true } },
      }
    }),
  ]);

  let similarEvents = similarDbEvents.map(mapDbEventToClient);

  // If no similar events in same category/community, fetch generic upcoming published events
  if (similarEvents.length === 0) {
    const fallbackDbEvents = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: event.id },
        eventDate: { gte: now }
      },
      take: 3,
      orderBy: { eventDate: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        description: true,
        eventDate: true,
        eventTime: true,
        endTime: true,
        location: true,
        coverImage: true,
        price: true,
        maxParticipants: true,
        category: { select: { name: true, slug: true } },
        community: { select: { name: true, slug: true } },
      }
    });
    similarEvents = fallbackDbEvents.map(mapDbEventToClient);
  }

  // 4. Calculate chronological timelines and capacity details
  const { dateStr, dayNumber, month, year } = formatEventDate(event.eventDate);
  
  const isPastEvent = new Date(event.eventDate) < now;
  const isDeadlinePassed = event.registrationDeadline && new Date(event.registrationDeadline) < now;
  const isSoldOut = event.maxParticipants && registrationsCount >= event.maxParticipants;

  let regStatus = "Open";
  let regMessage = "Spots are available. Book your spot today to secure your entry.";
  let isRegisterable = true;
  let statusColor = "bg-sage/10 border-sage/30 text-sage";
  let statusIndicator = "bg-sage";

  if (isPastEvent) {
    regStatus = "Completed";
    regMessage = "This event has already taken place.";
    isRegisterable = false;
    statusColor = "bg-warm-black/10 border-warm-black/20 text-warm-black/60";
    statusIndicator = "bg-warm-black/40";
  } else if (isDeadlinePassed) {
    regStatus = "Deadline Passed";
    regMessage = "Registration is closed because the sign-up deadline has passed.";
    isRegisterable = false;
    statusColor = "bg-terracotta/10 border-terracotta/20 text-terracotta";
    statusIndicator = "bg-terracotta";
  } else if (isSoldOut) {
    regStatus = "Sold Out";
    regMessage = "All spots have been locked. Apply to host or waitlist for the next circle.";
    isRegisterable = false;
    statusColor = "bg-terracotta/15 border-terracotta/30 text-terracotta";
    statusIndicator = "bg-terracotta animate-pulse";
  }

  // Calculate visual capacity gauge
  const capacityPercent = event.maxParticipants 
    ? Math.min(Math.round((registrationsCount / event.maxParticipants) * 100), 100)
    : 0;

  // 5. Build dynamic Photo Gallery from event.galleryImages (JSON array) and event.galleries relations
  let combinedImages = [];
  if (event.galleryImages) {
    try {
      combinedImages = typeof event.galleryImages === 'string'
        ? JSON.parse(event.galleryImages)
        : event.galleryImages;
    } catch (e) {
      combinedImages = [];
    }
  }
  if (event.galleries && event.galleries.length > 0) {
    const relationUrls = event.galleries.map(g => g.imageUrl);
    combinedImages = [...combinedImages, ...relationUrls];
  }
  const uniqueGalleryImages = Array.from(new Set(combinedImages.filter(url => typeof url === 'string')));

  const paragraphs = event.description
    ? event.description.split(/\r?\n\r?\n/).filter(p => p.trim() !== '')
    : [];

  const priceLabel = !event.price || Number(event.price) === 0 ? "Free Entry" : `₹${Number(event.price)}`;

  return (
    <>
      {/* Top Navigation Breadcrumbs */}
      <div className="bg-cream/80 border-b border-beige/40 py-4.5">
        <Container className="flex items-center justify-between text-xs font-sans">
          <Link href="/events" className="flex items-center gap-1 text-warm-black/55 hover:text-terracotta transition-colors duration-300 font-medium">
            <ChevronLeft size={14} /> Back to Events
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 text-warm-black/35 font-light">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link href="/events" className="hover:underline">Events</Link>
            <span>/</span>
            <span className="text-warm-black/75 font-normal truncate max-w-[150px]">{event.title}</span>
          </div>
        </Container>
      </div>

      {/* Cinematic Hero Section */}
      <section className="relative overflow-hidden bg-beige/35 py-12 md:py-20 border-b border-beige/40">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: Floating rounded Cover Image */}
            <div className="lg:col-span-6 relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-beige shadow-xl border border-beige/50 group">
              <img
                src={event.coverImage || "/images/events/run-marathon.jpg"}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out"
              />
              <div className="absolute top-4 left-4">
                <span className="px-4 py-1.5 bg-cream/90 backdrop-blur-md text-warm-black text-[10px] uppercase font-bold tracking-widest rounded-full border border-beige/45 shadow-sm">
                  {event.category?.name || "Gathering"}
                </span>
              </div>
            </div>

            {/* Right: Rich editorial Event Meta */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              
              {/* Hosted Community Row */}
              {event.community && (
                <div className="flex items-center gap-2 mb-4">
                  {event.community.logo ? (
                    <img 
                      src={event.community.logo} 
                      alt={event.community.name} 
                      className="w-7 h-7 rounded-full object-cover border border-beige"
                    />
                  ) : (
                    <div 
                      className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-cream" 
                      style={{ backgroundColor: event.community.themeColor || '#A8B5A2' }}
                    >
                      {event.community.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="font-sans text-xs font-semibold text-warm-black/55 tracking-wide">
                    Hosted by <span className="text-warm-black font-bold underline decoration-sage/55">{event.community.name}</span>
                  </span>
                </div>
              )}

              {/* Title */}
              <Heading level={1} className="text-3xl sm:text-4xl md:text-5xl mb-6 font-normal tracking-wide leading-tight text-warm-black">
                {event.title}
              </Heading>

              {/* Quick Details Chips */}
              <div className="flex flex-wrap gap-3 mb-8">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusIndicator}`} />
                  {regStatus}
                </span>
                {event.price && (
                  <span className="px-3.5 py-1.5 bg-terracotta/10 border border-terracotta/20 text-terracotta text-[10px] font-bold uppercase tracking-wider rounded-full">
                    {priceLabel}
                  </span>
                )}
                {event.maxParticipants && (
                  <span className="px-3.5 py-1.5 bg-sage/10 border border-sage/20 text-sage text-[10px] font-bold uppercase tracking-wider rounded-full">
                    Limit: {event.maxParticipants} Spots
                  </span>
                )}
              </div>

              {/* Short description block */}
              {event.shortDescription && (
                <p className="font-sans text-base md:text-lg text-warm-black/75 leading-relaxed font-light mb-0">
                  {event.shortDescription}
                </p>
              )}
            </div>

          </div>
        </Container>
      </section>

      {/* Main Details and Sticky booking Section */}
      <Section background="cream" padding="md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column (8 cols): Event Details & Gallery */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-10">
            
            {/* Rich Text Description */}
            <div>
              <h3 className="font-serif text-2xl text-warm-black mb-6 pb-2 border-b border-beige/65">About this Gathering</h3>
              {paragraphs.length > 0 ? (
                paragraphs.map((para, idx) => (
                  <p key={idx} className="font-sans text-base md:text-lg text-warm-black/75 font-light leading-relaxed mb-6">
                    {para}
                  </p>
                ))
              ) : (
                <p className="font-sans text-base md:text-lg text-warm-black/70 font-light leading-relaxed mb-6">
                  {event.description}
                </p>
              )}
            </div>

            {/* Photo Gallery component */}
            <EventGallery images={uniqueGalleryImages} eventTitle={event.title} />

            {/* Registration Form Section */}
            {isRegisterable ? (
              <div id="register" className="scroll-mt-28">
                <EventRegistrationForm
                  eventId={event.id}
                  eventTitle={event.title}
                  eventPrice={event.price}
                  eventDate={dateStr}
                  eventTime={event.eventTime}
                  eventLocation={event.location}
                  spotsRemaining={event.maxParticipants ? event.maxParticipants - registrationsCount : null}
                />
              </div>
            ) : (
              <div className="glass-card bg-beige/10 border border-beige/40 p-8 md:p-12 rounded-[2rem] text-center">
                <div className="w-12 h-12 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto mb-4">
                  <Info size={22} />
                </div>
                <h4 className="font-serif text-lg font-medium text-warm-black/70 mb-1">Registrations are Closed</h4>
                <p className="font-sans text-xs text-warm-black/40 font-light max-w-xs mx-auto">
                  {regMessage}
                </p>
              </div>
            )}

          </div>

          {/* Right Column (4 cols): Booking Status and Schedule Info */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-[120px]">
            
            <div className="glass-card bg-white/70 p-6 md:p-8 rounded-[2.5rem] border border-beige/60 shadow-lg flex flex-col gap-6">
              
              {/* Price Tag */}
              <div className="border-b border-beige/50 pb-5">
                <span className="font-sans text-[10px] uppercase tracking-widest text-warm-black/40">Entry Ticket</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="font-serif text-3xl md:text-4xl text-warm-black font-semibold">{priceLabel}</h3>
                  {event.price && Number(event.price) > 0 && <span className="font-sans text-[11px] text-warm-black/40 font-light">per person</span>}
                </div>
              </div>

              {/* Schedule and Location info */}
              <div className="flex flex-col gap-4">
                
                {/* Date */}
                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-xl bg-sage/10 flex items-center justify-center text-sage shrink-0 mt-0.5">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <span className="font-sans text-[10px] uppercase tracking-widest text-warm-black/40">Date</span>
                    <p className="font-sans text-sm font-semibold text-warm-black mt-0.5">{dateStr}</p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-xl bg-terracotta/10 flex items-center justify-center text-terracotta shrink-0 mt-0.5">
                    <Clock size={16} />
                  </div>
                  <div>
                    <span className="font-sans text-[10px] uppercase tracking-widest text-warm-black/40">Time</span>
                    <p className="font-sans text-sm font-semibold text-warm-black mt-0.5">
                      {event.eventTime} {event.endTime ? ` - ${event.endTime}` : ""}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-xl bg-warm-black/5 flex items-center justify-center text-warm-black shrink-0 mt-0.5">
                    <MapPin size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-warm-black/40">Location</span>
                    <p className="font-sans text-sm font-semibold text-warm-black mt-0.5 leading-relaxed">{event.location}</p>
                    {event.googleMapsLink && (
                      <a 
                        href={event.googleMapsLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-terracotta hover:underline mt-1.5 transition-all duration-300"
                      >
                        View on Google Maps <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>

              </div>

              {/* Dynamic Registration capacity gauge */}
              {event.maxParticipants && (
                <div className="bg-beige/20 p-4.5 rounded-2xl border border-beige/40">
                  <div className="flex items-center justify-between text-xs font-sans mb-2 font-medium">
                    <span className="text-warm-black/60">Spots Claimed</span>
                    <span className="text-warm-black font-semibold">
                      {registrationsCount} / {event.maxParticipants} ({capacityPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-beige rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sage rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                  {isRegisterable && (
                    <p className="text-[10px] text-sage font-medium tracking-wide mt-2">
                      🔥 Only {event.maxParticipants - registrationsCount} spots remaining!
                    </p>
                  )}
                </div>
              )}

              {/* Registration Status details and submission action */}
              <div className="mt-2 pt-2 border-t border-beige/45 flex flex-col gap-4">
                
                <div className="flex gap-2.5 items-start">
                  <div className="mt-0.5 shrink-0 text-warm-black/45">
                    <ShieldCheck size={15} />
                  </div>
                  <p className="font-sans text-[11px] leading-relaxed text-warm-black/60">
                    {regMessage}
                  </p>
                </div>

                {isRegisterable ? (
                  <Button
                    variant="primary"
                    size="lg"
                    href="#register"
                    className="w-full justify-center"
                    icon={<ArrowRight size={15} />}
                  >
                    Book My Spot
                  </Button>
                ) : (
                  <div className="w-full px-6 py-4 bg-beige/35 border border-beige/65 text-warm-black/45 text-center font-sans text-xs font-semibold uppercase tracking-wider rounded-full">
                    {regStatus === "Completed" ? "Event Completed" : "Registrations Closed"}
                  </div>
                )}

              </div>

            </div>

            {/* Optional Small community highlight below booking card */}
            {event.community && (
              <div className="mt-6 glass-card bg-beige/25 p-5 rounded-[2rem] border border-beige/50 flex flex-col gap-2">
                <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-sage">About Hosting Circle</span>
                <h4 className="font-serif text-lg text-warm-black">{event.community.name}</h4>
                <p className="font-sans text-xs text-warm-black/60 leading-relaxed font-light">
                  {event.community.shortDescription || event.community.description.substring(0, 95) + "..."}
                </p>
              </div>
            )}

          </div>

        </div>
      </Section>

      {/* Similar Events Section */}
      {similarEvents.length > 0 && (
        <Section background="beige" padding="lg" borderTop={true}>
          <div className="flex flex-col gap-10">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-warm-black/10 pb-5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-terracotta flex items-center gap-1">
                  <Sparkles size={12} /> Curated Continuations
                </span>
                <Heading level={3} className="font-normal font-serif">Similar Circle Gatherings</Heading>
              </div>
              <Link href="/events" className="text-xs font-semibold text-warm-black hover:text-terracotta uppercase tracking-wider flex items-center gap-1.5 hover:underline transition-colors duration-300 pb-0.5">
                Explore All Events <ChevronRight size={14} className="mt-0.5" />
              </Link>
            </div>

            {/* Event cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {similarEvents.map((evt) => (
                <div key={evt.id} className="relative">
                  {/* Spots indicator badge */}
                  <div className="absolute top-4 right-4 z-10 hidden sm:block">
                    <span className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-widest rounded-full border ${
                      evt.seatsLeft === "Open" || evt.seatsLeft.includes("Open")
                        ? "bg-sage/10 border-sage/35 text-sage"
                        : "bg-terracotta/10 border-terracotta/35 text-terracotta"
                    }`}>
                      {evt.seatsLeft}
                    </span>
                  </div>
                  
                  <EventCard
                    title={evt.title}
                    description={evt.description}
                    date={evt.date}
                    dayNumber={evt.dayNumber}
                    month={evt.month}
                    time={evt.time}
                    location={evt.location}
                    image={evt.image}
                    price={evt.price}
                    tag={evt.tag}
                    href={`/events/${evt.slug}`}
                  />
                </div>
              ))}
            </div>

          </div>
        </Section>
      )}
    </>
  );
}
