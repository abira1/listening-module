# Testing the Student Approval System

## 🧪 Step-by-Step Testing Guide

### Part 1: Test Student Registration (Use Non-Admin Email)

**What You Need:**
- A Google account that is NOT aminulislam004474@gmail.com or shahsultanweb@gmail.com

**Steps:**
1. **Open the app in a browser** (or incognito mode)
2. **Go to homepage**: `http://localhost:3000/` or your app URL
3. **Click "Login to Access Exams"** button
4. **You'll be redirected to** `/student`
5. **Click "Login with Google"**
6. **Select your non-admin Google account**
7. **You'll be redirected to** `/complete-profile`

**Fill the Profile Form:**
- Full Name: Test Student
- Email: (auto-filled from Google)
- Phone Number: +1234567890
- Institution: Test University
- Department: Computer Science (optional)
- Roll Number: TEST001 (optional)

8. **Click "Complete Profile"**
9. **You should be redirected to** `/waiting-approval`

**What You Should See:**
- ⏰ Yellow clock icon
- "Waiting for Approval" heading
- Your submitted information displayed
- "Check Approval Status" button
- Logout button

**Screenshot this page!** ✅

---

### Part 2: Test Admin Login

**What You Need:**
- Admin email: aminulislam004474@gmail.com OR shahsultanweb@gmail.com

**Steps:**
1. **Open a new browser window** (or new incognito window)
2. **Go to**: `http://localhost:3000/admin` or `/admin/login`
3. **Click "Sign in with Google"**
4. **Select admin email** (aminulislam004474@gmail.com or shahsultanweb@gmail.com)
5. **You'll be redirected to admin dashboard**

**What You Should See:**
- Admin sidebar on the left
- Dashboard content in the center
- Your admin name at top right

---

### Part 3: Navigate to Student Management

**Steps:**
1. **Look at the left sidebar**
2. **Find the "Students" menu item** (it has a 👥 Users icon)
3. **Click "Students"**
4. **URL changes to** `/admin/students`

**What You Should See:**

**Statistics Cards at Top:**
```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│  Total Students  │ Pending Approval │    Approved      │    Rejected      │
│       1+         │       1+         │        0+        │        0         │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```
- At least 1 in "Pending Approval" (the student you just registered)

**Search and Filter Section:**
```
┌────────────────────────────────────────────────────────────────┐
│ 🔍 Search: [________________]     🎯 [All Status ▼]  [Refresh] │
└────────────────────────────────────────────────────────────────┘
```

**Students Table:**
```
┌────────────────────────────────────────────────────────────────────────────┐
│ Student      │ Contact      │ Institution  │ Status      │ Actions         │
├────────────────────────────────────────────────────────────────────────────┤
│ Test Student │ +1234567890  │ Test Univ    │ 🟡 Pending  │ 👁️ ✅ ❌ 🗑️   │
│ test@...com  │ Roll: TEST001│              │             │                 │
└────────────────────────────────────────────────────────────────────────────┘
```

**Screenshot this page!** ✅

**If you DON'T see the table or icons, check:**
- [ ] Are you on `/admin/students`?
- [ ] Is the page fully loaded? (no spinning loader)
- [ ] Open browser console (F12) - any red errors?
- [ ] Screenshot the console and page together

---

### Part 4: Test Approval Buttons

**You should see these icons in the Actions column:**

| Icon | Label | Location |
|------|-------|----------|
| 👁️ | View | Far right column |
| ✅ | Approve | Next to View (green) |
| ❌ | Reject | Next to Approve (red) |
| 🗑️ | Delete | Last icon |

**Test: View Details**
1. Click the **👁️ (eye icon)**
2. A modal should pop up showing:
   - Student's profile picture
   - Complete information
   - "Approve Student" button (green, at bottom)
   - "Reject Student" button (red, at bottom)
   - "Close" button
3. Click "Close" to dismiss

**Screenshot the modal!** ✅

**Test: Quick Approve**
1. In the table row, find the **✅ (green checkmark icon)**
2. Click it
3. A confirmation dialog should appear: "Are you sure you want to approve this student?"
4. Click "OK"

**What Should Happen:**
- Alert: "Student approved successfully!"
- Badge changes from 🟡 Pending to 🟢 Approved
- "Pending Approval" count decreases by 1
- "Approved" count increases by 1
- The ✅ and ❌ icons disappear (only 👁️, 🔄, 🗑️ remain)

**Screenshot after approval!** ✅

---

### Part 5: Test Student Gets Access

**Go back to your student window** (the one waiting for approval)

1. On the waiting page, **click "Check Approval Status"** button
2. Button shows "Checking..." with spinning icon
3. **Page should automatically redirect to** `/student/dashboard`

**What You Should See:**
- Student dashboard with:
  - Welcome message with student name
  - Available exams list
  - Empty submission history (first time)
  - Stats cards

**Screenshot the dashboard!** ✅

---

## 🔍 Debugging: If Things Don't Work

### Issue 1: "No approve buttons visible"

**Check 1: Verify you're on the right page**
```bash
# URL should be exactly:
http://localhost:3000/admin/students
# OR
https://your-domain.com/admin/students
```

**Check 2: Verify student status is "Pending"**
- Look at the Status column
- It should show: 🟡 Pending
- If it shows 🟢 Approved, the student is already approved

**Check 3: Open Browser Console**
1. Press F12 (or Cmd+Option+I on Mac)
2. Click "Console" tab
3. Look for red error messages
4. Screenshot any errors

**Common Console Errors:**
```
❌ "Cannot read property 'map' of undefined"
   → Students data not loaded yet

❌ "FirebaseError: Permission denied"
   → Firebase rules issue or not logged in as admin

❌ "Network error"
   → Check internet connection
```

**Check 4: Verify Admin Email**
1. In console, type:
   ```javascript
   localStorage.getItem('user')
   ```
2. Check if email is: aminulislam004474@gmail.com OR shahsultanweb@gmail.com

**Check 5: Check Firebase Connection**
1. Open browser console (F12)
2. Go to "Network" tab
3. Filter by "firebase"
4. Should see successful requests (status 200)

---

### Issue 2: "Students not showing in table"

**Solution 1: Refresh Data**
1. Click the 🔄 "Refresh" button at top right
2. Wait 2-3 seconds

**Solution 2: Check Filter**
1. Look at the filter dropdown
2. Change from "Pending" to "All Status"
3. Clear search box if it has text

**Solution 3: Verify Firebase Database**
1. Go to Firebase Console: https://console.firebase.google.com
2. Select project: ielts-listening-module
3. Go to Realtime Database
4. Check if `students/` node exists
5. Verify student data is there

**Solution 4: Check Browser Console**
```javascript
// In console, type:
console.log('Checking Firebase connection...')
```
- If you see errors, take screenshot

---

### Issue 3: "Approval doesn't work / No confirmation"

**Solution 1: Check JavaScript Enabled**
- Ensure JavaScript is enabled in browser
- Disable any ad blockers
- Try incognito/private mode

**Solution 2: Check Popup Blockers**
- Browser might be blocking confirmation dialogs
- Allow popups for your site

**Solution 3: Try Different Action**
1. Instead of quick approve (✅ in table)
2. Click 👁️ to open modal
3. Click "Approve Student" button in modal

---

### Issue 4: "Student still can't access after approval"

**Solution: Force Refresh on Student Side**

**Option 1:**
1. Student clicks "Check Approval Status" button
2. Wait for API call to complete
3. Should redirect to dashboard

**Option 2:**
1. Student logs out completely
2. Logs in again
3. Should go to dashboard directly

**Option 3:**
1. Clear browser cookies
2. Close all tabs
3. Open fresh and login

---

## 📸 Required Screenshots for Verification

Please take these screenshots to confirm everything works:

1. ✅ **Student waiting page** (`/waiting-approval`)
   - Should show "Waiting for Approval"
   - Status: Pending
   - Student info displayed

2. ✅ **Admin Student Management page** (`/admin/students`)
   - Statistics cards visible
   - Student table visible
   - Action icons visible (👁️ ✅ ❌ 🗑️)

3. ✅ **Student details modal**
   - Opened by clicking 👁️
   - Shows complete profile
   - Has "Approve Student" button

4. ✅ **After approval**
   - Badge changed to 🟢 Approved
   - Statistics updated
   - Icons changed (no more ✅ ❌)

5. ✅ **Student dashboard** (after approval)
   - Student can access dashboard
   - Welcome message shows
   - Exams visible

---

## 🧪 Advanced Testing

### Test Other Actions

**Test Reject:**
1. Register another test student
2. In admin panel, click ❌ (X icon) on pending student
3. Verify badge changes to 🔴 Rejected
4. Student still sees waiting page (but with rejected message)

**Test Deactivate:**
1. Find an approved student
2. Click 🔄 (toggle icon)
3. Confirm deactivation
4. Badge changes to ⚫ Inactive
5. Student loses access

**Test Reactivate:**
1. Find an inactive student
2. Click 🔄 again
3. Confirm activation
4. Badge changes back to 🟢 Approved
5. Student regains access

**Test Delete:**
1. Click 🗑️ (trash icon)
2. Confirm deletion
3. Student disappears from list
4. Total count decreases

---

## ✅ Success Criteria

The system is working correctly if:

- [x] Student can register
- [x] Student sees "Waiting for Approval" page
- [x] Admin can login
- [x] Admin can navigate to Student Management
- [x] Admin sees pending students in table
- [x] Admin sees action icons (👁️ ✅ ❌ 🗑️)
- [x] Admin can click approve (✅ or button in modal)
- [x] Approval confirmation dialog appears
- [x] After approval, badge changes to Approved
- [x] Student can refresh status and access dashboard
- [x] Approved student can take exams

---

## 📞 Get Help

If after following all these steps you still don't see the approve buttons:

**Provide the following:**
1. Screenshot of `/admin/students` page
2. Screenshot of browser console (F12)
3. Screenshot of Network tab showing requests
4. Your browser name and version
5. Operating system

**Then we can:**
- Debug specific issues
- Check Firebase configuration
- Verify admin permissions
- Check component rendering

---

Good luck! The system should be working. Follow these steps carefully and screenshot everything for debugging if needed.
