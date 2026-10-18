'use client';

import { useBucket } from '@/contexts/bucket-context';

export default function BucketInfo() {
  const { currentBucket, clearBucket, isAuthenticated } = useBucket();

  if (!isAuthenticated || !currentBucket) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 bg-zinc-900/90 border border-white/[0.08] rounded-full p-1 pl-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-mono font-medium text-zinc-200">
          {currentBucket}
        </span>
      </div>
      
      <button
        onClick={clearBucket}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/[0.06] rounded-full transition-all duration-150"
        title="Switch to another bucket"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
        <span>Switch</span>
      </button>
    </div>
  );
}

