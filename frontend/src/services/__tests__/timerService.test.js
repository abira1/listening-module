/**
 * Tests for Timer Service
 * Part of Phase 3, Task 3.5
 */

import * as timerService from '../timerService';
import { ExamTimer, ProgressTracker } from '../timerService';

describe('Timer Service', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('formatTime', () => {
    test('formats seconds to HH:MM:SS', () => {
      expect(timerService.formatTime(3661)).toBe('01:01:01');
    });

    test('formats zero seconds', () => {
      expect(timerService.formatTime(0)).toBe('00:00:00');
    });

    test('formats less than a minute', () => {
      expect(timerService.formatTime(45)).toBe('00:00:45');
    });

    test('formats exactly one hour', () => {
      expect(timerService.formatTime(3600)).toBe('01:00:00');
    });

    test('handles negative seconds', () => {
      expect(timerService.formatTime(-10)).toBe('00:00:00');
    });
  });

  describe('timeToSeconds', () => {
    test('converts HH:MM:SS to seconds', () => {
      expect(timerService.timeToSeconds('01:01:01')).toBe(3661);
    });

    test('converts 00:00:00 to 0', () => {
      expect(timerService.timeToSeconds('00:00:00')).toBe(0);
    });

    test('handles invalid format', () => {
      expect(timerService.timeToSeconds('invalid')).toBe(0);
    });
  });

  describe('getTimeWarningLevel', () => {
    test('returns critical for less than 5%', () => {
      const level = timerService.getTimeWarningLevel(50, 1000);
      expect(level).toBe('critical');
    });

    test('returns warning for 5-15%', () => {
      const level = timerService.getTimeWarningLevel(100, 1000);
      expect(level).toBe('warning');
    });

    test('returns caution for 15-25%', () => {
      const level = timerService.getTimeWarningLevel(200, 1000);
      expect(level).toBe('caution');
    });

    test('returns normal for more than 25%', () => {
      const level = timerService.getTimeWarningLevel(300, 1000);
      expect(level).toBe('normal');
    });
  });

  describe('getTimeWarningMessage', () => {
    test('returns message for less than 1 minute', () => {
      const msg = timerService.getTimeWarningMessage(30);
      expect(msg).toBe('Less than 1 minute remaining!');
    });

    test('returns message for 5 minutes', () => {
      const msg = timerService.getTimeWarningMessage(300);
      expect(msg).toContain('minutes remaining');
    });

    test('returns null for sufficient time', () => {
      const msg = timerService.getTimeWarningMessage(1000);
      expect(msg).toBeNull();
    });
  });

  describe('calculateTimeSpent', () => {
    test('calculates time spent correctly', () => {
      const start = new Date(Date.now() - 60000);
      const spent = timerService.calculateTimeSpent(start);
      expect(spent).toBeGreaterThanOrEqual(59);
      expect(spent).toBeLessThanOrEqual(61);
    });
  });

  describe('estimateTimePerQuestion', () => {
    test('estimates time per question', () => {
      const timePerQ = timerService.estimateTimePerQuestion(3600, 40);
      expect(timePerQ).toBe(90);
    });

    test('handles zero questions', () => {
      const timePerQ = timerService.estimateTimePerQuestion(3600, 0);
      expect(timePerQ).toBe(Infinity);
    });
  });

  describe('isTimeSufficient', () => {
    test('returns true when time is sufficient', () => {
      const sufficient = timerService.isTimeSufficient(1000, 10, 50);
      expect(sufficient).toBe(true);
    });

    test('returns false when time is insufficient', () => {
      const sufficient = timerService.isTimeSufficient(100, 10, 50);
      expect(sufficient).toBe(false);
    });
  });

  describe('calculateRecommendedPace', () => {
    test('calculates recommended pace', () => {
      const pace = timerService.calculateRecommendedPace(1000, 10);
      expect(pace).toBe(100);
    });

    test('handles zero questions', () => {
      const pace = timerService.calculateRecommendedPace(1000, 0);
      expect(pace).toBe(0);
    });
  });

  describe('Timer state persistence', () => {
    test('saves timer state', () => {
      const result = timerService.saveTimerState('E001', 1800);
      expect(result.success).toBe(true);

      const saved = localStorage.getItem('timer_E001');
      expect(saved).toBeTruthy();
    });

    test('retrieves timer state', () => {
      timerService.saveTimerState('E001', 1800);
      const result = timerService.getTimerState('E001');

      expect(result.success).toBe(true);
      expect(result.data.timeRemaining).toBe(1800);
    });

    test('clears timer state', () => {
      timerService.saveTimerState('E001', 1800);
      timerService.clearTimerState('E001');

      const result = timerService.getTimerState('E001');
      expect(result.success).toBe(false);
    });
  });

  describe('ExamTimer class', () => {
    test('creates timer instance', () => {
      const timer = new ExamTimer(3600);
      expect(timer.totalSeconds).toBe(3600);
      expect(timer.timeRemaining).toBe(3600);
    });

    test('starts timer', () => {
      const timer = new ExamTimer(10);
      timer.start();

      jest.advanceTimersByTime(1000);
      expect(timer.timeRemaining).toBeLessThan(10);

      timer.stop();
    });

    test('pauses and resumes timer', () => {
      const timer = new ExamTimer(10);
      timer.start();

      jest.advanceTimersByTime(2000);
      const timeAfter2s = timer.timeRemaining;

      timer.pause();
      jest.advanceTimersByTime(2000);
      const timeAfterPause = timer.timeRemaining;

      expect(timeAfterPause).toBe(timeAfter2s);

      timer.resume();
      jest.advanceTimersByTime(1000);
      expect(timer.timeRemaining).toBeLessThan(timeAfter2s);

      timer.stop();
    });

    test('resets timer', () => {
      const timer = new ExamTimer(10);
      timer.start();

      jest.advanceTimersByTime(5000);
      timer.reset();

      expect(timer.timeRemaining).toBe(10);
      expect(timer.isPaused).toBe(false);

      timer.stop();
    });

    test('calls onTick callback', () => {
      const onTick = jest.fn();
      const timer = new ExamTimer(10, onTick);
      timer.start();

      jest.advanceTimersByTime(2000);
      expect(onTick).toHaveBeenCalled();

      timer.stop();
    });

    test('calls onTimeUp callback', () => {
      const onTimeUp = jest.fn();
      const timer = new ExamTimer(1, null, onTimeUp);
      timer.start();

      jest.advanceTimersByTime(2000);
      expect(onTimeUp).toHaveBeenCalled();

      timer.stop();
    });

    test('gets formatted time', () => {
      const timer = new ExamTimer(3661);
      expect(timer.getFormattedTime()).toBe('01:01:01');
    });

    test('gets progress percentage', () => {
      const timer = new ExamTimer(100);
      timer.timeRemaining = 50;
      expect(timer.getProgress()).toBe(50);
    });

    test('checks if time is up', () => {
      const timer = new ExamTimer(10);
      expect(timer.isTimeUp()).toBe(false);

      timer.timeRemaining = 0;
      expect(timer.isTimeUp()).toBe(true);
    });

    test('gets warning level', () => {
      const timer = new ExamTimer(1000);
      timer.timeRemaining = 30;
      expect(timer.getWarningLevel()).toBe('critical');
    });
  });

  describe('ProgressTracker class', () => {
    test('creates progress tracker', () => {
      const tracker = new ProgressTracker(40);
      expect(tracker.totalQuestions).toBe(40);
    });

    test('marks question as answered', () => {
      const tracker = new ProgressTracker(40);
      tracker.markAnswered('Q1');

      expect(tracker.isAnswered('Q1')).toBe(true);
      expect(tracker.getAnsweredCount()).toBe(1);
    });

    test('marks question as unanswered', () => {
      const tracker = new ProgressTracker(40);
      tracker.markAnswered('Q1');
      tracker.markUnanswered('Q1');

      expect(tracker.isAnswered('Q1')).toBe(false);
    });

    test('marks question as flagged', () => {
      const tracker = new ProgressTracker(40);
      tracker.markFlagged('Q1');

      expect(tracker.isFlagged('Q1')).toBe(true);
      expect(tracker.getFlaggedCount()).toBe(1);
    });

    test('marks question as visited', () => {
      const tracker = new ProgressTracker(40);
      tracker.markVisited('Q1');

      expect(tracker.isVisited('Q1')).toBe(true);
      expect(tracker.getVisitedCount()).toBe(1);
    });

    test('calculates unanswered count', () => {
      const tracker = new ProgressTracker(40);
      tracker.markAnswered('Q1');
      tracker.markAnswered('Q2');

      expect(tracker.getUnansweredCount()).toBe(38);
    });

    test('calculates progress percentage', () => {
      const tracker = new ProgressTracker(40);
      tracker.markAnswered('Q1');
      tracker.markAnswered('Q2');

      expect(tracker.getProgressPercentage()).toBe(5);
    });

    test('gets status', () => {
      const tracker = new ProgressTracker(40);
      tracker.markAnswered('Q1');
      tracker.markFlagged('Q2');

      const status = tracker.getStatus();
      expect(status.totalQuestions).toBe(40);
      expect(status.answeredQuestions).toBe(1);
      expect(status.flaggedQuestions).toBe(1);
    });

    test('resets tracker', () => {
      const tracker = new ProgressTracker(40);
      tracker.markAnswered('Q1');
      tracker.markFlagged('Q2');

      tracker.reset();

      expect(tracker.getAnsweredCount()).toBe(0);
      expect(tracker.getFlaggedCount()).toBe(0);
    });

    test('saves and loads state', () => {
      const tracker = new ProgressTracker(40);
      tracker.markAnswered('Q1');
      tracker.markFlagged('Q2');

      tracker.saveState('E001');

      const tracker2 = new ProgressTracker(40);
      tracker2.loadState('E001');

      expect(tracker2.isAnswered('Q1')).toBe(true);
      expect(tracker2.isFlagged('Q2')).toBe(true);
    });
  });
});

