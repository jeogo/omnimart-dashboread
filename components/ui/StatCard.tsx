import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'red';
  loading?: boolean;
}

const colorClasses = {
  blue: 'text-blue-500 bg-blue-100 dark:bg-blue-900 dark:bg-opacity-20',
  green: 'text-green-500 bg-green-100 dark:bg-green-900 dark:bg-opacity-20',
  purple: 'text-purple-500 bg-purple-100 dark:bg-purple-900 dark:bg-opacity-20',
  red: 'text-red-500 bg-red-100 dark:bg-red-900 dark:bg-opacity-20',
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, loading = false }) => {
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-md font-medium text-gray-500 dark:text-gray-400">{title}</h2>
        <span className={`p-2 rounded-full ${colorClasses[color]}`}>
          {icon}
        </span>
      </div>
      <p className="text-3xl font-bold text-gray-800 dark:text-white">
        {loading ? <span className="animate-pulse">...</span> : value}
      </p>
    </div>
  );
};

export default StatCard;
