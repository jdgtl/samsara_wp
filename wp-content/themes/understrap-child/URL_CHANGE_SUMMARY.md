# URL Structure Change: /athlete → /account

## Summary
Changed the React My Account dashboard from `/athlete/` to `/account/` to be more familiar to users and align with WooCommerce conventions.

## Changes Made (✅ Complete)

### 1. React Application
- **File**: `my-account-react/src/App.js`
- **Change**: Updated `basename` from `/athlete` to `/account`
- **Status**: ✅ Updated and rebuilt

### 2. WordPress Functions (functions.php)
All changes made to `functions.php`:

#### a. Rewrite Rules (lines 1001-1013)
- Changed pattern from `^athlete/?(.*)$` to `^account/?(.*)$`
- Changed query var from `pagename=athlete` to `pagename=account`

#### b. Page Interception (lines 2530-2549)
- Renamed function: `samsara_intercept_athlete_page()` → `samsara_intercept_account_page()`
- Updated all `/athlete` references to `/account`
- Updated template filter callback

#### c. Template Forcing (lines 2554-2561)
- Renamed function: `samsara_force_athlete_template()` → `samsara_force_account_template()`
- Changed `get_page_by_path('athlete')` to `get_page_by_path('account')`

#### d. URL Redirects (lines 2567-2607)
Added comprehensive redirects for backward compatibility:
- `/my-account/*` → `/account/*` (ALL WooCommerce My Account URLs)
- `/athlete/*` → `/account/*` (previous React dashboard URLs)
- `/account-dashboard/*` → `/account/*` (legacy URLs)
- `/account` → `/account/` (trailing slash enforcement)

#### e. Rewrite Exclusions (lines 2482-2497)
- Updated exclusion patterns from `athlete` to `account`
- Prevents membership content from conflicting with dashboard

### 3. React Build
- **Status**: ✅ Built successfully
- **Output**: `build/js/index.js` (384 KB - needs optimization in future)
- **CSS**: `build/css/my-account.css` (78 KB)

---

## Required Manual Step: WordPress Page Rename

⚠️ **CRITICAL**: You must rename the WordPress page from "athlete" to "account"

### Option A: Via WordPress Admin (Recommended)
1. Log in to WordPress Admin
2. Go to **Pages** → **All Pages**
3. Find the page titled "Athlete" or "athlete"
4. Click **Quick Edit** or **Edit**
5. Change the **Slug** from `athlete` to `account`
6. Click **Update**

### Option B: Via Database (if you have access)
```sql
UPDATE wp_posts
SET post_name = 'account'
WHERE post_name = 'athlete'
AND post_type = 'page';
```

---

## Post-Deployment Steps

### 1. Flush WordPress Rewrite Rules
After deploying these changes, you MUST flush rewrite rules:

**Method 1: WordPress Admin (Easiest)**
- Go to **Settings** → **Permalinks**
- Click **Save Changes** (no need to change anything)

**Method 2: Code**
Add this temporarily to functions.php:
```php
flush_rewrite_rules();
```
Then visit the site once, then remove it.

### 2. Clear All Caches
- WordPress object cache
- Page cache (if using WP Super Cache, W3 Total Cache, etc.)
- CDN cache (Cloudflare, etc.)
- Browser cache (hard refresh: Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### 3. Test All Routes
Verify these URLs work correctly:

#### New URLs (should work)
- ✅ `/account/` → Dashboard
- ✅ `/account/subscriptions` → Subscriptions list
- ✅ `/account/subscriptions/123` → Subscription detail
- ✅ `/account/orders` → Orders list
- ✅ `/account/orders/456` → Order detail
- ✅ `/account/payments` → Payment methods
- ✅ `/account/details` → Account details

#### Redirects (should redirect to /account/*)
- ✅ `/my-account/` → `/account/`
- ✅ `/my-account/subscriptions` → `/account/subscriptions`
- ✅ `/athlete/` → `/account/`
- ✅ `/athlete/orders` → `/account/orders`
- ✅ `/account-dashboard/` → `/account/`

### 4. Update External Links (if any)
Search your codebase for any hardcoded links to:
- `/athlete/`
- `/my-account/` (if pointing to the React dashboard)

---

## Rollback Plan

If you need to revert these changes:

1. **Revert Git commits**:
   ```bash
   git checkout HEAD~1 my-account-react/src/App.js
   git checkout HEAD~1 functions.php
   ```

2. **Rebuild React**:
   ```bash
   cd my-account-react
   npm run build:all
   ```

3. **Rename page back**: `account` → `athlete` in WordPress Admin

4. **Flush rewrite rules**: Settings → Permalinks → Save

---

## URL Structure Comparison

### Before (Old)
```
/athlete/                         → Dashboard
/athlete/subscriptions            → Subscriptions
/athlete/orders                   → Orders
/my-account/                      → Redirected to /athlete/
```

### After (New)
```
/account/                         → Dashboard
/account/subscriptions            → Subscriptions
/account/orders                   → Orders
/my-account/                      → Redirects to /account/
/athlete/                         → Redirects to /account/ (backward compat)
```

---

## Benefits of New Structure

1. **More Familiar**: `/account/` is more intuitive than `/athlete/`
2. **WooCommerce Alignment**: Follows WooCommerce convention (`/my-account/`)
3. **Shorter URLs**: `/account/` is 3 characters shorter than `/athlete/`
4. **Backward Compatible**: All old URLs redirect properly
5. **Future-Proof**: Standard naming for account management

---

## Files Modified

```
✅ my-account-react/src/App.js
✅ functions.php
✅ my-account-react/build/js/index.js (rebuilt)
✅ my-account-react/build/css/my-account.css (rebuilt)
```

## Git Commit Checklist

- [ ] Commit React app changes
- [ ] Commit functions.php changes
- [ ] Commit built files (build/js and build/css)
- [ ] Push to repository
- [ ] Rename WordPress page: `athlete` → `account`
- [ ] Flush rewrite rules
- [ ] Test all routes
- [ ] Clear all caches
- [ ] Update documentation

---

## Questions?

If you encounter issues:
1. Check the WordPress page slug is `account` (not `athlete`)
2. Verify rewrite rules were flushed
3. Clear all caches
4. Check browser console for JavaScript errors
5. Verify build files exist: `build/js/index.js` and `build/css/my-account.css`
