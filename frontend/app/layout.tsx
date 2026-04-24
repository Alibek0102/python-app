import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { UserProvider } from "@/lib/userContext";

export const metadata: Metadata = {
  title: "Merch Store",
  description: "Corporate merchandise store with coin rewards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <UserProvider>
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
