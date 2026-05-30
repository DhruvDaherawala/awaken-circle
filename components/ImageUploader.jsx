'use client';

import React, { useState, useRef } from 'react';
import { Upload, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function ImageUploader({ onUploadComplete, initialImageUrl = '', type = 'cover', slug = 'event' }) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(initialImageUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (!file) return;
    setError(null);
    setSuccess(false);

    // Validation: max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("File exceeds 5MB size limit.");
      return;
    }

    // Set preview locally
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Proceed to upload
    uploadToServer(file);
  };

  const uploadToServer = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('slug', slug);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Upload failed');
      }

      setSuccess(true);
      if (onUploadComplete) {
        onUploadComplete(data.data); // Passes { secure_url, public_id, ... } to parent form
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setPreviewUrl('');
    setSuccess(false);
    setError(null);
    if (onUploadComplete) {
      onUploadComplete({ secure_url: '', public_id: '' });
    }
  };

  return (
    <div className="w-full">
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={(e) => {
          handleDrag(e);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
          }
        }}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[180px] group ${
          dragActive 
            ? 'border-terracotta bg-terracotta/5' 
            : 'border-white/10 bg-[#161616] hover:border-white/20 hover:bg-[#1A1A1A]'
        }`}
      >
        <input 
          ref={inputRef}
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => e.target.files && processFile(e.target.files[0])}
        />

        {previewUrl ? (
          <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Cover Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-cream bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                Replace Cover Image
              </span>
              <button 
                type="button"
                onClick={handleClear}
                className="text-[10px] uppercase tracking-wider text-terracotta hover:underline mt-1 bg-black/40 px-2.5 py-1 rounded-md"
              >
                Remove Image
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-cream/40 group-hover:text-cream/70 transition-colors">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-cream/80">Drag & drop your file here</p>
              <p className="text-cream/40 text-[11px] mt-0.5">or click to browse local files (Max 5MB)</p>
            </div>
          </div>
        )}

        {/* Upload Spinner Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-zinc-950/80 rounded-2xl flex flex-col items-center justify-center gap-2 z-10 backdrop-blur-sm">
            <Loader2 className="w-6 h-6 text-terracotta animate-spin" />
            <p className="text-cream/80 text-xs font-medium uppercase tracking-wider">Uploading cover asset...</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-2 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-[11px]">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-2 flex items-center gap-2 p-2.5 rounded-xl border border-sage/20 bg-sage/5 text-sage text-[11px]">
          <Check className="w-3.5 h-3.5 shrink-0" />
          <span>Upload complete and optimized!</span>
        </div>
      )}
    </div>
  );
}
