import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import AuthProvider from "@/contexts/session-provider";
import Navbar from "@/app/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// ✅ Proper way to inject head metadata
export const metadata: Metadata = {
  title: "Your App Title",
  description: "App description here",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
