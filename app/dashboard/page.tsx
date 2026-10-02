"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { BudgetCard } from "@/components/dashboard/BudgetCard";
import { FinancialCharts } from "@/components/dashboard/FinancialCharts";
import { TransactionFilters } from "@/components/dashboard/TransactionFilters";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { AddTransactionModal } from "@/components/dashboard/AddTransactionModal";
import { EditTransactionModal } from "@/components/dashboard/EditTransactionModal";
import { DeleteConfirmModal } from "@/components/dashboard/DeleteConfirmModal";
import { FinancialStats, TransactionItem, TransactionType, FilterType } from "@/lib/types";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/utils";

const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export default function DashboardPage() {
  // State Transaksi & Statistik
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [allTransactions, setAllTransactions] = useState<TransactionItem[]>([]);
  const [stats, setStats] = useState<FinancialStats>({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    transactionCount: 0,
  });

  // State Filter & Pencarian
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // State Modal Transaksi
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<TransactionType>("expense");
  const [editingTransaction, setEditingTransaction] = useState<TransactionItem | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<TransactionItem | null>(null);

  // State Sinkronisasi AJAX & Loading
  const [loading, setLoading] = useState(true);
  const [budgetRefreshKey, setBudgetRefreshKey] = useState(0);

  // Fetch Transaksi dengan Filter & Pencarian secara AJAX
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (currentFilter !== "all") {
        params.append("type", currentFilter);
      }
      if (selectedCategory && selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      if (searchQuery.trim() !== "") {
        params.append("search", searchQuery.trim());
      }

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const response = await fetch(`/api/transactions${queryString}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data transaksi");
      }

      const data = await response.json();
      setTransactions(data.transactions ?? []);

      setStats({
        totalBalance: data.stats?.totalBalance ?? 0,
        totalIncome: data.stats?.totalIncome ?? 0,
        totalExpense: data.stats?.totalExpense ?? 0,
        transactionCount: data.stats?.transactionCount ?? 0,
      });

      // Ambil juga total tanpa filter untuk menghitung counter badge filter
      if (currentFilter === "all" && selectedCategory === "all" && !searchQuery.trim()) {
        setAllTransactions(data.transactions ?? []);
      }
    } catch (error) {
      console.error("Gagal memuat transaksi dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [currentFilter, selectedCategory, searchQuery]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handler buka modal tambah transaksi
  const handleOpenAddModal = (type: TransactionType = "expense") => {
    setAddModalType(type);
    setIsAddModalOpen(true);
  };

  // Handler ketika transaksi berhasil ditambah/diedit/dihapus
  const handleTransactionChanged = () => {
    fetchTransactions();
    // Trigger pembaruan BudgetCard secara real-time via AJAX
    setBudgetRefreshKey((prev) => prev + 1);
  };

  // Hitung jumlah transaksi untuk counter badge filter
  const totalCounts = {
    all: allTransactions.length,
    income: allTransactions.filter((tx) => tx.type === "income").length,
    expense: allTransactions.filter((tx) => tx.type === "expense").length,
  };

  return (
    <div className="min-h-screen bg-[#F3E8DF] dark:bg-[#2b191a] text-[#452829] dark:text-[#F3E8DF] transition-colors">
      {/* 1. Header & Navigation Bar (US-04 Nama Pengguna, US-11 Tema Cookie, US-12 Logout AJAX) */}
      <DashboardNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Dashboard Title & Introduction */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#452829] dark:text-[#F3E8DF]">
            Dashboard Keuangan Mahasiswa
          </h1>
          <p className="mt-1 text-xs text-[#57595B] dark:text-[#E8D1C5]/80">
            Kelola pemasukan, pengeluaran, anggaran bulanan, dan pantau kondisi finansialmu secara real-time.
          </p>
        </div>

        {/* 2. Kartu Ringkasan Keuangan (Saldo, Pemasukan, Pengeluaran, Rasio Tabungan) */}
        <SummaryCards
          stats={stats}
          onAddIncome={() => handleOpenAddModal("income")}
          onAddExpense={() => handleOpenAddModal("expense")}
        />

        {/* 3. FITUR UTAMA BARU: Budget Bulanan (Set Budget, Summary, Indicator, Monthly Picker) */}
        <BudgetCard
          refreshKey={budgetRefreshKey}
          onBudgetChange={fetchTransactions}
        />

        {/* 4. Visualisasi Grafik Keuangan */}
        <FinancialCharts
          stats={stats}
          transactions={transactions}
        />

        {/* 5. Manajemen Riwayat Transaksi & Filter Interaktif (100% AJAX) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#452829] dark:text-[#F3E8DF]">
                Riwayat Transaksi Keuangan
              </h2>
              <p className="text-xs text-[#57595B] dark:text-[#E8D1C5]/70">
                Daftar transaksi yang tersimpan dan terisolasi khusus untuk akunmu
              </p>
            </div>

            <button
              onClick={() => handleOpenAddModal("expense")}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#452829] hover:bg-[#5c3638] text-[#F3E8DF] dark:bg-[#E8D1C5] dark:hover:bg-[#dfc1b3] dark:text-[#452829] text-xs font-bold shadow-sm transition-transform active:scale-95"
            >
              + Tambah Transaksi
            </button>
          </div>

          {/* Filter Bar (All, Income, Expense, Search & Category Dropdown) */}
          <TransactionFilters
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={ALL_CATEGORIES}
            totalCounts={totalCounts}
          />

          {/* Tabel Transaksi dengan Aksi Edit & Hapus Modal */}
          <TransactionTable
            transactions={transactions}
            onEdit={(tx) => setEditingTransaction(tx)}
            onDelete={(tx) => setDeletingTransaction(tx)}
            onAddNew={() => handleOpenAddModal("expense")}
          />
        </div>
      </main>

      {/* 6. Seluruh Modal Interaktif (Tambah, Edit, Hapus) */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleTransactionChanged}
        initialType={addModalType}
      />

      <EditTransactionModal
        isOpen={!!editingTransaction}
        transaction={editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSuccess={handleTransactionChanged}
      />

      <DeleteConfirmModal
        isOpen={!!deletingTransaction}
        transaction={deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onSuccess={handleTransactionChanged}
      />
    </div>
  );
}