"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Modal } from "@/components/Modal";
import {
  Wallet,
  Plus,
  TrendingUp,
  Users,
  Shield,
  Clock,
  ArrowRight,
  Trash2,
  FileText,
  Zap,
  CheckCircle2,
  Check,
  ChevronDown,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  ShoppingBag,
  Download,
} from "lucide-react";
import { FinancialTransaction } from "@/lib/types";

export default function FinancialManagementPage() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    emergencyFund: 0,
    familyContributions: 0,
    netBalance: 0,
    currency: "ETB",
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("Last 6 Months");

  // New Transaction Form
  const [type, setType] = useState<"income" | "expense" | "savings_transfer">("expense");
  const [category, setCategory] = useState("food");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [bucket, setBucket] = useState<"personal" | "business" | "trading">("personal");
  const [txDate, setTxDate] = useState("2026-11-05");
  const [submitting, setSubmitting] = useState(false);

  // Budget settings
  const [monthlySalary, setMonthlySalary] = useState(30000);
  const [familyTarget, setFamilyTarget] = useState(10000);
  const emergencyTarget = 90000;

  const fetchFinances = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/finances");
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTxDate(new Date().toISOString().split("T")[0]);
    fetchFinances();
  }, []);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/finances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          category,
          amount: parseFloat(amount) || 0,
          description,
          bucket,
          date: txDate,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setAmount("");
        setDescription("");
        fetchFinances();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction record?")) return;
    try {
      const res = await fetch(`/api/finances?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchFinances();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Savings rate calculation
  const savingsRate =
    summary.totalIncome > 0
      ? Number((((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100).toFixed(1))
      : 0.0;

  const emergencyFundPercent = Math.min(
    100,
    Math.round((summary.emergencyFund / emergencyTarget) * 100)
  );

  return (
    <AppLayout>
      <div className="space-y-4 max-w-7xl mx-auto pb-16">
        {/* ========================================================= */}
        {/* 1. TOP HERO BANNER (Matches Reference Image)              */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden rounded-2xl border border-[#C8E6C9] shadow-sm bg-[#0E2C1B] p-4 sm:p-5 min-h-[145px] flex items-center">
          {/* Background image overlay of gold coins & green sprout (Clean, text-free) */}
          <div
            className="absolute inset-0 bg-no-repeat bg-cover bg-right pointer-events-none opacity-95"
            style={{
              backgroundImage: "url('/finances/finances_hero_banner.png')",
            }}
          />
          {/* Left soft mint gradient for 100% crisp text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#EBF8F1]/95 via-[#EBF8F1]/85 to-transparent sm:w-[65%] pointer-events-none" />

          <div className="relative z-10 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              {/* Mint green rounded square icon */}
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#E8F8F0] border border-[#A1E3C0] flex items-center justify-center flex-shrink-0 shadow-sm text-[#165B33]">
                <TrendingUp size={28} className="stroke-[2.5]" />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0D3823] tracking-tight">
                  Personal Finance & Capital Accounting
                </h1>
                <p className="text-[12px] sm:text-[13px] text-[#24523A] font-medium mt-0.5">
                  Track your finances, manage your investments, and build wealth for the future.
                </p>
              </div>
            </div>

            {/* Action Buttons: Export CSV + Record Transaction */}
            <div className="flex-shrink-0 self-start sm:self-center flex items-center gap-2">
              <a
                href="/api/finances/export"
                download
                className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 bg-white/90 hover:bg-white text-[#124B2C] rounded-xl text-[13px] font-semibold border border-[#B7E4C7] shadow-2xs transition-all"
                title="Export all transactions as CSV"
              >
                <Download size={14} className="mr-0.5" />
                <span>Export CSV</span>
              </a>
              <button
                onClick={() => {
                  setTxDate(new Date().toISOString().split("T")[0]);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-[#124B2C] hover:bg-[#0D3823] text-white rounded-xl text-[13px] font-semibold border border-[#236840] shadow-sm transition-all"
              >
                <Plus size={15} className="mr-0.5" />
                <span>Record Transaction</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. FOUR STAT CARDS ROW                                    */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Total Inflow */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#E8F8F0] border border-[#C8E6C9] flex items-center justify-center text-[#16A34A] flex-shrink-0 shadow-sm">
              <Wallet size={22} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[#64748B] block truncate">
                Total Inflow (ETB)
              </span>
              <div className="text-2xl font-extrabold text-[#0F172A] leading-tight mt-0.5">
                {summary.totalIncome.toLocaleString()}
              </div>
              <span className="text-[11px] font-semibold text-[#16A34A] block truncate">
                {summary.totalIncome > 0 ? "↑ Active Inflow" : "Day 1 Baseline (0 ETB)"}
              </span>
            </div>
          </div>

          {/* Card 2: Total Outflow */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#FEE2E2] border border-[#FECACA] flex items-center justify-center text-[#EF4444] flex-shrink-0 shadow-sm">
              <Wallet size={22} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[#64748B] block truncate">
                Total Outflow (ETB)
              </span>
              <div className="text-2xl font-extrabold text-[#DC2626] leading-tight mt-0.5">
                {summary.totalExpenses.toLocaleString()}
              </div>
              <span className="text-[11px] font-semibold text-[#64748B] block truncate">
                {summary.totalExpenses > 0 ? "↓ Expenses recorded" : "No expenses logged"}
              </span>
            </div>
          </div>

          {/* Card 3: Family Contribution */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#334155] flex-shrink-0 shadow-sm">
              <Users size={22} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[#64748B] block truncate">
                Family Contribution
              </span>
              <div className="text-2xl font-extrabold text-[#0F172A] leading-tight mt-0.5">
                {summary.familyContributions.toLocaleString()}
              </div>
              <span className="text-[11px] text-[#64748B] font-medium block truncate">
                For family duty
              </span>
            </div>
          </div>

          {/* Card 4: Emergency Fund */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#E8F8F0] border border-[#C8E6C9] flex items-center justify-center text-[#165B33] flex-shrink-0 shadow-sm">
              <Shield size={22} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[#64748B] block truncate">
                Emergency Fund
              </span>
              <div className="text-2xl font-extrabold text-[#0F172A] leading-tight mt-0.5">
                {summary.emergencyFund.toLocaleString()}
              </div>
              <span className="text-[11px] text-[#64748B] font-medium block truncate">
                Target: {emergencyTarget.toLocaleString()} ETB ({emergencyFundPercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. MIDDLE SECTION: FINANCIAL OVERVIEW & BUDGET RULE       */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Left: Financial Overview Card (col-span-8) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center space-x-2">
                <Wallet size={16} className="text-[#165B33]" />
                <h2 className="text-[15px] font-bold text-[#0F172A]">Financial Overview</h2>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 text-[11px] text-[#64748B]">
                  <span className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#165B33]" />
                    <span className="font-semibold text-[#0F172A]">Income</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#86EFAC]" />
                    <span className="font-semibold text-[#0F172A]">Expenses</span>
                  </span>
                </div>

                <div className="relative">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="text-[11px] font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-2.5 py-1 text-[#334155] focus:outline-none"
                  >
                    <option value="Last 6 Months">Last 6 Months</option>
                    <option value="Last 3 Months">Last 3 Months</option>
                    <option value="Year 2026">Year 2026</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Chart + Circular Gauge Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3 items-center">
              {/* Dual-Line Chart (md:col-span-8) */}
              <div className="md:col-span-8 h-44 relative flex items-center justify-center">
                {transactions.length === 0 ? (
                  <div className="text-center p-6 border border-dashed border-[#CBD5E1] rounded-xl w-full">
                    <span className="text-[13px] font-bold text-[#0F172A] block">Clean Financial Ledger</span>
                    <p className="text-[11.5px] text-[#64748B] mt-1 max-w-sm mx-auto">
                      All old operational transactions cleared. Income and expense curves will chart live as transactions are logged.
                    </p>
                  </div>
                ) : (
                  <svg viewBox="0 0 460 170" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="incomeArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#165B33" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#165B33" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    {[
                      { label: "40k", y: 20 },
                      { label: "30k", y: 55 },
                      { label: "20k", y: 90 },
                      { label: "10k", y: 125 },
                      { label: "0k", y: 160 },
                    ].map((grid, idx) => (
                      <g key={idx}>
                        <text x="18" y={grid.y + 3} textAnchor="end" fontSize="9" fill="#94A3B8" fontFamily="monospace">
                          {grid.label}
                        </text>
                        <line x1="28" y1={grid.y} x2="450" y2={grid.y} stroke="#F1F5F9" strokeWidth="1" />
                      </g>
                    ))}

                    {/* Dynamic line representation */}
                    <line x1="35" y1="160" x2="435" y2="160" stroke="#165B33" strokeWidth="2" strokeDasharray="4 4" />
                  </svg>
                )}
              </div>

              {/* Savings Rate Donut Gauge (md:col-span-4) */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-2">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#E2E8F0"
                      strokeWidth="9"
                      fill="transparent"
                    />
                    {/* Progress stroke in deep forest green */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#165B33"
                      strokeWidth="9"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 * (1 - (summary.totalIncome > 0 ? (summary.emergencyFund / summary.totalIncome) : 0))}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700"
                    />
                  </svg>

                  {/* Gauge Center Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase">
                      Savings Rate
                    </span>
                    <span className="text-xl font-extrabold text-[#0F172A] leading-tight">
                      {summary.totalIncome > 0 ? ((summary.emergencyFund / summary.totalIncome) * 100).toFixed(1) : "0.0"}%
                    </span>
                    <span className="text-[10px] font-bold text-[#16A34A] mt-0.5">
                      {summary.totalIncome > 0 ? "Active Ratio" : "Baseline"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Budget Rule Card (col-span-4) */}
          <div className="lg:col-span-4 relative overflow-hidden bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between">
            {/* Glass Jar with Coins & Sprout Image positioned on the right */}
            <div
              className="absolute right-1 bottom-1 w-32 h-36 bg-no-repeat bg-contain bg-right-bottom pointer-events-none"
              style={{
                backgroundImage: "url('/finances/money_jar.png')",
              }}
            />

            <div className="relative z-10 max-w-[210px]">
              <div className="flex items-center space-x-1.5 mb-2.5">
                <span className="text-[15px]">💡</span>
                <h3 className="text-[14px] font-bold text-[#0F172A]">Budget Rule</h3>
              </div>

              <p className="text-[12px] text-[#334155] font-medium leading-relaxed mb-4">
                Never allocate speculative trading capital from essential living reserves. Maintain 3 months of family expenses before discretionary spending.
              </p>
            </div>

            <div className="relative z-10 pt-2 border-t border-[#F1F5F9] text-[11px] text-[#165B33] font-semibold flex items-center space-x-1">
              <Shield size={13} />
              <span>Capital Preservation Policy</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. BOTTOM SECTION: TRANSACTION LEDGER & SIDEBAR           */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Left: Transaction Ledger (col-span-8) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-[#F1F5F9]">
              <div className="flex items-center space-x-2">
                <FileText size={16} className="text-[#165B33]" />
                <h2 className="text-[15px] font-bold text-[#0F172A]">Transaction Ledger</h2>
              </div>
              <span className="text-[11px] font-semibold text-[#64748B]">
                {transactions.length} Recent Transactions
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#F1F5F9] text-[10px] uppercase font-bold tracking-wider text-[#94A3B8]">
                    <th className="py-2.5 pr-3 pl-1 font-bold">DATE</th>
                    <th className="py-2.5 px-3 font-bold min-w-[200px]">DESCRIPTION</th>
                    <th className="py-2.5 px-3 font-bold">CATEGORY</th>
                    <th className="py-2.5 px-3 font-bold">BUCKET</th>
                    <th className="py-2.5 pl-3 pr-1 font-bold text-right">AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#64748B] text-[13px]">
                        Loading ledger...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#64748B] text-[13px]">
                        No financial records found.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => {
                      const isIncome = t.type === "income";
                      const isSavings = t.type === "savings_transfer";

                      return (
                        <tr key={t.id} className="hover:bg-[#FBFBFA] transition-colors group">
                          {/* 1. DATE */}
                          <td className="py-3 pr-3 pl-1 text-[11px] font-mono text-[#64748B] whitespace-nowrap">
                            {t.date}
                          </td>

                          {/* 2. DESCRIPTION */}
                          <td className="py-3 px-3">
                            <span className="text-[13px] font-bold text-[#0F172A]">
                              {t.description || "Transaction"}
                            </span>
                          </td>

                          {/* 3. CATEGORY */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="inline-block text-[11px] font-semibold text-[#854D0E] bg-[#FEF9C3] border border-[#FEF08A] px-2.5 py-0.5 rounded-md">
                              {t.category.replace("_", " ")}
                            </span>
                          </td>

                          {/* 4. BUCKET */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="inline-block text-[11px] font-semibold text-[#854D0E] bg-[#FEF9C3] border border-[#FEF08A] px-2.5 py-0.5 rounded-md">
                              {isSavings ? "emergency fund" : t.bucket}
                            </span>
                          </td>

                          {/* 5. AMOUNT */}
                          <td className="py-3 pl-3 pr-1 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-2">
                              <span
                                className={`text-[12px] font-bold font-mono ${
                                  isIncome || isSavings ? "text-[#16A34A]" : "text-[#DC2626]"
                                }`}
                              >
                                {isIncome || isSavings ? "+" : "-"}
                                {t.amount.toLocaleString()} ETB
                              </span>

                              <button
                                onClick={() => handleDeleteTransaction(t.id)}
                                className="opacity-0 group-hover:opacity-100 text-[#CBD5E1] hover:text-[#DC2626] transition-all p-1"
                                title="Delete entry"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Quick Actions & Recent Activity (col-span-4) */}
          <div className="lg:col-span-4 space-y-3.5">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm">
              <div className="flex items-center space-x-1.5 mb-3">
                <span className="text-[#16A34A]">⚡</span>
                <h3 className="text-[13px] font-bold text-[#0F172A]">Quick Actions</h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#165B33] border border-[#BBF7D0] px-3 py-2 rounded-xl text-[12px] font-semibold flex items-center justify-center space-x-1 transition-colors shadow-sm"
                >
                  <Plus size={13} />
                  <span>Add Transaction</span>
                </button>

                <button
                  onClick={() => setIsBudgetModalOpen(true)}
                  className="bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#165B33] border border-[#BBF7D0] px-3 py-2 rounded-xl text-[12px] font-semibold flex items-center justify-center space-x-1 transition-colors shadow-sm"
                >
                  <CheckCircle2 size={13} />
                  <span>Set Budget</span>
                </button>

                <a
                  href="/reports"
                  className="bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] px-3 py-2 rounded-xl text-[12px] font-semibold flex items-center justify-center space-x-1 transition-colors"
                >
                  <Layers size={13} />
                  <span>View Reports</span>
                </a>

                <a
                  href="/goals"
                  className="bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] px-3 py-2 rounded-xl text-[12px] font-semibold flex items-center justify-center space-x-1 transition-colors"
                >
                  <Sparkles size={13} />
                  <span>Manage Goals</span>
                </a>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1.5">
                  <Clock size={15} className="text-[#64748B]" />
                  <h3 className="text-[13px] font-bold text-[#0F172A]">Recent Activity</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-[11px] font-semibold text-[#16A34A] hover:underline flex items-center space-x-0.5"
                >
                  <span>View All</span>
                  <ArrowRight size={11} className="ml-0.5" />
                </button>
              </div>

              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="py-4 text-center text-[#64748B] text-[11.5px]">
                    No recent transactions logged yet.
                  </div>
                ) : (
                  transactions.slice(0, 3).map((t) => (
                    <div key={t.id} className="flex items-start space-x-2.5 text-[12px]">
                      <div className="w-5 h-5 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={12} className="stroke-[2.5]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-[#0F172A] leading-tight truncate">
                          {t.description || t.category} ({t.amount.toLocaleString()} ETB)
                        </div>
                        <div className="text-[11px] text-[#94A3B8] font-mono mt-0.5">
                          {t.date}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL: RECORD TRANSACTION                                 */}
        {/* ========================================================= */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Record Capital Transaction"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreateTransaction} className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`py-2 rounded-lg text-[12px] font-bold transition-all ${
                  type === "expense"
                    ? "bg-[#DC2626] text-white shadow-sm"
                    : "bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]"
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType("income")}
                className={`py-2 rounded-lg text-[12px] font-bold transition-all ${
                  type === "income"
                    ? "bg-[#16A34A] text-white shadow-sm"
                    : "bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]"
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setType("savings_transfer")}
                className={`py-2 rounded-lg text-[12px] font-bold transition-all ${
                  type === "savings_transfer"
                    ? "bg-[#165B33] text-white shadow-sm"
                    : "bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]"
                }`}
              >
                Savings
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Amount (ETB) *
                </label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 3500"
                  className="w-full px-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#165B33]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Transaction Date *
                </label>
                <input
                  type="date"
                  required
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#165B33]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#165B33]"
                >
                  <option value="salary">Salary / Employment</option>
                  <option value="food">Food & Sustenance</option>
                  <option value="transportation">Transportation / Commute</option>
                  <option value="family_contribution">Family Contribution</option>
                  <option value="emergency_fund">Emergency Fund</option>
                  <option value="freelance">Freelance Revenue</option>
                  <option value="personal">Personal / Discretionary</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Bucket *
                </label>
                <select
                  value={bucket}
                  onChange={(e) => setBucket(e.target.value as any)}
                  className="w-full px-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#165B33]"
                >
                  <option value="personal">Personal Living</option>
                  <option value="business">Business / Freelance</option>
                  <option value="trading">Trading Reserve</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                Description / Memo
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Groceries & daily sustenance"
                className="w-full px-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#165B33]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-[13px] text-[#64748B] hover:bg-[#F1F5F9] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-[13px] font-semibold text-white bg-[#124B2C] hover:bg-[#0D3823] rounded-lg transition-colors shadow-sm"
              >
                {submitting ? "Recording..." : "Record Transaction"}
              </button>
            </div>
          </form>
        </Modal>

        {/* ========================================================= */}
        {/* MODAL: SET BUDGET & TARGETS                               */}
        {/* ========================================================= */}
        <Modal
          isOpen={isBudgetModalOpen}
          onClose={() => setIsBudgetModalOpen(false)}
          title="Monthly Budget & Savings Policy"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-[13px]">
            <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-[#165B33]">
              <strong>Capital Principle: </strong>Base salary is 30,000 ETB. Essential family duty is ~10,000 ETB. Unallocated capital is never considered savings without recorded transfer.
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                Base Monthly Salary (ETB)
              </label>
              <input
                type="number"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(Number(e.target.value))}
                className="w-full px-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                Monthly Family Contribution (ETB)
              </label>
              <input
                type="number"
                value={familyTarget}
                onChange={(e) => setFamilyTarget(Number(e.target.value))}
                className="w-full px-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                Emergency Fund 90-Day Target
              </label>
              <div className="px-3 py-2 text-[13px] bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg font-mono font-bold text-[#0F172A]">
                90,000 ETB (~3 Months Essential Reserve)
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E2E8F0]">
              <button
                onClick={() => setIsBudgetModalOpen(false)}
                className="px-4 py-2 text-[13px] font-semibold text-white bg-[#124B2C] hover:bg-[#0D3823] rounded-lg transition-colors shadow-sm"
              >
                Save Budget
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
