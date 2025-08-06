
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Import the Inter font
import "@/app/globals.css"; // Import your global CSS (Tailwind CSS)
import AuthProvider from "@/contexts/session-provider";

// Initialize the Inter font with a subset
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`font-sans ${inter.variable}`}>
        <AuthProvider>
          {children} {/* Render the content of the current page */}
        </AuthProvider>
      </body>
    </html>
  );
}
