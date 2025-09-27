'use client'
import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Heart, Calendar, MapPin, Users, Clock, Star, Zap, Shield,
    Share2, ChevronLeft, ChevronRight, Check, AlertCircle, Loader, Navigation
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MapComponent from '@/components/MapComponent';
import { useRouter } from 'next/navigation';

const EventDetailPage: React.FC = () => {
    const router =useRouter();
    const [isLiked, setIsLiked] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [mintingState, setMintingState] = useState({
        isLoading: false,
        selectedEventId: null as number | null
    });
    const [ticketQuantity, setTicketQuantity] = useState(1);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Mock event data
    const event = {
        id: 1,
        name: "Cosmic Dreams Festival",
        artist: "Multiple Artists",
        date: "Dec 15, 2024",
        time: "8:00 PM",
        venue: "MetaVerse Arena",
        location: "Los Angeles, CA",
        coordinates: { lat: 34.0522, lng: -118.2437 },
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
        price: 0.15,
        category: "Music",
        capacity: 50000,
        sold: 35000,
        rarity: "Legendary",
        chainFee: 0.001,
        description: "Join us for the most spectacular music festival of the year featuring top artists from around the globe. Experience three days of non-stop music, incredible food, and unforgettable memories under the stars. This legendary event brings together the best electronic, pop, and indie artists for an immersive audio-visual experience.",
        highlights: ["3 Main Stages", "50+ Artists", "VIP Experiences", "Food & Drinks", "Camping Available", "Art Installations"],
        gallery: [
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1571266028243-d220c0fe3327?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop"
        ]
    };

    const getRarityColor = (rarity: string): string => {
        switch (rarity) {
            case 'Common': return 'bg-gray-500/80 text-white';
            case 'Rare': return 'bg-blue-500/80 text-white';
            case 'Epic': return 'bg-purple-500/80 text-white';
            case 'Legendary': return 'bg-gradient-to-r from-yellow-500/80 to-orange-500/80 text-white';
            case 'Ultra Rare': return 'bg-gradient-to-r from-pink-500/80 to-purple-500/80 text-white';
            default: return 'bg-gray-500/80 text-white';
        }
    };

    const getAvailabilityStatus = (sold: number, capacity: number) => {
        const percentage = (sold / capacity) * 100;
        if (percentage >= 95) return { status: 'Almost Sold Out', color: 'text-[#E34B26]' };
        if (percentage >= 75) return { status: 'Selling Fast', color: 'text-orange-500' };
        return { status: 'Available', color: 'text-green-500' };
    };

    const mintTicket = async (): Promise<void> => {
        setMintingState({
            isLoading: true,
            selectedEventId: event.id
        });

        // Simulate blockchain transaction
        setTimeout(() => {
            setMintingState({
                isLoading: false,
                selectedEventId: null
            });
            alert(`Successfully minted ${ticketQuantity} NFT ticket(s) for ${event.name}! Total gas fee: ${(event.chainFee * ticketQuantity).toFixed(4)} ETH`);
        }, 3000);
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === event.gallery.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? event.gallery.length - 1 : prev - 1
        );
    };

    const availability = getAvailabilityStatus(event.sold, event.capacity);
    const totalPrice = (event.price * ticketQuantity).toFixed(3);
    const totalGasFee = (event.chainFee * ticketQuantity).toFixed(4);
    const isCurrentlyMinting = mintingState.isLoading && mintingState.selectedEventId === event.id;


    return (
        <div
            className="min-h-screen relative overflow-hidden"
            style={{
                background: "linear-gradient(120deg, #F4FFEE 0%, #CDBBB9 30%, #49747F 70%, #003447 100%)"
            }}
        >
            {/* Abstract SVG background patterns - same as login */}
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
                        <div className="flex items-center space-x-4">
                            <button 
                            onClick={()=>router.push('/event')}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors bg-white/10 backdrop-blur-sm border border-white/20">
                                <ArrowLeft className="h-6 w-6 text-[#003447]" />
                            </button>
                            <div className="flex items-center gap-3">
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
                                <span className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#E34B26] via-[#49747F] to-[#003447] tracking-wide">Spectrate</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button className="p-2 hover:bg-white/20 rounded-full transition-colors bg-white/10 backdrop-blur-sm border border-white/20">
                                <Share2 className="h-5 w-5 text-[#003447]" />
                            </button>
                            <button
                                onClick={() => setIsLiked(!isLiked)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors bg-white/10 backdrop-blur-sm border border-white/20"
                            >
                                <Heart className={cn("h-5 w-5 transition-colors", isLiked ? 'fill-[#E34B26] text-[#E34B26]' : 'text-[#003447]')} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="relative z-10 max-w-7xl mx-auto px-4 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Left Column - Event Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image Gallery */}
                        <div className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg overflow-hidden">
                            <div className="relative h-64 md:h-96">
                                <img
                                    src={event.gallery[currentImageIndex]}
                                    alt={`${event.name} - Image ${currentImageIndex + 1}`}
                                    className="w-full h-full object-cover"
                                />

                                {/* Gallery Navigation */}
                                {event.gallery.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 transition-colors backdrop-blur-sm shadow-lg"
                                        >
                                            <ChevronLeft className="h-6 w-6 text-gray-700" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 transition-colors backdrop-blur-sm shadow-lg"
                                        >
                                            <ChevronRight className="h-6 w-6 text-gray-700" />
                                        </button>
                                    </>
                                )}

                                {/* Image Counter */}
                                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                                    {currentImageIndex + 1} / {event.gallery.length}
                                </div>

                                {/* Rarity Badge */}
                                <div className="absolute top-4 left-4">
                                    <span className={cn("px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm", getRarityColor(event.rarity))}>
                                        {event.rarity}
                                    </span>
                                </div>
                            </div>

                            {/* Thumbnail Gallery */}
                            {event.gallery.length > 1 && (
                                <div className="flex space-x-2 p-4 overflow-x-auto bg-gradient-to-r from-[#F4FFEE]/50 to-[#CDBBB9]/50">
                                    {event.gallery.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={cn(
                                                "relative flex-shrink-0 w-16 md:w-20 h-12 md:h-16 rounded-lg overflow-hidden border-2 transition-all",
                                                currentImageIndex === index ? 'border-[#E34B26] scale-105' : 'border-white/50 hover:border-[#49747F]'
                                            )}
                                        >
                                            <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Event Info */}
                        <div className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-[#003447] mb-2 drop-shadow">{event.name}</h1>
                                    <p className="text-xl text-[#441111] mb-4">{event.artist}</p>

                                    <div className="flex flex-wrap gap-4 mb-6">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-5 w-5 text-[#E34B26]" />
                                            <span className="text-[#003447] font-medium">{event.date} • {event.time}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="h-5 w-5 text-[#49747F]" />
                                            <span className="text-[#003447] font-medium">{event.venue}, {event.location}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Users className="h-5 w-5 text-[#E34B26]" />
                                            <span className="text-[#003447] font-medium">{event.sold.toLocaleString()} / {event.capacity.toLocaleString()}</span>
                                            <span className={cn("font-semibold", availability.color)}>• {availability.status}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h2 className="text-2xl font-bold text-[#003447] mb-4">About This Event</h2>
                                    <p className="text-[#441111] leading-relaxed">{event.description}</p>
                                </div>

                                {/* Highlights */}
                                <div>
                                    <h2 className="text-2xl font-bold text-[#003447] mb-4">Event Highlights</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {event.highlights.map((highlight, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <Check className="h-4 w-4 text-[#E34B26] flex-shrink-0" />
                                                <span className="text-[#003447] font-medium">{highlight}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map Section */}
                        <MapComponent
                            lat={event.coordinates.lat}
                            lng={event.coordinates.lng}
                            venue={event.venue}
                            location={event.location}
                            name={event.name}
                        />
                    </div>

                    {/* Right Column - Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <div className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-3xl font-bold text-[#E34B26]">{event.price} ETH</span>
                                        <span className="text-sm text-[#49747F]">+ {event.chainFee} gas</span>
                                    </div>
                                    <p className="text-sm text-[#441111]">Per NFT Ticket</p>
                                </div>

                                {/* Quantity Selector */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-[#003447] mb-2">
                                        Quantity
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                                            className="w-10 h-10 rounded-full bg-white/50 border border-white/30 flex items-center justify-center hover:bg-white/70 transition-all text-[#003447] font-semibold"
                                        >
                                            -
                                        </button>
                                        <span className="text-xl font-semibold w-8 text-center text-[#003447]">{ticketQuantity}</span>
                                        <button
                                            onClick={() => setTicketQuantity(Math.min(10, ticketQuantity + 1))}
                                            className="w-10 h-10 rounded-full bg-white/50 border border-white/30 flex items-center justify-center hover:bg-white/70 transition-all text-[#003447] font-semibold"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <p className="text-xs text-[#49747F] mt-1">Maximum 10 tickets per transaction</p>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-[#003447]">Availability</span>
                                        <span className="text-sm text-[#441111]">
                                            {((event.capacity - event.sold) / 1000).toFixed(0)}k left
                                        </span>
                                    </div>
                                    <div className="w-full bg-white/50 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-[#E34B26] to-[#49747F] h-3 rounded-full transition-all duration-300"
                                            style={{ width: `${(event.sold / event.capacity) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Price Breakdown */}
                                <div className="mb-6 p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30">
                                    <h3 className="font-semibold text-[#003447] mb-3">Price Breakdown</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-[#441111]">{ticketQuantity} × NFT Ticket</span>
                                            <span className="font-medium text-[#003447]">{totalPrice} ETH</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#441111]">Gas Fees</span>
                                            <span className="font-medium text-[#003447]">{totalGasFee} ETH</span>
                                        </div>
                                        <hr className="border-white/30" />
                                        <div className="flex justify-between font-bold text-lg">
                                            <span className="text-[#003447]">Total</span>
                                            <span className="text-[#E34B26]">{(parseFloat(totalPrice) + parseFloat(totalGasFee)).toFixed(4)} ETH</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Security Benefits */}
                                <div className="mb-6 p-4 bg-gradient-to-br from-[#F4FFEE]/50 to-[#CDBBB9]/50 rounded-xl border border-white/30">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Shield className="h-5 w-5 text-[#49747F]" />
                                        <span className="font-semibold text-[#003447]">Spectrate Secured</span>
                                    </div>
                                    <ul className="text-sm text-[#441111] space-y-1">
                                        <li>• Instant minting (no waiting)</li>
                                        <li>• Ultra-low gas fees</li>
                                        <li>• Environmentally friendly</li>
                                    </ul>
                                </div>

                                {/* Warning */}
                                {availability.status === 'Almost Sold Out' && (
                                    <div className="mb-6 p-4 bg-gradient-to-br from-red-100/50 to-orange-100/50 rounded-xl border border-red-200/50">
                                        <div className="flex items-center space-x-2">
                                            <AlertCircle className="h-5 w-5 text-[#E34B26]" />
                                            <span className="font-semibold text-[#E34B26]">Almost Sold Out!</span>
                                        </div>
                                        <p className="text-sm text-[#441111] mt-1">
                                            Only a few tickets remaining. Secure yours now!
                                        </p>
                                    </div>
                                )}

                                {/* Mint Button */}
                                <button
                                    onClick={mintTicket}
                                    disabled={isCurrentlyMinting}
                                    className="w-full bg-gradient-to-r from-[#E34B26] via-[#49747F] to-[#003447] text-white font-semibold py-4 rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg shadow-lg"
                                >
                                    {isCurrentlyMinting ? (
                                        <>
                                            <Clock className="h-5 w-5 animate-spin" />
                                            <span>Minting NFT Tickets...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="h-5 w-5" />
                                            <span>Mint {ticketQuantity} NFT Ticket{ticketQuantity > 1 ? 's' : ''}</span>
                                        </>
                                    )}
                                </button>

                                {/* Security Note */}
                                <p className="text-xs text-[#49747F] text-center mt-4">
                                    🔒 Secure blockchain transaction • Your NFT tickets will be minted to your connected wallet
                                </p>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailPage;