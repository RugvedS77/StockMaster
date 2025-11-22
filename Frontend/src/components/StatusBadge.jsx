import React from 'react';

export const StatusBadge = ({ status }) => {
  const styles = {
    draft: 'bg-gray-100 text-gray-600',
    waiting: 'bg-orange-100 text-orange-600',
    ready: 'bg-blue-100 text-blue-600',
    done: 'bg-green-100 text-green-600',
    cancelled: 'bg-red-100 text-red-600',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status] || styles.draft}`}>
      {status}
    </span>
  );
};