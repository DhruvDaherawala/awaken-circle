'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Container from './Container';

/**
 * Premium Section wrapper with built-in entrance animations and theme supports.
 */
export default function Section({
  children,
  background = 'cream', // 'cream', 'beige', 'dark' (warm black), 'sage'
  padding = 'md', // 'none', 'sm', 'md', 'lg', 'xl'
  className = "",
  containerSize = "default",
  noContainer = false,
  animate = true,
  borderTop = false,
  borderBottom = false,
  id,
  ...props
}) {
  const bgClasses = {
    cream: "bg-cream text-warm-black",
    beige: "bg-beige text-warm-black",
    dark: "bg-warm-black text-cream",
    sage: "bg-sage/10 text-warm-black"
  };

  const paddingClasses = {
    none: "py-0",
    sm: "py-12 md:py-16",
    md: "py-16 md:py-24",
    lg: "py-24 md:py-36",
    xl: "py-32 md:py-48"
  };

  const borderClasses = `
    ${borderTop ? "border-t border-warm-black/5" : ""} 
    ${borderBottom ? "border-b border-warm-black/5" : ""}
  `;

  // Custom motion variants for premium, slow fade-up
  const sectionVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1], // Custom ease-out expo
        staggerChildren: 0.15
      }
    }
  };

  const WrapperComponent = animate ? motion.section : 'section';
  const motionProps = animate ? {
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true, margin: "-15% 0px" },
    variants: sectionVariants
  } : {};

  return (
    <WrapperComponent
      id={id}
      className={`relative w-full ${bgClasses[background] || bgClasses.cream} ${paddingClasses[padding] || paddingClasses.md} ${borderClasses} ${className}`}
      {...motionProps}
      {...props}
    >
      {noContainer ? (
        children
      ) : (
        <Container size={containerSize}>
          {children}
        </Container>
      )}
    </WrapperComponent>
  );
}
