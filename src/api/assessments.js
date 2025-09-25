import axios from 'axios';

// Get all assessments for a job (includes both published and drafts)
export const fetchAssessments = async (jobId) => {
  const { data } = await axios.get(`/assessments/${jobId}`);
  return data; // array
};

// Get all assessments (no job filter)
export const fetchAllAssessments = async () => {
  const { data } = await axios.get('/assessments');
  return data; // array
};

// Upsert assessments for a job (MSW expects an array payload)
export const upsertAssessmentsForJob = async (jobId, assessments) => {
  const { data } = await axios.put(`/assessments/${jobId}`, assessments);
  return data; // array stored
};

// Save assessment draft with auto-save capability
export const saveAssessmentDraft = async (jobId, assessmentData) => {
  const { data } = await axios.post(`/assessments/${jobId}/draft`, assessmentData);
  return data;
};

// Delete assessment draft
export const deleteAssessmentDraft = async (jobId, assessmentId) => {
  const { data } = await axios.delete(`/assessments/${jobId}/draft/${assessmentId}`);
  return data;
};

// Save candidate responses with auto-save
export const saveCandidateResponses = async (assessmentId, candidateId, responses, isSubmitted = false) => {
  const { data } = await axios.post(`/assessments/${assessmentId}/responses`, {
    candidateId,
    responses,
    isSubmitted
  });
  return data;
};

// Load candidate responses
export const loadCandidateResponses = async (assessmentId, candidateId) => {
  try {
    const { data } = await axios.get(`/assessments/${assessmentId}/responses/${candidateId}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // No responses found
    }
    throw error;
  }
};

// Submit candidate responses for a job's assessments (legacy compatibility)
export const submitAssessmentResponse = async (jobId, payload) => {
  const { data } = await axios.post(`/assessments/${jobId}/submit`, payload);
  return data;
};
