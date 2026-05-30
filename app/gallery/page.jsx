'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ImageIcon } from '@/components/Icons';
import Section from '@/components/Section';
import { Heading, Text } from '@/components/Typography';
import Container from '@/components/Container';

export default function Gallery() {
  const [filter, setFilter] = useState('all');

  const categories = [
    { id: 'all', name: 'All Moments' },
    { id: 'running', name: 'Running Club' },
    { id: 'wellness', name: 'Mind & Wellness' },
    { id: 'socials', name: 'Social Dinners' },
    { id: 'workshops', name: 'Art Workshops' }
  ];

  const photos = [
    {
      id: 1,
      src: "/community_running.png",
      title: "Sunrise Canal Run",
      location: "Vesu Canal Pathway, Surat",
      category: "running",
      span: "md:col-span-2 md:row-span-2"
    },
    {
      id: 2,
      src: "/community_wellness.png",
      title: "Acoustic Sound Healing",
      location: "The Serene Studio, Althan",
      category: "wellness",
      span: "md:col-span-1 md:row-span-1"
    },
    {
      id: 3,
      src: "/community_social.png",
      title: "Golden Hour Courtyard Social",
      location: "Boutique Bistro, Surat",
      category: "socials",
      span: "md:col-span-1 md:row-span-2"
    },
    {
      id: 4,
      src: "/community_workshop.png",
      title: "Ceramics Masterclass",
      location: "Creative Loft, Vesu",
      category: "workshops",
      span: "md:col-span-1 md:row-span-1"
    },
    {
      id: 5,
      src: "/community_running.png",
      title: "Post-Interval Coffee Chat",
      location: "Althan Garden Cafe",
      category: "running",
      span: "md:col-span-1 md:row-span-1"
    },
    {
      id: 6,
      src: "/community_wellness.png",
      title: "Mindful Vinyasa Flow",
      location: "Athwa Lines Garden",
      category: "wellness",
      span: "md:col-span-2 md:row-span-1"
    },
    {
      id: 7,
      src: "/community_social.png",
      title: "Artisanal Table Gathering",
      location: "Private Residence, Vesu",
      category: "socials",
      span: "md:col-span-1 md:row-span-1"
    },
    {
      id: 8,
      src: "/community_workshop.png",
      title: "Charcoal Sketching Session",
      location: "Vesu Art Center",
      category: "workshops",
      span: "md:col-span-1 md:row-span-1"
    }
  ];

  const filteredPhotos = filter === 'all'
    ? photos
    : photos.filter(p => p.category === filter);

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
            <Camera size={12} />
            Visual Archive
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Heading level={1} className="mb-6">
              Capturing the Moments
            </Heading>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Text variant="lead" className="font-light">
              A sensory catalog of morning intervals, restorative breathing circles, shared artisanal breads, and physical artistry across Surat.
            </Text>
          </motion.div>
        </Container>
      </section>

      {/* Filter Menu */}
      <Section background="cream" padding="none" className="py-8 border-b border-beige/40">
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-5 py-2.5 rounded-full font-sans text-xs uppercase tracking-wider font-semibold border transition-all duration-300 whitespace-nowrap ${
                filter === cat.id
                  ? 'bg-warm-black text-cream border-warm-black shadow-md'
                  : 'bg-white text-warm-black/75 border-beige hover:border-warm-black/35'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </Section>

      {/* Grid Portfolio */}
      <Section background="cream" padding="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 auto-rows-[250px]">
          <AnimatePresence mode="popLayout">
            {filteredPhotos.map((photo, idx) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className={`${photo.span} rounded-[2rem] overflow-hidden bg-beige relative group border border-beige/40 hover-lift shadow-sm`}
              >
                <img
                  src={photo.src}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                {/* Aesthetic Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-warm-black/80 via-warm-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-8 flex flex-col justify-end">
                  <span className="text-[10px] font-semibold text-terracotta uppercase tracking-widest font-sans mb-1.5">
                    {photo.category} Circle
                  </span>
                  <h4 className="font-serif text-xl text-cream font-medium leading-tight mb-1">
                    {photo.title}
                  </h4>
                  <p className="font-sans text-[11px] text-cream/70 font-light flex items-center gap-1.5">
                    <ImageIcon size={10} className="text-sage" />
                    {photo.location}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Section>
    </>
  );
}
