'use server'

import { signIn, signOut } from '@/auth'
import { redirect } from 'next/navigation'

export async function handleSignInGoogle() {
  await signIn("google", { redirectTo: "/" })
}

export async function handleSignOut() {
  await signOut({ redirectTo: "/login" })
}

export async function handleSignInGithub() {
  await signIn("github", { redirectTo: "/" })
}
