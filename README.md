# IELTS Listening Test Platform

A comprehensive web application for administering IELTS Listening tests with audio playback, multiple question types, and automated submission tracking.

## 🎯 Features

- **Full-Featured Listening Test Interface**
  - Audio playback with automatic timing (31:24 + 2 min review)
  - Real-time countdown timer
  - Section-based navigation
  - Progress tracking
  - Answer submission to database

- **Multiple Question Types**
  - Short answer / Fill-in-the-blank
  - Multiple choice (3-4 options)
  - Map labeling with images
  - Diagram labeling with images

- **Admin Panel**
  - Create and manage exams
  - Upload audio files (local or URL)
  - Question management
  - Publish/unpublish tests
  - View submissions

- **Audio File Management**
  - Local file uploads stored in `/listening_tracks`
  - External URL support
  - Automatic file validation
  - Support for MP3, WAV, M4A, OGG, FLAC formats

## 📁 Project Structure

```
/app/
├── backend/                    # FastAPI backend
│   ├── server.py              # Main API server
│   ├── init_ielts_test.py    # Initialize default IELTS test
│   ├── .env                   # Backend environment variables
│   └── requirements.txt       # Python dependencies
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── admin/         # Admin panel components
│   │   │   ├── common/        # Shared components
│   │   │   ├── ExamTest.jsx   # Test taking flow
│   │   │   ├── ListeningTest.jsx  # Main test interface
│   │   │   └── Homepage.jsx   # Published tests list
│   │   ├── services/          # API services
│   │   │   ├── BackendService.js  # Backend API calls
│   │   │   └── AudioService.js    # Audio upload service
│   │   └── App.js             # Main app router
│   ├── .env                   # Frontend environment variables
│   └── package.json           # Node dependencies
├── listening_tracks/          # Audio file storage
├── scripts/                   # Utility scripts
│   └── create_ielts_test.py  # Script to create sample tests
└── README.md                  # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and Yarn
- Python 3.8+
- MongoDB
- Supervisor (for process management)

### Installation

1. **Install Dependencies**

```bash
# Backend
cd /app/backend
pip install -r requirements.txt

# Frontend
cd /app/frontend
yarn install
```

2. **Configure Environment Variables**

Backend `.env`:
```bash
MONGO_URL=mongodb://localhost:27017
DB_NAME=ielts_platform
CORS_ORIGINS=*
```

Frontend `.env`:
```bash
REACT_APP_BACKEND_URL=https://your-domain.com
```

3. **Initialize Default Test**

```bash
cd /app/backend
python3 init_ielts_test.py
```

4. **Start Services**

```bash
sudo supervisorctl restart all
```

## 📝 Managing Tests

### Admin Access

- Navigate to `/admin/login`
- Default credentials: `admin@example.com` / `password`

### Creating a New Test

1. **From Admin Panel:**
   - Go to Test Management
   - Click "Create Test"
   - Fill in test details (title, description, duration)
   - Upload audio file or provide URL
   - Add questions to sections
   - Publish test

2. **Programmatically:**

```python
# See /app/scripts/create_ielts_test.py for reference
python3 create_ielts_test.py
```

## 🎵 Audio File Management

### Uploading Audio Files

The platform stores all uploaded audio files in `/app/listening_tracks/` directory.

#### Via Admin Panel:
1. Navigate to Test Management
2. Click on test name
3. Click "Upload Audio" button
4. Choose "Upload File" tab
5. Select audio file (MP3, WAV, M4A, OGG, FLAC)
6. File uploads to `/listening_tracks/` automatically
7. Audio URL is saved to database

#### Via API:
```bash
curl -X POST "http://localhost:8001/api/upload-audio" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/audio.mp3"
```

Response:
```json
{
  "message": "Audio file uploaded successfully",
  "filename": "unique-id.mp3",
  "audio_url": "/listening_tracks/unique-id.mp3",
  "size": 15728640
}
```

### Supported Audio Formats

- MP3 (`.mp3`)
- WAV (`.wav`)
- M4A (`.m4a`)
- OGG (`.ogg`)
- FLAC (`.flac`)

### Audio File Storage

- **Location:** `/app/listening_tracks/`
- **Naming:** Files are renamed with unique IDs to prevent conflicts
- **Access:** Files are served as static files via `/listening_tracks/{filename}`
- **Size Limit:** Configurable (default: no limit, but consider server storage)

### External Audio URLs

You can also use external audio URLs instead of uploading:
1. Choose "External URL" tab in upload dialog
2. Paste direct URL to audio file
3. URL is validated before saving

## 🔧 API Endpoints

### Exams
- `GET /api/exams` - List all exams
- `GET /api/exams/published` - List published exams
- `GET /api/exams/{exam_id}` - Get exam details
- `GET /api/exams/{exam_id}/full` - Get exam with sections and questions
- `POST /api/exams` - Create new exam
- `PUT /api/exams/{exam_id}` - Update exam
- `DELETE /api/exams/{exam_id}` - Delete exam

### Questions
- `GET /api/sections/{section_id}/questions` - Get questions for section
- `GET /api/questions/{question_id}` - Get single question
- `POST /api/questions` - Create question
- `PUT /api/questions/{question_id}` - Update question
- `DELETE /api/questions/{question_id}` - Delete question

### Audio
- `POST /api/upload-audio` - Upload audio file

### Submissions
- `POST /api/submissions` - Submit test answers
- `GET /api/submissions/{submission_id}` - Get submission
- `GET /api/exams/{exam_id}/submissions` - List exam submissions

## 📊 Database Schema

### Collections

**exams**
```javascript
{
  id: String,
  title: String,
  description: String,
  audio_url: String,
  audio_source_method: String, // 'local' or 'url'
  loop_audio: Boolean,
  duration_seconds: Number,
  published: Boolean,
  created_at: String,
  updated_at: String,
  is_demo: Boolean,
  question_count: Number,
  submission_count: Number
}
```

**sections**
```javascript
{
  id: String,
  exam_id: String,
  index: Number,
  title: String
}
```

**questions**
```javascript
{
  id: String,
  exam_id: String,
  section_id: String,
  index: Number,
  type: String, // 'short_answer', 'multiple_choice', 'map_labeling', 'diagram_labeling'
  payload: Object, // Question-specific data
  marks: Number,
  created_by: String,
  is_demo: Boolean
}
```

**submissions**
```javascript
{
  id: String,
  exam_id: String,
  user_id_or_session: String,
  started_at: String,
  finished_at: String,
  answers: Object, // { "1": "answer1", "2": "B", ... }
  progress_percent: Number,
  last_playback_time: Number
}
```

## 🎓 IELTS Listening Practice Test 1

A complete IELTS Listening test is pre-installed with the application:

- **Test ID:** `ielts-listening-practice-test-1`
- **Duration:** 33:24 (31:24 audio + 2:00 review)
- **Sections:** 4
- **Questions:** 40
- **Status:** Published and ready for use

### Test Structure:

- **Section 1 (Q1-10):** Job information - Note completion
- **Section 2 (Q11-20):** Ferry facilities - Map labeling + Multiple choice
- **Section 3 (Q21-30):** University presentation - Multiple choice + Note completion
- **Section 4 (Q31-40):** Nuclear energy - Diagram labeling + Note completion

## 🔒 Security Notes

- Change default admin credentials in production
- Configure CORS_ORIGINS properly
- Use HTTPS in production
- Implement rate limiting for file uploads
- Validate file sizes and types
- Regularly backup the database and listening_tracks directory

## 🛠️ Maintenance

### Backing Up Audio Files

```bash
# Backup listening tracks
tar -czf listening_tracks_backup_$(date +%Y%m%d).tar.gz /app/listening_tracks/

# Restore
tar -xzf listening_tracks_backup_YYYYMMDD.tar.gz -C /
```

### Cleaning Up Unused Audio Files

```bash
# List all audio files
ls -lh /app/listening_tracks/

# Remove specific file (use with caution)
rm /app/listening_tracks/filename.mp3
```

### Re-initializing Default Test

```bash
# This will only create the test if it doesn't exist
cd /app/backend
python3 init_ielts_test.py
```

## 📞 Support

For issues or questions, refer to the application logs:

```bash
# Backend logs
tail -f /var/log/supervisor/backend.*.log

# Frontend logs
tail -f /var/log/supervisor/frontend.*.log

# Check service status
sudo supervisorctl status
```

## 📄 License

This project is proprietary software. All rights reserved.

---

**Built with:** FastAPI, React, MongoDB, and ❤️
