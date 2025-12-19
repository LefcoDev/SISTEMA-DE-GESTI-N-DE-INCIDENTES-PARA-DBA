export {};

declare global {
  interface Window {
    electron: {
      ping: () => Promise<void>;
    };
  }
}
