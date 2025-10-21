# Payment Methods Implementation - WooCommerce Native vs Workaround

## Overview

This document explains the workarounds implemented for payment method management due to WooCommerce native functionality failing in our WPEngine staging environment. If the root cause is identified and resolved, this guide will help restore native WooCommerce functionality.

---

## Issue Summary

**Environment:** WPEngine Staging (and likely Production)
**Affected Functionality:** Payment token save and retrieval
**Root Cause:** Unknown - likely WPEngine MySQL configuration or WordPress caching layer

### Primary Issues Encountered:

1. **Transaction Rollback** - Tokens save successfully but disappear 3 seconds later
2. **Broken Caching** - `WC_Payment_Tokens::get_customer_tokens()` returns stale/empty data even after cache clear
3. **Silent Save Failures** - `$token->save()` returns an ID but doesn't persist to database

---

## Implementation Comparison

### 1. Saving Payment Tokens

#### Native WooCommerce (BROKEN ❌)

**Location:** `functions.php:~1740-1780`

```php
// Create token object
$token = new WC_Payment_Token_CC();
$token->set_token($payment_method_id);
$token->set_gateway_id('stripe');
$token->set_user_id($user_id);
$token->set_card_type($payment_method->card->brand);
$token->set_last4($payment_method->card->last4);
$token->set_expiry_month($payment_method->card->exp_month);
$token->set_expiry_year($payment_method->card->exp_year);
$token->set_default($is_default);

// Save using WooCommerce's native method
$token_id = $token->save(); // ❌ Returns ID but doesn't persist
```

**Why This Fails:**
- `$token->save()` returns an auto-increment ID
- Database insert succeeds initially
- Transaction gets rolled back ~3 seconds later (unknown cause)
- Token disappears from database despite successful return value

---

#### Current Workaround (WORKS ✅)

**Location:** `functions.php:1779-1852`

```php
// Force database COMMIT before insert (exit any pending transaction)
global $wpdb;
$wpdb->query('COMMIT');

// Direct database insert
$insert_result = $wpdb->insert(
    $wpdb->prefix . 'woocommerce_payment_tokens',
    array(
        'gateway_id' => 'stripe',
        'token' => $payment_method_id,
        'user_id' => $user_id,
        'type' => 'CC',
        'is_default' => $is_default ? 1 : 0,
    ),
    array('%s', '%s', '%d', '%s', '%d')
);

$token_id = $wpdb->insert_id;

// Insert metadata manually
$wpdb->insert(
    $wpdb->prefix . 'woocommerce_payment_tokenmeta',
    array('payment_token_id' => $token_id, 'meta_key' => 'card_type', 'meta_value' => strtolower($payment_method->card->brand)),
    array('%d', '%s', '%s')
);
// ... (repeat for last4, expiry_month, expiry_year, customer_id)

// Force COMMIT after metadata inserts
$wpdb->query('COMMIT');

// Fire WooCommerce hooks manually (for plugin compatibility)
do_action('woocommerce_payment_token_created', $token_id, null);
do_action('woocommerce_new_payment_token', $token_id, null);

// Final COMMIT before returning response
$wpdb->query('COMMIT');
```

**Why This Works:**
- Bypasses WooCommerce's save mechanism entirely
- Forces database COMMIT at 3 critical points to prevent rollback
- Direct `$wpdb->insert()` with proper SQL injection protection
- Manually fires WooCommerce hooks for plugin ecosystem compatibility
- Verified to persist data reliably

---

### 2. Retrieving Payment Tokens

#### Native WooCommerce (BROKEN ❌)

**Location:** `functions.php:~1455-1465` (original implementation)

```php
// Get tokens using WooCommerce's native method
$tokens = WC_Payment_Tokens::get_customer_tokens($user_id);

foreach ($tokens as $token) {
    $payment_methods[] = array(
        'id' => $token->get_id(),
        'type' => $token->get_type(),
        'brand' => $token->get_card_type(),
        'last4' => $token->get_last4(),
        'expMonth' => $token->get_expiry_month(),
        'expYear' => $token->get_expiry_year(),
        'isDefault' => $token->is_default(),
        'gateway' => $token->get_gateway_id(),
    );
}
```

**Why This Fails:**
- `WC_Payment_Tokens::get_customer_tokens()` uses WordPress object cache
- Cache returns stale data even after `wp_cache_delete()` calls
- Fresh tokens exist in database but aren't returned
- Direct database query finds tokens, but WC method returns empty array

**Evidence from Logs:**
```
🔍 Direct DB query found 1 tokens for user 5809
📦 WC method found 0 payment tokens for user 5809
```

---

#### Current Workaround (WORKS ✅)

**Location:** `functions.php:1454-1485`

```php
// Query database directly - bypass WooCommerce cache completely
global $wpdb;
$db_tokens = $wpdb->get_results($wpdb->prepare(
    "SELECT * FROM {$wpdb->prefix}woocommerce_payment_tokens WHERE user_id = %d AND gateway_id = 'stripe'",
    $user_id
));

foreach ($db_tokens as $db_token) {
    // Get metadata directly from database
    $token_meta = $wpdb->get_results($wpdb->prepare(
        "SELECT meta_key, meta_value FROM {$wpdb->prefix}woocommerce_payment_tokenmeta WHERE payment_token_id = %d",
        $db_token->token_id
    ), OBJECT_K);

    $payment_methods[] = array(
        'id' => $db_token->token_id,
        'type' => $db_token->type,
        'brand' => $token_meta['card_type']->meta_value ?? '',
        'last4' => $token_meta['last4']->meta_value ?? '',
        'expMonth' => $token_meta['expiry_month']->meta_value ?? '',
        'expYear' => $token_meta['expiry_year']->meta_value ?? '',
        'isDefault' => (bool)$db_token->is_default,
        'gateway' => $db_token->gateway_id,
    );
}
```

**Why This Works:**
- Completely bypasses WordPress/WooCommerce caching layer
- Queries database directly using parameterized queries (SQL injection safe)
- Always returns fresh data from source of truth
- No dependency on broken caching mechanisms

---

### 3. Deleting Payment Tokens

#### Native WooCommerce (SHOULD WORK ✅)

**Location:** `functions.php:~1870-1880` (still using native)

```php
// Delete using WooCommerce native method
WC_Payment_Tokens::delete($token_id);

// Clear cache
wp_cache_delete($user_id, 'wc_payment_tokens');
```

**Status:** Currently using native WC method + cache clear
**Note:** Delete appears to work correctly, unlike save/retrieve

---

### 4. Setting Default Payment Token

#### Native WooCommerce (SHOULD WORK ✅)

**Location:** `functions.php:~1850-1855` (still using native)

```php
// Set default using WooCommerce native method
WC_Payment_Tokens::set_users_default($user_id, $token_id);

// Clear cache
wp_cache_delete($user_id, 'wc_payment_tokens');
```

**Status:** Currently using native WC method + cache clear
**Note:** Setting default appears to work correctly, unlike save/retrieve

---

## Migration Path: Returning to Native Functionality

If the root cause is resolved (e.g., WPEngine fixes MySQL config, WordPress cache is fixed), follow these steps:

### Step 1: Test Native Save Method

Replace the workaround in `samsara_confirm_payment_method()`:

```php
// REPLACE THIS (lines 1779-1852):
global $wpdb;
$wpdb->query('COMMIT');
$insert_result = $wpdb->insert(...);
// ... all the direct inserts and metadata

// WITH THIS (original native approach):
$token = new WC_Payment_Token_CC();
$token->set_token($payment_method_id);
$token->set_gateway_id('stripe');
$token->set_user_id($user_id);
$token->set_card_type(strtolower($payment_method->card->brand));
$token->set_last4($payment_method->card->last4);
$token->set_expiry_month(str_pad($payment_method->card->exp_month, 2, '0', STR_PAD_LEFT));
$token->set_expiry_year($payment_method->card->exp_year);
$token->set_default($is_default);

$token_id = $token->save();

if (!$token_id) {
    return new WP_Error('token_save_failed', 'Failed to save payment method');
}

// Store customer ID in meta
$customer_id = $setup_intent->customer;
if ($customer_id) {
    update_metadata('payment_token', $token_id, 'customer_id', $customer_id);
}

// Clear cache
wp_cache_delete($user_id, 'wc_payment_tokens');
```

**Test:** Add a card and verify it persists in database and appears in dashboard.

---

### Step 2: Test Native Retrieve Method

Replace the workaround in `samsara_get_payment_methods()`:

```php
// REPLACE THIS (lines 1454-1485):
global $wpdb;
$db_tokens = $wpdb->get_results(...);
foreach ($db_tokens as $db_token) {
    $token_meta = $wpdb->get_results(...);
    // ... manual array building
}

// WITH THIS (original native approach):
$tokens = WC_Payment_Tokens::get_customer_tokens($user_id, 'stripe');

$payment_methods = array();
foreach ($tokens as $token) {
    $payment_methods[] = array(
        'id' => $token->get_id(),
        'type' => $token->get_type(),
        'brand' => $token->get_card_type(),
        'last4' => $token->get_last4(),
        'expMonth' => $token->get_expiry_month(),
        'expYear' => $token->get_expiry_year(),
        'isDefault' => $token->is_default(),
        'gateway' => $token->get_gateway_id(),
    );
}
```

**Test:** Refresh payments page and verify cards appear correctly.

---

### Step 3: Remove Forced COMMITs (if save works)

If native save works, remove the `$wpdb->query('COMMIT')` calls:
- Line ~1787: Before insert
- Line ~1851: After metadata
- Line ~1900: Before response

---

### Step 4: Remove Manual Hook Firing (if save works)

If using native `$token->save()`, remove manual hook calls (lines ~1856-1858):
```php
// REMOVE THESE if using native save:
do_action('woocommerce_payment_token_created', $token_id, null);
do_action('woocommerce_new_payment_token', $token_id, null);
```

WooCommerce's `save()` method fires these automatically.

---

## Testing Checklist

Before deploying native functionality changes:

- [ ] Add a new card - does it appear immediately?
- [ ] Refresh page - does card still appear?
- [ ] Check database - is token in `woocommerce_payment_tokens` table?
- [ ] Check metadata - are card details in `woocommerce_payment_tokenmeta` table?
- [ ] Set as default - does it update correctly?
- [ ] Delete card - does it disappear?
- [ ] Check Stripe - is payment method attached to customer?
- [ ] Test with multiple users - no cross-contamination?
- [ ] Wait 5 minutes, refresh - does card still appear? (test for delayed rollback)

---

## Database Schema Reference

### woocommerce_payment_tokens

| Column | Type | Description |
|--------|------|-------------|
| token_id | bigint(20) | Primary key, auto-increment |
| gateway_id | varchar(200) | Payment gateway ('stripe') |
| token | text | Stripe payment method ID (pm_xxx) |
| user_id | bigint(20) | WordPress user ID |
| type | varchar(200) | Token type ('CC' for credit card) |
| is_default | tinyint(1) | 1 if default, 0 otherwise |

### woocommerce_payment_tokenmeta

| Column | Type | Description |
|--------|------|-------------|
| meta_id | bigint(20) | Primary key, auto-increment |
| payment_token_id | bigint(20) | FK to woocommerce_payment_tokens.token_id |
| meta_key | varchar(255) | Metadata key |
| meta_value | longtext | Metadata value |

### Required Metadata Keys

- `card_type` - Card brand (visa, mastercard, amex, etc.)
- `last4` - Last 4 digits of card
- `expiry_month` - Expiration month (01-12, zero-padded)
- `expiry_year` - Expiration year (4 digits, e.g., 2029)
- `customer_id` - Stripe customer ID (cus_xxx)

---

## Debugging Tips

### Check if Native Save Works

```php
// Add temporary logging in samsara_confirm_payment_method()
$token_id = $token->save();

// Immediately check if it's in the database
global $wpdb;
$db_check = $wpdb->get_row($wpdb->prepare(
    "SELECT * FROM {$wpdb->prefix}woocommerce_payment_tokens WHERE token_id = %d",
    $token_id
));

error_log('Token save returned ID: ' . $token_id);
error_log('Database check: ' . ($db_check ? 'FOUND' : 'NOT FOUND'));

// Wait 5 seconds and check again (test for rollback)
sleep(5);
$db_check_2 = $wpdb->get_row($wpdb->prepare(
    "SELECT * FROM {$wpdb->prefix}woocommerce_payment_tokens WHERE token_id = %d",
    $token_id
));
error_log('Database check after 5s: ' . ($db_check_2 ? 'FOUND' : 'NOT FOUND (ROLLED BACK!)'));
```

### Check if Native Retrieve Works

```php
// Add temporary logging in samsara_get_payment_methods()
global $wpdb;

// Direct DB query
$db_tokens = $wpdb->get_results($wpdb->prepare(
    "SELECT * FROM {$wpdb->prefix}woocommerce_payment_tokens WHERE user_id = %d",
    $user_id
));

// WC cached method
$wc_tokens = WC_Payment_Tokens::get_customer_tokens($user_id);

error_log('Direct DB query found: ' . count($db_tokens) . ' tokens');
error_log('WC method found: ' . count($wc_tokens) . ' tokens');

if (count($db_tokens) !== count($wc_tokens)) {
    error_log('CACHE MISMATCH - WC cache is broken');
}
```

---

## Root Cause Investigation

If you want to investigate the underlying issues with WPEngine support:

### Questions to Ask WPEngine:

1. **Transaction Isolation:** What MySQL transaction isolation level is used? (READ-COMMITTED vs REPEATABLE-READ)
2. **Autocommit:** Is MySQL autocommit enabled or disabled?
3. **Object Cache:** What object cache backend is used? (Redis, Memcached, or file-based?)
4. **Cache Persistence:** How long does object cache persist? Does it survive across requests?
5. **Staging vs Production:** Are there configuration differences between staging and production environments?

### WPEngine Support Contact Info:

- Support Portal: https://my.wpengine.com/support
- Topic: "MySQL Transaction Rollback and Object Cache Issues"
- Provide: This document and error logs showing token appearing then disappearing

---

## Version History

| Date | Change | Author |
|------|--------|--------|
| 2025-10-21 | Initial workarounds implemented for save and retrieve | Claude Code |
| TBD | (Future) Return to native functionality | TBD |

---

## Related Files

- `functions.php` - Payment method REST API endpoints (lines 1449-1920)
- `my-account-react/src/pages/Payments.jsx` - Frontend payment methods page
- `my-account-react/src/components/AddPaymentMethodModal.jsx` - Add card modal
- `my-account-react/src/hooks/usePaymentMethods.js` - Payment methods data hook
- `my-account-react/src/services/woocommerce.js` - API service layer

---

## Contact

For questions about this workaround or migration path:
- Check git commit history for this file
- Review WPEngine error logs at `/logs/`
- Test in staging before production deployment
