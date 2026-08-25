"use client";

/**
 * TargetCursor — Tokyo Rentals & Concierge
 *
 * A cinematic targeting-bracket cursor. On desktop it replaces the default
 * pointer with a spinning corner-bracket reticle. When the cursor moves over
 * any element with the `cursor-target` class the corners snap and wrap the
 * element, pausing the spin. Returns to spinning on mouse-leave.
 *
 * Desktop only — returns null on mobile/touch devices.
 * SSR safe — all DOM and GSAP calls are inside useEffect.
 */

import { useEffect, useRef, useCallback, useMemo } from "react";
import { gsap } from "gsap";
import "./TargetCursor.css";

// ── Containing-block compensation ─────────────────────────────────────────────
// A `position: fixed` element is offset by any ancestor that creates a CSS
// containing block (transform, perspective, filter, will-change, contain).
// We detect and compensate so the cursor always tracks the real viewport coords.

function getContainingBlock(element: Element | null): Element | null {
  let node = element?.parentElement as Element | null;
  while (node && node !== document.documentElement) {
    const s = getComputedStyle(node);
    if (
      s.transform !== "none" ||
      s.perspective !== "none" ||
      s.filter !== "none" ||
      s.willChange.includes("transform") ||
      s.willChange.includes("perspective") ||
      s.willChange.includes("filter") ||
      /paint|layout|strict|content/.test(s.contain)
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function getContainingBlockOffset(block: Element | null): { x: number; y: number } {
  if (!block) return { x: 0, y: 0 };
  const rect = (block as HTMLElement).getBoundingClientRect();
  return {
    x: rect.left + (block as HTMLElement).clientLeft,
    y: rect.top + (block as HTMLElement).clientTop,
  };
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface TargetCursorProps {
  /** CSS selector for elements the cursor should snap to. Default: `.cursor-target` */
  targetSelector?: string;
  /** Seconds per full revolution when idle. Default: 2 */
  spinDuration?: number;
  /** Hide the native OS cursor. Default: true */
  hideDefaultCursor?: boolean;
  /** Snap-in animation duration in seconds. Default: 0.2 */
  hoverDuration?: number;
  /** Enable corner parallax tracking. Default: true */
  parallaxOn?: boolean;
  /** Idle cursor colour. Default: `#ffffff` */
  cursorColor?: string;
  /** Colour when snapped to a target. Defaults to `cursorColor`. */
  cursorColorOnTarget?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TargetCursor({
  targetSelector = ".cursor-target",
  spinDuration = 2,
  hideDefaultCursor = true,
  hoverDuration = 0.2,
  parallaxOn = true,
  cursorColor = "#ffffff",
  cursorColorOnTarget,
}: TargetCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cornersRef = useRef<NodeListOf<Element> | null>(null);
  const spinTl = useRef<gsap.core.Timeline | null>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const containingBlockRef = useRef<Element | null>(null);

  const isActiveRef = useRef(false);
  const targetCornerPositionsRef = useRef<{ x: number; y: number }[] | null>(null);
  const tickerFnRef = useRef<(() => void) | null>(null);
  const activeStrengthRef = useRef({ current: 0 });

  // Detect mobile once — stable across renders
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    const hasTouchScreen = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    const ua = (navigator.userAgent || "").toLowerCase();
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
    return (hasTouchScreen && isSmallScreen) || isMobileUA;
  }, []);

  const constants = useMemo(() => ({ borderWidth: 3, cornerSize: 12 }), []);

  const moveCursor = useCallback((x: number, y: number) => {
    if (!cursorRef.current) return;
    const { x: ox, y: oy } = getContainingBlockOffset(containingBlockRef.current);
    gsap.to(cursorRef.current, {
      x: x - ox,
      y: y - oy,
      duration: 0.1,
      ease: "power3.out",
    });
  }, []);

  // ── Main effect ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isMobile || !cursorRef.current) return;

    const originalCursor = document.body.style.cursor;
    if (hideDefaultCursor) document.body.style.cursor = "none";

    const cursor = cursorRef.current;
    cornersRef.current = cursor.querySelectorAll(".target-cursor-corner");

    containingBlockRef.current = getContainingBlock(cursor);
    const getOffset = () => getContainingBlockOffset(containingBlockRef.current);

    let activeTarget: Element | null = null;
    let currentLeaveHandler: (() => void) | null = null;
    let resumeTimeout: ReturnType<typeof setTimeout> | null = null;

    const cleanupTarget = (target: Element) => {
      if (currentLeaveHandler) target.removeEventListener("mouseleave", currentLeaveHandler);
      currentLeaveHandler = null;
    };

    // Centre the cursor in viewport on mount
    const initialOffset = getOffset();
    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2 - initialOffset.x,
      y: window.innerHeight / 2 - initialOffset.y,
    });

    // Spin timeline factory
    const createSpinTimeline = () => {
      spinTl.current?.kill();
      spinTl.current = gsap
        .timeline({ repeat: -1 })
        .to(cursor, { rotation: "+=360", duration: spinDuration, ease: "none" });
    };
    createSpinTimeline();

    // Parallax ticker — runs every frame while snapped to a target
    const tickerFn = () => {
      if (!targetCornerPositionsRef.current || !cursorRef.current || !cornersRef.current) return;
      const strength = activeStrengthRef.current.current;
      if (strength === 0) return;

      const cx = gsap.getProperty(cursorRef.current, "x") as number;
      const cy = gsap.getProperty(cursorRef.current, "y") as number;

      Array.from(cornersRef.current).forEach((corner, i) => {
        const currentX = gsap.getProperty(corner, "x") as number;
        const currentY = gsap.getProperty(corner, "y") as number;
        const targetX = targetCornerPositionsRef.current![i].x - cx;
        const targetY = targetCornerPositionsRef.current![i].y - cy;
        const finalX = currentX + (targetX - currentX) * strength;
        const finalY = currentY + (targetY - currentY) * strength;
        const dur = strength >= 0.99 ? (parallaxOn ? 0.2 : 0) : 0.05;
        gsap.to(corner, {
          x: finalX,
          y: finalY,
          duration: dur,
          ease: dur === 0 ? "none" : "power1.out",
          overwrite: "auto",
        });
      });
    };
    tickerFnRef.current = tickerFn;

    // ── Event handlers ────────────────────────────────────────────────────────

    const moveHandler = (e: MouseEvent) => moveCursor(e.clientX, e.clientY);
    window.addEventListener("mousemove", moveHandler);

    const scrollHandler = () => {
      if (!activeTarget || !cursorRef.current) return;
      const { x: ox, y: oy } = getOffset();
      const mx = (gsap.getProperty(cursorRef.current, "x") as number) + ox;
      const my = (gsap.getProperty(cursorRef.current, "y") as number) + oy;
      const el = document.elementFromPoint(mx, my);
      const stillOver =
        el && (el === activeTarget || el.closest(targetSelector) === activeTarget);
      if (!stillOver && currentLeaveHandler) currentLeaveHandler();
    };
    window.addEventListener("scroll", scrollHandler, { passive: true });

    const mouseDownHandler = () => {
      if (!dotRef.current) return;
      gsap.to(dotRef.current, { scale: 0.7, duration: 0.3 });
      gsap.to(cursorRef.current, { scale: 0.9, duration: 0.2 });
    };
    const mouseUpHandler = () => {
      if (!dotRef.current) return;
      gsap.to(dotRef.current, { scale: 1, duration: 0.3 });
      gsap.to(cursorRef.current, { scale: 1, duration: 0.2 });
    };
    window.addEventListener("mousedown", mouseDownHandler);
    window.addEventListener("mouseup", mouseUpHandler);

    // Enter: snap corners around target element
    const enterHandler = (e: Event) => {
      const directTarget = e.target as Element;
      let current: Element | null = directTarget;
      let target: Element | null = null;
      while (current && current !== document.body) {
        if (current.matches(targetSelector)) { target = current; break; }
        current = current.parentElement;
      }
      if (!target || !cursorRef.current || !cornersRef.current) return;
      if (activeTarget === target) return;
      if (activeTarget) cleanupTarget(activeTarget);
      if (resumeTimeout) { clearTimeout(resumeTimeout); resumeTimeout = null; }

      activeTarget = target;
      const corners = Array.from(cornersRef.current);
      corners.forEach(c => gsap.killTweensOf(c, "x,y"));

      gsap.killTweensOf(cursorRef.current, "rotation");
      spinTl.current?.pause();
      gsap.set(cursorRef.current, { rotation: 0 });

      if (cursorColorOnTarget) {
        gsap.to(corners, { borderColor: cursorColorOnTarget, duration: 0.15, ease: "power2.out" });
        if (dotRef.current) gsap.to(dotRef.current, { backgroundColor: cursorColorOnTarget, duration: 0.15, ease: "power2.out" });
      }

      const rect = target.getBoundingClientRect();
      const { borderWidth, cornerSize } = constants;
      const { x: ox, y: oy } = getOffset();
      const cx = gsap.getProperty(cursorRef.current, "x") as number;
      const cy = gsap.getProperty(cursorRef.current, "y") as number;

      targetCornerPositionsRef.current = [
        { x: rect.left - borderWidth - ox,               y: rect.top - borderWidth - oy },
        { x: rect.right + borderWidth - cornerSize - ox, y: rect.top - borderWidth - oy },
        { x: rect.right + borderWidth - cornerSize - ox, y: rect.bottom + borderWidth - cornerSize - oy },
        { x: rect.left - borderWidth - ox,               y: rect.bottom + borderWidth - cornerSize - oy },
      ];

      isActiveRef.current = true;
      gsap.ticker.add(tickerFnRef.current!);
      gsap.to(activeStrengthRef.current, { current: 1, duration: hoverDuration, ease: "power2.out" });

      corners.forEach((corner, i) => {
        gsap.to(corner, {
          x: targetCornerPositionsRef.current![i].x - cx,
          y: targetCornerPositionsRef.current![i].y - cy,
          duration: 0.2,
          ease: "power2.out",
        });
      });

      // Leave: reset corners to idle positions and resume spin
      const leaveHandler = () => {
        gsap.ticker.remove(tickerFnRef.current!);
        isActiveRef.current = false;
        targetCornerPositionsRef.current = null;
        gsap.set(activeStrengthRef.current, { current: 0, overwrite: true });
        activeTarget = null;

        if (cursorColorOnTarget && cornersRef.current) {
          gsap.to(Array.from(cornersRef.current), { borderColor: cursorColor, duration: 0.15, ease: "power2.out" });
          if (dotRef.current) gsap.to(dotRef.current, { backgroundColor: cursorColor, duration: 0.15, ease: "power2.out" });
        }

        if (cornersRef.current) {
          const cs = Array.from(cornersRef.current);
          gsap.killTweensOf(cs, "x,y");
          const { cornerSize } = constants;
          const positions = [
            { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
            { x:  cornerSize * 0.5, y: -cornerSize * 1.5 },
            { x:  cornerSize * 0.5, y:  cornerSize * 0.5 },
            { x: -cornerSize * 1.5, y:  cornerSize * 0.5 },
          ];
          const tl = gsap.timeline();
          cs.forEach((c, i) => tl.to(c, { x: positions[i].x, y: positions[i].y, duration: 0.3, ease: "power3.out" }, 0));
        }

        resumeTimeout = setTimeout(() => {
          if (!activeTarget && cursorRef.current && spinTl.current) {
            const currentRot = gsap.getProperty(cursorRef.current, "rotation") as number;
            const normalized = currentRot % 360;
            spinTl.current.kill();
            spinTl.current = gsap.timeline({ repeat: -1 }).to(cursorRef.current, { rotation: "+=360", duration: spinDuration, ease: "none" });
            gsap.to(cursorRef.current, {
              rotation: normalized + 360,
              duration: spinDuration * (1 - normalized / 360),
              ease: "none",
              onComplete: () => spinTl.current?.restart(),
            });
          }
          resumeTimeout = null;
        }, 50);

        cleanupTarget(target!);
      };

      currentLeaveHandler = leaveHandler;
      target.addEventListener("mouseleave", leaveHandler);
    };

    window.addEventListener("mouseover", enterHandler, { passive: true });

    const resizeHandler = () => { containingBlockRef.current = getContainingBlock(cursor); };
    window.addEventListener("resize", resizeHandler);

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      if (tickerFnRef.current) gsap.ticker.remove(tickerFnRef.current);
      window.removeEventListener("mousemove", moveHandler);
      window.removeEventListener("mouseover", enterHandler);
      window.removeEventListener("scroll", scrollHandler);
      window.removeEventListener("resize", resizeHandler);
      window.removeEventListener("mousedown", mouseDownHandler);
      window.removeEventListener("mouseup", mouseUpHandler);
      if (activeTarget) cleanupTarget(activeTarget);
      spinTl.current?.kill();
      document.body.style.cursor = originalCursor;
      isActiveRef.current = false;
      targetCornerPositionsRef.current = null;
      activeStrengthRef.current.current = 0;
    };
  }, [targetSelector, spinDuration, moveCursor, constants, hideDefaultCursor, isMobile, hoverDuration, parallaxOn, cursorColor, cursorColorOnTarget]);

  // Keep spin duration in sync if prop changes
  useEffect(() => {
    if (isMobile || !cursorRef.current || !spinTl.current) return;
    if (spinTl.current.isActive()) {
      spinTl.current.kill();
      spinTl.current = gsap.timeline({ repeat: -1 }).to(cursorRef.current, { rotation: "+=360", duration: spinDuration, ease: "none" });
    }
  }, [spinDuration, isMobile]);

  if (isMobile) return null;

  return (
    <div ref={cursorRef} className="target-cursor-wrapper">
      <div ref={dotRef} className="target-cursor-dot" style={{ backgroundColor: cursorColor }} />
      <div className="target-cursor-corner corner-tl" style={{ borderColor: cursorColor }} />
      <div className="target-cursor-corner corner-tr" style={{ borderColor: cursorColor }} />
      <div className="target-cursor-corner corner-br" style={{ borderColor: cursorColor }} />
      <div className="target-cursor-corner corner-bl" style={{ borderColor: cursorColor }} />
    </div>
  );
}
