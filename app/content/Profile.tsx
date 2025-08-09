import { auth} from "@/auth";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const session = await auth(); // Await the session
  
  // Debug logging (remove in production)
  console.log("Session in generateMetadata:", session);
  console.log("User name:", session.user.name);
  
  const userName = session.user.name;
  
  return {
    title: `File Uploads with Next.js, Prisma, and PostgreSQL - ${userName}`,
    description: "A comprehensive example of file uploads using Next.js App Router, Prisma, PostgreSQL, and MinIO S3.",
    icons: [{ rel: "icon", url: "/favicon.ico" }], // Link to your favicon
  };
}