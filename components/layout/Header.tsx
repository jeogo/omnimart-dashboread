"use client";

import Button from '../ui/Button';

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  return (
    <header className="fixed z-10 md:right-64 right-0 left-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 md:sidebar-expanded:right-16">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white truncate">{title}</h1>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
            م
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">المدير</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
