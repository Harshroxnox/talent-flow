import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const JobFormModal = ({ isOpen, onClose, onSubmit, isSubmitting, jobToEdit }) => {
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    location: '',
    type: 'Full-time',
    amount: '',
  });

  // Pre-fill form if we are editing
  useEffect(() => {
    if (jobToEdit) {
      setFormData({
        title: jobToEdit.title || '',
        desc: jobToEdit.desc || '',
        location: jobToEdit.location || '',
        type: jobToEdit.type || 'Full-time',
        amount: jobToEdit.amount || '',
      });
    } else {
      // Clear form for creation
      setFormData({
        title: '', desc: '', location: '', type: 'Full-time', amount: '',
      });
    }
  }, [jobToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const jobTypes = ['Full-time', 'Part-time', 'Intern', 'Remote', 'Contract'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-secondary p-8 rounded-xl border border-border w-full max-w-lg relative text-text">
        <button onClick={onClose} className="absolute top-4 right-4 text-grey hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-semibold mb-6">{jobToEdit ? 'Edit Job Post' : 'Create a New Job Post'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-grey mb-1">Job Title</label>
            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="w-full bg-blue border border-border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none" />
          </div>

          <div>
            <label htmlFor="desc" className="block text-sm font-medium text-grey mb-1">Description</label>
            <textarea name="desc" id="desc" value={formData.desc} onChange={handleChange} required rows="3" className="w-full bg-blue border border-border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-grey mb-1">Location</label>
              <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} required className="w-full bg-blue border border-border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-grey mb-1">Monthly Salary ($K)</label>
              <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} required placeholder="e.g., 20" className="w-full bg-blue border border-border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>
          
          <div>
             <label htmlFor="type" className="block text-sm font-medium text-grey mb-1">Job Type</label>
             <select name="type" id="type" value={formData.type} onChange={handleChange} className="w-full bg-blue border border-border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none">
                {jobTypes.map(type => <option key={type} value={type}>{type}</option>)}
             </select>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="py-2 px-5 rounded-lg text-grey hover:bg-blue">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="py-2 px-5 rounded-lg bg-primary text-background font-semibold hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Saving...' : 'Save Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobFormModal;