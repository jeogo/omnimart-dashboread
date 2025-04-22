const Navbar = () => {
  return (
    <div className="bg-white dark:bg-gray-800 h-16 fixed top-0 right-64 left-0 shadow-sm flex items-center justify-between px-6 z-10">
      <div>
        <h1 className="text-lg font-medium">لوحة تحكم OmniMart</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <span>🔔</span>
        </button>
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600"></div>
          <span>المدير</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
