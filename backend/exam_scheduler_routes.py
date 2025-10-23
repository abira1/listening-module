"""
Exam Scheduler API Routes
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from exam_scheduler import ExamScheduler
from database import Database

router = APIRouter(prefix="/api/scheduler", tags=["exam-scheduler"])

# ============================================
# MODELS
# ============================================

class ScheduleCreate(BaseModel):
    exam_id: str
    start_time: str  # ISO format
    end_time: str    # ISO format
    max_students: Optional[int] = None
    allow_late_start: bool = False
    grace_period_minutes: int = 5

class ScheduleUpdate(BaseModel):
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    max_students: Optional[int] = None
    allow_late_start: Optional[bool] = None
    grace_period_minutes: Optional[int] = None
    status: Optional[str] = None

class EnrollmentRequest(BaseModel):
    student_id: str

# ============================================
# DEPENDENCIES
# ============================================

def get_scheduler(db: Database = Depends(lambda: Database())) -> ExamScheduler:
    return ExamScheduler(db)

def verify_admin(request: Request):
    """Verify admin access"""
    admin_email = request.headers.get('X-Admin-Email')
    if not admin_email:
        raise HTTPException(status_code=401, detail="Admin email required")
    return admin_email

# ============================================
# SCHEDULE MANAGEMENT
# ============================================

@router.post("/schedules", status_code=201)
async def create_schedule(
    schedule_data: ScheduleCreate,
    admin_email: str = Depends(verify_admin),
    scheduler: ExamScheduler = Depends(get_scheduler)
):
    """Create a new exam schedule"""
    try:
        schedule = scheduler.create_schedule(
            exam_id=schedule_data.exam_id,
            start_time=schedule_data.start_time,
            end_time=schedule_data.end_time,
            max_students=schedule_data.max_students,
            allow_late_start=schedule_data.allow_late_start,
            grace_period_minutes=schedule_data.grace_period_minutes
        )
        return schedule
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/schedules/{schedule_id}")
async def get_schedule(
    schedule_id: str,
    scheduler: ExamScheduler = Depends(get_scheduler)
):
    """Get schedule details"""
    schedule = scheduler.get_schedule(schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule

@router.get("/exams/{exam_id}/schedules")
async def get_exam_schedules(
    exam_id: str,
    scheduler: ExamScheduler = Depends(get_scheduler)
):
    """Get all schedules for an exam"""
    schedules = scheduler.get_exam_schedules(exam_id)
    return schedules

@router.put("/schedules/{schedule_id}")
async def update_schedule(
    schedule_id: str,
    schedule_data: ScheduleUpdate,
    admin_email: str = Depends(verify_admin),
    scheduler: ExamScheduler = Depends(get_scheduler)
):
    """Update schedule"""
    try:
        updated = scheduler.update_schedule(
            schedule_id,
            **schedule_data.dict(exclude_unset=True)
        )
        return updated
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/schedules/{schedule_id}")
async def delete_schedule(
    schedule_id: str,
    admin_email: str = Depends(verify_admin),
    scheduler: ExamScheduler = Depends(get_scheduler)
):
    """Delete schedule"""
    try:
        scheduler.delete_schedule(schedule_id)
        return {"message": "Schedule deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============================================
# ENROLLMENT MANAGEMENT
# ============================================

@router.post("/schedules/{schedule_id}/enroll")
async def enroll_student(
    schedule_id: str,
    enrollment: EnrollmentRequest,
    admin_email: str = Depends(verify_admin),
    scheduler: ExamScheduler = Depends(get_scheduler)
):
    """Enroll student in schedule"""
    success, message = scheduler.enroll_student(schedule_id, enrollment.student_id)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"message": message, "success": True}

@router.delete("/schedules/{schedule_id}/enroll/{student_id}")
async def unenroll_student(
    schedule_id: str,
    student_id: str,
    admin_email: str = Depends(verify_admin),
    scheduler: ExamScheduler = Depends(get_scheduler)
):
    """Unenroll student from schedule"""
    scheduler.unenroll_student(schedule_id, student_id)
    return {"message": "Student unenrolled"}

@router.get("/schedules/{schedule_id}/enrollments")
async def get_enrollments(
    schedule_id: str,
    admin_email: str = Depends(verify_admin),
    scheduler: ExamScheduler = Depends(get_scheduler)
):
    """Get all enrollments for a schedule"""
    enrollments = scheduler.get_schedule_enrollments(schedule_id)
    return enrollments

# ============================================
# AVAILABILITY CHECKING
# ============================================

@router.get("/schedules/{schedule_id}/can-take")
async def check_can_take_exam(
    schedule_id: str,
    student_id: str,
    scheduler: ExamScheduler = Depends(get_scheduler)
):
    """Check if student can take exam"""
    can_take, reason = scheduler.can_student_take_exam(schedule_id, student_id)
    return {
        "can_take": can_take,
        "reason": reason,
        "schedule_id": schedule_id,
        "student_id": student_id
    }

@router.post("/schedules/{schedule_id}/start/{student_id}")
async def mark_exam_started(
    schedule_id: str,
    student_id: str,
    scheduler: ExamScheduler = Depends(get_scheduler)
):
    """Mark exam as started for student"""
    scheduler.mark_exam_started(schedule_id, student_id)
    return {"message": "Exam marked as started"}

@router.post("/schedules/{schedule_id}/complete/{student_id}")
async def mark_exam_completed(
    schedule_id: str,
    student_id: str,
    scheduler: ExamScheduler = Depends(get_scheduler)
):
    """Mark exam as completed for student"""
    scheduler.mark_exam_completed(schedule_id, student_id)
    return {"message": "Exam marked as completed"}

# ============================================
# STATISTICS
# ============================================

@router.get("/schedules/{schedule_id}/stats")
async def get_schedule_stats(
    schedule_id: str,
    admin_email: str = Depends(verify_admin),
    scheduler: ExamScheduler = Depends(get_scheduler)
):
    """Get schedule statistics"""
    stats = scheduler.get_schedule_stats(schedule_id)
    if not stats:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return stats

