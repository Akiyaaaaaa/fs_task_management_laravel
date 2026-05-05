'use client';
import axiosInstance from './axios';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let echoInstance: any = null;

export async function getEcho() {
  if (echoInstance) return echoInstance;

  if (typeof window === 'undefined') return null;

  // Import pusher-js first and set it globally
  const { default: Pusher } = await import('pusher-js');
  (window as any).Pusher = Pusher;

  // Then import Echo
  const { default: Echo } = await import('laravel-echo');

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'reverb-key',
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || '127.0.0.1',
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME || 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    authorizer: (channel: any) => {
      return {
        authorize: (socketId: string, callback: Function) => {
          axiosInstance
            .post('/broadcasting/auth', {
              socket_id: socketId,
              channel_name: channel.name,
            })
            .then((response) => {
              callback(false, response.data);
            })
            .catch((error) => {
              callback(true, error);
            });
        },
      };
    },
  });

  return echoInstance;
}

export function disconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}
