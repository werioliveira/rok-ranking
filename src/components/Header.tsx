"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Home, Sword, Menu, X, BookText, Calculator, BarChart3, Mail, Trophy, ShieldAlert, Calendar } from "lucide-react";
import { LoginButton } from "./LoginButton";

export default function Header() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isKvkOpen, setIsKvkOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const toolsRef = useRef<HTMLDivElement>(null);
  const kvkRef = useRef<HTMLDivElement>(null);

  // Fechar dropdowns ao clicar fora (Desktop)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (isToolsOpen && toolsRef.current && !toolsRef.current.contains(e.target as Node)) setIsToolsOpen(false);
      if (isKvkOpen && kvkRef.current && !kvkRef.current.contains(e.target as Node)) setIsKvkOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isToolsOpen, isKvkOpen]);

  return (
    <header className="w-full bg-card border-b border-muted py-3 sticky top-0 z-[50]">
      <div className="max-w-screen-lg mx-auto px-4 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="text-xl font-bold text-primary hover:text-primary-glow transition-colors">
          ROK Manager
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="flex items-center text-card-foreground hover:text-primary transition-colors text-sm font-medium">
            <Home className="w-4 h-4 mr-1" /> Home
          </Link>

          {/* KVK DROPDOWN */}
          <div ref={kvkRef} className="relative">
            <button onClick={() => setIsKvkOpen(!isKvkOpen)} className="flex items-center text-card-foreground hover:text-primary transition-colors text-sm font-medium">
              <Sword className="w-4 h-4 mr-1" /> KVK <ChevronDown className="ml-1 h-3 w-3" />
            </button>
            {isKvkOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-popover border border-muted rounded-md shadow-lg z-[100] overflow-hidden">
                {["KVK 1", "KVK 2", "KVK 3"].map((kvk, i) => (
                  <Link key={i} href={i === 2 ? "/" : `/kvk${i + 1}`} className="block px-4 py-2 text-sm hover:bg-muted" onClick={() => setIsKvkOpen(false)}>
                    {kvk} {i === 2 && "(Current)"}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* TOOLS DROPDOWN */}
          <div ref={toolsRef} className="relative">
            <button onClick={() => setIsToolsOpen(!isToolsOpen)} className="flex items-center text-card-foreground hover:text-primary transition-colors text-sm font-medium">
              <BookText className="w-4 h-4 mr-1" /> Tools <ChevronDown className="ml-1 h-3 w-3" />
            </button>
            {isToolsOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-popover border border-muted rounded-md shadow-lg z-[100] overflow-hidden">
                <Link href="/tools/message" className="flex items-center px-4 py-2 text-sm hover:bg-muted" onClick={() => setIsToolsOpen(false)}>
                  <Mail className="w-4 h-4 mr-2 text-blue-400" /> Email Builder
                </Link>
                <Link href="/tools/compare" className="flex items-center px-4 py-2 text-sm hover:bg-muted" onClick={() => setIsToolsOpen(false)}>
                  <BarChart3 className="w-4 h-4 mr-2 text-green-400" /> Kingdom Compare
                </Link>
                <Link href="/tools/training" className="flex items-center px-4 py-2 text-sm hover:bg-muted" onClick={() => setIsToolsOpen(false)}>
                  <Calculator className="w-4 h-4 mr-2 text-amber-400" /> Training Calc
                </Link>
                <Link href="/calendar" className="flex items-center px-4 py-2 text-sm hover:bg-muted" onClick={() => setIsToolsOpen(false)}>
                  <Calendar className="w-4 h-4 mr-2 text-amber-400" /> Calendar
                </Link>
                <div className="h-px bg-muted my-1" />
                <Link href="/tools/mge" className="flex items-center px-4 py-2 text-sm hover:bg-muted" onClick={() => setIsToolsOpen(false)}>
                  <ShieldAlert className="w-4 h-4 mr-2 text-red-400" /> MGE Request
                </Link>
                <Link href="/mge/list" className="flex items-center px-4 py-2 text-sm hover:bg-muted" onClick={() => setIsToolsOpen(false)}>
                  <Trophy className="w-4 h-4 mr-2 text-yellow-400" /> MGE Standings
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* MOBILE ACTIONS + HAMBURGER */}
        <div className="flex items-center gap-3">
          {/* O Profile Button agora fica visível no Mobile também, ao lado do menu */}
          <div className="md:block">
            <LoginButton />
          </div>
          
          <button className="md:hidden p-2 text-card-foreground" onClick={() => setMobileMenu(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenu && (
        <div className="fixed inset-0 bg-black/60 z-[2000] md:hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-[80%] h-full bg-card border-l border-muted shadow-2xl flex flex-col">
            <div className="p-4 border-b border-muted flex justify-between items-center">
              <span className="font-bold text-primary">Navigation</span>
              <button onClick={() => setMobileMenu(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Seção Geral */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Main</p>
                <Link href="/" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 text-lg font-medium">
                  <Home className="w-5 h-5 text-primary" /> Home
                </Link>
              </div>

              {/* Seção KVK */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Kingdom vs Kingdom</p>
                <Link href="/kvk1" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 text-lg font-medium">
                  <Sword className="w-5 h-5 text-amber-500" /> KVK 1
                </Link>
                <Link href="/kvk2" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 text-lg font-medium">
                  <Sword className="w-5 h-5 text-amber-500" /> KVK 2
                </Link>
                <Link href="/" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 text-lg font-medium">
                  <Sword className="w-5 h-5 text-primary" /> KVK 3 <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Live</span>
                </Link>
              </div>

              {/* Seção Tools (Adicionada para Mobile) */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Commander Tools</p>
                <Link href="/tools/message" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 text-lg font-medium">
                  <Mail className="w-5 h-5 text-blue-400" /> Email Builder
                </Link>
                <Link href="/tools/compare" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 text-lg font-medium">
                  <BarChart3 className="w-5 h-5 text-green-400" /> Compare
                </Link>
                <Link href="/tools/training" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 text-lg font-medium">
                  <Calculator className="w-5 h-5 text-amber-400" /> Training Calc
                </Link>
                <Link href="/calendar" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 text-lg font-medium">
                  <Calendar className="w-5 h-5 text-amber-400" /> Calendar
                </Link>
                <Link href="/tools/mge" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 text-lg font-medium">
                  <ShieldAlert className="w-5 h-5 text-red-400" /> MGE Request
                </Link>
                <Link href="/mge/list" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 text-lg font-medium">
                  <Trophy className="w-5 h-5 text-yellow-400" /> Standings
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}