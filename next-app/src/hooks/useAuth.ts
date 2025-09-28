'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'organizer' | 'admin';
  walletId?: string;
  walletAddress?: string;
  captchaVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

export const useAuth = (requiredRole?: 'user' | 'organizer') => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const logout = () => {
    // Clear all auth data
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('userType');
    }
    setUser(null);
    setError(null);
  };

  useEffect(() => {
    const verifyToken = async () => {
      // Skip verification in non-browser environments
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      try {
        const token = sessionStorage.getItem('authToken');
        const storedUser = sessionStorage.getItem('user');
        
        if (!token || !storedUser) {
          setError('No authentication found');
          router.push('/auth/login');
          return;
        }

        // Verify token with backend
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-token`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();
        
        if (!res.ok || !data.valid) {
          logout();
          setError('Authentication expired');
          router.push('/auth/login');
          return;
        }

        const parsedUser: User = JSON.parse(storedUser);
        
        // Role-based access control
        if (requiredRole && parsedUser.role !== requiredRole) {
          setError('Insufficient permissions');
          router.push('/unauthorized');
          return;
        }

        setUser(parsedUser);
        setError(null);
        
      } catch (err) {
        console.error('Token verification failed:', err);
        logout();
        setError('Authentication failed');
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [router, requiredRole]);

  return { 
    user, 
    loading, 
    error, 
    logout 
  };
};