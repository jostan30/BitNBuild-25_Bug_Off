// lib/api.ts
const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` || 'http://localhost:5000/api';

// API client with auth headers
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
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

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
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
};

// Payment API
export const paymentApi = {
  createOrder: (orderData: CreateOrderData) => api.post<{ order: RazorpayOrder }>('/payments/create-order', orderData),
  getPaymentStatus: (ticketId: string) => api.get<{ status: string }>(`/payments/status/${ticketId}`),
};

// Auth API
export const authApi = {
  login: (credentials: LoginData) => api.post<{ token: string; user: User }>('/auth/login', credentials),
  signup: (userData: SignupData) => api.post<{ token: string; user: User }>('/auth/signup', userData),
};

// Types
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

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'organizer' | 'admin';
  walletAddress?: string;
  captchaVerified: boolean;
  createdAt: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
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
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'organizer';
  captchaToken: string;
}