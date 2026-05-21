import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useLocation } from "wouter";
import { Printer, ArrowLeft, ExternalLink, Globe, Leaf, Sprout, Focus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import happyBonsai from "@assets/Happy_Wave_Bonsai_1779333623327.png";
import { MiniLeafMark } from "@/components/mini-leaf-mark";

export default function QrPoster() {
  const [, setLocation] = useLocation();
  const posterRef = useRef<HTMLDivElement>(null);

  const checkInUrl = (
    (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined) ??
    "https://charlescheckin.inkaastudio.com"
  ).replace(/\/+$/, "");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f0ede8] flex flex-col items-center">

      {/* Controls — hidden on print */}
      <div className="no-print w-full max-w-2xl px-6 pt-8 pb-4 flex items-center justify-between">
        <button
          onClick={() => setLocation("/admin")}
          className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </button>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handlePrint}
            className="bg-[#1a1a1a] text-white hover:bg-[#333] rounded-xl px-5 py-2 flex items-center gap-2 text-sm font-medium"
          >
            <Printer size={16} />
            Print Poster
          </Button>
        </motion.div>
      </div>

      {/* URL hint */}
      <div className="no-print mb-6 text-xs text-[#9ca3af] flex items-center gap-1.5">
        <ExternalLink size={12} />
        QR points to: <span className="font-mono text-[#6b7280]">{checkInUrl}</span>
      </div>

      {/* Poster */}
      <div
        ref={posterRef}
        className="poster-page relative w-[min(92vw,780px)] bg-[#f5f2ee] shadow-2xl flex flex-col items-center overflow-hidden rounded-[32px] border border-black/[0.04] px-7 sm:px-10 pt-12 sm:pt-14 pb-10 sm:pb-12"
      >
        {/* Bottom organic waves */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0">
          <svg viewBox="0 0 1440 240" className="w-full h-40 sm:h-44" preserveAspectRatio="none">
            <path
              d="M0 160c120-42 240-62 360-60 160 3 240 64 400 64 160 0 240-50 360-66 120-15 240 7 320 26v116H0V160Z"
              fill="#efe7dc"
            />
            <path
              d="M0 190c140-44 280-50 420-18 140 32 220 62 360 62 140 0 240-48 360-68 120-20 240-7 300 2v92H0v-70Z"
              fill="#dfe7db"
              opacity="0.65"
            />
            <path
              d="M0 210c160-34 320-24 480 10 160 34 240 50 360 50 120 0 220-28 330-42 110-14 210-6 270 3v59H0v-80Z"
              fill="#cfdacb"
              opacity="0.35"
            />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full flex flex-col items-center"
        >
          {/* Top micro-brand */}
          <div className="text-center w-full">
            <MiniLeafMark className="mx-auto w-8 h-8" />
            <div className="mt-2 flex items-center justify-center gap-3">
              <div className="h-px w-14 bg-[#4a7c59]/45" />
              <span className="font-serif text-[12px] tracking-[0.42em] text-[#6b7280] uppercase">
                Charles
              </span>
              <div className="h-px w-14 bg-[#4a7c59]/45" />
            </div>
            <div className="mt-4 h-10 w-px bg-[#4a7c59]/40" />
          </div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.55 }}
            className="mt-8 text-center"
          >
            <h1 className="font-serif text-[44px] sm:text-[54px] leading-[1.03] tracking-[-0.02em] text-[#1f3a2b]">
              Check in
              <br />
              before you begin.
            </h1>
            <p className="mt-4 font-serif text-[16px] sm:text-[18px] text-[#7a8b7e]">
              Scan to log today’s mood.
            </p>
          </motion.div>

          {/* Mascot */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="relative mt-10 flex items-center justify-center"
          >
            {/* Decorative leaves */}
            <Leaf className="absolute -left-7 -top-5 w-5 h-5 text-[#4a7c59]/25 rotate-12" />
            <Leaf className="absolute -right-8 -top-3 w-4 h-4 text-[#4a7c59]/18 -rotate-6" />
            <Leaf className="absolute -left-10 bottom-2 w-4 h-4 text-[#4a7c59]/14 rotate-[-18deg]" />

            <div className="relative">
              <div className="absolute inset-0 -z-10 blur-2xl rounded-full bg-[#4a7c59]/10 scale-110" />
              <img
                src={happyBonsai}
                alt="Charles the bonsai"
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain drop-shadow-[0_22px_24px_rgba(0,0,0,0.06)]"
              />
            </div>
          </motion.div>

          {/* QR block */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mt-10 w-full flex flex-col items-center"
          >
            <div className="bg-white rounded-[28px] border border-black/[0.05] shadow-[0_14px_46px_rgba(0,0,0,0.08)] p-6 sm:p-7">
              <QRCodeSVG
                value={checkInUrl}
                size={224}
                level="H"
                marginSize={1}
                fgColor="#1a1a1a"
                bgColor="#ffffff"
                style={{ display: "block" }}
              />
            </div>

            {/* URL pill */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#f7f4ef] border border-black/[0.06] px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#dfe7db] text-[#4a7c59]">
                <Globe className="w-4 h-4" />
              </span>
              <span className="font-mono text-[12px] sm:text-[13px] tracking-[0.02em] text-[#6b7280]">
                {checkInUrl}
              </span>
            </div>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-12 w-full grid grid-cols-3 gap-4 sm:gap-8 max-w-[560px]"
          >
            {[
              { label: "ROOTED", Icon: Sprout },
              { label: "CALM", Icon: Leaf },
              { label: "FOCUSED", Icon: Focus },
            ].map(({ label, Icon }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#dfe7db] text-[#4a7c59] flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="mt-3 text-[12px] tracking-[0.28em] uppercase text-[#6b7280] font-medium">
                  {label}
                </div>
              </div>
            ))}
          </motion.div>

          <div className="h-20 sm:h-24" />
        </motion.div>
      </div>

      {/* Bottom spacing — hidden on print */}
      <div className="no-print h-16" />

      {/* Print-only styles */}
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0 !important; padding: 0 !important; background: white !important; }
          .no-print { display: none !important; }
          .poster-page {
            box-shadow: none !important;
            width: 210mm !important;
            min-height: 297mm !important;
            border-radius: 0 !important;
            margin: 0 !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
