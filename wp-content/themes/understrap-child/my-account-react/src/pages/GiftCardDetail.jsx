import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { ArrowLeft, Loader2, AlertTriangle, Copy, Check, User, Mail, Wallet } from 'lucide-react';
import { useGiftCard } from '../hooks/useGiftCards';
import { giftCardsApi } from '../services/woocommerce';

const GiftCardDetail = () => {
  const { cardId } = useParams();
  const [copiedCode, setCopiedCode] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);
  const [redeemError, setRedeemError] = useState(null);

  // Fetch gift card data
  const { giftCard, loading, error, errorDetails, refetch } = useGiftCard(cardId);

  const copyToClipboard = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRedeemToAccount = async () => {
    try {
      setRedeemLoading(true);
      setRedeemError(null);
      await giftCardsApi.redeemToAccount(cardId);
      setRedeemSuccess(true);
      // Refetch to show updated state
      setTimeout(() => refetch(), 500);
    } catch (err) {
      // Create detailed error message with technical info if available
      let errorMsg = err.message || 'Failed to redeem gift card';

      // Append technical details if available
      if (err.data?.technical_details) {
        errorMsg += `\n\nTechnical Details:\n`;
        errorMsg += `Exception: ${err.data.technical_details.exception}\n`;
        errorMsg += `Message: ${err.data.technical_details.message}\n`;
        errorMsg += `File: ${err.data.technical_details.file}:${err.data.technical_details.line}`;
      }

      setRedeemError(errorMsg);
      console.error('Error redeeming gift card:', err);
      console.error('Technical details:', err.data?.technical_details);
    } finally {
      setRedeemLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return 'No expiry';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (giftCard) => {
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

  const getActivityTypeLabel = (type) => {
    const labels = {
      issued: 'Issued',
      redeemed: 'Added to Account',
      refunded: 'Refunded',
      used: 'Used',
      credited: 'Credited',
    };
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getActivityTypeBadge = (type) => {
    const variants = {
      issued: 'bg-blue-100 text-blue-800',
      redeemed: 'bg-blue-100 text-blue-800', // Matches "In Account" status badge
      refunded: 'bg-purple-100 text-purple-800',
      used: 'bg-stone-200 text-stone-700',
      credited: 'bg-amber-100 text-amber-800',
    };

    const className = variants[type] || 'bg-stone-100 text-stone-800';

    return (
      <Badge variant="outline" className={className}>
        {getActivityTypeLabel(type)}
      </Badge>
    );
  };

  const getActivityAmountDisplay = (activity) => {
    // Determine if this activity adds or removes balance
    // issued, credited, refunded = adds balance (positive, green)
    // used = removes balance (negative, red)
    // redeemed = neutral/informational (no +/-, blue-gray)
    const addsBalance = ['issued', 'credited', 'refunded'].includes(activity.type);
    const isRedeemed = activity.type === 'redeemed';
    const amount = Math.abs(activity.amount);

    if (amount === 0) return null;

    if (isRedeemed) {
      return (
        <span className="text-stone-900">
          {formatCurrency(amount)}
        </span>
      );
    }

    return (
      <span className={addsBalance ? 'text-emerald-600' : 'text-red-600'}>
        {addsBalance ? '+' : '-'}
        {formatCurrency(amount)}
      </span>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6" data-testid="gift-card-detail-loading">
        <Link to="/gift-cards">
          <Button variant="ghost" className="gap-2" data-testid="back-btn">
            <ArrowLeft className="h-4 w-4" />
            Back to Gift Cards
          </Button>
        </Link>
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
              <p className="text-stone-600">Loading gift card details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !giftCard) {
    return (
      <div className="max-w-4xl mx-auto space-y-6" data-testid="gift-card-not-found">
        <Link to="/gift-cards">
          <Button variant="ghost" className="gap-2" data-testid="back-btn">
            <ArrowLeft className="h-4 w-4" />
            Back to Gift Cards
          </Button>
        </Link>
        {error ? (
          <Card>
            <CardContent className="py-8">
              <Alert className="border-red-500 bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <AlertDescription className="ml-2">
                  <div className="text-red-900">
                    <p className="font-semibold text-lg mb-2">Failed to load gift card</p>
                    <p className="text-sm mb-4">{error}</p>

                    {/* Technical details section */}
                    <div className="mt-4 pt-4 border-t border-red-200">
                      <details className="text-xs">
                        <summary className="cursor-pointer font-medium text-red-800 hover:text-red-900">
                          Show technical details (for support)
                        </summary>
                        <div className="mt-3 p-3 bg-red-100 rounded font-mono text-red-900 whitespace-pre-wrap break-all">
                          <p><strong>Error:</strong> {error}</p>
                          <p><strong>Gift Card ID:</strong> {cardId}</p>
                          <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
                          {errorDetails && (
                            <>
                              <p className="mt-2"><strong>Exception:</strong> {errorDetails.exception}</p>
                              <p><strong>Message:</strong> {errorDetails.message}</p>
                              <p><strong>File:</strong> {errorDetails.file}</p>
                              <p><strong>Line:</strong> {errorDetails.line}</p>
                            </>
                          )}
                          <p className="mt-2"><strong>User Agent:</strong> {navigator.userAgent}</p>
                        </div>
                      </details>
                      <p className="text-xs text-red-700 mt-3">
                        Please share the technical details above with our support team if you need assistance.
                      </p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="mt-6 text-center">
                <Link to="/gift-cards">
                  <Button variant="outline" className="mr-3">
                    Back to Gift Cards
                  </Button>
                </Link>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-samsara-gold hover:bg-samsara-gold/90 text-samsara-black"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-stone-600 mb-4">Gift card not found</p>
              <Link to="/gift-cards">
                <Button data-testid="back-to-gift-cards-btn">
                  Back to Gift Cards
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="gift-card-detail-page">
      {/* Back button */}
      <Link to="/gift-cards">
        <Button variant="ghost" className="gap-2" data-testid="back-btn">
          <ArrowLeft className="h-4 w-4" />
          Back to Gift Cards
        </Button>
      </Link>

      {/* Gift Card Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle className="text-2xl">Gift Card</CardTitle>
              <CardDescription className="mt-2">
                {giftCard.sender && `From: ${giftCard.sender}`}
              </CardDescription>
            </div>
            {getStatusBadge(giftCard)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Gift Card Code */}
          <div className="bg-stone-50 p-6 rounded-lg text-center space-y-4">
            <p className="text-sm text-stone-600 font-medium">Gift Card Code</p>
            <div className="flex items-center justify-center gap-3">
              <code className="text-2xl font-mono font-bold text-stone-900 tracking-wider">
                {giftCard.code}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(giftCard.code)}
                className="text-stone-600 hover:text-stone-900"
                data-testid="copy-code-btn"
              >
                {copiedCode ? (
                  <Check className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>
            {copiedCode && (
              <p className="text-sm text-emerald-600">Code copied to clipboard!</p>
            )}
          </div>

          <Separator />

          {/* Balance Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-stone-50 rounded-lg">
              <p className="text-sm text-stone-600 mb-1">Original Balance</p>
              <p className="text-2xl font-bold text-stone-900">
                {formatCurrency(giftCard.balance)}
              </p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-stone-600 mb-1">Remaining</p>
              <p className="text-2xl font-bold text-emerald-700">
                {formatCurrency(giftCard.remaining)}
              </p>
            </div>
            <div className="text-center p-4 bg-stone-50 rounded-lg">
              <p className="text-sm text-stone-600 mb-1">Expiry Date</p>
              <p className="text-lg font-semibold text-stone-900">
                {formatShortDate(giftCard.expire_date)}
              </p>
            </div>
          </div>

          {/* Redeem to Account Button - Only show if not already redeemed */}
          {giftCard.remaining > 0 && !giftCard.is_redeemed_to_account && (
            <>
              <Separator />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Wallet className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-blue-900">Add to Account Balance</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Redeem this gift card to use it automatically at checkout
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleRedeemToAccount}
                    disabled={redeemLoading || redeemSuccess}
                    className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
                    data-testid="redeem-to-account-btn"
                  >
                    {redeemLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Redeeming...
                      </>
                    ) : redeemSuccess ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Added to Account
                      </>
                    ) : (
                      'Add to Account'
                    )}
                  </Button>
                </div>
                {redeemSuccess && (
                  <Alert className="mt-4 bg-emerald-50 border-emerald-200">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <AlertDescription className="ml-2 text-emerald-900">
                      Gift card successfully added to your account! You can now use it at checkout.
                    </AlertDescription>
                  </Alert>
                )}
                {redeemError && (
                  <Alert className="mt-4 bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="ml-2">
                      <div className="text-red-900">
                        <p className="font-medium whitespace-pre-wrap">{redeemError}</p>
                        <p className="text-xs text-red-700 mt-2">
                          If this problem persists, please contact support with the details above.
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}

          {/* Sender/Recipient Information */}
          {(giftCard.sender || giftCard.recipient) && (
            <>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {giftCard.sender && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-medium text-blue-900">From</p>
                    </div>
                    <p className="text-stone-900 font-medium">{giftCard.sender}</p>
                    {giftCard.sender_email && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-stone-600">
                        <Mail className="h-3 w-3" />
                        <p>{giftCard.sender_email}</p>
                      </div>
                    )}
                  </div>
                )}
                {giftCard.recipient && (
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-emerald-600" />
                      <p className="text-sm font-medium text-emerald-900">To</p>
                    </div>
                    <p className="text-stone-900 font-medium">{giftCard.recipient}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Transaction History */}
          {giftCard.activities && giftCard.activities.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-stone-900 mb-3">Transaction History</p>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {giftCard.activities.map((activity) => (
                        <TableRow key={activity.id} data-testid={`activity-${activity.id}`}>
                          <TableCell className="text-sm">
                            {new Date(activity.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell>{getActivityTypeBadge(activity.type)}</TableCell>
                          <TableCell className="font-medium">
                            {getActivityAmountDisplay(activity)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {activity.note && <span className="text-sm text-stone-600">{activity.note}</span>}
                              {activity.object_id && activity.object_id > 0 && (
                                <Link
                                  to={`/orders/${activity.object_id}`}
                                  className="text-emerald-600 hover:underline text-sm font-medium"
                                >
                                  View Order #{activity.object_id}
                                </Link>
                              )}
                              {activity.user_email && (
                                <span className="text-xs text-stone-500">by {activity.user_email}</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}

          {/* Message */}
          {giftCard.message && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-stone-700 mb-2">Message</p>
                <p className="text-stone-600 italic bg-stone-50 p-4 rounded-lg">
                  "{giftCard.message}"
                </p>
              </div>
            </>
          )}

          {/* Dates */}
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-stone-700 mb-1">Created</p>
              <p className="text-stone-600">{formatDate(giftCard.create_date)}</p>
            </div>
            {giftCard.deliver_date && (
              <div>
                <p className="text-sm font-medium text-stone-700 mb-1">Delivered</p>
                <p className="text-stone-600">{formatDate(giftCard.deliver_date)}</p>
              </div>
            )}
            {giftCard.redeem_date && (
              <div>
                <p className="text-sm font-medium text-stone-700 mb-1">First Redeemed</p>
                <p className="text-stone-600">{formatDate(giftCard.redeem_date)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GiftCardDetail;
