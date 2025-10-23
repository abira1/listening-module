/**
 * Timer Service
 * Handles countdown timer and time tracking
 * Part of Phase 3, Task 3.5
 */

/**
 * Formats seconds into HH:MM:SS format
 */
export const formatTime = (seconds) => {
  if (seconds < 0) seconds = 0;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Converts time string to seconds
 */
export const timeToSeconds = (timeString) => {
  const parts = timeString.split(':');
  if (parts.length !== 3) return 0;

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);

  return hours * 3600 + minutes * 60 + seconds;
};

/**
 * Gets time warning level
 */
export const getTimeWarningLevel = (timeRemaining, totalTime) => {
  const percentageRemaining = (timeRemaining / totalTime) * 100;

  if (percentageRemaining <= 5) {
    return 'critical'; // Red - less than 5%
  } else if (percentageRemaining <= 15) {
    return 'warning'; // Orange - less than 15%
  } else if (percentageRemaining <= 25) {
    return 'caution'; // Yellow - less than 25%
  }

  return 'normal'; // Green
};

/**
 * Gets time warning message
 */
export const getTimeWarningMessage = (timeRemaining) => {
  if (timeRemaining <= 60) {
    return 'Less than 1 minute remaining!';
  } else if (timeRemaining <= 300) {
    const minutes = Math.ceil(timeRemaining / 60);
    return `${minutes} minutes remaining`;
  } else if (timeRemaining <= 900) {
    const minutes = Math.ceil(timeRemaining / 60);
    return `${minutes} minutes remaining`;
  }

  return null;
};

/**
 * Calculates time spent
 */
export const calculateTimeSpent = (startTime, endTime = null) => {
  const end = endTime || new Date();
  const start = new Date(startTime);
  const diffMs = end - start;
  return Math.floor(diffMs / 1000);
};

/**
 * Estimates time per question
 */
export const estimateTimePerQuestion = (totalTime, questionCount) => {
  return Math.floor(totalTime / questionCount);
};

/**
 * Checks if time is sufficient for remaining questions
 */
export const isTimeSufficient = (timeRemaining, questionsRemaining, avgTimePerQuestion) => {
  const timeNeeded = questionsRemaining * avgTimePerQuestion;
  return timeRemaining >= timeNeeded;
};

/**
 * Calculates recommended pace
 */
export const calculateRecommendedPace = (timeRemaining, questionsRemaining) => {
  if (questionsRemaining === 0) return 0;
  return Math.floor(timeRemaining / questionsRemaining);
};

/**
 * Saves timer state to localStorage
 */
export const saveTimerState = (examId, timeRemaining, isPaused = false) => {
  try {
    const state = {
      examId,
      timeRemaining,
      isPaused,
      savedAt: new Date().toISOString()
    };

    localStorage.setItem(`timer_${examId}`, JSON.stringify(state));
    return { success: true };
  } catch (error) {
    console.error('Save timer state error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Retrieves timer state from localStorage
 */
export const getTimerState = (examId) => {
  try {
    const state = localStorage.getItem(`timer_${examId}`);
    if (!state) {
      return { success: false, error: 'No timer state found' };
    }

    const parsed = JSON.parse(state);
    return { success: true, data: parsed };
  } catch (error) {
    console.error('Get timer state error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clears timer state
 */
export const clearTimerState = (examId) => {
  try {
    localStorage.removeItem(`timer_${examId}`);
    return { success: true };
  } catch (error) {
    console.error('Clear timer state error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Creates a timer instance
 */
export class ExamTimer {
  constructor(totalSeconds, onTick = null, onTimeUp = null) {
    this.totalSeconds = totalSeconds;
    this.timeRemaining = totalSeconds;
    this.isPaused = false;
    this.startTime = null;
    this.pausedTime = 0;
    this.onTick = onTick;
    this.onTimeUp = onTimeUp;
    this.intervalId = null;
  }

  start() {
    if (this.intervalId) return; // Already running

    this.startTime = Date.now() - this.pausedTime * 1000;

    this.intervalId = setInterval(() => {
      if (!this.isPaused) {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.timeRemaining = Math.max(0, this.totalSeconds - elapsed);

        if (this.onTick) {
          this.onTick(this.timeRemaining);
        }

        if (this.timeRemaining === 0) {
          this.stop();
          if (this.onTimeUp) {
            this.onTimeUp();
          }
        }
      }
    }, 1000);
  }

  pause() {
    this.isPaused = true;
    this.pausedTime = this.totalSeconds - this.timeRemaining;
  }

  resume() {
    this.isPaused = false;
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset() {
    this.stop();
    this.timeRemaining = this.totalSeconds;
    this.isPaused = false;
    this.startTime = null;
    this.pausedTime = 0;
  }

  getTimeRemaining() {
    return this.timeRemaining;
  }

  getFormattedTime() {
    return formatTime(this.timeRemaining);
  }

  getProgress() {
    return (this.timeRemaining / this.totalSeconds) * 100;
  }

  isTimeUp() {
    return this.timeRemaining === 0;
  }

  getWarningLevel() {
    return getTimeWarningLevel(this.timeRemaining, this.totalSeconds);
  }
}

/**
 * Progress tracker for exam
 */
export class ProgressTracker {
  constructor(totalQuestions) {
    this.totalQuestions = totalQuestions;
    this.answeredQuestions = new Set();
    this.flaggedQuestions = new Set();
    this.visitedQuestions = new Set();
  }

  markAnswered(questionId) {
    this.answeredQuestions.add(questionId);
    this.visitedQuestions.add(questionId);
  }

  markUnanswered(questionId) {
    this.answeredQuestions.delete(questionId);
  }

  markFlagged(questionId) {
    this.flaggedQuestions.add(questionId);
  }

  markUnflagged(questionId) {
    this.flaggedQuestions.delete(questionId);
  }

  markVisited(questionId) {
    this.visitedQuestions.add(questionId);
  }

  getAnsweredCount() {
    return this.answeredQuestions.size;
  }

  getUnansweredCount() {
    return this.totalQuestions - this.answeredQuestions.size;
  }

  getFlaggedCount() {
    return this.flaggedQuestions.size;
  }

  getVisitedCount() {
    return this.visitedQuestions.size;
  }

  getProgress() {
    return (this.answeredQuestions.size / this.totalQuestions) * 100;
  }

  getProgressPercentage() {
    return Math.round(this.getProgress());
  }

  isAnswered(questionId) {
    return this.answeredQuestions.has(questionId);
  }

  isFlagged(questionId) {
    return this.flaggedQuestions.has(questionId);
  }

  isVisited(questionId) {
    return this.visitedQuestions.has(questionId);
  }

  getStatus() {
    return {
      totalQuestions: this.totalQuestions,
      answeredQuestions: this.getAnsweredCount(),
      unansweredQuestions: this.getUnansweredCount(),
      flaggedQuestions: this.getFlaggedCount(),
      visitedQuestions: this.getVisitedCount(),
      progressPercentage: this.getProgressPercentage()
    };
  }

  reset() {
    this.answeredQuestions.clear();
    this.flaggedQuestions.clear();
    this.visitedQuestions.clear();
  }

  saveState(examId) {
    try {
      const state = {
        examId,
        totalQuestions: this.totalQuestions,
        answeredQuestions: Array.from(this.answeredQuestions),
        flaggedQuestions: Array.from(this.flaggedQuestions),
        visitedQuestions: Array.from(this.visitedQuestions),
        savedAt: new Date().toISOString()
      };

      localStorage.setItem(`progress_${examId}`, JSON.stringify(state));
      return { success: true };
    } catch (error) {
      console.error('Save progress state error:', error);
      return { success: false, error: error.message };
    }
  }

  loadState(examId) {
    try {
      const state = localStorage.getItem(`progress_${examId}`);
      if (!state) {
        return { success: false, error: 'No progress state found' };
      }

      const parsed = JSON.parse(state);
      this.answeredQuestions = new Set(parsed.answeredQuestions);
      this.flaggedQuestions = new Set(parsed.flaggedQuestions);
      this.visitedQuestions = new Set(parsed.visitedQuestions);

      return { success: true };
    } catch (error) {
      console.error('Load progress state error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default {
  formatTime,
  timeToSeconds,
  getTimeWarningLevel,
  getTimeWarningMessage,
  calculateTimeSpent,
  estimateTimePerQuestion,
  isTimeSufficient,
  calculateRecommendedPace,
  saveTimerState,
  getTimerState,
  clearTimerState,
  ExamTimer,
  ProgressTracker
};

