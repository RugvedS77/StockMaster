import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { LayoutDashboard, AlertCircle, ArrowDownLeft, Truck, ArrowRightLeft } from 'lucide-react';

export const Dashboard = () => {
  const { products, operations } = useOutletContext(); // Get data from Layout
  const navigate = useNavigate();

  const lowStockItems = products.filter(p => p.stock <= p.minStock);
  const pendingReceipts = operations.filter(o => o.type === 'receipt' && o.status !== 'done').length;
  const pendingDeliveries = operations.filter(o => o.type === 'delivery' && o.status !== 'done').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Products" value={products.length} icon={LayoutDashboard} color="bg-blue-500" />
        <StatCard title="Low Stock Alerts" value={lowStockItems.length} subtext={lowStockItems.length > 0 ? "Action needed" : "Healthy"} icon={AlertCircle} color="bg-red-500" />
        <StatCard title="Pending Receipts" value={pendingReceipts} icon={ArrowDownLeft} color="bg-emerald-500" />
        <StatCard title="Pending Deliveries" value={pendingDeliveries} icon={Truck} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Recent Operations</h3>
            <button onClick={() => navigate('/history')} className="text-sm text-indigo-600 hover:underline">View All</button>
          </div>
          <div className="divide-y divide-gray-100">
            {operations.slice(0, 5).map(op => (
              <div key={op.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${op.type === 'receipt' ? 'bg-emerald-100 text-emerald-600' : op.type === 'delivery' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                    {op.type === 'receipt' ? <ArrowDownLeft size={16} /> : op.type === 'delivery' ? <Truck size={16} /> : <ArrowRightLeft size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{op.reference || op.id}</p>
                    <p className="text-xs text-gray-500 uppercase">{op.type}</p>
                  </div>
                </div>
                <StatusBadge status={op.status} />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-red-50">
            <h3 className="font-semibold text-red-800 flex items-center"><AlertCircle size={18} className="mr-2" /> Low Stock</h3>
          </div>
          <div className="p-4 space-y-3">
            {lowStockItems.length === 0 ? <p className="text-gray-500 text-center">All good.</p> : lowStockItems.map(p => (
              <div key={p.id} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                <span className="font-medium text-gray-800">{p.name}</span>
                <span className="font-bold text-red-600">{p.stock} {p.uom}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};