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
    <nav className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="h-full w-full bg-zinc-950 rounded-[11px] flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-white">S-Files</span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Cloud
              </span>
            </div>
          </div>

          {/* Center: Bucket Info Pill */}
          <div className="flex items-center">
            <BucketInfo />
          </div>

          {/* User Profile & Sign Out Section */}
          <div className="flex items-center space-x-3">
            {/* User Pill */}
            <div className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-zinc-900/80 border border-white/[0.08]">
              {user.image ? (
                <Image
                  src={user.image}
                  alt="Profile"
                  width={28}
                  height={28}
                  className="rounded-full ring-1 ring-white/20"
                />
              ) : (
                <div className="w-7 h-7 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div className="hidden md:block text-left">
                <div className="text-xs font-medium text-zinc-200 leading-tight">
                  {user.name || 'User'}
                </div>
                <div className="text-[10px] text-zinc-500 leading-tight truncate max-w-[120px]">
                  {user.email || ''}
                </div>
              </div>
            </div>

            {/* Sign Out Button */}
            <form action={handleSignOut}>
              <button
                type="submit"
                className="inline-flex items-center justify-center p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-zinc-400 hover:text-red-400 bg-zinc-900/60 hover:bg-red-500/10 border border-white/[0.08] hover:border-red-500/20 rounded-full transition-all duration-150"
                title="Sign Out"
              >
                <svg className="w-4 h-4 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
