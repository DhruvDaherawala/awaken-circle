'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Compass, Star, ChevronRight, Check, ArrowRight } from '@/components/Icons';
import Section from '@/components/Section';
import { Heading, Text } from '@/components/Typography';
import Button from '@/components/Button';
import Container from '@/components/Container';

export default function Communities() {
  const circles = [
    {
      id: "running",
      title: "Awaken Running Club",
      subtitle: "Speed, Endurance, and Sunrise Conversations",
      tag: "Running & Fitness",
      image: "/community_running.png",
      lead: "Darshan Patel (Boston Marathoner)",
      frequency: "Tue, Thu, Sun Morning",
      location: "Vesu Canal Rd / Althan Garden, Surat",
      benefits: [
        "Structured interval running and aerobic build-ups",
        "Expert coaching advice on gait, breathing, and pacing",
        "Curated post-run social chats over filter coffee",
        "Exclusive Strava Club leaderboard tracking"
      ],
      description: "Whether you are aiming for your first 5k run or training for a full marathon, the Awaken Running Club offers a supportive environment. We believe running is not just an individual challenge, but a premium social event. Our mornings start at 5:45 AM, catching the quiet sunrise breeze on Surat's cleanest pavements."
    },
    {
      id: "wellness",
      title: "Mind & Body Wellness Circle",
      subtitle: "Slow Down and Reset Your Nervous System",
      tag: "Wellness & Meditation",
      image: "/community_wellness.png",
      lead: "Kriti Shah (Sound Therapist)",
      frequency: "Alternate Saturdays & Sundays",
      location: "The Serene Studio, Althan, Surat",
      benefits: [
        "Acoustic sound baths using Himalayan singing bowls",
        "Sunrise and sunset Vinyasa & Yin Yoga flows",
        "Guided pranayama and modern stress-release sessions",
        "Mindfulness books, journals, and herbal tea circles"
      ],
      description: "Escape the high-pressure routine. The Mind & Body Wellness Circle focuses on conscious relaxation. We curate quiet experiences—combining healing sound frequencies, meditation, and light structural yoga. Our spaces are designed with natural wood, soft linens, and minimal lighting to optimize your restoration."
    },
    {
      id: "socials",
      title: "Lifestyle & Social Gatherings",
      subtitle: "Modern Connections and Intellectual Dinners",
      tag: "Social & Lifestyle",
      image: "/community_social.png",
      lead: "Meera Desai (Cultural Curator)",
      frequency: "Once a Month (Fridays/Saturdays)",
      location: "Aesthetic Cafes & Venues in Surat",
      benefits: [
        "Curated dining experiences with local culinary masters",
        "Open dialog meetups about lifestyle, wellness, and art",
        "Acoustic courtyard evenings with independent songwriters",
        "Access to premium networking with creative minds"
      ],
      description: "For the dreamers, the thinkers, and the creators. We believe that standard clubbing and crowded cafes shouldn't be the only social options in Surat. We curate elegant social experiences—like rustic outdoor dinners, acoustic performances under warm fairy lights, and deep-dive conversational clubs."
    },
    {
      id: "workshops",
      title: "Creative Workshops",
      subtitle: "Hands-on Learning and Artistic Expression",
      tag: "Cultural & Creative",
      image: "/community_workshop.png",
      lead: "Rohan Mehta (Visual Artist)",
      frequency: "Monthly Weekends",
      location: "Creative Loft, Vesu, Surat",
      benefits: [
        "Ceramics, pottery, and clay modeling masterclasses",
        "Minimalist canvas painting and charcoal sketching",
        "Specialty coffee brewing and tasting sessions",
        "Floristry, journaling, and indoor gardening workshops"
      ],
      description: "Awaken your creative hands. Our workshops are designed to break you away from screens and connect you back to tactile materials. Instructed by expert artisans, these boutique masterclasses are designed for absolute beginners who wish to experience the beautiful process of creation."
    }
  ];

  return (
    <>
      {/* Page Header */}
      <section className="bg-beige/40 py-20 border-b border-beige/40">
        <Container className="text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-sage/10 text-sage rounded-full mb-6 text-xs font-semibold uppercase tracking-widest"
          >
            <Compass size={12} />
            Explore the Community
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Heading level={1} className="mb-6">
              Our Specialized Circles
            </Heading>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Text variant="lead" className="font-light">
              We believe a single large group loses intimacy. That's why Awaken Circle is split into specialized sub-communities tailored to your specific active and lifestyle goals.
            </Text>
          </motion.div>
        </Container>
      </section>

      {/* Circle Detailed Sections */}
      {circles.map((circle, idx) => {
        const isEven = idx % 2 === 0;
        return (
          <Section
            key={circle.id}
            id={circle.id}
            background={isEven ? 'cream' : 'beige'}
            padding="lg"
            borderBottom={idx !== circles.length - 1}
          >
            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center`}>
              
              {/* Image Column */}
              <div className={`lg:col-span-6 ${!isEven ? 'lg:order-last' : ''}`}>
                <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-beige shadow-md border border-beige/40">
                  <img
                    src={circle.image}
                    alt={circle.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

              {/* Information Column */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-terracotta bg-terracotta/5 px-3.5 py-1.5 rounded-full border border-terracotta/10">
                    {circle.tag}
                  </span>
                  <Heading level={2} className="mt-4 mb-2">
                    {circle.title}
                  </Heading>
                  <p className="font-serif italic text-lg text-warm-black/60 font-light">
                    {circle.subtitle}
                  </p>
                </div>

                <Text variant="body" className="font-light">
                  {circle.description}
                </Text>

                {/* Circle stats in simple boxes */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-warm-black/5 my-2">
                  <div>
                    <span className="font-sans text-[10px] uppercase tracking-widest text-warm-black/40">Circle Leader</span>
                    <p className="font-sans text-sm font-semibold text-warm-black mt-1 flex items-center gap-1.5">
                      <Star size={13} className="text-terracotta shrink-0" />
                      {circle.lead}
                    </p>
                  </div>
                  <div>
                    <span className="font-sans text-[10px] uppercase tracking-widest text-warm-black/40">Meeting Frequency</span>
                    <p className="font-sans text-sm font-semibold text-warm-black mt-1 flex items-center gap-1.5">
                      <Calendar size={13} className="text-sage shrink-0" />
                      {circle.frequency}
                    </p>
                  </div>
                </div>

                {/* Key Benefits List */}
                <div>
                  <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-warm-black mb-4">What you can expect:</h4>
                  <ul className="flex flex-col gap-3">
                    {circle.benefits.map((benefit, bidx) => (
                      <li key={bidx} className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-sage/10 flex items-center justify-center text-sage shrink-0 mt-0.5">
                          <Check size={12} className="stroke-[3]" />
                        </span>
                        <span className="font-sans text-sm text-warm-black/80 font-light leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Call to action */}
                <div className="pt-4 flex gap-4">
                  <Button variant="secondary" size="md" href="/contact">
                    Apply to Join Circle
                  </Button>
                  <Button variant="text" size="md" href="/events" icon={<ChevronRight size={16} />}>
                    See Scheduled Runs & Events
                  </Button>
                </div>

              </div>

            </div>
          </Section>
        );
      })}

      {/* Circle Membership Card */}
      <Section background="dark" padding="lg" className="text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
          <Heading level={6} className="text-terracotta">Community Membership</Heading>
          <Heading level={2} className="text-cream">Create Meaningful Routines</Heading>
          <Text variant="body" className="text-cream/70 font-light">
            An Awaken Circle membership grants you direct entry to all sub-circles, a curated welcome kit, priority access to high-demand sound baths/workshops, and access to private group chats.
          </Text>
          <div className="mt-4 flex gap-4">
            <Button variant="primary" size="lg" href="/contact" icon={<ArrowRight size={16} />}>
              Become a Member
            </Button>
            <Button variant="outline" size="lg" href="/about" className="border-cream/20 text-cream hover:bg-cream/10">
              Read Community FAQs
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
