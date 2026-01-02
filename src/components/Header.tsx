"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Home, Sword, Menu, X, BookText } from "lucide-react";

export default function Header() {
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isKvkOpen, setIsKvkOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <header className="w-full bg-card border-b border-muted py-3">
      <div className="max-w-screen-lg mx-auto px-4 flex justify-between items-center">


        {/* LOGO */}
        <Link
          href="/"
          className="text-xl font-bold text-primary hover:text-primary-glow transition-colors"
        >
          ROK Manager
        </Link>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="flex items-center text-card-foreground hover:text-primary transition-colors"
          >
            <Home className="w-4 h-4 mr-1" />
            Home
          </Link>
<div className="relative">
  <button
    onClick={() => setIsKvkOpen((v) => !v)}
    className="flex items-center text-card-foreground hover:text-primary transition-colors"
  >
    <Sword className="w-4 h-4 mr-1" />
    KVK
    <ChevronDown className="ml-1 h-4 w-4" />
  </button>

  {isKvkOpen && (
    <div className="absolute right-0 mt-2 w-56 bg-popover rounded-md shadow-lg py-1 z-[1000] border border-muted">
      <Link
        href="/kvk1"
        className="block px-4 py-2 text-sm hover:bg-muted hover:text-primary transition-colors"
        onClick={() => setIsKvkOpen(false)}
      >
        KVK 1
      </Link>

      <Link
        href="/"
        className="block px-4 py-2 text-sm hover:bg-muted hover:text-primary transition-colors"
        onClick={() => setIsKvkOpen(false)}
      >
        KVK 2
      </Link>
    </div>
  )}
</div>
<div className="relative">
  <button
    onClick={() => setIsToolsOpen((v) => !v)}
    className="flex items-center text-card-foreground hover:text-primary transition-colors"
  >
    <BookText className="w-4 h-4 mr-1" />
    Tools
    <ChevronDown className="ml-1 h-4 w-4" />
  </button>

  {isToolsOpen && (
    <div className="absolute right-0 mt-2 w-56 bg-popover rounded-md shadow-lg py-1 z-[1000] border border-muted">
      <Link
        href="/message"
        className="block px-4 py-2 text-sm hover:bg-muted hover:text-primary transition-colors"
        onClick={() => setIsToolsOpen(false)}
      >
        📧 Email Builder
      </Link>

      <Link
        href="/compare"
        className="block px-4 py-2 text-sm hover:bg-muted hover:text-primary transition-colors"
        onClick={() => setIsToolsOpen(false)}
      >
        📊 Kingdom Comparison
      </Link>
    </div>
  )}
</div>
        </nav>

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden text-card-foreground"
          onClick={() => setMobileMenu(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileMenu && (
        <div className="fixed inset-0 bg-black/50 z-[2000] md:hidden">
          <div className="absolute top-0 right-0 w-[70%] h-full bg-card border-l border-muted p-6 shadow-xl">

            <button
              className="absolute top-4 right-4"
              onClick={() => setMobileMenu(false)}
            >
              <X className="w-6 h-6 text-card-foreground" />
            </button>

            <nav className="mt-10 space-y-6 text-lg">

              <Link
                href="/"
                className="flex items-center gap-2 text-card-foreground hover:text-primary"
                onClick={() => setMobileMenu(false)}
              >
                <Home className="w-5 h-5" />
                Home
              </Link>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Tools</p>
                <div className="ml-4 space-y-3">
                  <Link
                    href="/message"
                    className="block text-card-foreground hover:text-primary"
                    onClick={() => setMobileMenu(false)}
                  >
                    📧 Email Builder
                  </Link>

                  <Link
                    href="/compare"
                    className="block text-card-foreground hover:text-primary"
                    onClick={() => setMobileMenu(false)}
                  >
                    📊 Comparador de Reino
                  </Link>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">KVK</p>
                <div className="ml-4 space-y-3">
                  <Link
                    href="/kvk1"
                    className="block text-card-foreground hover:text-primary"
                    onClick={() => setMobileMenu(false)}
                  >
                    KVK 1
                  </Link>

                  <Link
                    href="/"
                    className="block text-card-foreground hover:text-primary"
                    onClick={() => setMobileMenu(false)}
                  >
                    KVK 2
                  </Link>
                </div>
              </div>

            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
