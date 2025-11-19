# Subscription Gifting - Quick Reference

## Current State
- No gifting UI in React dashboard
- No gifting data in subscription objects
- Backend has full WooCommerce Subscriptions gifting support ready to use

## To Add Gifting Support:

### 1. Update Data Layer (30 mins)
**File:** `src/services/woocommerce.js` (lines 339-406)

Add to subscription transformer:
```javascript
isGifted: Boolean,           // true if subscription was gifted
recipientUserId: Number,     // ID of recipient user
recipientEmail: String,      // Email of recipient
purchaserId: Number,         // ID of purchaser
giftedDate: String,          // ISO date when gifted
giftStatus: String           // 'pending' or 'accepted'
```

### 2. Add UI Display (1-2 hours)
**Files:**
- `src/pages/Dashboard.jsx` - Add "Gifts Received" section
- `src/pages/SubscriptionDetail.jsx` - Show gift info in header
- `src/pages/Subscriptions.jsx` - Add gift badge to table
- `src/components/SubscriptionCard.jsx` (if exists) - Gift badge

### 3. Optional: Add Actions (1-2 days)
**New files:**
- `src/hooks/useGiftActions.js` - Accept/decline logic
- `src/components/GiftNotification.jsx` - Pending gift banner
- REST endpoints in backend for gift actions

## Backend Data Available

```php
// From WCS_Gifting class
WCS_Gifting::is_gifted_subscription( $subscription )
WCS_Gifting::get_recipient_user( $subscription )
WCS_Gifting::get_gifted_subscriptions( $user_id )

// Metadata keys
$subscription->get_meta( '_recipient_user' )
$subscription->get_meta( '_recipient_user_email_address' )
```

## Subscription Meta Keys

| Meta Key | Content | Type |
|----------|---------|------|
| `_recipient_user` | User ID of recipient | integer |
| `_recipient_user_email_address` | Email if user doesn't exist | string |
| `_subscription_gifting` | Product-level setting | string |

## Key Files

| File | Purpose |
|------|---------|
| `/includes/gifting/class-wcs-gifting.php` | Core gifting class |
| `/includes/gifting/class-wcsg-recipient-management.php` | Recipient handling |
| `/templates/gifting/html-view-subscription-gifting-information.php` | Template example |
| `src/services/woocommerce.js` | Data layer to update |
| `src/pages/Dashboard.jsx` | Where to show gifts |
| `src/pages/SubscriptionDetail.jsx` | Where to show gift context |

## Minimal Viable Product (4-8 hours)

1. Add gifting fields to subscription transformer
2. Add gift badge icon to subscription cards
3. Show "Gifted by" / "Gifted to" in detail view
4. Segregate gifts in Dashboard
5. Link to WooCommerce My Account for actions

## UI Components Needed

- Gift badge icon (use lucide-react Gift icon)
- Gift banner/notification (Alert component)
- Gift info section (similar to "Related Orders")
- "Gifted To" user display (with email)
- "Gifted By" user display (with name)

## Testing Commands

```bash
# Check gift data in subscription object
wp shell
# Get a gifted subscription
$sub = wcs_get_subscription( SUBSCRIPTION_ID );
WCS_Gifting::is_gifted_subscription( $sub ); // Should return true
WCS_Gifting::get_recipient_user( $sub );     // Should return user ID
```

## Common Gotchas

1. **Recipient might be email-only** - if gifted to non-existent user, use email from meta
2. **Ownership vs. viewing** - recipient sees different info than purchaser
3. **Status is implicit** - no explicit "pending" status, inferred from having/lacking recipient
4. **No built-in decline** - WooCommerce doesn't have decline flow, would need custom
5. **Renewal emails go to recipient** - after acceptance, recipient gets renewal notices

## Questions to Resolve

Before building, answer:
- Should gift acceptance be explicit (button) or implicit (first use)?
- What should pending gift status show to recipient?
- Should purchaser see gift status in real-time?
- What happens if recipient user is deleted?
- Should there be expiration on pending gifts?

## Related But Separate System

Gift Cards (not subscription gifting):
- Different product (prepaid cards)
- Already implemented in React
- Located in: GiftCards.jsx, GiftCardDetail.jsx
- Do NOT mix up with subscription gifting

## After Implementation

1. Test gift creation in WooCommerce checkout
2. Verify gift appears in both dashboard and my-subscriptions
3. Test gift acceptance flow
4. Verify ownership transfer works
5. Check subscription management works post-acceptance
6. Test email notifications
