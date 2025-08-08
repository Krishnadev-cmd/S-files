// app/page.tsx
// This is a Server Component, so no "use client" directive here.

import { redirect } from "next/navigation";
import { auth } from "@/auth"; // Correctly using the server-side auth function

// Import the client-side component we're about to create
import ClientContent from "@/app/content/ClientContet";
import { type FileProps } from "@/app/utils/types";

// This is an async function because auth() is async
export default async function Page() {
  const session = await auth(); // Await the session from the server
  
  if (!session) {
    // This server-side redirect is a better practice
    redirect("/auth/login");
  }
  
  // You can even fetch initial data on the server here
  // For demonstration, let's assume we have a function to do that
  // const initialFiles = await fetchFilesFromServer();
  
  console.log("Server Component - Session:", session);

  // Render the client component and pass the session (and other data) as props
  return (
    <ClientContent 
      // This is a great place to pass server-side fetched data
      // initialFiles={initialFiles}
    />
  );
}