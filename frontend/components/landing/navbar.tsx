"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
        scrolled || mobileOpen ? "bg-surface/95 backdrop-blur border-b border-border" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="font-display text-xl font-bold text-text-primary">
          Pragmara
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Pricing
          </a>
          <Link href="/api-docs" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            API Docs
          </Link>
          <a href="#demo" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Demo
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors hidden sm:block">
            Sign in
          </Link>
          <Button render={<Link href="/auth/login" />} size="sm" className="hidden sm:inline-flex">
            Get started
          </Button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:text-text-primary md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border bg-surface/95 backdrop-blur px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <a href="#features" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-text-secondary hover:text-text-primary">
              Features
            </a>
            <a href="#pricing" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-text-secondary hover:text-text-primary">
              Pricing
            </a>
            <Link href="/api-docs" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-text-secondary hover:text-text-primary">
              API Docs
            </Link>
            <a href="#demo" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-text-secondary hover:text-text-primary">
              Demo
            </a>
            <div className="mt-2 border-t border-border pt-3">
              <Button render={<Link href="/auth/login" />} className="w-full">
                Get started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
