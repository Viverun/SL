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
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (data) {
    headers["Content-Type"] = "application/json";
  }

  console.log(`[apiRequest] Attempting to fetch token for URL: ${url}`);
  const token = getAuthToken(); // Relies on localStorage.getItem

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log(`[apiRequest] Token FOUND and Authorization header SET for URL: ${url}. Token prefix: ${token.substring(0, 10)}...`);
  } else {
    console.warn(`[apiRequest] Token NOT FOUND for URL: ${url}. Authorization header will be MISSING.`);
    // Forcing a check directly from localStorage again for extra debugging
    const directTokenCheck = localStorage.getItem('token');
    if (directTokenCheck) {
        console.warn(`[apiRequest] Direct localStorage check FOUND a token: ${directTokenCheck.substring(0,10)}... This is unexpected if getAuthToken failed.`);
        headers["Authorization"] = `Bearer ${directTokenCheck}`; // Attempt to use it
        console.warn(`[apiRequest] Fallback Authorization header SET for URL: ${url}.`);
    } else {
        console.warn(`[apiRequest] Direct localStorage check also found NO token.`);
    }
  }

  console.log(`[apiRequest] Final headers for ${url}: ${JSON.stringify(headers)}`);

  let apiUrl = url;
  if (!url.startsWith('http')) {
    const isVercel = window.location.hostname.includes('vercel.app');
    if (isVercel) {
      if (!url.startsWith('/api/')) {
        apiUrl = `${window.location.origin}/api${url.startsWith('/') ? url : `/${url}`}`;
      } else {
        apiUrl = `${window.location.origin}${url}`;
      }
    } else {
      apiUrl = `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    console.log(`[apiRequest] Resolved API URL: ${apiUrl}`);
  }

  try {
    const fetchOptions: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };
    
    console.log(`[apiRequest] Sending ${method} request to: ${apiUrl}. Options: ${JSON.stringify({method: fetchOptions.method, headers: fetchOptions.headers, hasBody: !!fetchOptions.body})}`);
    const res = await fetch(apiUrl, fetchOptions);
    console.log(`[apiRequest] Response from ${url}: ${res.status} ${res.statusText}`);
    if (res.status === 401) {
      console.error('[apiRequest] Authentication failed (401). Token might be invalid, expired, or missing.');
    }
    return res;
  } catch (error) {
    console.error(`[apiRequest] Fetch error for ${url}:`, error);
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
