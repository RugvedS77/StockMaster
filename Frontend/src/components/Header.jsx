const Header = ({ isSidebarOpen, setIsSidebarOpen, products }) => {
    const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
    return (
      <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 z-10">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <Menu size={20} />
        </button>
        <div className="flex items-center space-x-4">
           <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors relative">
              <AlertCircle size={20} />
              {lowStockCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
           </button>
           <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Settings size={20} />
           </button>
        </div>
      </header>
    );
  };