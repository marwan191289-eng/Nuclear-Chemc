import React, { useState } from "react";
import { Course } from "../types";
import { CheckCircle2, CreditCard, Download, Lock, ShieldCheck, X } from "lucide-react";

interface PaymentModalProps {
  course: Course | null;
  onClose: () => void;
  onSuccess: (courseId: string) => void;
  language: "ar" | "en";
}

export function PaymentModal({ course, onClose, onSuccess, language }: PaymentModalProps) {
  const isEn = language === "en";
  const [method, setMethod] = useState<"mada" | "apple" | "card" | "stc">("mada");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("5888 •••• •••• 4120");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  if (!course) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      const txId = `TXN-KSA-${Math.floor(100000 + Math.random() * 900000)}`;
      setTransactionId(txId);
      setIsProcessing(false);
      setIsDone(true);
      onSuccess(course.id);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border border-cyan-500/40 bg-[#070e1c] p-6 sm:p-8 shadow-[0_0_80px_rgba(0,240,255,0.2)] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEn ? "Secure Checkout & Payment Gateway" : "بوابة الدفع الإلكتروني الآمن (Mada / Apple Pay)"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isEn ? "256-Bit Encrypted Transaction" : "معاملة مشفرة ومحمية وفق معايير البنك المركزي السعودي"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="size-5" />
          </button>
        </div>

        {!isDone ? (
          <form onSubmit={handlePay} className="space-y-5">
            {/* Order Summary */}
            <div className="rounded-2xl border border-slate-800 bg-[#091122] p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">{course.title}</div>
                <div className="text-[11px] text-slate-400">{course.duration} • شامل المحاضرات والاختبارات والشهادة</div>
              </div>
              <div className="text-xl font-black text-cyan-400 font-mono">
                {course.price} <span className="text-xs font-normal text-slate-400">ريال</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">اختر وسيلة الدفع:</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "mada", label: "مدى mada" },
                  { id: "apple", label: "Apple Pay" },
                  { id: "card", label: "Visa / MC" },
                  { id: "stc", label: "STC Pay" },
                ].map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setMethod(m.id as any)}
                    className={`py-2 px-1 text-center rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                      method === m.id
                        ? "border-cyan-400 bg-cyan-950/60 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                        : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">اسم حامل البطاقة:</label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">رقم البطاقة:</label>
                <div className="relative">
                  <CreditCard className="absolute right-3 top-2.5 size-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 pr-9 pl-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">تاريخ الانتهاء:</label>
                  <input
                    type="text"
                    defaultValue="09/28"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">رمز الأمان (CVV):</label>
                  <input
                    type="password"
                    defaultValue="894"
                    maxLength={4}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs font-bold text-slate-950 shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  <span>جارٍ تفويض العملية البنكية المشفرة...</span>
                </>
              ) : (
                <>
                  <Lock className="size-3.5" />
                  <span>دفع {course.price} ريال وتفعيل المقرر فورياً</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Payment Confirmation Receipt */
          <div className="text-center py-4 space-y-4">
            <div className="size-16 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="size-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white">تمت العملية بنجاح! وتفعيل المقرر لحسابك</h4>
              <p className="text-xs text-slate-300">
                أهلاً بك في دورة «{course.title}»، يمكنك الآن الوصول لجميع المحاضرات ومحاكي المفاعل فوراً.
              </p>
            </div>

            {/* Receipt details */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-xs space-y-2 text-right">
              <div className="flex justify-between text-slate-400">
                <span>رقم العملية (Transaction ID):</span>
                <span className="font-mono text-cyan-300">{transactionId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>المبلغ المدفوع:</span>
                <span className="font-mono text-white font-bold">{course.price} ريال (شامل الضريبة)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>حالة التفعيل:</span>
                <span className="text-emerald-400 font-bold">نشط ومتاح في لوحة الطالب</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                <Download className="size-3.5" />
                <span>طباعة الفاتورة</span>
              </button>
              <button
                onClick={onClose}
                className="rounded-xl bg-cyan-500 px-6 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)]"
              >
                الانتقال للدروس والمشاهدة ←
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
