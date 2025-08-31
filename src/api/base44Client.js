import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68ad6e7159eefb287c40c70f", 
  requiresAuth: true // Ensure authentication is required for all operations
});
