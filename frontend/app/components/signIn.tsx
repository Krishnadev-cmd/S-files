"use client";

import { signIn } from "next-auth/react";
import { GoogleIcon } from "@/app/components/icons";

export default function SignIn() {
  return (
    <button 
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <GoogleIcon className="h-5 w-5" />
      <span>Sign in with Google</span>
    </button>
  );
}
