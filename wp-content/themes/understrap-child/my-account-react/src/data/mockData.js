// Mock data for Samsara My Account UI

export const userData = {
  id: "u_234",
  firstName: "Zahan",
  lastName: "Billimoria",
  displayName: "Zahan B.",
  name: "Zahan Billimoria",
  avatarUrl: null, // Can be URL or null for fallback initials
  avatarType: "initials", // "initials", "emoji", or "upload"
  avatarEmoji: null, // Selected emoji/icon if avatarType is "emoji"
  memberSince: "2023-11-02"
};

export const primarySubscription = {
  id: "sub_basecamp",
  planName: "Basecamp",
  status: "active",
  nextPaymentDate: "2025-11-25T12:00:00Z",
  nextPaymentAmount: 49.00,
  currency: "USD",
  billingInterval: "monthly"
};

export const memberships = [
  {
    id: "mem_climb",
    name: "Climbing Performance Module",
    status: "active",
    startedAt: "2025-01-10",
    expiresAt: null
  },
  {
    id: "mem_safety",
    name: "Snow Safety Course",
    status: "inactive",
    startedAt: "2024-11-15",
    expiresAt: "2025-05-15"
  }
];

export const orders = [
  {
    id: "200101",
    date: "2025-07-04T14:30:00Z",
    status: "completed",
    items: ["Basecamp Membership", "Snow Safety Course"],
    total: 99.00,
    currency: "USD",
    paymentMethod: "Visa •••• 1234",
    subtotal: 95.00,
    shipping: 0.00,
    tax: 4.00,
    discount: 0.00
  },
  {
    id: "200089",
    date: "2025-05-20T09:15:00Z",
    status: "refunded",
    items: ["Climbing Module"],
    total: 29.99,
    currency: "USD",
    paymentMethod: "Visa •••• 1234",
    subtotal: 29.99,
    shipping: 0.00,
    tax: 0.00,
    discount: 0.00
  },
  {
    id: "200078",
    date: "2025-03-15T11:45:00Z",
    status: "completed",
    items: ["Movement Workshop"],
    total: 149.00,
    currency: "USD",
    paymentMethod: "MasterCard •••• 5678",
    subtotal: 149.00,
    shipping: 0.00,
    tax: 0.00,
    discount: 0.00
  },
  {
    id: "200065",
    date: "2025-02-01T16:20:00Z",
    status: "processing",
    items: ["Athletic Recovery Program", "Nutrition Guide"],
    total: 79.00,
    currency: "USD",
    paymentMethod: "Visa •••• 1234",
    subtotal: 75.00,
    shipping: 0.00,
    tax: 4.00,
    discount: 0.00
  }
];

export const subscriptions = [
  {
    id: "sub_basecamp",
    startDate: "2023-11-02",
    status: "active",
    nextPaymentDate: "2025-11-25T12:00:00Z",
    nextPaymentAmount: 49.00,
    planName: "Basecamp",
    billingInterval: "monthly"
  },
  {
    id: "sub_old",
    startDate: "2022-04-15",
    status: "canceled",
    nextPaymentDate: null,
    nextPaymentAmount: null,
    planName: "Legacy Plan",
    billingInterval: "monthly",
    canceledAt: "2023-10-01"
  }
];

export const paymentMethods = [
  {
    id: "pm_1",
    brand: "Visa",
    last4: "1234",
    expMonth: 12,
    expYear: 2025
  },
  {
    id: "pm_2",
    brand: "MasterCard",
    last4: "5678",
    expMonth: 1,
    expYear: 2026
  }
];

// Helper function to check if payment method is expiring soon (within 60 days)
export const getExpiringPaymentMethods = () => {
  const now = new Date();
  const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  
  return paymentMethods.filter(method => {
    const expDate = new Date(method.expYear, method.expMonth - 1);
    return expDate <= sixtyDaysFromNow && expDate >= now;
  });
};

// Helper function to calculate days until expiration
export const getDaysUntilExpiration = (expMonth, expYear) => {
  const now = new Date();
  const expDate = new Date(expYear, expMonth - 1);
  const diffTime = expDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};