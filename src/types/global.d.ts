export {};

declare global {
  interface Window {
    electron: {
      ping: () => Promise<void>;
      showNotification: (options: { title: string; body: string; urgency?: 'low' | 'normal' | 'critical' }) => Promise<{ success: boolean; error?: string }>;
    };
  }
}
