'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, ArrowUpRight } from '@/components/Icons';

/**
 * Premium rounded Card component representing a Community Circle.
 */
export default function CommunityCard({
  title,
  description,
  image,
  members = "80+ members",
  tag = "Wellness",
  href = "/communities",
  className = ""
}) {
  return (
    <motion.div
      className={`glass-card rounded-[2rem] overflow-hidden flex flex-col group hover-lift bg-white/70 ${className}`}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Image Container with Zoom Effect */}
      <div className="relative aspect-[4/3] overflow-hidden bg-beige">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Floating Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3.5 py-1.5 bg-cream/90 backdrop-blur-md text-warm-black text-xs font-semibold uppercase tracking-wider rounded-full border border-beige/40">
            {tag}
          </span>
        </div>

        {/* Member Count Overlay */}
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-warm-black/60 backdrop-blur-md text-cream text-xs font-medium rounded-full">
            <Users size={12} className="text-sage" />
            <span>{members}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-8 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-2xl text-warm-black group-hover:text-terracotta transition-colors duration-300 mb-3 flex items-start justify-between gap-2">
            <span>{title}</span>
            <span className="w-8 h-8 rounded-full border border-warm-black/10 flex items-center justify-center opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-cream">
              <ArrowUpRight size={14} className="text-warm-black" />
            </span>
          </h3>
          <p className="font-sans text-sm text-warm-black/70 leading-relaxed font-light mb-6 line-clamp-3">
            {description}
          </p>
        </div>

        {/* Action Link */}
        <Link
          href={href}
          className="text-xs font-semibold uppercase tracking-widest text-warm-black border-b border-warm-black/15 group-hover:border-terracotta group-hover:text-terracotta w-fit transition-colors duration-300 pb-1"
        >
          Explore Circle
        </Link>
      </div>
    </motion.div>
  );
}
