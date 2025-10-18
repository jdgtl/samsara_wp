import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import {
  ExternalLink,
  Pause,
  Play,
  XCircle,
  AlertTriangle,
  Filter,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getDaysUntilExpiration } from '../lib/utils';
import { useDashboard } from '../hooks/useDashboard';
import { useSubscriptionActions } from '../hooks/useSubscriptions';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState({ days: 0, hours: 0 });
  const [membershipFilter, setMembershipFilter] = useState('all');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
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

  // Subscription actions
  const { cancelSubscription, pauseSubscription, resumeSubscription, actionLoading } = useSubscriptionActions();

  // Get user data from WordPress global
  const userData = window.samsaraMyAccount?.userData || {
    firstName: 'User',
    lastName: '',
    displayName: 'User',
    email: ''
  };

  // Calculate countdown for next payment
  useEffect(() => {
    const calculateCountdown = () => {
      if (!primarySubscription || !primarySubscription.nextPaymentDate) return;

      const now = new Date();
      const nextPayment = new Date(primarySubscription.nextPaymentDate);
      const diff = nextPayment - now;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      setCountdown({ days, hours });
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

  const handlePauseClick = () => {
    if (primarySubscription.status === 'paused') {
      handleResume();
    } else {
      setShowPauseDialog(true);
    }
  };

  const handlePause = async () => {
    setShowPauseDialog(false);
    const result = await pauseSubscription(primarySubscription.id);
    if (result.success) {
      refetch(); // Refresh dashboard data
    } else {
      alert(`Failed to pause subscription: ${result.error}`);
    }
  };

  const handleResume = async () => {
    const result = await resumeSubscription(primarySubscription.id);
    if (result.success) {
      refetch(); // Refresh dashboard data
    } else {
      alert(`Failed to resume subscription: ${result.error}`);
    }
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleCancel = async () => {
    setShowCancelDialog(false);
    const result = await cancelSubscription(primarySubscription.id);
    if (result.success) {
      refetch(); // Refresh dashboard data
    } else {
      alert(`Failed to cancel subscription: ${result.error}`);
    }
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
      {/* Welcome Header */}
      <div className="space-y-2" data-testid="welcome-section">
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
                  in {countdown.days} days, {countdown.hours} hours
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
              <>
                <Button
                  onClick={handleManageSubscription}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  data-testid="manage-subscription-btn"
                >
                  Manage
                </Button>

                {primarySubscription.status === 'active' && (
                  <Button
                    variant="outline"
                    onClick={handlePauseClick}
                    disabled={actionLoading}
                    data-testid="pause-btn"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                )}

                {primarySubscription.status === 'paused' && (
                  <Button
                    onClick={handlePauseClick}
                    disabled={actionLoading}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    data-testid="resume-btn"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                )}

                {(primarySubscription.status === 'active' || primarySubscription.status === 'paused') && (
                  <Button
                    variant="destructive"
                    onClick={handleCancelClick}
                    disabled={actionLoading}
                    data-testid="cancel-subscription-btn"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
      ) : (
        <Card className="border-2 border-stone-200" data-testid="no-subscription-card">
          <CardContent className="p-12 text-center">
            <p className="text-stone-600 mb-4">You don't have an active subscription</p>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => window.location.href = '/shop'}
            >
              Browse Plans
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Training Hub / Basecamp CTA - Only show if user has Basecamp access */}
      {hasBasecampAccess && (
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300" data-testid="basecamp-cta-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-stone-900">
                  Open Training Hub (Basecamp)
                </h3>
                <p className="text-stone-700">
                  Access your content in Basecamp. Your dedicated training platform awaits.
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleOpenBasecamp}
                className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                data-testid="open-basecamp-btn"
              >
                Open Basecamp
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMemberships.map((membership) => {
                  const isExpanded = expandedMemberships[membership.id];
                  const hasPages = membership.restrictedPages && membership.restrictedPages.length > 0;

                  return (
                    <React.Fragment key={membership.id}>
                      <TableRow data-testid={`membership-row-${membership.id}`}>
                        <TableCell className="font-medium">{membership.name}</TableCell>
                        <TableCell>{getStatusBadge(membership.status)}</TableCell>
                        <TableCell>
                          {new Date(membership.startedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          {membership.expiresAt
                            ? new Date(membership.expiresAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          {hasPages ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setExpandedMemberships(prev => ({
                                ...prev,
                                [membership.id]: !prev[membership.id]
                              }))}
                              data-testid={`view-membership-${membership.id}`}
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-4 w-4 mr-1" />
                                  Hide ({membership.restrictedPages.length})
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                  View ({membership.restrictedPages.length})
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled
                              data-testid={`view-membership-${membership.id}`}
                            >
                              No content
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                      {isExpanded && hasPages && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-stone-50 p-4">
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-stone-700 mb-3">
                                Membership Content:
                              </p>
                              <div className="grid gap-2">
                                {membership.restrictedPages.map((page) => (
                                  <Button
                                    key={page.id}
                                    variant="outline"
                                    size="sm"
                                    className="justify-start"
                                    onClick={() => window.location.href = page.url}
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    {page.title}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pause Confirmation Dialog */}
      <AlertDialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <AlertDialogContent data-testid="pause-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Pause Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Your subscription will be paused and you won't be charged. You can resume anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="pause-cancel-btn">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePause} data-testid="pause-confirm-btn">
              Pause Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent data-testid="cancel-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your subscription will be canceled and you'll lose access at the end of your current billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-cancel-btn">Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-700"
              data-testid="cancel-confirm-btn"
            >
              Yes, Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;