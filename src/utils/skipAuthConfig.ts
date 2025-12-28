// utils/skipAuthConfig.ts
interface SkipAuthConfig {
    path: string;
    method: string;
  }
  
  export const skipAuth: SkipAuthConfig[] = [
    { path: '/send-mobile-otp/?', method: 'POST' },
    { path: '/verify-mobile-otp/?', method: 'POST' },
    { path: '/signup/?', method: 'POST' },
    { path: '/login/?', method: 'POST' },
    { path: '/google-login/?', method: 'POST' },
    { path: '/verify-otp/?', method: 'POST' },
];
  