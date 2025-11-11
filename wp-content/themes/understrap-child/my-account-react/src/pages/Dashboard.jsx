import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import AvatarDisplay from '../components/AvatarDisplay';
import { useAvatar } from '../contexts/AvatarContext';
import {
  AlertTriangle,
  Loader2,
  LayoutGrid,
  List
} from 'lucide-react';
import { getDaysUntilExpiration } from '../lib/utils';
import { useDashboard } from '../hooks/useDashboard';
import { useNavigate, Link } from 'react-router-dom';

// Active statuses: Users CAN access content
const ACTIVE_MEMBERSHIP_STATUSES = new Set([
  'active',
  'complimentary',
  'pending-cancel',
  'pending_cancellation',
  'pending_cancelled',
  'trial',
  'trialing'
]);

// Inactive statuses: Users CANNOT access content
const INACTIVE_MEMBERSHIP_STATUSES = new Set([
  'delayed',
  'paused',
  'expired',
  'canceled',
  'cancelled',
  'inactive',
  'on-hold',
  'ended'
]);

const getMembershipStatusCategory = (status = '') => {
  const normalizedStatus = status.toLowerCase();

  if (ACTIVE_MEMBERSHIP_STATUSES.has(normalizedStatus)) {
    return 'active';
  }

  if (INACTIVE_MEMBERSHIP_STATUSES.has(normalizedStatus)) {
    return 'inactive';
  }

  return normalizedStatus || 'inactive';
};

const membershipMatchesFilter = (membership, filter) => {
  // Only Active and Inactive filters - no "All" option
  return getMembershipStatusCategory(membership.status) === filter;
};

const sortMemberships = (memberships = []) => {
  return [...memberships].sort((a, b) => {
    const statusRank = (status) => (getMembershipStatusCategory(status) === 'active' ? 0 : 1);
    const statusDiff = statusRank(a.status) - statusRank(b.status);

    if (statusDiff !== 0) {
      return statusDiff;
    }

    return (a.name || '').localeCompare(b.name || '');
  });
};

const canAccessMembershipContent = (membership) => (
  getMembershipStatusCategory(membership.status) === 'active'
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState({ days: 0 });
  const [membershipFilter, setMembershipFilter] = useState('active'); // Default to active
  const [membershipViewMode, setMembershipViewMode] = useState('card'); // 'card' or 'list'
  const { avatarType, selectedEmoji, uploadedAvatarUrl, loading: avatarLoading } = useAvatar();

  // Fetch live data
  const {
    primarySubscription,
    subscriptions,
    memberships,
    expiringCards,
    loading,
    error
  } = useDashboard();

  // Get user data from WordPress global
  const userData = window.samsaraMyAccount?.userData || {
    firstName: 'User',
    lastName: '',
    displayName: 'User',
    email: '',
    memberSince: null,
    avatarUrl: null
  };

  const memberSinceFormatted = userData.memberSince
    ? new Date(userData.memberSince).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      })
    : 'Recently';

  // Calculate countdown for next payment or access expiry
  useEffect(() => {
    const calculateCountdown = () => {
      if (!primarySubscription) return;

      // For cancelled subscriptions, use endDate; for active, use nextPaymentDate
      const targetDate = primarySubscription.status === 'canceled'
        ? primarySubscription.endDate || primarySubscription.nextPaymentDate
        : primarySubscription.nextPaymentDate;

      if (!targetDate) return;

      const now = new Date();
      const target = new Date(targetDate);
      const diff = target - now;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      setCountdown({ days });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [primarySubscription]);

  const getStatusBadge = (status) => {
    const normalizedStatus = status.toLowerCase();

    const badges = {
      active: { variant: 'default', text: 'Active', className: 'bg-emerald-600 text-white hover:bg-emerald-700' },
      complimentary: { variant: 'secondary', text: 'Complimentary', className: 'bg-blue-600 text-white hover:bg-blue-700' },
      'pending-cancel': { variant: 'outline', text: 'Ending Soon', className: 'border-amber-600 text-amber-700 bg-amber-50' },
      pending_cancellation: { variant: 'outline', text: 'Ending Soon', className: 'border-amber-600 text-amber-700 bg-amber-50' },
      pending_cancelled: { variant: 'outline', text: 'Ending Soon', className: 'border-amber-600 text-amber-700 bg-amber-50' },
      trial: { variant: 'secondary', text: 'Trial', className: 'bg-purple-600 text-white hover:bg-purple-700' },
      trialing: { variant: 'secondary', text: 'Trial', className: 'bg-purple-600 text-white hover:bg-purple-700' },
      delayed: { variant: 'secondary', text: 'Not Started', className: 'bg-stone-400 text-white' },
      paused: { variant: 'secondary', text: 'Paused', className: 'bg-stone-400 text-white' },
      expired: { variant: 'destructive', text: 'Expired', className: 'bg-red-600 text-white hover:bg-red-700' },
      canceled: { variant: 'destructive', text: 'Cancelled', className: 'bg-red-600 text-white hover:bg-red-700' },
      cancelled: { variant: 'destructive', text: 'Cancelled', className: 'bg-red-600 text-white hover:bg-red-700' },
      inactive: { variant: 'secondary', text: 'Inactive', className: 'bg-stone-400 text-white' },
    };

    const badgeConfig = badges[normalizedStatus] || {
      variant: 'secondary',
      text: status.charAt(0).toUpperCase() + status.slice(1),
      className: 'bg-stone-400 text-white'
    };

    return (
      <Badge variant={badgeConfig.variant} className={badgeConfig.className} data-testid={`status-badge-${status}`}>
        {badgeConfig.text}
      </Badge>
    );
  };

  const basecampUrl = window.samsaraMyAccount?.basecampUrl || 'https://videos.samsaraexperience.com';

  // Check if user has Basecamp access
  // Users with Athlete Team (Mandala, Momentum, Matrix, Alumni, Recon) or Basecamp subscriptions/memberships get Basecamp access
  // First check memberships
  const hasBasecampMembership = (memberships || []).some(membership => {
    const slug = membership.slug?.toLowerCase() || '';
    const name = membership.name?.toLowerCase() || '';
    const isActive = membership.status === 'active';

    // Check for specific team names or basecamp
    const hasAthleteTeam = (
      slug.includes('mandala') || name.includes('mandala') ||
      slug.includes('momentum') || name.includes('momentum') ||
      slug.includes('matrix') || name.includes('matrix') ||
      slug.includes('alumni') || name.includes('alumni') ||
      slug.includes('recon') || name.includes('recon') ||
      slug.includes('athlete-team') || slug.includes('athlete_team')
    );
    const hasBasecamp = slug.includes('basecamp') || name.includes('basecamp');

    return isActive && (hasAthleteTeam || hasBasecamp);
  });

  // Also check if they have an active subscription
  // Athlete Team (Mandala, Momentum, Matrix, Alumni, Recon) or Basecamp subscriptions grant Basecamp access
  const hasBasecampSubscription = (subscriptions || []).some(subscription => {
    const planName = subscription.planName?.toLowerCase() || '';
    const isActive = subscription.status === 'active';

    // Check for specific team names or basecamp
    const hasAthleteTeam = (
      planName.includes('mandala') ||
      planName.includes('momentum') ||
      planName.includes('matrix') ||
      planName.includes('alumni') ||
      planName.includes('recon')
    );
    const hasBasecamp = planName.includes('basecamp');

    return isActive && (hasAthleteTeam || hasBasecamp);
  });

  const hasBasecampAccess = hasBasecampMembership || hasBasecampSubscription;

  // Filter memberships: exclude Athlete Team (Mandala, Momentum, Matrix, Alumni, Recon) and Basecamp (they show in primary card)
  // and apply the status filter
  const filteredMemberships = sortMemberships((memberships || []).filter(m => {
    const slug = m.slug?.toLowerCase() || '';
    const name = m.name?.toLowerCase() || '';

    // Exclude Athlete Team memberships (by team name) and Basecamp memberships
    const hasAthleteTeam = (
      slug.includes('mandala') || name.includes('mandala') ||
      slug.includes('momentum') || name.includes('momentum') ||
      slug.includes('matrix') || name.includes('matrix') ||
      slug.includes('alumni') || name.includes('alumni') ||
      slug.includes('recon') || name.includes('recon') ||
      slug.includes('athlete-team') || slug.includes('athlete_team')
    );
    const hasBasecamp = slug.includes('basecamp') || name.includes('basecamp');
    const isAthleteTeamOrBasecamp = hasAthleteTeam || hasBasecamp;

    if (isAthleteTeamOrBasecamp) return false;

    // Apply status filter
    return membershipMatchesFilter(m, membershipFilter);
  }));

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6" data-testid="dashboard-loading">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
          <p className="text-stone-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6" data-testid="dashboard-error">
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="ml-2">
            <div className="text-red-900">
              <p className="font-medium">Failed to load dashboard</p>
              <p className="text-sm">{error}</p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6" data-testid="dashboard-page">
      {/* Welcome Header with User Profile (visible on mobile, replaces sidebar profile) */}
      <div className="md:hidden" data-testid="mobile-welcome-section">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-end gap-4">
              <AvatarDisplay
                avatarType={avatarType}
                selectedEmoji={selectedEmoji}
                uploadedAvatarUrl={uploadedAvatarUrl}
                userData={userData}
                size="h-16 w-16"
                textSize="text-lg"
                loading={avatarLoading}
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-stone-900">
                  {userData.displayName}
                </h1>
                <p className="text-sm text-stone-600">
                  Member since {memberSinceFormatted}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-stone-300 text-stone-700 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                onClick={() => window.location.href = window.samsaraMyAccount?.logoutUrl || '/wp-login.php?action=logout'}
                data-testid="mobile-logout-btn"
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop Welcome Header (hidden on mobile) */}
      <div className="hidden md:block space-y-2" data-testid="desktop-welcome-section">
        <h1 className="text-3xl font-bold text-stone-900">
          Welcome back, {userData.firstName}
        </h1>
        <p className="text-stone-600">
          Here's how you're doing with Samsara.
        </p>
      </div>

      {/* Expiring Payment Methods Alert */}
      {expiringCards && expiringCards.length > 0 && (
        <Alert className="border-amber-500 bg-amber-50" data-testid="expiring-card-alert">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="ml-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-amber-900">Payment method expiring soon:</span>
                {expiringCards.map(card => {
                  const daysLeft = getDaysUntilExpiration(card.expMonth, card.expYear);
                  return (
                    <span key={card.id} className="ml-2 text-amber-800">
                      {card.brand} •••• {card.last4} expires in {daysLeft} days
                    </span>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-600 text-amber-900 hover:bg-amber-100"
                  data-testid="update-card-btn"
                  onClick={() => navigate('/payments')}
                >
                  Update Card
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-amber-900 hover:bg-amber-100"
                  data-testid="dismiss-alert-btn"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Primary Subscription Card with Basecamp CTA side-by-side */}
      <div className={`grid gap-6 ${hasBasecampAccess ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Primary Subscription Card */}
        {primarySubscription ? (
          <Card className="border-2 border-emerald-200" data-testid="primary-subscription-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl text-stone-900">
                  {primarySubscription.planName}
                </CardTitle>
                <CardDescription className="mt-1">
                  Your primary membership
                </CardDescription>
              </div>
              {getStatusBadge(primarySubscription.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Conditional display based on subscription type and status */}
            {!primarySubscription.isMembership && primarySubscription.status === 'canceled' ? (
              // Cancelled subscription - show expiry information
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-600 text-xl">⚠️</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-900">Subscription Cancelled</p>
                      <p className="text-sm text-amber-700 mt-1">
                        You still have access until your prepaid period ends
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-stone-600">Access valid until</p>
                    <p className="text-lg font-semibold text-amber-700" data-testid="access-end-date">
                      {new Date(primarySubscription.endDate || primarySubscription.nextPaymentDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-amber-600 font-medium" data-testid="access-countdown">
                      {countdown.days} days remaining
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-stone-600">Cancelled on</p>
                    <p className="text-lg font-semibold text-stone-900" data-testid="cancelled-date">
                      {primarySubscription.canceledAt ? new Date(primarySubscription.canceledAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ) : !primarySubscription.isMembership && primarySubscription.nextPaymentDate ? (
              // Active subscription - show billing info
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-stone-600">Next billing date</p>
                  <p className="text-lg font-semibold text-stone-900" data-testid="next-billing-date">
                    {new Date(primarySubscription.nextPaymentDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-emerald-700 font-medium" data-testid="countdown">
                    in {countdown.days} days
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-stone-600">Amount</p>
                  <p className="text-lg font-semibold text-stone-900" data-testid="subscription-amount">
                    ${primarySubscription.nextPaymentAmount.toFixed(2)} / {primarySubscription.billingInterval}
                  </p>
                </div>
              </div>
            ) : (
              // Manually-added membership - show status
              <div className="space-y-1">
                <p className="text-sm text-stone-600">Status</p>
                <p className="text-lg font-semibold text-emerald-700">Active Membership</p>
                <p className="text-sm text-stone-600">
                  This membership was granted directly and has no billing associated with it.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              {/* Only show Manage button for actual subscriptions, not manually-added memberships */}
              {!primarySubscription.isMembership && (
                <Link to={`/subscriptions/${primarySubscription.id}`}>
                  <Button
                    className="bg-samsara-gold hover:bg-samsara-gold/90 text-samsara-black"
                    data-testid="manage-subscription-btn"
                  >
                    Manage Subscription
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
        ) : (
          <Card className="border-2 border-stone-200" data-testid="no-subscription-card">
            <CardContent className="p-12 text-center">
              <p className="text-stone-600 mb-4">No active recurring subscription</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  className="bg-samsara-gold hover:bg-samsara-gold/90 text-samsara-black"
                  onClick={() => window.location.href = 'https://samsaraexperience.com/athlete-team/'}
                >
                  Join Athlete Team
                </Button>
                <Button
                  className="bg-samsara-gold hover:bg-samsara-gold/90 text-samsara-black"
                  onClick={() => window.location.href = 'https://samsaraexperience.com/training-basecamp/'}
                >
                  Join Basecamp
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Training Hub / Basecamp CTA - Only show if user has Basecamp access */}
        {hasBasecampAccess && (
          <a
            href={basecampUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative overflow-hidden rounded-lg border-2 border-samsara-gold cursor-pointer group h-full min-h-[400px] flex flex-col no-underline hover:no-underline"
            data-testid="basecamp-cta-card"
          >
            {/* Background Image with Overlay */}
            <div
              className="absolute inset-0 bg-black transition-transform duration-300 group-hover:scale-105"
              style={{
                backgroundImage: 'url(https://samsara-media.s3.us-west-2.amazonaws.com/wp-content/uploads/2025/05/17093636/5-_LUC6012-1-1024x1024.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />

            {/* Content - Bottom Aligned */}
            <div className="relative z-10 p-6 flex flex-col h-full justify-end">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">
                  Basecamp Training Hub
                </h3>
                <p className="text-stone-200">
                  Click here to access your basecamp training hub
                </p>
              </div>
            </div>
          </a>
        )}
      </div>

      {/* Additional Memberships */}
      <Card data-testid="memberships-card">
        <CardHeader>
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-stone-900">Additional Memberships</CardTitle>
                <CardDescription>Legacy training programs and courses</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Filter Buttons - Active/Inactive only */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={membershipFilter === 'active' ? 'default' : 'outline'}
                    onClick={() => setMembershipFilter('active')}
                    className={membershipFilter === 'active' ? 'bg-samsara-gold hover:bg-samsara-gold/90 text-samsara-black' : ''}
                    data-testid="filter-active"
                  >
                    Active
                  </Button>
                  <Button
                    size="sm"
                    variant={membershipFilter === 'inactive' ? 'default' : 'outline'}
                    onClick={() => setMembershipFilter('inactive')}
                    className={membershipFilter === 'inactive' ? 'bg-samsara-gold hover:bg-samsara-gold/90 text-samsara-black' : ''}
                    data-testid="filter-inactive"
                  >
                    Inactive
                  </Button>
                </div>
                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
                  <button
                    onClick={() => setMembershipViewMode('card')}
                    className={`p-2 rounded transition-colors ${
                      membershipViewMode === 'card'
                        ? 'bg-white shadow-sm text-samsara-gold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                    aria-label="Card view"
                    data-testid="membership-card-view-toggle"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setMembershipViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      membershipViewMode === 'list'
                        ? 'bg-white shadow-sm text-samsara-gold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                    aria-label="List view"
                    data-testid="membership-list-view-toggle"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMemberships.length === 0 ? (
            <div className="text-center py-12" data-testid="empty-memberships">
              <p className="text-stone-600 mb-4">No additional memberships</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  className="bg-samsara-gold hover:bg-samsara-gold/90 text-samsara-black"
                  onClick={() => window.location.href = 'https://samsaraexperience.com/athlete-team/'}
                >
                  Join Athlete Team
                </Button>
                <Button
                  className="bg-samsara-gold hover:bg-samsara-gold/90 text-samsara-black"
                  onClick={() => window.location.href = 'https://samsaraexperience.com/training-basecamp/'}
                >
                  Join Basecamp
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* List View */}
              {membershipViewMode === 'list' && (
                <div className="space-y-3">
                  {filteredMemberships.flatMap((membership) => {
                    const hasPages = membership.restrictedPages && membership.restrictedPages.length > 0;
                    if (!hasPages) return [];

                    return membership.restrictedPages.map((page) => {
                      const imageUrl = page.featuredImage || null;
                      const isActiveMembership = canAccessMembershipContent(membership);
                      const baseClasses = 'flex items-center gap-4 p-4 border border-stone-200 rounded-lg transition-shadow group no-underline hover:no-underline';
                      const stateClasses = isActiveMembership
                        ? 'cursor-pointer hover:shadow-md'
                        : 'cursor-not-allowed opacity-60 hover:shadow-none bg-stone-50';

                      const sharedContent = (
                        <>
                          {/* Thumbnail */}
                          {imageUrl ? (
                            <div className="flex-shrink-0 w-24 h-16 overflow-hidden rounded bg-stone-200">
                              <img
                                src={imageUrl}
                                alt={page.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 w-24 h-16 bg-gradient-to-br from-stone-100 to-stone-200 rounded flex items-center justify-center">
                              <p className="text-xs text-stone-400 text-center px-2 line-clamp-2">
                                {page.title}
                              </p>
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm text-stone-900 truncate">
                                  {page.title}
                                </h3>
                                <p className="text-xs text-stone-500 mt-0.5">
                                  {membership.name}
                                </p>
                              </div>
                              {getStatusBadge(membership.status)}
                            </div>

                            {/* Expiration Date */}
                            {membership.expiresAt && (
                              <p className="text-xs text-stone-500 mt-2">
                                Expires: {new Date(membership.expiresAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            )}

                            {/* Status-specific messages for inactive memberships */}
                            {!isActiveMembership && (
                              <p className="text-xs text-stone-500 mt-2">
                                {membership.status === 'delayed' && '⏳ Membership has not started yet.'}
                                {membership.status === 'paused' && '⏸️ Membership is temporarily paused.'}
                                {membership.status === 'expired' && '🔒 Membership has expired.'}
                                {(membership.status === 'canceled' || membership.status === 'cancelled') && '🔒 Membership has been cancelled.'}
                                {membership.status === 'inactive' && '🔒 Membership is inactive.'}
                                {!['delayed', 'paused', 'expired', 'canceled', 'cancelled', 'inactive'].includes(membership.status) && '🔒 Access is no longer available.'}
                              </p>
                            )}

                            {/* Warning message for memberships ending soon */}
                            {isActiveMembership && (membership.status === 'pending-cancel' || membership.status === 'pending_cancellation' || membership.status === 'pending_cancelled') && (
                              <p className="text-xs text-amber-700 mt-2 flex items-start gap-1">
                                <span>⚠️</span>
                                <span>This membership will end on {membership.expiresAt ? new Date(membership.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'the next billing date'}.</span>
                              </p>
                            )}
                          </div>
                        </>
                      );

                      if (isActiveMembership) {
                        return (
                          <a
                            key={`${membership.id}-${page.id}`}
                            href={page.url}
                            className={`${baseClasses} ${stateClasses}`}
                            data-testid={`program-list-item-${page.id}`}
                          >
                            {sharedContent}
                          </a>
                        );
                      }

                      return (
                        <div
                          key={`${membership.id}-${page.id}`}
                          className={`${baseClasses} ${stateClasses}`}
                          data-testid={`program-list-item-${page.id}`}
                          aria-disabled="true"
                          tabIndex={-1}
                        >
                          {sharedContent}
                        </div>
                      );
                    });
                  })}
                </div>
              )}

              {/* Card View */}
              {membershipViewMode === 'card' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Show one card per program page, not per membership */}
                  {filteredMemberships.flatMap((membership) => {
                    const hasPages = membership.restrictedPages && membership.restrictedPages.length > 0;

                    if (!hasPages) return [];

                    // Create one card for each program page
                    return membership.restrictedPages.map((page) => {
                      const imageUrl = page.featuredImage || null;
                      const isActiveMembership = canAccessMembershipContent(membership);
                      const card = (
                        <Card
                          className={`overflow-hidden transition-shadow group ${
                            isActiveMembership ? 'hover:shadow-lg cursor-pointer' : 'opacity-60 cursor-not-allowed bg-stone-50'
                          }`}
                        >
                          {/* Featured Image */}
                          {imageUrl ? (
                            <div className="aspect-video overflow-hidden bg-stone-200">
                              <img
                                src={imageUrl}
                                alt={page.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ) : (
                            <div className="aspect-video bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
                              <div className="text-stone-400 text-center p-4">
                                <p className="text-sm font-medium">{page.title}</p>
                              </div>
                            </div>
                          )}

                          {/* Card Content */}
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-sm line-clamp-2 flex-1">
                                {page.title}
                              </h3>
                              {getStatusBadge(membership.status)}
                            </div>

                            {/* Show membership name as subtitle */}
                            <p className="text-xs text-stone-500 mt-1">
                              {membership.name}
                            </p>

                            {/* Show expired date if applicable */}
                            {membership.expiresAt && (
                              <p className="text-xs text-stone-500 mt-2">
                                Expires: {new Date(membership.expiresAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            )}

                            {/* Status-specific messages for inactive memberships */}
                            {!isActiveMembership && (
                              <p className="text-xs text-stone-500 mt-2">
                                {membership.status === 'delayed' && '⏳ Membership has not started yet.'}
                                {membership.status === 'paused' && '⏸️ Membership is temporarily paused.'}
                                {membership.status === 'expired' && '🔒 Membership has expired.'}
                                {(membership.status === 'canceled' || membership.status === 'cancelled') && '🔒 Membership has been cancelled.'}
                                {membership.status === 'inactive' && '🔒 Membership is inactive.'}
                                {!['delayed', 'paused', 'expired', 'canceled', 'cancelled', 'inactive'].includes(membership.status) && '🔒 Access is no longer available.'}
                              </p>
                            )}

                            {/* Warning message for memberships ending soon */}
                            {isActiveMembership && (membership.status === 'pending-cancel' || membership.status === 'pending_cancellation' || membership.status === 'pending_cancelled') && (
                              <p className="text-xs text-amber-700 mt-2 flex items-start gap-1">
                                <span>⚠️</span>
                                <span>This membership will end on {membership.expiresAt ? new Date(membership.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'the next billing date'}.</span>
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      );

                      if (isActiveMembership) {
                        return (
                          <a
                            key={`${membership.id}-${page.id}`}
                            href={page.url}
                            className="block no-underline hover:no-underline"
                            data-testid={`program-card-${page.id}`}
                          >
                            {card}
                          </a>
                        );
                      }

                      return (
                        <div
                          key={`${membership.id}-${page.id}`}
                          className="block"
                          data-testid={`program-card-${page.id}`}
                          aria-disabled="true"
                          tabIndex={-1}
                        >
                          {card}
                        </div>
                      );
                    });
                  })}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default Dashboard;
