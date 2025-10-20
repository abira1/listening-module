# 🔧 ENVIRONMENT SETUP GUIDE - STEP BY STEP

## Part 1: Backend Environment Configuration

### Step 1: Create backend/.env file

Create a new file: `backend/.env`

```env
# ============================================
# FIREBASE CONFIGURATION
# ============================================
FIREBASE_DATABASE_URL=https://ielts-listening-module-default-rtdb.firebaseio.com
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"ielts-listening-module","private_key_id":"your_key_id","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk@ielts-listening-module.iam.gserviceaccount.com","client_id":"your_client_id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"your_cert_url"}

# ============================================
# BACKEND SERVER CONFIGURATION
# ============================================
BACKEND_PORT=8001
BACKEND_HOST=0.0.0.0
DEBUG=True
LOG_LEVEL=INFO
ENVIRONMENT=development

# ============================================
# CORS CONFIGURATION (Allow Frontend)
# ============================================
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000","http://localhost:3001"]
CORS_ALLOW_CREDENTIALS=True
CORS_ALLOW_METHODS=["GET","POST","PUT","DELETE","OPTIONS"]
CORS_ALLOW_HEADERS=["*"]

# ============================================
# MONGODB (Optional - for backward compatibility)
# ============================================
MONGO_URL=mongodb://localhost:27017
DB_NAME=ielts_platform
USE_MONGODB=False

# ============================================
# PERFORMANCE OPTIMIZATION
# ============================================
CACHE_ENABLED=True
CACHE_TTL=3600
MAX_WORKERS=4
CONNECTION_POOL_SIZE=10
MAX_OVERFLOW=20

# ============================================
# SECURITY
# ============================================
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# ============================================
# LOGGING
# ============================================
LOG_FILE=logs/backend.log
LOG_FORMAT=%(asctime)s - %(name)s - %(levelname)s - %(message)s
```

### Step 2: Get Firebase Service Account Key

1. Go to https://console.firebase.google.com
2. Select your project
3. Click ⚙️ (Settings) → Project Settings
4. Go to "Service Accounts" tab
5. Click "Generate New Private Key"
6. Copy the JSON content
7. Replace `FIREBASE_SERVICE_ACCOUNT_KEY` value with the JSON

**Alternative**: Save as `backend/firebase-key.json` and the code will auto-load it.

---

## Part 2: Frontend Environment Configuration

### Step 1: Create frontend/.env.local file

Create a new file: `frontend/.env.local`

```env
# ============================================
# API CONFIGURATION
# ============================================
REACT_APP_API_URL=http://localhost:8001/api
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENVIRONMENT=development

# ============================================
# FIREBASE CONFIGURATION
# ============================================
REACT_APP_FIREBASE_API_KEY=AIzaSyAFc-_sb0Se-2-RsXGJXQbOfbafqwA85pA
REACT_APP_FIREBASE_AUTH_DOMAIN=ielts-listening-module.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=ielts-listening-module
REACT_APP_FIREBASE_STORAGE_BUCKET=ielts-listening-module.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=282015901061
REACT_APP_FIREBASE_APP_ID=1:282015901061:web:a594fa8c1f9dce9e4410ec
REACT_APP_FIREBASE_DATABASE_URL=https://ielts-listening-module-default-rtdb.firebaseio.com

# ============================================
# PERFORMANCE OPTIMIZATION
# ============================================
REACT_APP_ENABLE_CACHING=true
REACT_APP_CACHE_DURATION=3600000
REACT_APP_LAZY_LOAD_COMPONENTS=true
REACT_APP_ENABLE_SERVICE_WORKER=true
REACT_APP_CHUNK_SIZE=512000

# ============================================
# DEBUG & LOGGING
# ============================================
REACT_APP_DEBUG=false
REACT_APP_LOG_LEVEL=info
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true

# ============================================
# FEATURE FLAGS
# ============================================
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_ERROR_REPORTING=true
REACT_APP_ENABLE_OFFLINE_MODE=true
```

### Step 2: Create frontend/.env.production file

Create a new file: `frontend/.env.production`

```env
# ============================================
# API CONFIGURATION (Production)
# ============================================
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENVIRONMENT=production

# ============================================
# FIREBASE CONFIGURATION (Same as development)
# ============================================
REACT_APP_FIREBASE_API_KEY=AIzaSyAFc-_sb0Se-2-RsXGJXQbOfbafqwA85pA
REACT_APP_FIREBASE_AUTH_DOMAIN=ielts-listening-module.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=ielts-listening-module
REACT_APP_FIREBASE_STORAGE_BUCKET=ielts-listening-module.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=282015901061
REACT_APP_FIREBASE_APP_ID=1:282015901061:web:a594fa8c1f9dce9e4410ec
REACT_APP_FIREBASE_DATABASE_URL=https://ielts-listening-module-default-rtdb.firebaseio.com

# ============================================
# PERFORMANCE OPTIMIZATION (Production)
# ============================================
REACT_APP_ENABLE_CACHING=true
REACT_APP_CACHE_DURATION=7200000
REACT_APP_LAZY_LOAD_COMPONENTS=true
REACT_APP_ENABLE_SERVICE_WORKER=true
REACT_APP_CHUNK_SIZE=512000

# ============================================
# DEBUG & LOGGING (Production)
# ============================================
REACT_APP_DEBUG=false
REACT_APP_LOG_LEVEL=error
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true

# ============================================
# FEATURE FLAGS (Production)
# ============================================
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_ERROR_REPORTING=true
REACT_APP_ENABLE_OFFLINE_MODE=true
```

---

## Part 3: Verify Environment Setup

### Backend Verification

```bash
cd backend

# Check if .env file exists
ls -la .env  # macOS/Linux
dir .env    # Windows

# Test Firebase connection
python -c "
import os
from dotenv import load_dotenv
load_dotenv()
print('FIREBASE_DATABASE_URL:', os.getenv('FIREBASE_DATABASE_URL'))
print('BACKEND_PORT:', os.getenv('BACKEND_PORT'))
print('Environment loaded successfully!')
"
```

### Frontend Verification

```bash
cd frontend

# Check if .env.local exists
ls -la .env.local  # macOS/Linux
dir .env.local     # Windows

# Test environment variables
npm run env-check  # If script exists
# Or manually check in browser console after npm start
```

---

## Part 4: Environment Variables Reference

### Backend Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| FIREBASE_DATABASE_URL | Firebase database endpoint | https://project.firebaseio.com |
| BACKEND_PORT | Server port | 8001 |
| CORS_ORIGINS | Allowed frontend URLs | ["http://localhost:3000"] |
| CACHE_ENABLED | Enable response caching | True |
| DEBUG | Debug mode | True (dev), False (prod) |

### Frontend Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| REACT_APP_API_URL | Backend API endpoint | http://localhost:8001/api |
| REACT_APP_FIREBASE_* | Firebase config | From Firebase Console |
| REACT_APP_ENABLE_CACHING | Enable client caching | true |
| REACT_APP_DEBUG | Debug mode | false |

---

## Part 5: Security Best Practices

### ✅ DO:
- ✅ Keep .env files in .gitignore
- ✅ Use different keys for dev/prod
- ✅ Rotate keys regularly
- ✅ Use environment variables for secrets
- ✅ Never commit .env files

### ❌ DON'T:
- ❌ Commit .env files to git
- ❌ Share .env files via email
- ❌ Use same keys for dev/prod
- ❌ Hardcode secrets in code
- ❌ Log sensitive data

---

## Part 6: Troubleshooting

### Backend Environment Issues

**Problem**: "ModuleNotFoundError: No module named 'dotenv'"
```bash
pip install python-dotenv
```

**Problem**: "FIREBASE_DATABASE_URL not found"
```bash
# Check .env file exists
cat backend/.env

# Reload environment
python -m uvicorn server:app --reload
```

### Frontend Environment Issues

**Problem**: "REACT_APP_API_URL is undefined"
```bash
# Check .env.local exists
cat frontend/.env.local

# Restart dev server
npm start
```

**Problem**: "Firebase initialization failed"
- Verify REACT_APP_FIREBASE_* variables
- Check internet connection
- Verify Firebase project exists

---

## Part 7: Quick Setup Script

**macOS/Linux** (`setup-env.sh`):
```bash
#!/bin/bash
echo "Setting up environment..."

# Backend
cd backend
cp .env.example .env
echo "Backend .env created"

# Frontend
cd ../frontend
cp .env.example .env.local
echo "Frontend .env.local created"

echo "✅ Environment setup complete!"
echo "⚠️  Update .env files with your Firebase credentials"
```

**Windows** (`setup-env.bat`):
```batch
@echo off
echo Setting up environment...

cd backend
copy .env.example .env
echo Backend .env created

cd ..\frontend
copy .env.example .env.local
echo Frontend .env.local created

echo ✅ Environment setup complete!
echo ⚠️  Update .env files with your Firebase credentials
```

---

## Summary

✅ Backend .env configured  
✅ Frontend .env.local configured  
✅ Firebase credentials set  
✅ CORS configured  
✅ Performance settings optimized  
✅ Security best practices applied  

**Next Step**: Run the system (see LOCAL_INSTALLATION_COMPLETE_PLAN.md)


