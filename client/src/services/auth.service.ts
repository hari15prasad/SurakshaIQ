import { apiClient } from './api';

// Extend the Window interface to recognize the Catalyst SDK
declare global {
  interface Window {
    catalyst: any;
  }
}

/**
 * Ensures the Catalyst Web SDK is loaded and initialized.
 * Returns the auth module if available, or null if the SDK is absent.
 * Safe to call in browser environments only.
 */
function getCatalystAuth() {
  if (typeof window === 'undefined') return null;
  const sdk = window.catalyst;
  if (!sdk || !sdk.auth) return null;
  return sdk.auth;
}

export const authService = {
  /**
   * Triggers the Catalyst hosted login UI for a specific DOM element.
   * @param elementId The ID of the HTML element where the widget will be rendered.
   * @param redirectUrl The URL to redirect to after successful Catalyst login.
   */
  login(elementId: string, redirectUrl: string = '/dashboard') {
    const auth = getCatalystAuth();
    if (!auth) return;
    auth.signIn(elementId, {
      service_url: redirectUrl,
    });
  },

  /**
   * Signs the user out from Catalyst and redirects to the login page.
   * @param redirectUrl The URL to redirect to after logout.
   */
  logout(redirectUrl: string = '/login') {
    const auth = getCatalystAuth();
    if (auth) {
      apiClient.post('/auth/logout').catch(() => {});
      auth.signOut(window.location.origin + redirectUrl);
    } else {
      window.location.href = redirectUrl;
    }
  },

  /**
   * Uses Catalyst SDK to check if a user session is active.
   * Returns the basic Catalyst user details if authenticated.
   */
  async getCurrentUser(): Promise<any> {
    const auth = getCatalystAuth();
    if (!auth) throw new Error('Catalyst SDK is not available.');
    const response = await auth.isUserAuthenticated();
    return response.content;
  },

  /**
   * Verifies the active Catalyst session with the backend.
   * Ensures the officer exists in the system and retrieves full profile data (role, permissions).
   */
  async verifySession(): Promise<any> {
    const response = await apiClient.post('/auth/verify-catalyst');
    // Backend returns { access_token, token_type, officer }
    return response.data;
  },
};
