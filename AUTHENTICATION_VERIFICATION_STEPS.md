# Authentication Verification Steps

## Quick Test (2 minutes)

### Step 1: Open the Website
1. Go to: https://ielts-listening-module.web.app
2. Wait for page to load (should be fast, no "Processing..." message)
3. You should see the login page with "Login with Google" button

### Step 2: Click Login Button
1. Click "Login with Google" button
2. A popup should open (if blocked, allow popups)
3. You should see Google login screen

### Step 3: Complete Google Login
1. Select your Google account
2. Grant permissions if prompted
3. Popup should close automatically

### Step 4: Verify Success
1. Page should redirect to dashboard or profile completion page
2. Should NOT stay on "Processing authentication..." screen
3. Check browser console (F12) for errors

## Detailed Testing (5 minutes)

### Test 1: Check Browser Console
1. Open DevTools: Press `F12`
2. Go to **Console** tab
3. Look for these messages (should NOT see errors):
   - ✅ `[AuthContext] Starting Google sign-in...`
   - ✅ `[AuthContext] Google sign-in successful: {...}`
   - ✅ `[StudentHome] Starting login...`
   - ✅ `[StudentHome] Login successful, waiting for auth state update...`

4. Should NOT see:
   - ❌ `Error: An unexpected error occurred`
   - ❌ `Cross-Origin Request Blocked`
   - ❌ `Uncaught Error`

### Test 2: Check Network Tab
1. Open DevTools: Press `F12`
2. Go to **Network** tab
3. Reload page
4. Look for requests to:
   - ✅ `identitytoolkit.googleapis.com` (Firebase Auth)
   - ✅ `securetoken.googleapis.com` (Firebase Token)
   - ✅ `ielts-listening-module-default-rtdb.firebaseio.com` (Firebase Database)

5. Should NOT see:
   - ❌ Failed requests (red X)
   - ❌ 403/401 errors
   - ❌ CORS errors

### Test 3: Check External Scripts
1. Open DevTools: Press `F12`
2. Go to **Console** tab
3. Look for warnings (these are OK):
   - ⚠️ `Failed to load rrweb library` (non-blocking)
   - ⚠️ `PostHog initialization failed` (non-blocking)

4. These warnings are expected and should NOT block authentication

### Test 4: Test Different Scenarios

#### Scenario A: First-time Login
1. Open incognito window
2. Go to https://ielts-listening-module.web.app
3. Click "Login with Google"
4. Complete login
5. Should redirect to profile completion page

#### Scenario B: Already Logged In
1. If already logged in, should redirect to dashboard
2. Should NOT show login page

#### Scenario C: Logout and Login Again
1. If logged in, look for logout button
2. Click logout
3. Should return to login page
4. Click "Login with Google" again
5. Should complete login successfully

### Test 5: Mobile Testing
1. Open on mobile device (iPhone, Android)
2. Go to https://ielts-listening-module.web.app
3. Click "Login with Google"
4. Should open Google login in browser or app
5. Should complete login successfully

## Troubleshooting

### Issue: "Processing authentication..." hangs

**Quick Fix**:
1. Close popup if open
2. Refresh page (Ctrl+R or Cmd+R)
3. Try again
4. If still hangs, try incognito mode

**Detailed Fix**:
1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. If you see CORS errors, check Firebase OAuth configuration
5. Clear browser cache and try again

### Issue: Popup is blocked

**Fix**:
1. Look for popup blocker notification in browser
2. Click "Allow" or "Always allow"
3. Try login again

### Issue: "Access Denied" error

**Cause**: Email not in admin whitelist (for admin login)

**Fix**:
1. If trying to login as admin, verify email is in whitelist
2. For student login, any non-admin email should work
3. Check error message for details

### Issue: Redirect to wrong page

**Possible Issues**:
1. Profile not completed (should go to profile completion)
2. Account pending approval (should go to waiting page)
3. Account rejected (should go to rejection page)

**Fix**:
1. Complete profile if prompted
2. Wait for admin approval
3. Contact admin if rejected

## Success Indicators

✅ **Authentication is working correctly if**:
1. Login popup opens without being blocked
2. Google login completes successfully
3. Page redirects to dashboard or profile page
4. No "Processing authentication..." hang
5. No errors in browser console
6. No CORS errors for Firebase endpoints
7. User data appears in dashboard

❌ **Authentication has issues if**:
1. Popup is blocked
2. Popup closes without completing login
3. Page stays on "Processing authentication..."
4. Errors appear in browser console
5. CORS errors for Firebase endpoints
6. User data doesn't appear in dashboard

## Performance Metrics

**Expected Performance**:
- Page load: < 2 seconds
- Login popup: Opens immediately
- Google login: < 5 seconds
- Redirect to dashboard: < 2 seconds
- **Total login time: < 10 seconds**

**If slower**:
1. Check network speed
2. Check browser performance
3. Check Firebase database performance
4. Check for blocking scripts

## Reporting Issues

If authentication still doesn't work:

1. **Collect Information**:
   - Browser type and version
   - Operating system
   - Error messages from console
   - Network requests that failed
   - Screenshots of errors

2. **Check Logs**:
   - Open DevTools (F12)
   - Go to Console tab
   - Look for `[AuthContext]` or `[StudentHome]` messages
   - Copy error messages

3. **Verify Configuration**:
   - Check Firebase Console OAuth settings
   - Check Google Cloud Console OAuth consent screen
   - Verify redirect URIs are correct

4. **Try Workarounds**:
   - Clear browser cache
   - Try incognito mode
   - Try different browser
   - Try different device
   - Try different network

## Summary

✅ **Authentication should now work correctly!**

**What was fixed**:
1. External scripts no longer block authentication
2. Better error handling in login flow
3. Improved logging for debugging
4. OAuth configuration guide provided

**Next steps**:
1. Test login at https://ielts-listening-module.web.app
2. Verify no errors in browser console
3. Check that redirect works correctly
4. Test on different devices/browsers

**If issues persist**:
1. Follow troubleshooting steps above
2. Check Firebase OAuth configuration
3. Review error messages in console
4. Try the workarounds listed above

