/**
 * useOrders Hook
 * Hook for fetching and managing order data
 */

import { useState, useEffect, useCallback } from 'react';
import { ordersApi, transformers } from '../services/woocommerce';

export const useOrders = (filters = {}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersApi.getOrders(filters);
      const transformedOrders = Array.isArray(data) ? data.map(transformers.order) : [];
      setOrders(transformedOrders);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

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

export const useOrder = (orderId) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await ordersApi.getOrder(orderId);
      setOrder(transformers.order(data));
    } catch (err) {
      setError(err.message || 'Failed to fetch order');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
  };
};

export const useOrdersPaginated = (page = 1, perPage = 10, filters = {}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersApi.getOrdersPaginated(page, perPage, filters);
      const transformedOrders = Array.isArray(data) ? data.map(transformers.order) : [];
      setOrders(transformedOrders);

      // Note: WooCommerce returns pagination in headers
      // May need to adjust based on actual API response
      setTotalOrders(data.length);
      setTotalPages(Math.ceil(data.length / perPage));
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, JSON.stringify(filters)]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    totalPages,
    totalOrders,
    refetch: fetchOrders,
  };
};
