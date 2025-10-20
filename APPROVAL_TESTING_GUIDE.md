# Student Approval System - Testing Guide

## Prerequisites

**IMPORTANT:** Before testing, ensure Firebase database rules are deployed!

### Check if Rules are Deployed:

1. Go to https://console.firebase.google.com/
2. Select: **ielts-listening-module**
3. Navigate to: **Realtime Database** → **Rules**
4. Verify rules show:
   ```json
   {
     "rules": {
       "students": {
         ".read": "auth != null",
         ".write": "auth != null",
         ...
       }
     }
   }
   ```

If not deployed, see: `/app/FIREBASE_RULES_DEPLOYMENT.md`

## Test Scenario 1: New Student Registration & Approval

### Step 1: Create New Student Account

1. Open **Incognito/Private Window** in browser
2. Navigate to: `http://your-app-url/student`
3. Click: **"Login with Google"**
4. Login with a test Google account (not admin email)
5. Should redirect to: `/complete-profile`

### Step 2: Complete Profile

1. Fill out the form:
   - **Full Name**: Test Student
   - **Phone Number**: +1234567890
   - **Institution**: Test University
   - **Department**: Computer Science
   - **Roll Number**: 12345
2. Click: **"Complete Profile"**
3. Should redirect to: `/waiting-approval`

### Step 3: Verify Waiting State

**Expected Display:**
- 🟡 Yellow clock icon
- **Heading**: "Waiting for Approval"
- **Message**: "Your account is currently under review..."
- **Status Badge**: "Pending" (yellow)
- **Buttons**: "Check Approval Status" and "Logout"

**Browser Console Should Show:**
```
Status updated in real-time: pending
```

### Step 4: Admin Approves Student

1. Open **separate browser window** (or new incognito)
2. Navigate to: `http://your-app-url/admin`
3. Click: **"Sign in with Google"**
4. Login with admin email:
   - `aminulislam004474@gmail.com` OR
   - `shahsultanweb@gmail.com`
5. Click: **"Student Management"** in menu
6. Find the test student in the list
7. Verify status badge shows: **"Pending"** (yellow)
8. Click the **green checkmark** icon (Approve button)
9. Confirm in dialog: **"Are you sure you want to approve this student?"**
10. Click: **"OK"**

**Expected Result:**
- Alert: "Student approved successfully!"
- Status badge changes to: **"Approved"** (green)
- Pending count decreases by 1

### Step 5: Verify Auto-Redirect (CRITICAL TEST)

**Switch back to student window (incognito) - DO NOT TOUCH OR REFRESH**

**Expected Behavior (within 1-2 seconds):**

1. **Icon Changes**: 🟡 → 🟢 (Yellow clock → Green checkmark)
2. **Heading Changes**: "Waiting for Approval" → "Account Approved!"
3. **Message Changes**: "Your account is currently under review" → "Your account has been approved. Redirecting to dashboard..."
4. **After 1.5 seconds**: Page automatically redirects to `/student/dashboard`
5. **Dashboard Loads**: Shows available exams, welcome message, statistics

**Browser Console Should Show:**
```
Status updated in real-time: approved
Profile updated in AuthContext: { status: 'approved', ... }
Navigating to dashboard...
```

**❌ SHOULD NOT HAPPEN:**
- Infinite loop showing "Waiting" → "Approved" → "Waiting"
- Error messages in console
- Staying stuck on waiting page
- Manual refresh needed

### Step 6: Verify Dashboard Access

**Student Dashboard Should Show:**
- ✅ Welcome message with student name
- ✅ Profile picture from Google
- ✅ Institution name
- ✅ Statistics cards (Available Exams, Completed, Average Score)
- ✅ List of published exams with "Start Exam" buttons
- ✅ Submission history section (if any)

**Test Exam Access:**
1. Click **"Start Exam"** on any exam
2. Should navigate to exam page
3. Should see exam questions and timer
4. **Should NOT redirect back to waiting page**

## Test Scenario 2: Manual Status Check

### Steps:

1. Create another pending student (Steps 1-3 from Scenario 1)
2. On waiting page, **DO NOT** let admin approve yet
3. Click: **"Check Approval Status"** button
4. Button shows: "Checking..." with spinning icon
5. Status remains: "Pending"
6. Now admin approves the student
7. Click: **"Check Approval Status"** again
8. Should detect approval and trigger redirect

## Test Scenario 3: Already Approved Student

### Steps:

1. Use a student that's already approved
2. Navigate to: `/waiting-approval` directly
3. **Expected**: Immediately redirects to `/student/dashboard`
4. **Should NOT**: Show waiting page at all

## Test Scenario 4: Rejected Student

### Steps:

1. Create pending student
2. Admin clicks **red X** icon (Reject button)
3. Confirm rejection
4. Student page updates in real-time:
   - Icon: 🔴 Red X circle
   - Heading: "Account Not Approved"
   - Message: "Unfortunately, your account registration was not approved"
   - Status: "Rejected" (red)
5. Student **cannot** access dashboard
6. If tries to go to `/student/dashboard`, redirects back to waiting page

## Test Scenario 5: Multiple Status Changes

### Steps:

1. Create pending student
2. Admin approves → Student sees "Approved" and redirects
3. Admin goes to Student Management
4. Finds the student, clicks toggle (Deactivate)
5. Student dashboard should continue working (already loaded)
6. Student logs out and logs in again
7. Should redirect to waiting page with "Inactive" status
8. Admin reactivates student
9. Waiting page updates to "Approved" and redirects

## Browser Developer Tools - What to Check

### Console Logs (Student Window):

**Good Flow:**
```
Status updated in real-time: pending
Status updated in real-time: approved
Profile updated in AuthContext: { status: 'approved', uid: '...', ... }
Navigating to dashboard...
```

**Bad Flow (Loop Bug):**
```
Status updated in real-time: approved
Status updated in real-time: pending  ← Should NOT happen
Status updated in real-time: approved
Status updated in real-time: pending  ← Loop detected!
```

### Network Tab:

**Should See:**
- WebSocket connection to Firebase (wss://...)
- Real-time data streaming
- No repeated page reloads

### React DevTools:

**Check User State in AuthContext:**
- Before approval: `user.status: "pending"`
- After approval: `user.status: "approved"`
- Should update automatically without page refresh

## Common Issues & Solutions

### Issue 1: "Permission Denied" in Console

**Symptom**: Approve button doesn't work, console shows Firebase permission error

**Solution**:
- Firebase database rules not deployed
- Follow: `/app/FIREBASE_RULES_DEPLOYMENT.md`

### Issue 2: No Real-Time Update

**Symptom**: Status doesn't change until manual refresh

**Solution**:
- Check internet connection
- Check Firebase Console → Realtime Database is enabled
- Check browser console for Firebase connection errors
- Verify `databaseURL` in firebase config

### Issue 3: Redirect Loop Still Happening

**Symptom**: Page loops between "Waiting" and "Approved"

**Solution**:
- Clear browser cache and cookies
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check if frontend service is running: `sudo supervisorctl status frontend`
- Restart frontend: `sudo supervisorctl restart frontend`
- Check latest code is deployed

### Issue 4: Dashboard Shows "Not Approved"

**Symptom**: Redirects to dashboard but then bounces back to waiting

**Solution**:
- AuthContext not synced - wait a few seconds
- Try hard refresh on dashboard
- Check console for user status value
- Verify Firebase listener in AuthContext is active

### Issue 5: Multiple Tabs Conflict

**Symptom**: Approval works in one tab but not another

**Solution**:
- Each tab maintains separate state
- Close extra tabs and test in single tab
- Firebase Auth is shared across tabs, but component state is not

## Performance Checks

**Approval Speed Test:**
- Admin clicks approve
- **Target**: Student sees update within 1-2 seconds
- **Acceptable**: Within 5 seconds
- **Problem**: More than 5 seconds → check Firebase connection

**Redirect Timing:**
- Shows "Approved!" message
- **Target**: Redirects after exactly 1.5 seconds
- **Verify**: Smooth transition, no flash of white screen

## Security Verification

**Test Unauthorized Access:**

1. Pending student tries to access: `/student/dashboard` directly
   - **Expected**: Redirects to `/waiting-approval`

2. Rejected student tries to access: `/student/dashboard` directly
   - **Expected**: Redirects to `/waiting-approval`

3. Non-admin tries to access: `/admin` panel
   - **Expected**: Shows "Restricted Access" or redirects

4. Student tries to approve their own account (via API)
   - **Expected**: Firebase rules block the action

## Success Criteria

✅ **All tests pass without:**
- Manual page refresh needed
- Console errors
- Infinite redirect loops
- Permission denied errors
- Network timeouts

✅ **Real-time updates work:**
- Status changes immediately
- AuthContext syncs automatically
- Smooth UX with feedback messages

✅ **Security maintained:**
- Only admins can approve
- Students can't bypass approval
- Proper access control on all routes

## Automated Testing Script (Optional)

For developers, you can create a Playwright test:

```javascript
// test-approval-flow.spec.js
test('Student approval flow works without loops', async ({ page, context }) => {
  // Create student and wait for approval
  await page.goto('/student');
  await page.click('button:has-text("Login with Google")');
  // ... complete profile
  await expect(page).toHaveURL('/waiting-approval');
  
  // Admin approves in another page
  const adminPage = await context.newPage();
  await adminPage.goto('/admin');
  // ... admin login and approve
  
  // Verify student page updates
  await expect(page.locator('h1')).toContainText('Account Approved!');
  await page.waitForURL('/student/dashboard', { timeout: 5000 });
  await expect(page).toHaveURL('/student/dashboard');
  
  // Verify no redirect loops
  await page.waitForTimeout(3000);
  await expect(page).toHaveURL('/student/dashboard'); // Still on dashboard
});
```

## Documentation References

- **Bug Fix Details**: `/app/STUDENT_APPROVAL_FIX.md`
- **Auto-Approval Flow**: `/app/AUTO_APPROVAL_FLOW.md`
- **Redirect Loop Fix**: `/app/REDIRECT_LOOP_FIX.md`
- **Firebase Deployment**: `/app/FIREBASE_RULES_DEPLOYMENT.md`

---

**Happy Testing! 🎉**

If all tests pass, the student approval system is working perfectly!
