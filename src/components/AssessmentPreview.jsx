import React, { useState } from 'react';
import { Clock, FileText, CheckCircle } from 'lucide-react';
import { showToast } from '../utils/toast.js';
import BtnWhite from './BtnWhite';

const AssessmentPreview = ({ assessment }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});
  const [debug, setDebug] = useState(false); // Toggle for debugging

  const validateQuestion = (question, value) => {
    const errors = [];

    if (question.required && (!value || value === '')) {
      errors.push('This question is required');
    }

    if (question.type === 'numeric' && value) {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        errors.push('Please enter a valid number');
      } else {
        if (question.validation?.min && numValue < parseFloat(question.validation.min)) {
          errors.push(`Value must be at least ${question.validation.min}`);
        }
        if (question.validation?.max && numValue > parseFloat(question.validation.max)) {
          errors.push(`Value must be at most ${question.validation.max}`);
        }
      }
    }

    if ((question.type === 'short-text' || question.type === 'long-text') && value) {
      if (question.validation?.maxLength && value.length > parseInt(question.validation.maxLength)) {
        errors.push(`Text must be no more than ${question.validation.maxLength} characters`);
      }
    }

    return errors;
  };

  const handleResponse = (questionId, value) => {
    // Process value based on type - special handling for numeric inputs
    const section = assessment.sections[currentSection];
    const question = section?.questions.find(q => q.id === questionId);

    let processedValue = value;

    // Convert to number for numeric type questions
    if (question?.type === 'numeric' && value !== '') {
      processedValue = Number(value);
      console.log(`Converting response to number: ${processedValue}`);
    }

    setResponses(prev => {
      const newResponses = {
        ...prev,
        [questionId]: processedValue
      };

      // Clear responses for questions that depend on this one if the value changed
      const currentSection = assessment.sections[assessment.sections.findIndex(s => s.questions.some(q => q.id === questionId))];
      if (currentSection) {
        currentSection.questions.forEach(q => {
          if (q.conditional?.dependsOn === questionId && prev[questionId] !== processedValue) {
            // Value changed for a question that others depend on, clear their responses
            console.log(`Clearing response for dependent question ${q.id}`);
            delete newResponses[q.id];
          }
        });
      }

      return newResponses;
    });

    // Clear errors for this question
    setErrors(prev => ({
      ...prev,
      [questionId]: []
    }));
  };

  const isQuestionVisible = (question, allQuestions = []) => {
    // If no conditional logic, always show the question
    if (!question.conditional?.dependsOn) {
      return true;
    }

    const list = Array.isArray(allQuestions) ? allQuestions : [];
    const dependsOnId = question.conditional.dependsOn;
    const conditionType = question.conditional.condition || 'equals';
    const conditionValue = question.conditional.value;

    console.log(`Checking visibility for question ${question.id}:`);
    console.log(`- Depends on question: ${dependsOnId}`);
    console.log(`- Condition: ${conditionType}`);
    console.log(`- Expected value: "${conditionValue}"`);

    // Find the question this depends on
    const dependentQuestion = list.find(q =>
      q.id === dependsOnId ||
      Number(q.id) === Number(dependsOnId) ||
      String(q.id) === String(dependsOnId)
    );

    if (!dependentQuestion) {
      console.log(`- Dependent question not found, hiding`);
      return false;
    }

    // Get the actual response value
    const actualResponse = responses[dependsOnId];
    console.log(`- Actual response: "${actualResponse}" (type: ${typeof actualResponse})`);

    // If no response yet, hide the question
    if (actualResponse === undefined || actualResponse === null || actualResponse === '') {
      console.log(`- No response yet, hiding`);
      return false;
    }

    // Perform the comparison based on condition type
    let result = false;

    switch (conditionType) {
      case 'equals': {
        if (Array.isArray(actualResponse)) {
          // For multi-choice questions
          result = actualResponse.some(responseItem => {
            const itemStr = String(responseItem).trim();
            const condStr = String(conditionValue).trim();

            // Try numeric comparison if both can be numbers
            if (!isNaN(Number(itemStr)) && !isNaN(Number(condStr))) {
              return Number(itemStr) === Number(condStr);
            }
            // Otherwise exact string match
            return itemStr === condStr;
          });
        } else {
          // For single-choice, text, or numeric questions
          const responseStr = String(actualResponse).trim();
          const condStr = String(conditionValue).trim();

          console.log(`- Comparing: "${responseStr}" === "${condStr}"`);

          // If both are numeric, compare as numbers
          if (!isNaN(Number(responseStr)) && !isNaN(Number(condStr))) {
            result = Number(responseStr) === Number(condStr);
            console.log(`- Numeric comparison: ${Number(responseStr)} === ${Number(condStr)} = ${result}`);
          } else {
            // Otherwise exact string match (case-sensitive)
            result = responseStr === condStr;
            console.log(`- String comparison: "${responseStr}" === "${condStr}" = ${result}`);
          }
        }
        break;
      }

      case 'not_equals': {
        // Inverse of equals logic
        if (Array.isArray(actualResponse)) {
          result = !actualResponse.some(responseItem => {
            const itemStr = String(responseItem).trim();
            const condStr = String(conditionValue).trim();

            if (!isNaN(Number(itemStr)) && !isNaN(Number(condStr))) {
              return Number(itemStr) === Number(condStr);
            }
            return itemStr === condStr;
          });
        } else {
          const responseStr = String(actualResponse).trim();
          const condStr = String(conditionValue).trim();

          if (!isNaN(Number(responseStr)) && !isNaN(Number(condStr))) {
            result = Number(responseStr) !== Number(condStr);
          } else {
            result = responseStr !== condStr;
          }
        }
        break;
      }

      case 'contains': {
        if (Array.isArray(actualResponse)) {
          result = actualResponse.some(responseItem =>
            String(responseItem).trim().toLowerCase().includes(String(conditionValue).trim().toLowerCase())
          );
        } else {
          const responseStr = String(actualResponse).trim().toLowerCase();
          const condStr = String(conditionValue).trim().toLowerCase();
          result = responseStr.includes(condStr);
        }
        break;
      }

      default:
        result = true; // Unknown condition type, show by default
    }

    console.log(`- Final result: ${result}`);
    return result;
  };

  const renderQuestion = (question, allQuestions) => {
    const questionErrors = errors[question.id] || [];
    const value = responses[question.id] || '';

    if (!isQuestionVisible(question, allQuestions)) {
      return null;
    }

    const baseClasses = "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[var(--color-blue)] text-[var(--color-text)]";
    const errorClasses = questionErrors.length > 0 ? "border-red-500" : "border-[var(--color-border)]";

    return (
      <div key={question.id} className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {question.type === 'single-choice' && (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleResponse(question.id, e.target.value)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        )}

        {question.type === 'multi-choice' && (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="checkbox"
                  value={option}
                  checked={(value || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = value || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter(v => v !== option);
                    handleResponse(question.id, newValues);
                  }}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        )}

        {question.type === 'short-text' && (
          <input
            type="text"
            value={value}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            className={`${baseClasses} ${errorClasses}`}
            placeholder="Enter your answer..."
          />
        )}

        {question.type === 'long-text' && (
          <textarea
            value={value}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            className={`${baseClasses} ${errorClasses} resize-none`}
            rows={4}
            placeholder="Enter your answer..."
          />
        )}

        {question.type === 'numeric' && (
          <input
            type="number"
            value={value}
            onChange={(e) => {
              // Convert empty string to empty value, otherwise convert to number
              const val = e.target.value === '' ? '' : Number(e.target.value);
              handleResponse(question.id, val);
            }}
            className={`${baseClasses} ${errorClasses}`}
            placeholder="Enter a number..."
            min={question.validation?.min}
            max={question.validation?.max}
          />
        )}

        {question.type === 'file-upload' && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FileText size={32} className="mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
            <input
              type="file"
              accept={question.validation?.acceptedTypes}
              onChange={(e) => handleResponse(question.id, e.target.files[0])}
              className="hidden"
              id={`file_${question.id}`}
            />
            <label
              htmlFor={`file_${question.id}`}
              className="cursor-pointer text-blue-600 hover:text-blue-800"
            >
              Choose File
            </label>
          </div>
        )}

        {/* Validation Errors */}
        {questionErrors.map((error, index) => (
          <p key={index} className="text-red-500 text-sm mt-1">
            {error}
          </p>
        ))}

        {/* Character count for text fields */}
        {(question.type === 'short-text' || question.type === 'long-text') &&
          question.validation?.maxLength && (
            <p className="text-sm text-gray-500 mt-1">
              {value.length}/{question.validation.maxLength} characters
            </p>
          )}
      </div>
    );
  };

  const validateCurrentSection = () => {
    const section = assessment.sections[currentSection];
    const sectionErrors = {};
    let hasErrors = false;

    section.questions.forEach(question => {
      if (isQuestionVisible(question, section.questions)) {
        const questionErrors = validateQuestion(question, responses[question.id]);
        if (questionErrors.length > 0) {
          sectionErrors[question.id] = questionErrors;
          hasErrors = true;
        }
      }
    });

    setErrors(prev => ({
      ...prev,
      ...sectionErrors
    }));

    return !hasErrors;
  };

  const nextSection = () => {
    if (validateCurrentSection()) {
      setCurrentSection(prev => prev + 1);
    }
  };

  const prevSection = () => {
    setCurrentSection(prev => prev - 1);
  };

  if (!assessment.title) {
    return (
      <div className="p-6 text-center">
        <FileText size={48} className="mx-auto mb-4 text-[var(--color-grey)]" />
        <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
          No Assessment to Preview
        </h3>
        <p className="text-[var(--color-grey)]">
          Create sections and questions to see the live preview
        </p>
      </div>
    );
  }

  const section = assessment.sections[currentSection];

  return (
    <div className="h-full bg-[var(--color-secondary)] border-l border-[var(--color-border)] text-[var(--color-text)] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-blue)] flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Live Preview</h2>
          {assessment.settings?.timeLimit && (
            <div className="flex items-center text-sm text-[var(--color-grey)]">
              <Clock size={16} className="mr-1" />
              {assessment.settings.timeLimit} min
            </div>
          )}
        </div>
        <h3 className="text-lg font-semibold">{assessment.title}</h3>
        {assessment.description && (
          <p className="text-[var(--color-grey)] mt-1">{assessment.description}</p>
        )}
      </div>

      {/* Progress Bar */}
      {assessment.sections.length > 1 && (
        <div className="p-4 border-b border-[var(--color-border)] flex-shrink-0">
          <div className="flex justify-between text-sm text-[var(--color-grey)] mb-2">
            <span>Section {currentSection + 1} of {assessment.sections.length}</span>
            <span>{Math.round(((currentSection + 1) / assessment.sections.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-[var(--color-border)] rounded-full h-2">
            <div
              className="bg-[var(--color-grey)] h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSection + 1) / assessment.sections.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Section Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {section ? (
            <>
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2">{section.title}</h4>
                {section.description && (
                  <p className="text-[var(--color-grey)]">{section.description}</p>
                )}
              </div>

              <div className="flex justify-end mb-2">
                <button
                  className="text-xs text-gray-500 hover:text-gray-700"
                  onClick={() => setDebug(!debug)}
                >
                  {debug ? "Hide Debug" : "Debug Mode"}
                </button>
              </div>

              {debug && (
                <div className="mb-6 p-3 bg-gray-100 text-gray-800 rounded text-xs overflow-auto max-h-40">
                  <div><strong>Current Responses:</strong></div>
                  <pre>{JSON.stringify(responses, null, 2)}</pre>
                </div>
              )}

              {section.questions.map(q => renderQuestion(q, section.questions))}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-[var(--color-grey)]">No questions in this section yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation - Fixed at Bottom */}
      <div className="flex-shrink-0 p-6 border-t border-[var(--color-border)] bg-[var(--color-blue)]">
        {/* Previous/Next Section Row */}
        {(currentSection > 0 || currentSection < assessment.sections.length - 1) && (
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={prevSection}
              disabled={currentSection === 0}
              className="px-4 py-2 border border-[var(--color-border)] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--color-secondary)] text-[var(--color-text)] transition-all"
            >
              ← Previous Section
            </button>

            {currentSection < assessment.sections.length - 1 && (
              <button
                onClick={nextSection}
                className="px-6 py-2 bg-[var(--color-secondary)] text-[var(--color-text)] rounded-lg hover:bg-opacity-80 transition-all"
              >
                Next Section →
              </button>
            )}
          </div>
        )}

        {/* Complete Assessment Button - Full Width */}
        {currentSection === assessment.sections.length - 1 && (
          <div className="w-full">
            <BtnWhite
              onClick={() => {
                if (validateCurrentSection()) {
                  showToast.success('🎉 Assessment completed! (In a real app, this would submit the responses)');
                }
              }}
              className="w-full py-4 text-lg font-semibold flex items-center justify-center"
            >
              <CheckCircle size={20} className="mr-2" />
              Complete Assessment
            </BtnWhite>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentPreview;