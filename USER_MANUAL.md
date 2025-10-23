# 📚 IELTS Exam Platform - User Manual

**Version**: 1.0  
**Last Updated**: October 23, 2025  
**Platform**: 100% Local - SQLite + FastAPI + React

---

## 📖 Table of Contents

1. [Getting Started Guide](#getting-started-guide)
2. [Admin User Guide](#admin-user-guide)
3. [Teacher User Guide](#teacher-user-guide)
4. [Student User Guide](#student-user-guide)
5. [Troubleshooting Section](#troubleshooting-section)

---

## 🚀 Getting Started Guide

### System Requirements

**Minimum Requirements:**
- **Operating System**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **RAM**: 4GB minimum (8GB recommended)
- **Disk Space**: 2GB free space
- **Internet**: Not required (100% local operation)

**Software Requirements:**
- **Node.js**: Version 16 or higher
- **Python**: Version 3.8 or higher
- **npm**: Version 7 or higher (comes with Node.js)

### Installation Instructions

#### Step 1: Download and Extract
1. Download the IELTS Platform package
2. Extract the ZIP file to your desired location
3. Note the installation path (you'll need it later)

#### Step 2: Install Backend Dependencies
```bash
1. Open Command Prompt or Terminal
2. Navigate to the backend folder:
   cd [installation-path]/backend
3. Install Python dependencies:
   pip install -r requirements.txt
```

#### Step 3: Install Frontend Dependencies
```bash
1. Open a new Command Prompt or Terminal
2. Navigate to the frontend folder:
   cd [installation-path]/frontend
3. Install Node.js dependencies:
   npm install
```

#### Step 4: Start the Servers

**Terminal 1 - Backend Server:**
```bash
cd [installation-path]/backend
python server.py
```
✓ You should see: "Uvicorn running on http://0.0.0.0:8000"

**Terminal 2 - Frontend Server:**
```bash
cd [installation-path]/frontend
npm start
```
✓ You should see: "Compiled successfully! You can now view frontend in the browser."

### First-Time Setup

1. **Open your browser** and go to: `http://localhost:3000`
2. **You should see the login page**
3. **Database is automatically initialized** on first run
4. **Test data is pre-loaded** for demonstration

### Test Login Credentials

Use these credentials to test different user roles:

**Admin Account:**
- Username: `admin`
- Password: `admin123`
- Role: Full system access, exam management, user management
- Access: http://localhost:3000/admin

**Teacher Account (Auto-Generated):**
- Teachers are created by admins with auto-generated credentials
- Each teacher gets a unique Teacher ID (format: TCH-XXXXXX)
- Initial password is auto-generated (8 characters)
- Access: http://localhost:3000/teacher/login
- Teachers can change their password after first login

**Student Account:**
- Username: `student`
- Password: `student123`
- Role: Take exams, view results, track performance
- Access: http://localhost:3000/student

---

## 👨‍💼 Admin User Guide

### Dashboard Overview

When you log in as an admin, you'll see:
- **Main Dashboard**: Overview of system statistics
- **Navigation Menu**: Links to all admin functions
- **Quick Actions**: Buttons for common tasks

### Creating and Managing Exams

#### Create a New Exam

1. **Click "Exams"** in the left menu
2. **Click "Create New Exam"** button
3. **Fill in exam details:**
   - **Exam Name**: Enter a descriptive name (e.g., "IELTS Practice Test 1")
   - **Description**: Brief description of the exam
   - **Duration**: Time limit in minutes (e.g., 180 for 3 hours)
   - **Total Score**: Maximum score (e.g., 100)
   - **Passing Score**: Minimum score to pass (e.g., 70)
   - **Difficulty Level**: Select Easy, Medium, or Hard
   - **Tags**: Add relevant tags (e.g., "Practice", "Full-Length")

4. **Click "Save"** to create the exam
5. **Add questions** to the exam (see next section)

#### Edit an Exam

1. **Click "Exams"** in the left menu
2. **Find the exam** you want to edit
3. **Click the "Edit"** button (pencil icon)
4. **Modify the details** as needed
5. **Click "Save"** to apply changes

#### Delete an Exam

1. **Click "Exams"** in the left menu
2. **Find the exam** you want to delete
3. **Click the "Delete"** button (trash icon)
4. **Confirm deletion** in the popup

#### Publish/Unpublish an Exam

1. **Click "Exams"** in the left menu
2. **Find the exam** you want to publish
3. **Click the "Publish"** button to make it available to students
4. **Click "Unpublish"** to hide it from students

### Uploading and Managing Questions

#### Upload Questions

1. **Click "Questions"** in the left menu
2. **Click "Upload Questions"** button
3. **Select a JSON file** with your questions
4. **Click "Upload"**
5. **System validates** the questions automatically
6. **View validation results** - any errors will be highlighted

#### Question Format

Questions should be in JSON format with these fields:
```json
{
  "type": "multiple-choice",
  "text": "What is the capital of France?",
  "options": ["Paris", "London", "Berlin", "Madrid"],
  "answer_key": "Paris",
  "difficulty": "easy",
  "section": "Reading"
}
```

#### Manage Questions

1. **Click "Questions"** in the left menu
2. **View all questions** in the list
3. **Search questions** using the search bar
4. **Filter by type** or difficulty
5. **Edit a question** by clicking the edit icon
6. **Delete a question** by clicking the delete icon

### Creating and Managing Tracks

#### Create a Track

1. **Click "Tracks"** in the left menu
2. **Click "Create New Track"** button
3. **Enter track details:**
   - **Track Name**: Name of the question track (e.g., "Reading Section")
   - **Description**: What this track covers
   - **Order**: Display order

4. **Add questions** to the track
5. **Click "Save"**

#### Manage Tracks

1. **Click "Tracks"** in the left menu
2. **View all tracks** in the list
3. **Edit a track** by clicking the edit icon
4. **Delete a track** by clicking the delete icon
5. **Reorder questions** within a track by dragging

### Viewing Validation Errors

#### Error Panel

1. **Click "Validation"** in the left menu
2. **View all validation errors** in the panel
3. **Errors are categorized by type:**
   - **Schema Errors**: Missing required fields
   - **Data Type Errors**: Wrong data types
   - **Content Errors**: Invalid content
   - **Asset Errors**: Missing files or resources

#### Error Details

1. **Click on an error** to see details
2. **View the problematic data**
3. **See suggested fixes**
4. **Click "Fix"** to apply automatic fixes (if available)
5. **Or manually edit** the data

### Using the Analytics Dashboard

#### View Analytics

1. **Click "Analytics"** in the left menu
2. **See key metrics:**
   - Total exams created
   - Total students
   - Average exam score
   - Pass rate percentage

#### Performance Trends

1. **Click the "Trends"** tab
2. **View performance over time**
3. **See score distribution**
4. **Analyze student performance patterns**

#### Export Reports

1. **Click "Export"** button
2. **Choose format:** PDF or CSV
3. **Select date range** (optional)
4. **Click "Download"**

### Managing Users and Permissions

#### View Users

1. **Click "Users"** in the left menu
2. **See all registered users**
3. **View user roles** and status

#### Create New User

1. **Click "Users"** in the left menu
2. **Click "Add New User"** button
3. **Enter user details:**
   - **Username**: Unique username
   - **Email**: User email address
   - **Password**: Initial password
   - **Role**: Select Admin, Teacher, or Student

4. **Click "Create"**

#### Edit User

1. **Click "Users"** in the left menu
2. **Find the user** you want to edit
3. **Click the edit icon**
4. **Modify details** as needed
5. **Click "Save"**

#### Delete User

1. **Click "Users"** in the left menu
2. **Find the user** you want to delete
3. **Click the delete icon**
4. **Confirm deletion**

### Managing Teachers

#### Access Teacher Management

1. **Click "Teachers"** in the left menu
2. **You'll see the Teacher Management page**
3. **Two tabs available:**
   - **Teachers List**: View all teachers
   - **Add New Teacher**: Create new teacher accounts

#### View All Teachers

1. **Click "Teachers"** in the left menu
2. **Click "Teachers List"** tab
3. **See table with all teachers:**
   - Teacher ID (auto-generated, format: TCH-XXXXXX)
   - Full Name
   - Email
   - Subject/Department
   - Status (Active/Inactive)
   - Action buttons

#### Create New Teacher Account

1. **Click "Teachers"** in the left menu
2. **Click "Add New Teacher"** tab
3. **Fill in the form:**
   - **Full Name** (required): Teacher's full name
   - **Email** (required): Unique email address
   - **Phone Number** (optional): Contact number
   - **Subject/Department** (optional): Teaching subject
   - **Bio** (optional): Teacher biography
   - **Profile Photo** (optional): Upload teacher photo

4. **Click "Create Teacher"**
5. **Success message appears with:**
   - **Teacher ID**: Auto-generated unique ID (TCH-XXXXXX)
   - **Initial Password**: Auto-generated 8-character password
   - **Important**: Copy and securely share these credentials with the teacher

#### Reset Teacher Password

1. **Click "Teachers"** in the left menu
2. **Click "Teachers List"** tab
3. **Find the teacher** in the list
4. **Click the "🔑" (key) button** in the Actions column
5. **Confirm password reset**
6. **New password is generated and displayed**
7. **Share the new password** with the teacher securely

#### Delete Teacher Account

1. **Click "Teachers"** in the left menu
2. **Click "Teachers List"** tab
3. **Find the teacher** you want to delete
4. **Click the "🗑️" (trash) button** in the Actions column
5. **Confirm deletion** in the dialog
6. **Teacher account is deactivated**

---

## 👨‍🏫 Teacher User Guide

### Teacher Login

#### First-Time Login

1. **Open your browser** and go to: `http://localhost:3000/teacher/login`
2. **You'll see the Teacher Login page**
3. **Enter your credentials:**
   - **Teacher ID**: Your unique ID (format: TCH-XXXXXX)
   - **Password**: Your initial password (provided by admin)
4. **Optional: Check "Remember me"** to save your Teacher ID
5. **Click "Login"**
6. **You'll be redirected to the Teacher Dashboard**

#### Forgot Your Password?

1. **Click "Forgot your password?"** link on login page
2. **Contact your administrator** to reset your password
3. **Admin will generate a new password** and share it with you
4. **Use the new password** to log in

#### Remember Me Feature

1. **Check "Remember me"** checkbox before logging in
2. **Your Teacher ID will be saved** in your browser
3. **Next time you visit**, your Teacher ID will be pre-filled
4. **You still need to enter your password** for security

### Managing Your Profile

#### Access Your Profile

1. **Click your name or profile icon** in the top right corner
2. **Click "My Profile"** from the dropdown menu
3. **You'll see your profile page** with two tabs:
   - **Profile Information**: View and manage your details
   - **Change Password**: Update your password

#### View Profile Information

1. **Click "My Profile"** from the menu
2. **Click "Profile Information"** tab
3. **See your details:**
   - **Teacher ID**: Your unique ID (read-only)
   - **Full Name**: Your name
   - **Email**: Your email address
   - **Phone Number**: Your contact number
   - **Subject/Department**: Your teaching subject
   - **Status**: Account status (Active/Inactive)
   - **Account Created**: Date your account was created
   - **Last Login**: Your last login time
   - **Bio**: Your biography

#### Update Your Profile Photo

1. **Click "My Profile"** from the menu
2. **Click "Profile Information"** tab
3. **Your current photo is displayed** (if available)
4. **To change photo:**
   - Contact your administrator
   - They can update your photo from the Teacher Management page

#### Change Your Password

1. **Click "My Profile"** from the menu
2. **Click "Change Password"** tab
3. **Enter your current password** (for security verification)
4. **Enter your new password** (minimum 6 characters)
5. **Confirm your new password** (must match)
6. **Click "Change Password"**
7. **Success message appears**
8. **Use your new password** for next login

#### Password Requirements

- **Minimum length**: 6 characters
- **Recommended**: Mix of letters, numbers, and symbols
- **Keep it secure**: Don't share with anyone
- **Remember it**: You'll need it to log in

### Accessing the Teacher Dashboard

1. **Log in** with your teacher credentials
2. **You'll see the Teacher Dashboard** automatically
3. **Dashboard shows:**
   - Pending submissions to grade
   - Grading statistics
   - List of your students
   - Recent activity

### Viewing Pending Submissions

#### Find Submissions to Grade

1. **Click "Pending Grading"** tab on dashboard
2. **See list of submissions** waiting for grading
3. **Each submission shows:**
   - Student name
   - Exam name
   - Submission date
   - Current status

#### View Submission Details

1. **Click on a submission** in the list
2. **See student's answers** to all questions
3. **View the exam details**
4. **Review student's response time**

### Grading Student Submissions

#### Grade a Submission

1. **Click on a submission** to open it
2. **Review student's answers** carefully
3. **Enter the score** (0-100)
4. **Add feedback** in the feedback box
5. **Click "Submit Grade"**
6. **Confirmation message** appears

#### Feedback Guidelines

- **Be constructive**: Provide helpful comments
- **Be specific**: Reference specific answers
- **Be encouraging**: Acknowledge good work
- **Suggest improvements**: Help students improve

### Publishing Grades

#### Publish Grades for Class

1. **Click "Publish Grades"** button
2. **Select the exam** (optional)
3. **Review grades** before publishing
4. **Click "Confirm Publish"**
5. **Students can now see** their grades

#### Unpublish Grades

1. **Click "Manage Grades"**
2. **Find published grades**
3. **Click "Unpublish"** to hide from students
4. **Confirm action**

### Exporting Grades to CSV

#### Export Grades

1. **Click "Export"** button
2. **Choose export format:** CSV
3. **Select date range** (optional)
4. **Click "Download"**
5. **File saves** to your computer

#### Using the CSV File

- Open in Excel or Google Sheets
- Sort and filter grades
- Print for records
- Share with administration

### Viewing Grading Statistics

#### Statistics Dashboard

1. **Click "Statistics"** tab
2. **See grading metrics:**
   - Total submissions graded
   - Average score
   - Highest score
   - Lowest score
   - Grading completion percentage

#### Performance Analysis

1. **View student performance** trends
2. **Identify struggling students**
3. **Recognize high performers**
4. **Plan interventions** as needed

---

## 👨‍🎓 Student User Guide

### Accessing the Student Dashboard

1. **Log in** with your student credentials
2. **You'll see the Student Dashboard** automatically
3. **Dashboard shows:**
   - Available exams
   - Your exam history
   - Your results
   - Performance statistics

### Viewing Available Exams

#### Find Exams

1. **Click "Available Exams"** tab
2. **See list of exams** you can take
3. **Each exam shows:**
   - Exam name
   - Duration
   - Total score
   - Difficulty level
   - Status (Not Started, In Progress, Completed)

#### Filter Exams

1. **Use the search bar** to find specific exams
2. **Filter by difficulty** level
3. **Filter by status**
4. **Sort by date** or name

### Starting and Taking an Exam

#### Start an Exam

1. **Find the exam** you want to take
2. **Click "Start Exam"** button
3. **Read the instructions** carefully
4. **Click "Begin"** to start

#### Exam Interface

Once you start an exam, you'll see:
- **Question display** area (center)
- **Timer** (top right) - shows remaining time
- **Progress bar** (left side) - shows your progress
- **Question navigator** (left side) - jump to any question
- **Navigation buttons** (bottom) - Previous/Next

### Navigating Between Questions

#### Move Between Questions

1. **Click "Next"** button to go to next question
2. **Click "Previous"** button to go to previous question
3. **Click on question number** in the navigator to jump directly
4. **Questions are numbered** 1, 2, 3, etc.

#### Question Status Indicators

- **Green**: Question answered
- **Yellow**: Question marked for review
- **Gray**: Question not answered
- **Blue**: Current question

### Submitting Answers

#### Answer a Question

1. **Read the question** carefully
2. **Select your answer:**
   - **Multiple Choice**: Click the option
   - **True/False**: Click True or False
   - **Short Answer**: Type your answer
   - **Essay**: Type your response

3. **Your answer is auto-saved** (you'll see a checkmark)

#### Mark for Review

1. **Click "Mark for Review"** button
2. **Question is highlighted** in yellow
3. **You can review** before submitting

#### Submit Exam

1. **Answer all questions** (or leave blank if unsure)
2. **Click "Submit Exam"** button
3. **Confirm submission** in the popup
4. **Your exam is submitted** and graded automatically

### Viewing Results and Feedback

#### View Your Results

1. **Go to "My Results"** tab
2. **See list of completed exams**
3. **Click on an exam** to see detailed results

#### Results Display

You'll see:
- **Your score** (e.g., 75/100)
- **Pass/Fail status**
- **Time taken**
- **Submission date**
- **Teacher feedback** (if available)

#### Review Answers

1. **Click "Review Answers"** button
2. **See your answers** for each question
3. **See correct answers** (if available)
4. **View explanations** (if provided)

### Tracking Performance

#### Performance Dashboard

1. **Click "Performance"** tab
2. **See your statistics:**
   - Total exams taken
   - Average score
   - Highest score
   - Lowest score
   - Pass rate

#### Performance Trends

1. **View your score trends** over time
2. **See improvement areas**
3. **Identify strong areas**
4. **Plan study strategy**

---

## 🔧 Troubleshooting Section

### Common Issues and Solutions

#### Issue 1: Cannot Access the Application

**Problem**: Browser shows "Cannot reach server"

**Solutions**:
1. **Check if servers are running:**
   - Backend: Should see "Uvicorn running on http://0.0.0.0:8000"
   - Frontend: Should see "Compiled successfully"

2. **Restart the servers:**
   - Stop both servers (Ctrl+C)
   - Wait 5 seconds
   - Start them again

3. **Check port availability:**
   - Port 3000 (frontend) should be free
   - Port 8000 (backend) should be free

4. **Clear browser cache:**
   - Press Ctrl+Shift+Delete
   - Clear all cache
   - Refresh the page

#### Issue 2: Login Not Working

**Problem**: Cannot log in with credentials

**Solutions**:
1. **Check username and password:**
   - Ensure Caps Lock is off
   - Verify you're using correct credentials
   - Try the test credentials provided

2. **Clear browser cookies:**
   - Press Ctrl+Shift+Delete
   - Clear cookies
   - Try logging in again

3. **Check database:**
   - Ensure SQLite database is initialized
   - Check file exists at: `backend/data/ielts.db`

#### Issue 3: Exam Not Saving

**Problem**: Answers not being saved

**Solutions**:
1. **Check internet connection:**
   - Even though local, ensure network is stable
   - Refresh the page

2. **Check browser console:**
   - Press F12 to open developer tools
   - Look for error messages
   - Report errors to support

3. **Try a different browser:**
   - Chrome, Firefox, Safari, Edge
   - Some browsers work better than others

#### Issue 4: Slow Performance

**Problem**: Application is running slowly

**Solutions**:
1. **Close other applications:**
   - Free up system RAM
   - Close unnecessary browser tabs

2. **Restart servers:**
   - Stop and restart both servers
   - This clears memory

3. **Check system resources:**
   - Open Task Manager (Ctrl+Shift+Esc)
   - Check CPU and RAM usage
   - Ensure you have at least 2GB free RAM

#### Issue 5: Database Errors

**Problem**: "Database error" message appears

**Solutions**:
1. **Restart the backend server:**
   - Stop the backend (Ctrl+C)
   - Wait 5 seconds
   - Start it again

2. **Check database file:**
   - Navigate to: `backend/data/`
   - Ensure `ielts.db` file exists
   - If missing, restart backend to recreate

3. **Clear database (last resort):**
   - Stop the backend
   - Delete `backend/data/ielts.db`
   - Start the backend (it will recreate the database)

### Error Messages and Their Meanings

| Error Message | Meaning | Solution |
|---|---|---|
| "Invalid credentials" | Wrong username or password | Check your login details |
| "Session expired" | Your login session ended | Log in again |
| "Exam not found" | The exam doesn't exist | Refresh the page |
| "Cannot submit exam" | Server error during submission | Try again or restart servers |
| "Database connection failed" | Cannot connect to database | Restart backend server |
| "File upload failed" | Problem uploading file | Check file format and size |
| "Validation error" | Data validation failed | Check your input data |
| "Permission denied" | You don't have access | Check your user role |

### How to Contact Support

**For Technical Issues:**
1. **Check this manual** first
2. **Try the troubleshooting steps** above
3. **Restart the application**
4. **Contact your system administrator**

**Information to Provide:**
- What were you trying to do?
- What error message did you see?
- What steps did you take?
- What browser are you using?
- What operating system?

**Support Contact:**
- Email: support@ieltsplatform.local
- Phone: [Your Support Number]
- Hours: [Your Support Hours]

---

## 📞 Quick Reference

### URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Default Credentials
- **Admin**: admin / admin123
- **Teacher**: teacher / teacher123
- **Student**: student / student123

### File Locations
- **Database**: `backend/data/ielts.db`
- **Uploads**: `backend/uploads/`
- **Frontend Build**: `frontend/build/`

### Keyboard Shortcuts
- **Ctrl+C**: Stop a running server
- **Ctrl+Shift+Delete**: Clear browser cache
- **F12**: Open browser developer tools
- **Ctrl+R**: Refresh page

---

## 📝 Version History

| Version | Date | Changes |
|---|---|---|
| 1.0 | Oct 23, 2025 | Initial release |

---

**End of User Manual**

For the latest updates and additional resources, visit the project repository.


