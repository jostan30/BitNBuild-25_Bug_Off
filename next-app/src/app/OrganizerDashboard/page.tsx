"use client"

import React, { useState, useEffect } from "react"
import {
  FaRegCalendarAlt,
  FaCog,
  FaUser,
  FaSearch,
  FaPlus,
  FaMapMarkerAlt,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaTicketAlt,
  FaCalendarAlt,
  FaEye,
  FaEdit,
  FaTrash,
  FaExclamationTriangle,
  FaSync,
} from "react-icons/fa"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"

// Strict type definitions
interface TicketClass {
  _id: string
  eventId: string
  type: string
  maxSupply: number
  price: number
  soldCount: number
  tokenAddress: string | null
}

interface BackendEvent {
  _id: string
  name: string
  organiserId: string
  description: string
  location: string
  startTime: string
  endTime: string
  ticketExpiryHours: number
  category: string
  image: string
  ticketClasses: TicketClass[]
}

interface TransformedEvent {
  id: string
  name: string
  date: string
  status: EventStatus
  priority: EventPriority
  vip: number
  normal: number
  total: number
  vipSold: number
  normalSold: number
  totalSold: number
  location: string
  supporters: number
  description: string
  category: string
  progress: number
  rating: number
  artists: string[]
  attendees: number
  revenue: number
  pastEvents: number
  eventType: string
  duration: string
  capacity: number
  startTime: string
  endTime: string
  image: string
  ticketClasses: TicketClass[]
  organiserId: string
}

type EventStatus = "Upcoming" | "In Progress" | "Completed"
type EventPriority = "HIGH" | "MEDIUM" | "LOW"
type CategoryFilter = "All Categories" | "Technology" | "Marketing" | "Innovation" | "Music" | "General"
type StatusFilter = "All Status" | "Upcoming" | "In Progress" | "Completed"
type ActiveTab = "overview" | "tickets" | "location" | "analytics"

interface LoadEventsResponse {
  events: BackendEvent[]
  message?: string
  organizerId?: string
}

interface APIError {
  message: string
  debug?: {
    eventOrganizerId: string
    requestUserId: string
    equal: boolean
  }
}

interface AuthHeaders {
  Authorization: string
  "Content-Type": string
}

interface TabConfig {
  key: ActiveTab
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const OrganizerDashboard: React.FC = () => {
  const [events, setEvents] = useState<TransformedEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All Categories")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All Status")
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false)

  const { user, loading: authLoading } = useAuth("organizer")
  const backendUrl: string = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"

  useEffect(() => {
    if (!authLoading && user) {
      loadEvents()
    }
  }, [authLoading, user])

  const getAuthHeaders = (): AuthHeaders => {
    const token = sessionStorage.getItem("authToken")
    if (!token) {
      throw new Error("No authentication token found")
    }
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }

  const loadEvents = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${backendUrl}/api/events/my-events`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        const errorData: APIError = await response.json().catch(() => ({ message: "Unknown error" }))
        console.error("API Error:", errorData)
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch events`)
      }

      const data: LoadEventsResponse = await response.json()
      console.log("Loaded events response:", data)
      console.log("Events count:", data.events?.length || 0)
      console.log("Organizer ID:", data.organizerId)
      
      const transformedEvents: TransformedEvent[] = (data.events || []).map(transformBackendEvent)
      setEvents(transformedEvents)
      
      if (transformedEvents.length === 0) {
        setError("No events found. Create your first event to get started!")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(`Failed to load events: ${errorMessage}`)
      console.error("Load events error:", err)
    } finally {
      setLoading(false)
    }
  }

  const transformBackendEvent = (backendEvent: BackendEvent): TransformedEvent => {
    const ticketClasses: TicketClass[] = backendEvent.ticketClasses || []
    let totalCapacity = 0
    let totalSold = 0
    let vipCapacity = 0
    let vipSold = 0
    let normalCapacity = 0
    let normalSold = 0

    ticketClasses.forEach((ticketClass: TicketClass) => {
      const capacity: number = ticketClass.maxSupply || 0
      const sold: number = ticketClass.soldCount || 0

      totalCapacity += capacity
      totalSold += sold

      if (ticketClass.type.toLowerCase().includes("vip") || ticketClass.type.toLowerCase().includes("premium")) {
        vipCapacity += capacity
        vipSold += sold
      } else {
        normalCapacity += capacity
        normalSold += sold
      }
    })

    const progress: number = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0

    const now = new Date()
    const startTime = new Date(backendEvent.startTime)
    const endTime = new Date(backendEvent.endTime)

    let status: EventStatus = "Upcoming"
    if (now >= startTime && now <= endTime) {
      status = "In Progress"
    } else if (now > endTime) {
      status = "Completed"
    }

    const diffMs: number = endTime.getTime() - startTime.getTime()
    const diffHours: number = Math.round(diffMs / (1000 * 60 * 60))
    const duration: string = diffHours < 24
      ? `${diffHours} hours`
      : `${Math.floor(diffHours / 24)} day${Math.floor(diffHours / 24) > 1 ? "s" : ""}`

    const priority: EventPriority = progress > 80 ? "HIGH" : progress > 40 ? "MEDIUM" : "LOW"

    return {
      id: backendEvent._id,
      name: backendEvent.name,
      date: new Date(backendEvent.startTime).toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      status,
      priority,
      vip: vipCapacity,
      normal: normalCapacity,
      total: totalCapacity,
      vipSold,
      normalSold,
      totalSold,
      location: backendEvent.location || "Location TBD",
      supporters: Math.floor(totalSold * 0.1),
      description: backendEvent.description || "No description available",
      category: backendEvent.category || "General",
      progress,
      rating: 4.5 + Math.random() * 0.5,
      artists: ["Featured Artists"],
      attendees: totalSold,
      revenue: ticketClasses.reduce((sum: number, tc: TicketClass) => sum + (tc.soldCount || 0) * tc.price, 0),
      pastEvents: Math.floor(Math.random() * 5),
      eventType: backendEvent.category || "Event",
      duration,
      capacity: totalCapacity,
      startTime: backendEvent.startTime,
      endTime: backendEvent.endTime,
      image: backendEvent.image,
      ticketClasses: backendEvent.ticketClasses || [],
      organiserId: backendEvent.organiserId,
    }
  }

  const handleDeleteEvent = async (eventId: string): Promise<void> => {
    try {
      setDeleteLoading(true)
      console.log("Attempting to delete event:", eventId)
      console.log("Current user:", user)
      
      const response = await fetch(`${backendUrl}/api/events/${eventId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData: APIError = await response.json().catch(() => ({ message: "Unknown error" }))
        console.error("Delete failed with status:", response.status)
        console.error("Error data:", errorData)
        
        if (response.status === 403) {
          throw new Error(`Unauthorized: ${errorData.message || 'You can only delete your own events'}`)
        } else if (response.status === 404) {
          throw new Error("Event not found")
        } else {
          throw new Error(errorData.message || `Failed to delete event (${response.status})`)
        }
      }

      // Remove from local state
      setEvents(prevEvents => prevEvents.filter((event: TransformedEvent) => event.id !== eventId))
      setShowDeleteModal(false)
      setEventToDelete(null)

      // Adjust selected event if needed
      if (selectedEvent >= events.length - 1) {
        setSelectedEvent(Math.max(0, events.length - 2))
      }

      console.log("Event deleted successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      console.error("Delete event error:", error)
      alert(`Failed to delete event: ${errorMessage}`)
    } finally {
      setDeleteLoading(false)
    }
  }

  const generateDemoEvents = (): TransformedEvent[] => {
    const now = new Date()
    const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
    const inTwoDaysPlus2h = new Date(inTwoDays.getTime() + 2 * 60 * 60 * 1000)
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const yesterdayPlus3h = new Date(yesterday.getTime() + 3 * 60 * 60 * 1000)

    const sampleBackendEvents: BackendEvent[] = [
      {
        _id: "demo-evt-1",
        name: "Demo Tech Conference",
        startTime: inTwoDays.toISOString(),
        endTime: inTwoDaysPlus2h.toISOString(),
        location: "Online",
        description: "A preview-only demo event to let you explore the dashboard.",
        category: "Technology",
        image: "",
        organiserId: user?.id || "demo-user",
        ticketExpiryHours: 24,
        ticketClasses: [
          { 
            _id: "tc1", 
            eventId: "demo-evt-1", 
            type: "General", 
            maxSupply: 200, 
            soldCount: 90, 
            price: 499, 
            tokenAddress: null 
          },
          { 
            _id: "tc2", 
            eventId: "demo-evt-1", 
            type: "VIP", 
            maxSupply: 50, 
            soldCount: 25, 
            price: 1299, 
            tokenAddress: null 
          },
        ],
      },
      {
        _id: "demo-evt-2",
        name: "Demo Music Fest",
        startTime: yesterday.toISOString(),
        endTime: yesterdayPlus3h.toISOString(),
        location: "Main Arena",
        description: "Completed demo event for testing analytics and tickets.",
        category: "Music",
        image: "",
        organiserId: user?.id || "demo-user",
        ticketExpiryHours: 48,
        ticketClasses: [
          { 
            _id: "tc3", 
            eventId: "demo-evt-2", 
            type: "General", 
            maxSupply: 1000, 
            soldCount: 820, 
            price: 999, 
            tokenAddress: null 
          },
          { 
            _id: "tc4", 
            eventId: "demo-evt-2", 
            type: "VIP", 
            maxSupply: 150, 
            soldCount: 140, 
            price: 2499, 
            tokenAddress: null 
          },
        ],
      },
    ]

    return sampleBackendEvents.map(transformBackendEvent)
  }

  const filteredEvents: TransformedEvent[] = events.filter((event: TransformedEvent) => {
    const matchesSearch: boolean =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory: boolean = categoryFilter === "All Categories" || event.category === categoryFilter
    const matchesStatus: boolean = statusFilter === "All Status" || event.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getPriorityColor = (priority: EventPriority): string => {
    switch (priority) {
      case "HIGH": return "bg-red-500"
      case "MEDIUM": return "bg-orange-500"
      case "LOW": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusColor = (status: EventStatus): string => {
    switch (status) {
      case "Upcoming": return "bg-green-500"
      case "In Progress": return "bg-blue-500"
      case "Completed": return "bg-gray-500"
      default: return "bg-gray-500"
    }
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setCategoryFilter(e.target.value as CategoryFilter)
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setStatusFilter(e.target.value as StatusFilter)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value)
  }

  const handleEventClick = (idx: number): void => {
    setSelectedEvent(idx)
  }

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>, eventId: string): void => {
    e.stopPropagation()
    setEventToDelete(eventId)
    setShowDeleteModal(true)
  }

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation()
    // Handle edit functionality here
    console.log("Edit button clicked")
  }

  const closeDeleteModal = (): void => {
    setShowDeleteModal(false)
    setEventToDelete(null)
  }

  const tabConfigs: TabConfig[] = [
    { key: "overview", label: "Overview", icon: FaEye },
    { key: "tickets", label: "Tickets", icon: FaTicketAlt },
    { key: "location", label: "Location", icon: FaMapMarkerAlt },
    { key: "analytics", label: "Analytics", icon: FaUsers },
  ]

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#F4EFEE] via-[#CDBBB9] to-[#49747F] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E34B26] mx-auto mb-4"></div>
          <div className="text-[#49747F] text-lg font-semibold">
            {authLoading ? "Authenticating..." : "Loading events..."}
          </div>
        </div>
      </div>
    )
  }

  if (error && events.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#F4EFEE] via-[#CDBBB9] to-[#49747F] flex items-center justify-center">
        <div className="text-center bg-white/20 backdrop-blur-xl rounded-2xl p-8 border border-white/30 max-w-md">
          <FaExclamationTriangle className="text-4xl text-orange-500 mx-auto mb-4" />
          <div className="text-red-500 text-xl font-bold mb-4">Dashboard Error</div>
          <div className="text-[#49747F] mb-6">{error}</div>
          <p className="text-[#49747F]/80 text-sm mb-4">
            Backend URL: {backendUrl}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={loadEvents}
              className="bg-gradient-to-r from-[#E34B26] to-[#49747F] text-white px-6 py-3 rounded-lg font-bold hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
            >
              <FaSync className="text-sm" />
              Retry
            </button>
            <button
              onClick={() => {
                setEvents(generateDemoEvents())
                setError(null)
              }}
              className="bg-white/30 backdrop-blur-sm border border-white/40 text-[#49747F] px-6 py-3 rounded-lg font-bold hover:bg-white/40 transition-all"
            >
              Demo Mode
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#F4EFEE] via-[#CDBBB9] to-[#49747F] relative overflow-hidden font-sans">
      {/* Background shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#E34B26]/15 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#49747F]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-[#F4EFEE]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-[#CDBBB9]/25 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-56 h-56 bg-[#E34B26]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-[#49747F]/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex">
        {/* Left Sidebar */}
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
            <span className="text-[#49747F] font-bold text-sm">{user?.username?.charAt(0)?.toUpperCase() || "O"}</span>
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
                <div>
                  <h1 className="text-3xl font-bold text-[#49747F]">Spectrate Dashboard</h1>
                  <p className="text-sm text-[#49747F]/70">Welcome, {user?.username || 'Organizer'}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={loadEvents}
                  className="bg-white/30 backdrop-blur-sm border border-white/40 text-[#49747F] px-4 py-2 rounded-lg font-medium hover:bg-white/40 transition-all flex items-center gap-2"
                >
                  <FaSync className="text-sm" />
                  Refresh
                </button>
                <Link href="/createevent">
                  <button className="bg-gradient-to-r from-[#E34B26] to-[#49747F] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                    <FaPlus className="text-sm" />
                    Create New Event
                  </button>
                </Link>
              </div>
            </header>

            {/* Search and Filters */}
            <div className="px-8 py-6 bg-white/20 backdrop-blur-sm">
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#49747F]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg px-12 py-3 text-[#49747F] placeholder-[#49747F]/60 focus:outline-none focus:ring-2 focus:ring-[#E34B26] focus:border-transparent"
                    placeholder="Search events..."
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={handleCategoryChange}
                  className="bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg px-4 py-3 text-[#49747F] focus:outline-none focus:ring-2 focus:ring-[#E34B26]"
                >
                  <option className="bg-white text-[#49747F]">All Categories</option>
                  <option className="bg-white text-[#49747F]">Technology</option>
                  <option className="bg-white text-[#49747F]">Marketing</option>
                  <option className="bg-white text-[#49747F]">Innovation</option>
                  <option className="bg-white text-[#49747F]">Music</option>
                  <option className="bg-white text-[#49747F]">General</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={handleStatusChange}
                  className="bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg px-4 py-3 text-[#49747F] focus:outline-none focus:ring-2 focus:ring-[#E34B26]"
                >
                  <option className="bg-white text-[#49747F]">All Status</option>
                  <option className="bg-white text-[#49747F]">Upcoming</option>
                  <option className="bg-white text-[#49747F]">In Progress</option>
                  <option className="bg-white text-[#49747F]">Completed</option>
                </select>
              </div>
            </div>

            {/* Events List */}
            <div className="px-8 py-6 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <FaRegCalendarAlt className="text-6xl text-[#49747F]/30 mx-auto mb-4" />
                  <p className="text-[#49747F]/70 text-lg">No events found</p>
                  <p className="text-[#49747F]/50 text-sm">
                    {events.length === 0 ? "Create your first event to get started" : "Try adjusting your search or filters"}
                  </p>
                </div>
              ) : (
                filteredEvents.map((event: TransformedEvent, idx: number) => (
                  <div
                    key={event.id}
                    className={`p-6 rounded-xl cursor-pointer transition-all backdrop-blur-sm border-2 group ${
                      selectedEvent === idx
                        ? "bg-white/40 text-[#49747F] shadow-xl border-[#E34B26] backdrop-blur-xl"
                        : "bg-white/20 border-white/40 hover:shadow-lg hover:border-[#E34B26]/50 hover:bg-white/30 text-[#49747F]"
                    }`}
                    onClick={() => handleEventClick(idx)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-mono text-gray-500">#{event.id.slice(-6).toUpperCase()}</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(event.priority)} text-white`}
                          >
                            {event.priority}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(event.status)} text-white flex items-center gap-1`}
                          >
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
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt className="text-xs" />
                            {event.date}
                          </span>
                        </div>
                        <p className="text-sm opacity-80 mb-4">{event.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={handleEditClick}
                              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                              <FaEdit className="text-sm" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(e, event.id)}
                              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Event Details */}
          {filteredEvents.length > 0 && filteredEvents[selectedEvent] && (
            <div className="w-[500px] bg-white/20 backdrop-blur-xl border-l border-white/30 m-4 rounded-2xl overflow-hidden flex flex-col shadow-lg">
              {/* Event Map */}
              <div className="p-4 border-b border-white/30">
                <h3 className="text-lg font-bold text-[#49747F] mb-3">Event Map</h3>
                <div className="bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg h-32 flex items-center justify-center text-[#49747F]">
                  <div className="text-center">
                    <FaMapMarkerAlt className="text-xl mb-1 mx-auto" />
                    <p className="text-xs">Interactive Map</p>
                    <p className="text-xs opacity-80">{filteredEvents[selectedEvent].location}</p>
                  </div>
                </div>
              </div>

              {/* Event Details with Tabs */}
              <div className="flex-1 flex flex-col">
                {/* Tab Navigation */}
                <div className="border-b border-white/30">
                  <nav className="flex">
                    {tabConfigs.map((tab: TabConfig) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key)}
                          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === tab.key
                              ? "border-[#E34B26] text-[#E34B26]"
                              : "border-transparent text-[#49747F]/70 hover:text-[#49747F] hover:border-[#49747F]/30"
                          }`}
                        >
                          <Icon className="text-xs" />
                          {tab.label}
                        </button>
                      )
                    })}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {/* Overview Tab */}
                  {activeTab === "overview" && filteredEvents[selectedEvent] && (
                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div className="bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-[#49747F]">Sales Progress</span>
                          <span className="text-sm font-bold text-[#49747F]">
                            {filteredEvents[selectedEvent].progress}%
                          </span>
                        </div>
                        <div className="w-full bg-white/40 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#E34B26] to-[#49747F] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${filteredEvents[selectedEvent].progress}%` }}
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
                            <span className="text-sm font-bold text-[#49747F]">
                              #{filteredEvents[selectedEvent].id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-[#49747F]/70">Date & Time:</span>
                            <span className="text-sm font-bold text-[#49747F]">
                              {filteredEvents[selectedEvent].date}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-[#49747F]/70">Duration:</span>
                            <span className="text-sm font-bold text-[#49747F]">
                              {filteredEvents[selectedEvent].duration}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-[#49747F]/70">Type:</span>
                            <span className="text-sm font-bold text-[#49747F]">
                              {filteredEvents[selectedEvent].eventType}
                            </span>
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
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(filteredEvents[selectedEvent].status)} text-white`}
                          >
                            {filteredEvents[selectedEvent].status}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(filteredEvents[selectedEvent].priority)} text-white`}
                          >
                            {filteredEvents[selectedEvent].priority}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="bg-[#E34B26] text-white px-3 py-1 rounded-full text-xs font-bold">
                            {filteredEvents[selectedEvent].category}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg p-4">
                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                          <FaEye className="text-[#E34B26]" />
                          Description
                        </h4>
                        <p className="text-sm text-white/80">{filteredEvents[selectedEvent].description}</p>
                      </div>
                    </div>
                  )}

                  {/* Tickets Tab */}
                  {activeTab === "tickets" && filteredEvents[selectedEvent] && (
                    <div className="space-y-4">
                      <div className="bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg p-4">
                        <h4 className="font-bold text-[#49747F] mb-3 flex items-center gap-2">
                          <FaTicketAlt className="text-[#E34B26]" />
                          Ticket Sales
                        </h4>
                        <div className="space-y-3">
                          {filteredEvents[selectedEvent].ticketClasses.map((ticketClass: TicketClass, index: number) => {
                            const max: number = ticketClass.maxSupply || 0
                            const sold: number = ticketClass.soldCount || 0
                            const pct: number = max > 0 ? Math.min(100, (sold / max) * 100) : 0
                            return (
                              <div key={index} className="flex items-center justify-between">
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-[#49747F] truncate">
                                    {ticketClass.type} Tickets
                                  </div>
                                  <div className="text-xs text-[#49747F]/70">
                                    ₹{ticketClass.price.toLocaleString()} each
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-bold text-[#49747F]">
                                    {sold}/{max}
                                  </span>
                                  <div className="w-24 bg-white/40 rounded-full h-2">
                                    <div className="bg-[#E34B26] h-2 rounded-full" style={{ width: `${pct}%` }} />
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                          <div className="border-t border-white/40 pt-3 mt-3 grid grid-cols-2 gap-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-[#49747F]/70">Total Sold</span>
                              <span className="text-sm font-bold text-[#49747F]">
                                {filteredEvents[selectedEvent].totalSold}/{filteredEvents[selectedEvent].total} (
                                {filteredEvents[selectedEvent].progress}%)
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-[#49747F]/70">Est. Revenue</span>
                              <span className="text-sm font-bold text-green-600">
                                ₹{filteredEvents[selectedEvent].revenue.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Location Tab */}
                  {activeTab === "location" && filteredEvents[selectedEvent] && (
                    <div className="space-y-4">
                      <div className="bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg p-4">
                        <h4 className="font-bold text-[#49747F] mb-3 flex items-center gap-2">
                          <FaMapMarkerAlt className="text-[#E34B26]" />
                          Event Location
                        </h4>
                        <p className="text-sm text-[#49747F] mb-4">{filteredEvents[selectedEvent].location}</p>
                        <div className="bg-white/40 rounded-lg h-48 flex items-center justify-center">
                          <div className="text-center">
                            <FaMapMarkerAlt className="text-3xl text-[#49747F]/30 mx-auto mb-2" />
                            <p className="text-[#49747F]/70 text-sm">Interactive Map</p>
                            <p className="text-[#49747F]/50 text-xs">Location details will appear here</p>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-3 border">
                            <div className="text-xs text-[#49747F]/70">Capacity</div>
                            <div className="text-lg font-bold text-[#49747F]">
                              {filteredEvents[selectedEvent].capacity}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border">
                            <div className="text-xs text-[#49747F]/70">Attendance</div>
                            <div className="text-lg font-bold text-[#49747F]">
                              {filteredEvents[selectedEvent].attendees}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Analytics Tab */}
                  {activeTab === "analytics" && filteredEvents[selectedEvent] && (
                    <div className="space-y-4">
                      <div className="bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg p-4">
                        <h4 className="font-bold text-[#49747F] mb-3 flex items-center gap-2">
                          <FaUsers className="text-[#E34B26]" />
                          Event Analytics
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-[#49747F]/70">Current Attendees:</span>
                            <span className="text-sm font-bold text-[#49747F]">
                              {filteredEvents[selectedEvent].attendees}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-[#49747F]/70">Capacity:</span>
                            <span className="text-sm font-bold text-[#49747F]">
                              {filteredEvents[selectedEvent].capacity}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-[#49747F]/70">Supporters:</span>
                            <span className="text-sm font-bold text-[#49747F]">
                              {filteredEvents[selectedEvent].supporters}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-[#49747F]/70">Conversion Rate:</span>
                            <span className="text-sm font-bold text-green-600">
                              {filteredEvents[selectedEvent].progress.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-[#49747F]/70">Event Status:</span>
                            <span
                              className={`text-sm font-bold px-2 py-1 rounded text-white ${getStatusColor(filteredEvents[selectedEvent].status)}`}
                            >
                              {filteredEvents[selectedEvent].status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Ticket Class Breakdown */}
                      <div className="bg-white rounded-lg p-4 border">
                        <h5 className="font-bold text-[#49747F] mb-3">Ticket Classes Performance</h5>
                        <div className="space-y-2">
                          {filteredEvents[selectedEvent].ticketClasses.map((ticketClass: TicketClass, index: number) => {
                            const soldPercentage: number =
                              ticketClass.maxSupply > 0
                                ? ((ticketClass.soldCount || 0) / ticketClass.maxSupply) * 100
                                : 0
                            return (
                              <div key={index} className="flex items-center justify-between p-2 bg-white/40 rounded">
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-[#49747F]">{ticketClass.type}</div>
                                  <div className="text-xs text-[#49747F]/70">₹{ticketClass.price} each</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-bold text-[#49747F]">
                                    {ticketClass.soldCount || 0}/{ticketClass.maxSupply}
                                  </div>
                                  <div className="text-xs text-[#49747F]/70">{soldPercentage.toFixed(1)}%</div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-500 text-xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Event</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this event? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => eventToDelete && handleDeleteEvent(eventToDelete)}
                  className="flex-1 px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrganizerDashboard