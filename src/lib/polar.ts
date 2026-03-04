import { Polar } from '@polar-sh/nextjs';

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || '',
  server: process.env.NODE_ENV === 'development' ? 'sandbox' : 'production',
});
