import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type PixelMascotProps = {
  className?: string;
  size?: number;
  tone?: "auto" | "light" | "dark";
};

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function PixelMascot({ className, size = 28, tone = "auto" }: PixelMascotProps) {
  // Light pseudo-random blink: vary the sprite animation delay so the blink frame feels less predictable.
  const [blinkJitterMs, setBlinkJitterMs] = useState(0);

  useEffect(() => {
    setBlinkJitterMs(randInt(0, 900));
  }, []);

  const color =
    tone === "dark" ? "#e7efe5" : tone === "light" ? "#1f3a2b" : "currentColor";

  const wrapStyle = {
    width: size,
    height: size,
    imageRendering: "pixelated",
  } as React.CSSProperties;

  const svgStyle = {
    shapeRendering: "crispEdges",
    width: size,
    height: size,
    color,
  } as React.CSSProperties;

  return (
    <span className={cn("pm-wrap inline-flex items-center justify-center select-none", className)} style={wrapStyle} aria-hidden="true">
      <svg viewBox="0 0 16 16" style={svgStyle}>
        <defs>
          <clipPath id="pm-clip">
            <rect x="0" y="0" width="16" height="16" />
          </clipPath>
        </defs>

        {/* Sprite strip: 4 frames side-by-side (16px each). */}
        <g
          clipPath="url(#pm-clip)"
          style={
            {
              transform: "translateX(0px)",
              transformOrigin: "0 0",
              animation: `pm-idle 1s steps(4) infinite`,
              animationDelay: `-${blinkJitterMs}ms`,
            } as React.CSSProperties
          }
        >
          <g>
            {/* FRAME 1 (x + 0) */}
            <PixelFrame x={0} variant="center" eyes="open" />
            {/* FRAME 2 (x + 16) */}
            <PixelFrame x={16} variant="right" eyes="open" />
            {/* FRAME 3 (x + 32) — blink */}
            <PixelFrame x={32} variant="center" eyes="blink" />
            {/* FRAME 4 (x + 48) */}
            <PixelFrame x={48} variant="left" eyes="open" />
          </g>
        </g>

        <style>{`
          @keyframes pm-idle { to { transform: translateX(-48px); } }

          @keyframes pm-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
          }
          .pm-wrap svg { animation: pm-float 3.2s ease-in-out infinite; }

          .pm-wrap:hover g[clip-path="url(#pm-clip)"] {
            animation-duration: 0.8s;
          }
        `}</style>
      </svg>
    </span>
  );
}

function PixelFrame(props: { x: number; variant: "left" | "center" | "right"; eyes: "open" | "blink" }) {
  const ox = props.x;
  const fill = "currentColor";

  // cup + face + sprout (tiny monochrome)
  const cup = (
    <>
      <rect x={ox + 4} y={9} width={8} height={5} fill={fill} opacity="0.92" />
      <rect x={ox + 5} y={8} width={6} height={1} fill={fill} opacity="0.72" />
      {/* mouth */}
      <rect x={ox + 7} y={12} width={2} height={1} fill={fill} opacity="0.78" />
    </>
  );

  const eyes =
    props.eyes === "blink" ? (
      <>
        <rect x={ox + 6} y={11} width={1} height={0.5} fill={fill} opacity="0.7" />
        <rect x={ox + 9} y={11} width={1} height={0.5} fill={fill} opacity="0.7" />
      </>
    ) : (
      <>
        <rect x={ox + 6} y={11} width={1} height={1} fill={fill} opacity="0.85" />
        <rect x={ox + 9} y={11} width={1} height={1} fill={fill} opacity="0.85" />
      </>
    );

  const sprout =
    props.variant === "right" ? (
      <>
        <rect x={ox + 9} y={6} width={1} height={3} fill={fill} opacity="0.9" />
        <rect x={ox + 8} y={5} width={1} height={1} fill={fill} opacity="0.9" />
        <rect x={ox + 10} y={5} width={1} height={1} fill={fill} opacity="0.9" />
        <rect x={ox + 7} y={4} width={2} height={1} fill={fill} opacity="0.9" />
        <rect x={ox + 10} y={4} width={2} height={1} fill={fill} opacity="0.9" />
      </>
    ) : props.variant === "left" ? (
      <>
        <rect x={ox + 7} y={6} width={1} height={3} fill={fill} opacity="0.9" />
        <rect x={ox + 6} y={5} width={1} height={1} fill={fill} opacity="0.9" />
        <rect x={ox + 8} y={5} width={1} height={1} fill={fill} opacity="0.9" />
        <rect x={ox + 5} y={4} width={2} height={1} fill={fill} opacity="0.9" />
        <rect x={ox + 8} y={4} width={2} height={1} fill={fill} opacity="0.9" />
      </>
    ) : (
      <>
        <rect x={ox + 8} y={6} width={1} height={3} fill={fill} opacity="0.9" />
        <rect x={ox + 7} y={5} width={1} height={1} fill={fill} opacity="0.9" />
        <rect x={ox + 9} y={5} width={1} height={1} fill={fill} opacity="0.9" />
        <rect x={ox + 6} y={4} width={2} height={1} fill={fill} opacity="0.9" />
        <rect x={ox + 9} y={4} width={2} height={1} fill={fill} opacity="0.9" />
      </>
    );

  return (
    <g>
      {cup}
      {eyes}
      {sprout}
    </g>
  );
}

