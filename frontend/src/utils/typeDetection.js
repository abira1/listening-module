/**
 * Type Detection Utility
 * Provides functions for detecting, validating, and retrieving question types
 */

import { 
  QUESTION_TYPES, 
  PATH_TO_TYPE_MAP, 
  QUESTION_COMPONENTS,
  VALID_TYPES 
} from '@/constants/questionTypes';

/**
 * Detect question type from a path string
 * @param {string} path - The path or name to detect type from
 * @returns {string|null} - The detected type code or null if not found
 */
export function detectQuestionType(path) {
  if (!path || typeof path !== 'string') {
    return null;
  }

  // Check exact matches first
  if (PATH_TO_TYPE_MAP[path]) {
    return PATH_TO_TYPE_MAP[path];
  }

  // Check partial matches
  for (const [key, value] of Object.entries(PATH_TO_TYPE_MAP)) {
    if (path.includes(key)) {
      return value;
    }
  }

  return null;
}

/**
 * Check if a type is valid
 * @param {string} type - The type code to validate
 * @returns {boolean} - True if type is valid
 */
export function isValidType(type) {
  return VALID_TYPES.includes(type);
}

/**
 * Get component for a question type
 * @param {string} type - The type code
 * @returns {Promise<React.Component>} - The component class
 * @throws {Error} - If type is invalid
 */
export async function getComponentForType(type) {
  if (!isValidType(type)) {
    throw new Error(`Unknown question type: ${type}`);
  }

  const componentLoader = QUESTION_COMPONENTS[type];
  if (!componentLoader) {
    throw new Error(`No component found for type: ${type}`);
  }

  try {
    const module = await componentLoader();
    return module.default;
  } catch (error) {
    throw new Error(`Failed to load component for type ${type}: ${error.message}`);
  }
}

/**
 * Get metadata for a question type
 * @param {string} type - The type code
 * @returns {Object|null} - The type metadata or null if not found
 */
export function getTypeMetadata(type) {
  return QUESTION_TYPES[type] || null;
}

/**
 * Get all types for a specific section
 * @param {string} section - The section name (Listening, Reading, Writing)
 * @returns {string[]} - Array of type codes for that section
 */
export function getTypesBySection(section) {
  return Object.entries(QUESTION_TYPES)
    .filter(([_, meta]) => meta.section === section)
    .map(([type, _]) => type);
}

/**
 * Get all types
 * @returns {string[]} - Array of all valid type codes
 */
export function getAllTypes() {
  return VALID_TYPES;
}

/**
 * Get type name from code
 * @param {string} type - The type code
 * @returns {string|null} - The type name or null if not found
 */
export function getTypeName(type) {
  const metadata = getTypeMetadata(type);
  return metadata ? metadata.name : null;
}

/**
 * Get type description from code
 * @param {string} type - The type code
 * @returns {string|null} - The type description or null if not found
 */
export function getTypeDescription(type) {
  const metadata = getTypeMetadata(type);
  return metadata ? metadata.description : null;
}

/**
 * Get section for a type
 * @param {string} type - The type code
 * @returns {string|null} - The section name or null if not found
 */
export function getTypeSection(type) {
  const metadata = getTypeMetadata(type);
  return metadata ? metadata.section : null;
}

/**
 * Check if type is a listening type
 * @param {string} type - The type code
 * @returns {boolean} - True if type is listening
 */
export function isListeningType(type) {
  return getTypeSection(type) === 'Listening';
}

/**
 * Check if type is a reading type
 * @param {string} type - The type code
 * @returns {boolean} - True if type is reading
 */
export function isReadingType(type) {
  return getTypeSection(type) === 'Reading';
}

/**
 * Check if type is a writing type
 * @param {string} type - The type code
 * @returns {boolean} - True if type is writing
 */
export function isWritingType(type) {
  return getTypeSection(type) === 'Writing';
}

