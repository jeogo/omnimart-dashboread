"use client";

import React from 'react';

type StatsCardProps = {
  title: string;
  value: string;
  icon: 'money' | 'order' | 'user' | 'package';
  trend?: 'up' | 'down' | 'neutral';
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, color }) => {
  // Get the appropriate color classes
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:bg-opacity-20 dark:text-blue-300',
    green: 'bg-green-50 text-green-700 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-300',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900 dark:bg-opacity-20 dark:text-purple-300',
    orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900 dark:bg-opacity-20 dark:text-orange-300',
    red: 'bg-red-50 text-red-700 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-300',
  }[color];

  // Get the appropriate icon
  const iconSVG = {
    money: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    order: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    user: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    package: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  }[icon];

  // Get the trend icon
  const trendIcon = trend && {
    up: (
      <div className="flex items-center text-green-600 dark:text-green-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
        <span className="text-xs font-medium">+5.7%</span>
      </div>
    ),
    down: (
      <div className="flex items-center text-red-600 dark:text-red-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        <span className="text-xs font-medium">-3.2%</span>
      </div>
    ),
    neutral: (
      <div className="flex items-center text-gray-600 dark:text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
        </svg>
        <span className="text-xs font-medium">0%</span>
      </div>
    ),
  }[trend];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`rounded-full p-3 ${colorClasses}`}>
          {iconSVG}
        </div>
        {trendIcon}
      </div>
      <div>
        <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
        <div className="text-2xl font-bold text-gray-800 dark:text-white">{value}</div>
      </div>
    </div>
  );
};

export default StatsCard;
