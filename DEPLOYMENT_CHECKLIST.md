# Firebase Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Firebase Project Setup
- [x] Firebase project created: `ielts-listening-module`
- [x] Firebase configuration updated in `/app/frontend/src/config/firebase.js`
- [x] Firebase Auth enabled
- [x] Google OAuth provider configured
- [x] Firebase Realtime Database created
- [x] Database URL configured: `https://ielts-listening-module-default-rtdb.firebaseio.com/`

### 2. Authentication Configuration
- [x] Google OAuth credentials configured
- [x] Admin email whitelist implemented:
  - aminulislam004474@gmail.com
  - shahsultanweb@gmail.com
- [x] Firebase Auth rules configured
- [x] Database security rules created (`database.rules.json`)

### 3. Code Implementation
- [x] FirebaseAuthService created and tested
- [x] AuthContext updated to use Firebase
- [x] Student authentication flow implemented
- [x] Admin authentication with email whitelist
- [x] Profile management in Firebase Realtime Database
- [x] Submission tracking in Firebase
- [x] Header navigation updated (no login buttons when logged out)
- [x] All protected routes secured

### 4. Documentation
- [x] FIREBASE_DEPLOYMENT.md created
- [x] FIREBASE_MIGRATION_SUMMARY.md created
- [x] README.md updated with Firebase info
- [x] Database rules documented
- [x] API endpoints documented

### 5. Configuration Files
- [x] `firebase.json` created
- [x] `.firebaserc` created
- [x] `database.rules.json` created
- [x] `.gitignore` updated (if needed)

## 📋 Deployment Steps

### Step 1: Install Firebase CLI (if not installed)
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```
Expected: Browser opens, login with Google account that has access to the project

### Step 3: Verify Firebase Project
```bash
cd /app
firebase projects:list
```
Expected: See `ielts-listening-module` in the list

### Step 4: Set Active Project
```bash
firebase use ielts-listening-module
```
Expected: "Now using project ielts-listening-module"

### Step 5: Build Frontend
```bash
cd /app/frontend
yarn build
```
Expected: Build folder created at `/app/frontend/build`

### Step 6: Test Build Locally (Optional)
```bash
cd /app
firebase serve
```
Expected: Local server starts, test at http://localhost:5000

### Step 7: Deploy Database Rules
```bash
firebase deploy --only database
```
Expected: Database rules deployed successfully

### Step 8: Deploy Hosting
```bash
firebase deploy --only hosting
```
Expected: Frontend deployed to Firebase Hosting

### Step 9: Full Deployment (Alternative)
```bash
firebase deploy
```
Expected: Both hosting and database rules deployed

## 🧪 Post-Deployment Testing

### Test 1: Homepage Access
- [ ] Visit: `https://ielts-listening-module.web.app`
- [ ] Verify homepage loads
- [ ] Check "Login to Access Exams" button is visible
- [ ] Verify NO "Student Login" or "Admin Panel" buttons in header

### Test 2: Student Authentication
- [ ] Click "Login to Access Exams"
- [ ] Redirects to `/student`
- [ ] Click "Login with Google"
- [ ] Google OAuth popup appears
- [ ] Successfully authenticate
- [ ] Redirects to profile completion (if new user)
- [ ] After profile completion, redirects to dashboard

### Test 3: Student Dashboard
- [ ] Dashboard loads successfully
- [ ] Available exams are displayed
- [ ] Submission history shows (if any)
- [ ] Can navigate to exam

### Test 4: Exam Taking
- [ ] Select an exam
- [ ] Audio plays correctly
- [ ] Questions display properly
- [ ] Can answer questions
- [ ] Timer works
- [ ] Submit exam
- [ ] Score displayed
- [ ] Redirects to dashboard
- [ ] Submission appears in history

### Test 5: Admin Access (Whitelisted Email)
- [ ] Logout if logged in
- [ ] Navigate to `/admin` or `/admin/login`
- [ ] Click "Sign in with Google"
- [ ] Login with `aminulislam004474@gmail.com` or `shahsultanweb@gmail.com`
- [ ] Successfully granted admin access
- [ ] Admin dashboard loads
- [ ] Can access test management
- [ ] Can view students
- [ ] Can view submissions

### Test 6: Admin Access Denied (Non-Whitelisted Email)
- [ ] Logout if logged in
- [ ] Navigate to `/admin/login`
- [ ] Click "Sign in with Google"
- [ ] Login with non-whitelisted email
- [ ] Access denied message appears
- [ ] Automatically redirected to homepage

### Test 7: Firebase Database
- [ ] Open Firebase Console
- [ ] Navigate to Realtime Database
- [ ] Verify `students/` collection exists
- [ ] Verify student data is being saved
- [ ] Verify `submissions/` collection exists
- [ ] Verify submissions are being saved with scores

### Test 8: Protected Routes
- [ ] Try accessing `/student/dashboard` without login
- [ ] Should redirect to `/student` login page
- [ ] Try accessing `/admin` without login
- [ ] Should redirect to `/admin/login`
- [ ] Try accessing `/complete-profile` without login
- [ ] Should redirect to login

## 🔧 Troubleshooting

### Issue: OAuth Popup Blocked
**Solution:** Enable popups for Firebase domain in browser settings

### Issue: "Auth domain not authorized"
**Solution:** 
1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add your deployment domain: `ielts-listening-module.web.app`

### Issue: Database permission denied
**Solution:**
1. Check Firebase Console → Realtime Database → Rules
2. Verify rules are deployed correctly
3. Test rules in Rules Playground

### Issue: Admin email not recognized
**Solution:**
1. Check `FirebaseAuthService.js` - verify email in ADMIN_EMAILS array
2. Ensure exact match (case-sensitive)
3. Clear browser cache and try again

### Issue: Submissions not saving
**Solution:**
1. Check browser console for errors
2. Verify Firebase Auth token is valid
3. Check database rules allow write access
4. Verify `FirebaseAuthService.saveSubmission()` is being called

### Issue: Build fails
**Solution:**
```bash
cd /app/frontend
rm -rf node_modules package-lock.json
yarn install
yarn build
```

## 📊 Monitoring

### Firebase Console Checks
- [ ] Authentication → Users (verify users being created)
- [ ] Realtime Database → Data (verify data structure)
- [ ] Hosting → Releases (verify deployment history)
- [ ] Analytics → Events (optional, if enabled)

### Regular Maintenance
- [ ] Monitor database usage
- [ ] Check authentication logs
- [ ] Review error logs in console
- [ ] Update Firebase SDK versions periodically

## 🎉 Deployment Complete!

Once all checks pass:
1. Application is live at: `https://ielts-listening-module.web.app`
2. Admin access restricted to whitelisted emails
3. Students can register and take exams
4. All data stored in Firebase Realtime Database
5. Questions served from backend (secure)

## 📞 Support

For Firebase-specific issues:
- Firebase Documentation: https://firebase.google.com/docs
- Firebase Console: https://console.firebase.google.com/project/ielts-listening-module

For application-specific issues:
- Check `/app/FIREBASE_MIGRATION_SUMMARY.md`
- Check `/app/README.md`
- Review `/app/FIREBASE_DEPLOYMENT.md`

---

**Deployment Date:** [Add date when deployed]  
**Deployed By:** [Add name]  
**Version:** 2.0 (Firebase Migration)
