import { auth } from "@/auth";
import Image from "next/image";
import Link from "next/link";
import { handleSignOut } from "../actions/auth";
import BucketInfo from "./BucketInfo";

export default async function Navbar() {
  const session = await auth();
  const user = session?.user;

  if (!user) return null;

  return (
    <nav className="bg-white/95 shadow-sm border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm dark:bg-neutral-900 dark:border-neutral-800 dark:shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center dark:from-blue-900 dark:to-indigo-900">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">S-Files</span>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="flex items-center space-x-4">
            {/* Bucket Info */}
            <BucketInfo />
            
            {/* Profile Info */}
            <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 dark:bg-neutral-800 dark:border-neutral-700">
              {user.image ? (
                <Image
                  src={user.image}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full ring-2 ring-blue-100 dark:ring-blue-900"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center dark:from-blue-900 dark:to-indigo-900">
                  <span className="text-white text-sm font-semibold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.name || 'User'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user.email || 'No email'}
                </div>
              </div>
            </div>
            {/* Sign Out Button */}
            <form action={handleSignOut}>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all duration-200 dark:bg-neutral-900 dark:text-red-400 dark:border-red-700 dark:hover:bg-neutral-800 dark:hover:border-red-600"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}
