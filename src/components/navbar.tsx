import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-blue-700 hover:text-blue-900">
              Bunnell&apos;s Books
            </Link>
            <div className="hidden md:flex gap-6">
              <Link href="/search" className="text-gray-700 hover:text-blue-700 transition-colors">
                Search & Import
              </Link>
              <Link href="/collection" className="text-gray-700 hover:text-blue-700 transition-colors">
                Library
              </Link>
            </div>
          </div>
          <div className="md:hidden">
            {/* Mobile nav toggle could go here in the future */}
          </div>
        </div>
        <div className="md:hidden flex flex-col gap-2 mt-2 pb-2">
          <Link href="/search" className="text-gray-700 hover:text-blue-700 transition-colors">
            Search & Import
          </Link>
          <Link href="/collection" className="text-gray-700 hover:text-blue-700 transition-colors">
            Library
          </Link>
        </div>
      </div>
    </nav>
  );
}
