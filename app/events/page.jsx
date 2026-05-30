import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Section from '@/components/Section';
import { Heading, Text } from '@/components/Typography';
import EventCard from '@/components/EventCard';
import Container from '@/components/Container';
import EventFilters from './EventFilters';
import { 
  CalendarRange, 
  Sparkle, 
  ChevronRight, 
  SlidersHorizontal,
  ChevronLeft,
  Info,
  CalendarDays,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';

// Dynamic SEO metadata
export const metadata = {
  title: 'Curated Local Events in Surat | Awaken Circle',
  description: 'Join Awaken Running mornings, restorative sound healing circles, or creative pottery workshops. Discover upcoming boutique gatherings in Surat, Gujarat.',
  keywords: 'Surat events, running club Surat, wellness Surat, pottery workshop Surat, Awaken Circle'
};

const formatEventDate = (dateVal) => {
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

export default async function Events({ searchParams }) {
  // Await searchParams in Next.js 15+ App Router
  const params = await searchParams;
  const search = params.search || '';
  const categorySlug = params.category || 'all';
  const communitySlug = params.community || 'all';
  const page = Number(params.page) || 1;
  const limit = 6;
  const skip = (page - 1) * limit;

  // 1. Fetch dynamic categories & communities for filters
  const [categories, communities] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: 'asc' }
    }),
    prisma.community.findMany({
      orderBy: { name: 'asc' }
    })
  ]);

  // 2. Fetch featured events (only shown on Page 1 if no search active)
  const isDefaultView = !search && categorySlug === 'all' && communitySlug === 'all' && page === 1;
  let featuredEvents = [];
  
  if (isDefaultView) {
    featuredEvents = await prisma.event.findMany({
      where: {
        featured: true,
        status: 'PUBLISHED',
        eventDate: { gte: new Date() } // Future events
      },
      include: {
        category: true,
        community: true,
        registrations: {
          where: { NOT: { registrationStatus: 'CANCELLED' } },
          select: { id: true }
        }
      },
      take: 3,
      orderBy: { eventDate: 'asc' }
    });
  }

  // 3. Construct Prisma Filter Object
  const where = {
    status: 'PUBLISHED',
    AND: []
  };

  if (search) {
    where.AND.push({
      OR: [
        { title: { contains: search } },
        { description: { contains: search } },
        { shortDescription: { contains: search } },
        { location: { contains: search } }
      ]
    });
  }

  if (categorySlug !== 'all') {
    where.AND.push({
      category: { slug: categorySlug }
    });
  }

  if (communitySlug !== 'all') {
    where.AND.push({
      community: { slug: communitySlug }
    });
  }

  // Cleanup logical AND array if empty
  if (where.AND.length === 0) {
    delete where.AND;
  }

  // 4. Fetch dynamic count and paginated list
  const [totalEvents, events] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      include: {
        category: true,
        community: true,
        registrations: {
          where: { NOT: { registrationStatus: 'CANCELLED' } },
          select: { id: true }
        }
      },
      orderBy: { eventDate: 'asc' },
      skip,
      take: limit
    })
  ]);

  const totalPages = Math.ceil(totalEvents / limit);

  // Pagination Link Helper
  const buildPageLink = (pageNumber) => {
    const q = new URLSearchParams();
    if (search) q.set('search', search);
    if (categorySlug !== 'all') q.set('category', categorySlug);
    if (communitySlug !== 'all') q.set('community', communitySlug);
    q.set('page', String(pageNumber));
    return `/events?${q.toString()}`;
  };

  return (
    <>
      {/* Background visual blurs */}
      <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-sage/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-[400px] left-10 w-[400px] h-[400px] bg-terracotta/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Hero Header */}
      <section className="bg-beige/40 py-20 border-b border-beige/40 relative overflow-hidden">
        <Container className="text-center max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sage/10 text-sage rounded-full mb-6 text-xs font-semibold uppercase tracking-widest">
            <CalendarRange size={12} />
            Gatherings & Calendars
          </div>
          
          <Heading level={1} className="mb-6 leading-tight">
            Experience the Energy
          </Heading>

          <Text variant="lead" className="font-light text-warm-black/75">
            We curate premium, small-scale events designed to establish healthy weekend routines, introduce physical skills, and connect active people in Surat.
          </Text>
        </Container>
      </section>

      {/* Featured Events Highlights (Page 1 Header picks only) */}
      {isDefaultView && featuredEvents.length > 0 && (
        <Section background="cream" padding="lg" className="border-b border-beige/35">
          <div className="flex flex-col gap-6 mb-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-terracotta flex items-center gap-1.5 leading-none">
              <Sparkle size={12} className="animate-spin-slow text-terracotta" /> Top Curated Pick
            </span>
            <Heading level={2} className="font-serif text-3xl">Featured Gatherings</Heading>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredEvents.map((evt) => {
              const { dateStr, dayNumber, month } = formatEventDate(evt.eventDate);
              const priceLabel = !evt.price || Number(evt.price) === 0 ? "Free Entry" : `₹${Number(evt.price)}`;
              
              const activeCount = evt.registrations.length;
              const isFull = evt.maxParticipants ? activeCount >= evt.maxParticipants : false;
              
              return (
                <div key={evt.id} className="glass-card bg-white/80 border border-beige/65 rounded-[2.5rem] p-6 flex flex-col justify-between group hover-lift shadow-sm relative overflow-hidden">
                  
                  {/* Absolute Featured Ribbon overlay */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-terracotta text-cream text-[9px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-md">
                      Featured
                    </span>
                  </div>

                  <div>
                    {/* Cover image */}
                    {evt.coverImage && (
                      <div className="aspect-[16/10] rounded-[2rem] overflow-hidden border border-beige/40 mb-6 relative">
                        <img 
                          src={evt.coverImage} 
                          alt={evt.title} 
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" 
                          loading="lazy"
                        />
                        <div className="absolute bottom-4 left-4 bg-warm-black text-cream px-3 py-2 rounded-xl flex flex-col items-center min-w-[50px] border border-cream/10 shadow-md">
                          <span className="text-sm font-bold leading-none">{dayNumber}</span>
                          <span className="text-[8px] font-bold text-sage tracking-wider leading-none mt-1 uppercase">{month}</span>
                        </div>
                      </div>
                    )}

                    <span className="text-[9px] font-bold text-sage uppercase tracking-widest block mb-2">{evt.community?.name}</span>
                    <h3 className="font-serif text-lg font-semibold text-warm-black leading-snug group-hover:text-terracotta transition-colors mb-3 line-clamp-1">
                      <Link href={`/events/${evt.slug}`}>{evt.title}</Link>
                    </h3>
                    <p className="font-sans text-xs text-warm-black/60 font-light leading-relaxed mb-6 line-clamp-2">
                      {evt.shortDescription || evt.description}
                    </p>
                  </div>

                  <div className="border-t border-beige/50 pt-5 mt-auto flex flex-col gap-4">
                    
                    {/* Event indicators */}
                    <div className="flex justify-between items-center text-[10px] font-sans text-warm-black/70">
                      <span className="font-semibold text-terracotta">{priceLabel}</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[8px] border ${
                        isFull 
                          ? "bg-terracotta/10 border-terracotta/20 text-terracotta" 
                          : "bg-sage/10 border-sage/20 text-sage"
                      }`}>
                        {isFull ? "Sold Out" : evt.maxParticipants ? `${evt.maxParticipants - activeCount} spots left` : "Open Capacity"}
                      </span>
                    </div>

                    {/* Navigation ctas */}
                    <div className="flex justify-between items-center pt-1.5">
                      <Link 
                        href={`/events/${evt.slug}`} 
                        className="text-[10px] font-bold uppercase tracking-wider text-warm-black/55 group-hover:text-terracotta group-hover:underline transition-all"
                      >
                        Learn More
                      </Link>
                      <Link 
                        href={`/events/${evt.slug}`} 
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-warm-black text-cream text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-terracotta shadow-sm transition-colors group/btn"
                      >
                        Book Spot <ArrowRight size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Filter and Event Listing Segment */}
      <Section background="cream" padding="lg">
        
        {/* Sticky Filters Component */}
        <div className="mb-12">
          <EventFilters 
            categories={categories} 
            communities={communities} 
          />
        </div>

        {/* Counter and status updates */}
        <div className="flex items-center justify-between border-b border-beige/40 pb-6 mb-8 text-xs font-sans text-warm-black/60">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={13} className="text-sage" />
            <span>Showing {totalEvents} experience{totalEvents === 1 ? '' : 's'} in Surat</span>
          </div>
          {search && (
            <span>Result for: &ldquo;<span className="font-semibold text-warm-black">{search}</span>&rdquo;</span>
          )}
        </div>

        {/* Event Cards Grid */}
        <div className="flex flex-col gap-8">
          {events.length > 0 ? (
            events.map((evt) => {
              const { dateStr, dayNumber, month } = formatEventDate(evt.eventDate);
              const priceLabel = !evt.price || Number(evt.price) === 0 ? "Free Entry" : `₹${Number(evt.price)}`;
              const timeRange = evt.endTime ? `${evt.eventTime} - ${evt.endTime}` : evt.eventTime;
              
              const activeCount = evt.registrations.length;
              const isFull = evt.maxParticipants ? activeCount >= evt.maxParticipants : false;
              const seatsLabel = evt.maxParticipants
                ? isFull 
                  ? "Sold Out" 
                  : `${evt.maxParticipants - activeCount} spots remaining`
                : "Open Entry";

              return (
                <div key={evt.id} className="relative">
                  
                  {/* Available Slots Badge Overlay */}
                  <div className="absolute top-4 right-4 z-10 hidden md:block">
                    <span className={`px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-full border shadow-sm ${
                      isFull
                        ? "bg-terracotta/10 border-terracotta/20 text-terracotta"
                        : "bg-sage/10 border-sage/20 text-sage"
                    }`}>
                      {seatsLabel}
                    </span>
                  </div>

                  <EventCard
                    title={evt.title}
                    description={evt.shortDescription || evt.description}
                    date={dateStr}
                    dayNumber={dayNumber}
                    month={month}
                    time={timeRange}
                    location={evt.location}
                    image={evt.coverImage || "/images/events/run-marathon.jpg"}
                    price={priceLabel}
                    tag={evt.category?.name || "Gathering"}
                    href={`/events/${evt.slug}`}
                  />

                </div>
              );
            })
          ) : (
            /* Fallback Empty View */
            <div className="py-24 text-center glass-card rounded-[2.5rem] p-12 bg-white/50 border border-beige/40 shadow-sm max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-full bg-beige/40 text-warm-black/45 flex items-center justify-center mx-auto mb-4">
                <Info size={22} />
              </div>
              <h4 className="font-serif text-2xl text-warm-black/60 mb-2">No Gatherings Found</h4>
              <p className="font-sans text-xs text-warm-black/40 font-light leading-relaxed max-w-xs mx-auto">
                We couldn't match any events to your current filter selectors. Reset the filters or expand your search keys!
              </p>
            </div>
          )}
        </div>

        {/* Dynamic Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 border-t border-beige/30 pt-12 mt-12 font-sans text-xs">
            
            {/* Prev Button */}
            {page > 1 ? (
              <Link 
                href={buildPageLink(page - 1)}
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-white border border-beige hover:border-warm-black text-warm-black/70 hover:text-warm-black rounded-xl transition-all font-semibold uppercase tracking-wider"
              >
                <ChevronLeft size={13} /> Prev
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-beige/10 border border-beige/30 text-warm-black/30 rounded-xl cursor-not-allowed font-semibold uppercase tracking-wider">
                <ChevronLeft size={13} /> Prev
              </span>
            )}

            {/* Current Page Index */}
            <span className="font-semibold text-warm-black bg-beige/30 px-4 py-2.5 rounded-xl border border-beige/50 font-sans tracking-wide">
              Page {page} of {totalPages}
            </span>

            {/* Next Button */}
            {page < totalPages ? (
              <Link 
                href={buildPageLink(page + 1)}
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-white border border-beige hover:border-warm-black text-warm-black/70 hover:text-warm-black rounded-xl transition-all font-semibold uppercase tracking-wider"
              >
                Next <ChevronRight size={13} />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-beige/10 border border-beige/30 text-warm-black/30 rounded-xl cursor-not-allowed font-semibold uppercase tracking-wider">
                Next <ChevronRight size={13} />
              </span>
            )}

          </div>
        )}

      </Section>

      {/* Upgraded Informational Section */}
      <Section background="beige" padding="lg" className="border-t border-beige/40">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="flex flex-col gap-3">
            <h4 className="font-serif text-base font-semibold text-terracotta uppercase tracking-wider">How to Book?</h4>
            <p className="font-sans text-xs text-warm-black/75 leading-relaxed font-light">
              Select the “Book Spot” button on any event page. Provide your contact details inside our secure, real-time registration form, and lock in your entry instantly.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <h4 className="font-serif text-base font-semibold text-sage uppercase tracking-wider">Refund Policy</h4>
            <p className="font-sans text-xs text-warm-black/75 leading-relaxed font-light">
              Because we limit circles to highly intimate caps, ticket cancellations must be requested 48 hours prior to the session time to receive full credit vouchers.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <h4 className="font-serif text-base font-semibold text-warm-black uppercase tracking-wider">Host a Gathering</h4>
            <p className="font-sans text-xs text-warm-black/75 leading-relaxed font-light">
              Are you an expert runner, sound therapist, or yoga practitioner in Surat? We constantly co-partner with dynamic creators to host boutique activities.
            </p>
            <Link 
              href="/contact" 
              className="text-[10px] font-bold text-terracotta uppercase tracking-widest flex items-center gap-1 hover:underline mt-2.5"
            >
              Apply to Host <ChevronRight size={12} className="text-terracotta" />
            </Link>
          </div>

        </div>
      </Section>
    </>
  );
}
