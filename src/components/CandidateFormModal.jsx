import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { createCandidate, updateCandidate } from '../api/candidates';
import { queryClient } from '../app/queryClient';
import toast from 'react-hot-toast';

const CandidateFormModal = ({ isOpen, onClose, candidateToEdit }) => {
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
  });

  useEffect(() => {
    if (candidateToEdit) {
      setFormData({
        id: candidateToEdit.id,
        name: candidateToEdit.name || '',
        email: candidateToEdit.email || '',
      });
    } else {
      setFormData({
        id: null,
        name: '',
        email: '',
      });
    }
  }, [candidateToEdit, isOpen]);

  const { mutate: saveCandidate, isLoading } = useMutation({
    mutationFn: (candidateData) => {
      return candidateData.id
        ? updateCandidate(candidateData)
        : createCandidate(candidateData);
    },
    onSuccess: () => {
      toast.success('Candidate saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      onClose();
    },
    onError: () => {
      toast.error('Failed to save candidate.');
    },
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveCandidate(formData);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm'>
      <div className='bg-secondary p-8 rounded-xl border border-border w-full max-w-lg relative text-text'>
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-grey hover:text-white'
        >
          <X size={24} />
        </button>
        <h2 className='text-2xl font-semibold mb-6'>
          {candidateToEdit ? 'Edit Candidate' : 'Create a New Candidate'}
        </h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label htmlFor='name' className='block text-sm font-medium text-grey mb-1'>
              Name
            </label>
            <input
              type='text'
              name='name'
              id='name'
              value={formData.name}
              onChange={handleChange}
              required
              className='w-full bg-blue border border-border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none'
            />
          </div>
          <div>
            <label htmlFor='email' className='block text-sm font-medium text-grey mb-1'>
              Email
            </label>
            <input
              type='email'
              name='email'
              id='email'
              value={formData.email}
              onChange={handleChange}
              required
              className='w-full bg-blue border border-border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none'
            />
          </div>
          <div className='flex justify-end gap-4 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='py-2 px-5 rounded-lg text-grey hover:bg-blue'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='py-2 px-5 rounded-lg bg-primary text-background font-semibold hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed'
            >
              {isLoading ? 'Saving...' : 'Save Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CandidateFormModal;