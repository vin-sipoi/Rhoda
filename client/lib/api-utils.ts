/**
 * Utility for making authenticated API requests with automatic error handling
 */

interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean;
  autoRefresh?: boolean;
}

/**
 * Makes an authenticated API request with automatic token handling
 */
export const apiRequest = async (
  url: string,
  options: ApiRequestOptions = {}
): Promise<Response> => {
  const { requireAuth = true, autoRefresh = true, ...fetchOptions } = options;

  // Get token from localStorage
  const token = localStorage.getItem('jwt');

  // Set up headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Add auth header if token exists and auth is required
  if (requireAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Make the request
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // Handle 401 errors (token expired)
  if (response.status === 401 && autoRefresh && token) {
    console.warn('Token expired, attempting to refresh user session');
    
    // Try to refresh user profile to validate token
    try {
      const refreshResponse = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!refreshResponse.ok) {
        // Token is invalid, clear it and redirect to login
        localStorage.removeItem('jwt');
        window.location.href = '/auth/sign-in';
        throw new Error('Session expired, please log in again');
      }
    } catch (error) {
      // If refresh fails, clear token and redirect
      localStorage.removeItem('jwt');
      window.location.href = '/auth/sign-in';
      throw new Error('Session expired, please log in again');
    }
  }

  return response;
};

/**
 * Makes an authenticated API request and returns JSON data
 */
export const apiRequestJson = async <T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  const response = await apiRequest(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }

  return response.json();
};
