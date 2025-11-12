import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { ArrowLeft, XCircle, FileText, Loader2, AlertTriangle, AlertCircle, Calendar } from 'lucide-react';
import { useSubscription, useSubscriptionActions, useSubscriptionOrders } from '../hooks/useSubscriptions';
import { subscriptionsApi } from '../services/woocommerce';

const SubscriptionDetail = () => {
  const { subId } = useParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState({ days: 0 });
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Fetch live subscription data
  const { subscription, loading, error } = useSubscription(subId);
  const { cancelSubscription, actionLoading } = useSubscriptionActions();
  const { orders: relatedOrders, loading: ordersLoading } = useSubscriptionOrders(subId);

  // Fetch cancellation eligibility
  const [cancellationEligibility, setCancellationEligibility] = useState(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);

  useEffect(() => {
    const fetchCancellationEligibility = async () => {
      if (!subId) return;

      try {
        setEligibilityLoading(true);
        const data = await subscriptionsApi.getCancellationEligibility(subId);
        setCancellationEligibility(data);
      } catch (err) {
        console.error('Error fetching cancellation eligibility:', err);
      } finally {
        setEligibilityLoading(false);
      }
    };

    fetchCancellationEligibility();
  }, [subId]);

  // Calculate countdown for next payment or access expiry
  useEffect(() => {
    // For canceled subscriptions, use endDate; for active, use nextPaymentDate
    const targetDate = subscription?.status === 'canceled'
      ? subscription?.endDate
      : subscription?.nextPaymentDate;

    if (!targetDate) return;

    const calculateCountdown = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target - now;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      setCountdown({ days });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000);

    return () => clearInterval(interval);
  }, [subscription]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6" data-testid="subscription-detail-loading">
        <Link to="/subscriptions">
          <Button
            variant="ghost"
            className="gap-2"
            data-testid="back-btn"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Subscriptions
          </Button>
        </Link>
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
              <p className="text-stone-600">Loading subscription details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !subscription) {
    return (
      <div className="max-w-4xl mx-auto space-y-6" data-testid="subscription-not-found">
        <Link to="/subscriptions">
          <Button
            variant="ghost"
            className="gap-2"
            data-testid="back-btn"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Subscriptions
          </Button>
        </Link>
        {error ? (
          <Alert className="border-red-500 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="ml-2">
              <div className="text-red-900">
                <p className="font-medium">Failed to load subscription</p>
                <p className="text-sm">{error}</p>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-stone-600 mb-4">Subscription not found</p>
              <Link to="/subscriptions">
                <Button data-testid="back-to-subscriptions-btn">
                  Back to Subscriptions
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const variants = {
      active: { variant: 'default', className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' },
      trial: { variant: 'secondary', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
      canceled: { variant: 'destructive', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
    };

    const config = variants[status] || variants.active;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleCancel = async () => {
    // Pass the next payment date as the end date to preserve the prepaid term
    // This prevents the "Jan 1, 1970" epoch date issue
    const result = await cancelSubscription(subId, subscription.nextPaymentDate);
    if (result.success) {
      window.location.reload(); // Reload to fetch updated data
    } else {
      setShowCancelDialog(false);
      alert(`Failed to cancel subscription: ${result.error}`);
    }
  };

  const handleResubscribe = () => {
    // Redirect to the specific product page to re-purchase
    window.location.href = subscription.productUrl || '/shop/';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="subscription-detail-page">
      {/* Back button */}
      <Link to="/subscriptions">
        <Button
          variant="ghost"
          className="gap-2"
          data-testid="back-btn"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Subscriptions
        </Button>
      </Link>

      {/* Subscription Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl" data-testid="subscription-plan-name">
                {subscription.planName}
              </CardTitle>
              <CardDescription className="mt-1">
                Subscription ID: <span className="font-mono" data-testid="subscription-id">{subscription.id}</span>
              </CardDescription>
            </div>
            {getStatusBadge(subscription.status)}
          </div>
        </CardHeader>
      </Card>

      {/* Subscription Details */}
      <Card data-testid="subscription-details-section">
        <CardHeader>
          <CardTitle>Subscription Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`grid grid-cols-1 gap-6 ${subscription.status === 'canceled' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {/* Start Date - Always shown */}
            <div>
              <p className="text-sm text-stone-600">Start Date</p>
              <p className="text-lg font-medium text-stone-900" data-testid="start-date">
                {new Date(subscription.startDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            {/* Conditional: Active vs Canceled layout */}
            {subscription.status === 'canceled' ? (
              <>
                {/* For Canceled: Show Date Canceled - Always show this column */}
                <div>
                  <p className="text-sm text-stone-600">Date Canceled</p>
                  {subscription.canceledAt ? (
                    <p className="text-lg font-medium text-stone-900" data-testid="canceled-date">
                      {new Date(subscription.canceledAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  ) : (
                    <p className="text-lg font-medium text-stone-600" data-testid="canceled-date-unavailable">
                      Date not available
                    </p>
                  )}
                </div>

                {/* For Canceled: Show Access Valid Until */}
                {subscription.endDate && (
                  <div>
                    <p className="text-sm text-stone-600">Access Valid Until</p>
                    <p className="text-lg font-medium text-amber-700" data-testid="access-end-date">
                      {new Date(subscription.endDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-amber-600 font-medium mt-1" data-testid="access-countdown">
                      {countdown.days} days remaining
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* For Active: Show Next Payment Date */}
                {subscription.nextPaymentDate && (
                  <div>
                    <p className="text-sm text-stone-600">Next Payment Date</p>
                    <p className="text-lg font-medium text-stone-900" data-testid="next-payment-date">
                      {new Date(subscription.nextPaymentDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-emerald-700 font-medium mt-1" data-testid="payment-countdown">
                      in {countdown.days} days
                    </p>
                  </div>
                )}

                {/* For Active: Show Amount */}
                {subscription.nextPaymentAmount != null && (
                  <div>
                    <p className="text-sm text-stone-600">Amount</p>
                    <p className="text-lg font-medium text-stone-900" data-testid="payment-amount">
                      ${subscription.nextPaymentAmount.toFixed(2)} / {subscription.billingInterval}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card data-testid="subscription-actions-section">
        <CardHeader>
          <CardTitle>Manage Subscription</CardTitle>
          <CardDescription>Control your subscription settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscription.status === 'active' && (
              <>
                {/* Loading state while canceling */}
                {actionLoading ? (
                  <div className="flex items-center gap-3 p-4 border border-stone-200 rounded-lg bg-stone-50">
                    <Loader2 className="h-5 w-5 animate-spin text-red-600" />
                    <div>
                      <p className="font-medium text-stone-900">Canceling subscription...</p>
                      <p className="text-sm text-stone-600">Please wait while we process your request</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Cancel Button */}
                    <Button
                      variant="destructive"
                      onClick={() => setShowCancelDialog(true)}
                      disabled={!cancellationEligibility?.cancelable || eligibilityLoading}
                      className="gap-2"
                      data-testid="cancel-subscription-btn"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel Subscription
                    </Button>

                    {/* Cancellation eligibility info - two column layout */}
                    {!eligibilityLoading && cancellationEligibility && (
                      <div className="grid md:grid-cols-2 gap-4 pt-2 text-sm">
                        {/* Left: Reasons */}
                        {!cancellationEligibility.cancelable && cancellationEligibility.reasons && (
                          <div className="text-stone-700">
                            <p className="font-semibold mb-1">Cancellation not available</p>
                            <div className="text-xs space-y-0.5 text-stone-600">
                              {cancellationEligibility.reasons.map((reason, idx) => (
                                <p key={idx}>{reason}</p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Right: Window Info */}
                        {cancellationEligibility.window?.start && (
                          <div className={`${cancellationEligibility.cancelable ? 'text-emerald-700 md:col-span-2' : 'text-stone-700'}`}>
                            <p className="font-semibold mb-1">
                              {cancellationEligibility.cancelable ? '✓ ' : ''}Cancellation Window
                            </p>
                            {cancellationEligibility.window.end ? (
                              <p className="text-xs text-stone-600">
                                From <span className="font-medium">{cancellationEligibility.window.start}</span>
                                {' to '}
                                <span className="font-medium">{cancellationEligibility.window.end}</span>
                              </p>
                            ) : (
                              <p className="text-xs text-stone-600">
                                From <span className="font-medium">{cancellationEligibility.window.start}</span> onwards
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {subscription.status === 'canceled' && (
              <div className="space-y-3">
                <Button
                  onClick={handleResubscribe}
                  className="gap-2 bg-samsara-gold hover:bg-samsara-gold/90 text-samsara-black"
                  data-testid="resubscribe-btn"
                >
                  Re-subscribe to {subscription.planName}
                </Button>
                <p className="text-xs text-stone-600">
                  You'll be redirected to purchase this subscription again
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Related Orders */}
      {relatedOrders.length > 0 && (
        <Card data-testid="related-orders-section">
          <CardHeader>
            <CardTitle>Related Orders</CardTitle>
            <CardDescription>Orders associated with this subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {relatedOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex justify-between items-center p-3 border border-stone-200 rounded-lg hover:bg-stone-50 cursor-pointer transition-colors no-underline hover:no-underline"
                  data-testid={`related-order-${order.id}`}
                >
                  <div>
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-sm text-stone-600">
                      {new Date(order.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    data-testid={`view-related-order-${order.id}`}
                  >
                    <FileText className="h-4 w-4" />
                    View
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
            <AlertDialogCancel data-testid="cancel-cancel-btn">
              Keep Subscription
            </AlertDialogCancel>
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

export default SubscriptionDetail;