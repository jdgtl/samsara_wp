/**
 * useGiftCards Hook
 * Hook for fetching and managing gift card data
 */

import { useState, useEffect, useCallback } from 'react';
import { giftCardsApi } from '../services/woocommerce';

export const useGiftCards = (filters = {}) => {
  const [giftCards, setGiftCards] = useState({ received: [], purchased: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGiftCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await giftCardsApi.getGiftCards(filters);
      // API returns {received: [], purchased: []} object
      setGiftCards(data || { received: [], purchased: [] });
    } catch (err) {
      setError(err.message || 'Failed to fetch gift cards');
      console.error('Error fetching gift cards:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchGiftCards();
  }, [fetchGiftCards]);

  return {
    giftCards,
    loading,
    error,
    refetch: fetchGiftCards,
  };
};

export const useGiftCard = (cardId) => {
  const [giftCard, setGiftCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  const fetchGiftCard = useCallback(async () => {
    if (!cardId) return;

    try {
      setLoading(true);
      setError(null);
      setErrorDetails(null);
      const data = await giftCardsApi.getGiftCard(cardId);
      setGiftCard(data);
    } catch (err) {
      // Capture both user message and technical details
      const errorMessage = err.message || 'Failed to fetch gift card';
      setError(errorMessage);

      // Store technical details if available
      if (err.data?.technical_details) {
        setErrorDetails(err.data.technical_details);
      }

      console.error('Error fetching gift card:', err);
      console.error('Technical details:', err.data?.technical_details);
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    fetchGiftCard();
  }, [fetchGiftCard]);

  return {
    giftCard,
    loading,
    error,
    errorDetails,
    refetch: fetchGiftCard,
  };
};

export const useGiftCardBalance = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkBalance = useCallback(async (code) => {
    if (!code) {
      setError('Please enter a gift card code');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await giftCardsApi.checkBalance(code);
      setBalance(data);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to check balance';
      setError(errorMessage);
      console.error('Error checking gift card balance:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setBalance(null);
    setError(null);
  }, []);

  return {
    balance,
    loading,
    error,
    checkBalance,
    reset,
  };
};
