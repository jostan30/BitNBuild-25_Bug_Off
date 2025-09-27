"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FaGoogle, FaFacebookF, FaApple } from "react-icons/fa";
import { AlertCircle, Loader, Shield } from "lucide-react";

type LoginMode = "User" | "Organizer";

// Declare ReCaptcha for TypeScript
declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>("User");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    twoFactorCode: ""
  });
  
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaWidgetId = useRef<number | null>(null);

  // Load reCAPTCHA script
  useEffect(() => {
    // Check if reCAPTCHA is already loaded
    if (window.grecaptcha) {
      setRecaptchaLoaded(true);
      return;
    }

    // Define callback for when reCAPTCHA loads
    window.onRecaptchaLoad = () => {
      setRecaptchaLoaded(true);
    };

    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize reCAPTCHA widget when loaded
  useEffect(() => {
    if (recaptchaLoaded && window.grecaptcha && recaptchaRef.current && recaptchaWidgetId.current === null) {
      try {
        recaptchaWidgetId.current = window.grecaptcha.render(recaptchaRef.current, {
          sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', // Test key
          theme: 'light',
          size: 'normal'
        });
      } catch (error) {
        console.error('reCAPTCHA render error:', error);
      }
    }
  }, [recaptchaLoaded]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(""); // Clear error when user types
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

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Get reCAPTCHA response
      const recaptchaResponse = getReCaptchaResponse();
      if (!recaptchaResponse) {
        throw new Error("Please complete the reCAPTCHA verification");
      }

      // Prepare login data
      const loginData = {
        email: formData.email,
        password: formData.password,
        userType: mode.toLowerCase(),
        recaptchaToken: recaptchaResponse,
        ...(mode === "Organizer" && formData.twoFactorCode && { twoFactorCode: formData.twoFactorCode })
      };

      // Make API call to your backend
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      // Success - handle the response
      console.log('Login successful:', result);
      
      // Store token (adjust based on your auth strategy)
      if (result.token) {
        localStorage.setItem('authToken', result.token);
      }

      // Redirect based on user type
      if (mode === "User") {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/organizer/dashboard';
      }

    } catch (error: any) {
      setError(error.message);
      resetReCaptcha(); // Reset reCAPTCHA on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      // Get reCAPTCHA response for social login too
      const recaptchaResponse = getReCaptchaResponse();
      if (!recaptchaResponse) {
        throw new Error("Please complete the reCAPTCHA verification");
      }

      // Implement social login logic here
      console.log(`Social login with ${provider}`, { recaptchaResponse, userType: mode });
      
      // For now, just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      setError(error.message);
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
      {/* Abstract SVG background patterns */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 1440 810"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <ellipse cx="250" cy="130" rx="170" ry="80" fill="#F4FFEE" opacity="0.42"/>
        <ellipse cx="1170" cy="700" rx="160" ry="70" fill="#CDBBB9" opacity="0.30"/>
        <rect x="950" y="120" width="260" height="40" rx="20" fill="url(#g4)" opacity="0.16"/>
        <rect x="80" y="650" width="260" height="40" rx="20" fill="url(#g5)" opacity="0.16"/>
        <path d="M0,390 Q720,540 1440,390" stroke="#E34B26" strokeWidth="16" opacity="0.07" fill="none"/>
        <path d="M0,600 Q720,750 1440,600" stroke="#003447" strokeWidth="16" opacity="0.06" fill="none"/>
        <defs>
          <linearGradient id="g4" x1="950" y1="120" x2="1210" y2="160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E34B26"/>
            <stop offset="1" stopColor="#003447"/>
          </linearGradient>
          <linearGradient id="g5" x1="80" y1="650" x2="340" y2="690" gradientUnits="userSpaceOnUse">
            <stop stopColor="#CDBBB9"/>
            <stop offset="1" stopColor="#441111"/>
          </linearGradient>
        </defs>
      </svg>

      <div className="w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden bg-white/0 relative z-10">
        {/* Branding/Welcome Section */}
        <div className="flex-1 flex flex-col justify-center items-center py-10 px-6 bg-gradient-to-br from-[#F4FFEE] via-[#CDBBB9] to-[#49747F] relative">
          {/* Spectrate logo */}
          <div className="flex items-center gap-3 mb-4">
            <span className="rounded-lg bg-white shadow-lg p-2 flex items-center justify-center">
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
            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#E34B26] via-[#49747F] to-[#003447] tracking-wide">Spectrate</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#003447] mb-3 drop-shadow">Welcome Back!</h1>
          <p className="text-base md:text-lg text-[#441111] mb-6 text-center max-w-md">
            {mode === "User"
              ? "Sign in to book tickets for concerts, workshops, and more in seconds!"
              : "Sign in as an organizer to manage and sell tickets to your events effortlessly!"}
          </p>
          {mode === "User" ? (
            <Button className="bg-[#E34B26] hover:bg-[#003447] text-white font-semibold rounded-full px-6 py-2 shadow mb-4 transition">Browse Events</Button>
          ) : (
            <Button className="bg-[#49747F] hover:bg-[#003447] text-white font-semibold rounded-full px-6 py-2 shadow mb-4 transition">Organizer Dashboard</Button>
          )}
        </div>

        {/* Sign In Card */}
        <div className="flex-1 flex flex-col justify-center items-center py-10 px-8 bg-gradient-to-tr from-[#F4FFEE] via-[#CDBBB9] to-[#49747F]">
          <div className="w-full max-w-sm bg-white/30 rounded-2xl p-8 shadow-lg backdrop-blur-md border border-white/20">
            {/* Toggle Tabs */}
            <div className="mb-8 flex justify-center gap-2">
              {(["User", "Organizer"] as LoginMode[]).map((m) => (
                <button
                  key={m}
                  className={cn(
                    "px-4 py-1 rounded-xl font-semibold text-base transition-all",
                    mode === m
                      ? "bg-[#F4FFEE] text-[#003447] shadow"
                      : "bg-transparent text-[#49747F] hover:text-[#E34B26]"
                  )}
                  onClick={() => setMode(m)}
                  type="button"
                  aria-selected={mode === m}
                >
                  {m === "User" ? "Attendee" : "Organizer"}
                </button>
              ))}
            </div>

            <h2 className="text-2xl font-bold text-[#003447] mb-6">{mode === "User" ? "Sign In" : "Organizer Login"}</h2>
            
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100/80 backdrop-blur-sm border border-red-200 rounded-xl flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-5">
              <div className="relative">
                <Input
                  type="email"
                  placeholder={mode === "User" ? "Email or Username" : "Organizer Email or ID"}
                  className="pl-4 bg-[#F4FFEE] text-[#003447] font-medium border border-[#CDBBB9] rounded-full focus:ring-2 focus:ring-[#E34B26] transition"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="pl-4 pr-12 bg-[#F4FFEE] text-[#003447] font-medium border border-[#CDBBB9] rounded-full focus:ring-2 focus:ring-[#E34B26] transition"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E34B26] hover:text-[#003447] transition"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <span role="img" aria-label="Hide Password">🙈</span>
                  ) : (
                    <span role="img" aria-label="Show Password">👁️</span>
                  )}
                </button>
              </div>
              
              {mode === "Organizer" && (
                <Input
                  type="text"
                  placeholder="2FA Code (if enabled)"
                  className="pl-4 bg-[#F4FFEE] text-[#003447] font-medium border border-[#49747F] rounded-full focus:ring-2 focus:ring-[#49747F] transition"
                  value={formData.twoFactorCode}
                  onChange={(e) => handleInputChange('twoFactorCode', e.target.value)}
                  disabled={isLoading}
                />
              )}

              {/* reCAPTCHA */}
              <div className="flex justify-center py-2">
                {recaptchaLoaded ? (
                  <div 
                    ref={recaptchaRef}
                    className="transform scale-90 origin-center"
                  />
                ) : (
                  <div className="flex items-center justify-center space-x-2 p-4 bg-white/50 rounded-lg">
                    <Loader className="h-4 w-4 animate-spin text-[#E34B26]" />
                    <span className="text-sm text-[#49747F]">Loading security verification...</span>
                  </div>
                )}
              </div>

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !recaptchaLoaded}
                className="w-full bg-gradient-to-r from-[#E34B26] via-[#49747F] to-[#003447] text-white font-semibold rounded-full text-lg py-2 mt-2 shadow hover:scale-[1.03] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    <span>{mode === "User" ? "Sign In" : "Sign In as Organizer"}</span>
                  </>
                )}
              </Button>
            </div>

            {/* Social sign in */}
            <div className="flex justify-center gap-6 mt-6">
              <button 
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading || !recaptchaLoaded}
                className="bg-white/90 rounded-full p-2 shadow hover:bg-white hover:scale-105 transition disabled:opacity-50" 
                aria-label="Sign in with Google"
              >
                <FaGoogle className="text-[#E34B26] text-xl" />
              </button>
              <button 
                onClick={() => handleSocialLogin('facebook')}
                disabled={isLoading || !recaptchaLoaded}
                className="bg-white/90 rounded-full p-2 shadow hover:bg-white hover:scale-105 transition disabled:opacity-50" 
                aria-label="Sign in with Facebook"
              >
                <FaFacebookF className="text-[#49747F] text-xl" />
              </button>
              <button 
                onClick={() => handleSocialLogin('apple')}
                disabled={isLoading || !recaptchaLoaded}
                className="bg-white/90 rounded-full p-2 shadow hover:bg-white hover:scale-105 transition disabled:opacity-50" 
                aria-label="Sign in with Apple"
              >
                <FaApple className="text-[#003447] text-xl" />
              </button>
            </div>

            {/* Links */}
            <div className="flex justify-between items-center mt-4 text-sm text-[#49747F]">
              <Link href="#" className="hover:text-[#E34B26] underline">Forgot Password?</Link>
              {mode === "User" ? (
                <Link href="/register" className="hover:text-[#E34B26] underline">Don't have an account? Sign Up</Link>
              ) : (
                <Link href="/register?mode=organizer" className="hover:text-[#E34B26] underline">Become an Organizer? Sign Up</Link>
              )}
            </div>

            {/* Optional features */}
            {mode === "User" && (
              <div className="flex flex-col items-center mt-6">
                <button className="text-xs text-[#49747F] underline hover:text-[#E34B26] transition">Browse as guest</button>
              </div>
            )}
            {mode === "Organizer" && (
              <div className="flex flex-col items-center mt-6">
                <Link href="/dashboard-preview" className="text-xs text-[#49747F] underline hover:text-[#E34B26] transition">Preview Organizer Dashboard</Link>
                <Link href="/learn-more" className="text-xs text-[#441111] underline hover:text-[#E34B26] mt-1">Learn More about Hosting Events</Link>
              </div>
            )}

            {/* Security Notice */}
            <div className="mt-4 text-center">
              <p className="text-xs text-[#49747F]">
                🔒 Protected by reCAPTCHA and secured with enterprise-grade encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}