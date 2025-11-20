import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { ArrowLeft, Loader2, AlertTriangle, Repeat, Gift } from 'lucide-react';
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

  // Fetch gift cards for this order
  const [giftCards, setGiftCards] = useState([]);
  const [giftCardsLoading, setGiftCardsLoading] = useState(false);

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

    const fetchGiftCards = async () => {
      if (!orderId) return;

      try {
        setGiftCardsLoading(true);
        const data = await get(`samsara/v1/orders/${orderId}/gift-cards`);
        // Ensure we always set an array, even if API returns null or empty string
        setGiftCards(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching gift cards:', err);
        setGiftCards([]);
      } finally {
        setGiftCardsLoading(false);
      }
    };

    fetchSubscriptionInfo();
    fetchGiftCards();
  }, [orderId]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6" data-testid="order-detail-loading">
        <Link to="/orders">
          <Button
            variant="ghost"
            className="gap-2"
            data-testid="back-btn"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
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
        <Link to="/orders">
          <Button
            variant="ghost"
            className="gap-2"
            data-testid="back-btn"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
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
              <Link to="/orders">
                <Button data-testid="back-to-orders-btn">
                  Back to Orders
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

  const getGiftCardStatusBadge = (giftCard) => {
    // Check if redeemed to account
    if (giftCard.is_redeemed_to_account) {
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          In Account
        </Badge>
      );
    }

    // Otherwise show the standard status
    const variants = {
      active: { variant: 'default', className: 'bg-amber-100 text-amber-800 hover:bg-amber-100', label: 'Ready to Redeem' },
      used: { variant: 'secondary', className: 'bg-stone-200 text-stone-700 hover:bg-stone-200', label: 'Used' },
      expired: { variant: 'outline', className: 'bg-red-100 text-red-800 hover:bg-red-100', label: 'Expired' },
      inactive: { variant: 'outline', className: 'bg-stone-300 text-stone-700 hover:bg-stone-300', label: 'Inactive' },
    };

    const config = variants[giftCard.status] || { variant: 'outline', className: 'bg-stone-100 text-stone-800 hover:bg-stone-100', label: 'Unknown' };

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="order-detail-page">
      {/* Back button */}
      <Link to="/orders">
        <Button
          variant="ghost"
          className="gap-2"
          data-testid="back-btn"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>
      </Link>

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
              <div key={index} className="flex justify-between items-start" data-testid={`order-item-${index}`}>
                <div>
                  <p className="font-medium text-stone-900">{item.name}</p>
                  <p className="text-sm text-stone-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-stone-900">{formatCurrency(item.total)}</p>
                  {/* Show original price if discount applied */}
                  {item.subtotal > item.total && (
                    <p className="text-sm text-stone-500 line-through">{formatCurrency(item.subtotal)}</p>
                  )}
                  {/* Show regular price if available and different from price paid */}
                  {item.regularPrice && item.regularPrice * item.quantity > item.total && !item.subtotal && (
                    <p className="text-sm text-stone-500 line-through">{formatCurrency(item.regularPrice * item.quantity)}</p>
                  )}
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
          <p className="text-stone-900" data-testid="payment-method">
            {order.paymentMethod || (order.total === 0 ? 'Gift Card (Paid in full)' : 'Not specified')}
          </p>
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
            <Link
              to={`/subscriptions/${subscriptionInfo.subscriptionId}`}
              className="flex justify-between items-center p-4 border border-stone-200 rounded-lg hover:bg-stone-50 cursor-pointer transition-colors no-underline hover:no-underline"
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
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Related Gift Cards */}
      {giftCards && giftCards.length > 0 && (
        <Card data-testid="gift-cards-section">
          <CardHeader>
            <CardTitle>Gift Cards</CardTitle>
            <CardDescription>
              {giftCards.length === 1
                ? 'This order includes 1 gift card'
                : `This order includes ${giftCards.length} gift cards`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {giftCards.map((giftCard) => (
                <Link
                  key={giftCard.id}
                  to={`/gift-cards/${giftCard.id}`}
                  className="flex justify-between items-center p-4 border border-stone-200 rounded-lg hover:bg-stone-50 cursor-pointer transition-colors no-underline hover:no-underline"
                  data-testid={`gift-card-${giftCard.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Gift className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-stone-900 font-mono">{giftCard.code}</p>
                      <p className="text-sm text-stone-600">
                        {formatCurrency(giftCard.remaining)} remaining • To: {giftCard.recipient}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getGiftCardStatusBadge(giftCard)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      data-testid={`view-gift-card-btn-${giftCard.id}`}
                    >
                      View
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions - TODO: Implement Download Receipt and Contact Support functionality */}
      {/* Temporarily hidden until proper implementation
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleDownloadReceipt}
          className="gap-2 bg-samsara-gold hover:bg-samsara-gold/90 text-samsara-black"
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