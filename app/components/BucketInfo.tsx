'use client';

import { useBucket } from '@/contexts/bucket-context';

export default function BucketInfo() {
  const { currentBucket, clearBucket, isAuthenticated } = useBucket();

  if (!isAuthenticated || !currentBucket) {
    return null;
  }

  const handleBucketLogout = () => {
    clearBucket();
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Current Bucket Info */}
      <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm font-medium text-green-700 dark:text-green-300">
          Bucket: {currentBucket}
        </span>
      </div>
      
      {/* Switch Bucket Button */}
      <button
        onClick={handleBucketLogout}
        className="inline-flex items-center px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-all duration-200 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
        title="Switch to different bucket"
      >
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
        Switch Bucket
      </button>
    </div>
  );
}
