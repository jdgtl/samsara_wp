/**
 * useDashboard Hook
 * Hook for fetching dashboard statistics and summary data
 */

import { useState, useEffect, useCallback } from 'react';
import { statsApi } from '../services/woocommerce';
import { useActiveSubscriptions } from './useSubscriptions';
import { useMemberships } from './useMemberships';
import { usePaymentMethods, getExpiringPaymentMethods } from './usePaymentMethods';

/**
 * Comprehensive dashboard hook that fetches all dashboard data
 */
export const useDashboard = () => {
  // Fetch individual data sources
  const { subscriptions, loading: subsLoading, error: subsError } = useActiveSubscriptions();
  const { memberships, loading: membershipsLoading, error: membershipsError } = useMemberships();
  const { paymentMethods, loading: paymentsLoading, error: paymentsError } = usePaymentMethods();

  // Calculate derived data
  const primarySubscription = subscriptions.length > 0 ? subscriptions[0] : null;
  const expiringCards = getExpiringPaymentMethods(paymentMethods);

  // Aggregate loading and error states
  const loading = subsLoading || membershipsLoading || paymentsLoading;
  const error = subsError || membershipsError || paymentsError;

  return {
    primarySubscription,
    subscriptions,
    memberships,
    paymentMethods,
    expiringCards,
    loading,
    error,
  };
};

/**
 * Hook for custom dashboard stats endpoint (if available)
 */
export const useDashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await statsApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard stats');
      console.error('Error fetching dashboard stats:', err);
      // Don't fail completely
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};
