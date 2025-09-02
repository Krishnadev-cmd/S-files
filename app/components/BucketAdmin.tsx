'use client';

import { useState } from 'react';

export default function BucketAdmin() {
  const [debugBucket, setDebugBucket] = useState('');
  const [debugResult, setDebugResult] = useState('');
  const [isDebugging, setIsDebugging] = useState(false);

  const handleDebug = async () => {
    if (!debugBucket.trim()) {
      alert('Please enter a bucket name to debug');
      return;
    }

    setIsDebugging(true);
    try {
      const response = await fetch(`/api/bucket/debug?bucket=${debugBucket}`);
      const data = await response.json();
      setDebugResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setDebugResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDebugging(false);
    }
  };

  const setupR2Bucket = async () => {
    if (!debugBucket.trim()) {
      alert('Please enter a bucket name');
      return;
    }

    setIsDebugging(true);
    try {
      const response = await fetch('/api/bucket/setup-r2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bucketName: debugBucket }),
      });
      
      const data = await response.json();
      if (response.ok) {
        alert('R2 bucket setup completed successfully!');
        setDebugResult(JSON.stringify(data, null, 2));
      } else {
        alert(`Setup failed: ${data.error}`);
        setDebugResult(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      alert(`Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Bucket Administration</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="debugBucket" className="block text-sm font-medium text-gray-700 mb-2">
              Bucket Name
            </label>
            <input
              id="debugBucket"
              type="text"
              value={debugBucket}
              onChange={(e) => setDebugBucket(e.target.value)}
              placeholder="Enter bucket name to debug/setup"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleDebug}
              disabled={isDebugging}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isDebugging ? 'Debugging...' : 'Debug Bucket'}
            </button>
            
            <button
              onClick={setupR2Bucket}
              disabled={isDebugging}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isDebugging ? 'Setting up...' : 'Setup R2 Bucket'}
            </button>
          </div>

          {debugResult && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Debug Result:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {debugResult}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>CORS Configuration Required:</strong> If you're using Cloudflare R2, make sure to configure CORS policy in your R2 dashboard. 
              Check the <code>R2_CORS_SETUP.md</code> file for detailed instructions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
