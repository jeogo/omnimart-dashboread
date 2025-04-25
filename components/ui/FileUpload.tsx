import React, { useState, useEffect } from 'react';

interface FileUploadProps {
  value?: string[];
  onUpload: (urls: string[]) => void;
  multiple?: boolean;
  maxUrls?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  value = [],
  onUpload,
  multiple = true,
  maxUrls = 5,
}) => {
  const [urls, setUrls] = useState<string[]>(Array.isArray(value) ? value : []);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Keep internal state in sync with props
  useEffect(() => {
    if (!Array.isArray(value) && value !== urls) {
      setUrls([]);
    } else if (JSON.stringify(value) !== JSON.stringify(urls)) {
      setUrls(Array.isArray(value) ? value : []);
    }
  }, [value, urls]);

  // Handle adding image URL
  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) return;
    
    // Basic URL validation
    let validUrl = imageUrl.trim();
    
    // Make sure URL has a protocol
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = `https://${validUrl}`;
    }
    
    // Validate URL format
    try {
      new URL(validUrl);
    } catch (e) {
      setError('الرجاء إدخال رابط صحيح');
      return;
    }
    
    // Check max number of images
    if (multiple && urls.length + 1 > maxUrls) {
      setError(`يمكن إضافة ${maxUrls} صور كحد أقصى`);
      return;
    }
    
    // Update URLs
    const newUrls = multiple ? [...urls, validUrl] : [validUrl];
    setUrls(newUrls);
    onUpload(newUrls);
    setImageUrl('');
    setError(null);
  };

  // Handle removing a URL
  const handleRemoveUrl = (index: number) => {
    const newUrls = [...urls];
    newUrls.splice(index, 1);
    setUrls(newUrls);
    onUpload(newUrls);
  };

  return (
    <div className="w-full">
      {/* URL Input */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
        <p className="text-sm mb-3">أدخل روابط الصور مباشرة</p>
        
        <div className="flex flex-row-reverse gap-2">
          <input
            type="text"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddImageUrl();
              }
            }}
          />
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex-shrink-0"
            onClick={handleAddImageUrl}
          >
            إضافة
          </button>
        </div>
        
        {error && (
          <div className="mt-2 text-sm text-red-600">
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Preview */}
      {urls.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">الصور المضافة ({urls.length}):</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {urls.map((url, index) => (
              <div key={index} className="relative rounded-md overflow-hidden group bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                <img
                  src={url}
                  alt={`صورة ${index + 1}`}
                  className="h-32 w-full object-cover"
                  onError={(e) => {
                    // Use a safe placeholder image
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='150' viewBox='0 0 300 150'%3E%3Crect width='300' height='150' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24px' fill='%23333333'%3EImage Error%3C/text%3E%3C/svg%3E";
                  }}
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-75 hover:opacity-100"
                  onClick={() => handleRemoveUrl(index)}
                  title="حذف"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
