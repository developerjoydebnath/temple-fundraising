import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { SWRProvider } from '@/components/SWRProvider';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "মির্জাকালু সনাতন যুব ফাউন্ডেশন",
  description: "মির্জাকালু সনাতন যুব ফাউন্ডেশন এর অফিসিয়াল ওয়েবসাইট। এখানে আমাদের কার্যক্রম, প্রকল্প এবং সংবাদ সম্পর্কে তথ্য পাবেন। আমাদের সাথে যোগাযোগ করতে পারেন এবং আমাদের সম্প্রদায়ের উন্নয়নে অংশ নিতে পারেন।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SWRProvider>
          {children}
          <Toaster position="top-center" richColors />
        </SWRProvider>
      </body>
    </html>
  );
}
