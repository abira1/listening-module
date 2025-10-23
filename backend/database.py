"""
SQLite Database initialization and management for local authentication system
"""

import sqlite3
import os
import sys
from datetime import datetime
from typing import Optional, List, Dict, Any
import logging

logger = logging.getLogger(__name__)

# Determine database path - use current working directory for EXE, backend directory for development
if getattr(sys, 'frozen', False):
    # Running as EXE
    DATABASE_PATH = os.path.join(os.getcwd(), 'data', 'ielts.db')
else:
    # Running as script
    DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'data', 'ielts.db')

DATA_DIR = os.path.dirname(DATABASE_PATH)


class Database:
    """SQLite Database manager for IELTS platform"""
    
    def __init__(self, db_path: str = DATABASE_PATH):
        self.db_path = db_path
        self._ensure_data_dir()
        self._init_db()
    
    def _ensure_data_dir(self):
        """Create data directory if it doesn't exist"""
        os.makedirs(DATA_DIR, exist_ok=True)
    
    def _init_db(self):
        """Initialize database with schema"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Roles table (for RBAC)
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS roles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    role_name VARCHAR(50) UNIQUE NOT NULL,
                    description TEXT,
                    permissions TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # Insert default roles if they don't exist
            cursor.execute('SELECT COUNT(*) FROM roles')
            if cursor.fetchone()[0] == 0:
                default_roles = [
                    ('admin', 'Administrator with full system access', '["create_questions","edit_questions","delete_questions","create_exams","edit_exams","delete_exams","grade_submissions","publish_results","manage_users","view_analytics"]'),
                    ('teacher', 'Teacher can grade submissions and view analytics', '["grade_submissions","publish_results","view_analytics","view_submissions"]'),
                    ('student', 'Student can take exams and view results', '["take_exams","view_results","view_submissions"]')
                ]
                for role_name, description, permissions in default_roles:
                    cursor.execute('''
                        INSERT INTO roles (role_name, description, permissions)
                        VALUES (?, ?, ?)
                    ''', (role_name, description, permissions))

            # Students table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS students (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id VARCHAR(50) UNIQUE NOT NULL,
                    registration_number VARCHAR(50) UNIQUE NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255),
                    mobile_number VARCHAR(20),
                    institute VARCHAR(255),
                    department VARCHAR(255),
                    roll_number VARCHAR(50),
                    photo_path VARCHAR(500),
                    role VARCHAR(50) DEFAULT 'student',
                    status VARCHAR(20) DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_by VARCHAR(255),
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP,
                    FOREIGN KEY (role) REFERENCES roles(role_name)
                )
            ''')

            # Teachers table (Phase 5)
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS teachers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    teacher_id VARCHAR(50) UNIQUE NOT NULL,
                    full_name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    phone_number VARCHAR(20),
                    subject VARCHAR(255),
                    photo_path VARCHAR(500),
                    bio TEXT,
                    password_hash VARCHAR(500) NOT NULL,
                    role VARCHAR(50) DEFAULT 'teacher',
                    status VARCHAR(20) DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_by VARCHAR(255),
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP,
                    FOREIGN KEY (role) REFERENCES roles(role_name)
                )
            ''')

            # Teacher sessions table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS teacher_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    teacher_id VARCHAR(50) NOT NULL,
                    session_token VARCHAR(500) UNIQUE NOT NULL,
                    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP,
                    ip_address VARCHAR(50),
                    device_info VARCHAR(500),
                    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id)
                )
            ''')
            
            # Student sessions table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS student_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id VARCHAR(50) NOT NULL,
                    session_token VARCHAR(500) UNIQUE NOT NULL,
                    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP,
                    ip_address VARCHAR(50),
                    device_info VARCHAR(500),
                    FOREIGN KEY (user_id) REFERENCES students(user_id)
                )
            ''')
            
            # Permissions table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS permissions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    permission_name VARCHAR(100) UNIQUE NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # Insert default permissions if they don't exist
            cursor.execute('SELECT COUNT(*) FROM permissions')
            if cursor.fetchone()[0] == 0:
                default_permissions = [
                    ('create_questions', 'Create new questions'),
                    ('edit_questions', 'Edit existing questions'),
                    ('delete_questions', 'Delete questions'),
                    ('create_exams', 'Create new exams'),
                    ('edit_exams', 'Edit existing exams'),
                    ('delete_exams', 'Delete exams'),
                    ('grade_submissions', 'Grade student submissions'),
                    ('publish_results', 'Publish exam results'),
                    ('manage_users', 'Manage user accounts and roles'),
                    ('view_analytics', 'View analytics and reports'),
                    ('view_submissions', 'View student submissions'),
                    ('take_exams', 'Take exams'),
                    ('view_results', 'View exam results')
                ]
                for perm_name, description in default_permissions:
                    cursor.execute('''
                        INSERT INTO permissions (permission_name, description)
                        VALUES (?, ?)
                    ''', (perm_name, description))

            # Admin logs table (updated to track role-based actions)
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS admin_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id VARCHAR(50),
                    user_role VARCHAR(50),
                    action VARCHAR(100),
                    resource_type VARCHAR(50),
                    resource_id VARCHAR(50),
                    details TEXT,
                    ip_address VARCHAR(50),
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES students(user_id),
                    FOREIGN KEY (user_role) REFERENCES roles(role_name)
                )
            ''')
            
            # Credentials history table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS student_credentials_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id VARCHAR(50) NOT NULL,
                    old_registration_number VARCHAR(50),
                    new_registration_number VARCHAR(50),
                    reason VARCHAR(255),
                    changed_by VARCHAR(255),
                    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES students(user_id)
                )
            ''')
            
            # Tracks table (Phase 2)
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS tracks (
                    id VARCHAR(50) PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    type VARCHAR(50),
                    description TEXT,
                    total_questions INTEGER DEFAULT 0,
                    total_sections INTEGER DEFAULT 0,
                    status VARCHAR(20) DEFAULT 'draft',
                    created_by VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    metadata TEXT
                )
            ''')

            # Sections table (Phase 2)
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS sections (
                    id VARCHAR(50) PRIMARY KEY,
                    track_id VARCHAR(50) NOT NULL,
                    section_number INTEGER,
                    title VARCHAR(255),
                    description TEXT,
                    question_count INTEGER DEFAULT 0,
                    duration_minutes INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (track_id) REFERENCES tracks(id)
                )
            ''')

            # Questions table (Phase 2)
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS questions (
                    id VARCHAR(50) PRIMARY KEY,
                    section_id VARCHAR(50) NOT NULL,
                    track_id VARCHAR(50) NOT NULL,
                    question_number INTEGER,
                    type VARCHAR(50),
                    payload TEXT,
                    marks INTEGER DEFAULT 1,
                    difficulty VARCHAR(20),
                    metadata TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (section_id) REFERENCES sections(id),
                    FOREIGN KEY (track_id) REFERENCES tracks(id)
                )
            ''')

            # Submissions table (Phase 3)
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS submissions (
                    id VARCHAR(50) PRIMARY KEY,
                    track_id VARCHAR(50) NOT NULL,
                    student_id VARCHAR(50) NOT NULL,
                    status VARCHAR(20) DEFAULT 'in_progress',
                    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP,
                    time_spent_seconds INTEGER DEFAULT 0,
                    total_questions INTEGER DEFAULT 0,
                    total_marks INTEGER DEFAULT 0,
                    obtained_marks INTEGER DEFAULT 0,
                    percentage REAL DEFAULT 0.0,
                    metadata TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (track_id) REFERENCES tracks(id),
                    FOREIGN KEY (student_id) REFERENCES students(user_id)
                )
            ''')

            # Submission answers table (Phase 3)
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS submission_answers (
                    id VARCHAR(50) PRIMARY KEY,
                    submission_id VARCHAR(50) NOT NULL,
                    question_id VARCHAR(50) NOT NULL,
                    question_number INTEGER,
                    question_type VARCHAR(50),
                    student_answer TEXT,
                    correct_answer TEXT,
                    is_correct BOOLEAN DEFAULT 0,
                    marks_obtained INTEGER DEFAULT 0,
                    marks_total INTEGER DEFAULT 1,
                    feedback TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (submission_id) REFERENCES submissions(id),
                    FOREIGN KEY (question_id) REFERENCES questions(id)
                )
            ''')

            # Create indexes for faster queries
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_user_id ON students(user_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_registration ON students(registration_number)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_email ON students(email)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_session_token ON student_sessions(session_token)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_session_user ON student_sessions(user_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_teacher_id ON teachers(teacher_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_teacher_email ON teachers(email)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_teacher_session_token ON teacher_sessions(session_token)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_teacher_session_teacher ON teacher_sessions(teacher_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_track_id ON tracks(id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_section_track ON sections(track_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_question_section ON questions(section_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_question_track ON questions(track_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_submission_track ON submissions(track_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_submission_student ON submissions(student_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_submission_status ON submissions(status)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_answer_submission ON submission_answers(submission_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_answer_question ON submission_answers(question_id)')

            conn.commit()
            logger.info(f"Database initialized at {self.db_path}")
        except Exception as e:
            logger.error(f"Error initializing database: {e}")
            raise
        finally:
            conn.close()
    
    def get_connection(self) -> sqlite3.Connection:
        """Get database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def execute(self, query: str, params: tuple = ()):
        """Execute a query and return cursor for fetching results

        Note: The returned cursor keeps the connection alive internally.
        For SELECT queries, use cursor.fetchall() or cursor.fetchone()
        For INSERT/UPDATE/DELETE, call db.commit() after
        """
        if not hasattr(self, '_current_conn'):
            self._current_conn = None

        # Close previous connection if exists
        if self._current_conn:
            try:
                self._current_conn.close()
            except:
                pass

        # Create new connection
        self._current_conn = self.get_connection()
        cursor = self._current_conn.cursor()
        cursor.execute(query, params)
        return cursor

    def commit(self):
        """Commit changes to database"""
        if hasattr(self, '_current_conn') and self._current_conn:
            try:
                self._current_conn.commit()
            except Exception as e:
                logger.error(f"Error committing transaction: {e}")
                raise

    def get_next_user_id(self) -> str:
        """Generate next User ID (STU-2025-001, STU-2025-002, etc.)"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('SELECT COUNT(*) FROM students')
            count = cursor.fetchone()[0]
            year = datetime.now().year
            next_id = f"STU-{year}-{str(count + 1).zfill(3)}"
            return next_id
        finally:
            conn.close()
    
    def get_next_registration_number(self) -> str:
        """Generate next Registration Number (REG-2025-001, REG-2025-002, etc.)"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('SELECT COUNT(*) FROM students')
            count = cursor.fetchone()[0]
            year = datetime.now().year
            next_reg = f"REG-{year}-{str(count + 1).zfill(3)}"
            return next_reg
        finally:
            conn.close()
    
    def add_student(self, name: str, email: str, mobile: str, institute: str,
                   department: str = '', roll_number: str = '', photo_path: str = '',
                   created_by: str = 'admin') -> Dict[str, Any]:
        """Add new student and generate credentials"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            user_id = self.get_next_user_id()
            registration_number = self.get_next_registration_number()
            now = datetime.now().isoformat()
            
            cursor.execute('''
                INSERT INTO students 
                (user_id, registration_number, name, email, mobile_number, institute, 
                 department, roll_number, photo_path, created_by, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (user_id, registration_number, name, email, mobile, institute,
                  department, roll_number, photo_path, created_by, now, now))
            
            conn.commit()
            
            return {
                'success': True,
                'user_id': user_id,
                'registration_number': registration_number,
                'name': name,
                'email': email,
                'mobile': mobile,
                'institute': institute
            }
        except Exception as e:
            logger.error(f"Error adding student: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            conn.close()
    
    def get_student(self, user_id: str) -> Optional[Dict]:
        """Get student by User ID"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('SELECT * FROM students WHERE user_id = ?', (user_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def get_student_by_email(self, email: str) -> Optional[Dict]:
        """Get student by email"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('SELECT * FROM students WHERE email = ?', (email,))
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()
    
    def get_all_students(self, status: str = None) -> List[Dict]:
        """Get all students, optionally filtered by status"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            if status:
                cursor.execute('SELECT * FROM students WHERE status = ? ORDER BY created_at DESC', (status,))
            else:
                cursor.execute('SELECT * FROM students ORDER BY created_at DESC')
            
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()
    
    def log_admin_action(self, admin_ip: str, action: str, details: str = ''):
        """Log admin action"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('''
                INSERT INTO admin_logs (admin_ip, action, details)
                VALUES (?, ?, ?)
            ''', (admin_ip, action, details))
            conn.commit()
        except Exception as e:
            logger.error(f"Error logging admin action: {e}")
        finally:
            conn.close()

    # ==================== TRACK MANAGEMENT METHODS ====================

    def create_track(self, track_id: str, title: str, track_type: str = None,
                    description: str = '', created_by: str = 'admin', metadata: str = '') -> Dict[str, Any]:
        """Create a new track"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            now = datetime.now().isoformat()
            cursor.execute('''
                INSERT INTO tracks (id, title, type, description, created_by, created_at, updated_at, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (track_id, title, track_type, description, created_by, now, now, metadata))
            conn.commit()
            return {'success': True, 'track_id': track_id}
        except Exception as e:
            logger.error(f"Error creating track: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            conn.close()

    def get_track(self, track_id: str) -> Optional[Dict]:
        """Get track by ID"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('SELECT * FROM tracks WHERE id = ?', (track_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def get_all_tracks(self, status: str = None) -> List[Dict]:
        """Get all tracks, optionally filtered by status"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            if status:
                cursor.execute('SELECT * FROM tracks WHERE status = ? ORDER BY created_at DESC', (status,))
            else:
                cursor.execute('SELECT * FROM tracks ORDER BY created_at DESC')

            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()

    def update_track(self, track_id: str, **kwargs) -> Dict[str, Any]:
        """Update track fields"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            allowed_fields = ['title', 'type', 'description', 'status', 'total_questions', 'total_sections']
            updates = {k: v for k, v in kwargs.items() if k in allowed_fields}

            if not updates:
                return {'success': False, 'error': 'No valid fields to update'}

            updates['updated_at'] = datetime.now().isoformat()
            set_clause = ', '.join([f"{k} = ?" for k in updates.keys()])
            values = list(updates.values()) + [track_id]

            cursor.execute(f'UPDATE tracks SET {set_clause} WHERE id = ?', values)
            conn.commit()
            return {'success': True, 'track_id': track_id}
        except Exception as e:
            logger.error(f"Error updating track: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            conn.close()

    def delete_track(self, track_id: str) -> Dict[str, Any]:
        """Delete track and all related sections and questions"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('DELETE FROM questions WHERE track_id = ?', (track_id,))
            cursor.execute('DELETE FROM sections WHERE track_id = ?', (track_id,))
            cursor.execute('DELETE FROM tracks WHERE id = ?', (track_id,))
            conn.commit()
            return {'success': True}
        except Exception as e:
            logger.error(f"Error deleting track: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            conn.close()

    # ==================== SECTION MANAGEMENT METHODS ====================

    def create_section(self, section_id: str, track_id: str, section_number: int,
                      title: str = '', description: str = '', duration_minutes: int = 0) -> Dict[str, Any]:
        """Create a new section"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            now = datetime.now().isoformat()
            cursor.execute('''
                INSERT INTO sections (id, track_id, section_number, title, description, duration_minutes, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (section_id, track_id, section_number, title, description, duration_minutes, now))
            conn.commit()
            return {'success': True, 'section_id': section_id}
        except Exception as e:
            logger.error(f"Error creating section: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            conn.close()

    def get_sections(self, track_id: str) -> List[Dict]:
        """Get all sections for a track"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('SELECT * FROM sections WHERE track_id = ? ORDER BY section_number', (track_id,))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()

    def update_section(self, section_id: str, **kwargs) -> Dict[str, Any]:
        """Update section fields"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            allowed_fields = ['title', 'description', 'question_count', 'duration_minutes']
            updates = {k: v for k, v in kwargs.items() if k in allowed_fields}

            if not updates:
                return {'success': False, 'error': 'No valid fields to update'}

            set_clause = ', '.join([f"{k} = ?" for k in updates.keys()])
            values = list(updates.values()) + [section_id]

            cursor.execute(f'UPDATE sections SET {set_clause} WHERE id = ?', values)
            conn.commit()
            return {'success': True, 'section_id': section_id}
        except Exception as e:
            logger.error(f"Error updating section: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            conn.close()

    # ==================== QUESTION MANAGEMENT METHODS ====================

    def create_question(self, question_id: str, section_id: str, track_id: str,
                       question_number: int, question_type: str, payload: str,
                       marks: int = 1, difficulty: str = 'medium', metadata: str = '') -> Dict[str, Any]:
        """Create a new question"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            now = datetime.now().isoformat()
            cursor.execute('''
                INSERT INTO questions
                (id, section_id, track_id, question_number, type, payload, marks, difficulty, metadata, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (question_id, section_id, track_id, question_number, question_type, payload, marks, difficulty, metadata, now))
            conn.commit()
            return {'success': True, 'question_id': question_id}
        except Exception as e:
            logger.error(f"Error creating question: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            conn.close()

    def get_question(self, question_id: str) -> Optional[Dict]:
        """Get a single question by ID"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('SELECT * FROM questions WHERE id = ?', (question_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def get_questions(self, section_id: str) -> List[Dict]:
        """Get all questions for a section"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('SELECT * FROM questions WHERE section_id = ? ORDER BY question_number', (section_id,))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()

    def get_all_track_questions(self, track_id: str) -> List[Dict]:
        """Get all questions for a track"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('''
                SELECT q.* FROM questions q
                WHERE q.track_id = ?
                ORDER BY q.question_number
            ''', (track_id,))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()

    def get_questions_by_type(self, track_id: str) -> Dict[str, List[Dict]]:
        """Get all questions for a track grouped by type"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('''
                SELECT type, COUNT(*) as count FROM questions
                WHERE track_id = ?
                GROUP BY type
            ''', (track_id,))

            rows = cursor.fetchall()
            result = {}
            for row in rows:
                result[row['type']] = row['count']
            return result
        finally:
            conn.close()

    # ==================== SUBMISSION MANAGEMENT METHODS (Phase 3) ====================

    def create_submission(self, submission_id: str, track_id: str, student_id: str,
                         total_questions: int = 0, total_marks: int = 0, metadata: str = '') -> Dict[str, Any]:
        """Create a new submission"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            now = datetime.now().isoformat()
            cursor.execute('''
                INSERT INTO submissions
                (id, track_id, student_id, status, started_at, total_questions, total_marks, metadata, created_at)
                VALUES (?, ?, ?, 'in_progress', ?, ?, ?, ?, ?)
            ''', (submission_id, track_id, student_id, now, total_questions, total_marks, metadata, now))
            conn.commit()
            return {'success': True, 'submission_id': submission_id}
        except Exception as e:
            logger.error(f"Error creating submission: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            conn.close()

    def get_submission(self, submission_id: str) -> Optional[Dict]:
        """Get submission by ID"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('SELECT * FROM submissions WHERE id = ?', (submission_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def get_student_submissions(self, student_id: str) -> List[Dict]:
        """Get all submissions for a student"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('''
                SELECT * FROM submissions
                WHERE student_id = ?
                ORDER BY started_at DESC
            ''', (student_id,))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()

    def update_submission(self, submission_id: str, **kwargs) -> Dict[str, Any]:
        """Update submission fields"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            allowed_fields = ['status', 'completed_at', 'time_spent_seconds', 'obtained_marks', 'percentage', 'metadata']
            updates = {k: v for k, v in kwargs.items() if k in allowed_fields}

            if not updates:
                return {'success': False, 'error': 'No valid fields to update'}

            set_clause = ', '.join([f"{k} = ?" for k in updates.keys()])
            values = list(updates.values()) + [submission_id]

            cursor.execute(f'UPDATE submissions SET {set_clause} WHERE id = ?', values)
            conn.commit()
            return {'success': True, 'submission_id': submission_id}
        except Exception as e:
            logger.error(f"Error updating submission: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            conn.close()

    def submit_submission(self, submission_id: str) -> Dict[str, Any]:
        """Mark submission as submitted"""
        now = datetime.now().isoformat()
        return self.update_submission(submission_id, status='submitted', completed_at=now)

    # ==================== RBAC METHODS ====================

    def get_role(self, role_name: str) -> Optional[Dict]:
        """Get role by name"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('SELECT * FROM roles WHERE role_name = ?', (role_name,))
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def get_all_roles(self) -> List[Dict]:
        """Get all roles"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('SELECT * FROM roles ORDER BY role_name')
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()

    def get_permissions_for_role(self, role_name: str) -> List[str]:
        """Get permissions for a role"""
        import json
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('SELECT permissions FROM roles WHERE role_name = ?', (role_name,))
            row = cursor.fetchone()
            if row:
                permissions_json = row[0]
                return json.loads(permissions_json) if permissions_json else []
            return []
        finally:
            conn.close()

    def update_student_role(self, user_id: str, new_role: str) -> Dict[str, Any]:
        """Update student role"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            # Verify role exists
            cursor.execute('SELECT * FROM roles WHERE role_name = ?', (new_role,))
            if not cursor.fetchone():
                return {'success': False, 'error': f'Role {new_role} does not exist'}

            cursor.execute('''
                UPDATE students SET role = ?, updated_at = ?
                WHERE user_id = ?
            ''', (new_role, datetime.now().isoformat(), user_id))

            conn.commit()
            return {'success': True, 'user_id': user_id, 'new_role': new_role}
        except Exception as e:
            logger.error(f"Error updating student role: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            conn.close()

    def log_action(self, user_id: str, user_role: str, action: str, resource_type: str = None,
                   resource_id: str = None, details: str = None, ip_address: str = None) -> Dict[str, Any]:
        """Log an action for audit trail"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('''
                INSERT INTO admin_logs
                (user_id, user_role, action, resource_type, resource_id, details, ip_address, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (user_id, user_role, action, resource_type, resource_id, details, ip_address, datetime.now().isoformat()))

            conn.commit()
            return {'success': True}
        except Exception as e:
            logger.error(f"Error logging action: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            conn.close()

    def get_audit_logs(self, limit: int = 100, offset: int = 0) -> List[Dict]:
        """Get audit logs"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('''
                SELECT * FROM admin_logs
                ORDER BY timestamp DESC
                LIMIT ? OFFSET ?
            ''', (limit, offset))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()

    # ==================== TEACHER MANAGEMENT METHODS (Phase 5) ====================

    def add_teacher(self, teacher_id: str, full_name: str, email: str, phone_number: str = '',
                   subject: str = '', photo_path: str = '', bio: str = '', password_hash: str = '',
                   created_by: str = '') -> Dict[str, Any]:
        """Add a new teacher"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            now = datetime.now().isoformat()
            cursor.execute('''
                INSERT INTO teachers
                (teacher_id, full_name, email, phone_number, subject, photo_path, bio, password_hash, created_by, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (teacher_id, full_name, email, phone_number, subject, photo_path, bio, password_hash, created_by, now, now))
            conn.commit()
            return {'success': True, 'teacher_id': teacher_id}
        except sqlite3.IntegrityError as e:
            logger.error(f"Integrity error adding teacher: {e}")
            return {'success': False, 'error': 'Teacher ID or email already exists'}
        except Exception as e:
            logger.error(f"Error adding teacher: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            conn.close()

    def get_teacher(self, teacher_id: str) -> Optional[Dict]:
        """Get teacher by teacher_id"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('SELECT * FROM teachers WHERE teacher_id = ?', (teacher_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def get_teacher_by_email(self, email: str) -> Optional[Dict]:
        """Get teacher by email"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('SELECT * FROM teachers WHERE email = ?', (email,))
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def get_all_teachers(self, limit: int = 100, offset: int = 0) -> List[Dict]:
        """Get all teachers with pagination"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('''
                SELECT * FROM teachers
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            ''', (limit, offset))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()

    def update_teacher(self, teacher_id: str, **kwargs) -> Dict[str, Any]:
        """Update teacher information"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            allowed_fields = ['full_name', 'email', 'phone_number', 'subject', 'photo_path', 'bio', 'status']
            updates = {k: v for k, v in kwargs.items() if k in allowed_fields}

            if not updates:
                return {'success': False, 'error': 'No valid fields to update'}

            updates['updated_at'] = datetime.now().isoformat()

            set_clause = ', '.join([f'{k} = ?' for k in updates.keys()])
            values = list(updates.values()) + [teacher_id]

            cursor.execute(f'UPDATE teachers SET {set_clause} WHERE teacher_id = ?', values)
            conn.commit()

            if cursor.rowcount == 0:
                return {'success': False, 'error': 'Teacher not found'}

            return {'success': True, 'teacher_id': teacher_id}
        except Exception as e:
            logger.error(f"Error updating teacher: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            conn.close()

    def delete_teacher(self, teacher_id: str) -> Dict[str, Any]:
        """Soft delete teacher (set status to inactive)"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('''
                UPDATE teachers SET status = 'inactive', updated_at = ? WHERE teacher_id = ?
            ''', (datetime.now().isoformat(), teacher_id))
            conn.commit()

            if cursor.rowcount == 0:
                return {'success': False, 'error': 'Teacher not found'}

            return {'success': True, 'teacher_id': teacher_id}
        except Exception as e:
            logger.error(f"Error deleting teacher: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            conn.close()

    def update_teacher_password(self, teacher_id: str, password_hash: str) -> Dict[str, Any]:
        """Update teacher password"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('''
                UPDATE teachers SET password_hash = ?, updated_at = ? WHERE teacher_id = ?
            ''', (password_hash, datetime.now().isoformat(), teacher_id))
            conn.commit()

            if cursor.rowcount == 0:
                return {'success': False, 'error': 'Teacher not found'}

            return {'success': True, 'teacher_id': teacher_id}
        except Exception as e:
            logger.error(f"Error updating password: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            conn.close()

    # ==================== SUBMISSION ANSWER MANAGEMENT METHODS (Phase 3) ====================

    def save_answer(self, answer_id: str, submission_id: str, question_id: str,
                   question_number: int, question_type: str, student_answer: str,
                   correct_answer: str = '', marks_total: int = 1) -> Dict[str, Any]:
        """Save a student's answer"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            now = datetime.now().isoformat()
            cursor.execute('''
                INSERT OR REPLACE INTO submission_answers
                (id, submission_id, question_id, question_number, question_type, student_answer, correct_answer, marks_total, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (answer_id, submission_id, question_id, question_number, question_type, student_answer, correct_answer, marks_total, now))
            conn.commit()
            return {'success': True, 'answer_id': answer_id}
        except Exception as e:
            logger.error(f"Error saving answer: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            conn.close()

    def get_submission_answers(self, submission_id: str) -> List[Dict]:
        """Get all answers for a submission"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('''
                SELECT * FROM submission_answers
                WHERE submission_id = ?
                ORDER BY question_number
            ''', (submission_id,))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()

    def update_answer(self, answer_id: str, **kwargs) -> Dict[str, Any]:
        """Update answer fields"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            allowed_fields = ['student_answer', 'is_correct', 'marks_obtained', 'feedback']
            updates = {k: v for k, v in kwargs.items() if k in allowed_fields}

            if not updates:
                return {'success': False, 'error': 'No valid fields to update'}

            set_clause = ', '.join([f"{k} = ?" for k in updates.keys()])
            values = list(updates.values()) + [answer_id]

            cursor.execute(f'UPDATE submission_answers SET {set_clause} WHERE id = ?', values)
            conn.commit()
            return {'success': True, 'answer_id': answer_id}
        except Exception as e:
            logger.error(f"Error updating answer: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            conn.close()

    def get_teacher_by_id(self, teacher_id: str) -> Optional[Dict]:
        """Get teacher by teacher_id (alias for get_teacher)"""
        return self.get_teacher(teacher_id)

    def get_pending_submissions_for_teacher(self, teacher_id: str) -> List[Dict]:
        """Get pending submissions for a teacher"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            # Get submissions that are pending grading
            cursor.execute('''
                SELECT
                    s.id as submission_id,
                    s.student_id,
                    st.name as student_name,
                    s.exam_id,
                    e.title as exam_title,
                    s.submitted_at,
                    s.status
                FROM submissions s
                LEFT JOIN students st ON s.student_id = st.user_id
                LEFT JOIN exams e ON s.exam_id = e.id
                WHERE s.status = 'submitted' OR s.status = 'pending'
                ORDER BY s.submitted_at DESC
                LIMIT 100
            ''')
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"Error getting pending submissions: {e}")
            return []
        finally:
            conn.close()

    def get_graded_submissions_for_teacher(self, teacher_id: str) -> List[Dict]:
        """Get graded submissions for a teacher"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            # Get submissions that have been graded
            cursor.execute('''
                SELECT
                    s.id as submission_id,
                    s.student_id,
                    st.name as student_name,
                    s.exam_id,
                    e.title as exam_title,
                    s.submitted_at,
                    s.graded_at,
                    s.status,
                    s.score
                FROM submissions s
                LEFT JOIN students st ON s.student_id = st.user_id
                LEFT JOIN exams e ON s.exam_id = e.id
                WHERE s.status = 'graded' OR s.status = 'published'
                ORDER BY s.graded_at DESC
                LIMIT 100
            ''')
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"Error getting graded submissions: {e}")
            return []
        finally:
            conn.close()

    def get_students_for_teacher(self, teacher_id: str) -> List[Dict]:
        """Get list of students for a teacher"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            # Get all students (in a real system, this would be filtered by teacher assignment)
            cursor.execute('''
                SELECT
                    user_id as student_id,
                    name as full_name,
                    email,
                    registration_number,
                    status
                FROM students
                WHERE status = 'active'
                ORDER BY name ASC
                LIMIT 1000
            ''')
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"Error getting students: {e}")
            return []
        finally:
            conn.close()

    # ==================== STUDENT SESSION MANAGEMENT METHODS ====================

    def get_student_session(self, session_token: str) -> Optional[Dict]:
        """Get student session by token"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('SELECT * FROM student_sessions WHERE session_token = ?', (session_token,))
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def create_student_session(self, user_id: str, session_token: str, expires_at: str,
                              ip_address: str = '', device_info: str = '') -> Dict[str, Any]:
        """Create a new student session"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            now = datetime.now().isoformat()
            cursor.execute('''
                INSERT INTO student_sessions
                (user_id, session_token, login_time, last_activity, expires_at, ip_address, device_info)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (user_id, session_token, now, now, expires_at, ip_address, device_info))
            conn.commit()
            return {'success': True, 'session_token': session_token}
        except Exception as e:
            logger.error(f"Error creating student session: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            conn.close()

    def delete_student_session(self, session_token: str) -> Dict[str, Any]:
        """Delete a student session"""
        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute('DELETE FROM student_sessions WHERE session_token = ?', (session_token,))
            conn.commit()
            return {'success': True}
        except Exception as e:
            logger.error(f"Error deleting student session: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            conn.close()


# Global database instance
db = Database()

