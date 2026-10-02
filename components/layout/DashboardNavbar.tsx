"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap, LogOut, User as UserIcon, Wallet } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

export function DashboardNavbar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Ambil profil user yang sedang login secara AJAX
  useEffect(() => {
    async function loadUserProfile() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Gagal memuat profil pengguna:", err);
      }
    }

    loadUserProfile();
  }, []);

  // Handler logout secara AJAX
  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (res.ok) {
        // Redirect ke halaman login setelah session cookie dihapus
        window.location.href = "/login";
      } else {
        alert("Gagal melakukan logout. Silakan coba lagi.");
        setLoggingOut(false);
      }
    } catch (err) {
      console.error("Logout error:", err);
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E8D1C5] dark:border-[#57595B]/60 bg-white/80 dark:bg-[#2b191a]/80 backdrop-blur-md transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-[#452829] dark:bg-[#E8D1C5] text-[#F3E8DF] dark:text-[#452829] flex items-center justify-center shadow-md shadow-[#452829]/20 transition-transform group-hover:scale-105">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#452829] dark:text-[#F3E8DF] block">
              Student Expense Tracker
            </span>
            <span className="text-[10px] font-semibold text-[#57595B] dark:text-[#E8D1C5]/70 block -mt-0.5">
              Platform Khusus Mahasiswa
            </span>
          </div>
        </Link>

        {/* Right Section: User Profile, Theme Toggle, & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Profile Badge (US-04: Menampilkan Nama Pengguna yang sedang Login) */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F3E8DF]/60 dark:bg-[#3b2324] border border-[#E8D1C5] dark:border-[#57595B]/60 shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-[#452829] dark:bg-[#E8D1C5] text-[#F3E8DF] dark:text-[#452829] flex items-center justify-center">
              <UserIcon className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold text-[#452829] dark:text-[#F3E8DF] leading-tight">
                {user ? user.name : "Mahasiswa"}
              </span>
              <span className="block text-[10px] text-[#57595B] dark:text-[#E8D1C5]/70 leading-tight">
                {user ? user.email : "Memuat profil..."}
              </span>
            </div>
          </div>

          {/* Theme Toggle (US-11: Menyimpan Preferensi Tema via Cookie) */}
          <ThemeToggle />

          {/* Tombol Logout (US-12: Mengakhiri Session Pengguna via AJAX) */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Keluar dari akun"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#9c3c3a] dark:text-[#f87171] hover:bg-[#9c3c3a]/10 dark:hover:bg-[#9c3c3a]/25 border border-[#9c3c3a]/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">
              {loggingOut ? "Keluar..." : "Logout"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
