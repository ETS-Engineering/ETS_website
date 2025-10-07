"use client";
import "./globals.css";

import { AuthProvider } from "@/components/context/AuthProvider";
import Header from "@/components/Header"

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-dvh w-full">
			<head>
				<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
			</head>
      <body className="relative bg-raisin h-full w-full">
				<Header />	
				<AuthProvider>{children}</AuthProvider>
			</body>
    </html>
  );
}
