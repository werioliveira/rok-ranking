'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, Home, Sword } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full bg-card border-b border-muted py-3">
      <div className="max-w-screen-lg mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-primary hover:text-primary-glow transition-colors">
          ROK Manager
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link 
            href="/" 
            className="flex items-center text-card-foreground hover:text-primary transition-colors"
          >
            <Home className="w-4 h-4 mr-1" />
            Home
          </Link>
          
          <div className="relative">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center text-card-foreground hover:text-primary transition-colors focus:outline-none"
            >
              <Sword className="w-4 h-4 mr-1" />
              KVK
              <ChevronDown className="ml-1 h-4 w-4" />
            </button>
            
            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg py-1 z-10 border border-muted z-[1000]">

                <Link 
                  href="/kvk1" 
                  className="block px-4 py-2 text-sm text-popover-foreground hover:bg-muted hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  KVK 1
                </Link>
                <Link 
                  href="/" 
                  className="block px-4 py-2 text-sm text-popover-foreground hover:bg-muted hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  KVK 2
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}