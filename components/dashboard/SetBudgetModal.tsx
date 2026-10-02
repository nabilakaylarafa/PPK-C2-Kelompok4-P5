"use client";

import { useState, useEffect } from "react";
import { X, Target, Calendar, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SetBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMonth: number;
  initialYear: number;
  currentAmount?: number;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export function SetBudgetModal({
  isOpen,
  onClose,
  onSuccess,
  initialMonth,
  initialYear,
  currentAmount = 0,
}: SetBudgetModalProps) {
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [amount, setAmount] = useState(currentAmount > 0 ? String(currentAmount) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMonth(initialMonth);
    setYear(initialYear);
    setAmount(currentAmount > 0 ? String(currentAmount) : "");
    setError(null);
  }, [initialMonth, initialYear, currentAmount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Masukkan nominal anggaran yang valid (lebih dari 0).");
      return;
    }

    try {
      setLoading(true);

      // AJAX Request ke endpoint /api/budget
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          year,
          amount: parsedAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan anggaran bulanan.");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem saat menyimpan anggaran.");
    } finally {
      setLoading(false);
    }
  };

  const numericAmount = parseFloat(amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2b191a]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#3b2324] border border-[#E8D1C5] dark:border-[#57595B] shadow-2xl overflow-hidden p-6 transition-colors">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#57595B] hover:text-[#452829] dark:text-[#E8D1C5]/70 dark:hover:text-[#F3E8DF] hover:bg-[#E8D1C5]/40 dark:hover:bg-[#452829] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-[#452829] dark:bg-[#E8D1C5] text-[#F3E8DF] dark:text-[#452829] flex items-center justify-center shadow-md">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#452829] dark:text-[#F3E8DF]">
              Atur Anggaran Bulanan
            </h3>
            <p className="text-xs text-[#57595B] dark:text-[#E8D1C5]/70">
              Tentukan target batas pengeluaran untuk memantau keuanganmu
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#9c3c3a]/10 dark:bg-[#9c3c3a]/25 border border-[#9c3c3a]/30 flex items-center gap-2.5 text-xs text-[#9c3c3a] dark:text-[#f87171]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Month & Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#57595B] dark:text-[#E8D1C5] mb-1.5">
                Bulan Anggaran
              </label>
              <div className="relative">
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                  disabled={loading}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#F3E8DF]/60 dark:bg-[#2b191a] border border-[#E8D1C5] dark:border-[#57595B] text-[#452829] dark:text-[#F3E8DF] focus:ring-2 focus:ring-[#452829] dark:focus:ring-[#E8D1C5] focus:outline-none"
                >
                  {MONTH_NAMES.map((name, index) => (
                    <option key={index + 1} value={index + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#57595B] dark:text-[#E8D1C5] mb-1.5">
                Tahun
              </label>
              <input
                type="number"
                min="2020"
                max="2100"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
                disabled={loading}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#F3E8DF]/60 dark:bg-[#2b191a] border border-[#E8D1C5] dark:border-[#57595B] text-[#452829] dark:text-[#F3E8DF] focus:ring-2 focus:ring-[#452829] dark:focus:ring-[#E8D1C5] focus:outline-none"
              />
            </div>
          </div>

          {/* Nominal Budget Input */}
          <div>
            <label className="block text-xs font-bold text-[#57595B] dark:text-[#E8D1C5] mb-1.5">
              Nominal Anggaran (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#57595B] dark:text-[#E8D1C5]/70">
                Rp
              </span>
              <input
                type="number"
                step="1000"
                min="1000"
                placeholder="Contoh: 2000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
                required
                className="w-full pl-10 pr-3.5 py-2.5 text-sm font-semibold rounded-xl bg-[#F3E8DF]/60 dark:bg-[#2b191a] border border-[#E8D1C5] dark:border-[#57595B] text-[#452829] dark:text-[#F3E8DF] placeholder-[#57595B]/50 focus:ring-2 focus:ring-[#452829] dark:focus:ring-[#E8D1C5] focus:outline-none"
              />
            </div>

            {/* Live Currency Preview Helper */}
            {!isNaN(numericAmount) && numericAmount > 0 && (
              <p className="mt-1.5 text-[11px] text-[#57595B] dark:text-[#E8D1C5]/80 flex items-center gap-1">
                <span>Dikonversi:</span>
                <span className="font-bold text-[#452829] dark:text-[#E8D1C5]">
                  {formatCurrency(numericAmount)}
                </span>
              </p>
            )}
          </div>

          {/* Quick preset recommendations */}
          <div>
            <span className="block text-[11px] font-semibold text-[#57595B] dark:text-[#E8D1C5]/70 mb-1.5">
              Rekomendasi Cepat:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {[500000, 1000000, 1500000, 2000000, 3000000].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setAmount(String(preset))}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-[#E8D1C5]/30 dark:bg-[#452829]/60 hover:bg-[#E8D1C5]/60 text-[#452829] dark:text-[#E8D1C5] border border-[#E8D1C5] dark:border-[#57595B] transition-colors"
                >
                  {formatCurrency(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-[#57595B] dark:text-[#E8D1C5] hover:bg-[#E8D1C5]/30 dark:hover:bg-[#452829] rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold bg-[#452829] hover:bg-[#5c3638] text-[#F3E8DF] dark:bg-[#E8D1C5] dark:hover:bg-[#dfc1b3] dark:text-[#452829] rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Anggaran</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
