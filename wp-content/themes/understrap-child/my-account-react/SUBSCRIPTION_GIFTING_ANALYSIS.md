# Subscription Gifting Feature Analysis

## Executive Summary

The Samsara React My Account dashboard currently has **NO implementation** of WooCommerce Subscriptions' built-in gifting feature. While WooCommerce Subscriptions v7.8.0+ includes native gifting functionality (with `WCS_Gifting` class and related infrastructure), the React dashboard has not been updated to surface gifting-related data or actions.

However, **the foundation is in place** on the backend - the WooCommerce Subscriptions plugin includes all necessary gifting infrastructure. The gap is purely in the React frontend UI.

---

## Current Implementation Status

### Dashboard.jsx
- **Gift Indicator:** NOT IMPLEMENTED
- **Gifted Subscriptions Section:** NOT IMPLEMENTED
- **Code Location:** `/Users/jonathan/Documents/Anthropic/samsara/local/app/public/wp-content/themes/understrap-child/my-account-react/src/pages/Dashboard.jsx`
- **Findings:** Dashboard only shows primary subscription and additional memberships. No segregation or indication of gifted subscriptions.

### SubscriptionDetail.jsx
- **Gift Recipient Info:** NOT IMPLEMENTED
- **Gift Sender Info:** NOT IMPLEMENTED  
- **Accept/Decline Buttons:** NOT IMPLEMENTED
- **Code Location:** `/Users/jonathan/Documents/Anthropic/samsara/local/app/public/wp-content/themes/understrap-child/my-account-react/src/pages/SubscriptionDetail.jsx`
- **Findings:** Detail page shows management options but no gifting context or recipient/purchaser identification.

### Subscriptions.jsx
- **Gift Badge/Icon:** NOT IMPLEMENTED
- **Gift Filter:** NOT IMPLEMENTED
- **Code Location:** `/Users/jonathan/Documents/Anthropic/samsara/local/app/public/wp-content/themes/understrap-child/my-account-react/src/pages/Subscriptions.jsx`
- **Findings:** Table view of subscriptions with no gifting metadata displayed.

### Data Layer (woocommerce.js)
- **Subscription Transformer (lines 339-406):** Does NOT include gifting fields
- **Missing Fields:**
  - `is_gifted`
  - `recipient_user_id`
  - `recipient_email`
  - `recipient_user`
  - `purchaser_user_id`
  - `gifted_date`
  - `gift_status`
  - `_recipient_user` (WooCommerce meta key)
  - `_recipient_user_email_address` (WooCommerce meta key)
- **API Methods:** No gifting-specific endpoints defined
- **Code Location:** `/Users/jonathan/Documents/Anthropic/samsara/local/app/public/wp-content/themes/understrap-child/my-account-react/src/services/woocommerce.js`

### Backend REST API
- **Custom Endpoints:** No gifting-specific endpoints found in theme/plugin includes
- **Gifting Support:** WooCommerce Subscriptions has built-in gifting but NOT exposed via custom API endpoints
- **Potential Issue:** Custom `samsara/v1/user-subscriptions` endpoint (line 70 in woocommerce.js) may not be fetching gifting metadata

---

## WooCommerce Subscriptions Gifting Architecture

### Core Class: WCS_Gifting
**Location:** `/Users/jonathan/Documents/Anthropic/samsara/local/app/public/wp-content/plugins/woocommerce-subscriptions/includes/gifting/class-wcs-gifting.php`

### Key Methods Available:
```php
WCS_Gifting::is_gifted_subscription( $subscription )
// Returns: bool - TRUE if subscription was gifted

WCS_Gifting::get_recipient_user( $subscription )
// Returns: int - Recipient user ID

WCS_Gifting::set_recipient_user( &$subscription, $user_id, $save, $meta_id, $order )
// Sets/accepts the recipient user for a gifted subscription

WCS_Gifting::get_gifted_subscriptions( $args = array() )
// Returns: array - Subscriptions gifted to current user

WCS_Gifting::order_contains_gifted_subscription( $order )
// Returns: bool - TRUE if order contains gifted subscriptions

WCS_Gifting::delete_recipient_user( &$subscription, $save, $meta_id )
// Removes recipient assignment from subscription

WCS_Gifting::get_recipient_order_items( $recipient_user_id )
// Returns: array - Order items where user is recipient

WCS_Gifting::create_recipient_user( $recipient_email )
// Creates new user or returns existing for recipient email
```

### Subscription Metadata Keys:
- `_recipient_user` - Recipient user ID
- `_recipient_user_email_address` - Recipient's email (if user doesn't exist yet)
- `_subscription_gifting` - Product-level setting (enabled/disabled)

### Templates Available:
- `/templates/gifting/html-view-subscription-gifting-information.php` - Renders gift info
- `/templates/gifting/subscription-totals.php` - Adjusted totals for recipients
- `/templates/gifting/emails/recipient-email-subscriptions-table.php` - Recipient emails

### Gift Card Support:
- **Status:** IMPLEMENTED for gift cards (not subscriptions)
- **Location:** GiftCards.jsx, GiftCardDetail.jsx, useGiftCards.js hooks
- **Note:** Gift cards are different from subscription gifting - these are pre-paid cards, not subscription purchases

---

## WooCommerce Subscriptions Gifting Data Fields

### Subscription Object Properties (from WCS_Gifting):
```javascript
{
  id: "123",
  // ... existing fields ...
  
  // GIFTING FIELDS (currently missing)
  isGifted: true/false,           // is_gifted_subscription()
  recipientUserId: 456,            // get_recipient_user()
  recipientEmail: "user@example.com", // meta: _recipient_user_email_address
  purchaserId: 789,                // original order customer
  giftedDate: "2024-01-15",        // order date_created
  giftStatus: "pending|accepted|declined", // inferred from subscription status
}
```

### User Actions Available:
1. **For Recipients:**
   - View that subscription was gifted to them
   - Implicit acceptance by using subscription
   - Manage (pause, resume, cancel) if ownership transferred
   - No explicit "accept/decline" - acceptance is through use

2. **For Purchasers:**
   - View subscriptions they gifted
   - See recipient email/name
   - See gift status
   - Monitor recipient engagement

---

## Implementation Requirements

### Phase 1: Display Gifting Info (Read-Only) - LOW EFFORT
**Estimated:** 2-4 hours

1. **Update Subscription Transformer** (woocommerce.js)
   - Add gifting fields to subscription object
   - Extract from WooCommerce subscription meta

2. **Update API Custom Endpoint**
   - Ensure `samsara/v1/user-subscriptions` fetches gifting meta
   - Likely needs modification to theme's REST API handler

3. **Add Visual Indicators**
   - Gift badge icon on subscription cards (Subscriptions.jsx)
   - "Gifted by" or "Gifted to" label in detail page
   - Different color/styling for gifted subscriptions

4. **Add "Gifts Received" Section**
   - Filter/segregate received gifts in Dashboard
   - Show in separate card or tab

5. **Add "Gifts Sent" Section**
   - Show subscriptions gifted to others
   - Display recipient info
   - Show gift status

### Phase 2: Recipient Actions - MEDIUM EFFORT
**Estimated:** 1-2 days

1. **Create Gift Acceptance Flow**
   - Determine if acceptance is explicit or implicit
   - If explicit: add "Accept Gift" button
   - Update subscription ownership when accepted

2. **Handle Gift Decline**
   - If supported: add "Decline" button
   - Trigger refund or restoration to purchaser

3. **Create REST Endpoints**
   - `POST samsara/v1/subscriptions/{id}/accept-gift`
   - `POST samsara/v1/subscriptions/{id}/decline-gift`

4. **Add Notification/Banner**
   - Show pending gift acceptance state
   - Display sender info
   - Clear call-to-action

### Phase 3: Sender Management - MEDIUM EFFORT
**Estimated:** 1-2 days

1. **Create Gift Status Tracking**
   - Show pending/accepted/declined status
   - Display recipient engagement

2. **Implement Gift Management**
   - Cancel pending gifts if allowed
   - Resend gift invitations
   - View gift history

3. **Add Recipient Communication**
   - Show recipient email
   - Display when accepted
   - Track first use

---

## Quick Implementation Checklist

### Minimum Viable Implementation (4-8 hours)
- [ ] Update subscription transformer to include `isGifted`, `recipientUserId`, `recipientEmail`, `purchaserId` fields
- [ ] Check/update custom REST endpoint to fetch meta values
- [ ] Add gift badge icon to subscription cards
- [ ] Show "Gifted to [name]" or "Gifted by [name]" in detail page
- [ ] Filter and display "Gifts Received" in Dashboard
- [ ] Link to WooCommerce My Account for gift actions (no React implementation)

### Full Implementation (3-5 days)
- All of MVP above, plus:
- [ ] Create dedicated "Gifts" page/section
- [ ] Implement gift acceptance flow in React
- [ ] Create REST endpoints for gift acceptance/decline
- [ ] Build gift status tracking UI
- [ ] Handle gift management (cancel, resend)
- [ ] Add email notifications system

---

## Code Locations Reference

### Frontend React Files
- `/Users/jonathan/Documents/Anthropic/samsara/local/app/public/wp-content/themes/understrap-child/my-account-react/src/pages/Dashboard.jsx` - Main dashboard
- `/Users/jonathan/Documents/Anthropic/samsara/local/app/public/wp-content/themes/understrap-child/my-account-react/src/pages/SubscriptionDetail.jsx` - Subscription detail
- `/Users/jonathan/Documents/Anthropic/samsara/local/app/public/wp-content/themes/understrap-child/my-account-react/src/pages/Subscriptions.jsx` - Subscriptions list
- `/Users/jonathan/Documents/Anthropic/samsara/local/app/public/wp-content/themes/understrap-child/my-account-react/src/services/woocommerce.js` - API client & transformers

### Backend Plugin Files
- `/Users/jonathan/Documents/Anthropic/samsara/local/app/public/wp-content/plugins/woocommerce-subscriptions/includes/gifting/class-wcs-gifting.php` - Core gifting class
- `/Users/jonathan/Documents/Anthropic/samsara/local/app/public/wp-content/plugins/woocommerce-subscriptions/includes/gifting/class-wcsg-recipient-management.php` - Recipient handling
- `/Users/jonathan/Documents/Anthropic/samsara/local/app/public/wp-content/plugins/woocommerce-subscriptions/includes/core/class-wc-subscription.php` - Subscription object
- `/Users/jonathan/Documents/Anthropic/samsara/local/app/public/wp-content/themes/understrap-child/inc/` - Theme REST API handlers

---

## Recommended Approach

### Option 1: Hybrid (Recommended) - 1-2 weeks
1. Implement read-only display in React (Phase 1) - quick win
2. Link gift acceptance actions to WooCommerce My Account initially
3. Later add full React implementation if needed

### Option 2: Minimal - 4-8 hours
- Display-only implementation
- All gift actions use WooCommerce default pages
- Lowest complexity, maintains consistency with WooCommerce

### Option 3: Full React - 2-3 weeks  
- Complete React implementation
- Custom gift management UI
- Highest complexity, best user experience

---

## Notes & Considerations

1. **Gift Status Determination:**
   - WooCommerce Subscriptions doesn't have explicit "pending/accepted/declined" states
   - Status is implicit: pending = awaiting use, accepted = active under recipient
   - No decline/refund handling exists in core - would need custom implementation

2. **Ownership Transfer:**
   - When recipient accepts gift, subscription ownership changes
   - This affects billing, notifications, and account ownership
   - Needs careful implementation to avoid data loss

3. **Email Handling:**
   - Gifting supports email-based invitations for non-users
   - User can be created with gift email or existing user found
   - Email notifications handled by WooCommerce Subscriptions emails

4. **Security Considerations:**
   - Must verify user can only see gifts they sent or received
   - Protect endpoints to prevent viewing other users' gifts
   - Validate email ownership

5. **Integration Points:**
   - WooCommerce Subscriptions v7.8.0+ (appears to be installed)
   - Gift Cards system is separate and already implemented
   - Memberships integration available if needed

---

## Files Not Requiring Changes (Gift Card System)
The following are for gift cards, NOT subscription gifting:
- GiftCards.jsx
- GiftCardDetail.jsx  
- useGiftCards.js
- Gift card endpoints in backend

These are a different product and don't interfere with subscription gifting.

