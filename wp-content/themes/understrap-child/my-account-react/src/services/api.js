/**
 * Base API Service for WordPress/WooCommerce REST API
 * Handles authentication, error handling, and base configuration
 */

import axios from 'axios';

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
    timeout: 30000, // 30 seconds
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      return config;
    },
    (error) => {
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
          console.error('Authentication failed. Redirecting to login...');
          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = getConfig().siteUrl + '/wp-login.php';
          }
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
