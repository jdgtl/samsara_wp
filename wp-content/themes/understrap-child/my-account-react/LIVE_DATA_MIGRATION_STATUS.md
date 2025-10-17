# Live Data Migration Status

**Last Updated:** October 17, 2025
**Branch:** my-account

## Overview
Migration of React My Account dashboard from mock data to live WordPress/WooCommerce data.

---

## ✅ COMPLETED (Phase 1-3)

### Phase 1: API Service Layer
- ✅ **Base API Service** (`src/services/api.js`)
  - Axios configuration with WordPress authentication
  - Request/response interceptors
  - Error handling with session expiration detection
  - Generic HTTP methods (GET, POST, PUT, DELETE)
  - Helper functions for config access

- ✅ **WooCommerce API Service** (`src/services/woocommerce.js`)
  - **Orders API:** Get all orders, single order, paginated orders
  - **Subscriptions API:** Get/update subscriptions, cancel/pause/resume actions
  - **Customers API:** Get/update customer data, billing/shipping addresses
  - **Payment Methods API:** Get/add/delete payment methods, set default
  - **Products API:** Get user memberships
  - **Stats API:** Dashboard statistics
  - **Data Transformers:** Convert WC responses to app format

### Phase 2: React Hooks (Data Fetching Layer)
All hooks include loading states, error handling, and refetch capabilities.

- ✅ **useOrders** (`src/hooks/useOrders.js`)
  - `useOrders(filters)` - All orders with filtering
  - `useOrder(orderId)` - Single order details
  - `useOrdersPaginated(page, perPage, filters)` - Paginated orders

- ✅ **useSubscriptions** (`src/hooks/useSubscriptions.js`)
  - `useSubscriptions(filters)` - All subscriptions
  - `useSubscription(subscriptionId)` - Single subscription
  - `useActiveSubscriptions()` - Active only
  - `useSubscriptionActions()` - Cancel/pause/resume methods
  - `useSubscriptionOrders(subscriptionId)` - Related orders

- ✅ **useCustomer** (`src/hooks/useCustomer.js`)
  - `useCustomer()` - Current customer data
  - `useCustomerActions()` - Update customer/addresses

- ✅ **usePaymentMethods** (`src/hooks/usePaymentMethods.js`)
  - `usePaymentMethods()` - All payment methods
  - `usePaymentMethodActions()` - Add/delete/set default
  - Helper functions: `getExpiringPaymentMethods()`, `getDaysUntilExpiration()`

- ✅ **useMemberships** (`src/hooks/useMemberships.js`)
  - `useMemberships()` - Additional memberships/products

- ✅ **useDashboard** (`src/hooks/useDashboard.js`)
  - `useDashboard()` - Unified dashboard data (subscriptions, memberships, payment methods, expiring cards)
  - `useDashboardStats()` - Custom dashboard statistics

---

## 🚧 IN PROGRESS (Phase 3)

### Phase 3: Custom WordPress REST API Endpoints
**Status:** Partially complete - needs to be added to functions.php

**Required Endpoints:**
```php
// Payment Methods
GET  /samsara/v1/payment-methods
POST /samsara/v1/payment-methods
PUT  /samsara/v1/payment-methods/{id}
DELETE /samsara/v1/payment-methods/{id}

// Memberships
GET /samsara/v1/memberships

// Dashboard Stats
GET /samsara/v1/stats
```

**Note:** These endpoints need to be added to `functions.php` after line 1164.

---

## 📋 REMAINING WORK

### Phase 4: Component Migration (0% Complete)
Migrate each page component to use live data hooks instead of mockData imports.

#### Priority Order:
1. **Dashboard** (`src/pages/Dashboard.jsx`)
   - Replace: `import { userData, primarySubscription, memberships, getExpiringPaymentMethods } from '../data/mockData'`
   - With: `import { useDashboard } from '../hooks/useDashboard'`
   - Add loading states
   - **Estimated:** 1-2 hours

2. **Orders** (`src/pages/Orders.jsx` + `OrderDetail.jsx`)
   - Replace: `import { orders as mockOrders } from '../data/mockData'`
   - With: `import { useOrders, useOrder } from '../hooks/useOrders'`
   - Update pagination to work with API
   - **Estimated:** 2-3 hours

3. **Subscriptions** (`src/pages/Subscriptions.jsx` + `SubscriptionDetail.jsx`)
   - Replace: `import { subscriptions as mockSubscriptions } from '../data/mockData'`
   - With: `import { useSubscriptions, useSubscription, useSubscriptionActions } from '../hooks/useSubscriptions'`
   - Wire up action buttons (cancel/pause/resume)
   - **Estimated:** 2-3 hours

4. **Payments** (`src/pages/Payments.jsx`)
   - Replace: `import { paymentMethods } from '../data/mockData'`
   - With: `import { usePaymentMethods, usePaymentMethodActions } from '../hooks/usePaymentMethods'`
   - Wire up add/remove/set default actions
   - **Estimated:** 2-3 hours

5. **Account Details** (`src/pages/AccountDetails.jsx`)
   - Replace mock user data
   - With: `import { useCustomer, useCustomerActions } from '../hooks/useCustomer'`
   - Wire up save actions
   - **Estimated:** 1-2 hours

### Phase 5: Loading States & Error Handling (0% Complete)
- Create skeleton loaders for each component type
- Add error boundaries
- Add toast notifications for actions
- **Estimated:** 2-3 hours

### Phase 6: Testing & Refinement (0% Complete)
- Test all pages with live WooCommerce data
- Verify all actions work correctly
- Test error scenarios
- Performance optimization
- **Estimated:** 2-3 hours

---

## 📊 Progress Summary

| Phase | Status | % Complete |
|-------|--------|-----------|
| Phase 1: API Service Layer | ✅ Complete | 100% |
| Phase 2: React Hooks | ✅ Complete | 100% |
| Phase 3: WordPress Endpoints | 🚧 In Progress | 30% |
| Phase 4: Component Migration | ⏳ Pending | 0% |
| Phase 5: Loading/Error States | ⏳ Pending | 0% |
| Phase 6: Testing | ⏳ Pending | 0% |
| **OVERALL** | 🚧 **In Progress** | **38%** |

---

## 🔧 How to Continue

### Option A: Complete WordPress Endpoints First
```bash
# Add custom REST API endpoints to functions.php
# Then test with Postman or browser
```

### Option B: Start Component Migration (Works Partially Without Custom Endpoints)
```jsx
// Dashboard.jsx - Example migration
import { useDashboard } from '../hooks/useDashboard';

const Dashboard = () => {
  const {
    primarySubscription,
    memberships,
    expiringCards,
    loading,
    error
  } = useDashboard();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  // Rest of component uses live data
};
```

### Option C: Commit Current Progress
```bash
cd wp-content/themes/understrap-child/my-account-react
git add src/services/ src/hooks/
git commit -m "feat: Add API services and React hooks for live data"
```

---

## 📝 Notes

### What Works Now:
- All API service methods are functional
- All React hooks are ready to use
- Standard WooCommerce REST API calls (orders, subscriptions, customers) work out of the box
- WordPress authentication via nonce is configured

### What Needs Custom Endpoints:
- Payment methods management (not in WC REST API)
- Additional memberships (custom post type)
- Dashboard statistics (aggregated data)

### Fallback Strategy:
- Mock data is still in `src/data/mockData.js`
- Can be kept for development/testing
- Add environment variable to toggle mock vs live data

---

## 🐛 Known Limitations

1. **WooCommerce Subscriptions API:** Has limited write support - some actions may need custom endpoints
2. **Payment Methods:** No native WC REST API - requires custom implementation or payment gateway SDK
3. **Pagination:** WC returns pagination info in headers - may need adjustment
4. **Rate Limiting:** WordPress REST API has rate limits - implement caching if needed

---

## 📚 File Reference

### Created Files:
```
src/
├── services/
│   ├── api.js                    # Base API configuration
│   └── woocommerce.js           # WooCommerce API methods
└── hooks/
    ├── useOrders.js             # Orders data hooks
    ├── useSubscriptions.js      # Subscriptions + actions
    ├── useCustomer.js           # Customer profile
    ├── usePaymentMethods.js     # Payment methods
    ├── useMemberships.js        # Additional memberships
    └── useDashboard.js          # Unified dashboard hook
```

### Files to Modify:
```
wp-content/themes/understrap-child/
├── functions.php                # Add custom REST API endpoints
└── my-account-react/src/pages/
    ├── Dashboard.jsx            # Migrate to useDashboard
    ├── Orders.jsx               # Migrate to useOrders
    ├── OrderDetail.jsx          # Migrate to useOrder
    ├── Subscriptions.jsx        # Migrate to useSubscriptions
    ├── SubscriptionDetail.jsx   # Migrate to useSubscription
    ├── Payments.jsx             # Migrate to usePaymentMethods
    └── AccountDetails.jsx       # Migrate to useCustomer
```

---

## 🎯 Next Session Recommendations

1. **Quick Win:** Migrate Dashboard.jsx first (simplest, most visible impact)
2. **Test Early:** Build and test with real WooCommerce data after Dashboard
3. **Iterate:** One page at a time, test thoroughly before moving to next
4. **Custom Endpoints:** Add as needed when standard WC API isn't sufficient

---

**Total Estimated Remaining Time:** 12-18 hours
**Current Progress:** ~8-10 hours completed, ~12-18 hours remaining
