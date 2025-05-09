import { authService } from './auth';

/**
 * Custom API client that handles authentication and errors
 */
export const apiClient = {
  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - JSON response
   */
  get: async (endpoint, options = {}) => {
    return apiClient.request('GET', endpoint, null, options);
  },

  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {Object} data - Request body data
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - JSON response
   */
  post: async (endpoint, data, options = {}) => {
    return apiClient.request('POST', endpoint, data, options);
  },

  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {Object} data - Request body data
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - JSON response
   */
  put: async (endpoint, data, options = {}) => {
    return apiClient.request('PUT', endpoint, data, options);
  },

  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - JSON response
   */
  delete: async (endpoint, options = {}) => {
    return apiClient.request('DELETE', endpoint, null, options);
  },

  /**
   * Make a request to the API
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {Object} data - Request body data
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - JSON response
   */
  request: async (method, endpoint, data = null, options = {}) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/${endpoint.endsWith('/') ? endpoint : endpoint + '/'}`;
    
    // Prepare headers with authentication token
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Add auth token and user if available
    const token = authService.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      
      // Add user object if available
      const userStr = localStorage.getItem('user');
      if (userStr) {
        headers.user = userStr;
      }
    }
    
    // Build request options
    const requestOptions = {
      method,
      headers,
      ...options,
    };
    
    // Add body for non-GET requests
    if (data && method !== 'GET') {
      requestOptions.body = JSON.stringify(data);
    }
    
    try {
      console.log(`API Request ${method} ${url}:`, { headers, data });
      const response = await fetch(url, requestOptions);
      
      // Handle 401 Unauthorized (token expired)
      if (response.status === 401) {
        // Attempt to refresh token or logout
        authService.logout();
        throw new Error('Your session has expired. Please log in again.');
      }
      
      const result = await response.json();
      console.log(`API Response ${method} ${url}:`, result);
      
      if (!response.ok) {
        throw new Error(result.message || `Error ${response.status}`);
      }
      
      return result;
    } catch (error) {
      console.error(`API Error (${method} ${endpoint}):`, error);
      throw error;
    }
  }
};

/**
 * Enhanced version of the fetcher function for React Query
 * @param {string} endpoint - API endpoint
 * @returns {Promise<any>} - JSON response
 */
export const queryFetcher = async (endpoint) => {
  try {
    return await apiClient.get(endpoint);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch data');
  }
};