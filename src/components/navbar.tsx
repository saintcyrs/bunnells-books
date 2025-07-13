"use client";

import Link from "next/link";

import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <nav className="bg-[#101C42] text-white shadow sticky top-0 z-50">
      <div className="max-w-5xl px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-eb-garamond text-white hover:text-blue-200 whitespace-nowrap">
            Bunnell&apos;s Books
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href="/search" className="text-white hover:text-blue-200 transition-colors">
              Search & Import
            </Link>
            <Link href="/collection" className="text-white hover:text-blue-200 transition-colors">
              Library
            </Link>
          </div>
          <button
            className="md:hidden p-2 text-white hover:text-blue-200 focus:outline-none"
            aria-label="Open main menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          {/* Mobile menu */}
          {mobileOpen && (
            <div className="md:hidden flex flex-col gap-2 mt-2 pb-2 animate-fade-in">
              <Link href="/search" className="text-gray-700 hover:text-blue-700 transition-colors py-2" onClick={() => setMobileOpen(false)}>
                Search & Import
              </Link>
              <Link href="/collection" className="text-gray-700 hover:text-blue-700 transition-colors py-2" onClick={() => setMobileOpen(false)}>
                My Library
              </Link>
            </div>
          )}
        </div>
      </nav>
    );
}
