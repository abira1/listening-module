import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Error Boundary Component for Question Rendering
 * Catches and displays errors when rendering questions
 */
export class QuestionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      questionId: null,
      questionType: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Question Rendering Error:', {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      question: this.props.question,
      timestamp: new Date().toISOString()
    });

    this.setState({
      error: error,
      errorInfo: errorInfo,
      questionId: this.props.question?.id,
      questionType: this.props.question?.type
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 mb-1">
                Error Rendering Question
              </h3>
              <p className="text-sm text-red-700 mb-2">
                Question ID: <code className="bg-red-100 px-2 py-1 rounded">{this.state.questionId}</code>
              </p>
              <p className="text-sm text-red-700 mb-2">
                Type: <code className="bg-red-100 px-2 py-1 rounded">{this.state.questionType}</code>
              </p>
              <details className="text-sm text-red-700 mt-2">
                <summary className="cursor-pointer font-medium hover:text-red-800">
                  Error Details
                </summary>
                <pre className="mt-2 bg-red-100 p-2 rounded text-xs overflow-auto max-h-40">
                  {this.state.error?.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
              <p className="text-xs text-red-600 mt-2">
                Please contact support if this issue persists.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default QuestionErrorBoundary;

