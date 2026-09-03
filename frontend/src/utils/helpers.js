export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const formatPercentage = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return `${value.toFixed(1)}%`;
};

export const getAttendanceColor = (percentage, threshold = 75) => {
  if (percentage === null || percentage === undefined || isNaN(percentage)) return 'var(--gray-500)';
  if (percentage >= 90) return 'var(--success-600)';
  if (percentage >= threshold) return 'var(--warning-600)';
  return 'var(--danger-600)';
};

export const getErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors) return error.response.data.errors.map(e => e.message || e).join(', ');
  if (error.message) return error.message;
  return 'An unexpected error occurred.';
};
