'use client'
import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Heart, Calendar, MapPin, Users, Clock, Star, Zap, Shield,
    Share2, ChevronLeft, ChevronRight, Check, AlertCircle, Loader, Navigation,
    CreditCard, Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MapComponent from '@/components/MapComponent';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { eventApi, ticketApi, paymentApi, Event, TicketClass, Ticket } from '@/lib/api';

// Razorpay types
declare global {
    interface Window {
        Razorpay: any;
    }
}

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

const EventDetailPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const { user, loading: authLoading } = useAuth('user');
    const eventId = params?.id as string;

    const [event, setEvent] = useState<Event | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedTicketClass, setSelectedTicketClass] = useState<TicketClass | null>(null);
    const [ticketQuantity, setTicketQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bookingState, setBookingState] = useState({
        isBooking: false,
        isPaying: false,
        currentTicket: null as Ticket | null
    });
    const [paymentStep, setPaymentStep] = useState<'select' | 'book' | 'pay' | 'success'>('select');

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // Fetch event data
    useEffect(() => {
        const fetchEvent = async () => {
            if (!eventId) return;
            
            try {
                setLoading(true);
                setError(null);
                const response = await eventApi.getEvent(eventId);
                setEvent(response.event);
                
                // Set default ticket class
                if (response.event.ticketClasses?.length > 0) {
                    setSelectedTicketClass(response.event.ticketClasses[0]);
                }
            } catch (err) {
                console.error('Error fetching event:', err);
                setError('Failed to load event details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [eventId]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
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

    const getTicketAvailability = (ticketClass: TicketClass) => {
        // For demo, assume 70% are sold (you can add sold count to your backend)
        const sold = Math.floor(ticketClass.maxSupply * 0.7);
        return { sold, total: ticketClass.maxSupply };
    };

    const getAvailabilityStatus = (sold: number, total: number) => {
        const percentage = (sold / total) * 100;
        if (percentage >= 95) return { status: 'Almost Sold Out', color: 'text-[#E34B26]' };
        if (percentage >= 75) return { status: 'Selling Fast', color: 'text-orange-500' };
        return { status: 'Available', color: 'text-green-500' };
    };

    const nextImage = () => {
        if (!event) return;
        const gallery = [event.image].filter(Boolean);
        setCurrentImageIndex((prev) => prev === gallery.length - 1 ? 0 : prev + 1);
    };

    const prevImage = () => {
        if (!event) return;
        const gallery = [event.image].filter(Boolean);
        setCurrentImageIndex((prev) => prev === 0 ? gallery.length - 1 : prev - 1);
    };

    const handleBookTicket = async () => {
        if (!selectedTicketClass || !user) return;

        try {
            setBookingState(prev => ({ ...prev, isBooking: true }));
            setError(null);

            const response = await ticketApi.bookTicket({
                eventId: eventId,
                ticketType: selectedTicketClass.type
            });

            setBookingState(prev => ({ 
                ...prev, 
                currentTicket: response.ticket,
                isBooking: false 
            }));
            setPaymentStep('pay');

        } catch (err: any) {
            console.error('Error booking ticket:', err);
            setError(err.message || 'Failed to book ticket. Please try again.');
            setBookingState(prev => ({ ...prev, isBooking: false }));
        }
    };

    const handlePayment = async () => {
        if (!bookingState.currentTicket || !selectedTicketClass) return;

        try {
            setBookingState(prev => ({ ...prev, isPaying: true }));
            setError(null);

            // Create Razorpay order
            const totalAmount = selectedTicketClass.price * ticketQuantity * 100; // Convert to paise
            const orderResponse = await paymentApi.createOrder({
                ticketId: bookingState.currentTicket._id,
                amount: totalAmount
            });

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderResponse.order.amount,
                currency: orderResponse.order.currency,
                name: 'Spectrate',
                description: `${event?.name} - ${selectedTicketClass.type} Ticket`,
                order_id: orderResponse.order.id,
                handler: async (response: RazorpayResponse) => {
                    try {
                        await ticketApi.verifyPayment({
                            ticketId: bookingState.currentTicket!._id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature
                        });

                        setPaymentStep('success');
                        setBookingState(prev => ({ ...prev, isPaying: false }));
                    } catch (err: any) {
                        console.error('Payment verification failed:', err);
                        setError('Payment verification failed. Please contact support.');
                        setBookingState(prev => ({ ...prev, isPaying: false }));
                    }
                },
                prefill: {
                    name: user?.username,
                    email: user?.email,
                },
                theme: {
                    color: '#E34B26'
                },
                modal: {
                    ondismiss: () => {
                        setBookingState(prev => ({ ...prev, isPaying: false }));
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (err: any) {
            console.error('Error initiating payment:', err);
            setError(err.message || 'Failed to initiate payment. Please try again.');
            setBookingState(prev => ({ ...prev, isPaying: false }));
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{
                background: "linear-gradient(120deg, #F4FFEE 0%, #CDBBB9 30%, #49747F 70%, #003447 100%)"
            }}>
                <div className="text-center">
                    <Loader className="h-8 w-8 animate-spin text-[#003447] mx-auto mb-4" />
                    <p className="text-[#003447] font-medium">Loading event details...</p>
                </div>
            </div>
        );
    }

    if (error && !event) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{
                background: "linear-gradient(120deg, #F4FFEE 0%, #CDBBB9 30%, #49747F 70%, #003447 100%)"
            }}>
                <div className="text-center bg-white/30 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                    <AlertCircle className="h-12 w-12 text-[#E34B26] mx-auto mb-4" />
                    <p className="text-[#E34B26] font-medium mb-4">{error}</p>
                    <button 
                        onClick={() => router.push('/events')} 
                        className="bg-gradient-to-r from-[#E34B26] to-[#49747F] text-white px-6 py-2 rounded-full font-semibold hover:scale-105 transition-all"
                    >
                        Back to Events
                    </button>
                </div>
            </div>
        );
    }

    if (!event) return null;

    const { date, time } = formatDate(event.startTime);
    const availability = selectedTicketClass ? getTicketAvailability(selectedTicketClass) : { sold: 0, total: 0 };
    const availabilityStatus = getAvailabilityStatus(availability.sold, availability.total);
    const totalPrice = selectedTicketClass ? (selectedTicketClass.price * ticketQuantity).toFixed(2) : '0';
    const gallery = [event.image].filter(Boolean);

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
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => router.push('/events')}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors bg-white/10 backdrop-blur-sm border border-white/20"
                            >
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
                                    src={gallery[currentImageIndex] || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop'}
                                    alt={`${event.name} - Image ${currentImageIndex + 1}`}
                                    className="w-full h-full object-cover"
                                />

                                {/* Gallery Navigation */}
                                {gallery.length > 1 && (
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
                                    {currentImageIndex + 1} / {gallery.length}
                                </div>

                                {/* Category Badge */}
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/80 backdrop-blur-sm text-[#003447] px-3 py-1 rounded-full text-sm font-semibold">
                                        {event.category}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Event Info */}
                        <div className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-[#003447] mb-2 drop-shadow">{event.name}</h1>
                                    
                                    <div className="flex flex-wrap gap-4 mb-6">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-5 w-5 text-[#E34B26]" />
                                            <span className="text-[#003447] font-medium">{date} • {time}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="h-5 w-5 text-[#49747F]" />
                                            <span className="text-[#003447] font-medium">{event.location || 'Location TBA'}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Clock className="h-5 w-5 text-[#E34B26]" />
                                            <span className="text-[#003447] font-medium">
                                                {event.ticketExpiryHours}h ticket validity
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h2 className="text-2xl font-bold text-[#003447] mb-4">About This Event</h2>
                                    <p className="text-[#441111] leading-relaxed">
                                        {event.description || 'Join us for this amazing event! More details will be updated soon.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Map Section */}
                        {event.location && (
                            <MapComponent
                                lat={34.0522} // Default to LA coords - you can add coordinates to your event model
                                lng={-118.2437}
                                venue={event.location}
                                location={event.location}
                                name={event.name}
                            />
                        )}
                    </div>

                    {/* Right Column - Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <div className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
                                {/* Error Display */}
                                {error && (
                                    <div className="mb-4 p-3 bg-red-100/50 border border-red-200/50 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                )}

                                {paymentStep === 'success' ? (
                                    /* Success State */
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Check className="h-8 w-8 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-[#003447] mb-2">Booking Confirmed!</h3>
                                        <p className="text-[#441111] mb-4">Your ticket has been successfully booked and payment processed.</p>
                                        <div className="bg-gradient-to-br from-[#F4FFEE]/50 to-[#CDBBB9]/50 rounded-xl p-4 mb-4">
                                            <p className="text-sm text-[#003447]">
                                                <strong>Ticket ID:</strong> {bookingState.currentTicket?._id}
                                            </p>
                                            <p className="text-sm text-[#003447]">
                                                <strong>Type:</strong> {selectedTicketClass?.type}
                                            </p>
                                            <p className="text-sm text-[#003447]">
                                                <strong>Amount:</strong> ₹{totalPrice}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => router.push('/profile/tickets')}
                                            className="w-full bg-gradient-to-r from-[#E34B26] via-[#49747F] to-[#003447] text-white font-semibold py-3 rounded-full hover:scale-105 transition-all shadow-lg"
                                        >
                                            View My Tickets
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Ticket Selection */}
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-[#003447] mb-4">Select Ticket Type</h3>
                                            <div className="space-y-3">
                                                {event.ticketClasses?.map((ticketClass) => {
                                                    const availability = getTicketAvailability(ticketClass);
                                                    const availabilityStatus = getAvailabilityStatus(availability.sold, availability.total);
                                                    
                                                    return (
                                                        <div
                                                            key={ticketClass._id}
                                                            onClick={() => setSelectedTicketClass(ticketClass)}
                                                            className={cn(
                                                                "p-4 rounded-xl border-2 cursor-pointer transition-all",
                                                                selectedTicketClass?._id === ticketClass._id
                                                                    ? "border-[#E34B26] bg-gradient-to-br from-[#E34B26]/10 to-[#49747F]/10"
                                                                    : "border-white/30 bg-white/20 hover:border-[#49747F]/50"
                                                            )}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="font-semibold text-[#003447]">{ticketClass.type}</h4>
                                                                    <p className="text-2xl font-bold text-[#E34B26]">₹{ticketClass.price}</p>
                                                                    <p className="text-sm text-[#49747F]">
                                                                        {availability.total - availability.sold} tickets left
                                                                    </p>
                                                                </div>
                                                                <span className={cn("text-xs font-medium", availabilityStatus.color)}>
                                                                    {availabilityStatus.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {selectedTicketClass && (
                                            <>
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
                                                            {((availability.total - availability.sold) / 1000).toFixed(0)}k left
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-white/50 rounded-full h-3">
                                                        <div
                                                            className="bg-gradient-to-r from-[#E34B26] to-[#49747F] h-3 rounded-full transition-all duration-300"
                                                            style={{ width: `${(availability.sold / availability.total) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Price Breakdown */}
                                                <div className="mb-6 p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30">
                                                    <h3 className="font-semibold text-[#003447] mb-3">Price Breakdown</h3>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-[#441111]">{ticketQuantity} × {selectedTicketClass.type} Ticket</span>
                                                            <span className="font-medium text-[#003447]">₹{totalPrice}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-[#441111]">Platform Fee</span>
                                                            <span className="font-medium text-[#003447]">₹{(parseFloat(totalPrice) * 0.02).toFixed(2)}</span>
                                                        </div>
                                                        <hr className="border-white/30" />
                                                        <div className="flex justify-between font-bold text-lg">
                                                            <span className="text-[#003447]">Total</span>
                                                            <span className="text-[#E34B26]">₹{(parseFloat(totalPrice) * 1.02).toFixed(2)}</span>
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
                                                        <li>• Instant confirmation</li>
                                                        <li>• Secure payment processing</li>
                                                        <li>• 100% authentic tickets</li>
                                                        <li>• 24/7 customer support</li>
                                                    </ul>
                                                </div>

                                                {/* Warning */}
                                                {availabilityStatus.status === 'Almost Sold Out' && (
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

                                                {/* Action Button */}
                                                {paymentStep === 'select' && (
                                                    <button
                                                        onClick={handleBookTicket}
                                                        disabled={bookingState.isBooking || !user}
                                                        className="w-full bg-gradient-to-r from-[#E34B26] via-[#49747F] to-[#003447] text-white font-semibold py-4 rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg shadow-lg"
                                                    >
                                                        {bookingState.isBooking ? (
                                                            <>
                                                                <Loader className="h-5 w-5 animate-spin" />
                                                                <span>Booking Tickets...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Zap className="h-5 w-5" />
                                                                <span>Book {ticketQuantity} Ticket{ticketQuantity > 1 ? 's' : ''}</span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}

                                                {paymentStep === 'pay' && (
                                                    <button
                                                        onClick={handlePayment}
                                                        disabled={bookingState.isPaying}
                                                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-4 rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg shadow-lg"
                                                    >
                                                        {bookingState.isPaying ? (
                                                            <>
                                                                <Loader className="h-5 w-5 animate-spin" />
                                                                <span>Processing Payment...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CreditCard className="h-5 w-5" />
                                                                <span>Pay ₹{(parseFloat(totalPrice) * 1.02).toFixed(2)}</span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}

                                                {/* Security Note */}
                                                <p className="text-xs text-[#49747F] text-center mt-4 flex items-center justify-center space-x-1">
                                                    <Lock className="h-3 w-3" />
                                                    <span>Secure payment powered by Razorpay</span>
                                                </p>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailPage;