"use client";

import { useState, useEffect, useRef } from "react";
import { AlertCircle, Loader, Shield, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type LoginMode = "User" | "Organizer";

// Declare ReCaptcha for TypeScript
declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

// API utility functions (inline for demo)
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ;

const authAPI = {
  login: async (loginData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(loginData),
      credentials: 'include',
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || `Login failed (${response.status})`);
    }
    return result;
  },

  socialLogin: async (socialData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/social-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(socialData),
      credentials: 'include',
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || `Social login failed (${response.status})`);
    }
    return result;
  }
};

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>("User");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    twoFactorCode: ""
  });
  const router = useRouter();
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaWidgetId = useRef<number | null>(null);

  // Load reCAPTCHA script
  useEffect(() => {
    if (window.grecaptcha) {
      setRecaptchaLoaded(true);
      return;
    }

    window.onRecaptchaLoad = () => {
      setRecaptchaLoaded(true);
    };

    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize reCAPTCHA widget
  useEffect(() => {
    if (recaptchaLoaded && window.grecaptcha && recaptchaRef.current && recaptchaWidgetId.current === null) {
      try {
        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
        recaptchaWidgetId.current = window.grecaptcha.render(recaptchaRef.current, {
          sitekey: siteKey,
          theme: 'light',
          size: 'normal'
        });
      } catch (error) {
        console.error('reCAPTCHA render error:', error);
        setError('Failed to load security verification');
      }
    }
  }, [recaptchaLoaded]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const getReCaptchaResponse = (): string | null => {
    if (window.grecaptcha && recaptchaWidgetId.current !== null) {
      return window.grecaptcha.getResponse(recaptchaWidgetId.current);
    }
    return null;
  };

  const resetReCaptcha = () => {
    if (window.grecaptcha && recaptchaWidgetId.current !== null) {
      window.grecaptcha.reset(recaptchaWidgetId.current);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");
  setSuccess("");

  try {
    // Basic validation
    if (!formData.email.trim() || !formData.password) {
      throw new Error("Please fill in all required fields");
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      throw new Error("Please enter a valid email address");
    }

    // Get reCAPTCHA response
    const recaptchaResponse = getReCaptchaResponse();
    if (!recaptchaResponse) {
      throw new Error("Please complete the security verification");
    }

    // Prepare login data
    const loginData = {
      email: formData.email.trim(),
      password: formData.password,
      userType: mode.toLowerCase(),
      recaptchaToken: recaptchaResponse,
      ...(mode === "Organizer" && formData.twoFactorCode && { twoFactorCode: formData.twoFactorCode })
    };

    // Call login API
    const result = await authAPI.login(loginData);

    // Save token and user info in sessionStorage for route protection
    if (result.token && result.user) {
      sessionStorage.setItem('authToken', result.token);
      sessionStorage.setItem('user', JSON.stringify(result.user));
      sessionStorage.setItem('userType', result.user.role);
    }

    setSuccess("Login successful! Redirecting...");

    // Redirect based on role
    setTimeout(() => {
      if (result.user.role === "organizer") {
        router.push("/OrganizerDashboard");
      } else {
        router.push("/event");
      }
    }, 1000);

  } catch (error: any) {
    console.error('Login error:', error);
    setError(error.message || 'Login failed. Please try again.');
    resetReCaptcha();
  } finally {
    setIsLoading(false);
  }
};

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const recaptchaResponse = getReCaptchaResponse();
      if (!recaptchaResponse) {
        throw new Error("Please complete the security verification");
      }

      const socialData = {
        provider,
        userType: mode.toLowerCase(),
        recaptchaToken: recaptchaResponse
      };

      const result = await authAPI.socialLogin(socialData);
      
      setSuccess(`${provider} login successful! Redirecting...`);
      
      if (result.token) {
        sessionStorage.setItem('authToken', result.token);
        sessionStorage.setItem('user', JSON.stringify(result.user));
      }

      setTimeout(() => {
        const redirectUrl = mode === "User" ? '/dashboard' : '/organizer/dashboard';
        console.log(`Redirecting to ${redirectUrl}...`);
        // window.location.href = redirectUrl;
      }, 2000);
      
    } catch (error: any) {
      console.error('Social login error:', error);
      setError(error.message || `${provider} login failed`);
      resetReCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-2 py-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(120deg, #F4FFEE 0%, #CDBBB9 30%, #49747F 70%, #003447 100%)"
      }}
    >
      {/* Background SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 1440 810"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <ellipse cx="250" cy="130" rx="170" ry="80" fill="#F4FFEE" opacity="0.4"/>
        <ellipse cx="1170" cy="700" rx="160" ry="70" fill="#CDBBB9" opacity="0.3"/>
        <path d="M0,390 Q720,540 1440,390" stroke="#E34B26" strokeWidth="16" opacity="0.07" fill="none"/>
        <path d="M0,600 Q720,750 1440,600" stroke="#003447" strokeWidth="16" opacity="0.06" fill="none"/>
      </svg>

      <div className="w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden bg-white/10 backdrop-blur-sm relative z-10">
        {/* Branding Section */}
        <div className="flex-1 flex flex-col justify-center items-center py-10 px-6 bg-gradient-to-br from-[#F4FFEE]/80 via-[#CDBBB9]/60 to-[#49747F]/40 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="rounded-lg bg-white/90 shadow-lg p-2 flex items-center justify-center">
              <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
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
            <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#E34B26] via-[#49747F] to-[#003447]">Spectrate</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-[#003447] mb-4 text-center">Welcome Back!</h1>
          <p className="text-lg text-[#441111] mb-8 text-center max-w-md">
            {mode === "User"
              ? "Sign in to discover and book amazing events near you!"
              : "Manage your events and connect with your audience effortlessly!"}
          </p>
          
          <button 
            className={`${
              mode === "User" 
                ? "bg-[#E34B26] hover:bg-[#E34B26]/80" 
                : "bg-[#49747F] hover:bg-[#49747F]/80"
            } text-white font-semibold rounded-full px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
          >
            {mode === "User" ? "Explore Events" : "View Dashboard"}
          </button>
        </div>

        {/* Login Form Section */}
        <div className="flex-1 flex flex-col justify-center items-center py-10 px-8 bg-white/20 backdrop-blur-md">
          <div className="w-full max-w-sm">
            {/* Mode Toggle */}
            <div className="mb-8 flex justify-center">
              <div className="bg-white/30 rounded-full p-1 backdrop-blur-sm">
                {(["User", "Organizer"] as LoginMode[]).map((m) => (
                  <button
                    key={m}
                    className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                      mode === m
                        ? "bg-white text-[#003447] shadow-md"
                        : "text-[#49747F] hover:text-[#E34B26]"
                    }`}
                    onClick={() => setMode(m)}
                    type="button"
                  >
                    {m === "User" ? "Attendee" : "Organizer"}
                  </button>
                ))}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[#003447] mb-6 text-center">
              {mode === "User" ? "Sign In" : "Organizer Login"}
            </h2>
            
            {/* Status Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-100/90 backdrop-blur-sm border border-red-300 rounded-xl flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100/90 backdrop-blur-sm border border-green-300 rounded-xl flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-green-700 text-sm">{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="relative">
                <input
                  type="email"
                  placeholder={mode === "User" ? "Email or Username" : "Organizer Email"}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm text-[#003447] font-medium border border-[#CDBBB9]/50 rounded-full focus:ring-2 focus:ring-[#E34B26] focus:border-transparent transition-all duration-300 placeholder-[#49747F]/60"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              {/* Password Input */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full px-4 py-3 pr-12 bg-white/80 backdrop-blur-sm text-[#003447] font-medium border border-[#CDBBB9]/50 rounded-full focus:ring-2 focus:ring-[#E34B26] focus:border-transparent transition-all duration-300 placeholder-[#49747F]/60"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#49747F] hover:text-[#E34B26] transition-colors duration-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* 2FA Input for Organizers */}
              {mode === "Organizer" && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="2FA Code (if enabled)"
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm text-[#003447] font-medium border border-[#49747F]/50 rounded-full focus:ring-2 focus:ring-[#49747F] focus:border-transparent transition-all duration-300 placeholder-[#49747F]/60"
                    value={formData.twoFactorCode}
                    onChange={(e) => handleInputChange('twoFactorCode', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* reCAPTCHA */}
              <div className="flex justify-center py-2">
                {recaptchaLoaded ? (
                  <div 
                    ref={recaptchaRef}
                    className="transform scale-90 origin-center"
                  />
                ) : (
                  <div className="flex items-center justify-center space-x-2 p-4 bg-white/50 rounded-lg backdrop-blur-sm">
                    <Loader className="h-4 w-4 animate-spin text-[#E34B26]" />
                    <span className="text-sm text-[#49747F]">Loading security verification...</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !recaptchaLoaded}
                className="w-full bg-gradient-to-r from-[#E34B26] via-[#49747F] to-[#003447] text-white font-semibold rounded-full text-lg py-3 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    <span>{mode === "User" ? "Sign In" : "Access Dashboard"}</span>
                  </>
                )}
              </button>
            </form>

            {/* Social Login */}
            <div className="mt-6">
              <div className="flex items-center justify-center mb-4">
                <div className="h-px bg-[#CDBBB9] flex-1"></div>
                <span className="px-4 text-sm text-[#49747F] bg-white/50 rounded-full">Or continue with</span>
                <div className="h-px bg-[#CDBBB9] flex-1"></div>
              </div>
              
              <div className="flex justify-center gap-4">
                {[
                  { name: 'google', icon: '🔴', label: 'Google' },
                  { name: 'facebook', icon: '🔵', label: 'Facebook' },
                  { name: 'apple', icon: '⚫', label: 'Apple' }
                ].map((provider) => (
                  <button 
                    key={provider.name}
                    onClick={() => handleSocialLogin(provider.name)}
                    disabled={isLoading || !recaptchaLoaded}
                    className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100" 
                    aria-label={`Sign in with ${provider.label}`}
                  >
                    <span className="text-xl">{provider.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <button 
                  type="button"
                  className="text-[#49747F] hover:text-[#E34B26] underline transition-colors duration-300"
                  onClick={() => console.log('Forgot password clicked')}
                >
                  Forgot Password?
                </button>
                <button 
                  type="button"
                  className="text-[#49747F] hover:text-[#E34B26] underline transition-colors duration-300"
                  onClick={() => router.push('/register')}
                >
                  {mode === "User" ? "Create Account" : "Become Organizer"}
                </button>
              </div>

              {/* Additional Options */}
              {mode === "User" && (
                <div className="text-center">
                  <button 
                    type="button"
                    className="text-xs text-[#49747F] hover:text-[#E34B26] underline transition-colors duration-300"
                    onClick={() => console.log('Browse as guest clicked')}
                  >
                    Browse events as guest
                  </button>
                </div>
              )}

              {mode === "Organizer" && (
                <div className="text-center space-y-1">
                  <div>
                    <button 
                      type="button"
                      className="text-xs text-[#49747F] hover:text-[#E34B26] underline transition-colors duration-300"
                      onClick={() => console.log('Preview dashboard clicked')}
                    >
                      Preview Organizer Features
                    </button>
                  </div>
                  <div>
                    <button 
                      type="button"
                      className="text-xs text-[#441111] hover:text-[#E34B26] underline transition-colors duration-300"
                      onClick={() => console.log('Learn more clicked')}
                    >
                      Learn about hosting events
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="mt-6 text-center">
              <p className="text-xs text-[#49747F]/80 flex items-center justify-center space-x-1">
                <span>🔒</span>
                <span>Protected by reCAPTCHA • SSL Secured</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}