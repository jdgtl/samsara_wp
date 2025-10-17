/**
 * useCustomer Hook
 * Hook for fetching and managing customer/user data
 */

import { useState, useEffect, useCallback } from 'react';
import { customersApi, transformers } from '../services/woocommerce';

export const useCustomer = () => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomer = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customersApi.getCurrentCustomer();
      setCustomer(transformers.customer(data));
    } catch (err) {
      setError(err.message || 'Failed to fetch customer data');
      console.error('Error fetching customer:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  return {
    customer,
    loading,
    error,
    refetch: fetchCustomer,
  };
};

export const useCustomerActions = () => {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const updateCustomer = async (data) => {
    try {
      setActionLoading(true);
      setActionError(null);
      const result = await customersApi.updateCustomer(data);
      return { success: true, data: transformers.customer(result) };
    } catch (err) {
      setActionError(err.message || 'Failed to update customer');
      console.error('Error updating customer:', err);
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  const updateBillingAddress = async (address) => {
    try {
      setActionLoading(true);
      setActionError(null);
      const result = await customersApi.updateBillingAddress(address);
      return { success: true, data: transformers.customer(result) };
    } catch (err) {
      setActionError(err.message || 'Failed to update billing address');
      console.error('Error updating billing address:', err);
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  const updateShippingAddress = async (address) => {
    try {
      setActionLoading(true);
      setActionError(null);
      const result = await customersApi.updateShippingAddress(address);
      return { success: true, data: transformers.customer(result) };
    } catch (err) {
      setActionError(err.message || 'Failed to update shipping address');
      console.error('Error updating shipping address:', err);
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    updateCustomer,
    updateBillingAddress,
    updateShippingAddress,
    actionLoading,
    actionError,
  };
};
