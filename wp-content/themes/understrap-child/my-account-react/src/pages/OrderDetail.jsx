import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { ArrowLeft, Download, Mail, Loader2, AlertTriangle, Repeat } from 'lucide-react';
import { useOrder } from '../hooks/useOrders';
import { get } from '../services/api';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Fetch live order data
  const { order, loading, error } = useOrder(orderId);

  // Fetch subscription info for this order
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      if (!orderId) return;

      try {
        setSubscriptionLoading(true);
        const data = await get(`samsara/v1/orders/${orderId}/subscription`);
        setSubscriptionInfo(data);
      } catch (err) {
        console.error('Error fetching subscription info:', err);
        setSubscriptionInfo(null);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchSubscriptionInfo();
  }, [orderId]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6" data-testid="order-detail-loading">
        <Button
          variant="ghost"
          onClick={() => navigate('/orders')}
          className="gap-2"
          data-testid="back-btn"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
              <p className="text-stone-600">Loading order details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto space-y-6" data-testid="order-not-found">
        <Button
          variant="ghost"
          onClick={() => navigate('/orders')}
          className="gap-2"
          data-testid="back-btn"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>
        {error ? (
          <Alert className="border-red-500 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="ml-2">
              <div className="text-red-900">
                <p className="font-medium">Failed to load order</p>
                <p className="text-sm">{error}</p>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-stone-600 mb-4">Order not found</p>
              <Button onClick={() => navigate('/orders')} data-testid="back-to-orders-btn">
                Back to Orders
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const variants = {
      completed: { variant: 'default', className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' },
      processing: { variant: 'secondary', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
      'on-hold': { variant: 'outline', className: 'bg-amber-100 text-amber-800 hover:bg-amber-100' },
      pending: { variant: 'outline', className: 'bg-stone-200 text-stone-700 hover:bg-stone-200' },
      refunded: { variant: 'outline', className: 'bg-purple-100 text-purple-800 hover:bg-purple-100' },
      cancelled: { variant: 'destructive', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
      canceled: { variant: 'destructive', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
      failed: { variant: 'destructive', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
    };

    const config = variants[status] || { variant: 'outline', className: 'bg-stone-100 text-stone-800 hover:bg-stone-100' };

    // Format display name (handle both cancelled and canceled)
    const displayName = status === 'cancelled' ? 'Canceled' :
                       status === 'on-hold' ? 'On Hold' :
                       status.charAt(0).toUpperCase() + status.slice(1);

    return (
      <Badge variant={config.variant} className={config.className}>
        {displayName}
      </Badge>
    );
  };

  const handleDownloadReceipt = () => {
    alert('Receipt download would be triggered here');
  };

  const handleContactSupport = () => {
    alert('Contact support modal/email would open here');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="order-detail-page">
      {/* Back button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/orders')}
        className="gap-2"
        data-testid="back-btn"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Button>

      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl" data-testid="order-number">
                Order #{order.id}
              </CardTitle>
              <CardDescription className="mt-1" data-testid="order-date">
                Placed on {new Date(order.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </CardDescription>
            </div>
            {getStatusBadge(order.status)}
          </div>
        </CardHeader>
      </Card>

      {/* Order Items */}
      <Card data-testid="order-items-section">
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center" data-testid={`order-item-${index}`}>
                <div>
                  <p className="font-medium text-stone-900">{item}</p>
                  <p className="text-sm text-stone-600">Quantity: 1</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Breakdown */}
      <Card data-testid="pricing-section">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-stone-700">
              <span>Subtotal</span>
              <span data-testid="subtotal">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-stone-700">
              <span>Shipping</span>
              <span data-testid="shipping">${order.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-stone-700">
              <span>Tax</span>
              <span data-testid="tax">${order.tax.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount</span>
                <span data-testid="discount">-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between text-lg font-bold text-stone-900">
              <span>Total</span>
              <span data-testid="total">${order.total.toFixed(2)} {order.currency}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card data-testid="payment-section">
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-stone-900" data-testid="payment-method">{order.paymentMethod}</p>
        </CardContent>
      </Card>

      {/* Related Subscription */}
      {subscriptionInfo && subscriptionInfo.subscriptionId && (
        <Card data-testid="subscription-section">
          <CardHeader>
            <CardTitle>Related Subscription</CardTitle>
            <CardDescription>
              {subscriptionInfo.isParent && 'This order created this subscription'}
              {subscriptionInfo.isRenewal && 'This is a renewal payment for this subscription'}
              {subscriptionInfo.isSwitch && 'This order modified this subscription'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="flex justify-between items-center p-4 border border-stone-200 rounded-lg hover:bg-stone-50 cursor-pointer transition-colors"
              onClick={() => navigate(`/subscriptions/${subscriptionInfo.subscriptionId}`)}
              data-testid="related-subscription"
            >
              <div className="flex items-center gap-3">
                <Repeat className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-medium text-stone-900">Subscription #{subscriptionInfo.subscriptionId}</p>
                  <p className="text-sm text-stone-600 capitalize">
                    Status: {subscriptionInfo.subscriptionStatus}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                data-testid="view-subscription-btn"
              >
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions - TODO: Implement Download Receipt and Contact Support functionality */}
      {/* Temporarily hidden until proper implementation
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleDownloadReceipt}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          data-testid="download-receipt-btn"
        >
          <Download className="h-4 w-4" />
          Download Receipt
        </Button>
        <Button
          variant="outline"
          onClick={handleContactSupport}
          className="gap-2"
          data-testid="contact-support-btn"
        >
          <Mail className="h-4 w-4" />
          Contact Support
        </Button>
      </div>
      */}
    </div>
  );
};

export default OrderDetail;