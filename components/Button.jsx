'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

/**
 * Premium reusable Button component with Framer Motion animations.
 */
export default function Button({
  children,
  onClick,
  href,
  variant = 'primary', // 'primary' (terracotta), 'secondary' (warm black), 'sage' (sage green), 'outline', 'text'
  size = 'md', // 'sm', 'md', 'lg'
  className = "",
  disabled = false,
  type = 'button',
  icon,
  iconPosition = 'right',
  ...props
}) {
  const baseClasses = "inline-flex items-center justify-center font-sans font-medium tracking-wide rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  
  const variantClasses = {
    primary: "bg-terracotta text-cream shadow-md shadow-terracotta/10 hover:shadow-lg hover:shadow-terracotta/25 hover:bg-terracotta/95 focus:ring-terracotta",
    secondary: "bg-warm-black text-cream hover:bg-warm-black/90 shadow-md shadow-warm-black/5 hover:shadow-lg hover:shadow-warm-black/15 focus:ring-warm-black",
    sage: "bg-sage text-warm-black hover:bg-sage/90 shadow-sm shadow-sage/5 hover:shadow-md focus:ring-sage",
    outline: "border border-warm-black/20 text-warm-black bg-transparent hover:bg-warm-black/5 focus:ring-warm-black",
    text: "text-warm-black bg-transparent border-b border-transparent hover:border-warm-black/40 hover:opacity-85 py-0 px-0 rounded-none inline-flex"
  };

  const sizeClasses = {
    sm: "text-xs px-5 py-2.5 gap-1.5",
    md: "text-sm px-7 py-3.5 gap-2",
    lg: "text-base px-9 py-4 gap-2.5"
  };

  const renderIcon = () => {
    if (!icon) return null;
    return (
      <span className="transition-transform duration-300 ease-out group-hover:translate-x-1">
        {icon}
      </span>
    );
  };

  const buttonContent = (
    <span className="flex items-center gap-2">
      {icon && iconPosition === 'left' && renderIcon()}
      {children}
      {icon && iconPosition === 'right' && renderIcon()}
    </span>
  );

  const hoverAnimation = disabled ? {} : {
    scale: variant === 'text' ? 1.01 : 1.025,
    y: variant === 'text' ? 0 : -2
  };

  const tapAnimation = disabled ? {} : {
    scale: 0.97,
    y: 0
  };

  if (href) {
    return (
      <motion.div
        className={`inline-block ${className}`}
        whileHover={hoverAnimation}
        whileTap={tapAnimation}
      >
        <Link 
          href={href} 
          className={`${baseClasses} ${variantClasses[variant]} ${variantClasses[variant] !== variantClasses.text ? sizeClasses[size] : ""} w-full group`}
          {...props}
        >
          {buttonContent}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${variantClasses[variant] !== variantClasses.text ? sizeClasses[size] : ""} group ${className}`}
      whileHover={hoverAnimation}
      whileTap={tapAnimation}
      {...props}
    >
      {buttonContent}
    </motion.button>
  );
}
