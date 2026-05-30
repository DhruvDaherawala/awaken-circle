'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, MapPin, Clock, ArrowRight } from '@/components/Icons';
import Button from './Button';

/**
 * Premium Card component representing a Community Event.
 */
export default function EventCard({
  title,
  description,
  date, // "June 12"
  dayNumber, // "12"
  month, // "JUN"
  time, // "6:00 AM - 7:30 AM"
  location, // "Dumas Hills, Surat"
  image,
  price = "Free Entry",
  tag = "Running",
  href = "/events",
  className = ""
}) {
  return (
    <motion.div
      className={`glass-card rounded-[2rem] overflow-hidden flex flex-col md:flex-row group hover-lift bg-white/75 ${className}`}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Event Image & Date Badge */}
      <div className="relative w-full md:w-2/5 aspect-[4/3] md:aspect-auto min-h-[220px] overflow-hidden bg-beige">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Dynamic Category Tag Overlay */}
        <div className="absolute top-4 left-4">
          <span className="px-3.5 py-1.5 bg-cream/90 backdrop-blur-md text-warm-black text-xs font-semibold uppercase tracking-wider rounded-full border border-beige/40">
            {tag}
          </span>
        </div>

        {/* Visual Date Badge (Warm editorial typography style) */}
        <div className="absolute bottom-4 left-4 bg-warm-black text-cream px-4 py-3 rounded-2xl flex flex-col items-center justify-center min-w-[65px] border border-cream/10 shadow-lg shadow-warm-black/20">
          <span className="font-sans text-xl font-bold tracking-tight leading-none">{dayNumber}</span>
          <span className="font-sans text-[10px] font-semibold uppercase tracking-widest text-sage mt-1 leading-none">{month}</span>
        </div>
      </div>

      {/* Event Details Content */}
      <div className="p-8 md:p-10 flex-1 flex flex-col justify-between">
        <div>
          {/* Tag & Price Row */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium uppercase tracking-widest text-terracotta">{price}</span>
          </div>

          {/* Title & Description */}
          <h3 className="font-serif text-2xl md:text-3xl text-warm-black group-hover:text-terracotta transition-colors duration-300 mb-3">
            <Link href={href}>{title}</Link>
          </h3>
          <p className="font-sans text-sm text-warm-black/70 font-light leading-relaxed mb-6 line-clamp-2">
            {description}
          </p>
        </div>

        {/* Schedule & Location Details */}
        <div className="border-t border-beige/60 pt-6 mt-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2.5 text-warm-black/75">
              <Clock size={16} className="text-sage shrink-0" />
              <span className="font-sans text-xs font-light tracking-wide">{time}</span>
            </div>
            <div className="flex items-center gap-2.5 text-warm-black/75">
              <MapPin size={16} className="text-sage shrink-0" />
              <span className="font-sans text-xs font-light tracking-wide truncate">{location}</span>
            </div>
          </div>

          {/* Booking Action */}
          <div className="flex items-center justify-between gap-4">
            <Link 
              href={href}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-warm-black border-b border-warm-black/15 group-hover:border-terracotta group-hover:text-terracotta transition-colors duration-300 pb-1"
            >
              Learn More
            </Link>
            <Button 
              variant="primary" 
              size="sm" 
              href={href}
              icon={<ArrowRight size={14} />}
            >
              Book Spot
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
