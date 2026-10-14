"use client";

// Piezas visuales del panel. Todo se lee de un vistazo: color + palabra, nunca solo color.
import { useState, useTransition, type ReactNode } from "react";
import {
  Building2,
  CalendarDays,
  Check,
  CircleAlert,
  CircleCheck,
  Clock,
  FileText,
  Filter,
  Gauge,
  MessageCircle,
  Shuffle,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { auditar } from "@/app/panel/acciones";
import type { Camino } from "@/lib/puntaje";
import { DESTINOS, ESTADOS, hora, type Destino, type EstadoExcepcion, type Lead, type Paso } from "@/lib/panel";

export function ChipDestino({ d, tamano = "md" }: { d: Destino; tamano?: "sm" | "md" }) {
  return (
    <span
      className={
        "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-respuesta/[0.05] font-semibold text-respuesta " +
        (tamano === "sm" ? "px-2 py-0.5 text-[12px]" : "px-2.5 py-1 text-[13px]")
      }
    >
      <span className="h-2 w-2 rounded-full" style={{ background: DESTINOS[d].color }} />
      {DESTINOS[d].nombre}
    </span>
  );
}

const TONOS = {
  ambar: "bg-c-humano/[0.13] text-[rgb(146_84_8)]",
  verde: "bg-primario/[0.13] text-[rgb(18_120_56)]",
  gris: "bg-respuesta/[0.06] text-tenue",
};

export function Estado({ e }: { e: EstadoExcepcion }) {
  const { nombre, tono } = ESTADOS[e];
  return (
    <span className={"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-semibold " + TONOS[tono]}>
      {tono === "verde" ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {nombre}
    </span>
  );
}

export function Titulo({ children, derecha }: { children: ReactNode; derecha?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h4 className="text-[13px] font-semibold text-tenue">{children}</h4>
      {derecha}
    </div>
  );
}

// Recorrido paso a paso, como la traza de un sistema: qué hizo, en qué orden y a qué hora.
const ICONOS: Record<Paso["icono"], LucideIcon> = {
  formulario: FileText,
  regla: Filter,
  registro: Building2,
  senales: Gauge,
  alerta: CircleAlert,
  agenda: CalendarDays,
  pregunta: MessageCircle,
  respuesta: UserRound,
  decision: Shuffle,
  humano: UserRound,
};

export function Recorrido({ pasos }: { pasos: Paso[] }) {
  return (
    <ol className="relative">
      {pasos.map((p, i) => {
        const Icono = ICONOS[p.icono];
        const alerta = p.icono === "alerta" || p.icono === "humano";
        return (
          <li key={i} className="relative grid grid-cols-[28px_1fr_auto] gap-x-3 pb-5 last:pb-0">
            {i < pasos.length - 1 && <span className="absolute left-[13.5px] top-7 bottom-0 w-px bg-linea" />}
            <span
              className={
                "relative z-10 flex h-7 w-7 items-center justify-center rounded-full border " +
                (alerta ? "border-c-humano/30 bg-c-humano/[0.1] text-[rgb(146_84_8)]" : "border-linea bg-tarjeta text-tenue")
              }
            >
              <Icono className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <div className="min-w-0 pt-1">
              <p className="text-[14px] font-semibold leading-[20px]">{p.titulo}</p>
              {p.detalle && (p.tono ? <Nota tono={p.tono}>{p.detalle}</Nota> : <p className="mt-0.5 text-[13px] leading-[19px] text-tenue">{p.detalle}</p>)}
            </div>
            <span className="pt-1.5 font-mono text-[11.5px] text-tenue">{hora(p.cuando)}</span>
          </li>
        );
      })}
    </ol>
  );
}

// Una conclusión del sistema con su ícono: resuelto (verde), requiere revisión (ámbar) o en espera.
const TONO_NOTA = {
  ok: { Icono: CircleCheck, clase: "text-primario-oscuro" },
  alerta: { Icono: CircleAlert, clase: "text-[rgb(196_118_10)]" },
  espera: { Icono: Clock, clase: "text-tenue" },
};

export function Nota({ tono, children, grande }: { tono: keyof typeof TONO_NOTA; children: ReactNode; grande?: boolean }) {
  const { Icono, clase } = TONO_NOTA[tono];
  return (
    <p className={"mt-1 flex items-start gap-2 " + (grande ? "text-[15px] font-semibold leading-[22px] text-respuesta" : "text-[13px] font-medium leading-[19px] text-respuesta/80")}>
      <Icono className={"shrink-0 " + clase + (grande ? " mt-[3px] h-[17px] w-[17px]" : " mt-[2px] h-[15px] w-[15px]")} strokeWidth={2.2} />
      <span>{children}</span>
    </p>
  );
}

export function tonoDe(e: EstadoExcepcion | null): keyof typeof TONO_NOTA {
  return e === "abierta" ? "alerta" : e === "sin_responder" ? "espera" : "ok";
}

// Cada señal con sus puntos, y dónde cae el total frente a los cortes de cada reunión.
export function Senales({ lead: l }: { lead: Lead }) {
  if (l.puntaje === null) return null;
  const MAX = 14;
  const x = (Math.min(Math.max(l.puntaje, 0), MAX) / MAX) * 100;
  const zonas = [
    { hasta: 5, nombre: "Demo grupal", color: "var(--c-grupal)" },
    { hasta: 9, nombre: "Descubrimiento", color: "var(--c-descubrimiento)" },
    { hasta: MAX, nombre: "Demo directa", color: "var(--c-demo)" },
  ];
  return (
    <div>
      <div className="relative pt-1">
        <div className="flex h-2 gap-[3px]">
          {zonas.map((z, i) => (
            <span key={z.nombre} className="h-full rounded-full opacity-30" style={{ width: `${((z.hasta - (zonas[i - 1]?.hasta ?? 0)) / MAX) * 100}%`, background: z.color }} />
          ))}
        </div>
        <span className="absolute top-[8px] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-tarjeta bg-respuesta shadow-[0_0_0_1px_var(--borde)]" style={{ left: `${x}%` }} />
      </div>
      <div className="mt-2 flex text-[11.5px] text-tenue">
        {zonas.map((z, i) => (
          <span key={z.nombre} style={{ width: `${((z.hasta - (zonas[i - 1]?.hasta ?? 0)) / MAX) * 100}%` }}>
            {z.nombre}
          </span>
        ))}
      </div>
      <ul className="mt-4 flex flex-col">
        {l.detalle_puntaje.senales.map((s, i) => (
          <li key={i} className="flex items-center justify-between gap-4 border-t border-linea py-2.5 first:border-t-0">
            <span className="min-w-0">
              <span className="block text-[12.5px] text-tenue">{s.senal}</span>
              <span className="block truncate text-[14px] font-semibold">{s.valor}</span>
            </span>
            <span
              className={
                "shrink-0 rounded-md px-2 py-0.5 font-mono text-[12.5px] font-semibold " +
                (s.puntos > 0 ? "bg-respuesta/[0.06]" : s.puntos < 0 ? "bg-error/10 text-error" : "text-tenue")
              }
            >
              {s.puntos > 0 ? `+${s.puntos}` : s.puntos}
            </span>
          </li>
        ))}
        <li className="flex items-center justify-between border-t border-borde pt-2.5 text-[14px] font-bold">
          Total
          <span className="font-mono text-[13px]">{l.puntaje} puntos</span>
        </li>
      </ul>
    </div>
  );
}

// Revisión humana: aprobar lo que propuso el sistema o cambiarlo. El cambio queda registrado.
export function Revisar({ lead: l, compacto }: { lead: Lead; compacto?: boolean }) {
  const [pendiente, iniciar] = useTransition();
  const [cambiando, setCambiando] = useState(false);
  const opciones = (["demo_directa", "descubrimiento", "sesion_grupal"] as Camino[]).filter((c) => c !== l.camino);

  if (cambiando) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13px] text-tenue">Enviar a</span>
        {opciones.map((c) => (
          <button
            key={c}
            type="button"
            disabled={pendiente}
            onClick={(e) => {
              e.stopPropagation();
              iniciar(() => auditar(l.id, c));
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-borde bg-tarjeta px-3 py-1.5 text-[13px] font-semibold outline-none transition-colors hover:border-borde-fuerte focus-visible:ring-2 focus-visible:ring-respuesta/20 disabled:opacity-50"
          >
            <span className="h-2 w-2 rounded-full" style={{ background: DESTINOS[c as Destino].color }} />
            {DESTINOS[c as Destino].nombre}
          </button>
        ))}
        <button type="button" onClick={(e) => (e.stopPropagation(), setCambiando(false))} className="px-1 text-[13px] font-semibold text-tenue hover:text-respuesta">
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pendiente}
        onClick={(e) => {
          e.stopPropagation();
          iniciar(() => auditar(l.id));
        }}
        className={
          "inline-flex items-center gap-1.5 rounded-lg bg-respuesta font-semibold text-white outline-none transition-opacity hover:opacity-90 focus-visible:ring-4 focus-visible:ring-respuesta/20 disabled:opacity-50 " +
          (compacto ? "h-8 px-3 text-[13px]" : "h-9 px-4 text-[13.5px]")
        }
      >
        <Check className="h-4 w-4" strokeWidth={2.4} />
        {pendiente ? "Guardando…" : `Dejar con un asesor`}
      </button>
      <button
        type="button"
        disabled={pendiente}
        onClick={(e) => (e.stopPropagation(), setCambiando(true))}
        className={
          "rounded-lg border border-borde bg-tarjeta font-semibold outline-none transition-colors hover:border-borde-fuerte focus-visible:ring-4 focus-visible:ring-respuesta/10 disabled:opacity-50 " +
          (compacto ? "h-8 px-3 text-[13px]" : "h-9 px-4 text-[13.5px]")
        }
      >
        Cambiar reunión
      </button>
    </div>
  );
}
