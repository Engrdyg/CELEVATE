"use client";

import { useEffect, useState, type RefObject } from "react";

/** True once the element has come within `margin` of the viewport (latches). */
export function useInView(ref: RefObject<Element | null>, margin = "200px") {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === "undefined") {
      const t = window.setTimeout(() => setSeen(true), 0);
      return () => window.clearTimeout(t);
    }
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setSeen(true), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, seen]);
  return seen;
}
