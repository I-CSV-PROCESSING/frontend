import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-700">
        {children}
        <footer className='flex justify-end text-gray-200 font-thin italic pr-4'>
          Created by Adeline Tan
        </footer>
      </body>
    </html>
  );
}
