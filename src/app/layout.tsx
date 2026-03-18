import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "NIT KKR Classrooms - Scheduling System",
  description: "Classroom scheduling and management system for NIT Kurukshetra",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(inter.variable, "font-sans antialiased")}
      >
        {children}
      </body>
    </html>
  );
}
