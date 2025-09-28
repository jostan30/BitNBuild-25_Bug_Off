// lib/api-client.ts
// This version supports sessionStorage integration for persistence

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL
  ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`
  : 'http://localhost:5000/api';

// In-memory token storage with sessionStorage synchronization
let authToken: string | null = null;
let currentUser: any = null;

// Helper function to safely access sessionStorage
const getSessionStorage = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to read ${key} from sessionStorage:`, error);
      return null;
    }
  }
  return null;
};

const setSessionStorage = (key: string, value: string): void => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to save ${key} to sessionStorage:`, error);
    }
  }
};

const removeSessionStorage = (key: string): void => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove ${key} from sessionStorage:`, error);
    }
  }
};

// Initialize from sessionStorage if available
const initializeFromStorage = () => {
  const storedToken = getSessionStorage('authToken');
  const storedUser = getSessionStorage('user');
  
  if (storedToken) {
    authToken = storedToken;
  }
  
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
    } catch (error) {
      console.warn('Failed to parse user from sessionStorage:', error);
    }
  }
};

// API client with sessionStorage integration
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Initialize from storage on instantiation
    this.initializeAuth();
  }

  // Initialize auth data from sessionStorage if available
  private initializeAuth() {
    initializeFromStorage();
  }

  // Set token manually (called after login)
  setAuthToken(token: string) {
    authToken = token;
    setSessionStorage('authToken', token);
  }

  // Set current user (called after login/token verification)
  setCurrentUser(user: any) {
    currentUser = user;
    setSessionStorage('user', JSON.stringify(user));
  }

  // Get current token with sessionStorage fallback
  getAuthToken(): string | null {
    // Always check sessionStorage as fallback
    if (!authToken) {
      authToken = getSessionStorage('authToken');
    }
    return authToken;
  }

  // Get current user with sessionStorage fallback
  getCurrentUser(): any {
    // Always check sessionStorage as fallback
    if (!currentUser) {
      const storedUser = getSessionStorage('user');
      if (storedUser) {
        try {
          currentUser = JSON.parse(storedUser);
        } catch (error) {
          console.warn('Failed to parse user from sessionStorage:', error);
        }
      }
    }
    return currentUser;
  }

  // Clear auth data from both memory and sessionStorage
  clearAuth() {
    authToken = null;
    currentUser = null;
    removeSessionStorage('authToken');
    removeSessionStorage('user');
    removeSessionStorage('userType');
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = `${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (fetchError) {
      // Handle network errors
      if (fetchError instanceof TypeError) {
        throw new Error('Network error: Unable to connect to server');
      }
      throw fetchError;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const api = new ApiClient(API_BASE_URL);

// Event API
export const eventApi = {
  getEvents: () => api.get<{ events: Event[] }>('/events'),
  getEvent: (id: string) => api.get<{ event: Event }>(`/events/${id}`),
  createEvent: (eventData: CreateEventData) => api.post<{ event: Event }>('/events/create', eventData),
  updateEvent: (id: string, eventData: Partial<CreateEventData>) => api.put<{ event: Event }>(`/events/${id}`, eventData),
  deleteEvent: (id: string) => api.delete<{ message: string }>(`/events/${id}`),
  getMyEvents: () => api.get<{ events: Event[] }>('/events/my-events'),
};

// Ticket API
export const ticketApi = {
  bookTicket: (ticketData: BookTicketData) => api.post<{ ticket: Ticket }>('/tickets/book', ticketData),
  purchaseTicket: (ticketId: string) => api.post<{ order: RazorpayOrder }>('/tickets/purchase', { ticketId }),
  verifyPayment: (paymentData: VerifyPaymentData) => api.post<{ ticket: Ticket }>('/payments/verify', paymentData),
  getTicket: (id: string) => api.get<{ ticket: Ticket }>(`/tickets/${id}`),
  returnTicket: (qrHash: string) => api.post<{ ticket: Ticket }>('/tickets/return', { qrHash }),
  getUserTickets: (params?: { status?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return api.get<{ tickets: TicketWithDetails[]; pagination: PaginationInfo }>(`/tickets/my-tickets${query}`);
  },
};

// Payment API
export const paymentApi = {
  createOrder: (orderData: CreateOrderData) => api.post<{ order: RazorpayOrder }>('/payments/create-order', orderData),
  getPaymentStatus: (ticketId: string) => api.get<{ status: string }>(`/payments/status/${ticketId}`),
};

// Auth API - Fixed to work with existing login system
export const authApi = {
  login: async (credentials: LoginData) => {
    const result = await api.post<{ token: string; user: BackendUser }>('/auth/login', credentials);
    
    // Map backend user response to frontend format
    const mappedUser: User = {
      _id: result.user.id || result.user._id || '',
      username: result.user.username || '',
      email: result.user.email || '',
      role: result.user.role || 'user',
      phone: result.user.phone || '',
      bio: result.user.bio || '',
      walletId: result.user.walletId || '',
      walletAddress: result.user.walletAddress || '',
      captchaVerified: result.user.captchaVerified || false,
      isActive: result.user.isActive !== false,
      isEmailVerified: result.user.isEmailVerified || false,
      profileImage: result.user.profileImage || '',
      createdAt: result.user.createdAt || new Date().toISOString(),
      updatedAt: result.user.updatedAt,
      lastLogin: result.user.lastLogin || ''
    };
    
    // Set token and user in both memory and sessionStorage
    api.setAuthToken(result.token);
    api.setCurrentUser(mappedUser);
    
    return { token: result.token, user: mappedUser };
  },
  
  signup: async (userData: SignupData) => {
    const result = await api.post<{ token: string; user: BackendUser }>('/auth/signup', userData);
    
    // Map backend user response to frontend format
    const mappedUser: User = {
      _id: result.user.id || result.user._id || '',
      username: result.user.username || '',
      email: result.user.email || '',
      role: result.user.role || 'user',
      phone: result.user.phone || '',
      bio: result.user.bio || '',
      walletId: result.user.walletId || '',
      walletAddress: result.user.walletAddress || '',
      captchaVerified: result.user.captchaVerified || false,
      isActive: result.user.isActive !== false,
      isEmailVerified: result.user.isEmailVerified || false,
      profileImage: result.user.profileImage || '',
      createdAt: result.user.createdAt || new Date().toISOString(),
      updatedAt: result.user.updatedAt,
      lastLogin: result.user.lastLogin || ''
    };
    
    // Set token and user in both memory and sessionStorage
    api.setAuthToken(result.token);
    api.setCurrentUser(mappedUser);
    
    return { token: result.token, user: mappedUser };
  },
  
  verifyToken: async () => {
    const result = await api.get<{ valid: boolean; user: BackendUser }>('/auth/verify-token');
    
    // Map backend user response to frontend format
    const mappedUser: User = {
      _id: result.user.id || result.user._id || '',
      username: result.user.username || '',
      email: result.user.email || '',
      role: result.user.role || 'user',
      phone: result.user.phone || '',
      bio: result.user.bio || '',
      walletId: result.user.walletId || '',
      walletAddress: result.user.walletAddress || '',
      captchaVerified: result.user.captchaVerified || false,
      isActive: result.user.isActive !== false,
      isEmailVerified: result.user.isEmailVerified || false,
      profileImage: result.user.profileImage || '',
      createdAt: result.user.createdAt || new Date().toISOString(),
      updatedAt: result.user.updatedAt,
      lastLogin: result.user.lastLogin || ''
    };
    
    return { valid: result.valid, user: mappedUser };
  },
  
  updateProfile: async (profileData: UpdateProfileData) => {
    const result = await api.patch<{ user: BackendUser; message?: string }>('/auth/profile', profileData);
    
    // Map backend user response to frontend format
    const mappedUser: User = {
      _id: result.user.id || result.user._id || '',
      username: result.user.username || '',
      email: result.user.email || '',
      role: result.user.role || 'user',
      phone: result.user.phone || '',
      bio: result.user.bio || '',
      walletId: result.user.walletId || '',
      walletAddress: result.user.walletAddress || '',
      captchaVerified: result.user.captchaVerified || false,
      isActive: result.user.isActive !== false,
      isEmailVerified: result.user.isEmailVerified || false,
      profileImage: result.user.profileImage || '',
      createdAt: result.user.createdAt || new Date().toISOString(),
      updatedAt: result.user.updatedAt,
      lastLogin: result.user.lastLogin || ''
    };
    
    return { user: mappedUser, message: result.message };
  },
  
  getProfile: async () => {
    const result = await api.get<{ user: BackendUser }>('/auth/profile');
    
    // Map backend user response to frontend format
    const mappedUser: User = {
      _id: result.user.id || result.user._id || '',
      username: result.user.username || '',
      email: result.user.email || '',
      role: result.user.role || 'user',
      phone: result.user.phone || '',
      bio: result.user.bio || '',
      walletId: result.user.walletId || '',
      walletAddress: result.user.walletAddress || '',
      captchaVerified: result.user.captchaVerified || false,
      isActive: result.user.isActive !== false,
      isEmailVerified: result.user.isEmailVerified || false,
      profileImage: result.user.profileImage || '',
      createdAt: result.user.createdAt || new Date().toISOString(),
      updatedAt: result.user.updatedAt,
      lastLogin: result.user.lastLogin || ''
    };
    
    return { user: mappedUser };
  },
  
  logout: () => {
    api.clearAuth();
    return Promise.resolve({ message: 'Logged out successfully' });
  }
};

// Wallet API (for blockchain interactions)
export const walletApi = {
  getBalance: (walletId: string) => api.get<{ balance: number; currency: string }>(`/wallet/${walletId}/balance`),
  getTransactions: (walletId: string, params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return api.get<{ transactions: WalletTransaction[]; pagination: PaginationInfo }>(`/wallet/${walletId}/transactions${query}`);
  },
  sendTransaction: (transactionData: SendTransactionData) => api.post<{ transaction: WalletTransaction }>('/wallet/send', transactionData),
};

// Export the api instance for direct use if needed
export { api };

// Types - Backend User format (as returned by your backend)
interface BackendUser {
  id?: string;
  _id?: string;
  username: string;
  email: string;
  role: 'user' | 'organizer' | 'admin';
  phone?: string;
  bio?: string;
  walletId?: string;
  walletAddress?: string;
  captchaVerified?: boolean;
  isActive?: boolean;
  isEmailVerified?: boolean;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

// Frontend User interface (normalized format)
export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'organizer' | 'admin';
  phone?: string;
  bio?: string;
  walletId?: string;
  walletAddress?: string;
  captchaVerified: boolean;
  isActive: boolean;
  isEmailVerified: boolean;
  profileImage?: string;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface Event {
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
  ticketClasses: TicketClass[];
  createdAt: string;
}

export interface TicketClass {
  _id: string;
  eventId: string;
  type: 'Standard' | 'Premium' | 'VIP';
  maxSupply: number;
  price: number;
  tokenAddress?: string;
  createdAt: string;
}

export interface Ticket {
  _id: string;
  ticketClassId: string;
  buyerId: string;
  serial?: number;
  qrHash?: string;
  status: 'Minted' | 'Active' | 'Used' | 'Returned' | 'Expired';
  purchaseSlot: string;
  paymentStatus: 'Pending' | 'Completed' | 'Failed';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

export interface TicketWithDetails extends Ticket {
  ticketClassId: {
    _id: string;
    eventId: Event;
    type: 'Standard' | 'Premium' | 'VIP';
    maxSupply: number;
    price: number;
    tokenAddress?: string;
    createdAt: string;
  };
  buyerId: {
    _id: string;
    username: string;
    email: string;
  };
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalTickets: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface WalletTransaction {
  _id: string;
  walletId: string;
  type: 'received' | 'sent' | 'ticket_purchase' | 'refund';
  amount: number;
  currency: string;
  from?: string;
  to?: string;
  eventId?: string;
  ticketId?: string;
  status: 'pending' | 'completed' | 'failed';
  hash?: string;
  createdAt: string;
}

export interface CreateEventData {
  name: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  ticketExpiryHours?: number;
  category: string;
  image: string;
  ticketClasses: {
    type: 'Standard' | 'Premium' | 'VIP';
    maxSupply: number;
    price: number;
    tokenAddress?: string;
  }[];
}

export interface BookTicketData {
  eventId: string;
  ticketType: 'Standard' | 'Premium' | 'VIP';
}

export interface VerifyPaymentData {
  ticketId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

export interface CreateOrderData {
  ticketId: string;
  amount: number;
}

export interface LoginData {
  email: string;
  password: string;
  userType?: 'user' | 'organizer';
  recaptchaToken?: string;
  twoFactorCode?: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'organizer';
  captchaToken?: string;
}

export interface UpdateProfileData {
  username?: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
}

export interface SendTransactionData {
  fromWalletId: string;
  toAddress: string;
  amount: number;
  currency: string;
  memo?: string;
}