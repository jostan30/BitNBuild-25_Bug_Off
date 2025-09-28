'use client';
import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Calendar, MapPin, CheckCircle, XCircle,
    AlertCircle, Loader, Ticket as TicketIcon, QrCode,
    Download, Share2, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Ticket, Event } from '@/lib/api';

interface TicketWithEvent extends Ticket {
    event?: Event;
    ticketClass?: {
        type: string;
        price: number;
    };
}

type FilterKey = 'all' | 'active' | 'used' | 'expired';

const MyTicketsPage: React.FC = () => {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth('user'); // ✅ no generic
    const currentUser = user as { _id: string } | null;     // ✅ type assertion

    const [tickets, setTickets] = useState<TicketWithEvent[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<TicketWithEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filters: { key: FilterKey; label: string; count: number }[] = [
        { key: 'all', label: 'All', count: tickets.length },
        { key: 'active', label: 'Active', count: tickets.filter(t => t.status === 'Active').length },
        { key: 'used', label: 'Used', count: tickets.filter(t => t.status === 'Used').length },
        { key: 'expired', label: 'Expired', count: tickets.filter(t => t.status === 'Expired').length }
    ];

    // Mock data
    const mockTickets: TicketWithEvent[] = [
        {
            _id: '1',
            ticketClassId: '1',
            buyerId: currentUser?._id || '',
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
                startTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
            buyerId: currentUser?._id || '',
            status: 'Used',
            paymentStatus: 'Completed',
            purchaseSlot: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            qrHash: 'QR987654321',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            event: {
                _id: '2',
                name: 'Tech Summit 2024',
                organiserId: 'org2',
                description: 'Technology conference',
                location: 'San Francisco, CA',
                startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
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
        setTimeout(() => {
            setTickets(mockTickets);
            setLoading(false);
        }, 1000);
    }, [currentUser]);

    // Filter tickets
    useEffect(() => {
        let filtered = tickets;

        if (activeFilter !== 'all') {
            filtered = filtered.filter(t => t.status.toLowerCase() === activeFilter);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.event?.name.toLowerCase().includes(query) ||
                t.event?.location?.toLowerCase().includes(query) ||
                t.ticketClass?.type.toLowerCase().includes(query)
            );
        }

        setFilteredTickets(filtered);
    }, [tickets, activeFilter, searchQuery]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Active': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'Used': return <CheckCircle className="h-5 w-5 text-blue-500" />;
            case 'Expired': return <XCircle className="h-5 w-5 text-red-500" />;
            default: return <AlertCircle className="h-5 w-5 text-yellow-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'text-green-600 bg-green-100/50 border-green-200/50';
            case 'Used': return 'text-blue-600 bg-blue-100/50 border-blue-200/50';
            case 'Expired': return 'text-red-600 bg-red-100/50 border-red-200/50';
            default: return 'text-yellow-600 bg-yellow-100/50 border-yellow-200/50';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        };
    };

    const downloadTicket = (ticket: TicketWithEvent) => {
        const data = { eventName: ticket.event?.name, ticketId: ticket._id, qrHash: ticket.qrHash };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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
            navigator.clipboard.writeText(`${window.location.origin}/ticket/${ticket._id}`);
            alert('Ticket link copied to clipboard!');
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <Loader className="h-8 w-8 animate-spin text-gray-600" />
                <p className="text-gray-700 ml-2">Loading your tickets...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 max-w-7xl mx-auto">
            {/* Filters */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="px-4 py-2 rounded-full border focus:outline-none focus:ring w-full md:max-w-sm"
                />
                <div className="flex gap-2">
                    {filters.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setActiveFilter(f.key)}
                            className={cn(
                                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                                activeFilter === f.key
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700'
                            )}
                        >
                            {f.label} ({f.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* Tickets */}
            {filteredTickets.length === 0 ? (
                <div className="text-center py-12">
                    <TicketIcon className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                    <p className="text-gray-700">No tickets found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTickets.map(ticket => (
                        <div key={ticket._id} className="bg-white p-4 rounded-xl shadow-md">
                            <h3 className="font-bold text-lg">{ticket.event?.name}</h3>
                            <p>Ticket ID: {ticket._id.slice(-8)}</p>
                            <p>Status: {ticket.status}</p>
                            <p>Amount: ₹{ticket.ticketClass?.price}</p>
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => downloadTicket(ticket)}
                                    className="flex-1 bg-blue-500 text-white px-2 py-1 rounded"
                                >
                                    Download
                                </button>
                                <button
                                    onClick={() => shareTicket(ticket)}
                                    className="flex-1 bg-gray-200 px-2 py-1 rounded"
                                >
                                    Share
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTicketsPage;
