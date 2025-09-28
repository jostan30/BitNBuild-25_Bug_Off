"use client";

import React, { useState } from "react";
import { FaRegImage, FaMapMarkerAlt, FaTrashAlt, FaCalendarAlt, FaTicketAlt, FaCheckCircle, FaArrowLeft, FaArrowRight, FaUpload, FaClock, FaDollarSign, FaUsers, FaTag } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

// Strict type definitions
interface TicketClass {
  type: string;
  maxSupply: number;
  price: number;
  tokenAddress: string | null;
}

interface EventData {
  name: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  ticketExpiryHours: number;
  category: string;
  image: string;
  ticketClasses: TicketClass[];
}

interface CreateEventResponse {
  message: string;
  event: {
    _id: string;
    name: string;
    organiserId: string;
    description: string;
    location: string;
    startTime: string;
    endTime: string;
    ticketExpiryHours: number;
    category: string;
    image: string;
    ticketClasses: string[];
  };
}

interface APIError {
  message: string;
  error?: string;
}

type StepKey = "cover" | "info" | "location" | "ticket" | "review";
type EventCategory = "Technology" | "Music" | "Sports" | "Business" | "Education" | "Art" | "Food" | "Health";

interface StepConfig {
  key: StepKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const steps: StepConfig[] = [
  { key: "cover", label: "Cover Image", icon: FaRegImage },
  { key: "info", label: "Event Details", icon: FaTag },
  { key: "location", label: "Location & Time", icon: FaMapMarkerAlt },
  { key: "ticket", label: "Tickets", icon: FaTicketAlt },
  { key: "review", label: "Review & Publish", icon: FaCheckCircle },
];

const CreateEventPage: React.FC = () => {
  const [step, setStep] = useState<StepKey>("cover");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form data states
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<EventCategory>("Technology");
  const [images, setImages] = useState<string[]>([]);
  const [city, setCity] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [eventDate, setEventDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  
  // Ticket settings
  const [price, setPrice] = useState<number>(90);
  const [quantity, setQuantity] = useState<number>(200);
  const [isPaid, setIsPaid] = useState<boolean>(true);
  const [ticketExpiryHours, setTicketExpiryHours] = useState<number>(24);
  
  // Publishing settings
  const [publishDate, setPublishDate] = useState<string>("2025-10-01");
  const [publishTime, setPublishTime] = useState<string>("18:00");
  const [publishSchedule, setPublishSchedule] = useState<boolean>(true);

  const router = useRouter();
  const { user } = useAuth("organizer");
  const backendUrl: string = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const getCurrentStepIndex = (): number => steps.findIndex(s => s.key === step);
  const currentStepIndex = getCurrentStepIndex();
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const getAuthHeaders = (): HeadersInit => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      throw new Error("No authentication token found");
    }
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const validateStep = (stepKey: StepKey): string | null => {
    switch (stepKey) {
      case "info":
        if (!name.trim()) return "Event name is required";
        if (!description.trim()) return "Event description is required";
        break;
      case "location":
        if (!address.trim()) return "Address is required";
        if (!city.trim()) return "City is required";
        if (!eventDate) return "Event date is required";
        if (!startTime) return "Start time is required";
        if (!endTime) return "End time is required";
        break;
      case "ticket":
        if (isPaid && price <= 0) return "Ticket price must be greater than 0";
        if (quantity <= 0) return "Quantity must be greater than 0";
        break;
    }
    return null;
  };

  const nextStep = (): void => {
    const currentIndex = getCurrentStepIndex();
    const validation = validateStep(step);
    
    if (validation) {
      setError(validation);
      return;
    }
    
    setError(null);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1].key);
    }
  };

  const prevStep = (): void => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1].key);
      setError(null);
    }
  };

  const combineDateTime = (date: string, time: string): string => {
    if (!date || !time) return "";
    return `${date}T${time}:00.000Z`;
  };

  const buildLocation = (): string => {
    const parts = [address, city, state, country].filter(Boolean);
    return parts.join(", ");
  };

  const buildTicketClasses = (): TicketClass[] => {
    return [{
      type: isPaid ? "Standard" : "Free",
      maxSupply: quantity,
      price: isPaid ? price : 0,
      tokenAddress: null
    }];
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImages([e.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (): void => {
    setImages([]);
  };

  const saveDraft = async (): Promise<void> => {
    try {
      setLoading(true);
      // Implement draft saving logic here
      console.log("Saving draft...");
      alert("Draft saved successfully!");
    } catch (err) {
      console.error("Save draft error:", err);
      alert("Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  const publishEvent = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Final validation
      const validationError = validateStep("review");
      if (validationError) {
        setError(validationError);
        return;
      }

      if (!name.trim() || !eventDate || !startTime || !endTime) {
        setError("Please fill in all required fields");
        return;
      }

      const eventData: EventData = {
        name: name.trim(),
        description: description.trim(),
        location: buildLocation(),
        startTime: combineDateTime(eventDate, startTime),
        endTime: combineDateTime(eventDate, endTime),
        ticketExpiryHours,
        category,
        image: images[0] || "",
        ticketClasses: buildTicketClasses()
      };

      console.log("Creating event with data:", eventData);

      const response = await fetch(`${backendUrl}/api/events/create`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData: APIError = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to create event`);
      }

      const result: CreateEventResponse = await response.json();
      console.log("Event created successfully:", result);

      // Redirect to dashboard
      router.push("/OrganizerDashboard");
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Failed to create event: ${errorMessage}`);
      console.error("Publish event error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setCategory(e.target.value as EventCategory);
  };

  const handleStepClick = (stepKey: StepKey): void => {
    // Only allow clicking on completed steps or current step
    const targetIndex = steps.findIndex(s => s.key === stepKey);
    if (targetIndex <= currentStepIndex) {
      setStep(stepKey);
      setError(null);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setPrice(value);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

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
          <Link href="/OrganizerDashboard" className="text-[#49747F] text-2xl hover:text-[#E34B26] transition-all hover:scale-110">
            ←
          </Link>
          <FaRegImage className="text-[#49747F] text-2xl hover:text-[#E34B26] transition-all hover:scale-110 cursor-pointer" />
          <FaTag className="text-[#49747F] text-2xl hover:text-[#E34B26] transition-all hover:scale-110 cursor-pointer" />
          <FaMapMarkerAlt className="text-[#49747F] text-2xl hover:text-[#E34B26] transition-all hover:scale-110 cursor-pointer" />
          <FaTicketAlt className="text-[#49747F] text-2xl hover:text-[#E34B26] transition-all hover:scale-110 cursor-pointer" />
          <FaCheckCircle className="text-[#49747F] text-2xl hover:text-[#E34B26] transition-all hover:scale-110 cursor-pointer" />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white/20 backdrop-blur-xl border-b border-white/30 px-8 py-6 m-4 rounded-t-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                  <div className="w-6 h-6 bg-gradient-to-r from-[#E34B26] to-[#49747F] rounded flex items-center justify-center">
                    <FaCheckCircle className="text-white text-sm" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#49747F]">Create New Event</h1>
                  <p className="text-[#49747F]/70">Set up your event in just a few steps</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-[#49747F]/70">Step {currentStepIndex + 1} of {steps.length}</div>
                <div className="w-32 bg-white/40 rounded-full h-2 mt-1">
                  <div 
                    className="bg-gradient-to-r from-[#E34B26] to-[#49747F] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 flex">
            {/* Step Navigation */}
            <div className="w-80 bg-white/20 backdrop-blur-xl border-r border-white/30 p-6 m-4 rounded-l-2xl shadow-lg">
              <h3 className="text-lg font-bold text-[#49747F] mb-6">Event Setup</h3>
              <nav className="space-y-2">
                {steps.map((stepItem, index) => {
                  const Icon = stepItem.icon;
                  const isActive = step === stepItem.key;
                  const isCompleted = index < currentStepIndex;
                  const isAccessible = index <= currentStepIndex;
                  
                  return (
                    <button
                      key={stepItem.key}
                      onClick={() => isAccessible && handleStepClick(stepItem.key)}
                      disabled={!isAccessible}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all backdrop-blur-sm ${
                        isActive 
                          ? 'bg-white/40 text-[#49747F] shadow-lg border border-[#E34B26]' 
                          : isCompleted
                          ? 'bg-green-500/20 text-green-700 hover:bg-green-500/30 border border-green-500/30 cursor-pointer'
                          : isAccessible
                          ? 'bg-white/20 text-[#49747F]/70 hover:bg-white/30 border border-white/30 cursor-pointer'
                          : 'bg-white/10 text-[#49747F]/40 border border-white/20 cursor-not-allowed'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive 
                          ? 'bg-[#E34B26] text-white' 
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : isAccessible
                          ? 'bg-white/40'
                          : 'bg-white/20'
                      }`}>
                        {isCompleted ? (
                          <FaCheckCircle className="text-sm" />
                        ) : (
                          <Icon className="text-sm" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{stepItem.label}</div>
                        {isCompleted && (
                          <div className="text-xs opacity-80">Completed</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Main Form Content */}
            <div className="flex-1 bg-white/20 backdrop-blur-xl p-8 m-4 rounded-r-2xl shadow-lg">
              <div className="max-w-4xl mx-auto">
                {/* Error Display */}
                {error && (
                  <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}

                {/* Step 1: Cover Image */}
                {step === "cover" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <FaRegImage className="text-[#E34B26] text-xl" />
                      <h2 className="text-2xl font-bold text-[#49747F]">Upload Cover Image</h2>
                    </div>
                    <p className="text-[#49747F]/70 mb-6">Upload a compelling cover image to attract attendees to your event.</p>
                  
                    <div className="border-2 border-dashed border-white/40 rounded-xl p-8 text-center hover:border-[#E34B26] transition-colors bg-white/20 backdrop-blur-sm">
                      {images.length > 0 ? (
                        <div className="space-y-4">
                          <img src={images[0]} alt="Event Cover" className="mx-auto rounded-lg max-h-64 object-cover" />
                          <div className="flex justify-center gap-4">
                            <label className="flex items-center gap-2 px-4 py-2 bg-[#E34B26] text-white rounded-lg hover:bg-[#49747F] transition cursor-pointer">
                              <FaUpload className="text-sm" />
                              Change Image
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageUpload}
                                className="hidden" 
                              />
                            </label>
                            <button 
                              onClick={removeImage}
                              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                            >
                              <FaTrashAlt className="text-sm" />
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <FaUpload className="text-4xl text-[#49747F]/60 mx-auto" />
                          <div>
                            <p className="text-lg font-semibold text-[#49747F]">Upload your cover image</p>
                            <p className="text-[#49747F]/60">Drag and drop or click to browse</p>
                          </div>
                          <label className="inline-block bg-[#E34B26] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#49747F] transition cursor-pointer">
                            Choose File
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageUpload}
                              className="hidden" 
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Event Details */}
                {step === "info" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <FaTag className="text-[#E34B26] text-xl" />
                      <h2 className="text-2xl font-bold text-[#49747F]">Event Details</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-[#49747F] mb-2">
                          Event Name <span className="text-red-400">*</span>
                        </label>
                        <Input
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full p-4 bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent text-[#49747F] placeholder-[#49747F]/60"
                          placeholder="Enter your event name"
                        />
                      </div>
                    
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-[#49747F] mb-2">
                          Description <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          className="w-full p-4 bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent h-32 resize-none text-[#49747F] placeholder-[#49747F]/60"
                          placeholder="Describe your event in detail"
                        />
                      </div>
                    
                      <div>
                        <label className="block text-sm font-semibold text-[#49747F] mb-2">Category</label>
                        <select 
                          value={category} 
                          onChange={handleCategoryChange}
                          className="w-full p-4 bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent text-[#49747F]"
                        >
                          <option value="Technology" className="bg-white text-[#49747F]">Technology</option>
                          <option value="Music" className="bg-white text-[#49747F]">Music</option>
                          <option value="Sports" className="bg-white text-[#49747F]">Sports</option>
                          <option value="Business" className="bg-white text-[#49747F]">Business</option>
                          <option value="Education" className="bg-white text-[#49747F]">Education</option>
                          <option value="Art" className="bg-white text-[#49747F]">Art</option>
                          <option value="Food" className="bg-white text-[#49747F]">Food & Drink</option>
                          <option value="Health" className="bg-white text-[#49747F]">Health & Wellness</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#49747F] mb-2">Ticket Expiry Hours</label>
                        <Input
                          type="number"
                          value={ticketExpiryHours}
                          onChange={e => setTicketExpiryHours(parseInt(e.target.value) || 24)}
                          className="w-full p-4 bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent text-[#49747F]"
                          placeholder="24"
                          min="1"
                          max="168"
                        />
                        <p className="text-xs text-[#49747F]/60 mt-1">Hours before tickets expire (1-168 hours)</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Location & Time */}
                {step === "location" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <FaMapMarkerAlt className="text-[#E34B26] text-xl" />
                      <h2 className="text-2xl font-bold text-[#49747F]">Location & Time</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-[#49747F] mb-2">
                          Address <span className="text-red-400">*</span>
                        </label>
                        <Input
                          value={address}
                          onChange={e => setAddress(e.target.value)}
                          className="w-full p-4 bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent text-[#49747F] placeholder-[#49747F]/60"
                          placeholder="Enter full address"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-[#49747F] mb-2">
                          City <span className="text-red-400">*</span>
                        </label>
                        <Input
                          value={city}
                          onChange={e => setCity(e.target.value)}
                          className="w-full p-4 bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent text-[#49747F] placeholder-[#49747F]/60"
                          placeholder="City"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-[#49747F] mb-2">State/Province</label>
                        <Input
                          value={state}
                          onChange={e => setState(e.target.value)}
                          className="w-full p-4 bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent text-[#49747F] placeholder-[#49747F]/60"
                          placeholder="State/Province"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-[#49747F] mb-2">Country</label>
                        <Input
                          value={country}
                          onChange={e => setCountry(e.target.value)}
                          className="w-full p-4 bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent text-[#49747F] placeholder-[#49747F]/60"
                          placeholder="Country"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-[#49747F] mb-2">
                          Event Date <span className="text-red-400">*</span>
                        </label>
                        <Input
                          type="date"
                          value={eventDate}
                          onChange={e => setEventDate(e.target.value)}
                          className="w-full p-4 bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent text-[#49747F]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-[#49747F] mb-2">
                          Start Time <span className="text-red-400">*</span>
                        </label>
                        <Input
                          type="time"
                          value={startTime}
                          onChange={e => setStartTime(e.target.value)}
                          className="w-full p-4 bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent text-[#49747F]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-[#49747F] mb-2">
                          End Time <span className="text-red-400">*</span>
                        </label>
                        <Input
                          type="time"
                          value={endTime}
                          onChange={e => setEndTime(e.target.value)}
                          className="w-full p-4 bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent text-[#49747F]"
                        />
                      </div>
                    </div>
                    
                    {/* Map Preview */}
                    <div className="mt-6">
                      <label className="block text-sm font-semibold text-[#49747F] mb-2">Location Preview</label>
                      <div className="w-full h-48 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border-2 border-dashed border-white/40">
                        <div className="text-center">
                          <FaMapMarkerAlt className="text-3xl text-[#49747F]/40 mx-auto mb-2" />
                          <p className="text-[#49747F]/60">Map preview will appear here</p>
                          {buildLocation() && (
                            <p className="text-sm text-[#49747F]/80 mt-2">{buildLocation()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Tickets */}
                {step === "ticket" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <FaTicketAlt className="text-[#E34B26] text-xl" />
                      <h2 className="text-2xl font-bold text-[#49747F]">Ticket Settings</h2>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-[#49747F] mb-4">Ticket Type</label>
                        <div className="flex gap-4">
                          <label className={`flex items-center gap-3 px-6 py-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isPaid 
                              ? 'border-[#E34B26] bg-[#E34B26]/10' 
                              : 'border-white/40 bg-white/20'
                          }`}>
                            <input
                              type="radio"
                              checked={isPaid}
                              onChange={() => setIsPaid(true)}
                              className="text-[#E34B26]"
                            />
                            <FaDollarSign className="text-lg text-[#49747F]" />
                            <div>
                              <div className="font-semibold text-[#49747F]">Paid Event</div>
                              <div className="text-sm text-[#49747F]/70">Charge attendees for tickets</div>
                            </div>
                          </label>
                          
                          <label className={`flex items-center gap-3 px-6 py-4 rounded-lg border-2 cursor-pointer transition-all ${
                            !isPaid 
                              ? 'border-[#E34B26] bg-[#E34B26]/10' 
                              : 'border-white/40 bg-white/20'
                          }`}>
                            <input
                              type="radio"
                              checked={!isPaid}
                              onChange={() => setIsPaid(false)}
                              className="text-[#E34B26]"
                            />
                            <FaUsers className="text-lg text-[#49747F]" />
                            <div>
                              <div className="font-semibold text-[#49747F]">Free Event</div>
                              <div className="text-sm text-[#49747F]/70">No charge for attendees</div>
                            </div>
                          </label>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-[#49747F] mb-2">
                            Ticket Price {isPaid && <span className="text-red-400">*</span>}
                          </label>
                          <div className="relative">
                            <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#49747F]/60" />
                            <Input
                              type="number"
                              value={price}
                              onChange={handlePriceChange}
                              disabled={!isPaid}
                              min="0"
                              step="0.01"
                              className="w-full pl-10 p-4 bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent text-[#49747F] disabled:opacity-50"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-[#49747F] mb-2">
                            Available Tickets <span className="text-red-400">*</span>
                          </label>
                          <Input
                            type="number"
                            value={quantity}
                            onChange={handleQuantityChange}
                            min="1"
                            className="w-full p-4 bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent text-[#49747F]"
                            placeholder="200"
                          />
                        </div>
                      </div>
                      
                      <div className="bg-blue-50/20 backdrop-blur-sm border border-blue-200/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FaClock className="text-[#49747F]" />
                          <span className="font-semibold text-[#49747F]">Sales Information</span>
                        </div>
                        <div className="text-sm text-[#49747F]/70">
                          <p className="mb-2">• Tickets will be available immediately after event creation</p>
                          <p className="mb-2">• Sales will automatically end when the event starts</p>
                          <p>• Tickets expire {ticketExpiryHours} hours after purchase if unused</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Review */}
                {step === "review" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <FaCheckCircle className="text-[#E34B26] text-xl" />
                      <h2 className="text-2xl font-bold text-[#49747F]">Review & Publish</h2>
                    </div>
                    
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                      <h3 className="text-lg font-bold text-[#49747F] mb-4">Event Preview</h3>
                      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {images.length > 0 && (
                          <img src={images[0]} alt="Event Cover" className="w-full h-48 object-cover" />
                        )}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-[#E34B26]">
                              {isPaid ? `From ${price}` : 'Free'}
                            </span>
                            <span className="text-sm text-gray-500">{category}</span>
                          </div>
                          <h4 className="text-xl font-bold text-gray-800 mb-2">{name || "Your Event Name"}</h4>
                          <p className="text-gray-600 mb-4">{description || "Event description will appear here"}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                            <div className="flex items-center gap-1">
                              <FaCalendarAlt />
                              <span>{eventDate || "Date TBD"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FaClock />
                              <span>{startTime && endTime ? `${startTime} - ${endTime}` : "Time TBD"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FaMapMarkerAlt />
                              <span>{city || "Location TBD"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FaUsers />
                              <span>{quantity} tickets available</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50/20 backdrop-blur-sm border border-yellow-200/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FaClock className="text-[#49747F]" />
                        <span className="font-semibold text-[#49747F]">Publishing Information</span>
                      </div>
                      <div className="text-sm text-[#49747F]/70">
                        <p className="mb-2">• Event will be published immediately and visible to attendees</p>
                        <p className="mb-2">• Ticket sales will start automatically</p>
                        <p>• You can edit event details after publishing</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/30">
                  <Button
                    onClick={prevStep}
                    disabled={currentStepIndex === 0 || loading}
                    className="flex items-center gap-2 px-6 py-3 bg-white/30 backdrop-blur-sm border border-white/40 text-[#49747F] rounded-lg hover:bg-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaArrowLeft className="text-sm" />
                    Previous
                  </Button>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={saveDraft}
                      disabled={loading}
                      className="px-6 py-3 bg-white/30 backdrop-blur-sm border border-white/40 text-[#49747F] rounded-lg hover:bg-white/40 disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Save Draft"}
                    </Button>
                    
                    {step === "review" ? (
                      <Button
                        onClick={publishEvent}
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-[#E34B26] to-[#49747F] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Publishing...
                          </>
                        ) : (
                          "Publish Event"
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={nextStep}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E34B26] to-[#49747F] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        Next
                        <FaArrowRight className="text-sm" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;