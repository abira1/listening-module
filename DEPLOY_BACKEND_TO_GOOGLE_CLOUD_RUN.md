# 🚀 Deploy Backend to Google Cloud Run

## Overview

This guide will help you deploy your FastAPI backend to Google Cloud Run in **15 minutes**.

**Benefits:**
- ✅ Free tier available
- ✅ Auto-scaling
- ✅ No server management
- ✅ Easy to deploy
- ✅ Integrates with Firebase

---

## Prerequisites

1. Google Cloud Account (free tier available)
2. Google Cloud CLI installed
3. Docker installed (optional - Cloud Run can build for you)

---

## Step 1: Create Google Cloud Project

### Option A: Use Existing Project
Your Firebase project is already in Google Cloud!

### Option B: Create New Project
```bash
gcloud projects create ielts-backend --name="IELTS Backend"
gcloud config set project ielts-backend
```

---

## Step 2: Enable Required APIs

```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

---

## Step 3: Deploy Backend

### Option A: Deploy from Source (Easiest)

```bash
cd backend

gcloud run deploy ielts-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 3600
```

### Option B: Deploy with Docker

```bash
cd backend

# Build Docker image
docker build -t ielts-backend .

# Tag for Google Cloud
docker tag ielts-backend gcr.io/ielts-listening-module/ielts-backend

# Push to Google Cloud Registry
docker push gcr.io/ielts-listening-module/ielts-backend

# Deploy
gcloud run deploy ielts-backend \
  --image gcr.io/ielts-listening-module/ielts-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1
```

---

## Step 4: Get Backend URL

After deployment, you'll see output like:

```
Service [ielts-backend] revision [ielts-backend-00001-abc] has been deployed and is serving 100 percent of traffic.
Service URL: https://ielts-backend-xxxxx.run.app
```

**Copy the Service URL** - you'll need it next!

---

## Step 5: Update Frontend Configuration

### Edit `frontend/.env`

```
REACT_APP_BACKEND_URL=https://ielts-backend-xxxxx.run.app
WDS_SOCKET_PORT=443
```

Replace `xxxxx` with your actual service ID.

---

## Step 6: Rebuild Frontend

```bash
cd frontend
npm run build
```

---

## Step 7: Deploy Frontend

```bash
firebase deploy --only hosting
```

---

## Step 8: Test

1. Go to https://ielts-listening-module.web.app
2. Log in as admin
3. Go to "Upload Questions"
4. Select a JSON file
5. Click "Validate"
6. Should work now! ✅

---

## Troubleshooting

### Backend not responding

Check logs:
```bash
gcloud run logs read ielts-backend --limit 50
```

### CORS errors

The backend should have CORS configured. Check `backend/server.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Firebase credentials not found

Make sure `firebase-key.json` is in the backend directory before deploying.

---

## Monitoring

### View Logs
```bash
gcloud run logs read ielts-backend --limit 100
```

### View Metrics
```bash
gcloud run services describe ielts-backend --region us-central1
```

### View in Console
https://console.cloud.google.com/run

---

## Cost

**Free Tier:**
- 2 million requests/month
- 360,000 GB-seconds/month
- Enough for most use cases!

**Paid:**
- $0.00002400 per GB-second
- $0.0000025 per request

---

## Environment Variables

If you need to set environment variables:

```bash
gcloud run deploy ielts-backend \
  --source . \
  --set-env-vars FIREBASE_DATABASE_URL=https://ielts-listening-module-default-rtdb.firebaseio.com
```

---

## Rollback

If something goes wrong:

```bash
# View revisions
gcloud run revisions list --service ielts-backend

# Rollback to previous version
gcloud run deploy ielts-backend \
  --image gcr.io/ielts-listening-module/ielts-backend:previous
```

---

## Next Steps

1. ✅ Deploy backend to Google Cloud Run
2. ✅ Update frontend .env
3. ✅ Rebuild frontend
4. ✅ Deploy frontend
5. ✅ Test file upload

---

## Quick Command Summary

```bash
# 1. Deploy backend
cd backend
gcloud run deploy ielts-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# 2. Update frontend/.env with the Service URL

# 3. Rebuild frontend
cd frontend
npm run build

# 4. Deploy frontend
firebase deploy --only hosting

# 5. Test at https://ielts-listening-module.web.app
```

---

## Support

If you encounter issues:

1. Check logs: `gcloud run logs read ielts-backend --limit 50`
2. Check Firebase credentials: `ls -la backend/firebase-key.json`
3. Check environment variables: `gcloud run services describe ielts-backend`

---

**Estimated Time**: 15 minutes  
**Difficulty**: Easy  
**Status**: Ready to deploy!

