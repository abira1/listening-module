"""
Notification Service - Send notifications to users
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

logger = logging.getLogger(__name__)


class NotificationType(Enum):
    """Notification types"""
    EXAM_SCHEDULED = "exam_scheduled"
    EXAM_REMINDER = "exam_reminder"
    SUBMISSION_RECEIVED = "submission_received"
    GRADING_COMPLETE = "grading_complete"
    SCORE_AVAILABLE = "score_available"
    PLAGIARISM_ALERT = "plagiarism_alert"
    SYSTEM_ALERT = "system_alert"
    ADMIN_ALERT = "admin_alert"


class NotificationChannel(Enum):
    """Notification channels"""
    IN_APP = "in_app"
    EMAIL = "email"
    SMS = "sms"


class NotificationService:
    """Service for managing notifications"""
    
    def __init__(self, db=None):
        """
        Initialize notification service
        
        Args:
            db: Database connection
        """
        self.db = db
        self.notifications = []
    
    def create_notification(
        self,
        user_id: str,
        notification_type: NotificationType,
        title: str,
        message: str,
        channels: List[NotificationChannel] = None,
        data: Dict[str, Any] = None,
        priority: str = 'normal'
    ) -> Dict[str, Any]:
        """
        Create a notification
        
        Args:
            user_id: User ID
            notification_type: Type of notification
            title: Notification title
            message: Notification message
            channels: Channels to send through
            data: Additional data
            priority: Priority level (low, normal, high, critical)
        
        Returns:
            Notification object
        """
        if channels is None:
            channels = [NotificationChannel.IN_APP]
        
        notification = {
            'id': f"notif_{datetime.now().timestamp()}",
            'user_id': user_id,
            'type': notification_type.value,
            'title': title,
            'message': message,
            'channels': [c.value for c in channels],
            'data': data or {},
            'priority': priority,
            'created_at': datetime.now().isoformat(),
            'read': False,
            'sent': False
        }
        
        self.notifications.append(notification)
        logger.info(f"Notification created: {notification['id']}")
        
        return notification
    
    def send_exam_scheduled_notification(
        self,
        user_id: str,
        exam_title: str,
        scheduled_date: str,
        channels: List[NotificationChannel] = None
    ) -> Dict[str, Any]:
        """Send exam scheduled notification"""
        return self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.EXAM_SCHEDULED,
            title=f"Exam Scheduled: {exam_title}",
            message=f"Your exam '{exam_title}' is scheduled for {scheduled_date}",
            channels=channels or [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
            data={'exam_title': exam_title, 'scheduled_date': scheduled_date},
            priority='high'
        )
    
    def send_exam_reminder_notification(
        self,
        user_id: str,
        exam_title: str,
        time_until: str,
        channels: List[NotificationChannel] = None
    ) -> Dict[str, Any]:
        """Send exam reminder notification"""
        return self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.EXAM_REMINDER,
            title=f"Exam Reminder: {exam_title}",
            message=f"Your exam '{exam_title}' starts in {time_until}",
            channels=channels or [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
            data={'exam_title': exam_title, 'time_until': time_until},
            priority='critical'
        )
    
    def send_grading_complete_notification(
        self,
        user_id: str,
        exam_title: str,
        score: float,
        channels: List[NotificationChannel] = None
    ) -> Dict[str, Any]:
        """Send grading complete notification"""
        return self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.GRADING_COMPLETE,
            title=f"Grading Complete: {exam_title}",
            message=f"Your exam '{exam_title}' has been graded. Score: {score}%",
            channels=channels or [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
            data={'exam_title': exam_title, 'score': score},
            priority='high'
        )
    
    def send_plagiarism_alert_notification(
        self,
        admin_id: str,
        student_name: str,
        exam_title: str,
        similarity: float,
        channels: List[NotificationChannel] = None
    ) -> Dict[str, Any]:
        """Send plagiarism alert notification"""
        return self.create_notification(
            user_id=admin_id,
            notification_type=NotificationType.PLAGIARISM_ALERT,
            title="Plagiarism Alert",
            message=f"High plagiarism detected in {student_name}'s submission ({similarity}% similarity)",
            channels=channels or [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
            data={
                'student_name': student_name,
                'exam_title': exam_title,
                'similarity': similarity
            },
            priority='critical'
        )
    
    def send_system_alert_notification(
        self,
        user_id: str,
        alert_message: str,
        channels: List[NotificationChannel] = None
    ) -> Dict[str, Any]:
        """Send system alert notification"""
        return self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.SYSTEM_ALERT,
            title="System Alert",
            message=alert_message,
            channels=channels or [NotificationChannel.IN_APP],
            priority='high'
        )
    
    def get_user_notifications(
        self,
        user_id: str,
        unread_only: bool = False,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get notifications for a user
        
        Args:
            user_id: User ID
            unread_only: Only return unread notifications
            limit: Maximum number of notifications
        
        Returns:
            List of notifications
        """
        notifications = [n for n in self.notifications if n['user_id'] == user_id]
        
        if unread_only:
            notifications = [n for n in notifications if not n['read']]
        
        # Sort by created_at descending
        notifications.sort(key=lambda x: x['created_at'], reverse=True)
        
        return notifications[:limit]
    
    def mark_as_read(self, notification_id: str) -> bool:
        """Mark notification as read"""
        for notif in self.notifications:
            if notif['id'] == notification_id:
                notif['read'] = True
                logger.info(f"Notification marked as read: {notification_id}")
                return True
        return False
    
    def mark_all_as_read(self, user_id: str) -> int:
        """Mark all notifications as read for a user"""
        count = 0
        for notif in self.notifications:
            if notif['user_id'] == user_id and not notif['read']:
                notif['read'] = True
                count += 1
        logger.info(f"Marked {count} notifications as read for user {user_id}")
        return count
    
    def delete_notification(self, notification_id: str) -> bool:
        """Delete a notification"""
        for i, notif in enumerate(self.notifications):
            if notif['id'] == notification_id:
                self.notifications.pop(i)
                logger.info(f"Notification deleted: {notification_id}")
                return True
        return False
    
    def get_unread_count(self, user_id: str) -> int:
        """Get count of unread notifications"""
        return len([n for n in self.notifications 
                   if n['user_id'] == user_id and not n['read']])
    
    def send_batch_notifications(
        self,
        user_ids: List[str],
        notification_type: NotificationType,
        title: str,
        message: str,
        channels: List[NotificationChannel] = None
    ) -> List[Dict[str, Any]]:
        """Send notifications to multiple users"""
        notifications = []
        for user_id in user_ids:
            notif = self.create_notification(
                user_id=user_id,
                notification_type=notification_type,
                title=title,
                message=message,
                channels=channels
            )
            notifications.append(notif)
        
        logger.info(f"Batch notifications sent to {len(user_ids)} users")
        return notifications
    
    def get_notification_stats(self, user_id: str) -> Dict[str, Any]:
        """Get notification statistics for a user"""
        user_notifs = [n for n in self.notifications if n['user_id'] == user_id]
        
        return {
            'total': len(user_notifs),
            'unread': len([n for n in user_notifs if not n['read']]),
            'by_type': self._count_by_type(user_notifs),
            'by_priority': self._count_by_priority(user_notifs)
        }
    
    @staticmethod
    def _count_by_type(notifications: List[Dict]) -> Dict[str, int]:
        """Count notifications by type"""
        counts = {}
        for notif in notifications:
            notif_type = notif['type']
            counts[notif_type] = counts.get(notif_type, 0) + 1
        return counts
    
    @staticmethod
    def _count_by_priority(notifications: List[Dict]) -> Dict[str, int]:
        """Count notifications by priority"""
        counts = {}
        for notif in notifications:
            priority = notif['priority']
            counts[priority] = counts.get(priority, 0) + 1
        return counts

