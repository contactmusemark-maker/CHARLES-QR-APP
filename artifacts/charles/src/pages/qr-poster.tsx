import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useLocation } from "wouter";
import { Printer, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import happyBonsai from "@assets/Happy_Wave_Bonsai_1779333623327.png";

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

      {/* A4 Poster */}
      <div
        ref={posterRef}
        className="poster-page bg-[#f5f2ee] shadow-2xl flex flex-col items-center justify-between"
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "18mm 16mm",
          boxSizing: "border-box",
          fontFamily: "'Georgia', 'Times New Roman', serif",
        }}
      >

        {/* Top wordmark */}
        <div className="text-center w-full">
          <div className="flex items-center justify-center gap-3 mb-1">
            <div
              style={{
                width: "36px",
                height: "3px",
                background: "#4a7c59",
                borderRadius: "2px",
              }}
            />
            <span
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "13px",
                letterSpacing: "0.3em",
                color: "#6b7280",
                textTransform: "uppercase",
                fontWeight: 400,
              }}
            >
              Charles
            </span>
            <div
              style={{
                width: "36px",
                height: "3px",
                background: "#4a7c59",
                borderRadius: "2px",
              }}
            />
          </div>
          <div
            style={{
              width: "2px",
              height: "40px",
              background: "linear-gradient(to bottom, #4a7c59, transparent)",
              margin: "10px auto 0",
            }}
          />
        </div>

        {/* Main headline */}
        <div className="text-center" style={{ margin: "24px 0 0" }}>
          <h1
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: "52px",
              fontWeight: 400,
              color: "#1a1a1a",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Check in before
            <br />
            you begin.
          </h1>
          <p
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: "18px",
              color: "#9ca3af",
              marginTop: "16px",
              letterSpacing: "0.01em",
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            Scan to log today's mood.
          </p>
        </div>

        {/* Bonsai mascot */}
        <div
          style={{
            margin: "32px 0",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <img
            src={happyBonsai}
            alt="Charles the bonsai"
            style={{
              width: "180px",
              height: "180px",
              objectFit: "contain",
            }}
          />
        </div>

        {/* QR Code */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            margin: "0 0 8px",
          }}
        >
          {/* QR frame */}
          <div
            style={{
              padding: "18px",
              background: "#ffffff",
              borderRadius: "20px",
              boxShadow: "0 2px 24px rgba(0,0,0,0.08)",
              display: "inline-block",
              border: "1.5px solid rgba(0,0,0,0.06)",
            }}
          >
            <QRCodeSVG
              value={checkInUrl}
              size={200}
              level="H"
              marginSize={1}
              fgColor="#1a1a1a"
              bgColor="#ffffff"
              style={{ display: "block" }}
            />
          </div>

          {/* URL below QR */}
          <div
            style={{
              fontFamily: "'Georgia', monospace",
              fontSize: "11px",
              color: "#9ca3af",
              letterSpacing: "0.05em",
            }}
          >
            {checkInUrl}
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: "48px",
            height: "2px",
            background: "#4a7c59",
            margin: "28px auto 24px",
            borderRadius: "2px",
          }}
        />

        {/* Tagline */}
        <div className="text-center">
          <p
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: "15px",
              letterSpacing: "0.25em",
              color: "#6b7280",
              textTransform: "uppercase",
              fontWeight: 400,
              margin: 0,
            }}
          >
            Rooted. Calm. Focused.
          </p>
        </div>

        {/* Bottom margin spacer */}
        <div style={{ flex: 1 }} />
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
            width: 100% !important;
            min-height: 100vh !important;
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
