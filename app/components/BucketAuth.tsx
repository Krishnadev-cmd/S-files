'use client';

import { useState } from 'react';
import { useBucket } from '@/contexts/bucket-context';
import BucketSetupGuide from './BucketSetupGuide';

export default function BucketAuth() {
  const [bucketName, setBucketName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createBucketName, setCreateBucketName] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createConfirmPassword, setCreateConfirmPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const { setBucket } = useBucket();

  const handleBucketAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bucketName.trim() || !password.trim()) {
      alert('Please enter both bucket name and password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/bucket/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bucketName: bucketName.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBucket(bucketName.trim());
      } else {
        const errorMsg = data.error || 'Invalid bucket name or password';
        if (errorMsg.includes('bucket') && errorMsg.includes('exists')) {
          // Show setup guide for bucket-related errors
          setShowSetupGuide(true);
        }
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error accessing bucket:', error);
      alert('Failed to access bucket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBucket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createBucketName.trim() || !createPassword.trim()) {
      alert('Please fill in all fields');
      return;
    }

    if (createPassword !== createConfirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (createPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/bucket/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bucketName: createBucketName.trim(),
          password: createPassword.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Bucket created successfully!');
        setBucket(createBucketName.trim());
        setShowCreateForm(false);
        setCreateBucketName('');
        setCreatePassword('');
        setCreateConfirmPassword('');
      } else {
        alert(data.error || 'Failed to create bucket');
      }
    } catch (error) {
      console.error('Error creating bucket:', error);
      alert('Failed to create bucket. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-md w-full space-y-6">
        {/* Main Access Form */}
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Access Your Bucket
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your bucket credentials to access your files
            </p>
          </div>

          <form onSubmit={handleBucketAccess} className="space-y-6">
            <div>
              <label htmlFor="bucketName" className="block text-sm font-medium text-gray-700 mb-2">
                Bucket Name
              </label>
              <input
                id="bucketName"
                type="text"
                value={bucketName}
                onChange={(e) => setBucketName(e.target.value)}
                placeholder="Enter bucket name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter bucket password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Accessing...
                </>
              ) : (
                'Access Bucket'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
            >
              {showCreateForm ? 'Cancel' : 'Create New Bucket'}
            </button>
          </div>
        </div>

        {/* Create Bucket Form */}
        {showCreateForm && (
          <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-white/20">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Create New Bucket</h3>
              <p className="mt-2 text-sm text-gray-600">
                Set up a new secure bucket for your group
              </p>
            </div>

            <form onSubmit={handleCreateBucket} className="space-y-4">
              <div>
                <label htmlFor="createBucketName" className="block text-sm font-medium text-gray-700 mb-2">
                  Bucket Name
                </label>
                <input
                  id="createBucketName"
                  type="text"
                  value={createBucketName}
                  onChange={(e) => setCreateBucketName(e.target.value)}
                  placeholder="Enter unique bucket name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label htmlFor="createPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="createPassword"
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="Create a strong password (min 6 chars)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="createConfirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="createConfirmPassword"
                  type="password"
                  value={createConfirmPassword}
                  onChange={(e) => setCreateConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isCreating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Bucket'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Info Section */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Secure Buckets</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Password Protected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Group Access</span>
            </div>
          </div>
          
          <div className="mt-4">
            <a 
              href="/admin" 
              className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors mr-4"
            >
              Admin Panel (Debug & Setup)
            </a>
            <button
              onClick={() => setShowSetupGuide(true)}
              className="text-sm text-purple-600 hover:text-purple-500 font-medium transition-colors"
            >
              R2 Setup Guide
            </button>
          </div>
        </div>
      </div>

      {/* Setup Guide Modal */}
      {showSetupGuide && (
        <BucketSetupGuide onClose={() => setShowSetupGuide(false)} />
      )}
    </div>
  );
}
