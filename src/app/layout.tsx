// layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme_provider";
import ConvexClientProvider from "@/providers/convex-client-provider";
import {Toaster} from "react-hot-toast";
import { ClerkProvider } from '@clerk/nextjs'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IChat",
  description: "A chat appplication to curse at your friends and cure your boredom",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
     <body className="flex flex-col min-h-screen antialiased">
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange><ConvexClientProvider>
          {children}
          <Toaster/>
        </ConvexClientProvider>
</ThemeProvider>
      </body>
    </html>
  );
}
