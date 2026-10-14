"use client";

import { useEffect, useRef } from "react";
import "./ilustracion.css";
import { SVG_HERO } from "./ilustracion-svg";

// SVG estático y propio del proyecto, por eso se inserta como HTML.
export function IlustracionCifrato({ className = "" }: { className?: string }) {
  const caja = useRef<HTMLDivElement>(null);

  // La luz que recorre cada conexión necesita el largo real del trazo (--len),
  // igual que en cifrato.ai, donde también se calcula al cargar la página.
  useEffect(() => {
    caja.current?.querySelectorAll<SVGPathElement>("path.fx").forEach((trazo) => {
      trazo.style.setProperty("--len", `${trazo.getTotalLength().toFixed(1)}px`);
    });
  }, []);

  return (
    <div ref={caja} className={`vc-illustration ${className}`}>
      <div className="stage" dangerouslySetInnerHTML={{ __html: SVG_HERO }} />
    </div>
  );
}
