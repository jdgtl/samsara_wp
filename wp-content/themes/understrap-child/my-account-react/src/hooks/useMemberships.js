/**
 * useMemberships Hook
 * Hook for fetching additional memberships/products
 */

import { useState, useEffect, useCallback } from 'react';
import { productsApi } from '../services/woocommerce';

export const useMemberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMemberships = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsApi.getUserMemberships();
      setMemberships(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch memberships');
      console.error('Error fetching memberships:', err);
      // Don't fail completely - return empty array
      setMemberships([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  return {
    memberships,
    loading,
    error,
    refetch: fetchMemberships,
  };
};
