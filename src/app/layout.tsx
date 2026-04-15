import "./globals.css";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "NIT KKR Classrooms",
  description: "Classroom Schedule Management – NIT Kurukshetra",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">{children}</body>
    </html>
  );
}
