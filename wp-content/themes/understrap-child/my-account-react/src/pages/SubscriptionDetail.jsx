import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { ArrowLeft, Pause, Play, XCircle, CreditCard, FileText, Loader2, AlertTriangle } from 'lucide-react';
import { useSubscription, useSubscriptionActions, useSubscriptionOrders } from '../hooks/useSubscriptions';

const SubscriptionDetail = () => {
  const { subId } = useParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState({ days: 0, hours: 0 });
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);

  // Fetch live subscription data
  const { subscription, loading, error } = useSubscription(subId);
  const { cancelSubscription, pauseSubscription, resumeSubscription, actionLoading } = useSubscriptionActions();
  const { orders: relatedOrders, loading: ordersLoading } = useSubscriptionOrders(subId);

  // Calculate countdown for next payment
  useEffect(() => {
    if (!subscription?.nextPaymentDate) return;

    const calculateCountdown = () => {
      const now = new Date();
      const nextPayment = new Date(subscription.nextPaymentDate);
      const diff = nextPayment - now;
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      setCountdown({ days, hours });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000);

    return () => clearInterval(interval);
  }, [subscription]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6" data-testid="subscription-detail-loading">
        <Button
          variant="ghost"
          onClick={() => navigate('/subscriptions')}
          className="gap-2"
          data-testid="back-btn"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Subscriptions
        </Button>
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
        <Button
          variant="ghost"
          onClick={() => navigate('/subscriptions')}
          className="gap-2"
          data-testid="back-btn"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Subscriptions
        </Button>
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
              <Button onClick={() => navigate('/subscriptions')} data-testid="back-to-subscriptions-btn">
                Back to Subscriptions
              </Button>
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
      paused: { variant: 'outline', className: 'bg-amber-100 text-amber-800 hover:bg-amber-100' },
      canceled: { variant: 'destructive', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
    };

    const config = variants[status] || variants.active;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handlePause = async () => {
    setShowPauseDialog(false);
    const result = await pauseSubscription(subId);
    if (result.success) {
      window.location.reload(); // Reload to fetch updated data
    } else {
      alert(`Failed to pause subscription: ${result.error}`);
    }
  };

  const handleResume = async () => {
    const result = await resumeSubscription(subId);
    if (result.success) {
      window.location.reload(); // Reload to fetch updated data
    } else {
      alert(`Failed to resume subscription: ${result.error}`);
    }
  };

  const handleCancel = async () => {
    setShowCancelDialog(false);
    const result = await cancelSubscription(subId);
    if (result.success) {
      window.location.reload(); // Reload to fetch updated data
    } else {
      alert(`Failed to cancel subscription: ${result.error}`);
    }
  };

  const handleChangePlan = () => {
    alert('Plan change interface would open here');
  };

  const handleResubscribe = () => {
    // Redirect to the subscription product page to re-purchase
    if (subscription.productUrl) {
      window.location.href = subscription.productUrl;
    } else {
      // Fallback to shop page if product URL not available
      window.location.href = '/shop/';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="subscription-detail-page">
      {/* Back button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/subscriptions')}
        className="gap-2"
        data-testid="back-btn"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Subscriptions
      </Button>

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  in {countdown.days} days, {countdown.hours} hours
                </p>
              </div>
            )}
            
            {subscription.nextPaymentAmount && (
              <div>
                <p className="text-sm text-stone-600">Amount</p>
                <p className="text-lg font-medium text-stone-900" data-testid="payment-amount">
                  ${subscription.nextPaymentAmount.toFixed(2)} / {subscription.billingInterval}
                </p>
              </div>
            )}

            {subscription.canceledAt && (
              <div>
                <p className="text-sm text-stone-600">Canceled On</p>
                <p className="text-lg font-medium text-stone-900" data-testid="canceled-date">
                  {new Date(subscription.canceledAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
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
          <div className="flex flex-wrap gap-3">
            {subscription.status === 'active' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowPauseDialog(true)}
                  className="gap-2"
                  data-testid="pause-subscription-btn"
                >
                  <Pause className="h-4 w-4" />
                  Pause Subscription
                </Button>
                {/* TODO: Re-enable when subscription switching is configured in WooCommerce
                <Button
                  variant="outline"
                  onClick={handleChangePlan}
                  className="gap-2"
                  data-testid="change-plan-btn"
                >
                  <CreditCard className="h-4 w-4" />
                  Change Plan
                </Button>
                */}
              </>
            )}
            
            {subscription.status === 'paused' && (
              <Button 
                onClick={handleResume}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                data-testid="resume-subscription-btn"
              >
                <Play className="h-4 w-4" />
                Resume Subscription
              </Button>
            )}
            
            {(subscription.status === 'active' || subscription.status === 'paused') && (
              <Button 
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
                className="gap-2"
                data-testid="cancel-subscription-btn"
              >
                <XCircle className="h-4 w-4" />
                Cancel Subscription
              </Button>
            )}

            {subscription.status === 'canceled' && (
              <Button
                onClick={handleResubscribe}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                data-testid="resubscribe-btn"
              >
                Re-subscribe
              </Button>
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
                <div
                  key={order.id}
                  className="flex justify-between items-center p-3 border border-stone-200 rounded-lg hover:bg-stone-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/orders/${order.id}`)}
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

export default SubscriptionDetail;