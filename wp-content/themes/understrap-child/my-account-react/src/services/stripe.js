/**
 * Stripe Integration Service
 * Handles Stripe.js initialization and payment method setup
 */

let stripeInstance = null;

/**
 * Initialize Stripe with publishable key
 */
export const initializeStripe = (publishableKey) => {
  if (!stripeInstance && window.Stripe) {
    stripeInstance = window.Stripe(publishableKey);
  }
  return stripeInstance;
};

/**
 * Create card element for payment input
 */
export const createCardElement = (stripe) => {
  const elements = stripe.elements();

  const cardElement = elements.create('card', {
    style: {
      base: {
        fontSize: '16px',
        color: '#1c1917',
        fontFamily: 'system-ui, sans-serif',
        '::placeholder': {
          color: '#78716c',
        },
      },
      invalid: {
        color: '#dc2626',
        iconColor: '#dc2626',
      },
    },
    hidePostalCode: false, // Set to true if you don't need postal code
  });

  return cardElement;
};

/**
 * Confirm card setup with Stripe
 */
export const confirmCardSetup = async (stripe, clientSecret, cardElement, billingDetails = {}) => {
  try {
    const result = await stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: billingDetails,
      },
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.setupIntent;
  } catch (error) {
    throw error;
  }
};
