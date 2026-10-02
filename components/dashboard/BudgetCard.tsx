"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Target,
  TrendingDown,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { BudgetSummaryResponse, BudgetStatus } from "@/lib/types";
import { SetBudgetModal } from "./SetBudgetModal";

interface BudgetCardProps {
  refreshKey?: number;
  onBudgetChange?: () => void;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export function BudgetCard({ refreshKey = 0, onBudgetChange }: BudgetCardProps) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [budgetData, setBudgetData] = useState<BudgetSummaryResponse>({
    budget: 0,
    totalExpense: 0,
    remainingBudget: 0,
    percentage: 0,
    status: "SAFE",
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    hasBudget: false,
  });

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data anggaran secara AJAX tanpa me-reload halaman
  const fetchBudget = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/budget?month=${selectedMonth}&year=${selectedYear}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Gagal mengambil data anggaran");
      }

      const data: BudgetSummaryResponse = await res.json();
      setBudgetData(data);
    } catch (err) {
      console.error("Gagal memuat data anggaran bulanan:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget, refreshKey]);

  // Navigasi bulan sebelumnya
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  // Navigasi bulan selanjutnya
  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  // Penentuan style indikator status
  const getIndicatorDetails = (status: BudgetStatus, percentage: number, hasBudget: boolean) => {
    if (!hasBudget || budgetData.budget === 0) {
      return {
        label: "Belum Ditentukan",
        badgeClass: "bg-[#57595B]/15 text-[#57595B] border-[#57595B]/30 dark:bg-[#57595B]/30 dark:text-[#E8D1C5]",
        barColor: "bg-[#57595B]/40",
        icon: <Target className="w-3.5 h-3.5" />,
        description: "Tetapkan anggaran agar dapat memantau batas pengeluaran bulan ini.",
      };
    }

    if (status === "EXCEEDED" || percentage >= 100) {
      return {
        label: "Melebihi Anggaran (Overbudget)",
        badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
        barColor: "bg-rose-600 animate-pulse",
        icon: <AlertOctagon className="w-3.5 h-3.5" />,
        description: `Pengeluaran telah melampaui target anggaran sebesar ${formatCurrency(Math.abs(budgetData.remainingBudget))}!`,
      };
    }

    if (status === "WARNING" || percentage >= 70) {
      return {
        label: "Waspada: Mendekati Batas",
        badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
        barColor: "bg-amber-500",
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
        description: `Pengeluaran sudah mencapai ${percentage}% dari total anggaran bulanan.`,
      };
    }

    return {
      label: "Pengeluaran Aman",
      badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
      barColor: "bg-emerald-600",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      description: `Pengeluaran baru mencapai ${percentage}%. Masih tersisa ${formatCurrency(budgetData.remainingBudget)}.`,
    };
  };

  const indicator = getIndicatorDetails(budgetData.status, budgetData.percentage, budgetData.hasBudget);
  const cappedPercentage = Math.min(100, Math.max(0, budgetData.percentage));

  return (
    <div className="rounded-2xl border border-[#E8D1C5] dark:border-[#57595B]/60 bg-white dark:bg-[#3b2324] p-5 shadow-fintech transition-all">
      {/* 1. Header Bagian Budget: Title, Monthly Budget Selector, Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8D1C5]/60 dark:border-[#57595B]/40">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#452829] dark:bg-[#E8D1C5] text-[#F3E8DF] dark:text-[#452829] flex items-center justify-center shadow-sm">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#452829] dark:text-[#F3E8DF]">
                Fitur Anggaran Bulanan (Monthly Budget)
              </h2>
              <p className="text-xs text-[#57595B] dark:text-[#E8D1C5]/70">
                Pantau batas pengeluaran berdasarkan transaksi pengeluaran mahasiswa
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Budget Picker & Tombol Set Budget */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Month & Year Navigator */}
          <div className="flex items-center bg-[#F3E8DF] dark:bg-[#2b191a] border border-[#E8D1C5] dark:border-[#57595B]/60 rounded-xl p-1 shadow-xs">
            <button
              onClick={handlePrevMonth}
              title="Bulan sebelumnya"
              className="p-1 rounded-lg text-[#57595B] hover:text-[#452829] dark:text-[#E8D1C5]/80 dark:hover:text-[#F3E8DF] hover:bg-[#E8D1C5]/40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-2.5 py-0.5 text-xs font-bold text-[#452829] dark:text-[#F3E8DF] flex items-center gap-1.5 whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-[#57595B]" />
              <span>
                {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
              </span>
            </div>

            <button
              onClick={handleNextMonth}
              title="Bulan berikutnya"
              className="p-1 rounded-lg text-[#57595B] hover:text-[#452829] dark:text-[#E8D1C5]/80 dark:hover:text-[#F3E8DF] hover:bg-[#E8D1C5]/40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Month Dropdown */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
            aria-label="Pilih Bulan Anggaran"
            className="px-2.5 py-1.5 text-xs rounded-xl bg-[#F3E8DF] dark:bg-[#2b191a] border border-[#E8D1C5] dark:border-[#57595B]/60 text-[#452829] dark:text-[#F3E8DF] focus:outline-none focus:ring-1 focus:ring-[#452829] dark:focus:ring-[#E8D1C5]"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i + 1} value={i + 1}>
                {name}
              </option>
            ))}
          </select>

          {/* Tombol Set / Ubah Budget */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#452829] hover:bg-[#5c3638] text-[#F3E8DF] dark:bg-[#E8D1C5] dark:hover:bg-[#dfc1b3] dark:text-[#452829] text-xs font-bold shadow-sm transition-transform active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{budgetData.hasBudget ? "Ubah Anggaran" : "Atur Anggaran"}</span>
          </button>
        </div>
      </div>

      {/* 2. Budget Summary (Anggaran, Total Pengeluaran, Sisa Anggaran) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-4">
        {/* Anggaran Bulanan */}
        <div className="p-3.5 rounded-xl bg-[#F3E8DF]/60 dark:bg-[#2b191a]/60 border border-[#E8D1C5]/80 dark:border-[#57595B]/40">
          <div className="flex items-center justify-between text-xs text-[#57595B] dark:text-[#E8D1C5]/70 font-semibold mb-1">
            <span>Target Anggaran</span>
            <Target className="w-4 h-4 text-[#452829] dark:text-[#E8D1C5]" />
          </div>
          <div className="text-xl font-extrabold text-[#452829] dark:text-[#F3E8DF]">
            {budgetData.hasBudget ? formatCurrency(budgetData.budget) : "Rp 0 (Belum Diset)"}
          </div>
          <p className="text-[10px] text-[#57595B] dark:text-[#E8D1C5]/60 mt-0.5">
            Bulan {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </p>
        </div>

        {/* Total Pengeluaran */}
        <div className="p-3.5 rounded-xl bg-[#F3E8DF]/60 dark:bg-[#2b191a]/60 border border-[#E8D1C5]/80 dark:border-[#57595B]/40">
          <div className="flex items-center justify-between text-xs text-[#57595B] dark:text-[#E8D1C5]/70 font-semibold mb-1">
            <span>Total Pengeluaran</span>
            <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-xl font-extrabold text-[#9c3c3a] dark:text-[#f87171]">
            {formatCurrency(budgetData.totalExpense)}
          </div>
          <p className="text-[10px] text-[#57595B] dark:text-[#E8D1C5]/60 mt-0.5">
            Akumulasi transaksi pengeluaran
          </p>
        </div>

        {/* Sisa Anggaran */}
        <div className="p-3.5 rounded-xl bg-[#F3E8DF]/60 dark:bg-[#2b191a]/60 border border-[#E8D1C5]/80 dark:border-[#57595B]/40">
          <div className="flex items-center justify-between text-xs text-[#57595B] dark:text-[#E8D1C5]/70 font-semibold mb-1">
            <span>Sisa Anggaran</span>
            <PiggyBank className="w-4 h-4 text-[#452829] dark:text-[#E8D1C5]" />
          </div>
          <div
            className={`text-xl font-extrabold ${
              budgetData.remainingBudget < 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-emerald-700 dark:text-emerald-400"
            }`}
          >
            {formatCurrency(budgetData.remainingBudget)}
          </div>
          <p className="text-[10px] text-[#57595B] dark:text-[#E8D1C5]/60 mt-0.5">
            {budgetData.remainingBudget >= 0 ? "Sisa dana tersedia" : "Defisit / melebihi target"}
          </p>
        </div>
      </div>

      {/* 3. Budget Indicator: Status Penggunaan Anggaran & Progress Bar */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${indicator.badgeClass}`}
            >
              {indicator.icon}
              <span>{indicator.label}</span>
            </span>

            {loading && (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#57595B] dark:text-[#E8D1C5]/60" />
            )}
          </div>

          {/* Persentase Terpakai */}
          <div className="text-xs font-bold text-[#452829] dark:text-[#F3E8DF]">
            <span>{budgetData.percentage}%</span>
            <span className="text-[#57595B] dark:text-[#E8D1C5]/70 font-medium ml-1">terpakai</span>
          </div>
        </div>

        {/* Progress Bar Dinamis */}
        <div className="w-full h-3 rounded-full bg-[#E8D1C5]/40 dark:bg-[#2b191a] overflow-hidden p-0.5 border border-[#E8D1C5] dark:border-[#57595B]/40">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${indicator.barColor}`}
            style={{ width: `${budgetData.hasBudget ? cappedPercentage : 0}%` }}
          />
        </div>

        {/* Deskripsi Status Indikator */}
        <p className="mt-2 text-xs text-[#57595B] dark:text-[#E8D1C5]/80">
          {indicator.description}
        </p>
      </div>

      {/* Modal Dialog Set Budget */}
      <SetBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchBudget();
          onBudgetChange?.();
        }}
        initialMonth={selectedMonth}
        initialYear={selectedYear}
        currentAmount={budgetData.budget}
      />
    </div>
  );
}
