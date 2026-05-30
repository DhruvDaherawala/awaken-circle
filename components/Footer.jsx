'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Instagram, MapPin, Mail, Phone, ArrowUpRight } from '@/components/Icons';
import Container from './Container';

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Hide public footer on all admin dashboard and login routes
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Communities', href: '/communities' },
    { name: 'Events', href: '/events' },
    { name: 'About', href: '/about' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact', href: '/contact' }
  ];

  const communityLinks = [
    { name: 'Awaken Running Club', href: '/communities#running' },
    { name: 'Mind & Body Wellness', href: '/communities#wellness' },
    { name: 'Lifestyle & Socials', href: '/communities#socials' },
    { name: 'Creative Workshops', href: '/communities#workshops' },
    { name: 'Entertainment & Music', href: '/communities#entertainment' }
  ];

  const socialLinks = [
    { name: 'Instagram', href: 'https://instagram.com', icon: <Instagram size={18} /> },
    { name: 'Strava Club', href: 'https://strava.com', icon: <ArrowUpRight size={18} /> },
    { name: 'WhatsApp Community', href: 'https://whatsapp.com', icon: <ArrowUpRight size={18} /> },
  ];

  return (
    <footer className="bg-warm-black text-cream pt-20 pb-10 border-t border-cream/5 relative overflow-hidden">
      {/* Background Accent Element */}
      <div className="absolute right-0 bottom-0 w-96 h-96 bg-sage/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute left-10 top-10 w-64 h-64 bg-terracotta/5 rounded-full filter blur-[80px] pointer-events-none" />

      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-16 border-b border-cream/10">
          
          {/* Brand Intro Column */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-terracotta flex items-center justify-center text-cream font-serif font-semibold text-base">
                A
              </span>
              <span className="font-serif text-2xl tracking-wide text-cream">
                Awaken<span className="font-sans font-light text-sage ml-1">Circle</span>
              </span>
            </Link>
            <p className="font-sans text-sm text-cream/70 font-light leading-relaxed">
              Surat's premier modern lifestyle and wellness community. Connecting active runners, wellness enthusiasts, and cultural minds through curated physical gatherings and mindful experiences.
            </p>
            <div className="flex items-center gap-4 mt-2">
              {socialLinks.map((soc) => (
                <a
                  key={soc.name}
                  href={soc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-cream/15 flex items-center justify-center text-cream/80 hover:text-terracotta hover:border-terracotta transition-all duration-300"
                  aria-label={soc.name}
                >
                  {soc.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="font-serif text-lg font-medium text-cream mb-6 tracking-wide">Quick Links</h4>
            <ul className="flex flex-col gap-3.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="font-sans text-sm text-cream/75 hover:text-terracotta transition-colors duration-300 font-light"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Communities Column */}
          <div>
            <h4 className="font-serif text-lg font-medium text-cream mb-6 tracking-wide">Community Circles</h4>
            <ul className="flex flex-col gap-3.5">
              {communityLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="font-sans text-sm text-cream/75 hover:text-terracotta transition-colors duration-300 font-light"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information Column */}
          <div>
            <h4 className="font-serif text-lg font-medium text-cream mb-6 tracking-wide">Say Hello</h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-sage shrink-0 mt-0.5" />
                <span className="font-sans text-sm text-cream/75 font-light leading-relaxed">
                  07, The Boulevard, Vesu-Althan Road, Vesu, Surat, GJ 395007
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-sage shrink-0" />
                <a 
                  href="mailto:hello@awakencircle.com" 
                  className="font-sans text-sm text-cream/75 hover:text-terracotta transition-colors duration-300 font-light"
                >
                  hello@awakencircle.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-sage shrink-0" />
                <a 
                  href="tel:+919876543210" 
                  className="font-sans text-sm text-cream/75 hover:text-terracotta transition-colors duration-300 font-light"
                >
                  +91 98765 43210
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-cream/55 text-xs font-light tracking-wide gap-4">
          <p>© {currentYear} Awaken Circle Surat. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Designed with <span className="text-terracotta">♥</span> for the Surat Lifestyle.
          </p>
        </div>
      </Container>
    </footer>
  );
}
