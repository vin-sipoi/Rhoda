import type { Metadata } from "next";
import { Roboto,Inter } from "next/font/google";
import "./globals.css";

const InterSans = Inter({
  variable:"--font-inter",
  subsets:["latin"],
})

export const metadata: Metadata = {
  title: "Rhoda App",
  description: "Best PWA out there",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${InterSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
