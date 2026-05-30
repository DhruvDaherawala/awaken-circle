'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Info, HelpCircle, Compass, Smile, Zap, Users } from '@/components/Icons';
import Section from '@/components/Section';
import { Heading, Text } from '@/components/Typography';
import Button from '@/components/Button';
import Container from '@/components/Container';

export default function About() {
  const pillars = [
    {
      title: "Conscious Movement",
      description: "We don't run or exercise simply to burn energy. We move to connect with our breath, build endurance, establish robust morning routines, and enjoy the physical body.",
      icon: <Zap size={22} className="text-terracotta" />
    },
    {
      title: "Tactile Experiences",
      description: "In an era of hyper-digitization, we value physical touchpoints. Our sound baths are acoustic, our workshops are physical, and our discussions are in-person in Surat's finest spots.",
      icon: <Compass size={22} className="text-sage" />
    },
    {
      title: "Inclusive Intimacy",
      description: "We focus on curated sizes. We ensure that every runner is cheered, every wellness seeker finds a quiet mat, and every attendee goes home having made real, genuine friends.",
      icon: <Smile size={22} className="text-warm-black" />
    }
  ];

  const faqs = [
    {
      q: "What is Awaken Circle and how does it work?",
      a: "Awaken Circle is Surat's premier modern lifestyle and wellness community. We host physical running meetups, restorative sound therapy, sunset yoga, cultural workshops, and social gatherings. You can participate in individual events by booking a spot, or apply for full membership to enjoy priority access and community-wide circle benefits."
    },
    {
      q: "Do I need to be an expert runner to join the Running Club?",
      a: "Absolutely not. Our morning running meetups are highly supportive. We divide runners into pace groups—including walk-runners, intermediate steady pacers, and speed athletes. No runner is ever left behind, and we always gather together at the end for social coffees."
    },
    {
      q: "Where do these events take place in Surat?",
      a: "Most of our events are centered around premium lifestyle hubs in Surat—predominantly in Vesu, Althan, Vesu Canal Road, Dumas hills, and quiet private gardens and creative lofts across Surat."
    },
    {
      q: "How can I secure a spot in sound bath wellness or art workshops?",
      a: "Simply browse our Events page and click “Book Spot” on the event you want to join. Complete the simple inquiry form, and our concierge team will reach out via WhatsApp/email within 12 hours with payment details and your registration confirmation."
    },
    {
      q: "What are the benefits of a Full Membership?",
      a: "Members receive full unlimited entry to regular running intervals, priority booking for limited workshops/sound baths, a custom welcome merchandise kit, access to our exclusive community groups, and private invites to monthly intellectual dinners."
    }
  ];

  return (
    <>
      {/* Header */}
      <section className="bg-beige/40 py-20 border-b border-beige/40">
        <Container className="text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-sage/10 text-sage rounded-full mb-6 text-xs font-semibold uppercase tracking-widest"
          >
            <Info size={12} />
            Our Story & Values
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Heading level={1} className="mb-6">
              Awakening Surat's Active Spirit
            </Heading>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Text variant="lead" className="font-light">
              We started with a simple belief: a city's standard social routine shouldn't be limited to cafes and shopping. There is a need for healthy movement, mindful breathing, and authentic human connection.
            </Text>
          </motion.div>
        </Container>
      </section>

      {/* Main Philosophy Section */}
      <Section background="cream" padding="lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Founders message */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <Heading level={6}>The Genesis</Heading>
            <Heading level={2}>A Space to Slow Down and Tune In</Heading>
            <Text variant="body" className="font-light">
              Awaken Circle was founded by a collective of runners, therapists, and designers in Surat who felt a shared disconnect in modern urban life. While the city thrived industrially and commercially, physical health and mental space were often neglected.
            </Text>
            <Text variant="body" className="font-light">
              We wanted to create a platform that represents a refined, modern lifestyle—one where catching the 6:00 AM sunrise breeze, feeling the resonance of a bronze singing bowl, or painting with charcoal is valued as a meaningful way to spend your weekend.
            </Text>
            <blockquote className="border-l-2 border-terracotta pl-6 py-1 my-2">
              <p className="font-serif italic text-lg text-warm-black/80 font-light">
                “Awaken Circle is not a gym, nor is it a social club. It is a shared ecosystem of active minds seeking physical health, mental space, and beautiful shared moments in Surat.”
              </p>
              <cite className="font-sans text-xs uppercase tracking-widest font-semibold text-warm-black/55 mt-2 block not-italic">
                — Collective Founders Statement
              </cite>
            </blockquote>
          </div>

          {/* Visual Element */}
          <div className="lg:col-span-6">
            <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-beige shadow-lg border border-beige/40">
              <img
                src="/community_social.png"
                alt="Awaken Circle Social Evening"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

        </div>
      </Section>

      {/* Core Pillars */}
      <Section background="beige" padding="lg">
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-4">
          <Heading level={6}>Our Foundation</Heading>
          <Heading level={2}>The Three Pillars</Heading>
          <Text variant="body" className="font-light">
            Everything we do is guided by these core concepts to ensure we deliver high-value lifestyle experiences.
          </Text>
        </div>

        {/* 3 Column Pillar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => (
            <div key={idx} className="glass-card bg-cream/70 rounded-[2rem] p-8 flex flex-col gap-5 border border-beige/50">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                {pillar.icon}
              </div>
              <h3 className="font-serif text-2xl text-warm-black">{pillar.title}</h3>
              <p className="font-sans text-sm text-warm-black/70 leading-relaxed font-light">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ Accordion Section */}
      <Section background="cream" padding="lg" id="faq">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-terracotta/10 text-terracotta rounded-full w-fit text-xs font-semibold uppercase tracking-widest">
              <HelpCircle size={12} />
              Common Inquiries
            </div>
            <Heading level={2}>Frequently Asked Questions</Heading>
            <Text variant="body" className="font-light pr-4">
              Can't find your answer here? Please feel free to reach out to our concierge service on the contact page.
            </Text>
            <Button variant="outline" href="/contact" className="w-fit mt-4">
              Contact Concierge
            </Button>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-6">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="pb-6 border-b border-warm-black/5 last:border-b-0"
              >
                <h4 className="font-serif text-xl text-warm-black mb-3 font-normal">
                  {faq.q}
                </h4>
                <p className="font-sans text-sm text-warm-black/75 leading-relaxed font-light">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

        </div>
      </Section>
    </>
  );
}
