import axios from 'axios';

// Fetch all notes for a specific candidate
export const fetchNotes = async (candidateId) => {
  const { data } = await axios.get(`/candidates/${candidateId}/notes`);
  return data;
};

// Create a new note for a candidate
export const createNote = async ({ candidateId, text }) => {
  const { data } = await axios.post(`/candidates/${candidateId}/notes`, { text });
  return data;
};