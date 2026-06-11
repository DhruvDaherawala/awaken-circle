'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, CheckCircle, Send, Users } from '@/components/Icons';
import Section from '@/components/Section';
import { Heading, Text } from '@/components/Typography';
import Button from '@/components/Button';
import Container from '@/components/Container';

function ContactFormContent() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    circle: 'general',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Automatically check if there is an incoming event in the URL query
  useEffect(() => {
    const eventParam = searchParams.get('event');
    if (eventParam) {
      setFormData(prev => ({
        ...prev,
        circle: 'event-booking',
        message: `I would like to book a spot for the event: "${eventParam}"`
      }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Contact Form Submission Error:', error);
      alert(error.message || 'Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
      
      {/* Contact Details & Info Column */}
      <div className="lg:col-span-5 flex flex-col gap-8">
        <div>
          <Heading level={6}>Concierge Services</Heading>
          <Heading level={2} className="mt-4 mb-4">Connect with the Circle</Heading>
          <Text variant="body" className="font-light">
            Whether you want to join a running club, secure a spot at a sound therapy event, apply for full membership, or suggest a Surat brand partnership, we are ready to assist.
          </Text>
        </div>

        {/* Contact details list */}
        <div className="flex flex-col gap-6 mt-4">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-sage/10 flex items-center justify-center text-sage shrink-0 mt-1">
              <Mail size={18} />
            </div>
            <div>
              <span className="font-sans text-[10px] uppercase tracking-widest text-warm-black/40">Direct Mail</span>
              <p className="font-sans text-sm font-semibold text-warm-black mt-1">hello@awakencircle.com</p>
              <p className="font-sans text-xs text-warm-black/55 mt-0.5">Response within 12 hours</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-terracotta/10 flex items-center justify-center text-terracotta shrink-0 mt-1">
              <Phone size={18} />
            </div>
            <div>
              <span className="font-sans text-[10px] uppercase tracking-widest text-warm-black/40">WhatsApp Support</span>
              <p className="font-sans text-sm font-semibold text-warm-black mt-1">+91 98765 43210</p>
              <p className="font-sans text-xs text-warm-black/55 mt-0.5">Mon - Sat, 9:00 AM - 7:00 PM</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-warm-black/5 flex items-center justify-center text-warm-black shrink-0 mt-1">
              <MapPin size={18} />
            </div>
            <div>
              <span className="font-sans text-[10px] uppercase tracking-widest text-warm-black/40">The Hub HQ</span>
              <p className="font-sans text-sm font-semibold text-warm-black mt-1">Vesu-Althan Main Road, Surat</p>
              <p className="font-sans text-xs text-warm-black/55 mt-0.5">07, Lifestyle Boulevard, Surat, GJ</p>
            </div>
          </div>
        </div>

        {/* Community stats highlight in box */}
        <div className="glass-card bg-beige/30 p-6 rounded-[2rem] border border-beige/60 mt-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-terracotta text-cream flex items-center justify-center">
            <Users size={18} />
          </div>
          <div>
            <h4 className="font-serif text-lg font-medium text-warm-black">Weekly Updates</h4>
            <p className="font-sans text-xs text-warm-black/60 font-light mt-0.5">Join 500+ Surat locals receiving running paths and restorative timings.</p>
          </div>
        </div>
      </div>

      {/* Inquiry Form Column */}
      <div className="lg:col-span-7">
        <div className="glass-card bg-white/70 p-8 md:p-12 rounded-[2.5rem] border border-beige/50 shadow-md">
          {isSubmitted ? (
            <motion.div 
              className="text-center py-12 flex flex-col items-center gap-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-16 h-16 rounded-full bg-sage/10 text-sage flex items-center justify-center mb-2">
                <CheckCircle size={36} />
              </div>
              <Heading level={3}>Inquiry Sent Successfully</Heading>
              <Text variant="body" className="font-light max-w-sm">
                Thank you for connecting. Our concierge has logged your inquiry and will reach out via WhatsApp or email within the next 12 hours.
              </Text>
              <Button 
                variant="outline" 
                onClick={() => setIsSubmitted(false)}
                className="mt-6"
              >
                Submit Another Request
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <Heading level={3} serif={false} className="text-2xl font-semibold mb-2">Send an Inquiry</Heading>
              
              {/* Name */}
              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-semibold uppercase tracking-wider text-warm-black/60">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Dhruv Patel"
                  className="w-full px-5 py-3.5 bg-cream/30 border border-beige rounded-2xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 placeholder:text-warm-black/30"
                  required
                />
              </div>

              {/* Email & Phone grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-xs font-semibold uppercase tracking-wider text-warm-black/60">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. dhruv@gmail.com"
                    className="w-full px-5 py-3.5 bg-cream/30 border border-beige rounded-2xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 placeholder:text-warm-black/30"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-xs font-semibold uppercase tracking-wider text-warm-black/60">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-5 py-3.5 bg-cream/30 border border-beige rounded-2xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 placeholder:text-warm-black/30"
                    required
                  />
                </div>
              </div>

              {/* Circle Selector */}
              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-semibold uppercase tracking-wider text-warm-black/60">Select Circle / Inquiry Type</label>
                <select
                  name="circle"
                  value={formData.circle}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-cream/30 border border-beige rounded-2xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 text-warm-black"
                >
                  <option value="general">General Community Inquiry</option>
                  <option value="running">Awaken Running Club</option>
                  <option value="wellness">Mind & Body Wellness</option>
                  <option value="socials">Lifestyle & Socials</option>
                  <option value="workshops">Creative Workshops</option>
                  <option value="event-booking">Event Spot Booking</option>
                  <option value="partnership">Brand & Venue Partnership</option>
                </select>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-semibold uppercase tracking-wider text-warm-black/60">Message / Request Details</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="How can we help you awaken your lifestyle?"
                  className="w-full px-5 py-3.5 bg-cream/30 border border-beige rounded-2xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 placeholder:text-warm-black/30 resize-none"
                  required
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading}
                className="mt-2 w-full sm:w-fit"
                icon={loading ? <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <Send size={14} />}
              >
                {loading ? 'Sending Request...' : 'Send Inquiry Request'}
              </Button>

            </form>
          )}
        </div>
      </div>

    </div>
  );
}

export default function Contact() {
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
            <Mail size={12} />
            Concierge Desk
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Heading level={1} className="mb-6">
              Begin Your Journey
            </Heading>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Text variant="lead" className="font-light">
              Join active running mornings, sound therapy reset circles, or secure tickets for workshops and courtyard dinners in Surat. We make entry smooth.
            </Text>
          </motion.div>
        </Container>
      </section>

      {/* Main Form content */}
      <Section background="cream" padding="lg">
        <Suspense fallback={<div className="py-24 text-center">Loading registration details...</div>}>
          <ContactFormContent />
        </Suspense>
      </Section>
    </>
  );
}
