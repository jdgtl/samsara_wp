/**
 * useSubscriptions Hook
 * Hook for fetching and managing subscription data
 */

import { useState, useEffect, useCallback } from 'react';
import { subscriptionsApi, transformers } from '../services/woocommerce';

export const useSubscriptions = (filters = {}) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subscriptionsApi.getSubscriptions(filters);
      const transformedSubs = Array.isArray(data) ? data.map(transformers.subscription) : [];
      setSubscriptions(transformedSubs);
    } catch (err) {
      setError(err.message || 'Failed to fetch subscriptions');
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return {
    subscriptions,
    loading,
    error,
    refetch: fetchSubscriptions,
  };
};

export const useSubscription = (subscriptionId) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscription = useCallback(async () => {
    if (!subscriptionId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await subscriptionsApi.getSubscription(subscriptionId);
      setSubscription(transformers.subscription(data));
    } catch (err) {
      setError(err.message || 'Failed to fetch subscription');
      console.error('Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  }, [subscriptionId]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscription,
    loading,
    error,
    refetch: fetchSubscription,
  };
};

export const useActiveSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActiveSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subscriptionsApi.getActiveSubscriptions();
      const transformedSubs = Array.isArray(data) ? data.map(transformers.subscription) : [];
      setSubscriptions(transformedSubs);
    } catch (err) {
      setError(err.message || 'Failed to fetch active subscriptions');
      console.error('Error fetching active subscriptions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveSubscriptions();
  }, [fetchActiveSubscriptions]);

  return {
    subscriptions,
    loading,
    error,
    refetch: fetchActiveSubscriptions,
  };
};

export const useSubscriptionActions = () => {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const cancelSubscription = async (subscriptionId, endDate = null) => {
    try {
      setActionLoading(true);
      setActionError(null);
      await subscriptionsApi.cancelSubscription(subscriptionId, endDate);
      return { success: true };
    } catch (err) {
      setActionError(err.message || 'Failed to cancel subscription');
      console.error('Error cancelling subscription:', err);
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    cancelSubscription,
    actionLoading,
    actionError,
  };
};

export const useSubscriptionOrders = (subscriptionId) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!subscriptionId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await subscriptionsApi.getSubscriptionOrders(subscriptionId);
      const transformedOrders = Array.isArray(data) ? data.map(transformers.order) : [];
      setOrders(transformedOrders);
    } catch (err) {
      setError(err.message || 'Failed to fetch subscription orders');
      console.error('Error fetching subscription orders:', err);
    } finally {
      setLoading(false);
    }
  }, [subscriptionId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
  };
};
