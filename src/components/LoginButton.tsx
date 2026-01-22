"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { LogOut, LayoutDashboard, ClipboardList, ShieldCheck } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

export function LoginButton() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") return <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />;

  if (!session) {
    return (
      <button
        onClick={() => signIn()}
        className="text-sm px-4 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-500 transition font-bold"
      >
        Login
      </button>
    );
  }

  const name = session.user.name ?? "";
  const isAdmin = session.user?.role === "ADMIN";
  const initials = name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-amber-500",
          "flex items-center justify-center font-bold text-sm",
          "hover:ring-2 hover:ring-amber-500/40 transition-all shadow-lg"
        )}
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-64 bg-[#0d0d0d] border border-slate-800 rounded-xl shadow-2xl z-[1000] overflow-hidden">
          {/* Dropdown Header */}
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/20">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Commander</p>
            <p className="text-sm font-medium text-white truncate">{name}</p>
          </div>

          <div className="p-2 space-y-1">
            {/* Common Links */}
            <Link
              href="/tools/mge/my-requests"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-md transition-colors"
            >
              <ClipboardList className="w-4 h-4 text-amber-500" />
              My MGE Requests
            </Link>

            {/* 🛡️ Administrative Area */}
            {isAdmin && (
              <>
                <div className="h-px bg-slate-800 my-1 mx-2" />
                <p className="px-3 py-1 text-[10px] font-black text-amber-600 uppercase tracking-tighter">Administration</p>
                
                <Link
                  href="/admin/mge"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-amber-500/10 hover:text-amber-500 rounded-md transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Manage MGE
                </Link>
                
                <Link
                  href="/admin/mge/ranking"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-amber-500/10 hover:text-amber-500 rounded-md transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Organize Ranking
                </Link>
              </>
            )}

            <div className="h-px bg-slate-800 my-1 mx-2" />

            {/* Logout */}
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}