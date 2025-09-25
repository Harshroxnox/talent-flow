/**
 * Assessment Persistence System
 * 
 * This module provides comprehensive persistence capabilities for:
 * 1. Assessment builder state (questions, sections, edits)
 * 2. Candidate responses during assessment taking
 * 3. General application state
 * 
 * Uses IndexedDB via Dexie.js for robust local storage
 */

import { db } from '../app/db/index.js';

/**
 * Assessment Draft Persistence
 * Handles saving/loading assessment builder state
 */
export class AssessmentDraftManager {
  /**
   * Save assessment draft with automatic timestamps
   * @param {number} jobId - Job ID the assessment belongs to
   * @param {Object} assessmentData - Complete assessment structure
   * @returns {Promise<number>} Draft ID
   */
  static async saveDraft(jobId, assessmentData) {
    try {
      console.log('AssessmentDraftManager.saveDraft called with:', { jobId, assessmentData });

      if (!jobId) {
        throw new Error('jobId is required for saving draft');
      }

      const draftData = {
        jobId: Number(jobId),
        title: assessmentData.title || 'Untitled Assessment',
        data: JSON.stringify(assessmentData), // Serialize complete assessment
        lastModified: new Date().toISOString()
      };

      console.log('Draft data to save:', draftData);

      // Check if draft already exists for this job/assessment combination
      const existing = await db.assessmentDrafts
        .where('jobId')
        .equals(Number(jobId))
        .and(draft => {
          try {
            const parsed = JSON.parse(draft.data);
            return parsed.id === assessmentData.id;
          } catch (err) {
            console.warn('Failed to parse draft data:', err);
            return false;
          }
        })
        .first();

      console.log('Existing draft found:', existing);

      let result;
      if (existing) {
        // Update existing draft
        await db.assessmentDrafts.update(existing.id, draftData);
        result = existing.id;
        console.log('Updated existing draft with ID:', result);
      } else {
        // Create new draft
        result = await db.assessmentDrafts.add(draftData);
        console.log('Created new draft with ID:', result);
      }

      // Verify the draft was saved
      const saved = await db.assessmentDrafts.get(result);
      console.log('Verified saved draft:', saved);

      return result;
    } catch (error) {
      console.error('Error saving assessment draft:', error);
      throw new Error('Failed to save assessment draft: ' + error.message);
    }
  }

  /**
   * Load assessment draft by job ID
   * @param {number} jobId - Job ID to load drafts for
   * @returns {Promise<Array>} Array of draft assessments
   */
  static async loadDraftsByJob(jobId) {
    try {
      console.log('Loading drafts for jobId:', jobId);

      const drafts = await db.assessmentDrafts
        .where('jobId')
        .equals(Number(jobId))
        .toArray();

      console.log('Raw drafts from DB:', drafts);

      const result = drafts.map(draft => {
        try {
          return {
            id: draft.id,
            lastModified: draft.lastModified,
            assessment: JSON.parse(draft.data)
          };
        } catch (err) {
          console.warn('Failed to parse draft data for draft ID', draft.id, err);
          return null;
        }
      }).filter(Boolean);

      console.log('Processed drafts:', result);
      return result;
    } catch (error) {
      console.error('Error loading assessment drafts:', error);
      return [];
    }
  }

  /**
   * Load all assessment drafts
   * @returns {Promise<Array>} Array of all draft assessments
   */
  static async loadAllDrafts() {
    try {
      console.log('Loading all drafts...');

      const drafts = await db.assessmentDrafts.toArray();
      console.log('All raw drafts from DB:', drafts);

      const result = drafts.map(draft => {
        try {
          return {
            id: draft.id,
            lastModified: draft.lastModified,
            assessment: JSON.parse(draft.data)
          };
        } catch (err) {
          console.warn('Failed to parse draft data for draft ID', draft.id, err);
          return null;
        }
      }).filter(Boolean);

      console.log('All processed drafts:', result);
      return result;
    } catch (error) {
      console.error('Error loading all assessment drafts:', error);
      return [];
    }
  }

  /**
   * Load specific assessment draft
   * @param {number} draftId - Draft ID to load
   * @returns {Promise<Object|null>} Assessment data or null
   */
  static async loadDraft(draftId) {
    try {
      const draft = await db.assessmentDrafts.get(Number(draftId));
      if (draft) {
        return {
          id: draft.id,
          lastModified: draft.lastModified,
          assessment: JSON.parse(draft.data)
        };
      }
      return null;
    } catch (error) {
      console.error('Error loading assessment draft:', error);
      return null;
    }
  }

  /**
   * Delete assessment draft
   * @param {number} draftId - Draft ID to delete
   * @returns {Promise<boolean>} Success status
   */
  static async deleteDraft(draftId) {
    try {
      await db.assessmentDrafts.delete(Number(draftId));
      return true;
    } catch (error) {
      console.error('Error deleting assessment draft:', error);
      return false;
    }
  }

  /**
   * Get all drafts (for admin/overview purposes)
   * @returns {Promise<Array>} All drafts with metadata
   */
  static async getAllDrafts() {
    try {
      const drafts = await db.assessmentDrafts.toArray();
      return drafts.map(draft => ({
        id: draft.id,
        jobId: draft.jobId,
        title: draft.title,
        lastModified: draft.lastModified,
        assessment: JSON.parse(draft.data)
      }));
    } catch (error) {
      console.error('Error loading all drafts:', error);
      return [];
    }
  }
}

/**
 * Candidate Response Persistence
 * Handles saving/loading candidate answers during assessment
 */
export class CandidateResponseManager {
  /**
   * Save candidate responses with auto-save capability
   * @param {number} assessmentId - Assessment being taken
   * @param {number} candidateId - Candidate taking assessment
   * @param {Object} responses - Current response state
   * @param {boolean} isSubmitted - Whether assessment is submitted
   * @returns {Promise<number>} Response record ID
   */
  static async saveResponses(assessmentId, candidateId, responses, isSubmitted = false) {
    try {
      const responseData = {
        assessmentId: Number(assessmentId),
        candidateId: Number(candidateId),
        responses: JSON.stringify(responses),
        isSubmitted,
        lastModified: new Date().toISOString()
      };

      // Check for existing responses
      const existing = await db.candidateResponses
        .where('assessmentId')
        .equals(Number(assessmentId))
        .and(record => record.candidateId === Number(candidateId))
        .first();

      if (existing) {
        // Update existing responses
        await db.candidateResponses.update(existing.id, responseData);
        return existing.id;
      } else {
        // Create new response record
        return await db.candidateResponses.add(responseData);
      }
    } catch (error) {
      console.error('Error saving candidate responses:', error);
      throw new Error('Failed to save candidate responses');
    }
  }

  /**
   * Load candidate responses
   * @param {number} assessmentId - Assessment ID
   * @param {number} candidateId - Candidate ID
   * @returns {Promise<Object|null>} Response data or null
   */
  static async loadResponses(assessmentId, candidateId) {
    try {
      const record = await db.candidateResponses
        .where('assessmentId')
        .equals(Number(assessmentId))
        .and(record => record.candidateId === Number(candidateId))
        .first();

      if (record) {
        return {
          id: record.id,
          responses: JSON.parse(record.responses),
          isSubmitted: record.isSubmitted,
          lastModified: record.lastModified
        };
      }
      return null;
    } catch (error) {
      console.error('Error loading candidate responses:', error);
      return null;
    }
  }

  /**
   * Get all responses for an assessment (for review/grading)
   * @param {number} assessmentId - Assessment ID
   * @returns {Promise<Array>} All candidate responses
   */
  static async getAssessmentResponses(assessmentId) {
    try {
      const records = await db.candidateResponses
        .where('assessmentId')
        .equals(Number(assessmentId))
        .toArray();

      return records.map(record => ({
        id: record.id,
        candidateId: record.candidateId,
        responses: JSON.parse(record.responses),
        isSubmitted: record.isSubmitted,
        lastModified: record.lastModified
      }));
    } catch (error) {
      console.error('Error loading assessment responses:', error);
      return [];
    }
  }

  /**
   * Delete candidate responses
   * @param {number} assessmentId - Assessment ID
   * @param {number} candidateId - Candidate ID
   * @returns {Promise<boolean>} Success status
   */
  static async deleteResponses(assessmentId, candidateId) {
    try {
      await db.candidateResponses
        .where('assessmentId')
        .equals(Number(assessmentId))
        .and(record => record.candidateId === Number(candidateId))
        .delete();
      return true;
    } catch (error) {
      console.error('Error deleting candidate responses:', error);
      return false;
    }
  }
}

/**
 * General Persistent State Manager
 * For any key-value state that needs persistence
 */
export class PersistentStateManager {
  /**
   * Save state with key
   * @param {string} key - State identifier
   * @param {any} value - State value (will be JSON stringified)
   * @returns {Promise<boolean>} Success status
   */
  static async saveState(key, value) {
    try {
      const stateData = {
        key,
        value: JSON.stringify(value),
        timestamp: new Date().toISOString()
      };

      await db.persistentState.put(stateData);
      return true;
    } catch (error) {
      console.error('Error saving persistent state:', error);
      return false;
    }
  }

  /**
   * Load state by key
   * @param {string} key - State identifier
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {Promise<any>} State value or default
   */
  static async loadState(key, defaultValue = null) {
    try {
      const record = await db.persistentState.get(key);
      if (record) {
        return JSON.parse(record.value);
      }
      return defaultValue;
    } catch (error) {
      console.error('Error loading persistent state:', error);
      return defaultValue;
    }
  }

  /**
   * Delete state by key
   * @param {string} key - State identifier
   * @returns {Promise<boolean>} Success status
   */
  static async deleteState(key) {
    try {
      await db.persistentState.delete(key);
      return true;
    } catch (error) {
      console.error('Error deleting persistent state:', error);
      return false;
    }
  }

  /**
   * Clear all persistent state (use with caution)
   * @returns {Promise<boolean>} Success status
   */
  static async clearAllState() {
    try {
      await db.persistentState.clear();
      return true;
    } catch (error) {
      console.error('Error clearing persistent state:', error);
      return false;
    }
  }
}

/**
 * Auto-save utilities for debounced persistence
 */
export class AutoSaveManager {
  static timeouts = new Map();

  /**
   * Debounced auto-save function
   * @param {string} key - Unique key for this auto-save instance
   * @param {Function} saveFunction - Function to call for saving
   * @param {number} delay - Delay in milliseconds (default: 1000)
   */
  static autoSave(key, saveFunction, delay = 1000) {
    // Clear existing timeout for this key
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
    }

    // Set new timeout
    const timeoutId = setTimeout(async () => {
      try {
        await saveFunction();
        this.timeouts.delete(key);
      } catch (error) {
        console.error(`Auto-save failed for key ${key}:`, error);
        this.timeouts.delete(key);
      }
    }, delay);

    this.timeouts.set(key, timeoutId);
  }

  /**
   * Force immediate save and cancel pending auto-save
   * @param {string} key - Auto-save key
   * @param {Function} saveFunction - Function to call for saving
   */
  static async forceSave(key, saveFunction) {
    // Cancel pending save
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
      this.timeouts.delete(key);
    }

    // Execute immediate save
    try {
      await saveFunction();
    } catch (error) {
      console.error(`Force save failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Cancel auto-save for a key
   * @param {string} key - Auto-save key to cancel
   */
  static cancelAutoSave(key) {
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
      this.timeouts.delete(key);
    }
  }

  /**
   * Cancel all pending auto-saves
   */
  static cancelAllAutoSaves() {
    this.timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.timeouts.clear();
  }
}
