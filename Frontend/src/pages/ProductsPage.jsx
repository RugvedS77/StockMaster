import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus } from 'lucide-react';

export const ProductsPage = () => {
  const { products, openProductModal } = useOutletContext();
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-140px)]">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Products</h2>
        <button onClick={openProductModal} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Plus size={18} className="mr-2" /> Add Product
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase sticky top-0">
            <tr>
              <th className="px-6 py-3">Name / SKU</th>
              <th className="px-6 py-3 text-center">Stock</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.sku}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`font-bold ${p.stock <= p.minStock ? 'text-red-600' : 'text-gray-800'}`}>{p.stock}</span>
                  <span className="text-xs text-gray-400 ml-1">{p.uom}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.category}</td>
                <td className="px-6 py-4 text-right">${p.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};