import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, Save, FileText, Download, Clock, AlertCircle, BarChart3, Copy, Edit, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import BtnWhite from './BtnWhite';
import { fetchAssessments, fetchAllAssessments, upsertAssessmentsForJob, saveAssessmentDraft } from '../api/assessments.js';
import { fetchJobs } from '../api/jobs';
import { exportAssessmentData } from '../utils/assessmentValidation';
import { useAssessmentStore } from '../hooks/usePersistence';
import { db } from '../app/db/index.js';
import { showToast } from '../utils/toast.js';

// Assessment Preview Form Component with Runtime Validation
const AssessmentPreviewForm = ({ assessment }) => {
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  const currentSection = assessment.sections[currentSectionIndex];

  // Check if question should be shown based on conditional logic
  const shouldShowQuestion = (question) => {
    if (!question.conditional?.enabled || !question.conditional?.dependsOn) {
      return true;
    }

    const dependentAnswer = formData[question.conditional.dependsOn];
    const operator = question.conditional.operator || 'equals';
    const expectedValue = question.conditional.value;

    if (!dependentAnswer) return false;

    switch (operator) {
      case 'equals':
        return dependentAnswer === expectedValue;
      case 'not_equals':
        return dependentAnswer !== expectedValue;
      case 'contains':
        return dependentAnswer.toString().toLowerCase().includes(expectedValue.toLowerCase());
      default:
        return dependentAnswer === expectedValue;
    }
  };

  // Validate a single question
  const validateQuestion = (question, value) => {
    const errors = [];
    const validation = question.validation || {};

    if (validation.required && (!value || value.toString().trim() === '')) {
      errors.push('This field is required');
    }

    if (question.type === 'numeric' && value) {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        errors.push('Please enter a valid number');
      } else {
        if (validation.minValue !== null && validation.minValue !== undefined && numValue < validation.minValue) {
          errors.push(`Value must be at least ${validation.minValue}`);
        }
        if (validation.maxValue !== null && validation.maxValue !== undefined && numValue > validation.maxValue) {
          errors.push(`Value must be at most ${validation.maxValue}`);
        }
      }
    }

    if ((question.type === 'short-text' || question.type === 'long-text') && value) {
      if (validation.minLength && value.length < validation.minLength) {
        errors.push(`Minimum ${validation.minLength} characters required`);
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        errors.push(`Maximum ${validation.maxLength} characters allowed`);
      }
    }

    return errors;
  };

  // Handle form input changes
  const handleInputChange = (questionId, value) => {
    setFormData(prev => ({ ...prev, [questionId]: value }));

    // Clear validation errors for this question
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[questionId];
      return newErrors;
    });
  };

  // Render different question types
  const renderQuestion = (question, questionIndex) => {
    if (!shouldShowQuestion(question)) return null;

    const value = formData[question.id] || '';
    const errors = validationErrors[question.id] || [];
    const hasError = errors.length > 0;

    return (
      <div key={question.id} className="mb-6 p-4 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg">
        <div className="mb-3">
          <label className="block text-white font-medium mb-2">
            {questionIndex + 1}. {question.text}
            {question.validation?.required && <span className="text-red-400 ml-1">*</span>}
          </label>
          {hasError && (
            <div className="text-red-400 text-sm mb-2">
              {errors.map((error, idx) => (
                <div key={idx}>{error}</div>
              ))}
            </div>
          )}
        </div>

        {question.type === 'single-choice' && (
          <div className="space-y-2">
            {question.options?.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-blue)]/50 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="w-4 h-4 text-[var(--color-primary)] bg-[var(--color-secondary)] border-[var(--color-border)]"
                />
                <span className="text-[var(--color-dark-grey)]">{option}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'multiple-choice' && (
          <div className="space-y-2">
            {question.options?.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-blue)]/50 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={(value || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = value || [];
                    if (e.target.checked) {
                      handleInputChange(question.id, [...currentValues, option]);
                    } else {
                      handleInputChange(question.id, currentValues.filter(v => v !== option));
                    }
                  }}
                  className="w-4 h-4 text-[var(--color-primary)] bg-[var(--color-secondary)] border-[var(--color-border)] rounded"
                />
                <span className="text-[var(--color-dark-grey)]">{option}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'short-text' && (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder="Enter your answer..."
            className={`w-full p-3 bg-[var(--color-secondary)] border rounded-lg text-white placeholder-[var(--color-dark-grey)] focus:ring-2 focus:ring-[var(--color-primary)] ${hasError ? 'border-red-400' : 'border-[var(--color-border)]'
              }`}
          />
        )}

        {question.type === 'long-text' && (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder="Enter your detailed answer..."
            rows={4}
            className={`w-full p-3 bg-[var(--color-secondary)] border rounded-lg text-white placeholder-[var(--color-dark-grey)] focus:ring-2 focus:ring-[var(--color-primary)] resize-none ${hasError ? 'border-red-400' : 'border-[var(--color-border)]'
              }`}
          />
        )}

        {question.type === 'numeric' && (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder="Enter a number..."
            min={question.validation?.minValue}
            max={question.validation?.maxValue}
            className={`w-full p-3 bg-[var(--color-secondary)] border rounded-lg text-white placeholder-[var(--color-dark-grey)] focus:ring-2 focus:ring-[var(--color-primary)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${hasError ? 'border-red-400' : 'border-[var(--color-border)]'
              }`}
          />
        )}

        {question.type === 'file-upload' && (
          <div className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-6 text-center">
            <input
              type="file"
              accept={question.validation?.fileTypes}
              onChange={(e) => handleInputChange(question.id, e.target.files[0]?.name || '')}
              className="hidden"
              id={`file-${question.id}`}
            />
            <label htmlFor={`file-${question.id}`} className="cursor-pointer">
              <div className="text-[var(--color-dark-grey)] mb-2">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="text-sm text-[var(--color-grey)]">
                {value || 'Click to upload file'}
              </div>
              {question.validation?.fileTypes && (
                <div className="text-xs text-[var(--color-dark-grey)] mt-1">
                  Accepted: {question.validation.fileTypes}
                </div>
              )}
            </label>
          </div>
        )}

        {/* Character count for text fields */}
        {(question.type === 'short-text' || question.type === 'long-text') && (question.validation?.minLength || question.validation?.maxLength) && (
          <div className="text-xs text-[var(--color-dark-grey)] mt-1 text-right">
            <span className={`${(question.validation?.minLength && value.length < question.validation.minLength) ||
                (question.validation?.maxLength && value.length > question.validation.maxLength)
                ? 'text-red-400' : 'text-[var(--color-dark-grey)]'
              }`}>
              {value.length}
              {question.validation?.minLength && ` (min: ${question.validation.minLength})`}
              {question.validation?.maxLength && ` / ${question.validation.maxLength}`}
              {' characters'}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Validate current section
  const validateCurrentSection = () => {
    const errors = {};
    const visibleQuestions = currentSection.questions.filter(shouldShowQuestion);

    visibleQuestions.forEach(question => {
      const value = formData[question.id];
      const questionErrors = validateQuestion(question, value);
      if (questionErrors.length > 0) {
        errors[question.id] = questionErrors;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Navigate to next section or complete assessment
  const handleNext = () => {
    if (validateCurrentSection()) {
      if (currentSectionIndex < assessment.sections.length - 1) {
        setCurrentSectionIndex(prev => prev + 1);
      } else {
        // Assessment completed
        showToast.success('Assessment completed successfully!');
      }
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  if (!currentSection) return null;

  const visibleQuestions = currentSection.questions.filter(shouldShowQuestion);
  const isLastSection = currentSectionIndex === assessment.sections.length - 1;

  return (
    <div className="bg-[var(--color-blue)] border border-[var(--color-border)] rounded-xl p-6">
      <h4 className="text-xl font-bold text-white mb-2">{assessment.title}</h4>
      <p className="text-[var(--color-dark-grey)] text-sm mb-4">
        Assessment preview - try filling out the form
      </p>

      <div className="mb-6">
        <div className="text-sm text-[var(--color-dark-grey)] mb-2">
          Section {currentSectionIndex + 1} of {assessment.sections.length}
        </div>
        <h5 className="font-semibold text-white mb-4">
          {currentSection.description || `Section ${currentSectionIndex + 1}`}
        </h5>

        {/* Progress bar */}
        <div className="w-full bg-[var(--color-background)] rounded-full h-2 mb-6">
          <div
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentSectionIndex + 1) / assessment.sections.length) * 100}%` }}
          />
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {visibleQuestions.map((question, index) => renderQuestion(question, index))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-[var(--color-border)]">
          <button
            onClick={handlePrevious}
            disabled={currentSectionIndex === 0}
            className="px-4 py-2 text-[var(--color-dark-grey)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <span className="text-sm text-[var(--color-dark-grey)]">
            {visibleQuestions.length} question{visibleQuestions.length !== 1 ? 's' : ''}
          </span>
          {isLastSection ? (
            <BtnWhite
              label="Complete Assessment"
              onClick={handleNext}
              className="px-6 py-3"
            />
          ) : (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white rounded-lg hover:shadow-lg hover:shadow-pink-500/25 transition-all"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const AssessmentBuilder = ({ jobId, existingAssessment }) => {
  const queryClient = useQueryClient();

  // Use the new assessment store with persistence
  const {
    assessment,
    existingDrafts,
    isLoading: isStoreLoading,
    isSaving: isStoreSaving,
    lastSaved,
    error: storeError,
    updateAssessment,
    saveDraft,
    loadDraft,
    deleteDraft,
    loadAllDrafts,
    forceSave
  } = useAssessmentStore(jobId, existingAssessment);

  const [showPreview, setShowPreview] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [jobOptions, setJobOptions] = useState([]);
  const [publishedAssessments, setPublishedAssessments] = useState([]);
  const [draftAssessments, setDraftAssessments] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedJobIdFilter, setSelectedJobIdFilter] = useState(jobId || null); // For filtering assessments

  // Helper function to get job title by ID
  const getJobTitle = (jobId) => {
    if (!jobId) return null;
    const job = jobOptions.find(j => j.id === Number(jobId));
    return job ? job.title : `Job ID: ${jobId}`;
  };

  // Helper function to load all assessments (published and drafts) based on filter
  const loadAllAssessments = async () => {
    if (selectedJobIdFilter) {
      try {
        const allAssessments = await fetchAssessments(Number(selectedJobIdFilter));
        console.log('Loaded assessments for job', selectedJobIdFilter, ':', allAssessments);

        const published = (allAssessments || []).filter(a => a && !a.isDraft);
        const drafts = (allAssessments || []).filter(a => a && a.isDraft);

        setPublishedAssessments(published);
        setDraftAssessments(drafts);

        console.log('Published:', published);
        console.log('Drafts:', drafts);

      } catch (e) {
        console.error('Failed to load assessments', e);
      }
    } else {
      // Load all assessments when no specific jobId is selected
      try {
        const allAssessments = await fetchAllAssessments();
        console.log('Loaded all assessments:', allAssessments);

        const published = (allAssessments || []).filter(a => a && !a.isDraft);
        const drafts = (allAssessments || []).filter(a => a && a.isDraft);

        setPublishedAssessments(published);
        setDraftAssessments(drafts);

      } catch (e) {
        console.error('Failed to load all assessments', e);
      }
    }
  };

  const createNewAssessment = () => {
    const blank = {
      id: Date.now(), // Generate unique ID for new assessments
      title: '',
      description: '',
      jobId: selectedJobIdFilter || jobId || null, // Use selectedJobIdFilter first
      sections: [],
      settings: { timeLimit: null, randomizeQuestions: false, showResults: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    updateAssessment(blank);
    setActiveSection(0);
    setActiveIdx(-1);
    setShowForm(true);
    setShowPreview(false);
  };

  // Mutations for publishing assessments (final save)
  const { mutate: publishAssessmentMutation, isLoading: isPublishing } = useMutation({
    mutationFn: async (assessmentData) => {
      const targetJobId = assessmentData.jobId || jobId;
      if (!targetJobId) throw new Error('Please select a Job before publishing');

      const assessmentToPublish = {
        ...assessmentData,
        id: assessmentData.id || Date.now(),
        jobId: Number(targetJobId),
        createdAt: assessmentData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Publishing assessment:', assessmentToPublish);

      // Check if this is a draft being published
      const isDraftBeingPublished = draftAssessments.some(draft => draft.id === assessmentToPublish.id);

      const result = await upsertAssessmentsForJob(Number(targetJobId), [assessmentToPublish]);

      return { result, wasDraft: isDraftBeingPublished };
    },
    onSuccess: async ({ result, wasDraft }) => {
      console.log('Publishing successful, wasDraft:', wasDraft);
      console.log('Publishing result:', result);

      // Force cache invalidation for all assessment queries
      queryClient.invalidateQueries(['assessments']);
      queryClient.removeQueries(['assessments']);

      // Wait longer for database operations to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Force a fresh fetch by clearing local state first
      setPublishedAssessments([]);
      setDraftAssessments([]);

      // Refresh the assessments list (both published and drafts)
      console.log('🔄 Refreshing assessments list...');
      await loadAllAssessments();

      // Force a re-render with another delay
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log('🔄 Final state refresh...');
      await loadAllAssessments();

      // Show success toast instead of alert
      showToast.assessment.published(wasDraft);

      // Reset to dashboard after publishing to show the updated list
      setShowForm(false);
      setShowPreview(false);
      setActiveIdx(-1);

      // Clear the current assessment state to force refresh
      updateAssessment({
        id: null,
        title: '',
        description: '',
        jobId: selectedJobIdFilter || jobId || null,
        sections: [],
        settings: { timeLimit: null, randomizeQuestions: false, showResults: true },
        createdAt: null,
        updatedAt: null
      });
    },
    onError: (error) => {
      console.error('Error publishing assessment:', error);
      showToast.assessment.publishError();
    }
  });

  // Load jobs and published assessments on mount
  useEffect(() => {
    const init = async () => {
      // Debug: Test database connection
      try {
        console.log('Testing database connection...');
        const testCount = await db.assessmentDrafts.count();
        console.log('assessmentDrafts table count:', testCount);

        const allDrafts = await db.assessmentDrafts.toArray();
        console.log('All existing drafts in DB:', allDrafts);
      } catch (err) {
        console.error('Database connection test failed:', err);
      }

      // Load jobs for dropdown and title display
      try {
        const jobsRes = await fetchJobs({ page: 1, pageSize: 100, sort: 'order' });
        setJobOptions(jobsRes.data || []);
      } catch (e) {
        console.error('Failed to load jobs', e);
      }

      // Load assessments (both published and drafts) based on selectedJobIdFilter
      await loadAllAssessments();

      // We still call loadAllDrafts to initialize the persistence hook state
      await loadAllDrafts();

      // Handle initial form state
      if (!isInitialized) {
        if (existingAssessment) {
          updateAssessment(existingAssessment);
          setShowForm(true);
        } else {
          setShowForm(false); // Start with dashboard by default
        }
        setIsInitialized(true);
      }
    };

    init();
  }, [jobId, existingAssessment, selectedJobIdFilter]); // Add selectedJobIdFilter to dependencies

  // Section management functions (now use updateAssessment for persistence)
  const addSection = () => {
    const newSection = {
      id: Date.now(),
      title: `Section ${assessment.sections.length + 1}`,
      description: '',
      questions: []
    };

    updateAssessment(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    setActiveSection(assessment.sections.length);
  };

  const updateSection = (sectionId, updates) => {
    updateAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  };

  const deleteSection = (sectionId) => {
    updateAssessment(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
  };

  const addQuestion = (sectionId, question) => {
    updateAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, questions: [...section.questions, { ...question, id: Date.now() }] }
          : section
      )
    }));
  };

  const updateQuestion = (sectionId, questionId, updates) => {
    updateAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
            ...section,
            questions: section.questions.map(q =>
              q.id === questionId ? { ...q, ...updates } : q
            )
          }
          : section
      )
    }));
  };

  const deleteQuestion = (sectionId, questionId) => {
    updateAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, questions: section.questions.filter(q => q.id !== questionId) }
          : section
      )
    }));
  };

  // Assessment actions
  const saveAssessmentAsDraft = async () => {
    try {
      // Ensure assessment has proper jobId
      const targetJobId = assessment.jobId || selectedJobIdFilter || jobId;
      if (!targetJobId) {
        showToast.warning('Please select a job before saving the draft');
        return;
      }

      // Ensure assessment has an ID for proper draft management
      let updatedAssessment = assessment;
      if (!assessment.id) {
        const timestamp = Date.now();
        updatedAssessment = { ...assessment, id: timestamp, jobId: Number(targetJobId) };
        updateAssessment(updatedAssessment);
      } else {
        updatedAssessment = { ...assessment, jobId: Number(targetJobId) };
      }

      console.log('Saving draft via API:', updatedAssessment);

      // Use the API to save the draft instead of direct persistence
      await saveAssessmentDraft(Number(targetJobId), updatedAssessment);

      showToast.assessment.draftSaved();

      // Reload all assessments to show the new draft
      await loadAllAssessments();

    } catch (error) {
      console.error('Failed to save draft:', error);
      showToast.assessment.saveError();
    }
  };

  const publishAssessment = async () => {
    // Validate assessment before publishing
    if (!assessment.title.trim()) {
      showToast.warning('Please enter an assessment title');
      return;
    }

    if (!assessment.sections.length) {
      showToast.warning('Please add at least one section');
      return;
    }

    const hasQuestions = assessment.sections.some(section => section.questions.length > 0);
    if (!hasQuestions) {
      showToast.warning('Please add at least one question');
      return;
    }

    // Publish the assessment (make it available for candidates)
    publishAssessmentMutation(assessment);
  };

  const exportAssessment = () => {
    const exportData = exportAssessmentData(assessment);
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${assessment.title || 'assessment'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const currentSection = assessment.sections[activeSection];

  // Helper function to duplicate an assessment
  const duplicateAssessment = (assessment) => {
    const duplicatedAssessment = {
      ...assessment,
      id: Date.now(),
      title: `${assessment.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    updateAssessment(duplicatedAssessment);
    setShowForm(true);
    setShowPreview(false);
    setActiveSection(0);
    showToast.assessment.duplicated();
  };

  // Additional helper functions for the new UI
  const removeSection = (sectionIndex) => {
    updateAssessment(prev => ({
      ...prev,
      sections: prev.sections.filter((_, index) => index !== sectionIndex)
    }));
    if (activeSection >= assessment.sections.length - 1) {
      setActiveSection(Math.max(0, assessment.sections.length - 2));
    }
  };

  const moveQuestion = (sectionIndex, fromIndex, toIndex) => {
    updateAssessment(prev => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex
          ? {
            ...section,
            questions: (() => {
              const newQuestions = [...section.questions];
              const [movedQuestion] = newQuestions.splice(fromIndex, 1);
              newQuestions.splice(toIndex, 0, movedQuestion);
              return newQuestions;
            })()
          }
          : section
      )
    }));
  };

  const removeQuestion = (sectionIndex, questionIndex) => {
    updateAssessment(prev => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex
          ? { ...section, questions: section.questions.filter((_, qIndex) => qIndex !== questionIndex) }
          : section
      )
    }));
  };

  const addQuestionOption = (sectionIndex, questionIndex) => {
    updateAssessment(prev => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex
          ? {
            ...section,
            questions: section.questions.map((question, qIndex) =>
              qIndex === questionIndex
                ? { ...question, options: [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`] }
                : question
            )
          }
          : section
      )
    }));
  };

  const removeQuestionOption = (sectionIndex, questionIndex, optionIndex) => {
    updateAssessment(prev => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex
          ? {
            ...section,
            questions: section.questions.map((question, qIndex) =>
              qIndex === questionIndex
                ? { ...question, options: question.options?.filter((_, oIndex) => oIndex !== optionIndex) }
                : question
            )
          }
          : section
      )
    }));
  };

  const updateQuestionOption = (sectionIndex, questionIndex, optionIndex, value) => {
    updateAssessment(prev => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex
          ? {
            ...section,
            questions: section.questions.map((question, qIndex) =>
              qIndex === questionIndex
                ? {
                  ...question,
                  options: question.options?.map((option, oIndex) =>
                    oIndex === optionIndex ? value : option
                  )
                }
                : question
            )
          }
          : section
      )
    }));
  };

  // Updated updateQuestion function for new UI
  const updateQuestionForUI = (sectionIndex, questionIndex, field, value) => {
    updateAssessment(prev => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex
          ? {
            ...section,
            questions: section.questions.map((question, qIndex) =>
              qIndex === questionIndex ? { ...question, [field]: value } : question
            )
          }
          : section
      )
    }));
  };

  // Updated updateSection function for new UI
  const updateSectionForUI = (sectionIndex, field, value) => {
    updateAssessment(prev => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex ? { ...section, [field]: value } : section
      )
    }));
  };

  // Main Dashboard View (when no form is shown)
  const renderDashboard = () => (
    <div className="p-6 md:p-10 min-h-screen bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between md:items-center mb-8">
          <div>
            <h2 className="w-fit text-5xl font-bold my-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Assessments</h2>
            <p className="text-[var(--color-dark-grey)] mt-1">Manage and create assessments for your job openings.</p>
          </div>
          <button
            onClick={createNewAssessment}
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 mt-4 md:mt-0 hover:shadow-lg hover:shadow-pink-500/25 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Assessment</span>
          </button>
        </header>

        {/* Job Filter */}
        <div className="mb-8">
          <label htmlFor="job-filter" className="text-sm font-medium text-[var(--color-dark-grey)] mb-2 block">Filter by job</label>
          <select
            id="job-filter"
            value={selectedJobIdFilter || ''}
            onChange={(e) => setSelectedJobIdFilter(e.target.value ? Number(e.target.value) : null)}
            className="w-full md:w-72 bg-[var(--color-blue)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
          >
            <option value="">All Jobs</option>
            {jobOptions.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>

        {/* Loading indicator */}
        {isStoreLoading && (
          <div className="text-center py-8">
            <div className="animate-spin mx-auto mb-4 w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full"></div>
            <p className="text-[var(--color-dark-grey)]">Loading assessments...</p>
          </div>
        )}

        {/* Error message */}
        {storeError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{storeError}</span>
            </div>
          </div>
        )}

        {/* Assessment Cards with Separate Sections */}
        {(draftAssessments.filter(draft =>
          !selectedJobIdFilter || draft.jobId === Number(selectedJobIdFilter)
        ).length > 0 || publishedAssessments.length > 0) ? (
          <div className="space-y-10">
            {/* Draft Assessments Section */}
            {draftAssessments.filter(draft =>
              !selectedJobIdFilter || draft.jobId === Number(selectedJobIdFilter)
            ).length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <h3 className="text-xl font-semibold text-white">Draft Assessments</h3>
                    <span className="bg-yellow-500/10 text-yellow-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {draftAssessments.filter(draft =>
                        !selectedJobIdFilter || draft.jobId === Number(selectedJobIdFilter)
                      ).length} draft{draftAssessments.filter(draft =>
                        !selectedJobIdFilter || draft.jobId === Number(selectedJobIdFilter)
                      ).length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {draftAssessments.filter(draft =>
                      !selectedJobIdFilter || draft.jobId === Number(selectedJobIdFilter)
                    ).map((draft, idx) => (
                      <div
                        key={`draft-${draft.id}`}
                        className="bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-xl p-6 flex flex-col hover:border-yellow-400/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300 cursor-pointer transform hover:scale-105"
                        onClick={() => {
                          updateAssessment(draft);
                          setActiveIdx(idx);
                          setActiveSection(0);
                          setShowForm(true);
                        }}
                      >
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-white">{draft.title || 'Untitled Assessment'}</h3>
                        </div>
                        <div className="mb-4">
                          <span className="inline-block bg-yellow-500/10 text-yellow-400 text-xs font-semibold px-2.5 py-1 rounded-full mr-2">DRAFT</span>
                          {draft.jobId && getJobTitle(draft.jobId) && (
                            <span className="inline-block bg-blue-500/10 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                              {getJobTitle(draft.jobId)}
                            </span>
                          )}
                        </div>
                        {draft.description && (
                          <p className="text-[var(--color-dark-grey)] text-sm flex-grow mb-4">{draft.description}</p>
                        )}
                        <div className="border-t border-[var(--color-border)] mt-4 pt-4 flex justify-between items-center text-sm text-[var(--color-dark-grey)]">
                          <span>
                            {(draft.sections?.length || 0)} Section{(draft.sections?.length || 0) !== 1 ? 's' : ''}, {' '}
                            {draft.sections?.reduce((total, section) => total + (section.questions?.length || 0), 0) || 0} Question{(draft.sections?.reduce((total, section) => total + (section.questions?.length || 0), 0) || 0) !== 1 ? 's' : ''}
                          </span>
                          <span>Last modified: {new Date(draft.lastModified).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Published Assessments Section */}
            {publishedAssessments.filter(assessment =>
              assessment && assessment.id && (!selectedJobIdFilter || assessment.jobId === Number(selectedJobIdFilter))
            ).length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <h3 className="text-xl font-semibold text-white">Published Assessments</h3>
                    <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-semibold px-2.5 py-1 rounded-full">
                      {publishedAssessments.filter(assessment =>
                        assessment && assessment.id && (!selectedJobIdFilter || assessment.jobId === Number(selectedJobIdFilter))
                      ).length} published
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {publishedAssessments.filter(assessment =>
                      assessment && assessment.id && (!selectedJobIdFilter || assessment.jobId === Number(selectedJobIdFilter))
                    ).map((assessment, idx) => (
                      <div
                        key={`published-${assessment.id}`}
                        className="bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-xl p-6 flex flex-col hover:border-[var(--color-primary)]/50 hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300 cursor-pointer transform hover:scale-105"
                        onClick={() => {
                          updateAssessment(assessment);
                          setActiveIdx(idx);
                          setActiveSection(0);
                          setShowForm(true);
                        }}
                      >
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-white">{assessment.title || 'Untitled Assessment'}</h3>
                        </div>
                        <div className="mb-4">
                          <span className="inline-block bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-semibold px-2.5 py-1 rounded-full mr-2">PUBLISHED</span>
                          {assessment.jobId && getJobTitle(assessment.jobId) && (
                            <span className="inline-block bg-purple-500/10 text-purple-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                              {getJobTitle(assessment.jobId)}
                            </span>
                          )}
                        </div>
                        {assessment.description && (
                          <p className="text-[var(--color-dark-grey)] text-sm flex-grow mb-4">{assessment.description}</p>
                        )}
                        <div className="border-t border-[var(--color-border)] mt-4 pt-4 flex justify-between items-center text-sm text-[var(--color-dark-grey)]">
                          <span>
                            {(assessment.sections?.length || 0)} Section{(assessment.sections?.length || 0) !== 1 ? 's' : ''}, {' '}
                            {assessment.sections?.reduce((total, section) => total + (section.questions?.length || 0), 0) || 0} Question{(assessment.sections?.reduce((total, section) => total + (section.questions?.length || 0), 0) || 0) !== 1 ? 's' : ''}
                          </span>
                          <span>Published: {new Date(assessment.updatedAt || assessment.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        ) : (
          /* Empty state */
          !isStoreLoading && (
            <div className="flex flex-col items-center justify-center py-20 px-8">
              {/* Icon */}
              <div className="mb-8 p-6 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-2xl">
                <FileText size={64} className="text-[var(--color-primary)]" />
              </div>

              {/* Content */}
              <div className="text-center max-w-lg">
                <h3 className="text-2xl font-bold text-white mb-4">Assessment Builder</h3>
                <p className="text-[var(--color-dark-grey)] text-lg leading-relaxed mb-8">
                  Create comprehensive assessments for your job positions. Add sections, questions, and conditional logic to build engaging evaluations.
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={createNewAssessment}
                className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] hover:shadow-lg hover:shadow-pink-500/25 text-white font-semibold py-4 px-8 rounded-lg flex items-center justify-center space-x-3 transition-all transform hover:scale-105"
              >
                <Plus className="w-6 h-6" />
                <span className="text-lg">Create New Assessment</span>
              </button>

              {/* Optional subtitle */}
              {selectedJobIdFilter && (
                <div className="mt-6 px-4 py-2 bg-[var(--color-blue)] border border-[var(--color-border)] rounded-lg">
                  <p className="text-[var(--color-grey)] text-sm">
                    No assessments found for <span className="text-white font-medium">{getJobTitle(selectedJobIdFilter)}</span>
                  </p>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );

  // Form View (when creating/editing assessment)
  const renderForm = () => (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      {/* Top Navigation Bar */}
      <div className="bg-[var(--color-secondary)] border-b border-[var(--color-border)] px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowForm(false)}
              className="flex items-center justify-center w-10 h-10 bg-[var(--color-blue)] hover:bg-[var(--color-border)] text-[var(--color-grey)] hover:text-white rounded-lg transition-all duration-200 hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-white">Assessment Builder</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={saveAssessmentAsDraft}
              disabled={isStoreSaving}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-blue)] text-white rounded-lg hover:bg-opacity-80 disabled:opacity-50 transition-all"
            >
              <Save size={16} />
              {isStoreSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={publishAssessment}
              disabled={isPublishing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white rounded-lg hover:shadow-lg hover:shadow-pink-500/25 disabled:opacity-50 transition-all"
            >
              <FileText size={16} />
              {isPublishing ? 'Publishing...' : 'Publish Assessment'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Builder */}
        <div className="flex-1 bg-[var(--color-background)] overflow-y-auto">
          <div className="p-8 max-w-4xl mx-auto">
            {/* Assessment Header */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-dark-grey)] mb-2">
                    Assessment Title
                  </label>
                  <input
                    type="text"
                    placeholder="UI/UX Design Principles"
                    value={assessment.title}
                    onChange={(e) => updateAssessment(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg text-white placeholder-[var(--color-dark-grey)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-dark-grey)] mb-2">
                    Assign to Job
                  </label>
                  <select
                    value={assessment.jobId || ''}
                    onChange={(e) => updateAssessment(prev => ({ ...prev, jobId: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full p-3 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  >
                    <option value="">Select a job...</option>
                    {jobOptions.map(j => (
                      <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-6">
              {assessment.sections.map((section, sectionIndex) => (
                <div key={section.id} className="bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                  {/* Section Header */}
                  <div className="p-6 border-b border-[var(--color-border)]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white">Section {sectionIndex + 1}</h3>
                      <button
                        onClick={() => removeSection(sectionIndex)}
                        className="p-2 text-[var(--color-dark-grey)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Section description..."
                      value={section.description || ''}
                      onChange={(e) => updateSectionForUI(sectionIndex, 'description', e.target.value)}
                      className="w-full p-3 bg-[var(--color-blue)] border border-[var(--color-border)] rounded-lg text-white placeholder-[var(--color-dark-grey)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
                  </div>

                  {/* Questions */}
                  <div className="p-6 space-y-6">
                    {section.questions.map((question, questionIndex) => (
                      <div key={question.id} className="bg-[var(--color-blue)] border border-[var(--color-border)] rounded-lg p-6">
                        {/* Question Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => moveQuestion(sectionIndex, questionIndex, Math.max(0, questionIndex - 1))}
                                disabled={questionIndex === 0}
                                className="text-[var(--color-dark-grey)] hover:text-[var(--color-yellow)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="Move up"
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                onClick={() => moveQuestion(sectionIndex, questionIndex, Math.min(section.questions.length - 1, questionIndex + 1))}
                                disabled={questionIndex === section.questions.length - 1}
                                className="text-[var(--color-dark-grey)] hover:text-[var(--color-yellow)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="Move down"
                              >
                                <ArrowDown size={14} />
                              </button>
                            </div>
                            <GripVertical size={16} className="text-[var(--color-dark-grey)] cursor-move" title="Drag to reorder" />
                            <h4 className="text-lg font-medium text-white">Question {questionIndex + 1}</h4>
                          </div>
                          <button
                            onClick={() => removeQuestion(sectionIndex, questionIndex)}
                            className="p-2 text-[var(--color-dark-grey)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Question Type */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-[var(--color-dark-grey)] mb-2">
                            Question Type
                          </label>
                          <select
                            value={question.type}
                            onChange={(e) => updateQuestionForUI(sectionIndex, questionIndex, 'type', e.target.value)}
                            className="w-full p-3 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                          >
                            <option value="single-choice">Single Choice</option>
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="short-text">Short Text</option>
                            <option value="long-text">Long Text</option>
                            <option value="numeric">Numeric</option>
                            <option value="file-upload">File Upload</option>
                          </select>
                        </div>

                        {/* Question Text */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-[var(--color-dark-grey)] mb-2">
                            Question Text
                          </label>
                          <textarea
                            placeholder="Enter your question here..."
                            value={question.text}
                            onChange={(e) => updateQuestionForUI(sectionIndex, questionIndex, 'text', e.target.value)}
                            rows={3}
                            className="w-full p-3 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg text-white placeholder-[var(--color-dark-grey)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
                          />
                        </div>

                        {/* Validation Rules */}
                        <div className="mb-6 p-4 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg">
                          <h5 className="text-sm font-medium text-[var(--color-dark-grey)] mb-3">Validation Rules</h5>
                          <div className="space-y-3">
                            {/* Required Field */}
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={question.validation?.required || false}
                                onChange={(e) => updateQuestionForUI(sectionIndex, questionIndex, 'validation', {
                                  ...question.validation,
                                  required: e.target.checked
                                })}
                                className="w-4 h-4 text-[var(--color-primary)] bg-[var(--color-secondary)] border-[var(--color-border)] rounded focus:ring-[var(--color-primary)]"
                              />
                              <span className="text-sm text-white">Required field</span>
                            </label>

                            {/* Text Length Validation for text fields */}
                            {(question.type === 'short-text' || question.type === 'long-text') && (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-[var(--color-dark-grey)] mb-1">
                                    Min Length
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="0"
                                    min="0"
                                    value={question.validation?.minLength || ''}
                                    onChange={(e) => updateQuestionForUI(sectionIndex, questionIndex, 'validation', {
                                      ...question.validation,
                                      minLength: e.target.value ? parseInt(e.target.value) : null
                                    })}
                                    className="w-full p-2 text-sm bg-[var(--color-secondary)] border border-[var(--color-border)] rounded text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-[var(--color-dark-grey)] mb-1">
                                    Max Length
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="500"
                                    min="1"
                                    value={question.validation?.maxLength || ''}
                                    onChange={(e) => updateQuestionForUI(sectionIndex, questionIndex, 'validation', {
                                      ...question.validation,
                                      maxLength: e.target.value ? parseInt(e.target.value) : null
                                    })}
                                    className="w-full p-2 text-sm bg-[var(--color-secondary)] border border-[var(--color-border)] rounded text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Numeric Range */}
                            {question.type === 'numeric' && (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-[var(--color-dark-grey)] mb-1">
                                    Min Value
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="0"
                                    value={question.validation?.minValue || ''}
                                    onChange={(e) => updateQuestionForUI(sectionIndex, questionIndex, 'validation', {
                                      ...question.validation,
                                      minValue: e.target.value ? parseFloat(e.target.value) : null
                                    })}
                                    className="w-full p-2 text-sm bg-[var(--color-secondary)] border border-[var(--color-border)] rounded text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-[var(--color-dark-grey)] mb-1">
                                    Max Value
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="100"
                                    value={question.validation?.maxValue || ''}
                                    onChange={(e) => updateQuestionForUI(sectionIndex, questionIndex, 'validation', {
                                      ...question.validation,
                                      maxValue: e.target.value ? parseFloat(e.target.value) : null
                                    })}
                                    className="w-full p-2 text-sm bg-[var(--color-secondary)] border border-[var(--color-border)] rounded text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                </div>
                              </div>
                            )}

                            {/* File Upload Settings */}
                            {question.type === 'file-upload' && (
                              <div>
                                <label className="block text-xs font-medium text-[var(--color-dark-grey)] mb-1">
                                  Accepted File Types
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., .pdf,.doc,.docx"
                                  value={question.validation?.fileTypes || ''}
                                  onChange={(e) => updateQuestionForUI(sectionIndex, questionIndex, 'validation', {
                                    ...question.validation,
                                    fileTypes: e.target.value
                                  })}
                                  className="w-full p-2 text-sm bg-[var(--color-secondary)] border border-[var(--color-border)] rounded text-white"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Conditional Logic */}
                        <div className="mb-6 p-4 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg">
                          <h5 className="text-sm font-medium text-[var(--color-dark-grey)] mb-3">Conditional Logic</h5>
                          <div className="space-y-3">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={question.conditional?.enabled || false}
                                onChange={(e) => updateQuestionForUI(sectionIndex, questionIndex, 'conditional', {
                                  ...question.conditional,
                                  enabled: e.target.checked
                                })}
                                className="w-4 h-4 text-[var(--color-primary)] bg-[var(--color-secondary)] border-[var(--color-border)] rounded focus:ring-[var(--color-primary)]"
                              />
                              <span className="text-sm text-white">Show this question conditionally</span>
                            </label>

                            {question.conditional?.enabled && (
                              <div className="space-y-3 pl-6 border-l-2 border-[var(--color-primary)]/30">
                                <div>
                                  <label className="block text-xs font-medium text-[var(--color-dark-grey)] mb-1">
                                    Show when question
                                  </label>
                                  <select
                                    value={question.conditional?.dependsOn || ''}
                                    onChange={(e) => updateQuestionForUI(sectionIndex, questionIndex, 'conditional', {
                                      ...question.conditional,
                                      dependsOn: e.target.value
                                    })}
                                    className="w-full p-2 text-sm bg-[var(--color-secondary)] border border-[var(--color-border)] rounded text-white"
                                  >
                                    <option value="">Select a question...</option>
                                    {section.questions.slice(0, questionIndex).map((prevQ, prevIdx) => (
                                      <option key={prevQ.id} value={prevQ.id}>
                                        Question {prevIdx + 1}: {prevQ.text?.substring(0, 30)}...
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-[var(--color-dark-grey)] mb-1">
                                    Condition Type
                                  </label>
                                  <select
                                    value={question.conditional?.operator || 'equals'}
                                    onChange={(e) => updateQuestionForUI(sectionIndex, questionIndex, 'conditional', {
                                      ...question.conditional,
                                      operator: e.target.value
                                    })}
                                    className="w-full p-2 text-sm bg-[var(--color-secondary)] border border-[var(--color-border)] rounded text-white"
                                  >
                                    <option value="equals">Equals</option>
                                    <option value="not_equals">Not Equals</option>
                                    <option value="contains">Contains</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-[var(--color-dark-grey)] mb-1">
                                    Value
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Yes, Option 1, or specific value"
                                    value={question.conditional?.value || ''}
                                    onChange={(e) => updateQuestionForUI(sectionIndex, questionIndex, 'conditional', {
                                      ...question.conditional,
                                      value: e.target.value
                                    })}
                                    className="w-full p-2 text-sm bg-[var(--color-secondary)] border border-[var(--color-border)] rounded text-white"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Options for choice questions */}
                        {(question.type === 'single-choice' || question.type === 'multiple-choice') && (
                          <div>
                            <label className="block text-sm font-medium text-[var(--color-dark-grey)] mb-3">
                              Options
                            </label>
                            <div className="space-y-3">
                              {question.options?.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-3">
                                  <div className="flex-shrink-0">
                                    <div className="w-4 h-4 rounded-full border-2 border-[var(--color-border)] bg-[var(--color-background)]"></div>
                                  </div>
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateQuestionOption(sectionIndex, questionIndex, optionIndex, e.target.value)}
                                    placeholder={`Option ${optionIndex + 1}`}
                                    className="flex-1 p-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-white placeholder-[var(--color-dark-grey)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                  />
                                  <button className="p-1 text-[var(--color-dark-grey)] hover:text-white">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M4 6h12v2H4V6zM4 10h12v2H4v-2zM4 14h12v2H4v-2z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => removeQuestionOption(sectionIndex, questionIndex, optionIndex)}
                                    className="p-1 text-[var(--color-dark-grey)] hover:text-red-400"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => addQuestionOption(sectionIndex, questionIndex)}
                                className="flex items-center gap-2 px-3 py-2 text-[var(--color-dark-grey)] hover:text-white hover:bg-[var(--color-background)] rounded-lg transition-colors"
                              >
                                <Plus size={16} />
                                Add Option
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add Question Button */}
                    <button
                      onClick={() => addQuestion(section.id, {
                        type: 'single-choice',
                        text: '',
                        options: ['Option 1', 'Option 2'],
                        validation: {
                          required: false,
                          minLength: null,
                          maxLength: null,
                          minValue: null,
                          maxValue: null,
                          fileTypes: ''
                        },
                        conditional: {
                          enabled: false,
                          dependsOn: '',
                          operator: 'equals',
                          value: ''
                        }
                      })}
                      className="w-full border-2 border-dashed border-[var(--color-border)] rounded-lg py-8 text-[var(--color-dark-grey)] hover:text-white hover:border-[var(--color-primary)] transition-colors"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Plus size={24} />
                        <span>Add Question</span>
                      </div>
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Section Button */}
              <button
                onClick={addSection}
                className="w-full border-2 border-dashed border-[var(--color-border)] rounded-xl py-12 text-[var(--color-dark-grey)] hover:text-white hover:border-[var(--color-primary)] transition-colors"
              >
                <div className="flex flex-col items-center gap-2">
                  <Plus size={32} />
                  <span className="text-lg">Add Section</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="w-96 bg-[var(--color-secondary)] border-l border-[var(--color-border)] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-lg font-semibold text-white">Live Preview</h3>
              <span className="text-sm text-[var(--color-dark-grey)] bg-[var(--color-blue)] px-2 py-1 rounded">
                Candidate View
              </span>
            </div>

            {assessment.title ? (
              <AssessmentPreviewForm assessment={assessment} />
            ) : (
              <div className="bg-[var(--color-blue)] border border-[var(--color-border)] rounded-xl p-6 text-center">
                <FileText size={48} className="mx-auto mb-4 text-[var(--color-dark-grey)]" />
                <p className="text-[var(--color-dark-grey)]">Add an assessment title to see the preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Main component render
  if (showForm) {
    return renderForm();
  } else {
    return renderDashboard();
  }
};

export default AssessmentBuilder;