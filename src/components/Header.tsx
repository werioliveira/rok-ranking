"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Home, Sword, Menu, X, BookText } from "lucide-react";
import { LoginButton } from "./LoginButton";

export default function Header() {
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isKvkOpen, setIsKvkOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const toolsRef = useRef<HTMLDivElement>(null);
  const kvkRef = useRef<HTMLDivElement>(null);

  // 🔒 Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isToolsOpen &&
        toolsRef.current &&
        !toolsRef.current.contains(e.target as Node)
      ) {
        setIsToolsOpen(false);
      }

      if (
        isKvkOpen &&
        kvkRef.current &&
        !kvkRef.current.contains(e.target as Node)
      ) {
        setIsKvkOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isToolsOpen, isKvkOpen]);

  return (
    <header className="w-full bg-card border-b border-muted py-3">
      <div className="max-w-screen-lg mx-auto px-4 flex items-center justify-between">
        {/* LOGO */}
        <Link
          href="/"
          className="text-xl font-bold text-primary hover:text-primary-glow transition-colors"
        >
          ROK Manager
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center text-card-foreground hover:text-primary transition-colors"
          >
            <Home className="w-4 h-4 mr-1" />
            Home
          </Link>

          {/* KVK DROPDOWN */}
          <div ref={kvkRef} className="relative">
            <button
              onClick={() => setIsKvkOpen((v) => !v)}
              className="flex items-center text-card-foreground hover:text-primary transition-colors"
            >
              <Sword className="w-4 h-4 mr-1" />
              KVK
              <ChevronDown className="ml-1 h-4 w-4" />
            </button>

            {isKvkOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-popover border border-muted rounded-md shadow-lg z-[1000] overflow-hidden">
                {["KVK 1", "KVK 2", "KVK 3"].map((kvkLabel, i) => {
                  const kvkNumber = i + 1;
                  // Se for KVK 3, o link vai para a raiz "/", caso contrário "/kvkX"
                  const destination = kvkNumber === 3 ? "/" : `/kvk${kvkNumber}`;
                  
                  return (
                    <Link
                      key={i}
                      href={destination}
                      className="block px-4 py-2 text-sm hover:bg-muted hover:text-primary transition-colors"
                      onClick={() => setIsKvkOpen(false)}
                    >
                      {kvkLabel}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* TOOLS DROPDOWN */}
          <div ref={toolsRef} className="relative">
            <button
              onClick={() => setIsToolsOpen((v) => !v)}
              className="flex items-center text-card-foreground hover:text-primary transition-colors"
            >
              <BookText className="w-4 h-4 mr-1" />
              Tools
              <ChevronDown className="ml-1 h-4 w-4" />
            </button>

            {isToolsOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-popover border border-muted rounded-md shadow-lg z-[1000] overflow-hidden">
                <Link
                  href="/tools/message"
                  className="block px-4 py-2 text-sm hover:bg-muted hover:text-primary transition-colors"
                  onClick={() => setIsToolsOpen(false)}
                >
                  📧 Email Builder
                </Link>

                <Link
                  href="/tools/compare"
                  className="block px-4 py-2 text-sm hover:bg-muted hover:text-primary transition-colors"
                  onClick={() => setIsToolsOpen(false)}
                >
                  📊 Kingdom Comparison
                </Link>

                <Link
                  href="/tools/training"
                  className="block px-4 py-2 text-sm hover:bg-muted hover:text-primary transition-colors"
                  onClick={() => setIsToolsOpen(false)}
                >
                  ⚔️ Training Calculator
                </Link>

                <div className="h-px bg-muted my-1" />

                <Link
                  href="/tools/mge"
                  className="block px-4 py-2 text-sm hover:bg-muted hover:text-primary transition-colors"
                  onClick={() => setIsToolsOpen(false)}
                >
                  🛡️ MGE Request
                </Link>
                <Link
                  href="/mge/list"
                  className="block px-4 py-2 text-sm hover:bg-muted hover:text-primary transition-colors"
                  onClick={() => setIsToolsOpen(false)}
                >
                  📜 MGE Standings
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* USER ACTION */}
        <div className="hidden md:flex items-center justify-end w-[44px]">
          <LoginButton />
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenu(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenu && (
        <div className="fixed inset-0 bg-black/50 z-[2000] md:hidden">
          <div className="absolute top-0 right-0 w-[75%] h-full bg-card border-l border-muted p-6 shadow-xl">
            <button
              className="absolute top-4 right-4"
              onClick={() => setMobileMenu(false)}
            >
              <X className="w-6 h-6" />
            </button>

            <nav className="mt-12 flex flex-col gap-6 text-lg font-medium">
              <Link href="/" onClick={() => setMobileMenu(false)} className="flex items-center gap-2">
                <Home className="w-5 h-5" /> Home
              </Link>
              
              <Link href="/kvk1" onClick={() => setMobileMenu(false)} className="flex items-center gap-2">
                <Sword className="w-5 h-5" /> KVK 1
              </Link>
              
              <Link href="/kvk2" onClick={() => setMobileMenu(false)} className="flex items-center gap-2">
                <Sword className="w-5 h-5" /> KVK 2
              </Link>

              {/* Mobile link para KVK 3 apontando para / */}
              <Link href="/" onClick={() => setMobileMenu(false)} className="flex items-center gap-2">
                <Sword className="w-5 h-5" /> KVK 3 (Current)
              </Link>

              <div className="pt-6 border-t border-muted">
                <LoginButton />
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}