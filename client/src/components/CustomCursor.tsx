"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/** True on laptops/desktops with mouse or trackpad — false on phones and touch-primary tablets */
const LAPTOP_CURSOR_QUERY = "(hover: hover) and (pointer: fine)";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const mq = window.matchMedia(LAPTOP_CURSOR_QUERY);
    const update = () => {
      const on = mq.matches;
      setEnabled(on);
      document.documentElement.classList.toggle("custom-cursor", on);
    };
    update();
    mq.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      document.documentElement.classList.remove("custom-cursor");
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const updateMousePosition = (e: MouseEvent) => {
      mouseX.set(e.clientX - 16);
      mouseY.set(e.clientY - 16);
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(
        target.tagName.toLowerCase() === "button" ||
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "input" ||
        !!target.closest("button") ||
        !!target.closest("a")
      );
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseout", handleMouseLeave);
    window.addEventListener("mouseover", handleMouseEnter);
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseout", handleMouseLeave);
      window.removeEventListener("mouseover", handleMouseEnter);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [enabled, mouseX, mouseY]);

  const dotX = useTransform(mouseX, (v: number) => v + 12);
  const dotY = useTransform(mouseY, (v: number) => v + 12);
  const smoothDotX = useSpring(dotX, { damping: 40, stiffness: 600 });
  const smoothDotY = useSpring(dotY, { damping: 40, stiffness: 600 });

  if (!enabled || !isVisible) return null;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-blue-400 pointer-events-none z-[100] mix-blend-difference shadow-[0_0_15px_rgba(96,165,250,0.5)]"
        style={{ x: cursorX, y: cursorY }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? "rgba(96, 165, 250, 0.2)" : "rgba(96, 165, 250, 0)",
          borderColor: isHovering ? "rgba(96, 165, 250, 0)" : "rgba(96, 165, 250, 1)",
        }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-blue-500 rounded-full pointer-events-none z-[100] shadow-[0_0_10px_rgba(59,130,246,0.8)]"
        style={{ x: smoothDotX, y: smoothDotY }}
      />
    </>
  );
}
