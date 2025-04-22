"use client";

import React, { useState } from 'react';

interface Color {
  name: string;
  value: string;
}

interface ColorPickerProps {
  id: string;
  label: string;
  value: Color[];
  onChange: (colors: Color[]) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  id,
  label,
  value = [],
  onChange
}) => {
  const [colorName, setColorName] = useState('');
  const [colorValue, setColorValue] = useState('#000000');
  const [error, setError] = useState('');

  const addColor = () => {
    if (!colorName.trim()) {
      setError('يرجى إدخال اسم اللون');
      return;
    }

    // Check if color with same name already exists
    if (value.some(c => c.name.toLowerCase() === colorName.toLowerCase())) {
      setError('هذا اللون موجود بالفعل');
      return;
    }

    onChange([...value, { name: colorName.trim(), value: colorValue }]);
    setColorName('');
    setColorValue('#000000');
    setError('');
  };

  const removeColor = (index: number) => {
    const newColors = [...value];
    newColors.splice(index, 1);
    onChange(newColors);
  };

  // Common color presets
  const colorPresets = [
    { name: 'أسود', value: '#000000' },
    { name: 'أبيض', value: '#FFFFFF' },
    { name: 'أحمر', value: '#FF0000' },
    { name: 'أزرق', value: '#0000FF' },
    { name: 'أخضر', value: '#008000' },
    { name: 'أصفر', value: '#FFFF00' },
    { name: 'رمادي', value: '#808080' },
    { name: 'بني', value: '#A52A2A' },
    { name: 'برتقالي', value: '#FFA500' },
    { name: 'وردي', value: '#FFC0CB' },
  ];

  const handlePresetClick = (preset: Color) => {
    setColorName(preset.name);
    setColorValue(preset.value);
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>

      {/* Color presets */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">ألوان شائعة:</p>
        <div className="flex flex-wrap gap-2">
          {colorPresets.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className="flex items-center space-x-1 space-x-reverse px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <span
                className="inline-block w-3 h-3 rounded-full border border-gray-300 dark:border-gray-500"
                style={{ backgroundColor: preset.value }}
              ></span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {/* Added colors list */}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {value.map((color, index) => (
              <div
                key={index}
                className="inline-flex items-center bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-1 text-sm"
              >
                <span
                  className="inline-block w-3 h-3 rounded-full border border-gray-300 dark:border-gray-500 ml-2"
                  style={{ backgroundColor: color.value }}
                ></span>
                <span>{color.name}</span>
                <button
                  type="button"
                  onClick={() => removeColor(index)}
                  className="mr-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Color picker */}
        <div className="flex space-x-2 space-x-reverse">
          <div className="flex-1">
            <input
              type="text"
              id={`${id}-name`}
              value={colorName}
              onChange={(e) => {
                setColorName(e.target.value);
                if (error) setError('');
              }}
              placeholder="اسم اللون (مثال: أحمر)"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            />
          </div>
          <div className="w-20 relative flex items-center">
            <input
              type="color"
              id={`${id}-value`}
              value={colorValue}
              onChange={(e) => setColorValue(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
            <div className="flex-1 h-9 rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden">
              <div
                className="w-full h-full"
                style={{ backgroundColor: colorValue }}
              ></div>
            </div>
          </div>
          <button
            type="button"
            onClick={addColor}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
          >
            إضافة
          </button>
        </div>
        
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
};

export default ColorPicker;
