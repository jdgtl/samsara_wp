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
  const { subscriptions, loading: subsLoading, error: subsError, refetch: refetchSubs } = useActiveSubscriptions();
  const { memberships, loading: membershipsLoading, error: membershipsError, refetch: refetchMemberships } = useMemberships();
  const { paymentMethods, loading: paymentsLoading, error: paymentsError, refetch: refetchPayments } = usePaymentMethods();

  // Calculate derived data
  // Prioritize Athlete Team FIRST, then Basecamp, then any active subscription/membership
  // Check both subscriptions AND manually-added memberships
  const primarySubscription = (() => {
    // DEBUG: Log what data we're working with
    console.log('DEBUG - All Subscriptions:', subscriptions);
    console.log('DEBUG - All Memberships:', memberships);

    // First priority: Active Athlete Team subscription (Mandala, Momentum, Matrix, Alumni, Recon)
    const athleteTeamSub = subscriptions.find(sub => {
      const planName = sub.planName?.toLowerCase() || '';
      const isActive = sub.status === 'active';
      // Check for specific team names
      const isAthleteTeam = (
        planName.includes('mandala') ||
        planName.includes('momentum') ||
        planName.includes('matrix') ||
        planName.includes('alumni') ||
        planName.includes('recon')
      );
      return isActive && isAthleteTeam;
    });
    if (athleteTeamSub) {
      console.log('DEBUG - Found Athlete Team subscription:', athleteTeamSub);
      return athleteTeamSub;
    }

    // Second priority: Active Athlete Team membership (Mandala, Momentum, Matrix, Alumni, Recon)
    const athleteTeamMembership = memberships.find(m => {
      const slug = m.slug?.toLowerCase() || '';
      const name = m.name?.toLowerCase() || '';
      console.log('DEBUG - Checking membership:', { name: m.name, slug: m.slug, status: m.status });
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
      console.log('DEBUG - Found Athlete Team membership:', athleteTeamMembership);
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

    // Third priority: Active Basecamp subscription
    const basecampSub = subscriptions.find(sub => {
      const planName = sub.planName?.toLowerCase() || '';
      return sub.status === 'active' && planName.includes('basecamp');
    });
    if (basecampSub) {
      console.log('DEBUG - Found Basecamp subscription:', basecampSub);
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
      console.log('DEBUG - Found Basecamp membership:', basecampMembership);
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

    // Fifth priority: ANY active subscription (fallback for other subscription types)
    const anyActiveSub = subscriptions.find(sub => sub.status === 'active');
    if (anyActiveSub) {
      console.log('DEBUG - Found any active subscription:', anyActiveSub);
      return anyActiveSub;
    }

    // Sixth priority: ANY active membership (fallback for manually-added memberships)
    const anyActiveMembership = memberships.find(m => m.status === 'active');
    if (anyActiveMembership) {
      console.log('DEBUG - Found any active membership:', anyActiveMembership);
      // Convert membership to subscription-like format for display
      return {
        id: `membership-${anyActiveMembership.id}`,
        planName: anyActiveMembership.name,
        status: anyActiveMembership.status,
        startDate: anyActiveMembership.startedAt,
        nextPaymentDate: null,
        nextPaymentAmount: null,
        billingInterval: null,
        isMembership: true, // Flag to indicate this is a membership, not subscription
      };
    }

    // No active subscriptions or memberships found
    console.log('DEBUG - No active subscription or membership found');
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
