import toast from 'react-hot-toast';

// Custom toast styles that match your app theme
const toastStyles = {
  success: {
    style: {
      background: '#10B981',
      color: '#fff',
      border: '1px solid #059669',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10B981',
    },
  },
  error: {
    style: {
      background: '#EF4444',
      color: '#fff',
      border: '1px solid #DC2626',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#EF4444',
    },
  },
  loading: {
    style: {
      background: '#3B82F6',
      color: '#fff',
      border: '1px solid #2563EB',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#3B82F6',
    },
  },
  warning: {
    style: {
      background: '#F59E0B',
      color: '#fff',
      border: '1px solid #D97706',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#F59E0B',
    },
  },
  info: {
    style: {
      background: '#6366F1',
      color: '#fff',
      border: '1px solid #4F46E5',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#6366F1',
    },
  },
};

// Toast utility functions
export const showToast = {
  success: (message, options = {}) => {
    return toast.success(message, {
      ...toastStyles.success,
      duration: 4000,
      ...options,
    });
  },

  error: (message, options = {}) => {
    return toast.error(message, {
      ...toastStyles.error,
      duration: 5000,
      ...options,
    });
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      ...toastStyles.loading,
      ...options,
    });
  },

  warning: (message, options = {}) => {
    return toast(message, {
      icon: '⚠️',
      ...toastStyles.warning,
      duration: 4500,
      ...options,
    });
  },

  info: (message, options = {}) => {
    return toast(message, {
      icon: 'ℹ️',
      ...toastStyles.info,
      duration: 4000,
      ...options,
    });
  },

  promise: (promise, messages, options = {}) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Something went wrong!',
      },
      {
        success: toastStyles.success,
        error: toastStyles.error,
        loading: toastStyles.loading,
        ...options,
      }
    );
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  dismissAll: () => {
    toast.dismiss();
  },

  // Custom toast for assessment operations
  assessment: {
    draftSaved: () => {
      return showToast.success('✅ Draft saved successfully!', {
        duration: 3000,
      });
    },

    published: (wasDraft = false) => {
      const message = wasDraft
        ? '🎉 Assessment published successfully! Moved from drafts to published assessments.'
        : '🎉 Assessment published successfully! Now available for candidates.';
      return showToast.success(message, {
        duration: 5000,
      });
    },

    deleted: (isDraft = false) => {
      const message = isDraft
        ? '🗑️ Draft assessment deleted successfully!'
        : '🗑️ Assessment deleted successfully!';
      return showToast.success(message, {
        duration: 3000,
      });
    },

    publishError: () => {
      return showToast.error('❌ Failed to publish assessment. Please try again.');
    },

    saveError: () => {
      return showToast.error('❌ Failed to save assessment. Please try again.');
    },

    deleteError: () => {
      return showToast.error('❌ Failed to delete assessment. Please try again.');
    },
  },

  // Custom toast for job operations
  job: {
    created: () => showToast.success('✅ Job created successfully!'),
    updated: () => showToast.success('✅ Job updated successfully!'),
    deleted: () => showToast.success('🗑️ Job deleted successfully!'),
    error: () => showToast.error('❌ Job operation failed. Please try again.'),
  },

  // Custom toast for candidate operations
  candidate: {
    created: () => showToast.success('✅ Candidate added successfully!'),
    updated: () => showToast.success('✅ Candidate updated successfully!'),
    deleted: () => showToast.success('🗑️ Candidate deleted successfully!'),
    moved: (newStatus) => showToast.success(`✅ Candidate moved to ${newStatus}!`),
    error: () => showToast.error('❌ Candidate operation failed. Please try again.'),
  },
};

export default showToast;
