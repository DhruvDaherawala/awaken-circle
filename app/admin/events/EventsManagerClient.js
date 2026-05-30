'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Calendar, MapPin, Users, Edit, Trash2, Eye, 
  EyeOff, Check, X, ChevronLeft, ChevronRight, Filter, Sparkles, 
  DollarSign, AlertCircle, Loader2, BookOpen, Layers, ShieldAlert,
  ArrowUpRight, ExternalLink, Star
} from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';

export default function EventsManagerClient({ session }) {
  // --- STATE MANAGEMENT ---
  const [events, setEvents] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [communityFilter, setCommunityFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal / Panel State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [activeEvent, setActiveEvent] = useState(null); // for edit/view
  const [eventToDelete, setEventToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    communityId: '',
    categoryId: '',
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    eventDate: '',
    eventTime: '',
    endTime: '',
    location: '',
    googleMapsLink: '',
    price: 0,
    coverImage: '',
    galleryImages: [],
    maxParticipants: '',
    registrationDeadline: '',
    status: 'DRAFT',
    featured: false,
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // --- DATA INITIALIZATION ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Events
      const eventsRes = await fetch('/api/admin/events');
      const eventsData = await eventsRes.json();
      if (!eventsRes.ok || !eventsData.success) throw new Error(eventsData.message || 'Failed to fetch events.');
      setEvents(eventsData.data);

      // 2. Fetch Communities
      const commsRes = await fetch('/api/communities');
      const commsData = await commsRes.json();
      if (commsRes.ok && commsData.success) setCommunities(commsData.data);

      // 3. Fetch Categories
      const catsRes = await fetch('/api/categories');
      const catsData = await catsRes.json();
      if (catsRes.ok && catsData.success) setCategories(catsData.data);

    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while loading dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-dismiss notifications after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- FORM HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: finalValue };
      // Auto-generate slug from title during event creation
      if (name === 'title' && !activeEvent) {
        updated.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // remove special characters
          .replace(/\s+/g, '-')         // replace spaces with hyphens
          .replace(/-+/g, '-')          // replace multiple hyphens
          .substring(0, 180);
      }
      return updated;
    });

    // Clear specific field error
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleOpenCreate = () => {
    setActiveEvent(null);
    setFormErrors({});
    setFormData({
      communityId: communities[0]?.id || '',
      categoryId: categories[0]?.id || '',
      title: '',
      slug: '',
      shortDescription: '',
      description: '',
      eventDate: '',
      eventTime: '',
      endTime: '',
      location: '',
      googleMapsLink: '',
      price: 0,
      coverImage: '',
      galleryImages: [],
      maxParticipants: '',
      registrationDeadline: '',
      status: 'DRAFT',
      featured: false,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (event) => {
    setActiveEvent(event);
    setFormErrors({});
    
    // Format date objects back to input strings (YYYY-MM-DD)
    const formattedDate = event.eventDate ? new Date(event.eventDate).toISOString().substring(0, 10) : '';
    const formattedDeadline = event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().substring(0, 10) : '';
    
    // Parse gallery images JSON
    let parsedGallery = [];
    if (event.galleryImages) {
      try {
        parsedGallery = typeof event.galleryImages === 'string' 
          ? JSON.parse(event.galleryImages) 
          : event.galleryImages;
      } catch (e) {
        parsedGallery = [];
      }
    }

    setFormData({
      communityId: event.communityId,
      categoryId: event.categoryId || '',
      title: event.title,
      slug: event.slug,
      shortDescription: event.shortDescription || '',
      description: event.description,
      eventDate: formattedDate,
      eventTime: event.eventTime,
      endTime: event.endTime || '',
      location: event.location,
      googleMapsLink: event.googleMapsLink || '',
      price: Number(event.price),
      coverImage: event.coverImage || '',
      galleryImages: parsedGallery,
      maxParticipants: event.maxParticipants || '',
      registrationDeadline: formattedDeadline,
      status: event.status,
      featured: event.featured,
    });
    setIsFormOpen(true);
  };

  const handleOpenView = (event) => {
    setActiveEvent(event);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (event) => {
    setEventToDelete(event);
    setIsDeleteOpen(true);
  };

  const handlePublishToggle = async (event, publish) => {
    try {
      const nextStatus = publish ? 'PUBLISHED' : 'DRAFT';
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) throw new Error(resData.message || 'Status update failed.');
      
      // Update local state list
      setEvents(prev => prev.map(e => e.id === event.id ? { ...e, status: nextStatus } : e));
      setNotification({
        type: 'success',
        message: `Successfully ${publish ? 'published' : 'unpublished'} event "${event.title}".`
      });
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleFeaturedToggle = async (event, makeFeatured) => {
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: makeFeatured })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) throw new Error(resData.message || 'Featured toggle failed.');
      
      setEvents(prev => prev.map(e => e.id === event.id ? { ...e, featured: makeFeatured } : e));
      setNotification({
        type: 'success',
        message: `Successfully ${makeFeatured ? 'promoted' : 'demoted'} "${event.title}" ${makeFeatured ? 'to' : 'from'} featured selections.`
      });
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    const endpoint = activeEvent ? `/api/admin/events/${activeEvent.id}` : '/api/admin/events';
    const method = activeEvent ? 'PUT' : 'POST';

    // Format optional registration deadline if empty string
    const submitData = {
      ...formData,
      registrationDeadline: formData.registrationDeadline || null,
      categoryId: formData.categoryId ? Number(formData.categoryId) : null,
      maxParticipants: formData.maxParticipants ? Number(formData.maxParticipants) : null
    };

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        if (response.status === 400 && resData.errors) {
          // Zod field errors
          setFormErrors(resData.errors);
          throw new Error("Validation check failed. Please review highlighted inputs.");
        }
        throw new Error(resData.message || 'Form submission failed.');
      }

      setNotification({
        type: 'success',
        message: `Event "${submitData.title}" successfully ${activeEvent ? 'updated' : 'created'}!`
      });
      setIsFormOpen(false);
      fetchData(); // reload lists

    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/events/${eventToDelete.id}`, {
        method: 'DELETE',
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) throw new Error(resData.message || 'Failed to delete event.');

      setEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
      setIsDeleteOpen(false);
      setNotification({
        type: 'success',
        message: `Event "${eventToDelete.title}" and registrations deleted completely.`
      });
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
      setEventToDelete(null);
    }
  };

  // --- FILTERS & PAGINATION ---
  const filteredEvents = events.filter(event => {
    // 1. Text Search Filter
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));

    // 2. Status Filter
    const matchesStatus = statusFilter === 'ALL' || event.status === statusFilter;

    // 3. Community Filter
    const matchesCommunity = communityFilter === 'ALL' || event.communityId === communityFilter;

    return matchesSearch && matchesStatus && matchesCommunity;
  });

  // Calculate Paginated Chunk
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);

  // Auto reset page if filters overflow page bounds
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, communityFilter]);

  // --- METRICS CALCULATION ---
  const totalBookings = events.reduce((sum, e) => sum + (e._count?.registrations || 0), 0);
  const activeCount = events.filter(e => e.status === 'PUBLISHED').length;
  const featuredCount = events.filter(e => e.featured).length;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-cream p-4 md:p-8 select-none relative overflow-x-hidden pt-24">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-sage/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-terracotta/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Glass Wrap */}
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Header Action Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-terracotta font-medium text-xs uppercase tracking-widest">
              <Sparkles size={13} />
              <span>Lifestyle Community Curation</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-light tracking-wide">
              Event Management
            </h1>
            <p className="text-xs text-cream/40 font-light">
              Add, update, publish, or analyze local circle activities and active bookings
            </p>
          </div>
          
          <Link
            href="/admin/events/create"
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-cream text-warm-black hover:bg-cream/90 rounded-2xl font-sans text-xs font-semibold uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-cream/5 active:scale-[0.98] shrink-0"
          >
            <Plus size={15} />
            <span>Create New Event</span>
          </Link>
        </div>

        {/* Dynamic System Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-[#141414]/90 border border-white/5 p-5 rounded-[1.8rem] flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-cream/40 font-medium">Total Listings</p>
              <h3 className="text-2xl font-light font-serif mt-1">{events.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-cream/60">
              <Layers size={16} />
            </div>
          </div>

          <div className="bg-[#141414]/90 border border-white/5 p-5 rounded-[1.8rem] flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-cream/40 font-medium">Active Bookings</p>
              <h3 className="text-2xl font-light font-serif mt-1 text-sage">{totalBookings}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sage/10 border border-sage/20 flex items-center justify-center text-sage">
              <Users size={16} />
            </div>
          </div>

          <div className="bg-[#141414]/90 border border-white/5 p-5 rounded-[1.8rem] flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-cream/40 font-medium">Published Events</p>
              <h3 className="text-2xl font-light font-serif mt-1 text-emerald-400">{activeCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Check size={16} />
            </div>
          </div>

          <div className="bg-[#141414]/90 border border-white/5 p-5 rounded-[1.8rem] flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-cream/40 font-medium">Featured Flagged</p>
              <h3 className="text-2xl font-light font-serif mt-1 text-terracotta">{featuredCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-terracotta/10 border border-terracotta/20 flex items-center justify-center text-terracotta">
              <Sparkles size={16} />
            </div>
          </div>

        </div>

        {/* Live Filter Console */}
        <div className="bg-[#141414]/80 backdrop-blur-md border border-white/5 p-4 rounded-2xl flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full lg:w-96">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-cream/35 pointer-events-none">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Search title, description, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#181818]/60 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-cream focus:outline-none focus:border-cream/20 transition-all duration-300 placeholder:text-cream/25"
            />
          </div>

          {/* Selector Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            
            {/* Status Filter */}
            <div className="flex items-center gap-2 bg-[#181818]/40 border border-white/5 px-3 py-1.5 rounded-xl flex-1 md:flex-initial">
              <Filter size={12} className="text-cream/40 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-cream/80 focus:outline-none cursor-pointer pr-4 font-sans font-light select-dropdown-unstyled"
              >
                <option value="ALL" className="bg-[#141414] text-cream">All Statuses</option>
                <option value="DRAFT" className="bg-[#141414] text-cream">Draft</option>
                <option value="PUBLISHED" className="bg-[#141414] text-cream">Published</option>
                <option value="CANCELLED" className="bg-[#141414] text-cream">Cancelled</option>
                <option value="COMPLETED" className="bg-[#141414] text-cream">Completed</option>
              </select>
            </div>

            {/* Community Circle Filter */}
            <div className="flex items-center gap-2 bg-[#181818]/40 border border-white/5 px-3 py-1.5 rounded-xl flex-1 md:flex-initial">
              <BookOpen size={12} className="text-cream/40 shrink-0" />
              <select
                value={communityFilter}
                onChange={(e) => setCommunityFilter(e.target.value)}
                className="bg-transparent text-xs text-cream/80 focus:outline-none cursor-pointer pr-4 font-sans font-light select-dropdown-unstyled max-w-[180px]"
              >
                <option value="ALL" className="bg-[#141414] text-cream">All Circles</option>
                {communities.map(comm => (
                  <option key={comm.id} value={comm.id} className="bg-[#141414] text-cream">
                    {comm.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Results Tag */}
            <span className="text-[10px] font-semibold uppercase tracking-wider text-cream/40 bg-white/5 border border-white/5 px-3 py-2 rounded-xl text-center flex-1 md:flex-initial">
              Results: {filteredEvents.length}
            </span>

          </div>
        </div>

        {/* Global Loading Spinner / List Wrapper */}
        {loading ? (
          <div className="bg-[#141414]/90 border border-white/5 rounded-[2.5rem] p-20 flex flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="w-8 h-8 text-terracotta animate-spin" />
            <p className="text-sm font-medium tracking-wide text-cream/70">Syncing database events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-[#141414]/80 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-16 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-cream/30">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-light text-cream/90">No event records found</h3>
              <p className="text-xs text-cream/35 mt-1 font-light max-w-sm">
                No database records match your active query filters. Add a new event listing or modify search queries.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* SaaS Responsive Event Table */}
            <div className="bg-[#141414]/90 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01] text-[10px] font-semibold uppercase tracking-widest text-cream/40">
                    <th className="py-4.5 px-6">Cover</th>
                    <th className="py-4.5 px-6">Title</th>
                    <th className="py-4.5 px-6">Community</th>
                    <th className="py-4.5 px-6">Schedule</th>
                    <th className="py-4.5 px-6 text-center">Status</th>
                    <th className="py-4.5 px-6 text-center">Bookings</th>
                    <th className="py-4.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans font-light">
                  {currentEvents.map(event => {
                    const eventDateObj = new Date(event.eventDate);
                    const formattedDate = eventDateObj.toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    });

                    // Badge Color Logic for Status
                    const statusColorMap = {
                      DRAFT: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                      PUBLISHED: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                      CANCELLED: 'bg-red-500/10 border-red-500/20 text-red-400',
                      COMPLETED: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
                    };

                    return (
                      <tr 
                        key={event.id}
                        className="hover:bg-white/[0.01] transition-colors duration-200 text-xs"
                      >
                        {/* Thumbnail Cover */}
                        <td className="py-4.5 px-6">
                          <div className="w-11 h-11 rounded-xl bg-[#222] border border-white/5 overflow-hidden shrink-0">
                            {event.coverImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-cream/20">
                                None
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Title and Short details */}
                        <td className="py-4.5 px-6 max-w-[280px]">
                          <div className="truncate font-medium text-cream text-[13px]">{event.title}</div>
                          <div className="text-[10px] text-cream/30 mt-0.5 truncate font-sans tracking-wide flex items-center gap-1.5">
                            <span className="truncate">{event.slug}</span>
                            {event.featured && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-terracotta/10 border border-terracotta/20 text-terracotta text-[8px] uppercase tracking-wider font-semibold shrink-0">
                                ★ Featured
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Community Badge */}
                        <td className="py-4.5 px-6 font-medium">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-1.5 h-1.5 rounded-full" 
                              style={{ backgroundColor: event.community?.themeColor || '#A8B5A2' }}
                            />
                            <span className="text-cream/80">{event.community?.name || 'Circle'}</span>
                          </div>
                        </td>

                        {/* Formatted Date */}
                        <td className="py-4.5 px-6">
                          <div className="text-cream/80">{formattedDate}</div>
                          <div className="text-[10px] text-cream/40 font-mono mt-0.5">{event.eventTime}</div>
                        </td>

                        {/* Status badge */}
                        <td className="py-4.5 px-6 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-[10px] font-semibold uppercase tracking-wider ${statusColorMap[event.status] || 'bg-white/5 border-white/10'}`}>
                            {event.status}
                          </span>
                        </td>

                        {/* Bookings Count */}
                        <td className="py-4.5 px-6 text-center font-mono font-medium">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white/5 border border-white/5 rounded-xl">
                            <Users size={11} className="text-sage" />
                            <span>{event._count?.registrations || 0}</span>
                            {event.maxParticipants && (
                              <span className="text-[10px] text-cream/35">/ {event.maxParticipants}</span>
                            )}
                          </span>
                        </td>

                        {/* Context Actions */}
                        <td className="py-4.5 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* View Card button */}
                            <button
                              onClick={() => handleOpenView(event)}
                              className="p-2 hover:bg-white/5 border border-transparent hover:border-white/5 text-cream/50 hover:text-cream rounded-xl transition-all"
                              title="Preview Details"
                            >
                              <Eye size={13.5} />
                            </button>

                            {/* View Roster button */}
                            <Link
                              href={`/admin/events/${event.id}/registrations`}
                              className="p-2 hover:bg-sage/10 border border-transparent hover:border-sage/10 text-cream/50 hover:text-sage rounded-xl transition-all"
                              title="View Roster"
                            >
                              <Users size={13.5} />
                            </Link>

                            {/* Featured toggle */}
                            {event.featured ? (
                              <button
                                onClick={() => handleFeaturedToggle(event, false)}
                                className="p-2 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/10 text-amber-500 hover:text-amber-400 rounded-xl transition-all"
                                title="Remove from Featured"
                              >
                                <Star size={13.5} className="fill-amber-500 text-amber-500" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleFeaturedToggle(event, true)}
                                className="p-2 hover:bg-white/5 border border-transparent hover:border-white/5 text-cream/35 hover:text-amber-500 rounded-xl transition-all"
                                title="Promote to Featured"
                              >
                                <Star size={13.5} />
                              </button>
                            )}

                            {/* Publish / Unpublish toggler */}
                            {event.status === 'PUBLISHED' ? (
                              <button
                                onClick={() => handlePublishToggle(event, false)}
                                className="p-2 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/10 text-cream/50 hover:text-amber-400 rounded-xl transition-all"
                                title="Draft Listing"
                              >
                                <EyeOff size={13.5} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePublishToggle(event, true)}
                                className="p-2 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/10 text-cream/50 hover:text-emerald-400 rounded-xl transition-all"
                                title="Publish Listing"
                              >
                                <Check size={13.5} />
                              </button>
                            )}

                            {/* Edit form button */}
                            <Link
                              href={`/admin/events/${event.id}/edit`}
                              className="p-2 hover:bg-white/5 border border-transparent hover:border-white/5 text-cream/50 hover:text-cream rounded-xl transition-all"
                              title="Edit Event"
                            >
                              <Edit size={13.5} />
                            </Link>

                            {/* Delete button */}
                            <button
                              onClick={() => handleOpenDelete(event)}
                              className="p-2 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 text-cream/40 hover:text-red-400 rounded-xl transition-all"
                              title="Delete Listing"
                            >
                              <Trash2 size={13.5} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Vertical Cards stack */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {currentEvents.map(event => {
                const eventDateObj = new Date(event.eventDate);
                const formattedDate = eventDateObj.toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric'
                });

                const statusColorMap = {
                  DRAFT: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                  PUBLISHED: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                  CANCELLED: 'bg-red-500/10 border-red-500/20 text-red-400',
                  COMPLETED: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
                };

                return (
                  <div 
                    key={event.id}
                    className="bg-[#141414]/90 border border-white/5 rounded-3xl p-5 space-y-4"
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#222] border border-white/5 overflow-hidden shrink-0">
                        {event.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-cream/20">
                            No Cover
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="w-1.5 h-1.5 rounded-full shrink-0" 
                            style={{ backgroundColor: event.community?.themeColor || '#A8B5A2' }}
                          />
                          <span className="text-[10px] font-medium text-cream/60 truncate">{event.community?.name || 'Circle'}</span>
                        </div>
                        <h4 className="font-serif text-sm font-light text-cream truncate">{event.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-1.5 py-0.5 rounded border text-[8px] font-semibold tracking-widest uppercase ${statusColorMap[event.status]}`}>
                            {event.status}
                          </span>
                          {event.featured && (
                            <span className="text-[8px] text-terracotta uppercase tracking-wider font-semibold">★ Featured</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-3 text-[11px] font-light">
                      <div className="space-y-0.5">
                        <span className="text-cream/35 block uppercase tracking-wider text-[8px]">Schedule</span>
                        <span className="text-cream/80">{formattedDate} ({event.eventTime})</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-cream/35 block uppercase tracking-wider text-[8px]">Bookings count</span>
                        <span className="text-cream/80 font-mono font-medium flex items-center gap-1">
                          <Users size={11} className="text-sage" />
                          <span>{event._count?.registrations || 0}</span>
                          {event.maxParticipants && <span className="text-cream/35 text-[9px]">/ {event.maxParticipants}</span>}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        {event.status === 'PUBLISHED' ? (
                          <button
                            onClick={() => handlePublishToggle(event, false)}
                            className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-[10px] uppercase tracking-wider font-medium hover:bg-amber-500/20 transition-all"
                          >
                            Unpublish
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePublishToggle(event, true)}
                            className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] uppercase tracking-wider font-medium hover:bg-emerald-500/20 transition-all"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenDelete(event)}
                          className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenView(event)}
                          className="px-3 py-1.5 bg-white/5 border border-white/5 text-cream/70 hover:text-cream rounded-xl text-[10px] uppercase tracking-wider font-medium transition-all"
                        >
                          Details
                        </button>
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className="px-3 py-1.5 bg-cream text-warm-black rounded-xl text-[10px] uppercase tracking-wider font-bold hover:bg-cream/90 transition-all text-center"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paging Control Bar */}
            <div className="bg-[#141414]/90 border border-white/5 p-4 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-cream/40 font-light hidden sm:inline">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEvents.length)} of {filteredEvents.length} events
              </span>
              
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-white/5 border border-white/5 hover:border-white/10 text-cream/70 hover:text-cream disabled:opacity-30 disabled:pointer-events-none rounded-xl transition-all flex items-center gap-1 shrink-0"
                >
                  <ChevronLeft size={13} />
                  <span>Previous</span>
                </button>
                
                <span className="font-mono text-cream/70 shrink-0 font-medium">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-white/5 border border-white/5 hover:border-white/10 text-cream/70 hover:text-cream disabled:opacity-30 disabled:pointer-events-none rounded-xl transition-all flex items-center gap-1 shrink-0"
                >
                  <span>Next</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* --- FORM SLIDE-OVER OR MODAL (CREATE / EDIT) --- */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm p-4 overflow-hidden animate-fade-in">
          {/* Main Slide-panel */}
          <div className="bg-[#121212] border-l border-white/5 w-full max-w-[620px] h-full flex flex-col rounded-l-[2rem] shadow-2xl relative">
            
            {/* Form Header */}
            <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-terracotta font-semibold">
                  {activeEvent ? 'Database Synchronization' : 'Creative Desk'}
                </span>
                <h2 className="font-serif text-2xl font-light mt-0.5 text-cream">
                  {activeEvent ? 'Edit Event Details' : 'Create Event Listing'}
                </h2>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-white/5 text-cream/50 hover:text-cream flex items-center justify-center transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Body Scrollpane */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              
              {/* Cover Image Upload (Using Cloudinary Integration) */}
              <div className="space-y-2">
                <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                  Event Cover Photo (Auto Optimized)
                </label>
                <ImageUploader 
                  initialImageUrl={formData.coverImage}
                  type="cover"
                  slug={formData.slug || 'event'}
                  onUploadComplete={(uploadedAsset) => {
                    setFormData(prev => ({ ...prev, coverImage: uploadedAsset.secure_url }));
                    setFormErrors(prev => ({ ...prev, coverImage: null }));
                  }}
                />
                {formErrors.coverImage && (
                  <span className="text-[10px] text-terracotta ml-1">{formErrors.coverImage[0] || formErrors.coverImage}</span>
                )}
              </div>

              {/* Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="Morning Run: Marine Drive"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full bg-[#181818] border border-white/5 rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:border-cream/20 transition-all"
                  />
                  {formErrors.title && (
                    <span className="text-[10px] text-terracotta ml-1">{formErrors.title[0]}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                    URL Slug (Auto Generated)
                  </label>
                  <input
                    type="text"
                    name="slug"
                    required
                    placeholder="morning-run-marine-drive"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full bg-[#181818] border border-white/5 rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:border-cream/20 transition-all font-mono"
                  />
                  {formErrors.slug && (
                    <span className="text-[10px] text-terracotta ml-1">{formErrors.slug[0]}</span>
                  )}
                </div>
              </div>

              {/* Community Circle & Category IDs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                    Community Circle Group
                  </label>
                  <select
                    name="communityId"
                    value={formData.communityId}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#181818] border border-white/5 rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:border-cream/20 transition-all cursor-pointer font-sans"
                  >
                    <option value="" disabled>Select Circle...</option>
                    {communities.map(comm => (
                      <option key={comm.id} value={comm.id}>{comm.name}</option>
                    ))}
                  </select>
                  {formErrors.communityId && (
                    <span className="text-[10px] text-terracotta ml-1">{formErrors.communityId[0]}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                    Activity Category
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full bg-[#181818] border border-white/5 rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:border-cream/20 transition-all cursor-pointer font-sans"
                  >
                    <option value="">No specific category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {formErrors.categoryId && (
                    <span className="text-[10px] text-terracotta ml-1">{formErrors.categoryId[0]}</span>
                  )}
                </div>
              </div>

              {/* Date & Schedule times */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    required
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    className="w-full bg-[#181818] border border-white/5 rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:border-cream/20 transition-all"
                  />
                  {formErrors.eventDate && (
                    <span className="text-[10px] text-terracotta ml-1">{formErrors.eventDate[0]}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    name="eventTime"
                    required
                    placeholder="06:30 AM"
                    value={formData.eventTime}
                    onChange={handleInputChange}
                    className="w-full bg-[#181818] border border-white/5 rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:border-cream/20 transition-all"
                  />
                  {formErrors.eventTime && (
                    <span className="text-[10px] text-terracotta ml-1">{formErrors.eventTime[0]}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                    End Time (Optional)
                  </label>
                  <input
                    type="text"
                    name="endTime"
                    placeholder="08:00 AM"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full bg-[#181818] border border-white/5 rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:border-cream/20 transition-all"
                  />
                  {formErrors.endTime && (
                    <span className="text-[10px] text-terracotta ml-1">{formErrors.endTime[0]}</span>
                  )}
                </div>
              </div>

              {/* Location & Google maps Link */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                    Physical Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    placeholder="Marine Drive, Surat"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full bg-[#181818] border border-white/5 rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:border-cream/20 transition-all"
                  />
                  {formErrors.location && (
                    <span className="text-[10px] text-terracotta ml-1">{formErrors.location[0]}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                    Google Maps Reference Link
                  </label>
                  <input
                    type="url"
                    name="googleMapsLink"
                    placeholder="https://maps.google.com/?q=Location"
                    value={formData.googleMapsLink}
                    onChange={handleInputChange}
                    className="w-full bg-[#181818] border border-white/5 rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:border-cream/20 transition-all"
                  />
                  {formErrors.googleMapsLink && (
                    <span className="text-[10px] text-terracotta ml-1">{formErrors.googleMapsLink[0]}</span>
                  )}
                </div>
              </div>

              {/* Price, capacity limit & registration deadline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                    Admission Price (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-cream/30">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      step="1"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full bg-[#181818] border border-white/5 rounded-xl pl-8 pr-4 py-3 text-xs text-cream focus:outline-none focus:border-cream/20 transition-all font-mono"
                    />
                  </div>
                  {formErrors.price && (
                    <span className="text-[10px] text-terracotta ml-1">{formErrors.price[0]}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                    Max Capacity (Optional)
                  </label>
                  <input
                    type="number"
                    name="maxParticipants"
                    min="1"
                    placeholder="Unlimited"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    className="w-full bg-[#181818] border border-white/5 rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:border-cream/20 transition-all font-mono"
                  />
                  {formErrors.maxParticipants && (
                    <span className="text-[10px] text-terracotta ml-1">{formErrors.maxParticipants[0]}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                    Booking Deadline
                  </label>
                  <input
                    type="date"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleInputChange}
                    className="w-full bg-[#181818] border border-white/5 rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:border-cream/20 transition-all"
                  />
                  {formErrors.registrationDeadline && (
                    <span className="text-[10px] text-terracotta ml-1">{formErrors.registrationDeadline[0]}</span>
                  )}
                </div>
              </div>

              {/* Status and Flags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                
                <div className="space-y-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                    Moderate Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full bg-[#1c1c1c] border border-white/5 rounded-xl px-3 py-2 text-xs text-cream focus:outline-none cursor-pointer"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pl-2 h-full pt-6">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="w-4.5 h-4.5 bg-[#1c1c1c] border-white/10 rounded cursor-pointer accent-terracotta shrink-0"
                  />
                  <label htmlFor="featured" className="font-sans text-[11px] font-medium uppercase tracking-wider text-cream/70 cursor-pointer">
                    Promote to Featured Listing
                  </label>
                </div>

              </div>

              {/* Descriptions */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                    Short Catchy Description (Max 255 chars)
                  </label>
                  <input
                    type="text"
                    name="shortDescription"
                    placeholder="Surat's premier active running club sunrise run."
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    className="w-full bg-[#181818] border border-white/5 rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:border-cream/20 transition-all"
                  />
                  {formErrors.shortDescription && (
                    <span className="text-[10px] text-terracotta ml-1">{formErrors.shortDescription[0]}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/50 ml-1">
                    Main Event Description (Detailed Contexts)
                  </label>
                  <textarea
                    name="description"
                    required
                    rows="6"
                    placeholder="Enter detailed events outlines, gear checklists, schedule, hydration details, and general expectations..."
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full bg-[#181818] border border-white/5 rounded-xl px-4 py-3 text-xs text-cream focus:outline-none focus:border-cream/20 transition-all resize-none font-sans font-light"
                  />
                  {formErrors.description && (
                    <span className="text-[10px] text-terracotta ml-1">{formErrors.description[0]}</span>
                  )}
                </div>
              </div>

            </form>

            {/* Form Footer */}
            <div className="p-6 md:p-8 border-t border-white/5 bg-white/[0.01] flex items-center justify-end gap-3 rounded-b-[2rem]">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-5 py-3 bg-white/5 hover:bg-white/10 text-cream hover:text-cream rounded-xl text-xs font-semibold uppercase tracking-wider transition-all"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleFormSubmit}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-cream text-warm-black hover:bg-cream/90 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Commit Event</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- DETAIL PREVIEW MODAL (VIEW) --- */}
      {isViewOpen && activeEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          {/* View Container Card */}
          <div className="bg-[#141414] border border-white/5 w-full max-w-[560px] max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col relative">
            
            {/* Visual Cover Panel */}
            <div className="h-56 bg-[#222] relative shrink-0">
              {activeEvent.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeEvent.coverImage} alt={activeEvent.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-cream/10 text-xs">No Cover Image</div>
              )}
              {/* Glass Header Tag Overlay */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 border border-white/10 rounded-full backdrop-blur-md">
                <span 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: activeEvent.community?.themeColor || '#A8B5A2' }}
                />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-cream/80">
                  {activeEvent.community?.name || 'Circle'}
                </span>
              </div>
              <button 
                onClick={() => setIsViewOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 bg-black/60 hover:bg-black/80 text-cream/70 hover:text-cream rounded-full border border-white/10 flex items-center justify-center backdrop-blur-md transition-all"
              >
                <X size={15} />
              </button>

              {/* Price Banner */}
              <div className="absolute bottom-4 right-4 bg-terracotta text-cream px-3 py-1.5 rounded-xl text-xs font-mono font-medium tracking-wide">
                {Number(activeEvent.price) === 0 ? 'FREE ADMISSION' : `₹${Number(activeEvent.price)}`}
              </div>
            </div>

            {/* Details Content pane */}
            <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-6">
              
              <div className="space-y-1">
                {activeEvent.featured && (
                  <span className="text-[9px] uppercase tracking-wider text-terracotta font-semibold flex items-center gap-1">
                    <Sparkles size={11} />
                    <span>Promoted Featured Event</span>
                  </span>
                )}
                <h3 className="font-serif text-2xl font-light text-cream leading-tight">{activeEvent.title}</h3>
                <span className="inline-block text-[10px] text-cream/35 font-mono">{activeEvent.slug}</span>
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-4 text-xs font-sans font-light">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-cream/40 shrink-0">
                    <Calendar size={14} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-cream/30 leading-none">Schedule</p>
                    <p className="text-cream/80 mt-1">
                      {new Date(activeEvent.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-cream/40 mt-0.5">{activeEvent.eventTime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-cream/40 shrink-0">
                    <MapPin size={14} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[9px] uppercase tracking-wider text-cream/30 leading-none">Location</p>
                    <p className="text-cream/80 mt-1 truncate">{activeEvent.location}</p>
                    {activeEvent.googleMapsLink && (
                      <a 
                        href={activeEvent.googleMapsLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] text-sage hover:underline flex items-center gap-0.5 mt-0.5"
                      >
                        <span>Open Maps</span>
                        <ArrowUpRight size={10} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-cream/40 shrink-0">
                    <Users size={14} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-cream/30 leading-none">Total Booked</p>
                    <p className="text-cream/80 mt-1 font-mono font-medium">
                      {activeEvent._count?.registrations || 0} participants
                    </p>
                    {activeEvent.maxParticipants && (
                      <p className="text-[10px] text-cream/45 mt-0.5">Cap: {activeEvent.maxParticipants}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-cream/40 shrink-0">
                    <Layers size={14} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-cream/30 leading-none">Current Status</p>
                    <p className="text-cream/80 mt-1 font-semibold uppercase tracking-wider text-[10px]">
                      {activeEvent.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Text Outlines */}
              <div className="space-y-4 font-sans font-light text-xs leading-relaxed text-cream/70">
                {activeEvent.shortDescription && (
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl italic text-cream/80">
                    "{activeEvent.shortDescription}"
                  </div>
                )}
                
                <div className="space-y-2">
                  <h5 className="font-serif text-sm font-light text-cream/90">Detailed Information</h5>
                  <p className="whitespace-pre-line leading-relaxed">{activeEvent.description}</p>
                </div>
              </div>

            </div>

            {/* View Footer */}
            <div className="p-6 md:p-8 border-t border-white/5 bg-white/[0.01] flex items-center justify-between shrink-0">
              <span className="text-[10px] font-sans font-light text-cream/30">
                Created: {new Date(activeEvent.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => {
                  setIsViewOpen(false);
                  handleOpenEdit(activeEvent);
                }}
                className="px-5 py-3 bg-cream text-warm-black hover:bg-cream/90 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                <Edit size={13} />
                <span>Edit Event Details</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- CONFIRM DELETE MODAL --- */}
      {isDeleteOpen && eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#141414] border border-white/5 w-full max-w-md p-6 md:p-8 rounded-[2rem] shadow-2xl space-y-6 text-center flex flex-col items-center">
            
            {/* Warning Alert Icon */}
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <ShieldAlert size={28} />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-xl font-light text-cream">Confirm Destructive Action</h3>
              <p className="font-sans text-xs text-cream/40 font-light leading-relaxed max-w-xs mx-auto">
                Are you absolutely sure you want to delete the event <span className="font-semibold text-cream">"{eventToDelete.title}"</span>? 
                This will cascade-delete all linked registrations.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 py-3.5 bg-white/5 border border-white/5 hover:bg-white/10 text-cream rounded-2xl font-sans text-xs font-semibold uppercase tracking-wider transition-all"
              >
                Keep Event
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-cream rounded-2xl font-sans text-xs font-semibold uppercase tracking-wider transition-all shadow-lg shadow-red-500/10"
              >
                Delete Forever
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- INTERACTIVE TOAST BANNERS --- */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4.5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md animate-fade-in-up bg-[#141414] border-white/10 min-w-[280px] max-w-sm">
          {notification.type === 'success' ? (
            <div className="w-6 h-6 rounded-full bg-sage/10 border border-sage/20 flex items-center justify-center text-sage shrink-0">
              <Check size={13} />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
              <AlertCircle size={13} />
            </div>
          )}
          <div className="overflow-hidden">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/40 leading-none">
              {notification.type === 'success' ? 'Curation Desk Broadcast' : 'System Exception'}
            </p>
            <p className="font-sans text-xs font-light text-cream/90 mt-1 leading-snug">
              {notification.message}
            </p>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-cream/20 hover:text-cream/60 transition-colors ml-auto pl-2"
          >
            <X size={14} />
          </button>
        </div>
      )}

    </div>
  );
}
