import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { INITIAL_PRODUCTS, INITIAL_OPERATIONS } from '../data/mockData';
import { Menu, AlertCircle, Plus, X } from 'lucide-react';

// Product Modal Component (Simplified)
const ProductModal = ({ newProduct, setNewProduct, handleCreateProduct, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">New Product</h3>
        <button onClick={onClose}><X size={20} className="text-gray-500 hover:text-gray-800" /></button>
      </div>
      <input className="w-full border p-2 rounded mb-2" placeholder="Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
      <input className="w-full border p-2 rounded mb-2" placeholder="SKU" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} />
      <div className="grid grid-cols-2 gap-2 mb-4">
          <input className="w-full border p-2 rounded" type="number" placeholder="Stock" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
          <input className="w-full border p-2 rounded" placeholder="UoM (kg, pcs)" value={newProduct.uom} onChange={e => setNewProduct({...newProduct, uom: e.target.value})} />
      </div>
      <input className="w-full border p-2 rounded mb-2" placeholder="Category" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
      <input className="w-full border p-2 rounded mb-4" type="number" placeholder="Price" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
      
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-gray-600">Cancel</button>
        <button onClick={handleCreateProduct} className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
      </div>
    </div>
  </div>
);

// Operation Modal Component (Simplified)
const OperationModal = ({ currentOpType, newOp, setNewOp, handleCreateOperation, products, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg capitalize">New {currentOpType}</h3>
          <button onClick={onClose}><X size={20} className="text-gray-500 hover:text-gray-800" /></button>
        </div>
        <input className="w-full border p-2 rounded mb-2" placeholder="Reference (e.g. PO-999)" value={newOp.reference} onChange={e => setNewOp({...newOp, reference: e.target.value})} />
        
        {/* Simplified Item Adder */}
        <div className="bg-gray-50 p-3 rounded mb-4">
            <p className="text-xs font-bold mb-2">Add Item (Default Qty: 1)</p>
            <select 
              className="w-full border p-2 rounded mb-2"
              onChange={(e) => {
                if(e.target.value) {
                    setNewOp({...newOp, items: [...newOp.items, { productId: parseInt(e.target.value), qty: 1 }]})
                }
              }}
            >
                <option value="">Select Product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div className="text-xs text-gray-500 max-h-20 overflow-auto">
              {newOp.items.map((i, idx) => {
                const p = products.find(x => x.id === i.productId);
                return <div key={idx} className="flex justify-between">{p?.name}<span>x{i.qty}</span></div>
              })}
            </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600">Cancel</button>
          <button onClick={handleCreateOperation} className="px-4 py-2 bg-indigo-600 text-white rounded">Confirm</button>
        </div>
      </div>
  </div>
);


export const RootLayout = ({ onLogout, user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [operations, setOperations] = useState(INITIAL_OPERATIONS);
  
  // Modal States
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOpModal, setShowOpModal] = useState(false);
  const [currentOpType, setCurrentOpType] = useState('receipt');
  
  // Temporary Form State
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', category: '', stock: 0, uom: '', minStock: 0, price: 0 });
  const [newOp, setNewOp] = useState({ reference: '', items: [] });

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  // --- LOGIC HANDLERS ---

  const handleCreateProduct = () => {
    const product = { ...newProduct, id: products.length + 1, stock: parseInt(newProduct.stock) || 0, minStock: parseInt(newProduct.minStock) || 0, price: parseFloat(newProduct.price) || 0 };
    setProducts([...products, product]);
    setShowProductModal(false);
    setNewProduct({ name: '', sku: '', category: '', stock: 0, uom: '', minStock: 0, price: 0 });
  };

  const handleCreateOperation = () => {
    const op = { 
      ...newOp, 
      type: currentOpType,
      id: `OP-${Math.floor(Math.random() * 10000)}`, 
      status: 'draft', 
      date: new Date().toISOString().split('T')[0] 
    };
    setOperations([op, ...operations]);
    setShowOpModal(false);
    setNewOp({ reference: '', items: [] });
  };

  const validateOperation = (opId) => {
    const opIndex = operations.findIndex(o => o.id === opId);
    const op = operations[opIndex];
    if (!op || op.status === 'done') return;

    const updatedProducts = [...products];
    let possible = true;

    // Check stock for outgoing
    if (op.type === 'delivery' || op.type === 'internal') {
      op.items.forEach(item => {
        const prodIndex = updatedProducts.findIndex(p => p.id === item.productId);
        if (!updatedProducts[prodIndex] || updatedProducts[prodIndex].stock < item.qty) possible = false;
      });
    }

    if (!possible && (op.type === 'delivery' || op.type === 'internal')) {
      alert("Not enough stock to validate this operation!");
      return;
    }

    // Apply moves
    op.items.forEach(item => {
      const prodIndex = updatedProducts.findIndex(p => p.id === item.productId);
      if(updatedProducts[prodIndex]) {
        if (op.type === 'receipt') updatedProducts[prodIndex].stock += parseInt(item.qty);
        else if (op.type === 'delivery') updatedProducts[prodIndex].stock -= parseInt(item.qty);
        else if (op.type === 'adjustment') updatedProducts[prodIndex].stock = parseInt(item.qty);
      }
    });

    const updatedOps = [...operations];
    updatedOps[opIndex].status = 'done';
    setProducts(updatedProducts);
    setOperations(updatedOps);
  };

  const openOpModal = (type) => {
    setCurrentOpType(type);
    setNewOp({ reference: '', items: [] }); // Reset op form on open
    setShowOpModal(true);
  };
  
  const openProductModal = () => {
    setNewProduct({ name: '', sku: '', category: '', stock: 0, uom: '', minStock: 0, price: 0 }); // Reset product form on open
    setShowProductModal(true);
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-gray-900">
      <Sidebar isOpen={isSidebarOpen} user={user} onLogout={onLogout} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 z-10">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <Menu size={20} />
          </button>
          <div className="flex items-center space-x-4">
             <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors relative">
               <AlertCircle size={20} />
               {lowStockCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
             </button>
             <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
                {user?.email?.[0].toUpperCase()}
             </div>
          </div>
        </header>

        {/* Main Content Area - Renders children routes */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet context={{ 
            products, 
            operations, 
            validateOperation, 
            openProductModal,
            openOpModal 
          }} />
        </div>
      </main>

      {/* GLOBAL MODALS */}
      {showProductModal && (
        <ProductModal 
          newProduct={newProduct} 
          setNewProduct={setNewProduct} 
          handleCreateProduct={handleCreateProduct} 
          onClose={() => setShowProductModal(false)}
        />
      )}

      {showOpModal && (
        <OperationModal 
          currentOpType={currentOpType} 
          newOp={newOp} 
          setNewOp={setNewOp} 
          handleCreateOperation={handleCreateOperation} 
          products={products} 
          onClose={() => setShowOpModal(false)}
        />
      )}
    </div>
  );
};