# ⚠️ Backend Deployment Issue - JSON Upload Not Working

## Problem

When trying to upload a JSON file in production, you get:
```
❌ Validation Errors
Failed to validate JSON file
```

## Root Cause

The frontend is deployed on Firebase Hosting, but the **backend is still running locally on your machine**. The frontend cannot reach the backend because:

1. **Frontend URL**: https://ielts-listening-module.web.app (Firebase Hosting)
2. **Backend URL**: http://localhost:8002 (Your local machine)
3. **Result**: Frontend cannot connect to backend from production

## Current Configuration

**File**: `frontend/.env`
```
REACT_APP_BACKEND_URL=https://repo-index-7.preview.emergentagent.com
WDS_SOCKET_PORT=443
```

This is pointing to a preview URL that doesn't exist.

---

## Solution: Deploy Backend to Production

You have several options:

### Option 1: Deploy to Google Cloud Run (Recommended)
- **Cost**: Free tier available
- **Setup Time**: 15 minutes
- **Pros**: Serverless, auto-scaling, easy to deploy

### Option 2: Deploy to Heroku
- **Cost**: Paid (free tier discontinued)
- **Setup Time**: 10 minutes
- **Pros**: Simple deployment

### Option 3: Deploy to AWS
- **Cost**: Free tier available
- **Setup Time**: 30 minutes
- **Pros**: Scalable, reliable

### Option 4: Deploy to Railway
- **Cost**: Free tier available
- **Setup Time**: 10 minutes
- **Pros**: Simple, modern

---

## Quick Fix: Deploy to Google Cloud Run

### Step 1: Install Google Cloud CLI
```bash
# Download from: https://cloud.google.com/sdk/docs/install
# Or use Chocolatey:
choco install google-cloud-sdk
```

### Step 2: Authenticate
```bash
gcloud auth login
gcloud config set project ielts-listening-module
```

### Step 3: Create Dockerfile
Create `backend/Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]
```

### Step 4: Deploy
```bash
cd backend
gcloud run deploy ielts-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Step 5: Get Backend URL
```bash
gcloud run services describe ielts-backend --region us-central1
```

### Step 6: Update Frontend .env
```
REACT_APP_BACKEND_URL=https://ielts-backend-xxxxx.run.app
```

### Step 7: Rebuild and Deploy Frontend
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

---

## Alternative: Use Firebase Cloud Functions

If you want to keep everything in Firebase:

### Step 1: Install Firebase Functions
```bash
npm install -g firebase-tools
firebase init functions
```

### Step 2: Deploy Backend as Functions
```bash
firebase deploy --only functions
```

---

## Temporary Fix: Run Backend Locally

If you want to test locally first:

### Step 1: Update .env
```
REACT_APP_BACKEND_URL=http://localhost:8002
```

### Step 2: Run Backend
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8002
```

### Step 3: Run Frontend Locally
```bash
cd frontend
npm start
```

### Step 4: Test at http://localhost:3000

---

## Recommended: Google Cloud Run Deployment

### Why Google Cloud Run?
✅ Free tier available  
✅ Auto-scaling  
✅ No server management  
✅ Easy to deploy  
✅ Integrates with Firebase  

### Steps:

1. **Install Google Cloud CLI**
   ```bash
   choco install google-cloud-sdk
   ```

2. **Create Dockerfile** in `backend/Dockerfile`
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   COPY . .
   CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]
   ```

3. **Deploy**
   ```bash
   gcloud run deploy ielts-backend \
     --source backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

4. **Get URL** from deployment output

5. **Update frontend/.env**
   ```
   REACT_APP_BACKEND_URL=https://ielts-backend-xxxxx.run.app
   ```

6. **Rebuild frontend**
   ```bash
   cd frontend
   npm run build
   firebase deploy --only hosting
   ```

---

## What You Need to Do

### Immediate (Next 5 minutes)
- [ ] Decide on backend deployment platform
- [ ] Choose from: Google Cloud Run, Heroku, AWS, or Railway

### Short Term (Next 30 minutes)
- [ ] Deploy backend to chosen platform
- [ ] Get backend URL
- [ ] Update frontend/.env
- [ ] Rebuild frontend
- [ ] Deploy frontend

### Verification
- [ ] Test admin login
- [ ] Test file upload
- [ ] Verify questions appear

---

## Current Status

| Component | Status | Issue |
|---|---|---|
| Frontend | ✅ Deployed | Working |
| Backend | ⚠️ Local Only | Not accessible from production |
| Database | ✅ Firebase | Working |
| File Upload | ❌ Failing | Backend not reachable |

---

## Next Steps

1. **Choose deployment platform** (Google Cloud Run recommended)
2. **Deploy backend** (15 minutes)
3. **Update frontend .env** (1 minute)
4. **Rebuild frontend** (5 minutes)
5. **Deploy frontend** (2 minutes)
6. **Test** (5 minutes)

**Total time: ~30 minutes**

---

## Questions?

If you need help with any step, let me know which platform you want to use and I'll guide you through the deployment!

---

**Status**: ⚠️ Backend deployment needed  
**Priority**: HIGH - Blocks file upload functionality  
**Estimated Time**: 30 minutes

