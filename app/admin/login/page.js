'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, Loader2, Sparkles, AlertCircle } from 'lucide-react';

// Zod validation schema for admin credentials
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

// A lightweight, zero-dependency custom Zod resolver for React Hook Form
const zodResolver = (schema) => async (data) => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { values: result.data, errors: {} };
  }

  const errors = {};
  result.error.errors.forEach((err) => {
    const fieldName = err.path[0];
    errors[fieldName] = {
      type: 'validation',
      message: err.message,
    };
  });

  return { values: {}, errors };
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setGlobalError('');

    try {
      // Execute Auth.js credentials sign-in
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false, // Prevent NextAuth from page-crashing redirect
      });

      if (result?.error) {
        setGlobalError('Invalid email or password. Please try again.');
        setIsLoading(false);
      } else {
        // Successful login, route to dashboard
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch (err) {
      console.error('Authentication Error:', err);
      setGlobalError('An unexpected server error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0D0D0D] text-cream overflow-hidden px-4 select-none">
      
      {/* 1. Curated Glow Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-sage/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-terracotta/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Subtle Grid Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* 2. Login Container Card */}
      <div className="relative w-full max-w-[460px] z-10">
        
        {/* Editorial Heading */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="flex items-center gap-2 px-3 py-1 bg-cream/5 border border-cream/10 rounded-full mb-3 shadow-inner">
            <Sparkles size={11} className="text-terracotta animate-pulse" />
            <span className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/70">
              Awaken Circle Platform
            </span>
          </div>
          <h1 className="font-serif text-4xl font-light text-cream tracking-wide">
            Admin Portal
          </h1>
          <p className="font-sans text-xs text-cream/40 font-light mt-2 tracking-wide">
            Access secure dashboard settings and manage community events
          </p>
        </div>

        {/* The Card Wrapper */}
        <div className="bg-[#141414]/90 backdrop-blur-xl border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)]">
          
          {/* Global Alert Notification */}
          {globalError && (
            <div className="flex items-center gap-2.5 p-4 bg-terracotta/10 border border-terracotta/20 text-terracotta rounded-2xl mb-6 animate-shake">
              <AlertCircle size={16} className="shrink-0" />
              <span className="font-sans text-xs font-light tracking-wide">
                {globalError}
              </span>
            </div>
          )}

          {/* Login Credentials Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label 
                htmlFor="email" 
                className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1"
              >
                Secure Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-cream/30">
                  <Mail size={16} />
                </div>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@awakencircle.com"
                  className={`w-full pl-11 pr-4 py-3.5 bg-white/5 border rounded-2xl text-cream font-sans text-sm focus:outline-none focus:ring-1 transition-all duration-300 placeholder:text-cream/20 ${
                    errors.email 
                      ? 'border-terracotta/40 focus:ring-terracotta/40 focus:border-terracotta/40' 
                      : 'border-white/5 focus:ring-sage/40 focus:border-sage/40'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <span className="font-sans text-[10px] text-terracotta/90 ml-1 font-light">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between ml-1">
                <label 
                  htmlFor="password" 
                  className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50"
                >
                  Administrator Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-cream/30">
                  <Lock size={16} />
                </div>
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-12 py-3.5 bg-white/5 border rounded-2xl text-cream font-sans text-sm focus:outline-none focus:ring-1 transition-all duration-300 placeholder:text-cream/20 ${
                    errors.password 
                      ? 'border-terracotta/40 focus:ring-terracotta/40 focus:border-terracotta/40' 
                      : 'border-white/5 focus:ring-sage/40 focus:border-sage/40'
                  }`}
                  disabled={isLoading}
                />
                
                {/* Visibility Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-cream/30 hover:text-cream/60 transition-colors focus:outline-none"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span className="font-sans text-[10px] text-terracotta/90 ml-1 font-light">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-4 bg-cream text-warm-black hover:bg-cream/90 rounded-2xl font-sans text-xs font-semibold uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-lg hover:shadow-cream/5 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-cream disabled:active:scale-100 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin text-warm-black" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Access Portal</span>
              )}
            </button>

          </form>
        </div>
        
        {/* Footer Link back to website */}
        <div className="text-center mt-6">
          <a 
            href="/"
            className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/30 hover:text-cream/60 transition-colors border-b border-white/5 hover:border-cream/20 pb-0.5"
          >
            ← Return to Main Page
          </a>
        </div>

      </div>
    </div>
  );
}
