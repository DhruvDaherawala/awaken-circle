import React from 'react';

// Common SVG Wrapper Props
const defaultProps = (size, className) => ({
  width: size || 24,
  height: size || 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: className || ""
});

export const Instagram = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export const MapPin = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

export const Mail = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

export const Phone = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

export const ArrowUpRight = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <line x1="7" y1="17" x2="17" y2="7"></line>
    <polyline points="7,7 17,7 17,17"></polyline>
  </svg>
);

export const Users = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

export const Calendar = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

export const Clock = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

export const ArrowRight = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export const Menu = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

export const X = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export const Sparkles = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"></path>
  </svg>
);

export const Activity = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

export const ShieldCheck = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <polyline points="9 11 11 13 15 9"></polyline>
  </svg>
);

export const Heart = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

export const Compass = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
  </svg>
);

export const Star = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

export const ChevronRight = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export const Check = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export const CalendarRange = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
    <path d="M17 14h-6"></path>
    <path d="M13 18H7"></path>
  </svg>
);

export const Filter = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

export const SlidersHorizontal = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <line x1="4" y1="21" x2="4" y2="14"></line>
    <line x1="4" y1="10" x2="4" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12" y2="3"></line>
    <line x1="20" y1="21" x2="20" y2="16"></line>
    <line x1="20" y1="12" x2="20" y2="3"></line>
    <line x1="2" y1="14" x2="6" y2="14"></line>
    <line x1="10" y1="8" x2="14" y2="8"></line>
    <line x1="18" y1="16" x2="22" y2="16"></line>
  </svg>
);

export const Info = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

export const HelpCircle = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

export const Smile = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
    <line x1="9" y1="9" x2="9.01" y2="9"></line>
    <line x1="15" y1="9" x2="15.01" y2="9"></line>
  </svg>
);

export const Zap = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

export const CheckCircle = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export const Send = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

export const Camera = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

export const ImageIcon = ({ size, className, ...props }) => (
  <svg {...defaultProps(size, className)} {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);
