"use client";

import React from 'react';
import { useEffect, useState } from 'react';

type StatsCardProps = {
  title: string;
  value: string;
  icon: 'money' | 'order' | 'user' | 'package' | 'folder' | 'tag';
  trend?: 'up' | 'down' | 'neutral';
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, color }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState('0');
  
  // Get the appropriate color classes
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:bg-opacity-20 dark:text-blue-300',
    green: 'bg-green-50 text-green-600 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-300',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900 dark:bg-opacity-20 dark:text-purple-300',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900 dark:bg-opacity-20 dark:text-orange-300',
    red: 'bg-red-50 text-red-600 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-300',
  }[color];

  const borderColorClass = {
    blue: 'border-blue-100 dark:border-blue-800',
    green: 'border-green-100 dark:border-green-800',
    purple: 'border-purple-100 dark:border-purple-800',
    orange: 'border-orange-100 dark:border-orange-800',
    red: 'border-red-100 dark:border-red-800',
  }[color];

  const textColorClass = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400',
    orange: 'text-orange-600 dark:text-orange-400',
    red: 'text-red-600 dark:text-red-400',
  }[color];
  
  const ringColorClass = {
    blue: 'ring-blue-500/30 dark:ring-blue-500/20',
    green: 'ring-green-500/30 dark:ring-green-500/20',
    purple: 'ring-purple-500/30 dark:ring-purple-500/20',
    orange: 'ring-orange-500/30 dark:ring-orange-500/20',
    red: 'ring-red-500/30 dark:ring-red-500/20',
  }[color];

  const bgGradientClass = {
    blue: 'from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/10',
    green: 'from-green-500/10 to-green-500/5 dark:from-green-500/20 dark:to-green-500/10',
    purple: 'from-purple-500/10 to-purple-500/5 dark:from-purple-500/20 dark:to-purple-500/10',
    orange: 'from-orange-500/10 to-orange-500/5 dark:from-orange-500/20 dark:to-orange-500/10',
    red: 'from-red-500/10 to-red-500/5 dark:from-red-500/20 dark:to-red-500/10',
  }[color];

  const trendColorClass = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  }[trend || 'neutral'];

  // Icons as SVG components
  const icons = {
    money: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    order: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    user: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    package: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    folder: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    tag: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    )
  };

  // Trend icons
  const trendIcons = {
    up: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    down: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    neutral: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    )
  };

  // Animate number counting
  useEffect(() => {
    setIsVisible(true);
    
    // Extract numeric part from value for animation
    const numericValue = value.replace(/[^0-9]/g, '');
    
    const endValue = parseInt(numericValue, 10) || 0;
    const duration = 1500; // ms
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameDuration);
    
    let frame = 0;
    const countTo = endValue / totalFrames;
    
    const counter = setInterval(() => {
      frame++;
      const currentCount = Math.round(countTo * frame);
      
      // Format the number and add back any non-numeric parts (like currency)
      const formattedValue = value.replace(numericValue, currentCount.toString());
      setDisplayValue(formattedValue);
      
      if (frame === totalFrames) {
        clearInterval(counter);
        setDisplayValue(value); // Ensure final value is exact
      }
    }, frameDuration);
    
    return () => clearInterval(counter);
  }, [value]);

  return (
    <div 
      className={`relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border ${borderColorClass} transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 ${isVisible ? 'opacity-100' : 'opacity-0'} bg-gradient-to-br ${bgGradientClass}`}
    >
      {/* Decorative circles in the background */}
      <div className={`absolute -top-6 -right-6 h-16 w-16 rounded-full ${colorClasses} opacity-20 blur-xl`}></div>
      <div className={`absolute -bottom-4 -left-4 h-12 w-12 rounded-full ${colorClasses} opacity-20 blur-lg`}></div>
      
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{displayValue}</h3>
          
          {trend && (
            <div className={`mt-2 inline-flex items-center text-sm font-medium ${trendColorClass} bg-opacity-20 px-2 py-0.5 rounded-full`}>
              {trendIcons[trend]}
              {trend === 'up' ? 'زيادة' : trend === 'down' ? 'نقصان' : 'مستقر'}
            </div>
          )}
        </div>
        
        <div className={`flex-shrink-0 p-3 rounded-lg ${colorClasses} ring-4 ${ringColorClass}`}>
          {icons[icon]}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
