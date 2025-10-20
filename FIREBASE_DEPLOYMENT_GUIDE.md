# Firebase Deployment Guide

## Overview
This guide covers deploying the IELTS Listening Module to Firebase Hosting with Firebase Realtime Database integration.

## Prerequisites
- Firebase CLI installed (`firebase --version` should show version)
- Firebase project created: `ielts-listening-module`
- Firebase credentials configured
- Frontend built (`frontend/build` directory exists)

## Setup Steps

### 1. Firebase Authentication
Before deploying, you need to authenticate with Firebase:

```bash
firebase login
```

This will open a browser window to authenticate your Google account.

### 2. Verify Project Configuration
Check that the Firebase project is correctly configured:

```bash
firebase projects:list
```

Should show `ielts-listening-module` as the default project.

### 3. Deploy Database Rules
Deploy the Firebase Realtime Database security rules:

```bash
firebase deploy --only database
```

This deploys the rules from `database.rules.json`.

### 4. Deploy to Firebase Hosting
Deploy the frontend to Firebase Hosting:

```bash
firebase deploy --only hosting
```

This deploys the contents of `frontend/build` to Firebase Hosting.

### 5. Full Deployment
To deploy everything at once:

```bash
firebase deploy
```

This deploys:
- Database rules
- Hosting (frontend)

## Deployment Checklist

- [ ] Firebase CLI installed and authenticated
- [ ] Frontend built (`yarn build` completed)
- [ ] `firebase.json` configured correctly
- [ ] `database.rules.json` configured correctly
- [ ] `.firebaserc` points to correct project
- [ ] Firebase project has Realtime Database enabled
- [ ] Firebase project has Hosting enabled

## Post-Deployment

### 1. Verify Deployment
After deployment, verify the website is accessible:

```bash
firebase hosting:channel:list
```

Your site will be available at: `https://ielts-listening-module.web.app`

### 2. Check Database Rules
Verify database rules are deployed:

```bash
firebase database:rules:get
```

### 3. Monitor Deployment
View deployment logs:

```bash
firebase deploy --debug
```

## Backend Configuration

### Firebase Admin SDK Setup
The backend uses Firebase Admin SDK for database operations. To enable this:

1. **Generate Service Account Key**:
   - Go to Firebase Console
   - Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `firebase-key.json` in the backend directory

2. **Set Environment Variable** (Alternative):
   ```bash
   export FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
   ```

3. **Backend Environment Variables**:
   ```
   FIREBASE_DATABASE_URL=https://ielts-listening-module-default-rtdb.firebaseio.com
   ```

## Database Structure

### Exams
```
exams/
  {examId}/
    id: string
    title: string
    description: string
    published: boolean
    question_count: number
    ...
```

### Sections
```
sections/
  {sectionId}/
    id: string
    exam_id: string
    index: number
    title: string
```

### Questions
```
questions/
  {questionId}/
    id: string
    exam_id: string
    section_id: string
    type: string
    payload: object
    ...
```

### Students
```
students/
  {uid}/
    uid: string
    email: string
    name: string
    status: string (pending/approved/rejected)
    ...
```

### Submissions
```
submissions/
  {submissionId}/
    id: string
    exam_id: string
    user_id_or_session: string
    answers: object
    score: number
    ...
```

## Security Rules

The database rules ensure:
- Exams, sections, questions are publicly readable
- Students can only read/write their own data
- Submissions are protected by authentication
- Admin operations are restricted

## Troubleshooting

### Deployment Fails
```bash
firebase deploy --debug
```

### Authentication Issues
```bash
firebase logout
firebase login
```

### Clear Cache
```bash
firebase cache:clear
```

### View Logs
```bash
firebase functions:log
```

## Rollback

To rollback to a previous version:

```bash
firebase hosting:releases:list
firebase hosting:rollback
```

## Monitoring

Monitor your deployment:
- Firebase Console: https://console.firebase.google.com
- Hosting: Project → Hosting
- Database: Project → Realtime Database
- Rules: Project → Realtime Database → Rules

## Support

For issues:
1. Check Firebase Console for errors
2. Review deployment logs: `firebase deploy --debug`
3. Check database rules in Firebase Console
4. Verify frontend build: `ls frontend/build`

## Next Steps

After deployment:
1. Test all features on the live site
2. Monitor performance in Firebase Console
3. Set up analytics if needed
4. Configure custom domain (optional)
5. Set up automated backups

---

**Deployment URL**: https://ielts-listening-module.web.app
**Project ID**: ielts-listening-module
**Database URL**: https://ielts-listening-module-default-rtdb.firebaseio.com

