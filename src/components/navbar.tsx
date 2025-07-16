"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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
    <>
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
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setMobileOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Dialog as="div" className="md:hidden" open={mobileOpen} onClose={setMobileOpen}>
        <div className="fixed inset-0 z-50" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5" onClick={() => setMobileOpen(false)}>
              <span className="font-serif text-2xl font-semibold text-primary-700">Bunnell&apos;s Books</span>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                <Link
                  href="/search"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Search & Import
                </Link>
                <Link
                  href="/collection"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  My Library
                </Link>
              </div>
              <div className="py-6">
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(searchQuery);
                        setMobileOpen(false);
                      }
                    }}
                    className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                    placeholder="Search library..."
                  />
                </div>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </nav>
  </>
  );
}
