/**
 * React Hooks for Assessment Persistence
 * 
 * Provides easy-to-use React hooks for integrating persistence
 * into components with automatic state management and auto-save
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AssessmentDraftManager,
  CandidateResponseManager,
  PersistentStateManager,
  AutoSaveManager
} from '../utils/persistence.js';

/**
 * Generic persisted state hook with auto-save
 * @param {string} key - Unique identifier for the persisted state
 * @param {any} initialValue - Initial value if no persisted state exists
 * @param {number} autoSaveDelay - Auto-save delay in milliseconds (0 to disable)
 * @returns {[value, setValue, { isLoading, isSaving, lastSaved, forceSave }]}
 */
export function usePersistedState(key, initialValue, autoSaveDelay = 1000) {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const mountedRef = useRef(true);

  // Load initial state from persistence
  useEffect(() => {
    let mounted = true;

    const loadState = async () => {
      try {
        const savedValue = await PersistentStateManager.loadState(key, initialValue);
        if (mounted) {
          setValue(savedValue);
          setIsLoading(false);
        }
      } catch (error) {
        console.error(`Failed to load persisted state for key ${key}:`, error);
        if (mounted) {
          setValue(initialValue);
          setIsLoading(false);
        }
      }
    };

    loadState();

    return () => {
      mounted = false;
    };
  }, [key, initialValue]);

  // Auto-save function
  const saveState = useCallback(async (valueToSave) => {
    if (!mountedRef.current) return;

    try {
      setIsSaving(true);
      const success = await PersistentStateManager.saveState(key, valueToSave);
      if (success && mountedRef.current) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error(`Failed to save state for key ${key}:`, error);
    } finally {
      if (mountedRef.current) {
        setIsSaving(false);
      }
    }
  }, [key]);

  // Enhanced setValue with auto-save
  const setValueWithAutoSave = useCallback((newValue) => {
    const resolvedValue = typeof newValue === 'function' ? newValue(value) : newValue;
    setValue(resolvedValue);

    // Auto-save if enabled
    if (autoSaveDelay > 0) {
      AutoSaveManager.autoSave(
        `persisted-state-${key}`,
        () => saveState(resolvedValue),
        autoSaveDelay
      );
    }
  }, [value, key, autoSaveDelay, saveState]);

  // Force save function
  const forceSave = useCallback(async () => {
    await AutoSaveManager.forceSave(
      `persisted-state-${key}`,
      () => saveState(value)
    );
  }, [key, value, saveState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      AutoSaveManager.cancelAutoSave(`persisted-state-${key}`);
    };
  }, [key]);

  return [
    value,
    setValueWithAutoSave,
    {
      isLoading,
      isSaving,
      lastSaved,
      forceSave
    }
  ];
}

/**
 * Assessment builder store hook with comprehensive persistence
 * @param {number} jobId - Job ID for the assessment
 * @param {Object} initialAssessment - Initial assessment structure
 * @returns {Object} Assessment store with methods and state
 */
export function useAssessmentStore(jobId, initialAssessment = null) {
  const [assessment, setAssessment] = useState(initialAssessment || {
    id: null,
    title: '',
    description: '',
    jobId: Number(jobId),
    sections: [],
    settings: {
      timeLimit: null,
      randomizeQuestions: false,
      showResults: true
    },
    createdAt: null,
    updatedAt: null
  });

  const [existingDrafts, setExistingDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  // Load existing drafts for this job
  const loadDrafts = useCallback(async (targetJobId = jobId) => {
    if (!targetJobId) return;

    try {
      setError(null);
      const drafts = await AssessmentDraftManager.loadDraftsByJob(targetJobId);
      if (mountedRef.current) {
        setExistingDrafts(drafts);
      }
    } catch (err) {
      console.error('Failed to load assessment drafts:', err);
      if (mountedRef.current) {
        setError('Failed to load existing assessments');
      }
    }
  }, [jobId]);

  // Load all drafts (for filtering across jobs)
  const loadAllDrafts = useCallback(async () => {
    try {
      setError(null);
      const allDrafts = await AssessmentDraftManager.loadAllDrafts();
      if (mountedRef.current) {
        setExistingDrafts(allDrafts);
      }
    } catch (err) {
      console.error('Failed to load all assessment drafts:', err);
      if (mountedRef.current) {
        setError('Failed to load existing assessments');
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    let mounted = true;

    const initializeStore = async () => {
      setIsLoading(true);
      await loadDrafts();

      // If no initial assessment provided, try to load from localStorage as fallback
      if (!initialAssessment && jobId) {
        try {
          const localKey = `assessment_draft_${jobId}`;
          const localData = localStorage.getItem(localKey);
          if (localData && mounted) {
            const parsedData = JSON.parse(localData);
            setAssessment(prev => ({ ...prev, ...parsedData }));
          }
        } catch (err) {
          console.error('Failed to load from localStorage:', err);
        }
      }

      if (mounted) {
        setIsLoading(false);
      }
    };

    initializeStore();

    return () => {
      mounted = false;
    };
  }, [jobId, initialAssessment, loadDrafts]);

  // Save assessment draft
  const saveDraft = useCallback(async (assessmentData = assessment) => {
    if (!jobId || !mountedRef.current) return;

    try {
      setIsSaving(true);
      setError(null);

      const draftId = await AssessmentDraftManager.saveDraft(jobId, {
        ...assessmentData,
        updatedAt: new Date().toISOString()
      });

      if (mountedRef.current) {
        setLastSaved(new Date());
        await loadDrafts(); // Refresh drafts list
      }

      return draftId;
    } catch (err) {
      console.error('Failed to save assessment draft:', err);
      if (mountedRef.current) {
        setError('Failed to save assessment');
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setIsSaving(false);
      }
    }
  }, [jobId, assessment, loadDrafts]);

  // Load specific draft
  const loadDraft = useCallback(async (draftId) => {
    try {
      setError(null);
      const draft = await AssessmentDraftManager.loadDraft(draftId);
      if (draft && mountedRef.current) {
        setAssessment(draft.assessment);
        return draft.assessment;
      }
      return null;
    } catch (err) {
      console.error('Failed to load draft:', err);
      if (mountedRef.current) {
        setError('Failed to load assessment draft');
      }
      return null;
    }
  }, []);

  // Delete draft
  const deleteDraft = useCallback(async (draftId) => {
    try {
      setError(null);
      const success = await AssessmentDraftManager.deleteDraft(draftId);
      if (success && mountedRef.current) {
        await loadDrafts(); // Refresh drafts list
      }
      return success;
    } catch (err) {
      console.error('Failed to delete draft:', err);
      if (mountedRef.current) {
        setError('Failed to delete assessment draft');
      }
      return false;
    }
  }, [loadDrafts]);

  // Update assessment with auto-save
  const updateAssessment = useCallback((updates) => {
    setAssessment(currentAssessment => {
      const updatedAssessment = typeof updates === 'function'
        ? updates(currentAssessment)
        : { ...currentAssessment, ...updates, updatedAt: new Date().toISOString() };

      // Auto-save after 2 seconds of inactivity
      AutoSaveManager.autoSave(
        `assessment-${jobId}`,
        () => saveDraft(updatedAssessment),
        2000
      );

      return updatedAssessment;
    });
  }, [jobId, saveDraft]);

  // Force save
  const forceSave = useCallback(async () => {
    return await AutoSaveManager.forceSave(
      `assessment-${jobId}`,
      () => saveDraft()
    );
  }, [jobId, saveDraft]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      AutoSaveManager.cancelAutoSave(`assessment-${jobId}`);
    };
  }, [jobId]);

  return {
    // State
    assessment,
    existingDrafts,
    isLoading,
    isSaving,
    lastSaved,
    error,

    // Methods
    updateAssessment,
    saveDraft,
    loadDraft,
    deleteDraft,
    loadDrafts,
    loadAllDrafts,
    forceSave,

    // Direct setters (for advanced use)
    setAssessment
  };
}

/**
 * Candidate response store hook for assessment taking
 * @param {number} assessmentId - Assessment being taken
 * @param {number} candidateId - Candidate taking the assessment
 * @returns {Object} Response store with methods and state
 */
export function useCandidateResponseStore(assessmentId, candidateId) {
  const [responses, setResponses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  // Load existing responses
  useEffect(() => {
    let mounted = true;

    const loadResponses = async () => {
      if (!assessmentId || !candidateId) return;

      try {
        setError(null);
        const savedResponses = await CandidateResponseManager.loadResponses(assessmentId, candidateId);

        if (savedResponses && mounted) {
          setResponses(savedResponses.responses);
          setIsSubmitted(savedResponses.isSubmitted);
          setLastSaved(new Date(savedResponses.lastModified));
        }
      } catch (err) {
        console.error('Failed to load candidate responses:', err);
        if (mounted) {
          setError('Failed to load previous responses');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadResponses();

    return () => {
      mounted = false;
    };
  }, [assessmentId, candidateId]);

  // Save responses
  const saveResponses = useCallback(async (responseData = responses, submit = false) => {
    if (!assessmentId || !candidateId || !mountedRef.current) return;

    try {
      setIsSaving(true);
      setError(null);

      await CandidateResponseManager.saveResponses(
        assessmentId,
        candidateId,
        responseData,
        submit || isSubmitted
      );

      if (mountedRef.current) {
        setLastSaved(new Date());
        if (submit) {
          setIsSubmitted(true);
        }
      }
    } catch (err) {
      console.error('Failed to save candidate responses:', err);
      if (mountedRef.current) {
        setError('Failed to save responses');
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setIsSaving(false);
      }
    }
  }, [assessmentId, candidateId, responses, isSubmitted]);

  // Update response with auto-save
  const updateResponse = useCallback((questionId, answer) => {
    const updatedResponses = {
      ...responses,
      [questionId]: {
        answer,
        timestamp: new Date().toISOString()
      }
    };

    setResponses(updatedResponses);

    // Auto-save every 3 seconds during assessment taking
    AutoSaveManager.autoSave(
      `responses-${assessmentId}-${candidateId}`,
      () => saveResponses(updatedResponses),
      3000
    );
  }, [responses, assessmentId, candidateId, saveResponses]);

  // Submit assessment
  const submitAssessment = useCallback(async () => {
    try {
      await AutoSaveManager.forceSave(
        `responses-${assessmentId}-${candidateId}`,
        () => saveResponses(responses, true)
      );
      return true;
    } catch (err) {
      console.error('Failed to submit assessment:', err);
      throw err;
    }
  }, [assessmentId, candidateId, responses, saveResponses]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      AutoSaveManager.cancelAutoSave(`responses-${assessmentId}-${candidateId}`);
    };
  }, [assessmentId, candidateId]);

  return {
    // State
    responses,
    isLoading,
    isSaving,
    isSubmitted,
    lastSaved,
    error,

    // Methods
    updateResponse,
    saveResponses,
    submitAssessment,

    // Direct setter (for advanced use)
    setResponses
  };
}

/**
 * Simple hook for component-level auto-save functionality
 * @param {any} data - Data to save
 * @param {Function} saveFunction - Function that saves the data
 * @param {number} delay - Delay in milliseconds
 * @param {Array} deps - Dependencies that trigger save
 */
export function useAutoSave(data, saveFunction, delay = 1000, deps = []) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const saveKey = useRef(`auto-save-${Math.random()}`);

  useEffect(() => {
    if (!data || typeof saveFunction !== 'function') return;

    const performSave = async () => {
      setIsSaving(true);
      try {
        await saveFunction(data);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    };

    AutoSaveManager.autoSave(saveKey.current, performSave, delay);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, delay, ...deps]);

  // Cleanup
  useEffect(() => {
    return () => {
      AutoSaveManager.cancelAutoSave(saveKey.current);
    };
  }, []);

  return { isSaving, lastSaved };
}
