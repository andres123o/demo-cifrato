"use client";

// Excepciones: cada caso que no era simple, qué detectó el sistema, qué preguntó y cómo quedó.
// Decisiones: el registro de todos los interesados, con su recorrido y la razón en una línea.
import { ChevronRight, Sparkles, X } from "lucide-react";
import { ChipDestino, Estado, Nota, Revisar, tonoDe } from "./piezas";
import {
  DESTINOS,
  NODOS,
  destino,
  estadoExcepcion,
  haceCuanto,
  puntajeSin,
  razon,
  ruta,
  type Destino,
  type EstadoExcepcion,
  type Lead,
  type Nodo,
} from "@/lib/panel";

export type FiltroExcepciones = EstadoExcepcion | "revisadas" | "todas";

const FILTROS: { k: FiltroExcepciones; nombre: string; color: string; incluye: EstadoExcepcion[] }[] = [
  { k: "abierta", nombre: "Esperando revisión", color: "var(--c-humano)", incluye: ["abierta"] },
  { k: "sin_responder", nombre: "Sin responder", color: "var(--c-neutro)", incluye: ["sin_responder"] },
  { k: "resuelta", nombre: "Resueltas solas", color: "var(--c-demo)", incluye: ["resuelta"] },
  { k: "revisadas", nombre: "Revisadas por el equipo", color: "var(--c-descubrimiento)", incluye: ["aprobada", "corregida"] },
  { k: "todas", nombre: "Todas", color: "var(--respuesta)", incluye: ["abierta", "sin_responder", "resuelta", "aprobada", "corregida"] },
];

// Los datos concretos que chocaban, en pocas palabras.
function hechos(l: Lead): string[] {
  const d = l.detalle_puntaje;
  const out: string[] = [];
  for (const m of d.excepciones) {
    if (m.startsWith("Cuenta grande")) out.push(`${d.registro?.empleados} empleados`, `${puntajeSin(l)} puntos`);
    else if (m.startsWith("Empresa individual con varios")) out.push("Empresa individual", `${l.erps.length} ERP`);
    else if (m.startsWith("Más de 800")) out.push("Más de 800 facturas", `${d.registro?.empleados} empleados`);
    else if (m.startsWith("Dice ser firma")) out.push("Dice ser firma contable", `Registro: ${d.registro?.actividad.split(" · ")[1].toLowerCase()}`);
    else if (m.startsWith("No aparece")) out.push("No está en el registro", "Correo gratuito", `${l.rango_facturas.toLowerCase()} facturas`);
  }
  return [...new Set(out)];
}

export function Excepciones({
  leads,
  ahora,
  filtro,
  onFiltro,
  onAbrir,
}: {
  leads: Lead[];
  ahora: number;
  filtro: FiltroExcepciones;
  onFiltro: (f: FiltroExcepciones) => void;
  onAbrir: (id: string) => void;
}) {
  const todas = leads.filter((l) => estadoExcepcion(l));
  const incluye = FILTROS.find((f) => f.k === filtro)!.incluye;
  const visibles = todas.filter((l) => incluye.includes(estadoExcepcion(l)!));

  return (
    <div>
      <Encabezado
        titulo="Casos especiales"
      />
      <Segmentos
        opciones={FILTROS.map((f) => ({ k: f.k, nombre: f.nombre, color: f.color, n: todas.filter((l) => f.incluye.includes(estadoExcepcion(l)!)).length }))}
        activo={filtro}
        onCambiar={onFiltro}
        resaltar="abierta"
      />

      {visibles.length === 0 ? (
        <Vacio texto={filtro === "abierta" ? "Nada esperando revisión. El sistema resolvió todo lo demás." : "No hay casos en este grupo."} />
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {visibles.map((l) => (
            <TarjetaExcepcion key={l.id} lead={l} ahora={ahora} onAbrir={() => onAbrir(l.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function TarjetaExcepcion({ lead: l, ahora, onAbrir }: { lead: Lead; ahora: number; onAbrir: () => void }) {
  const d = l.detalle_puntaje;
  const estado = estadoExcepcion(l)!;
  const motivos = d.excepciones;
  const conversacion = d.aclaracion ?? [];

  return (
    <article
      onClick={onAbrir}
      className={
        "group flex cursor-pointer flex-col rounded-2xl border bg-tarjeta p-5 transition-[border-color,box-shadow] hover:shadow-[0_8px_30px_-12px_rgb(3_19_34/0.18)] sm:p-6 " +
        (estado === "abierta" ? "border-c-humano/40" : "border-linea hover:border-borde")
      }
    >
      <div className="flex items-center justify-between gap-3">
        <Estado e={estado} />
        <span className="text-[12.5px] text-tenue">{haceCuanto(l.creado, ahora)}</span>
      </div>

      <h3 className="mt-4 text-[18px] font-bold leading-tight tracking-[-0.015em]">
        <button type="button" onClick={(e) => (e.stopPropagation(), onAbrir())} className="text-left outline-none focus-visible:underline">
          {l.nombre_empresa}
        </button>
      </h3>
      <p className="mt-1 text-[14px] font-medium text-tenue">{motivos.join(" · ")}</p>

      <ul className="mt-4 flex flex-wrap gap-1.5">
        {hechos(l).map((h) => (
          <li key={h} className="rounded-md border border-linea px-2 py-1 text-[12.5px] font-semibold">
            {h}
          </li>
        ))}
      </ul>

      {(conversacion.length > 0 || d.dudas?.length) && (
        <div className="mt-5 flex flex-col gap-2.5">
          {conversacion.map((c) => (
            <div key={c.pregunta} className="flex flex-col gap-1.5">
              <Burbuja lado="sistema">{c.pregunta}</Burbuja>
              <Burbuja lado="persona">{c.respuesta}</Burbuja>
            </div>
          ))}
          {d.dudas?.map((x) => (
            <div key={x.id} className="flex flex-col gap-1.5">
              <Burbuja lado="sistema">{x.pregunta}</Burbuja>
              <p className="self-end pr-1 text-[12.5px] italic text-tenue">Aún sin respuesta</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto pt-5">
        <div className="flex items-center justify-between gap-3 border-t border-linea pt-4">
          <span className="flex min-w-0 items-center gap-2 text-[13px] text-tenue">
            Quedó en <ChipDestino d={destino(l)} tamano="sm" />
          </span>
          <span className="flex items-center gap-0.5 text-[13px] font-semibold text-tenue transition-colors group-hover:text-respuesta">
            Ver recorrido <ChevronRight className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-2">
          <Nota tono={tonoDe(estado)}>{razon(l)}</Nota>
        </div>
        {estado === "abierta" && (
          <div className="mt-4">
            <Revisar lead={l} compacto />
          </div>
        )}
      </div>
    </article>
  );
}

function Burbuja({ lado, children }: { lado: "sistema" | "persona"; children: string }) {
  if (lado === "sistema")
    return (
      <p className="flex max-w-[90%] items-start gap-2 self-start rounded-2xl rounded-tl-md bg-fondo px-3.5 py-2.5 text-[13.5px] leading-[19px]">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primario-oscuro" />
        {children}
      </p>
    );
  return <p className="max-w-[80%] self-end rounded-2xl rounded-tr-md bg-respuesta px-3.5 py-2.5 text-[13.5px] font-semibold leading-[19px] text-white">{children}</p>;
}

// ── Decisiones ────────────────────────────────────────────────────────

export function Decisiones({
  leads,
  ahora,
  nodo,
  onNodo,
  onAbrir,
}: {
  leads: Lead[];
  ahora: number;
  nodo: Nodo | null;
  onNodo: (n: Nodo | null) => void;
  onAbrir: (id: string) => void;
}) {
  const visibles = nodo ? leads.filter((l) => ruta(l).includes(nodo)) : leads;
  const destinos = (Object.keys(DESTINOS) as Destino[]).filter((d) => leads.some((l) => destino(l) === d));

  return (
    <div>
      <Encabezado titulo="Decisiones" texto="Cada interesado, por dónde pasó y por qué quedó en esa reunión. Toca uno para ver su recorrido completo." />

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Pildora activa={!nodo} onClick={() => onNodo(null)}>
          Todos <span className="font-mono text-[12px] opacity-60">{leads.length}</span>
        </Pildora>
        {destinos.map((d) => (
          <Pildora key={d} activa={nodo === d} onClick={() => onNodo(d)}>
            <span className="h-2 w-2 rounded-full" style={{ background: DESTINOS[d].color }} />
            {DESTINOS[d].nombre} <span className="font-mono text-[12px] opacity-60">{leads.filter((l) => destino(l) === d).length}</span>
          </Pildora>
        ))}
        {nodo && !(nodo in DESTINOS) && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-respuesta px-3 py-1.5 text-[13px] font-semibold text-white">
            Pasaron por: {NODOS[nodo].nombre}
            <button type="button" aria-label="Quitar filtro" onClick={() => onNodo(null)} className="-mr-1 rounded-full p-0.5 hover:bg-white/15">
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-linea bg-tarjeta">
        <div className="hidden grid-cols-[minmax(0,1.1fr)_minmax(0,1.5fr)_minmax(0,1.4fr)_96px] gap-6 border-b border-linea px-6 py-3 text-[12.5px] font-semibold text-tenue lg:grid">
          <span>Empresa</span>
          <span>Recorrido</span>
          <span>Por qué</span>
          <span className="text-right">Llegó</span>
        </div>
        {visibles.length === 0 && <Vacio texto="Nadie pasó por esta etapa." />}
        {visibles.map((l) => {
          const pasos = ruta(l).slice(1, -1).filter((n) => n !== "califica");
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => onAbrir(l.id)}
              className="group grid w-full gap-x-6 gap-y-2.5 border-b border-linea px-5 py-4 text-left outline-none transition-colors last:border-b-0 hover:bg-respuesta/[0.02] focus-visible:bg-respuesta/[0.04] sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.5fr)_minmax(0,1.4fr)_96px] lg:items-center"
            >
              <span className="min-w-0">
                <span className="block truncate text-[14.5px] font-bold">{l.nombre_empresa}</span>
                <span className="mt-0.5 block truncate text-[13px] text-tenue">{l.tipo_empresa}</span>
              </span>
              <span className="flex min-w-0 flex-wrap items-center gap-1 text-[13px] font-medium text-tenue">
                {pasos.map((n) => (
                  <span key={n} className="flex items-center gap-1">
                    <span className={n === "no_cuadran" || n === "revision" ? "text-[rgb(146_84_8)]" : ""}>{NODOS[n].nombre}</span>
                    <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                  </span>
                ))}
                <ChipDestino d={destino(l)} tamano="sm" />
              </span>
              <span className="line-clamp-2 text-[13.5px] leading-[19px]">{razon(l)}</span>
              <span className="text-[12.5px] text-tenue lg:text-right">{haceCuanto(l.creado, ahora)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Comunes ───────────────────────────────────────────────────────────

function Encabezado({ titulo, texto }: { titulo: string; texto?: string }) {
  return (
    <div className="max-w-[720px]">
      <h1 className="text-[26px] font-bold tracking-[-0.025em]">{titulo}</h1>
      {texto && <p className="mt-1.5 text-[14.5px] leading-[22px] text-tenue">{texto}</p>}
    </div>
  );
}

// Pestañas que ocupan todo el ancho: cada grupo con su número grande, para leerlo de un vistazo.
function Segmentos<K extends string>({
  opciones,
  activo,
  onCambiar,
  resaltar,
}: {
  opciones: { k: K; nombre: string; n: number; color: string }[];
  activo: K;
  onCambiar: (k: K) => void;
  resaltar?: K;
}) {
  return (
    <div role="tablist" className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-linea bg-tarjeta sm:grid-cols-3 lg:grid-cols-5">
      {opciones.map((o) => {
        const sel = activo === o.k;
        return (
          <button
            key={o.k}
            role="tab"
            aria-selected={sel}
            onClick={() => onCambiar(o.k)}
            className={
              "relative flex flex-col items-start gap-3 border-b border-r border-linea px-5 py-4 text-left outline-none transition-colors focus-visible:bg-respuesta/[0.03] lg:border-b-0 lg:last:border-r-0 " +
              (sel ? "bg-respuesta/[0.025]" : "hover:bg-respuesta/[0.015]")
            }
          >
            <span className={"flex items-center gap-2 text-[13.5px] font-semibold " + (sel ? "text-respuesta" : "text-tenue")}>
              <span className="h-2 w-2 rounded-full" style={{ background: o.color }} />
              {o.nombre}
            </span>
            <span className={"text-[28px] font-bold leading-none tracking-[-0.03em] " + (sel ? "" : "text-respuesta/70")}>
              {o.n}
              {o.k === resaltar && o.n > 0 && <span className="ml-2 align-middle text-[12px] font-semibold tracking-normal text-[rgb(146_84_8)]">por revisar</span>}
            </span>
            {sel && <span className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: o.color }} />}
          </button>
        );
      })}
    </div>
  );
}

function Pildora({ activa, onClick, children }: { activa: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-respuesta/20 " +
        (activa ? "border-respuesta bg-respuesta text-white" : "border-linea bg-tarjeta text-respuesta hover:border-borde")
      }
    >
      {children}
    </button>
  );
}

function Vacio({ texto }: { texto: string }) {
  return <p className="mt-5 rounded-2xl border border-dashed border-borde px-6 py-14 text-center text-[14px] text-tenue">{texto}</p>;
}
