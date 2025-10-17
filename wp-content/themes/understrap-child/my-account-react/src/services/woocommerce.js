/**
 * WooCommerce API Service
 * Methods for interacting with WooCommerce REST API
 */

import { get, post, put, del, getCurrentUserId, getSiteConfig } from './api';

const WC_API_BASE = 'wc/v3';
const WCS_API_BASE = 'wc/v1'; // WooCommerce Subscriptions

/**
 * Orders API
 */
export const ordersApi = {
  /**
   * Get all orders for current user
   */
  async getOrders(params = {}) {
    const userId = getCurrentUserId();
    const defaultParams = {
      customer: userId,
      per_page: 100,
      orderby: 'date',
      order: 'desc',
      ...params,
    };

    return await get(`${WC_API_BASE}/orders`, defaultParams);
  },

  /**
   * Get single order by ID
   */
  async getOrder(orderId) {
    return await get(`${WC_API_BASE}/orders/${orderId}`);
  },

  /**
   * Get orders with pagination
   */
  async getOrdersPaginated(page = 1, perPage = 10, filters = {}) {
    const userId = getCurrentUserId();
    const params = {
      customer: userId,
      page,
      per_page: perPage,
      orderby: 'date',
      order: 'desc',
      ...filters,
    };

    const response = await get(`${WC_API_BASE}/orders`, params);

    // Note: WooCommerce returns pagination info in headers
    // We may need to handle this differently
    return response;
  },
};

/**
 * Subscriptions API
 */
export const subscriptionsApi = {
  /**
   * Get all subscriptions for current user
   */
  async getSubscriptions(params = {}) {
    const userId = getCurrentUserId();
    const defaultParams = {
      customer: userId,
      per_page: 100,
      ...params,
    };

    return await get(`${WCS_API_BASE}/subscriptions`, defaultParams);
  },

  /**
   * Get single subscription by ID
   */
  async getSubscription(subscriptionId) {
    return await get(`${WCS_API_BASE}/subscriptions/${subscriptionId}`);
  },

  /**
   * Get active subscriptions only
   */
  async getActiveSubscriptions() {
    const userId = getCurrentUserId();
    return await get(`${WCS_API_BASE}/subscriptions`, {
      customer: userId,
      status: 'active',
    });
  },

  /**
   * Get orders related to a subscription
   */
  async getSubscriptionOrders(subscriptionId) {
    return await get(`${WC_API_BASE}/orders`, {
      subscription: subscriptionId,
    });
  },

  /**
   * Update subscription status (pause, cancel, reactivate)
   * Note: This may need custom endpoint as WCS API has limited support
   */
  async updateSubscriptionStatus(subscriptionId, status) {
    return await put(`${WCS_API_BASE}/subscriptions/${subscriptionId}`, {
      status: status, // 'active', 'on-hold', 'cancelled', etc.
    });
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId) {
    return await this.updateSubscriptionStatus(subscriptionId, 'cancelled');
  },

  /**
   * Pause subscription
   */
  async pauseSubscription(subscriptionId) {
    return await this.updateSubscriptionStatus(subscriptionId, 'on-hold');
  },

  /**
   * Resume subscription
   */
  async resumeSubscription(subscriptionId) {
    return await this.updateSubscriptionStatus(subscriptionId, 'active');
  },
};

/**
 * Customers API (for user profile data, addresses, etc.)
 */
export const customersApi = {
  /**
   * Get current customer data
   */
  async getCurrentCustomer() {
    const userId = getCurrentUserId();
    return await get(`${WC_API_BASE}/customers/${userId}`);
  },

  /**
   * Update customer data
   */
  async updateCustomer(data) {
    const userId = getCurrentUserId();
    return await put(`${WC_API_BASE}/customers/${userId}`, data);
  },

  /**
   * Update billing address
   */
  async updateBillingAddress(address) {
    const userId = getCurrentUserId();
    return await put(`${WC_API_BASE}/customers/${userId}`, {
      billing: address,
    });
  },

  /**
   * Update shipping address
   */
  async updateShippingAddress(address) {
    const userId = getCurrentUserId();
    return await put(`${WC_API_BASE}/customers/${userId}`, {
      shipping: address,
    });
  },
};

/**
 * Payment Methods API
 * Note: WooCommerce doesn't have a dedicated REST API for payment methods
 * This will need custom implementation or use WooCommerce Payment Tokens
 */
export const paymentMethodsApi = {
  /**
   * Get payment methods for current user
   * This requires custom endpoint
   */
  async getPaymentMethods() {
    // Use custom endpoint we'll create
    return await get('samsara/v1/payment-methods');
  },

  /**
   * Add payment method
   * This typically requires payment gateway integration (Stripe, etc.)
   */
  async addPaymentMethod(data) {
    return await post('samsara/v1/payment-methods', data);
  },

  /**
   * Delete payment method
   */
  async deletePaymentMethod(methodId) {
    return await del(`samsara/v1/payment-methods/${methodId}`);
  },

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(methodId) {
    return await put(`samsara/v1/payment-methods/${methodId}`, {
      is_default: true,
    });
  },
};

/**
 * Products API (for memberships, if needed)
 */
export const productsApi = {
  /**
   * Get user's purchased products/memberships
   * This may require custom logic
   */
  async getUserMemberships() {
    // Use custom endpoint
    return await get('samsara/v1/memberships');
  },
};

/**
 * Dashboard Stats API
 * Custom endpoint for dashboard summary
 */
export const statsApi = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    return await get('samsara/v1/stats');
  },
};

/**
 * Transform WooCommerce API responses to match our mock data structure
 */
export const transformers = {
  /**
   * Transform WC Order to our Order format
   */
  order: (wcOrder) => {
    return {
      id: wcOrder.id.toString(),
      date: wcOrder.date_created,
      status: wcOrder.status,
      items: wcOrder.line_items.map(item => item.name),
      total: parseFloat(wcOrder.total),
      currency: wcOrder.currency,
      paymentMethod: wcOrder.payment_method_title,
      subtotal: parseFloat(wcOrder.subtotal || wcOrder.total),
      shipping: parseFloat(wcOrder.shipping_total || 0),
      tax: parseFloat(wcOrder.total_tax || 0),
      discount: parseFloat(wcOrder.discount_total || 0),
    };
  },

  /**
   * Transform WC Subscription to our Subscription format
   */
  subscription: (wcSub) => {
    return {
      id: wcSub.id.toString(),
      startDate: wcSub.date_created,
      status: wcSub.status,
      nextPaymentDate: wcSub.next_payment_date || null,
      nextPaymentAmount: parseFloat(wcSub.total || 0),
      planName: wcSub.line_items?.[0]?.name || 'Subscription',
      billingInterval: wcSub.billing_period || 'monthly',
    };
  },

  /**
   * Transform WC Customer to our format
   */
  customer: (wcCustomer) => {
    return {
      id: wcCustomer.id.toString(),
      firstName: wcCustomer.first_name,
      lastName: wcCustomer.last_name,
      email: wcCustomer.email,
      billing: wcCustomer.billing,
      shipping: wcCustomer.shipping,
      avatar: wcCustomer.avatar_url,
    };
  },
};

export default {
  orders: ordersApi,
  subscriptions: subscriptionsApi,
  customers: customersApi,
  paymentMethods: paymentMethodsApi,
  products: productsApi,
  stats: statsApi,
  transformers,
};
