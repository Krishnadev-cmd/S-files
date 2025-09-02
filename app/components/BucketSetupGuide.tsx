'use client';

import { useState } from 'react';

interface BucketSetupGuideProps {
  onClose: () => void;
}

export default function BucketSetupGuide({ onClose }: BucketSetupGuideProps) {
  const [testBucket, setTestBucket] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTestBucket = async () => {
    if (!testBucket.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/bucket/debug?bucket=${testBucket}`);
      const data = await response.json();
      
      if (response.ok) {
        alert(`Bucket test successful! Status: ${data.status}`);
      } else {
        alert(`Bucket test failed: ${data.message}`);
      }
    } catch (error) {
      alert(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">R2 Bucket Setup Guide</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Action Required</h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    Buckets must be created manually in your Cloudflare R2 dashboard with proper CORS configuration.
                  </p>
                </div>
              </div>
            </div>

            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold mb-3">Steps to Set Up R2 Bucket:</h3>
              
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Go to <a href="https://dash.cloudflare.com/" target="_blank" className="text-blue-600 hover:underline">Cloudflare Dashboard</a></li>
                <li>Navigate to <strong>R2 Object Storage</strong></li>
                <li>Click <strong>"Create bucket"</strong></li>
                <li>Enter your bucket name (e.g., "kd", "student-group-1", etc.)</li>
                <li>Click <strong>"Create bucket"</strong></li>
                <li>Go to bucket <strong>Settings → CORS Policy</strong></li>
                <li>Add this CORS configuration:</li>
              </ol>

              <div className="bg-gray-100 p-4 rounded-lg mt-4">
                <pre className="text-xs overflow-x-auto">
{`[
  {
    "AllowedOrigins": ["http://localhost:3000", "*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]`}
                </pre>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold">Bucket Name Rules:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                  <li>3-63 characters long</li>
                  <li>Lowercase letters, numbers, and hyphens only</li>
                  <li>Must start and end with letter or number</li>
                  <li>Globally unique across all R2 accounts</li>
                </ul>
              </div>
            </div>

            {/* Test Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">Test Bucket Setup</h3>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={testBucket}
                  onChange={(e) => setTestBucket(e.target.value)}
                  placeholder="Enter bucket name to test"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleTestBucket}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Testing...' : 'Test'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
