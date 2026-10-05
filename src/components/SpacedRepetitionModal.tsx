import React, { useState } from "react";
import { Flashcard } from "../types";
import { RotateCw, CheckCircle, AlertCircle, X, Sparkles, Trophy } from "lucide-react";

interface SpacedRepetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardReviewed: (xpGained: number) => void;
  language: "ar" | "en";
}

const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: "card-1",
    category: "قوانين ونظريات",
    front: "ما هو قانون عمر النصف (Half-life) بالصيغة الأسية والتطبيقية؟",
    back: "N(t) = N₀ · (1/2)^(t / T_1/2) أو N(t) = N₀ · e^(-λt) حيث ثابت التحلل λ = 0.693 / T_1/2.",
    dueDays: 1,
  },
  {
    id: "card-2",
    category: "المفاعلات النووية",
    front: "ما هي المواد الشائعة المستخدمة في قضبان التحكم لإيقاف أو كبح التفاعل المتسلسل؟",
    back: "الكادميوم (Cadmium) والبورون (Boron)، بسبب مقطعها العرضي الهائل لامتصاص النيوترونات الحرارية دون انشطار.",
    dueDays: 1,
  },
  {
    id: "card-3",
    category: "السلامة والجرعات",
    front: "ما هو الفرق بين وحدة الجراي (Gray) ووحدة السيفيرت (Sievert)؟",
    back: "الجراي (Gy) هو الجرعة الممتصة الفيزيائية (1 جول/كجم)، بينما السيفيرت (Sv) هو الجرعة المكافئة والفعالة التي تأخذ في الحسبان الضرر البيولوجي ونوع الإشعاع (H = D × w_R).",
    dueDays: 2,
  },
  {
    id: "card-4",
    category: "طاقة الربط",
    front: "كيف يُحسب نقص الكتلة (Mass Defect) وطاقة الربط النووي؟",
    back: "Δm = [Z·m_p + (A-Z)·m_n] - m_nucleus، وطاقة الربط E = Δm · c² (أو Δm بالـ amu × 931.5 MeV).",
    dueDays: 1,
  },
  {
    id: "card-5",
    category: "الاضمحلال الإشعاعي",
    front: "ما التغير الذي يطرأ على العدد الذري (Z) والكتلي (A) عند انبعاث جسيم ألفا (α)؟",
    back: "ينقص العدد الذري Z بمقدار 2، وينقص العدد الكتلي A بمقدار 4 لأن جسيم ألفا هو نواة هيليوم (⁴₂He).",
    dueDays: 3,
  },
];

export function SpacedRepetitionModal({
  isOpen,
  onClose,
  onCardReviewed,
  language,
}: SpacedRepetitionModalProps) {
  const isEn = language === "en";
  const [cards, setCards] = useState<Flashcard[]>(INITIAL_FLASHCARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  if (!isOpen) return null;

  const currentCard = cards[currentIndex];

  const handleRate = (intervalDays: number) => {
    onCardReviewed(15);
    setIsFlipped(false);
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setSessionCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-3xl border border-amber-500/40 bg-[#070d1a] p-6 lg:p-8 shadow-[0_0_80px_rgba(245,158,11,0.25)] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <RotateCw className="size-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEn ? "Smart Spaced Repetition (Anki Engine)" : "محرك التكرار المتباعد الذكي (SuperMemo / Anki)"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isEn ? "Strengthen long-term memory with active recall" : "تثبيت المفاهيم والقوانين في الذاكرة طويلة المدى"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {!sessionCompleted && currentCard ? (
          <div className="space-y-6">
            {/* Progress & Category */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="rounded-full bg-cyan-950 px-2.5 py-0.5 text-cyan-300 font-mono text-[10px] border border-cyan-500/30">
                {currentCard.category}
              </span>
              <span>
                {currentIndex + 1} / {cards.length} {isEn ? "Cards" : "بطاقات"}
              </span>
            </div>

            {/* Flashcard Frame with 3D Flip */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative min-h-[220px] rounded-2xl border-2 border-cyan-500/30 bg-[#091224] p-6 flex flex-col justify-between cursor-pointer hover:border-cyan-400 transition-all shadow-inner group"
            >
              <div className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                {isFlipped ? (isEn ? "ANSWER / EXPLANATION" : "الإجابة والتفسير العلمي") : (isEn ? "QUESTION / CONCEPT" : "السؤال / المفهوم")}
              </div>

              <div className="my-auto text-center py-4">
                <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {isFlipped ? currentCard.back : currentCard.front}
                </p>
              </div>

              <div className="text-center text-[11px] text-cyan-400 font-medium">
                {isFlipped
                  ? (isEn ? "Click again to flip back" : "انقر للقلب مجدداً")
                  : (isEn ? "Click the card to reveal the answer" : "اضغط على البطاقة لإظهار الإجابة")}
              </div>
            </div>

            {/* Rating Buttons */}
            {isFlipped ? (
              <div className="space-y-2">
                <div className="text-center text-xs text-slate-300">
                  {isEn ? "How easily did you recall this concept?" : "ما مدى سهولة تذكرك للمعلومة؟"}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleRate(1)}
                    className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-2.5 text-xs font-bold text-rose-300 hover:bg-rose-900/40 transition-all cursor-pointer"
                  >
                    <div>{isEn ? "Hard" : "صعب"}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{isEn ? "+1 Day" : "+1 يوم"}</div>
                  </button>
                  <button
                    onClick={() => handleRate(3)}
                    className="rounded-xl border border-amber-500/40 bg-amber-950/40 p-2.5 text-xs font-bold text-amber-300 hover:bg-amber-900/40 transition-all cursor-pointer"
                  >
                    <div>{isEn ? "Good" : "متوسط"}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{isEn ? "+3 Days" : "+3 أيام"}</div>
                  </button>
                  <button
                    onClick={() => handleRate(7)}
                    className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-900/40 transition-all cursor-pointer"
                  >
                    <div>{isEn ? "Easy" : "سهل"}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{isEn ? "+7 Days" : "+7 أيام"}</div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={() => setIsFlipped(true)}
                  className="rounded-xl bg-cyan-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                >
                  {isEn ? "Reveal Answer" : "إظهار الإجابة"}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Finished session */
          <div className="text-center py-6 space-y-4">
            <div className="size-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <Trophy className="size-8" />
            </div>
            <h4 className="text-xl font-bold text-white">
              {isEn ? "Awesome! Session Complete" : "رائع جداً! أتممت مراجعة البطاقات"}
            </h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              {isEn
                ? "You earned bonus XP points and updated your spaced repetition review schedule."
                : "حصلت على نقاط خبرة إضافية، وتمت جدولة موعد المراجعة القادمة لترسيخ الذاكرة."}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={handleRestart}
                className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                {isEn ? "Review Again" : "مراجعة جولة أخرى"}
              </button>
              <button
                onClick={onClose}
                className="rounded-xl bg-cyan-500 px-6 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 cursor-pointer"
              >
                {isEn ? "Finish & Close" : "إنهاء والعودة للدرس"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
