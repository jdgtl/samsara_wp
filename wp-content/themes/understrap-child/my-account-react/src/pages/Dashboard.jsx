import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  ExternalLink,
  AlertTriangle,
  Filter,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getDaysUntilExpiration } from '../lib/utils';
import { useDashboard } from '../hooks/useDashboard';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState({ days: 0 });
  const [membershipFilter, setMembershipFilter] = useState('all');
  const [expandedMemberships, setExpandedMemberships] = useState({});

  // Fetch live data
  const {
    primarySubscription,
    subscriptions,
    memberships,
    expiringCards,
    loading,
    error,
    refetch
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

  // Calculate countdown for next payment
  useEffect(() => {
    const calculateCountdown = () => {
      if (!primarySubscription || !primarySubscription.nextPaymentDate) return;

      const now = new Date();
      const nextPayment = new Date(primarySubscription.nextPaymentDate);
      const diff = nextPayment - now;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      setCountdown({ days });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [primarySubscription]);

  const getStatusBadge = (status) => {
    const variants = {
      active: 'default',
      trial: 'secondary',
      paused: 'outline',
      canceled: 'destructive',
      inactive: 'secondary'
    };

    return (
      <Badge variant={variants[status] || 'default'} data-testid={`status-badge-${status}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleManageSubscription = () => {
    navigate(`/subscriptions/${primarySubscription.id}`);
  };

  const handleOpenBasecamp = () => {
    const basecampUrl = window.samsaraMyAccount?.basecampUrl || 'https://videos.samsaraexperience.com';
    window.open(basecampUrl, '_blank');
  };

  // Check if user has Basecamp access based on memberships OR subscriptions
  // First check memberships
  const hasBasecampMembership = (memberships || []).some(membership => {
    const slug = membership.slug?.toLowerCase() || '';
    const name = membership.name?.toLowerCase() || '';
    const isActive = membership.status === 'active';

    return isActive && (
      slug.includes('basecamp') ||
      slug.includes('athlete-team') ||
      name.includes('basecamp') ||
      name.includes('athlete team')
    );
  });

  // Also check if they have an active subscription (subscriptions may grant access even without explicit membership)
  // Check subscription product names for Basecamp-granting products
  const hasBasecampSubscription = (subscriptions || []).some(subscription => {
    const planName = subscription.planName?.toLowerCase() || '';
    const isActive = subscription.status === 'active';

    return isActive && (
      planName.includes('athlete team') ||
      planName.includes('basecamp')
    );
  });

  const hasBasecampAccess = hasBasecampMembership || hasBasecampSubscription;

  // Filter memberships: exclude Athlete Team and Basecamp (they show in primary card)
  // and apply the status filter
  const filteredMemberships = (memberships || []).filter(m => {
    const slug = m.slug?.toLowerCase() || '';
    const name = m.name?.toLowerCase() || '';

    // Exclude Athlete Team and Basecamp memberships
    const isAthleteTeamOrBasecamp =
      slug.includes('athlete-team') ||
      slug.includes('basecamp') ||
      name.includes('athlete team') ||
      name.includes('basecamp');

    if (isAthleteTeamOrBasecamp) return false;

    // Apply status filter
    return membershipFilter === 'all' ? true : m.status === membershipFilter;
  });

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
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16" data-testid="mobile-user-avatar">
                <AvatarImage src={userData.avatarUrl} alt={userData.displayName} />
                <AvatarFallback className="bg-samsara-gold text-samsara-black text-lg">
                  {userData.firstName?.[0]}{userData.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-stone-900">
                  {userData.displayName}
                </h1>
                <p className="text-sm text-stone-600">
                  Member since {memberSinceFormatted}
                </p>
              </div>
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
      <div className={`grid gap-6 ${hasBasecampAccess ? 'md:grid-cols-[1fr,400px]' : 'grid-cols-1'}`}>
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
            {/* Only show billing info if this is a subscription (not a manually-added membership) */}
            {!primarySubscription.isMembership && primarySubscription.nextPaymentDate ? (
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
                <Button
                  onClick={handleManageSubscription}
                  className="bg-samsara-gold hover:bg-samsara-gold/90 text-samsara-black"
                  data-testid="manage-subscription-btn"
                >
                  Manage Subscription
                </Button>
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
          <div
            onClick={handleOpenBasecamp}
            className="relative overflow-hidden rounded-lg border-2 border-samsara-gold cursor-pointer group h-full min-h-[400px] flex flex-col"
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
            <div className="absolute inset-0 bg-black/50" />

            {/* Content */}
            <div className="relative z-10 p-6 flex flex-col h-full justify-between">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">
                  Open Training Hub (Basecamp)
                </h3>
                <p className="text-stone-200">
                  Access your content in Basecamp. Your dedicated training platform awaits.
                </p>
              </div>

              {/* CTA Text at Bottom */}
              <div className="mt-auto">
                <p className="text-samsara-gold font-bold text-xl flex items-center gap-2">
                  Enter Basecamp
                  <ExternalLink className="h-5 w-5" />
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Additional Memberships */}
      <Card data-testid="memberships-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-stone-900">Additional Memberships</CardTitle>
              <CardDescription>Legacy training programs and courses</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={membershipFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setMembershipFilter('all')}
                data-testid="filter-all"
              >
                All
              </Button>
              <Button 
                size="sm" 
                variant={membershipFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setMembershipFilter('active')}
                data-testid="filter-active"
              >
                Active
              </Button>
              <Button 
                size="sm" 
                variant={membershipFilter === 'inactive' ? 'default' : 'outline'}
                onClick={() => setMembershipFilter('inactive')}
                data-testid="filter-inactive"
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMemberships.length === 0 ? (
            <div className="text-center py-12" data-testid="empty-memberships">
              <p className="text-stone-600 mb-4">No additional memberships</p>
              <Button variant="outline" data-testid="browse-plans-btn">
                Browse our training plans
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Show one card per program page, not per membership */}
              {filteredMemberships.flatMap((membership) => {
                const hasPages = membership.restrictedPages && membership.restrictedPages.length > 0;

                if (!hasPages) return [];

                // Create one card for each program page
                return membership.restrictedPages.map((page) => {
                  const imageUrl = page.featuredImage || null;

                  return (
                    <Card
                      key={`${membership.id}-${page.id}`}
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() => window.location.href = page.url}
                      data-testid={`program-card-${page.id}`}
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
                      </CardContent>
                    </Card>
                  );
                });
              })}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default Dashboard;
