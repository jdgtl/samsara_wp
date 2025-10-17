import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { CreditCard, Plus, Trash2, LayoutGrid, List, Loader2, AlertTriangle } from 'lucide-react';
import { usePaymentMethods, usePaymentMethodActions } from '../hooks/usePaymentMethods';
import { useCustomer } from '../hooks/useCustomer';

const Payments = () => {
  const [useBillingAsShipping, setUseBillingAsShipping] = useState(true);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'

  // Fetch live data
  const { paymentMethods, loading: paymentLoading, error: paymentError, refetch: refetchPayments } = usePaymentMethods();
  const { deletePaymentMethod, setDefaultPaymentMethod, actionLoading } = usePaymentMethodActions();
  const { customer, loading: customerLoading, error: customerError } = useCustomer();

  const loading = paymentLoading || customerLoading;
  const error = paymentError || customerError;

  const handleAddPaymentMethod = () => {
    alert('Add payment method interface would open here');
  };

  const handleRemovePaymentMethod = async (methodId) => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      const result = await deletePaymentMethod(methodId);
      if (result.success) {
        refetchPayments();
      } else {
        alert(`Failed to remove payment method: ${result.error}`);
      }
    }
  };

  const handleSetDefault = async (methodId) => {
    const result = await setDefaultPaymentMethod(methodId);
    if (result.success) {
      refetchPayments();
    } else {
      alert(`Failed to set default payment method: ${result.error}`);
    }
  };

  const handleEditBillingAddress = () => {
    alert('Edit billing address interface would open here');
  };

  const handleEditShippingAddress = () => {
    alert('Edit shipping address interface would open here');
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6" data-testid="payments-loading">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-stone-900">Payment Methods</h1>
          <p className="text-stone-600">Manage your saved payment methods and billing information</p>
        </div>
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
              <p className="text-stone-600">Loading payment information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6" data-testid="payments-error">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-stone-900">Payment Methods</h1>
          <p className="text-stone-600">Manage your saved payment methods and billing information</p>
        </div>
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="ml-2">
            <div className="text-red-900">
              <p className="font-medium">Failed to load payment information</p>
              <p className="text-sm">{error}</p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const billingAddress = customer?.billing || {};
  const shippingAddress = customer?.shipping || {};

  return (
    <div className="max-w-7xl mx-auto space-y-6" data-testid="payments-page">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-stone-900">Payment Methods</h1>
        <p className="text-stone-600">Manage your saved payment methods and billing information</p>
      </div>

      {/* Payment Methods - Unified with View Toggle */}
      <Card data-testid="payment-methods-section">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Saved Cards</CardTitle>
              <CardDescription>Your payment methods on file</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'card'
                      ? 'bg-white shadow-sm text-emerald-600'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  aria-label="Card view"
                  data-testid="card-view-toggle"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-emerald-600'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  aria-label="List view"
                  data-testid="list-view-toggle"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              <Button
                onClick={handleAddPaymentMethod}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                data-testid="add-payment-method-btn"
              >
                <Plus className="h-4 w-4" />
                Add Card
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {(!paymentMethods || paymentMethods.length === 0) ? (
                <div className="text-center py-12 text-stone-600">
                  <p className="mb-4">No payment methods saved</p>
                  <Button onClick={handleAddPaymentMethod} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Card
                  </Button>
                </div>
              ) : paymentMethods.map((method) => {
                const isExpiringSoon = new Date(method.expYear, method.expMonth - 1) < new Date(new Date().setMonth(new Date().getMonth() + 2));

                return (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border border-stone-200 rounded-lg"
                    data-testid={`payment-method-${method.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-stone-100 rounded-lg">
                        <CreditCard className="h-6 w-6 text-stone-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-stone-900">
                            {method.brand} •••• {method.last4}
                          </p>
                          {method.isDefault && (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                              Default
                            </Badge>
                          )}
                          {isExpiringSoon && (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                              Expiring Soon
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-stone-600">
                          Expires {method.expMonth.toString().padStart(2, '0')}/{method.expYear}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!method.isDefault && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetDefault(method.id)}
                          disabled={actionLoading}
                          data-testid={`set-default-${method.id}`}
                        >
                          Set as Default
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemovePaymentMethod(method.id)}
                        disabled={actionLoading}
                        data-testid={`remove-${method.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Card View */}
          {viewMode === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(!paymentMethods || paymentMethods.length === 0) ? (
                <button
                  onClick={handleAddPaymentMethod}
                  className="relative border-2 border-dashed border-stone-300 rounded-2xl p-6 hover:border-emerald-500 hover:bg-emerald-50 transition-all aspect-[1.586/1] flex flex-col items-center justify-center group"
                  data-testid="add-card-cta"
                >
                  <div className="w-16 h-16 rounded-full bg-stone-100 group-hover:bg-emerald-100 flex items-center justify-center mb-3 transition-colors">
                    <Plus className="h-8 w-8 text-stone-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <p className="text-stone-600 group-hover:text-emerald-700 font-medium transition-colors">
                    ADD PAYMENT METHOD
                  </p>
                </button>
              ) : paymentMethods.map((method) => {
                const isExpiringSoon = new Date(method.expYear, method.expMonth - 1) < new Date(new Date().setMonth(new Date().getMonth() + 2));
                const cardColors = {
                  'Visa': 'from-blue-500 to-blue-700',
                  'MasterCard': 'from-orange-500 to-red-600',
                  'Amex': 'from-teal-500 to-blue-600',
                  'Discover': 'from-orange-400 to-orange-600'
                };
                const gradientClass = cardColors[method.brand] || 'from-stone-600 to-stone-800';

                return (
                  <div
                    key={method.id}
                    className={`relative bg-gradient-to-br ${gradientClass} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow aspect-[1.586/1] flex flex-col justify-between`}
                    data-testid={`card-style-${method.id}`}
                  >
                    {/* Top Section - Badge and Actions */}
                    <div className="flex items-start justify-between">
                      {method.isDefault && (
                        <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400 border-0 font-semibold">
                          DEFAULT
                        </Badge>
                      )}
                      {isExpiringSoon && (
                        <Badge className="bg-amber-400 text-amber-900 hover:bg-amber-400 border-0 font-semibold ml-auto">
                          Expiring Soon
                        </Badge>
                      )}
                      <button
                        onClick={() => handleRemovePaymentMethod(method.id)}
                        disabled={actionLoading}
                        className="ml-auto p-1 hover:bg-white/20 rounded transition-colors disabled:opacity-50"
                        aria-label="Remove card"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Middle Section - Card Number */}
                    <div className="space-y-1">
                      <p className="text-sm opacity-80 uppercase tracking-wider font-medium">
                        {method.brand}
                      </p>
                      <p className="text-xl font-mono tracking-widest">
                        •••• •••• •••• {method.last4}
                      </p>
                    </div>

                    {/* Bottom Section - Expiry */}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs opacity-70 uppercase">Expires</p>
                        <p className="text-base font-mono">
                          {method.expMonth.toString().padStart(2, '0')}/{method.expYear.toString().slice(-2)}
                        </p>
                      </div>
                      {!method.isDefault && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSetDefault(method.id)}
                          disabled={actionLoading}
                          className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs disabled:opacity-50"
                        >
                          Set Default
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add New Card CTA - Only show if there are existing cards */}
              {paymentMethods && paymentMethods.length > 0 && (
                <button
                onClick={handleAddPaymentMethod}
                className="relative border-2 border-dashed border-stone-300 rounded-2xl p-6 hover:border-emerald-500 hover:bg-emerald-50 transition-all aspect-[1.586/1] flex flex-col items-center justify-center group"
                data-testid="add-card-cta"
              >
                <div className="w-16 h-16 rounded-full bg-stone-100 group-hover:bg-emerald-100 flex items-center justify-center mb-3 transition-colors">
                  <Plus className="h-8 w-8 text-stone-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                <p className="text-stone-600 group-hover:text-emerald-700 font-medium transition-colors">
                  ADD PAYMENT METHOD
                </p>
              </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing and Shipping Addresses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Billing Address */}
        <Card data-testid="billing-address-section">
          <CardHeader>
            <CardTitle>Billing Address</CardTitle>
            <CardDescription>Address associated with your payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            {billingAddress && (billingAddress.address_1 || billingAddress.city) ? (
              <div className="space-y-2 text-stone-900">
                {(billingAddress.first_name || billingAddress.last_name) && (
                  <p className="font-medium">{billingAddress.first_name} {billingAddress.last_name}</p>
                )}
                {billingAddress.address_1 && <p>{billingAddress.address_1}</p>}
                {billingAddress.address_2 && <p>{billingAddress.address_2}</p>}
                {(billingAddress.city || billingAddress.state || billingAddress.postcode) && (
                  <p>{billingAddress.city}{billingAddress.state && `, ${billingAddress.state}`} {billingAddress.postcode}</p>
                )}
                {billingAddress.country && <p>{billingAddress.country}</p>}
              </div>
            ) : (
              <p className="text-stone-600">No billing address on file</p>
            )}
            <Separator className="my-4" />
            <Button
              variant="outline"
              onClick={handleEditBillingAddress}
              data-testid="edit-billing-address-btn"
            >
              Edit Address
            </Button>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card data-testid="shipping-address-section">
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
            <CardDescription>Address for order deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Checkbox to use billing as shipping */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-billing-as-shipping"
                  checked={useBillingAsShipping}
                  onCheckedChange={setUseBillingAsShipping}
                  data-testid="use-billing-as-shipping-checkbox"
                />
                <Label
                  htmlFor="use-billing-as-shipping"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Use billing address as shipping address
                </Label>
              </div>

              <Separator />

              {useBillingAsShipping ? (
                billingAddress && (billingAddress.address_1 || billingAddress.city) ? (
                  <div className="space-y-2 text-stone-900">
                    {(billingAddress.first_name || billingAddress.last_name) && (
                      <p className="font-medium">{billingAddress.first_name} {billingAddress.last_name}</p>
                    )}
                    {billingAddress.address_1 && <p>{billingAddress.address_1}</p>}
                    {billingAddress.address_2 && <p>{billingAddress.address_2}</p>}
                    {(billingAddress.city || billingAddress.state || billingAddress.postcode) && (
                      <p>{billingAddress.city}{billingAddress.state && `, ${billingAddress.state}`} {billingAddress.postcode}</p>
                    )}
                    {billingAddress.country && <p>{billingAddress.country}</p>}
                    <p className="text-sm text-stone-500 italic mt-2">Same as billing address</p>
                  </div>
                ) : (
                  <p className="text-stone-600">No address on file</p>
                )
              ) : (
                shippingAddress && (shippingAddress.address_1 || shippingAddress.city) ? (
                  <div className="space-y-2 text-stone-900">
                    {(shippingAddress.first_name || shippingAddress.last_name) && (
                      <p className="font-medium">{shippingAddress.first_name} {shippingAddress.last_name}</p>
                    )}
                    {shippingAddress.address_1 && <p>{shippingAddress.address_1}</p>}
                    {shippingAddress.address_2 && <p>{shippingAddress.address_2}</p>}
                    {(shippingAddress.city || shippingAddress.state || shippingAddress.postcode) && (
                      <p>{shippingAddress.city}{shippingAddress.state && `, ${shippingAddress.state}`} {shippingAddress.postcode}</p>
                    )}
                    {shippingAddress.country && <p>{shippingAddress.country}</p>}
                  </div>
                ) : (
                  <p className="text-stone-600">No shipping address on file</p>
                )
              )}

              <Separator className="my-4" />
              
              <Button 
                variant="outline"
                onClick={handleEditShippingAddress}
                disabled={useBillingAsShipping}
                data-testid="edit-shipping-address-btn"
              >
                Edit Shipping Address
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payments;