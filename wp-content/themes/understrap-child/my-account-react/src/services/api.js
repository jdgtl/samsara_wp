/**
 * Base API Service for WordPress/WooCommerce REST API
 * Handles authentication, error handling, and base configuration
 */

import axios from 'axios';

// Simple debug logger - only logs to console in development
const debugLog = (message, data = null) => {
  // Only log in development (can be controlled via environment variable if needed)
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString();
    console.log(`[API ${timestamp}]`, message, data);
  }
};

// Get configuration from WordPress localized script
const getConfig = () => {
  if (typeof window !== 'undefined' && window.samsaraMyAccount) {
    return window.samsaraMyAccount;
  }
  throw new Error('WordPress configuration not found');
};

// Create axios instance with default config
const createApiInstance = () => {
  const config = getConfig();

  const instance = axios.create({
    baseURL: config.apiUrl,
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': config.nonce,
    },
    withCredentials: true, // Required for WordPress REST API cookie authentication
    timeout: 30000, // 30 seconds
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      debugLog('API Request', {
        url: config.url,
        method: config.method,
        hasNonce: !!config.headers['X-WP-Nonce'],
        withCredentials: config.withCredentials,
        userId: getConfig().userId,
      });
      return config;
    },
    (error) => {
      debugLog('Request Error', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Handle common errors
      if (error.response) {
        const { status, data } = error.response;

        // Unauthorized - session expired
        if (status === 401 || status === 403) {
          debugLog('Authentication failed', {
            status,
            url: error.config?.url,
            method: error.config?.method,
          });

          console.error('API Authentication failed. Please log in again.');

          // Redirect to login if genuinely logged out
          // (Uncomment if auto-redirect to login is desired)
          // if (typeof window !== 'undefined') {
          //   window.location.href = getConfig().siteUrl + '/wp-login.php';
          // }
        }

        // Check if we got HTML instead of JSON (PHP fatal error)
        if (typeof data === 'string' && (data.includes('<!DOCTYPE') || data.includes('<html'))) {
          return Promise.reject({
            status,
            message: 'Server error occurred. The operation may have completed successfully - please refresh the page to verify.',
            code: 'server_error_html_response',
            data: {
              html_error: true,
              raw_response: data.substring(0, 500), // First 500 chars for debugging
            },
          });
        }

        // Return formatted error
        return Promise.reject({
          status,
          message: data.message || 'An error occurred',
          code: data.code || 'unknown_error',
          data: data,
        });
      }

      // Network error
      if (error.request) {
        return Promise.reject({
          status: 0,
          message: 'Network error. Please check your connection.',
          code: 'network_error',
        });
      }

      return Promise.reject({
        status: 0,
        message: error.message || 'An unexpected error occurred',
        code: 'unknown_error',
      });
    }
  );

  return instance;
};

// Create API instance
const api = createApiInstance();

/**
 * Generic GET request
 */
export const get = async (url, params = {}) => {
  try {
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Generic POST request
 */
export const post = async (url, data = {}) => {
  try {
    const response = await api.post(url, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Generic PUT request
 */
export const put = async (url, data = {}) => {
  try {
    const response = await api.put(url, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Generic DELETE request
 */
export const del = async (url, params = {}) => {
  try {
    const response = await api.delete(url, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get current user ID from config
 */
export const getCurrentUserId = () => {
  const config = getConfig();
  return config.userId;
};

/**
 * Get user data from config
 */
export const getUserData = () => {
  const config = getConfig();
  return config.userData;
};

/**
 * Get site configuration
 */
export const getSiteConfig = () => {
  return getConfig();
};

export default api;
