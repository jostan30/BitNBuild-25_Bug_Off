"use client";

import { useState } from "react";
import { FaRegCalendarAlt, FaCog, FaUser, FaSearch, FaPlus, FaMapMarkerAlt, FaUsers, FaClock, FaCheckCircle, FaTicketAlt, FaMusic, FaCalendarAlt, FaEye } from "react-icons/fa";
import Link from "next/link";

export default function OrganizerDashboard() {
  const [selectedEvent, setSelectedEvent] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  
  const events = [
    {
      id: "EVT001",
      name: "Startup Pitch Competition",
      date: "2024-07-01 06:00 PM",
      status: "Upcoming",
      priority: "HIGH",
      vip: 50,
      normal: 200,
      total: 250,
      vipSold: 35,
      normalSold: 120,
      totalSold: 155,
      location: "Mumbai Central, Ward A",
      supporters: 12,
      description: "Annual startup pitch competition featuring innovative ideas and cutting-edge technology solutions.",
      category: "Technology",
      progress: 71,
      rating: 4.9,
      artists: ["Tech Innovators", "Startup Founders", "Venture Capitalists"],
      attendees: 155,
      revenue: 125000,
      pastEvents: 3,
      eventType: "Conference",
      duration: "4 hours",
      capacity: 500
    },
    {
      id: "EVT002", 
      name: "Tech Innovators Summit 2024",
      date: "2024-08-15 09:00 AM",
      status: "Upcoming",
      priority: "MEDIUM",
      vip: 120,
      normal: 450,
      total: 570,
      vipSold: 85,
      normalSold: 320,
      totalSold: 405,
      location: "Delhi Convention Center",
      supporters: 25,
      description: "Comprehensive tech summit covering AI, blockchain, and emerging technologies.",
      category: "Technology",
      progress: 45,
      rating: 4.7,
      artists: ["AI Researchers", "Blockchain Experts", "Tech Leaders"],
      attendees: 405,
      revenue: 280000,
      pastEvents: 5,
      eventType: "Summit",
      duration: "2 days",
      capacity: 800
    },
    {
      id: "EVT003",
      name: "Digital Marketing Masterclass",
      date: "2024-09-05 09:30 AM",
      status: "Upcoming",
      priority: "LOW",
      vip: 70,
      normal: 180,
      total: 250,
      vipSold: 45,
      normalSold: 95,
      totalSold: 140,
      location: "Bangalore Tech Park",
      supporters: 18,
      description: "Advanced digital marketing strategies and tools for modern businesses.",
      category: "Marketing",
      progress: 23,
      rating: 4.5,
      artists: ["Marketing Gurus", "Social Media Experts", "Brand Strategists"],
      attendees: 140,
      revenue: 85000,
      pastEvents: 2,
      eventType: "Workshop",
      duration: "6 hours",
      capacity: 300
    },
    {
      id: "EVT004",
      name: "Future Mobility Expo",
      date: "2024-10-20 10:00 AM",
      status: "Upcoming",
      priority: "HIGH",
      vip: 90,
      normal: 320,
      total: 410,
      vipSold: 65,
      normalSold: 180,
      totalSold: 245,
      location: "Chennai Exhibition Center",
      supporters: 35,
      description: "Exhibition showcasing the future of transportation and mobility solutions.",
      category: "Innovation",
      progress: 58,
      rating: 4.8,
      artists: ["Auto Industry Leaders", "Tech Innovators", "Sustainability Experts"],
      attendees: 245,
      revenue: 195000,
      pastEvents: 4,
      eventType: "Exhibition",
      duration: "3 days",
      capacity: 600
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "HIGH": return "bg-red-500";
      case "MEDIUM": return "bg-orange-500"; 
      case "LOW": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Upcoming": return "bg-green-500";
      case "In Progress": return "bg-blue-500";
      case "Completed": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#F4EFEE] via-[#CDBBB9] to-[#49747F] relative overflow-hidden font-sans">
      {/* Abstract Background Shapes - Login Page Style */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#E34B26]/15 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#49747F]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-[#F4EFEE]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-[#CDBBB9]/25 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-56 h-56 bg-[#E34B26]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-[#49747F]/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex">
        {/* Left Sidebar - Login Page Style */}
        <aside className="w-20 bg-white/20 backdrop-blur-xl border-r border-white/30 flex flex-col items-center py-8 gap-8">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
            <div className="w-6 h-6 bg-gradient-to-r from-[#E34B26] to-[#49747F] rounded flex items-center justify-center">
              <FaCheckCircle className="text-white text-sm" />
            </div>
        </div>
          <FaRegCalendarAlt className="text-[#49747F] text-2xl hover:text-[#E34B26] transition-all hover:scale-110 cursor-pointer" />
          <FaSearch className="text-[#49747F] text-2xl hover:text-[#E34B26] transition-all hover:scale-110 cursor-pointer" />
          <FaCog className="text-[#49747F] text-2xl hover:text-[#E34B26] transition-all hover:scale-110 cursor-pointer" />
          <FaMapMarkerAlt className="text-[#49747F] text-2xl hover:text-[#E34B26] transition-all hover:scale-110 cursor-pointer" />
          <FaUser className="text-[#49747F] text-2xl hover:text-[#E34B26] transition-all hover:scale-110 cursor-pointer" />
          <div className="mt-auto w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-[#49747F] font-bold text-sm">N</span>
        </div>
      </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Left Content - Events List */}
          <div className="flex-1 bg-white/20 backdrop-blur-xl border-r border-white/30 m-4 rounded-2xl overflow-hidden shadow-lg">
            {/* Header */}
            <header className="bg-white/30 backdrop-blur-sm border-b border-white/30 px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                  <div className="w-6 h-6 bg-gradient-to-r from-[#E34B26] to-[#49747F] rounded flex items-center justify-center">
                    <FaCheckCircle className="text-white text-sm" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-[#49747F]">Spectrate Dashboard</h1>
              </div>
              <Link href="/createevent">
                <button className="bg-gradient-to-r from-[#E34B26] to-[#49747F] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <FaPlus className="text-sm" />
                  Create New Event
                </button>
              </Link>
            </header>

            {/* Search and Filters */}
            <div className="px-8 py-6 bg-white/20 backdrop-blur-sm">
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#49747F]" />
                  <input
                    type="text"
                    className="w-full bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg px-12 py-3 text-[#49747F] placeholder-[#49747F]/60 focus:outline-none focus:ring-2 focus:ring-[#E34B26] focus:border-transparent"
                    placeholder="Search events..."
                  />
                </div>
                <select className="bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg px-4 py-3 text-[#49747F] focus:outline-none focus:ring-2 focus:ring-[#E34B26]">
                  <option className="bg-white text-[#49747F]">All Categories</option>
                  <option className="bg-white text-[#49747F]">Technology</option>
                  <option className="bg-white text-[#49747F]">Marketing</option>
                  <option className="bg-white text-[#49747F]">Innovation</option>
                </select>
                <select className="bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg px-4 py-3 text-[#49747F] focus:outline-none focus:ring-2 focus:ring-[#E34B26]">
                  <option className="bg-white text-[#49747F]">All Status</option>
                  <option className="bg-white text-[#49747F]">Upcoming</option>
                  <option className="bg-white text-[#49747F]">In Progress</option>
                  <option className="bg-white text-[#49747F]">Completed</option>
                </select>
              </div>
            </div>

          {/* Events List */}
          <div className="px-8 py-6 space-y-4">
              {events.map((event, idx) => (
                <div 
                  key={event.id}
                  className={`p-6 rounded-xl cursor-pointer transition-all backdrop-blur-sm border-2 ${
                    selectedEvent === idx 
                      ? 'bg-white/40 text-[#49747F] shadow-xl border-[#E34B26] backdrop-blur-xl' 
                      : 'bg-white/20 border-white/40 hover:shadow-lg hover:border-[#E34B26]/50 hover:bg-white/30 text-[#49747F]'
                  }`}
                  onClick={() => setSelectedEvent(idx)}
                >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-500">#{event.id}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(event.priority)} text-white`}>
                        {event.priority}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(event.status)} text-white flex items-center gap-1`}>
                        <FaClock className="text-xs" />
                        {event.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{event.name}</h3>
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt className="text-xs" />
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaUsers className="text-xs" />
                        {event.supporters} supporters
                      </span>
                    </div>
                    <p className="text-sm opacity-80 mb-4">{event.description}</p>
                    <div className="flex items-center gap-4">
                      <span className="bg-[#E34B26] text-white px-3 py-1 rounded-full text-xs font-bold">
                        {event.category}
                      </span>
                      <span className="text-sm">
                        VIP: {event.vipSold}/{event.vip} | Normal: {event.normalSold}/{event.normal} | Total: {event.totalSold}/{event.total}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

          {/* Right Panel - Login Page Style */}
          <div className="w-[500px] bg-white/20 backdrop-blur-xl border-l border-white/30 m-4 rounded-2xl overflow-hidden flex flex-col shadow-lg">
            {/* Event Map - Made Smaller */}
            <div className="p-4 border-b border-white/30">
              <h3 className="text-lg font-bold text-[#49747F] mb-3">Event Map</h3>
              <div className="bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg h-32 flex items-center justify-center text-[#49747F]">
                <div className="text-center">
                  <FaMapMarkerAlt className="text-xl mb-1 mx-auto" />
                  <p className="text-xs">Interactive Map</p>
                  <p className="text-xs opacity-80">{events[selectedEvent].location}</p>
                </div>
              </div>
            </div>

            {/* Event Details with Tabs */}
            <div className="flex-1 flex flex-col">
              {/* Tab Navigation */}
              <div className="border-b border-white/30">
                <nav className="flex">
                  {[
                    { key: "overview", label: "Overview", icon: FaEye },
                    { key: "tickets", label: "Tickets", icon: FaTicketAlt },
                    { key: "location", label: "Location", icon: FaMapMarkerAlt },
                    { key: "artists", label: "Artists", icon: FaMusic },
                    { key: "analytics", label: "Analytics", icon: FaUsers }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === tab.key
                            ? 'border-[#E34B26] text-[#E34B26]'
                            : 'border-transparent text-[#49747F]/70 hover:text-[#49747F] hover:border-[#49747F]/30'
                        }`}
                      >
                        <Icon className="text-xs" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-[#49747F]">Sales Progress</span>
                        <span className="text-sm font-bold text-[#49747F]">{events[selectedEvent].progress}%</span>
                      </div>
                      <div className="w-full bg-white/40 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-[#E34B26] to-[#49747F] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${events[selectedEvent].progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg p-4">
                      <h4 className="font-bold text-[#49747F] mb-3 flex items-center gap-2">
                        <FaCalendarAlt className="text-[#E34B26]" />
                        Event Information
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-[#49747F]/70">Event ID:</span>
                          <span className="text-sm font-bold text-[#49747F]">{events[selectedEvent].id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-[#49747F]/70">Date & Time:</span>
                          <span className="text-sm font-bold text-[#49747F]">{events[selectedEvent].date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-[#49747F]/70">Duration:</span>
                          <span className="text-sm font-bold text-[#49747F]">{events[selectedEvent].duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-[#49747F]/70">Type:</span>
                          <span className="text-sm font-bold text-[#49747F]">{events[selectedEvent].eventType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Priority */}
                    <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg p-4">
                      <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                        <FaCheckCircle className="text-[#E34B26]" />
                        Status & Priority
                      </h4>
                      <div className="flex gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(events[selectedEvent].status)} text-white`}>
                          {events[selectedEvent].status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(events[selectedEvent].priority)} text-white`}>
                          {events[selectedEvent].priority}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="bg-[#E34B26] text-white px-3 py-1 rounded-full text-xs font-bold">
                          {events[selectedEvent].category}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg p-4">
                      <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                        <FaEye className="text-[#E34B26]" />
                        Description
                      </h4>
                      <p className="text-sm text-white/80">{events[selectedEvent].description}</p>
                    </div>
                </div>
              )}

              {/* Tickets Tab */}
              {activeTab === "tickets" && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <FaTicketAlt className="text-[#E34B26]" />
                      Ticket Sales
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">VIP Tickets:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-800">{events[selectedEvent].vipSold}/{events[selectedEvent].vip}</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#E34B26] h-2 rounded-full"
                              style={{ width: `${(events[selectedEvent].vipSold / events[selectedEvent].vip) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Normal Tickets:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-800">{events[selectedEvent].normalSold}/{events[selectedEvent].normal}</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#E34B26] h-2 rounded-full"
                              style={{ width: `${(events[selectedEvent].normalSold / events[selectedEvent].normal) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Sold:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-800">{events[selectedEvent].totalSold}/{events[selectedEvent].total}</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#E34B26] h-2 rounded-full"
                              style={{ width: `${(events[selectedEvent].totalSold / events[selectedEvent].total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Revenue:</span>
                        <span className="text-sm font-bold text-green-600">₹{events[selectedEvent].revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Location Tab */}
              {activeTab === "location" && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-[#E34B26]" />
                      Event Location
                    </h4>
                    <p className="text-sm text-gray-700 mb-4">{events[selectedEvent].location}</p>
                    <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                      <div className="text-center">
                        <FaMapMarkerAlt className="text-3xl text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Interactive Map</p>
                        <p className="text-gray-400 text-xs">Location details will appear here</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Artists Tab */}
              {activeTab === "artists" && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <FaMusic className="text-[#E34B26]" />
                      Artists & Performers
                    </h4>
                    <div className="space-y-3">
                      {events[selectedEvent].artists.map((artist, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                          <div className="w-8 h-8 bg-[#E34B26] rounded-full flex items-center justify-center">
                            <FaMusic className="text-white text-sm" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{artist}</div>
                            <div className="text-sm text-gray-500">Performer</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === "analytics" && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <FaUsers className="text-[#E34B26]" />
                      Event Analytics
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Current Attendees:</span>
                        <span className="text-sm font-bold text-gray-800">{events[selectedEvent].attendees}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Capacity:</span>
                        <span className="text-sm font-bold text-gray-800">{events[selectedEvent].capacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Supporters:</span>
                        <span className="text-sm font-bold text-gray-800">{events[selectedEvent].supporters}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Past Events:</span>
                        <span className="text-sm font-bold text-gray-800">{events[selectedEvent].pastEvents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Conversion Rate:</span>
                        <span className="text-sm font-bold text-green-600">
                          {((events[selectedEvent].totalSold / events[selectedEvent].total) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}


