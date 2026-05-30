'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, RefreshCw, X } from 'lucide-react';

export default function EventFilters({ categories, communities }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state initialized from searchParams
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [activeCommunity, setActiveCommunity] = useState(searchParams.get('community') || 'all');

  // Sync state with URL modifications (e.g. browser back button)
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setActiveCategory(searchParams.get('category') || 'all');
    setActiveCommunity(searchParams.get('community') || 'all');
  }, [searchParams]);

  // Debounced URL updates
  const applyFilters = useCallback((searchVal, categoryVal, communityVal) => {
    const params = new URLSearchParams();
    
    if (searchVal.trim() !== '') {
      params.set('search', searchVal.trim());
    }
    
    if (categoryVal !== 'all') {
      params.set('category', categoryVal);
    }
    
    if (communityVal !== 'all') {
      params.set('community', communityVal);
    }
    
    // Always reset to page 1 on filter changes
    params.set('page', '1');

    router.push(`/events?${params.toString()}`, { scroll: false });
  }, [router]);

  // Debounce search typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (searchParams.get('search') || '')) {
        applyFilters(search, activeCategory, activeCommunity);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search, activeCategory, activeCommunity, searchParams, applyFilters]);

  const handleCategoryChange = (slug) => {
    setActiveCategory(slug);
    applyFilters(search, slug, activeCommunity);
  };

  const handleCommunityChange = (e) => {
    const slug = e.target.value;
    setActiveCommunity(slug);
    applyFilters(search, activeCategory, slug);
  };

  const handleClearFilters = () => {
    setSearch('');
    setActiveCategory('all');
    setActiveCommunity('all');
    router.push('/events');
  };

  const hasActiveFilters = search.trim() !== '' || activeCategory !== 'all' || activeCommunity !== 'all';

  return (
    <div className="flex flex-col gap-6">
      
      {/* Dynamic Search & Dropdown selectors */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Text Search Input */}
        <div className="md:col-span-8 relative">
          <Search size={16} className="absolute left-4.5 top-1/2 -translate-y-1/2 text-warm-black/35" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, location, description..."
            className="w-full pl-11 pr-5 py-3.5 bg-white border border-beige/65 rounded-full font-sans text-xs focus:outline-none focus:ring-1 focus:ring-terracotta/40 placeholder:text-warm-black/30 transition-all text-warm-black"
          />
          {search.trim() !== '' && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-black/30 hover:text-warm-black"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Community Selector */}
        <div className="md:col-span-4 relative">
          <select
            value={activeCommunity}
            onChange={handleCommunityChange}
            className="w-full px-5 py-3.5 bg-white border border-beige/65 rounded-full font-sans text-xs focus:outline-none focus:ring-1 focus:ring-terracotta/40 text-warm-black transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Communities</option>
            {communities.map((comm) => (
              <option key={comm.id} value={comm.slug}>
                {comm.name}
              </option>
            ))}
          </select>
          {/* Custom chevron indicator */}
          <div className="absolute right-4.5 top-1/2 -translate-y-1/2 pointer-events-none text-warm-black/40 text-[9px]">
            ▼
          </div>
        </div>

      </div>

      {/* Category Selection Tabs & Reset option */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-beige/30 pt-6">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 sm:pb-0 scrollbar-none -mx-6 px-6 sm:mx-0 sm:px-0">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4.5 py-2.5 rounded-full font-sans text-[10px] uppercase tracking-wider font-bold border transition-all duration-300 whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-warm-black text-cream border-warm-black shadow-sm'
                : 'bg-white text-warm-black/75 border-beige hover:border-warm-black/35'
            }`}
          >
            All Experiences
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-4.5 py-2.5 rounded-full font-sans text-[10px] uppercase tracking-wider font-bold border transition-all duration-300 whitespace-nowrap ${
                activeCategory === cat.slug
                  ? 'bg-warm-black text-cream border-warm-black shadow-sm'
                  : 'bg-white text-warm-black/75 border-beige hover:border-warm-black/35'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Clear Filters CTA */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-terracotta hover:underline shrink-0 self-start sm:self-auto"
          >
            <RefreshCw size={11} /> Reset Filter Panels
          </button>
        )}

      </div>

    </div>
  );
}
