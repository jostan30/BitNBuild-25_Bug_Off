"use client";

import { useState } from "react";
import { FaRegImage, FaMapMarkerAlt, FaTrashAlt, FaCalendarAlt, FaTicketAlt, FaCheckCircle, FaArrowLeft, FaArrowRight, FaUpload, FaClock, FaDollarSign, FaUsers, FaTag } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const steps = [
  { key: "cover", label: "Cover Image", icon: FaRegImage },
  { key: "info", label: "Event Details", icon: FaTag },
  { key: "location", label: "Location & Time", icon: FaMapMarkerAlt },
  { key: "ticket", label: "Tickets", icon: FaTicketAlt },
  { key: "review", label: "Review & Publish", icon: FaCheckCircle },
];

export default function CreateEventPage() {
  const [step, setStep] = useState("cover");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technology");
  const [images] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState(90);
  const [quantity, setQuantity] = useState(200);
  const [isPaid, setIsPaid] = useState(true);
  const [publishDate, setPublishDate] = useState("2025-10-01");
  const [publishTime, setPublishTime] = useState("18:00");
  const [publishSchedule, setPublishSchedule] = useState(true);
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");

  const getCurrentStepIndex = () => steps.findIndex(s => s.key === step);
  const currentStepIndex = getCurrentStepIndex();
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const nextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1].key);
    }
  };

  const prevStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1].key);
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
                  
                  return (
                    <button
                      key={stepItem.key}
                      onClick={() => setStep(stepItem.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all backdrop-blur-sm ${
                        isActive 
                          ? 'bg-white/40 text-[#49747F] shadow-lg border border-[#E34B26]' 
                          : isCompleted
                          ? 'bg-green-500/20 text-green-700 hover:bg-green-500/30 border border-green-500/30'
                          : 'bg-white/20 text-[#49747F]/70 hover:bg-white/30 border border-white/30'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive 
                          ? 'bg-[#E34B26] text-white' 
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-white/40'
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
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#E34B26] text-white rounded-lg hover:bg-[#49747F] transition">
                              <FaUpload className="text-sm" />
                              Change Image
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
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
                          <button className="bg-[#E34B26] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#49747F] transition">
                            Choose File
                          </button>
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
                        <label className="block text-sm font-semibold text-[#49747F] mb-2">Description</label>
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
                          onChange={e => setCategory(e.target.value)}
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
                  </div>
                </div>
              )}

              {/* Step 3: Location & Time */}
              {step === "location" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <FaMapMarkerAlt className="text-[#E34B26] text-xl" />
                    <h2 className="text-2xl font-bold text-gray-800">Location & Time</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                      <Input
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent"
                        placeholder="Enter full address"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                      <Input
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent"
                        placeholder="City"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">State/Province</label>
                      <Input
                        value={state}
                        onChange={e => setState(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent"
                        placeholder="State/Province"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                      <Input
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent"
                        placeholder="Country"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Event Date</label>
                      <Input
                        type="date"
                        value={eventDate}
                        onChange={e => setEventDate(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                      <Input
                        type="time"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                      <Input
                        type="time"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  {/* Map Preview */}
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location Preview</label>
                    <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <FaMapMarkerAlt className="text-3xl text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Map preview will appear here</p>
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
                    <h2 className="text-2xl font-bold text-gray-800">Ticket Settings</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-4">Ticket Type</label>
                      <div className="flex gap-4">
                        <label className={`flex items-center gap-3 px-6 py-4 rounded-lg border-2 cursor-pointer transition-all ${
                          isPaid 
                            ? 'border-[#E34B26] bg-[#E34B26]/10' 
                            : 'border-gray-300 bg-white'
                        }`}>
                          <input
                            type="radio"
                            checked={isPaid}
                            onChange={() => setIsPaid(true)}
                            className="text-[#E34B26]"
                          />
                          <FaDollarSign className="text-lg" />
                          <div>
                            <div className="font-semibold">Paid Event</div>
                            <div className="text-sm text-gray-600">Charge attendees for tickets</div>
                          </div>
                        </label>
                        
                        <label className={`flex items-center gap-3 px-6 py-4 rounded-lg border-2 cursor-pointer transition-all ${
                          !isPaid 
                            ? 'border-[#E34B26] bg-[#E34B26]/10' 
                            : 'border-gray-300 bg-white'
                        }`}>
                          <input
                            type="radio"
                            checked={!isPaid}
                            onChange={() => setIsPaid(false)}
                            className="text-[#E34B26]"
                          />
                          <FaUsers className="text-lg" />
                          <div>
                            <div className="font-semibold">Free Event</div>
                            <div className="text-sm text-gray-600">No charge for attendees</div>
                          </div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Ticket Price</label>
                        <div className="relative">
                          <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input
                            type="number"
                            value={price}
                            onChange={e => setPrice(Number(e.target.value))}
                            disabled={!isPaid}
                            className="w-full pl-10 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Available Tickets</label>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={e => setQuantity(Number(e.target.value))}
                          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent"
                          placeholder="200"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FaClock className="text-blue-600" />
                        <span className="font-semibold text-blue-800">Sales Period</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Sales Start</label>
                          <Input
                            type="datetime-local"
                            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Sales End</label>
                          <Input
                            type="datetime-local"
                            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent"
                          />
                        </div>
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
                    <h2 className="text-2xl font-bold text-gray-800">Review & Publish</h2>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Event Preview</h3>
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      {images.length > 0 && (
                        <img src={images[0]} alt="Event Cover" className="w-full h-48 object-cover" />
                      )}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-[#E34B26]">From ${price}</span>
                          <span className="text-sm text-gray-500">{category}</span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-800 mb-2">{name || "Your Event Name"}</h4>
                        <p className="text-gray-600 mb-4">{description || "Event description will appear here"}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <FaCalendarAlt />
                            <span>{eventDate || "Date TBD"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaMapMarkerAlt />
                            <span>{city || "Location TBD"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaUsers />
                            <span>{quantity} tickets</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FaClock className="text-yellow-600" />
                      <span className="font-semibold text-yellow-800">Publish Schedule</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={publishSchedule}
                          onChange={() => setPublishSchedule(!publishSchedule)}
                          className="text-[#E34B26]"
                        />
                        <span className="text-sm">Schedule publication</span>
                      </label>
                      {publishSchedule && (
                        <div className="flex gap-2">
                          <Input
                            type="date"
                            value={publishDate}
                            onChange={e => setPublishDate(e.target.value)}
                            className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#E34B26]"
                          />
                          <Input
                            type="time"
                            value={publishTime}
                            onChange={e => setPublishTime(e.target.value)}
                            className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#E34B26]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/30">
                  <Button
                    onClick={prevStep}
                    disabled={currentStepIndex === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-white/30 backdrop-blur-sm border border-white/40 text-[#49747F] rounded-lg hover:bg-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaArrowLeft className="text-sm" />
                    Previous
                  </Button>
                  
                  <div className="flex gap-3">
                    <Button
                      className="px-6 py-3 bg-white/30 backdrop-blur-sm border border-white/40 text-[#49747F] rounded-lg hover:bg-white/40"
                    >
                      Save Draft
                    </Button>
                    
                    {step === "review" ? (
                      <Button
                        className="px-8 py-3 bg-gradient-to-r from-[#E34B26] to-[#49747F] text-white rounded-lg hover:shadow-lg transition-all"
                      >
                        Publish Event
                      </Button>
                    ) : (
                      <Button
                        onClick={nextStep}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E34B26] to-[#49747F] text-white rounded-lg hover:shadow-lg transition-all"
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
}