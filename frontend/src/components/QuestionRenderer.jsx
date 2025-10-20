/**
 * Universal Question Renderer
 * Dynamically renders any question type component
 */

import React, { Suspense, lazy, useState, useEffect } from 'react';
import { getComponentForType, isValidType } from '@/utils/typeDetection';
import { validateQuestion } from '@/utils/questionValidation';

/**
 * Loading fallback component
 */
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading question...</p>
      </div>
    </div>
  );
}

/**
 * Error display component
 */
function ErrorDisplay({ error }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <h3 className="text-red-800 font-semibold mb-2">Error Loading Question</h3>
      <p className="text-red-700 text-sm">{error}</p>
    </div>
  );
}

/**
 * Validation error display component
 */
function ValidationErrorDisplay({ errors }) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <h3 className="text-yellow-800 font-semibold mb-2">Question Validation Errors</h3>
      <ul className="text-yellow-700 text-sm space-y-1">
        {errors.map((error, idx) => (
          <li key={idx} className="flex items-start">
            <span className="mr-2">•</span>
            <span>{error}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Universal Question Renderer Component
 * 
 * Props:
 * - question: Object - The question data
 * - onAnswer: Function - Callback when answer is submitted
 * - onReview: Function - Callback when question is marked for review
 * - showValidationErrors: Boolean - Whether to show validation errors (default: false)
 */
export function QuestionRenderer({
  question,
  onAnswer,
  onReview,
  showValidationErrors = false
}) {
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load component based on question type
  useEffect(() => {
    if (!question) {
      setError('No question provided');
      setIsLoading(false);
      return;
    }

    // Validate question
    const validation = validateQuestion(question);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      if (showValidationErrors) {
        setError('Question validation failed');
        setIsLoading(false);
        return;
      }
    }

    // Load component
    const loadComponent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!isValidType(question.type)) {
          throw new Error(`Unknown question type: ${question.type}`);
        }

        const ComponentClass = await getComponentForType(question.type);
        setComponent(() => ComponentClass);
      } catch (err) {
        setError(err.message || 'Failed to load question component');
        setComponent(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadComponent();
  }, [question, showValidationErrors]);

  // Show validation errors if enabled
  if (showValidationErrors && validationErrors.length > 0) {
    return <ValidationErrorDisplay errors={validationErrors} />;
  }

  // Show error if component failed to load
  if (error) {
    return <ErrorDisplay error={error} />;
  }

  // Show loading state
  if (isLoading || !Component) {
    return <LoadingFallback />;
  }

  // Render the component
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Component
        question={question}
        onAnswer={onAnswer}
        onReview={onReview}
      />
    </Suspense>
  );
}

export default QuestionRenderer;

