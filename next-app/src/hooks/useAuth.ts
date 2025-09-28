'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export const useAuth = (requiredRole?: 'user' | 'organizer') => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      const token = sessionStorage.getItem('authToken');
      const storedUser = sessionStorage.getItem('user');

      if (!token || !storedUser) {
        router.push('/login'); // redirect if no token
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-token`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (!res.ok || !data.valid) {
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('userType');
          router.push('/login'); // token invalid, redirect
          return;
        }

        const parsedUser: User = JSON.parse(storedUser);

        // Optional role check
        if (requiredRole && parsedUser.role !== requiredRole) {
          router.push('/unauthorized'); // redirect if role mismatch
          return;
        }

        setUser(parsedUser);
      } catch (err) {
        console.error('Token verification failed:', err);
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('userType');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [router, requiredRole]);

  return { user, loading };
};
