/**
 * usePaymentMethods Hook
 * Hook for fetching and managing payment methods
 */

import { useState, useEffect, useCallback } from 'react';
import { paymentMethodsApi } from '../services/woocommerce';

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentMethodsApi.getPaymentMethods();
      setPaymentMethods(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch payment methods');
      console.error('❌ Error fetching payment methods:', err);
      // Don't fail completely - return empty array
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return {
    paymentMethods,
    loading,
    error,
    refetch: fetchPaymentMethods,
  };
};

export const usePaymentMethodActions = () => {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const addPaymentMethod = async (data) => {
    try {
      setActionLoading(true);
      setActionError(null);
      const result = await paymentMethodsApi.addPaymentMethod(data);
      return { success: true, data: result };
    } catch (err) {
      setActionError(err.message || 'Failed to add payment method');
      console.error('Error adding payment method:', err);
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  const deletePaymentMethod = async (methodId) => {
    try {
      setActionLoading(true);
      setActionError(null);
      await paymentMethodsApi.deletePaymentMethod(methodId);
      return { success: true };
    } catch (err) {
      setActionError(err.message || 'Failed to delete payment method');
      console.error('Error deleting payment method:', err);
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  const setDefaultPaymentMethod = async (methodId) => {
    try {
      setActionLoading(true);
      setActionError(null);
      await paymentMethodsApi.setDefaultPaymentMethod(methodId);
      return { success: true };
    } catch (err) {
      setActionError(err.message || 'Failed to set default payment method');
      console.error('Error setting default payment method:', err);
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    actionLoading,
    actionError,
  };
};

// Helper function to check if payment method is expiring soon (within 60 days)
export const getExpiringPaymentMethods = (paymentMethods) => {
  const now = new Date();
  const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  return paymentMethods.filter(method => {
    if (!method.expMonth || !method.expYear) return false;
    const expDate = new Date(method.expYear, method.expMonth - 1);
    return expDate <= sixtyDaysFromNow && expDate >= now;
  });
};

// Helper function to calculate days until expiration
export const getDaysUntilExpiration = (expMonth, expYear) => {
  const now = new Date();
  const expDate = new Date(expYear, expMonth - 1);
  const diffTime = expDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
