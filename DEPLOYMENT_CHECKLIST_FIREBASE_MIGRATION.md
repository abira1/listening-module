# Deployment Checklist - Firebase Migration

## Pre-Deployment Verification

### Code Changes
- [x] `backend/firebase_service.py` - Added track operations
- [x] `backend/track_service.py` - Updated to use Firebase
- [x] `backend/server.py` - Made MongoDB optional
- [x] No syntax errors
- [x] No import errors

### Testing
- [ ] Backend starts without errors
- [ ] All API endpoints respond
- [ ] Admin dashboard loads
- [ ] Track library loads
- [ ] Students can take exams

## Deployment Steps

### Step 1: Verify Backend Locally
```bash
cd backend
python -m uvicorn server:app --reload --port 8001
```

**Check**:
- ✅ Server starts
- ✅ No MongoDB errors
- ✅ Firebase connection works
- ✅ Logs show "MongoDB connection failed" (OK) or "MongoDB connection established" (OK)

### Step 2: Test API Endpoints
```bash
# Test exams
curl http://localhost:8001/api/exams

# Test tracks
curl http://localhost:8001/api/tracks

# Test health
curl http://localhost:8001/api/status
```

**Check**:
- ✅ All endpoints return 200 OK
- ✅ No error messages
- ✅ Data loads correctly

### Step 3: Test Admin Dashboard
1. Go to https://ielts-listening-module.web.app/admin/login
2. Log in with admin account
3. Go to Dashboard

**Check**:
- ✅ Dashboard loads
- ✅ "Total Tests" shows number
- ✅ No "Failed to load tests" error

### Step 4: Test Track Library
1. In Admin Dashboard, click "Track Library"

**Check**:
- ✅ Track library loads
- ✅ No "Failed to load tracks" error
- ✅ Tracks display (if any exist)

### Step 5: Test Student Flow
1. Go to https://ielts-listening-module.web.app/student
2. Log in with non-admin account
3. View available exams

**Check**:
- ✅ Exams load
- ✅ Can click on exam
- ✅ Exam details load
- ✅ Can start exam

### Step 6: Test CRUD Operations
1. Create new exam
2. Add questions
3. Create track from exam
4. Update track
5. Archive track

**Check**:
- ✅ All operations succeed
- ✅ Data persists
- ✅ No errors

## Production Deployment

### Step 1: Build Frontend
```bash
cd frontend
yarn build
```

**Check**:
- ✅ Build succeeds
- ✅ No errors
- ✅ Build size reasonable

### Step 2: Deploy to Firebase
```bash
firebase deploy --only hosting
```

**Check**:
- ✅ Deployment succeeds
- ✅ Website is live
- ✅ No errors

### Step 3: Verify Production
1. Go to https://ielts-listening-module.web.app
2. Test admin login
3. Test student login
4. Test data loading

**Check**:
- ✅ Admin dashboard works
- ✅ Track library works
- ✅ Student exams work
- ✅ No errors in console

## Rollback Plan

If issues occur:

### Option 1: Revert Changes
```bash
git revert <commit-hash>
firebase deploy --only hosting
```

### Option 2: Use MongoDB
If MongoDB is available:
1. Ensure MongoDB is running
2. Backend will automatically use it
3. No code changes needed

### Option 3: Check Logs
```bash
firebase functions:log
```

## Monitoring

### Check Backend Logs
- Monitor for errors
- Check Firebase connection
- Check API response times

### Check Frontend Console
- Open DevTools (F12)
- Go to Console tab
- Look for errors
- Check Network tab for failed requests

### Check Firebase Console
- Go to https://console.firebase.google.com
- Project: `ielts-listening-module`
- Check Realtime Database
- Verify data is being written

## Success Criteria

✅ Backend starts without MongoDB errors
✅ All API endpoints work
✅ Admin dashboard loads tests
✅ Track library loads tracks
✅ Students can view exams
✅ Students can take exams
✅ All CRUD operations work
✅ No errors in console
✅ No errors in backend logs
✅ Data persists correctly

## Post-Deployment

### Day 1
- Monitor for errors
- Check user feedback
- Verify all features work

### Day 2-7
- Continue monitoring
- Gather user feedback
- Fix any issues

### Week 2+
- Optimize performance
- Add improvements
- Plan next features

## Troubleshooting

### Issue: "Failed to load tests"
1. Check backend is running
2. Check Firebase connection
3. Check browser console
4. Check backend logs

### Issue: "Failed to load tracks"
1. Check backend is running
2. Check Firebase connection
3. Verify tracks exist in Firebase
4. Check browser console

### Issue: Backend won't start
1. Check Python version
2. Check dependencies
3. Check Firebase credentials
4. Check .env file

### Issue: Firebase connection fails
1. Check Firebase project ID
2. Check database URL
3. Check credentials
4. Check network

## Contact & Support

For issues:
1. Check logs
2. Review troubleshooting guide
3. Check Firebase console
4. Contact support

---

**Status**: Ready for Deployment
**Last Updated**: 2025-10-20
**Next Step**: Run pre-deployment verification

