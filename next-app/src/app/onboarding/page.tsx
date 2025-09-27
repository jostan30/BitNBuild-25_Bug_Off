"use client";

import { useState } from "react";
import { FaMusic, FaRunning, FaBriefcase, FaBuilding, FaMapMarkerAlt, FaArrowRight, FaArrowLeft, FaCheck, FaCheckCircle, FaTag, FaUser } from "react-icons/fa";
import Link from "next/link";

const onboardingSteps = [
  { key: "interests", label: "Your Interests", icon: FaTag },
  { key: "location", label: "Location", icon: FaMapMarkerAlt },
  { key: "profile", label: "Profile", icon: FaUser },
];

const interestCategories = [
  {
    id: "music",
    name: "Music",
    icon: FaMusic,
    tags: ["Blues & Jazz", "Country", "EDM", "Hip Hop", "R&B", "Electronic", "Experimental", "Psychedelic"]
  },
  {
    id: "sport",
    name: "Sport",
    icon: FaRunning,
    tags: ["Football (soccer)", "Basketball", "Tennis", "Baseball", "Swimming", "Volleyball", "Athletics", "Rugby", "Ice hockey"]
  },
  {
    id: "business",
    name: "Business",
    icon: FaBriefcase,
    tags: ["Trade Shows", "Product Launches", "Business Seminars", "Workshops", "Business Awards", "Investor Pitch Events"]
  },
  {
    id: "exhibition",
    name: "Exhibition",
    icon: FaBuilding,
    tags: ["Art Exhibitions", "Science Fairs", "Technology Shows", "Cultural Events", "Museum Events"]
  }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState("interests");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [location, setLocation] = useState("New York, NY");
  const [additionalLocations, setAdditionalLocations] = useState<string[]>([]);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const getCurrentStepIndex = () => onboardingSteps.findIndex(s => s.key === currentStep);
  const currentStepIndex = getCurrentStepIndex();
  const progress = ((currentStepIndex + 1) / onboardingSteps.length) * 100;

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(item => item !== interest)
        : [...prev, interest]
    );
  };

  const addLocation = () => {
    if (location && !additionalLocations.includes(location)) {
      setAdditionalLocations(prev => [...prev, location]);
    }
  };

  const nextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < onboardingSteps.length - 1) {
      setCurrentStep(onboardingSteps[currentIndex + 1].key);
    }
  };

  const prevStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(onboardingSteps[currentIndex - 1].key);
    }
  };

  const finishOnboarding = () => {
    // Handle onboarding completion
    console.log("Onboarding completed!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003447] to-[#441111] flex font-sans">
      {/* Left Sidebar */}
      <aside className="w-16 bg-white flex flex-col items-center py-6 gap-6">
        <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
          <FaCheckCircle className="text-white text-sm" />
        </div>
        <Link href="/" className="text-gray-600 text-xl hover:text-[#E34B26] transition">
          ←
        </Link>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                <FaCheckCircle className="text-white text-sm" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Welcome to Spectrate</h1>
                <p className="text-gray-600">Let&apos;s set up your profile to get started</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Step {currentStepIndex + 1} of {onboardingSteps.length}</div>
              <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-gradient-to-r from-[#E34B26] to-[#441111] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex">
          {/* Step Navigation */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Setup Progress</h3>
            <nav className="space-y-2">
              {onboardingSteps.map((stepItem, index) => {
                const Icon = stepItem.icon;
                const isActive = currentStep === stepItem.key;
                const isCompleted = index < currentStepIndex;
                
                return (
                  <button
                    key={stepItem.key}
                    onClick={() => setCurrentStep(stepItem.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#E34B26] to-[#441111] text-white shadow-lg' 
                        : isCompleted
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive 
                        ? 'bg-white/20' 
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200'
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
          <div className="flex-1 bg-white p-8">
            <div className="max-w-4xl mx-auto">
              {/* Step 1: Interests */}
              {currentStep === "interests" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <FaTag className="text-[#E34B26] text-xl" />
                    <h2 className="text-2xl font-bold text-gray-800">What Are Your Interests?</h2>
                  </div>
                  <p className="text-gray-600 mb-6">Select your interests to help us recommend relevant events for you.</p>
                  
                  <div className="space-y-6">
                    {interestCategories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <div key={category.id} className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-[#E34B26]/10 rounded-lg flex items-center justify-center">
                              <Icon className="text-[#E34B26] text-lg" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800">{category.name}</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {category.tags.map((tag) => (
                              <button
                                key={tag}
                                onClick={() => toggleInterest(tag)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                  selectedInterests.includes(tag)
                                    ? 'bg-gradient-to-r from-[#E34B26] to-[#441111] text-white shadow-md'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:border-[#E34B26]'
                                }`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Location */}
              {currentStep === "location" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <FaMapMarkerAlt className="text-[#E34B26] text-xl" />
                    <h2 className="text-2xl font-bold text-gray-800">What is your preferred location?</h2>
                  </div>
                  <p className="text-gray-600 mb-6">Tell us where you&apos;d like to attend events.</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Looking for an event in
                      </label>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full pl-10 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent"
                          placeholder="Enter location"
                        />
                      </div>
                      <button
                        onClick={addLocation}
                        className="text-[#E34B26] text-sm font-medium mt-2 hover:text-[#441111] transition-colors"
                      >
                        + Add location
                      </button>
                    </div>

                    {/* Additional Locations */}
                    {additionalLocations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Additional Locations</h4>
                        <div className="flex flex-wrap gap-2">
                          {additionalLocations.map((loc, index) => (
                            <div
                              key={index}
                              className="bg-[#E34B26]/10 text-[#E34B26] px-3 py-1 rounded-full text-sm flex items-center gap-2"
                            >
                              {loc}
                              <button
                                onClick={() => setAdditionalLocations(prev => prev.filter((_, i) => i !== index))}
                                className="text-[#E34B26] hover:text-[#441111]"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Profile */}
              {currentStep === "profile" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <FaUser className="text-[#E34B26] text-xl" />
                    <h2 className="text-2xl font-bold text-gray-800">Complete Your Profile</h2>
                  </div>
                  <p className="text-gray-600 mb-6">Tell us a bit about yourself to personalize your experience.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E34B26] focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaArrowLeft className="text-sm" />
                  Previous
                </button>
                
                <div className="flex gap-3">
                  <Link href="/" className="px-6 py-3 text-gray-500 hover:text-gray-700 transition-colors">
                    Skip
                  </Link>
                  
                  {currentStep === "profile" ? (
                    <button
                      onClick={finishOnboarding}
                      className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#E34B26] to-[#441111] text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      <FaCheck className="text-sm" />
                      Complete Setup
                    </button>
                  ) : (
                    <button
                      onClick={nextStep}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E34B26] to-[#441111] text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      Next
                      <FaArrowRight className="text-sm" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
