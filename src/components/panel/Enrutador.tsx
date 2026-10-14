"use client";

// Mapa del enrutador: cada columna es una etapa y el grosor de cada banda, el número de interesados
// que pasaron por ahí. Los nombres no se muestran fijos (se cruzan); aparecen al pasar el cursor
// o al tocar un nodo, que además resalta sus bandas.
import { useEffect, useMemo, useState } from "react";
import { DESTINOS, NODOS, ruta, type Lead, type Nodo } from "@/lib/panel";

export const COLOR_NODO: Record<Nodo, string> = {
  entrada: "var(--respuesta)",
  regla_cifrato: "var(--c-grupal)",
  califica: "var(--respuesta)",
  claras: "var(--c-descubrimiento)",
  cuenta_grande: "var(--c-demo)",
  no_cuadran: "var(--c-humano)",
  aclarado: "var(--c-demo)",
  sin_responder: "var(--c-neutro)",
  revision: "var(--c-humano)",
  demo_directa: "var(--c-demo)",
  descubrimiento: "var(--c-descubrimiento)",
  sesion_grupal: "var(--c-grupal)",
  persona: "var(--c-humano)",
  sin_reunion: "var(--c-neutro)",
  cerro: "var(--c-demo)",
  seguimiento: "var(--c-descubrimiento)",
  no_cerro: "var(--c-perdido)",
};

const DESCRIPCION: Record<Nodo, string> = {
  entrada: "Llenaron el formulario de demo",
  regla_cifrato: "Asignados por las reglas actuales de Cifrato",
  califica: "Pasan a la precalificación automática",
  claras: "Señales consistentes, asignación automática",
  cuenta_grande: "Más de 200 empleados, atiende el equipo senior",
  no_cuadran: "Datos contradictorios, el sistema hace una pregunta",
  aclarado: "La respuesta resolvió la duda",
  sin_responder: "Agendaron sin responder la pregunta",
  revision: "La respuesta no resolvió la duda",
  demo_directa: `Reunión de ${DESTINOS.demo_directa.duracion}`,
  descubrimiento: `Reunión de ${DESTINOS.descubrimiento.duracion}`,
  sesion_grupal: `Reunión de ${DESTINOS.sesion_grupal.duracion}`,
  persona: "Un asesor revisa el caso antes",
  sin_reunion: "No agenda reunión",
  cerro: "El asesor anotó el cierre, pasa a bienvenida",
  seguimiento: "Siguen en conversación, con campaña según lo anotado",
  no_cerro: "Entran a la campaña según el motivo",
};

const ETAPAS = ["Llegan", "Filtro de Cifrato", "Evaluación", "Aclaración", "Reunión", "Después"];
const W = 1040;
const H = 280;
const NODO = 6;
const GAP = 16;
const ORDEN = Object.keys(NODOS) as Nodo[];
const ULTIMA = ETAPAS.length - 1;
const xDe = (etapa: number) => (etapa / ULTIMA) * (W - NODO);

export function Enrutador({ leads }: { leads: Lead[] }) {
  const [encima, setEncima] = useState<Nodo | null>(null);
  const [fijo, setFijo] = useState<Nodo | null>(null);
  const activo = encima ?? fijo;

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && setFijo(null);
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, []);

  const { nodos, bandas } = useMemo(() => {
    const rutas = leads.map(ruta);
    const cuenta = new Map<Nodo, number>();
    const enlaces = new Map<string, { de: Nodo; a: Nodo; n: number }>();
    for (const r of rutas) {
      r.forEach((n, i) => {
        cuenta.set(n, (cuenta.get(n) ?? 0) + 1);
        if (i === 0) return;
        const k = `${r[i - 1]}>${n}`;
        const e = enlaces.get(k) ?? { de: r[i - 1], a: n, n: 0 };
        e.n++;
        enlaces.set(k, e);
      });
    }

    const total = leads.length || 1;
    const columnas = ETAPAS.map((_, etapa) => ORDEN.filter((n) => NODOS[n].etapa === etapa && cuenta.has(n)));
    const escala = Math.min(...columnas.filter((c) => c.length).map((c) => (H - GAP * (c.length - 1)) / total));

    const nodos = new Map<Nodo, { x: number; y: number; h: number; n: number }>();
    for (const c of columnas) {
      const alto = c.reduce((s, n) => s + cuenta.get(n)! * escala, 0) + GAP * (c.length - 1);
      let y = (H - alto) / 2;
      for (const n of c) {
        const h = Math.max(cuenta.get(n)! * escala, 3);
        nodos.set(n, { x: xDe(NODOS[n].etapa), y, h, n: cuenta.get(n)! });
        y += h + GAP;
      }
    }

    // Las bandas salen y llegan ordenadas por la posición del otro extremo, para no cruzarse.
    const lista = [...enlaces.values()];
    const salida = new Map<Nodo, number>();
    const llegada = new Map<Nodo, number>();
    const y0 = new Map<string, number>();
    const y1 = new Map<string, number>();
    for (const e of [...lista].sort((a, b) => ORDEN.indexOf(a.de) - ORDEN.indexOf(b.de) || ORDEN.indexOf(a.a) - ORDEN.indexOf(b.a))) {
      const y = salida.get(e.de) ?? nodos.get(e.de)!.y;
      y0.set(`${e.de}>${e.a}`, y);
      salida.set(e.de, y + e.n * escala);
    }
    for (const e of [...lista].sort((a, b) => ORDEN.indexOf(a.a) - ORDEN.indexOf(b.a) || ORDEN.indexOf(a.de) - ORDEN.indexOf(b.de))) {
      const y = llegada.get(e.a) ?? nodos.get(e.a)!.y;
      y1.set(`${e.de}>${e.a}`, y);
      llegada.set(e.a, y + e.n * escala);
    }
    const bandas = lista.map((e) => {
      const k = `${e.de}>${e.a}`;
      const h = e.n * escala;
      const xa = nodos.get(e.de)!.x + NODO;
      const xb = nodos.get(e.a)!.x;
      const xm = (xa + xb) / 2;
      const a = y0.get(k)!;
      const b = y1.get(k)!;
      return { ...e, k, d: `M${xa},${a} C${xm},${a} ${xm},${b} ${xb},${b} L${xb},${b + h} C${xm},${b + h} ${xm},${a + h} ${xa},${a + h} Z` };
    });
    return { nodos, bandas };
  }, [leads]);

  const toca = (de: Nodo, a: Nodo) => !activo || activo === de || activo === a;
  const info = activo ? nodos.get(activo) : null;

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-8 [scrollbar-width:thin]">
      <div className="min-w-[820px]">
        <div className="relative mb-4 h-5 text-[12.5px] font-medium text-tenue">
          {ETAPAS.map((e, i) => (
            <span
              key={e}
              className="absolute whitespace-nowrap"
              style={{ left: `${(xDe(i) / W) * 100}%`, transform: i === 0 ? "none" : i === ULTIMA ? "translateX(-100%)" : "translateX(-50%)" }}
            >
              {e}
            </span>
          ))}
        </div>

        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible" role="img" aria-label="Mapa del enrutador: por dónde pasó cada interesado">
            <rect width={W} height={H} fill="transparent" onClick={() => setFijo(null)} />
            {bandas.map((b) => (
              <path
                key={b.k}
                d={b.d}
                fill={COLOR_NODO[b.a]}
                opacity={toca(b.de, b.a) ? (activo ? 0.5 : 0.24) : 0.05}
                className="pointer-events-none transition-opacity duration-300"
              />
            ))}
            {[...nodos.entries()].map(([k, n]) => (
              <g
                key={k}
                role="button"
                tabIndex={0}
                aria-pressed={fijo === k}
                aria-label={`${NODOS[k].nombre}: ${n.n}`}
                onMouseEnter={() => setEncima(k)}
                onMouseLeave={() => setEncima(null)}
                onFocus={() => setEncima(k)}
                onBlur={() => setEncima(null)}
                onClick={() => setFijo(fijo === k ? null : k)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setFijo(fijo === k ? null : k))}
                className="cursor-pointer outline-none"
              >
                <rect x={n.x - 14} y={n.y - 6} width={NODO + 28} height={n.h + 12} fill="transparent" />
                <rect
                  x={n.x}
                  y={n.y}
                  width={NODO}
                  height={n.h}
                  rx={3}
                  fill={COLOR_NODO[k]}
                  opacity={!activo || activo === k ? 1 : 0.3}
                  className="transition-opacity duration-300"
                />
                {fijo === k && <rect x={n.x - 3} y={n.y - 3} width={NODO + 6} height={n.h + 6} rx={5} fill="none" stroke={COLOR_NODO[k]} strokeWidth={1.5} />}
              </g>
            ))}
          </svg>

          {/* Etiqueta flotante: solo del nodo activo */}
          {activo && info && (
            <div
              key={activo}
              className="pointer-events-none absolute z-10 w-max max-w-[240px] animate-aparecer rounded-xl border border-linea bg-tarjeta/95 px-3.5 py-2.5 shadow-[0_8px_28px_-10px_rgb(3_19_34/0.25)] backdrop-blur"
              style={{
                left: `${((NODOS[activo].etapa === ULTIMA ? info.x - 14 : info.x + NODO + 14) / W) * 100}%`,
                top: `${((info.y + info.h / 2) / H) * 100}%`,
                transform: `translate(${NODOS[activo].etapa === ULTIMA ? "-100%" : "0"}, -50%)`,
              }}
            >
              <p className="flex items-baseline gap-2 text-[13.5px] font-semibold">
                <span className="h-2 w-2 shrink-0 translate-y-[-1px] self-center rounded-full" style={{ background: COLOR_NODO[activo] }} />
                {NODOS[activo].nombre}
                <span className="font-mono text-[12.5px] font-medium text-tenue">{info.n}</span>
              </p>
              <p className="mt-0.5 pl-4 text-[12.5px] leading-[17px] text-tenue">{DESCRIPCION[activo]}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
