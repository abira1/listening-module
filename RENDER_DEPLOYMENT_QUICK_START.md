# ⚡ Render Deployment - Quick Start (20 minutes)

## 🎯 Overview

Deploy your backend to **Render** completely FREE in 20 minutes!

---

## 📋 Checklist

- [ ] GitHub account (create if needed)
- [ ] Render account (create if needed)
- [ ] Firebase key JSON ready
- [ ] 20 minutes of time

---

## 🚀 Step-by-Step

### Step 1: Create GitHub Repository (5 min)

1. Go to https://github.com/new
2. Create repository:
   - Name: `ielts-listening-module`
   - Public
   - Click "Create repository"

### Step 2: Push Code to GitHub (5 min)

Open PowerShell and run:

```powershell
cd "c:\Users\Aminul\Downloads\Final Exam Interface\Final Exam interface"

git init
git add .
git commit -m "Initial commit - IELTS platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ielts-listening-module.git
git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username!**

### Step 3: Create Render Account (2 min)

1. Go to https://render.com
2. Click "Sign up"
3. Sign up with GitHub (easiest!)
4. Authorize Render

### Step 4: Deploy Backend (5 min)

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Select your GitHub repository
4. Click "Connect"

**Configure:**

| Field | Value |
|---|---|
| Name | ielts-backend |
| Environment | Python 3 |
| Region | Choose closest |
| Branch | main |
| Build Command | `pip install -r backend/requirements.txt` |
| Start Command | `cd backend && uvicorn server:app --host 0.0.0.0 --port 8080` |

**Add Environment Variables:**

Click "Advanced" and add:

```
FIREBASE_SERVICE_ACCOUNT_KEY=<paste full JSON here>
FIREBASE_DATABASE_URL=https://ielts-listening-module-default-rtdb.firebaseio.com
```

For the Firebase key:
1. Open: `c:\Users\Aminul\Downloads\ielts-listening-module-firebase-adminsdk-fbsvc-93f5e00107.json`
2. Copy entire content
3. Paste as value

**Click "Create Web Service"**

Wait 2-3 minutes for deployment...

### Step 5: Get Backend URL (1 min)

After deployment, you'll see:
```
Your service is live at: https://ielts-backend-xxxxx.onrender.com
```

**Copy this URL!**

### Step 6: Update Frontend (1 min)

Edit `frontend/.env`:

```
REACT_APP_BACKEND_URL=https://ielts-backend-xxxxx.onrender.com
WDS_SOCKET_PORT=443
```

### Step 7: Rebuild Frontend (3 min)

```powershell
cd frontend
npm run build
```

### Step 8: Deploy Frontend (2 min)

```powershell
firebase deploy --only hosting
```

### Step 9: Test (1 min)

1. Go to https://ielts-listening-module.web.app
2. Log in as admin
3. Go to "Upload Questions"
4. Select JSON file
5. Click "Validate"
6. ✅ Should work!

---

## 🎯 All Commands in One Place

```powershell
# 1. Push to GitHub
cd "c:\Users\Aminul\Downloads\Final Exam Interface\Final Exam interface"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ielts-listening-module.git
git push -u origin main

# 2. Go to Render dashboard and deploy (manual)
# https://dashboard.render.com

# 3. Update frontend/.env with Render URL

# 4. Rebuild and deploy frontend
cd frontend
npm run build
firebase deploy --only hosting

# 5. Test at https://ielts-listening-module.web.app
```

---

## 📊 Timeline

| Step | Time |
|---|---|
| Create GitHub repo | 2 min |
| Push code | 5 min |
| Create Render account | 2 min |
| Deploy backend | 5 min |
| Update frontend | 1 min |
| Rebuild frontend | 3 min |
| Deploy frontend | 2 min |
| Test | 1 min |
| **TOTAL** | **~20 min** |

---

## 💰 Cost

**Completely FREE!**

- No payment required
- No credit card needed
- No hidden costs
- Unlimited requests
- 512 MB memory
- Shared CPU

---

## ✅ After Deployment

✅ Backend deployed to Render  
✅ Frontend can reach backend  
✅ JSON upload works  
✅ Question type detection works  
✅ Track creation works  
✅ Admin dashboard fully functional  
✅ Students can take exams  

---

## 🔧 Troubleshooting

### Backend not starting?
- Check Render logs: https://dashboard.render.com
- Click your service → Logs
- Look for error messages

### Firebase credentials error?
- Make sure you pasted the ENTIRE JSON
- Check environment variables in Render
- Verify firebase-key.json exists locally

### Frontend still can't reach backend?
- Check backend URL in frontend/.env
- Make sure it matches Render URL exactly
- Rebuild: `npm run build`
- Deploy: `firebase deploy --only hosting`

---

## 📝 Important Notes

### Render Free Tier

- Services spin down after 15 minutes of inactivity
- They wake up when accessed
- First request takes ~30 seconds
- Perfect for development/testing

### Keep Service Awake

Option 1: Use https://uptimerobot.com (free)
- Add your backend URL
- Ping every 5 minutes
- Keeps service awake

Option 2: Just access it regularly
- Your users will keep it awake

---

## 🎉 You're Done!

Your IELTS platform is now:
- ✅ Frontend on Firebase Hosting
- ✅ Backend on Render
- ✅ Database on Firebase
- ✅ All completely FREE!

---

## 📚 Related Guides

- `DEPLOY_BACKEND_TO_RENDER_FREE.md` - Detailed guide
- `JSON_UPLOAD_FIX_SUMMARY.md` - Issue explanation
- `backend/Dockerfile` - Docker config

---

**Status**: Ready to deploy  
**Cost**: $0/month  
**Time**: ~20 minutes  
**Difficulty**: Easy  
**Result**: ✅ JSON upload works!

