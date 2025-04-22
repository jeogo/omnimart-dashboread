"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface FileUploadProps {
  onChange: (urls: string[]) => void;
  value: string[];
  multiple?: boolean;
  maxUrls?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onChange, 
  value = [], 
  multiple = true,
  maxUrls = 5
}) => {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [error, setError] = useState('');
  const [imageStatuses, setImageStatuses] = useState<Record<string, 'loading' | 'error' | 'success'>>({});

  // Initialize image statuses when value changes
  useEffect(() => {
    const statuses: Record<string, 'loading' | 'error' | 'success'> = {};
    value.forEach(url => {
      statuses[url] = 'loading';
    });
    setImageStatuses(statuses);
  }, []);

  const handleAddImageUrl = () => {
    // Basic URL validation
    if (!newImageUrl.trim()) {
      setError('يرجى إدخال رابط الصورة');
      return;
    }

    // Validate URL format
    try {
      new URL(newImageUrl);
    } catch (_) {
      setError('يرجى إدخال رابط صحيح');
      return;
    }

    // Check max images limit
    if (value.length >= maxUrls) {
      setError(`يمكنك إضافة ${maxUrls} صور كحد أقصى`);
      return;
    }

    // Add the new URL
    const updatedUrls = [...value, newImageUrl];
    onChange(updatedUrls);
    
    // Update image status
    setImageStatuses(prev => ({
      ...prev,
      [newImageUrl]: 'loading'
    }));
    
    setNewImageUrl('');
    setError('');
  };

  const handleRemoveUrl = (index: number) => {
    const urlToRemove = value[index];
    const newUrls = [...value];
    newUrls.splice(index, 1);
    onChange(newUrls);
    
    // Remove from statuses
    setImageStatuses(prev => {
      const newStatuses = {...prev};
      delete newStatuses[urlToRemove];
      return newStatuses;
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddImageUrl();
    }
  };

  const handleImageLoad = (url: string) => {
    setImageStatuses(prev => ({
      ...prev,
      [url]: 'success'
    }));
  };

  const handleImageError = (url: string) => {
    setImageStatuses(prev => ({
      ...prev,
      [url]: 'error'
    }));
  };

  // Sample image URLs to help users
  const sampleImages = [
    'https://images.unsplash.com/photo-1678911820864-e2c567c655d7?q=80&w=500',
    'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?q=80&w=500',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=500'
  ];

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={newImageUrl}
          onChange={(e) => {
            setNewImageUrl(e.target.value);
            if (error) setError('');
          }}
          onKeyPress={handleKeyPress}
          placeholder="أدخل رابط الصورة (URL) هنا"
          className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-28"
        />
        <button
          type="button"
          onClick={handleAddImageUrl}
          className="absolute left-1 top-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
        >
          إضافة
        </button>
      </div>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        قم بإضافة روابط الصور المناسبة. يمكنك إضافة حتى {maxUrls} صور.
      </p>

      {/* اقتراحات الصور */}
      {value.length === 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-2">استخدم هذه الصور كأمثلة:</p>
          <div className="flex flex-wrap gap-2">
            {sampleImages.map((url, index) => (
              <button
                key={index}
                onClick={() => {
                  setNewImageUrl(url);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                صورة {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* عرض الصور المضافة */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                {imageStatuses[url] === 'error' ? (
                  <div className="flex items-center justify-center h-full w-full bg-gray-200 dark:bg-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                ) : (
                  <Image 
                    src={url} 
                    alt={`صورة ${index + 1}`} 
                    fill
                    style={{ objectFit: 'cover' }}
                    className="hover:scale-110 transition-transform duration-300"
                    onLoadingComplete={() => handleImageLoad(url)}
                    onError={() => handleImageError(url)}
                  />
                )}
                {imageStatuses[url] === 'loading' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveUrl(index)}
                className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="حذف الصورة"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
