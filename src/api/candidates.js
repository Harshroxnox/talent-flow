// src/api/candidates.js
import axios from 'axios';

export async function fetchCandidates(filters) {
  const params = new URLSearchParams();

  // single-value filters
  if (filters.search) params.append('search', filters.search);
  if (filters.stage) params.append('stage', filters.stage);
  if (filters.jobId) params.append('jobId', filters.jobId); // Add this line
  params.append('page', filters.page || 1);
  params.append('pageSize', filters.pageSize || 10);

  const res = await axios.get(`/candidates?${params.toString()}`);
  return res.data;
}

export const fetchCandidate = async (id) => {
  const { data } = await axios.get(`/candidates/${id}`);
  return data;
};

export const createCandidate = async (candidateData) => {
  const { data } = await axios.post('/candidates', candidateData);
  return data;
};

export const updateCandidate = async ({ id, ...candidateData }) => {
  const { data } = await axios.patch(`/candidates/${id}`, candidateData);
  return data;
};

export const fetchCandidateTimeline = async (id) => {
  const { data } = await axios.get(`/candidates/${id}/timeline`);
  return data;
};