"use client";

import React, { useState } from 'react';

interface DatePickerProps {
  id: string;
  label: string;
  selectedDate: Date;
  onChange: (date: Date) => void;
  required?: boolean;
  error?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  id,
  label,
  selectedDate,
  onChange,
  required = false,
  error
}) => {
  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle date change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      onChange(new Date(dateValue));
    }
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>
      <input
        type="date"
        id={id}
        className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
        }`}
        value={formatDateForInput(selectedDate)}
        onChange={handleChange}
        required={required}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default DatePicker;
