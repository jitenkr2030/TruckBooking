import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TruckBooking - Reliable Truck Booking Platform",
  description: "Book trucks for your transportation needs. Real-time tracking, multiple payment options, and professional drivers.",
  keywords: ["truck booking", "logistics", "transportation", "freight", "shipping"],
  authors: [{ name: "TruckBooking Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "TruckBooking - Reliable Truck Booking Platform",
    description: "Book trucks for your transportation needs with real-time tracking",
    url: "https://truckbooking.com",
    siteName: "TruckBooking",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TruckBooking - Reliable Truck Booking Platform",
    description: "Book trucks for your transportation needs with real-time tracking",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
