# Subscription Gifting - Implementation Summary

## TL;DR

Current Status: **NO implementation** of WooCommerce Subscriptions' gifting feature in React dashboard

What's needed:
1. Update subscription data transformer to include gifting fields
2. Add visual indicators (badges, labels) to subscription UI
3. Create "Gifts Received" and "Gifts Sent" sections
4. Optionally: Create custom React components for gift actions

Effort: **4-8 hours** (display-only) to **3-5 days** (full implementation)

---

## Current State vs. Needed State

### Current (Today)
```
Dashboard
├── Primary Subscription (no gift indicator)
├── Additional Memberships
└── (no gift-specific sections)

Subscriptions List
├── Subscription 1 (no gift info)
├── Subscription 2 (no gift info)
└── Subscription 3 (no gift info)

Subscription Detail
├── Status Badge
├── Dates & Amount
└── Management (cancel, etc.)
    (no gift context)
```

### Needed (After Implementation)
```
Dashboard
├── Primary Subscription
├── Additional Memberships
├── Gifts Received
│   └── Subscription from [Gifter Name]
│       ├── Gift Badge
│       └── Status: Active / Pending
└── Gifts Sent
    └── Subscription to [Recipient Email]
        ├── Gift Status: Accepted / Pending
        └── Recipient Info

Subscriptions List
├── Subscription 1 [Gift Badge]
├── Subscription 2 [Gifted To X]
└── Subscription 3 [Gifted By Y]

Subscription Detail
├── Status Badge
├── Dates & Amount
├── Gift Information (if gifted)
│   ├── Gifted by/to: [Name]
│   ├── Date Gifted: [Date]
│   └── Accept/Decline (if recipient & pending)
└── Management (cancel, etc.)
```

---

## What's Already Available

### Backend Infrastructure (WooCommerce Subscriptions)
✓ Core gifting class: `WCS_Gifting`
✓ Methods to check/set/get gifting data
✓ Email templates for gift notifications
✓ Metadata storage in subscription objects
✓ Recipient user management

### Existing Related Systems
✓ Gift Cards implementation (separate system - already working)
✓ Subscription management (cancel, pause, etc.)
✓ REST API framework
✓ UI component library (Cards, Badges, Buttons, etc.)

### Missing in React Dashboard
✗ Gifting fields in subscription transformer
✗ API endpoints to expose gifting data
✗ UI components for gift display
✗ Gift management flows (accept, decline, etc.)

---

## Implementation Phases

### Phase 1: Quick Win (4-8 hours) - Display Only
Makes gifting visible without interactive features

**What gets done:**
- Subscription transformer includes: isGifted, recipientUserId, recipientEmail, purchaserId
- Subscription cards show gift badge icon
- Detail page shows "Gifted by [Name]" or "Gifted to [Email]"
- Dashboard segregates gifts received vs owned subscriptions
- Link to WooCommerce My Account for gift actions

**Files to modify:**
```
src/services/woocommerce.js
  - subscription transformer (lines 339-406)
  - add giftCardsApi-style endpoints

src/pages/Subscriptions.jsx
  - add gift badge to table/card

src/pages/SubscriptionDetail.jsx
  - show gift info in header/details section

src/pages/Dashboard.jsx
  - add "Gifts Received" section
```

**Backend work needed:**
- Verify custom endpoint returns gifting metadata
- May need to update API handler in theme functions.php

---

### Phase 2: Recipient Actions (1-2 days) - Medium Effort
Adds explicit gift acceptance flow

**What gets done:**
- Gift acceptance button (if recipient & pending)
- Gift decline option
- Transfer ownership on acceptance
- Status tracking (pending → accepted)
- Notification banner for pending gifts

**New files needed:**
```
src/hooks/useGiftActions.js
  - accept gift
  - decline gift
  - get gift status

src/components/GiftNotification.jsx
  - banner for pending gifts

Backend REST endpoint:
  - POST samsara/v1/subscriptions/{id}/accept-gift
  - DELETE samsara/v1/subscriptions/{id}/decline-gift
```

---

### Phase 3: Sender Management (1-2 days) - Medium Effort
Gift tracking and management from purchaser perspective

**What gets done:**
- Dedicated "Gifts Sent" section in Dashboard
- Gift status tracking (pending, accepted, used)
- Cancel pending gifts
- Resend gift invitations
- Recipient communication/notes

**New components:**
```
src/pages/GiftsSent.jsx
  - List of subscriptions gifted to others

src/components/GiftStatusCard.jsx
  - Display gift status and actions

Backend endpoints:
  - GET samsara/v1/subscriptions/gifts-sent
  - POST samsara/v1/subscriptions/{id}/cancel-gift
  - POST samsara/v1/subscriptions/{id}/resend-gift
```

---

## Key Technical Details

### Data Structure
```javascript
// Current subscription object
{
  id: "123",
  planName: "Athlete Team",
  status: "active",
  nextPaymentDate: "2025-01-20",
  // ... etc
}

// After gifting implementation
{
  id: "123",
  planName: "Athlete Team",
  status: "active",
  nextPaymentDate: "2025-01-20",
  
  // NEW FIELDS:
  isGifted: true,
  recipientUserId: 456,
  recipientEmail: "recipient@example.com",
  recipientName: "John Smith",
  purchaserId: 789,
  purchaserName: "Jane Doe",
  giftedDate: "2024-12-15",
  giftStatus: "accepted" // or "pending"
}
```

### Backend Data Source
Data comes from subscription metadata:
- `_recipient_user` → recipientUserId
- `_recipient_user_email_address` → recipientEmail
- `get_customer_id()` → purchaserId
- `date_created` → giftedDate
- `WCS_Gifting::is_gifted_subscription()` → isGifted

### Helper Methods
```php
// Use these in backend API handler
WCS_Gifting::is_gifted_subscription( $subscription )
WCS_Gifting::get_recipient_user( $subscription )
WCS_Gifting::get_gifted_subscriptions( $user_id )
WCS_Gifting::get_users_shipping_address( $user_id )
```

---

## Recommended Approach

**Best Path Forward: Hybrid Approach (Phase 1 + Partial Phase 2)**

Week 1:
- Friday: Complete Phase 1 (display-only)
  - Deploy to get immediate user visibility of gifts
  - Takes 4-8 hours
  
Week 2:
- Mon-Tue: Phase 2 (add accept button)
  - Core gift acceptance flow
  - Takes 1-2 days
  
Later (Optional):
- Phase 3 (gift management from sender side)
- Can be added if business value justifies

**Alternative: Minimal Approach**
- Phase 1 only
- All gift actions point to standard WooCommerce My Account
- Users click "Manage Gift" → goes to WooCommerce default interface
- Fast deployment (4-8 hours)
- Lower UX but maintains consistency

---

## Code Examples

### Example: Update Transformer

```javascript
// woocommerce.js - subscription transformer

subscription: (wcSub) => {
  const giftedTo = wcSub.meta_data?.find(m => m.key === '_recipient_user_email_address');
  const recipientUserId = wcSub.meta_data?.find(m => m.key === '_recipient_user');
  
  return {
    id: wcSub.id.toString(),
    // ... existing fields ...
    
    // NEW FIELDS
    isGifted: !!(giftedTo || recipientUserId),
    recipientUserId: recipientUserId?.value || null,
    recipientEmail: giftedTo?.value || null,
    purchaserId: wcSub.customer_id,
    giftedDate: wcSub.date_created,
    giftStatus: recipientUserId ? 'accepted' : 'pending'
  };
}
```

### Example: Gift Badge Component

```jsx
// Show on subscription card
{subscription.isGifted && (
  <div className="flex items-center gap-2">
    <Gift className="h-4 w-4 text-emerald-600" />
    <span className="text-sm text-stone-600">
      {subscription.recipientEmail ? 
        `Gifted to ${subscription.recipientEmail}` :
        `Gifted by ${subscription.purchaserName}`
      }
    </span>
  </div>
)}
```

---

## Files to Modify

### Frontend (React)
- `src/services/woocommerce.js` - Transformer + endpoints
- `src/pages/Dashboard.jsx` - Add gifts sections
- `src/pages/SubscriptionDetail.jsx` - Show gift info
- `src/pages/Subscriptions.jsx` - Add gift badge
- `src/hooks/useSubscriptions.js` - (might need updates)

### Backend (PHP)
- `inc/` folder - REST API handler (if needed for metadata)
- New file or update existing: Gift action endpoints

### No Changes Needed
- Gift Cards system (different feature)
- Existing subscription management
- Core theme/plugin files

---

## Questions to Answer Before Starting

1. Should gift acceptance be automatic (on first use) or explicit (button click)?
2. Should users see gifts sent to them immediately or only after acceptance?
3. Should there be a decline/refund option, or just accept?
4. Should purchasers be notified when recipient accepts?
5. Should there be expiration time on pending gifts?
6. Should cancelled subscriptions still show in gifts section?

---

## Testing Checklist

### Manual Testing
- [ ] Create test subscription in checkout with gift option
- [ ] Send as gift to test user email
- [ ] Verify gift appears in recipient's dashboard
- [ ] Verify gift appears in sender's dashboard
- [ ] Accept gift and verify ownership transfer
- [ ] Check subscription management works after acceptance
- [ ] Test with new user (account creation flow)
- [ ] Test with existing user

### Edge Cases
- [ ] Multiple gifts to same recipient
- [ ] Gift to self
- [ ] Gift after account deletion
- [ ] Expired gift subscriptions
- [ ] Cancelled subscriptions that were gifts

---

## Resources

### WooCommerce Subscriptions Gifting Docs
- Core class: `/wp-content/plugins/woocommerce-subscriptions/includes/gifting/class-wcs-gifting.php`
- Recipient management: `/wp-content/plugins/woocommerce-subscriptions/includes/gifting/class-wcsg-recipient-management.php`
- Email templates: `/wp-content/plugins/woocommerce-subscriptions/templates/gifting/`

### Project Files
- Transformer reference: `/my-account-react/src/services/woocommerce.js` (lines 316-422)
- Dashboard: `/my-account-react/src/pages/Dashboard.jsx` (lines 1-1028)
- Detail page: `/my-account-react/src/pages/SubscriptionDetail.jsx` (lines 1-692)
- Subscriptions list: `/my-account-react/src/pages/Subscriptions.jsx` (lines 1-266)

---

## Maintenance Notes

When upgrading WooCommerce Subscriptions:
- Check for changes to WCS_Gifting class
- Verify meta keys haven't changed
- Review gifting template updates
- Test gift workflows after major updates

