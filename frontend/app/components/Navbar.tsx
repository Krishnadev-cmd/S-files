import { auth } from "@/auth";
import Image from "next/image";
import Link from "next/link";
import { handleSignOut } from "../actions/auth";

export default async function Navbar() {
  const session = await auth();
  const user = session?.user;

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="text-xl font-semibold text-gray-800">S-Files</div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {user.image ? (
              <Image
                src={user.image}
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <span className="text-gray-700 font-medium">
              {user.name || 'User'}
            </span>
          </div>

          <form action={handleSignOut} method="POST">
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
