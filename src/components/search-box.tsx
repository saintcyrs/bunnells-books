"use client";
import { useState } from "react";

export default function SearchBox() {
  const [search, setSearch] = useState("");
  return (
    <input
      type="text"
      value={search}
      onChange={e => setSearch(e.target.value)}
      placeholder="Search books..."
      className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}
