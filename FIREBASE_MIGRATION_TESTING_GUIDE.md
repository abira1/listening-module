# Firebase Migration Testing Guide

## Changes Made

### 1. Added Track Operations to Firebase Service
**File**: `backend/firebase_service.py`

Added these methods:
- `create_track()` - Create new track
- `get_track()` - Get single track
- `get_all_tracks()` - Get all tracks with filtering
- `update_track()` - Update track
- `delete_track()` - Delete/archive track

### 2. Updated Track Service to Use Firebase
**File**: `backend/track_service.py`

Updated endpoints:
- `GET /api/tracks` - Now uses Firebase
- `GET /api/tracks/{track_id}` - Now uses Firebase
- `PUT /api/tracks/{track_id}` - Now uses Firebase
- `DELETE /api/tracks/{track_id}` - Now uses Firebase

### 3. Made MongoDB Optional
**File**: `backend/server.py`

- MongoDB connection is now optional
- Falls back to Firebase if MongoDB unavailable
- Startup/shutdown events handle missing MongoDB gracefully

## Testing Checklist

### Phase 1: Backend Connectivity

#### Test 1.1: Backend Starts Successfully
```bash
cd backend
python -m uvicorn server:app --reload --port 8001
```

**Expected**: Server starts without MongoDB errors
**Check**: Look for "MongoDB connection failed" warning (OK) or "MongoDB connection established" (OK)

#### Test 1.2: Firebase Connection Works
**Expected**: No Firebase errors in logs
**Check**: Look for Firebase initialization messages

### Phase 2: API Endpoints

#### Test 2.1: Get All Exams
```bash
curl http://localhost:8001/api/exams
```

**Expected**: Returns list of exams (may be empty)
**Status**: 200 OK

#### Test 2.2: Get All Tracks
```bash
curl http://localhost:8001/api/tracks
```

**Expected**: Returns list of tracks (may be empty)
**Status**: 200 OK

#### Test 2.3: Create Exam
```bash
curl -X POST http://localhost:8001/api/exams \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Exam","description":"Test","duration_seconds":1800}'
```

**Expected**: Returns created exam with ID
**Status**: 200 OK

#### Test 2.4: Create Track
```bash
curl -X POST http://localhost:8001/api/tracks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Track","track_type":"listening","status":"draft"}'
```

**Expected**: Returns created track with ID
**Status**: 201 Created

### Phase 3: Frontend Testing

#### Test 3.1: Admin Dashboard Loads
1. Go to https://ielts-listening-module.web.app/admin/login
2. Log in with admin account
3. Click "Dashboard"

**Expected**: Dashboard loads without errors
**Check**: No "Failed to load tests" message

#### Test 3.2: Tests Load in Admin Dashboard
1. Go to Admin Dashboard
2. Look at "Total Tests" card

**Expected**: Shows number of tests
**Check**: No error messages

#### Test 3.3: Track Library Loads
1. Go to Admin Dashboard
2. Click "Track Library" in sidebar

**Expected**: Track library loads
**Check**: No "Failed to load tracks" message

#### Test 3.4: Create New Track
1. In Track Library, click "Import First Track"
2. Or click "+" button to create track

**Expected**: Track creation form appears
**Check**: No errors

### Phase 4: Student Testing

#### Test 4.1: Student Login
1. Go to https://ielts-listening-module.web.app/student
2. Click "Login with Google"
3. Use non-admin account

**Expected**: Successfully logs in
**Check**: Redirects to dashboard or profile completion

#### Test 4.2: View Available Exams
1. After login, go to student dashboard
2. Look for available exams

**Expected**: Exams load and display
**Check**: No "Failed to load tests" message

#### Test 4.3: Take Exam
1. Click on an exam
2. Complete exam flow

**Expected**: Exam loads and works
**Check**: Audio plays, questions display, can submit

### Phase 5: CRUD Operations

#### Test 5.1: Create Exam
- Admin creates new exam
- **Expected**: Exam appears in list

#### Test 5.2: Update Exam
- Admin edits exam title
- **Expected**: Changes saved and visible

#### Test 5.3: Create Questions
- Admin adds questions to exam
- **Expected**: Questions saved and visible

#### Test 5.4: Create Track
- Admin creates track from exam
- **Expected**: Track appears in Track Library

#### Test 5.5: Update Track
- Admin edits track title
- **Expected**: Changes saved

#### Test 5.6: Delete Track
- Admin archives track
- **Expected**: Track status changes to "archived"

### Phase 6: Error Handling

#### Test 6.1: Invalid Exam ID
```bash
curl http://localhost:8001/api/exams/invalid-id
```

**Expected**: 404 Not Found

#### Test 6.2: Invalid Track ID
```bash
curl http://localhost:8001/api/tracks/invalid-id
```

**Expected**: 404 Not Found

#### Test 6.3: Missing Required Fields
```bash
curl -X POST http://localhost:8001/api/exams \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected**: 400 Bad Request or 422 Unprocessable Entity

## Troubleshooting

### Issue: "Failed to load tests"
1. Check backend is running
2. Check Firebase connection
3. Check browser console for errors
4. Check backend logs for errors

### Issue: "Failed to load tracks"
1. Check backend is running
2. Check Firebase connection
3. Verify tracks exist in Firebase
4. Check browser console for errors

### Issue: Backend won't start
1. Check Python version (3.8+)
2. Check dependencies: `pip install -r requirements.txt`
3. Check Firebase credentials
4. Check .env file configuration

### Issue: Firebase connection fails
1. Check Firebase project ID
2. Check Firebase database URL
3. Check Firebase credentials
4. Check network connectivity

## Success Criteria

✅ Backend starts without errors
✅ All API endpoints respond correctly
✅ Admin dashboard loads tests
✅ Track library loads tracks
✅ Students can view and take exams
✅ All CRUD operations work
✅ Error handling works correctly
✅ No MongoDB dependency in production

## Next Steps

1. Run all tests above
2. Fix any issues found
3. Deploy to Firebase Hosting
4. Monitor for errors in production
5. Gather user feedback

---

**Status**: Ready for Testing
**Last Updated**: 2025-10-20

