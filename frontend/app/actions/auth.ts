'use server'

import { signIn, signOut } from '@/auth'
import { redirect } from 'next/navigation'

export async function handleSignIn() {
  await signIn("google", { redirectTo: "/" })
}

export async function handleSignOut() {
  await signOut({ redirectTo: "/login" })
}