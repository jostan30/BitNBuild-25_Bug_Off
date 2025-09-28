interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id?: string;
    handler: (response: RazorpayResponse) => void;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    theme?: { color?: string };
    modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
    open(): void;
    close(): void;
}

interface RazorpayConstructor {
    new (options: RazorpayOptions): RazorpayInstance;
}

declare global {
    interface Window {
        Razorpay?: RazorpayConstructor;
    }
}

declare global {
  interface Window {
    grecaptcha: {
      render: (element: HTMLElement | null, options: {
        sitekey: string;
        theme?: 'light' | 'dark';
        size?: 'normal' | 'compact';
        callback?: (token: string) => void;
      }) => number;
      ready: (callback: () => void) => void;
      execute?: (siteKey: string, options?: { action: string }) => Promise<string>;
    };
  }
}

