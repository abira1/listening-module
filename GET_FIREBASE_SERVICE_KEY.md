# How to Get Firebase Service Account Key

## 🎯 Quick Steps (5 minutes)

### Step 1: Go to Firebase Console
1. Open https://console.firebase.google.com
2. Sign in with your Google account

### Step 2: Select Your Project
1. Click on your project: **`ielts-listening-module`**
2. (If you don't have a project, create one first)

### Step 3: Go to Project Settings
1. Click the **⚙️ Settings icon** (gear icon) in the top-left
2. Select **"Project Settings"**

### Step 4: Go to Service Accounts Tab
1. Click the **"Service Accounts"** tab
2. You should see "Firebase Admin SDK" section

### Step 5: Generate Private Key
1. Click **"Generate New Private Key"** button
2. A JSON file will download automatically
3. Save it somewhere safe (you'll need it)

### Step 6: Copy the Key Content
1. Open the downloaded JSON file with a text editor
2. Copy ALL the content (Ctrl+A, Ctrl+C)
3. Keep it safe - this is your service account key

---

## 📋 What the Key Looks Like

```json
{
  "type": "service_account",
  "project_id": "ielts-listening-module",
  "private_key_id": "abc123def456...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-abc123@ielts-listening-module.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/certificates/..."
}
```

---

## 🔧 How to Use the Key

### Option 1: Save as File (Easiest)
1. Save the JSON content to: `backend/firebase-key.json`
2. The backend will automatically load it
3. No additional configuration needed

**Steps**:
```bash
# Create the file
cd backend
# Paste the JSON content into a new file called firebase-key.json
# Save it
```

### Option 2: Set Environment Variable
1. Copy the entire JSON content
2. Set as environment variable:

**Windows PowerShell**:
```powershell
$env:FIREBASE_SERVICE_ACCOUNT_KEY = '{"type":"service_account",...}'
```

**Windows Command Prompt**:
```cmd
set FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

**Linux/Mac**:
```bash
export FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

### Option 3: Create .env File
1. Create `backend/.env` file
2. Add this line:
```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

---

## ✅ Verify It Works

### Test 1: Check File Exists
```bash
cd backend
ls firebase-key.json  # macOS/Linux
dir firebase-key.json # Windows
```

### Test 2: Start Backend
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001
```

**Expected Output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8001
INFO:     Firebase initialized successfully
```

### Test 3: Test API
```bash
curl http://localhost:8001/api/tracks
```

**Expected Response**:
```json
{
  "success": true,
  "tracks": []
}
```

---

## 🚨 Troubleshooting

### Issue: "Your default credentials were not found"
**Solution**: 
1. Verify `firebase-key.json` exists in backend directory
2. Or set `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable
3. Restart backend server

### Issue: "Invalid service account key"
**Solution**:
1. Download a new key from Firebase Console
2. Make sure you copied the entire JSON
3. Check for extra spaces or missing characters

### Issue: "Firebase project not found"
**Solution**:
1. Verify project ID in the key matches your Firebase project
2. Check internet connection
3. Verify Firebase project exists at https://console.firebase.google.com

### Issue: "Permission denied"
**Solution**:
1. Check Firebase Realtime Database rules
2. Verify service account has proper permissions
3. Check database URL in backend configuration

---

## 🔐 Security Notes

⚠️ **IMPORTANT**: 
- Never commit `firebase-key.json` to git
- Never share your service account key
- Add to `.gitignore`:
  ```
  firebase-key.json
  .env
  ```

---

## 📝 Step-by-Step Screenshots

### Step 1: Firebase Console
```
https://console.firebase.google.com
↓
Select "ielts-listening-module" project
```

### Step 2: Project Settings
```
Click ⚙️ (Settings icon)
↓
Click "Project Settings"
```

### Step 3: Service Accounts Tab
```
Click "Service Accounts" tab
↓
See "Firebase Admin SDK" section
```

### Step 4: Generate Key
```
Click "Generate New Private Key"
↓
JSON file downloads
↓
Save as backend/firebase-key.json
```

---

## ✨ Next Steps

1. **Get the service key** (follow steps above)
2. **Save as `backend/firebase-key.json`**
3. **Start backend**: `uvicorn server:app --host 0.0.0.0 --port 8001`
4. **Test API**: `curl http://localhost:8001/api/tracks`
5. **Deploy**: Run deployment commands

---

## 📞 Need Help?

If you're stuck:
1. Check Firebase Console is accessible
2. Verify you're logged in to Google
3. Check project exists
4. Try generating a new key
5. Verify file is saved correctly

---

## 🎯 Summary

| Step | Action | Time |
|---|---|---|
| 1 | Go to Firebase Console | 1 min |
| 2 | Select project | 1 min |
| 3 | Go to Project Settings | 1 min |
| 4 | Go to Service Accounts | 1 min |
| 5 | Generate Private Key | 1 min |
| 6 | Save as firebase-key.json | 1 min |
| **Total** | **Get service key** | **~6 min** |

**Status**: Ready to deploy! 🚀

