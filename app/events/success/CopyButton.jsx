'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
        copied 
          ? "bg-sage/10 border-sage/30 text-sage" 
          : "bg-white border-beige hover:border-warm-black/40 text-warm-black/60 hover:text-warm-black active:scale-95"
      }`}
    >
      {copied ? (
        <>
          <Check size={11} className="stroke-[2.5px]" /> Copied!
        </>
      ) : (
        <>
          <Copy size={11} /> Copy ID
        </>
      )}
    </button>
  );
}
