// Export all mock APIs
export * from './menuItems';
export * from './orders';
export * from './employees';
export * from './customers';
export * from './inventory';
export * from './auth';
export * from './data';

// Check if we should use mock data
export const USE_MOCK_DATA =
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || !process.env.NEXT_PUBLIC_API_URL;

