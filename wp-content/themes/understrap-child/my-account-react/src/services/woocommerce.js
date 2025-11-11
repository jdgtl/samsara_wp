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
   * Uses custom endpoint that directly calls wcs_get_users_subscriptions()
   * This bypasses WooCommerce REST API issues
   */
  async getSubscriptions(params = {}) {
    return await get('samsara/v1/user-subscriptions', params);
  },

  /**
   * Get single subscription by ID
   * Still uses WC REST API as it works for single subscriptions
   */
  async getSubscription(subscriptionId) {
    return await get(`${WCS_API_BASE}/subscriptions/${subscriptionId}`);
  },

  /**
   * Get active subscriptions only
   * Uses custom endpoint with status filter
   */
  async getActiveSubscriptions() {
    return await get('samsara/v1/user-subscriptions', {
      status: 'active',
    });
  },

  /**
   * Get orders related to a subscription
   * Uses custom endpoint that leverages WooCommerce Subscriptions internal methods
   */
  async getSubscriptionOrders(subscriptionId) {
    try {
      // Use custom Samsara endpoint that properly fetches related orders
      const orders = await get(`samsara/v1/subscriptions/${subscriptionId}/orders`);

      return Array.isArray(orders) ? orders : [];
    } catch (err) {
      console.error('Error fetching subscription orders:', err);
      return [];
    }
  },

  /**
   * Update subscription status (cancel only)
   * Note: Pause/resume functionality has been removed per business requirements
   */
  async updateSubscriptionStatus(subscriptionId, status, endDate = null) {
    const data = {
      status: status, // 'cancelled' only
    };

    // Set end_date to prevent "Jan 1, 1970" issue
    // When cancelling, end_date should be set to the end of prepaid term (next payment date)
    if (status === 'cancelled' && endDate) {
      data.end_date = endDate;
    }

    return await put(`${WCS_API_BASE}/subscriptions/${subscriptionId}`, data);
  },

  /**
   * Cancel subscription
   * @param {string} subscriptionId - The subscription ID
   * @param {string} endDate - Optional end date (defaults to next payment date to preserve prepaid term)
   */
  async cancelSubscription(subscriptionId, endDate = null) {
    return await this.updateSubscriptionStatus(subscriptionId, 'cancelled', endDate);
  },

  /**
   * Get cancellation eligibility for a subscription
   */
  async getCancellationEligibility(subscriptionId) {
    return await get(`samsara/v1/subscriptions/${subscriptionId}/cancellation-eligibility`);
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
   * Initialize adding payment method - returns Stripe Setup Intent
   * This creates a Setup Intent on the backend and returns client_secret and publishable_key
   */
  async initializeAddPaymentMethod() {
    return await post('samsara/v1/payment-methods');
  },

  /**
   * Confirm payment method after Stripe setup succeeds
   * Called after Stripe.js confirms the card setup
   */
  async confirmPaymentMethod(setupIntentId, setAsDefault = false) {
    return await post('samsara/v1/payment-methods/confirm', {
      setup_intent_id: setupIntentId,
      set_as_default: setAsDefault,
    });
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
    const productId = wcSub.line_items?.[0]?.product_id;
    const productUrl = productId ? `/product/?p=${productId}` : '/shop/';

    return {
      id: wcSub.id.toString(),
      startDate: wcSub.date_created,
      status: wcSub.status === 'cancelled' ? 'canceled' : wcSub.status,
      nextPaymentDate: wcSub.next_payment_date || null,
      nextPaymentAmount: parseFloat(wcSub.total || 0),
      planName: wcSub.line_items?.[0]?.name || 'Subscription',
      billingInterval: wcSub.billing_period || 'monthly',
      canceledAt: wcSub.date_cancelled || wcSub.end_date || null,
      relatedOrders: wcSub.related_orders || [],
      productUrl: productUrl,
      productId: productId,
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

/**
 * Gift Cards API
 */
export const giftCardsApi = {
  /**
   * Get all gift cards for current user
   */
  async getGiftCards(params = {}) {
    return await get('samsara/v1/gift-cards', params);
  },

  /**
   * Get single gift card by ID
   */
  async getGiftCard(cardId) {
    return await get(`samsara/v1/gift-cards/${cardId}`);
  },

  /**
   * Check gift card balance by code
   */
  async checkBalance(code) {
    return await get(`samsara/v1/gift-cards/balance/${code}`);
  },

  /**
   * Redeem gift card to account for checkout use
   */
  async redeemToAccount(cardId) {
    return await post(`samsara/v1/gift-cards/${cardId}/redeem`);
  },
};

/**
 * Avatar API
 */
export const avatarApi = {
  /**
   * Upload avatar image
   */
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${window.samsaraMyAccount.apiUrl}samsara/v1/avatar/upload`, {
      method: 'POST',
      headers: {
        'X-WP-Nonce': window.samsaraMyAccount.nonce,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload avatar');
    }

    return await response.json();
  },

  /**
   * Get avatar preferences
   */
  async getPreferences() {
    return await get('samsara/v1/avatar/preferences');
  },

  /**
   * Save avatar preferences
   */
  async savePreferences(preferences) {
    return await put('samsara/v1/avatar/preferences', preferences);
  },
};

export default {
  orders: ordersApi,
  subscriptions: subscriptionsApi,
  customers: customersApi,
  paymentMethods: paymentMethodsApi,
  products: productsApi,
  stats: statsApi,
  giftCards: giftCardsApi,
  avatars: avatarApi,
  transformers,
};
