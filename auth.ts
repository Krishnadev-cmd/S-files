
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import {prisma as PrismaClient} from "@/app/server/db"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(PrismaClient),
  providers: [Google],
  session: {
    strategy: "jwt" // Use JWT instead of database sessions for edge compatibility
  },
  callbacks: {
    async session({ session, token }) {
      return session;
    },
    async jwt({ token, user }) {
      return token;
    },
  },
})