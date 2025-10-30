import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription } from './ui/alert';
import { CreditCard, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { initializeStripe, createCardElement, confirmCardSetup } from '../services/stripe';
import { paymentMethodsApi } from '../services/woocommerce';

const AddPaymentMethodModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [cardholderName, setCardholderName] = useState('');

  const [stripe, setStripe] = useState(null);
  const [cardElement, setCardElement] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);

  const cardElementRef = useRef(null);

  // Initialize Stripe when modal opens
  useEffect(() => {
    if (isOpen && !stripe) {
      initializeModal();
    }
  }, [isOpen]);

  // Mount card element
  useEffect(() => {
    if (stripe && cardElementRef.current && !cardElement) {
      const element = createCardElement(stripe);
      element.mount(cardElementRef.current);
      setCardElement(element);

      // Listen for errors
      element.on('change', (event) => {
        if (event.error) {
          setError(event.error.message);
        } else {
          setError(null);
        }
      });
    }

    // Cleanup
    return () => {
      if (cardElement) {
        cardElement.unmount();
      }
    };
  }, [stripe, cardElementRef.current]);

  const initializeModal = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get Setup Intent from backend
      const response = await paymentMethodsApi.initializeAddPaymentMethod();

      if (!response.clientSecret || !response.publishableKey) {
        throw new Error('Failed to initialize payment setup');
      }

      setClientSecret(response.clientSecret);

      // Initialize Stripe
      const stripeInstance = initializeStripe(response.publishableKey);
      setStripe(stripeInstance);

    } catch (err) {
      console.error('Error initializing modal:', err);
      setError(err.message || 'Failed to initialize payment form');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !cardElement || !clientSecret) {
      setError('Payment form not initialized');
      return;
    }

    if (!cardholderName.trim()) {
      setError('Please enter cardholder name');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Confirm card setup with Stripe
      console.log('Confirming card setup with Stripe...');
      const setupIntent = await confirmCardSetup(
        stripe,
        clientSecret,
        cardElement,
        {
          name: cardholderName,
        }
      );

      console.log('Setup Intent result:', setupIntent);

      // Verify the setup intent succeeded
      if (!setupIntent || setupIntent.status !== 'succeeded') {
        throw new Error(`Setup Intent did not succeed. Status: ${setupIntent?.status || 'unknown'}`);
      }

      if (!setupIntent.id) {
        throw new Error('Setup Intent ID is missing');
      }

      // Save to WooCommerce
      console.log('💳 Saving payment method to WooCommerce...', {
        setupIntentId: setupIntent.id,
        setAsDefault,
        timestamp: new Date().toISOString()
      });

      const result = await paymentMethodsApi.confirmPaymentMethod(
        setupIntent.id,
        setAsDefault
      );

      console.log('✅ WooCommerce save result:', result);

      if (!result.success) {
        throw new Error(result.message || 'Failed to save payment method');
      }

      setSuccess(true);
      console.log('🎉 Payment method added successfully, will refresh in 1.5s');

      // Close modal after short delay
      setTimeout(() => {
        console.log('🔄 Calling onSuccess() to refresh payment methods list');
        onSuccess();
        onClose();
        resetForm();
      }, 1500);

    } catch (err) {
      console.error('Error adding payment method:', err);
      setError(err.message || 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCardholderName('');
    setSetAsDefault(false);
    setError(null);
    setSuccess(false);
    setStripe(null);
    setCardElement(null);
    setClientSecret(null);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            Add Payment Method
          </DialogTitle>
          <DialogDescription>
            Add a new credit or debit card for future purchases and subscriptions
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8">
            <Alert className="border-emerald-500 bg-emerald-50">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="ml-2 text-emerald-900">
                Payment method added successfully!
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="border-red-500 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="ml-2 text-red-900">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Cardholder Name */}
            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                type="text"
                placeholder="John Doe"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                disabled={loading || success}
                required
              />
            </div>

            {/* Stripe Card Element */}
            <div className="space-y-2">
              <Label>Card Details</Label>
              <div
                ref={cardElementRef}
                className="border border-stone-200 rounded-md p-3 bg-white"
                style={{ minHeight: '40px' }}
              />
              <p className="text-xs text-stone-500">
                Your card information is encrypted and secure
              </p>
            </div>

            {/* Set as Default */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="setAsDefault"
                checked={setAsDefault}
                onCheckedChange={setSetAsDefault}
                disabled={loading || success}
              />
              <Label
                htmlFor="setAsDefault"
                className="text-sm font-normal cursor-pointer"
              >
                Set as default payment method
              </Label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading || success || !stripe || !cardElement}
                className="flex-1 bg-samsara-gold hover:bg-samsara-gold/90 text-samsara-black"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Add Card'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading || success}
              >
                Cancel
              </Button>
            </div>

            {/* Stripe Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-stone-500 pt-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
              </svg>
              <span>Secured by Stripe</span>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddPaymentMethodModal;
