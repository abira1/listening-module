# Firebase Deployment Guide

## Prerequisites
1. Install Firebase CLI globally:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

## Deployment Steps

### 1. Build the Frontend
```bash
cd /app/frontend
yarn build
```

### 2. Initialize Firebase (if not already done)
```bash
cd /app
firebase init
```
- Select "Hosting" and "Realtime Database"
- Choose existing project: `ielts-listening-module`
- Set public directory: `frontend/build`
- Configure as single-page app: Yes
- Don't overwrite index.html

### 3. Deploy to Firebase
```bash
firebase deploy
```

Or deploy only hosting:
```bash
firebase deploy --only hosting
```

Or deploy only database rules:
```bash
firebase deploy --only database
```

## Important Notes

### Authentication Setup
- **Student Login**: Google OAuth via Firebase Auth
- **Admin Access**: Email whitelist (aminulislam004474@gmail.com, shahsultanweb@gmail.com)
- Admin panel accessible at: `/admin`

### Data Structure

#### Students Collection
```
/students/{uid}
  - uid: string
  - email: string
  - name: string
  - photoURL: string
  - phoneNumber: string
  - institution: string
  - department: string
  - rollNumber: string
  - profileCompleted: boolean
  - createdAt: ISO timestamp
  - updatedAt: ISO timestamp
```

#### Submissions Collection
```
/submissions/{submissionId}
  - id: string
  - examId: string
  - examTitle: string
  - studentUid: string
  - studentName: string
  - studentEmail: string
  - answers: object
  - score: number
  - totalQuestions: number
  - percentage: number
  - startedAt: ISO timestamp
  - finishedAt: ISO timestamp
  - createdAt: ISO timestamp
```

### Backend Considerations
The current implementation uses:
- **Firebase Realtime Database**: For student data and submissions
- **FastAPI Backend** (Optional): For serving hardcoded exam questions and auto-grading

You can either:
1. **Deploy frontend only to Firebase**: Keep backend running on your server
2. **Full Firebase migration**: Move backend to Firebase Functions (requires additional setup)

### Firebase Hosting URL
After deployment, your app will be available at:
```
https://ielts-listening-module.web.app
```

## Post-Deployment Checklist
- [ ] Verify Google OAuth works correctly
- [ ] Test admin login with whitelisted emails
- [ ] Verify student can complete profile
- [ ] Test exam submission and grading
- [ ] Check Firebase Realtime Database rules
- [ ] Verify data is being saved correctly

## Troubleshooting

### CORS Issues
If you encounter CORS issues with backend API:
1. Update backend CORS settings to allow Firebase hosting domain
2. Or deploy backend as Firebase Functions

### Authentication Issues
- Ensure Firebase Auth is enabled in Firebase Console
- Add authorized domains in Firebase Console → Authentication → Settings
- Verify API keys are correct in firebase.js

### Database Permission Denied
- Check database.rules.json
- Verify user is authenticated before accessing protected data
- Test rules in Firebase Console → Realtime Database → Rules → Playground

## Commands Reference

```bash
# Check Firebase project
firebase projects:list

# View current project
firebase use

# Switch project
firebase use ielts-listening-module

# Test locally before deploy
firebase serve

# Deploy with preview
firebase deploy --only hosting --message "Deployment description"

# View deployment history
firebase hosting:channel:list
```