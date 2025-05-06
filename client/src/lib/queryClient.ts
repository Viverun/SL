import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get JWT token from localStorage - improved to handle edge cases
export const getAuthToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No auth token found in localStorage');
      return null;
    }
    return token;
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

// Helper to ensure auth token is stored consistently
export const storeAuthToken = (token: string) => {
  try {
    localStorage.setItem('token', token);
    console.log('Auth token stored successfully');
    return true;
  } catch (error) {
    console.error('Failed to store auth token:', error);
    return false;
  }
};

// Helper to clear auth token
export const clearAuthToken = () => {
  try {
    localStorage.removeItem('token');
    console.log('Auth token cleared successfully');
    return true;
  } catch (error) {
    console.error('Failed to clear auth token:', error);
    return false;
  }
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Add auth token to headers if available
  const headers: Record<string, string> = {
    'Accept': 'application/json'
  };
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Include JWT token in Authorization header - with enhanced debugging
  try {
    const token = getAuthToken();
    console.log('API Request Token retrieval attempt:', token ? 'successful' : 'failed');
    
    if (token) {
      // Ensure proper Bearer token format
      headers["Authorization"] = `Bearer ${token}`;
      console.log(`Request to ${url} with Authorization header set, token prefix: ${token.substring(0, 10)}...`);
    } else {
      console.warn(`Request to ${url} WITHOUT Authorization header - token not found in localStorage`);
      
      // Try direct access to localStorage as fallback
      try {
        const fallbackToken = localStorage.getItem('token');
        if (fallbackToken) {
          headers["Authorization"] = `Bearer ${fallbackToken}`;
          console.log(`FALLBACK: Using direct localStorage token for ${url}`);
        } else {
          console.error('FALLBACK ALSO FAILED: No token in localStorage');
        }
      } catch (e) {
        console.error('Error accessing localStorage directly:', e);
      }
    }
  } catch (error) {
    console.error('Token access error:', error);
  }
  
  // Log complete headers for debugging
  console.log('Complete request headers:', JSON.stringify(headers));
  
  // Ensure full URL is used for all environments, especially for Vercel
  let apiUrl = url;
  if (!url.startsWith('http')) {
    // Check if the environment is a Vercel deployment
    const isVercel = window.location.hostname.includes('vercel.app');
    
    if (isVercel) {
      // For Vercel deployments, ensure we use the correct format for API URLs
      if (!url.startsWith('/api/')) {
        apiUrl = `${window.location.origin}/api${url.startsWith('/') ? url : `/${url}`}`;
      } else {
        apiUrl = `${window.location.origin}${url}`;
      }
      console.log(`Vercel environment detected - using API URL: ${apiUrl}`);
    } else {
      // Local development
      apiUrl = `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    console.log(`Using absolute URL for request: ${apiUrl}`);
  }
  
  try {
    // For Vercel deployment, use specific fetch options
    const fetchOptions: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      // Don't use credentials: 'same-origin' - can cause issues with Vercel
    };
    
    console.log(`Sending ${method} request to: ${apiUrl} with options:`, 
      JSON.stringify({
        method: fetchOptions.method,
        headers: fetchOptions.headers,
        hasBody: !!fetchOptions.body
      })
    );
    
    const res = await fetch(apiUrl, fetchOptions);
    
    console.log(`Response from ${url}: ${res.status} ${res.statusText}`);
    
    // Special handling for 401 errors
    if (res.status === 401) {
      console.error('Authentication failed - token may be invalid or missing');
      // You could trigger a logout here or request token refresh
    }
    
    return res;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    if (queryKey.length < 2) {
      throw new Error("Query key must contain endpoint and method");
    }

    const endpoint = queryKey[0] as string;
    const method = queryKey[1] as string;
    let data: unknown | undefined;

    if (queryKey.length > 2) {
      data = queryKey[2];
    }

    try {
      const response = await apiRequest(method, endpoint, data);
      
      // Log response status for debugging
      console.log(`Query response from ${endpoint}: status ${response.status}`);

      // If unauthorized and requested to navigate out
      if (response.status === 401) {
        console.warn(`Unauthorized request to ${endpoint}`);
        
        // Handle based on behavior option
        if (unauthorizedBehavior === "REDIRECT_TO_LOGIN") {
          console.log("Redirecting to login due to 401 response");
          window.location.href = "/login?session_expired=true";
          throw new Error("Authentication required");
        }
      }

      if (!response.ok) {
        // Attempt to parse error response
        try {
          const errorData = await response.json();
          console.error(`API error (${response.status}):`, errorData);
          throw new Error(errorData.message || `Request failed with status ${response.status}`);
        } catch (parseError) {
          console.error(`API error (${response.status}) with no parseable body`);
          throw new Error(`Request failed with status ${response.status}`);
        }
      }

      // Parse successful response
      const result = await response.json();
      return result as T;
    } catch (error) {
      console.error(`Query error for ${endpoint}:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
