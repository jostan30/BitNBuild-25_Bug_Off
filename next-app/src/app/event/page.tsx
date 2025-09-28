'use client'
import React, { useState, useEffect } from 'react';
import { Heart, Calendar, MapPin, Zap, Shield, Star, ChevronLeft, ChevronRight, Music, Users, Palette, Trophy, Gamepad2, Search, Filter, Loader } from 'lucide-react';
import { cn } from '@/lib/utils'; import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { eventApi, Event } from '@/lib/api';

const SpectateEvents: React.FC = () => {
    const { user, loading } = useAuth('user');
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Category data with icons and images
    const categoryData = [
        {
            name: 'Music',
            image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
            icon: 'music'
        },
        {
            name: 'Conference',
            image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=300&fit=crop',
            icon: 'conference'
        },
        {
            name: 'Art',
            image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
            icon: 'art'
        },
        {
            name: 'Sports',
            image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop',
            icon: 'sports'
        },
        {
            name: 'Gaming',
            image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop',
            icon: 'gaming'
        }
    ];

    // Fetch events from backend
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await eventApi.getEvents();
                setEvents(response.events);
                setFilteredEvents(response.events);
            } catch (err) {
                console.error('Error fetching events:', err);
                setError('Failed to load events. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // Filter events based on category and search
    useEffect(() => {
        let filtered = events;

        // Filter by category
        if (activeCategory !== 'All') {
            filtered = filtered.filter(event => event.category === activeCategory);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(event =>
                event.name.toLowerCase().includes(query) ||
                event.description?.toLowerCase().includes(query) ||
                event.location?.toLowerCase().includes(query)
            );
        }

        setFilteredEvents(filtered);
    }, [events, activeCategory, searchQuery]);

    const toggleLike = (eventId: string): void => {
        setLikedEvents(prev => {
            const newSet = new Set(prev);
            if (newSet.has(eventId)) {
                newSet.delete(eventId);
            } else {
                newSet.add(eventId);
            }
            return newSet;
        });
    };

    const getCategoryIcon = (iconType: string) => {
        switch (iconType) {
            case 'music': return <Music className="h-5 w-5" />;
            case 'conference': return <Users className="h-5 w-5" />;
            case 'art': return <Palette className="h-5 w-5" />;
            case 'sports': return <Trophy className="h-5 w-5" />;
            case 'gaming': return <Gamepad2 className="h-5 w-5" />;
            default: return <Star className="h-5 w-5" />;
        }
    };

    const handleEventClick = (eventId: string) => {
        router.push(`/event/${eventId}`);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            }),
            time: date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            })
        };
    };

    const getTicketPrice = (event: Event) => {
        if (event.ticketClasses && event.ticketClasses.length > 0) {
            const minPrice = Math.min(...event.ticketClasses.map(tc => tc.price));
            return `₹${minPrice}`;
        }
        return '₹0';
    };

    const getTicketAvailability = (event: Event) => {
        if (event.ticketClasses && event.ticketClasses.length > 0) {
            const totalSupply = event.ticketClasses.reduce((sum, tc) => sum + tc.maxSupply, 0);
            // For demo, assume 70% are sold (you can add sold count to your backend)
            const sold = Math.floor(totalSupply * 0.7);
            return { sold, total: totalSupply };
        }
        return { sold: 0, total: 0 };
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{
                background: "linear-gradient(120deg, #F4FFEE 0%, #CDBBB9 30%, #49747F 70%, #003447 100%)"
            }}>
                <div className="text-center">
                    <Loader className="h-8 w-8 animate-spin text-[#003447] mx-auto mb-4" />
                    <p className="text-[#003447] font-medium">Loading events...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{
                background: "linear-gradient(120deg, #F4FFEE 0%, #CDBBB9 30%, #49747F 70%, #003447 100%)"
            }}>
                <div className="text-center bg-white/30 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                    <p className="text-[#E34B26] font-medium mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-gradient-to-r from-[#E34B26] to-[#49747F] text-white px-6 py-2 rounded-full font-semibold hover:scale-105 transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen relative overflow-hidden"
            style={{
                background: "linear-gradient(120deg, #F4FFEE 0%, #CDBBB9 30%, #49747F 70%, #003447 100%)"
            }}
        >
            {/* Abstract SVG background patterns */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
                viewBox="0 0 1440 810"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
            >
                <ellipse cx="250" cy="130" rx="170" ry="80" fill="#F4FFEE" opacity="0.42" />
                <ellipse cx="1170" cy="700" rx="160" ry="70" fill="#CDBBB9" opacity="0.30" />
                <rect x="950" y="120" width="260" height="40" rx="20" fill="url(#g4)" opacity="0.16" />
                <rect x="80" y="650" width="260" height="40" rx="20" fill="url(#g5)" opacity="0.16" />
                <path d="M0,390 Q720,540 1440,390" stroke="#E34B26" strokeWidth="16" opacity="0.07" fill="none" />
                <path d="M0,600 Q720,750 1440,600" stroke="#003447" strokeWidth="16" opacity="0.06" fill="none" />
                <defs>
                    <linearGradient id="g4" x1="950" y1="120" x2="1210" y2="160" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#E34B26" />
                        <stop offset="1" stopColor="#003447" />
                    </linearGradient>
                    <linearGradient id="g5" x1="80" y1="650" x2="340" y2="690" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#CDBBB9" />
                        <stop offset="1" stopColor="#441111" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Header */}
            <header className="relative z-10 px-4 py-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="rounded-lg bg-white shadow-lg p-2 flex items-center justify-center">
                                <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                                    <path
                                        d="M19 4 L33 19 L19 34 L5 19 Z"
                                        stroke="#003447"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        d="M19 11 L28 19 L19 28 L10 19 Z"
                                        stroke="#E34B26"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                </svg>
                            </span>
                            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#E34B26] via-[#49747F] to-[#003447] tracking-wide">Spectrate</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="hidden md:flex items-center space-x-2 bg-white/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                                <Shield className="h-4 w-4 text-[#003447]" />
                                <span className="text-sm text-[#003447] font-medium">Secure Events</span>
                            </div>
                            <button 
                                onClick={() => router.push('/profile')}
                                className="bg-gradient-to-r from-[#E34B26] via-[#49747F] to-[#003447] text-white px-6 py-2 rounded-full font-semibold hover:scale-105 transition-all shadow-lg"
                            >
                                {user?.username || 'My Account'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative z-10 px-4 py-16 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-bold text-[#003447] mb-6 drop-shadow">
                        Discover Amazing <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E34B26] to-[#49747F]">Events</span>
                    </h1>
                    <p className="text-lg md:text-xl text-[#441111] mb-8 max-w-2xl mx-auto">
                        From concerts to conferences, find and book tickets for the most exciting events happening around you.
                    </p>

                    {/* Search Bar */}
                    <div className="flex justify-center mb-8">
                        <div className="relative w-full max-w-2xl">
                            <div className="bg-white/30 backdrop-blur-md rounded-full p-2 border border-white/20 shadow-lg flex items-center">
                                <Search className="h-4 w-4 md:h-5 md:w-5 text-[#49747F] ml-3 md:ml-4" />
                                <input
                                    type="text"
                                    placeholder="Search events, venues, locations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-[#003447] placeholder-[#49747F]/70 outline-none font-medium"
                                />
                                <button className="bg-gradient-to-r from-[#E34B26] to-[#49747F] text-white px-3 py-2 md:px-6 md:py-3 rounded-full font-semibold hover:scale-105 transition-all text-sm md:text-base">
                                    <span className="hidden sm:inline">Search</span>
                                    <Search className="h-4 w-4 sm:hidden" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
                        <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                            <Zap className="h-5 w-5 text-[#E34B26]" />
                            <span className="text-[#003447] font-medium">Instant Booking</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                            <Shield className="h-5 w-5 text-[#49747F]" />
                            <span className="text-[#003447] font-medium">Secure Payment</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                            <Star className="h-5 w-5 text-[#E34B26]" />
                            <span className="text-[#003447] font-medium">Premium Experience</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="relative z-10 px-4 py-12">
                <div className="max-w-7xl mx-auto">
                    {/* All Categories Button */}
                    <div className="flex justify-center mb-8">
                        <button
                            onClick={() => setActiveCategory("All")}
                            className={cn(
                                "px-8 py-3 rounded-full font-semibold transition-all shadow-lg",
                                activeCategory === "All"
                                    ? "bg-gradient-to-r from-[#E34B26] via-[#49747F] to-[#003447] text-white scale-105"
                                    : "bg-white/30 backdrop-blur-md text-[#003447] border border-white/20 hover:bg-white/40"
                            )}
                        >
                            All Events ({events.length})
                        </button>
                    </div>

                    {/* Category Carousel */}
                    <Carousel opts={{ align: "start" }} className="w-full">
                        <CarouselContent>
                            {categoryData.map((category) => {
                                const categoryCount = events.filter(e => e.category === category.name).length;
                                return (
                                    <CarouselItem
                                        key={category.name}
                                        className="w-full sm:w-1/3 md:basis-1/5 px-2"
                                    >
                                        <div
                                            onClick={() => setActiveCategory(category.name)}
                                            className={cn(
                                                "relative group cursor-pointer transition-all duration-300",
                                                activeCategory === category.name ? "scale-105" : "hover:scale-102"
                                            )}
                                        >
                                            <div className="bg-white/30 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all">
                                                <div
                                                    className={cn(
                                                        "w-8 h-8 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 rounded-full flex items-center justify-center transition-all",
                                                        activeCategory === category.name
                                                            ? "bg-gradient-to-r from-[#E34B26] to-[#49747F] text-white"
                                                            : "bg-white/50 text-[#49747F]"
                                                    )}
                                                >
                                                    <div className="scale-75 md:scale-100">
                                                        {getCategoryIcon(category.icon)}
                                                    </div>
                                                </div>
                                                <h3
                                                    className={cn(
                                                        "text-center font-semibold transition-colors text-sm md:text-base",
                                                        activeCategory === category.name ? "text-[#E34B26]" : "text-[#003447]"
                                                    )}
                                                >
                                                    {category.name}
                                                </h3>
                                                <p className="text-xs text-[#49747F] text-center mt-1">
                                                    ({categoryCount})
                                                </p>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                );
                            })}
                        </CarouselContent>

                        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 md:p-3 rounded-full shadow-lg hover:bg-white/90 z-10">
                            <ChevronLeft className="h-4 w-4 md:h-6 md:w-6 text-gray-600" />
                        </CarouselPrevious>
                        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 md:p-3 rounded-full shadow-lg hover:bg-white/90 z-10">
                            <ChevronRight className="h-4 w-4 md:h-6 md:w-6 text-gray-600" />
                        </CarouselNext>
                    </Carousel>
                </div>
            </section>

            {/* Events Section */}
            <section className="relative z-10 px-4 py-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-[#003447] mb-2">
                                {activeCategory === 'All' ? 'All Events' : `${activeCategory} Events`}
                            </h2>
                            <p className="text-[#441111]">{filteredEvents.length} events found</p>
                        </div>
                        <button className="flex items-center space-x-2 bg-white/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-[#003447] hover:bg-white/40 transition-all">
                            <Filter className="h-4 w-4" />
                            <span className="font-medium">Filter</span>
                        </button>
                    </div>

                    {/* Events Grid */}
                    {filteredEvents.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-white/30 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-lg max-w-md mx-auto">
                                <Star className="h-12 w-12 text-[#49747F] mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-[#003447] mb-2">No Events Found</h3>
                                <p className="text-[#441111]">
                                    {searchQuery ? `No events match "${searchQuery}"` : `No ${activeCategory} events available`}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredEvents.map((event) => {
                                const { date, time } = formatDate(event.startTime);
                                const availability = getTicketAvailability(event);
                                const price = getTicketPrice(event);

                                return (
                                    <div
                                        key={event._id}
                                        className="bg-white/30 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105"
                                        onClick={() => handleEventClick(event._id)}
                                    >
                                        {/* Event Image */}
                                        <div className="relative h-48 overflow-hidden">
                                            <img
                                                src={event.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'}
                                                alt={event.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                                            {/* Like Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleLike(event._id);
                                                }}
                                                className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full transition-all shadow-lg backdrop-blur-sm"
                                            >
                                                <Heart
                                                    className={cn(
                                                        "h-5 w-5 transition-colors",
                                                        likedEvents.has(event._id)
                                                            ? 'fill-[#E34B26] text-[#E34B26]'
                                                            : 'text-[#49747F]'
                                                    )}
                                                />
                                            </button>

                                            {/* Price Badge */}
                                            <div className="absolute bottom-4 right-4">
                                                <span className="bg-gradient-to-r from-[#E34B26] to-[#49747F] text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                                    {price}
                                                </span>
                                            </div>

                                            {/* Category Badge */}
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-white/80 backdrop-blur-sm text-[#003447] px-2 py-1 rounded-full text-xs font-semibold">
                                                    {event.category}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Event Info */}
                                        <div className="p-6">
                                            <h3 className="text-lg font-bold text-[#003447] mb-2 line-clamp-1">{event.name}</h3>
                                            <p className="text-[#441111] mb-3 line-clamp-2 text-sm">{event.description || 'No description available'}</p>

                                            <div className="flex items-center text-sm text-[#49747F] mb-2">
                                                <Calendar className="h-4 w-4 mr-2 text-[#E34B26]" />
                                                <span>{date} • {time}</span>
                                            </div>

                                            <div className="flex items-center text-sm text-[#49747F] mb-4">
                                                <MapPin className="h-4 w-4 mr-2 text-[#E34B26]" />
                                                <span className="line-clamp-1">{event.location || 'Location TBA'}</span>
                                            </div>

                                            {/* Availability Bar */}
                                            {availability.total > 0 && (
                                                <div className="mb-4">
                                                    <div className="flex justify-between text-xs text-[#49747F] mb-1">
                                                        <span>Availability</span>
                                                        <span>{Math.round((availability.sold / availability.total) * 100)}% sold</span>
                                                    </div>
                                                    <div className="w-full bg-white/50 rounded-full h-2">
                                                        <div
                                                            className="bg-gradient-to-r from-[#E34B26] to-[#49747F] h-2 rounded-full transition-all"
                                                            style={{ width: `${(availability.sold / availability.total) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Book Button */}
                                            <button className="w-full bg-gradient-to-r from-[#E34B26] via-[#49747F] to-[#003447] text-white font-semibold py-3 rounded-full hover:scale-105 transition-all shadow-lg">
                                                Book Tickets
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="relative z-10 px-4 py-16">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#003447] mb-4 drop-shadow">Why Choose Spectrate?</h2>
                        <p className="text-[#441111] text-lg max-w-2xl mx-auto">
                            Experience the future of event ticketing with our premium platform
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-white/30 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all">
                                <div className="w-16 h-16 bg-gradient-to-r from-[#E34B26] to-[#49747F] rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Zap className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-[#003447] mb-4">Lightning Fast</h3>
                                <p className="text-[#441111]">Instant booking and confirmation with our advanced ticketing system</p>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="bg-white/30 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all">
                                <div className="w-16 h-16 bg-gradient-to-r from-[#49747F] to-[#003447] rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Shield className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-[#003447] mb-4">Secure & Safe</h3>
                                <p className="text-[#441111]">Bank-level security with encrypted payments and fraud protection</p>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="bg-white/30 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all">
                                <div className="w-16 h-16 bg-gradient-to-r from-[#E34B26] via-[#49747F] to-[#003447] rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Star className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-[#003447] mb-4">Premium Experience</h3>
                                <p className="text-[#441111]">Curated events and exclusive access to the best entertainment</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 px-4 py-12">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-lg">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="flex items-center gap-3 mb-4 md:mb-0">
                                <span className="rounded-lg bg-white shadow-lg p-2 flex items-center justify-center">
                                    <svg width="32" height="32" viewBox="0 0 38 38" fill="none">
                                        <path
                                            d="M19 4 L33 19 L19 34 L5 19 Z"
                                            stroke="#003447"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            d="M19 11 L28 19 L19 28 L10 19 Z"
                                            stroke="#E34B26"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                    </svg>
                                </span>
                                <span className="text-xl font-bold text-[#003447]">Spectrate</span>
                            </div>
                            <div className="text-center md:text-right">
                                <p className="text-[#441111] mb-2 font-medium">Premium Event Experiences</p>
                                <p className="text-sm text-[#49747F]">© 2024 Spectrate. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default SpectateEvents;