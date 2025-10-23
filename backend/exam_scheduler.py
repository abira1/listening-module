"""
Exam Scheduler - Manages exam scheduling, availability windows, and student access
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from database import Database
import logging

logger = logging.getLogger(__name__)


class ExamScheduler:
    """Manages exam scheduling and availability"""
    
    def __init__(self, db: Database):
        self.db = db
    
    # ============================================
    # SCHEDULE MANAGEMENT
    # ============================================
    
    def create_schedule(
        self,
        exam_id: str,
        start_time: str,
        end_time: str,
        max_students: Optional[int] = None,
        allow_late_start: bool = False,
        grace_period_minutes: int = 5
    ) -> Dict[str, Any]:
        """
        Create an exam schedule
        
        Args:
            exam_id: ID of the exam
            start_time: ISO format start time
            end_time: ISO format end time
            max_students: Maximum students allowed (None = unlimited)
            allow_late_start: Allow students to start after scheduled time
            grace_period_minutes: Minutes after start time to allow late starts
        
        Returns:
            Schedule record
        """
        schedule = {
            'id': f'sch_{exam_id}_{datetime.utcnow().timestamp()}',
            'exam_id': exam_id,
            'start_time': start_time,
            'end_time': end_time,
            'max_students': max_students,
            'allow_late_start': allow_late_start,
            'grace_period_minutes': grace_period_minutes,
            'enrolled_students': 0,
            'status': 'scheduled',  # scheduled, active, completed
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Save to database
        self.db.execute(
            '''INSERT INTO exam_schedules 
               (id, exam_id, start_time, end_time, max_students, allow_late_start, 
                grace_period_minutes, enrolled_students, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (schedule['id'], exam_id, start_time, end_time, max_students, 
             allow_late_start, grace_period_minutes, 0, 'scheduled',
             schedule['created_at'], schedule['updated_at'])
        )
        
        logger.info(f"Created schedule {schedule['id']} for exam {exam_id}")
        return schedule
    
    def get_schedule(self, schedule_id: str) -> Optional[Dict[str, Any]]:
        """Get schedule by ID"""
        result = self.db.execute(
            'SELECT * FROM exam_schedules WHERE id = ?',
            (schedule_id,)
        ).fetchone()
        
        if result:
            return dict(result)
        return None
    
    def get_exam_schedules(self, exam_id: str) -> List[Dict[str, Any]]:
        """Get all schedules for an exam"""
        results = self.db.execute(
            'SELECT * FROM exam_schedules WHERE exam_id = ? ORDER BY start_time',
            (exam_id,)
        ).fetchall()
        
        return [dict(row) for row in results]
    
    def update_schedule(
        self,
        schedule_id: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Update schedule fields"""
        allowed_fields = {
            'start_time', 'end_time', 'max_students', 'allow_late_start',
            'grace_period_minutes', 'status'
        }
        
        updates = {k: v for k, v in kwargs.items() if k in allowed_fields}
        updates['updated_at'] = datetime.utcnow().isoformat()
        
        set_clause = ', '.join([f'{k} = ?' for k in updates.keys()])
        values = list(updates.values()) + [schedule_id]
        
        self.db.execute(
            f'UPDATE exam_schedules SET {set_clause} WHERE id = ?',
            values
        )
        
        logger.info(f"Updated schedule {schedule_id}")
        return self.get_schedule(schedule_id)
    
    def delete_schedule(self, schedule_id: str) -> bool:
        """Delete a schedule"""
        self.db.execute(
            'DELETE FROM exam_schedules WHERE id = ?',
            (schedule_id,)
        )
        logger.info(f"Deleted schedule {schedule_id}")
        return True
    
    # ============================================
    # STUDENT ENROLLMENT
    # ============================================
    
    def enroll_student(
        self,
        schedule_id: str,
        student_id: str
    ) -> Tuple[bool, str]:
        """
        Enroll a student in a schedule
        
        Returns:
            (success, message)
        """
        schedule = self.get_schedule(schedule_id)
        if not schedule:
            return False, "Schedule not found"
        
        # Check if already enrolled
        existing = self.db.execute(
            'SELECT * FROM schedule_enrollments WHERE schedule_id = ? AND student_id = ?',
            (schedule_id, student_id)
        ).fetchone()
        
        if existing:
            return False, "Student already enrolled"
        
        # Check max students
        if schedule['max_students']:
            if schedule['enrolled_students'] >= schedule['max_students']:
                return False, "Schedule is full"
        
        # Enroll student
        enrollment = {
            'id': f'enr_{schedule_id}_{student_id}',
            'schedule_id': schedule_id,
            'student_id': student_id,
            'enrolled_at': datetime.utcnow().isoformat(),
            'status': 'enrolled'  # enrolled, started, completed
        }
        
        self.db.execute(
            '''INSERT INTO schedule_enrollments 
               (id, schedule_id, student_id, enrolled_at, status)
               VALUES (?, ?, ?, ?, ?)''',
            (enrollment['id'], schedule_id, student_id, 
             enrollment['enrolled_at'], 'enrolled')
        )
        
        # Update enrolled count
        self.db.execute(
            'UPDATE exam_schedules SET enrolled_students = enrolled_students + 1 WHERE id = ?',
            (schedule_id,)
        )
        
        logger.info(f"Enrolled student {student_id} in schedule {schedule_id}")
        return True, "Student enrolled successfully"
    
    def unenroll_student(self, schedule_id: str, student_id: str) -> bool:
        """Unenroll a student from a schedule"""
        self.db.execute(
            'DELETE FROM schedule_enrollments WHERE schedule_id = ? AND student_id = ?',
            (schedule_id, student_id)
        )
        
        self.db.execute(
            'UPDATE exam_schedules SET enrolled_students = enrolled_students - 1 WHERE id = ?',
            (schedule_id,)
        )
        
        logger.info(f"Unenrolled student {student_id} from schedule {schedule_id}")
        return True
    
    def get_schedule_enrollments(self, schedule_id: str) -> List[Dict[str, Any]]:
        """Get all students enrolled in a schedule"""
        results = self.db.execute(
            '''SELECT se.*, s.name, s.email FROM schedule_enrollments se
               JOIN students s ON se.student_id = s.user_id
               WHERE se.schedule_id = ?
               ORDER BY se.enrolled_at''',
            (schedule_id,)
        ).fetchall()
        
        return [dict(row) for row in results]
    
    # ============================================
    # AVAILABILITY CHECKING
    # ============================================
    
    def can_student_take_exam(
        self,
        schedule_id: str,
        student_id: str
    ) -> Tuple[bool, str]:
        """
        Check if student can take exam at this time
        
        Returns:
            (can_take, reason)
        """
        schedule = self.get_schedule(schedule_id)
        if not schedule:
            return False, "Schedule not found"
        
        # Check enrollment
        enrollment = self.db.execute(
            'SELECT * FROM schedule_enrollments WHERE schedule_id = ? AND student_id = ?',
            (schedule_id, student_id)
        ).fetchone()
        
        if not enrollment:
            return False, "Student not enrolled in this schedule"
        
        # Check if already started
        if enrollment['status'] == 'started':
            return False, "Exam already started"
        
        if enrollment['status'] == 'completed':
            return False, "Exam already completed"
        
        # Check time window
        now = datetime.utcnow()
        start_time = datetime.fromisoformat(schedule['start_time'])
        end_time = datetime.fromisoformat(schedule['end_time'])
        
        if now < start_time:
            time_until = (start_time - now).total_seconds() / 60
            return False, f"Exam starts in {int(time_until)} minutes"
        
        if now > end_time:
            return False, "Exam time has ended"
        
        # Check late start grace period
        if schedule['allow_late_start']:
            grace_end = start_time + timedelta(minutes=schedule['grace_period_minutes'])
            if now > grace_end:
                return False, "Late start period has ended"
        
        return True, "Student can take exam"
    
    def mark_exam_started(self, schedule_id: str, student_id: str) -> bool:
        """Mark exam as started for student"""
        self.db.execute(
            '''UPDATE schedule_enrollments 
               SET status = 'started' 
               WHERE schedule_id = ? AND student_id = ?''',
            (schedule_id, student_id)
        )
        return True
    
    def mark_exam_completed(self, schedule_id: str, student_id: str) -> bool:
        """Mark exam as completed for student"""
        self.db.execute(
            '''UPDATE schedule_enrollments 
               SET status = 'completed' 
               WHERE schedule_id = ? AND student_id = ?''',
            (schedule_id, student_id)
        )
        return True
    
    # ============================================
    # STATISTICS
    # ============================================
    
    def get_schedule_stats(self, schedule_id: str) -> Dict[str, Any]:
        """Get statistics for a schedule"""
        schedule = self.get_schedule(schedule_id)
        if not schedule:
            return {}
        
        enrollments = self.db.execute(
            '''SELECT status, COUNT(*) as count FROM schedule_enrollments 
               WHERE schedule_id = ? GROUP BY status''',
            (schedule_id,)
        ).fetchall()
        
        stats = {
            'schedule_id': schedule_id,
            'total_enrolled': schedule['enrolled_students'],
            'max_capacity': schedule['max_students'],
            'status_breakdown': {row['status']: row['count'] for row in enrollments}
        }
        
        return stats

