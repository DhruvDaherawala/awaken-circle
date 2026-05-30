import React from 'react';

/**
 * Premium responsive Container component to wrap page elements.
 */
export default function Container({ 
  children, 
  className = "", 
  size = "default", // "default" (7xl), "small" (5xl), "large" (full/wide)
  as: Component = "div",
  ...props 
}) {
  const sizeClasses = {
    small: "max-w-5xl",
    default: "max-w-7xl",
    large: "max-w-[1400px]",
    full: "max-w-full"
  };

  return (
    <Component
      className={`mx-auto px-6 md:px-12 lg:px-16 w-full ${sizeClasses[size] || sizeClasses.default} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
