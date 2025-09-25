// Assessment validation utilities

export const validateQuestion = (question, response) => {
  const errors = [];

  // Required validation
  if (question.required) {
    if (!response || response === '' || (Array.isArray(response) && response.length === 0)) {
      errors.push('This question is required');
      return errors;
    }
  }

  // Skip other validations if no response and not required
  if (!response || response === '') {
    return errors;
  }

  // Type-specific validation
  switch (question.type) {
    case 'numeric':
      const numValue = parseFloat(response);
      if (isNaN(numValue)) {
        errors.push('Please enter a valid number');
      } else {
        if (question.validation?.min !== undefined && numValue < parseFloat(question.validation.min)) {
          errors.push(`Value must be at least ${question.validation.min}`);
        }
        if (question.validation?.max !== undefined && numValue > parseFloat(question.validation.max)) {
          errors.push(`Value must be at most ${question.validation.max}`);
        }
      }
      break;

    case 'short-text':
    case 'long-text':
      if (question.validation?.maxLength && response.length > parseInt(question.validation.maxLength)) {
        errors.push(`Text must be no more than ${question.validation.maxLength} characters`);
      }
      break;

    case 'file-upload':
      if (response instanceof File) {
        // File type validation
        if (question.validation?.acceptedTypes) {
          const acceptedTypes = question.validation.acceptedTypes.split(',').map(t => t.trim());
          const fileExt = '.' + response.name.split('.').pop().toLowerCase();
          if (!acceptedTypes.includes(fileExt)) {
            errors.push(`File type not allowed. Accepted types: ${question.validation.acceptedTypes}`);
          }
        }

        // File size validation (in MB)
        if (question.validation?.maxSize) {
          const maxSizeBytes = parseFloat(question.validation.maxSize) * 1024 * 1024;
          if (response.size > maxSizeBytes) {
            errors.push(`File size must be less than ${question.validation.maxSize}MB`);
          }
        }
      }
      break;

    case 'single-choice':
      if (!question.options?.includes(response)) {
        errors.push('Invalid selection');
      }
      break;

    case 'multi-choice':
      if (!Array.isArray(response)) {
        errors.push('Invalid selection format');
      } else {
        const invalidOptions = response.filter(option => !question.options?.includes(option));
        if (invalidOptions.length > 0) {
          errors.push('Invalid selection(s)');
        }
      }
      break;
  }

  return errors;
};

export const validateSection = (section, responses) => {
  const sectionErrors = {};
  let hasErrors = false;

  section.questions.forEach(question => {
    if (isQuestionVisible(question, responses)) {
      const questionErrors = validateQuestion(question, responses[question.id]);
      if (questionErrors.length > 0) {
        sectionErrors[question.id] = questionErrors;
        hasErrors = true;
      }
    }
  });

  return { errors: sectionErrors, hasErrors };
};

export const validateAssessment = (assessment, responses) => {
  const assessmentErrors = {};
  let totalErrors = 0;

  assessment.sections.forEach(section => {
    const { errors, hasErrors } = validateSection(section, responses);
    if (hasErrors) {
      assessmentErrors[section.id] = errors;
      totalErrors += Object.keys(errors).length;
    }
  });

  return { errors: assessmentErrors, totalErrors };
};

export const isQuestionVisible = (question, responses) => {
  if (!question.conditional?.dependsOn) return true;

  const dependentResponse = responses[question.conditional.dependsOn];
  if (dependentResponse === undefined || dependentResponse === null) return false;

  switch (question.conditional.condition) {
    case 'equals':
      return dependentResponse === question.conditional.value;
    case 'not_equals':
      return dependentResponse !== question.conditional.value;
    case 'contains':
      if (typeof dependentResponse === 'string') {
        return dependentResponse.includes(question.conditional.value);
      }
      if (Array.isArray(dependentResponse)) {
        return dependentResponse.includes(question.conditional.value);
      }
      return false;
    default:
      return true;
  }
};

export const calculateProgress = (assessment, responses) => {
  let totalQuestions = 0;
  let answeredQuestions = 0;

  assessment.sections.forEach(section => {
    section.questions.forEach(question => {
      if (isQuestionVisible(question, responses)) {
        totalQuestions++;
        const response = responses[question.id];
        if (response !== undefined && response !== '' && response !== null) {
          if (Array.isArray(response) && response.length > 0) {
            answeredQuestions++;
          } else if (!Array.isArray(response)) {
            answeredQuestions++;
          }
        }
      }
    });
  });

  return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
};

export const exportAssessmentData = (assessment) => {
  // Create a simplified export format
  return {
    title: assessment.title,
    description: assessment.description,
    sections: assessment.sections.map(section => ({
      title: section.title,
      description: section.description,
      questions: section.questions.map(question => ({
        type: question.type,
        text: question.text,
        required: question.required,
        options: question.options,
        validation: question.validation,
        conditional: question.conditional
      }))
    })),
    settings: assessment.settings
  };
};
