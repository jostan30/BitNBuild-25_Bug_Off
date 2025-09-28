'use client'
import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Calendar, MapPin, Clock, Star, QrCode, Download, 
    Share2, MoreVertical, CheckCircle, AlertCircle, XCircle,
    Loader, Ticket as TicketIcon, Search, Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ticketApi, Ticket, Event } from '@/lib/api';

interface TicketWithEvent extends Ticket {
    event?: Event;
    ticketClass?: {
        type: string;
        price: number;
    };
}

const MyTicketsPage: React.FC = () => {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth('user');
    const [tickets, setTickets] = useState<TicketWithEvent[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<TicketWithEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'used' | 'expired'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Mock data - replace with actual API call
    const mockTickets: TicketWithEvent[] = [
        {
            _id: '1',
            ticketClassId: '1',
            buyerId: user?._id || '',
            status: 'Active',
            paymentStatus: 'Completed',
            purchaseSlot: new Date().toISOString(),
            qrHash: 'QR123456789',
            createdAt: new Date().toISOString(),
            event: {
                _id: '1',
                name: 'Cosmic Dreams Festival',
                organiserId: 'org1',
                description: 'Amazing music festival',
                location: 'Los Angeles, CA',
                startTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
                endTime: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
                ticketExpiryHours: 4,
                category: 'Music',
                image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
                ticketClasses: [],
                createdAt: new Date().toISOString()
            },
            ticketClass: {
                type: 'VIP',
                price: 5000
            }
        },
        {
            _id: '2',
            ticketClassId: '2',
            buyerId: user?._id || '',
            status: 'Used',
            paymentStatus: 'Completed',
            purchaseSlot: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
            qrHash: 'QR987654321',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            event: {
                _id: '2',
                name: 'Tech Summit 2024',
                organiserId: 'org2',
                description: 'Technology conference',
                location: 'San Francisco, CA',
                startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
                endTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                ticketExpiryHours: 8,
                category: 'Conference',
                image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=300&fit=crop',
                ticketClasses: [],
                createdAt: new Date().toISOString()
            },
            ticketClass: {
                type: 'Standard',
                price: 2500
            }
        }
    ];

    useEffect(() => {
        // In a real app, you would fetch from API
        // const fetchTickets = async () => {
        //     try {
        //         setLoading(true);
        //         const response = await ticketApi.getMyTickets();
        //         setTickets(response.tickets);
        //     } catch (err) {
        //         setError('Failed to load tickets');
        //     } finally {
        //         setLoading(false);
        //     }
        // };
        // fetchTickets();

        // Using mock data
        setTimeout(() => {
            setTickets(mockTickets);
            setLoading(false);
        }, 1000);
    }, [user]);

    // Filter tickets based on status and search
    useEffect(() => {
        let filtered = tickets;

        // Filter by status
        if (activeFilter !== 'all') {
            filtered = filtered.filter(ticket => {
                switch (activeFilter) {
                    case 'active':
                        return ticket.status === 'Active';
                    case 'used':
                        return ticket.status === 'Used';
                    case 'expired':
                        return ticket.status === 'Expired';
                    default:
                        return true;
                }
            });
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(ticket =>
                ticket.event?.name.toLowerCase().includes(query) ||
                ticket.event?.location?.toLowerCase().includes(query) ||
                ticket.ticketClass?.type.toLowerCase().includes(query)
            );
        }

        setFilteredTickets(filtered);
    }, [tickets, activeFilter, searchQuery]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Active':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'Used':
                return <CheckCircle className="h-5 w-5 text-blue-500" />;
            case 'Expired':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return 'text-green-600 bg-green-100/50 border-green-200/50';
            case 'Used':
                return 'text-blue-600 bg-blue-100/50 border-blue-200/50';
            case 'Expired':
                return 'text-red-600 bg-red-100/50 border-red-200/50';
            default:
                return 'text-yellow-600 bg-yellow-100/50 border-yellow-200/50';
        }
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

    const downloadTicket = (ticket: TicketWithEvent) => {
        // Generate a simple ticket file
        const ticketData = {
            eventName: ticket.event?.name,
            ticketId: ticket._id,
            qrHash: ticket.qrHash,
            type: ticket.ticketClass?.type,
            eventDate: ticket.event?.startTime,
            location: ticket.event?.location
        };
        
        const blob = new Blob([JSON.stringify(ticketData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-${ticket._id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const shareTicket = (ticket: TicketWithEvent) => {
        if (navigator.share) {
            navigator.share({
                title: `${ticket.event?.name} - Ticket`,
                text: `Check out my ticket for ${ticket.event?.name}!`,
                url: window.location.origin + `/ticket/${ticket._id}`
            });
        } else {
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(`${window.location.origin}/ticket/${ticket._id}`);
            alert('Ticket link copied to clipboard!');
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{
                background: "linear-gradient(120deg, #F4FFEE 0%, #CDBBB9 30%, #49747F 70%, #003447 100%)"
            }}>
                <div className="text-center">
                    <Loader className="h-8 w-8 animate-spin text-[#003447] mx-auto mb-4" />
                    <p className="text-[#003447] font-medium">Loading your tickets...</p>
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
            {/* Abstract SVG background */}
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
                                        <path d="M19 4 L33 19 L19 34 L5 19 Z" stroke="#003447" strokeWidth="4" fill="none" />
                                        <path d="M19 11 L28 19 L19 28 L10 19 Z" stroke="#E34B26" strokeWidth="4" fill="none" />
                                    </svg>
                                </span>
                                <div>
                                    <span className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#E34B26] via-[#49747F] to-[#003447] tracking-wide">Spectrate</span>
                                    <p className="text-sm text-[#441111]">My Tickets</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={() => router.push('/events')}
                                className="bg-gradient-to-r from-[#E34B26] via-[#49747F] to-[#003447] text-white px-4 py-2 rounded-full font-semibold hover:scale-105 transition-all shadow-lg text-sm"
                            >
                                Browse Events
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="relative z-10 max-w-7xl mx-auto px-4 pb-8">
                {/* Search and Filters */}
                <div className="mb-8">
                    <div className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#49747F]" />
                                <input
                                    type="text"
                                    placeholder="Search tickets..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/30 rounded-full text-[#003447] placeholder-[#49747F]/70 outline-none focus:border-[#E34B26] transition-colors"
                                />
                            </div>
                            
                            {/* Status Filters */}
                            <div className="flex items-center space-x-2">
                                {[
                                    { key: 'all', label: 'All', count: tickets.length },
                                    { key: 'active', label: 'Active', count: tickets.filter(t => t.status === 'Active').length },
                                    { key: 'used', label: 'Used', count: tickets.filter(t => t.status === 'Used').length },
                                    { key: 'expired', label: 'Expired', count: tickets.filter(t => t.status === 'Expired').length }
                                ].map((filter) => (
                                    <button
                                        key={filter.key}
                                        onClick={() => setActiveFilter(filter.key as any)}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-sm font-medium transition-all",
                                            activeFilter === filter.key
                                                ? "bg-gradient-to-r from-[#E34B26] to-[#49747F] text-white shadow-lg"
                                                : "bg-white/50 text-[#003447] hover:bg-white/70"
                                        )}
                                    >
                                        {filter.label} ({filter.count})
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tickets Grid */}
                {filteredTickets.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-white/30 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-lg max-w-md mx-auto">
                            <TicketIcon className="h-12 w-12 text-[#49747F] mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-[#003447] mb-2">No Tickets Found</h3>
                            <p className="text-[#441111] mb-4">
                                {searchQuery ? `No tickets match "${searchQuery}"` : `No ${activeFilter} tickets available`}
                            </p>
                            <button 
                                onClick={() => router.push('/events')}
                                className="bg-gradient-to-r from-[#E34B26] to-[#49747F] text-white px-6 py-2 rounded-full font-semibold hover:scale-105 transition-all"
                            >
                                Browse Events
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredTickets.map((ticket) => {
                            const eventDate = ticket.event ? formatDate(ticket.event.startTime) : null;
                            
                            return (
                                <div
                                    key={ticket._id}
                                    className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                                >
                                    {/* Ticket Header */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={ticket.event?.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'}
                                            alt={ticket.event?.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                        
                                        {/* Status Badge */}
                                        <div className="absolute top-4 left-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm flex items-center space-x-1",
                                                getStatusColor(ticket.status)
                                            )}>
                                                {getStatusIcon(ticket.status)}
                                                <span>{ticket.status}</span>
                                            </span>
                                        </div>

                                        {/* Ticket Type Badge */}
                                        <div className="absolute top-4 right-4">
                                            <span className="bg-gradient-to-r from-[#E34B26] to-[#49747F] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                {ticket.ticketClass?.type}
                                            </span>
                                        </div>

                                        {/* QR Code Icon */}
                                        {ticket.status === 'Active' && (
                                            <div className="absolute bottom-4 right-4">
                                                <div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg">
                                                    <QrCode className="h-6 w-6 text-[#003447]" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Ticket Content */}
                                    <div className="p-6">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-bold text-[#003447] mb-1 line-clamp-1">
                                                {ticket.event?.name}
                                            </h3>
                                            <p className="text-sm text-[#441111]">
                                                Ticket ID: {ticket._id.slice(-8).toUpperCase()}
                                            </p>
                                        </div>

                                        {eventDate && (
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center text-sm text-[#49747F]">
                                                    <Calendar className="h-4 w-4 mr-2 text-[#E34B26]" />
                                                    <span>{eventDate.date} • {eventDate.time}</span>
                                                </div>
                                                
                                                {ticket.event?.location && (
                                                    <div className="flex items-center text-sm text-[#49747F]">
                                                        <MapPin className="h-4 w-4 mr-2 text-[#E34B26]" />
                                                        <span className="line-clamp-1">{ticket.event.location}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Price */}
                                        <div className="mb-4 p-3 bg-white/40 backdrop-blur-sm rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-[#441111]">Amount Paid</span>
                                                <span className="text-lg font-bold text-[#E34B26]">
                                                    ₹{ticket.ticketClass?.price}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex space-x-2">
                                            {ticket.status === 'Active' && (
                                                <>
                                                    <button
                                                        onClick={() => downloadTicket(ticket)}
                                                        className="flex-1 bg-gradient-to-r from-[#E34B26] to-[#49747F] text-white px-4 py-2 rounded-full font-semibold hover:scale-105 transition-all text-sm flex items-center justify-center space-x-1"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                        <span>Download</span>
                                                    </button>
                                                    <button
                                                        onClick={() => shareTicket(ticket)}
                                                        className="px-4 py-2 bg-white/50 border border-white/30 rounded-full hover:bg-white/70 transition-all flex items-center justify-center"
                                                    >
                                                        <Share2 className="h-4 w-4 text-[#003447]" />
                                                    </button>
                                                </>
                                            )}
                                            
                                            {ticket.status === 'Used' && (
                                                <button
                                                    disabled
                                                    className="flex-1 bg-gray-300 text-gray-500 px-4 py-2 rounded-full font-semibold text-sm cursor-not-allowed"
                                                >
                                                    Event Completed
                                                </button>
                                            )}
                                            
                                            {ticket.status === 'Expired' && (
                                                <button
                                                    disabled
                                                    className="flex-1 bg-red-200 text-red-600 px-4 py-2 rounded-full font-semibold text-sm cursor-not-allowed"
                                                >
                                                    Expired
                                                </button>
                                            )}
                                        </div>

                                        {/* Additional Info */}
                                        <div className="mt-4 pt-4 border-t border-white/20">
                                            <div className="flex items-center justify-between text-xs text-[#49747F]">
                                                <span>Purchased: {formatDate(ticket.createdAt).date}</span>
                                                {ticket.qrHash && (
                                                    <span>QR: {ticket.qrHash.slice(-6)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="relative z-10 px-4 py-12">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-lg">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="flex items-center gap-3 mb-4 md:mb-0">
                                <span className="rounded-lg bg-white shadow-lg p-2 flex items-center justify-center">
                                    <svg width="32" height="32" viewBox="0 0 38 38" fill="none">
                                        <path d="M19 4 L33 19 L19 34 L5 19 Z" stroke="#003447" strokeWidth="4" fill="none" />
                                        <path d="M19 11 L28 19 L19 28 L10 19 Z" stroke="#E34B26" strokeWidth="4" fill="none" />
                                    </svg>
                                </span>
                                <span className="text-xl font-bold text-[#003447]">Spectrate</span>
                            </div>
                            <div className="text-center md:text-right">
                                <p className="text-[#441111] mb-2 font-medium">Your Event Tickets</p>
                                <p className="text-sm text-[#49747F]">© 2024 Spectrate. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MyTicketsPage;