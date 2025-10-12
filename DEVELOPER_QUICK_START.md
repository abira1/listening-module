# 🚀 Developer Quick Start Guide

**5-Minute Setup Guide for New Developers**

---

## 📋 Prerequisites Checklist

- [x] Services running (Backend, Frontend, MongoDB)
- [x] Dependencies installed
- [x] Environment variables configured
- [x] Firebase configured

---

## ⚡ Quick Commands

### Essential Commands (Copy & Paste)

```bash
# Check if everything is running
sudo supervisorctl status

# Restart all services
sudo supervisorctl restart all

# View backend logs (live)
tail -f /var/log/supervisor/backend.*.log

# View frontend logs (live)
tail -f /var/log/supervisor/frontend.*.log

# Test backend health
curl http://localhost:8001/api/health

# Access MongoDB
mongo ielts_platform
```

---

## 🎯 Common Development Tasks

### 1. Add a New API Endpoint (Backend)

**File**: `/app/backend/server.py`

```python
# Add at the end of the file, before startup events

@app.get("/api/my-new-endpoint")
async def my_new_endpoint():
    """Description of what this endpoint does"""
    try:
        # Your logic here
        result = {"message": "success"}
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**No restart needed** - FastAPI auto-reloads!

**Test it**:
```bash
curl http://localhost:8001/api/my-new-endpoint
```

---

### 2. Create a New React Component (Frontend)

**File**: `/app/frontend/src/components/MyComponent.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import BackendService from '../services/BackendService';

const MyComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await BackendService.getMyData();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Component</h1>
      {/* Your UI here */}
    </div>
  );
};

export default MyComponent;
```

**No restart needed** - Hot reload enabled!

**Add route in** `/app/frontend/src/App.js`:
```jsx
import MyComponent from './components/MyComponent';

// In Router
<Route path="/my-route" element={<MyComponent />} />
```

---

### 3. Add API Method to BackendService

**File**: `/app/frontend/src/services/BackendService.js`

```javascript
// Add to BackendService object
getMyData: async () => {
  const response = await api.get('/my-new-endpoint');
  return response.data;
},

createMyData: async (data) => {
  const response = await api.post('/my-new-endpoint', data);
  return response.data;
},

updateMyData: async (id, data) => {
  const response = await api.put(`/my-new-endpoint/${id}`, data);
  return response.data;
},

deleteMyData: async (id) => {
  const response = await api.delete(`/my-new-endpoint/${id}`);
  return response.data;
},
```

---

### 4. Query MongoDB from Backend

```python
# In any backend endpoint

# Find documents
exams = list(db.exams.find({"published": True}))

# Find one
exam = db.exams.find_one({"id": exam_id})

# Insert
result = db.exams.insert_one(exam_dict)
new_id = result.inserted_id

# Update
db.exams.update_one(
    {"id": exam_id},
    {"$set": {"published": True}}
)

# Delete
db.exams.delete_one({"id": exam_id})

# Count
count = db.exams.count_documents({"published": True})

# Aggregate
pipeline = [
    {"$match": {"published": True}},
    {"$group": {"_id": "$exam_type", "count": {"$sum": 1}}}
]
results = list(db.exams.aggregate(pipeline))
```

---

### 5. Use Firebase from Frontend

```javascript
import FirebaseAuthService from '../services/FirebaseAuthService';

// In component

// Get current user
const user = FirebaseAuthService.getCurrentUser();

// Sign in with Google
await FirebaseAuthService.signInWithGoogle();

// Get student data
const student = await FirebaseAuthService.getStudent(uid);

// Update student
await FirebaseAuthService.updateStudent(uid, { name: 'New Name' });

// Get submissions
const submissions = await FirebaseAuthService.getStudentSubmissions(uid);

// Create submission
await FirebaseAuthService.createSubmission({
  examId: 'exam-id',
  studentId: uid,
  answers: { '1': 'answer1', '2': 'answer2' },
  score: 35,
  totalQuestions: 40
});
```

---

### 6. Add Tailwind Styling

**Use utility classes**:
```jsx
<div className="p-4 bg-gray-100 rounded-lg shadow-md">
  <h1 className="text-2xl font-bold text-blue-600 mb-4">Title</h1>
  <p className="text-gray-700">Description</p>
  <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Click Me
  </button>
</div>
```

**Common patterns**:
- Container: `max-w-7xl mx-auto px-4`
- Card: `bg-white rounded-lg shadow-md p-6`
- Button: `px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600`
- Input: `w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500`
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- Flex: `flex items-center justify-between`

---

### 7. Add shadcn/ui Component

```bash
# List available components
cd /app/frontend && npx shadcn-ui@latest add

# Add specific component (example: dialog)
npx shadcn-ui@latest add dialog
```

**Use in component**:
```jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <button>Open Dialog</button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <p>Dialog content here</p>
  </DialogContent>
</Dialog>
```

---

### 8. Install New Dependencies

**Backend (Python)**:
```bash
cd /app/backend
pip install package-name
echo "package-name==version" >> requirements.txt
sudo supervisorctl restart backend
```

**Frontend (JavaScript)**:
```bash
cd /app/frontend
yarn add package-name
# No restart needed - hot reload
```

---

## 🐛 Debugging Tips

### Backend Debugging

**Print statements**:
```python
print(f"DEBUG: Variable value = {my_variable}")
# Logs appear in backend logs
```

**View logs**:
```bash
tail -f /var/log/supervisor/backend.*.log
```

**Interactive testing**:
```bash
# Visit API docs
http://localhost:8001/docs

# Try endpoints directly in Swagger UI
```

**Python shell**:
```bash
cd /app/backend
python3
>>> from server import *
>>> # Test functions here
```

### Frontend Debugging

**Console logs**:
```javascript
console.log('DEBUG: Variable value:', myVariable);
console.error('ERROR:', error);
console.table(arrayData); // Nice table format
```

**Browser DevTools**:
- Open: F12 or Ctrl+Shift+I
- Console tab: See logs
- Network tab: See API calls
- React DevTools: Inspect component state

**Check state**:
```javascript
useEffect(() => {
  console.log('State updated:', state);
}, [state]);
```

### Database Debugging

**MongoDB shell**:
```bash
mongo ielts_platform

# List collections
show collections

# View documents
db.exams.find().pretty()
db.questions.find({section_id: 'some-id'}).pretty()

# Count documents
db.exams.count()

# Check indexes
db.exams.getIndexes()
```

**Firebase (browser console)**:
```javascript
// In browser console on student dashboard
import { getDatabase, ref, get } from 'firebase/database';

const db = getDatabase();
const snapshot = await get(ref(db, 'students'));
console.log(snapshot.val());
```

---

## 📁 Where to Find Things

### Backend Files

| What | Where |
|------|-------|
| Main API | `/app/backend/server.py` |
| Authentication | `/app/backend/auth_service.py` |
| AI Import | `/app/backend/ai_import_service.py` |
| Track Management | `/app/backend/track_service.py` |
| Default Tests | `/app/backend/init_*.py` |
| Dependencies | `/app/backend/requirements.txt` |
| Logs | `/var/log/supervisor/backend.*.log` |

### Frontend Files

| What | Where |
|------|-------|
| Main App | `/app/frontend/src/App.js` |
| Admin Components | `/app/frontend/src/components/admin/` |
| Student Components | `/app/frontend/src/components/student/` |
| Exam Components | `/app/frontend/src/components/*.jsx` (root level) |
| API Service | `/app/frontend/src/services/BackendService.js` |
| Firebase Service | `/app/frontend/src/services/FirebaseAuthService.js` |
| Auth Context | `/app/frontend/src/contexts/AuthContext.jsx` |
| Config | `/app/frontend/src/config/firebase.js` |
| Logs | `/var/log/supervisor/frontend.*.log` |

### Documentation Files

| What | Where |
|------|-------|
| Comprehensive Index | `/app/COMPREHENSIVE_CODEBASE_INDEX.md` |
| Quick Start (this file) | `/app/DEVELOPER_QUICK_START.md` |
| Test Results | `/app/test_result.md` |
| Main README | `/app/README.md` |
| Admin Guide | `/app/ADMIN_QUICK_GUIDE.md` |
| Other Guides | `/app/*.md` |

---

## 🎓 Learning Resources

### Understanding the Codebase

1. **Start with the flow**:
   - Student: Login → Profile → Dashboard → Take Test → View Results
   - Admin: Login → Dashboard → Manage Tests → Review Submissions

2. **Read the main files**:
   - Backend: `/app/backend/server.py` (start with endpoint definitions)
   - Frontend: `/app/frontend/src/App.js` (see all routes)

3. **Trace a feature**:
   - Pick a feature (e.g., "Test Control")
   - Find backend endpoint in `server.py`
   - Find frontend component in `components/`
   - Follow API calls in `BackendService.js`

### Key Concepts

**FastAPI (Backend)**:
- Decorators: `@app.get()`, `@app.post()`, etc.
- Async/await: All functions are `async def`
- Type hints: `exam_id: str`, `data: ExamCreate`
- Pydantic models: Data validation

**React (Frontend)**:
- Hooks: `useState`, `useEffect`, `useContext`
- Props: Pass data to child components
- State: Component-level data
- Context: Global state (auth)

**MongoDB**:
- Collections: Like SQL tables
- Documents: Like SQL rows (JSON format)
- Queries: `find()`, `insert_one()`, `update_one()`, etc.

**Firebase**:
- Realtime Database: JSON tree structure
- Auth: Google OAuth integration
- Listeners: Real-time updates with `onValue()`

---

## 🔥 Common Pitfalls

### ❌ Don't

1. **Modify .env URLs**
   - MONGO_URL and REACT_APP_BACKEND_URL are pre-configured
   - Changing them will break the app

2. **Use `npm` instead of `yarn`**
   - Frontend uses yarn for dependency management
   - `npm` can cause conflicts

3. **Hardcode URLs in code**
   - Always use environment variables
   - Backend: `MONGO_URL`, Frontend: `process.env.REACT_APP_BACKEND_URL`

4. **Forget to update dependencies file**
   - Backend: Add to `requirements.txt`
   - Frontend: yarn automatically updates `package.json`

5. **Skip error handling**
   - Always wrap API calls in try-catch
   - Backend: Use proper HTTP status codes

### ✅ Do

1. **Check logs when things break**
   - Backend logs show Python errors
   - Frontend logs show JavaScript errors

2. **Use the API docs**
   - http://localhost:8001/docs
   - Test endpoints before integrating

3. **Follow existing patterns**
   - Look at similar components/endpoints
   - Copy the structure, modify the logic

4. **Test as you build**
   - Use curl for backend
   - Use browser for frontend

5. **Keep code clean**
   - Remove console.logs before committing
   - Follow existing naming conventions

---

## 🚨 Emergency Commands

### Services Down?
```bash
sudo supervisorctl restart all
```

### Backend Errors?
```bash
tail -n 100 /var/log/supervisor/backend.err.log
```

### Frontend Not Loading?
```bash
cd /app/frontend
yarn install
sudo supervisorctl restart frontend
```

### Database Empty?
```bash
cd /app/backend
python3 init_ielts_test.py
python3 init_reading_test.py
python3 init_writing_test.py
```

### Port Conflicts?
```bash
# Backend
sudo lsof -i :8001
sudo kill -9 <PID>

# Frontend
sudo lsof -i :3000
sudo kill -9 <PID>

sudo supervisorctl restart all
```

---

## 📞 Getting Help

1. **Check documentation**:
   - COMPREHENSIVE_CODEBASE_INDEX.md (detailed info)
   - DEVELOPER_QUICK_START.md (this file)
   - test_result.md (known issues)

2. **Check logs**:
   - Backend: `/var/log/supervisor/backend.*.log`
   - Frontend: `/var/log/supervisor/frontend.*.log`

3. **Test endpoints**:
   - http://localhost:8001/docs

4. **Check service status**:
   ```bash
   sudo supervisorctl status
   ```

---

## ✅ Quick Checklist for New Features

- [ ] Design the feature (what does it do?)
- [ ] Add backend endpoint if needed
- [ ] Test endpoint in Swagger UI (http://localhost:8001/docs)
- [ ] Add service method in BackendService.js
- [ ] Create/modify React component
- [ ] Add route in App.js if needed
- [ ] Test in browser
- [ ] Check for errors in console/logs
- [ ] Clean up code (remove console.logs)
- [ ] Update documentation if major feature

---

**Ready to code? Start with a simple task and gradually increase complexity!**

**Pro Tip**: Always have the logs open in a terminal while developing:
```bash
# Split terminal
# Terminal 1: Backend logs
tail -f /var/log/supervisor/backend.*.log

# Terminal 2: Frontend logs
tail -f /var/log/supervisor/frontend.*.log
```

Happy coding! 🚀
