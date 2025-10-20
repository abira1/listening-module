# Firebase OAuth Configuration Guide

## Overview
This guide explains how to configure Firebase Authentication with Google OAuth for the deployed website at `https://ielts-listening-module.web.app`.

## Problem
The authentication flow was hanging with "Processing authentication..." message. This is often caused by:
1. Missing or incorrect OAuth redirect URIs in Firebase Console
2. External scripts (rrweb, PostHog) blocking authentication
3. CORS issues with Firebase endpoints

## Solution

### Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `ielts-listening-module`
3. Navigate to: **Authentication** → **Sign-in method**

### Step 2: Configure Google OAuth Provider

1. Click on **Google** provider
2. Ensure it's **Enabled** (toggle should be ON)
3. Click **Edit** to configure

### Step 3: Add Authorized Redirect URIs

In the Google OAuth configuration, you need to add the following redirect URIs:

#### For Production (Firebase Hosting)
```
https://ielts-listening-module.web.app
https://ielts-listening-module.firebaseapp.com
```

#### For Local Development
```
http://localhost:3000
http://localhost:5000
```

### Step 4: Configure OAuth Consent Screen

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Select project: `ielts-listening-module`
3. Navigate to: **APIs & Services** → **OAuth consent screen**
4. Ensure the app is configured as **External** (for testing)
5. Add the following URIs under **Authorized redirect URIs**:
   - `https://ielts-listening-module.web.app`
   - `https://ielts-listening-module.firebaseapp.com`
   - `http://localhost:3000`
   - `http://localhost:5000`

### Step 5: Verify Firebase Configuration

In `frontend/src/config/firebase.js`, verify:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAFc-_sb0Se-2-RsXGJXQbOfbafqwA85pA",
  authDomain: "ielts-listening-module.firebaseapp.com",
  projectId: "ielts-listening-module",
  storageBucket: "ielts-listening-module.firebasestorage.app",
  messagingSenderId: "282015901061",
  appId: "1:282015901061:web:a594fa8c1f9dce9e4410ec",
  measurementId: "G-JLYG9VTDFL",
  databaseURL: "https://ielts-listening-module-default-rtdb.firebaseio.com/"
};
```

### Step 6: Test OAuth Configuration

#### Local Testing
```bash
cd frontend
yarn start
# Navigate to http://localhost:3000
# Click "Login with Google"
# Should open popup and complete authentication
```

#### Production Testing
1. Visit: https://ielts-listening-module.web.app
2. Click "Login with Google"
3. Should open popup and complete authentication
4. Should redirect to dashboard after successful login

## Troubleshooting

### Issue: "Processing authentication..." hangs indefinitely

**Causes:**
1. Redirect URI not configured in Firebase Console
2. OAuth consent screen not configured
3. External scripts blocking authentication (rrweb, PostHog)

**Solutions:**
1. Verify redirect URIs are added in Firebase Console
2. Check Google Cloud Console OAuth consent screen
3. Check browser console for errors (F12)
4. Clear browser cache and cookies
5. Try incognito mode

### Issue: "Popup blocked" error

**Causes:**
1. Browser popup blocker is enabled
2. Popup was closed by user

**Solutions:**
1. Allow popups for the domain
2. Try again
3. Check browser console for specific error

### Issue: CORS errors in console

**Causes:**
1. External scripts (rrweb, PostHog) failing to load
2. Network connectivity issues

**Solutions:**
1. These are non-blocking errors (fixed in latest version)
2. Check network connectivity
3. Try again

### Issue: "Access Denied" for admin login

**Causes:**
1. Email not in admin whitelist
2. Admin authentication context issue

**Solutions:**
1. Verify email is in `ADMIN_EMAILS` list in `FirebaseAuthService.js`
2. Check browser console for specific error
3. Try logging out and logging back in

## Verification Checklist

- [ ] Firebase Console shows Google provider as **Enabled**
- [ ] Redirect URIs include:
  - `https://ielts-listening-module.web.app`
  - `https://ielts-listening-module.firebaseapp.com`
  - `http://localhost:3000` (for local development)
- [ ] Google Cloud Console OAuth consent screen is configured
- [ ] OAuth consent screen includes same redirect URIs
- [ ] Firebase config in `frontend/src/config/firebase.js` is correct
- [ ] Local testing works: `yarn start` → login works
- [ ] Production testing works: https://ielts-listening-module.web.app → login works

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Google Sign-In Setup](https://firebase.google.com/docs/auth/web/google-signin)
- [Google Cloud OAuth Configuration](https://cloud.google.com/docs/authentication/oauth)
- [Firebase Hosting Deployment](https://firebase.google.com/docs/hosting)

## Summary

The authentication flow should now work correctly after:
1. ✅ Fixing the authentication flow hang (improved error handling)
2. ✅ Removing blocking external scripts (rrweb, PostHog)
3. ✅ Configuring Firebase OAuth redirect URIs (this guide)

If you still experience issues:
1. Check browser console (F12) for specific error messages
2. Verify all redirect URIs are configured in Firebase Console
3. Clear browser cache and try again
4. Try incognito mode to rule out cache issues

