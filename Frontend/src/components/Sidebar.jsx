import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  ArrowRightLeft, 
  ClipboardCheck, 
  History, 
  Settings, 
  User,
  LogOut,
  ArrowDownLeft
} from 'lucide-react';

export const Sidebar = ({ isOpen, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Helper to check active route
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const SidebarItem = ({ path, icon: Icon, label }) => (
    <button
      onClick={() => navigate(path)}
      className={`w-full flex items-center space-x-3 px-4 py-3 mb-1 rounded-lg transition-colors ${
        isActive(path)
          ? 'bg-indigo-50 text-indigo-600 font-medium border-r-4 border-indigo-600' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  // Function to safely extract the username part from the email
  const getUsername = () => {
    // Check if user and user.email exist and convert to string before splitting
    if (user && user.email) {
        return String(user.email).split('@')[0];
    }
    return 'Manager';
  };

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col overflow-hidden fixed md:relative z-20 h-full`}>
      <div className="p-6 flex items-center space-x-3 border-b border-gray-100">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Package className="text-white" size={20} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">StockMaster</h1>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main</p>
        <SidebarItem path="/" icon={LayoutDashboard} label="Dashboard" />
        <SidebarItem path="/products" icon={Package} label="Products" />
        
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">Operations</p>
        <SidebarItem path="/operations/receipt" icon={ArrowDownLeft} label="Receipts" />
        <SidebarItem path="/operations/delivery" icon={Truck} label="Deliveries" />
        <SidebarItem path="/operations/internal" icon={ArrowRightLeft} label="Internal Transfers" />
        <SidebarItem path="/operations/adjustment" icon={ClipboardCheck} label="Adjustments" />
        
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">Reporting</p>
        <SidebarItem path="/history" icon={History} label="Stock Ledger" />
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-3 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            <User size={16} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">{getUsername()}</p>
            <p className="text-xs text-gray-500">Warehouse Mgr</p>
          </div>
          <button onClick={onLogout} className="text-gray-400 hover:text-red-600 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};