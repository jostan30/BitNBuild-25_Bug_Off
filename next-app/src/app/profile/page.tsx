'use client';
import React, { useState, useEffect } from 'react';
import {
    User, Settings, Ticket, Calendar, MapPin, Crown, Star,
    Edit3, Camera, Mail, Phone, Wallet, Shield, ArrowRight,
    Bell, Heart, Download, Share2, Lock, LogOut, Eye,
    CreditCard, Gift, HelpCircle, FileText, Globe, X,
    Clock, Receipt, ExternalLink, QrCode, Banknote, AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ticketApi, authApi, api, TicketWithDetails, User as UserType } from '@/lib/api';


type CurrentUser = {
  email: string;
  id: string;
  lastLogin: string;
  role: 'user' | 'organizer' | 'admin';
  username: string;
}


const ProfilePage = () => {
    const router = useRouter();
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [recentTickets, setRecentTickets] = useState<TicketWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<TicketWithDetails | null>(null);
    const [profileData, setProfileData] = useState({
        username: ''
    });

    // Load user and tickets on component mount
    useEffect(() => {
        const loadUserData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get current user from API
                const currentUser = api.getCurrentUser();
                if (!currentUser) {
                    router.push('/login');
                    return;
                }

                // Verify token and get fresh user data
                const tokenResponse = await authApi.verifyToken();
                const freshUser = tokenResponse.user;
                
                // Map backend user fields to frontend expectations
                const mappedUser: CurrentUser = {
                    id: freshUser._id || freshUser._id,
                    username: freshUser.username,
                    email: freshUser.email,
                    role: freshUser.role,
                    lastLogin:freshUser.lastLogin ?? ""
                };
                
                setUser(mappedUser);
                setProfileData({
                    username: mappedUser.username,
                });

                // Fetch user's recent tickets
                try {
                    const response = await ticketApi.getUserTickets({ limit: 3 });
                    setRecentTickets(response.tickets || []);
                } catch (ticketError) {
                    console.warn('Could not fetch tickets:', ticketError);
                    // Don't set error for tickets - they might not exist yet
                    setRecentTickets([]);
                }

            } catch (err) {
                console.error('Error loading user data:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to load profile data';
                setError(errorMessage);
                
                // If token is invalid, redirect to login
                if (errorMessage.includes('token') || errorMessage.includes('401') || errorMessage.includes('Invalid')) {
                    authApi.logout();
                    router.push('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, [router]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800 border-green-200';
            case 'Minted': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Used': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'Expired': return 'bg-red-100 text-red-800 border-red-200';
            case 'Returned': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'text-green-600';
            case 'Pending': return 'text-yellow-600';
            case 'Failed': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const handleProfileUpdate = async () => {
        try {
            setLoading(true);
            setError(null);

            // Validate required fields
            if (!profileData.username.trim()) {
                throw new Error('Username is required');
            }

            const updatedUserResponse = await authApi.updateProfile(profileData);
            
            // Map the response to match frontend expectations
            const updatedUser: CurrentUser = {
                ...user!,
                username: updatedUserResponse.user.username || profileData.username,
                email: updatedUserResponse.user.email || user!.email,
                role: updatedUserResponse.user.role || user!.role,

            };
            
            setUser(updatedUser);
            api.setCurrentUser(updatedUser); // Update the API client's user as well
            setIsEditingProfile(false);
            
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await authApi.logout();
            router.push('/login');
        } catch (err) {
            console.error('Logout error:', err);
            // Even if logout fails on server, clear local auth and redirect
            router.push('/login');
        }
    };

    const handleTicketClick = (ticket: TicketWithDetails) => {
        setSelectedTicket(ticket);
    };

    const handleReturnTicket = async (ticket: TicketWithDetails) => {
        if (!ticket.qrHash) {
            setError('Cannot return ticket: QR hash not found');
            return;
        }

        try {
            const confirmed = window.confirm('Are you sure you want to return this ticket? This action cannot be undone.');
            if (!confirmed) return;

            setLoading(true);
            setError(null);
            
            await ticketApi.returnTicket(ticket.qrHash);
            
            // Refresh tickets list
            const response = await ticketApi.getUserTickets({ limit: 3 });
            setRecentTickets(response.tickets || []);
            
            // Update selected ticket if it's the one being returned
            if (selectedTicket?._id === ticket._id) {
                setSelectedTicket({ ...ticket, status: 'Returned' });
            }

        } catch (err) {
            console.error('Error returning ticket:', err);
            setError(err instanceof Error ? err.message : 'Failed to return ticket');
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setSelectedTicket(null);
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Invalid date';
        }
    };

    const navigateToAllTickets = () => {
        router.push('/profile/tickets');
    };

    const navigateToEvents = () => {
        router.push('/events');
    };

    const navigateToHelp = () => {
        router.push('/help');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4FFEE] to-[#CDBBB9]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E34B26]"></div>
            </div>
        );
    }

    if (error && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4FFEE] to-[#CDBBB9]">
                <div className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6 max-w-md text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-[#003447] mb-2">Error Loading Profile</h2>
                    <p className="text-[#49747F] mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="bg-[#E34B26] text-white px-6 py-2 rounded-full hover:bg-[#49747F] transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F4FFEE] via-[#CDBBB9] to-[#49747F] py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Error Display */}
                {error && (
                    <div className="bg-red-100/50 backdrop-blur-md rounded-xl border border-red-200/30 p-4 mb-6">
                        <div className="flex items-center space-x-2 text-red-800">
                            <AlertCircle className="h-5 w-5" />
                            <span>{error}</span>
                            <button
                                onClick={() => setError(null)}
                                className="ml-auto hover:text-red-900"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="w-20 h-20 bg-gradient-to-br from-[#E34B26] to-[#49747F] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <button className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-lg hover:scale-105 transition-transform">
                                    <Camera className="h-4 w-4 text-[#003447]" />
                                </button>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[#003447]">{user.username}</h1>
                                <p className="text-[#49747F]">{user.email}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                    <span className="bg-[#E34B26] text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
                                        {user.role}
                                    </span>
                                  
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveTab(activeTab === 'overview' ? 'settings' : 'overview')}
                            className="p-3 bg-white/50 rounded-full hover:bg-white/70 transition-colors"
                        >
                            {activeTab === 'overview' ? <Settings className="h-5 w-5 text-[#003447]" /> : <User className="h-5 w-5 text-[#003447]" />}
                        </button>
                    </div>
                </div>

                {activeTab === 'overview' ? (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-[#E34B26]/20 rounded-full">
                                        <Ticket className="h-6 w-6 text-[#E34B26]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-[#49747F]">Total Tickets</p>
                                        <p className="text-2xl font-bold text-[#003447]">{recentTickets.length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-[#49747F]/20 rounded-full">
                                        <Calendar className="h-6 w-6 text-[#49747F]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-[#49747F]">Events Attended</p>
                                        <p className="text-2xl font-bold text-[#003447]">{recentTickets.filter(t => t.status === 'Used').length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-[#003447]/20 rounded-full">
                                        <Star className="h-6 w-6 text-[#003447]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-[#49747F]">Member Since</p>
                                      
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Tickets */}
                        <div className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6 mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-[#003447]">Recent Tickets</h2>
                                <button
                                    onClick={navigateToAllTickets}
                                    className="flex items-center space-x-2 text-[#E34B26] hover:text-[#49747F] transition-colors"
                                >
                                    <span>View All</span>
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                            
                            {recentTickets.length > 0 ? (
                                <div className="space-y-4">
                                    {recentTickets.map((ticket) => (
                                        <div 
                                            key={ticket._id} 
                                            className="bg-white/40 rounded-xl p-4 border border-white/30 cursor-pointer hover:bg-white/50 transition-colors"
                                            onClick={() => handleTicketClick(ticket)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <img
                                                        src={ticket.ticketClassId.eventId.image || '/api/placeholder/64/64'}
                                                        alt={ticket.ticketClassId.eventId.name}
                                                        className="w-16 h-16 rounded-lg object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/api/placeholder/64/64';
                                                        }}
                                                    />
                                                    <div>
                                                        <h3 className="font-semibold text-[#003447]">{ticket.ticketClassId.eventId.name}</h3>
                                                        <p className="text-sm text-[#49747F] flex items-center space-x-2">
                                                            <MapPin className="h-3 w-3" />
                                                            <span>{ticket.ticketClassId.eventId.location}</span>
                                                        </p>
                                                        <p className="text-sm text-[#49747F]">
                                                            {formatDate(ticket.ticketClassId.eventId.startTime)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                                                        {ticket.status}
                                                    </span>
                                                    <p className={`text-sm font-medium mt-1 ${getPaymentStatusColor(ticket.paymentStatus)}`}>
                                                        {ticket.paymentStatus}
                                                    </p>
                                                    <p className="text-sm text-[#003447] font-semibold">
                                                        {ticket.ticketClassId.type}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Ticket className="h-16 w-16 text-[#49747F] mx-auto mb-4 opacity-50" />
                                    <p className="text-[#49747F]">No tickets found</p>
                                    <button
                                        onClick={navigateToEvents}
                                        className="mt-4 bg-[#E34B26] text-white px-6 py-2 rounded-full hover:bg-[#49747F] transition-colors"
                                    >
                                        Explore Events
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
                            <h2 className="text-xl font-bold text-[#003447] mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <button 
                                    onClick={navigateToAllTickets}
                                    className="flex flex-col items-center space-y-3 p-4 bg-white/40 rounded-xl hover:bg-white/50 transition-colors group"
                                >
                                    <div className="p-3 bg-[#E34B26]/20 rounded-full group-hover:scale-110 transition-transform">
                                        <Ticket className="h-6 w-6 text-[#E34B26]" />
                                    </div>
                                    <span className="text-sm font-medium text-[#003447]">My Tickets</span>
                                </button>
                                
                                <button 
                                    onClick={navigateToEvents}
                                    className="flex flex-col items-center space-y-3 p-4 bg-white/40 rounded-xl hover:bg-white/50 transition-colors group"
                                >
                                    <div className="p-3 bg-[#49747F]/20 rounded-full group-hover:scale-110 transition-transform">
                                        <Calendar className="h-6 w-6 text-[#49747F]" />
                                    </div>
                                    <span className="text-sm font-medium text-[#003447]">Browse Events</span>
                                </button>
                                
                                <button 
                                    onClick={() => setActiveTab('settings')}
                                    className="flex flex-col items-center space-y-3 p-4 bg-white/40 rounded-xl hover:bg-white/50 transition-colors group"
                                >
                                    <div className="p-3 bg-[#003447]/20 rounded-full group-hover:scale-110 transition-transform">
                                        <Settings className="h-6 w-6 text-[#003447]" />
                                    </div>
                                    <span className="text-sm font-medium text-[#003447]">Settings</span>
                                </button>
                                
                                <button 
                                    onClick={navigateToHelp}
                                    className="flex flex-col items-center space-y-3 p-4 bg-white/40 rounded-xl hover:bg-white/50 transition-colors group"
                                >
                                    <div className="p-3 bg-purple-500/20 rounded-full group-hover:scale-110 transition-transform">
                                        <HelpCircle className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <span className="text-sm font-medium text-[#003447]">Help</span>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Settings Tab */
                    <div className="space-y-6">
                        {/* Profile Settings */}
                        <div className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-[#003447]">Profile Information</h2>
                                <button
                                    onClick={() => {
                                        if (isEditingProfile) {
                                            // Reset profile data when canceling
                                            setProfileData({
                                                username: user.username,
                                            });
                                            setError(null);
                                        }
                                        setIsEditingProfile(!isEditingProfile);
                                    }}
                                    className="flex items-center space-x-2 px-4 py-2 bg-[#E34B26] text-white rounded-lg hover:bg-[#49747F] transition-colors"
                                    disabled={loading}
                                >
                                    <Edit3 className="h-4 w-4" />
                                    <span>{isEditingProfile ? 'Cancel' : 'Edit'}</span>
                                </button>
                            </div>
                            
                            {isEditingProfile ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#003447] mb-2">Username *</label>
                                        <input
                                            type="text"
                                            value={profileData.username}
                                            onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                                            className="w-full px-4 py-3 bg-white/50 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#E34B26]/20"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#003447] mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={user.email}
                                            className="w-full px-4 py-3 bg-white/30 rounded-lg border border-white/30 text-[#49747F]"
                                            disabled
                                        />
                                        <p className="text-xs text-[#49747F] mt-1">Email cannot be changed</p>
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={handleProfileUpdate}
                                            disabled={loading || !profileData.username.trim()}
                                            className="px-6 py-2 bg-[#E34B26] text-white rounded-lg hover:bg-[#49747F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setProfileData({
                                                    username: user.username,
                                                });
                                                setIsEditingProfile(false);
                                                setError(null);
                                            }}
                                            disabled={loading}
                                            className="px-6 py-2 bg-white/50 text-[#003447] rounded-lg hover:bg-white/70 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <User className="h-5 w-5 text-[#49747F]" />
                                        <div>
                                            <p className="text-sm text-[#49747F]">Username</p>
                                            <p className="font-medium text-[#003447] capitalize">{user.role}</p>
                                        </div>
                                    </div>
                                  
                                
                                </div>
                            )}
                        </div>

                        {/* Security Settings */}
                        <div className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
                            <h2 className="text-xl font-bold text-[#003447] mb-6">Security & Privacy</h2>
                            <div className="space-y-4">
                                <button className="w-full flex items-center justify-between p-4 bg-white/40 rounded-xl hover:bg-white/50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <Lock className="h-5 w-5 text-[#49747F]" />
                                        <div className="text-left">
                                            <p className="font-medium text-[#003447]">Change Password</p>
                                            <p className="text-sm text-[#49747F]">Update your account password</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-[#49747F]" />
                                </button>
                            </div>
                        </div>

                        {/* Account Preferences */}
                        <div className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
                            <h2 className="text-xl font-bold text-[#003447] mb-6">Preferences</h2>
                            <div className="space-y-4">
                                <button className="w-full flex items-center justify-between p-4 bg-white/40 rounded-xl hover:bg-white/50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <Globe className="h-5 w-5 text-[#49747F]" />
                                        <div className="text-left">
                                            <p className="font-medium text-[#003447]">Language & Region</p>
                                            <p className="text-sm text-[#49747F]">Change display language and region</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-[#49747F]" />
                                </button>
                                
                                <button className="w-full flex items-center justify-between p-4 bg-white/40 rounded-xl hover:bg-white/50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <Wallet className="h-5 w-5 text-[#49747F]" />
                                        <div className="text-left">
                                            <p className="font-medium text-[#003447]">Wallet Settings</p>
                                            <p className="text-sm text-[#49747F]">Manage your blockchain wallet</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-[#49747F]" />
                                </button>
                                
                                <button className="w-full flex items-center justify-between p-4 bg-white/40 rounded-xl hover:bg-white/50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <CreditCard className="h-5 w-5 text-[#49747F]" />
                                        <div className="text-left">
                                            <p className="font-medium text-[#003447]">Payment Methods</p>
                                            <p className="text-sm text-[#49747F]">Manage saved payment methods</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-[#49747F]" />
                                </button>
                            </div>
                        </div>

                        {/* Support & Help */}
                        <div className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
                            <h2 className="text-xl font-bold text-[#003447] mb-6">Support</h2>
                            <div className="space-y-4">
                                <button 
                                    onClick={navigateToHelp}
                                    className="w-full flex items-center justify-between p-4 bg-white/40 rounded-xl hover:bg-white/50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <HelpCircle className="h-5 w-5 text-[#49747F]" />
                                        <div className="text-left">
                                            <p className="font-medium text-[#003447]">Help Center</p>
                                            <p className="text-sm text-[#49747F]">Get help and support</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-[#49747F]" />
                                </button>
                                
                                <button className="w-full flex items-center justify-between p-4 bg-white/40 rounded-xl hover:bg-white/50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <FileText className="h-5 w-5 text-[#49747F]" />
                                        <div className="text-left">
                                            <p className="font-medium text-[#003447]">Terms & Privacy</p>
                                            <p className="text-sm text-[#49747F]">Review our terms and privacy policy</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-[#49747F]" />
                                </button>
                                
                                <button className="w-full flex items-center justify-between p-4 bg-white/40 rounded-xl hover:bg-white/50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <Share2 className="h-5 w-5 text-[#49747F]" />
                                        <div className="text-left">
                                            <p className="font-medium text-[#003447]">Share App</p>
                                            <p className="text-sm text-[#49747F]">Tell your friends about us</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-[#49747F]" />
                                </button>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-red-50/30 backdrop-blur-md rounded-2xl border border-red-200/30 shadow-lg p-6">
                            <h2 className="text-xl font-bold text-red-700 mb-6">Danger Zone</h2>
                            <div className="space-y-4">
                                <button className="w-full flex items-center justify-between p-4 bg-red-100/40 rounded-xl hover:bg-red-100/60 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <Download className="h-5 w-5 text-red-600" />
                                        <div className="text-left">
                                            <p className="font-medium text-red-700">Export Data</p>
                                            <p className="text-sm text-red-600">Download your account data</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-red-600" />
                                </button>
                                
                                <button className="w-full flex items-center justify-between p-4 bg-red-100/40 rounded-xl hover:bg-red-100/60 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                        <div className="text-left">
                                            <p className="font-medium text-red-700">Delete Account</p>
                                            <p className="text-sm text-red-600">Permanently delete your account</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-red-600" />
                                </button>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <div className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center space-x-3 p-4 bg-[#49747F] text-white rounded-xl hover:bg-[#003447] transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="font-medium">Sign Out</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Ticket Detail Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/30 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-[#003447]">Ticket Details</h3>
                                <button
                                    onClick={closeModal}
                                    className="p-2 bg-white/50 rounded-full hover:bg-white/70 transition-colors"
                                >
                                    <X className="h-5 w-5 text-[#003447]" />
                                </button>
                            </div>

                            {/* Event Image */}
                            <div className="relative mb-6">
                                <img
                                    src={selectedTicket.ticketClassId.eventId.image || '/api/placeholder/400/200'}
                                    alt={selectedTicket.ticketClassId.eventId.name}
                                    className="w-full h-40 object-cover rounded-xl"
                                    onError={(e) => {
                                        e.currentTarget.src = '/api/placeholder/400/200';
                                    }}
                                />
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedTicket.status)}`}>
                                        {selectedTicket.status}
                                    </span>
                                </div>
                            </div>

                            {/* Event Details */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-bold text-[#003447] text-lg">{selectedTicket.ticketClassId.eventId.name}</h4>
                                    <p className="text-[#49747F] flex items-center space-x-2 mt-1">
                                        <MapPin className="h-4 w-4" />
                                        <span>{selectedTicket.ticketClassId.eventId.location}</span>
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-[#49747F]">Start Time</p>
                                        <p className="font-medium text-[#003447] flex items-center space-x-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{formatDate(selectedTicket.ticketClassId.eventId.startTime)}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-[#49747F]">Ticket Type</p>
                                        <p className="font-medium text-[#003447]">{selectedTicket.ticketClassId.type}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-[#49747F]">Payment Status</p>
                                        <p className={`font-medium ${getPaymentStatusColor(selectedTicket.paymentStatus)}`}>
                                            {selectedTicket.paymentStatus}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-[#49747F]">Purchased</p>
                                        <p className="font-medium text-[#003447]">
                                            {formatDate(selectedTicket.purchaseSlot)}
                                        </p>
                                    </div>
                                </div>

                                {selectedTicket.qrHash && (
                                    <div className="bg-white/50 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm text-[#49747F]">QR Code</p>
                                            <QrCode className="h-4 w-4 text-[#49747F]" />
                                        </div>
                                        <p className="font-mono text-xs text-[#003447] break-all">
                                            {selectedTicket.qrHash}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3 mt-6">
                                {selectedTicket.status === 'Active' && selectedTicket.paymentStatus === 'Completed' && (
                                    <button
                                        onClick={() => handleReturnTicket(selectedTicket)}
                                        className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <Receipt className="h-4 w-4" />
                                        <span>Return Ticket</span>
                                    </button>
                                )}
                                
                                <button
                                    onClick={() => window.open(`/events/${selectedTicket.ticketClassId.eventId._id}`, '_blank')}
                                    className="flex-1 bg-[#E34B26] text-white py-2 px-4 rounded-lg hover:bg-[#49747F] transition-colors flex items-center justify-center space-x-2"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    <span>View Event</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;