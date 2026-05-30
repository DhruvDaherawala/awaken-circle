'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Activity, ShieldCheck, Heart } from '@/components/Icons';
import Section from '@/components/Section';
import { Heading, Text } from '@/components/Typography';
import Button from '@/components/Button';
import CommunityCard from '@/components/CommunityCard';
import EventCard from '@/components/EventCard';
import Container from '@/components/Container';

/**
 * Helper to format event date string into separate components
 * @param {string|Date} dateVal - Event date
 */
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

export default function HomeClient({ initialCommunities = [], initialFeaturedEvents = [] }) {
  // Use first 3 communities for homepage display
  const featuredCommunities = initialCommunities.slice(0, 3);
  const featuredEvents = initialFeaturedEvents;

  // Gallery preview images
  const galleryItems = [
    { src: "/images/events/run-marathon.jpg", size: "col-span-1 row-span-1" },
    { src: "/images/events/fitcorp-soundbath.jpg", size: "col-span-1 row-span-2" },
    { src: "/images/events/ent-candlelight.jpg", size: "col-span-1 row-span-1" },
    { src: "/images/events/kids-pottery.jpg", size: "col-span-1 row-span-1" }
  ];

  return (
    <>
      {/* 1. Cinematic Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-warm-black text-cream overflow-hidden">
        {/* Editorial Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/events/run-marathon.jpg"
            alt="Awaken Circle Lifestyle"
            className="w-full h-full object-cover opacity-35 scale-105 animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-warm-black via-warm-black/50 to-transparent" />
        </div>

        <Container className="relative z-10 pt-16 pb-20 flex flex-col items-center text-center">
          {/* Subtle Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 px-4 py-1.5 bg-cream/10 backdrop-blur-md border border-cream/15 rounded-full mb-8"
          >
            <Sparkles size={13} className="text-terracotta" />
            <span className="font-sans text-xs font-medium uppercase tracking-widest text-cream">
              Surat's Premier Lifestyle Circle
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Heading level={1} className="text-cream mb-6 tracking-wide">
              Awaken Circle
            </Heading>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <Text variant="lead" className="text-cream/80 mb-12 font-light font-sans">
              A refined community platform where wellness meets movement. Connecting Surat's active minds through running clubs, sound baths, creative workshops, and cinematic social gatherings.
            </Text>
          </motion.div>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto"
          >
            <Button variant="primary" size="lg" href="/communities" icon={<ArrowRight size={16} />}>
              Explore Communities
            </Button>
            <Button variant="outline" size="lg" href="/events" className="border-cream/35 text-cream hover:bg-cream/10">
              View Events Schedule
            </Button>
          </motion.div>
        </Container>

        {/* Minimal Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-55">
          <span className="font-sans text-[10px] uppercase tracking-widest text-cream/70">Scroll to Explore</span>
          <div className="w-[1px] h-12 bg-cream/30 relative overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 right-0 h-1/2 bg-terracotta"
              animate={{ 
                y: ["0%", "200%"],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </div>
      </section>

      {/* 2. Core Philosophy & Introduction */}
      <Section background="cream" padding="lg" id="philosophy">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Information */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <Heading level={6}>Our Philosophy</Heading>
            <Heading level={2} className="pr-4">
              Designed for those who seek depth in movement and social connections.
            </Heading>
            <Text variant="body" className="font-light">
              Surat is a fast-paced city. But inside the Awaken Circle, we learn to slow down, tune in, and appreciate active living. We combine physical movement (running, fitness meetups) with mindful restoration (yoga, sound therapy) and mental stimulation (workshops, acoustic socials).
            </Text>
            
            {/* Visual Value Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sage/10 flex items-center justify-center text-sage">
                  <Activity size={20} />
                </div>
                <h4 className="font-serif text-lg font-medium text-warm-black">Move Together</h4>
                <p className="font-sans text-xs text-warm-black/60 leading-relaxed font-light">
                  Active running, endurance intervals, and athletic meetups designed to build consistent health.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-2xl bg-terracotta/10 flex items-center justify-center text-terracotta">
                  <Heart size={20} />
                </div>
                <h4 className="font-serif text-lg font-medium text-warm-black">Restore Mind</h4>
                <p className="font-sans text-xs text-warm-black/60 leading-relaxed font-light">
                  Immersive acoustic relaxation, healing frequencies, and alignment yoga under sunrise skies.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-2xl bg-warm-black/5 flex items-center justify-center text-warm-black">
                  <ShieldCheck size={20} />
                </div>
                <h4 className="font-serif text-lg font-medium text-warm-black">Feel Belonging</h4>
                <p className="font-sans text-xs text-warm-black/60 leading-relaxed font-light">
                  Curated workshops and lifestyle meetups that connect you with fellow cultural dreamers in Surat.
                </p>
              </div>
            </div>
          </div>

          {/* Graphical Frame with warm beige */}
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-beige border border-beige/40 shadow-xl shadow-warm-black/5">
              <img
                src="/images/events/fitcorp-soundbath.jpg"
                alt="Mindfulness Sound Bath in Surat"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            
            {/* Absolute floating premium label */}
            <div className="absolute -bottom-6 -left-6 bg-warm-black text-cream p-6 rounded-[2rem] max-w-[200px] border border-cream/5 shadow-2xl hidden sm:block">
              <span className="font-serif text-3xl font-semibold leading-none text-terracotta">500+</span>
              <p className="font-sans text-xs text-cream/70 font-light mt-1.5">Active community members across Surat circles</p>
            </div>
          </div>

        </div>
      </Section>

      {/* 3. Featured Communities */}
      <Section background="beige" padding="lg" id="communities">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl flex flex-col gap-4">
            <Heading level={6}>Featured Circles</Heading>
            <Heading level={2}>Discover your sub-community</Heading>
            <Text variant="body" className="font-light">
              We divide our platform into specialized circles, allowing you to connect based on your personal active and lifestyle goals.
            </Text>
          </div>
          <Button variant="outline" href="/communities" className="shrink-0">
            View All Circles
          </Button>
        </div>

        {/* Dynamic 3 Column Grid */}
        {featuredCommunities.length === 0 ? (
          <div className="text-center py-16 bg-cream/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-warm-black/5">
            <Text className="text-warm-black/50 italic">No community circles found. Check back later!</Text>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCommunities.map((circle) => {
              const tag = circle.name.replace("Awaken ", "");
              const membersCount = circle._count?.events 
                ? `${90 + circle._count.events * 15}+ members`
                : "80+ members";

              return (
                <CommunityCard
                  key={circle.id}
                  title={circle.name}
                  description={circle.shortDescription || circle.description}
                  image={circle.coverImage || "/images/events/run-marathon.jpg"}
                  members={membersCount}
                  tag={tag}
                  href={`/communities#${circle.slug}`}
                />
              );
            })}
          </div>
        )}
      </Section>

      {/* 4. Upcoming Events Preview */}
      <Section background="cream" padding="lg" id="events">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl flex flex-col gap-4">
            <Heading level={6}>Community Gatherings</Heading>
            <Heading level={2}>Upcoming Featured Experiences</Heading>
            <Text variant="body" className="font-light">
              Spaces are limited to preserve intimacy and flow. Select an experience below to secure your spot.
            </Text>
          </div>
          <Button variant="outline" href="/events" className="shrink-0">
            View Full Calendar
          </Button>
        </div>

        {/* Dynamic Event List */}
        {featuredEvents.length === 0 ? (
          <div className="text-center py-16 bg-beige/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-warm-black/5">
            <Text className="text-warm-black/50 italic">No featured events currently scheduled. Check back soon!</Text>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {featuredEvents.map((evt) => {
              const { dateStr, dayNumber, month } = formatEventDate(evt.eventDate);
              const priceLabel = !evt.price || evt.price === "0" ? "Free Entry" : `₹${evt.price}`;
              const timeRange = `${evt.eventTime} - ${evt.endTime}`;

              return (
                <EventCard
                  key={evt.id}
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
                  href="/events"
                />
              );
            })}
          </div>
        )}
      </Section>

      {/* 5. Elegant Gallery Glimpse */}
      <Section background="beige" padding="lg" id="gallery">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-6 flex flex-col gap-4">
            <Heading level={6}>Visual Glimpses</Heading>
            <Heading level={2}>Inside the Circles</Heading>
            <Text variant="body" className="font-light">
              A curated look into our mornings on the pavement, mindful breathing circles in the park, and acoustic dinners beneath the stars. A reflection of the active, modern lifestyle in Surat.
            </Text>
          </div>
          <div className="lg:col-span-6 flex justify-start lg:justify-end">
            <Button variant="secondary" href="/gallery" icon={<ArrowRight size={16} />}>
              Open Community Gallery
            </Button>
          </div>
        </div>

        {/* Masonry Gallery Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[240px]">
          {galleryItems.map((item, idx) => (
            <motion.div
              key={idx}
              className={`${item.size} rounded-[2rem] overflow-hidden bg-cream relative group shadow-sm border border-beige/40`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <img
                src={item.src}
                alt="Community Life"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-warm-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="px-4 py-2 bg-cream/90 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-warm-black">
                  View Glimpse
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* 6. CTA / Newsletter Section */}
      <Section background="dark" padding="xl" className="text-center overflow-hidden">
        {/* Subtle geometric circles */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] border border-cream/5 rounded-full pointer-events-none" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[400px] md:h-[400px] border border-cream/5 rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6">
          <Heading level={6} className="text-terracotta">Join Awaken Circle</Heading>
          <Heading level={2} className="text-cream">
            Ready to live actively and mindfully?
          </Heading>
          <Text variant="body" className="text-cream/70 mb-8 font-light">
            Stay updated with our weekly running schedules, sunset sessions, and boutique workshops. Receive Surat community newsletters and access members-only circle chats.
          </Text>

          {/* Subscription form */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full px-6 py-4 bg-cream/10 border border-cream/15 text-cream rounded-full font-sans text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/50 placeholder:text-cream/40"
              required
            />
            <Button variant="primary" size="md" className="w-full sm:w-auto shrink-0">
              Subscribe
            </Button>
          </div>
          <span className="font-sans text-[10px] text-cream/40 uppercase tracking-widest mt-2">
            No spam • Weekly curation only
          </span>
        </div>
      </Section>
    </>
  );
}
