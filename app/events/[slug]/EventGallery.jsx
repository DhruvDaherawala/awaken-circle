'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, ImageIcon } from '@/components/Icons';

export default function EventGallery({ images = [], eventTitle }) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!images || images.length === 0) {
    return (
      <div className="glass-card bg-white/40 border border-beige/40 p-8 md:p-12 rounded-[2rem] text-center mt-8">
        <div className="w-12 h-12 rounded-full bg-sage/10 text-sage flex items-center justify-center mx-auto mb-4">
          <Camera size={22} />
        </div>
        <h4 className="font-serif text-lg font-medium text-warm-black/70 mb-1">Circle Gallery</h4>
        <p className="font-sans text-xs text-warm-black/40 font-light max-w-xs mx-auto">
          Moments from our upcoming gatherings and active circle meets will appear here.
        </p>
      </div>
    );
  }

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-6">
        <ImageIcon size={18} className="text-terracotta" />
        <h3 className="font-serif text-2xl text-warm-black">Visual Highlights</h3>
      </div>

      {/* Grid of gallery images */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((imgUrl, index) => (
          <motion.div
            key={`${imgUrl}-${index}`}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer bg-beige border border-beige/35 group"
            onClick={() => setActiveIndex(index)}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={imgUrl}
              alt={`${eventTitle} - Gallery ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
            {/* Visual Hover Tint Overlay */}
            <div className="absolute inset-0 bg-warm-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="px-4 py-2 bg-cream/95 text-warm-black text-[10px] uppercase font-bold tracking-widest rounded-full shadow-md scale-95 group-hover:scale-100 transition-transform duration-300">
                View Image
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Premium Lightbox Modal overlay */}
      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-warm-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveIndex(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveIndex(null)}
              className="absolute top-6 right-6 z-50 p-3 bg-cream/10 hover:bg-cream/20 text-cream rounded-full transition-colors duration-300 cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Previous Button */}
            <button
              onClick={handlePrev}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 p-3.5 bg-cream/5 hover:bg-cream/15 text-cream rounded-full transition-colors duration-300 cursor-pointer border border-cream/5 flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 p-3.5 bg-cream/5 hover:bg-cream/15 text-cream rounded-full transition-colors duration-300 cursor-pointer border border-cream/5 flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            {/* Image Wrap */}
            <motion.div
              className="relative max-w-5xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[activeIndex]}
                alt={`${eventTitle} - Gallery full size`}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl border border-cream/10 select-none shadow-2xl"
              />
              
              {/* Pagination caption */}
              <div className="mt-4 text-cream/60 text-xs font-sans font-light tracking-widest uppercase">
                Image {activeIndex + 1} of {images.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
