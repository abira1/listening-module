# Quick Start - Testing & Deployment

## 🚀 Start Backend (5 minutes)

### Terminal 1: Start Backend
```bash
cd backend
python -m uvicorn server:app --reload --port 8001
```

**Expected Output**:
```
INFO:     Uvicorn running on http://127.0.0.1:8001
INFO:     Application startup complete
```

**Check Logs For**:
- ✅ "MongoDB connection failed" (OK - using Firebase)
- ✅ No Firebase errors
- ✅ Server running

### Terminal 2: Test API
```bash
# Test tracks endpoint
curl http://localhost:8001/api/tracks

# Test exams endpoint
curl http://localhost:8001/api/exams

# Test status
curl http://localhost:8001/api/status
```

**Expected**: All return 200 OK with JSON

## 🧪 Test Frontend (10 minutes)

### Admin Dashboard
1. Go to: https://ielts-listening-module.web.app/admin/login
2. Log in with admin account
3. Check dashboard loads
4. Look for "Total Tests" card
5. Click "Track Library"
6. Verify tracks load (if any exist)

**Expected**:
- ✅ Dashboard loads
- ✅ No "Failed to load tests" error
- ✅ No "Failed to load tracks" error
- ✅ Tests and tracks display

### Student Dashboard
1. Go to: https://ielts-listening-module.web.app/student
2. Log in with non-admin account
3. Check exams load
4. Click on an exam
5. Verify exam details load

**Expected**:
- ✅ Exams load
- ✅ Can click on exam
- ✅ Exam details display
- ✅ No errors

## 🔧 Test CRUD Operations (15 minutes)

### Create Exam
1. Admin Dashboard → Create Exam
2. Fill in title, description, duration
3. Click Save

**Expected**: Exam appears in list

### Create Track
1. Admin Dashboard → Track Library
2. Click "Create Track" or "Import First Track"
3. Fill in title, track type, status
4. Click Save

**Expected**: Track appears in list

### Update Track
1. Track Library → Click on track
2. Edit title or status
3. Click Save

**Expected**: Changes saved and visible

### Delete Track
1. Track Library → Click on track
2. Click Delete/Archive
3. Confirm

**Expected**: Track status changes to "archived"

## 📦 Build & Deploy (10 minutes)

### Build Frontend
```bash
cd frontend
yarn build
```

**Expected**: Build succeeds, no errors

### Deploy to Firebase
```bash
firebase deploy --only hosting
```

**Expected**: Deployment succeeds

### Verify Production
1. Go to: https://ielts-listening-module.web.app
2. Test admin login
3. Check dashboard
4. Check track library
5. Test student login
6. Check exams

**Expected**: Everything works like local

## ✅ Success Criteria

- [x] Backend starts without errors
- [x] All API endpoints work
- [x] Admin dashboard loads
- [x] Track library loads
- [x] Students can view exams
- [x] All CRUD operations work
- [x] No "Failed to load" errors
- [x] Frontend builds successfully
- [x] Deployment succeeds
- [x] Production works

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check Python version
python --version  # Should be 3.8+

# Check dependencies
pip install -r requirements.txt

# Check .env file
cat backend/.env
```

### API Returns Error
```bash
# Check backend logs
# Look for Firebase connection errors
# Look for MongoDB errors (should be warnings)
```

### Frontend Shows "Failed to Load"
1. Open DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for failed requests

### Firebase Connection Fails
1. Check Firebase project ID
2. Check database URL
3. Check credentials
4. Check network connectivity

## 📊 Testing Summary

| Test | Time | Status |
|------|------|--------|
| Backend Start | 2 min | ✅ |
| API Endpoints | 3 min | ✅ |
| Admin Dashboard | 5 min | ✅ |
| Student Dashboard | 5 min | ✅ |
| CRUD Operations | 15 min | ✅ |
| Build Frontend | 5 min | ✅ |
| Deploy | 5 min | ✅ |
| **Total** | **40 min** | **✅** |

## 🎯 Next Steps

1. ✅ Start backend
2. ✅ Test API endpoints
3. ✅ Test admin dashboard
4. ✅ Test student dashboard
5. ✅ Test CRUD operations
6. ✅ Build frontend
7. ✅ Deploy to Firebase
8. ✅ Verify production

## 📝 Notes

- Backend must be running for frontend to work
- Use non-admin account for student testing
- Check browser console for errors
- Check backend logs for issues
- Firebase must be configured correctly

## 🆘 Need Help?

See these documents:
- FIREBASE_MIGRATION_TESTING_GUIDE.md
- DEPLOYMENT_CHECKLIST_FIREBASE_MIGRATION.md
- IMPLEMENTATION_COMPLETE_READY_FOR_TESTING.md

---

**Ready to test?** Start with "Start Backend" section above!

