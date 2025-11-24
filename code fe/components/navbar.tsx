"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import type { User } from "@/lib/types";
import { getCurrentUser, setCurrentUser } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Menu, X, UserCircle, LogOut } from "lucide-react";

export function Navbar() {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCurrentUserState(getCurrentUser());
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserState(null);
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/60 supports-[backdrop-filter]:bg-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">

          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/30">
              <span className="text-primary-foreground font-bold">B</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline">Blog</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>

            {currentUser && (
              <>
                <Link href="/create" className="hover:text-primary transition-colors">Create</Link>
                <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>

                {currentUser.role === "admin" && (
                  <Link href="/admin" className="hover:text-primary transition-colors">
                    User Directory
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />

            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted transition"
                >
                  <UserCircle size={22} />
                  <span className="text-sm text-muted-foreground font-medium">
                    {currentUser.name || currentUser.displayName}
                  </span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-card shadow-lg border border-border rounded-xl overflow-hidden animate-in fade-in zoom-in-95">

                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition"
                    >
                      <UserCircle size={18} />
                      Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-100 transition"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth">
                <Button size="sm" className="px-5">Join Us</Button>
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-in fade-in slide-in-from-top-4">

            <Link href="/" className="block px-4 py-2 hover:bg-secondary rounded">Home</Link>

            {currentUser && (
              <>
                <Link href="/create" className="block px-4 py-2 hover:bg-secondary rounded">Create</Link>
                <Link href="/dashboard" className="block px-4 py-2 hover:bg-secondary rounded">Dashboard</Link>

                {currentUser.role === "admin" && (
                  <Link href="/admin" className="block px-4 py-2 hover:bg-secondary rounded">
                    User Directory
                  </Link>
                )}

                <Link href="/profile" className="block px-4 py-2 hover:bg-secondary rounded">
                  Profile
                </Link>
              </>
            )}

            <div className="px-4 pt-3 border-t border-border space-y-3">
              <ThemeToggle />

              {currentUser ? (
                <>
                  <p className="text-sm text-muted-foreground">{currentUser.name}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Link href="/auth">
                  <Button size="sm" className="w-full">Join Us</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
