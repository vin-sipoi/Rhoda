import type { Metadata } from "next";
import { Inter, Hahmlet, Space_Grotesk } from "next/font/google";
import "./globals.css";


const InterSans = Inter({
  variable:"--font-inter",
  subsets:["latin"],
})

const hahmlet = Hahmlet({
  variable:"--font-hahmlet",
  weight:["400","700"],
  subsets:["latin"]
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // Choose weights as needed
  variable: '--font-space-grotesk',
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
        className={`${InterSans.variable} ${hahmlet.variable} ${spaceGrotesk.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
