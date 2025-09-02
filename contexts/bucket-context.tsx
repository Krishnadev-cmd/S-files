'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface BucketContextType {
  currentBucket: string | null;
  setBucket: (bucket: string) => void;
  clearBucket: () => void;
  isAuthenticated: boolean;
  setAuthenticated: (auth: boolean) => void;
}

const BucketContext = createContext<BucketContextType | undefined>(undefined);

export function BucketProvider({ children }: { children: ReactNode }) {
  const [currentBucket, setCurrentBucket] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setBucket = (bucket: string) => {
    setCurrentBucket(bucket);
    setIsAuthenticated(true);
  };

  const clearBucket = () => {
    setCurrentBucket(null);
    setIsAuthenticated(false);
  };

  const setAuthenticated = (auth: boolean) => {
    setIsAuthenticated(auth);
  };

  return (
    <BucketContext.Provider value={{
      currentBucket,
      setBucket,
      clearBucket,
      isAuthenticated,
      setAuthenticated
    }}>
      {children}
    </BucketContext.Provider>
  );
}

export function useBucket() {
  const context = useContext(BucketContext);
  if (context === undefined) {
    throw new Error('useBucket must be used within a BucketProvider');
  }
  return context;
}
