/**
 * Type Detection Utility Tests
 */

import {
  detectQuestionType,
  isValidType,
  getTypeMetadata,
  getTypesBySection,
  getAllTypes,
  getTypeName,
  getTypeDescription,
  getTypeSection,
  isListeningType,
  isReadingType,
  isWritingType
} from '../typeDetection';

describe('Type Detection Utility', () => {
  describe('detectQuestionType', () => {
    test('should detect type from exact path match', () => {
      expect(detectQuestionType('Multiple Choice (one answer)')).toBe('mcq_single');
      expect(detectQuestionType('True/False/Not Given')).toBe('true_false_ng');
    });

    test('should detect type from partial path match', () => {
      expect(detectQuestionType('Fill in the gaps')).toBe('fill_gaps');
      expect(detectQuestionType('Matching')).toBe('matching');
    });

    test('should return null for invalid path', () => {
      expect(detectQuestionType('Invalid Type')).toBeNull();
      expect(detectQuestionType('')).toBeNull();
      expect(detectQuestionType(null)).toBeNull();
    });
  });

  describe('isValidType', () => {
    test('should return true for valid types', () => {
      expect(isValidType('mcq_single')).toBe(true);
      expect(isValidType('true_false_ng')).toBe(true);
      expect(isValidType('writing_task1')).toBe(true);
    });

    test('should return false for invalid types', () => {
      expect(isValidType('invalid_type')).toBe(false);
      expect(isValidType('')).toBe(false);
      expect(isValidType(null)).toBe(false);
    });
  });

  describe('getTypeMetadata', () => {
    test('should return metadata for valid type', () => {
      const metadata = getTypeMetadata('mcq_single');
      expect(metadata).toBeDefined();
      expect(metadata.name).toBe('Multiple Choice (Single)');
      expect(metadata.section).toBe('Listening');
    });

    test('should return null for invalid type', () => {
      expect(getTypeMetadata('invalid_type')).toBeNull();
    });
  });

  describe('getTypesBySection', () => {
    test('should return all listening types', () => {
      const listeningTypes = getTypesBySection('Listening');
      expect(listeningTypes.length).toBe(10);
      expect(listeningTypes).toContain('mcq_single');
      expect(listeningTypes).toContain('sentence_completion');
    });

    test('should return all reading types', () => {
      const readingTypes = getTypesBySection('Reading');
      expect(readingTypes.length).toBe(6);
      expect(readingTypes).toContain('true_false_ng');
      expect(readingTypes).toContain('matching_headings');
    });

    test('should return all writing types', () => {
      const writingTypes = getTypesBySection('Writing');
      expect(writingTypes.length).toBe(2);
      expect(writingTypes).toContain('writing_task1');
      expect(writingTypes).toContain('writing_task2');
    });
  });

  describe('getAllTypes', () => {
    test('should return all 18 types', () => {
      const allTypes = getAllTypes();
      expect(allTypes.length).toBe(18);
    });
  });

  describe('getTypeName', () => {
    test('should return type name', () => {
      expect(getTypeName('mcq_single')).toBe('Multiple Choice (Single)');
      expect(getTypeName('true_false_ng')).toBe('True/False/Not Given');
    });

    test('should return null for invalid type', () => {
      expect(getTypeName('invalid_type')).toBeNull();
    });
  });

  describe('getTypeDescription', () => {
    test('should return type description', () => {
      const desc = getTypeDescription('mcq_single');
      expect(desc).toBeDefined();
      expect(typeof desc).toBe('string');
    });

    test('should return null for invalid type', () => {
      expect(getTypeDescription('invalid_type')).toBeNull();
    });
  });

  describe('getTypeSection', () => {
    test('should return correct section', () => {
      expect(getTypeSection('mcq_single')).toBe('Listening');
      expect(getTypeSection('true_false_ng')).toBe('Reading');
      expect(getTypeSection('writing_task1')).toBe('Writing');
    });

    test('should return null for invalid type', () => {
      expect(getTypeSection('invalid_type')).toBeNull();
    });
  });

  describe('Section type checkers', () => {
    test('isListeningType should work correctly', () => {
      expect(isListeningType('mcq_single')).toBe(true);
      expect(isListeningType('true_false_ng')).toBe(false);
      expect(isListeningType('writing_task1')).toBe(false);
    });

    test('isReadingType should work correctly', () => {
      expect(isReadingType('mcq_single')).toBe(false);
      expect(isReadingType('true_false_ng')).toBe(true);
      expect(isReadingType('writing_task1')).toBe(false);
    });

    test('isWritingType should work correctly', () => {
      expect(isWritingType('mcq_single')).toBe(false);
      expect(isWritingType('true_false_ng')).toBe(false);
      expect(isWritingType('writing_task1')).toBe(true);
    });
  });
});

