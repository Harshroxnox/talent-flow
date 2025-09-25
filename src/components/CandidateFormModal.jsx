import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCandidate, updateCandidate } from '../api/candidates';
import toast from 'react-hot-toast';

const CandidateFormModal = ({ isOpen, onClose, candidateToEdit }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    experience: '',
    skills: '', // Skills will be handled as a comma-separated string in the form
  });

  useEffect(() => {
    if (candidateToEdit) {
      setFormData({
        id: candidateToEdit.id,
        name: candidateToEdit.name || '',
        email: candidateToEdit.email || '',
        phone: candidateToEdit.phone || '',
        city: candidateToEdit.city || '',
        country: candidateToEdit.country || '',
        experience: candidateToEdit.experience || '',
        skills: (candidateToEdit.skills || []).join(', '), // Convert array to string for input
      });
    } else {
      // Reset form for creating a new candidate
      setFormData({
        id: null, name: '', email: '', phone: '', city: '', country: '', experience: '', skills: '',
      });
    }
  }, [candidateToEdit, isOpen]);

  const { mutate: saveCandidate, isLoading } = useMutation({
    mutationFn: (candidateData) => {
      // Prepare data for API
      const payload = {
        ...candidateData,
        // FIX: Ensure experience is an integer, defaulting to 0
        experience: parseInt(candidateData.experience, 10) || 0,
        // Convert skills string back to array, filtering out empty strings
        skills: typeof candidateData.skills === 'string'
          ? candidateData.skills.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      };
      return payload.id
        ? updateCandidate(payload)
        : createCandidate(payload);
    },
    onSuccess: () => {
      toast.success('Candidate saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      onClose();
    },
    onError: (error) => {
      console.error("Save Candidate Error:", error);
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
          {candidateToEdit ? 'Edit Candidate Details' : 'Create a New Candidate'}
        </h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* --- Name and Email Fields --- */}
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

          {/* --- All Additional Details --- */}
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor='phone' className='block text-sm font-medium text-grey mb-1'>
                Phone Number
                </label>
                <input
                type='tel'
                name='phone'
                id='phone'
                value={formData.phone}
                onChange={handleChange}
                className='w-full bg-blue border border-border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none'
                />
            </div>
             <div>
                <label htmlFor='experience' className='block text-sm font-medium text-grey mb-1'>
                Experience (Years)
                </label>
                <input
                type='number'
                name='experience'
                id='experience'
                value={formData.experience}
                onChange={handleChange}
                className='w-full bg-blue border border-border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none'
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label htmlFor='city' className='block text-sm font-medium text-grey mb-1'>
                City
                </label>
                <input
                type='text'
                name='city'
                id='city'
                value={formData.city}
                onChange={handleChange}
                className='w-full bg-blue border border-border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none'
                />
            </div>
            <div>
                <label htmlFor='country' className='block text-sm font-medium text-grey mb-1'>
                Country
                </label>
                <input
                type='text'
                name='country'
                id='country'
                value={formData.country}
                onChange={handleChange}
                className='w-full bg-blue border border-border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none'
                />
            </div>
          </div>

          <div>
            <label htmlFor='skills' className='block text-sm font-medium text-grey mb-1'>
              Skills (comma-separated)
            </label>
            <input
              type='text'
              name='skills'
              id='skills'
              placeholder="e.g., React, Node.js, SQL"
              value={formData.skills}
              onChange={handleChange}
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