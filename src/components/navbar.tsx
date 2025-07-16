"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import SearchBox from "./search-box";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  // Handle search submission
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (pathname === '/collection') {
      // If we're already on the collection page, we'll let the page component handle the search
      // This is just for navigation purposes
      return;
    }
    // Otherwise navigate to collection with search query
    router.push(`/collection?q=${encodeURIComponent(query)}`);
  };

  // Clear search when navigating away from collection page
  useEffect(() => {
    if (pathname !== '/collection') {
      setSearchQuery("");
    }
  }, [pathname]);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center space-x-8">
            <Link href="/" className="font-serif text-4xl font-semibold text-primary-700 hover:text-primary-800 transition-colors whitespace-nowrap">
              Bunnell&apos;s Books
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/search" className="inline-flex items-center text-md font-medium text-gray-700 hover:text-primary-600 border-b-2 border-transparent hover:border-primary-500">
                Search & Import
              </Link>
              <Link href="/collection" className="inline-flex items-center text-md font-medium text-gray-700 hover:text-primary-600 border-b-2 border-transparent hover:border-primary-500">
                My Library
              </Link>
            </div>
          </div>
          
          <div className="hidden md:block ml-4">
            <SearchBox 
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search library..."
              className="w-64"
            />
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-expanded={mobileOpen}
            >
              <span className="sr-only">Open main menu</span>
              {mobileOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link 
              href="/search" 
              onClick={() => setMobileOpen(false)}
              className="block pl-3 pr-4 py-2 border-l-4 border-primary-500 text-base font-medium text-primary-700 bg-primary-50"
            >
              Search & Import
            </Link>
            <Link 
              href="/collection" 
              onClick={() => setMobileOpen(false)}
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
            >
              My Library
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-4">
              <SearchBox 
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search library..."
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
