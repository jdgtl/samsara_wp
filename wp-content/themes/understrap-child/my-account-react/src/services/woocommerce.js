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
      // Format the date to "Y-m-d H:i:s" format required by WooCommerce
      // Convert ISO string or any date string to the required format
      try {
        const date = new Date(endDate);
        // Check if date is valid
        if (!isNaN(date.getTime())) {
          // Format to "YYYY-MM-DD HH:mm:ss"
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const seconds = String(date.getSeconds()).padStart(2, '0');
          data.end_date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        } else {
          console.warn('Invalid end date provided for subscription cancellation:', endDate);
        }
      } catch (err) {
        console.error('Error formatting end date for subscription cancellation:', err);
      }
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

  /**
   * Get cancellation survey/offer for a subscription
   */
  async getCancellationSurvey(subscriptionId) {
    return await get(`samsara/v1/subscriptions/${subscriptionId}/cancellation-survey`);
  },

  /**
   * Cancel subscription with survey response
   * @param {string} subscriptionId - The subscription ID
   * @param {object} surveyData - Survey response data (offerId, surveyAnswer, surveyText, endDate)
   */
  async cancelSubscriptionWithSurvey(subscriptionId, surveyData) {
    return await post(`samsara/v1/subscriptions/${subscriptionId}/cancel-with-survey`, surveyData);
  },

  /**
   * Accept discount offer (keep subscription with discount)
   * @param {string} subscriptionId - The subscription ID
   * @param {object} offerData - Offer acceptance data (offerId, surveyAnswer, surveyText)
   */
  async takeDiscountOffer(subscriptionId, offerData) {
    return await post(`samsara/v1/subscriptions/${subscriptionId}/take-discount-offer`, offerData);
  },

  /**
   * Get subscription actions (including plugin-added actions like cancel URL)
   * @param {string} subscriptionId - The subscription ID
   */
  async getSubscriptionActions(subscriptionId) {
    return await get(`samsara/v1/subscriptions/${subscriptionId}/actions`);
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
      items: wcOrder.line_items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price || 0),
        subtotal: parseFloat(item.subtotal || 0),
        total: parseFloat(item.total || 0),
        // Get regular price from meta data if available (for on-sale products)
        regularPrice: item.meta_data?.find(m => m.key === '_regular_price')?.value
          ? parseFloat(item.meta_data.find(m => m.key === '_regular_price').value)
          : null,
      })),
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

    // Try to get cancellation date from multiple sources
    let canceledAt = wcSub.date_cancelled || null;

    // If not available, try schedule dates
    if (!canceledAt && wcSub.schedule && wcSub.schedule.cancelled) {
      canceledAt = wcSub.schedule.cancelled;
    }

    // If still not available and status is cancelled, try date_modified or date_updated
    if (!canceledAt && (wcSub.status === 'cancelled' || wcSub.status === 'canceled')) {
      canceledAt = wcSub.date_modified || wcSub.date_updated || null;
    }

    // Determine the correct status
    // WooCommerce returns "active" for trial subscriptions, but we need to detect and override
    let status = wcSub.status === 'cancelled' ? 'canceled' : wcSub.status;

    // Check if subscription is in trial period
    const trialEndDate = wcSub.trial_end_date || wcSub.schedule?.trial_end || null;
    if (trialEndDate && status === 'active') {
      const now = new Date();
      const trialEnd = new Date(trialEndDate);
      // If trial end date is in the future, it's a trial subscription
      if (trialEnd > now) {
        status = 'trial';
      }
    }

    return {
      id: wcSub.id.toString(),
      startDate: wcSub.date_created,
      status: status,
      nextPaymentDate: wcSub.next_payment_date || null,
      nextPaymentAmount: parseFloat(wcSub.total || 0),
      planName: wcSub.line_items?.[0]?.name || 'Subscription',
      billingInterval: wcSub.billing_period || 'monthly',
      canceledAt: canceledAt,
      endDate: wcSub.end_date || wcSub.next_payment_date || null, // When access/subscription ends
      relatedOrders: wcSub.related_orders || [],
      productUrl: productUrl,
      productId: productId,

      // Phase 6: Enhanced fields for better UX
      // On-hold / Payment failure data
      onHoldDate: wcSub.date_on_hold || wcSub.date_modified || null,
      paymentRetryDate: wcSub.payment_retry_date || wcSub.schedule?.payment_retry || null,
      failureReason: wcSub.payment_failure_reason || wcSub.payment_details?.failure_reason || null,

      // Pending payment data
      paymentUrl: wcSub.payment_url || null,

      // Trial data
      trialEndDate: wcSub.trial_end_date || wcSub.schedule?.trial_end || null,

      // Schedule metadata (full schedule object for reference)
      schedule: {
        nextPayment: wcSub.schedule?.next_payment || null,
        trialEnd: wcSub.schedule?.trial_end || null,
        cancelled: wcSub.schedule?.cancelled || null,
        end: wcSub.schedule?.end || null,
        paymentRetry: wcSub.schedule?.payment_retry || null,
      },
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
