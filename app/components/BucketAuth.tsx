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
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-cyan-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="relative max-w-md w-full space-y-6 z-10">
        {/* Main Access Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-white/[0.08]">
          <div className="text-center mb-8">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/10">
              <svg className="h-7 w-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Access Bucket
            </h2>
            <p className="mt-1.5 text-xs text-zinc-400">
              Enter your bucket credentials to browse and upload files
            </p>
          </div>

          <form onSubmit={handleBucketAccess} className="space-y-4">
            <div>
              <label htmlFor="bucketName" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Bucket Name
              </label>
              <input
                id="bucketName"
                type="text"
                value={bucketName}
                onChange={(e) => setBucketName(e.target.value)}
                placeholder="e.g. test1, team-docs"
                className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-white/[0.08] focus:border-indigo-500 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Bucket password"
                className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-white/[0.08] focus:border-indigo-500 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-500 via-blue-600 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Verifying...</span>
                </>
              ) : (
                'Access Bucket'
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              {showCreateForm ? 'Cancel' : '+ Create New Bucket'}
            </button>
          </div>
        </div>

        {/* Create Bucket Form Modal/Drawer */}
        {showCreateForm && (
          <div className="bg-zinc-900/90 backdrop-blur-xl shadow-2xl rounded-2xl p-6 border border-white/[0.08]">
            <div className="text-center mb-5">
              <h3 className="text-lg font-bold text-white">Create New Bucket</h3>
              <p className="mt-1 text-xs text-zinc-400">
                Create a password-protected bucket on Cloudflare R2
              </p>
            </div>

            <form onSubmit={handleCreateBucket} className="space-y-3.5">
              <div>
                <label htmlFor="createBucketName" className="block text-xs font-medium text-zinc-300 mb-1">
                  Bucket Name
                </label>
                <input
                  id="createBucketName"
                  type="text"
                  value={createBucketName}
                  onChange={(e) => setCreateBucketName(e.target.value)}
                  placeholder="lowercase-numbers-hyphens"
                  className="w-full px-3 py-2 bg-zinc-950/80 border border-white/[0.08] focus:border-emerald-500 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="createPassword" className="block text-xs font-medium text-zinc-300 mb-1">
                  Password (min 6 characters)
                </label>
                <input
                  id="createPassword"
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="Set bucket password"
                  className="w-full px-3 py-2 bg-zinc-950/80 border border-white/[0.08] focus:border-emerald-500 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="createConfirmPassword" className="block text-xs font-medium text-zinc-300 mb-1">
                  Confirm Password
                </label>
                <input
                  id="createConfirmPassword"
                  type="password"
                  value={createConfirmPassword}
                  onChange={(e) => setCreateConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full px-3 py-2 bg-zinc-950/80 border border-white/[0.08] focus:border-emerald-500 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
              >
                {isCreating ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Creating Bucket...</span>
                  </>
                ) : (
                  'Create Bucket'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Footer info pills */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>R2 / S3 Storage</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            <span>Password Protected</span>
          </div>
          <span>•</span>
          <a href="/admin" className="text-zinc-400 hover:text-white transition-colors">
            Admin
          </a>
        </div>
      </div>

      {showSetupGuide && (
        <BucketSetupGuide onClose={() => setShowSetupGuide(false)} />
      )}
    </div>
  );
}
