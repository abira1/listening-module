"""
Firebase Realtime Database Service
Handles all database operations for exams, questions, sections, and submissions
"""

import firebase_admin
from firebase_admin import db
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import os
import json

# Initialize Firebase Admin SDK
def init_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        # Check if already initialized
        firebase_admin.get_app()
    except ValueError:
        # Not initialized, so initialize it
        # Use service account key from environment or file
        service_account_key = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY')

        try:
            if service_account_key:
                # Parse JSON from environment variable
                cred_dict = json.loads(service_account_key)
                cred = firebase_admin.credentials.Certificate(cred_dict)
            else:
                # Try to load from file - use multiple paths
                cred = None
                possible_paths = [
                    'firebase-key.json',
                    os.path.join(os.path.dirname(__file__), 'firebase-key.json'),
                    '../firebase-key.json',
                    os.path.join(os.path.dirname(__file__), '..', 'firebase-key.json'),
                ]

                for path in possible_paths:
                    if os.path.exists(path):
                        try:
                            cred = firebase_admin.credentials.Certificate(path)
                            print(f"✅ Firebase credentials loaded from: {path}")
                            break
                        except Exception as e:
                            print(f"Failed to load from {path}: {e}")
                            continue

                if cred is None:
                    # Use default credentials (for local development)
                    print("Using Application Default Credentials")
                    cred = firebase_admin.credentials.ApplicationDefault()

            firebase_admin.initialize_app(cred, {
                'databaseURL': os.environ.get('FIREBASE_DATABASE_URL',
                                             'https://ielts-listening-module-default-rtdb.firebaseio.com')
            })
            print("✅ Firebase initialized successfully!")
        except Exception as e:
            print(f"Warning: Firebase initialization failed: {e}")
            print("Firebase operations may not work without proper credentials.")

# Initialize on import
init_firebase()

class FirebaseService:
    """Service for Firebase Realtime Database operations"""

    # ============================================
    # EXAM OPERATIONS
    # ============================================

    @staticmethod
    def create_exam(exam_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new exam"""
        exam_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        exam = {
            'id': exam_id,
            'title': exam_data.get('title', 'Untitled Exam'),
            'description': exam_data.get('description', ''),
            'exam_type': exam_data.get('exam_type', 'listening'),
            'audio_url': exam_data.get('audio_url'),
            'audio_source_method': exam_data.get('audio_source_method'),
            'loop_audio': exam_data.get('loop_audio', False),
            'duration_seconds': exam_data.get('duration_seconds', 1800),
            'published': exam_data.get('published', False),
            'created_at': now,
            'updated_at': now,
            'is_demo': exam_data.get('is_demo', False),
            'question_count': 0,
            'submission_count': 0,
            'is_active': exam_data.get('is_active', False),
            'is_visible': exam_data.get('is_visible', True),
        }

        db.reference(f'exams/{exam_id}').set(exam)

        # Create 4 sections for the exam
        for i in range(1, 5):
            section_id = str(uuid.uuid4())
            section = {
                'id': section_id,
                'exam_id': exam_id,
                'index': i,
                'title': f'Section {i}',
            }
            db.reference(f'sections/{section_id}').set(section)

        return exam

    @staticmethod
    def get_exam(exam_id: str) -> Optional[Dict[str, Any]]:
        """Get exam by ID"""
        snapshot = db.reference(f'exams/{exam_id}').get()
        return snapshot

    @staticmethod
    def get_all_exams() -> List[Dict[str, Any]]:
        """Get all exams"""
        snapshot = db.reference('exams').get()
        if not snapshot:
            return []
        return list(snapshot.values()) if isinstance(snapshot, dict) else []

    @staticmethod
    def get_published_exams() -> List[Dict[str, Any]]:
        """Get all published exams"""
        all_exams = FirebaseService.get_all_exams()
        return [exam for exam in all_exams if exam.get('published', False)]

    @staticmethod
    def update_exam(exam_id: str, exam_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update exam"""
        exam_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        db.reference(f'exams/{exam_id}').update(exam_data)
        return FirebaseService.get_exam(exam_id)

    @staticmethod
    def delete_exam(exam_id: str) -> bool:
        """Delete exam and related data"""
        exam = FirebaseService.get_exam(exam_id)
        if exam and exam.get('is_demo'):
            raise ValueError('Demo exams cannot be deleted')

        # Delete exam
        db.reference(f'exams/{exam_id}').delete()

        # Delete sections
        sections = FirebaseService.get_sections_by_exam(exam_id)
        for section in sections:
            db.reference(f'sections/{section["id"]}').delete()

            # Delete questions
            questions = FirebaseService.get_questions_by_section(section['id'])
            for question in questions:
                db.reference(f'questions/{question["id"]}').delete()

        return True

    # ============================================
    # SECTION OPERATIONS
    # ============================================

    @staticmethod
    def get_sections_by_exam(exam_id: str) -> List[Dict[str, Any]]:
        """Get all sections for an exam"""
        snapshot = db.reference('sections').get()
        if not snapshot:
            return []

        sections = [s for s in snapshot.values() if s.get('exam_id') == exam_id]
        return sorted(sections, key=lambda x: x.get('index', 0))

    @staticmethod
    def get_section(section_id: str) -> Optional[Dict[str, Any]]:
        """Get section by ID"""
        return db.reference(f'sections/{section_id}').get()

    @staticmethod
    def update_section(section_id: str, section_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update section"""
        db.reference(f'sections/{section_id}').update(section_data)
        return FirebaseService.get_section(section_id)

    # ============================================
    # QUESTION OPERATIONS
    # ============================================

    @staticmethod
    def create_question(question_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new question"""
        section = FirebaseService.get_section(question_data['section_id'])
        if not section:
            raise ValueError('Section not found')

        # Check max questions per section
        section_questions = FirebaseService.get_questions_by_section(section['id'])
        if len(section_questions) >= 10:
            raise ValueError('Maximum of 10 questions per section')

        question_id = str(uuid.uuid4())
        question = {
            'id': question_id,
            'exam_id': question_data['exam_id'],
            'section_id': question_data['section_id'],
            'index': question_data.get('index', len(section_questions) + 1),
            'type': question_data.get('type', 'single_answer'),
            'payload': question_data.get('payload', {}),
            'marks': question_data.get('marks', 1),
            'created_by': question_data.get('created_by', 'admin'),
            'is_demo': question_data.get('is_demo', False),
        }

        db.reference(f'questions/{question_id}').set(question)

        # Update question count
        exam = FirebaseService.get_exam(question_data['exam_id'])
        if exam:
            FirebaseService.update_exam(question_data['exam_id'], {
                'question_count': exam.get('question_count', 0) + 1
            })

        return question

    @staticmethod
    def get_question(question_id: str) -> Optional[Dict[str, Any]]:
        """Get question by ID"""
        return db.reference(f'questions/{question_id}').get()

    @staticmethod
    def get_questions_by_section(section_id: str) -> List[Dict[str, Any]]:
        """Get all questions for a section"""
        snapshot = db.reference('questions').get()
        if not snapshot:
            return []

        questions = [q for q in snapshot.values() if q.get('section_id') == section_id]
        return sorted(questions, key=lambda x: x.get('index', 0))

    @staticmethod
    def update_question(question_id: str, question_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update question"""
        db.reference(f'questions/{question_id}').update(question_data)
        return FirebaseService.get_question(question_id)

    @staticmethod
    def delete_question(question_id: str) -> bool:
        """Delete question"""
        question = FirebaseService.get_question(question_id)
        if question and question.get('is_demo'):
            raise ValueError('Demo questions cannot be deleted')

        db.reference(f'questions/{question_id}').delete()

        # Update question count
        if question:
            exam = FirebaseService.get_exam(question['exam_id'])
            if exam and exam.get('question_count', 0) > 0:
                FirebaseService.update_exam(question['exam_id'], {
                    'question_count': exam['question_count'] - 1
                })

        return True

    # ============================================
    # SUBMISSION OPERATIONS
    # ============================================

    @staticmethod
    def create_submission(submission_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new submission"""
        submission_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        submission = {
            'id': submission_id,
            'exam_id': submission_data['exam_id'],
            'user_id_or_session': submission_data.get('user_id_or_session', str(uuid.uuid4())),
            'started_at': now,
            'answers': submission_data.get('answers', {}),
            'progress_percent': 0,
            'last_playback_time': 0,
        }

        db.reference(f'submissions/{submission_id}').set(submission)

        # Update submission count
        exam = FirebaseService.get_exam(submission_data['exam_id'])
        if exam:
            FirebaseService.update_exam(submission_data['exam_id'], {
                'submission_count': exam.get('submission_count', 0) + 1
            })

        return submission

    @staticmethod
    def get_submission(submission_id: str) -> Optional[Dict[str, Any]]:
        """Get submission by ID"""
        return db.reference(f'submissions/{submission_id}').get()

    @staticmethod
    def update_submission(submission_id: str, submission_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update submission"""
        db.reference(f'submissions/{submission_id}').update(submission_data)
        return FirebaseService.get_submission(submission_id)


    # ============================================
    # TRACK OPERATIONS (Migrated from MongoDB)
    # ============================================

    @staticmethod
    def create_track(track_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new track"""
        track_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        track = {
            'id': track_id,
            'track_type': track_data.get('track_type', 'listening'),
            'title': track_data.get('title', 'Untitled Track'),
            'description': track_data.get('description', ''),
            'exam_id': track_data.get('exam_id'),
            'status': track_data.get('status', 'draft'),
            'created_at': now,
            'updated_at': now,
            'created_by': track_data.get('created_by', 'admin'),
            'metadata': track_data.get('metadata', {}),
            'tags': track_data.get('tags', []),
            'source': track_data.get('source', 'manual'),
        }

        db.reference(f'tracks/{track_id}').set(track)
        return track

    @staticmethod
    def get_track(track_id: str) -> Optional[Dict[str, Any]]:
        """Get track by ID"""
        return db.reference(f'tracks/{track_id}').get()

    @staticmethod
    def get_all_tracks(track_type: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all tracks with optional filtering"""
        tracks_ref = db.reference('tracks')
        all_tracks = tracks_ref.get()

        if not all_tracks:
            return []

        tracks = list(all_tracks.values()) if isinstance(all_tracks, dict) else []

        # Filter by track_type if provided
        if track_type:
            tracks = [t for t in tracks if t.get('track_type') == track_type]

        # Filter by status if provided
        if status:
            tracks = [t for t in tracks if t.get('status') == status]

        # Sort by created_at descending
        tracks.sort(key=lambda x: x.get('created_at', ''), reverse=True)

        return tracks

    @staticmethod
    def update_track(track_id: str, track_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update track"""
        track_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        db.reference(f'tracks/{track_id}').update(track_data)
        return FirebaseService.get_track(track_id)

    @staticmethod
    def delete_track(track_id: str) -> bool:
        """Delete track"""
        db.reference(f'tracks/{track_id}').delete()
        return True

