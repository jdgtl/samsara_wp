/**
 * useDashboard Hook
 * Hook for fetching dashboard statistics and summary data
 */

import { useState, useEffect, useCallback } from 'react';
import { statsApi } from '../services/woocommerce';
import { useSubscriptions } from './useSubscriptions';
import { useMemberships } from './useMemberships';
import { usePaymentMethods, getExpiringPaymentMethods } from './usePaymentMethods';

/**
 * Comprehensive dashboard hook that fetches all dashboard data
 */
export const useDashboard = () => {
  // Fetch individual data sources
  // Use useSubscriptions() instead of useActiveSubscriptions() to get ALL subscriptions
  // (including cancelled ones with valid access during prepaid term)
  const { subscriptions, loading: subsLoading, error: subsError, refetch: refetchSubs } = useSubscriptions();
  const { memberships, loading: membershipsLoading, error: membershipsError, refetch: refetchMemberships } = useMemberships();
  const { paymentMethods, loading: paymentsLoading, error: paymentsError, refetch: refetchPayments } = usePaymentMethods();

  // Helper function to check if subscription has valid access
  // Includes active, trial, on-hold, pending-cancel, and cancelled subscriptions with future end dates
  const hasValidAccess = (sub) => {
    const now = new Date();

    // Active subscriptions - full access
    if (sub.status === 'active' || sub.status === 'trial' || sub.status === 'trialing') return true;

    // On-hold - payment failed but should still show with warning
    // Customer needs to see their subscription and update payment method
    if (sub.status === 'on-hold') return true;

    // Pending-cancel - still has access until end date
    // Scheduled for cancellation but not cancelled yet
    if (sub.status === 'pending-cancel' ||
        sub.status === 'pending_cancellation' ||
        sub.status === 'pending_cancelled') return true;

    // Cancelled - check if still in prepaid period
    if ((sub.status === 'canceled' || sub.status === 'cancelled') && sub.endDate) {
      return new Date(sub.endDate) > now;
    }

    // Pending, expired, switched, inactive - no access
    if (sub.status === 'pending' ||
        sub.status === 'expired' ||
        sub.status === 'switched' ||
        sub.status === 'inactive') {
      return false;
    }

    return false;
  };

  // Calculate derived data
  // Prioritize Athlete Team FIRST, then Basecamp, then any active subscription/membership
  // Check both subscriptions AND manually-added memberships
  // Include cancelled subscriptions that still have valid access
  const primarySubscription = (() => {
    // First priority: Athlete Team subscription with valid access (active or cancelled with future end date)
    const athleteTeamSub = subscriptions.find(sub => {
      const planName = sub.planName?.toLowerCase() || '';
      const hasAccess = hasValidAccess(sub);
      // Check for specific team names
      const isAthleteTeam = (
        planName.includes('mandala') ||
        planName.includes('momentum') ||
        planName.includes('matrix') ||
        planName.includes('alumni') ||
        planName.includes('recon')
      );
      return hasAccess && isAthleteTeam;
    });
    if (athleteTeamSub) {
      return athleteTeamSub;
    }

    // Second priority: Active Athlete Team membership (Mandala, Momentum, Matrix, Alumni, Recon)
    const athleteTeamMembership = memberships.find(m => {
      const slug = m.slug?.toLowerCase() || '';
      const name = m.name?.toLowerCase() || '';
      const isActive = m.status === 'active';
      // Check for specific team names in slug or name
      const isAthleteTeam = (
        slug.includes('mandala') || name.includes('mandala') ||
        slug.includes('momentum') || name.includes('momentum') ||
        slug.includes('matrix') || name.includes('matrix') ||
        slug.includes('alumni') || name.includes('alumni') ||
        slug.includes('recon') || name.includes('recon') ||
        slug.includes('athlete-team') || slug.includes('athlete_team')
      );
      return isActive && isAthleteTeam;
    });
    if (athleteTeamMembership) {
      // Convert membership to subscription-like format for display
      return {
        id: `membership-${athleteTeamMembership.id}`,
        planName: athleteTeamMembership.name,
        status: athleteTeamMembership.status,
        startDate: athleteTeamMembership.startedAt,
        nextPaymentDate: null,
        nextPaymentAmount: null,
        billingInterval: null,
        isMembership: true, // Flag to indicate this is a membership, not subscription
      };
    }

    // Third priority: Basecamp subscription with valid access (active or cancelled with future end date)
    const basecampSub = subscriptions.find(sub => {
      const planName = sub.planName?.toLowerCase() || '';
      const hasAccess = hasValidAccess(sub);
      return hasAccess && planName.includes('basecamp');
    });
    if (basecampSub) {
      return basecampSub;
    }

    // Fourth priority: Active Basecamp membership (manually added, no subscription)
    const basecampMembership = memberships.find(m => {
      const slug = m.slug?.toLowerCase() || '';
      const name = m.name?.toLowerCase() || '';
      return m.status === 'active' && (
        slug.includes('basecamp') ||
        name.includes('basecamp')
      );
    });
    if (basecampMembership) {
      // Convert membership to subscription-like format for display
      return {
        id: `membership-${basecampMembership.id}`,
        planName: basecampMembership.name,
        status: basecampMembership.status,
        startDate: basecampMembership.startedAt,
        nextPaymentDate: null,
        nextPaymentAmount: null,
        billingInterval: null,
        isMembership: true, // Flag to indicate this is a membership, not subscription
      };
    }

    // REMOVED FALLBACK: Only Athlete Team or Basecamp should show as primary
    // Other memberships (like Bodyweight Programs) should ONLY appear in "Additional Memberships"
    // If no Athlete Team/Basecamp, return null to show CTA buttons
    return null;
  })();

  const expiringCards = getExpiringPaymentMethods(paymentMethods);

  // Aggregate loading and error states
  const loading = subsLoading || membershipsLoading || paymentsLoading;
  const error = subsError || membershipsError || paymentsError;

  // Combined refetch function
  const refetch = useCallback(async () => {
    await Promise.all([
      refetchSubs(),
      refetchMemberships(),
      refetchPayments()
    ]);
  }, [refetchSubs, refetchMemberships, refetchPayments]);

  return {
    primarySubscription,
    subscriptions,
    memberships,
    paymentMethods,
    expiringCards,
    loading,
    error,
    refetch,
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
