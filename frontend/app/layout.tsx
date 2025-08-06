import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Import the Inter font
import "@/app/globals.css"; // Import your global CSS (Tailwind CSS)

// Initialize the Inter font with a subset
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// Define metadata for your application. This will be used by Next.js for SEO.
export const metadata: Metadata = {
  title: "File Uploads with Next.js, Prisma, and PostgreSQL",
  description: "A comprehensive example of file uploads using Next.js App Router, Prisma, PostgreSQL, and MinIO S3.",
  icons: [{ rel: "icon", url: "/favicon.ico" }], // Link to your favicon
};

// RootLayout component that wraps all pages in your application
export default function RootLayout({
  children, // The children prop represents the content of the nested pages/routes
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Apply the Inter font to the body, using Tailwind's font-sans variable */}
      <body className={`font-sans ${inter.variable}`}>
        {children} {/* Render the content of the current page */}
      </body>
    </html>
  );
}
