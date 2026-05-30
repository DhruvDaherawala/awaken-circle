'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from '@/components/Icons';
import Button from './Button';
import Container from './Container';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Hide public navbar on all admin dashboard and login routes
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  // Detect scroll to style navbar dynamically
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Communities', href: '/communities' },
    { name: 'Events', href: '/events' },
    { name: 'About', href: '/about' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact', href: '/contact' }
  ];

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'py-4 bg-cream/90 backdrop-blur-md shadow-md shadow-warm-black/5 border-b border-beige/40' 
            : 'py-6 bg-transparent'
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <Container className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-8 h-8 rounded-full bg-terracotta flex items-center justify-center text-cream font-serif font-semibold text-base transition-transform duration-500 group-hover:rotate-180">
              A
            </span>
            <span className="font-serif text-xl md:text-2xl tracking-wide text-warm-black group-hover:text-terracotta transition-colors duration-300">
              Awaken<span className="font-sans font-light text-sage ml-1">Circle</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative font-sans text-sm font-medium tracking-wider uppercase transition-colors duration-300 py-2 ${
                    isActive ? 'text-terracotta' : 'text-warm-black/75 hover:text-warm-black'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavLine"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button variant="secondary" size="sm" href="/contact">
              Join Circle
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-warm-black hover:text-terracotta transition-colors duration-300 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </Container>
      </motion.header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-warm-black/20 backdrop-blur-md md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            {/* Drawer Panel */}
            <motion.div
              className="absolute top-0 right-0 bottom-0 w-4/5 max-w-sm bg-cream p-8 flex flex-col justify-between shadow-2xl border-l border-beige"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Row inside drawer */}
              <div className="flex flex-col gap-8 mt-12">
                <div className="flex items-center justify-between pb-6 border-b border-beige">
                  <span className="font-serif text-lg tracking-wide text-warm-black">
                    Menu
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-warm-black hover:text-terracotta transition-colors duration-300"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Mobile Links */}
                <nav className="flex flex-col gap-6">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`font-serif text-3xl transition-colors duration-300 ${
                          isActive ? 'text-terracotta' : 'text-warm-black/85 hover:text-warm-black'
                        }`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Row inside drawer */}
              <div className="flex flex-col gap-6 pb-6 border-t border-beige pt-6">
                <p className="font-sans text-xs text-warm-black/55 tracking-wider uppercase">
                  Modern Lifestyle Community • Surat
                </p>
                <Button 
                  variant="primary" 
                  size="md" 
                  href="/contact" 
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                  icon={<ArrowRight size={16} />}
                >
                  Join the Circle
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
