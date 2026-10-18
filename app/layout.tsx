import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import AuthProvider from "@/contexts/session-provider";
import { BucketProvider } from "@/contexts/bucket-context";
import Navbar from "@/app/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// ✅ Proper way to inject head metadata
export const metadata: Metadata = {
  title: "S-Files — Cloud Storage & AI Intelligence",
  description: "Secure, high-speed S3 & Cloudflare R2 file storage with Gemini AI document intelligence.",
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
          <BucketProvider>
            <Navbar />
            {children}
          </BucketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
