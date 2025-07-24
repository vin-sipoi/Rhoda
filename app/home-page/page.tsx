import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
//import LightRays from '../../components/LightRays';
//import Aurora from '../../components/Aurora';
import { FaInstagram } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaWhatsapp } from "react-icons/fa";
const LandingPage = () => {
  return (
    <div className="h-screen text-white flex flex-col relative overflow-hidden">
      {/* Gradient Background Overlay */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 800px 600px at 50% 50%, #61b693 0%, transparent 70%),
            radial-gradient(ellipse 700px 500px at 15% 85%, #2c304c 0%, #2c304c 30%, transparent 60%),
            radial-gradient(ellipse 600px 500px at 85% 15%, #1f2020 0%, #1f2020 40%, transparent 70%),
            radial-gradient(ellipse 600px 500px at 85% 85%, #1e1e1e 0%, #1e1e1e 40%, transparent 70%),
            radial-gradient(ellipse 500px 400px at 10% 10%, #1e1e1e 0%, transparent 60%),
            linear-gradient(135deg, #1e1e1e 0%, #2c304c 25%, #3c6351 50%, #61b693 75%, #1f2020 100%),
            #1e1e1e
          `,
        }}
      />
      {/*
      
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <LightRays
          raysOrigin="top-center"
          raysColor="#00ffff"
          raysSpeed={1.5}
          lightSpread={1.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays w-full h-full"
        />
      </div>
      */}
      
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 relative z-10 flex-shrink-0">
        <span className="font-bold text-2xl">Rhoda</span>
          <Link href="/auth/sign-in">
            <button className="cursor-pointer border border-gray-200 hover:bg-gray-600 hover:text-white rounded-lg py-2 px-6 text-base font-medium transform transition hover:-translate-y-1 delay-150 duration-300 ease-in-out">
              Sign In
            </button>
          </Link>

      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col md:flex-row items-center justify-center px-6 md:px-16 gap-4 relative z-10 min-h-0">
        {/* Left Section */}
        <div className="flex-1 max-w-xl">
          <h1 className="text-3xl md:text-7xl font-extrabold mb-2">
            Welcome to <span className="text-[#F3C80F] underline decoration-4 decoration-orange-500">Rhoda</span>
          </h1>
          <p className="text-gray-200 mt-4 mb-6 text-base md:text-lg">
          Simplify content creation, management, and <br /> performance tracking  through WhatsApp and <br /> web interfaces.
          </p>
          <Link href="">
            <button className="bg-orange-500 hover:bg-orange-600 text-[#FFFFFF] font-bold px-4 py-2 rounded-lg transition mb-4 text-base md:text-base cursor-pointer">
              Share your first content
            </button>
          </Link>
          
        </div>
        {/* Center Illustration */}
        <div className="flex-1 flex flex-col items-center relative max-w-md">
          {/* WhatsApp Illustration (placeholder) */}
          <div className="relative flex items-center justify-center w-[400px] h-[400px] md:w-[600px] md:h-[600px]">
            <Image src="/landing.svg" alt="WhatsApp" width={512} height={512} className="object-contain w-full h-full" />         
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex flex-col md:flex-row items-center justify-between px-6 py-3 text-[#FFFFFF] font-normal text-base gap-2 relative z-10 flex-shrink-0"> 
        <div className="space-x-4">
          <Link href="#">Discover</Link>
          <span>|</span>
          <Link href="#">Pricing</Link>
          <span>|</span>
          <Link href="#">Privacy</Link>
          <span>|</span>
          <Link href="#">Terms</Link>
        </div>
        <div className="flex space-x-4 text-xl">
          {/* Social icons as placeholders */}
          <FaWhatsapp />
          <FaXTwitter />
          <FaInstagram />
          <FaTiktok />
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;