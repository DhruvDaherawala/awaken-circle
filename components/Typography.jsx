import React from 'react';

/**
 * Premium Heading component for the typographic hierarchy.
 */
export function Heading({
  children,
  level = 2, // 1, 2, 3, 4, 5, 6
  serif = true, // Playfair serif (lifestyle) vs Jakarta sans (modern)
  className = "",
  as,
  ...props
}) {
  const Tag = as || `h${level}`;
  
  // Editorial font sizing & spacing
  const baseClasses = serif 
    ? "font-serif text-warm-black tracking-wide font-normal"
    : "font-sans text-warm-black tracking-tight font-semibold";
    
  const levelClasses = {
    1: serif 
      ? "text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[1.1]" 
      : "text-4xl md:text-5xl lg:text-6xl leading-tight",
    2: serif 
      ? "text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-[1.15]" 
      : "text-2xl md:text-3xl lg:text-4xl leading-tight",
    3: serif 
      ? "text-2xl md:text-3xl lg:text-4xl leading-[1.2]" 
      : "text-xl md:text-2xl lg:text-3xl leading-snug",
    4: serif 
      ? "text-xl md:text-2xl leading-normal" 
      : "text-lg md:text-xl font-medium leading-snug",
    5: "text-lg font-sans font-medium uppercase tracking-widest text-terracotta",
    6: "text-sm font-sans font-semibold uppercase tracking-widest text-sage"
  };

  return (
    <Tag 
      className={`${baseClasses} ${levelClasses[level] || levelClasses[2]} ${className}`} 
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * Premium Body Text component.
 */
export function Text({
  children,
  variant = "body", // "body", "lead", "muted", "small"
  serif = false,
  className = "",
  as: Tag = "p",
  ...props
}) {
  const fontClass = serif ? "font-serif" : "font-sans";
  
  const variantClasses = {
    lead: "text-lg md:text-xl text-warm-black/80 font-light leading-relaxed",
    body: "text-base md:text-lg text-warm-black/75 font-normal leading-relaxed",
    muted: "text-sm md:text-base text-warm-black/60 font-light leading-normal",
    small: "text-xs md:text-sm text-warm-black/50 font-normal leading-normal uppercase tracking-wider"
  };

  return (
    <Tag 
      className={`${fontClass} ${variantClasses[variant] || variantClasses.body} ${className}`} 
      {...props}
    >
      {children}
    </Tag>
  );
}
