"use client";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          <div className="text-center text-gray-500 text-sm mb-2">
            Happy 60th Birthday, Dad! Love, Mack ❤️
          </div>
          <div className="text-gray-400 text-xs">
            © {new Date().getFullYear()} Soleil Saint-Cyr
          </div>
        </div>
      </div>
    </footer>
  );
}
