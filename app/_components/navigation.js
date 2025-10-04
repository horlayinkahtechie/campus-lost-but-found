"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";

export default function Navigation() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 p-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="https://play-lh.googleusercontent.com/lsHggnbbuV4x90jgtRbQkak8GxWbV6YtP9-Ma4WtpHYHQPzxsxUDskUjwAYlA2IDJA=w600-h300-pc0xffffff-pd"
              width={100}
              height={100}
              alt="Campus Lost & Found Logo"
              className="rounded-md"
            />
            <span className="text-xl font-bold text-gray-900">
              <span className="text-indigo-600">Lost & Found</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/report-lost-item"
              className="text-gray-700 hover:text-indigo-600 transition-colors duration-200"
            >
              Report Lost
            </Link>
            <Link
              href="/report-found-item"
              className="text-gray-700 hover:text-indigo-600 transition-colors duration-200"
            >
              Report Found
            </Link>
            <Link
              href="/search"
              className="text-gray-700 hover:text-indigo-600 transition-colors duration-200"
            >
              Found Items
            </Link>

            {status === "loading" ? (
              <span className="text-gray-500">Loading...</span>
            ) : session ? (
              <Link
                href="/api/auth/signout"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-md"
              >
                Log out
              </Link>
            ) : (
              <Link
                href="/user/signin"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-md"
              >
                Log in
              </Link>
            )}
          </div>

          {/* Right Side (Mobile Login + Toggle) */}
          <div className="flex items-center space-x-3 md:hidden">
            {status === "loading" ? (
              <span className="text-gray-500 text-sm">Loading...</span>
            ) : session ? (
              <Link
                href="/api/auth/signout"
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-indigo-700 transition-colors duration-200 shadow-md"
              >
                Log out
              </Link>
            ) : (
              <Link
                href="/user/signin"
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-indigo-700 transition-colors duration-200 shadow-md"
              >
                Log in
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-700 focus:outline-none"
            >
              <i className="fas fa-bars text-2xl"></i>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden flex flex-col space-y-3 mt-3 border-t border-gray-200 pt-3">
            <Link
              href="/report-lost-item"
              className="text-gray-700 hover:text-indigo-600 transition-colors duration-200"
              onClick={() => setMenuOpen(false)}
            >
              Report Lost
            </Link>
            <Link
              href="/report-found-item"
              className="text-gray-700 hover:text-indigo-600 transition-colors duration-200"
              onClick={() => setMenuOpen(false)}
            >
              Report Found
            </Link>
            <Link
              href="/search"
              className="text-gray-700 hover:text-indigo-600 transition-colors duration-200"
              onClick={() => setMenuOpen(false)}
            >
              Found Items
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
