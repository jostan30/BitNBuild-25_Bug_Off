'use client'
import { useState } from 'react';
import { Calendar, Users, Ticket, TrendingUp, Shield, Zap, ChevronRight, Sparkles, ArrowRight, CheckCircle, Star, Bell, Lock, Smartphone, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [isHovered, setIsHovered] = useState(false);
  const router =useRouter();

  const handleGetStarted = () => {
    router.push('/login');
  };

  const features = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Easy Event Discovery",
      description: "Find amazing events happening near you",
      gradient: "from-[#E34B26] to-[#49747F]"
    },
    {
      icon: <Ticket className="w-6 h-6" />,
      title: "Secure Ticketing",
      description: "Blockchain-powered ticket verification",
      gradient: "from-[#49747F] to-[#003447]"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "For Organizers",
      description: "Powerful tools to manage your events",
      gradient: "from-[#E34B26] to-[#003447]"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Real-time Analytics",
      description: "Track your event performance instantly",
      gradient: "from-[#49747F] to-[#E34B26]"
    }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Browse Events",
      description: "Explore thousands of events tailored to your interests",
      icon: <Globe className="w-8 h-8" />
    },
    {
      step: "02",
      title: "Book Securely",
      description: "Purchase tickets with blockchain-verified security",
      icon: <Lock className="w-8 h-8" />
    },
    {
      step: "03",
      title: "Get Notified",
      description: "Receive instant updates and digital tickets",
      icon: <Bell className="w-8 h-8" />
    },
    {
      step: "04",
      title: "Enjoy Event",
      description: "Show your QR code and enter hassle-free",
      icon: <Smartphone className="w-8 h-8" />
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Event Enthusiast",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      quote: "Spectrate made booking tickets so easy! The blockchain verification gives me peace of mind.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Event Organizer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      quote: "Managing events has never been easier. The analytics dashboard is incredibly helpful!",
      rating: 5
    },
    {
      name: "Emma Williams",
      role: "Concert Goer",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      quote: "I love how secure and transparent the whole process is. No more worrying about fake tickets!",
      rating: 5
    }
  ];

  const benefits = [
    { icon: <CheckCircle className="w-5 h-5" />, text: "No hidden fees" },
    { icon: <CheckCircle className="w-5 h-5" />, text: "Instant ticket delivery" },
    { icon: <CheckCircle className="w-5 h-5" />, text: "24/7 customer support" },
    { icon: <CheckCircle className="w-5 h-5" />, text: "Easy refunds & transfers" },
    { icon: <CheckCircle className="w-5 h-5" />, text: "Mobile-first experience" },
    { icon: <CheckCircle className="w-5 h-5" />, text: "Verified event organizers" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4FFEE] via-[#CDBBB9]/30 to-[#49747F]/20 relative overflow-hidden">
      {/* Animated background elements */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40"
        viewBox="0 0 1440 810"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <ellipse cx="200" cy="100" rx="200" ry="100" fill="#F4FFEE" opacity="0.5"/>
        <ellipse cx="1240" cy="710" rx="180" ry="90" fill="#CDBBB9" opacity="0.4"/>
        <path d="M0,400 Q720,550 1440,400" stroke="#E34B26" strokeWidth="20" opacity="0.08" fill="none"/>
        <path d="M0,600 Q720,750 1440,600" stroke="#003447" strokeWidth="20" opacity="0.07" fill="none"/>
      </svg>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-6 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-white shadow-lg p-2 flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 38 38" fill="none">
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
              <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#E34B26] via-[#49747F] to-[#003447]">
                Spectrate
              </span>
            </div>
            
            <button
              onClick={handleGetStarted}
              className="px-6 py-2.5 bg-white/80 backdrop-blur-sm text-[#003447] font-semibold rounded-full hover:bg-white hover:shadow-lg transition-all duration-300 border border-[#CDBBB9]/30"
            >
              Sign In
            </button>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 py-12 md:py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full mb-6 border border-[#E34B26]/20">
                <Sparkles className="w-4 h-4 text-[#E34B26]" />
                <span className="text-sm font-medium text-[#003447]">Powered by Blockchain</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#003447] mb-6 leading-tight">
                Discover Events
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#E34B26] to-[#49747F]">
                  Made Simple
                </span>
              </h1>

              <p className="text-lg md:text-xl text-[#49747F] mb-8 max-w-2xl mx-auto lg:mx-0">
                Book tickets securely, explore amazing events, and create unforgettable experiences with blockchain-powered verification.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={handleGetStarted}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="group relative px-8 py-4 bg-gradient-to-r from-[#E34B26] via-[#49747F] to-[#003447] text-white font-semibold rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <span>Get Started</span>
                  <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                </button>

                <button
                  onClick={() => console.log('Learn more')}
                  className="px-8 py-4 bg-white/80 backdrop-blur-sm text-[#003447] font-semibold rounded-full text-lg border-2 border-[#CDBBB9]/50 hover:border-[#E34B26]/50 hover:bg-white transition-all duration-300 hover:shadow-lg"
                >
                  Learn More
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 mt-12 justify-center lg:justify-start">
                <div>
                  <div className="text-3xl font-bold text-[#E34B26]">50K+</div>
                  <div className="text-sm text-[#49747F]">Events Hosted</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#E34B26]">200K+</div>
                  <div className="text-sm text-[#49747F]">Happy Attendees</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#E34B26]">99.9%</div>
                  <div className="text-sm text-[#49747F]">Secure Transactions</div>
                </div>
              </div>
            </div>

            {/* Right Visual with Unsplash Images */}
            <div className="flex-1 relative">
              <div className="relative w-full max-w-lg mx-auto">
                {/* Event Card 1 - Concert */}
                <div className="absolute top-0 right-0 w-64 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-all duration-300 hover:scale-105">
                  <div className="h-32 bg-gradient-to-br from-[#E34B26] to-[#49747F] relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=200&fit=crop" 
                      alt="Concert event"
                      className="w-full h-full object-cover opacity-60"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#E34B26] to-[#49747F] rounded-full flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-[#003447]">Concert Night</div>
                        <div className="text-xs text-[#49747F]">Dec 25, 2024</div>
                      </div>
                    </div>
                    <div className="h-2 bg-[#F4FFEE] rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-[#E34B26] to-[#49747F] rounded-full"></div>
                    </div>
                    <div className="text-xs text-[#49747F] mt-2 font-medium">75% Sold Out</div>
                  </div>
                </div>

                {/* Event Card 2 - Festival */}
                <div className="absolute bottom-0 left-0 w-64 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden transform -rotate-3 hover:rotate-0 transition-all duration-300 hover:scale-105">
                  <div className="h-32 bg-gradient-to-br from-[#49747F] to-[#003447] relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=200&fit=crop" 
                      alt="Festival event"
                      className="w-full h-full object-cover opacity-60"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#49747F] to-[#003447] rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-[#003447]">Secure Tickets</div>
                        <div className="text-xs text-[#49747F]">Blockchain Verified</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#E34B26]" />
                      <span className="text-sm text-[#49747F] font-medium">Instant Transfer</span>
                    </div>
                  </div>
                </div>

                {/* Center Circle with Event Image */}
                <div className="relative z-10 w-80 h-80 mx-auto rounded-full overflow-hidden shadow-2xl border-4 border-white/50">
                  <img 
                    src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=500&fit=crop" 
                    alt="Live event"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#E34B26]/20 to-[#003447]/40 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-white drop-shadow-lg">100%</div>
                      <div className="text-xl font-semibold text-white mt-2 drop-shadow">Secure</div>
                      <div className="text-sm text-white/90 drop-shadow">Platform</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-24">
            <h2 className="text-3xl md:text-4xl font-bold text-[#003447] text-center mb-12">
              Why Choose Spectrate?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-[#CDBBB9]/30 group"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#003447] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#49747F]">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mt-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#003447] mb-4">
                How It Works
              </h2>
              <p className="text-lg text-[#49747F] max-w-2xl mx-auto">
                Get started in four simple steps and experience seamless event booking
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((item, index) => (
                <div key={index} className="relative">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#CDBBB9]/30 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#E34B26] to-[#49747F] rounded-full text-white mb-4">
                      {item.icon}
                    </div>
                    <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#E34B26] to-[#49747F] mb-2">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold text-[#003447] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#49747F]">
                      {item.description}
                    </p>
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-8 h-8 text-[#E34B26]/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Event Gallery Section */}
          <div className="mt-24">
            <h2 className="text-3xl md:text-4xl font-bold text-[#003447] text-center mb-12">
              Trending Events
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { img: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=300&fit=crop", title: "Music Festival", date: "Jan 15, 2025" },
                { img: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=300&fit=crop", title: "Tech Conference", date: "Feb 20, 2025" },
                { img: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&h=300&fit=crop", title: "Art Exhibition", date: "Mar 10, 2025" }
              ].map((event, index) => (
                <div key={index} className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <img 
                    src={event.img} 
                    alt={event.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#003447]/80 via-[#003447]/40 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-xl font-bold text-white mb-1">{event.title}</h3>
                    <p className="text-sm text-white/90 mb-3">{event.date}</p>
                    <button className="flex items-center gap-2 text-white font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Book Now <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mt-24">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-10 shadow-xl border border-[#CDBBB9]/30">
              <h2 className="text-3xl md:text-4xl font-bold text-[#003447] text-center mb-12">
                What You Get With Spectrate
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-white/50 rounded-xl hover:bg-white/80 transition-all duration-300">
                    <div className="text-[#E34B26]">
                      {benefit.icon}
                    </div>
                    <span className="text-[#003447] font-medium">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="mt-24">
            <h2 className="text-3xl md:text-4xl font-bold text-[#003447] text-center mb-12">
              What Our Users Say
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#CDBBB9]/30">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#E34B26] text-[#E34B26]" />
                    ))}
                  </div>
                  <p className="text-[#49747F] mb-6 italic">&quot;{testimonial.quote}&quot;</p>
                  <div className="flex items-center gap-3">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-bold text-[#003447]">{testimonial.name}</div>
                      <div className="text-sm text-[#49747F]">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-24 text-center">
            <div className="bg-gradient-to-r from-[#E34B26] via-[#49747F] to-[#003447] rounded-3xl p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <img 
                  src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=400&fit=crop" 
                  alt="Background"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  Join thousands of event organizers and attendees experiencing the future of event management.
                </p>
                <button
                  onClick={handleGetStarted}
                  className="px-10 py-4 bg-white text-[#003447] font-semibold rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 inline-flex items-center gap-2"
                >
                  Create Your Account
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 mt-12 border-t border-[#CDBBB9]/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-[#49747F]">
              © 2024 Spectrate. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-[#49747F]">
              <button className="hover:text-[#E34B26] transition-colors">Privacy</button>
              <button className="hover:text-[#E34B26] transition-colors">Terms</button>
              <button className="hover:text-[#E34B26] transition-colors">Contact</button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}