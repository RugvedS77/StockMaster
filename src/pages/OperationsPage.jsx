import React from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { Plus } from 'lucide-react';

export const OperationsPage = () => {
  // We get the type from the URL using React Router's useParams
  const { type } = useParams(); 
  // We get the data and functions from the Layout context
  const { operations, products, validateOperation, openOpModal } = useOutletContext();

  // If type is undefined (e.g., /history route), we show all. Otherwise filter.
  const isHistory = !type; 
  const filteredOps = isHistory ? operations : operations.filter(o => o.type === type);
  const title = isHistory ? 'Stock Ledger' : `${type}s`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-140px)]">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 capitalize">{title}</h2>
        {!isHistory && (
          <button onClick={() => openOpModal(type)} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <Plus size={18} className="mr-2" /> New {type}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase sticky top-0">
            <tr>
              <th className="px-6 py-3">Reference</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Items</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOps.map(op => (
              <tr key={op.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-indigo-600">{op.reference || op.id}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{op.date}</td>
                <td className="px-6 py-4 text-sm">
                  {op.items.map((i, idx) => {
                    const p = products.find(prod => prod.id === i.productId);
                    return <div key={idx}>{p?.name || 'Unknown'} x{i.qty}</div>
                  })}
                </td>
                <td className="px-6 py-4"><StatusBadge status={op.status} /></td>
                <td className="px-6 py-4 text-right">
                  {op.status !== 'done' && op.status !== 'cancelled' && (
                    <button onClick={() => validateOperation(op.id)} className="px-3 py-1 border border-indigo-600 text-indigo-600 text-xs rounded hover:bg-indigo-50">
                      VALIDATE
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredOps.length === 0 && (
              <tr><td colSpan="5" className="p-6 text-center text-gray-500">No operations found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};