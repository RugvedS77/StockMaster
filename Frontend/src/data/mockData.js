// ==========================================
// 1. MOCK DATA
// ==========================================
export const INITIAL_PRODUCTS = [
  { id: 1, name: 'Steel Rods', sku: 'SR-001', category: 'Raw Material', stock: 150, uom: 'kg', minStock: 20, price: 45.00 },
  { id: 2, name: 'Wooden Pallet', sku: 'WP-102', category: 'Logistics', stock: 8, uom: 'units', minStock: 15, price: 12.00 },
  { id: 3, name: 'Industrial Glue', sku: 'IG-550', category: 'Consumable', stock: 42, uom: 'liters', minStock: 10, price: 8.50 },
  { id: 4, name: 'Office Chair', sku: 'FUR-009', category: 'Furniture', stock: 5, uom: 'units', minStock: 5, price: 120.00 },
];

export const INITIAL_OPERATIONS = [
  { id: 'OP-101', type: 'receipt', reference: 'PO-001', partner: 'Steel Supplies Co.', status: 'done', date: '2023-10-25', items: [{ productId: 1, qty: 100 }] },
  { id: 'OP-102', type: 'delivery', reference: 'SO-042', partner: 'Acme Corp', status: 'waiting', date: '2023-10-26', items: [{ productId: 4, qty: 2 }] },
  { id: 'OP-103', type: 'internal', reference: 'INT-005', source: 'Warehouse A', dest: 'Production', status: 'done', date: '2023-10-27', items: [{ productId: 1, qty: 50 }] },
];